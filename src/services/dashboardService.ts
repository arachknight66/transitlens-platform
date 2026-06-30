import { apiClient } from '../api/client';
import type { DashboardSummary } from '../types/dashboard';

export const getDashboardSummary = (): Promise<DashboardSummary> =>
  apiClient<DashboardSummary>('/dashboard/summary');

