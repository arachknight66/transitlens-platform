import { useState } from 'react';

import { clearMastToken, getMastToken, setMastToken } from '../utils/mastSession';

export const useMastSession = () => {
  const [token, setTokenState] = useState<string | null>(getMastToken);

  const saveToken = (value: string): void => {
    setMastToken(value);
    setTokenState(getMastToken());
  };

  const removeToken = (): void => {
    clearMastToken();
    setTokenState(null);
  };

  return { token, saveToken, removeToken } as const;
};

