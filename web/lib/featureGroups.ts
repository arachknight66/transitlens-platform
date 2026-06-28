import type { Features } from "@/types/analysis";

export type FeatureCategory = "Detection" | "Shape" | "Noise" | "Blend";

export interface FeatureDefinition {
  key: keyof Features;
  label: string;
  category: FeatureCategory;
  threshold?: number;
  thresholdOp?: ">=" | "<=" | ">";
}

export const FEATURE_GROUPS: FeatureDefinition[] = [
  { key: "bls_power", label: "BLS Power", category: "Detection", threshold: 0.01, thresholdOp: ">=" },
  { key: "snr", label: "SNR", category: "Detection", threshold: 5, thresholdOp: ">=" },
  { key: "sde", label: "SDE", category: "Detection" },
  { key: "transit_count", label: "Transit Count", category: "Detection" },
  { key: "period_days", label: "Period (days)", category: "Detection" },
  { key: "depth", label: "Depth", category: "Shape" },
  { key: "odd_even_depth_delta", label: "Odd/Even Depth Δ", category: "Shape", threshold: 0.02, thresholdOp: "<=" },
  { key: "v_shape_score", label: "V-Shape Score", category: "Shape", threshold: 0.4, thresholdOp: "<=" },
  { key: "secondary_depth", label: "Secondary Depth", category: "Shape" },
  { key: "duration_days", label: "Duration (days)", category: "Shape" },
  { key: "phase_shape_kurtosis", label: "Phase Shape Kurtosis", category: "Shape" },
  { key: "local_noise", label: "Local Noise", category: "Noise" },
  { key: "depth_to_noise_ratio", label: "Depth/Noise Ratio", category: "Noise" },
  { key: "autocorr_peak", label: "Autocorr Peak", category: "Noise" },
  { key: "crowding_metric", label: "Crowding Metric", category: "Blend", threshold: 0.8, thresholdOp: ">=" },
  { key: "centroid_shift", label: "Centroid Shift", category: "Blend", threshold: 0.015, thresholdOp: "<=" },
  { key: "contamination_ratio", label: "Contamination Ratio", category: "Blend" },
];

export function passesThreshold(
  value: number | null | undefined,
  threshold: number,
  op: FeatureDefinition["thresholdOp"]
): boolean | null {
  if (value == null) return null;
  switch (op) {
    case ">=":
      return value >= threshold;
    case "<=":
      return value <= threshold;
    case ">":
      return value > threshold;
    default:
      return null;
  }
}
