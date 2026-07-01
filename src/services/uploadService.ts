import { ApiError } from '../api/client';
import { env } from '../config/env';
import type { UploadProgress, UploadReceipt } from '../types/upload';

interface UploadOptions {
  readonly signal?: AbortSignal;
  readonly onProgress?: (progress: UploadProgress) => void;
}

interface ErrorPayload {
  readonly detail?: string;
}

const errorDetail = (responseText: string): string | undefined => {
  try {
    const payload = JSON.parse(responseText) as ErrorPayload;
    return payload.detail;
  } catch {
    return undefined;
  }
};

export const uploadObservation = (file: File, options: UploadOptions = {}): Promise<UploadReceipt> =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const form = new FormData();
    form.append('file', file, file.name);

    xhr.open('POST', `${env.platformApiUrl}/upload`);
    xhr.withCredentials = true;
    xhr.responseType = 'json';
    xhr.timeout = env.apiTimeoutMs;

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || event.total === 0) return;
      options.onProgress?.({
        loaded: event.loaded,
        total: event.total,
        percentage: Math.round((event.loaded / event.total) * 100),
      });
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response as UploadReceipt);
        return;
      }
      reject(new ApiError(errorDetail(xhr.responseText) ?? `Upload failed with status ${String(xhr.status)}`, xhr.status, xhr.response));
    };
    xhr.onerror = () => {
      reject(new Error('The platform gateway could not be reached.'));
    };
    xhr.ontimeout = () => {
      reject(new Error('The upload timed out before completion.'));
    };
    xhr.onabort = () => {
      reject(new DOMException('Upload cancelled', 'AbortError'));
    };

    if (options.signal) {
      if (options.signal.aborted) {
        xhr.abort();
        return;
      }
      options.signal.addEventListener('abort', () => {
        xhr.abort();
      }, { once: true });
    }

    xhr.send(form);
  });
