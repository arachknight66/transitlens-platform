"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { EvaluationMetrics, InjectionRecoveryRow } from "@/types/evaluation";

interface Props {
  metrics: EvaluationMetrics | null;
  summaryRows: InjectionRecoveryRow[];
}

export function InjectionRecoveryTab({ metrics, summaryRows }: Props) {
  const byDepth = metrics?.injection_by_depth ?? [];
  const byPeriod = metrics?.injection_by_period ?? [];

  if (!metrics && summaryRows.length === 0) {
    return (
      <div className="rounded-lg border border-border-subtle bg-bg-elevated p-8 text-center">
        <p className="text-base text-text-secondary">
          Injection-recovery data not found.
        </p>
        <p className="mt-2 text-sm text-text-muted">
          Run the injection-recovery benchmark suite in the CLI to generate{" "}
          <code className="text-brand">injection_recovery_summary.csv</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border-subtle bg-bg-elevated p-4">
          <h4 className="mb-3 text-sm font-semibold text-text-primary">
            Recovery Rate vs Transit Depth
          </h4>
          {byDepth.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={byDepth}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="depth_pct"
                  stroke="#888"
                  tick={{ fontSize: 10, fill: "#888" }}
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis
                  stroke="#888"
                  tick={{ fontSize: 10, fill: "#888" }}
                  domain={[0, 1]}
                  tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1A1B27",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [`${(v * 100).toFixed(1)}%`, "Recovery"]}
                  labelFormatter={(l) => `Depth: ${l}%`}
                />
                <Line
                  type="monotone"
                  dataKey="recovery_rate"
                  stroke="#534AB7"
                  strokeWidth={2}
                  dot={{ fill: "#534AB7", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-text-muted">Depth curve not available.</p>
          )}
        </div>

        <div className="rounded-lg border border-border-subtle bg-bg-elevated p-4">
          <h4 className="mb-3 text-sm font-semibold text-text-primary">
            Recovery Rate vs Period
          </h4>
          {byPeriod.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={byPeriod}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="period_days"
                  stroke="#888"
                  tick={{ fontSize: 10, fill: "#888" }}
                  tickFormatter={(v) => `${v}d`}
                />
                <YAxis
                  stroke="#888"
                  tick={{ fontSize: 10, fill: "#888" }}
                  domain={[0, 1]}
                  tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1A1B27",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [`${(v * 100).toFixed(1)}%`, "Recovery"]}
                  labelFormatter={(l) => `Period: ${l} d`}
                />
                <Line
                  type="monotone"
                  dataKey="recovery_rate"
                  stroke="#7B74D4"
                  strokeWidth={2}
                  dot={{ fill: "#7B74D4", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-text-muted">Period curve not available.</p>
          )}
        </div>
      </div>

      {summaryRows.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-semibold text-text-primary">
            Injection-Recovery Summary
          </h4>
          <div className="overflow-x-auto rounded-lg border border-border-subtle">
            <table className="w-full text-sm">
              <thead className="border-b border-border-subtle bg-bg-elevated">
                <tr>
                  <th className="px-4 py-2 text-left text-text-muted">Scenario</th>
                  <th className="px-4 py-2 text-right text-text-muted">Injections</th>
                  <th className="px-4 py-2 text-right text-text-muted">Recovered</th>
                  <th className="px-4 py-2 text-right text-text-muted">Recovery</th>
                  <th className="px-4 py-2 text-right text-text-muted">FP</th>
                  <th className="px-4 py-2 text-right text-text-muted">FAP</th>
                </tr>
              </thead>
              <tbody>
                {summaryRows.map((row) => (
                  <tr key={row.scenario} className="border-b border-border-subtle">
                    <td className="px-4 py-2 text-text-primary">{row.scenario}</td>
                    <td className="px-4 py-2 text-right tabular-nums text-text-secondary">
                      {row.injections}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums text-text-secondary">
                      {row.recovered}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums text-status-ok">
                      {(row.recovery_rate * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums text-text-secondary">
                      {row.false_positives}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums text-text-muted">
                      {row.fap_threshold}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
