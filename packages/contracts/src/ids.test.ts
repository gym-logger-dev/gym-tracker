import {
  IMPORT_REASON_CODES,
  UUID_V5_NAMESPACE,
  normaliseSourceRowId,
  normaliseText,
  v5Names,
} from './index';
import { ID, U1, U2 } from './fixtures';

/** UTF-8 bytes of a string (test-only; no node or DOM typings are available in this project). */
function utf8(s: string): number[] {
  const out: number[] = [];
  for (const ch of s) {
    const c = ch.codePointAt(0)!;
    if (c < 0x80) out.push(c);
    else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
    else if (c < 0x10000) out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    else
      out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
  }
  return out;
}

/** Test-only SHA-1 (FIPS 180-4) over bytes, so id-level properties are checked without a library or a new dependency. */
function sha1(bytes: number[]): number[] {
  const rol = (x: number, n: number) => (x << n) | (x >>> (32 - n));
  const msg = [...bytes, 0x80];
  while (msg.length % 64 !== 56) msg.push(0);
  const bits = bytes.length * 8;
  msg.push(0, 0, 0, 0, (bits >>> 24) & 255, (bits >>> 16) & 255, (bits >>> 8) & 255, bits & 255);
  let [h0, h1, h2, h3, h4] = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];
  for (let i = 0; i < msg.length; i += 64) {
    const w: number[] = [];
    for (let t = 0; t < 16; t++) {
      w[t] =
        (msg[i + 4 * t]! << 24) |
        (msg[i + 4 * t + 1]! << 16) |
        (msg[i + 4 * t + 2]! << 8) |
        msg[i + 4 * t + 3]!;
    }
    for (let t = 16; t < 80; t++) w[t] = rol(w[t - 3]! ^ w[t - 8]! ^ w[t - 14]! ^ w[t - 16]!, 1);
    let [a, b, c, d, e] = [h0, h1, h2, h3, h4];
    for (let t = 0; t < 80; t++) {
      const [f, k] =
        t < 20
          ? [(b & c) | (~b & d), 0x5a827999]
          : t < 40
            ? [b ^ c ^ d, 0x6ed9eba1]
            : t < 60
              ? [(b & c) | (b & d) | (c & d), 0x8f1bbcdc]
              : [b ^ c ^ d, 0xca62c1d6];
      const tmp = (rol(a, 5) + f! + e + k! + w[t]!) | 0;
      [e, d, c, b, a] = [d, c, rol(b, 30), a, tmp];
    }
    [h0, h1, h2, h3, h4] = [(h0 + a) | 0, (h1 + b) | 0, (h2 + c) | 0, (h3 + d) | 0, (h4 + e) | 0];
  }
  return [h0, h1, h2, h3, h4].flatMap((h) => [
    (h >>> 24) & 255,
    (h >>> 16) & 255,
    (h >>> 8) & 255,
    h & 255,
  ]);
}

/** Test-only RFC 4122 UUIDv5 reference (ADR-0003 decides the real library). */
function uuidv5(name: string, namespace: string): string {
  const ns = namespace
    .replace(/-/g, '')
    .match(/../g)!
    .map((x) => parseInt(x, 16));
  const h = sha1([...ns, ...utf8(name)]).slice(0, 16);
  h[6] = (h[6]! & 0x0f) | 0x50;
  h[8] = (h[8]! & 0x3f) | 0x80;
  const x = h.map((n) => n.toString(16).padStart(2, '0')).join('');
  return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20)}`;
}

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

  it('keeps source_row_id case-sensitive in the import_entry name (OI-025 (b))', () => {
    expect(v5Names.importEntry(U1, 'notion_csv', 'AbC')).toBe(`import_entry|${U1}|notion_csv|AbC`);
    expect(v5Names.importEntry(U1, 'notion_csv', 'AbC')).not.toBe(
      v5Names.importEntry(U1, 'notion_csv', 'abc'),
    );
    // Free-text names for exercise, variant and gym still lowercase (D1 unchanged for them).
    expect(v5Names.exercise(U1, 'AbC')).toBe(v5Names.exercise(U1, 'abc'));
  });

  it('still applies NFC, trim and whitespace collapse to source_row_id (and nothing else)', () => {
    expect(normaliseSourceRowId('  Row\t  A\u0301b \n')).toBe('Row \u00c1b');
    expect(normaliseSourceRowId('NotionPageID-0A1b')).toBe('NotionPageID-0A1b');
    expect(v5Names.importEntry(U1, 'notion_csv', ' fake-row-0001 ')).toBe(
      v5Names.importEntry(U1, 'notion_csv', 'fake-row-0001'),
    );
  });
});

describe('v5 ids from names (OI-025 (b) golden vectors)', () => {
  const NS = UUID_V5_NAMESPACE;

  it('the test-only uuidv5 reference matches the RFC 4122 / Python vector', () => {
    expect(uuidv5('python.org', '6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(
      '886313e1-3b8a-5372-9b90-0c9aee199e5d',
    );
  });

  it('gives different import_entry ids for source_row_id AbC and abc', () => {
    const upper = uuidv5(v5Names.importEntry(U1, 'notion_csv', 'AbC'), NS);
    const lower = uuidv5(v5Names.importEntry(U1, 'notion_csv', 'abc'), NS);
    expect(upper).not.toBe(lower);
  });

  // Before OI-025 (b) the lowercase ids were already these values; only an upper or mixed-case row id
  // changes (the old id of 'AbC' equalled the id of 'abc', bbf97f86-...). No earlier UUID vectors existed
  // (the tests asserted name strings only), so nothing else needed regenerating.
  it('golden vectors (regenerated for OI-025 (b); synthetic user and rows)', () => {
    const id = (rowId: string) => uuidv5(v5Names.importEntry(U1, 'notion_csv', rowId), NS);
    expect(id('fake-row-0001')).toBe('3c6a427d-861a-59ab-8b16-afc4b97af5b3');
    expect(id('AbC')).toBe('44d2ca35-f435-5122-87d8-ad113fa7d9c0');
    expect(id('abc')).toBe('bbf97f86-9501-528d-94b1-322fb4a2de8b');
    expect(id('row-1')).toBe('2adec9f9-18ef-5fc8-99c5-8b8aa6d3d4b7');
  });
});
