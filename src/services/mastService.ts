import { apiClient } from '../api/client';
import type { DownloadedFits, MastSearchCriteria, Observation } from '../types/mast';

const normalizeTarget = (criteria: MastSearchCriteria): string => {
  const value = criteria.value.trim();
  if (criteria.identifier === 'tic') return `TIC ${value}`;
  if (criteria.identifier === 'kepler') return `KIC ${value}`;
  return value;
};

export const searchObservations = (
  criteria: MastSearchCriteria,
): Promise<readonly Observation[]> =>
  apiClient<readonly Observation[]>('/search', {
    query: {
      target: normalizeTarget(criteria),
      missions: criteria.missions,
      radius_deg: criteria.radiusDeg,
      limit: criteria.limit,
    },
  });

export const downloadObservation = (mastId: string): Promise<DownloadedFits> =>
  apiClient<DownloadedFits>('/download', {
    method: 'POST',
    body: { mast_id: mastId },
  });
