export type Mission = 'Kepler' | 'K2' | 'TESS';
export type SearchIdentifier = 'target' | 'tic' | 'kepler' | 'observation';

export interface MastSearchCriteria {
  readonly identifier: SearchIdentifier;
  readonly value: string;
  readonly missions: readonly Mission[];
  readonly radiusDeg: number;
  readonly limit: number;
}

export interface Observation {
  readonly mast_id: string;
  readonly observation_id: string;
  readonly target_name: string;
  readonly mission: Mission;
  readonly product_type: string;
  readonly start_time: number | null;
  readonly end_time: number | null;
}

export interface DownloadedFits {
  readonly mast_id: string;
  readonly product_filename: string;
  readonly data_uri: string;
  readonly path: string;
  readonly from_cache: boolean;
}

