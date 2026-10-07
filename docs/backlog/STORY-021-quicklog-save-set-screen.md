# STORY-021: Quick Log screen: log a set (pre-filled, steppers, save locally)

- **Status:** Draft (blocked on ADR-0002 decision about the implicit session for Quick Log sets before P2 sessions exist)
- **Phase / workstream / obligations:** P1 · W1 · R7
- **Labels:** ui, data
- **Owner (build):** mobile-dev
- **Branch:** story/STORY-021-quicklog-save-set-screen

## User story
As Sev, I want the Quick Log screen to show last session's sets pre-filled, adjust them with steppers, and save a set in one tap, so that logging in the gym is as fast as it is today and works offline.

## Scope (one PR, target < 350 lines excluding tests)
Assemble STORY-018 (steppers), STORY-019 (pre-fill) and STORY-020 (selectors) into the Log tab: shows previous session's sets as reference, current set weight/reps with steppers, "Save set" appends a set row to the local DB, running list of today's sets for the exercise with delete of the last set (undo). Writes local only; no sync, outbox or Notion write (Notion stays the system of record until the P2 gate; sync arrives in P2). Rest timer, plans, RPE entry and session summary are P2 and out of scope.

## Acceptance criteria
1. Given an exercise with history, when selected, then the steppers are pre-filled with last session's first working set and the last session's sets are shown as reference with their date (`d MMM yyyy`, Australia/Adelaide).
2. Given pre-filled values adjusted with the steppers, when "Save set" is tapped, then one `set` row is written locally with the shown weight (kg) and reps, set order = previous set count + 1, a client-generated UUID, and today's date; the list of today's sets shows it immediately.
3. Given a just-saved set, when the next set is shown, then steppers keep the last saved values (carry-forward) so repeated sets need one tap.
4. Given Quick Log writes before P2 session UI exists, when the first set of the day for a gym is saved, then the implicit session rule from ADR-0002 applies (one session per day and gym, `source = 'quick_log'`), and a second set reuses it.
5. Offline: Given airplane mode, when sets are saved, then they save locally, survive app kill and phone restart (tested by restarting the app/DB in a unit/integration test), and no network call is made.
6. Given an exercise with no history, when selected, then steppers show placeholders and "Save set" is disabled until weight and reps are set (bodyweight exercises may save weight = null if ADR-0002 allows).
7. Error: Given the local DB write fails, when "Save set" is tapped, then an error "Couldn't save that set. Try again." is shown, the entered values are kept, and nothing is half-written.
8. Given "Undo last set", when tapped, then the most recent set from today is removed (soft delete) with a confirmation snackbar; it cannot remove sets from previous days.
9. Given a double-tap on "Save set", when it occurs within 500 ms, then only one set is written.
10. Performance: with 811 fixture entries, the screen shows pre-filled values within 200 ms of selecting an exercise (informational benchmark).
11. Accessibility: screen reader reads exercise, variant, gym, values; targets 44 pt; deltas use symbol plus colour.
12. R7: all copy en-AU and wellness-neutral; no "recommended load", "progress"-style claims (progression is P4).
13. Given a Maestro flow (qa-engineer), when run on a development build with synthetic fixture data, then it selects an exercise, adjusts steppers, saves two sets, and asserts both appear.

## Technical notes (architect)
- Needs ADR: yes, ADR-0002 addendum: implicit session for sets logged outside a formal session (rule, `source` value, how it later maps to the P2 session UI).
- Data/contract changes: none beyond STORY-007.
- Gap: imported history reaches the phone only after P2 sync; for P1 the device shows fixture data (see report, Open questions).

## Dependencies
- Depends on: STORY-018, STORY-019, STORY-020, STORY-010 (user id), STORY-013.

## Design (ux-designer)
- Spec: docs/design/STORY-021.md

## Test evidence (qa-engineer)
| Criterion | Test | Result |
|---|---|---|

## Review and compliance
- Code review: VERDICT …
- Compliance: COMPLIANCE … (if labelled)

## Done
- PR: #…  · Merged: …  · Accepted by product-owner: …
