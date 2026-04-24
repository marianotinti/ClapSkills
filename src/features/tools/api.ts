import type { GenerateToolRequest, GenerateToolResponse } from "@/src/features/tools/types";

export async function generateTool(request: GenerateToolRequest): Promise<GenerateToolResponse> {
  const response = await fetch("/api/tools/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    let message = `Tool generation failed with status ${response.status}`;

    try {
      const payload = (await response.json()) as { error?: unknown };
      if (typeof payload.error === "string" && payload.error.trim()) {
        message = payload.error;
      }
    } catch {
      // Fall back to the generic status-based message when the backend does not return JSON.
    }

    throw new Error(message);
  }

  return (await response.json()) as GenerateToolResponse;
}
