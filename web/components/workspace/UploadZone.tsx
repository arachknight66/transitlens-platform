"use client";

import { useCallback, useRef, useState } from "react";
import { parseCsvLightCurve, type ParsedLightCurve } from "@/lib/parseLightCurve";

interface Props {
  data: ParsedLightCurve | null;
  error: string | null;
  onData: (data: ParsedLightCurve | null) => void;
  onError: (error: string | null) => void;
  onFile: (file: File | null) => void;
}

const SUPPORTED = [".csv", ".fits", ".fit", ".fts", ".fits.gz", ".fit.gz", ".fts.gz"];

export function UploadZone({ data, error, onData, onError, onFile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const processFile = useCallback(async (file: File) => {
    onError(null);
    onFile(null);
    const name = file.name.toLowerCase();
    if (!SUPPORTED.some((suffix) => name.endsWith(suffix))) {
      onError("Accepted formats: CSV, FITS/FIT/FTS, and compressed FITS variants.");
      onData(null);
      return;
    }
    try {
      if (name.endsWith(".csv")) {
        onData(parseCsvLightCurve(await file.text(), file.name));
      } else {
        // FITS parsing is backend-authoritative. Keep the original bytes intact;
        // this browser object is only a selection preview.
        onData({ time: [], flux: [], filename: file.name });
      }
      onFile(file);
    } catch (caught) {
      onData(null);
      onFile(null);
      onError(caught instanceof Error ? caught.message : "Failed to preview file.");
    }
  }, [onData, onError, onFile]);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file) void processFile(file);
  }, [processFile]);

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
        }}
        onDragOver={(event) => { event.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors duration-fast ${
          dragOver ? "border-brand bg-brand-ghost" : "border-border-soft bg-bg-surface hover:border-brand/50"
        }`}
      >
        <span className="mb-1 text-2xl" aria-hidden>📁</span>
        <p className="text-sm font-medium text-text-primary">Drop CSV, FITS, or FITS.GZ here</p>
        <p className="mt-1 text-xs text-text-muted">
          Light-curve tables, compatible DVT tables, target-pixel files, and TESScut cubes are detected by the backend.
        </p>
        <p className="mt-0.5 text-2xs text-text-muted">The untouched payload is uploaded; browser parsing is preview-only.</p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.fits,.fit,.fts,.fits.gz,.fit.gz,.fts.gz"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void processFile(file);
          }}
        />
      </div>

      {error && <p className="flex items-center gap-2 text-sm text-status-error"><span aria-hidden>⚠</span>{error}</p>}
      {data && (
        <div className="rounded-md border border-status-ok/30 bg-status-ok/10 px-3 py-2 text-sm">
          <span className="font-medium text-text-primary">{data.filename}</span>
          <span className="ml-2 text-text-secondary">
            {data.time.length > 0
              ? `${data.time.length.toLocaleString()} point preview · ${data.time[0].toFixed(2)}–${data.time[data.time.length - 1].toFixed(2)} d`
              : "original payload selected · backend parsing required"}
          </span>
        </div>
      )}
    </div>
  );
}
