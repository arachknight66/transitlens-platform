export interface PerClassMetrics {
  precision: number;
  recall: number;
  f1: number;
  support: number;
}

export interface SplitMetrics {
  accuracy: number;
  f1: number;
  mean_period_error_pct: number;
  mean_depth_error_pct: number;
  mean_duration_error_pct: number;
  per_class: Record<string, PerClassMetrics>;
  confusion_matrix?: {
    labels: string[];
    matrix: number[][];
  };
  confusion_details?: Record<string, string[]>;
  period_errors_pct?: number[];
  period_scatter?: Array<{
    target_id: string;
    true_period: number;
    recovered_period: number;
  }>;
}

export interface InjectionRecoveryPoint {
  depth_pct?: number;
  period_days?: number;
  recovery_rate: number;
  trials?: number;
}

export interface EvaluationMetrics {
  schema_version: number;
  generated_at: string;
  disclaimer: string;
  restricted_classifier: EvidenceGroup & {
    n_blind_targets: number; macro_f1: number; ece: number; review_rate: number; production_eligible: false;
  };
  injection_recovery: EvidenceGroup & {
    n_trials: number; overall_recovery: number; high_snr_recovery: number; control_false_positive_rate: number;
    median_period_error_pct: number; median_depth_error_pct: number; median_duration_error_pct: number;
  };
  real_tess_pilot: EvidenceGroup & { n_targets: number };
  ingestion_scale: EvidenceGroup & { parsed_observations: number };
  val_metrics?: SplitMetrics;
  test_metrics?: SplitMetrics;
  overall_period_recovery_pct?: number;
  overall_f1?: number;
  injection_by_depth?: InjectionRecoveryPoint[];
  injection_by_period?: InjectionRecoveryPoint[];
}

export interface EvidenceGroup {
  title: string;
  evidence_type: string;
  sample_size: number;
  measurement_date: string;
  source_artifact: string;
  limitation: string;
}

export interface InjectionRecoveryRow {
  scenario: string;
  injections: number;
  recovered: number;
  recovery_rate: number;
  false_positives: number;
  fap_threshold: number;
}
