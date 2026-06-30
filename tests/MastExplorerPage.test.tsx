import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import MastExplorerPage from '../src/pages/MastExplorerPage';

const observation = {
  mast_id: '42',
  observation_id: 'tess-s01-00042',
  target_name: 'TOI-700',
  mission: 'TESS',
  product_type: 'timeseries',
  start_time: 2458325.2,
  end_time: 2458353.1,
};

const renderPage = () => {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(<QueryClientProvider client={client}><MastExplorerPage /></QueryClientProvider>);
};

describe('MastExplorerPage', () => {
  it('validates numeric catalogue identifiers before searching', async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText('Identifier'), { target: { value: 'tic' } });
    fireEvent.change(screen.getByLabelText('TIC ID'), { target: { value: 'not-a-number' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search archive' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Enter digits only');
  });

  it('renders observations and completes a pipeline download', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify([observation]), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ mast_id: '42', product_filename: 'target_lc.fits', data_uri: 'mast:product/lc', path: 'cache/target_lc.fits', from_cache: false }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    renderPage();
    fireEvent.change(screen.getByLabelText('Target name'), { target: { value: 'TOI-700' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search archive' }));

    expect(await screen.findByText('tess-s01-00042')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Download FITS' }));

    expect(await screen.findByText('FITS download complete')).toBeVisible();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await waitFor(() => {
      expect(screen.getByText(/target_lc\.fits/)).toBeVisible();
    });
  });
});
