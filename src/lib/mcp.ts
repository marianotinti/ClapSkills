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

  let text = await res.text();
  
  // Clean up any SSE formatting that n8n might inject
  if (text.includes("event: message\ndata: ")) {
     text = text.trim().split("data: ")[1];
  }
  
  try {
    return JSON.parse(text);
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
