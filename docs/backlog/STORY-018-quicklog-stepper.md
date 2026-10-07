# STORY-018: Quick Log stepper component (+/- with 1 / 1.25 / 2.5 / 5 kg steps)

- **Status:** Ready
- **Phase / workstream / obligations:** P1 · W1 · R7
- **Labels:** ui
- **Owner (build):** mobile-dev
- **Branch:** story/STORY-018-quicklog-stepper

## User story
As Sev, I want the same +/- steppers I use in Quick Log today (weight steps of 1, 1.25, 2.5 and 5 kg, reps by 1), so that logging a set stays two taps.

## Scope (one PR, target < 250 lines excluding tests)
A presentational `Stepper` component (value, step, min, onChange, unit label) and a `StepSizePicker` for weight steps; pure helper `applyStep(value, step, direction)`. No data access, no screens (STORY-021).

## Acceptance criteria
1. Given weight 40 and step 2.5, when "+" is tapped, then the value is 42.5; when "-" is tapped twice from 42.5, then 37.5.
2. Given step sizes, when the picker is shown, then exactly 1, 1.25, 2.5 and 5 kg are offered; default is 2.5 (Quick Log baseline default to be confirmed by ux-designer against the existing artifact).
3. Given repeated 1.25 steps (100 taps up then 100 down), when computed, then the value returns to the start exactly (no floating-point drift; unit test uses integer-hundredths arithmetic).
4. Given value 0 (or `min`), when "-" is tapped, then the value stays at `min` and "-" is shown disabled; negative values are impossible.
5. Given reps, when "+" or "-" is tapped, then it changes by 1 with minimum 0 (or 1 per ux spec) and maximum 1000 (ADR-0002 D3: reps check 0 to 1000); at 1000, "+" is disabled.
6. Given long-press on "+" or "-", when held, then the value repeats at a steady rate (or the PR states it is not part of the baseline and omits it).
7. Given the display, when a value is shown, then it uses up to 2 decimals without trailing zeros (42.5, 40, 1.25) and en-AU number formatting.
8. Accessibility: each button has a VoiceOver/TalkBack label ("Increase weight by 2.5 kilograms"), touch targets are at least 44 pt (theme token), and the current value is announced on change.
9. Given a manual numeric entry (tap value to type), when an invalid string ("abc", "-5") is entered, then the previous value is kept and an inline hint is shown; no crash.
10. Offline: pure UI, no network. Error/empty: undefined value renders as an em dash placeholder and "+" starts from a provided prefill or 0.
11. R7: labels contain no health claims.

## Technical notes (architect)
- Needs ADR: no
- Data/contract changes: none.

## Dependencies
- Depends on: STORY-003.

## Design (ux-designer)
- Spec: docs/design/STORY-018.md

## Test evidence (qa-engineer)
| Criterion | Test | Result |
|---|---|---|

## Review and compliance
- Code review: VERDICT …
- Compliance: COMPLIANCE … (if labelled)

## Done
- PR: #…  · Merged: …  · Accepted by product-owner: …
