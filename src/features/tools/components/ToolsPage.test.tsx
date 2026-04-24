import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { generateTool } from "@/src/features/tools/api";
import { ToolProvider } from "@/src/features/tools/context/ToolContext";
import { ToolsPage } from "@/src/features/tools/pages/ToolsPage";

vi.mock("@/src/features/tools/api", () => ({
  generateTool: vi.fn(),
}));

vi.mock("@codesandbox/sandpack-react", () => ({
  SandpackProvider: ({ children }: { children: ReactNode }) => <div data-testid="sandpack-provider">{children}</div>,
  SandpackPreview: () => <div data-testid="sandpack-preview" />,
}));

describe("ToolsPage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(generateTool).mockReset();
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

  test("creates a tool and shows it in the saved tools list", async () => {
    const user = userEvent.setup();

    render(
      <ToolProvider>
        <ToolsPage />
      </ToolProvider>,
    );

    await user.click(screen.getByRole("button", { name: "New Tool" }));

    expect(
      within(screen.getByRole("complementary")).getByText("Untitled Tool"),
    ).toBeInTheDocument();
  });

  test("clears generation error when the selected tool changes", async () => {
    const user = userEvent.setup();
    vi.mocked(generateTool).mockRejectedValue(new Error("Tool generation failed"));

    render(
      <ToolProvider>
        <ToolsPage />
      </ToolProvider>,
    );

    await user.click(screen.getByRole("button", { name: "New Tool" }));
    await user.type(screen.getByLabelText(/Tool prompt/i), "do something");
    await user.click(screen.getByRole("button", { name: /Generate Tool/i }));

    expect(await screen.findByText("Tool generation failed")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "New Tool" }));

    expect(screen.queryByText("Tool generation failed")).not.toBeInTheDocument();
  });
});
