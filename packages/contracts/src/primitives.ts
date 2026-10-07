import { z } from 'zod';
import { ADELAIDE_TZ } from './constants';

/** Lowercase hyphenated UUID (any RFC version: v7 for user rows, v5 for imports). */
export const Uuid = z.uuid().refine((s) => s === s.toLowerCase(), 'uuid must be lowercase');
/** ISO 8601 UTC, millisecond precision, `Z` suffix (ADR-0002 D3). */
export const Timestamp = z.iso.datetime({ precision: 3 });
/** `YYYY-MM-DD` calendar date. */
export const DateText = z.iso.date();

/** True when `v` has at most `n` decimal places (on the shortest decimal form of the number). */
export const hasMaxDecimals = (v: number, n: number): boolean => Number(v.toFixed(n)) === v;

/** Text names: 1 to 100 characters after trimming (ADR-0002 D3). */
export const Name = z.string().trim().min(1).max(100);
/** `numeric(6,3)` kg, 0 to 999.999 (D3). 0 is a real value; null means bodyweight or unknown. */
export const WeightKg = z
  .number()
  .min(0)
  .max(999.999)
  .refine((v) => hasMaxDecimals(v, 3), 'at most 3 decimals');
/** `numeric(5,3)` kg, > 0 (D3). */
export const IncrementKg = z
  .number()
  .gt(0)
  .max(99.999)
  .refine((v) => hasMaxDecimals(v, 3), 'at most 3 decimals');
export const Reps = z.number().int().min(0).max(1000);
export const Rpe = z
  .number()
  .min(0)
  .max(10)
  .refine((v) => hasMaxDecimals(v, 1), 'at most 1 decimal');

/** Nullable column: may be omitted or null on input, always present (null) on output. */
export const nullableCol = <T extends z.ZodType>(s: T) => s.nullable().default(null);

const adelaideParts = new Intl.DateTimeFormat('en-CA', {
  timeZone: ADELAIDE_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** True when `v` is a valid `Timestamp` (use to guard refines: zod can run them after a field failed). */
export const isTimestamp = (v: unknown): v is string => Timestamp.safeParse(v).success;

/**
 * The Australia/Adelaide calendar day (`YYYY-MM-DD`) of an instant. Pure; independent of device timezone.
 * Throws `RangeError` on an invalid timestamp (programmer error): validate untrusted input with
 * `Timestamp` / `isTimestamp` first. The schemas do so; `v5Names` does not call this function.
 */
export function adelaideDate(iso: string): string {
  const parts = adelaideParts.formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}
