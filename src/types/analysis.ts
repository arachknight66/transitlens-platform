export interface AnalysisSource {
  readonly filename: string;
  readonly target?: string;
  readonly mission?: string;
}

export interface ProcessedAnalysis {
  readonly analysis_id: string;
  readonly status: 'processed';
  readonly source: AnalysisSource;
  readonly time: number[];
  readonly flux: number[];
  readonly normalized_flux: number[];
  readonly median_filtered_flux: number[];
  readonly wavelet_flux: number[];
  readonly quality: number[] | null;
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly features: Readonly<Record<string, unknown>>;
}

export type CurveKey = 'raw' | 'normalized' | 'wavelet';
