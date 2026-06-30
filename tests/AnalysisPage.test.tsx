import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import AnalysisPage from '../src/pages/AnalysisPage';

vi.mock('../src/components/PlotlyChart', () => ({
  PlotlyChart: () => <div data-testid="plotly-chart">Plotly chart</div>,
}));

const processed = {
  analysis_id: 'a1', status: 'processed', source: { filename: 'curve.fits', target: 'TOI-700' },
  time: [1, 2], flux: [10, 11], normalized_flux: [1, 0.99], median_filtered_flux: [1, 1], wavelet_flux: [1, 0.995], quality: null, metadata: {}, features: {},
};

const renderPage = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<MemoryRouter initialEntries={['/analysis?analysis_id=a1']}><QueryClientProvider client={client}><AnalysisPage /></QueryClientProvider></MemoryRouter>);
};

describe('AnalysisPage', () => {
  it('renders all processed curve stages from the gateway response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(processed), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    renderPage();
    expect(await screen.findByTestId('plotly-chart')).toBeVisible();
    expect(screen.getByRole('img', { name: /raw, normalized, and wavelet-denoised/i })).toBeVisible();
    expect(screen.getByText('TOI-700')).toBeVisible();
  });

  it('rejects malformed pipeline arrays instead of plotting them', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ...processed, wavelet_flux: [1] }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    renderPage();
    expect(await screen.findByRole('alert')).toHaveTextContent(/different lengths/i);
    expect(screen.queryByTestId('plotly-chart')).not.toBeInTheDocument();
  });

  it('runs ML Core inference and displays its result', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify(processed), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        prediction_id: 'p1', analysis_id: 'a1', probability: 0.91, confidence: 0.82,
        predicted_class: 1, model_version: '2.1.0', inference_time: 12.4, created_at: '2026-07-01T10:00:00Z',
      }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Run inference' }));

    expect(await screen.findByText('Transit candidate detected')).toBeVisible();
    expect(screen.getByText('2.1.0')).toBeVisible();
  });
});
