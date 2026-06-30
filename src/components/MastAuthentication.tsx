import { useState } from 'react';

interface MastAuthenticationProps {
  readonly hasToken: boolean;
  readonly onSave: (token: string) => void;
  readonly onClear: () => void;
}

export const MastAuthentication = ({ hasToken, onSave, onClear }: MastAuthenticationProps) => {
  const [token, setToken] = useState('');

  const handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!token.trim()) return;
    onSave(token);
    setToken('');
  };

  return (
    <section className="rounded-xl border border-white/8 bg-space-900/70 p-5" aria-labelledby="mast-access-title">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 id="mast-access-title" className="text-sm font-semibold text-slate-100">MAST access</h2>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${hasToken ? 'bg-emerald-400/10 text-emerald-300' : 'bg-slate-400/10 text-slate-500'}`}>
              {hasToken ? 'Session token' : 'Anonymous'}
            </span>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500">Credentials remain in this browser session and are sent only to the configured platform gateway.</p>
        </div>
        {hasToken && (
          <button type="button" onClick={onClear} className="self-start rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 hover:bg-white/5 sm:self-auto">
            Clear token
          </button>
        )}
      </div>
      {!hasToken && (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <label htmlFor="mast-token" className="sr-only">MAST API token</label>
          <input
            id="mast-token"
            type="password"
            autoComplete="off"
            value={token}
            onChange={(event) => {
              setToken(event.target.value);
            }}
            placeholder="Optional MAST API token"
            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-space-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-700"
          />
          <button type="submit" disabled={!token.trim()} className="rounded-lg border border-signal-400/30 px-4 py-2.5 text-xs font-semibold text-signal-300 hover:bg-signal-400/10 disabled:cursor-not-allowed disabled:opacity-40">
            Use for session
          </button>
        </form>
      )}
    </section>
  );
};
