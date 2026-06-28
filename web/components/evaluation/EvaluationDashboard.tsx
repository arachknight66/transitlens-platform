"use client";

import { useEffect, useState } from "react";
import {
  loadEvaluationMetrics,
  loadInjectionRecoverySummary,
} from "@/lib/evaluation";
import { ClassificationTab } from "./ClassificationTab";
import { ParameterRecoveryTab } from "./ParameterRecoveryTab";
import { InjectionRecoveryTab } from "./InjectionRecoveryTab";
import type { EvaluationMetrics, InjectionRecoveryRow } from "@/types/evaluation";

export function EvaluationDashboard() {
  const [metrics, setMetrics] = useState<EvaluationMetrics | null>(null);
  const [injectionRows, setInjectionRows] = useState<InjectionRecoveryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "classification" | "parameters" | "injection"
  >("classification");

  useEffect(() => {
    Promise.all([loadEvaluationMetrics(), loadInjectionRecoverySummary()]).then(
      ([m, rows]) => {
        setMetrics(m);
        setInjectionRows(rows);
        setLoading(false);
      }
    );
  }, []);

  const tabs = [
    { id: "classification" as const, label: "Classification" },
    { id: "parameters" as const, label: "Parameter Recovery" },
    { id: "injection" as const, label: "Injection-Recovery" },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-text-muted">
        Loading evaluation metrics…
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="rounded-lg border border-border-subtle bg-bg-elevated p-8 text-center">
        <p className="text-base text-text-secondary">
          Evaluation metrics file not found.
        </p>
        <p className="mt-2 text-sm text-text-muted">
          Run the official evaluation profile in the CLI to generate{" "}
          <code className="text-brand">metrics.json</code> under{" "}
          <code className="text-brand">transitlens-ml-core/eval/results/</code>, or
          use the bundled demo data in <code className="text-brand">public/eval/</code>.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div
        className="mb-6 flex gap-2 border-b border-border-subtle"
        role="tablist"
        aria-label="Evaluation sections"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors duration-fast ${
              activeTab === tab.id
                ? "border-b-2 border-brand text-text-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "classification" && (
        <ClassificationTab
          valMetrics={metrics.val_metrics}
          testMetrics={metrics.test_metrics}
          overallF1={metrics.overall_f1}
        />
      )}

      {activeTab === "parameters" && (
        <ParameterRecoveryTab
          valMetrics={metrics.val_metrics}
          testMetrics={metrics.test_metrics}
          overallRecoveryPct={metrics.overall_period_recovery_pct}
        />
      )}

      {activeTab === "injection" && (
        <InjectionRecoveryTab metrics={metrics} summaryRows={injectionRows} />
      )}
    </div>
  );
}
