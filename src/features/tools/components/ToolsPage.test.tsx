import { cleanup, render, screen } from "@testing-library/react";
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
});
