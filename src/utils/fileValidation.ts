import type { UploadFormat } from '../types/upload';

export const MAX_UPLOAD_BYTES = 250 * 1024 * 1024;
export const ACCEPTED_UPLOAD_EXTENSIONS = ['.fits', '.fit', '.csv'] as const;

export interface ValidatedUpload {
  readonly file: File;
  readonly format: UploadFormat;
}

export class FileValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileValidationError';
  }
}

const extensionOf = (filename: string): string => {
  const dotIndex = filename.lastIndexOf('.');
  return dotIndex === -1 ? '' : filename.slice(dotIndex).toLowerCase();
};

export const validateUploadFile = (file: File): ValidatedUpload => {
  const extension = extensionOf(file.name);

  if (!ACCEPTED_UPLOAD_EXTENSIONS.some((accepted) => accepted === extension)) {
    throw new FileValidationError('Choose a FITS, FIT, or CSV file.');
  }
  if (file.size === 0) {
    throw new FileValidationError('The selected file is empty.');
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new FileValidationError('The selected file exceeds the 250 MB upload limit.');
  }

  return { file, format: extension === '.csv' ? 'csv' : 'fits' };
};

