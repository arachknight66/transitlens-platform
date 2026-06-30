import type { PredictionResult, PredictionValidation } from '../types/prediction';

const isUnitInterval = (value: number): boolean => Number.isFinite(value) && value >= 0 && value <= 1;

export const validatePrediction = (prediction: PredictionResult): PredictionValidation => {
  if (!isUnitInterval(prediction.probability)) {
    return { isValid: false, message: 'ML Core returned an invalid transit probability.' };
  }
  if (!isUnitInterval(prediction.confidence)) {
    return { isValid: false, message: 'ML Core returned an invalid confidence value.' };
  }
  if (prediction.predicted_class !== 0 && prediction.predicted_class !== 1) {
    return { isValid: false, message: 'ML Core returned an invalid prediction class.' };
  }
  if (!prediction.model_version.trim()) {
    return { isValid: false, message: 'ML Core did not identify the model version.' };
  }
  if (!Number.isFinite(prediction.inference_time) || prediction.inference_time < 0) {
    return { isValid: false, message: 'ML Core returned an invalid inference time.' };
  }
  return { isValid: true };
};

