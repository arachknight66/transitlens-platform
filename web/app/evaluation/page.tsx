"use client";

import dynamic from "next/dynamic";
import { PageHeader } from "@/components/layout/PageHeader";
import { SkeletonCard } from "@/components/SkeletonCard";

const EvaluationDashboard = dynamic(
  () =>
    import("@/components/evaluation/EvaluationDashboard").then((m) => ({
      default: m.EvaluationDashboard,
    })),
  {
    loading: () => (
      <div className="space-y-4">
        <SkeletonCard height="80px" />
        <SkeletonCard height="320px" />
      </div>
    ),
  }
);

export default function EvaluationPage() {
  return (
    <div className="p-8">
      <div className="mx-auto max-w-6xl">
        <PageHeader
          title="Evaluation Dashboard"
          subtitle="Classification accuracy, parameter recovery, and injection-recovery benchmarks."
        />
        <EvaluationDashboard />
      </div>
    </div>
  );
}
