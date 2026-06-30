"use client";

import { useState } from "react";
import { getTesscutSectors } from "@/lib/api";
import { lookupTic, sanitizeTicId, TIC_QUICK_SELECT } from "@/lib/ticLookup";

interface Props {
  value: string;
  onChange: (value: string) => void;
  sector?: number;
  onSectorChange: (sector: number | undefined) => void;
  cutoutSize: number;
  onCutoutSizeChange: (size: number) => void;
}

export function TICInput({ value, onChange, sector, onSectorChange, cutoutSize, onCutoutSizeChange }: Props) {
  const clean = sanitizeTicId(value);
  const known = clean ? lookupTic(clean) : null;
  const [sectors, setSectors] = useState<number[]>([]);
  const [status, setStatus] = useState<string>("");

  const discover = async () => {
    if (!clean) return;
    setStatus("Resolving TIC coordinates and querying TESScut coverage…");
    try {
      const result = await getTesscutSectors(clean);
      setSectors(result.sectors);
      onSectorChange(result.default_sector ?? undefined);
      setStatus(result.sectors.length
        ? `Found ${result.sectors.length} sector(s); newest sector selected explicitly.`
        : "No TESScut coverage was returned.");
    } catch (caught) {
      setSectors([]);
      setStatus(caught instanceof Error ? caught.message : "Sector lookup failed.");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {TIC_QUICK_SELECT.map((target) => (
          <button key={target.id} type="button" onClick={() => { onChange(target.id); onSectorChange(undefined); }}
            className={`rounded-full border px-3 py-1 text-xs ${clean === target.id ? "border-brand bg-brand-ghost" : "border-border-soft text-text-secondary"}`}>
            {target.name}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex flex-1 items-center rounded-md border border-border-soft bg-bg-surface">
          <span className="border-r border-border-subtle px-3 py-2 text-sm text-text-muted">TIC</span>
          <input type="text" inputMode="numeric" value={value}
            onChange={(event) => { onChange(event.target.value.replace(/[^\d]/g, "")); onSectorChange(undefined); setSectors([]); }}
            placeholder="261136679" className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none" />
        </div>
        <button type="button" disabled={!clean} onClick={() => void discover()}
          className="rounded-md border border-brand/50 px-3 py-2 text-xs text-brand-light disabled:opacity-40">Find sectors</button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-xs text-text-muted">Sector
          <select value={sector ?? ""} disabled={!sectors.length}
            onChange={(event) => onSectorChange(event.target.value ? Number(event.target.value) : undefined)}
            className="mt-1 w-full rounded-md border border-border-soft bg-bg-surface px-2 py-2 text-text-primary">
            <option value="">Select after lookup</option>
            {sectors.map((item) => <option key={item} value={item}>Sector {item}</option>)}
          </select>
        </label>
        <label className="text-xs text-text-muted">Cutout
          <select value={cutoutSize} onChange={(event) => onCutoutSizeChange(Number(event.target.value))}
            className="mt-1 w-full rounded-md border border-border-soft bg-bg-surface px-2 py-2 text-text-primary">
            {[11, 15, 21].map((size) => <option key={size} value={size}>{size} × {size} pixels</option>)}
          </select>
        </label>
      </div>
      <p className="text-2xs text-text-muted">TESScut returns a target-pixel cube. TransitLens applies quality masking, background subtraction, and deterministic aperture photometry before analysis.</p>
      {status && <p className="text-xs text-text-secondary">{status}</p>}
      {known && <div className="rounded-md border border-brand/20 bg-brand-ghost px-3 py-2 text-sm"><span className="font-medium">{known.name}</span><span className="ml-2 text-text-secondary">{known.description}</span></div>}
    </div>
  );
}

export function getTicTargetId(ticId: string): string {
  const clean = sanitizeTicId(ticId);
  return clean ? `TIC-${clean}` : "";
}
