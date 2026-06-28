"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { analyzeStream } from "@/lib/api";
import { SkeletonCard } from "./SkeletonCard";
import type { AnalysisResult } from "@/types/analysis";

interface Props {
  onComplete: (result: AnalysisResult) => void;
  targetId: string;
  timeArr?: number[];
  fluxArr?: number[];
  configOverride?: Record<string, unknown>;
}

export function ProgressStream({
  onComplete,
  targetId,
  timeArr = [],
  fluxArr = [],
  configOverride,
}: Props) {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("Initializing analysis...");
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    completedRef.current = false;
    abortControllerRef.current = new AbortController();

    const run = async () => {
      try {
        const result = await analyzeStream(
          timeArr,
          fluxArr,
          targetId,
          (event) => {
            setProgress(event.pct);
            setMessage(event.msg);
            if (event.pct >= 60) {
              setShowPreview(true);
            }
          },
          configOverride,
          abortControllerRef.current?.signal
        );

        if (!completedRef.current) {
          completedRef.current = true;
          onComplete(result);
        }
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message || "Analysis failed");
        }
      }
    };

    run();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [onComplete, targetId, timeArr, fluxArr, configOverride, retryKey]);

  if (error) {
    return (
      <div className="rounded-lg border border-red-900 bg-red-950 p-6">
        <p className="mb-4 text-red-200">Error: {error}</p>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setProgress(0);
            setShowPreview(false);
            setRetryKey((k) => k + 1);
          }}
          className="rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-text-secondary">{message}</span>
          <span className="text-sm text-text-muted">{progress}%</span>
        </div>
        <progress
          value={progress}
          max={100}
          className="h-2 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-gray-800 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-primary [&::-webkit-progress-value]:transition-[width] [&::-webkit-progress-value]:duration-[400ms] [&::-webkit-progress-value]:ease-out [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-primary"
        />
      </div>

      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 0.5, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="pointer-events-none space-y-4"
          >
            <SkeletonCard height="64px" />
            <div className="grid grid-cols-4 gap-4">
              <SkeletonCard height="80px" />
              <SkeletonCard height="80px" />
              <SkeletonCard height="80px" />
              <SkeletonCard height="80px" />
            </div>
            <SkeletonCard height="400px" className="rounded-lg" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
