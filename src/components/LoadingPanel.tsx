export const LoadingPanel = () => (
  <div className="grid min-h-72 place-items-center rounded-xl border border-white/8 bg-space-900/70" role="status" aria-live="polite">
    <div className="text-center">
      <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-signal-400" aria-hidden="true" />
      <p className="mt-4 text-sm text-slate-400">Contacting platform services…</p>
    </div>
  </div>
);

