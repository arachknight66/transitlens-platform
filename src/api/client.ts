import { env } from '../config/env';

type QueryPrimitive = boolean | number | string;
type QueryValue = QueryPrimitive | readonly QueryPrimitive[] | null | undefined;

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: BodyInit | object | null;
  query?: Readonly<Record<string, QueryValue>>;
  timeoutMs?: number;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const createUrl = (path: string, query?: ApiRequestOptions['query']): URL => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${env.platformApiUrl}${normalizedPath}`);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        url.searchParams.append(key, String(item));
      });
    } else if (value !== null && value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });

  return url;
};

const parseResponse = async (response: Response): Promise<unknown> => {
  if (response.status === 204) return undefined;

  const contentType = response.headers.get('content-type') ?? '';
  return contentType.includes('application/json') ? response.json() : response.text();
};

export const apiClient = async <T>(path: string, options: ApiRequestOptions = {}): Promise<T> => {
  const { body, headers, query, timeoutMs = env.apiTimeoutMs, ...requestInit } = options;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => {
    controller.abort();
  }, timeoutMs);
  const isJsonBody = body !== null && body !== undefined && !(body instanceof FormData) && !(body instanceof Blob);
  const requestHeaders = new Headers(headers);
  requestHeaders.set('Accept', 'application/json');
  if (isJsonBody) requestHeaders.set('Content-Type', 'application/json');

  try {
    const response = await fetch(createUrl(path, query), {
      ...requestInit,
      body: isJsonBody ? JSON.stringify(body) : (body as BodyInit | null | undefined),
      headers: requestHeaders,
      signal: controller.signal,
    });
    const payload = await parseResponse(response);

    if (!response.ok) {
      const message =
        typeof payload === 'object' && payload !== null && 'detail' in payload
          ? String(payload.detail)
          : `Request failed with status ${String(response.status)}`;
      throw new ApiError(message, response.status, payload);
    }

    return payload as T;
  } finally {
    window.clearTimeout(timeout);
  }
};
