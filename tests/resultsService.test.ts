import { getScientificResults } from '../src/services/resultsService';

describe('resultsService', () => {
  it('loads an encoded scientific-results reference', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } }));
    await getScientificResults('analysis/42');
    const [url] = fetchMock.mock.calls[0] ?? [];
    expect((url as URL).pathname).toBe('/api/analyses/analysis%2F42/results');
  });
});

