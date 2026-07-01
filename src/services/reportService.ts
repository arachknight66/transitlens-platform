import { ApiError } from '../api/client';
import { env } from '../config/env';
import type { ReportArtifact, ReportFormat } from '../types/report';

const acceptByFormat: Record<ReportFormat, string> = {
  pdf: 'application/pdf',
  json: 'application/json',
  csv: 'text/csv',
};

const filenameFromDisposition = (value: string | null, fallback: string): string => {
  if (!value) return fallback;
  const encoded = /filename\*=UTF-8''([^;]+)/i.exec(value)?.[1];
  const quoted = /filename="([^"]+)"/i.exec(value)?.[1];
  const plain = /filename=([^;]+)/i.exec(value)?.[1];
  const candidate = encoded ? decodeURIComponent(encoded) : (quoted ?? plain)?.trim();
  if (!candidate) return fallback;
  return candidate.replace(/[\\/]/g, '_');
};

const errorMessage = async (response: Response): Promise<string> => {
  try {
    const payload = await response.json() as { detail?: unknown };
    if (typeof payload.detail === 'string') return payload.detail;
  } catch {
    // Non-JSON gateway errors use the stable fallback below.
  }
  return `Report generation failed with status ${String(response.status)}`;
};

export const generateReport = async (
  analysisId: string,
  format: ReportFormat,
  signal?: AbortSignal,
): Promise<ReportArtifact> => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => {
    controller.abort();
  }, env.apiTimeoutMs);
  const abort = (): void => {
    controller.abort();
  };
  signal?.addEventListener('abort', abort, { once: true });

  try {
    const response = await fetch(`${env.platformApiUrl}/analyses/${encodeURIComponent(analysisId)}/reports`, {
      method: 'POST',
      headers: { Accept: acceptByFormat[format], 'Content-Type': 'application/json' },
      body: JSON.stringify({ format }),
      signal: controller.signal,
    });
    if (!response.ok) throw new ApiError(await errorMessage(response), response.status);

    const fallback = `transitlens-${analysisId.replace(/[^a-z0-9_-]/gi, '_')}.${format}`;
    return {
      blob: await response.blob(),
      filename: filenameFromDisposition(response.headers.get('content-disposition'), fallback),
      format,
    };
  } finally {
    window.clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
};
