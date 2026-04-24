import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    // Nested git worktree checkouts can live under .worktrees/ locally; do not run those as duplicate suites.
    exclude: ["**/node_modules/**", "**/dist/**", ".worktrees/**", "**/.worktrees/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
