"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  loadCandidates,
  exportCandidatesCsv,
  downloadCsv,
} from "@/lib/candidates";
import {
  filterCandidates,
  sortCandidates,
} from "@/lib/candidateUtils";
import { CandidateFiltersPanel } from "./CandidateFiltersPanel";
import { CandidateTable } from "./CandidateTable";
import { CandidateDetailPanel } from "./CandidateDetailPanel";
import type {
  CandidateRecord,
  CandidateFilters,
  CandidateSortKey,
} from "@/types/candidate";
import { DEFAULT_CANDIDATE_FILTERS } from "@/types/candidate";

export function CandidateExplorer() {
  const router = useRouter();
  const [allRows, setAllRows] = useState<CandidateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CandidateFilters>(DEFAULT_CANDIDATE_FILTERS);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<CandidateSortKey>("targetId");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [detailTarget, setDetailTarget] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);

  useEffect(() => {
    loadCandidates().then((rows) => {
      setAllRows(rows);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    const merged = { ...filters, search };
    return sortCandidates(filterCandidates(allRows, merged), sortKey, sortDir);
  }, [allRows, filters, search, sortKey, sortDir]);

  const detailRow = detailTarget
    ? filtered.find((r) => r.targetId === detailTarget) ??
      allRows.find((r) => r.targetId === detailTarget)
    : null;

  const handleSort = (key: CandidateSortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExport = () => {
    const exportRows =
      selectedIds.size > 0
        ? filtered.filter((r) => selectedIds.has(r.targetId))
        : filtered;
    downloadCsv(
      `candidates_export_${Date.now()}.csv`,
      exportCandidatesCsv(exportRows)
    );
  };

  const handleCompare = () => {
    const ids = Array.from(selectedIds);
    if (ids.length !== 2) return;
    router.push(`/compare?a=${encodeURIComponent(ids[0])}&b=${encodeURIComponent(ids[1])}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-text-muted">
        Loading candidates…
      </div>
    );
  }

  return (
    <div
      className={`grid gap-6 ${detailRow ? "lg:grid-cols-[200px_1fr_280px]" : "lg:grid-cols-[200px_1fr]"}`}
    >
      <CandidateFiltersPanel filters={filters} onChange={setFilters} />

      <div className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            placeholder="Search targets…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-[200px] flex-1 rounded-md border border-border-soft bg-bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand"
          />

          <select
            value={`${sortKey}-${sortDir}`}
            onChange={(e) => {
              const [k, d] = e.target.value.split("-") as [CandidateSortKey, "asc" | "desc"];
              setSortKey(k);
              setSortDir(d);
            }}
            className="rounded-md border border-border-soft bg-bg-surface px-3 py-2 text-sm text-text-primary"
            aria-label="Sort order"
          >
            <option value="targetId-asc">Target A→Z</option>
            <option value="confidence-desc">Confidence ↓</option>
            <option value="snr-desc">SNR ↓</option>
            <option value="periodDays-asc">Period ↑</option>
          </select>

          <div className="relative">
            <button
              type="button"
              onClick={handleExport}
              className="rounded-md border border-border-soft px-3 py-2 text-sm text-text-secondary hover:text-text-primary"
            >
              Export ▾
            </button>
          </div>

          <button
            type="button"
            onClick={() => setCompareMode((v) => !v)}
            className={`rounded-md border px-3 py-2 text-sm transition-colors ${
              compareMode
                ? "border-brand bg-brand-ghost text-text-primary"
                : "border-border-soft text-text-secondary hover:text-text-primary"
            }`}
          >
            Compare
          </button>

          {compareMode && selectedIds.size === 2 && (
            <button
              type="button"
              onClick={handleCompare}
              className="rounded-md bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-core"
            >
              Open comparison
            </button>
          )}
        </div>

        <p className="text-xs text-text-muted">
          {filtered.length} candidate{filtered.length !== 1 ? "s" : ""}
          {selectedIds.size > 0 && ` · ${selectedIds.size} selected`}
          {compareMode && " · select exactly 2 to compare"}
        </p>

        <CandidateTable
          rows={filtered}
          selectedIds={selectedIds}
          focusedIndex={focusedIndex}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          onSelectRow={setDetailTarget}
          onToggleSelect={toggleSelect}
          onOpenRow={(row) => router.push(`/results/${row.targetId}`)}
          onFocusIndex={setFocusedIndex}
        />
      </div>

      {detailRow && (
        <CandidateDetailPanel
          candidate={detailRow}
          onClose={() => setDetailTarget(null)}
        />
      )}
    </div>
  );
}
