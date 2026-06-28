"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProgressStream } from "@/components/ProgressStream";
import {
  AnalysisWorkspace,
  type RunPayload,
} from "@/components/workspace/AnalysisWorkspace";
import { useTransitStore } from "@/lib/store";
import type { AnalysisResult } from "@/types/analysis";

export default function AnalyzePage() {
  const router = useRouter();
  const setResult = useTransitStore((s) => s.setResult);
  const setSelectedCandidate = useTransitStore((s) => s.setSelectedCandidate);
  const setAnalysisRunning = useTransitStore((s) => s.setAnalysisRunning);
  const setUsingFallback = useTransitStore((s) => s.setUsingFallback);

  const [runState, setRunState] = useState<RunPayload | null>(null);

  const handleRun = (payload: RunPayload) => {
    if (payload.sourceMode === "demo") {
      const match = payload.targetId.match(/^candidate_([abc])$/);
      if (match) setSelectedCandidate(match[1] as "a" | "b" | "c");
    } else {
      setSelectedCandidate(null);
    }
    setAnalysisRunning(true);
    setRunState(payload);
  };

  const handleComplete = useCallback(
    (result: AnalysisResult) => {
      setResult(result);
      setAnalysisRunning(false);
      setUsingFallback(true);
      setRunState(null);
      router.push(`/results/${result.target_id}`);
    },
    [router, setAnalysisRunning, setResult, setUsingFallback]
  );

  if (runState) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-4xl">
          <PageHeader
            title="Running Analysis"
            subtitle={`Processing ${runState.targetId.replace(/_/g, " ")}…`}
          />
          <ProgressStream
            key={`${runState.targetId}-${JSON.stringify(runState.configOverride)}`}
            targetId={runState.targetId}
            timeArr={runState.time}
            fluxArr={runState.flux}
            configOverride={runState.configOverride}
            onComplete={handleComplete}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mx-auto max-w-6xl">
        <PageHeader
          title="Analysis Workspace"
          subtitle="Configure and execute exoplanet detection, transit fitting, and classification pipeline."
        />
        <AnalysisWorkspace onRun={handleRun} />
      </div>
    </div>
  );
}
