import type { ValidatedUpload } from '../utils/fileValidation';

const formatBytes = (bytes: number): string => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

interface SelectedFileCardProps {
  readonly upload: ValidatedUpload;
  readonly isUploading: boolean;
  readonly onRemove: () => void;
}

export const SelectedFileCard = ({ upload, isUploading, onRemove }: SelectedFileCardProps) => (
  <section className="rounded-xl border border-white/8 bg-space-900/70 p-5" aria-labelledby="selected-file-title">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div className="min-w-0">
        <p id="selected-file-title" className="text-[10px] font-semibold tracking-[0.17em] text-slate-600 uppercase">Selected observation</p>
        <p className="mt-2 truncate text-sm font-medium text-slate-100" title={upload.file.name}>{upload.file.name}</p>
        <p className="mt-1 text-xs text-slate-500">{upload.format.toUpperCase()} · {formatBytes(upload.file.size)}</p>
      </div>
      <button type="button" disabled={isUploading} onClick={onRemove} className="self-start rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40 sm:self-auto">
        Remove
      </button>
    </div>
  </section>
);

