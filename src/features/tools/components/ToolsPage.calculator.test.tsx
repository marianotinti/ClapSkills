import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
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

const calculatorPrompt = "Build a simple calculator with add, subtract, multiply, and divide buttons.";

const calculatorCode = `import { useState } from "react";

export default function App() {
  const [left, setLeft] = useState("12");
  const [right, setRight] = useState("4");
  const [result, setResult] = useState("16");

  const a = Number(left) || 0;
  const b = Number(right) || 0;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-8 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl">
        <h1 className="text-2xl font-semibold">Simple Calculator</h1>
        <div className="mt-6 grid gap-3">
          <input
            aria-label="Left operand"
            className="rounded-xl bg-slate-900 px-4 py-3"
            value={left}
            onChange={(event) => setLeft(event.target.value)}
          />
          <input
            aria-label="Right operand"
            className="rounded-xl bg-slate-900 px-4 py-3"
            value={right}
            onChange={(event) => setRight(event.target.value)}
          />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button className="rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950" onClick={() => setResult(String(a + b))}>Add</button>
          <button className="rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950" onClick={() => setResult(String(a - b))}>Subtract</button>
          <button className="rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950" onClick={() => setResult(String(a * b))}>Multiply</button>
          <button className="rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950" onClick={() => setResult(b === 0 ? "Cannot divide by zero" : String(a / b))}>Divide</button>
        </div>
        <div className="mt-6 rounded-2xl bg-slate-900/80 p-4">
          <p className="text-sm text-slate-400">Result</p>
          <p className="mt-2 text-4xl font-semibold">{result}</p>
        </div>
      </div>
    </main>
  );
}`;

const refinedCalculatorCode = `import { useState } from "react";

export default function App() {
  const [left, setLeft] = useState("8");
  const [right, setRight] = useState("2");
  const [result, setResult] = useState("10");

  const a = Number(left) || 0;
  const b = Number(right) || 0;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-8 text-white">
      <div className="w-full max-w-md rounded-[2rem] border border-cyan-300/20 bg-slate-900 p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Simple Calculator</h1>
          <button className="rounded-full border border-cyan-300/40 px-3 py-1 text-sm" onClick={() => setResult("0")}>Clear</button>
        </div>
        <div className="mt-6 grid gap-3">
          <input aria-label="Left operand" className="rounded-2xl bg-slate-800 px-4 py-3" value={left} onChange={(event) => setLeft(event.target.value)} />
          <input aria-label="Right operand" className="rounded-2xl bg-slate-800 px-4 py-3" value={right} onChange={(event) => setRight(event.target.value)} />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button className="rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950" onClick={() => setResult(String(a + b))}>Add</button>
          <button className="rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950" onClick={() => setResult(String(a - b))}>Subtract</button>
        </div>
        <div className="mt-6 rounded-3xl bg-slate-800/80 p-4">
          <p className="text-sm text-slate-400">Result</p>
          <p className="mt-2 text-4xl font-semibold">{result}</p>
        </div>
      </div>
    </main>
  );
}`;

function renderToolsPage() {
  return render(
    <ToolProvider>
      <ToolsPage />
    </ToolProvider>,
  );
}

async function createAndGenerateCalculator() {
  const user = userEvent.setup();

  renderToolsPage();

  await user.click(screen.getByRole("button", { name: "New Tool" }));
  await user.type(screen.getByLabelText(/Tool prompt/i), calculatorPrompt);
  await user.click(screen.getByRole("button", { name: /Generate Tool/i }));

  return { user };
}

