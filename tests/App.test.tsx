import { render, screen } from '@testing-library/react';

describe('application routing', () => {
  it('redirects unknown locations to the configured root route', async () => {
    window.history.replaceState({}, '', '/not-a-platform-route');
    const { App } = await import('../src/app/App');

    render(<App />);

    expect(await screen.findByRole('heading', { name: /scientific workspace foundation is operational/i })).toBeVisible();
    expect(window.location.pathname).toBe('/');
  });
});

