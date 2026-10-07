# STORY-022: Quick Log sparkline (optional, baseline parity)

- **Status:** Draft (optional; needs Sev's call whether the sparkline belongs in P1 or waits for W2 in P3)
- **Phase / workstream / obligations:** P1 · W1 (W2 charts follow in P3) · R7
- **Labels:** ui
- **Owner (build):** mobile-dev
- **Branch:** story/STORY-022-quicklog-sparkline

## User story
As Sev, I want the small trend line I have in Quick Log today next to the exercise, so that I can see at a glance how the top set has moved.

## Scope (one PR, target < 150 lines excluding tests)
A non-interactive sparkline of top-set weight per session for the selected exercise (last 12 sessions) using the simplest possible drawing method. Interactive charts, tap-to-inspect, PR markers and filters are W2/P3 and out of scope. The charting library (Victory Native XL, Skia) is in the stack for P3; whether to pull it in during P1 is an architect decision.

## Acceptance criteria
1. Given an exercise with 12 or more sessions, when selected, then the sparkline shows the last 12 top-set values, oldest to newest, with the latest point emphasised.
2. Given fewer than 2 sessions, when selected, then no line is drawn and a "Not enough history yet" text is shown (empty state).
3. Given a rising or falling latest value, when shown, then the delta label uses a symbol (up/down arrow) plus colour (theme tokens).
4. Given variant or gym selections change, when they change, then the sparkline updates for the same filters used by pre-fill (STORY-019 rules).
5. Offline: local data only; no network.
6. Error: a query failure hides the sparkline and shows nothing else broken (screen still usable).
7. Accessibility: sparkline has a text alternative ("Top set trend, up 2.5 kilograms over the last 12 sessions").
8. Performance: renders within 100 ms with 811 synthetic entries; scrolling the list stays smooth.
9. R7: description is a plain trend; no advice or outcome wording.

## Technical notes (architect)
- Needs ADR: yes if a new dependency is added (e.g. Skia / Victory Native XL early, or `react-native-svg`); no ADR if drawn with core Views.
- Data/contract changes: none.

## Dependencies
- Depends on: STORY-021.

## Design (ux-designer)
- Spec: docs/design/STORY-022.md

## Test evidence (qa-engineer)
| Criterion | Test | Result |
|---|---|---|

## Review and compliance
- Code review: VERDICT …
- Compliance: COMPLIANCE … (if labelled)

## Done
- PR: #…  · Merged: …  · Accepted by product-owner: …
