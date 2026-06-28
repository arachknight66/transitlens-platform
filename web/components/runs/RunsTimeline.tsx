"use client";

import { useEffect, useState } from "react";
import { loadRuns } from "@/lib/runs";
import { RunCard } from "./RunCard";
import type { PipelineRun } from "@/types/runs";

export function RunsTimeline() {
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRuns().then((data) => {
      setRuns(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-text-muted">
        Loading run history…
      </div>
    );
  }

  if (!runs.length) {
    return (
      <div className="rounded-lg border border-border-subtle bg-bg-elevated p-8 text-center">
        <p className="text-base text-text-secondary">No pipeline run records found.</p>
        <p className="mt-2 text-sm text-text-muted">
          Runs are written by ml-core to{" "}
          <code className="text-brand">transitlens-ml-core/runs/</code>. Demo data is in{" "}
          <code className="text-brand">public/runs/runs.json</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="relative space-y-4 pl-6">
      <div
        className="absolute bottom-4 left-[7px] top-4 w-px bg-border-soft"
        aria-hidden
      />
      {runs.map((run, i) => (
        <div key={run.id} className="relative">
          <span
            className="absolute -left-6 top-6 h-3 w-3 rounded-full border-2 border-bg-base bg-brand"
            aria-hidden
          />
          <RunCard run={run} defaultExpanded={i === 0} />
        </div>
      ))}
    </div>
  );
}
