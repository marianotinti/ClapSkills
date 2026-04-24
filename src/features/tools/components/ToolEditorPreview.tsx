import { useEffect, useRef, useState } from "react";

import { buildToolPreviewHtml } from "@/src/features/tools/lib/buildToolPreviewHtml";
import type { ToolRecord } from "@/src/features/tools/types";

interface ToolEditorPreviewProps {
  onCodeChange: (code: string) => void;
  isGenerating?: boolean;
  tool: ToolRecord;
}

export function ToolEditorPreview({ isGenerating = false, onCodeChange, tool }: ToolEditorPreviewProps) {
  const appCode = tool.files["/App.tsx"] ?? "";
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const previewTimeoutRef = useRef<number | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const hasPreviewSignalRef = useRef(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);
  const previewFiles = {
    ...tool.files,
    "/App.tsx": appCode,
  };
  const previewSignature = JSON.stringify(previewFiles);
  const previewId = `${tool.id}:${reloadNonce}:${previewSignature.length}`;

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) {
      return;
    }

    setIsPreviewLoading(true);
    setPreviewError(null);
    hasPreviewSignalRef.current = false;

    const html = buildToolPreviewHtml(previewFiles, previewId);
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    const blob = new Blob([html], { type: "text/html" });
    previewUrlRef.current = URL.createObjectURL(blob);
    previewTimeoutRef.current = window.setTimeout(() => {
      setIsPreviewLoading(false);
      setPreviewError("Preview timed out while loading the generated app.");
    }, 15000);

    iframe.removeAttribute("srcdoc");
    iframe.src = previewUrlRef.current;

    return () => {
      if (previewTimeoutRef.current !== null) {
        window.clearTimeout(previewTimeoutRef.current);
        previewTimeoutRef.current = null;
      }

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, [previewId, previewSignature]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.previewId !== previewId) {
        return;
      }

      if (event.data?.type === "tool-preview-ready") {
        hasPreviewSignalRef.current = true;
        if (previewTimeoutRef.current !== null) {
          window.clearTimeout(previewTimeoutRef.current);
          previewTimeoutRef.current = null;
        }
        setIsPreviewLoading(false);
        setPreviewError(null);
        return;
      }

      if (event.data?.type === "tool-preview-error") {
        hasPreviewSignalRef.current = true;
        if (previewTimeoutRef.current !== null) {
          window.clearTimeout(previewTimeoutRef.current);
          previewTimeoutRef.current = null;
        }
        setIsPreviewLoading(false);
        setPreviewError(
          typeof event.data.error === "string" && event.data.error.trim()
            ? event.data.error
            : "The generated app failed to render in preview.",
        );
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [previewId]);

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
        <div className="flex items-center justify-between border-b border-outline-variant px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-on-surface">Live Preview</p>
            <p className="text-xs text-on-surface-variant">Runs the generated app in an isolated iframe runtime.</p>
          </div>

          <button
            type="button"
            className="rounded-xl border border-outline-variant bg-surface px-3 py-2 text-xs font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
            onClick={() => setReloadNonce((value) => value + 1)}
          >
            Reload Preview
          </button>
        </div>

        <div className="relative min-h-[min(580px,65vh)] bg-white">
          {isPreviewLoading ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
                <p className="mt-4 text-sm font-semibold text-slate-900">Compiling preview…</p>
                <p className="mt-1 text-xs text-slate-500">The generated app will appear here as soon as the runtime is ready.</p>
              </div>
            </div>
          ) : null}

          {previewError ? (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-gradient-to-br from-rose-50 to-orange-50 p-6">
              <div className="w-full max-w-xl rounded-3xl border border-rose-200 bg-white/95 p-6 shadow-2xl">
                <h3 className="text-lg font-bold text-rose-900">Preview Error</h3>
                <p className="mt-2 text-sm text-rose-700">
                  The generated app could not be rendered in the preview runtime.
                </p>
                <pre className="mt-4 overflow-auto rounded-2xl bg-rose-50 p-4 text-xs text-rose-900">
                  {previewError}
                </pre>
                <button
                  type="button"
                  className="mt-4 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                  onClick={() => setReloadNonce((value) => value + 1)}
                >
                  Retry Preview
                </button>
              </div>
            </div>
          ) : null}

          <iframe
            ref={iframeRef}
            className="h-[min(580px,65vh)] w-full border-0 transition-opacity duration-300"
            onLoad={() => {
              if (previewTimeoutRef.current !== null) {
                window.clearTimeout(previewTimeoutRef.current);
                previewTimeoutRef.current = null;
              }

              if (!hasPreviewSignalRef.current) {
                setIsPreviewLoading(false);
              }
            }}
            onError={() => {
              if (previewTimeoutRef.current !== null) {
                window.clearTimeout(previewTimeoutRef.current);
                previewTimeoutRef.current = null;
              }

              setIsPreviewLoading(false);
              setPreviewError("The preview iframe failed to load.");
            }}
            sandbox="allow-scripts allow-same-origin"
            title="Tool preview"
          />
        </div>
      </div>
    </section>
  );
}
