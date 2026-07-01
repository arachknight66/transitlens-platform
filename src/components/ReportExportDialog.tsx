import { useEffect, useRef } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';

import type { ReportArtifact, ReportFormat } from '../types/report';

interface ReportExportDialogProps {
  readonly exportReport: UseMutationResult<ReportArtifact, Error, ReportFormat>;
  readonly onClose: () => void;
}

const formats = [
  { id: 'pdf', label: 'PDF', description: 'Publication-ready scientific summary', extension: '.pdf' },
  { id: 'json', label: 'JSON', description: 'Complete machine-readable result record', extension: '.json' },
  { id: 'csv', label: 'CSV', description: 'Tabular metrics and metadata export', extension: '.csv' },
] as const;

export const ReportExportDialog = ({ exportReport, onClose }: ReportExportDialogProps) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4 py-8 backdrop-blur-sm" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !exportReport.isPending) onClose();
    }}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-dialog-title"
        className="max-h-full w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-space-900 shadow-2xl shadow-black/50"
        onKeyDown={(event) => {
          if (event.key === 'Escape' && !exportReport.isPending) onClose();
        }}
      >
        <header className="flex items-start justify-between gap-4 border-b border-white/7 px-6 py-5">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.17em] text-signal-300 uppercase">Scientific export</p>
            <h2 id="export-dialog-title" className="mt-1 text-xl font-semibold text-white">Generate report</h2>
            <p className="mt-2 text-sm text-slate-500">Choose the format for this analysis record.</p>
          </div>
          <button ref={closeButtonRef} type="button" disabled={exportReport.isPending} onClick={onClose} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400 hover:text-white disabled:opacity-40" aria-label="Close report export">Close</button>
        </header>

        <div className="space-y-3 p-6">
          {formats.map((format) => {
            const isGenerating = exportReport.isPending && exportReport.variables === format.id;
            return (
              <div key={format.id} className="flex flex-col justify-between gap-4 rounded-xl border border-white/8 bg-space-950/65 p-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-4">
                  <span className="grid h-11 w-11 place-items-center rounded-lg border border-signal-400/20 bg-signal-400/5 font-mono text-xs font-semibold text-signal-300">{format.label}</span>
                  <div><p className="text-sm font-medium text-slate-200">{format.label} report</p><p className="mt-1 text-xs text-slate-500">{format.description} · {format.extension}</p></div>
                </div>
                <button
                  type="button"
                  disabled={exportReport.isPending}
                  onClick={() => {
                    exportReport.mutate(format.id);
                  }}
                  className="rounded-lg border border-signal-400/25 px-4 py-2.5 text-xs font-semibold text-signal-300 hover:bg-signal-400/10 disabled:cursor-wait disabled:opacity-50"
                >
                  {isGenerating ? `Generating ${format.label}…` : `Download ${format.label}`}
                </button>
              </div>
            );
          })}

          {exportReport.isError && (
            <div className="rounded-lg border border-rose-400/20 bg-rose-400/5 p-4" role="alert">
              <p className="text-sm font-semibold text-rose-200">Report generation failed</p>
              <p className="mt-1 text-xs text-slate-400">{exportReport.error.message}</p>
            </div>
          )}
          {exportReport.isSuccess && (
            <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/5 p-4" role="status">
              <p className="text-sm font-semibold text-emerald-200">Download started</p>
              <p className="mt-1 break-all font-mono text-xs text-slate-400">{exportReport.data.filename}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

