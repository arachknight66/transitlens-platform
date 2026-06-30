import { FileValidationError, MAX_UPLOAD_BYTES, validateUploadFile } from '../src/utils/fileValidation';

describe('upload file validation', () => {
  it.each([
    ['observation.fits', 'fits'],
    ['observation.FIT', 'fits'],
    ['light-curve.csv', 'csv'],
  ] as const)('accepts %s as %s', (filename, format) => {
    const result = validateUploadFile(new File(['data'], filename));
    expect(result.format).toBe(format);
  });

  it('rejects unsupported, empty, and oversized files', () => {
    expect(() => validateUploadFile(new File(['data'], 'notes.txt'))).toThrow(FileValidationError);
    expect(() => validateUploadFile(new File([], 'empty.fits'))).toThrow('empty');

    const oversized = new File(['data'], 'large.csv');
    Object.defineProperty(oversized, 'size', { value: MAX_UPLOAD_BYTES + 1 });
    expect(() => validateUploadFile(oversized)).toThrow('250 MB');
  });
});

