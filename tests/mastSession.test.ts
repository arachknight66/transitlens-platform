import { clearMastToken, getMastToken, setMastToken } from '../src/utils/mastSession';

describe('MAST session credentials', () => {
  afterEach(clearMastToken);

  it('keeps the token in session storage and removes blank values', () => {
    setMastToken('  session-secret  ');
    expect(getMastToken()).toBe('session-secret');

    setMastToken('   ');
    expect(getMastToken()).toBeNull();
  });
});
