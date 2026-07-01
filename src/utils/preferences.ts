import type { LocalPreferences, ThemePreference } from '../types/settings';

const KEY = 'transitlens.preferences';
export const defaultPreferences: LocalPreferences = {
  theme: 'dark', cacheEnabled: true, cacheTtlMinutes: 60, downloadDirectory: '',
};

export const readPreferences = (): LocalPreferences => {
  try {
    const value = JSON.parse(sessionStorage.getItem(KEY) ?? '{}') as Partial<LocalPreferences>;
    return {
      theme: value.theme === 'light' || value.theme === 'system' ? value.theme : 'dark',
      cacheEnabled: typeof value.cacheEnabled === 'boolean' ? value.cacheEnabled : true,
      cacheTtlMinutes: typeof value.cacheTtlMinutes === 'number' ? value.cacheTtlMinutes : 60,
      downloadDirectory: typeof value.downloadDirectory === 'string' ? value.downloadDirectory : '',
    };
  } catch {
    return defaultPreferences;
  }
};

export const savePreferences = (value: LocalPreferences): void => {
  sessionStorage.setItem(KEY, JSON.stringify(value));
  applyTheme(value.theme);
};

export const applyTheme = (theme: ThemePreference): void => {
  const light = theme === 'light' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: light)').matches);
  document.documentElement.classList.toggle('theme-light', light);
};

