import { render, screen } from '@testing-library/react';

import { PredictionCard } from '../src/components/PredictionCard';

describe('PredictionCard', () => {
  it('displays the exact ML Core prediction fields accessibly', () => {
    render(<PredictionCard prediction={{
      prediction_id: 'p1', analysis_id: 'a1', probability: 0.914, confidence: 0.828,
      predicted_class: 1, model_version: '2.1.0', inference_time: 12.345, created_at: '2026-07-01T10:00:00Z',
    }} />);

    expect(screen.getByText('Transit candidate detected')).toBeVisible();
    expect(screen.getByRole('meter', { name: 'Transit probability' })).toHaveAttribute('aria-valuenow', '91.4');
    expect(screen.getByRole('meter', { name: 'Decision confidence' })).toHaveAttribute('aria-valuenow', '82.8');
    expect(screen.getByText('2.1.0')).toBeVisible();
    expect(screen.getByText('12.35 ms')).toBeVisible();
  });
});

