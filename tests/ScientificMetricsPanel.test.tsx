import { render, screen } from '@testing-library/react';

import { ScientificMetricsPanel } from '../src/components/ScientificMetricsPanel';
import { scientificResults } from './fixtures/scientificResults';

describe('ScientificMetricsPanel', () => {
  it('formats available values and preserves unavailable metrics honestly', () => {
    render(<ScientificMetricsPanel metrics={scientificResults.metrics} />);
    expect(screen.getByText('820.0')).toBeVisible();
    expect(screen.getByText('9.980')).toBeVisible();
    expect(screen.getByText('12.40')).toBeVisible();
    expect(screen.getByText('Unavailable')).toBeVisible();
    expect(screen.getAllByText('Data pipeline output')).toHaveLength(4);
  });
});
