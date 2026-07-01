import type { ScientificMetric, ScientificResults } from '../types/results';
import { validatePrediction } from './predictionValidation';

export interface ResultsValidation {
  readonly isValid: boolean;
  readonly message?: string;
}

const metricIsValid = (metric: ScientificMetric): boolean =>
  metric.value === null || Number.isFinite(metric.value);

export const validateScientificResults = (results: ScientificResults): ResultsValidation => {
  const metrics: readonly ScientificMetric[] = [
    results.metrics.transit_depth,
    results.metrics.transit_duration,
    results.metrics.estimated_period,
    results.metrics.signal_to_noise_ratio,
  ];
  if (metrics.some((metric) => !metricIsValid(metric))) {
    return { isValid: false, message: 'The data pipeline returned a non-finite scientific metric.' };
  }
  if (
    metrics.some(
      (metric) =>
        !['transitlens-data-pipeline', 'transitlens-ml-core', 'unavailable'].includes(metric.source),
    )
  ) {
    return { isValid: false, message: 'A scientific metric is missing valid provenance.' };
  }
  if (results.processing.input_samples < 0 || results.processing.output_samples < 0) {
    return { isValid: false, message: 'The data pipeline returned invalid sample accounting.' };
  }
  if (results.prediction) {
    const predictionValidation = validatePrediction(results.prediction);
    if (!predictionValidation.isValid) return predictionValidation;
  }
  return { isValid: true };
};
