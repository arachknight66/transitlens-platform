import { useQuery } from '@tanstack/react-query';

import { getDashboardSummary } from '../services/dashboardService';

export const dashboardSummaryQueryKey = ['dashboard', 'summary'] as const;

export const useDashboardSummary = () =>
  useQuery({
    queryKey: dashboardSummaryQueryKey,
    queryFn: getDashboardSummary,
    refetchInterval: 60_000,
  });

