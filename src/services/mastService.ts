import { apiClient } from '../api/client';
import type { DownloadedFits, MastSearchCriteria, Observation } from '../types/mast';

const normalizeTarget = (criteria: MastSearchCriteria): string => {
  const value = criteria.value.trim();
  if (criteria.identifier === 'tic') return `TIC ${value}`;
  if (criteria.identifier === 'kepler') return `KIC ${value}`;
  return value;
};

const authHeaders = (token: string | null): HeadersInit | undefined =>
  token ? { Authorization: `Bearer ${token}` } : undefined;

export const searchObservations = (
  criteria: MastSearchCriteria,
  token: string | null,
): Promise<readonly Observation[]> =>
  apiClient<readonly Observation[]>('/search', {
    headers: authHeaders(token),
    query: {
      target: normalizeTarget(criteria),
      missions: criteria.missions,
      radius_deg: criteria.radiusDeg,
      limit: criteria.limit,
    },
  });

export const downloadObservation = (mastId: string, token: string | null): Promise<DownloadedFits> =>
  apiClient<DownloadedFits>('/download', {
    method: 'POST',
    headers: authHeaders(token),
    body: { mast_id: mastId },
  });
