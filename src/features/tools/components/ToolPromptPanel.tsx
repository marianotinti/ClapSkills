import { AlertCircle, Sparkles } from "lucide-react";

interface ToolPromptPanelProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onGenerate: () => void;
  error?: string | null;
  hasSelectedTool: boolean;
  selectedToolName?: string | null;
}

export function ToolPromptPanel({
  error = null,
  hasSelectedTool,
  onGenerate,
  onPromptChange,
  prompt,
  selectedToolName,
}: ToolPromptPanelProps) {
  return (
    <section className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Prompt</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Describe the React tool you want to generate and refine.
          </p>
        </div>

        <div className="rounded-full border border-outline-variant bg-surface px-3 py-1 text-xs font-semibold text-on-surface-variant">
          {selectedToolName ?? "No tool selected"}
        </div>
      </div>

      {error ? (
        <div className="mb-4 flex gap-3 rounded-2xl border border-error/20 bg-error-container/60 p-4 text-on-error-container">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      ) : null}

      <label className="block text-sm font-semibold text-on-surface" htmlFor="tool-prompt">
        Tool prompt
      </label>
      <textarea
        id="tool-prompt"
        value={prompt}
        onChange={(event) => onPromptChange(event.target.value)}
        disabled={!hasSelectedTool}
        placeholder={
          hasSelectedTool
            ? "Build a reusable React tool that..."
            : "Create or select a tool to start writing its prompt."
        }
        className="mt-3 h-40 w-full resize-none rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 text-sm text-on-surface outline-none transition-all placeholder:text-on-surface-variant focus:border-primary/40 focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-surface-container-low disabled:text-on-surface-variant"
      />

      <div className="mt-4 flex items-center justify-between gap-4">
        <p className="text-xs text-on-surface-variant">
          This shell stores the prompt on the selected tool. Generation wiring lands next.
        </p>

        <button
          type="button"
          onClick={onGenerate}
          disabled={!hasSelectedTool || !prompt.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-on-primary shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Sparkles size={16} />
          Generate Tool
        </button>
      </div>
    </section>
  );
}
