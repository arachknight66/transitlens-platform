export type SourceMode = "demo" | "upload" | "tic";
export type FitProfile = "quick" | "standard" | "rigorous";

export interface AnalysisConfigForm {
  fitProfile: FitProfile;
  detrendMethod: "running_median" | "polynomial";
  detrendWindowDays: number;
  blsPowerThreshold: number;
  periodMinDays: number;
  periodMaxDays: number;
  randomSeed: number;
}

export const DEFAULT_CONFIG: AnalysisConfigForm = {
  fitProfile: "standard",
  detrendMethod: "running_median",
  detrendWindowDays: 1.5,
  blsPowerThreshold: 0.15,
  periodMinDays: 0.5,
  periodMaxDays: 0,
  randomSeed: 42,
};

export function buildConfigOverride(form: AnalysisConfigForm): Record<string, unknown> {
  const config: Record<string, unknown> = {
    preprocessing: {
      detrend_method: form.detrendMethod,
      detrend_window_days: form.detrendWindowDays,
    },
    bls: {
      period_min_days: form.periodMinDays,
      bls_power_threshold: form.blsPowerThreshold,
    },
    fitting: {
      fitting_level: form.fitProfile,
      random_seed: form.randomSeed,
    },
  };

  if (form.periodMaxDays > 0) {
    (config.bls as Record<string, unknown>).period_max_days = form.periodMaxDays;
  }

  return config;
}

export function configSummary(form: AnalysisConfigForm): string {
  const profile = form.fitProfile.charAt(0).toUpperCase() + form.fitProfile.slice(1);
  return `${profile} | Detrend ${form.detrendWindowDays}d | Seed ${form.randomSeed}`;
}
