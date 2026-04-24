import { describe, expect, it } from "vitest";

import { buildToolPreviewHtml } from "./buildToolPreviewHtml";

function extractInlineRuntime(html: string): string {
  const scripts = [...html.matchAll(/<script(?:[^>]*)>([\s\S]*?)<\/script>/g)];
  const inlineRuntime = scripts.at(-1)?.[1];

  if (!inlineRuntime) {
    throw new Error("Missing inline runtime script");
  }

  return inlineRuntime;
}

describe("buildToolPreviewHtml", () => {
  it("embeds the app files and runtime hooks into the preview document", () => {
    const html = buildToolPreviewHtml(
      {
        "/App.tsx": `import { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}`,
        "/components/Badge.tsx": `export default function Badge() {
  return <span>Badge</span>;
}`,
      },
      "preview-123",
    );

    expect(html).toContain('const files = {"/App.tsx"');
    expect(html).toContain('const previewId = "preview-123"');
    expect(html).toContain("tool-preview-ready");
    expect(html).toContain("tool-preview-error");
    expect(html).toContain("transform-modules-commonjs");
    expect(html).toContain("requireModule(\"/App.tsx\")");
  });

  it("emits parseable runtime JavaScript", () => {
    const html = buildToolPreviewHtml(
      {
        "/App.tsx": `export default function App() {
  return <div>Hello</div>;
}`,
      },
      "preview-parse-check",
    );

    const runtime = extractInlineRuntime(html);

    expect(() => new Function(runtime)).not.toThrow();
  });
});