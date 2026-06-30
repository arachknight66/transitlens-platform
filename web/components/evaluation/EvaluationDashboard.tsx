"use client";

import { useEffect, useState } from "react";
import { loadEvaluationMetrics } from "@/lib/evaluation";
import type { EvaluationMetrics, EvidenceGroup } from "@/types/evaluation";

function EvidenceCard({ group, values }: { group: EvidenceGroup; values: Array<[string, string]> }) {
  return (
    <article className="rounded-lg border border-border-subtle bg-bg-elevated p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div><h3 className="font-semibold text-text-primary">{group.title}</h3><p className="text-xs text-brand-light">{group.evidence_type.replace(/_/g, " ")} · N={group.sample_size.toLocaleString()}</p></div>
        <span className="rounded bg-white/5 px-2 py-1 text-2xs text-text-muted">{group.measurement_date}</span>
      </div>
      <dl className="grid grid-cols-2 gap-3">
        {values.map(([label, value]) => <div key={label}><dt className="text-2xs uppercase text-text-muted">{label}</dt><dd className="text-xl font-semibold tabular-nums text-text-primary">{value}</dd></div>)}
      </dl>
      <p className="mt-4 border-t border-border-subtle pt-3 text-xs leading-relaxed text-text-secondary">{group.limitation}</p>
      <p className="mt-2 break-all font-mono text-2xs text-text-muted">Source: {group.source_artifact}</p>
    </article>
  );
}

export function EvaluationDashboard() {
  const [metrics, setMetrics] = useState<EvaluationMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { loadEvaluationMetrics().then((value) => { setMetrics(value); setLoading(false); }); }, []);
  if (loading) return <div className="p-8 text-text-muted">Loading canonical evidence…</div>;
  if (!metrics) return <div className="rounded-lg border border-status-error/30 p-6 text-status-error">Canonical metrics artifact is unavailable. No substitute values are shown.</div>;
  const classifier = metrics.restricted_classifier;
  const injections = metrics.injection_recovery;
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-brand/30 bg-brand-ghost p-4 text-sm leading-relaxed text-text-secondary">{metrics.disclaimer}</div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <EvidenceCard group={classifier} values={[["Macro-F1", classifier.macro_f1.toFixed(4)], ["ECE", classifier.ece.toFixed(4)], ["Review routing", `${(classifier.review_rate * 100).toFixed(2)}%`], ["Eligibility", "Restricted"]]} />
        <EvidenceCard group={injections} values={[["Overall recovery", `${(injections.overall_recovery * 100).toFixed(1)}%`], ["SNR ≥ 7", `${(injections.high_snr_recovery * 100).toFixed(1)}%`], ["Control FP", `${(injections.control_false_positive_rate * 100).toFixed(0)}%`], ["Median period error", `${injections.median_period_error_pct.toFixed(3)}%`]]} />
        <EvidenceCard group={metrics.real_tess_pilot} values={[["Pilot targets", metrics.real_tess_pilot.n_targets.toString()], ["Evidence", "Pilot real"]]} />
        <EvidenceCard group={metrics.ingestion_scale} values={[["Parsed observations", metrics.ingestion_scale.parsed_observations.toLocaleString()], ["Evidence", "Ingestion only"]]} />
      </div>
      <div className="rounded-lg border border-border-subtle bg-bg-elevated p-5">
        <h3 className="font-semibold text-text-primary">Synthetic parameter recovery (N=100)</h3>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <p className="text-sm text-text-secondary">Median period error <strong className="text-text-primary">{injections.median_period_error_pct}%</strong></p>
          <p className="text-sm text-text-secondary">Median depth error <strong className="text-text-primary">{injections.median_depth_error_pct}%</strong></p>
          <p className="text-sm text-text-secondary">Median duration error <strong className="text-text-primary">{injections.median_duration_error_pct}%</strong></p>
        </div>
      </div>
    </div>
  );
}
