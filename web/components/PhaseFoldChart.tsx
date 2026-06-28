"use client";
import { useMemo, useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { downsample, phaseFold } from "@/lib/phaseFold";
import { formatPeriod } from "@/lib/formatters";
import { PlotContainer } from "./PlotContainer";
import type { AnalysisResult } from "@/types/analysis";

interface Props {
  result: AnalysisResult;
  selectedPeriod?: number | null;
  onPeriodChange?: (period: number) => void;
}

export function PhaseFoldChart({ result, selectedPeriod, onPeriodChange }: Props) {
  const detectedPeriod = result.period_days ?? 1;
  const [localPeriod, setLocalPeriod] = useState<number | null>(null);

  const activePeriod = selectedPeriod ?? localPeriod ?? detectedPeriod;
  const minPeriod = detectedPeriod * 0.5;
  const maxPeriod = detectedPeriod * 2;

  const phasedData = useMemo(() => {
    if (!result.raw_time?.length || !result.raw_flux?.length) {
      return [];
    }

    const time = downsample(result.raw_time);
    const flux = downsample(
      result.raw_flux.slice(0, time.length),
      time.length
    );
    return phaseFold(time, flux, activePeriod);
  }, [result.raw_time, result.raw_flux, activePeriod]);

  const staticPlot = result.plots?.phase_folded;

  if (!phasedData.length && staticPlot) {
    return (
      <PlotContainer
        title="Phase-Folded Light Curve"
        imageSrc={`data:image/png;base64,${staticPlot}`}
      />
    );
  }

  if (!phasedData.length) {
    return null;
  }

  const handlePeriodChange = (value: number) => {
    setLocalPeriod(value);
    onPeriodChange?.(value);
  };

  return (
    <PlotContainer title="Phase-Folded Light Curve">
      <div className="mb-4 space-y-3">
        <div className="flex items-center justify-between text-sm text-text-secondary">
          <span>Period: {formatPeriod(activePeriod)}</span>
          <button
            type="button"
            onClick={() => handlePeriodChange(detectedPeriod)}
            className="rounded-md border border-white/10 px-3 py-1 text-xs text-text-primary transition-colors hover:border-primary hover:text-primary"
          >
            Reset
          </button>
        </div>
        <input
          type="range"
          min={minPeriod}
          max={maxPeriod}
          step={(maxPeriod - minPeriod) / 200}
          value={activePeriod}
          onChange={(e) => handlePeriodChange(parseFloat(e.target.value))}
          className="w-full accent-primary"
        />
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="x"
            type="number"
            domain={[-0.5, 0.5]}
            name="Phase"
            stroke="#888888"
            tick={{ fontSize: 12, fill: "#888888" }}
          />
          <YAxis
            dataKey="y"
            name="Flux"
            stroke="#888888"
            tick={{ fontSize: 12, fill: "#888888" }}
          />
          <Tooltip
            cursor={{ fill: "rgba(83, 74, 183, 0.1)" }}
            contentStyle={{
              backgroundColor: "#1A1A2E",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#FAFAFA",
            }}
          />
          <ReferenceLine
            x={0}
            stroke="#534AB7"
            strokeWidth={2}
            label={{ value: "Transit center", fill: "#534AB7", fontSize: 11 }}
          />
          <Scatter
            name="Phase-folded flux"
            data={phasedData}
            fill="#8A81F2"
            fillOpacity={0.5}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </PlotContainer>
  );
}
