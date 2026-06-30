import type { ProcessedAnalysis } from '../types/analysis';

export interface AnalysisValidation {
  readonly isValid: boolean;
  readonly message?: string;
}

export const validateProcessedAnalysis = (analysis: ProcessedAnalysis): AnalysisValidation => {
  const pointCount = analysis.time.length;
  if (pointCount === 0) return { isValid: false, message: 'The processed analysis contains no light-curve samples.' };

  const series = [analysis.flux, analysis.normalized_flux, analysis.wavelet_flux];
  if (series.some((values) => values.length !== pointCount)) {
    return { isValid: false, message: 'The pipeline returned light-curve arrays with different lengths.' };
  }

  if ([analysis.time, ...series].some((values) => values.some((value) => !Number.isFinite(value)))) {
    return { isValid: false, message: 'The pipeline returned non-finite light-curve values.' };
  }

  return { isValid: true };
};

