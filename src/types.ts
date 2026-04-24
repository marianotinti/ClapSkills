export type SkillInputType = 'text' | 'file' | 'select' | 'textarea';

export interface SkillInput {
  key: string;
  label: string;
  type: SkillInputType;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export type SkillStepType = 'trigger' | 'file_input' | 'transform' | 'ai' | 'api_call' | 'approval' | 'output' | 'tool';

export interface SkillStep {
  id: string;
  label: string;
  type: SkillStepType;
}

export interface WorkflowNodeViewModel {
  id: string;
  label: string;
  type: SkillStepType;
  technicalType: string;
  position?: {
    x: number;
    y: number;
  };
  detail?: string;
}

export interface WorkflowEdgeViewModel {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  label?: string;
}

export interface WorkflowGraph {
  id: string;
  url?: string;
  source: 'n8n' | 'mock';
  nodes: WorkflowNodeViewModel[];
  edges: WorkflowEdgeViewModel[];
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  owner: string;
  tags: string[];
  pattern: string;
  sharedWith: string[];
  inputs: SkillInput[];
  steps: SkillStep[];
  outputDescription: string;
  status: 'draft' | 'active';
  runs: number;
  n8nWebhookUrl?: string;
  n8nWorkflowId?: string;
  workflow?: WorkflowGraph;
}

export interface Execution {
  id: string;
  skillId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  startedAt: string;
  finishedAt?: string;
  resultSummary?: string;
  logs: string[];
}
