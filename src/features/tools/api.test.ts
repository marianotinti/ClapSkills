import { afterEach, describe, expect, it, vi } from "vitest";

import { generateTool } from "@/src/features/tools/api";

describe("generateTool", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the parsed tool payload on success", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          name: "Calculator",
          description: "A real tool.",
          files: {
            "/App.tsx": "export default function App() { return <div>OK</div>; }",
          },
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    vi.stubGlobal("fetch", fetchMock);

    await expect(generateTool({ prompt: "build calculator" })).resolves.toMatchObject({
      name: "Calculator",
    });
  });

  it("surfaces the backend error message when the request fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: "Tool generation is unavailable because ANTHROPIC_API_KEY is not configured on the server.",
        }),
        {
          status: 503,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    vi.stubGlobal("fetch", fetchMock);

    await expect(generateTool({ prompt: "build calculator" })).rejects.toThrow(
      "Tool generation is unavailable because ANTHROPIC_API_KEY is not configured on the server.",
    );
  });
});