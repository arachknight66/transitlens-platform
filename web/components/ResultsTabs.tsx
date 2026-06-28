"use client";

import { useState } from "react";
import { FeatureTable } from "@/components/science/FeatureTable";
import { ParameterCard } from "@/components/ParameterCard";
import { getClassConfig } from "@/lib/classConfig";
import { tokens } from "@/lib/tokens";
import type { AnalysisResult } from "@/types/analysis";

interface Props {
  result: AnalysisResult;
}

function ClassificationPath({ result }: { result: AnalysisResult }) {
  const features = result.features;
  const detected = result.candidate_detected;
  const pClass = result.predicted_class;
  const cfg = getClassConfig(pClass);

  const rules: Array<{ name: string; value?: string; passed: boolean }> = [
    {
      name: "BLS Power > 0.01",
      value: features.bls_power?.toFixed(4),
      passed: (features.bls_power ?? 0) > 0.01,
    },
    {
      name: "SNR > 5.0",
      value: features.snr?.toFixed(1),
      passed: (features.snr ?? 0) > 5.0,
    },
  ];

  if (detected) {
    const isExo = pClass === "exoplanet_transit" || pClass === "exoplanet_like";
    const isBlend = pClass === "blend_contamination";

    rules.push(
      {
        name: "Depth threshold",
        value: features.depth?.toFixed(4),
        passed: isExo || isBlend ? (features.depth ?? 1) < 0.05 : (features.depth ?? 0) > 0.05,
      },
      {
        name: "V-Shape Score < 0.4",
        value: features.v_shape_score?.toFixed(3),
        passed: isExo || isBlend
          ? (features.v_shape_score ?? 1) < 0.4
          : (features.v_shape_score ?? 0) > 0.4,
      },
      {
        name: "Odd/Even Delta < 0.02",
        value: features.odd_even_depth_delta?.toFixed(4),
        passed: isExo || isBlend
          ? (features.odd_even_depth_delta ?? 1) < 0.02
          : (features.odd_even_depth_delta ?? 0) > 0.02,
      }
    );

    if (isBlend) {
      rules.push({
        name: "Blend indicators",
        passed:
          (features.centroid_shift ?? 0) > 0.015 ||
          (features.crowding_metric ?? 1) < 0.8,
      });
    }
  }

  return (
    <div className="relative space-y-0 pl-4">
      <div className="absolute bottom-4 left-1.5 top-4 w-px bg-border-soft" />
      {rules.map((rule, i) => {
        const color = rule.passed ? tokens.status.green : tokens.status.red;
        return (
          <div key={rule.name} className="relative pb-4 pl-4">
            <span
              className="absolute -left-[7px] top-2 h-3 w-3 rounded-full border-2 border-bg-elevated"
              style={{ backgroundColor: color }}
            />
            <div
              className="rounded-md border-l-[3px] bg-white/5 p-3 text-sm"
              style={{ borderLeftColor: color }}
            >
              <span className="mr-2">{rule.passed ? "✓" : "✗"}</span>
              <strong className="text-text-primary">{rule.name}</strong>
              {rule.value && (
                <span className="ml-2 font-mono text-xs text-text-muted">{rule.value}</span>
              )}
            </div>
            {i === rules.length - 1 && (
              <div
                className="mt-3 rounded-lg border p-4 text-center font-semibold text-white"
                style={{ backgroundColor: cfg.colorHex, borderColor: cfg.colorHex }}
              >
                Verdict: {cfg.display}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function FapBadge({ fap }: { fap: number | null | undefined }) {
  if (fap == null) return <span>—</span>;
  let color = "text-status-error";
  if (fap < 0.01) color = "text-status-ok";
  else if (fap <= 0.1) color = "text-status-warn";
  return <span className={`font-mono tabular-nums ${color}`}>{fap.toFixed(4)}</span>;
}

function FitTab({ result }: { result: AnalysisResult }) {
  if (!result.candidate_detected) {
    return (
      <p className="text-base text-text-secondary">
        No transit candidate detected — fit parameters are not available.
      </p>
    );
  }

  const params: Array<{
    name: string;
    value: string;
    unit: string;
    errLower?: number | null;
    errUpper?: number | null;
    highlight?: boolean;
  }> = [
    {
      name: "Orbital Period",
      value: result.period_days?.toFixed(6) ?? "—",
      unit: "days",
      errLower: result.period_uncertainty_days ?? undefined,
      errUpper: result.period_uncertainty_days ?? undefined,
    },
    {
      name: "Transit Depth (Observed)",
      value: (result.observed_depth ?? result.depth)?.toFixed(6) ?? "—",
      unit: "fractional",
    },
    {
      name: "Transit Depth (Corrected)",
      value: result.corrected_depth?.toFixed(6) ?? "—",
      unit: "fractional",
      highlight:
        result.observed_depth != null &&
        result.corrected_depth != null &&
        Math.abs(result.observed_depth - result.corrected_depth) > 0.001,
    },
    { name: "Transit Duration", value: result.duration_days?.toFixed(6) ?? "—", unit: "days" },
    { name: "Epoch (T₀)", value: result.epoch_btjd?.toFixed(6) ?? "—", unit: "BTJD" },
    {
      name: "Radius Ratio (Rp/R*)",
      value: result.rp_rstar?.toFixed(6) ?? "—",
      unit: "—",
      errLower: result.rp_rstar_err_lower,
      errUpper: result.rp_rstar_err_upper,
    },
    { name: "Observed Transit Count", value: result.observed_transits?.toString() ?? "—", unit: "counts" },
    { name: "Transit Depth SNR", value: result.snr?.toFixed(1) ?? "—", unit: "σ" },
    { name: "Residual RMS", value: result.residual_rms?.toFixed(6) ?? "—", unit: "fractional" },
    { name: "Red-Noise Beta", value: result.beta_factor?.toFixed(4) ?? "—", unit: "—" },
  ];

  const r2 = result.fit_quality;

  return (
    <div className="space-y-8">
      <div className="overflow-x-auto rounded-lg border border-border-subtle">
        <table className="w-full text-sm">
          <thead className="border-b border-border-subtle bg-bg-elevated">
            <tr>
              <th className="px-4 py-3 text-left text-text-muted">Parameter</th>
              <th className="px-4 py-3 text-left text-text-muted">Value ± Uncertainty</th>
              <th className="px-4 py-3 text-left text-text-muted">Unit</th>
            </tr>
          </thead>
          <tbody>
            {params.map((row) => (
              <tr
                key={row.name}
                className={`border-b border-border-subtle ${
                  row.highlight ? "bg-status-warn/5" : ""
                }`}
              >
                <td className="px-4 py-3 font-medium text-text-primary">{row.name}</td>
                <td className="px-4 py-3 font-mono tabular-nums text-text-secondary">
                  {row.value}
                  {(row.errLower != null || row.errUpper != null) && (
                    <span className="ml-2 text-xs text-status-ok">
                      +{row.errUpper?.toFixed(4) ?? "—"} / −{row.errLower?.toFixed(4) ?? "—"}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-text-muted">{row.unit}</td>
              </tr>
            ))}
            <tr className="bg-bg-surface">
              <td className="px-4 py-3 font-medium text-text-primary">Fit Quality (R²)</td>
              <td className="px-4 py-3" colSpan={2}>
                <div className="flex items-center gap-3">
                  <span className="font-mono tabular-nums text-text-secondary">
                    {r2?.toFixed(4) ?? "—"}
                  </span>
                  {r2 != null && (
                    <div className="h-2 max-w-[120px] flex-1 overflow-hidden rounded-full bg-bg-overlay">
                      <div
                        className="feature-bar h-full rounded-full bg-status-ok"
                        style={{ "--bar-w": `${Math.min(100, r2 * 100)}%` } as React.CSSProperties}
                      />
                    </div>
                  )}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="border-t border-border-subtle pt-6">
        <h4 className="mb-4 font-semibold text-text-primary">MCMC / Significance</h4>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <ParameterCard
            label="Bootstrap FAP"
            value={result.bootstrap_fap?.toFixed(4) ?? "—"}
            quality={
              result.bootstrap_fap != null && result.bootstrap_fap < 0.01
                ? "ok"
                : result.bootstrap_fap != null && result.bootstrap_fap <= 0.1
                  ? "warn"
                  : "error"
            }
            help="False Alarm Probability — lower is more significant"
          />
          <div className="rounded-lg border border-border-subtle bg-bg-elevated p-4">
            <span className="text-xs text-text-muted">FAP interpretation</span>
            <div className="mt-2 text-lg">
              <FapBadge fap={result.bootstrap_fap} />
            </div>
          </div>
          <ParameterCard
            label="MCMC Convergence"
            value={
              result.mcmc_passed != null
                ? result.mcmc_passed
                  ? "Pass"
                  : "Fail"
                : "—"
            }
            quality={result.mcmc_passed ? "ok" : result.mcmc_passed === false ? "error" : "warn"}
            help={`R̂=${result.mcmc_rhat?.toFixed(3) ?? "—"} ESS=${result.mcmc_ess ?? "—"}`}
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {result.plots?.posterior_corner && (
            <img
              src={`data:image/png;base64,${result.plots.posterior_corner}`}
              alt="Posterior corner"
              className="rounded-md border border-border-subtle"
              role="img"
            />
          )}
          {result.plots?.alias_comparison && (
            <img
              src={`data:image/png;base64,${result.plots.alias_comparison}`}
              alt="Alias comparison"
              className="rounded-md border border-border-subtle"
              role="img"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function MetricWhisker({ value, threshold }: { value: number; threshold: number; label?: string }) {
  const pct = Math.min(100, Math.max(0, (value / (threshold * 1.5)) * 100));
  return (
    <div className="mt-2 h-2 overflow-hidden rounded-full bg-bg-overlay">
      <div
        className="h-full rounded-full bg-brand"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function BlendTab({ result }: { result: AnalysisResult }) {
  if (!result.candidate_detected) {
    return (
      <p className="text-base text-text-secondary">
        No transit candidate detected — blend diagnostics are not applicable.
      </p>
    );
  }

  const features = result.features;
  const crowding = features.crowding_metric ?? 1;
  const centroid = features.centroid_shift ?? 0;
  const secondary = features.secondary_depth ?? 0;
  const depth = features.depth ?? 0;
  const ratio = depth > 0 && secondary > 0 ? secondary / depth : 0;

  const checks = [
    {
      ok: centroid <= 0.015,
      text: `Centroid shift ${centroid.toFixed(4)} ${centroid <= 0.015 ? "<" : "≥"} 0.015 threshold`,
    },
    {
      ok: crowding >= 0.8,
      text: `Crowding metric ${crowding.toFixed(3)} ${crowding >= 0.8 ? "≥" : "<"} 0.80 threshold`,
    },
    {
      ok: ratio < 0.5,
      text: `Secondary/primary ratio ${ratio.toFixed(3)} ${ratio < 0.5 ? "<" : "≥"} 0.50 threshold`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border-subtle bg-bg-elevated p-4">
          <p className="text-xs text-text-muted">Crowding</p>
          <p className="font-mono text-xl font-semibold tabular-nums text-text-primary">
            {crowding.toFixed(3)}
          </p>
          <MetricWhisker value={crowding} threshold={0.8} label="crowding" />
        </div>
        <div className="rounded-lg border border-border-subtle bg-bg-elevated p-4">
          <p className="text-xs text-text-muted">Centroid Shift</p>
          <p className="font-mono text-xl font-semibold tabular-nums text-text-primary">
            {centroid.toFixed(4)}
          </p>
          <MetricWhisker value={Math.max(0, 0.03 - centroid)} threshold={0.015} label="centroid" />
        </div>
        <div className="rounded-lg border border-border-subtle bg-bg-elevated p-4">
          <p className="text-xs text-text-muted">Secondary Ratio</p>
          <p className="font-mono text-xl font-semibold tabular-nums text-text-primary">
            {ratio.toFixed(3)}
          </p>
          <MetricWhisker value={ratio} threshold={0.5} label="ratio" />
        </div>
      </div>

      <div className="rounded-lg border border-border-subtle bg-bg-elevated p-4">
        <h4 className="mb-3 font-semibold text-text-primary">Interpretation</h4>
        <ul className="space-y-2 text-sm">
          {checks.map((c) => (
            <li key={c.text} className={c.ok ? "text-status-ok" : "text-status-warn"}>
              {c.ok ? "✓" : "✗"} {c.text}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex min-h-[120px] items-center justify-center rounded-lg border border-dashed border-border-soft bg-bg-surface text-sm text-text-muted">
        Sky plot — nearby Gaia sources (placeholder)
      </div>
    </div>
  );
}

export function ResultsTabs({ result }: Props) {
  const [activeTab, setActiveTab] = useState<"detection" | "fit" | "blend">("detection");

  const tabs = [
    { id: "detection" as const, label: "Detection evidence" },
    { id: "fit" as const, label: "Fit parameters" },
    { id: "blend" as const, label: "Blend diagnostics" },
  ];

  return (
    <div>
      <div
        className="mb-4 flex gap-2 border-b border-border-subtle"
        role="tablist"
        aria-label="Results sections"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors duration-fast ${
              activeTab === tab.id
                ? "border-b-2 border-brand text-text-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "detection" && (
        <div
          id="panel-detection"
          role="tabpanel"
          aria-labelledby="tab-detection"
          className="grid grid-cols-1 gap-6 lg:grid-cols-2"
        >
          <div>
            <h4 className="mb-3 font-semibold text-text-primary">Extracted Features</h4>
            <FeatureTable result={result} />
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-text-primary">Classification Path</h4>
            <ClassificationPath result={result} />
          </div>
        </div>
      )}

      {activeTab === "fit" && (
        <div id="panel-fit" role="tabpanel" aria-labelledby="tab-fit">
          <FitTab result={result} />
        </div>
      )}

      {activeTab === "blend" && (
        <div id="panel-blend" role="tabpanel" aria-labelledby="tab-blend">
          <BlendTab result={result} />
        </div>
      )}
    </div>
  );
}
