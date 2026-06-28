"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useShallow } from "zustand/react/shallow";
import { HeroVerdictBar } from "@/components/results/HeroVerdictBar";
import { ClassProbabilityChart } from "@/components/ClassProbabilityChart";
import { ParameterCard } from "@/components/ParameterCard";
import { PlotGallery } from "@/components/results/PlotGallery";
import { ExportStrip } from "@/components/ExportStrip";
import { SkeletonCard } from "@/components/SkeletonCard";
import { useTransitStore } from "@/lib/store";
import { loadFallback } from "@/lib/api";
import { formatPeriod, formatDepth, formatDuration } from "@/lib/formatters";
import type { AnalysisResult } from "@/types/analysis";

const PhaseFoldChartV2 = dynamic(
  () =>
    import("@/components/charts/PhaseFoldChartV2").then((m) => ({
      default: m.PhaseFoldChartV2,
    })),
  { loading: () => <SkeletonCard height="420px" className="rounded-lg" /> }
);

const PeriodogramChart = dynamic(
  () =>
    import("@/components/charts/PeriodogramChart").then((m) => ({
      default: m.PeriodogramChart,
    })),
  { loading: () => <SkeletonCard height="280px" className="rounded-lg" /> }
);

const ResultsTabs = dynamic(
  () =>
    import("@/components/ResultsTabs").then((m) => ({
      default: m.ResultsTabs,
    })),
  { loading: () => <SkeletonCard height="360px" className="rounded-lg" /> }
);

interface Props {
  targetId: string;
}

function Section({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ delay: index * 0.06 }}
    >
      {children}
    </motion.div>
  );
}

export function ResultsPageContent({ targetId }: Props) {
  const { storeResult, usingFallback, selectedPeriod, setSelectedPeriod, setUsingFallback } =
    useTransitStore(
      useShallow((s) => ({
        storeResult: s.result,
        usingFallback: s.usingFallback,
        selectedPeriod: s.selectedPeriod,
        setSelectedPeriod: s.setSelectedPeriod,
        setUsingFallback: s.setUsingFallback,
      }))
    );

  const [loadedResult, setLoadedResult] = useState<AnalysisResult | null>(
    storeResult?.target_id === targetId ? storeResult : null
  );
  const [loading, setLoading] = useState(!loadedResult);
  const [showFullExplanation, setShowFullExplanation] = useState(false);

  const handlePeriodChange = useCallback(
    (period: number) => setSelectedPeriod(period),
    [setSelectedPeriod]
  );

  useEffect(() => {
    if (storeResult?.target_id === targetId) {
      setLoadedResult(storeResult);
      setLoading(false);
      return;
    }

    setLoading(true);
    loadFallback(targetId).then((fallback) => {
      if (fallback) {
        setLoadedResult(fallback);
        setUsingFallback(true);
      }
      setLoading(false);
    });
  }, [storeResult, targetId, setUsingFallback]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <SkeletonCard height="80px" />
          <SkeletonCard height="400px" />
        </div>
      </div>
    );
  }

  if (!loadedResult) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-6xl rounded-lg border border-border-subtle bg-bg-elevated p-8 text-center">
          <p className="text-base text-text-secondary">
            No results found for {targetId}. Run an analysis from the workspace.
          </p>
        </div>
      </div>
    );
  }

  const explanation = loadedResult.explanation ?? "";
  const explanationPreview =
    explanation.length > 200 ? `${explanation.slice(0, 200)}…` : explanation;

  return (
    <div className="page-content p-8">
      <AnimatePresence mode="wait">
        <div key={targetId} className="mx-auto max-w-6xl space-y-8">
          <Section index={0}>
            <HeroVerdictBar result={loadedResult} cached={usingFallback} />
          </Section>

          <Section index={1}>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr]">
              <div className="space-y-6">
                <PhaseFoldChartV2
                  result={loadedResult}
                  selectedPeriod={selectedPeriod}
                  onPeriodChange={handlePeriodChange}
                />
                <PeriodogramChart result={loadedResult} />
              </div>
              <div className="space-y-4">
                {loadedResult.class_probabilities && (
                  <div className="rounded-lg border border-border-subtle bg-bg-elevated p-4">
                    <h3 className="mb-3 text-sm font-semibold text-text-primary">
                      Classification probabilities
                    </h3>
                    <ClassProbabilityChart probabilities={loadedResult.class_probabilities} />
                  </div>
                )}
                {explanation && (
                  <div className="rounded-lg border border-border-subtle bg-bg-elevated p-4">
                    <h3 className="mb-2 text-sm font-semibold text-text-primary">
                      Classification reasoning
                    </h3>
                    <p className="text-base leading-relaxed text-text-secondary">
                      {showFullExplanation ? explanation : explanationPreview}
                    </p>
                    {explanation.length > 200 && (
                      <button
                        type="button"
                        onClick={() => setShowFullExplanation((v) => !v)}
                        className="mt-2 text-sm text-brand hover:underline"
                      >
                        {showFullExplanation ? "Show less" : "Read full reasoning"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Section>

          <Section index={2}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <ParameterCard
                label="Orbital Period"
                value={formatPeriod(loadedResult.period_days)}
                errSym={loadedResult.period_uncertainty_days}
                quality="ok"
              />
              <ParameterCard
                label="Transit Depth"
                value={formatDepth(loadedResult.depth)}
                quality="ok"
              />
              <ParameterCard
                label="Duration"
                value={formatDuration(loadedResult.duration_days)}
                errSym={loadedResult.duration_uncertainty_days ?? undefined}
                quality="ok"
              />
              <ParameterCard
                label="Signal-to-Noise"
                value={loadedResult.snr?.toFixed(1) ?? "—"}
                unit="σ"
                quality={
                  loadedResult.snr != null && loadedResult.snr >= 7
                    ? "ok"
                    : loadedResult.snr != null && loadedResult.snr >= 4
                      ? "warn"
                      : "error"
                }
              />
            </div>
          </Section>

          <Section index={3}>
            <ResultsTabs result={loadedResult} />
          </Section>

          <Section index={4}>
            <h3 className="mb-4 text-lg font-semibold text-text-primary">Diagnostic Plots</h3>
            <PlotGallery plots={loadedResult.plots ?? {}} />
          </Section>

          <Section index={5}>
            <ExportStrip result={loadedResult} />
          </Section>
        </div>
      </AnimatePresence>
    </div>
  );
}
