import { validateScientificResults } from '../src/utils/resultsValidation';
import { scientificResults } from './fixtures/scientificResults';

describe('validateScientificResults', () => {
  it('accepts finite and explicitly unavailable pipeline metrics', () => {
    expect(validateScientificResults(scientificResults)).toEqual({ isValid: true });
  });

  it('rejects non-finite values and missing pipeline provenance', () => {
    expect(validateScientificResults({ ...scientificResults, metrics: { ...scientificResults.metrics, transit_depth: { ...scientificResults.metrics.transit_depth, value: Number.NaN } } }).message).toMatch(/non-finite/i);
    expect(validateScientificResults({ ...scientificResults, metrics: { ...scientificResults.metrics, transit_depth: { ...scientificResults.metrics.transit_depth, source: 'other' } } }).message).toMatch(/provenance/i);
  });
});
