import { getProcessedAnalysis } from '../src/services/analysisService';

describe('analysisService', () => {
  it('loads an encoded analysis reference through the gateway', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ analysis_id: 'a/b' }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    await getProcessedAnalysis('a/b');
    const [url] = fetchMock.mock.calls[0] ?? [];
    expect((url as URL).pathname).toBe('/api/analyses/a%2Fb');
  });
});

