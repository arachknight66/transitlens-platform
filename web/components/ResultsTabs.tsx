"use client";
import { useState } from "react";
import { FeatureRow } from "@/components/FeatureRow";
import { ParameterCard } from "@/components/ParameterCard";
import { PlotContainer } from "@/components/PlotContainer";
import { tokens } from "@/lib/tokens";
import type { AnalysisResult } from "@/types/analysis";

interface Props {
  result: AnalysisResult;
}

const FEATURE_ROWS: Array<{ key: keyof AnalysisResult["features"]; label: string; threshold?: number }> = [
  { key: "bls_power", label: "BLS Power", threshold: 0.01 },
  { key: "snr", label: "SNR", threshold: 5 },
  { key: "sde", label: "SDE" },
  { key: "depth", label: "Depth" },
  { key: "odd_even_depth_delta", label: "Odd/Even Depth Delta" },
  { key: "v_shape_score", label: "V-Shape Score" },
  { key: "secondary_depth", label: "Secondary Depth" },
  { key: "transit_count", label: "Transit Count" },
  { key: "local_noise", label: "Local Noise" },
  { key: "depth_to_noise_ratio", label: "Depth/Noise Ratio" },
  { key: "phase_shape_kurtosis", label: "Phase Shape Kurtosis" },
  { key: "autocorr_peak", label: "Autocorr Peak" },
  { key: "period_days", label: "Period (days)" },
  { key: "duration_days", label: "Duration (days)" },
  { key: "crowding_metric", label: "Crowding Metric", threshold: 0.8 },
  { key: "centroid_shift", label: "Centroid Shift" },
];

function ClassificationPath({ result }: { result: AnalysisResult }) {
  const features = result.features;
  const detected = result.candidate_detected;
  const pClass = result.predicted_class;

  const rules: Array<{ name: string; passed: boolean }> = [
    { name: "BLS Power > 0.01", passed: (features.bls_power ?? 0) > 0.01 },
    { name: "SNR > 5.0", passed: (features.snr ?? 0) > 5.0 },
  ];

  if (detected) {
    const isExo = pClass === "exoplanet_transit" || pClass === "exoplanet_like";
    const isBlend = pClass === "blend_contamination";

    rules.push(
      {
        name: "Depth < 0.05",
        passed: isExo || isBlend
          ? (features.depth ?? 1) < 0.05
          : (features.depth ?? 0) > 0.05,
      },
      {
        name: "V-Shape Score < 0.4",
        passed: isExo || isBlend
          ? (features.v_shape_score ?? 1) < 0.4
          : (features.v_shape_score ?? 0) > 0.4,
      },
      {
        name: "Odd/Even Delta < 0.02",
        passed: isExo || isBlend
          ? (features.odd_even_depth_delta ?? 1) < 0.02
          : (features.odd_even_depth_delta ?? 0) > 0.02,
      }
    );

    if (isBlend) {
      rules.push({
        name: "Centroid Shift > 0.015 OR Crowding < 0.8",
        passed:
          (features.centroid_shift ?? 0) > 0.015 ||
          (features.crowding_metric ?? 1) < 0.8,
      });
    }
  }

  return (
    <div className="space-y-2">
      {rules.map((rule) => {
        const color = rule.passed ? tokens.status.green : tokens.status.red;
        return (
          <div
            key={rule.name}
            className="rounded-md border-l-[3px] bg-white/5 p-3 text-sm"
            style={{ borderLeftColor: color }}
          >
            <span className="mr-2">{rule.passed ? "✓" : "✗"}</span>
            <strong className="text-text-primary">{rule.name}</strong>
          </div>
        );
      })}
    </div>
  );
}

