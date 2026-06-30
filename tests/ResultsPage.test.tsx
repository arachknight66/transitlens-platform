import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import ResultsPage from '../src/pages/ResultsPage';
import { scientificResults } from './fixtures/scientificResults';

describe('ResultsPage', () => {
  it('renders a complete scientific summary and observation provenance', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(scientificResults), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<MemoryRouter initialEntries={['/results?analysis_id=a1']}><QueryClientProvider client={client}><ResultsPage /></QueryClientProvider></MemoryRouter>);

    expect(await screen.findByRole('heading', { name: 'Scientific metrics' })).toBeVisible();
    expect(screen.getByText('TOI-700')).toBeVisible();
    expect(screen.getByText('db4 · soft')).toBeVisible();
    expect(screen.getByText('Prediction not available')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Open analysis workspace' })).toHaveAttribute('href', '/analysis?analysis_id=a1');
  });
});
