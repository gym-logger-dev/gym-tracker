# STORY-003: Theme tokens stub

- **Status:** Ready
- **Phase / workstream / obligations:** P1 · W1 · R7
- **Labels:** ui
- **Owner (build):** mobile-dev (token values authored by ux-designer in `src/ui/theme/`; mobile-dev wires a `useTheme` hook outside that folder)
- **Branch:** story/STORY-003-theme-tokens-stub

## User story
As Sev, I want a small set of design tokens (colour, spacing, type, touch target) shared by all screens, so that the ported Quick Log looks and feels like the current one and later screens stay consistent.

## Scope (one PR, target < 150 lines)
`src/ui/theme/` with tokens: colours (light/dark), spacing scale, type scale, radii, `minTouchTarget = 44`, delta colours paired with symbols (up/down). Values taken from the Quick Log baseline; if the Quick Log source is not in the repo, ux-designer proposes values and flags them as provisional.

## Acceptance criteria
1. Given the tokens module, when imported in a test, then it exports colour, spacing, type, radius and `minTouchTarget` (value 44) with TypeScript types, and `npm run typecheck` passes.
2. Given a delta token set, when inspected, then every positive/negative delta colour has an associated symbol token (up/down arrow), so meaning never depends on colour alone.
3. Given light and dark colour schemes, when a contrast unit test runs on text/background pairs, then each pair meets WCAG AA (4.5:1 body text).
4. Given a placeholder component using the tokens, when rendered by RNTL, then it uses no hard-coded colour or spacing literals (a lint rule or test greps `app/` and `src/` outside the theme folder for hex literals).
5. Offline/empty/error: not applicable (static values). No network access.
6. Copy: any sample strings in the token showcase are en-AU and wellness-neutral (R7).

## Technical notes (architect)
- Needs ADR: no
- Data/contract changes: none.

## Dependencies
- Depends on: STORY-002.

## Design (ux-designer)
- Spec: docs/design/STORY-003.md

## Test evidence (qa-engineer)
| Criterion | Test | Result |
|---|---|---|

## Review and compliance
- Code review: VERDICT …
- Compliance: COMPLIANCE … (if labelled)

## Done
- PR: #…  · Merged: …  · Accepted by product-owner: …
