"use client";

import { motion } from "framer-motion";
import { ClassBadge } from "@/components/ClassBadge";
import { ConfidenceTriple } from "@/components/ConfidenceTriple";
import type { AnalysisResult } from "@/types/analysis";

interface Props {
  result: AnalysisResult;
  cached?: boolean;
}

export function HeroVerdictBar({ result, cached = false }: Props) {
  const version = result.pipeline_version ?? "v0.1.0";
  const sector = result.quality_flags?.find((f) => f.toLowerCase().includes("sector")) ?? "TESS Sector 1";

  return (
    <div className="rounded-lg border border-brand/20 bg-brand-ghost/50 p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-mono text-xl font-bold text-text-primary">
              {result.target_id}
            </h2>
            <ClassBadge predictedClass={result.predicted_class} size="lg" />
            {cached && (
              <span className="rounded-full bg-status-warn/20 px-2.5 py-0.5 text-xs font-medium text-status-warn">
                Cached
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-text-muted">
            {sector} • TESS • {version}
            {result.processing_time_ms != null && (
              <span className="ml-2">• {result.processing_time_ms} ms</span>
            )}
          </p>
        </div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
        >
          <ConfidenceTriple result={result} />
        </motion.div>
      </div>
    </div>
  );
}
