import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { ToolProvider } from "@/src/features/tools/context/ToolContext";
import { ToolsPage } from "@/src/features/tools/pages/ToolsPage";

describe("ToolsPage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  test("renders the tools shell header and library action", () => {
    render(
      <ToolProvider>
        <ToolsPage />
      </ToolProvider>,
    );

    expect(
      screen.getByRole("heading", {
        name: "Tools",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Generate and save reusable React tools."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "New Tool",
      }),
    ).toBeInTheDocument();
  });

  test("clears generation placeholder message when the selected tool changes", async () => {
    const user = userEvent.setup();

    render(
      <ToolProvider>
        <ToolsPage />
      </ToolProvider>,
    );

    await user.click(screen.getByRole("button", { name: "New Tool" }));
    await user.type(screen.getByLabelText(/Tool prompt/i), "do something");
    await user.click(screen.getByRole("button", { name: /Generate Tool/i }));

    expect(
      screen.getByText("Tool generation will be connected in the next task."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "New Tool" }));

    expect(
      screen.queryByText("Tool generation will be connected in the next task."),
    ).not.toBeInTheDocument();
  });
});
