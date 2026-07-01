import { PageHeader } from '../components/PageHeader';
import { Panel } from '../components/Panel';

const responsibilities = [
  ['transitlens-platform', 'Orchestration, validation, sessions, visualization, reporting, and user interaction.'],
  ['transitlens-data-pipeline', 'MAST access, FITS parsing, preprocessing, wavelet denoising, and scientific feature production.'],
  ['transitlens-ml-core', 'Approved model loading, inference, confidence, and model metadata.'],
] as const;

const AboutPage = () => (
  <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
    <PageHeader eyebrow="Project information" title="About TransitLens" description="A scientific workstation for orchestrating exoplanet transit-candidate analysis without moving scientific responsibilities across service boundaries." />
    <div className="mt-8 grid gap-5 lg:grid-cols-2">
      <Panel title="System architecture"><p className="text-sm leading-6 text-slate-400">The React interface communicates only with the FastAPI platform gateway. The gateway validates and coordinates requests to the data pipeline and ML Core, then returns synchronized results to the workspace.</p></Panel>
      <Panel title="Scientific workflow"><p className="text-sm leading-6 text-slate-400">Search or upload → acquire observation → preprocess light curve → inspect raw, normalized, and wavelet-denoised curves → request inference → review scientific metrics → export a report.</p></Panel>
      <Panel title="Supported missions"><p className="text-sm leading-6 text-slate-400">TESS, Kepler, and K2 observations are supported through the data-pipeline MAST interface. Actual archive availability and product coverage are determined upstream.</p></Panel>
      <Panel title="Model and version information"><dl className="space-y-2 text-sm text-slate-400"><div className="flex justify-between gap-4"><dt>Platform</dt><dd className="font-mono">0.1.0</dd></div><div className="flex justify-between gap-4"><dt>Model</dt><dd>Reported live by ML Core</dd></div><div className="flex justify-between gap-4"><dt>Pipeline</dt><dd>Recorded per analysis</dd></div></dl></Panel>
      <section className="lg:col-span-2"><Panel title="Repository responsibilities"><div className="grid gap-4 md:grid-cols-3">{responsibilities.map(([name, detail]) => <article key={name}><h3 className="font-mono text-xs text-signal-300">{name}</h3><p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p></article>)}</div></Panel></section>
      <Panel title="Limitations"><ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-slate-400"><li>Upstream services and approved model artifacts must be available.</li><li>Transit depth, duration, and period remain unavailable until an authoritative upstream producer supplies them.</li><li>Results depend on source-data quality, pipeline configuration, and model scope.</li></ul></Panel>
      <Panel title="Scientific disclaimer"><p className="text-sm leading-6 text-slate-400">TransitLens identifies candidates for scientific review. Its predictions are not confirmations of exoplanets and must not replace independent validation, peer review, or established follow-up methods.</p></Panel>
    </div>
  </div>
);

export default AboutPage;

