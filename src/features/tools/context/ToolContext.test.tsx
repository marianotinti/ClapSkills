import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { ToolProvider, useTools } from "@/src/features/tools/context/ToolContext";
import { createEmptyToolRecord, loadStoredTools, saveStoredTools } from "@/src/features/tools/lib/storage";

function ToolHarness() {
  const { createTool, selectedTool, selectedToolId, tools } = useTools();

  return (
    <div>
      <button type="button" onClick={() => createTool()}>
        Create tool
      </button>
      <output data-testid="tool-count">{tools.length}</output>
      <output data-testid="selected-tool-id">{selectedToolId}</output>
      <output data-testid="selected-tool-name">{selectedTool?.name ?? ""}</output>
    </div>
  );
}

describe("ToolProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  test("hydrates the initial collection from storage", () => {
    saveStoredTools([createEmptyToolRecord({ name: "Stored Tool" })]);

    render(
      <ToolProvider>
        <ToolHarness />
      </ToolProvider>,
    );

    expect(screen.getByTestId("tool-count")).toHaveTextContent("1");
    expect(screen.getByTestId("selected-tool-name")).toHaveTextContent("Stored Tool");
  });

  test("creating a tool increments the collection and selects it", async () => {
    const user = userEvent.setup();

    render(
      <ToolProvider>
        <ToolHarness />
      </ToolProvider>,
    );

    expect(screen.getByTestId("tool-count")).toHaveTextContent("0");
    expect(screen.getByTestId("selected-tool-id")).toHaveTextContent("");
    expect(screen.getByTestId("selected-tool-name")).toHaveTextContent("");

    await user.click(screen.getByRole("button", { name: "Create tool" }));

    expect(screen.getByTestId("tool-count")).toHaveTextContent("1");
    expect(screen.getByTestId("selected-tool-id")).not.toHaveTextContent("");
    expect(screen.getByTestId("selected-tool-name")).toHaveTextContent("Untitled Tool");
  });

  test("persists created tools back to storage", async () => {
    const user = userEvent.setup();

    render(
      <ToolProvider>
        <ToolHarness />
      </ToolProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Create tool" }));

    expect(loadStoredTools()).toHaveLength(1);
    expect(loadStoredTools()[0]?.name).toBe("Untitled Tool");
  });
});
