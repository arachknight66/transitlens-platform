import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import ReportsPage from '../src/pages/ReportsPage';
import { scientificResults } from './fixtures/scientificResults';

const { saveBlob } = vi.hoisted(() => ({ saveBlob: vi.fn() }));
vi.mock('../src/utils/download', () => ({ saveBlob }));

describe('ReportsPage', () => {
  it('opens the export dialog and downloads a generated PDF', async () => {
    const reportResults = {
      ...scientificResults,
      prediction: {
        prediction_id: 'p1', analysis_id: 'a1', probability: 0.91, confidence: 0.82,
        predicted_class: 1, model_version: '2.1.0', inference_time: 12.4, created_at: '2026-07-01T10:00:00Z',
      },
    };
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify(reportResults), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response('pdf bytes', { status: 200, headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="transitlens-report.pdf"' } }));
    const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    render(<MemoryRouter initialEntries={['/reports?analysis_id=a1']}><QueryClientProvider client={client}><ReportsPage /></QueryClientProvider></MemoryRouter>);

    fireEvent.click(await screen.findByRole('button', { name: 'Choose export format' }));
    expect(screen.getByRole('dialog', { name: 'Generate report' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Download PDF' }));

    expect(await screen.findByText('Download started')).toBeVisible();
    expect(screen.getByText('transitlens-report.pdf')).toBeVisible();
    expect(saveBlob).toHaveBeenCalledWith(expect.any(Blob), 'transitlens-report.pdf');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('requires a prediction before offering export formats', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(scientificResults), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<MemoryRouter initialEntries={['/reports?analysis_id=a1']}><QueryClientProvider client={client}><ReportsPage /></QueryClientProvider></MemoryRouter>);

    expect(await screen.findByText('Prediction required for report generation')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Choose export format' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Run inference' })).toHaveAttribute('href', '/analysis?analysis_id=a1');
  });
});
