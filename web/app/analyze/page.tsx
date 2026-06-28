"use client";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CandidateCard } from "@/components/CandidateCard";
import { ProgressStream } from "@/components/ProgressStream";
import { useTransitStore } from "@/lib/store";
import type { AnalysisResult } from "@/types/analysis";

export default function AnalyzePage() {
  const router = useRouter();
  const setResult = useTransitStore((s) => s.setResult);
  const setSelectedCandidate = useTransitStore((s) => s.setSelectedCandidate);
  const setAnalysisRunning = useTransitStore((s) => s.setAnalysisRunning);
  const setUsingFallback = useTransitStore((s) => s.setUsingFallback);

  const [analyzing, setAnalyzing] = useState(false);
  const [activeTargetId, setActiveTargetId] = useState<string | null>(null);

  const handleCandidateSelect = (id: "a" | "b" | "c") => {
    setSelectedCandidate(id);
    setActiveTargetId(`candidate_${id}`);
    setAnalysisRunning(true);
    setAnalyzing(true);
  };

  const handleAnalysisComplete = useCallback(
    (result: AnalysisResult) => {
      setResult(result);
      setAnalysisRunning(false);
      setUsingFallback(true);
      setAnalyzing(false);
      router.push(`/results/${result.target_id}`);
    },
    [router, setAnalysisRunning, setResult, setUsingFallback]
  );

  if (analyzing && activeTargetId) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-heading-xl font-bold text-text-primary">Running Analysis</h1>
            <p className="mt-2 text-body text-text-secondary">
              Please wait while we process {activeTargetId.replace("_", " ")}...
            </p>
          </motion.div>

          <ProgressStream
            key={activeTargetId}
            onComplete={handleAnalysisComplete}
            targetId={activeTargetId}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-heading-xl font-bold text-text-primary">Analysis Workspace</h1>
          <p className="mt-2 text-body text-text-secondary">
            Configure and execute exoplanet detection, transit fitting, and classification
            pipeline.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <CandidateCard candidateId="a" onClick={() => handleCandidateSelect("a")} />
          <CandidateCard candidateId="b" onClick={() => handleCandidateSelect("b")} />
          <CandidateCard candidateId="c" onClick={() => handleCandidateSelect("c")} />
        </div>
      </div>
    </div>
  );
}
