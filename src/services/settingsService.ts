import { apiClient } from '../api/client';
import type { SessionSettings, SessionSettingsUpdate } from '../types/settings';

export const getSessionSettings = (): Promise<SessionSettings> =>
  apiClient<SessionSettings>('/settings/session');

export const updateSessionSettings = (settings: SessionSettingsUpdate): Promise<SessionSettings> =>
  apiClient<SessionSettings>('/settings/session', { method: 'PUT', body: settings });

