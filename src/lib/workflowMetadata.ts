import type {
  Skill,
  SkillInput,
  SkillStep,
  SkillStepType,
  WorkflowEdgeViewModel,
  WorkflowGraph,
  WorkflowNodeViewModel,
} from "@/src/types";

export type WorkflowCreationResult = {
  workflowId: string;
  name?: string;
  url?: string;
};

export type WorkflowExecutionResult = {
  executionId: string | null;
  status: "started" | "error";
  error?: string;
};

type RecordLike = Record<string, unknown>;

interface N8nConnectionRef {
  node?: string;
  type?: string;
  index?: number;
}

interface N8nWorkflowNode {
  id?: string;
  name?: string;
  type?: string;
  position?: unknown;
  parameters?: RecordLike;
}

interface N8nWorkflowPayload {
  id?: string;
  name?: string;
  description?: string;
  nodes?: N8nWorkflowNode[];
  connections?: Record<string, Record<string, unknown>>;
}

export interface NormalizedWorkflowSkillOptions {
  prompt: string;
  owner?: string;
  workflowUrl?: string;
}

function asRecord(value: unknown): RecordLike | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as RecordLike)
    : null;
}

function parseJsonString<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function unwrapStructuredContent(value: unknown): unknown {
  const record = asRecord(value);
  if (!record) {
    return value;
  }

  for (const key of ["structuredContent", "result", "data"]) {
    const nested = record[key];
    if (nested !== undefined) {
      const unwrapped = unwrapStructuredContent(nested);
      if (unwrapped !== nested || key === "structuredContent") {
        return unwrapped;
      }
    }
  }

  if (Array.isArray(record.content)) {
    for (const item of record.content) {
      const itemRecord = asRecord(item);
      const text = typeof itemRecord?.text === "string" ? itemRecord.text : undefined;
      if (!text) {
        continue;
      }
      const parsed = parseJsonString<unknown>(text);
      if (parsed !== null) {
        return unwrapStructuredContent(parsed);
      }
    }
  }

  return value;
}

function mapNodeTypeToStepType(technicalType: string): SkillStepType {
  if (technicalType.includes("webhook") || technicalType.includes("trigger")) {
    return "trigger";
  }
  if (technicalType.includes("httpRequest")) {
    return "api_call";
  }
  if (technicalType.includes("respondToWebhook")) {
    return "output";
  }
  if (technicalType.includes("openAi") || technicalType.includes("anthropic") || technicalType.includes("langchain")) {
    return "ai";
  }
  if (technicalType.includes(".set") || technicalType.includes(".code") || technicalType.includes(".switch") || technicalType.endsWith(".if")) {
    return "transform";
  }
  return "tool";
}

function buildNodeDetail(node: N8nWorkflowNode): string | undefined {
  const parameters = asRecord(node.parameters);
  if (!parameters) {
    return undefined;
  }

  if (typeof parameters.path === "string" && typeof parameters.httpMethod === "string") {
    return `${parameters.httpMethod} /${parameters.path}`;
  }
  if (typeof parameters.operation === "string" && typeof parameters.resource === "string") {
    return `${parameters.resource}.${parameters.operation}`;
  }
  if (typeof parameters.mode === "string") {
    return `mode: ${parameters.mode}`;
  }
  if (typeof parameters.respondWith === "string") {
    return `respond: ${parameters.respondWith}`;
  }
  return undefined;
}

function normalizeNode(node: N8nWorkflowNode): WorkflowNodeViewModel | null {
  if (typeof node.id !== "string" || typeof node.name !== "string" || typeof node.type !== "string") {
    return null;
  }

  const position = Array.isArray(node.position) && node.position.length >= 2
    ? {
        x: typeof node.position[0] === "number" ? node.position[0] : 0,
        y: typeof node.position[1] === "number" ? node.position[1] : 0,
      }
    : undefined;

  return {
    id: node.id,
    label: node.name,
    type: mapNodeTypeToStepType(node.type),
    technicalType: node.type,
    position,
    detail: buildNodeDetail(node),
  };
}

