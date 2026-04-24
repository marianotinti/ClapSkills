import type { ToolFileMap } from "@/src/features/tools/types";

const DEFAULT_PREVIEW_STYLES = `
  :root {
    color-scheme: light;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  * {
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    min-height: 100%;
  }

  body {
    margin: 0;
    background: #f8fafc;
    color: #0f172a;
  }

  button,
  input,
  textarea,
  select {
    font: inherit;
  }
`;

function escapeForInlineScript(value: string): string {
  return value.replace(/<\//g, "<\\/");
}

export function buildToolPreviewHtml(files: ToolFileMap, previewId: string): string {
  const serializedFiles = escapeForInlineScript(JSON.stringify(files));
  const serializedStyles = escapeForInlineScript(JSON.stringify(DEFAULT_PREVIEW_STYLES));
  const serializedPreviewId = escapeForInlineScript(JSON.stringify(previewId));

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ClapSkills Tool Preview</title>
    <style>${DEFAULT_PREVIEW_STYLES}</style>
    <script src="https://cdn.tailwindcss.com"></script>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  </head>
  <body>
    <div id="root"></div>

    <script>
      const files = ${serializedFiles};
      const defaultStyles = ${serializedStyles};
      const previewId = ${serializedPreviewId};
      const previewErrorType = "tool-preview-error";
      const previewReadyType = "tool-preview-ready";
      const moduleCache = new Map();
      const injectedStyles = new Set();
      const sourceExtensions = [".tsx", ".ts", ".jsx", ".js"];

      function postPreviewError(message) {
        window.parent.postMessage({ type: previewErrorType, error: message, previewId }, "*");
      }

      function postPreviewReady() {
        window.parent.postMessage({ type: previewReadyType, previewId }, "*");
      }

      function normalizePath(path) {
        const segments = path.split("/");
        const resolved = [];

        for (const segment of segments) {
          if (!segment || segment === ".") {
            continue;
          }

          if (segment === "..") {
            resolved.pop();
            continue;
          }

          resolved.push(segment);
        }

        return "/" + resolved.join("/");
      }

      function getDirname(path) {
        const normalized = normalizePath(path);
        const lastSlash = normalized.lastIndexOf("/");
        return lastSlash <= 0 ? "/" : normalized.slice(0, lastSlash);
      }

      function tryResolveFile(path) {
        const normalized = normalizePath(path);

        if (typeof files[normalized] === "string") {
          return normalized;
        }

        for (const extension of sourceExtensions) {
          if (typeof files[normalized + extension] === "string") {
            return normalized + extension;
          }
        }

        for (const extension of sourceExtensions) {
          const indexBase = normalized.endsWith("/") ? normalized.slice(0, -1) : normalized;
          const indexPath = indexBase + "/index" + extension;
          if (typeof files[indexPath] === "string") {
            return indexPath;
          }
        }

        if (typeof files[normalized + ".css"] === "string") {
          return normalized + ".css";
        }

        return null;
      }

      function resolveImport(fromPath, specifier) {
        if (specifier === "react") {
          return "react";
        }

        if (specifier === "react-dom/client") {
          return "react-dom/client";
        }

        if (specifier.startsWith(".") || specifier.startsWith("/")) {
          const basePath = specifier.startsWith("/")
            ? specifier
            : normalizePath(getDirname(fromPath) + "/" + specifier);
          const resolvedPath = tryResolveFile(basePath);

          if (resolvedPath) {
            return resolvedPath;
          }
        }

        throw new Error("Cannot resolve import: " + specifier + " from " + fromPath);
      }

      function ensureCssLoaded(path) {
        if (injectedStyles.has(path)) {
          return;
        }

        const styleElement = document.createElement("style");
        styleElement.setAttribute("data-path", path);
        styleElement.textContent = String(files[path] || defaultStyles);
        document.head.appendChild(styleElement);
        injectedStyles.add(path);
      }

      function transpile(path, code) {
        return Babel.transform(code, {
          filename: path,
          presets: [
            ["typescript", { allExtensions: true, isTSX: true }],
            ["react", { runtime: "classic" }],
          ],
          plugins: ["transform-modules-commonjs"],
        }).code;
      }

      function requireModule(path) {
        if (path === "react") {
          return React;
        }

        if (path === "react-dom/client") {
          return { createRoot: ReactDOM.createRoot };
        }

        if (path.endsWith(".css")) {
          ensureCssLoaded(path);
          return {};
        }

        if (moduleCache.has(path)) {
          return moduleCache.get(path).exports;
        }

        const source = files[path];
        if (typeof source !== "string") {
          throw new Error("Preview file not found: " + path);
        }

        const module = { exports: {} };
        moduleCache.set(path, module);

        const compiled = transpile(path, source);
        const localRequire = (specifier) => requireModule(resolveImport(path, specifier));
        const evaluator = new Function("require", "module", "exports", compiled);

        evaluator(localRequire, module, module.exports);
        return module.exports;
      }

      function renderFatalError(message) {
        document.body.innerHTML = "";

        const container = document.createElement("div");
        container.style.minHeight = "100vh";
        container.style.display = "flex";
        container.style.alignItems = "center";
        container.style.justifyContent = "center";
        container.style.padding = "24px";
        container.style.background = "linear-gradient(135deg, #fef2f2, #fee2e2)";

        const panel = document.createElement("div");
        panel.style.maxWidth = "720px";
        panel.style.width = "100%";
        panel.style.borderRadius = "24px";
        panel.style.border = "1px solid rgba(239, 68, 68, 0.18)";
        panel.style.background = "rgba(255, 255, 255, 0.96)";
        panel.style.boxShadow = "0 24px 60px rgba(15, 23, 42, 0.12)";
        panel.style.padding = "24px";

        const title = document.createElement("h1");
        title.textContent = "Preview Error";
        title.style.margin = "0 0 12px";
        title.style.fontSize = "20px";
        title.style.fontWeight = "700";
        title.style.color = "#991b1b";

        const description = document.createElement("p");
        description.textContent = "The generated app could not be rendered in the preview runtime.";
        description.style.margin = "0 0 16px";
        description.style.color = "#7f1d1d";

        const details = document.createElement("pre");
        details.textContent = message;
        details.style.margin = "0";
        details.style.padding = "16px";
        details.style.whiteSpace = "pre-wrap";
        details.style.borderRadius = "16px";
        details.style.background = "#fff1f2";
        details.style.color = "#881337";
        details.style.fontSize = "13px";

        panel.appendChild(title);
        panel.appendChild(description);
        panel.appendChild(details);
        container.appendChild(panel);
        document.body.appendChild(container);
      }

      class ErrorBoundary extends React.Component {
        constructor(props) {
          super(props);
          this.state = { error: null };
        }

        static getDerivedStateFromError(error) {
          return { error };
        }

        componentDidCatch(error) {
          const message = error instanceof Error ? error.message : String(error);
          postPreviewError(message);
        }

        render() {
          if (this.state.error) {
            return React.createElement(
              "div",
              {
                style: {
                  minHeight: "100vh",
                  display: "grid",
                  placeItems: "center",
                  padding: "24px",
                  background: "linear-gradient(135deg, #fef2f2, #fee2e2)",
                },
              },
              React.createElement(
                "div",
                {
                  style: {
                    width: "100%",
                    maxWidth: "720px",
                    borderRadius: "24px",
                    border: "1px solid rgba(239, 68, 68, 0.18)",
                    background: "rgba(255, 255, 255, 0.96)",
                    padding: "24px",
                    boxShadow: "0 24px 60px rgba(15, 23, 42, 0.12)",
                  },
                },
                React.createElement(
                  "h2",
                  { style: { margin: "0 0 12px", fontSize: "20px", fontWeight: 700, color: "#991b1b" } },
                  "Preview Error",
                ),
                React.createElement(
                  "p",
                  { style: { margin: "0 0 16px", color: "#7f1d1d" } },
                  "The generated app threw an error while rendering.",
                ),
                React.createElement(
                  "pre",
                  {
                    style: {
                      margin: 0,
                      padding: "16px",
                      whiteSpace: "pre-wrap",
                      borderRadius: "16px",
                      background: "#fff1f2",
                      color: "#881337",
                      fontSize: "13px",
                    },
                  },
                  String(this.state.error),
                ),
              ),
            );
          }

          return this.props.children;
        }
      }

      window.addEventListener("error", (event) => {
        postPreviewError(event.message || "Preview crashed.");
      });

      try {
        const appModule = requireModule("/App.tsx");
        const App = appModule && appModule.__esModule
          ? appModule.default
          : (appModule.default || appModule);

        if (typeof App !== "function" && typeof App !== "object") {
          throw new Error("Preview entry /App.tsx must default export a React component.");
        }

        const root = ReactDOM.createRoot(document.getElementById("root"));
        root.render(
          React.createElement(
            ErrorBoundary,
            null,
            React.createElement(App),
          ),
        );

        postPreviewReady();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        renderFatalError(message);
        postPreviewError(message);
      }
    </script>
  </body>
</html>`;
}