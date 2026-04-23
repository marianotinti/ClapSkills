import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  createEmptyToolRecord,
  duplicateToolRecord,
  loadStoredTools,
  saveStoredTools,
} from "@/src/features/tools/lib/storage";
import type { ToolRecord } from "@/src/features/tools/types";

type ToolUpdater = (tool: ToolRecord) => ToolRecord;

interface ToolContextValue {
  tools: ToolRecord[];
  selectedToolId: string;
  selectedTool: ToolRecord | null;
  createTool: () => ToolRecord;
  saveTool: (tool: ToolRecord) => void;
  updateTool: (toolId: string, updater: ToolUpdater) => void;
  duplicateTool: (toolId: string) => void;
  selectTool: (toolId: string) => void;
  replaceAllTools: (tools: ToolRecord[]) => void;
}

interface ToolState {
  tools: ToolRecord[];
  selectedToolId: string;
}

const ToolContext = createContext<ToolContextValue | undefined>(undefined);

function cloneToolRecord(tool: ToolRecord, toolId = tool.id): ToolRecord {
  return {
    ...tool,
    id: toolId,
    files: { ...tool.files },
    tags: [...tool.tags],
  };
}

function cloneToolRecords(tools: ToolRecord[]): ToolRecord[] {
  return tools.map((tool) => cloneToolRecord(tool));
}

function getSelectedToolId(tools: ToolRecord[], preferredToolId?: string): string {
  if (preferredToolId && tools.some((tool) => tool.id === preferredToolId)) {
    return preferredToolId;
  }

  return tools[0]?.id ?? "";
}

function createInitialState(): ToolState {
  const tools = cloneToolRecords(loadStoredTools());

  return {
    tools,
    selectedToolId: getSelectedToolId(tools),
  };
}

function replaceTool(tools: ToolRecord[], toolId: string, nextTool: ToolRecord): ToolRecord[] {
  const existingToolIndex = tools.findIndex((tool) => tool.id === toolId);

  if (existingToolIndex === -1) {
    return [...tools, nextTool];
  }

  return tools.map((tool) => (tool.id === toolId ? nextTool : tool));
}

export function ToolProvider({ children }: { children: ReactNode }) {
  const [toolState, setToolState] = useState<ToolState>(createInitialState);

  useEffect(() => {
    saveStoredTools(toolState.tools);
  }, [toolState.tools]);

  const selectedTool = useMemo(
    () => toolState.tools.find((tool) => tool.id === toolState.selectedToolId) ?? null,
    [toolState.selectedToolId, toolState.tools],
  );

  const value = useMemo<ToolContextValue>(
    () => ({
      tools: toolState.tools,
      selectedToolId: toolState.selectedToolId,
      selectedTool,
      createTool: () => {
        const nextTool = cloneToolRecord(createEmptyToolRecord());

        setToolState((current) => ({
          tools: [...current.tools, nextTool],
          selectedToolId: nextTool.id,
        }));

        return nextTool;
      },
      saveTool: (tool) => {
        const nextTool = cloneToolRecord(tool);

        setToolState((current) => ({
          tools: replaceTool(current.tools, nextTool.id, nextTool),
          selectedToolId: nextTool.id,
        }));
      },
      updateTool: (toolId, updater) => {
        setToolState((current) => {
          const existingTool = current.tools.find((tool) => tool.id === toolId);

          if (!existingTool) {
            return current;
          }

          const updatedTool = cloneToolRecord(updater(cloneToolRecord(existingTool)), toolId);

          return {
            tools: replaceTool(current.tools, toolId, updatedTool),
            selectedToolId: updatedTool.id,
          };
        });
      },
      duplicateTool: (toolId) => {
        setToolState((current) => {
          const existingTool = current.tools.find((tool) => tool.id === toolId);

          if (!existingTool) {
            return current;
          }

          const duplicatedTool = cloneToolRecord(duplicateToolRecord(cloneToolRecord(existingTool)));

          return {
            tools: [...current.tools, duplicatedTool],
            selectedToolId: duplicatedTool.id,
          };
        });
      },
      selectTool: (toolId) => {
        setToolState((current) => ({
          tools: current.tools,
          selectedToolId: getSelectedToolId(current.tools, toolId),
        }));
      },
      replaceAllTools: (tools) => {
        const nextTools = cloneToolRecords(tools);

        setToolState((current) => ({
          tools: nextTools,
          selectedToolId: getSelectedToolId(nextTools, current.selectedToolId),
        }));
      },
    }),
    [selectedTool, toolState.selectedToolId, toolState.tools],
  );

  return <ToolContext.Provider value={value}>{children}</ToolContext.Provider>;
}

export function useTools(): ToolContextValue {
  const context = useContext(ToolContext);

  if (!context) {
    throw new Error("useTools must be used within a ToolProvider");
  }

  return context;
}
