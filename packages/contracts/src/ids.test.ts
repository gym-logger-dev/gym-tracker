import { IMPORT_REASON_CODES, UUID_V5_NAMESPACE, normaliseText, v5Names } from './index';
import { ID, U1, U2 } from './fixtures';

describe('constants (AC3, AC4)', () => {
  it('holds the frozen ADR-0002 D1 namespace', () => {
    expect(UUID_V5_NAMESPACE).toBe('20448473-4ce0-4b10-a84a-4ab62677ea3a');
  });

  it('holds exactly the seven import reason codes', () => {
    expect([...IMPORT_REASON_CODES]).toEqual([
      'missing_date',
      'missing_exercise',
      'unknown_exercise',
      'empty_sets',
      'unparsed_token',
      'no_weight',
      'duplicate_source_row',
    ]);
  });
});

describe('v5 name building (AC3)', () => {
  it('normalises free text: NFC, trim, collapse whitespace, lowercase', () => {
    expect(normaliseText('  Example\t  BENCH \n Press ')).toBe('example bench press');
    // "e" + combining acute (NFD) equals precomposed e-acute (NFC).
    expect(normaliseText('Café')).toBe(normaliseText('Café'));
    expect(normaliseText('Café')).toBe('café');
  });

  it('is deterministic and varies with user_id', () => {
    const a = v5Names.exercise(U1, 'Example Bench Press');
    expect(v5Names.exercise(U1, '  example   bench press ')).toBe(a);
    expect(a).toBe(`exercise|${U1}|example bench press`);
    expect(v5Names.exercise(U2, 'Example Bench Press')).not.toBe(a);
    expect(v5Names.variant(U1, 'Paused')).toBe(`variant|${U1}|paused`);
    expect(v5Names.gym(U1, 'Example Gym A')).toBe(`gym|${U1}|example gym a`);
  });

  it('uses a lowercase hyphenated user id and rejects anything else', () => {
    expect(() => v5Names.gym(U1.toUpperCase(), 'x')).toThrow();
    expect(() => v5Names.gym('not-a-uuid', 'x')).toThrow();
  });

  it('builds import_entry, session and set names per D1', () => {
    expect(v5Names.importEntry(U1, 'notion_csv', 'fake-row-0001')).toBe(
      `import_entry|${U1}|notion_csv|fake-row-0001`,
    );
    expect(v5Names.session(U1, 'notion_import', '2026-10-04', ID(1))).toBe(
      `session|${U1}|notion_import|2026-10-04|${ID(1)}`,
    );
    expect(v5Names.set(U1, ID(50), 3)).toBe(`set|${U1}|${ID(50)}|3`);
  });

  it('writes an absent gym as the literal none (null and undefined alike)', () => {
    const expected = `session|${U1}|quick_log|2026-10-04|none`;
    expect(v5Names.session(U1, 'quick_log', '2026-10-04')).toBe(expected);
    expect(v5Names.session(U1, 'quick_log', '2026-10-04', null)).toBe(expected);
  });

  it('rejects malformed dates and set positions below 1', () => {
    expect(() => v5Names.session(U1, 'app', '4 Oct 2026')).toThrow();
    expect(() => v5Names.set(U1, ID(50), 0)).toThrow();
  });
});
