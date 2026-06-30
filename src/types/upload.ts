export type UploadFormat = 'fits' | 'csv';
export type UploadProcessingStatus = 'accepted' | 'processing' | 'processed';

export interface UploadReceipt {
  readonly upload_id: string;
  readonly analysis_id: string;
  readonly filename: string;
  readonly format: UploadFormat;
  readonly size_bytes: number;
  readonly status: UploadProcessingStatus;
}

export interface UploadProgress {
  readonly loaded: number;
  readonly total: number;
  readonly percentage: number;
}

