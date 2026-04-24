import { ArrowRight, Bot, FolderKanban, Orbit, Sparkles, Wand2, Workflow } from 'lucide-react';

const importChannels = [
  {
    title: 'IMPORT HACKATHON 2026 PROJECTS',
    eyebrow: 'Event intake',
    description:
      'Bring curated submissions into a premium review surface with source context, ownership and launch readiness already framed.',
    icon: FolderKanban,
    accent: 'from-primary to-sky-500',
    glow: 'bg-primary/12',
    meta: '42 projects staged',
  },
  {
    title: 'IMPORT LIVE ARTIFACTS',
    eyebrow: 'Production signals',
    description:
      'Capture real assets from active environments and turn them into reusable building blocks without losing runtime provenance.',
    icon: Orbit,
    accent: 'from-sky-500 to-cyan-400',
    glow: 'bg-sky-500/12',
    meta: '9 sources connected',
  },
  {
    title: 'IMPORT AGENTS',
    eyebrow: 'Cognitive layer',
    description:
      'Ingest agent definitions, prompt stacks and execution contracts so teams can operationalize them inside ClapSkills.',
    icon: Bot,
    accent: 'from-slate-900 to-slate-700',
    glow: 'bg-slate-900/8',
    meta: 'Policy-aware packages',
  },
  {
    title: 'IMPORT TOOLS',
    eyebrow: 'App surfaces',
    description:
      'Pull in interactive tools, keep their structure intact and prepare them for iteration inside the embedded workspace.',
    icon: Wand2,
    accent: 'from-amber-500 to-orange-500',
    glow: 'bg-amber-500/12',
    meta: 'React-ready ingestion',
  },
  {
    title: 'IMPORT WORKFLOWS',
    eyebrow: 'Automation fabric',
    description:
      'Load complete workflow systems with graph metadata, dependencies and execution intent preserved from the start.',
    icon: Workflow,
    accent: 'from-emerald-500 to-teal-500',
    glow: 'bg-emerald-500/12',
    meta: 'n8n-compatible flows',
  },
];

export function ImportHub() {
  return (
    <div className="relative isolate overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top_left,_rgba(79,70,229,0.14),_transparent_42%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.12),_transparent_34%),linear-gradient(180deg,_rgba(255,255,255,0.92),_rgba(248,250,252,0))]" />
      <div className="absolute inset-x-0 top-24 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.45)] backdrop-blur-xl md:p-10">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.18),_transparent_44%),radial-gradient(circle_at_bottom,_rgba(245,158,11,0.12),_transparent_36%)]" />
          <div className="absolute right-10 top-10 hidden h-28 w-28 rounded-full border border-white/60 bg-white/40 blur-3xl lg:block" />

          <div className="relative grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-primary">
                <Sparkles size={14} />
                Import Command Center
              </div>

              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-bold tracking-[-0.04em] text-on-surface sm:text-5xl lg:text-6xl">
                  A premium intake layer for everything that becomes a skill.
                </h1>
                <p className="max-w-2xl text-base leading-8 text-on-surface-variant sm:text-lg">
                  Centralize imports from events, live systems and reusable assets in one interface designed to feel native to the rest of ClapSkills while signaling a more advanced surface.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="rounded-2xl border border-outline-variant/80 bg-surface-container-lowest px-4 py-3 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">Unified intake</p>
                  <p className="mt-1 text-lg font-semibold text-on-surface">5 import lanes ready</p>
                </div>
                <div className="rounded-2xl border border-outline-variant/80 bg-surface-container-lowest px-4 py-3 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">Design system</p>
                  <p className="mt-1 text-lg font-semibold text-on-surface">Aligned with the current product shell</p>
                </div>
              </div>
            </div>

            <div className="relative grid gap-3 rounded-[1.75rem] border border-slate-900/8 bg-slate-950 p-5 text-white shadow-[0_24px_60px_-32px_rgba(15,23,42,0.9)]">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Pipeline signal</p>
                  <p className="mt-1 text-lg font-semibold">Import runway</p>
                </div>
                <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                  Live preview
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Queue health</p>
                  <p className="mt-3 text-3xl font-semibold">98%</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Artifacts staged</p>
                  <p className="mt-3 text-3xl font-semibold">187</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Automation sync</p>
                  <p className="mt-3 text-3xl font-semibold">12m</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {importChannels.map((channel, index) => {
            const Icon = channel.icon;

            return (
              <article
                key={channel.title}
                className="group relative overflow-hidden rounded-[1.75rem] border border-outline-variant/90 bg-surface-container-lowest p-6 shadow-[0_22px_50px_-32px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_32px_60px_-32px_rgba(79,70,229,0.32)]"
              >
                <div className={`absolute -right-12 -top-12 h-36 w-36 rounded-full blur-3xl transition-transform duration-500 group-hover:scale-125 ${channel.glow}`} />
                <div className="relative flex h-full flex-col">
                  <div className="mb-8 flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      <span className="inline-flex rounded-full border border-outline-variant bg-surface-container px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                        {channel.eyebrow}
                      </span>
                      <h2 className="max-w-xs text-2xl font-bold leading-tight tracking-[-0.03em] text-on-surface">
                        {channel.title}
                      </h2>
                    </div>

                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${channel.accent} text-white shadow-lg`}>
                      <Icon size={26} />
                    </div>
                  </div>

                  <p className="text-sm leading-7 text-on-surface-variant">
                    {channel.description}
                  </p>

                  <div className="mt-8 flex items-center justify-between border-t border-outline-variant/80 pt-5">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Status</p>
                      <p className="mt-1 text-sm font-semibold text-on-surface">{channel.meta}</p>
                    </div>

                    <div className="flex items-center gap-2 text-sm font-semibold text-primary transition-transform duration-300 group-hover:translate-x-1">
                      Explore
                      <ArrowRight size={16} />
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    Ready for the next import surface
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
}