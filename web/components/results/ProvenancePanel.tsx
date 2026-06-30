"use client";

import { useState } from "react";
import type { AnalysisResult } from "@/types/analysis";

function shown(value: unknown): string {
  if (value === null || value === undefined || value === "") return "unavailable";
  return Array.isArray(value) ? value.join(" × ") : String(value);
}

export function ProvenancePanel({ result }: { result: AnalysisResult }) {
  const [open, setOpen] = useState(false);
  const source = result.source_provenance ?? {};
  const rows: Array<[string, unknown]> = [
    ["Source status", result.source_status ?? "live"], ["Source type", source.source_type],
    ["File / product", source.filename ?? source.product_identity], ["Product type", source.product_type],
    ["TIC / target", source.tic_id ?? source.target_id ?? result.target_id], ["Sector", source.sector],
    ["Cutout", source.cutout_size], ["Flux / aperture", source.flux_column ?? source.aperture_method],
    ["Cadence", source.cadence_seconds ? `${Number(source.cadence_seconds).toFixed(1)} s` : undefined],
    ["Retained", source.n_retained], ["Crowding", source.crowdsap], ["Flux fraction", source.flfrcsap],
    ["SHA-256", source.checksum_sha256], ["Decompressed SHA-256", source.decompressed_checksum_sha256],
    ["Pipeline", result.pipeline_version], ["Processing", result.processing_time_ms != null ? `${result.processing_time_ms} ms` : undefined],
  ];
  return (
    <section className="overflow-hidden rounded-lg border border-border-subtle bg-bg-elevated">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-6 py-4 text-left font-semibold text-text-primary">
        <span>Data provenance & pipeline metadata</span><span className="text-xs text-text-secondary">{open ? "Hide" : "Show"}</span>
      </button>
      {open && <div className="space-y-4 border-t border-border-subtle p-6">
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">{rows.map(([label, value]) => <div key={label}><dt className="text-2xs uppercase tracking-wider text-text-muted">{label}</dt><dd className="break-all font-mono text-sm text-text-secondary">{shown(value)}</dd></div>)}</dl>
        {!!result.parser_warnings?.length && <div className="border-t border-border-subtle pt-4"><p className="text-xs font-semibold text-status-warn">Parser warnings</p><ul className="mt-2 list-disc pl-5 text-sm text-text-secondary">{result.parser_warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></div>}
        <button type="button" onClick={() => void navigator.clipboard.writeText(JSON.stringify({ source, denoising: result.denoising, model: { id: result.ml_model_id, status: result.ml_model_status, production_eligible: result.production_eligible } }, null, 2))} className="rounded-md border border-border-soft px-3 py-1.5 text-xs">Copy metadata JSON</button>
      </div>}
    </section>
  );
}
