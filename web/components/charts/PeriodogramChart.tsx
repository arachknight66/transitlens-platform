"use client";

import { useMemo, useState } from "react";
import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { syntheticPeriodogram } from "@/lib/phaseFold";
import { formatPeriod } from "@/lib/formatters";
import { LazyPlotImage } from "@/components/ui/LazyPlotImage";
import { useTransitStore } from "@/lib/store";
import type { AnalysisResult } from "@/types/analysis";

interface Props {
  result: AnalysisResult;
  onPeriodSelect?: (period: number) => void;
}

export function PeriodogramChart({ result, onPeriodSelect }: Props) {
  const setSelectedPeriod = useTransitStore((s) => s.setSelectedPeriod);
  const [logScale, setLogScale] = useState(false);

  const detectedPeriod = result.period_days;
  const staticPlot = result.plots?.periodogram;

  const data = useMemo(() => {
    if (result.bls_periods?.length && result.bls_power?.length) {
      const n = Math.min(result.bls_periods.length, result.bls_power.length);
      return Array.from({ length: n }, (_, i) => ({
        period: result.bls_periods![i],
        power: result.bls_power![i],
      }));
    }
    if (detectedPeriod && detectedPeriod > 0) {
      return syntheticPeriodogram(detectedPeriod);
    }
    return [];
  }, [result.bls_periods, result.bls_power, detectedPeriod]);

  if (!data.length && staticPlot) {
    return (
      <div className="rounded-lg border border-border-subtle bg-bg-elevated p-4">
        <h3 className="mb-3 font-semibold text-text-primary">BLS Periodogram</h3>
        <LazyPlotImage base64={staticPlot} alt="BLS periodogram" />
      </div>
    );
  }

  if (!data.length || !detectedPeriod) return null;

  const aliases = [
    { period: detectedPeriod / 2, label: "P/2", color: "#EF5350", dash: "4 4" },
    { period: detectedPeriod, label: "P", color: "#534AB7", dash: undefined },
    { period: detectedPeriod * 2, label: "2P", color: "#4CAF50", dash: "4 4" },
    { period: detectedPeriod / 3, label: "P/3", color: "#666", dash: "2 2" },
    { period: detectedPeriod * 3, label: "3P", color: "#666", dash: "2 2" },
  ];

  const handleClick = (period: number) => {
    setSelectedPeriod(period);
    onPeriodSelect?.(period);
  };

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-elevated p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-text-primary">BLS Periodogram</h3>
        <label className="flex items-center gap-2 text-xs text-text-muted">
          <input
            type="checkbox"
            checked={logScale}
            onChange={(e) => setLogScale(e.target.checked)}
            className="accent-brand"
          />
          Log x-axis
        </label>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 20, bottom: 20, left: 10 }}
          onClick={(state) => {
            const p = state?.activeLabel;
            if (p != null) handleClick(parseFloat(String(p)));
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="period"
            scale={logScale ? "log" : "auto"}
            domain={["auto", "auto"]}
            stroke="#888"
            tick={{ fontSize: 11, fill: "#888" }}
            tickFormatter={(v) => formatPeriod(v)}
          />
          <YAxis stroke="#888" tick={{ fontSize: 11, fill: "#888" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1A1B27",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value: number) => [value.toFixed(4), "Power"]}
            labelFormatter={(label) => `Period: ${formatPeriod(Number(label))}`}
          />
          <Area
            type="monotone"
            dataKey="power"
            fill="rgba(83,74,183,0.15)"
            stroke="#534AB7"
            strokeWidth={1.5}
          />
          {aliases.map((a) => (
            <ReferenceLine
              key={a.label}
              x={a.period}
              stroke={a.color}
              strokeDasharray={a.dash}
              label={{ value: a.label, fill: a.color, fontSize: 10 }}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
