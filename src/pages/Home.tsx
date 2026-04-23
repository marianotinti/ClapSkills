import { Link } from 'react-router-dom';
import { useSkills } from '../context/SkillContext';
import { Search, Rocket, Zap, ArrowRight, Play } from 'lucide-react';

export function Home() {
  const { skills } = useSkills();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Search Section */}
      <section>
        <div className="relative max-w-2xl mx-auto flex items-center">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search Skills, Workflows and Automations..." 
            className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm focus:border-primary/40 ring-4 ring-transparent focus:ring-primary/10 transition-all font-medium text-on-surface outline-none"
          />
          <span className="absolute right-4 px-2 py-1 bg-surface-container rounded text-xs font-bold text-on-surface-variant border border-outline-variant/50">⌘K</span>
        </div>
      </section>

      {/* Hero CTA */}
      <section>
        <div className="bg-gradient-to-r from-primary-container to-primary/10 border border-primary/20 rounded-3xl p-8 md:p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-lg shadow-primary/30">
                <Rocket size={20} className="fill-current" />
              </div>
              <h2 className="text-2xl font-bold text-on-surface">Automate your workflow</h2>
            </div>
            <p className="text-on-surface-variant font-medium text-lg ml-1">Create a new skill from plain text in minutes. No coding required.</p>
          </div>
          <Link 
            to="/create" 
            className="relative z-10 w-full md:w-auto bg-primary text-on-primary hover:bg-primary/90 font-semibold px-8 py-4 rounded-xl transition-all shadow-xl shadow-primary/20 hover:shadow-primary/40 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            Start Building <ArrowRight size={18} />
          </Link>
          
          {/* Decorative shapes */}
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-32 h-32 bg-primary-container rounded-full blur-2xl pointer-events-none" />
        </div>
      </section>

      {/* Top Skills */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-on-surface">Top 10 Company Skills</h2>
          <Link to="/skills" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">View Library</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {skills.slice(0, 3).map((skill, idx) => (
            <Link to={`/skill/${skill.id}`} key={skill.id} className="group bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant hover:border-primary/40 hover:shadow-xl ring-1 ring-transparent hover:ring-primary/10 transition-all cursor-pointer relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 bg-secondary text-on-secondary text-xs font-bold px-3 py-1.5 rounded-bl-xl shadow-sm z-10">#{idx + 1}</div>
              
              <div className="flex items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary-container text-primary flex items-center justify-center">
                  <Zap size={24} className="fill-current" />
                </div>
              </div>
              <h3 className="font-bold text-on-surface text-lg mb-1 group-hover:text-primary transition-colors">{skill.name}</h3>
              <p className="text-sm text-on-surface-variant mb-6 line-clamp-2 leading-relaxed">{skill.description}</p>
              
              <div className="mt-auto pt-4 border-t border-surface flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-on-surface">{skill.runs} Runs</span>
                </div>
                <div className="flex items-center gap-1 text-primary text-xs font-bold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                  Open <Play size={12} className="fill-current" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Automations */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-on-surface">Recent Automations</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 z-10">
          {skills.slice(1, 3).map(skill => (
            <div key={skill.id} className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant shadow-sm flex flex-col sm:flex-row gap-5 items-start sm:items-center relative overflow-hidden group hover:border-outline transition-colors">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary rounded-l-2xl" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-surface-container-high text-xs font-bold flex items-center justify-center text-on-surface-variant">
                    {skill.owner.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-on-surface-variant">Shared by {skill.owner}</span>
                </div>
                <h3 className="font-bold text-on-surface text-lg truncate mb-2">{skill.name}</h3>
                <div className="flex gap-2">
                  {skill.tags.map(t => (
                    <span key={t} className="text-[10px] font-bold bg-surface-container text-on-surface border border-outline-variant/50 px-2 py-1 rounded-md uppercase tracking-wider">{t}</span>
                  ))}
                </div>
              </div>
              <Link to={`/skill/${skill.id}`} className="w-full sm:w-auto bg-surface-container-low hover:bg-primary hover:text-on-primary text-on-surface font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
                <Play size={16} className="fill-current" /> Execute
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
