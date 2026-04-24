# API mock signaling, execute validation, and `normalizeToolResponse` hardening

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate silent “success” when the app is in demo/mock mode, validate `POST /api/mcp/execute` inputs, and stop replacing bad model `files` with `DEFAULT_TOOL_FILES` without an explicit opt-in, while preserving a controlled local demo path when desired.

**Architecture:** Centralize “are we simulating?” in env-driven flags, return **explicit JSON fields** (`simulation: true` / `code: "…"`) and/or **non-2xx** for misconfiguration, depending on the chosen mode. Tighten `normalizeToolResponse` to **throw** when `files` is missing/invalid (no silent default file map), with an optional `allowDefaultFiles` used only for intentional mock generation on the server.

**Tech Stack:** Express (`server.ts`), TypeScript, Vitest, existing Anthropic + n8n MCP helpers in `src/lib/anthropicAgent.ts` and `src/lib/mcp.ts`, Tools feature under `src/features/tools/`, Create Skill page `src/pages/CreateSkill.tsx`.

---

## File map (what each file is responsible for)

| Path | Role |
|------|------|
| `server.ts` | HTTP routes: `/api/tools/generate`, `/api/mcp/generate`, `/api/mcp/execute` — this plan changes status codes, response bodies, and request validation. |
| `src/features/tools/server/normalizeToolResponse.ts` | Parse/validate `GenerateToolResponse` from the model; remove dangerous default substitution. |
| `src/features/tools/server/normalizeToolResponse.test.ts` | Tests for new throw paths and valid payloads. |
| `src/features/tools/api.ts` | Client `fetch` to `/api/tools/generate` — may parse `simulation` or surface errors (optional UI). |
| `src/pages/CreateSkill.tsx` | Consumer of `/api/mcp/generate` — must not treat a simulated workflow as a real n8n workflow when the API signals it. |
| `src/types.ts` (or a small `src/lib/apiTypes.ts` if you prefer) | Optional shared type for `simulation` / error codes if you want compile-time safety. |
| `.env.example` | Document new flags and existing n8n/Anthropic vars. |

---

## External prerequisites: what must work for “Create Skill” **without** mocks

These are **not** code changes; they are what must be true in your environment. The app already gates the “live” path in `server.ts` (lines 101–135, simplified):

```ts
if (!mcpKey || !mcpUrl || !anthropicCfg.apiKey) { /* → demo path */ }
```

### Anthropic (required for the **live** `POST /api/mcp/generate` path)

> **Nota (estado 2026-04-24):** El “arreglo” de integración **ya está en el repo:** migración a `@anthropic-ai/sdk`, y `src/lib/anthropicAgent.ts` → `resolveAnthropicConfig` usa `ANTHROPIC_API_KEY` con **fallback** opcional a `ANTRHOPIC_API_KEY` (typo histórico) para no romper `.env` viejos. Un 401 de Anthropic era **clave inválida o revocada** en el entorno, no un fallo de nombre de variable. Lo que **sigue siendo requisito operativo** es: clave **válida** + cuota, y (recomendado) renombrar en tu `.env` a `ANTHROPIC_API_KEY` para no depender del alias con typo.

| Item | Why it matters |
|------|----------------|
| `ANTHROPIC_API_KEY` (official name) with billing / quota | Without it, the server never calls `anthropic.messages.create` for the agent loop. |
| Optional: `ANTRHOPIC_API_KEY` | Legacy typo still read by `resolveAnthropicConfig` **only as fallback**; point your real secret at `ANTHROPIC_API_KEY` and delete the typo line when you can. |
| `ANTHROPIC_MODEL` (or default in `getDefaultAnthropicModel()`) | Must be a model your key can call that supports **tool use** (the n8n MCP tool loop). |
| Model supports **tools** + your token window | The loop can run up to 10 steps × large messages; 429/529 rate limits will surface as 500 unless you add retries (out of scope for this P0 plan). |

### n8n MCP (required for the same live path)

