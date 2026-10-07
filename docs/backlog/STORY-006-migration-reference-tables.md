# STORY-006: Migration: exercise, variant, gym tables

- **Status:** Ready (ADR-0002 approved 2026-10-07)
- **Phase / workstream / obligations:** P1 · W1 · R3 (structured, exportable data)
- **Labels:** data, migration
- **Owner (build):** backend-dev (migration file authored by architect: `supabase/migrations/` is architect-owned)
- **Branch:** story/STORY-006-migration-reference-tables

## User story
As Sev, I want the exercise, variant and gym tables in Postgres, each row owned by a user, so that my 46 exercises and their variants and gyms have a home.

## Scope (one PR, target < 150 lines SQL)
One new append-only migration creating `exercise` (name, muscle group, equipment increment kg), `variant`, `gym`, per ADR-0002. Each table: UUID primary key, `user_id uuid not null references auth.users`, timestamps, `deleted_at`. `alter table ... enable row level security` on each table with NO policies in this PR (deny by default). Policies and tests: STORY-009. Migration PRs need `sev-approved` (guardrail).

## Acceptance criteria
1. Given a fresh local stack, when `supabase db reset` runs, then it applies the migration with no error and `\d exercise`, `\d variant`, `\d gym` match ADR-0002 column names, types and nullability.
2. Given each of the three tables, when `select relrowsecurity from pg_class` is queried, then it is true for all three (checked by a pgTAP test added here as `supabase/tests/` smoke, extended in STORY-009).
3. Given a row insert without `user_id`, when executed, then it fails with a NOT NULL violation.
4. Given a duplicate (`user_id`, lower(name)) exercise insert, when executed, then it fails with a unique violation (no case-variant duplicates per user) unless ADR-0002 rules otherwise.
5. Given a user deletion in `auth.users`, when executed, then the user's rows are removed (cascade) so account deletion (P5, R9) is possible; behaviour confirmed by a test.
6. Empty state: Given no rows, when queried as the table owner, then zero rows return and no error.
7. Error state: Given a negative equipment increment, when inserted, then a CHECK constraint rejects it.
8. Offline: not applicable to the server; IDs are client-assignable (no sequence defaults required).
9. Migration is append-only: no edit to any earlier migration; filename timestamp is later than all existing files.
10. No seed data containing real names (repo is PUBLIC).

## Technical notes (architect)
- Needs ADR: yes, ADR-0002 (STORY-005): key type, delete semantics, variant hierarchy.
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
