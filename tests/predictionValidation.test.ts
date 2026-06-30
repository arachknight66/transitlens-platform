import type { PredictionResult } from '../src/types/prediction';
import { validatePrediction } from '../src/utils/predictionValidation';

const prediction = {
  prediction_id: 'p1', analysis_id: 'a1', probability: 0.91, confidence: 0.82,
  predicted_class: 1, model_version: '2.1.0', inference_time: 12.4, created_at: '2026-07-01T10:00:00Z',
} satisfies PredictionResult;

describe('validatePrediction', () => {
  it('accepts the stable ML Core result contract', () => {
    expect(validatePrediction(prediction)).toEqual({ isValid: true });
  });

  it('rejects invalid model outputs without recomputing them', () => {
    expect(validatePrediction({ ...prediction, probability: 1.1 }).message).toMatch(/probability/i);
    expect(validatePrediction({ ...prediction, confidence: Number.NaN }).message).toMatch(/confidence/i);
    expect(validatePrediction({ ...prediction, model_version: ' ' }).message).toMatch(/model version/i);
    expect(validatePrediction({ ...prediction, inference_time: -1 }).message).toMatch(/inference time/i);
  });
});

