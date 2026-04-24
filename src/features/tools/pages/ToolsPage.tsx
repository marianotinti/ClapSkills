import { useEffect, useState } from "react";

import { generateTool } from "@/src/features/tools/api";
import { ToolLibrarySidebar } from "@/src/features/tools/components/ToolLibrarySidebar";
import { ToolPromptPanel } from "@/src/features/tools/components/ToolPromptPanel";
import { ToolWorkspace } from "@/src/features/tools/components/ToolWorkspace";
import { useTools } from "@/src/features/tools/context/ToolContext";
import { DEFAULT_TOOL_ENTRY_FILE } from "@/src/features/tools/lib/defaultToolFiles";
import { exportTools, importTools } from "@/src/features/tools/lib/storage";

export function ToolsPage() {
  const { replaceAllTools, saveTool, selectedTool, tools, updateTool } = useTools();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingToolId, setGeneratingToolId] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const isGeneratingSelectedTool = Boolean(
    isGenerating && selectedTool && selectedTool.id === generatingToolId,
  );

  useEffect(() => {
    setGenerationError(null);
  }, [selectedTool?.id]);

  const handleExport = () => {
    const blob = new Blob([exportTools(tools)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "clapskills-tools.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (file: File) => {
    const payload = await file.text();
    replaceAllTools(importTools(payload));
  };

  const handlePromptChange = (prompt: string) => {
    setGenerationError(null);

    if (!selectedTool || isGeneratingSelectedTool) {
      return;
    }

    updateTool(selectedTool.id, (tool) => ({
      ...tool,
      prompt,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleNameChange = (name: string) => {
    if (!selectedTool || isGeneratingSelectedTool) {
      return;
    }

    updateTool(selectedTool.id, (tool) => ({
      ...tool,
      name,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleCodeChange = (code: string) => {
    if (!selectedTool || isGeneratingSelectedTool) {
      return;
    }

    const timestamp = new Date().toISOString();

    updateTool(selectedTool.id, (tool) => ({
      ...tool,
      files: {
        ...tool.files,
        [DEFAULT_TOOL_ENTRY_FILE]: code,
      },
      updatedAt: timestamp,
    }));
  };

  const handleGenerate = async () => {
    if (!selectedTool || !selectedTool.prompt.trim()) {
      return;
    }

    const base = selectedTool;

    setIsGenerating(true);
    setGeneratingToolId(base.id);
    setGenerationError(null);

    try {
      const result = await generateTool({
        prompt: base.prompt,
        tool: {
          name: base.name,
          description: base.description,
          files: base.files,
        },
      });

      saveTool({
        ...base,
        name: result.name,
        description: result.description,
        prompt: base.prompt,
        files: result.files,
        updatedAt: new Date().toISOString(),
      });
    } catch (cause) {
      setGenerationError(
        cause instanceof Error ? cause.message : "Failed to generate tool.",
      );
    } finally {
      setIsGenerating(false);
      setGeneratingToolId(null);
    }
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
        <ToolLibrarySidebar onExport={handleExport} onImport={handleImport} />

        <div className="space-y-6">
          <ToolPromptPanel
            isGenerating={isGeneratingSelectedTool}
            prompt={selectedTool?.prompt ?? ""}
            onPromptChange={handlePromptChange}
            onGenerate={handleGenerate}
            error={generationError}
            generationLabel={
              selectedTool?.id === generatingToolId
                ? `Generating ${selectedTool.name || "tool"}…`
                : "Generating tool…"
            }
            hasSelectedTool={Boolean(selectedTool)}
            selectedToolName={selectedTool?.name ?? null}
          />

          <ToolWorkspace
            isGenerating={isGeneratingSelectedTool}
            onCodeChange={handleCodeChange}
            onNameChange={handleNameChange}
          />
        </div>
      </div>
    </div>
  );
}
