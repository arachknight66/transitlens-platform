import { useState } from 'react';

import { FileDropzone } from '../components/FileDropzone';
import { PageHeader } from '../components/PageHeader';
import { SelectedFileCard } from '../components/SelectedFileCard';
import { UploadProgressPanel } from '../components/UploadProgressPanel';
import { useFileUpload } from '../hooks/useFileUpload';
import { FileValidationError, validateUploadFile, type ValidatedUpload } from '../utils/fileValidation';

const UploadPage = () => {
  const [selected, setSelected] = useState<ValidatedUpload | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const transfer = useFileUpload();

  const selectFile = (file: File): void => {
    transfer.reset();
    try {
      setSelected(validateUploadFile(file));
      setValidationError(null);
    } catch (error) {
      setSelected(null);
      setValidationError(error instanceof FileValidationError ? error.message : 'The selected file is not valid.');
    }
  };

  const clearSelection = (): void => {
    transfer.reset();
    setSelected(null);
    setValidationError(null);
  };

  const isUploading = transfer.state === 'uploading';

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <PageHeader
        eyebrow="Local observations"
        title="Upload"
        description="Submit a local light-curve file to the TransitLens gateway. Parsing and preprocessing are performed exclusively by the data pipeline."
      />

      <div className="mt-8 space-y-5">
        <FileDropzone disabled={isUploading} onFile={selectFile} />

        {validationError && (
          <div className="rounded-xl border border-rose-400/20 bg-rose-400/5 p-5" role="alert">
            <p className="text-sm font-semibold text-rose-200">File not accepted</p>
            <p className="mt-2 text-sm text-slate-400">{validationError}</p>
          </div>
        )}

        {selected && <SelectedFileCard upload={selected} isUploading={isUploading} onRemove={clearSelection} />}

        {selected && transfer.state === 'idle' && (
          <button type="button" onClick={() => void transfer.upload(selected.file)} className="w-full rounded-lg bg-signal-400 px-5 py-3 text-sm font-semibold text-space-950 hover:bg-signal-300">
            Upload and process
          </button>
        )}

        {selected && isUploading && <UploadProgressPanel filename={selected.file.name} progress={transfer.progress} onCancel={transfer.cancel} />}

        {(transfer.state === 'error' || transfer.state === 'cancelled') && (
          <div className="rounded-xl border border-rose-400/20 bg-rose-400/5 p-5" role="alert">
            <p className="text-sm font-semibold text-rose-200">{transfer.state === 'cancelled' ? 'Upload cancelled' : 'Upload failed'}</p>
            <p className="mt-2 text-sm text-slate-400">{transfer.error}</p>
            {selected && <button type="button" onClick={() => void transfer.upload(selected.file)} className="mt-4 rounded-lg border border-rose-300/25 px-4 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-300/10">Try again</button>}
          </div>
        )}

        {transfer.state === 'success' && transfer.receipt && (
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-5" role="status">
            <p className="text-sm font-semibold text-emerald-200">File accepted for analysis</p>
            <p className="mt-2 text-sm text-slate-400">{transfer.receipt.filename} was {transfer.receipt.status}. Analysis reference: <span className="font-mono text-slate-300">{transfer.receipt.analysis_id}</span></p>
            <button type="button" onClick={clearSelection} className="mt-4 rounded-lg border border-emerald-300/25 px-4 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-300/10">Upload another file</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;

