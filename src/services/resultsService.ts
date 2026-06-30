import { apiClient } from '../api/client';
import type { ScientificResults } from '../types/results';

export const getScientificResults = (analysisId: string): Promise<ScientificResults> =>
  apiClient<ScientificResults>(`/analyses/${encodeURIComponent(analysisId)}/results`);

