import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Bot, CheckCircle2, ChevronRight, Wand2, Zap, Save, Pencil, X, AlertCircle } from 'lucide-react';
import { useSkills } from '../context/SkillContext';
import { Skill } from '../types';

export function CreateSkill() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [draft, setDraft] = useState<Skill | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { addSkill } = useSkills();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setGenerationStep(1);
    setError(null);

    // Simulate generation steps for UI feedback
    const stepInterval = setInterval(() => {
      setGenerationStep(prev => prev < 4 ? prev + 1 : prev);
    }, 1500);

    try {
      // Send request to our backend which handles the MCP n8n agent interaction
      const response = await fetch('/api/mcp/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate workflow. HTTP ${response.status}`);
      }
      
      const data = await response.json();
      clearInterval(stepInterval);
      setGenerationStep(4);
      
      setDraft({
        id: `s_n8n_${Date.now()}`,
        name: data.name || 'Generated Automation',
        description: data.description || prompt.slice(0, 100) + '...',
        owner: 'M. Tinti',
        tags: data.tags || ['n8n', 'Automation'],
        pattern: data.pattern || 'custom',
        sharedWith: ['My Team'],
        inputs: data.inputs || [{ key: 'input_data', label: 'Input Data', type: 'text', required: true }],
        steps: data.steps || [{ id: '1', label: 'Trigger', type: 'trigger' }, { id: '2', label: 'n8n Workflow', type: 'tool' }],
        outputDescription: data.outputDescription || 'Automated output from n8n.',
        status: 'draft',
        runs: 0
      });
    } catch (err) {
      clearInterval(stepInterval);
      setError(err instanceof Error ? err.message : 'An error occurred during generation');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (draft) {
      addSkill({ ...draft, status: 'active' });
      navigate(`/skill/${draft.id}`);
    }
  };

  const suggestions = [
    "Read the weekly sales CSV and summarize top buyers...",
    "Extract actionable tasks from a meeting transcript...",
    "Translate these release notes into customer friendly updates..."
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-on-surface">Create Skill</h1>
        <p className="text-on-surface-variant">Describe the workflow you want to automate.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Side: Input */}
        <div className="flex flex-col gap-6">
          <div className="bg-surface-container-lowest rounded-xl border border-surface-variant p-6 shadow-sm">
            <label className="block text-sm font-semibold text-on-surface mb-3">
              What do you want the skill to do?
            </label>
            <textarea
              className="w-full h-40 resize-none rounded-lg border border-outline-variant bg-surface-container-lowest p-4 text-sm outline-none focus:border-primary/40 ring-4 ring-transparent focus:ring-primary/10 transition-all mb-4"
              placeholder="e.g., Take a customer support ticket text, extract the product name, and generate a polite apology email..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
            />
            
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-on-primary font-semibold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              <Wand2 size={18} />
              {isGenerating ? 'Generating...' : 'Generate skill'}
            </button>
          </div>

          {!isGenerating && !draft && (
            <div>
              <p className="text-sm font-semibold text-on-surface-variant mb-3 uppercase tracking-wider">Examples</p>
              <div className="flex flex-col gap-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(s)}
                    className="text-left px-4 py-3 rounded-lg border border-outline-variant bg-surface hover:border-primary hover:bg-surface-container transition-colors text-sm text-on-surface"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Progress / Draft */}
        <div>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 shadow-sm mb-6 flex gap-3"
            >
              <AlertCircle className="shrink-0 text-red-500" size={20} />
              <div>
                <h4 className="font-bold text-sm">Failed to generate skill from n8n</h4>
                <p className="text-sm mt-1">{error}</p>
                <div className="mt-3 text-xs bg-red-100/50 p-2 rounded text-red-900 border border-red-200">
                  <span className="font-bold">Tip:</span> Ensure you have set your <code className="font-mono bg-white px-1 py-0.5 rounded">VITE_N8N_WEBHOOK_URL</code> in your <code className="font-mono bg-white px-1 py-0.5 rounded">.env</code> file or Environment Secrets, and that the n8n webhook allows Cross-Origin requests (CORS).
                </div>
              </div>
            </motion.div>
          )}

          {isGenerating && (
            <div className="bg-surface-container-lowest rounded-xl border border-primary/30 p-8 shadow-sm">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2 mb-6">
                <Bot className="text-primary" />
                Designing your skill...
              </h3>
              
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-outline-variant/30 before:to-transparent">
                {[
                  { step: 1, label: "Understanding request" },
                  { step: 2, label: "Defining required inputs" },
                  { step: 3, label: "Mapping the workflow sequence" },
                  { step: 4, label: "Preparing reusable template" }
                ].map((s) => (
                  <motion.div
                    key={s.step}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: generationStep >= s.step ? 1 : 0.3, x: 0 }}
                    className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-surface-container-lowest bg-surface-variant shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors duration-500">
                      {generationStep > s.step ? (
                        <CheckCircle2 size={24} className="text-primary fill-current bg-white rounded-full" />
                      ) : generationStep === s.step ? (
                        <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
                      ) : (
                        <div className="w-2 h-2 bg-outline-variant rounded-full" />
                      )}
                    </div>
                    
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-surface-container-lowest p-4 rounded-xl border border-surface-variant shadow-sm z-10">
                      <p className="font-medium text-sm text-on-surface">{s.label}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {draft && !isGenerating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-surface-container-lowest rounded-2xl border border-transparent ring-2 ring-primary shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4 border-b border-surface-variant pb-4">
                <h3 className="text-xl font-bold text-on-surface">{draft.name}</h3>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-container text-on-primary-container">
                  Draft
                </span>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <span className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Description</span>
                  <p className="text-sm text-on-surface">{draft.description}</p>
                </div>
                
                <div>
                  <span className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Inputs Needed</span>
                  <div className="flex gap-2">
                    {draft.inputs.map((inp, idx) => (
                      <span key={idx} className="bg-surface-container px-2 py-1 rounded text-xs font-medium text-on-surface border border-outline-variant/30">
                        {inp.label}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Workflow Steps</span>
                  <div className="bg-surface rounded-lg p-3 border border-outline-variant/30 text-sm flex flex-col gap-2">
                    {draft.steps.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-outline">{idx + 1}.</span>
                        <span className="font-medium text-on-surface">{step.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-surface-variant">
                <button
                  onClick={handleSave}
                  className="flex-1 flex justify-center items-center gap-2 bg-primary hover:bg-primary/90 text-on-primary py-2.5 px-4 rounded-lg font-semibold transition-colors shadow-md"
                >
                  <Save size={18} /> Save Skill
                </button>
                <button 
                  onClick={() => setDraft(null)} 
                  className="px-4 py-2.5 rounded-lg border border-outline-variant hover:bg-surface-container text-on-surface font-semibold transition-colors"
                >
                  Discard
                </button>
              </div>
            </motion.div>
          )}

          {!isGenerating && !draft && (
            <div className="h-full border-2 border-dashed border-outline-variant/50 rounded-xl flex flex-col items-center justify-center text-on-surface-variant p-8 bg-surface/50">
              <Bot size={48} className="opacity-20 mb-4" />
              <p className="text-center">Describe your workflow to generate a structured skill.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
