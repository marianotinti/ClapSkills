import { useTools } from "@/src/features/tools/context/ToolContext";

import { ToolEditorPreview } from "./ToolEditorPreview";

export interface ToolWorkspaceProps {
  isGenerating?: boolean;
  onCodeChange: (code: string) => void;
  onNameChange: (name: string) => void;
}

export function ToolWorkspace({ isGenerating = false, onCodeChange, onNameChange }: ToolWorkspaceProps) {
  const { selectedTool } = useTools();

  if (!selectedTool) {
    return (
      <div className="rounded-2xl border border-dashed border-outline-variant/60 bg-surface-container p-10 text-center text-on-surface-variant">
        Select a saved tool or create a new one to open the editor and live preview.
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
        <label className="block text-xs font-semibold uppercase tracking-wide text-on-surface-variant" htmlFor="tool-workspace-name">
          Tool name
        </label>
        <input
          id="tool-workspace-name"
          type="text"
          className="mt-2 w-full max-w-md rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-lg font-bold text-on-surface outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
          disabled={isGenerating}
          onChange={(event) => onNameChange(event.target.value)}
          value={selectedTool.name}
        />
        <p className="mt-2 text-sm text-on-surface-variant">{selectedTool.description}</p>
        {isGenerating ? (
          <p className="mt-3 text-sm font-medium text-primary">
            Generating tool update for this workspace…
          </p>
        ) : null}
      </div>
      <ToolEditorPreview isGenerating={isGenerating} onCodeChange={onCodeChange} tool={selectedTool} />
    </section>
  );
}
