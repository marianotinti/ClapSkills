import express from "express";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";
import Anthropic from "@anthropic-ai/sdk";
import { fetchMcpTools, callMcpTool } from "./src/lib/mcp.ts";
import {
  mapMcpToolsToAnthropicTools,
  parseClaudeJsonObject,
  resolveAnthropicConfig,
} from "./src/lib/anthropicAgent.ts";
import { normalizeToolResponse } from "./src/features/tools/server/normalizeToolResponse.ts";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.use(express.json());

  app.post("/api/tools/generate", async (req, res) => {
    try {
      const { prompt } = req.body as { prompt?: string };

      if (!prompt?.trim()) {
        return res.status(400).json({ error: "Prompt is required." });
      }

      const env = process.env as Record<string, string | undefined>;
      const anthropicCfg = resolveAnthropicConfig(env);

      if (anthropicCfg.usedLegacyTypo) {
        console.warn(
          "[ClapSkills] ANTRHOPIC_API_KEY (typo) is set but ANTHROPIC_API_KEY is not; using legacy var.",
        );
      }

      if (!anthropicCfg.apiKey) {
        return res.json(
          normalizeToolResponse({
            name: "Mock Tool",
            description: prompt,
            files: {
              "/App.tsx": `export default function App() {
  return <div className="p-8 text-white">Mock tool for: ${prompt.replace(/`/g, "")}</div>;
}`,
            },
          }),
        );
      }

      const model = env.TOOLS_MODEL_NAME?.trim() || anthropicCfg.model;
      const anthropic = new Anthropic({ apiKey: anthropicCfg.apiKey });
      const system = `You generate reusable React MVP tools for ClapSkills.
Return JSON only with this shape:
{
  "name": "Tool name",
  "description": "Short summary",
  "files": {
    "/App.tsx": "export default function App() { ... }"
  }
}
Rules:
- Only generate /App.tsx and optional /components/*.tsx files
- No external packages
- Use React + Tailwind classes only
- /App.tsx must default export a component`;

      const response = await anthropic.messages.create({
        model,
        max_tokens: 8192,
        system,
        messages: [{ role: "user", content: prompt.trim() }],
      });

      const text = response.content.find(
        (b): b is Anthropic.TextBlock => b.type === "text",
      )?.text;

      if (typeof text !== "string" || !text.trim()) {
        return res.status(502).json({ error: "Model returned no text response." });
      }

      let parsed: unknown;
      try {
        parsed = parseClaudeJsonObject(text);
      } catch {
        return res.status(502).json({ error: "Model response was not valid JSON." });
      }

      return res.json(normalizeToolResponse(parsed));
    } catch (error) {
      return res.status(500).json({ error: String(error) });
    }
  });

  app.post("/api/mcp/generate", async (req, res) => {
    try {
      const { prompt } = req.body;
      const mcpKey = process.env.N8N_MCP_SERVER_ACCESS_KEY;
      const mcpUrl = process.env.N8N_MCP_SERVER_URL;
      const anthropicCfg = resolveAnthropicConfig(process.env as Record<string, string | undefined>);

      if (!mcpKey || !mcpUrl || !anthropicCfg.apiKey) {
        const missing: string[] = [];
        if (!anthropicCfg.apiKey) {
          missing.push("ANTHROPIC_API_KEY (or ANTRHOPIC_API_KEY)");
        }
        if (!mcpKey || !mcpUrl) {
          missing.push("N8N_MCP_SERVER_URL / N8N_MCP_SERVER_ACCESS_KEY");
        }
        console.warn(
          `[ClapSkills] Missing: ${missing.join(" + ")}. Simulating workflow generation for demo.`,
        );
        await new Promise(resolve => setTimeout(resolve, 5500));
        res.json({
           success: true,
           workflowId: `mock_${Date.now()}`,
           name: "Custom AI Analysis",
           description: prompt.slice(0, 100) + "...",
           inputs: [
             { key: 'source_data', label: 'Source Data', type: 'textarea', required: true }
           ],
           steps: [
             { id: '1', label: 'Trigger Workflow', type: 'trigger' },
             { id: '2', label: 'Analyze with AI', type: 'ai' },
             { id: '3', label: 'Output Results', type: 'output' }
           ]
        });
        return;
      }

      console.log("Fetching tools from n8n MCP...");
      const mcpTools = await fetchMcpTools(mcpUrl, mcpKey);
      const anthropicTools = mapMcpToolsToAnthropicTools(
        mcpTools as { name: string; description?: string; inputSchema?: { type?: string; properties?: Record<string, unknown>; required?: string[] } }[],
      );
      const anthropic = new Anthropic({ apiKey: anthropicCfg.apiKey });
      const model = anthropicCfg.model;

      const systemInstruction = `You are an n8n workflow expert. 
The user wants to build an automation for ClapSkills MVP based on this request: "${prompt}".
Your goal is to actively use the n8n tools to search for nodes, validate, and create a workflow from code. 
IMPORTANT: When you use 'create_workflow_from_code', do not stop until the tool has completed successfully.`;

      type Msg = Anthropic.MessageParam;
      const messages: Msg[] = [
        { role: "user", content: "Please create my workflow. Begin by searching for the nodes you need." },
      ];

      let finalResult: { workflowId?: string; name?: string } | null = null;
      for (let i = 0; i < 10; i += 1) {
        console.log(`[Agent Step ${i + 1}] Calling Anthropic (${model})...`);
        const response = await anthropic.messages.create({
          model,
          max_tokens: 8192,
          system: systemInstruction,
          tools: anthropicTools,
          messages,
        });

        messages.push({ role: "assistant", content: response.content });

        const toolUseBlocks = response.content.filter(
          (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
        );
        if (toolUseBlocks.length === 0) {
          const text = response.content.find((b) => b.type === "text" && "text" in b);
          console.log(
            "[Agent] Model text (no tool):",
            text && "text" in text ? (text as { text: string }).text : response.stop_reason,
          );
          break;
        }

        const toolResultContent: Anthropic.ToolResultBlockParam[] = [];
        for (const block of toolUseBlocks) {
          console.log(`[Agent] Calling tool: ${block.name}`);
          try {
            const toolResult = (await callMcpTool(
              mcpUrl,
              mcpKey,
              block.name,
              (block.input ?? {}) as Record<string, unknown>,
            )) as { workflowId?: string; name?: string } | null;
            console.log(`[Agent] Tool ${block.name} returned successfully.`);
            toolResultContent.push({
              type: "tool_result",
              tool_use_id: block.id,
              content: JSON.stringify({ result: toolResult }),
            });
            if (block.name === "create_workflow_from_code" && toolResult && typeof toolResult.workflowId === "string") {
              finalResult = toolResult;
            }
          } catch (e) {
            console.error(`[Agent] Tool error:`, e);
            toolResultContent.push({
              type: "tool_result",
              tool_use_id: block.id,
              is_error: true,
              content: String(e),
            });
          }
        }
        messages.push({ role: "user", content: toolResultContent });
        if (finalResult) {
          break;
        }
      }

      if (finalResult) {
        // Return a mock Skill object tailored with the execution n8n webhook ID
        res.json({
           success: true,
           workflowId: finalResult.workflowId,
           name: finalResult.name || "Generated Automation",
           description: prompt,
           inputs: [{ key: 'input_data', label: 'Input Parameter', type: 'text', required: true }],
           steps: [{ id: '1', label: 'Trigger Workflow', type: 'trigger' }, { id: '2', label: 'Execute in n8n', type: 'tool' }]
        });
      } else {
        res.status(500).json({ error: "Agent failed to create the workflow after maximum iterations." });
      }
      
    } catch (error) {
      console.error("API Error:", error);
      res.status(500).json({ error: String(error) });
    }
  });

  app.post("/api/mcp/execute", async (req, res) => {
    try {
      const { workflowId, inputs } = req.body;
      const mcpKey = process.env.N8N_MCP_SERVER_ACCESS_KEY;
      const mcpUrl = process.env.N8N_MCP_SERVER_URL;
      
      if (workflowId.startsWith("mock_") || !mcpKey || !mcpUrl) {
         console.warn("Running mock execution for shared MVP demo...");
         await new Promise(resolve => setTimeout(resolve, 3000));
         return res.json({ success: true, executionId: `exec_${Date.now()}`, status: "completed" });
      }

      console.log(`Executing workflow ${workflowId}...`);
      const executionResult = await callMcpTool(mcpUrl, mcpKey, "execute_workflow", {
        workflowId,
        executionMode: "manual",
        inputs: {
           type: "webhook",
           webhookData: {
               method: "POST",
               body: inputs
           }
        }
      });
      
      return res.json({ success: true, executionId: executionResult.executionId, status: executionResult.status });
    } catch (error) {
      console.error("API Error executing:", error);
      res.status(500).json({ error: String(error) });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
