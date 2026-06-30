const MAST_TOKEN_KEY = 'transitlens.mast-token';

export const getMastToken = (): string | null => sessionStorage.getItem(MAST_TOKEN_KEY);

export const setMastToken = (token: string): void => {
  const normalized = token.trim();
  if (normalized) sessionStorage.setItem(MAST_TOKEN_KEY, normalized);
  else sessionStorage.removeItem(MAST_TOKEN_KEY);
};

export const clearMastToken = (): void => {
  sessionStorage.removeItem(MAST_TOKEN_KEY);
};

