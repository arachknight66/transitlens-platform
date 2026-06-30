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
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { AnnotationPanel } from "@/components/results/AnnotationPanel";
import { ProvenancePanel } from "@/components/results/ProvenancePanel";


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
            <HeroVerdictBar result={loadedResult} cached={usingFallback && loadedResult.source_status !== "live"} />
          </Section>

          <Section index={1}>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr]">
              <div className="space-y-6">
                <ErrorBoundary>
                  <PhaseFoldChartV2
                    result={loadedResult}
                    selectedPeriod={selectedPeriod}
                    onPeriodChange={handlePeriodChange}
                  />
                </ErrorBoundary>
                <ErrorBoundary>
                  <PeriodogramChart result={loadedResult} />
                </ErrorBoundary>
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              <ParameterCard
                label="Orbital Period"
                value={formatPeriod(loadedResult.period_days)}
                errSym={loadedResult.period_uncertainty_days}
                quality="ok"
              />
              <ParameterCard
                label="Transit Depth"
                value={formatDepth(loadedResult.depth)}
                errSym={loadedResult.depth_uncertainty}
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
              <ParameterCard
                label="Bootstrap FAP"
                value={loadedResult.bootstrap_fap != null ? loadedResult.bootstrap_fap.toExponential(2) : "—"}
                quality={loadedResult.bootstrap_fap != null && loadedResult.bootstrap_fap <= 0.01 ? "ok" : "warn"}
              />
            </div>
          </Section>

          <Section index={3}>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-lg border border-border-subtle bg-bg-elevated p-4">
                <h3 className="text-sm font-semibold text-text-primary">Transit-preserving denoising</h3>
                <p className="mt-2 text-sm text-text-secondary">
                  {loadedResult.denoising?.accepted ? "Accepted" : "Rejected / cleaned fallback"} · {loadedResult.denoising?.method ?? "unavailable"}
                </p>
                <p className="mt-1 text-xs text-text-muted">Detection authority: {loadedResult.denoising?.detection_series?.replace(/_/g, " ") ?? "cleaned detrended"}</p>
                <p className="mt-2 text-sm text-text-secondary">Robust OOT noise: {loadedResult.denoising?.noise_before?.toExponential(2) ?? "—"} → {loadedResult.denoising?.noise_after?.toExponential(2) ?? "—"} ({loadedResult.denoising?.noise_reduction_fraction != null ? `${(loadedResult.denoising.noise_reduction_fraction * 100).toFixed(1)}% reduction` : "unavailable"})</p>
                {!!loadedResult.denoising?.rejection_reasons?.length && <p className="mt-2 text-xs text-status-warn">{loadedResult.denoising.rejection_reasons.join(" ")}</p>}
              </div>
              <div className="rounded-lg border border-border-subtle bg-bg-elevated p-4">
                <h3 className="text-sm font-semibold text-text-primary">AI and review status</h3>
                <p className="mt-2 text-sm text-text-secondary">Restricted calibrated prototype · production eligible: no</p>
                <p className="mt-1 text-sm text-text-secondary">ML rank: {loadedResult.ml_predicted_class?.replace(/_/g, " ") ?? "unavailable"} · final vetted: {loadedResult.predicted_class.replace(/_/g, " ")}</p>
                <p className="mt-2 text-xs text-text-muted">{loadedResult.ml_review_required ? `Review required: ${(loadedResult.ml_review_reasons ?? []).join("; ") || "uncertainty or missing diagnostics"}` : "No model review flag reported."}</p>
              </div>
            </div>
          </Section>

          <Section index={4}>
            <ErrorBoundary>
              <ResultsTabs result={loadedResult} />
            </ErrorBoundary>
          </Section>

          <Section index={5}>
            <h3 className="mb-4 text-lg font-semibold text-text-primary">Diagnostic Plots</h3>
            <ErrorBoundary>
              <PlotGallery plots={loadedResult.plots ?? {}} />
            </ErrorBoundary>
          </Section>

          <Section index={6}>
            <ErrorBoundary>
              <AnnotationPanel targetId={targetId} />
            </ErrorBoundary>
          </Section>

          <Section index={7}>
            <ErrorBoundary>
              <ProvenancePanel result={loadedResult} />
            </ErrorBoundary>
          </Section>

          <Section index={8}>
            <ExportStrip result={loadedResult} />
          </Section>
        </div>
      </AnimatePresence>
    </div>
  );
}