| Item | Why it matters |
|------|----------------|
| `N8N_MCP_SERVER_URL` | **HTTPS** (or `http` for local) URL the Node server can reach. Must be the n8n **MCP** endpoint (not the generic n8n UI). |
| `N8N_MCP_SERVER_ACCESS_KEY` | **Valid** access token / JWT the MCP server accepts. Expired or wrong instance → `fetchMcpTools` or `callMcpTool` fails. |
| MCP tool surface | The loop expects tools such as (names depend on your n8n MCP build) **`create_workflow_from_code`** to eventually return a **`workflowId`** (string). If your n8n doesn’t expose that tool or the response shape differs, `finalResult` stays `null` and you get **500** after max iterations, not a mock. |
| n8n side: workflows / permissions | The n8n account behind the key must be allowed to create/execute the workflows the agent requests. |
| **Network** | From where you run `node server.ts` (or Cloud Run, etc.), outbound access to the n8n host must work (no firewall blocking the MCP path). |

### “Create Skill” UI / runtime path

| Item | Note |
|------|------|
| The browser calls **`/api/mcp/generate` on the same origin** as the SPA (Vite dev middleware). No extra `VITE_` n8n URL is required for **this** flow unless you later add a direct webhook. |
| After a **real** generation, the draft uses `data.workflowId` from the response; execution later uses `POST /api/mcp/execute` with the same `workflowId` — for that, **execute** also needs the same n8n MCP key + URL (see `server.ts` execute handler). |

### Still “mock” or partial by design (until you change the code)

- The **successful** `POST /api/mcp/generate` response in the live branch still maps a **simplified** skill shape: `inputs` / `steps` are **not** read from n8n** today** (see `server.ts` around 215–224). “No mockups” for **persistence in ClapSkills** is satisfied by a real `workflowId`; **metadata** in the app may still be **placeholder** until a follow-up task plumbs n8n’s real schema.

---

## Preguntas (respóndeme antes o durante la implementación)

1. **Prod vs demo:** En entornos sin credenciales, ¿prefieres **503 + JSON de error** (más estricto) o **200 + `simulation: true`** (más suave, la UI decide)? Este plan asume un flag **`CLAPSKILLS_ALLOW_DEMO_MOCKS`** (ver Task 1) que permite mantener el comportamiento actual de demo solo cuando está explícitamente en `1`/`true`.
2. **Create Skill con simulación:** Si el usuario deja el demo encendido, ¿debe el draft **mostrar un banner** “Modo simulado” o **bloquear** “Guardar” hasta que haya un `workflowId` no mock?
3. **n8n real:** Tu instancia MCP ya devuelve `workflowId` en el resultado de `create_workflow_from_code` como **string**; si el nombre difiere (por ejemplo anidado en `result.id`), habría que ajustar el casteo en el loop. ¿Puedes pegar (redactada) un ejemplo de payload real de esa herramienta?
4. **Tools** (`/api/tools/generate`): Misma política que mcp: ¿mismo flag `CLAPSKILLS_ALLOW_DEMO_MOCKS` o quieres **`TOOLS_ALLOW_DEMO_ONLY`** separado?
5. **Contrato móvil / otro host:** ¿La app se sirve **solo** bajo Vite+Express o hay otro origen? Afecta CORS; este plan no toca CORS salvo que lo indiques.

---

# Tasks

### Task 1: Env contract for demo mocks

**Files:**

- Create: (none) — only env + docs
- Modify: `server.ts` (top of file, after `dotenv.config()`), `.env.example`

- [ ] **Step 1: Add a helper (inline in `server.ts` or `src/lib/serverConfig.ts` if you split)**

```ts
function getAllowDemoMocks(): boolean {
  const v = process.env.CLAPSKILLS_ALLOW_DEMO_MOCKS?.toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}
```

- [ ] **Step 2: Document in `.env.example`**

```dotenv
# When 1, missing Anthropic and/or n8n MCP can still return 200 with simulation payloads (not for production).
CLAPSKILLS_ALLOW_DEMO_MOCKS="0"
```

- [ ] **Step 3: No commit without tests from later tasks** (optional micro-commit: “chore: document CLAPSKILLS_ALLOW_DEMO_MOCKS”).

Run: (none)

---

### Task 2: `POST /api/tools/generate` — no more silent 200 “Mock Tool” without a signal

**Files:**

- Modify: `server.ts` (handler starting ~line 25)
- Optional modify: `src/features/tools/api.ts` if you want to throw a typed error on `simulation: true` for your UI
- Test: add `server.test` **only if** you extract a pure function; otherwise **manual** curl (see step 3)

- [ ] **Step 1: Change the `!anthropicCfg.apiKey` branch**

**Behavior:**

- If `!apiKey` and **`getAllowDemoMocks()` is false** → `503` (or `501`) with body:

