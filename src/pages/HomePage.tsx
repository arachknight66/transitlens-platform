import { Link } from 'react-router-dom';

import { PageHeader } from '../components/PageHeader';

const workflow = [
  ['01', 'Acquire', 'Locate and import mission observations.'],
  ['02', 'Prepare', 'Orchestrate preprocessing through the data pipeline.'],
  ['03', 'Detect', 'Run model inference through ML Core.'],
  ['04', 'Interpret', 'Inspect scientific metrics and export a report.'],
] as const;

const HomePage = () => (
  <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
    <PageHeader
      eyebrow="Mission control"
      title="Exoplanet transit analysis, end to end."
      description="TransitLens brings observation discovery, pipeline orchestration, inference, and scientific review into one focused workspace."
      action={<Link to="/dashboard" className="inline-flex rounded-lg bg-signal-400 px-5 py-2.5 text-sm font-semibold text-space-950 hover:bg-signal-300">Open dashboard</Link>}
    />

    <section className="mt-10 overflow-hidden rounded-2xl border border-white/8 bg-[radial-gradient(circle_at_75%_20%,rgba(69,214,197,0.12),transparent_35%),linear-gradient(135deg,#0b1728,#07111f)] px-6 py-12 sm:px-10 sm:py-16" aria-labelledby="workflow-title">
      <p className="font-mono text-[11px] tracking-[0.2em] text-signal-300 uppercase">Observation workflow</p>
      <h2 id="workflow-title" className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight text-white sm:text-3xl">From stellar flux to a reviewable transit candidate.</h2>
      <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-white/8 bg-white/8 md:grid-cols-4">
        {workflow.map(([number, title, detail]) => (
          <article key={number} className="bg-space-900/95 p-5">
            <p className="font-mono text-xs text-signal-400">{number}</p>
            <h3 className="mt-5 text-sm font-semibold text-white">{title}</h3>
            <p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p>
          </article>
        ))}
      </div>
    </section>
  </div>
);

export default HomePage;

