import type { ProcessedAnalysis } from '../src/types/analysis';
import { validateProcessedAnalysis } from '../src/utils/analysisValidation';

const analysis = {
  analysis_id: 'a1', status: 'processed', source: { filename: 'curve.fits' },
  time: [1, 2], flux: [10, 11], normalized_flux: [1, 0.99], median_filtered_flux: [1, 1], wavelet_flux: [1, 0.995], quality: null, metadata: {}, features: {},
} satisfies ProcessedAnalysis;

describe('validateProcessedAnalysis', () => {
  it('accepts aligned finite pipeline arrays', () => {
    expect(validateProcessedAnalysis(analysis)).toEqual({ isValid: true });
  });

  it('rejects empty, misaligned, and non-finite arrays', () => {
    expect(validateProcessedAnalysis({ ...analysis, time: [] }).message).toMatch(/no light-curve samples/i);
    expect(validateProcessedAnalysis({ ...analysis, wavelet_flux: [1] }).message).toMatch(/different lengths/i);
    expect(validateProcessedAnalysis({ ...analysis, flux: [10, Number.NaN] }).message).toMatch(/non-finite/i);
  });
});

