# STORY-007: Migration: session and set tables (with import provenance)

- **Status:** Draft (blocked until STORY-005 / ADR-0002 merged)
- **Phase / workstream / obligations:** P1 · W1 · R3
- **Labels:** data, migration
- **Owner (build):** backend-dev (migration authored by architect)
- **Branch:** story/STORY-007-migration-session-set

## User story
As Sev, I want sessions and per-set rows (and a record of where each imported set came from), so that 811 text entries become structured sets without losing their source line.

## Scope (one PR, target < 200 lines SQL)
Migration creating `session` (start, end, gym, plan day nullable, Strava activity id nullable, `source`) and `set` (session, exercise, variant nullable, order, weight kg, reps, RPE nullable, completed at nullable), plus the provenance structure chosen in ADR-0002 (e.g. `import_entry` holding Notion row id, raw date, raw `Sets` text, import batch id). RLS enabled, no policies (STORY-009). `plan_day` FK is deferred to STORY-008 (nullable column added there if needed).

## Acceptance criteria
1. Given a fresh stack, when `supabase db reset` runs, then the migration applies and columns/types match ADR-0002.
2. Given `session`, `set`, and the provenance table, when `relrowsecurity` is queried, then it is true for each.
3. Given a `set` insert referencing an exercise or session owned by a different `user_id`, when executed, then it fails (composite FK or trigger per ADR-0002) so cross-user references are impossible.
4. Given a `set` with negative weight, reps below 0, or RPE outside 0-10, when inserted, then CHECK constraints reject it.
5. Given two sets in one session with the same (`session`, `exercise`, order), when inserted, then a unique violation occurs.
6. Given deletion of a session, when executed, then its sets cascade (or are tombstoned, per ADR) and an orphan-set query returns zero rows.
7. Given an imported entry's provenance row, when its raw `Sets` text is read back, then it equals the original byte for byte (column type is `text`, no trimming trigger).
8. Empty/error: Given a session with zero sets, when queried, then it is valid and returns zero set rows (a started-but-empty session is allowed).
9. Offline: IDs and `order` are client-assigned; no server-side defaults needed for creating rows offline.
10. No health values or source text are written to logs by triggers (Logging control).
11. Append-only: no edit to earlier migrations. No real data in the migration or tests.

## Technical notes (architect)
- Needs ADR: yes, ADR-0002 (synthetic sessions for history, provenance location, tombstone vs cascade).
- Data/contract changes: tables above.

## Dependencies
- Depends on: STORY-006.

## Design (ux-designer)
- Spec: docs/design/STORY-007.md

## Test evidence (qa-engineer)
| Criterion | Test | Result |
|---|---|---|

## Review and compliance
- Code review: VERDICT …
- Compliance: COMPLIANCE … (if labelled)

## Done
- PR: #…  · Merged: …  · Accepted by product-owner: …
