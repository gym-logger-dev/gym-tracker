# STORY-007: Migration: session and set tables (with import provenance)

- **Status:** Ready ((d) sign-in before first use confirmed 2026-10-07, OI-016); sequence after STORY-006
- **Phase / workstream / obligations:** P1 · W1 · R3
- **Labels:** data, migration, needs-sev
- **Needs Sev approval label (sev-approved):** this PR touches `supabase/migrations/`, which `.github/workflows/merge-gate.yml` guards; `merge-gate` blocks until Sev applies `sev-approved` himself.
- **Owner (build):** architect authors `supabase/migrations/*`; qa-engineer authors the pgTAP tests in `supabase/tests/*`. backend-dev: no part (no Edge Function or policy work here).
- **Branch:** story/STORY-007-migration-session-set

## User story
As Sev, I want sessions and per-set rows (and a record of where each imported set came from), so that 811 text entries become structured sets without losing their source line.

## Scope (one PR, target < 200 lines SQL)
Migration creating `session` (start, end, gym, plan day nullable, Strava activity id nullable, `source`) and `set` (session, exercise, variant nullable, order, weight kg, reps, RPE nullable, completed at nullable), plus the server-only `import_entry` table per ADR-0002 D9 (source system, source row id, raw date, raw `Sets` text, raw fields, parsed set count, import batch id, `needs_review`, `review_reasons`, `reviewed_at`; no `deleted_at`). Per ADR-0002 D6, every parent table has `unique (user_id, id)` and every child foreign key (set to session, exercise, variant; session to gym; import_entry to session and exercise) is composite `(user_id, parent_id)`, `deferrable initially deferred`; nullable parents skip the check when null. The weight column is `weight_kg numeric(6,3)` and the order column is `set_order` (ADR-0002 D3). RLS enabled, no policies (STORY-009). `session.plan_day_id` (nullable uuid) is created in THIS story (ADR-0002 D5) without a foreign key; STORY-008 adds the composite FK to `plan_day` (its AC7).

## Acceptance criteria
1. Given a fresh stack, when `supabase db reset` runs, then the migration applies and columns/types match ADR-0002.
2. Given `session`, `set`, and the provenance table, when `relrowsecurity` is queried, then it is true for each.
3. Given a `set` insert referencing an exercise, variant or session owned by a different `user_id` (and likewise a `session` referencing another user's gym, or an `import_entry` referencing another user's session or exercise), when executed and the transaction commits, then it fails with a foreign-key violation from the composite `(user_id, id)` key. Given an insert of a child before its parent inside one transaction with both rows owned by the same user, then commit succeeds (deferrable initially deferred). A catalog query shows every FK to a user-owned table is composite and deferrable.
4. Given a `set` with negative weight, reps below 0, or RPE outside 0-10, when inserted, then CHECK constraints reject it.
5. Given two live sets (`deleted_at is null`) in one session with the same (`session_id`, `exercise_id`, `set_order`), when inserted, then a unique violation occurs; given the first is tombstoned, the same position can be inserted again (partial unique index).
6. Given hard deletion of a session, when executed, then its sets cascade and an orphan-set query returns zero rows. Given deletion of an exercise, variant or gym still referenced by a set or session, then it is rejected (`no action`); given deletion of the owning `auth.users` row, then everything cascades and succeeds.
7. Given an imported entry's `import_entry` row, when its raw `Sets` text is read back, then it equals the original byte for byte (column type is `text`, no trimming trigger). Given an update to `source_system`, `source_row_id`, `raw_date`, `raw_sets`, `raw_fields` or `parsed_set_count`, then the immutability trigger rejects it; an update to `reviewed_at` alone succeeds.
8. Empty/error: Given a session with zero sets, when queried, then it is valid and returns zero set rows (a started-but-empty session is allowed).
9. Offline: IDs and `order` are client-assigned; no server-side defaults needed for creating rows offline.
10. No health values or source text are written to logs by triggers (Logging control).
11. Append-only: no edit to earlier migrations. No real data in the migration or tests.

## Technical notes (architect)
- ADR-0002 (approved 2026-10-07) decides synthetic sessions (D7), provenance table (D9), tombstones vs cascade (D2) and composite deferrable FKs (D6). No further ADR needed.
- Data/contract changes: tables above.

## Dependencies
- Depends on: STORY-004, STORY-005, STORY-006.

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
