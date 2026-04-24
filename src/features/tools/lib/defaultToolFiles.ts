import type { ToolFileMap } from "@/src/features/tools/types";

export const DEFAULT_TOOL_ENTRY_FILE = "/App.tsx" as const;

const DEFAULT_APP_FILE = `export default function App() {
  return (
    <main style={{ fontFamily: "sans-serif", padding: 24 }}>
      <h1>New Tool</h1>
      <p>Start building your React tool here.</p>
    </main>
  );
}
`;

export function getDefaultToolFiles(): ToolFileMap {
  return {
    [DEFAULT_TOOL_ENTRY_FILE]: DEFAULT_APP_FILE,
  };
}
