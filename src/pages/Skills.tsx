import { Link } from 'react-router-dom';
import { useSkills } from '../context/SkillContext';
import { Play, Tag, Users, Zap, Trophy, Medal, Star } from 'lucide-react';
import { cn } from '../lib/utils';

export function Skills() {
  const { skills } = useSkills();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <section className="mb-12 text-center md:text-left md:flex items-center justify-between">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-on-surface mb-2">Turn repeated work into reusable skills</h1>
          <p className="text-lg text-on-surface-variant">Create once. Share with your team. Run anytime.</p>
        </div>
        <div className="mt-6 md:mt-0">
          <Link
            to="/create"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-on-primary shadow-lg shadow-primary/30 hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all"
          >
            <Zap size={18} className="fill-current" />
            Create Skill
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-on-surface">Skill Library</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-on-surface-variant font-medium">Filter by:</span>
              <select className="text-sm rounded-md border border-outline-variant bg-surface-container-lowest py-1 pl-2 pr-8 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                <option>All Teams</option>
                <option>Engineering</option>
                <option>Product</option>
                <option>Marketing</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skills.map((skill) => (
              <div 
                key={skill.id} 
                className="group relative flex flex-col rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 hover:border-primary/40 hover:shadow-xl ring-1 ring-transparent hover:ring-primary/10 transition-all cursor-pointer overflow-hidden"
              >
                {/* Accent bar */}
                <div className={cn(
                  "absolute left-0 top-0 bottom-0 w-1",
                  skill.runs === 0 ? "bg-surface-variant" : "bg-primary/20"
                )} />
                
                <div className="flex pl-3 items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center">
                    <Zap size={20} className="text-primary" />
                  </div>
                  <span className={cn(
                    "px-2 py-1 rounded text-[10px] font-bold uppercase",
                    skill.status === 'active' ? "bg-green-50 text-green-700" : "bg-surface-container text-on-surface-variant"
                  )}>
                    {skill.status}
                  </span>
                </div>
                
                <h4 className="pl-3 font-bold text-on-surface mb-1 group-hover:text-primary transition-colors">
                  {skill.name}
                </h4>
                <p className="pl-3 text-xs text-on-surface-variant mb-4 line-clamp-2">
                  {skill.description}
                </p>
                
                <div className="mt-auto pl-3 pt-4 border-t border-surface flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-surface-container-high"></div>
                    <span className="text-[11px] text-on-surface-variant">{skill.owner}</span>
                  </div>
                  <span className="text-[11px] font-bold text-on-surface">{skill.runs} Runs</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gamification column */}
        <div className="lg:col-span-1 border border-outline-variant bg-surface-container-lowest rounded-2xl p-6 flex flex-col gap-8">
          <div>
            <h3 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">Top Contributors</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold">AC</div>
                  <div>
                    <p className="text-xs font-bold text-on-surface">Alex Carter</p>
                    <p className="text-[10px] text-on-surface-variant">8,450 XP</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-primary">#1</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">SJ</div>
                  <div>
                    <p className="text-xs font-bold text-on-surface">Sarah Jenkins</p>
                    <p className="text-[10px] text-on-surface-variant">6,200 XP</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant">#2</span>
              </div>
            </div>
          </div>
          
          <div className="mt-auto p-4 bg-background rounded-xl border border-dashed border-outline-variant">
            <div className="flex items-center gap-2 mb-2">
              <Trophy size={16} className="text-tertiary" />
              <span className="text-[11px] font-bold text-on-surface-variant uppercase">ClapStreak</span>
            </div>
            <p className="text-xs text-on-surface-variant">Create 2 more skills this week to earn the <span className="font-bold">Efficiency Master</span> badge.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable icon locally
function UserCircle({ size = 24 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
  );
}
