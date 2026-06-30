import type { ScientificResults } from '../../src/types/results';

export const scientificResults = {
  analysis_id: 'a1', generated_at: '2026-07-01T10:00:00Z',
  metrics: {
    transit_depth: { value: 820, unit: 'ppm', source: 'transitlens-data-pipeline' },
    transit_duration: { value: null, unit: 'hours', source: 'transitlens-data-pipeline' },
    estimated_period: { value: 9.98, unit: 'days', source: 'transitlens-data-pipeline' },
    signal_to_noise_ratio: { value: 12.4, unit: 'dimensionless', source: 'transitlens-data-pipeline' },
  },
  observation: { mission: 'TESS', target_name: 'TOI-700', observation_id: 'obs-1', source_filename: 'curve.fits', flux_column: 'PDCSAP_FLUX', quality_column: 'QUALITY', observation_duration_days: 27.4, cadence_days: 0.00139 },
  processing: { schema_version: '1.0', pipeline_version: '0.1.0', input_samples: 1000, non_finite_removed: 2, quality_removed: 8, output_samples: 990, quality_bitmask: 'default', median_window: 5, wavelet: 'db4', wavelet_threshold_mode: 'soft' },
  prediction: null,
} satisfies ScientificResults;

