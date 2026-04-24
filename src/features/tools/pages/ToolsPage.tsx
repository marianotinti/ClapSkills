import { MonitorCog } from "lucide-react";
import { useEffect, useState } from "react";

import { ToolLibrarySidebar } from "@/src/features/tools/components/ToolLibrarySidebar";
import { ToolPromptPanel } from "@/src/features/tools/components/ToolPromptPanel";
import { useTools } from "@/src/features/tools/context/ToolContext";

export function ToolsPage() {
  const { selectedTool, updateTool } = useTools();
  const [generationError, setGenerationError] = useState<string | null>(null);

  useEffect(() => {
    setGenerationError(null);
  }, [selectedTool?.id]);

  const handlePromptChange = (prompt: string) => {
    setGenerationError(null);

    if (!selectedTool) {
      return;
    }

    updateTool(selectedTool.id, (tool) => ({
      ...tool,
      prompt,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleGenerate = () => {
    if (!selectedTool || !selectedTool.prompt.trim()) {
      return;
    }

    setGenerationError("Tool generation will be connected in the next task.");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="mb-8">
        <h1 className="text-3xl font-bold text-on-surface">Tools</h1>
        <p className="mt-2 text-lg text-on-surface-variant">
          Generate and save reusable React tools.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px,minmax(0,1fr)]">
        <ToolLibrarySidebar />

        <div className="space-y-6">
          <ToolPromptPanel
            prompt={selectedTool?.prompt ?? ""}
            onPromptChange={handlePromptChange}
            onGenerate={handleGenerate}
            error={generationError}
            hasSelectedTool={Boolean(selectedTool)}
            selectedToolName={selectedTool?.name ?? null}
          />

          <section className="rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest p-8 shadow-sm">
            <div className="flex max-w-2xl flex-col items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-container text-primary">
                <MonitorCog size={22} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-on-surface">Workspace Preview</h2>
                <p className="mt-2 text-sm text-on-surface-variant">
                  The Sandpack workspace will live here in the next task.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
