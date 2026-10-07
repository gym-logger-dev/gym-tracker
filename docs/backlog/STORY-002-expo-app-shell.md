# STORY-002: Expo app shell (Expo Router, TypeScript strict)

- **Status:** Draft (blocked until ADR-0001 fixes the Expo SDK version and folder layout)
- **Phase / workstream / obligations:** P1 · W1 · R7 (wellness-only wording in all UI copy)
- **Labels:** ui
- **Owner (build):** mobile-dev
- **Branch:** story/STORY-002-expo-app-shell

## User story
As Sev, I want an installable Expo app with navigation and placeholder screens, so that every later feature has a place to live on iPhone and Android.

## Scope (one PR, target < 300 lines excluding lockfile)
Expo (latest stable SDK) project in the repo root with `app/` (Expo Router): root layout, tab or stack navigation with placeholders "Log" (Quick Log lands here), "History" (empty, charts are P3), "Settings". `app.json` with name, bundle id placeholders, en-AU locale. No auth, no DB, no network.

## Acceptance criteria
1. Given the repo, when `npx expo start` runs and the app opens in Expo Go (or the dev build), then the app launches to the Log tab without a red screen on iOS and Android.
2. Given TypeScript, when `npm run typecheck` runs, then `strict` is true in `tsconfig.json` and there are no `any` suppressions (`@ts-ignore` count is zero).
3. Given the navigation, when Sev taps each tab, then each shows its placeholder title and an empty state message ("Nothing logged yet" style copy, en-AU), and the Android back button/gesture behaves per platform convention.
4. Given RNTL, when `npm run test` runs, then a render test per route passes (3 routes).
5. Offline: Given airplane mode, when the app is launched, then it renders the same screens with no network error (the shell makes no network calls; a test asserts no `fetch` calls on mount).
6. Error state: Given a route that throws, when it renders, then an Expo Router error boundary shows a neutral message with a "Try again" action instead of a crash.
7. R7: no copy contains diagnosis, disease, treatment or outcome-promise wording; the PR lists all user-visible strings for security-compliance to skim.
8. No analytics/ad SDK; no secrets in `app.json`/`app.config.*`.

## Technical notes (architect)
- Needs ADR: yes, ADR-0001 (shared with STORY-001): Expo SDK version pin, `app/` and `src/` layout, dev-build vs Expo Go (see STORY-012: SQLCipher needs a dev build).
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
