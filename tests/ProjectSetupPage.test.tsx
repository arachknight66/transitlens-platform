import { render, screen } from '@testing-library/react';

import ProjectSetupPage from '../src/pages/ProjectSetupPage';

describe('ProjectSetupPage', () => {
  it('reports the configured platform foundation', () => {
    render(<ProjectSetupPage />);

    expect(screen.getByRole('heading', { name: /scientific workspace foundation is operational/i })).toBeVisible();
    expect(screen.getByText('API orchestration client')).toBeVisible();
  });
});

