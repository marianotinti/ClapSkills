import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import dotenv from "dotenv";
import { EventSource } from "eventsource";
import fs from "fs";

// Load .env.example
const exampleEnv = dotenv.parse(fs.readFileSync('.env.example'));
for (const k in exampleEnv) { process.env[k] = exampleEnv[k]; }

async function test() {
  (globalThis as typeof globalThis & { EventSource: typeof EventSource }).EventSource = EventSource;
  try {
    const url = process.env.N8N_MCP_SERVER_URL || "";
    const key = process.env.N8N_MCP_SERVER_ACCESS_KEY || "";
    // Wait, the MCP transport using URL object
    const transport = new SSEClientTransport(new URL(url), {
       eventSourceInit: {
         fetch: (input, init) =>
           fetch(input, {
             ...init,
             headers: {
               ...init.headers,
               Authorization: `Bearer ${key}`,
             },
           }),
       },
       requestInit: {
         headers: {
           Authorization: `Bearer ${key}`,
           Accept: "application/json, text/event-stream, */*",
         },
       },
    });
    console.log("Connecting...");
    const client = new Client({ name: "test", version: "1.0" }, { capabilities: {} });
    await client.connect(transport);
    console.log("Connected. Fetching tools:");
    const tools = await client.listTools();
    console.log(tools);
    process.exit(0);
  } catch(e) {
    console.error("Error:", e);
    process.exit(1);
  }
}

test();
