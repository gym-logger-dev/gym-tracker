# STORY-021: Quick Log screen: log a set (pre-filled, steppers, save locally)

- **Status:** Ready (implicit session rule decided in ADR-0002 D8, approved 2026-10-07; build waits on STORY-010, 013, 018-020)
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
4. Given Quick Log writes before P2 session UI exists, when the first set of an Adelaide calendar day for a gym (or no gym) is saved, then one implicit session is created per (date, gym) with `source = 'quick_log'`, a deterministic UUIDv5 id (ADR-0002 D1, D8), `session_date` the Adelaide day and `ended_at` null, inserted in the same local transaction as the set; a second set the same day and gym reuses it, and a different gym the same day creates a second session. Ids are identical when the same day and gym are logged from two installs. `started_at` is the time of the first set saved (ADR-0002 D8).
5. Offline: Given airplane mode, when sets are saved, then they save locally, survive app kill and phone restart (tested by restarting the app/DB in a unit/integration test), and no network call is made.
6. Given an exercise with no history, when selected, then steppers show placeholders and "Save set" is disabled until weight and reps are set (bodyweight exercises save weight = null only through an explicit "bodyweight" choice; 0 is never a placeholder, ADR-0002 D3).
7. Error: Given the local DB write fails, when "Save set" is tapped, then an error "Couldn't save that set. Try again." is shown, the entered values are kept, and nothing is half-written.
8. Given "Undo last set", when tapped, then the most recent set from today is removed (soft delete) with a confirmation snackbar; it cannot remove sets from previous days.
9. Given a double-tap on "Save set", when it occurs within 500 ms, then only one set is written.
10. Performance: with 811 fixture entries, the screen shows pre-filled values within 200 ms of selecting an exercise (informational benchmark).
11. Accessibility: screen reader reads exercise, variant, gym, values; targets 44 pt; deltas use symbol plus colour.
12. R7: all copy en-AU and wellness-neutral; no "recommended load", "progress"-style claims (progression is P4).
13. Given a Maestro flow (qa-engineer), when run on a development build with synthetic fixture data, then it selects an exercise, adjusts steppers, saves two sets, and asserts both appear.

## Technical notes (architect)
- ADR-0002 D8 (approved) defines the implicit session, its `source` value and how it maps to the P2 session UI. No further ADR needed.
- Data/contract changes: none beyond STORY-007.
- Known gap: imported history reaches the phone only after P2 sync; in P1 the device shows synthetic fixture data only (default, OI-017 open).

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
