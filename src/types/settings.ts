export type ThemePreference = 'dark' | 'light' | 'system';

export interface SessionSettings {
  readonly pipeline_url: string;
  readonly ml_core_url: string;
  readonly has_mast_token: boolean;
  readonly expires_at: string;
}

export interface SessionSettingsUpdate {
  readonly mast_api_token?: string | null;
  readonly pipeline_url?: string;
  readonly ml_core_url?: string;
}

export interface LocalPreferences {
  readonly theme: ThemePreference;
  readonly cacheEnabled: boolean;
  readonly cacheTtlMinutes: number;
  readonly downloadDirectory: string;
}

