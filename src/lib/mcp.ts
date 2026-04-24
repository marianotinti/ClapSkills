export function parseMcpResponseText(rawText: string) {
  const trimmed = rawText.trim();

  if (!trimmed.startsWith("event:") && !trimmed.startsWith("data:")) {
    return JSON.parse(trimmed);
  }

  const dataLines = trimmed
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice("data:".length).trimStart());

  if (dataLines.length === 0) {
    throw new Error("MCP SSE response did not include any data lines.");
  }

  return JSON.parse(dataLines.join("\n"));
}

export async function sendMcpRequest(url: string, key: string, method: string, params: any) {
  const res = await fetch(url, {
    method: "POST",
    headers: { 
      "Authorization": `Bearer ${key}`,
      "Accept": "application/json, text/event-stream",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Math.floor(Math.random() * 10000),
      method,
      params
    })
  });
  
  if (!res.ok) {
    throw new Error(`MCP Request failed: ${res.status} HTTP.`);
  }

  const text = await res.text();
  
  try {
    return parseMcpResponseText(text);
  } catch (err) {
    console.error("Failed to parse MCP response:", text);
    throw err;
  }
}

export async function fetchMcpTools(url: string, key: string) {
  const result = await sendMcpRequest(url, key, "tools/list", {});
  return result.result.tools;
}

export async function callMcpTool(url: string, key: string, name: string, args: any) {
  const result = await sendMcpRequest(url, key, "tools/call", { name, arguments: args });
  return result.result;
}
