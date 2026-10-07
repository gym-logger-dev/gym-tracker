import { z } from 'zod';
import { type ImportSourceSystem, type SessionSource } from './constants';
import { DateText, Uuid } from './primitives';

// UUIDv5 name building (ADR-0002 D1). Pure string functions: generating the UUID itself needs a
// library, which is decided in ADR-0003. The importer ADR is ADR-0004.

/** Free text in a name: Unicode NFC, trimmed, internal whitespace collapsed, lowercased (locale independent). */
export function normaliseText(s: string): string {
  return s.normalize('NFC').trim().replace(/\s+/g, ' ').toLowerCase();
}

const userId = (v: string) => Uuid.parse(v);
const date = (v: string) => DateText.parse(v);
const gymOrNone = (gymId: string | null | undefined) =>
  gymId == null ? 'none' : Uuid.parse(gymId);

/** `kind|user_id|natural key` strings; hash them with the namespace to get the id. */
export const v5Names = {
  exercise: (user: string, name: string) => `exercise|${userId(user)}|${normaliseText(name)}`,
  variant: (user: string, name: string) => `variant|${userId(user)}|${normaliseText(name)}`,
  gym: (user: string, name: string) => `gym|${userId(user)}|${normaliseText(name)}`,
  importEntry: (user: string, sourceSystem: ImportSourceSystem, sourceRowId: string) =>
    `import_entry|${userId(user)}|${sourceSystem}|${normaliseText(sourceRowId)}`,
  /** `source` is the session source (`notion_import`, `quick_log`), not `import_entry.source_system`. */
  session: (user: string, source: SessionSource, day: string, gymId?: string | null) =>
    `session|${userId(user)}|${source}|${date(day)}|${gymOrNone(gymId)}`,
  /** `k` is the 1-based position of the set within the entry's parsed Sets. */
  set: (user: string, importEntryId: string, k: number) =>
    `set|${userId(user)}|${Uuid.parse(importEntryId)}|${z.number().int().min(1).parse(k)}`,
};
