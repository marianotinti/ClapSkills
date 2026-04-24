import { Copy, Download, PlusCircle, Upload, Wrench } from "lucide-react";

import { useTools } from "@/src/features/tools/context/ToolContext";
import { cn } from "@/src/lib/utils";

export interface ToolLibrarySidebarProps {
  onExport: () => void;
  onImport: (file: File) => Promise<void>;
}

export function ToolLibrarySidebar({ onExport, onImport }: ToolLibrarySidebarProps) {
  const { createTool, duplicateTool, selectTool, selectedToolId, tools } = useTools();

  return (
    <aside className="flex h-full flex-col rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Saved Tools</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Reusable React builders for ClapSkills.
          </p>
        </div>

        <button
          type="button"
          onClick={() => createTool()}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
        >
          <PlusCircle size={16} />
          New Tool
        </button>
      </div>

      <div className="mt-6 flex-1">
        {tools.length === 0 ? (
          <div className="flex h-full min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-outline-variant bg-surface p-6 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-container text-primary">
              <Wrench size={20} />
            </div>
            <h3 className="text-sm font-semibold text-on-surface">No saved tools yet</h3>
            <p className="mt-2 text-sm text-on-surface-variant">
              Create your first reusable React tool to start building the library.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tools.map((tool) => {
              const isSelected = tool.id === selectedToolId;

              return (
                <div
                  key={tool.id}
                  className={cn(
                    "rounded-2xl border bg-surface transition-all",
                    isSelected
                      ? "border-primary/40 shadow-lg shadow-primary/10"
                      : "border-outline-variant hover:border-primary/20",
                  )}
                >
                  <div className="flex items-start gap-2 p-2">
                    <button
                      type="button"
                      onClick={() => selectTool(tool.id)}
                      className={cn(
                        "flex-1 rounded-xl px-3 py-3 text-left transition-colors",
                        isSelected ? "bg-primary-container/60" : "hover:bg-surface-container-low",
                      )}
                    >
                      <p className="text-sm font-semibold text-on-surface">{tool.name}</p>
                      <p className="mt-1 text-xs text-on-surface-variant">
                        {tool.description || "A React tool."}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => duplicateTool(tool.id)}
                      aria-label={`Duplicate ${tool.name}`}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface-variant transition-colors hover:border-primary/30 hover:text-primary"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onExport}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
      >
        <Download size={16} />
        Export JSON
      </button>
      <label className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-outline-variant px-4 py-3 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary">
        <Upload size={16} />
        Import JSON
        <input
          type="file"
          accept="application/json,.json"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void onImport(file);
            }
            event.target.value = "";
          }}
        />
      </label>
    </aside>
  );
}
