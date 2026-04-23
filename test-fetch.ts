import fs from "fs";
import dotenv from "dotenv";
const exampleEnv = dotenv.parse(fs.readFileSync('.env.example'));
const url = exampleEnv.N8N_MCP_SERVER_URL;
const key = exampleEnv.N8N_MCP_SERVER_ACCESS_KEY;

async function check() {
  console.log("Fetching POST tools/list...", url);
  const res = await fetch(url + "", {
    method: "POST",
    headers: { 
      "Authorization": `Bearer ${key}`,
      "Accept": "application/json, text/event-stream",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
      params: {}
    })
  });
  console.log("Status:", res.status);
  console.log("Body:", await res.text());
}
check();
