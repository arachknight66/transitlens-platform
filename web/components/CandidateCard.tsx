"use client";
import { motion } from "framer-motion";
import { ClassBadge } from "./ClassBadge";
import { SkeletonCard } from "./SkeletonCard";
import { getClassConfig } from "@/lib/classConfig";

interface Props {
  candidateId: "a" | "b" | "c";
  onClick: () => void;
  loading?: boolean;
}

const CANDIDATE_META = {
  a: {
    name: "Candidate A",
    expectedClass: "exoplanet_transit",
    desc: "A shallow 1.3% periodic dip every 3.42 days consistent with a Jupiter-sized planet.",
    sparkline: (
      <svg viewBox="0 0 120 40" width="120" height="40" xmlns="http://www.w3.org/2000/svg">
        <polyline
          points="0,12 10,12 12,12 14,22 18,28 22,22 24,12 40,12 42,12 44,22 48,28 52,22 54,12 70,12 72,12 74,22 78,28 82,22 84,12 100,12 102,12 104,22 108,28 112,22 114,12 120,12"
          fill="none"
          stroke="rgba(138,129,242,0.7)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  b: {
    name: "Candidate B",
    expectedClass: "eclipsing_binary",
    desc: "A deep 18% V-shaped eclipse every 1.87 days characteristic of an eclipsing stellar binary.",
    sparkline: (
      <svg viewBox="0 0 120 40" width="120" height="40" xmlns="http://www.w3.org/2000/svg">
        <polyline
          points="0,8 15,8 20,8 30,36 40,8 55,8 60,8 70,36 80,8 95,8 100,8 110,36 120,8"
          fill="none"
          stroke="rgba(180,80,60,0.7)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  c: {
    name: "Candidate C",
    expectedClass: "stellar_variability_or_other",
    desc: "No periodic signal detected. Correlated red noise simulating stellar variability.",
    sparkline: (
      <svg viewBox="0 0 120 40" width="120" height="40" xmlns="http://www.w3.org/2000/svg">
        <polyline
          points="0,18 5,14 10,20 15,16 20,22 25,19 30,24 35,17 40,21 45,15 50,23 55,20 60,25 65,18 70,22 75,16 80,20 85,24 90,19 95,22 100,17 105,21 110,18 115,23 120,20"
          fill="none"
          stroke="rgba(136,135,128,0.7)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
} as const;

export function CandidateCard({ candidateId, onClick, loading = false }: Props) {
  const candidate = CANDIDATE_META[candidateId];
  const cfg = getClassConfig(candidate.expectedClass);

  if (loading) {
    return <SkeletonCard height="280px" />;
  }

  return (
    <motion.div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      className="candidate-card cursor-pointer rounded-lg border border-white/10 bg-bg-card p-6 transition-all"
      style={{ borderLeftWidth: 4, borderLeftColor: cfg.colorHex }}
      whileHover={{ y: -2, boxShadow: "0 4px 20px rgba(83,74,183,0.25)" }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="mb-4">{candidate.sparkline}</div>

      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-heading font-semibold text-text-primary">{candidate.name}</h3>
        <ClassBadge predictedClass={candidate.expectedClass} size="sm" />
      </div>

      <p className="mb-4 line-clamp-3 text-body text-text-secondary">{candidate.desc}</p>

      <button
        type="button"
        className="w-full rounded-md bg-primary px-4 py-2 font-medium text-white transition-colors hover:bg-primary/90"
      >
        Analyze
      </button>
    </motion.div>
  );
}
