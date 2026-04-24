import ts from "typescript";

import { DEFAULT_TOOL_FILES } from "@/src/features/tools/lib/defaultToolFiles";
import type { GenerateToolResponse, ToolFileMap } from "@/src/features/tools/types";

function isToolFileMap(value: unknown): value is ToolFileMap {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  return Object.values(value as Record<string, unknown>).every((v) => typeof v === "string");
}

const ALLOWED_GLOBAL_COMPONENTS = new Set([
  "Fragment",
  "Profiler",
  "StrictMode",
  "Suspense",
]);

function collectBindingNames(node: ts.BindingName, names: Set<string>) {
  if (ts.isIdentifier(node)) {
    names.add(node.text);
    return;
  }

  for (const element of node.elements) {
    if (ts.isBindingElement(element)) {
      collectBindingNames(element.name, names);
    }
  }
}

function collectDeclaredNames(sourceFile: ts.SourceFile): Set<string> {
  const names = new Set<string>();

  const visit = (node: ts.Node) => {
    if (ts.isImportDeclaration(node) && node.importClause) {
      if (node.importClause.name) {
        names.add(node.importClause.name.text);
      }

      if (node.importClause.namedBindings) {
        if (ts.isNamespaceImport(node.importClause.namedBindings)) {
          names.add(node.importClause.namedBindings.name.text);
        }

        if (ts.isNamedImports(node.importClause.namedBindings)) {
          for (const element of node.importClause.namedBindings.elements) {
            names.add(element.name.text);
          }
        }
      }
    }

    if (
      (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node) || ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) &&
      node.name
    ) {
      names.add(node.name.text);
    }

    if (ts.isVariableDeclaration(node)) {
      collectBindingNames(node.name, names);
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  return names;
}

function getJsxTagRootName(tagName: ts.JsxTagNameExpression): string | null {
  if (ts.isIdentifier(tagName)) {
    return tagName.text;
  }

  if (ts.isPropertyAccessExpression(tagName)) {
    let expression: ts.Expression = tagName.expression;

    while (ts.isPropertyAccessExpression(expression)) {
      expression = expression.expression;
    }

    return ts.isIdentifier(expression) ? expression.text : null;
  }

  return null;
}

function validateJsxComponentReferences(path: string, code: string) {
  const sourceFile = ts.createSourceFile(path, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const declaredNames = collectDeclaredNames(sourceFile);
  const undefinedComponents = new Set<string>();

  const visit = (node: ts.Node) => {
    if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
      const componentName = getJsxTagRootName(node.tagName);

      if (
        componentName &&
        /^[A-Z]/.test(componentName) &&
        !declaredNames.has(componentName) &&
        !ALLOWED_GLOBAL_COMPONENTS.has(componentName)
      ) {
        undefinedComponents.add(componentName);
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  if (undefinedComponents.size > 0) {
    throw new Error(
      `Tool response references undefined JSX component(s) in ${path}: ${Array.from(undefinedComponents).join(", ")}`,
    );
  }
}

const VISIBLE_HTML_TAGS = new Set([
  "button",
  "input",
  "textarea",
  "select",
  "label",
  "main",
  "section",
  "article",
  "div",
  "form",
  "h1",
  "h2",
  "h3",
  "p",
  "span",
]);

function validateRenderableUi(path: string, code: string) {
  const sourceFile = ts.createSourceFile(path, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let hasVisibleUiElement = false;

  const visit = (node: ts.Node) => {
    if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
      if (ts.isIdentifier(node.tagName) && VISIBLE_HTML_TAGS.has(node.tagName.text)) {
        hasVisibleUiElement = true;
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  if (!hasVisibleUiElement) {
    throw new Error(
      `Tool response must render visible UI in ${path}. Include native HTML elements like main, div, button, input, or text content containers.`,
    );
  }
}

export function normalizeToolResponse(value: unknown): GenerateToolResponse {
  if (typeof value !== "object" || value === null) {
    throw new Error("Model response must be an object.");
  }

  const record = value as Record<string, unknown>;
  const files: ToolFileMap = isToolFileMap(record.files) ? (record.files as ToolFileMap) : { ...DEFAULT_TOOL_FILES };

  if (typeof files["/App.tsx"] !== "string" || !files["/App.tsx"].includes("export default")) {
    throw new Error("Tool response must include /App.tsx with a default export.");
  }

  for (const [path, code] of Object.entries(files)) {
    if (path.endsWith(".tsx") || path.endsWith(".jsx")) {
      validateJsxComponentReferences(path, code);

      if (path === "/App.tsx") {
        validateRenderableUi(path, code);
      }
    }
  }

  return {
    name: typeof record.name === "string" ? record.name : "Generated Tool",
    description:
      typeof record.description === "string"
        ? record.description
        : "A generated React tool for ClapSkills.",
    files,
  };
}
