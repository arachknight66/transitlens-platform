import { useQuery } from '@tanstack/react-query';

import { getProcessedAnalysis } from '../services/analysisService';

export const useProcessedAnalysis = (analysisId: string) =>
  useQuery({
    queryKey: ['analysis', analysisId],
    queryFn: () => getProcessedAnalysis(analysisId),
    enabled: analysisId.length > 0,
    staleTime: 5 * 60_000,
    retry: 1,
  });

