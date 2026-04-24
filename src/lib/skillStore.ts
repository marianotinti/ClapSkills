import { promises as fs } from "fs";
import path from "path";

import type { Skill } from "@/src/types";

export const DEFAULT_SKILL_STORE_PATH = path.join(process.cwd(), "data", "skills.json");

async function ensureStore(filePath: string) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, "[]\n", "utf8");
  }
}

export async function listPersistedSkills(filePath = DEFAULT_SKILL_STORE_PATH): Promise<Skill[]> {
  await ensureStore(filePath);
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(raw) as unknown;
  return Array.isArray(parsed) ? (parsed as Skill[]) : [];
}

export async function getPersistedSkill(id: string, filePath = DEFAULT_SKILL_STORE_PATH): Promise<Skill | undefined> {
  const skills = await listPersistedSkills(filePath);
  return skills.find((skill) => skill.id === id);
}

export async function upsertPersistedSkill(skill: Skill, filePath = DEFAULT_SKILL_STORE_PATH): Promise<Skill> {
  const skills = await listPersistedSkills(filePath);
  const next = skills.filter((entry) => entry.id !== skill.id);
  next.unshift(skill);
  await fs.writeFile(filePath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  return skill;
}