```json
{ "error": "ANTHROPIC_KEY_MISSING", "message": "Set ANTHROPIC_API_KEY to generate tools with Claude." }
```

- If `!apiKey` and **demo allowed** → `200` with the same normalized body as today **plus** top-level field **`"simulation": true`** (you may add `"simulationReason": "no_anthropic_key"`). Still call `normalizeToolResponse` for the `files` shape, or build the mock object in one place and pass to a small helper.

- [ ] **Step 2: If `apiKey` present** — response is **not** a simulation: ensure no `simulation` key or set `"simulation": false` for consistency (pick one and document in Task 4).

- [ ] **Step 3: Manual verification**

```bash
# with ANTHROPIC empty and CLAPSKILLS_ALLOW_DEMO_MOCKS=0
curl -s -o - -w "\nHTTP:%{http_code}\n" -X POST http://localhost:3000/api/tools/generate -H "Content-Type: application/json" -d '{"prompt":"x"}'
```

Expected: `HTTP:503` and JSON with `ANTHROPIC_KEY_MISSING` (or your chosen code).

`CLAPSKILLS_ALLOW_DEMO_MOCKS=1` same curl → `HTTP:200` and body contains `"simulation": true`.

- [ ] **Step 4: Commit**

```bash
git add server.ts .env.example
git commit -m "fix(api): explicit simulation flag for /api/tools/generate when key is missing"
```

---

### Task 3: `POST /api/mcp/generate` — same policy + visible `simulation`

**Files:**

- Modify: `server.ts` (block ~101–135)
- Modify: `src/pages/CreateSkill.tsx` to read `data.simulation` and show a banner and/or disable “Save” if you want zero confusion

- [ ] **Step 1: When credentials missing, mirror Task 2**

- If `getAllowDemoMocks() === false` → **`503`** with

```json
{ "error": "CONFIG_INCOMPLETE", "message": "Missing Anthropic and/or n8n MCP. See .env.example.", "missing": ["..."] }
```

(optional `missing` array matches your existing `missing.push` logic.)

- If demo allowed → keep delay if you want UX parity, but response **must** include at minimum:

```json
{ "simulation": true, "success": true, "workflowId": "mock_…", "name": "…", "inputs": […], "steps": […] }
```

- [ ] **Step 2: When live path** (`finalResult` at line 215+), set `"simulation": false` in the success JSON (or omit `simulation` for backward compat; but then Create Skill cannot know — prefer explicit `false` **or** `live: true`).

- [ ] **Step 3: `CreateSkill.tsx` minimal UX**

After `const data = await response.json();`:

```tsx
if (data.simulation) {
  // set a local state showSimulationBanner: true, or setError with non-blocking message
}
```

**Exact UI is your choice;** the plan’s minimum is **do not** navigate user to “production ready” without acknowledging simulation.

- [ ] **Step 4: `curl` checks** same pattern as Task 2 with `/api/mcp/generate` and `{"prompt":"test"}`.

- [ ] **Step 5: Commit**

```bash
git add server.ts src/pages/CreateSkill.tsx
git commit -m "fix(api): mark simulated n8n workflow generation; 503 when demo not allowed"
```

---

### Task 4: `POST /api/mcp/execute` — `workflowId` validation (400 + tests)

**Files:**

- Modify: `server.ts` (handler ~235)
- Test: if you have no `supertest` yet, **extract** a pure function to `src/lib/validateMcpExecuteBody.ts` and unit-test; otherwise add `supertest` (new dependency) — YAGNI says **extract + Vitest** without new deps.

- [ ] **Step 1: New file `src/lib/validateMcpExecuteBody.ts`**

```ts
export type McpExecuteBody = { workflowId: string; inputs: unknown };

export function parseMcpExecuteBody(body: unknown):
  | { ok: true; value: McpExecuteBody }
  | { ok: false; error: string } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Request body must be a JSON object." };
  }
  const o = body as Record<string, unknown>;
  if (typeof o.workflowId !== "string" || !o.workflowId.trim()) {
    return { ok: false, error: "workflowId must be a non-empty string." };
  }
  return { ok: true, value: { workflowId: o.workflowId.trim(), inputs: o.inputs } };
}
```

