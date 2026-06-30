import { uploadObservation } from '../src/services/uploadService';

interface FakeUploadTarget {
  onprogress: ((event: ProgressEvent) => void) | null;
}

interface FakeXhr {
  upload: FakeUploadTarget;
  status: number;
  response: unknown;
  responseText: string;
  responseType: XMLHttpRequestResponseType;
  timeout: number;
  onload: (() => void) | null;
  onerror: (() => void) | null;
  ontimeout: (() => void) | null;
  onabort: (() => void) | null;
  open: ReturnType<typeof vi.fn>;
  send: ReturnType<typeof vi.fn>;
  abort: ReturnType<typeof vi.fn>;
}

const createFakeXhr = (): FakeXhr => ({
  upload: { onprogress: null },
  status: 0,
  response: null,
  responseText: '',
  responseType: '',
  timeout: 0,
  onload: null,
  onerror: null,
  ontimeout: null,
  onabort: null,
  open: vi.fn(),
  send: vi.fn(),
  abort: vi.fn(),
});

describe('uploadObservation', () => {
  it('streams multipart data and reports progress before resolving', async () => {
    const xhr = createFakeXhr();
    vi.stubGlobal('XMLHttpRequest', function XMLHttpRequestMock() {
      return xhr;
    });
    const onProgress = vi.fn();
    const resultPromise = uploadObservation(new File(['flux'], 'curve.csv'), { onProgress });

    xhr.upload.onprogress?.(new ProgressEvent('progress', { lengthComputable: true, loaded: 50, total: 100 }));
    xhr.status = 201;
    xhr.response = { upload_id: 'u1', analysis_id: 'a1', filename: 'curve.csv', format: 'csv', size_bytes: 4, status: 'processed' };
    xhr.onload?.();

    await expect(resultPromise).resolves.toEqual(expect.objectContaining({ analysis_id: 'a1' }));
    expect(onProgress).toHaveBeenCalledWith({ loaded: 50, total: 100, percentage: 50 });
    expect(xhr.open).toHaveBeenCalledWith('POST', expect.stringMatching(/\/uploads$/));
    expect(xhr.send).toHaveBeenCalledWith(expect.any(FormData));
  });

  it('aborts the request when cancellation is requested', async () => {
    const xhr = createFakeXhr();
    xhr.abort.mockImplementation(() => {
      xhr.onabort?.();
    });
    vi.stubGlobal('XMLHttpRequest', function XMLHttpRequestMock() {
      return xhr;
    });
    const controller = new AbortController();
    const resultPromise = uploadObservation(new File(['flux'], 'curve.csv'), { signal: controller.signal });

    controller.abort();

    await expect(resultPromise).rejects.toEqual(expect.objectContaining({ name: 'AbortError' }));
    expect(xhr.abort).toHaveBeenCalledOnce();
  });
});
