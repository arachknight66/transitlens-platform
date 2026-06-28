"use client";

import { ClassBadge } from "@/components/ClassBadge";
import { getClassConfig } from "@/lib/classConfig";

const CANDIDATE_META = {
  a: {
    name: "Candidate A",
    expectedClass: "exoplanet_transit",
    desc: "Shallow 1.3% dip every 3.42 d — Jupiter-sized planet transit.",
    bgClass: "bg-cls-planet-bg",
    borderClass: "border-cls-planet-border",
    sparkline: (
      <svg viewBox="0 0 120 40" width="120" height="40" aria-hidden>
        <polyline
          points="0,12 10,12 14,22 18,28 22,22 24,12 40,12 44,22 48,28 52,22 54,12 70,12 74,22 78,28 82,22 84,12 100,12 104,22 108,28 112,22 114,12 120,12"
          fill="none"
          stroke="rgba(138,129,242,0.7)"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  b: {
    name: "Candidate B",
    expectedClass: "eclipsing_binary",
    desc: "Deep 18% V-shaped eclipse every 1.87 d — eclipsing binary.",
    bgClass: "bg-cls-binary-bg",
    borderClass: "border-cls-binary-border",
    sparkline: (
      <svg viewBox="0 0 120 40" width="120" height="40" aria-hidden>
        <polyline
          points="0,8 20,8 30,36 40,8 60,8 70,36 80,8 100,8 110,36 120,8"
          fill="none"
          stroke="rgba(180,80,60,0.7)"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  c: {
    name: "Candidate C",
    expectedClass: "stellar_variability_or_other",
    desc: "No periodic signal — correlated red noise / stellar variability.",
    bgClass: "bg-cls-noise-bg",
    borderClass: "border-cls-noise-border",
    sparkline: (
      <svg viewBox="0 0 120 40" width="120" height="40" aria-hidden>
        <polyline
          points="0,18 10,20 20,16 30,24 40,17 50,23 60,19 70,22 80,16 90,24 100,18 110,21 120,20"
          fill="none"
          stroke="rgba(136,135,128,0.7)"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
} as const;

interface Props {
  candidateId: "a" | "b" | "c";
  selected: boolean;
  onSelect: () => void;
}

export function WorkspaceCandidateCard({ candidateId, selected, onSelect }: Props) {
  const candidate = CANDIDATE_META[candidateId];
  const cfg = getClassConfig(candidate.expectedClass);

  return (
    <label
      className={`flex cursor-pointer flex-col rounded-lg border border-l-4 p-4 transition-all duration-fast ${
        selected
          ? `${candidate.bgClass} ${candidate.borderClass} ring-1 ring-brand/30`
          : "border-border-subtle border-l-transparent bg-bg-elevated hover:border-border-soft"
      }`}
      style={selected ? { borderLeftColor: cfg.colorHex } : undefined}
    >
      <input
        type="radio"
        name="demo-candidate"
        checked={selected}
        onChange={onSelect}
        className="sr-only"
      />
      <div className="mb-3">{candidate.sparkline}</div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="font-semibold text-text-primary">{candidate.name}</span>
        <ClassBadge predictedClass={candidate.expectedClass} size="sm" />
      </div>
      <p className="text-sm text-text-secondary">{candidate.desc}</p>
    </label>
  );
}

export function getDemoTargetId(candidateId: "a" | "b" | "c"): string {
  return `candidate_${candidateId}`;
}
