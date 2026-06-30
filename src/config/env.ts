const DEFAULT_API_URL = 'http://localhost:8000/api';
const DEFAULT_TIMEOUT_MS = 30_000;

const parseTimeout = (value: string | undefined): number => {
  if (value === undefined) return DEFAULT_TIMEOUT_MS;

  const timeout = Number(value);
  return Number.isFinite(timeout) && timeout > 0 ? timeout : DEFAULT_TIMEOUT_MS;
};

export const env = Object.freeze({
  platformApiUrl: (import.meta.env.VITE_PLATFORM_API_URL ?? DEFAULT_API_URL).replace(/\/$/, ''),
  apiTimeoutMs: parseTimeout(import.meta.env.VITE_API_TIMEOUT_MS),
});

