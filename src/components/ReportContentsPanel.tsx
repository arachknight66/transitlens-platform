import type { ScientificResults } from '../types/results';

export const ReportContentsPanel = ({ results }: { readonly results: ScientificResults }) => {
  const content = [
    ['Observation information', `${results.observation.mission} · ${results.observation.target_name ?? 'Unknown target'}`],
    ['Prediction', results.prediction ? (results.prediction.predicted_class === 1 ? 'Transit candidate detected' : 'No transit detected') : 'Not available'],
    ['Scientific metrics', 'Transit depth, duration, period, and SNR'],
    ['Model version', results.prediction?.model_version ?? 'Not available'],
    ['Timestamp', new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'medium' }).format(new Date(results.generated_at))],
  ] as const;

  return (
    <section className="rounded-xl border border-white/8 bg-space-900/70" aria-labelledby="report-contents-title">
      <header className="border-b border-white/7 px-5 py-4"><h2 id="report-contents-title" className="text-sm font-semibold text-slate-100">Report contents</h2><p className="mt-1 text-xs text-slate-500">Data included in every export format.</p></header>
      <ul className="divide-y divide-white/7 px-5">
        {content.map(([label, value]) => (
          <li key={label} className="flex flex-col justify-between gap-1 py-4 sm:flex-row sm:gap-5">
            <span className="flex items-center gap-2 text-sm text-slate-300"><span className="text-emerald-300" aria-hidden="true">✓</span>{label}</span>
            <span className="text-xs text-slate-500 sm:text-right">{value}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

