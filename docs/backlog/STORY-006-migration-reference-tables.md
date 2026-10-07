# STORY-006: Migration: exercise, variant, gym tables

- **Status:** Ready ((d) sign-in before first use confirmed 2026-10-07, OI-016)
- **Phase / workstream / obligations:** P1 · W1 · R3 (structured, exportable data)
- **Labels:** data, migration, needs-sev
- **Needs Sev approval label (sev-approved):** this PR touches `supabase/migrations/`, which `.github/workflows/merge-gate.yml` guards; `merge-gate` blocks until Sev applies `sev-approved` himself.
- **Owner (build):** architect authors `supabase/migrations/*`; qa-engineer authors the pgTAP tests in `supabase/tests/*`. backend-dev: no part (no Edge Function or policy work here).
- **Branch:** story/STORY-006-migration-reference-tables

## User story
As Sev, I want the exercise, variant and gym tables in Postgres, each row owned by a user, so that my 46 exercises and their variants and gyms have a home.

## Scope (one PR, target < 150 lines SQL)
One new append-only migration creating `exercise` (name, muscle group, equipment increment kg), `variant`, `gym`, per ADR-0002 D2 to D4 and D6. Each table: UUID primary key, `user_id uuid not null references auth.users on delete cascade`, `created_at`, `updated_at`, `deleted_at`, `unique (user_id, id)`, a server trigger that sets `updated_at`, a partial unique index on `(user_id, lower(name))` over live rows. `alter table ... enable row level security` on each table with NO policies in this PR (deny by default). Policies and deny tests: STORY-009.

## Acceptance criteria
1. Given a fresh local stack, when `supabase db reset` runs, then it applies the migration with no error and `\d exercise`, `\d variant`, `\d gym` match ADR-0002 column names, types and nullability.
2. Given each of the three tables, when `select relrowsecurity from pg_class` is queried, then it is true for all three (checked by a pgTAP test added here as `supabase/tests/` smoke, extended in STORY-009).
3. Given a row insert without `user_id`, when executed, then it fails with a NOT NULL violation.
4. Given a duplicate (`user_id`, lower(name)) insert in `exercise`, `variant` or `gym` among live rows, when executed, then it fails with a unique violation (no case-variant duplicates per user). Given the first row is tombstoned (`deleted_at` set), then the same name can be inserted again (partial unique index over `deleted_at is null`). Given two different users, then the same name is allowed.
5. Given a user deletion in `auth.users`, when executed, then the user's rows are removed (cascade) so account deletion (P5, R9) is possible; behaviour confirmed by a test.
6. Empty state: Given no rows, when queried as the table owner, then zero rows return and no error.
7. Error state: Given a negative or zero equipment increment, when inserted, then a CHECK constraint rejects it (`> 0`, ADR-0002 D3); given a name that is empty after trimming or longer than 100 characters, then a CHECK rejects it.
8. Offline: not applicable to the server; IDs are client-assignable (no sequence defaults required).
9. Migration is append-only: no edit to any earlier migration; filename timestamp is later than all existing files.
10. No seed data containing real names (repo is PUBLIC).
11. Given each table, when the catalog is queried, then a `unique (user_id, id)` constraint exists on it (parent key for composite foreign keys, ADR-0002 D6) and an index leads with `user_id`.
12. Given an insert or update with a client-supplied `updated_at` in the past, when executed, then the stored `updated_at` is the server time (trigger overwrites it, ADR-0002 D2); `created_at` supplied by the client is kept.

## Technical notes (architect)
- ADR-0002 (approved 2026-10-07) decides key type, delete semantics and variant as a global per-user tag. No further ADR needed.
- Data/contract changes: new tables above; `packages/contracts` types must match (STORY-005).

## Dependencies
- Depends on: STORY-004, STORY-005.

## Design (ux-designer)
- Spec: docs/design/STORY-006.md

## Test evidence (qa-engineer)
| Criterion | Test | Result |
|---|---|---|

## Review and compliance
- Code review: VERDICT …
- Compliance: COMPLIANCE … (if labelled)

## Done
- PR: #…  · Merged: …  · Accepted by product-owner: …
