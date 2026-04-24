import { describe, expect, it } from "vitest";

import { buildSandpackFiles } from "./buildSandpackFiles";

describe("buildSandpackFiles", () => {
  it("injects the app entry and wrapper index file", () => {
    const files = buildSandpackFiles({
      "/App.tsx": "export default function App() { return <div>Hello</div>; }",
    });

    expect(files["/App.tsx"].code).toContain("Hello");
    expect(files["/index.tsx"].code).toContain("createRoot");
  });
});
