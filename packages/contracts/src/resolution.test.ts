// AC7: consumers import by package name, never by relative path.
import { SetSchema, UUID_V5_NAMESPACE, type WorkoutSet } from '@gym-tracker/contracts';
import { set } from './fixtures';

describe('package resolution (AC7)', () => {
  it('resolves @gym-tracker/contracts under Jest and exports usable schemas', () => {
    const parsed: WorkoutSet = SetSchema.parse(set);
    expect(parsed.reps).toBe(10);
    expect(UUID_V5_NAMESPACE).toHaveLength(36);
  });
});