function buildEdgeLabel(streamName: string, outputIndex: number, sourceType: string): string | undefined {
  if (sourceType.endsWith(".if")) {
    return outputIndex === 0 ? "true" : outputIndex === 1 ? "false" : `branch ${outputIndex + 1}`;
  }
  if (sourceType.endsWith(".switch")) {
    return `case ${outputIndex + 1}`;
  }
  if (streamName !== "main") {
    return `${streamName} ${outputIndex + 1}`;
  }
  if (outputIndex > 0) {
    return `output ${outputIndex + 1}`;
  }
  return undefined;
}

function normalizeEdges(payload: N8nWorkflowPayload, nodes: WorkflowNodeViewModel[]): WorkflowEdgeViewModel[] {
  const nodeIdByName = new Map(nodes.map((node) => [node.label, node.id]));
  const technicalTypeByName = new Map(nodes.map((node) => [node.label, node.technicalType]));
  const edges: WorkflowEdgeViewModel[] = [];
  const connections = payload.connections ?? {};

  for (const [sourceName, streams] of Object.entries(connections)) {
    const sourceNodeId = nodeIdByName.get(sourceName);
    if (!sourceNodeId) {
      continue;
    }

    for (const [streamName, outputs] of Object.entries(streams)) {
      if (!Array.isArray(outputs)) {
        continue;
      }

      outputs.forEach((outputGroup, outputIndex) => {
        if (!Array.isArray(outputGroup)) {
          return;
        }

        outputGroup.forEach((connection, connectionIndex) => {
          const ref = asRecord(connection) as N8nConnectionRef | null;
          if (!ref || typeof ref.node !== "string") {
            return;
          }

          const targetNodeId = nodeIdByName.get(ref.node);
          if (!targetNodeId) {
            return;
          }

          edges.push({
            id: `${sourceNodeId}:${streamName}:${outputIndex}:${connectionIndex}:${targetNodeId}`,
            sourceNodeId,
            targetNodeId,
            label: buildEdgeLabel(streamName, outputIndex, technicalTypeByName.get(sourceName) ?? ""),
          });
        });
      });
    }
  }

  return edges;
}

function deriveWorkflowUrl(explicitUrl: string | undefined, workflowId: string): string | undefined {
  if (explicitUrl) {
    return explicitUrl;
  }

  const mcpUrl = process.env.N8N_MCP_SERVER_URL;
  if (!mcpUrl) {
    return undefined;
  }

  try {
    const parsed = new URL(mcpUrl);
    return `${parsed.origin}/workflow/${workflowId}`;
  } catch {
    return undefined;
  }
}

function deriveInputs(payload: N8nWorkflowPayload): SkillInput[] {
  const webhookNode = (payload.nodes ?? []).find((node) => typeof node.type === "string" && node.type.includes("webhook"));
  const parameters = asRecord(webhookNode?.parameters);
  const path = typeof parameters?.path === "string" ? parameters.path : undefined;

  return [
    {
      key: "input_data",
      label: path ? `Webhook Payload (${path})` : "Workflow Input",
      type: "textarea",
      required: true,
      placeholder: "Provide the data this workflow should process",
    },
  ];
}

