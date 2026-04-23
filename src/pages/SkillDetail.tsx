import { useParams, Link } from 'react-router-dom';
import { useSkills } from '../context/SkillContext';
import { Play, Copy, ArrowLeft, GripVertical, FileText, Database, Send, Zap, Bot, Mail } from 'lucide-react';
import { cn } from '../lib/utils';
import { SkillStep } from '../types';

export function SkillDetail() {
  const { id } = useParams();
  const { getSkill } = useSkills();
  const skill = getSkill(id || '');

  if (!skill) return <div className="p-10 text-center">Skill not found</div>;

  const getStepIcon = (type: string) => {
    switch(type) {
      case 'file_input': return <FileText size={20} />;
      case 'trigger': return <Zap size={20} />;
      case 'transform': return <Database size={20} />;
      case 'ai': return <Bot size={20} />;
      case 'api_call': return <Send size={20} />;
      case 'output': return <Mail size={20} />;
      default: return <GripVertical size={20} />;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <Link to="/" className="inline-flex items-center gap-1 text-sm font-medium text-on-surface-variant hover:text-primary mb-4 transition-colors">
            <ArrowLeft size={16} /> Back to Library
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-on-surface">{skill.name}</h1>
            <span className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                skill.status === 'active' ? "bg-primary-container text-on-primary-container" : "bg-outline-variant text-on-surface-variant"
              )}>
              {skill.status}
            </span>
          </div>
          <p className="text-lg text-on-surface-variant max-w-2xl">{skill.description}</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-3 shrink-0">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container font-medium transition-colors">
            <Copy size={18} /> <span className="hidden sm:inline">Copy link</span>
          </button>
          <Link to={`/skill/${skill.id}/run`} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#39b8fd] to-[#630ed4] text-white hover:opacity-90 font-semibold shadow-md transition-all">
            <Play size={18} className="fill-current" /> Run skill
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Workflow Sequence */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <h2 className="text-xl font-bold text-on-surface border-b border-surface-variant pb-2">Workflow Sequence</h2>
          
          <div className="relative flex flex-col gap-4 pl-4 border-l-2 border-dashed border-primary/30 py-2">
            {skill.steps.map((step: SkillStep, index) => (
              <div key={step.id} className="relative z-10 flex gap-4 bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-variant group hover:-translate-y-0.5 transition-transform ml-4">
                
                {/* Connecting node */}
                <div className="absolute -left-[27px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary ring-4 ring-surface" />

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-container text-primary">
                  {getStepIcon(step.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">{step.type.replace('_', ' ')}</span>
                    <GripVertical size={16} className="text-outline opacity-30" />
                  </div>
                  <h3 className="text-base font-semibold text-on-surface">{step.label}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-surface-container-lowest rounded-xl p-5 border border-surface-variant shadow-sm">
            <h3 className="text-lg font-bold text-on-surface mb-4 border-b border-surface-variant pb-2">Configuration Details</h3>
            
            <div className="space-y-4">
              <div>
                <span className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Owner</span>
                <p className="text-sm font-medium text-on-surface">{skill.owner}</p>
              </div>
              
              <div>
                <span className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Tags</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {skill.tags.map(tag => (
                    <span key={tag} className="bg-surface-container px-2 py-1 rounded text-xs font-medium text-on-surface">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Shared With</span>
                <p className="text-sm font-medium text-on-surface">{skill.sharedWith.join(', ')}</p>
              </div>

              <div>
                <span className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Required Inputs</span>
                <ul className="text-sm space-y-2">
                  {skill.inputs.map(inp => (
                    <li key={inp.key} className="flex flex-col rounded-md border border-outline-variant/30 bg-surface px-3 py-2">
                      <span className="font-semibold text-on-surface">{inp.label}</span>
                      <span className="text-xs text-on-surface-variant font-mono">{inp.type} • {inp.required ? 'Required' : 'Optional'}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Usage</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-primary">{skill.runs}</span>
                  <span className="text-sm text-on-surface-variant font-medium">total runs</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
