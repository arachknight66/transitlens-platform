"use client";

import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { ClassBadge } from "@/components/ClassBadge";
import { SkeletonCard } from "@/components/SkeletonCard";
import { loadFallback } from "@/lib/api";
import { formatPeriod, formatDepth } from "@/lib/formatters";
import type { AnalysisResult } from "@/types/analysis";

const PhaseFoldChartV2 = dynamic(
  () =>
    import("@/components/charts/PhaseFoldChartV2").then((m) => ({
      default: m.PhaseFoldChartV2,
    })),
  { loading: () => <SkeletonCard height="420px" className="rounded-lg" /> }
);

function CompareContent() {
  const searchParams = useSearchParams();
  const idA = searchParams.get("a");
  const idB = searchParams.get("b");

  const [resultA, setResultA] = useState<AnalysisResult | null>(null);
  const [resultB, setResultB] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!idA || !idB) {
      setLoading(false);
      return;
    }
    Promise.all([loadFallback(idA), loadFallback(idB)]).then(([a, b]) => {
      setResultA(a);
      setResultB(b);
      setLoading(false);
    });
  }, [idA, idB]);

  if (!idA || !idB) {
    return (
      <div className="rounded-lg border border-border-subtle bg-bg-elevated p-8 text-center">
        <p className="text-text-secondary">
          Select two candidates in the{" "}
          <Link href="/candidates" className="text-brand hover:underline">
            Candidate Explorer
          </Link>{" "}
          and click Compare.
        </p>
      </div>
    );
  }

  if (loading) {
    return <p className="text-text-muted">Loading comparison…</p>;
  }

  if (!resultA || !resultB) {
    return (
      <p className="text-text-secondary">
        Could not load one or both targets ({idA}, {idB}).
      </p>
    );
  }

  const diffRows: Array<{
    param: string;
    a: string;
    b: string;
    delta: string;
  }> = [
    {
      param: "Class",
      a: resultA.predicted_class,
      b: resultB.predicted_class,
      delta: "—",
    },
    {
      param: "Confidence",
      a: `${Math.round(resultA.confidence * 100)}%`,
      b: `${Math.round(resultB.confidence * 100)}%`,
      delta: `${Math.round((resultA.confidence - resultB.confidence) * 100)} pp`,
    },
    {
      param: "Period",
      a: formatPeriod(resultA.period_days),
      b: formatPeriod(resultB.period_days),
      delta:
        resultA.period_days != null && resultB.period_days != null
          ? `${(resultB.period_days - resultA.period_days).toFixed(4)} d`
          : "—",
    },
    {
      param: "Depth",
      a: formatDepth(resultA.depth),
      b: formatDepth(resultB.depth),
      delta: "—",
    },
    {
      param: "SNR",
      a: resultA.snr?.toFixed(1) ?? "—",
      b: resultB.snr?.toFixed(1) ?? "—",
      delta:
        resultA.snr != null && resultB.snr != null
          ? (resultB.snr - resultA.snr).toFixed(1)
          : "—",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border-subtle bg-bg-elevated p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono font-semibold text-text-primary">{idA}</span>
            <ClassBadge predictedClass={resultA.predicted_class} size="sm" />
          </div>
          <PhaseFoldChartV2 result={resultA} />
        </div>
        <div className="rounded-lg border border-border-subtle bg-bg-elevated p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono font-semibold text-text-primary">{idB}</span>
            <ClassBadge predictedClass={resultB.predicted_class} size="sm" />
          </div>
          <PhaseFoldChartV2 result={resultB} />
        </div>
      </div>

      <div className="rounded-lg border border-border-subtle bg-bg-elevated p-4">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">Parameter diff</h3>
        <table className="w-full text-sm">
          <thead className="border-b border-border-subtle">
            <tr>
              <th className="px-3 py-2 text-left text-text-muted">Parameter</th>
              <th className="px-3 py-2 text-right text-text-muted">{idA}</th>
              <th className="px-3 py-2 text-right text-text-muted">{idB}</th>
              <th className="px-3 py-2 text-right text-text-muted">Δ</th>
            </tr>
          </thead>
          <tbody>
            {diffRows.map((row) => (
              <tr key={row.param} className="border-b border-border-subtle">
                <td className="px-3 py-2 text-text-primary">{row.param}</td>
                <td className="px-3 py-2 text-right font-mono tabular-nums text-text-secondary">
                  {row.a}
                </td>
                <td className="px-3 py-2 text-right font-mono tabular-nums text-text-secondary">
                  {row.b}
                </td>
                <td className="px-3 py-2 text-right font-mono tabular-nums text-brand-light">
                  {row.delta}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <div className="p-8">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          title="Candidate Comparison"
          subtitle="Side-by-side phase folds and parameter differences."
        />
        <Suspense fallback={<p className="text-text-muted">Loading…</p>}>
          <CompareContent />
        </Suspense>
      </div>
    </div>
  );
}
