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
  val_metrics: SplitMetrics;
  test_metrics: SplitMetrics;
  overall_period_recovery_pct: number;
  overall_f1: number;
  injection_by_depth?: InjectionRecoveryPoint[];
  injection_by_period?: InjectionRecoveryPoint[];
}

export interface InjectionRecoveryRow {
  scenario: string;
  injections: number;
  recovered: number;
  recovery_rate: number;
  false_positives: number;
  fap_threshold: number;
}
