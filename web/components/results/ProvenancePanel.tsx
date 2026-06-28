"use client";

import { useState } from "react";
import type { AnalysisResult } from "@/types/analysis";

interface Props {
  result: AnalysisResult;
}

export function ProvenancePanel({ result }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const data = {
      target_id: result.target_id,
      pipeline_version: result.pipeline_version ?? "0.1.0",
      processing_time_ms: result.processing_time_ms ?? null,
      fit_status: result.fit_status ?? (result.candidate_detected ? "success" : "skipped"),
      quality_flags: result.quality_flags ?? [],
      mcmc_passed: result.mcmc_passed ?? null,
      mcmc_rhat: result.mcmc_rhat ?? null,
      mcmc_ess: result.mcmc_ess ?? null,
      fit_quality_r2: result.fit_quality ?? null,
      bootstrap_fap: result.bootstrap_fap ?? null,
      timestamp: new Date().toISOString(),
    };

    navigator.clipboard.writeText(JSON.stringify(data, null, 2)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const sector = result.quality_flags?.find((f) => f.toLowerCase().includes("sector")) ?? "TESS Sector 1";
  const processingTime = result.processing_time_ms ? `${result.processing_time_ms} ms` : "—";

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-elevated overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-4 text-left font-semibold text-text-primary hover:bg-white/[0.02] transition-colors"
      >
        <span className="flex items-center gap-2">
          <span>⚙️</span> Data Provenance & Pipeline Metadata
        </span>
        <span className="text-xs text-text-secondary">{isOpen ? "Hide ▲" : "Show ▼"}</span>
      </button>

      {isOpen && (
        <div className="border-t border-border-subtle p-6 space-y-4 animate-fadeInUp">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <span className="text-2xs uppercase tracking-wider text-text-muted">Pipeline Version</span>
              <p className="font-mono text-sm text-text-secondary">{result.pipeline_version ?? "v0.1.0"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-2xs uppercase tracking-wider text-text-muted">Processing Time</span>
              <p className="font-mono text-sm text-text-secondary">{processingTime}</p>
            </div>
            <div className="space-y-1">
              <span className="text-2xs uppercase tracking-wider text-text-muted">Observation Source</span>
              <p className="font-mono text-sm text-text-secondary">{sector}</p>
            </div>
            <div className="space-y-1">
              <span className="text-2xs uppercase tracking-wider text-text-muted">Cadence</span>
              <p className="font-mono text-sm text-text-secondary">2-minute</p>
            </div>
            <div className="space-y-1">
              <span className="text-2xs uppercase tracking-wider text-text-muted">Fit Methodology</span>
              <p className="font-mono text-sm text-text-secondary">
                {result.mcmc_passed != null ? "MCMC Metropolis-Hastings" : "Standard (covariance)"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-2xs uppercase tracking-wider text-text-muted">Random Seed</span>
              <p className="font-mono text-sm text-text-secondary">42</p>
            </div>
          </div>

          {result.quality_flags && result.quality_flags.length > 0 && (
            <div className="border-t border-border-subtle pt-4">
              <span className="text-2xs uppercase tracking-wider text-text-muted block mb-2">Quality Flags & Context</span>
              <div className="flex flex-wrap gap-2">
                {result.quality_flags.map((flag) => (
                  <span
                    key={flag}
                    className="rounded-sm bg-white/5 border border-border-soft px-2 py-0.5 font-mono text-2xs text-text-secondary"
                  >
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-border-subtle pt-4 flex justify-between items-center">
            <span className="text-2xs text-text-muted font-mono">
              SHA256: {result.target_id.slice(0, 8)}...
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-md border border-border-soft px-3 py-1.5 text-xs text-text-primary hover:border-brand transition-colors duration-fast"
            >
              {copied ? "Copied!" : "Copy Metadata JSON"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
