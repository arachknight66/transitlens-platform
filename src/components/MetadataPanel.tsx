import type { ObservationProvenance, ProcessingProvenance } from '../types/results';

const optional = (value: string | number | null): string => value === null ? 'Not provided' : String(value);

const MetadataList = ({ title, rows }: { readonly title: string; readonly rows: readonly (readonly [string, string])[] }) => (
  <section className="rounded-xl border border-white/8 bg-space-900/70" aria-label={title}>
    <h3 className="border-b border-white/7 px-5 py-4 text-sm font-semibold text-slate-100">{title}</h3>
    <dl className="divide-y divide-white/7 px-5">
      {rows.map(([label, value]) => (
        <div key={label} className="flex flex-col justify-between gap-1 py-3 sm:flex-row sm:gap-4">
          <dt className="text-xs text-slate-500">{label}</dt>
          <dd className="break-all text-left font-mono text-xs text-slate-300 sm:text-right">{value}</dd>
        </div>
      ))}
    </dl>
  </section>
);

export const MetadataPanel = ({ observation, processing }: { readonly observation: ObservationProvenance; readonly processing: ProcessingProvenance }) => {
  const observationRows = [
    ['Mission', observation.mission],
    ['Target', optional(observation.target_name)],
    ['Observation ID', optional(observation.observation_id)],
    ['Source file', observation.source_filename],
    ['Flux column', observation.flux_column],
    ['Quality column', optional(observation.quality_column)],
    ['Observation span', `${observation.observation_duration_days.toFixed(4)} days`],
    ['Cadence', observation.cadence_days === null ? 'Unavailable' : `${observation.cadence_days.toFixed(6)} days`],
  ] as const;
  const processingRows = [
    ['Pipeline version', processing.pipeline_version],
    ['Schema version', processing.schema_version],
    ['Input samples', String(processing.input_samples)],
    ['Output samples', String(processing.output_samples)],
    ['Non-finite removed', String(processing.non_finite_removed)],
    ['Quality removed', String(processing.quality_removed)],
    ['Quality bitmask', processing.quality_bitmask],
    ['Median window', String(processing.median_window)],
    ['Wavelet', `${processing.wavelet} · ${processing.wavelet_threshold_mode}`],
  ] as const;

  return (
    <section aria-labelledby="metadata-title">
      <div className="mb-4">
        <h2 id="metadata-title" className="text-sm font-semibold text-slate-100">Observation metadata</h2>
        <p className="mt-1 text-xs text-slate-500">Source identity and reproducible pipeline provenance.</p>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <MetadataList title="Observation" rows={observationRows} />
        <MetadataList title="Processing provenance" rows={processingRows} />
      </div>
    </section>
  );
};
