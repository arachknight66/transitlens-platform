import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';

import SettingsPage from '../src/pages/SettingsPage';

const renderPage = () => render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}><SettingsPage /></QueryClientProvider>);

describe('SettingsPage', () => {
  it('stores credentials only through the gateway session', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ pipeline_url: 'http://pipeline', ml_core_url: 'http://ml', has_mast_token: false, expires_at: '2026-07-01T12:00:00Z' }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ pipeline_url: 'http://pipeline', ml_core_url: 'http://ml', has_mast_token: true, expires_at: '2026-07-01T12:00:00Z' }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    renderPage();
    expect(await screen.findByDisplayValue('http://pipeline')).toBeVisible();
    fireEvent.change(screen.getByLabelText('MAST API token'), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save settings' }));
    expect(await screen.findByText('Settings saved for this session.')).toBeVisible();
    expect(fetchMock.mock.calls[1]?.[1]?.body).toContain('secret');
    expect(sessionStorage.getItem('transitlens.mast-token')).toBeNull();
  });
});