describe("ToolsPage calculator workflow", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(generateTool).mockReset();
    vi.mocked(generateTool).mockResolvedValue({
      name: "Simple Calculator",
      description: "A four-function calculator built as a reusable React tool.",
      files: {
        "/App.tsx": calculatorCode,
      },
    });
  });

  afterEach(() => {
    cleanup();
  });

  test("generates and persists a simple calculator tool from the prompt", async () => {
    await createAndGenerateCalculator();

    expect(generateTool).toHaveBeenCalledWith({
      prompt: calculatorPrompt,
      tool: {
        name: "Untitled Tool",
        description: "A React tool.",
        files: {
          "/App.tsx": expect.stringContaining("export default function App"),
        },
      },
    });
    expect(screen.getByLabelText(/Tool name/i)).toHaveValue("Simple Calculator");
    const sidebar = screen.getByRole("complementary");

    expect(within(sidebar).getByText("Simple Calculator")).toBeInTheDocument();
    expect(
      within(sidebar).getByText("A four-function calculator built as a reusable React tool."),
    ).toBeInTheDocument();

    expect(loadStoredTools()).toHaveLength(1);
    expect(loadStoredTools()[0]).toMatchObject({
      name: "Simple Calculator",
      description: "A four-function calculator built as a reusable React tool.",
      prompt: calculatorPrompt,
      files: {
        "/App.tsx": calculatorCode,
      },
    });
  });

  test("lets the user refine the generated calculator name and source code", async () => {
    const { user } = await createAndGenerateCalculator();
    const updatedCode = `${calculatorCode}\n// refined for QA`;
    const codeEditor = screen.getAllByRole("textbox").find((element) => {
      return (element as HTMLTextAreaElement | HTMLInputElement).value === calculatorCode;
    });

    await user.clear(screen.getByLabelText(/Tool name/i));
    await user.type(screen.getByLabelText(/Tool name/i), "Calculator QA");
    expect(codeEditor).toBeDefined();
    fireEvent.change(codeEditor as HTMLTextAreaElement, { target: { value: updatedCode } });

    expect(within(screen.getByRole("complementary")).getByText("Calculator QA")).toBeInTheDocument();
    expect(loadStoredTools()[0]).toMatchObject({
      name: "Calculator QA",
      files: {
        "/App.tsx": updatedCode,
      },
    });
  });

  test("duplicates the generated calculator into a second saved tool", async () => {
    const { user } = await createAndGenerateCalculator();

    await user.click(screen.getByRole("button", { name: "Duplicate Simple Calculator" }));

    expect(within(screen.getByRole("complementary")).getByText("Simple Calculator Copy")).toBeInTheDocument();
    expect(screen.getByLabelText(/Tool name/i)).toHaveValue("Simple Calculator Copy");
    expect(loadStoredTools()).toHaveLength(2);
    expect(loadStoredTools()[1]).toMatchObject({
      name: "Simple Calculator Copy",
      files: {
        "/App.tsx": calculatorCode,
      },
    });
  });

  test("applies a second prompt as an edit to the same generated tool", async () => {
    const { user } = await createAndGenerateCalculator();

    vi.mocked(generateTool).mockResolvedValueOnce({
      name: "Simple Calculator",
      description: "Rounded calculator with clearer controls.",
      files: {
        "/App.tsx": refinedCalculatorCode,
      },
    });

    await user.clear(screen.getByLabelText(/Tool prompt/i));
    await user.type(screen.getByLabelText(/Tool prompt/i), "make buttons rounded and add a clear action");
    await user.click(screen.getByRole("button", { name: /Generate Tool/i }));

    expect(generateTool).toHaveBeenLastCalledWith({
      prompt: "make buttons rounded and add a clear action",
      tool: {
        name: "Simple Calculator",
        description: "A four-function calculator built as a reusable React tool.",
        files: {
          "/App.tsx": calculatorCode,
        },
      },
    });
    expect(screen.getByLabelText(/Tool name/i)).toHaveValue("Simple Calculator");
    expect(loadStoredTools()).toHaveLength(1);
    expect(loadStoredTools()[0]).toMatchObject({
      description: "Rounded calculator with clearer controls.",
      prompt: "make buttons rounded and add a clear action",
      files: {
        "/App.tsx": refinedCalculatorCode,
      },
    });
  });

  test("blocks prompt and workspace edits while the selected tool is generating", async () => {
    const user = userEvent.setup();
    let resolveGeneration: ((value: { name: string; description: string; files: Record<string, string> }) => void) | undefined;

    vi.mocked(generateTool).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveGeneration = resolve;
        }),
    );

    renderToolsPage();

    await user.click(screen.getByRole("button", { name: "New Tool" }));
    await user.type(screen.getByLabelText(/Tool prompt/i), calculatorPrompt);
    await user.click(screen.getByRole("button", { name: /Generate Tool/i }));

    expect(screen.getByRole("button", { name: /Generating…/i })).toBeDisabled();
    expect(screen.getByLabelText(/Tool prompt/i)).toBeDisabled();
    expect(screen.getByLabelText(/Tool name/i)).toBeDisabled();

    resolveGeneration?.({
      name: "Simple Calculator",
      description: "A four-function calculator built as a reusable React tool.",
      files: {
        "/App.tsx": calculatorCode,
      },
    });

    expect(await screen.findByRole("button", { name: /Generate Tool/i })).toBeEnabled();
  });
});
