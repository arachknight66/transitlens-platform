import { useQuery } from '@tanstack/react-query';

import { getScientificResults } from '../services/resultsService';

export const useScientificResults = (analysisId: string) =>
  useQuery({
    queryKey: ['results', analysisId],
    queryFn: () => getScientificResults(analysisId),
    enabled: analysisId.length > 0,
    staleTime: 5 * 60_000,
    retry: 1,
  });

