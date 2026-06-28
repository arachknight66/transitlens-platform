export interface Features {
  bls_power: number | null;
  snr: number | null;
  sde: number | null;
  depth: number | null;
  odd_even_depth_delta: number | null;
  v_shape_score: number | null;
  secondary_depth: number | null;
  transit_count: number | null;
  local_noise: number | null;
  depth_to_noise_ratio: number | null;
  phase_shape_kurtosis: number | null;
  autocorr_peak: number | null;
  period_days: number | null;
  duration_days: number | null;
  crowding_metric: number | null;
  centroid_shift: number | null;
  contamination_ratio?: number | null;
}

export interface Plots {
  raw_lightcurve?: string;
  cleaned_lightcurve?: string;
  periodogram?: string;
  phase_folded?: string;
  transit_stack?: string;
  posterior_corner?: string;
  alias_comparison?: string;
}

export interface ClassProbabilities {
  exoplanet_transit?: number;
  eclipsing_binary?: number;
  blend_contamination?: number;
  stellar_variability_or_other?: number;
}

export interface AnalysisResult {
  target_id: string;
  candidate_detected: boolean;
  predicted_class: string;
  confidence: number;
  period_days: number | null;
  duration_days: number | null;
  depth: number | null;
  snr: number | null;
  explanation: string;
  features: Features;
  plots: Plots;
  class_probabilities?: ClassProbabilities;
  period_uncertainty_days?: number | null;
  observed_depth?: number | null;
  corrected_depth?: number | null;
  depth_uncertainty?: number | null;
  duration_uncertainty_days?: number | null;
  epoch_btjd?: number | null;
  rp_rstar?: number | null;
  rp_rstar_err_lower?: number | null;
  rp_rstar_err_upper?: number | null;
  planet_radius_earth?: number | null;
  planet_radius_earth_err_lower?: number | null;
  planet_radius_earth_err_upper?: number | null;
  a_rstar?: number | null;
  inclination_deg?: number | null;
  b?: number | null;
  fit_quality?: number | null;
  reduced_chi2?: number | null;
  bootstrap_fap?: number | null;
  mcmc_passed?: boolean;
  mcmc_rhat?: number | null;
  mcmc_ess?: number | null;
  pipeline_version?: string;
  processing_time_ms?: number | null;
  observed_transits?: number | null;
  residual_rms?: number | null;
  beta_factor?: number | null;
  fit_status?: string;
  quality_flags?: string[];
  raw_time?: number[];
  raw_flux?: number[];
  bls_periods?: number[];
  bls_power?: number[];
}

export interface ProgressEvent {
  stage: string;
  pct: number;
  msg: string;
  result?: AnalysisResult;
}

export interface Annotation {
  targetId: string;
  flagged: boolean;
  priority: "High" | "Medium" | "Low";
  category: "Promising" | "Needs follow-up" | "False positive" | "Unclear";
  notes: string;
  updatedAt: string;
}

