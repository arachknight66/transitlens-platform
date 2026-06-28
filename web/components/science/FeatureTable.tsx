"use client";

import { useMemo, useState } from "react";
import {
  FEATURE_GROUPS,
  passesThreshold,
  type FeatureCategory,
} from "@/lib/featureGroups";
import type { AnalysisResult } from "@/types/analysis";

interface Props {
  result: AnalysisResult;
}

const CATEGORY_ORDER: FeatureCategory[] = ["Detection", "Shape", "Noise", "Blend"];

export function FeatureTable({ result }: Props) {
  const [filter, setFilter] = useState("");

  const grouped = useMemo(() => {
    const q = filter.toLowerCase();
    const filtered = FEATURE_GROUPS.filter(
      (f) =>
        !q ||
        f.label.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
    );

    const map = new Map<FeatureCategory, typeof FEATURE_GROUPS>();
    for (const cat of CATEGORY_ORDER) {
      map.set(
        cat,
        filtered.filter((f) => f.category === cat)
      );
    }
    return map;
  }, [filter]);

  return (
    <div>
      <input
        type="search"
        placeholder="Filter features…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="mb-3 w-full rounded-md border border-border-soft bg-bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand"
      />

      <div className="max-h-[480px] overflow-auto rounded-lg border border-border-subtle">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 border-b border-border-subtle bg-bg-elevated">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-text-muted">
                Feature
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium text-text-muted">
                Value
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium text-text-muted">
                Threshold
              </th>
            </tr>
          </thead>
          <tbody>
            {CATEGORY_ORDER.map((cat) => {
              const rows = grouped.get(cat) ?? [];
              if (!rows.length) return null;
              return (
                <CategoryRows
                  key={cat}
                  category={cat}
                  rows={rows}
                  features={result.features}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CategoryRows({
  category,
  rows,
  features,
}: {
  category: string;
  rows: typeof FEATURE_GROUPS;
  features: AnalysisResult["features"];
}) {
  return (
    <>
      <tr className="bg-bg-surface">
        <td
          colSpan={3}
          className="sticky top-8 z-[5] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-text-muted"
        >
          {category}
        </td>
      </tr>
      {rows.map(({ key, label, threshold, thresholdOp }) => {
        const value = features[key] ?? null;
        const display = value != null ? value.toFixed(4) : "—";
        const pass =
          threshold != null && thresholdOp
            ? passesThreshold(value as number | null, threshold, thresholdOp)
            : null;

        return (
          <tr
            key={key}
            className="border-b border-border-subtle transition-colors hover:bg-white/[0.03]"
          >
            <td className="px-4 py-2.5 text-text-secondary">{label}</td>
            <td className="px-4 py-2.5 text-right font-mono tabular-nums text-text-primary">
              {display}
            </td>
            <td className="px-4 py-2.5 text-right text-xs text-text-muted">
              {threshold != null ? (
                <span className="inline-flex items-center gap-1.5">
                  {pass === true && (
                    <span className="text-status-ok" aria-label="Pass">
                      ✓
                    </span>
                  )}
                  {pass === false && (
                    <span className="text-status-error" aria-label="Fail">
                      ✗
                    </span>
                  )}
                  {thresholdOp === ">=" && `≥ ${threshold}`}
                  {thresholdOp === "<=" && `≤ ${threshold}`}
                  {thresholdOp === ">" && `> ${threshold}`}
                </span>
              ) : (
                "—"
              )}
            </td>
          </tr>
        );
      })}
    </>
  );
}
