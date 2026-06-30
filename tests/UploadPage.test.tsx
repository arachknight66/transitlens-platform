import { fireEvent, render, screen } from '@testing-library/react';

import UploadPage from '../src/pages/UploadPage';

describe('UploadPage', () => {
  it('shows validation feedback and selected file metadata', async () => {
    render(<UploadPage />);
    const input = screen.getByLabelText('Choose observation file');

    fireEvent.change(input, { target: { files: [new File(['notes'], 'notes.txt')] } });
    expect(await screen.findByRole('alert')).toHaveTextContent('Choose a FITS, FIT, or CSV file');

    fireEvent.change(input, { target: { files: [new File(['SIMPLE'], 'target.fits')] } });
    expect(screen.getByText('target.fits')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Upload and process' })).toBeEnabled();
  });
});

