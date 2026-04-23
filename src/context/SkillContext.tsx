import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Skill } from '../types';
import { mockSkills } from '../data/mockData';

interface SkillContextType {
  skills: Skill[];
  addSkill: (skill: Skill) => void;
  getSkill: (id: string) => Skill | undefined;
}

const SkillContext = createContext<SkillContextType | undefined>(undefined);

export function SkillProvider({ children }: { children: ReactNode }) {
  const [skills, setSkills] = useState<Skill[]>(mockSkills);

  const addSkill = (skill: Skill) => {
    setSkills((prev) => [skill, ...prev]);
  };

  const getSkill = (id: string) => {
    return skills.find(s => s.id === id);
  };

  return (
    <SkillContext.Provider value={{ skills, addSkill, getSkill }}>
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
