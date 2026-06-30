"use client";

import { useCallback, useRef, useState } from "react";
import {
  parseCsvLightCurve,
  parseFitsLightCurve,
  type ParsedLightCurve,
} from "@/lib/parseLightCurve";

interface Props {
  data: ParsedLightCurve | null;
  error: string | null;
  onData: (data: ParsedLightCurve | null) => void;
  onError: (error: string | null) => void;
}

export function UploadZone({ data, error, onData, onError }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const processFile = useCallback(
    async (file: File) => {
      onError(null);
      const ext = file.name.toLowerCase();
      if (!ext.endsWith(".csv") && !ext.endsWith(".fits") && !ext.endsWith(".fits.gz")) {
        onError("Accepted formats: .csv, .fits, .fits.gz");
        onData(null);
        return;
      }

      try {
        if (ext.endsWith(".csv")) {
          const text = await file.text();
          const parsed = parseCsvLightCurve(text, file.name);
          onData(parsed);
        } else {
          let buffer = await file.arrayBuffer();
          if (ext.endsWith(".fits.gz")) {
            // Natively decompress gzip using DecompressionStream
            const ds = new DecompressionStream("gzip");
            const decompressedStream = file.stream().pipeThrough(ds);
            const response = new Response(decompressedStream);
            buffer = await response.arrayBuffer();
          }
          const parsed = parseFitsLightCurve(buffer, file.name);
          onData(parsed);
        }
      } catch (err) {
        onData(null);
        onError(
          err instanceof Error
            ? err.message
            : "Failed to parse file."
        );
      }
    },
    [onData, onError]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors duration-fast ${
          dragOver
            ? "border-brand bg-brand-ghost"
            : "border-border-soft bg-bg-surface hover:border-brand/50"
        }`}
      >
        <span className="mb-1 text-2xl" aria-hidden>
          📁
        </span>
        <p className="text-sm font-medium text-text-primary">
          Drop CSV or FITS here or click to browse
        </p>
        <p className="mt-1 text-xs text-text-muted">
          Supports Light Curves (LC), Target Pixel Files (TP), and Data Validation (DVT) FITS files.
        </p>
        <p className="mt-0.5 text-2xs text-text-muted">
          Requires time/flux columns, ≥500 points, and normalized flux.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.fits,.fits.gz"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) processFile(file);
          }}
        />
      </div>

      {error && (
        <p className="flex items-center gap-2 text-sm text-status-error">
          <span aria-hidden>⚠</span> {error}
        </p>
      )}

      {data && (
        <div className="rounded-md border border-status-ok/30 bg-status-ok/10 px-3 py-2 text-sm">
          <span className="font-medium text-text-primary">{data.filename}</span>
          <span className="ml-2 text-text-secondary">
            {data.time.length.toLocaleString()} pts · t={data.time[0].toFixed(2)}–
            {data.time[data.time.length - 1].toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
}
