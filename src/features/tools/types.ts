export type ToolFileMap = Record<string, string>;

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
}

export interface GenerateToolResponse {
  name: string;
  description: string;
  files: ToolFileMap;
}
