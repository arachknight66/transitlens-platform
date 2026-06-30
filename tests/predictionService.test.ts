import { runPrediction } from '../src/services/predictionService';

describe('predictionService', () => {
  it('requests gateway-orchestrated ML Core inference', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ predicted_class: 1 }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    await runPrediction('analysis/42');
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect((url as URL).pathname).toBe('/api/analyses/analysis%2F42/prediction');
    expect(init).toEqual(expect.objectContaining({ method: 'POST' }));
  });
});

