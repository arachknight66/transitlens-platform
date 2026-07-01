import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ApiError } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { Panel } from '../components/Panel';
import { getSessionSettings, updateSessionSettings } from '../services/settingsService';
import type { LocalPreferences, ThemePreference } from '../types/settings';
import { readPreferences, savePreferences } from '../utils/preferences';

const sessionKey = ['session-settings'] as const;

const SettingsPage = () => {
  const queryClient = useQueryClient();
  const session = useQuery({ queryKey: sessionKey, queryFn: getSessionSettings });
  const [preferences, setPreferences] = useState<LocalPreferences>(readPreferences);
  const [pipelineUrl, setPipelineUrl] = useState<string | null>(null);
  const [mlCoreUrl, setMlCoreUrl] = useState<string | null>(null);
  const [token, setToken] = useState('');
  const [saved, setSaved] = useState(false);

  const update = useMutation({
    mutationFn: updateSessionSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(sessionKey, data);
      setToken('');
      setSaved(true);
    },
  });

  const submit = (event: React.SyntheticEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setSaved(false);
    savePreferences(preferences);
    update.mutate({ pipeline_url: pipelineUrl ?? session.data?.pipeline_url, ml_core_url: mlCoreUrl ?? session.data?.ml_core_url, ...(token ? { mast_api_token: token } : {}) });
  };

  const error = session.error ?? update.error;

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <PageHeader eyebrow="Workspace configuration" title="Settings" description="Configure this browser session and the gateway services used by TransitLens." />
      <form onSubmit={submit} className="mt-8 space-y-5">
        <Panel title="Gateway session" description="Service addresses and credentials expire with the secure server-side session.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Pipeline URL"><input required type="url" value={pipelineUrl ?? session.data?.pipeline_url ?? ''} onChange={(e) => { setPipelineUrl(e.target.value); }} className="field" /></Field>
            <Field label="ML Core URL"><input required type="url" value={mlCoreUrl ?? session.data?.ml_core_url ?? ''} onChange={(e) => { setMlCoreUrl(e.target.value); }} className="field" /></Field>
            <Field label="MAST API token">
              <input type="password" autoComplete="off" value={token} onChange={(e) => { setToken(e.target.value); }} placeholder={session.data?.has_mast_token ? 'Token configured — enter to replace' : 'Optional session token'} className="field" />
            </Field>
            <div className="self-end text-xs leading-5 text-slate-500">Token status: {session.data?.has_mast_token ? 'configured' : 'anonymous access'}. The token is never returned after submission.</div>
          </div>
        </Panel>

        <Panel title="Local preferences" description="Non-secret preferences remain only for this browser session.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Theme">
              <select value={preferences.theme} onChange={(e) => { setPreferences({ ...preferences, theme: e.target.value as ThemePreference }); }} className="field">
                <option value="dark">Dark</option><option value="light">Light</option><option value="system">System</option>
              </select>
            </Field>
            <Field label="Download directory preference">
              <input value={preferences.downloadDirectory} onChange={(e) => { setPreferences({ ...preferences, downloadDirectory: e.target.value }); }} placeholder="e.g. TransitLens exports" className="field" />
            </Field>
            <label className="flex items-center gap-3 text-sm text-slate-300">
              <input type="checkbox" checked={preferences.cacheEnabled} onChange={(e) => { setPreferences({ ...preferences, cacheEnabled: e.target.checked }); }} /> Enable gateway cache preference
            </label>
            <Field label="Cache lifetime (minutes)">
              <input type="number" min="1" max="1440" value={preferences.cacheTtlMinutes} onChange={(e) => { setPreferences({ ...preferences, cacheTtlMinutes: Number(e.target.value) }); }} className="field" />
            </Field>
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">Browsers control the physical download destination. This directory name is an organizational preference, not filesystem access.</p>
        </Panel>

        {error && <p role="alert" className="rounded-lg border border-rose-400/20 bg-rose-400/5 p-4 text-sm text-rose-200">{error instanceof ApiError ? error.message : 'The gateway settings could not be saved.'}</p>}
        {saved && <p role="status" className="rounded-lg border border-emerald-400/20 bg-emerald-400/5 p-4 text-sm text-emerald-200">Settings saved for this session.</p>}
        <button type="submit" disabled={update.isPending || session.isLoading} className="rounded-lg bg-signal-400 px-5 py-2.5 text-sm font-semibold text-space-950 hover:bg-signal-300 disabled:opacity-50">{update.isPending ? 'Saving…' : 'Save settings'}</button>
      </form>
    </div>
  );
};

const Field = ({ label, children }: { readonly label: string; readonly children: React.ReactNode }) => (
  <label className="block text-xs font-medium text-slate-400"><span className="mb-2 block">{label}</span>{children}</label>
);

export default SettingsPage;
