import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getSessionSettings, updateSessionSettings } from '../services/settingsService';

const key = ['session-settings'] as const;

export const useMastSession = () => {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: key, queryFn: getSessionSettings });
  const update = useMutation({
    mutationFn: updateSessionSettings,
    onSuccess: (data) => queryClient.setQueryData(key, data),
  });

  return {
    hasToken: query.data?.has_mast_token ?? false,
    isLoading: query.isLoading,
    error: query.error ?? update.error,
    saveToken: (token: string) => { update.mutate({ mast_api_token: token }); },
    removeToken: () => { update.mutate({ mast_api_token: null }); },
  } as const;
};