- [ ] **Step 2: Failing test** `src/lib/validateMcpExecuteBody.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { parseMcpExecuteBody } from "./validateMcpExecuteBody";

describe("parseMcpExecuteBody", () => {
  it("rejects non-string workflowId", () => {
    const r = parseMcpExecuteBody({ workflowId: 123, inputs: {} });
    expect(r.ok).toBe(false);
  });
  it("accepts valid", () => {
    const r = parseMcpExecuteBody({ workflowId: "  wf_1  ", inputs: { a: 1 } });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.workflowId).toBe("wf_1");
  });
});
```

Run: `npx vitest run src/lib/validateMcpExecuteBody.test.ts`  
Expected: **FAIL** until the file from Step 1 exists and exports match.

- [ ] **Step 3: In `server.ts`**, first lines of the execute handler:

```ts
import { parseMcpExecuteBody } from "./src/lib/validateMcpExecuteBody.ts";

// inside handler:
const parsed = parseMcpExecuteBody(req.body);
if (!parsed.ok) {
  return res.status(400).json({ error: "INVALID_BODY", message: parsed.error });
}
const { workflowId, inputs } = parsed.value;
```

Use `workflowId` instead of `req.body.workflowId` for `startsWith` and `callMcpTool`.

- [ ] **Step 4: All tests + lint**

```bash
npm run test && npm run lint
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/validateMcpExecuteBody.ts src/lib/validateMcpExecuteBody.test.ts server.ts
git commit -m "fix(api): 400 for invalid mcp execute body; safe workflowId handling"
```

---

### Task 5: `normalizeToolResponse` — no default `files` when missing/invalid

**Files:**

- Modify: `src/features/tools/server/normalizeToolResponse.ts`
- Modify: `src/features/tools/server/normalizeToolResponse.test.ts`
- Call sites: `server.ts` (mock path for tools — may use a **separate** builder that injects `DEFAULT_TOOL_FILES` **without** going through `normalizeToolResponse` if you want 100% separation; see below)

- [ ] **Step 1: Failing test** — add to `normalizeToolResponse.test.ts`:

```ts
it("throws when files is missing (no silent default map)", () => {
  expect(() =>
    normalizeToolResponse({
      name: "X",
      description: "Y",
    }),
  ).toThrow("files");
});

it("throws when files is not a string map", () => {
  expect(() =>
    normalizeToolResponse({
      name: "X",
      description: "Y",
      files: "nope" as unknown as Record<string, string>,
    }),
  ).toThrow();
});
```

Run: `npx vitest run src/features/tools/server/normalizeToolResponse.test.ts`  
Expected: **FAIL** while implementation still uses `DEFAULT_TOOL_FILES` for invalid input.

- [ ] **Step 2: Replace implementation** — if `!isToolFileMap(record.files)` **throw** `Error('Tool response must include a "files" object of path → source strings.')` — do **not** copy `DEFAULT_TOOL_FILES` in this function.

- [ ] **Step 3: For `server.ts` mock** when `!apiKey` and demo allowed, either:

- Build the mock object with explicit `files` that already satisfy `isToolFileMap` and then call `normalizeToolResponse` (it will not substitute), or  
- **Do not** use `normalizeToolResponse` for mock and return a hand-built `GenerateToolResponse` + `simulation: true` in the **route** (cleanest separation: normalizer = **strict live model only**).

- [ ] **Step 4: `npm run test`**

- [ ] **Step 5: Commit**

```bash
git add src/features/tools/server/normalizeToolResponse.ts src/features/tools/server/normalizeToolResponse.test.ts server.ts
git commit -m "fix(tools): fail closed when model omits or corrupts files map"
```

---

## Self-review (author checklist)

- **Spec coverage:** Each P0 from your list maps to a Task (2–3 for mcp+UI, 4 for execute, 5 for normalizer, 1 for flag).
- **Placeholders:** No TBD; env name and code samples are explicit.
- **Type consistency:** `simulation` as boolean in JSON; `error` strings fixed for curl checks.

**Gap:** The live `/api/mcp/generate` response still has **simplified** `inputs`/`steps` — a future plan should plumb n8n tool output into those fields; not part of P0.

---

**Plan complete and saved to** `docs/superpowers/plans/2026-04-24-api-mock-signal-skill-prereqs.md`. **Two execution options:**

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration  
2. **Inline execution** — Execute tasks in this session in order with checkpoints after each commit  

**Which approach?**

**If Subagent-Driven is chosen:** REQUIRED sub-skill: `superpowers:subagent-driven-development` (fresh subagent per task + two-stage review).  

**If Inline is chosen:** REQUIRED sub-skill: `superpowers:executing-plans` (batched with checkpoints).
