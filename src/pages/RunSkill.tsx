import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSkills } from '../context/SkillContext';
import { motion } from 'motion/react';
import { Play, ArrowLeft, CheckCircle2, CircleDashed, FileTerminal, Download, ExternalLink } from 'lucide-react';
import { Execution } from '../types';

export function RunSkill() {
  const { id } = useParams();
  const { getSkill } = useSkills();
  const skill = getSkill(id || '');

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [execution, setExecution] = useState<Execution | null>(null);
  const [simulatedProgress, setSimulatedProgress] = useState(0);

  if (!skill) return <div className="p-10 text-center">Skill not found</div>;

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleExecute = async () => {
    // Basic validation
    const missing = skill.inputs.filter(i => i.required && !formData[i.key]);
    if (missing.length > 0) return alert('Please fill required fields.');

    setExecution({
      id: `exec_${Date.now()}`,
      skillId: skill.id,
      status: 'running',
      startedAt: new Date().toISOString(),
      logs: ['Initialized execution environment...', 'Validated inputs perfectly.', 'Connecting to integration backend...']
    });

    const executeUrl = skill.n8nWebhookUrl || import.meta.env.VITE_N8N_EXECUTE_WEBHOOK_URL;
    const mcpWorkflowId = skill.n8nWorkflowId;

    try {
      if (mcpWorkflowId) {
        setExecution(prev => prev && { ...prev, logs: [...prev.logs, `Triggering workflow ${mcpWorkflowId} via MCP...`] });
        let progress = 0.1;
        const fallbackInterval = setInterval(() => {
          progress = Math.min(progress + 0.1, 0.9);
          setSimulatedProgress(progress);
        }, 1000);

        const response = await fetch('/api/mcp/execute', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ workflowId: mcpWorkflowId, inputs: formData })
        });
        
        clearInterval(fallbackInterval);
        setSimulatedProgress(1);

        if (!response.ok) {
           throw new Error(`MCP execution failed: ${response.status}`);
        }

        const data = await response.json();
        setExecution(prev => prev && {
          ...prev,
          status: data.status === 'error' ? 'failed' : 'completed',
          finishedAt: new Date().toISOString(),
          resultSummary: data.status === 'error' ? 'Workflow error' : `Execution ID: ${data.executionId}`,
          logs: [...prev.logs, `Workflow executed seamlessly!`, `Execution ID: ${data.executionId}`]
        });

      } else if (executeUrl) {
        // We have an n8n endpoint for execution
        setExecution(prev => prev && { ...prev, logs: [...prev.logs, `Sending data to n8n webhook: ${executeUrl}`] });
        
        // Simulating the progress bar moving while waiting for fetch
        let progress = 0.1;
        const fallbackInterval = setInterval(() => {
          progress = Math.min(progress + 0.1, 0.9);
          setSimulatedProgress(progress);
        }, 1000);

        const response = await fetch(executeUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skillId: skill.id, formData })
        });

        clearInterval(fallbackInterval);
        setSimulatedProgress(1);

        if (!response.ok) {
          throw new Error(`n8n webhook failed with status: ${response.status}`);
        }

        const data = await response.json();
        
        setExecution(prev => prev && {
          ...prev,
          status: 'completed',
          finishedAt: new Date().toISOString(),
          logs: [...prev.logs, 'Received payload from n8n.', 'Execution finished successfully.'],
          resultSummary: data.result || JSON.stringify(data, null, 2)
        });

      } else {
        // Fallback simulation
        let currentStep = 0;
        const totalSteps = skill.steps.length;

        const interval = setInterval(() => {
          currentStep++;
          setSimulatedProgress(currentStep / totalSteps);
          
          setExecution(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              logs: [...prev.logs, `Completed: ${skill.steps[currentStep-1]?.label || 'System step'}`]
            };
          });

          if (currentStep >= totalSteps) {
            clearInterval(interval);
            setTimeout(() => {
              setExecution(prev => prev ? {
                ...prev,
                status: 'completed',
                finishedAt: new Date().toISOString(),
                logs: [...prev.logs, 'Execution finished successfully.'],
                resultSummary: skill.outputDescription + '\n\n**Data processed successfully in simulated environment.**'
              } : null);
            }, 500);
          }
        }, 1500);
      }
    } catch (error) {
      setExecution(prev => prev && {
        ...prev,
        status: 'failed',
        finishedAt: new Date().toISOString(),
        logs: [...prev.logs, `Error: ${error instanceof Error ? error.message : String(error)}`],
        resultSummary: 'Failed to execute skill. Check terminal logs.'
      });
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      
      <div className="mb-8">
        <Link to={`/skill/${skill.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-on-surface-variant hover:text-primary mb-2 transition-colors">
          <ArrowLeft size={16} /> Back to Skill
        </Link>
        <h1 className="text-3xl font-bold text-on-surface">Run: {skill.name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        
        {/* Left: Form */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-surface-variant shadow-sm relative overflow-hidden">
             {/* Small accent at top */}
             <div className="absolute top-0 left-0 right-0 h-1 bg-secondary" />

            <h2 className="text-lg font-bold text-on-surface mb-6 shrink-0">Input Parameters</h2>
            
            <div className="space-y-5">
              {skill.inputs.map(inp => (
                <div key={inp.key}>
                  <label className="block text-sm font-semibold text-on-surface mb-1">
                    {inp.label} {inp.required && <span className="text-error">*</span>}
                  </label>
                  
                  {inp.type === 'text' && (
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm outline-none focus:border-primary/40 ring-4 ring-transparent focus:ring-primary/10 transition-all"
                      placeholder={inp.placeholder}
                      value={formData[inp.key] || ''}
                      onChange={(e) => handleInputChange(inp.key, e.target.value)}
                      disabled={execution?.status === 'running'}
                    />
                  )}
                  
                  {inp.type === 'textarea' && (
                    <textarea 
                      className="w-full h-24 resize-none px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm outline-none focus:border-primary/40 ring-4 ring-transparent focus:ring-primary/10 transition-all"
                      placeholder={inp.placeholder}
                      value={formData[inp.key] || ''}
                      onChange={(e) => handleInputChange(inp.key, e.target.value)}
                      disabled={execution?.status === 'running'}
                    />
                  )}

                  {inp.type === 'select' && (
                    <select 
                      className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm outline-none focus:border-primary/40 ring-4 ring-transparent focus:ring-primary/10 transition-all"
                      value={formData[inp.key] || ''}
                      onChange={(e) => handleInputChange(inp.key, e.target.value)}
                      disabled={execution?.status === 'running'}
                    >
                      <option value="">Select...</option>
                      {inp.options?.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  )}

                  {inp.type === 'file' && (
                    <div className="border-2 border-dashed border-outline-variant/60 rounded-lg p-6 text-center hover:bg-surface-container transition-colors cursor-pointer bg-surface-bright">
                      <FileTerminal size={24} className="mx-auto text-on-surface-variant mb-2" />
                      <span className="text-sm font-medium text-on-surface">Click to upload file</span>
                      <p className="text-xs text-on-surface-variant mt-1">or drag and drop</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button 
              onClick={handleExecute}
              disabled={execution?.status === 'running'}
              className="mt-8 w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-3 px-4 text-on-primary font-bold shadow-md hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play size={18} className="fill-current" /> Execute Skill
            </button>
          </div>
        </div>

        {/* Right: Execution Monitor */}
        <div className="md:col-span-3">
          {execution ? (
            <div className="bg-slate-900 rounded-xl flex flex-col h-[500px] border border-slate-800 shadow-xl overflow-hidden font-mono text-sm relative">
              <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between">
                <span className="text-primary font-bold text-[10px] tracking-widest uppercase">Simulation Progress</span>
                {execution.status === 'running' ? (
                  <span className="flex items-center gap-2 text-primary/80 text-xs">
                    <CircleDashed size={14} className="animate-spin" /> Running
                  </span>
                ) : execution.status === 'failed' ? (
                  <span className="flex items-center gap-2 text-red-400 text-xs font-bold">
                    <CheckCircle2 size={14} /> Failed
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-[#4ffbe6] text-xs">
                    <CheckCircle2 size={14} /> Completed
                  </span>
                )}
              </div>
              
              <div className="p-4 flex-1 overflow-y-auto space-y-2 bg-slate-900 text-slate-300">
                {execution.logs.map((log, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    key={i}
                    className="flex gap-3"
                  >
                    <span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span>
                    <span>{log}</span>
                  </motion.div>
                ))}
              </div>

              {/* Progress Bar overlay at bottom if running */}
              {execution.status === 'running' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
                  <motion.div 
                    className="h-full bg-indigo-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${simulatedProgress * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}

              {/* Result Summary Overlay if completed or failed */}
              {(execution.status === 'completed' || execution.status === 'failed') && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute inset-x-0 bottom-0 bg-surface-container-lowest border-t border-surface-variant p-6 rounded-t-xl overflow-y-auto max-h-[250px]"
                >
                  <h3 className={`font-bold mb-2 font-sans ${execution.status === 'failed' ? 'text-red-500' : 'text-on-surface'}`}>
                    {execution.status === 'failed' ? 'Execution Failed' : 'Final Result'}
                  </h3>
                  <div className={`bg-surface-bright rounded-md border p-4 mb-4 font-sans text-sm whitespace-pre-wrap ${execution.status === 'failed' ? 'border-red-200 text-red-900 bg-red-50' : 'border-outline-variant/50 text-on-surface-variant'}`}>
                    {execution.resultSummary}
                  </div>
                  <div className="flex gap-3 font-sans">
                    <button className="flex-1 flex justify-center items-center gap-2 rounded-lg bg-surface-container-high py-2 text-on-surface font-semibold hover:bg-surface-container transition-colors">
                      <Download size={16} /> Download
                    </button>
                    <button className="flex-1 flex justify-center items-center gap-2 rounded-lg bg-secondary py-2 text-on-secondary font-semibold hover:opacity-90 transition-colors">
                      View Raw <ExternalLink size={16} />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="bg-surface-container rounded-xl flex flex-col items-center justify-center h-full border border-dashed border-outline-variant/60 text-on-surface-variant p-10 min-h-[400px]">
              <Play size={48} className="opacity-20 mb-4" />
              <p className="font-medium">Fill in the parameters and click Execute to start.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
