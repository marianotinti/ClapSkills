import { beforeEach, describe, expect, test } from "vitest";

import {
  createEmptyToolRecord,
  duplicateToolRecord,
  exportTools,
  importTools,
  loadStoredTools,
  saveStoredTools,
} from "@/src/features/tools/lib/storage";

describe("tools storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("default tool has /App.tsx and react-tool tag", () => {
    const tool = createEmptyToolRecord();

    expect(tool.entryFile).toBe("/App.tsx");
    expect(tool.files["/App.tsx"]).toContain("export default function App()");
    expect(tool.tags).toEqual(["react-tool"]);
  });

  test("persists and reloads tools", () => {
    const tools = [createEmptyToolRecord({ name: "Counter Tool" })];

    saveStoredTools(tools);

    expect(loadStoredTools()).toEqual(tools);
  });

  test("duplicate gets a new id and copy suffix", () => {
    const original = createEmptyToolRecord({ name: "Counter Tool" });

    const duplicate = duplicateToolRecord(original);

    expect(duplicate.id).not.toBe(original.id);
    expect(duplicate.name).toBe("Counter Tool Copy");
    expect(duplicate.files).toEqual(original.files);
  });

  test("exports and imports tools", () => {
    const tools = [createEmptyToolRecord({ name: "Exported Tool" })];

    const exported = exportTools(tools);
    const imported = importTools(exported);

    expect(imported).toEqual(tools);
  });

  test("returns an empty list for invalid import json", () => {
    expect(importTools("{invalid-json")).toEqual([]);
  });

  test("keeps valid stored tools when one stored record is malformed", () => {
    const validTool = createEmptyToolRecord({ name: "Stored Tool" });

    localStorage.setItem(
      "clapskills.tools",
      JSON.stringify([validTool, { id: 123, tags: "bad-data" }]),
    );

    expect(loadStoredTools()).toEqual([validTool]);
  });
});