function FitTab({ result }: { result: AnalysisResult }) {
  if (!result.candidate_detected) {
    return (
      <p className="text-body text-text-secondary">
        No transit candidate detected — fit parameters are not available.
      </p>
    );
  }

  const params: Array<[string, string, string]> = [
    ["Orbital Period", result.period_days?.toFixed(6) ?? "—", "days"],
    [
      "Transit Depth (Observed)",
      (result.observed_depth ?? result.depth)?.toFixed(6) ?? "—",
      "fractional",
    ],
    ["Transit Depth (Corrected)", result.corrected_depth?.toFixed(6) ?? "—", "fractional"],
    ["Transit Duration", result.duration_days?.toFixed(6) ?? "—", "days"],
    ["Epoch (T₀)", result.epoch_btjd?.toFixed(6) ?? "—", "BTJD"],
    ["Radius Ratio (Rp/R*)", result.rp_rstar?.toFixed(6) ?? "—", "dimensionless"],
    ["Observed Transit Count", result.observed_transits?.toString() ?? "—", "counts"],
    ["Transit Depth SNR", result.snr?.toFixed(1) ?? "—", "σ"],
    ["Residual RMS", result.residual_rms?.toFixed(6) ?? "—", "fractional"],
    ["Red-Noise Beta Factor", result.beta_factor?.toFixed(4) ?? "—", "dimensionless"],
    [
      "Contamination Estimate",
      result.features.contamination_ratio?.toFixed(4) ?? "—",
      "dimensionless",
    ],
  ];

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-800 bg-bg-card">
            <tr>
              <th className="px-4 py-3 text-left text-text-muted">Parameter</th>
              <th className="px-4 py-3 text-left text-text-muted">Value</th>
              <th className="px-4 py-3 text-left text-text-muted">Unit</th>
            </tr>
          </thead>
          <tbody>
            {params.map(([name, value, unit]) => (
              <tr key={name} className="border-b border-gray-800">
                <td className="px-4 py-3 font-medium text-text-primary">{name}</td>
                <td className="px-4 py-3 font-mono text-text-secondary">{value}</td>
                <td className="px-4 py-3 text-text-muted">{unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ParameterCard
          label="Fit Quality (R²)"
          value={result.fit_quality?.toFixed(4) ?? "—"}
        />
        <ParameterCard
          label="Bootstrap FAP"
          value={result.bootstrap_fap?.toFixed(4) ?? "—"}
        />
        <ParameterCard
          label="Signal-to-Noise"
          value={result.snr != null ? `${result.snr.toFixed(1)}σ` : "—"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {result.plots?.transit_stack && (
          <PlotContainer
            title="Transit Stack"
            imageSrc={`data:image/png;base64,${result.plots.transit_stack}`}
          />
        )}
        {result.plots?.posterior_corner && (
          <PlotContainer
            title="Posterior Corner"
            imageSrc={`data:image/png;base64,${result.plots.posterior_corner}`}
          />
        )}
        {result.plots?.alias_comparison && (
          <PlotContainer
            title="Alias Comparison"
            imageSrc={`data:image/png;base64,${result.plots.alias_comparison}`}
          />
        )}
      </div>
    </div>
  );
}

function BlendTab({ result }: { result: AnalysisResult }) {
  if (!result.candidate_detected) {
    return (
      <p className="text-body text-text-secondary">
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

  const warnings: string[] = [];
  if (crowding < 0.8) {
    warnings.push(
      `Crowding metric (${crowding.toFixed(3)}) is below the 0.80 threshold. The photometric aperture may contain flux from nearby sources.`
    );
  }
  if (centroid > 0.015) {
    warnings.push(
      `Centroid shift (${centroid.toFixed(4)}) exceeds the 0.015 threshold, suggesting a nearby eclipsing contaminant.`
    );
  }
  if (secondary > 0 && depth > 0 && ratio > 0.5) {
    warnings.push(
      `Secondary eclipse detected (ratio to primary: ${ratio.toFixed(2)}). This is characteristic of an eclipsing binary.`
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ParameterCard
          label="Crowding Metric"
          value={crowding.toFixed(3)}
          delta={crowding >= 0.8 ? "OK" : "Low"}
        />
        <ParameterCard
          label="Centroid Shift"
          value={centroid.toFixed(4)}
          delta={centroid <= 0.015 ? "OK" : "High"}
        />
        <ParameterCard
          label="Secondary/Primary Ratio"
          value={ratio.toFixed(3)}
          delta={ratio < 0.5 ? "OK" : "EB-like"}
        />
      </div>

      <div className="rounded-lg border border-gray-800 bg-bg-card p-4">
        <h4 className="mb-3 font-semibold text-text-primary">Interpretation</h4>
        {warnings.length > 0 ? (
          <ul className="space-y-2 text-body text-status-amber">
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        ) : (
          <p className="text-body text-status-green">
            All blend/crowding diagnostics are within normal bounds. No evidence of
            contamination or nearby source confusion.
          </p>
        )}
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
      <div className="mb-4 flex gap-2 border-b border-gray-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-primary text-text-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "detection" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h4 className="mb-3 font-semibold text-text-primary">Extracted Features</h4>
            <div className="overflow-x-auto rounded-lg border border-gray-800">
              <table className="w-full">
                <tbody>
                  {FEATURE_ROWS.map(({ key, label, threshold }) => (
                    <FeatureRow
                      key={key}
                      name={label}
                      value={result.features[key] ?? null}
                      threshold={threshold}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-text-primary">Classification Path</h4>
            <ClassificationPath result={result} />
          </div>
        </div>
      )}

      {activeTab === "fit" && <FitTab result={result} />}
      {activeTab === "blend" && <BlendTab result={result} />}
    </div>
  );
}
