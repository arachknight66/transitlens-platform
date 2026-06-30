import { fireEvent, render, screen } from '@testing-library/react';

import { FileDropzone } from '../src/components/FileDropzone';

describe('FileDropzone', () => {
  it('accepts a dropped file through the accessible drop target', () => {
    const onFile = vi.fn();
    const file = new File(['SIMPLE'], 'target.fits');
    render(<FileDropzone onFile={onFile} />);
    const dropTarget = screen.getByText('Drop an observation file here').parentElement;
    if (dropTarget === null) throw new Error('Drop target not found');

    fireEvent.drop(dropTarget, {
      dataTransfer: { files: { item: () => file, length: 1, 0: file } },
    });

    expect(onFile).toHaveBeenCalledWith(file);
    expect(screen.getByLabelText('Choose observation file')).toHaveAttribute('accept', '.fits,.fit,.csv');
  });
});
