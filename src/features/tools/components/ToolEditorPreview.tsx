import { SandpackPreview, SandpackProvider } from "@codesandbox/sandpack-react";

import { buildSandpackFiles } from "@/src/features/tools/lib/buildSandpackFiles";
import type { ToolRecord } from "@/src/features/tools/types";

interface ToolEditorPreviewProps {
  onCodeChange: (code: string) => void;
  isGenerating?: boolean;
  tool: ToolRecord;
}

export function ToolEditorPreview({ isGenerating = false, onCodeChange, tool }: ToolEditorPreviewProps) {
  const appCode = tool.files["/App.tsx"] ?? "";
  const previewKey = `${tool.id}:${JSON.stringify(tool.files)}`;

  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <div className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-sm">
        <div className="border-b border-outline-variant px-4 py-3">
          <p className="text-sm font-semibold text-on-surface">App.tsx</p>
          <p className="text-xs text-on-surface-variant">Editable source saved on the selected tool.</p>
        </div>
        <textarea
          className="h-[min(520px,60vh)] w-full resize-none bg-slate-950 p-4 font-mono text-sm text-slate-100 outline-none"
          disabled={isGenerating}
          onChange={(event) => onCodeChange(event.target.value)}
          spellCheck={false}
          value={appCode}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-sm">
        <SandpackProvider
          key={previewKey}
          customSetup={{
            dependencies: {
              react: "^19.0.0",
              "react-dom": "^19.0.0",
            },
          }}
          files={buildSandpackFiles({
            ...tool.files,
            "/App.tsx": appCode,
          })}
          options={{
            activeFile: tool.entryFile,
            visibleFiles: ["/App.tsx"],
          }}
          template="react-ts"
        >
          <SandpackPreview
            className="min-h-[min(520px,60vh)]"
            showOpenInCodeSandbox={false}
            style={{ height: "min(580px,65vh)" }}
          />
        </SandpackProvider>
      </div>
    </section>
  );
}
