import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

import DashboardPage from '../src/pages/DashboardPage';
import type { DashboardSummary } from '../src/types/dashboard';

const summary: DashboardSummary = {
  systemState: 'operational',
  pipelineState: 'operational',
  modelVersion: 'transitlens-cnn-v2.1',
  services: [
    { id: 'pipeline', name: 'Data Pipeline', state: 'operational', latencyMs: 31 },
    { id: 'ml', name: 'ML Core', state: 'operational', latencyMs: 48 },
  ],
  recentAnalyses: [{ id: 'a1', target: 'TOI-700 d', mission: 'TESS', state: 'completed', updatedAt: '2026-07-01T06:00:00Z' }],
  recentDownloads: [{ id: 'd1', filename: 'tess-s01-lc.fits', target: 'TOI-700', downloadedAt: '2026-07-01T05:00:00Z', sizeBytes: 2_400_000 }],
  activeJobs: [{ id: 'a2', target: 'Kepler-186 f', mission: 'Kepler', state: 'processing', progress: 64, updatedAt: '2026-07-01T06:15:00Z' }],
  generatedAt: '2026-07-01T06:20:00Z',
};

const renderDashboard = (response: Response | Error) => {
  vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
    response instanceof Error ? Promise.reject(response) : Promise.resolve(response.clone()),
  );
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}><DashboardPage /></QueryClientProvider>);
};

describe('DashboardPage', () => {
  it('renders service status and recent activity from the gateway', async () => {
    renderDashboard(new Response(JSON.stringify(summary), { status: 200, headers: { 'Content-Type': 'application/json' } }));

    expect(screen.getByRole('status')).toHaveTextContent(/contacting platform services/i);
    expect(await screen.findByText('transitlens-cnn-v2.1')).toBeVisible();
    expect(screen.getByText('Kepler-186 f')).toBeVisible();
    expect(screen.getByText('tess-s01-lc.fits')).toBeVisible();
    expect(screen.getByRole('progressbar', { name: /kepler-186 f progress/i })).toHaveAttribute('aria-valuenow', '64');
  });

  it('shows an actionable error when the gateway is unavailable', async () => {
    renderDashboard(new Error('Network unavailable'));

    expect(await screen.findByRole('alert')).toHaveTextContent(/dashboard services are unavailable/i);
    expect(screen.getByRole('button', { name: /retry connection/i })).toBeEnabled();
  });
});

