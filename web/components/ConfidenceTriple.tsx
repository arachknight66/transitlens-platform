"use client";

import { useRef, useEffect, useState } from "react";
import { useMotionValue, animate } from "framer-motion";
import { statusColor } from "@/lib/design-tokens";
import type { AnalysisResult } from "@/types/analysis";

interface Props {
  result: AnalysisResult;
}

function AnimatedNumber({
  target,
  format,
}: {
  target: number;
  format?: (n: number) => string;
}) {
  const motionValue = useRef(useMotionValue(0)).current;
  const [display, setDisplay] = useState(format ? format(0) : "0");

  useEffect(() => {
    const controls = animate(motionValue, target, {
      duration: 0.8,
      onUpdate: (latest) => {
        setDisplay(format ? format(latest) : Math.round(latest).toString());
      },
    });
    return controls.stop;
  }, [target, motionValue, format]);

  return <>{display}</>;
}

export function ConfidenceTriple({ result }: Props) {
  const detected = result.candidate_detected;
  const snr = detected && result.snr != null ? result.snr : null;
  const confidencePct = result.confidence * 100;
  const transitCount =
    detected && result.features.transit_count != null
      ? result.features.transit_count
      : null;

  const snrColor = statusColor(snr, 4, 7);
  const confColor = statusColor(confidencePct / 100, 0.5, 0.75);
  const countColor = statusColor(transitCount, 2, 3);

  return (
    <div className="confidence-triplet flex items-center gap-6 tabular-nums">
      <div className="confidence-value-block text-center">
        <div
          className="status-dot-sm mx-auto mb-1 h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: snrColor }}
        />
        <div className="value text-3xl font-semibold leading-none text-text-primary">
          {snr != null ? (
            <AnimatedNumber target={snr} format={(n) => n.toFixed(1)} />
          ) : (
            "—"
          )}
        </div>
        <div className="unit mt-1 text-xs uppercase tracking-wider text-text-muted">
          Detection SNR
        </div>
      </div>

      <div className="confidence-triplet-divider h-10 w-px bg-white/10" />

      <div className="confidence-value-block text-center">
        <div
          className="status-dot-sm mx-auto mb-1 h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: confColor }}
        />
        <div className="value text-3xl font-semibold leading-none text-text-primary">
          <AnimatedNumber target={confidencePct} format={(n) => Math.round(n).toString()} />
          <span className="ml-0.5 text-lg font-normal text-text-muted">%</span>
        </div>
        <div className="unit mt-1 text-xs uppercase tracking-wider text-text-muted">
          Classifier confidence
        </div>
      </div>

      <div className="confidence-triplet-divider h-10 w-px bg-white/10" />

      <div className="confidence-value-block text-center">
        <div
          className="status-dot-sm mx-auto mb-1 h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: countColor }}
        />
        <div className="value text-3xl font-semibold leading-none text-text-primary">
          {transitCount != null ? (
            <AnimatedNumber target={transitCount} />
          ) : (
            "—"
          )}
        </div>
        <div className="unit mt-1 text-xs uppercase tracking-wider text-text-muted">
          Transit count
        </div>
      </div>
    </div>
  );
}
