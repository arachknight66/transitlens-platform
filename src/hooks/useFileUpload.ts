import { useCallback, useRef, useState } from 'react';

import { uploadObservation } from '../services/uploadService';
import type { UploadReceipt } from '../types/upload';
import { setCurrentAnalysisId } from '../utils/analysisSession';

type UploadState = 'idle' | 'uploading' | 'success' | 'error' | 'cancelled';

export const useFileUpload = () => {
  const [state, setState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [receipt, setReceipt] = useState<UploadReceipt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const upload = useCallback(async (file: File): Promise<void> => {
    const controller = new AbortController();
    controllerRef.current = controller;
    setState('uploading');
    setProgress(0);
    setReceipt(null);
    setError(null);

    try {
      const result = await uploadObservation(file, {
        signal: controller.signal,
        onProgress: ({ percentage }) => {
          setProgress(percentage);
        },
      });
      setProgress(100);
      setReceipt(result);
      setCurrentAnalysisId(result.analysis_id);
      setState('success');
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === 'AbortError') {
        setState('cancelled');
        setError('Upload cancelled. Your file was not submitted.');
      } else {
        setState('error');
        setError(cause instanceof Error ? cause.message : 'Upload failed.');
      }
    } finally {
      controllerRef.current = null;
    }
  }, []);

  const cancel = useCallback((): void => {
    controllerRef.current?.abort();
  }, []);

  const reset = useCallback((): void => {
    controllerRef.current?.abort();
    setState('idle');
    setProgress(0);
    setReceipt(null);
    setError(null);
  }, []);

  return { state, progress, receipt, error, upload, cancel, reset } as const;
};
