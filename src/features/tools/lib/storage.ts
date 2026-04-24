import { DEFAULT_TOOL_ENTRY_FILE, getDefaultToolFiles } from "@/src/features/tools/lib/defaultToolFiles";
import type { ToolFileMap, ToolRecord } from "@/src/features/tools/types";

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

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function normalizeToolFiles(value: unknown): ToolFileMap | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const files = Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] =>
        typeof entry[0] === "string" && typeof entry[1] === "string",
    ),
  );

  if (!isString(files[DEFAULT_TOOL_ENTRY_FILE])) {
    return null;
  }

  return files;
}

function normalizeToolRecord(value: unknown): ToolRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const files = normalizeToolFiles(record.files);
  if (!files) {
    return null;
  }

  if (
    !isString(record.id) ||
    !isString(record.name) ||
    !isString(record.description) ||
    !isString(record.prompt) ||
    !isString(record.createdAt) ||
    !isString(record.updatedAt)
  ) {
    return null;
  }

  const tags = Array.isArray(record.tags)
    ? record.tags.filter((tag): tag is string => typeof tag === "string")
    : [];

  return {
    id: record.id,
    name: record.name,
    description: record.description,
    prompt: record.prompt,
    files,
    entryFile: DEFAULT_TOOL_ENTRY_FILE,
    tags: tags.length > 0 ? tags : ["react-tool"],
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function normalizeToolRecords(value: unknown): ToolRecord[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((record) => {
    const normalizedRecord = normalizeToolRecord(record);
    return normalizedRecord ? [normalizedRecord] : [];
  });
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
    const parsed = JSON.parse(rawValue);
    return cloneTools(normalizeToolRecords(parsed));
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
  try {
    const parsed = JSON.parse(serializedTools);
    return cloneTools(normalizeToolRecords(parsed));
  } catch {
    return [];
  }
}
