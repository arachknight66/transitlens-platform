import { generateReport } from '../src/services/reportService';

describe('reportService', () => {
  it.each([
    ['pdf', 'application/pdf'],
    ['json', 'application/json'],
    ['csv', 'text/csv'],
  ] as const)('generates a %s report with the correct accept header', async (format, accept) => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('report', {
      status: 200,
      headers: { 'Content-Type': accept, 'Content-Disposition': `attachment; filename="science.${format}"` },
    }));

    const artifact = await generateReport('analysis/42', format);
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toContain('/analyses/analysis%2F42/reports');
    expect(new Headers(init?.headers).get('Accept')).toBe(accept);
    expect(init?.body).toBe(JSON.stringify({ format }));
    expect(artifact.filename).toBe(`science.${format}`);
    expect(artifact.blob.size).toBeGreaterThan(0);
  });

  it('uses gateway error details', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ detail: 'Prediction required' }), { status: 409, headers: { 'Content-Type': 'application/json' } }));
    await expect(generateReport('a1', 'pdf')).rejects.toEqual(expect.objectContaining({ message: 'Prediction required', status: 409 }));
  });
});

