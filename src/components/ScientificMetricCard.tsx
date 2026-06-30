import type { ScientificMetric } from '../types/results';

const unitLabel: Record<ScientificMetric['unit'], string> = {
  ppm: 'ppm',
  hours: 'hours',
  days: 'days',
  dimensionless: 'S/N',
};

const formatMetric = (metric: ScientificMetric): string => {
  if (metric.value === null) return 'Unavailable';
  if (metric.unit === 'ppm') return metric.value.toFixed(1);
  if (metric.unit === 'dimensionless') return metric.value.toFixed(2);
  return metric.value.toFixed(3);
};

interface ScientificMetricCardProps {
  readonly label: string;
  readonly metric: ScientificMetric;
  readonly description: string;
}

export const ScientificMetricCard = ({ label, metric, description }: ScientificMetricCardProps) => (
  <article className="rounded-xl border border-white/8 bg-space-900/70 p-5">
    <p className="text-[10px] font-semibold tracking-[0.17em] text-slate-600 uppercase">{label}</p>
    <div className="mt-5 flex items-baseline gap-2">
      <p className={`font-mono text-2xl font-semibold ${metric.value === null ? 'text-slate-500' : 'text-white'}`}>{formatMetric(metric)}</p>
      {metric.value !== null && <span className="text-xs text-signal-300">{unitLabel[metric.unit]}</span>}
    </div>
    <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
    <p className="mt-4 text-[9px] tracking-[0.13em] text-slate-700 uppercase">Data pipeline output</p>
  </article>
);

