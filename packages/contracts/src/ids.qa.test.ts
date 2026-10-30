import { normaliseSourceRowId as n, normaliseText as t, v5Names } from './ids';
import { U1 } from './fixtures';

const show = (s: string) => JSON.stringify(n(s));
describe('QA STORY-032 probes', () => {
  it('regression: exercise/variant/gym lowercase', () => {
    expect(v5Names.exercise(U1, '  Bench   PRESS ')).toBe(`exercise|${U1}|bench press`);
    expect(v5Names.variant(U1, 'Éclair\t\nX')).toBe(`variant|${U1}|éclair x`);
    expect(v5Names.gym(U1, 'ANYTIME')).toBe(`gym|${U1}|anytime`);
    expect(t('İ')).toBe('i̇');
  });
  it('source_row_id rules', () => {
    expect(n('AbC')).toBe('AbC');
    expect(n('é')).toBe('é'); // NFD -> NFC
    expect(n('é')).toBe(n('é'));
    expect(n('  a \t\n b 　c  ')).toBe('a b c');
    expect(n('a​b')).toBe('a​b'); // ZWSP kept (not \s)
    expect(n('a​b')).not.toBe(n('ab'));
    expect(n('\ufeffab')).toBe('ab'); // leading BOM stripped by String.trim (observed)
  });
  it('empty / long', () => {
    expect(n('   ')).toBe('');
    console.log('EMPTY', show('   \t\n'), v5Names.importEntry(U1, 'notion_csv', '   '));
    expect(() => v5Names.importEntry(U1, 'notion_csv', '')).not.toThrow();
    const long = 'x'.repeat(1_000_000);
    expect(v5Names.importEntry(U1, 'notion_csv', long).length).toBeGreaterThan(1e6);
    console.log('lone surrogate', JSON.stringify(n('\ud800a')));
    console.log('PIPE', v5Names.importEntry(U1, 'notion_csv', 'a|b'));
  });
});
