import { useMutation } from '@tanstack/react-query';

import { downloadObservation, searchObservations } from '../services/mastService';
export const useMastSearch = () =>
  useMutation({
    mutationFn: searchObservations,
  });

export const useObservationDownload = () =>
  useMutation({
    mutationFn: downloadObservation,
  });
