"use client";

import { useCallback, useEffect, useRef } from "react";
import { ClassBadge } from "@/components/ClassBadge";
import { formatPeriod } from "@/lib/formatters";
import { classEmoji } from "@/lib/candidateUtils";
import type { CandidateRecord, CandidateSortKey } from "@/types/candidate";
import type { Annotation } from "@/types/analysis";

interface Props {
  rows: CandidateRecord[];
  selectedIds: Set<string>;
  focusedIndex: number;
  sortKey: CandidateSortKey;
  sortDir: "asc" | "desc";
  onSort: (key: CandidateSortKey) => void;
  onSelectRow: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onOpenRow: (row: CandidateRecord) => void;
  onFocusIndex: (index: number) => void;
  annotations?: Record<string, Annotation>;
}

const COLUMNS: { key: CandidateSortKey | null; label: string; align?: "right" }[] = [
  { key: null, label: "" },
  { key: "targetId", label: "Target" },
  { key: "predictedClass", label: "Class" },
  { key: "confidence", label: "Conf", align: "right" },
  { key: "periodDays", label: "Period", align: "right" },
  { key: "snr", label: "SNR", align: "right" },
  { key: null, label: "Flags" },
];

export function CandidateTable({
  rows,
  selectedIds,
  focusedIndex,
  sortKey,
  sortDir,
  onSort,
  onSelectRow,
  onToggleSelect,
  onOpenRow,
  onFocusIndex,
  annotations,
}: Props) {
  const tableRef = useRef<HTMLTableElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!rows.length) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        onFocusIndex(Math.min(rows.length - 1, focusedIndex + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        onFocusIndex(Math.max(0, focusedIndex - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const row = rows[focusedIndex];
        if (row) onOpenRow(row);
      } else if (e.key === " ") {
        e.preventDefault();
        const row = rows[focusedIndex];
        if (row) onToggleSelect(row.targetId);
      }
    },
    [rows, focusedIndex, onFocusIndex, onOpenRow, onToggleSelect]
  );

  useEffect(() => {
    const row = tableRef.current?.querySelector(`[data-row-index="${focusedIndex}"]`);
    row?.scrollIntoView({ block: "nearest" });
  }, [focusedIndex]);

  return (
    <div
      className="overflow-auto rounded-lg border border-border-subtle"
      style={{ maxHeight: rows.length > 100 ? 520 : undefined }}
    >
      <table
        ref={tableRef}
        className="w-full min-w-[640px] text-sm"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label="Candidate results table"
      >
        <thead className="sticky top-0 z-10 border-b border-border-subtle bg-bg-elevated">
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col.label || "select"}
                className={`px-3 py-2.5 text-xs font-medium text-text-muted ${
                  col.align === "right" ? "text-right" : "text-left"
                }`}
              >
                {col.key ? (
                  <button
                    type="button"
                    onClick={() => onSort(col.key!)}
                    className="inline-flex items-center gap-1 hover:text-text-primary"
                  >
                    {col.label}
                    {sortKey === col.key && (
                      <span aria-hidden>{sortDir === "asc" ? "↑" : "↓"}</span>
                    )}
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const isFocused = index === focusedIndex;
            const isSelected = selectedIds.has(row.targetId);
            return (
              <tr
                key={row.targetId}
                data-row-index={index}
                onClick={() => onSelectRow(row.targetId)}
                onDoubleClick={() => onOpenRow(row)}
                className={`cursor-pointer border-b border-border-subtle transition-colors ${
                  isFocused ? "bg-brand-ghost" : "hover:bg-white/[0.03]"
                } ${isSelected ? "ring-1 ring-inset ring-brand/40" : ""}`}
              >
                <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(row.targetId)}
                    aria-label={`Select ${row.targetId}`}
                    className="accent-brand"
                  />
                </td>
                <td className="px-3 py-2.5 font-mono text-text-primary">
                  {classEmoji(row.predictedClass)} {row.targetId}
                </td>
                <td className="px-3 py-2.5">
                  <ClassBadge predictedClass={row.predictedClass} size="sm" />
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-text-primary">
                  {Math.round(row.confidence * 100)}%
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-text-secondary">
                  {row.periodDays ? formatPeriod(row.periodDays) : "—"}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-text-secondary">
                  {row.snr?.toFixed(1) ?? "—"}
                </td>
                <td className="px-3 py-2.5 text-right text-2xs text-text-muted">
                  <span className="flex items-center justify-end gap-1.5">
                    {annotations?.[row.targetId]?.flagged && (
                      <span
                        title={`[${annotations[row.targetId].priority}] ${annotations[row.targetId].category}${annotations[row.targetId].notes ? `: ${annotations[row.targetId].notes}` : ""}`}
                        className="text-status-error cursor-help text-xs"
                      >
                        🚩
                      </span>
                    )}
                    <span>
                      {row.blendRisk === "suspected" ? "blend" : row.flags.length ? "⚑" : "—"}
                    </span>
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {rows.length === 0 && (
        <p className="p-8 text-center text-sm text-text-muted">No candidates match filters.</p>
      )}
    </div>
  );
}
