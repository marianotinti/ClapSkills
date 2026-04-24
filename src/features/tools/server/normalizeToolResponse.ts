import { DEFAULT_TOOL_FILES } from "@/src/features/tools/lib/defaultToolFiles";
import type { GenerateToolResponse, ToolFileMap } from "@/src/features/tools/types";

function isToolFileMap(value: unknown): value is ToolFileMap {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  return Object.values(value as Record<string, unknown>).every((v) => typeof v === "string");
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

  return {
    name: typeof record.name === "string" ? record.name : "Generated Tool",
    description:
      typeof record.description === "string"
        ? record.description
        : "A generated React tool for ClapSkills.",
    files,
  };
}
