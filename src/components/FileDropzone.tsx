import { useRef, useState } from 'react';

import { ACCEPTED_UPLOAD_EXTENSIONS } from '../utils/fileValidation';

interface FileDropzoneProps {
  readonly disabled?: boolean;
  readonly onFile: (file: File) => void;
}

export const FileDropzone = ({ disabled = false, onFile }: FileDropzoneProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const chooseFirstFile = (files: FileList | null): void => {
    const file = files?.[0];
    if (file) onFile(file);
  };

  return (
    <div
      className={`rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors ${isDragging ? 'border-signal-400 bg-signal-400/5' : 'border-white/12 bg-space-900/55'} ${disabled ? 'opacity-50' : ''}`}
      onDragEnter={(event) => {
        event.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
      }}
      onDragLeave={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
        setIsDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        if (!disabled) chooseFirstFile(event.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept={ACCEPTED_UPLOAD_EXTENSIONS.join(',')}
        disabled={disabled}
        aria-label="Choose observation file"
        onChange={(event) => {
          chooseFirstFile(event.target.files);
          event.target.value = '';
        }}
      />
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-signal-400/25 bg-signal-400/5 font-mono text-lg text-signal-300" aria-hidden="true">↑</span>
      <h2 className="mt-5 text-base font-semibold text-white">Drop an observation file here</h2>
      <p className="mt-2 text-sm text-slate-500">FITS, FIT, or CSV · one file · maximum 250 MB</p>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          inputRef.current?.click();
        }}
        className="mt-6 rounded-lg border border-signal-400/30 px-4 py-2.5 text-xs font-semibold text-signal-300 hover:bg-signal-400/10 disabled:cursor-not-allowed"
      >
        Choose file
      </button>
    </div>
  );
};
