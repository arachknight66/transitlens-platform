import type { ScientificMetrics } from '../types/results';
import { ScientificMetricCard } from './ScientificMetricCard';

export const ScientificMetricsPanel = ({ metrics }: { readonly metrics: ScientificMetrics }) => (
  <section aria-labelledby="scientific-metrics-title">
    <div className="mb-4">
      <h2 id="scientific-metrics-title" className="text-sm font-semibold text-slate-100">Scientific metrics</h2>
      <p className="mt-1 text-xs text-slate-500">Reported values from the data-pipeline result contract.</p>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <ScientificMetricCard label="Transit depth" metric={metrics.transit_depth} description="Relative stellar-flux reduction during transit." />
      <ScientificMetricCard label="Transit duration" metric={metrics.transit_duration} description="Estimated time between transit ingress and egress." />
      <ScientificMetricCard label="Estimated period" metric={metrics.estimated_period} description="Estimated interval between recurring transit events." />
      <ScientificMetricCard label="Signal-to-noise ratio" metric={metrics.signal_to_noise_ratio} description="Pipeline-reported signal relative to measurement variation." />
    </div>
  </section>
);

