"use client";

import {
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { SplitMetrics } from "@/types/evaluation";

interface Props {
  valMetrics: SplitMetrics;
  testMetrics: SplitMetrics;
  overallRecoveryPct: number;
}

function MaeTable({ label, metrics }: { label: string; metrics: SplitMetrics }) {
  return (
    <div className="rounded-lg border border-border-subtle bg-bg-elevated p-4">
      <h4 className="mb-3 text-sm font-semibold text-text-primary">{label}</h4>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-text-muted">Period MAE</dt>
          <dd className="font-mono tabular-nums text-text-primary">
            {metrics.mean_period_error_pct.toFixed(4)}%
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-text-muted">Depth MAE</dt>
          <dd className="font-mono tabular-nums text-text-primary">
            {metrics.mean_depth_error_pct.toFixed(2)}%
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-text-muted">Duration MAE</dt>
          <dd className="font-mono tabular-nums text-text-primary">
            {metrics.mean_duration_error_pct.toFixed(2)}%
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function ParameterRecoveryTab({
  valMetrics,
  testMetrics,
  overallRecoveryPct,
}: Props) {
  const errors = testMetrics.period_errors_pct ?? [];

  const binned: Record<string, number> = {};
  for (const err of errors) {
    const bucket = (Math.floor(err / 0.02) * 0.02).toFixed(2);
    binned[bucket] = (binned[bucket] ?? 0) + 1;
  }
  const histData = Object.entries(binned).map(([bin, count]) => ({ bin, count }));

  const scatter = (testMetrics.period_scatter ?? []).map((p) => ({
    true: p.true_period,
    recovered: p.recovered_period,
    id: p.target_id,
  }));

  const maxP = Math.max(...scatter.map((p) => Math.max(p.true, p.recovered)), 1);

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-border-subtle bg-bg-elevated p-4">
        <p className="text-xs text-text-muted">Overall period recovery (within 1% error)</p>
        <p className="text-3xl font-semibold tabular-nums text-text-primary">
          {overallRecoveryPct.toFixed(1)}%
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <MaeTable label="Validation Split MAE" metrics={valMetrics} />
        <MaeTable label="Test Split MAE" metrics={testMetrics} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border-subtle bg-bg-elevated p-4">
          <h4 className="mb-3 text-sm font-semibold text-text-primary">
            Period Error Distribution (Test)
          </h4>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={histData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="bin" stroke="#888" tick={{ fontSize: 10, fill: "#888" }} />
              <YAxis stroke="#888" tick={{ fontSize: 10, fill: "#888" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1A1B27",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" fill="#534AB7" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-border-subtle bg-bg-elevated p-4">
          <h4 className="mb-3 text-sm font-semibold text-text-primary">
            Recovered vs True Period
          </h4>
          <ResponsiveContainer width="100%" height={240}>
            <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                type="number"
                dataKey="true"
                name="True"
                domain={[0, maxP * 1.05]}
                stroke="#888"
                tick={{ fontSize: 10, fill: "#888" }}
              />
              <YAxis
                type="number"
                dataKey="recovered"
                name="Recovered"
                domain={[0, maxP * 1.05]}
                stroke="#888"
                tick={{ fontSize: 10, fill: "#888" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1A1B27",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v: number) => v.toFixed(4)}
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.id ?? ""
                }
              />
              <ReferenceLine
                segment={[
                  { x: 0, y: 0 },
                  { x: maxP, y: maxP },
                ]}
                stroke="#4CAF50"
                strokeDasharray="4 4"
              />
              <Scatter data={scatter} fill="#8A81F2" fillOpacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
