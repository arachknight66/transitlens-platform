"use client";

import type { CandidateFilters, ClassFilter } from "@/types/candidate";
import { DEFAULT_CANDIDATE_FILTERS } from "@/types/candidate";

interface Props {
  filters: CandidateFilters;
  onChange: (filters: CandidateFilters) => void;
}

const CLASS_OPTIONS: { id: ClassFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "exoplanet_transit", label: "Planet" },
  { id: "eclipsing_binary", label: "EB" },
  { id: "blend_contamination", label: "Blend" },
  { id: "stellar_variability_or_other", label: "Noise" },
];

export function CandidateFiltersPanel({ filters, onChange }: Props) {
  const set = (patch: Partial<CandidateFilters>) =>
    onChange({ ...filters, ...patch });

  return (
    <aside className="space-y-6 rounded-lg border border-border-subtle bg-bg-elevated p-4">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
          Class
        </p>
        <div className="space-y-1">
          {CLASS_OPTIONS.map((opt) => (
            <label
              key={opt.id}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-white/5"
            >
              <input
                type="radio"
                name="class-filter"
                checked={filters.classFilter === opt.id}
                onChange={() => set({ classFilter: opt.id })}
                className="accent-brand"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-muted">
          SNR minimum
        </label>
        <input
          type="number"
          step="0.5"
          min="0"
          placeholder="e.g. 5.0"
          value={filters.minSnr ?? ""}
          onChange={(e) =>
            set({
              minSnr: e.target.value === "" ? null : parseFloat(e.target.value),
            })
          }
          className="w-full rounded-md border border-border-soft bg-bg-surface px-3 py-2 text-sm tabular-nums text-text-primary"
        />
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
          Blend risk
        </p>
        <select
          value={filters.blendRisk}
          onChange={(e) =>
            set({ blendRisk: e.target.value as CandidateFilters["blendRisk"] })
          }
          className="w-full rounded-md border border-border-soft bg-bg-surface px-3 py-2 text-sm text-text-primary"
        >
          <option value="all">All</option>
          <option value="low">Low</option>
          <option value="suspected">Suspected</option>
        </select>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
          Detection
        </p>
        <select
          value={filters.detection}
          onChange={(e) =>
            set({ detection: e.target.value as CandidateFilters["detection"] })
          }
          className="w-full rounded-md border border-border-soft bg-bg-surface px-3 py-2 text-sm text-text-primary"
        >
          <option value="all">All</option>
          <option value="detected">Detected</option>
          <option value="not_detected">Not detected</option>
        </select>
      </div>

      <button
        type="button"
        onClick={() => onChange(DEFAULT_CANDIDATE_FILTERS)}
        className="w-full rounded-md border border-border-soft px-3 py-2 text-xs text-text-secondary hover:text-text-primary"
      >
        Reset filters
      </button>
    </aside>
  );
}
