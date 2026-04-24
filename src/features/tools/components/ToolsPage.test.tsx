import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { generateTool } from "@/src/features/tools/api";
import { ToolProvider } from "@/src/features/tools/context/ToolContext";
import { loadStoredTools } from "@/src/features/tools/lib/storage";
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

  test("creates the first tool from the first prompt submission", async () => {
    const user = userEvent.setup();
    vi.mocked(generateTool).mockResolvedValue({
      name: "Generated Tool",
      description: "Generated description",
      files: {
        "/App.tsx": "export default function App() { return <div>Generated</div>; }",
      },
    });

    render(
      <ToolProvider>
        <ToolsPage />
      </ToolProvider>,
    );

    await user.type(screen.getByLabelText(/Tool prompt/i), "build a tool from scratch");
    await user.click(screen.getByRole("button", { name: /Generate Tool/i }));

    expect(generateTool).toHaveBeenCalledWith({
      prompt: "build a tool from scratch",
      tool: {
        name: "Untitled Tool",
        description: "A React tool.",
        files: {
          "/App.tsx": expect.stringContaining("export default function App"),
        },
      },
    });
    expect(screen.getByLabelText(/Tool name/i)).toHaveValue("Generated Tool");
    expect(within(screen.getByRole("complementary")).getByText("Generated Tool")).toBeInTheDocument();
  });

  test("preserves the first selected tool and shows the backend error when initial generation fails", async () => {
    const user = userEvent.setup();
    vi.mocked(generateTool).mockRejectedValue(
      new Error("Tool generation is unavailable because ANTHROPIC_API_KEY is not configured on the server."),
    );

    render(
      <ToolProvider>
        <ToolsPage />
      </ToolProvider>,
    );

    await user.type(screen.getByLabelText(/Tool prompt/i), "build a real calculator");
    await user.click(screen.getByRole("button", { name: /Generate Tool/i }));

    expect(
      await screen.findByText(
        "Tool generation is unavailable because ANTHROPIC_API_KEY is not configured on the server.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Tool name/i)).toHaveValue("Untitled Tool");
    expect(screen.getByLabelText(/Tool prompt/i)).toHaveValue("build a real calculator");
    expect(within(screen.getByRole("complementary")).getByText("Untitled Tool")).toBeInTheDocument();
    expect(loadStoredTools()).toHaveLength(1);
    expect(loadStoredTools()[0]).toMatchObject({
      name: "Untitled Tool",
      prompt: "build a real calculator",
    });
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

  test("sends the selected tool context when generating", async () => {
    const user = userEvent.setup();
    vi.mocked(generateTool).mockResolvedValue({
      name: "Generated Tool",
      description: "Generated description",
      files: {
        "/App.tsx": "export default function App() { return <div>Generated</div>; }",
      },
    });

    render(
      <ToolProvider>
        <ToolsPage />
      </ToolProvider>,
    );

    await user.click(screen.getByRole("button", { name: "New Tool" }));
    await user.clear(screen.getByLabelText(/Tool name/i));
    await user.type(screen.getByLabelText(/Tool name/i), "Starter Tool");
    await user.clear(screen.getByLabelText(/Tool prompt/i));
    await user.type(screen.getByLabelText(/Tool prompt/i), "add a button");
    await user.click(screen.getByRole("button", { name: /Generate Tool/i }));

    expect(generateTool).toHaveBeenCalledWith({
      prompt: "add a button",
      tool: {
        name: "Starter Tool",
        description: "A React tool.",
        files: {
          "/App.tsx": expect.stringContaining("export default function App"),
        },
      },
    });
  });
});
