import { useMutation } from '@tanstack/react-query';

import { runPrediction } from '../services/predictionService';

export const usePrediction = (analysisId: string) =>
  useMutation({
    mutationKey: ['prediction', analysisId],
    mutationFn: () => runPrediction(analysisId),
  });

