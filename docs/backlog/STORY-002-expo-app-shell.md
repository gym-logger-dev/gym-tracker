# STORY-002: Expo app shell (Expo Router, TypeScript strict)

- **Status:** Ready (ADR-0001 approved 2026-10-07; start after STORY-001 merges)
- **Phase / workstream / obligations:** P1 · W1 · R7 (wellness-only wording in all UI copy)
- **Labels:** ui
- **Owner (build):** mobile-dev
- **Branch:** story/STORY-002-expo-app-shell

## User story
As Sev, I want an installable Expo app with navigation and placeholder screens, so that every later feature has a place to live on iPhone and Android.

## Scope (one PR, target < 300 lines excluding lockfile)
Expo SDK 57 (`expo ~57.0.x`, installed with `npx expo install`) project in the repo root, layout per ADR-0001 D4: `app/` (Expo Router routes only): root `_layout.tsx` exporting an `ErrorBoundary`, tab or stack navigation with placeholders "Log" (Quick Log lands here), "History" (empty, charts are P3), "Settings". `app.config.ts` (not `app.json`) with name, bundle id placeholders, en-AU locale. `expo-dev-client` is installed and the app runs as a development build (not Expo Go). Route tests live in `src/__tests__/routes/` (one render test per route), not in `app/`. Adds the jest-expo `app` project to the Jest config. Baseline runtime dependencies are only those in ADR-0001 D7. No auth, no DB, no network.

## Acceptance criteria
1. Given the repo, when `npx expo start --dev-client` runs and the app opens in the development build, then the app launches to the Log tab without a red screen. Default while OI-017 is open: Android dev build only (local or EAS); iOS dev build is deferred.
2. Given TypeScript, when `npm run typecheck` runs, then `strict` is true in `tsconfig.json` and there are no `any` suppressions (`@ts-ignore` count is zero).
3. Given the navigation, when Sev taps each tab, then each shows its placeholder title and an empty state message ("Nothing logged yet" style copy, en-AU), and the Android back button/gesture behaves per platform convention.
4. Given RNTL (`@testing-library/react-native ~13.3.3`), when `npm run test` runs, then a render test per route in `src/__tests__/routes/` passes (3 routes), and no test file exists under `app/`. A unit test imports `@gym-tracker/contracts` (or a workspace stub) to prove Metro/Jest resolve workspace packages and the `@/*` alias (ADR-0001 D4, D5).
5. Offline: Given airplane mode, when the app is launched, then it renders the same screens with no network error (the shell makes no network calls; a test asserts no `fetch` calls on mount).
6. Error state: Given a route that throws, when it renders, then an Expo Router error boundary shows a neutral message with a "Try again" action instead of a crash.
7. R7: no copy contains diagnosis, disease, treatment or outcome-promise wording; the PR lists all user-visible strings for security-compliance to skim.
8. No analytics/ad SDK; no secrets in `app.config.ts`.
9. Given Node 24, when `npx expo-doctor` runs, then its output is attached to the PR (ADR-0001 D1).

## Technical notes (architect)
- ADR-0001 (approved 2026-10-07) fixes the SDK pin, layout, alias and dev-build decision (D1, D4, D8). No further ADR needed.
- Data/contract changes: none.

## Dependencies
- Depends on: STORY-001.

## Design (ux-designer)
- Spec: docs/design/STORY-002.md

## Test evidence (qa-engineer)
| Criterion | Test | Result |
|---|---|---|

## Review and compliance
- Code review: VERDICT …
- Compliance: COMPLIANCE … (if labelled)

## Done
- PR: #…  · Merged: …  · Accepted by product-owner: …
