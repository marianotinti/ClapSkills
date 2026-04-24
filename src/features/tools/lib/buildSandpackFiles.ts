import type { ToolFileMap } from "@/src/features/tools/types";

export function buildSandpackFiles(files: ToolFileMap): Record<string, { code: string }> {
  return {
    ...Object.fromEntries(Object.entries(files).map(([path, code]) => [path, { code }])),
    "/index.tsx": {
      code: `import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(<App />);
`,
    },
    "/styles.css": {
      code: `@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");
body { margin: 0; font-family: Inter, sans-serif; background: #020617; }
* { box-sizing: border-box; }`,
    },
  };
}
