import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { Skill } from '../types';
import { mockSkills } from '../data/mockData';
import { fetchPersistedSkills, upsertPersistedSkill } from '../lib/skillsApi';

interface SkillContextType {
  skills: Skill[];
  loading: boolean;
  addSkill: (skill: Skill) => Promise<Skill>;
  getSkill: (id: string) => Skill | undefined;
}

const SkillContext = createContext<SkillContextType | undefined>(undefined);

function mergeSkills(persisted: Skill[], fallback: Skill[]) {
  const persistedIds = new Set(persisted.map((skill) => skill.id));
  return [...persisted, ...fallback.filter((skill) => !persistedIds.has(skill.id))];
}

export function SkillProvider({ children }: { children: ReactNode }) {
  const [persistedSkills, setPersistedSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadSkills() {
      try {
        const storedSkills = await fetchPersistedSkills();
        if (active) {
          setPersistedSkills(storedSkills);
        }
      } catch (error) {
        console.error('Failed to load persisted skills:', error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadSkills();

    return () => {
      active = false;
    };
  }, []);

  const skills = useMemo(() => mergeSkills(persistedSkills, mockSkills), [persistedSkills]);

  const addSkill = async (skill: Skill) => {
    const saved = await upsertPersistedSkill(skill);
    setPersistedSkills((prev) => [saved, ...prev.filter((entry) => entry.id !== saved.id)]);
    return saved;
  };

  const getSkill = (id: string) => {
    return skills.find(s => s.id === id);
  };

  return (
    <SkillContext.Provider value={{ skills, loading, addSkill, getSkill }}>
      {children}
    </SkillContext.Provider>
  );
}

export function useSkills() {
  const context = useContext(SkillContext);
  if (context === undefined) {
    throw new Error('useSkills must be used within a SkillProvider');
  }
  return context;
}
