import type { Skill } from '../types';

interface SkillsResponse {
  skills: Skill[];
}

interface SkillResponse {
  skill: Skill;
}

export async function fetchPersistedSkills(): Promise<Skill[]> {
  const response = await fetch('/api/skills');
  if (!response.ok) {
    throw new Error(`Failed to fetch skills. HTTP ${response.status}`);
  }

  const data = (await response.json()) as SkillsResponse;
  return data.skills;
}

export async function upsertPersistedSkill(skill: Skill): Promise<Skill> {
  const response = await fetch('/api/skills', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ skill }),
  });

  if (!response.ok) {
    throw new Error(`Failed to save skill. HTTP ${response.status}`);
  }

  const data = (await response.json()) as SkillResponse;
  return data.skill;
}
