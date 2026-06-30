import { ApiError, apiClient } from '../src/api/client';

describe('apiClient', () => {
  it('serializes query parameters and JSON responses', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ status: 'ok' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(apiClient<{ status: string }>('/health', { query: { verbose: true } })).resolves.toEqual({ status: 'ok' });
    expect(fetchMock).toHaveBeenCalledWith(expect.objectContaining({ pathname: '/api/health', search: '?verbose=true' }), expect.any(Object));
  });

  it('exposes backend error details', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ detail: 'Pipeline unavailable' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(apiClient('/health')).rejects.toEqual(expect.objectContaining<ApiError>({
      message: 'Pipeline unavailable',
      name: 'ApiError',
      status: 503,
    }));
  });
});
