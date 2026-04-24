# Merge readiness: main-line integration (2026-04-24)

## Executive summary

The `POST /api/mcp/generate` path was migrated from the prior Gemini-based flow to **Anthropic** using `@anthropic-ai/sdk`, with MCP tool listing/calling unchanged against the n8n MCP server. New helper code lives in `src/lib/anthropicAgent.ts` (config resolution, `mapMcpToolsToAnthropicTools`). TypeScript and env wiring were adjusted for a Vite + Node (`tsx`/`server.ts`) setup; `test-mcp.ts` is excluded from compilation where applicable. **Manual smoke testing** confirmed a valid `ANTHROPIC_API_KEY` is accepted (no 401 from Anthropic). **Blockers for calling main “stable”** remain: unbounded n8n tool responses can break JSON parsing in `sendMcpRequest`, the agent loop can exit after **10** iterations without `create_workflow_from_code` + a real `workflowId`, there is **no** `npm test` / automated regression gate, and the dev stack can still hit **Vite HMR port 24678** conflicts when several apps run locally.

## Risk level

**Medium** — API credentials path is plausibly healthy, but **production or demo reliability of workflow generation** depends on n8n MCP behavior (response size, streaming/SSE shape) and on **non-deterministic** agent/tool sequencing within a **fixed 10-step** cap. Merging is reasonable for iterative delivery if stakeholders accept occasional generation failures and the follow-up work below is tracked.

## What was verified

- **Anthropic authentication**: With a configured `ANTHROPIC_API_KEY`, calls do not fail with HTTP 401 from the provider (per prior run).
- **Code surface**: `server.ts` uses `resolveAnthropicConfig`, `mapMcpToolsToAnthropicTools`, and `anthropic.messages.create` with an MCP tool loop. If `N8N_MCP_*` or `ANTHROPIC_API_KEY` (or legacy `ANTRHOPIC_API_KEY`) is missing, the route returns a **synthetic** `mock_*` skill payload. If creds are present but the agent never produces `create_workflow_from_code` with a `workflowId`, the route returns **500** (not a mock).
- **`package.json`**: Scripts present are `dev`, `build`, `preview`, `clean`, `start`, `lint` — **no** `test` script.
- **MCP client** (`src/lib/mcp.ts`): `sendMcpRequest` uses `res.text()` then `JSON.parse`; optional stripping when body contains `event: message\ndata: `.

## Documented issues

1. **MCP / n8n — large or malformed tool payloads**  
   Tools like `get_sdk_reference` can return very large or awkwardly wrapped bodies. The client parses the **entire** body as a single JSON string; failures manifest as `JSON.parse` errors (e.g. **Unterminated string**), logged in `Failed to parse MCP response`. Root cause: **unbounded `text`**, fragile SSE pre-processing, and no chunk/stream handling.

2. **Agent loop — 10-iteration cap without success criteria**  
   The loop in `server.ts` runs at most **10** times and breaks when the assistant returns **no** `tool_use` blocks. The model can exhaust steps or stop early without ever calling `create_workflow_from_code` or without surfacing a usable `workflowId` in `finalResult`, yielding an error or incomplete UX downstream.

3. **No automated test script**  
   `package.json` has no `test` entry, so **CI and local** regression is limited to `npm run lint` (tsc) unless additional tooling is added. Non-trivial agent + MCP behavior is not locked by automated tests.

4. **Vite HMR port 24678**  
   When multiple Vite dev servers run (this repo and others), the default HMR port can **conflict**, causing noisy failures or hot-reload issues — environment-specific, not a logic bug, but a recurring dev friction.

5. **Mock path when env incomplete**  
   If `N8N_MCP_*` or Anthropic key is missing, the handler returns a **synthetic** `mock_*` `workflowId`. This is good for demos but is easy to mistake for a real n8n workflow; merge reviewers should be aware for staging vs production.

## Recommended follow-up tests

- **Contract**: `POST /api/mcp/generate` with full env — assert JSON shape, non-mock `workflowId` when MCP succeeds, and 200 vs 4xx/5xx for missing `prompt` if applicable.
- **MCP resilience**: Reproduce or simulate a **huge** `get_sdk_reference` (or equivalent) response; add tests or limits for max body size, streaming/SSE line assembly, and structured error to the model instead of raw parse throws.
- **Agent behavior**: Soak test varied prompts; measure rate of `finalResult` set vs iteration exhaustion; log `stop_reason` and last tool names for postmortems.
- **Execute path**: `POST /api/mcp/execute` with a real n8n workflow id (not `mock_`) to confirm end-to-end after generation.
- **Lint/CI**: Run `npm run lint` in CI; add `npm test` (or a minimal `vitest` suite) when agent/MCP client boundaries are testable with mocks.
- **Dev env**: Start two Vite+Express dev stacks and document or set **explicit HMR port** / `server.hmr` config to avoid 24678 clashes.

## Merge safety checklist

- [ ] `npm run lint` passes on the merge candidate branch.
- [ ] `.env.example` matches required variables (`ANTHROPIC_API_KEY` / `ANTHROPIC_MODEL`, `N8N_MCP_SERVER_URL`, `N8N_MCP_SERVER_ACCESS_KEY`); no secrets in git.
- [ ] `.gitignore` continues to exclude local secrets and any generated artifacts agreed by the team.
- [ ] **Staging** (or a dedicated n8n MCP URL) used for a full generate → create_workflow → execute smoke; document any known flaky tools (`get_sdk_reference`, etc.).
- [ ] Stakeholders accept: **10-step** cap, **mock** path when creds are missing, and **parse** failures on oversized MCP responses until a follow-up ships.
- [ ] Optional: add a one-line **README** or runbook note for HMR port if multiple devs hit 24678 — only if the team wants it (not a merge blocker for code quality alone).
