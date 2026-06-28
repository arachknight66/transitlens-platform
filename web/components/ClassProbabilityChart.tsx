"use client";
import { getClassConfig } from "@/lib/classConfig";
import type { ClassProbabilities } from "@/types/analysis";

const CLASS_ORDER = [
  "exoplanet_transit",
  "eclipsing_binary",
  "blend_contamination",
  "stellar_variability_or_other",
] as const;

interface Props {
  probabilities: ClassProbabilities;
}

export function ClassProbabilityChart({ probabilities }: Props) {
  return (
    <div className="space-y-2">
      {CLASS_ORDER.map((cls) => {
        const prob = probabilities[cls] ?? 0;
        const pct = prob * 100;
        const cfg = getClassConfig(cls);

        return (
          <div key={cls}>
            <div className="mb-0.5 flex justify-between text-body">
              <span className="text-text-secondary">{cfg.display}</span>
              <span className="font-semibold text-text-primary">{pct.toFixed(1)}%</span>
            </div>
            <div className="h-4 overflow-hidden rounded-sm bg-white/5">
              <div
                className="feature-bar h-full rounded-sm"
                style={
                  {
                    "--bar-w": `${pct}%`,
                    backgroundColor: cfg.colorHex,
                  } as React.CSSProperties
                }
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