export function extractWorkflowIdFromText(text: string): string | undefined {
  const directMatch = text.match(/\bworkflowId\b["'\s:=-]*([A-Za-z0-9_-]+)/i);
  if (directMatch?.[1]) {
    return directMatch[1];
  }

  const urlMatch = text.match(/\/workflow\/([A-Za-z0-9_-]+)/);
  return urlMatch?.[1];
}

export function extractWorkflowCreationResult(value: unknown): WorkflowCreationResult | null {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  if (typeof record.workflowId === "string" && record.workflowId.trim()) {
    return {
      workflowId: record.workflowId,
      name: typeof record.name === "string" ? record.name : undefined,
      url: typeof record.url === "string" ? record.url : undefined,
    };
  }

  for (const nestedKey of ["result", "structuredContent", "data"]) {
    const nested = extractWorkflowCreationResult(record[nestedKey]);
    if (nested) {
      return nested;
    }
  }

  if (Array.isArray(record.content)) {
    for (const item of record.content) {
      const contentRecord = asRecord(item);
      const text = typeof contentRecord?.text === "string" ? contentRecord.text : undefined;
      if (!text) {
        continue;
      }

      const workflowId = extractWorkflowIdFromText(text);
      if (workflowId) {
        const urlMatch = text.match(/https?:\/\/\S+\/workflow\/[A-Za-z0-9_-]+/);
        return {
          workflowId,
          name: typeof record.name === "string" ? record.name : undefined,
          url: urlMatch?.[0],
        };
      }
    }
  }

  const serialized = JSON.stringify(value);
  const workflowId = extractWorkflowIdFromText(serialized);
  if (!workflowId) {
    return null;
  }

  const urlMatch = serialized.match(/https?:\/\/[^"\\]+\/workflow\/[A-Za-z0-9_-]+/);
  return {
    workflowId,
    name: typeof record.name === "string" ? record.name : undefined,
    url: urlMatch?.[0],
  };
}

export function extractWorkflowExecutionResult(value: unknown): WorkflowExecutionResult | null {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  if (
    (typeof record.executionId === "string" || record.executionId === null) &&
    (record.status === "started" || record.status === "error")
  ) {
    return {
      executionId: record.executionId as string | null,
      status: record.status as "started" | "error",
      error: typeof record.error === "string" ? record.error : undefined,
    };
  }

  for (const nestedKey of ["result", "structuredContent", "data"]) {
    const nested = extractWorkflowExecutionResult(record[nestedKey]);
    if (nested) {
      return nested;
    }
  }

  if (Array.isArray(record.content)) {
    for (const item of record.content) {
      const contentRecord = asRecord(item);
      const text = typeof contentRecord?.text === "string" ? contentRecord.text : undefined;
      if (!text) {
        continue;
      }

      const parsed = parseJsonString<unknown>(text);
      if (parsed === null) {
        continue;
      }

      const nested = extractWorkflowExecutionResult(parsed);
      if (nested) {
        return nested;
      }
    }
  }

  return null;
}

export function normalizeWorkflowSkill(
  detailsPayload: unknown,
  options: NormalizedWorkflowSkillOptions,
): Skill {
  const unwrapped = unwrapStructuredContent(detailsPayload);
  const root = asRecord(unwrapped);
  const workflowRecord = asRecord(root?.workflow);

  if (!workflowRecord || typeof workflowRecord.id !== "string") {
    throw new Error("get_workflow_details did not return a workflow object with an id.");
  }

  const payload = workflowRecord as unknown as N8nWorkflowPayload;
  const normalizedNodes = (payload.nodes ?? [])
    .map(normalizeNode)
    .filter((node): node is WorkflowNodeViewModel => node !== null);

  if (normalizedNodes.length === 0) {
    throw new Error("Workflow details did not include renderable nodes.");
  }

  const workflow: WorkflowGraph = {
    id: payload.id ?? workflowRecord.id,
    url: deriveWorkflowUrl(options.workflowUrl, workflowRecord.id),
    source: "n8n",
    nodes: normalizedNodes,
    edges: normalizeEdges(payload, normalizedNodes),
  };

  const steps: SkillStep[] = normalizedNodes.map((node, index) => ({
    id: node.id || String(index + 1),
    label: node.label,
    type: node.type,
  }));

  const name = typeof payload.name === "string" && payload.name.trim()
    ? payload.name
    : `Generated Workflow ${workflow.id}`;
  const description = typeof payload.description === "string" && payload.description.trim()
    ? payload.description
    : options.prompt;

  return {
    id: `skill_${workflow.id}`,
    name,
    description,
    owner: options.owner ?? "M. Tinti",
    tags: ["n8n", "Automation"],
    pattern: "custom",
    sharedWith: ["My Team"],
    inputs: deriveInputs(payload),
    steps,
    outputDescription: `Output generated by workflow ${name}.`,
    status: "draft",
    runs: 0,
    n8nWorkflowId: workflow.id,
    workflow,
  };
}
