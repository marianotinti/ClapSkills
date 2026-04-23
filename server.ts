import express from "express";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { fetchMcpTools, callMcpTool } from "./src/lib/mcp.ts";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.use(express.json());

  app.post("/api/mcp/generate", async (req, res) => {
    try {
      const { prompt } = req.body;
      const mcpKey = process.env.N8N_MCP_SERVER_ACCESS_KEY;
      const mcpUrl = process.env.N8N_MCP_SERVER_URL;
      const geminiKey = process.env.GEMINI_API_KEY;

      if (!mcpKey || !mcpUrl || !geminiKey) {
        console.warn("Missing backend credentials! Simulating generation for shared MVP demo...");
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

      // Convert MCP tools to Gemini function declarations
      const geminiTools = mcpTools.map((t: any) => ({
        name: t.name,
        description: t.description,
        parameters: t.inputSchema // Might need standardizing, but works for basic usage
      }));

      const ai = new GoogleGenAI({ apiKey: geminiKey });
      
      const systemInstruction = `You are an n8n workflow expert. 
The user wants to build an automation for ClapSkills MVP based on this request: "${prompt}".
Your goal is to actively use the n8n tools to search for nodes, validate, and create a workflow from code. 
IMPORTANT: When you use 'create_workflow_from_code', DO NOT return a response until you have successfully executed the tool.`;

      let messages = [{ role: 'user', parts: [{ text: "Please create my workflow. Begin by searching for the nodes you need." }] }];
      
      // Agent loop (max 10 iterations)
      let finalResult = null;
      for (let i = 0; i < 10; i++) {
        console.log(`[Agent Step ${i+1}] Calling Gemini...`);
        const response: any = await ai.models.generateContent({
          model: 'gemini-2.5-pro',
          contents: messages as any,
          config: {
            systemInstruction,
            tools: [{ functionDeclarations: geminiTools }]
          }
        });

        const part = response.candidates?.[0]?.content?.parts?.[0];
        
        if (part?.functionCall) {
          const fnCall = part.functionCall;
          console.log(`[Agent] Calling tool: ${fnCall.name}`);
          
          messages.push({ role: 'model', parts: [{ functionCall: fnCall }] });
          
          try {
            const toolResult = await callMcpTool(mcpUrl, mcpKey, fnCall.name, fnCall.args);
            console.log(`[Agent] Tool ${fnCall.name} returned successfully.`);
            
            messages.push({
              role: 'user',
              parts: [{
                functionResponse: {
                  name: fnCall.name,
                  response: { result: toolResult }
                }
              }]
            });
            
            if (fnCall.name === 'create_workflow_from_code' && toolResult.workflowId) {
              finalResult = toolResult;
              break; 
            }
          } catch (e) {
            console.error(`[Agent] Tool error:`, e);
            messages.push({
              role: 'user',
              parts: [{
                functionResponse: {
                  name: fnCall.name,
                  response: { error: String(e) }
                }
              }]
            });
          }
        } else {
          // Model returned text
          console.log(`[Agent] Model says:`, part?.text);
          if (finalResult) break;
          // If the model stops calling tools before creating, break out to avoid infinite loops
          if (i > 0 && !part?.functionCall) {
             break;
          }
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
