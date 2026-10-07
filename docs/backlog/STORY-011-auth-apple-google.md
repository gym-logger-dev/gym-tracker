# STORY-011: Auth: Sign in with Apple and Google

- **Status:** Dropped (Sev 2026-10-07: email-only sign-in)
- **Reason (kept for traceability only; do not build):** Sev decided sign-in is email magic link only (STORY-010); no Apple or Google provider sign-in, so no Apple Developer Program dependency from this story. Source: docs/OPEN_ITEMS.md OI-016 follow-up, docs/HANDOFF.md.
- **Phase / workstream / obligations:** P1 (deferrable) · W1 · R9 (Apple requires Sign in with Apple when other third-party sign-in is offered; account deletion is P5)
- **Labels:** auth, ui, needs-sev
- **Owner (build):** mobile-dev
- **Branch:** story/STORY-011-auth-apple-google

## User story
As Sev, I want to sign in with Apple or Google as well as email, so that I do not depend on email links on my phone.

## Scope (one PR, target < 300 lines; split into Apple and Google PRs if over)
Provider buttons and token exchange with Supabase Auth, against the local stack with test credentials only. Provider registration (Apple Developer Program, about AU$149 a year; Google Cloud OAuth client) is Sev's: the team creates no accounts and spends no money.

## Acceptance criteria
1. Given Sev has registered providers and put client IDs in his own local config (never committed), when he taps "Continue with Google" (or Apple on iOS), then the app signs in and the session matches the same user model as the magic link (STORY-010 criteria 2, 3, 9, 10 re-run).
2. Given provider config is missing, when the screen renders, then the provider buttons are hidden (not broken) and email sign-in still works.
3. Offline: Given airplane mode, when a provider button is tapped, then "You're offline. Connect to sign in." is shown.
4. Error: Given the user cancels the provider sheet, when returned to the app, then the sign-in screen is shown with no error banner. Given a provider error, then a neutral message is shown and no token is logged.
5. Given Apple sign-in on iOS, when the user chooses "Hide my email", then the app accepts the relay address.
6. No client secrets in the repo or bundle (public repo; secrets stay in Supabase config of Sev's project).
7. Sev-side checklist (exact steps) is written in the PR: what to register, redirect URIs, where to paste values.

## Technical notes (architect)
- Needs ADR: yes. Native vs web OAuth flow per provider; new dependencies. Possibly folded into the STORY-010 auth ADR.
- Needs Sev: Apple Developer Program enrolment (money, OI-004) and Google Cloud project. Default while waiting: WAIT; Apple sign-in stays out until Apple membership exists, Google can proceed first.

## Dependencies
- Depends on: STORY-010.

## Design (ux-designer)
- Spec: docs/design/STORY-011.md

## Test evidence (qa-engineer)
| Criterion | Test | Result |
|---|---|---|

## Review and compliance
- Code review: VERDICT …
- Compliance: COMPLIANCE … (if labelled)

## Done
- PR: #…  · Merged: …  · Accepted by product-owner: …
