export type ReportFormat = 'pdf' | 'json' | 'csv';

export interface ReportArtifact {
  readonly blob: Blob;
  readonly filename: string;
  readonly format: ReportFormat;
}

