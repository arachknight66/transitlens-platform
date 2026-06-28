"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClassBadge } from "@/components/ClassBadge";
import { ConfidenceTriple } from "@/components/ConfidenceTriple";
import { ParameterCard } from "@/components/ParameterCard";
import { PlotContainer } from "@/components/PlotContainer";
import { PhaseFoldChart } from "@/components/PhaseFoldChart";
import { ClassProbabilityChart } from "@/components/ClassProbabilityChart";
import { ResultsTabs } from "@/components/ResultsTabs";
import { ExportStrip } from "@/components/ExportStrip";
import { SkeletonCard } from "@/components/SkeletonCard";
import { useTransitStore } from "@/lib/store";
import { loadFallback } from "@/lib/api";
import { formatPeriod, formatDepth, formatDuration } from "@/lib/formatters";
import type { AnalysisResult } from "@/types/analysis";

interface Props {
  params: { targetId: string };
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
      transition={{ delay: index * 0.08 }}
    >
      {children}
    </motion.div>
  );
}

export default function ResultsPage({ params }: Props) {
  const storeResult = useTransitStore((s) => s.result);
  const usingFallback = useTransitStore((s) => s.usingFallback);
  const selectedPeriod = useTransitStore((s) => s.selectedPeriod);
  const setSelectedPeriod = useTransitStore((s) => s.setSelectedPeriod);
  const setUsingFallback = useTransitStore((s) => s.setUsingFallback);

  const [loadedResult, setLoadedResult] = useState<AnalysisResult | null>(
    storeResult?.target_id === params.targetId ? storeResult : null
  );
  const [loading, setLoading] = useState(!loadedResult);
  const [showFullExplanation, setShowFullExplanation] = useState(false);

  useEffect(() => {
    if (storeResult?.target_id === params.targetId) {
      setLoadedResult(storeResult);
      setLoading(false);
      return;
    }

    setLoading(true);
    loadFallback(params.targetId).then((fallback) => {
      if (fallback) {
        setLoadedResult(fallback);
        setUsingFallback(true);
      }
      setLoading(false);
    });
  }, [storeResult, params.targetId, setUsingFallback]);

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
        <div className="mx-auto max-w-6xl rounded-lg border border-gray-800 bg-bg-card p-8 text-center">
          <p className="text-body text-text-secondary">
            No results found for {params.targetId}. Run an analysis from the workspace.
          </p>
        </div>
      </div>
    );
  }

  const explanation = loadedResult.explanation ?? "";
  const explanationPreview =
    explanation.length > 200 ? `${explanation.slice(0, 200)}...` : explanation;

  return (
    <div className="page-content p-8">
      <AnimatePresence mode="wait">
        <div key={params.targetId} className="mx-auto max-w-6xl space-y-8">
          {/* Section 1 — Hero verdict bar */}
          <Section index={0}>
            <div className="flex flex-col items-stretch justify-between gap-4 rounded-lg border border-primary/10 bg-primary/5 p-6 lg:flex-row lg:items-center">
              <div className="text-lg font-medium text-text-primary">
                {loadedResult.target_id}
                {usingFallback && (
                  <span className="ml-2 text-caption text-text-muted">(cached)</span>
                )}
              </div>
              <ClassBadge predictedClass={loadedResult.predicted_class} size="lg" />
              <ConfidenceTriple result={loadedResult} />
            </div>
          </Section>

          {/* Section 2 — Two-column hero */}
          <Section index={1}>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr]">
              <div>
                <PhaseFoldChart
                  result={loadedResult}
                  selectedPeriod={selectedPeriod}
                  onPeriodChange={setSelectedPeriod}
                />
                {loadedResult.period_days != null && (
                  <p className="mt-2 text-caption text-text-muted">
                    Detected period: {formatPeriod(loadedResult.period_days)}
                  </p>
                )}
              </div>
              <div className="space-y-4">
                {loadedResult.class_probabilities && (
                  <div className="rounded-lg border border-gray-800 bg-bg-card p-4">
                    <h3 className="mb-3 text-sm font-semibold text-text-primary">
                      Classification probabilities
                    </h3>
                    <ClassProbabilityChart probabilities={loadedResult.class_probabilities} />
                  </div>
                )}
                {explanation && (
                  <div className="rounded-lg border border-gray-800 bg-bg-card p-4">
                    <h3 className="mb-2 text-sm font-semibold text-text-primary">
                      Classification reasoning
                    </h3>
                    <p className="text-body leading-relaxed text-text-secondary">
                      {showFullExplanation ? explanation : explanationPreview}
                    </p>
                    {explanation.length > 200 && (
                      <button
                        type="button"
                        onClick={() => setShowFullExplanation((v) => !v)}
                        className="mt-2 text-sm text-primary hover:underline"
                      >
                        {showFullExplanation ? "Show less" : "Read full reasoning"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Section>

          {/* Section 3 — Parameter strip */}
          <Section index={2}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <ParameterCard
                label="Orbital Period"
                value={formatPeriod(loadedResult.period_days)}
              />
              <ParameterCard
                label="Transit Depth"
                value={formatDepth(loadedResult.depth)}
              />
              <ParameterCard
                label="Duration"
                value={formatDuration(loadedResult.duration_days)}
              />
              <ParameterCard
                label="Signal-to-Noise"
                value={loadedResult.snr?.toFixed(1) ?? "—"}
                unit="σ"
              />
            </div>
          </Section>

          {/* Section 4 — Tabs */}
          <Section index={3}>
            <ResultsTabs result={loadedResult} />
          </Section>

          {/* Section 5 — Secondary plot row */}
          <Section index={4}>
            <h3 className="mb-4 text-heading font-semibold text-text-primary">
              Diagnostic Plots
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {loadedResult.plots?.raw_lightcurve && (
                <PlotContainer
                  title="Raw Lightcurve"
                  imageSrc={`data:image/png;base64,${loadedResult.plots.raw_lightcurve}`}
                />
              )}
              {loadedResult.plots?.cleaned_lightcurve && (
                <PlotContainer
                  title="Cleaned Lightcurve"
                  imageSrc={`data:image/png;base64,${loadedResult.plots.cleaned_lightcurve}`}
                />
              )}
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              {loadedResult.plots?.periodogram && (
                <PlotContainer
                  title="Periodogram"
                  imageSrc={`data:image/png;base64,${loadedResult.plots.periodogram}`}
                />
              )}
              {loadedResult.plots?.transit_stack ? (
                <PlotContainer
                  title="Transit Stack"
                  imageSrc={`data:image/png;base64,${loadedResult.plots.transit_stack}`}
                />
              ) : (
                <div />
              )}
            </div>
          </Section>

          {/* Section 6 — Export strip */}
          <Section index={5}>
            <ExportStrip result={loadedResult} />
          </Section>
        </div>
      </AnimatePresence>
    </div>
  );
}
