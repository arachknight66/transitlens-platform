import type { PredictionResult } from './prediction';

export type ScientificUnit = 'ppm' | 'hours' | 'days' | 'dimensionless';

export interface ScientificMetric {
  readonly value: number | null;
  readonly unit: ScientificUnit;
  readonly source: string;
}

export interface ScientificMetrics {
  readonly transit_depth: ScientificMetric;
  readonly transit_duration: ScientificMetric;
  readonly estimated_period: ScientificMetric;
  readonly signal_to_noise_ratio: ScientificMetric;
}

export interface ObservationProvenance {
  readonly mission: string;
  readonly target_name: string | null;
  readonly observation_id: string | null;
  readonly source_filename: string;
  readonly flux_column: string;
  readonly quality_column: string | null;
  readonly observation_duration_days: number;
  readonly cadence_days: number | null;
}

export interface ProcessingProvenance {
  readonly schema_version: string;
  readonly pipeline_version: string;
  readonly input_samples: number;
  readonly non_finite_removed: number;
  readonly quality_removed: number;
  readonly output_samples: number;
  readonly quality_bitmask: string;
  readonly median_window: number;
  readonly wavelet: string;
  readonly wavelet_threshold_mode: string;
}

export interface ScientificResults {
  readonly analysis_id: string;
  readonly generated_at: string;
  readonly metrics: ScientificMetrics;
  readonly observation: ObservationProvenance;
  readonly processing: ProcessingProvenance;
  readonly prediction: PredictionResult | null;
}
