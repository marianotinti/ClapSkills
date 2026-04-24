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
    throw new Error(`Tool generation failed with status ${response.status}`);
  }

  return (await response.json()) as GenerateToolResponse;
}
