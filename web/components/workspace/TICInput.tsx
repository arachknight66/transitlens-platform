"use client";

import { lookupTic, sanitizeTicId, TIC_QUICK_SELECT } from "@/lib/ticLookup";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function TICInput({ value, onChange }: Props) {
  const clean = sanitizeTicId(value);
  const known = clean ? lookupTic(clean) : null;
  const invalid = value.length > 0 && clean.length === 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {TIC_QUICK_SELECT.map((target) => (
          <button
            key={target.id}
            type="button"
            onClick={() => onChange(target.id)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors duration-fast ${
              clean === target.id
                ? "border-brand bg-brand-ghost text-text-primary"
                : "border-border-soft text-text-secondary hover:border-brand/50"
            }`}
          >
            {target.name}
          </button>
        ))}
      </div>

      <div className="flex items-center rounded-md border border-border-soft bg-bg-surface">
        <span className="border-r border-border-subtle px-3 py-2 text-sm font-medium text-text-muted">
          TIC
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ""))}
          placeholder="261136679"
          className="flex-1 bg-transparent px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          aria-label="TESS Input Catalog ID"
        />
      </div>

      {invalid && (
        <p className="text-sm text-status-error">TIC ID must be numeric.</p>
      )}

      {known && (
        <div className="rounded-md border border-brand/20 bg-brand-ghost px-3 py-2 text-sm">
          <span className="font-medium text-text-primary">{known.name}</span>
          <span className="ml-2 text-text-secondary">{known.description}</span>
          {known.sector && (
            <span className="ml-2 text-xs text-text-muted">{known.sector}</span>
          )}
        </div>
      )}
    </div>
  );
}

export function getTicTargetId(ticId: string): string {
  const clean = sanitizeTicId(ticId);
  return clean ? `TIC-${clean}` : "";
}
