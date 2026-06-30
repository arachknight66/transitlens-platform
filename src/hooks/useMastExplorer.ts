import { useMutation } from '@tanstack/react-query';

import { downloadObservation, searchObservations } from '../services/mastService';
import type { MastSearchCriteria } from '../types/mast';

export const useMastSearch = (token: string | null) =>
  useMutation({
    mutationFn: (criteria: MastSearchCriteria) => searchObservations(criteria, token),
  });

export const useObservationDownload = (token: string | null) =>
  useMutation({
    mutationFn: (mastId: string) => downloadObservation(mastId, token),
  });

