import { apiClient } from '../api/client';
import type { PredictionResult } from '../types/prediction';

export const runPrediction = (analysisId: string): Promise<PredictionResult> =>
  apiClient<PredictionResult>(`/analyses/${encodeURIComponent(analysisId)}/prediction`, {
    method: 'POST',
  });

