interface ErrorPanelProps {
  readonly title?: string;
  readonly message?: string;
  readonly onRetry: () => void;
}

export const ErrorPanel = ({
  title = 'Service unavailable',
  message = 'TransitLens could not reach the platform gateway. Check the configured API URL and service availability.',
  onRetry,
}: ErrorPanelProps) => (
  <div className="rounded-xl border border-rose-400/20 bg-rose-400/5 p-6" role="alert">
    <p className="text-sm font-semibold text-rose-200">{title}</p>
    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">{message}</p>
    <button type="button" onClick={onRetry} className="mt-5 rounded-lg border border-rose-300/25 px-4 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-300/10">
      Retry connection
    </button>
  </div>
);
