export type ToolFileMap = Record<string, string>;

export interface ToolGenerationContext {
  name: string;
  description: string;
  files: ToolFileMap;
}

export interface ToolRecord {
  id: string;
  name: string;
  description: string;
  prompt: string;
  files: ToolFileMap;
  entryFile: "/App.tsx";
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GenerateToolRequest {
  prompt: string;
  tool?: ToolGenerationContext;
}

export interface GenerateToolResponse {
  name: string;
  description: string;
  files: ToolFileMap;
}
