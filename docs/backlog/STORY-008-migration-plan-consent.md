# STORY-008: Migration: plan, plan_day and consent tables

- **Status:** Ready ((d) sign-in before first use confirmed 2026-10-07, OI-016)
- **Phase / workstream / obligations:** P1 · W4 (plan storage, used from P4), W1 · R2 (consent record shape), R3
- **Labels:** data, migration, needs-sev
- **Needs Sev approval label (sev-approved):** this PR touches `supabase/migrations/`, which `.github/workflows/merge-gate.yml` guards; `merge-gate` blocks until Sev applies `sev-approved` himself.
- **Owner (build):** architect authors `supabase/migrations/*`; qa-engineer authors the pgTAP tests in `supabase/tests/*`. backend-dev: no part (no Edge Function or policy work here).
- **Branch:** story/STORY-008-migration-plan-consent

## User story
As Sev, I want plan, plan-day and consent tables to exist from the start, so that later phases (Claude plan drafts in P4, health consent in P4) add features, not retrofits.

## Scope (one PR, target < 150 lines SQL)
Migration creating `plan` (status draft|approved, `approved_at`, source), `plan_day` (`day_index`, label, `prescription` jsonb), `consent` (type, `policy_version`, granted_at, withdrawn_at; no `deleted_at`), per ADR-0002 D11. Adds the composite deferrable FK from `session.plan_day_id` (column created in STORY-007) to `plan_day`. RLS enabled, no policies (STORY-009). No UI, no plan features, no `body_scan` table (deferred to P4, ADR-0002 D12). This only creates storage already named in the dev-plan data model.

## Acceptance criteria
1. Given a fresh stack, when `supabase db reset` runs, then the migration applies and columns match ADR-0002.
2. Given the three tables, when `relrowsecurity` is queried, then it is true for each.
3. Given a `plan` insert with status other than `draft` or `approved`, when executed, then a CHECK constraint rejects it; default status is `draft`.
4. Given a `consent` row, when `withdrawn_at` is set earlier than `granted_at`, then a CHECK constraint rejects it.
5. Given `consent`, when two active (not withdrawn) rows of the same type exist for one user, then a partial unique index rejects the second.
6. Given `plan_day` referencing a plan owned by another user, when inserted and committed, then it fails with a foreign-key violation (composite deferrable FK, same rule as STORY-007).
7. Given `session.plan_day_id` (nullable column created by STORY-007, no FK yet), when this migration lands, then the composite FK to `plan_day` is added without data loss on existing rows (rows with null stay valid).
8. Empty state: with no rows, all three tables query as empty without error.
9. Error state: Given user deletion in `auth.users`, when executed, then plan, plan_day and consent rows cascade (R9 groundwork); tested.
10. Offline: IDs are client-assignable; `consent` can be recorded offline and synced later (P2).
11. No consent type values imply clinical use (R7); allowed `type` values are exactly `health_data`, `strava`, `ai_sharing` (ADR-0002 D11), and no health data is stored in this story.
12. Consent append-only (ADR-0002 D11): Given an existing `consent` row, when an update sets `withdrawn_at` once, then it succeeds; when it changes `type`, `policy_version`, `granted_at` or `user_id`, or changes `withdrawn_at` a second time, then the trigger rejects it. Given a regrant after withdrawal, then a new row is inserted and the old row is unchanged.
13. Given `plan_day`, when two live rows (`deleted_at is null`) in one plan have the same `day_index`, then a unique violation occurs; `day_index` below 1 is rejected by a CHECK; after tombstoning the first, the index can be reused.
14. Given a `plan` with status `approved` and null `approved_at`, when inserted or updated, then a CHECK rejects it; status `draft` with null `approved_at` is accepted.
15. Given `plan.source`, when a value other than `manual`, `claude_mcp`, `app_import` is inserted, then a CHECK rejects it; `plan_day.prescription` is NOT NULL.

## Technical notes (architect)
- ADR-0002 (approved 2026-10-07) decides consent types and the plan source enum (D11). No further ADR needed.
- Data/contract changes: tables above.

## Dependencies
- Depends on: STORY-004, STORY-005, STORY-007.

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
