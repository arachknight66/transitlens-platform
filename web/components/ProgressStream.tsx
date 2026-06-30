"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { analyzeFile, analyzeStream, analyzeTess } from "@/lib/api";
import type { SourceMode } from "@/lib/analysisConfig";
import { SkeletonCard } from "./SkeletonCard";
import type { AnalysisResult } from "@/types/analysis";

interface Props {
  onComplete: (result: AnalysisResult) => void;
  targetId: string;
  timeArr?: number[];
  fluxArr?: number[];
  configOverride?: Record<string, unknown>;
  sourceMode?: SourceMode;
  originalFile?: File;
  sector?: number;
  cutoutSize?: number;
}

const STEPS = [
  { id: "preprocessing", label: "Preprocess" },
  { id: "bls_search", label: "BLS Search" },
  { id: "features", label: "Features" },
  { id: "classify", label: "Classify" },
  { id: "fitting", label: "Fit" },
  { id: "plots", label: "Plots" },
  { id: "complete", label: "Done" },
] as const;

function stageIndex(stage: string): number {
  const idx = STEPS.findIndex((s) => s.id === stage);
  return idx >= 0 ? idx : 0;
}

function StepIndicator({
  label,
  status,
}: {
  label: string;
  status: "pending" | "active" | "done" | "error";
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium transition-colors duration-fast ${
          status === "done"
            ? "border-status-ok bg-status-ok/20 text-status-ok"
            : status === "active"
              ? "border-brand bg-brand-ghost text-brand-light"
              : status === "error"
                ? "border-status-error bg-status-error/20 text-status-error"
                : "border-border-soft bg-bg-surface text-text-muted"
        }`}
      >
        {status === "done" ? "✓" : status === "error" ? "!" : status === "active" ? "●" : ""}
        {status === "active" && (
          <span className="absolute inset-0 animate-ping rounded-full border border-brand/40" />
        )}
      </div>
      <span className="max-w-[4.5rem] text-center text-2xs text-text-muted">{label}</span>
    </div>
  );
}

export function ProgressStream({
  onComplete,
  targetId,
  timeArr = [],
  fluxArr = [],
  configOverride,
  sourceMode = "demo",
  originalFile,
  sector,
  cutoutSize = 15,
}: Props) {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("Initializing analysis…");
  const [currentStage, setCurrentStage] = useState("preprocessing");
  const [error, setError] = useState<string | null>(null);
  const [failedStage, setFailedStage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    completedRef.current = false;
    abortControllerRef.current = new AbortController();

    const run = async () => {
      try {
        const onEvent = (event: { pct: number; msg: string; stage: string }) => {
            setProgress(event.pct);
            setMessage(event.msg);
            setCurrentStage(event.stage);
            if (event.pct >= 60) setShowPreview(true);
        };
        let result: AnalysisResult;
        if (sourceMode === "upload") {
          if (!originalFile) throw new Error("Original upload payload is unavailable.");
          onEvent({ stage: "preprocessing", pct: 12, msg: "Uploading the untouched file to the authoritative backend loader…" });
          result = await analyzeFile(originalFile, targetId, configOverride, abortControllerRef.current?.signal);
        } else if (sourceMode === "tic") {
          onEvent({ stage: "preprocessing", pct: 10, msg: "Resolving TIC coordinates, sectors, and TESScut cache state…" });
          result = await analyzeTess(targetId.replace(/^TIC-/i, ""), sector, cutoutSize, configOverride, abortControllerRef.current?.signal);
        } else {
          result = await analyzeStream(timeArr, fluxArr, targetId, onEvent, configOverride, abortControllerRef.current?.signal);
        }

        if (!completedRef.current) {
          completedRef.current = true;
          setCurrentStage("complete");
          setProgress(100);
          onComplete(result);
        }
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setFailedStage(currentStage);
          setError(err.message || "Analysis failed");
        }
      }
    };

    run();

    return () => {
      abortControllerRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onComplete, targetId, timeArr, fluxArr, configOverride, sourceMode, originalFile, sector, cutoutSize, retryKey]);

  const activeIdx = stageIndex(failedStage ?? currentStage);

  if (error) {
    const failedLabel = STEPS.find((s) => s.id === failedStage)?.label ?? "Unknown";
    return (
      <div className="rounded-lg border border-status-error/30 bg-status-error/10 p-6">
        <p className="mb-1 font-medium text-status-error">Failed at: {failedLabel}</p>
        <p className="mb-4 text-sm text-text-secondary">{error}</p>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setFailedStage(null);
            setProgress(0);
            setShowPreview(false);
            setCurrentStage("preprocessing");
            setRetryKey((k) => k + 1);
          }}
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-core"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg border border-border-subtle bg-bg-elevated p-6"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative mb-8 flex justify-between">
        <div className="absolute left-4 right-4 top-4 h-0.5 bg-border-subtle" />
        {STEPS.map((step, i) => {
          let status: "pending" | "active" | "done" | "error" = "pending";
          if (i < activeIdx) status = "done";
          else if (i === activeIdx) status = "active";
          return (
            <div key={step.id} className="relative z-10 flex-1">
              <StepIndicator label={step.label} status={status} />
            </div>
          );
        })}
      </div>

      <p className="mb-4 text-base text-text-primary">{message}</p>

      <div className="h-1 overflow-hidden rounded-full bg-bg-surface">
        <motion.div
          className="h-full bg-brand"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </div>

      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 0.5, y: 0 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none mt-6 space-y-4"
          >
            <SkeletonCard height="64px" />
            <div className="grid grid-cols-4 gap-4">
              <SkeletonCard height="80px" />
              <SkeletonCard height="80px" />
              <SkeletonCard height="80px" />
              <SkeletonCard height="80px" />
            </div>
            <SkeletonCard height="320px" className="rounded-lg" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
