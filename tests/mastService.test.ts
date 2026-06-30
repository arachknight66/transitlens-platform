import { downloadObservation, searchObservations } from '../src/services/mastService';

describe('mastService', () => {
  it('normalizes TIC searches and attaches session authentication', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('[]', { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );

    await searchObservations({ identifier: 'tic', value: ' 123 ', missions: ['TESS'], radiusDeg: 0.001, limit: 100 }, 'secret');

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBeInstanceOf(URL);
    expect((url as URL).searchParams.get('target')).toBe('TIC 123');
    expect((url as URL).searchParams.get('missions')).toBe('TESS');
    expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer secret');
  });

  it('requests a download using only the pipeline observation identifier', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ mast_id: '42', product_filename: 'target_lc.fits', data_uri: 'mast:product/lc', path: 'cache/target_lc.fits', from_cache: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await downloadObservation('42', null);

    const [, init] = fetchMock.mock.calls[0] ?? [];
    expect(init).toEqual(expect.objectContaining({ method: 'POST', body: JSON.stringify({ mast_id: '42' }) }));
  });
});
