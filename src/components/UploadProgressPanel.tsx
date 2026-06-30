interface UploadProgressPanelProps {
  readonly filename: string;
  readonly progress: number;
  readonly onCancel: () => void;
}

export const UploadProgressPanel = ({ filename, progress, onCancel }: UploadProgressPanelProps) => (
  <section className="rounded-xl border border-sky-400/15 bg-sky-400/5 p-5" aria-labelledby="upload-progress-title">
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <h2 id="upload-progress-title" className="text-sm font-semibold text-sky-200">Uploading observation</h2>
        <p className="mt-1 truncate text-xs text-slate-500">{filename}</p>
      </div>
      <span className="font-mono text-sm text-sky-300">{String(progress)}%</span>
    </div>
    <div className="mt-4 h-2 overflow-hidden rounded-full bg-space-950" role="progressbar" aria-label="File upload progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
      <div className="h-full rounded-full bg-signal-400 transition-[width]" style={{ width: `${String(progress)}%` }} />
    </div>
    <button type="button" onClick={onCancel} className="mt-4 text-xs font-medium text-slate-400 underline decoration-slate-700 underline-offset-4 hover:text-white">Cancel upload</button>
  </section>
);

