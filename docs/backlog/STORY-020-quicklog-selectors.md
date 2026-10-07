# STORY-020: Quick Log exercise, variant and gym selection

- **Status:** Ready (depends on the local schema; no ADR of its own)
- **Phase / workstream / obligations:** P1 · W1 · R7
- **Labels:** ui, data
- **Owner (build):** mobile-dev
- **Branch:** story/STORY-020-quicklog-selectors

## User story
As Sev, I want to pick an exercise, its variant and my gym quickly, so that I can start logging in a couple of taps.

## Scope (one PR, target < 300 lines excluding tests)
Searchable exercise list, variant chips (for the chosen exercise) and a gym chooser, reading from the local DB; gym defaults to the one used in the most recent session; "Add exercise / variant / gym" inline with a name field. No set logging (STORY-021).

## Acceptance criteria
1. Given 46 exercises in the local DB (synthetic fixture), when the list opens, then it shows all, most recently used first, and typing "ben" filters case-insensitively within 100 ms.
2. Given an exercise with variants, when it is selected, then its variants appear as chips, the last-used variant is preselected, and tapping another changes selection.
3. Given gyms in the DB, when the screen opens, then the gym of the most recent session is preselected; Sev can change it in one tap.
4. Given no exercises (fresh install), when the list opens, then an empty state "No exercises yet. Add your first one." with an Add button is shown.
5. Given "Add exercise" with a name that already exists (case-insensitive), when saved, then it is rejected with a message and the existing item is highlighted.
6. Given a blank or 80+ character name, when saved, then validation blocks it inline.
7. Given an exercise is selected, when the user navigates back and forth, then selection is retained in the session of the screen (no stale gym or variant after switching exercise).
8. Offline: the whole screen works with no network; new items are written locally with client-generated UUIDs.
9. Error: a DB read failure shows "Couldn't load your exercises. Try again." with a retry button; no crash.
10. Accessibility: list rows and chips have labels and 44 pt targets; selected state is not conveyed by colour alone.
11. R7: copy is neutral and en-AU; muscle-group labels are descriptive only (no health claims).

## Technical notes (architect)
- Needs ADR: no
- Data/contract changes: none (uses STORY-013 repositories).

## Dependencies
- Depends on: STORY-013, STORY-003.

## Design (ux-designer)
- Spec: docs/design/STORY-020.md

## Test evidence (qa-engineer)
| Criterion | Test | Result |
|---|---|---|

## Review and compliance
- Code review: VERDICT …
- Compliance: COMPLIANCE … (if labelled)

## Done
- PR: #…  · Merged: …  · Accepted by product-owner: …
