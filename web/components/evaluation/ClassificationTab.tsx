"use client";

import { useState } from "react";
import { getClassConfig } from "@/lib/classConfig";
import type { SplitMetrics } from "@/types/evaluation";

interface Props {
  split: SplitMetrics;
  title?: string;
}

export function ConfusionMatrix({ split, title = "Confusion Matrix" }: Props) {
  const cm = split.confusion_matrix;
  const [selectedCell, setSelectedCell] = useState<{
    trueLabel: string;
    predLabel: string;
  } | null>(null);

  if (!cm) {
    return (
      <p className="text-sm text-text-muted">Confusion matrix not available.</p>
    );
  }

  const { labels, matrix } = cm;
  const maxVal = Math.max(...matrix.flat(), 1);

  const cellTargets =
    selectedCell && split.confusion_details
      ? split.confusion_details[
          `${selectedCell.trueLabel}|${selectedCell.predLabel}`
        ] ?? []
      : [];

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-text-primary">{title}</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="p-2 text-left text-text-muted">True \\ Pred</th>
              {labels.map((l) => (
                <th key={l} className="p-2 text-center text-text-muted">
                  {getClassConfig(l).display.split(" ")[0]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {labels.map((trueLabel, i) => (
              <tr key={trueLabel}>
                <td className="p-2 font-medium text-text-secondary">
                  {getClassConfig(trueLabel).display.split(" ")[0]}
                </td>
                {labels.map((predLabel, j) => {
                  const count = matrix[i][j];
                  const intensity = count / maxVal;
                  const isSelected =
                    selectedCell?.trueLabel === trueLabel &&
                    selectedCell?.predLabel === predLabel;
                  return (
                    <td key={predLabel} className="p-1">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedCell(
                            count > 0 ? { trueLabel, predLabel } : null
                          )
                        }
                        className={`flex h-10 w-full min-w-[2.5rem] items-center justify-center rounded tabular-nums transition-all ${
                          isSelected ? "ring-2 ring-brand" : ""
                        }`}
                        style={{
                          backgroundColor: `rgba(83,74,183,${0.1 + intensity * 0.7})`,
                          color: intensity > 0.5 ? "#fff" : "#ccc",
                        }}
                        title={`${trueLabel} → ${predLabel}: ${count}`}
                      >
                        {count}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCell && (
        <div className="mt-3 rounded-md border border-border-subtle bg-bg-surface p-3">
          <p className="mb-2 text-xs text-text-muted">
            Targets: {getClassConfig(selectedCell.trueLabel).display} →{" "}
            {getClassConfig(selectedCell.predLabel).display}
          </p>
          {cellTargets.length > 0 ? (
            <ul className="flex flex-wrap gap-1">
              {cellTargets.map((t) => (
                <li
                  key={t}
                  className="rounded bg-brand-ghost px-2 py-0.5 font-mono text-2xs text-text-primary"
                >
                  {t}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-2xs text-text-muted">No target list for this cell.</p>
          )}
        </div>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  help,
}: {
  label: string;
  value: string;
  help?: string;
}) {
  return (
    <div
      className="rounded-lg border border-border-subtle bg-bg-elevated p-4"
      title={help}
    >
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-text-primary">
        {value}
      </p>
    </div>
  );
}

export function ClassificationTab({
  valMetrics,
  testMetrics,
  overallF1,
}: {
  valMetrics: SplitMetrics;
  testMetrics: SplitMetrics;
  overallF1: number;
}) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          label="Validation Accuracy"
          value={`${(valMetrics.accuracy * 100).toFixed(1)}%`}
          help="Disjoint validation target list"
        />
        <MetricCard
          label="Test Accuracy"
          value={`${(testMetrics.accuracy * 100).toFixed(1)}%`}
          help="Blind test split"
        />
        <MetricCard
          label="Overall F1"
          value={`${(overallF1 * 100).toFixed(1)}%`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ConfusionMatrix split={testMetrics} title="Test Split Confusion Matrix" />
        <div>
          <h4 className="mb-3 text-sm font-semibold text-text-primary">
            Per-Class Precision / Recall (Test)
          </h4>
          <div className="overflow-x-auto rounded-lg border border-border-subtle">
            <table className="w-full text-sm">
              <thead className="border-b border-border-subtle bg-bg-elevated">
                <tr>
                  <th className="px-3 py-2 text-left text-text-muted">Class</th>
                  <th className="px-3 py-2 text-right text-text-muted">Prec</th>
                  <th className="px-3 py-2 text-right text-text-muted">Recall</th>
                  <th className="px-3 py-2 text-right text-text-muted">F1</th>
                  <th className="px-3 py-2 text-left text-text-muted">Bar</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(testMetrics.per_class).map(([cls, m]) => (
                  <tr key={cls} className="border-b border-border-subtle">
                    <td className="px-3 py-2 text-text-primary">
                      {getClassConfig(cls).display}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-text-secondary">
                      {(m.precision * 100).toFixed(1)}%
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-text-secondary">
                      {(m.recall * 100).toFixed(1)}%
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-text-primary">
                      {(m.f1 * 100).toFixed(1)}%
                    </td>
                    <td className="px-3 py-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-bg-overlay">
                        <div
                          className="h-full rounded-full bg-brand"
                          style={{ width: `${m.f1 * 100}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
