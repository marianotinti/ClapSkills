import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';

import { describe, expect, it } from 'vitest';

import { getPersistedSkill, listPersistedSkills, upsertPersistedSkill } from './skillStore';
import type { Skill } from '../types';

function buildSkill(id: string): Skill {
  return {
    id,
    name: `Skill ${id}`,
    description: 'Persisted skill',
    owner: 'M. Tinti',
    tags: ['n8n'],
    pattern: 'custom',
    sharedWith: ['My Team'],
    inputs: [{ key: 'input_data', label: 'Workflow Input', type: 'textarea', required: true }],
    steps: [{ id: '1', label: 'Receive Request', type: 'trigger' }],
    outputDescription: 'Output',
    status: 'draft',
    runs: 0,
    n8nWorkflowId: `wf_${id}`,
    workflow: {
      id: `wf_${id}`,
      source: 'n8n',
      nodes: [{ id: 'node_1', label: 'Receive Request', type: 'trigger', technicalType: 'n8n-nodes-base.webhook' }],
      edges: [],
    },
  };
}

describe('skillStore', () => {
  it('creates and upserts persisted skills into a JSON file', async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'clapskills-store-'));
    const filePath = path.join(tempDir, 'skills.json');

    const first = await upsertPersistedSkill(buildSkill('1'), filePath);
    expect(first.id).toBe('1');

    const updated = await upsertPersistedSkill({ ...buildSkill('1'), status: 'active' }, filePath);
    expect(updated.status).toBe('active');

    const skills = await listPersistedSkills(filePath);
    expect(skills).toHaveLength(1);
    expect(skills[0].status).toBe('active');

    const stored = await getPersistedSkill('1', filePath);
    expect(stored?.n8nWorkflowId).toBe('wf_1');
  });
});
