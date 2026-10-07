# STORY-019: Quick Log pre-fill from the last session

- **Status:** Ready (depends on the local schema; no ADR of its own)
- **Phase / workstream / obligations:** P1 · W1 · R3
- **Labels:** data
- **Owner (build):** mobile-dev
- **Branch:** story/STORY-019-quicklog-prefill-query

## User story
As Sev, I want Quick Log to start each exercise with the sets from my last session of it, so that I only adjust what changed.

## Scope (one PR, target < 200 lines excluding tests)
A data function `getLastSessionSets(exerciseId, variantId?, gymId?)` over the local DB (STORY-013) returning the most recent session's sets for that exercise (ordered), and a `prefillFor(...)` that selects the working set values for the stepper. No UI (STORY-021).

## Acceptance criteria
1. Given an exercise with sessions on three dates, when the function runs, then it returns the sets of the most recent date, in set order.
2. Given a variant is selected, when the function runs, then it prefers the last session with that same variant; if none, it falls back to the last session of the exercise (any variant) and marks `fallback: true`. (Fallback rule to be confirmed against the current Quick Log behaviour.)
3. Given a gym is selected, when the function runs, then it prefers the same gym, falling back to any gym (`fallback: true`). Default: same gym first; ux-designer checks this against the Quick Log baseline artifact, and any difference goes to the lead as an open item via `/raise-question` (not decided here).
4. Given an exercise with no history, when it runs, then it returns an empty list and `prefillFor` returns `{ weightKg: null, reps: null }` (the stepper shows placeholders).
5. Ordering of "most recent session": by `session_date` descending, then `started_at` descending, then session id descending as a deterministic but arbitrary final tie-break. Given two sessions on the same date (e.g. morning and evening), then the later `started_at` wins. Given an imported session (starts 00:00 Adelaide, ADR-0002 D7) and a Quick Log session on the same date, then the Quick Log session wins (later `started_at`). Given two imported sessions on the same date at different gyms (both 00:00), then the same-gym preference of AC3 applies first; if no gym is selected, the id tie-break applies and the result is identical on every run (test).
6. Given soft-deleted sets or sessions (`deleted_at` set), when it runs, then they are ignored.
7. Given 811 historical rows (fixture of equivalent size, synthetic), when it runs, then it returns in under 50 ms on the test device profile (benchmark in unit test with a generous bound, informational).
8. Given another user's rows in the local DB (after sign-out/sign-in as different user), when it runs, then they are never returned (user scoping test).
9. Offline: purely local; a test asserts no network calls.
10. Error: DB not open or query error throws a typed error that the UI maps to a retry state (STORY-021).

## Technical notes (architect)
- Needs ADR: no
- Data/contract changes: none.

## Dependencies
- Depends on: STORY-013.

## Design (ux-designer)
- Spec: docs/design/STORY-019.md

## Test evidence (qa-engineer)
| Criterion | Test | Result |
|---|---|---|

## Review and compliance
- Code review: VERDICT …
- Compliance: COMPLIANCE … (if labelled)

## Done
- PR: #…  · Merged: …  · Accepted by product-owner: …
