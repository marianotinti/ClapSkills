import { describe, expect, it } from 'vitest';

import {
  extractWorkflowExecutionResult,
  normalizeWorkflowSkill,
} from './workflowMetadata';

const detailsPayload = {
  structuredContent: {
    workflow: {
      id: 'wf_123',
      name: 'Test Workflow',
      description: 'A workflow imported from n8n',
      nodes: [
        {
          id: 'node_1',
          name: 'Receive Request',
          type: 'n8n-nodes-base.webhook',
          position: [240, 300],
          parameters: {
            path: 'support-ticket',
            httpMethod: 'POST',
          },
        },
        {
          id: 'node_2',
          name: 'Classify',
          type: '@n8n/n8n-nodes-langchain.openAi',
          position: [540, 300],
          parameters: {
            resource: 'text',
            operation: 'response',
          },
        },
        {
          id: 'node_3',
          name: 'Respond',
          type: 'n8n-nodes-base.respondToWebhook',
          position: [840, 300],
          parameters: {
            respondWith: 'json',
          },
        },
      ],
      connections: {
        'Receive Request': {
          main: [[{ node: 'Classify', type: 'main', index: 0 }]],
        },
        Classify: {
          main: [[{ node: 'Respond', type: 'main', index: 0 }]],
        },
      },
    },
  },
};

describe('normalizeWorkflowSkill', () => {
  it('maps workflow details into a persisted skill with nodes and edges', () => {
    const skill = normalizeWorkflowSkill(detailsPayload, {
      prompt: 'Triages support requests',
      workflowUrl: 'https://example.com/workflow/wf_123',
    });

    expect(skill.id).toBe('skill_wf_123');
    expect(skill.n8nWorkflowId).toBe('wf_123');
    expect(skill.workflow?.nodes).toHaveLength(3);
    expect(skill.workflow?.edges).toHaveLength(2);
    expect(skill.workflow?.url).toBe('https://example.com/workflow/wf_123');
    expect(skill.steps.map((step) => step.label)).toEqual([
      'Receive Request',
      'Classify',
      'Respond',
    ]);
    expect(skill.inputs[0].type).toBe('textarea');
  });
});

describe('extractWorkflowExecutionResult', () => {
  it('reads execution result from structuredContent', () => {
    expect(
      extractWorkflowExecutionResult({
        structuredContent: {
          executionId: '42',
          status: 'started',
        },
      }),
    ).toEqual({
      executionId: '42',
      status: 'started',
      error: undefined,
    });
  });

  it('parses execution result from string content when needed', () => {
    expect(
      extractWorkflowExecutionResult({
        content: [
          {
            type: 'text',
            text: '{"executionId":"7","status":"error","error":"boom"}',
          },
        ],
      }),
    ).toEqual({
      executionId: '7',
      status: 'error',
      error: 'boom',
    });
  });
});
