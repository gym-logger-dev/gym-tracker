import { ADELAIDE_TZ, normaliseText } from '@gym-tracker/contracts';

import { useShellColors } from '@/ui/shellColors';

// ADR-0001 D4/D5: workspace packages and the @/* alias resolve under jest-expo.
describe('module resolution', () => {
  it('imports @gym-tracker/contracts', () => {
    expect(ADELAIDE_TZ).toBe('Australia/Adelaide');
    expect(normaliseText('  A  B ')).toBe('a b');
  });

  it('resolves the @/* alias', () => {
    expect(typeof useShellColors).toBe('function');
  });
});
