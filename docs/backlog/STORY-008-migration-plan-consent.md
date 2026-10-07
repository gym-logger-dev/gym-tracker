# STORY-008: Migration: plan, plan_day and consent tables

- **Status:** Ready (ADR-0002 approved 2026-10-07)
- **Phase / workstream / obligations:** P1 · W4 (plan storage, used from P4), W1 · R2 (consent record shape), R3
- **Labels:** data, migration
- **Owner (build):** backend-dev (migration authored by architect)
- **Branch:** story/STORY-008-migration-plan-consent

## User story
As Sev, I want plan, plan-day and consent tables to exist from the start, so that later phases (Claude plan drafts in P4, health consent in P4) add features, not retrofits.

## Scope (one PR, target < 150 lines SQL)
Migration creating `plan` (status draft|approved, source), `plan_day`, `consent` (type, granted_at, withdrawn_at). RLS enabled, no policies (STORY-009). No UI, no plan features, no body_scan table (deferred to P4 unless ADR-0002 says otherwise). This only creates storage already named in the dev-plan data model.

## Acceptance criteria
1. Given a fresh stack, when `supabase db reset` runs, then the migration applies and columns match ADR-0002.
2. Given the three tables, when `relrowsecurity` is queried, then it is true for each.
3. Given a `plan` insert with status other than `draft` or `approved`, when executed, then a CHECK constraint rejects it; default status is `draft`.
4. Given a `consent` row, when `withdrawn_at` is set earlier than `granted_at`, then a CHECK constraint rejects it.
5. Given `consent`, when two active (not withdrawn) rows of the same type exist for one user, then a partial unique index rejects the second.
6. Given `plan_day` referencing a plan owned by another user, when inserted, then it fails (same cross-user rule as STORY-007).
7. Given `session.plan_day` (nullable FK from STORY-007), when this migration lands, then the FK constraint is added without data loss on existing rows.
8. Empty state: with no rows, all three tables query as empty without error.
9. Error state: Given user deletion in `auth.users`, when executed, then plan, plan_day and consent rows cascade (R9 groundwork); tested.
10. Offline: IDs are client-assignable; `consent` can be recorded offline and synced later (P2).
11. No consent type values imply clinical use (R7); allowed `type` values are those in ADR-0002 (e.g. `health_data`, `strava`, `ai_sharing`), and no health data is stored in this story.

## Technical notes (architect)
- Needs ADR: yes, ADR-0002 (consent types; plan source enum).
- Data/contract changes: tables above.

## Dependencies
- Depends on: STORY-007.

## Design (ux-designer)
- Spec: docs/design/STORY-008.md

## Test evidence (qa-engineer)
| Criterion | Test | Result |
|---|---|---|

## Review and compliance
- Code review: VERDICT …
- Compliance: COMPLIANCE … (if labelled)

## Done
- PR: #…  · Merged: …  · Accepted by product-owner: …
