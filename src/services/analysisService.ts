import { apiClient } from '../api/client';
import type { ProcessedAnalysis } from '../types/analysis';

export const getProcessedAnalysis = (analysisId: string): Promise<ProcessedAnalysis> =>
  apiClient<ProcessedAnalysis>(`/analyses/${encodeURIComponent(analysisId)}`);

