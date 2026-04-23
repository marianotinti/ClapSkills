import { DEFAULT_TOOL_ENTRY_FILE, getDefaultToolFiles } from "@/src/features/tools/lib/defaultToolFiles";
import type { ToolRecord } from "@/src/features/tools/types";

const TOOLS_STORAGE_KEY = "clapskills.tools";

type CreateEmptyToolRecordOptions = Partial<Pick<ToolRecord, "name" | "description" | "prompt" | "tags">>;

function createToolId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `tool_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function cloneTools(tools: ToolRecord[]): ToolRecord[] {
  return tools.map((tool) => ({
    ...tool,
    files: { ...tool.files },
    tags: [...tool.tags],
  }));
}

export function createEmptyToolRecord(options: CreateEmptyToolRecordOptions = {}): ToolRecord {
  const timestamp = new Date().toISOString();

  return {
    id: createToolId(),
    name: options.name ?? "Untitled Tool",
    description: options.description ?? "A React tool.",
    prompt: options.prompt ?? "",
    files: getDefaultToolFiles(),
    entryFile: DEFAULT_TOOL_ENTRY_FILE,
    tags: options.tags ?? ["react-tool"],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function loadStoredTools(): ToolRecord[] {
  const rawValue = localStorage.getItem(TOOLS_STORAGE_KEY);

  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue) as ToolRecord[];
    return cloneTools(parsed);
  } catch {
    return [];
  }
}

export function saveStoredTools(tools: ToolRecord[]): void {
  localStorage.setItem(TOOLS_STORAGE_KEY, exportTools(tools));
}

export function duplicateToolRecord(tool: ToolRecord): ToolRecord {
  const timestamp = new Date().toISOString();

  return {
    ...tool,
    id: createToolId(),
    name: `${tool.name} Copy`,
    files: { ...tool.files },
    tags: [...tool.tags],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function exportTools(tools: ToolRecord[]): string {
  return JSON.stringify(tools, null, 2);
}

export function importTools(serializedTools: string): ToolRecord[] {
  const parsed = JSON.parse(serializedTools) as ToolRecord[];
  return cloneTools(parsed);
}
