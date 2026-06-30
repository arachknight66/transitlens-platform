"use client";

import { motion } from "framer-motion";
import { ClassBadge } from "@/components/ClassBadge";
import { ConfidenceTriple } from "@/components/ConfidenceTriple";
import type { AnalysisResult } from "@/types/analysis";

export function HeroVerdictBar({ result, cached = false }: { result: AnalysisResult; cached?: boolean }) {
  const provenance = result.source_provenance ?? {};
  const sourceType = String(provenance.source_type ?? (result.target_id.startsWith("candidate_") ? "synthetic_demo" : "unknown_source")).replace(/_/g, " ");
  const sector = provenance.sector != null ? ` · Sector ${String(provenance.sector)}` : "";
  const status = cached ? "Cached demo" : result.source_status === "cached" ? "Cached product" : result.source_status === "offline_fixture" ? "Offline fixture" : "Live analysis";
  return (
    <div className="rounded-lg border border-brand/20 bg-brand-ghost/50 p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-mono text-xl font-bold text-text-primary">{result.target_id}</h2>
            <ClassBadge predictedClass={result.predicted_class} size="lg" />
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cached ? "bg-status-warn/20 text-status-warn" : "bg-status-ok/20 text-status-ok"}`}>{status}</span>
          </div>
          <p className="mt-2 text-xs text-text-muted">
            {sourceType}{sector} · pipeline {result.pipeline_version ?? "0.1.0"}
            {result.processing_time_ms != null && <span className="ml-2">· {result.processing_time_ms} ms</span>}
          </p>
        </div>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}>
          <ConfidenceTriple result={result} />
        </motion.div>
      </div>
    </div>
  );
}
