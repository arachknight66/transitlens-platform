import { render, screen } from '@testing-library/react';

import AboutPage from '../src/pages/AboutPage';

it('documents architecture, ownership, limitations, and disclaimer', () => {
  render(<AboutPage />);
  expect(screen.getByRole('heading', { name: 'About TransitLens' })).toBeVisible();
  expect(screen.getByText('transitlens-data-pipeline')).toBeVisible();
  expect(screen.getByRole('heading', { name: 'Scientific disclaimer' })).toBeVisible();
});
