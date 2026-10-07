# STORY-009: RLS policies and pgTAP deny-by-default suite

- **Status:** Ready (sequence after STORY-006 to STORY-008; no ADR needed, rule is fixed by the dev-plan: `user_id = auth.uid()`)
- **Phase / workstream / obligations:** P1 · W1 · R6 (no sharing beyond the owner), R2 (consent rows protected), R5 (breach risk K5)
- **Labels:** data, auth, migration
- **Owner (build):** backend-dev (policy migration authored by architect; pgTAP tests owned by qa-engineer in `supabase/tests/`)
- **Branch:** story/STORY-009-rls-policies-pgtap-deny

## User story
As Sev, I want every table locked to its owner with tests that prove strangers and anonymous users get nothing, so that a misconfigured policy cannot expose my training data.

## Scope (one PR, target < 150 lines SQL; tests excluded from the budget)
One migration adding, per table (exercise, variant, gym, session, set, import_entry, plan, plan_day, consent): policies `to authenticated` using `user_id = (select auth.uid())`, `with check` on insert/update. Four policies (select, insert, update, delete) per table, with two exceptions per ADR-0002 D13: `consent` has three (select, insert, update; no delete) and `import_entry` has one (select only; written by a privileged local role). `anon` has no grants and no policy. Plus pgTAP suite.

## Acceptance criteria
1. Given users A and B each with rows in every table, when A queries any table, then A sees only A's rows (row counts asserted per table).
2. Given an unauthenticated (`anon`) role, when it selects, inserts, updates or deletes on any table, then it gets zero rows or a permission/RLS error (asserted per table and per verb).
3. Given user A, when A inserts a row with `user_id` = B, then it fails (`with check`); when A updates a row's `user_id` to B, it fails.
4. Given user A, when A updates or deletes B's row by id, then zero rows are affected.
4a. Given the ADR-0002 D13 exceptions, when `pg_policies` is inspected, then `consent` has exactly select, insert and update policies for `authenticated` and `import_entry` has exactly one select policy; every other `public` table has exactly four. As user A: deleting a `consent` row affects zero rows; inserting, updating or deleting an `import_entry` row fails or affects zero rows. Per-verb tests for these two tables cover only the verbs that have policies, plus the deny checks above.
5. Given user A, when A inserts a `set` referencing B's session or exercise, then it fails (composite deferrable FK from STORY-007/008, checked at commit). A meta-test fails if any FK to a user-owned table is not composite on `(user_id, id)` (ADR-0002 D6).
6. Given a meta-test, when it runs, then it fails if any table in schema `public` has `relrowsecurity = false` or has no policies for `authenticated` (this catches future tables added without RLS; it must be part of `supabase test db`).
7. Given the policies, when `pg_policies` is inspected, then no policy uses `using (true)`, no policy is granted to `public` or `anon`, and the service role is not referenced in policies.
8. Given `supabase test db`, when run locally and in CI, then all tests pass; with one policy deliberately removed (shown once in the PR, not committed) the suite fails.
9. Empty state: a new user with no rows sees empty results (not errors) on every table.
10. Error state: test output names the table and verb that failed.
11. Offline: not applicable server-side. Note for later: sync (P2) relies on these policies, so P2 does not need to weaken them.
12. No real user data in tests; users are created in-test with synthetic ids.

## Technical notes (architect)
- Needs ADR: no (follows the dev-plan Security controls: RLS on every table). Policy form `(select auth.uid())` is a performance idiom, not a decision.
- Data/contract changes: policy migration only.

## Dependencies
- Depends on: STORY-006, STORY-007, STORY-008.

## Design (ux-designer)
- Spec: docs/design/STORY-009.md

## Test evidence (qa-engineer)
| Criterion | Test | Result |
|---|---|---|

## Review and compliance
- Code review: VERDICT …
- Compliance: COMPLIANCE … (if labelled)

## Done
- PR: #…  · Merged: …  · Accepted by product-owner: …
