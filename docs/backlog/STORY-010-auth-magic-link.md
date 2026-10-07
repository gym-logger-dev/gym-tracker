# STORY-010: Auth: email magic link sign-in

- **Status:** Draft (blocked until ADR for session storage and redirect scheme)
- **Phase / workstream / obligations:** P1 · W1 · R3 (collection notice itself is P2, not in this story), R6 (no identifier analytics)
- **Labels:** auth, ui
- **Owner (build):** mobile-dev
- **Branch:** story/STORY-010-auth-magic-link

## User story
As Sev, I want to sign in with an email magic link, so that my data is tied to my account and protected by row-level security without a password to manage.

## Scope (one PR, target < 350 lines)
Supabase JS client configured from public env values (URL and anon key via `EXPO_PUBLIC_*`, local stack values only); sign-in screen (email entry, "check your email" state); deep link handler for the magic link; session persisted in secure storage; sign-out in Settings. Against LOCAL Supabase only (links read in the local Inbucket mail viewer). Email-only sign-in is Sev's decision (2026-10-07): no Apple, Google or other provider auth and no anonymous mode, so there is no "try before sign-in" (ADR-0002 D14: sign in before first use).

## Acceptance criteria
1. Given the local stack and the app signed out, when Sev enters a valid email and taps "Send link", then the app shows "Check your email" and the local mail viewer receives one message.
2. Given the emailed link, when opened on the device or emulator, then the app opens, exchanges the token, shows the signed-in Log tab, and `auth.getSession()` returns a session for that user.
3. Given a signed-in session, when the app is killed and relaunched, then Sev stays signed in; the session is stored via secure storage (Keychain/Keystore), not AsyncStorage (asserted by a unit test on the storage adapter).
4. Offline: Given a signed-in user in airplane mode, when the app launches, then it opens to the app without network and without sign-out, using the cached session; tokens refresh later when online.
5. Offline: Given a signed-out user in airplane mode, when "Send link" is tapped, then a clear en-AU message "You're offline. Connect to sign in." is shown and no request is queued.
6. Error: Given an expired, reused or malformed link, when opened, then a message "That link has expired. Request a new one." appears with a button back to sign-in; no crash and no token appears in the UI.
7. Error: Given an invalid email format, when submitted, then inline validation blocks the request.
8. Given rate limiting by the server, when it returns an error, then the message is shown without exposing raw error JSON.
9. Given sign-out, when tapped, then the session and secure-storage entries are cleared and the app returns to sign-in; the local DB key (STORY-012) is NOT deleted on sign-out unless ADR says so.
10. Given RLS (STORY-009), when the signed-in client selects from a table, then it receives only its own rows (one integration test against local stack).
11. Logging: no email address, token or auth URL is written to console or logs in production builds; asserted by a test spying on `console`.
12. No service-role key anywhere in the app bundle; a CI grep test fails on `service_role`. Only local anon key placeholders in docs (no keys committed; repo is PUBLIC).
13. R7: sign-in copy is neutral, en-AU spelling, no health claims.
14. Given no session (first launch, after sign-out, or after account deletion), when any route other than sign-in and the magic-link deep-link handler is opened (tabs, Settings, direct deep link), then the app redirects to sign-in and renders no app screen or data (component test on the route guard).
15. Given the sign-in screen, when inspected, then it offers only the email field and "Send link": no provider buttons and no "continue without account" option.

## Technical notes (architect)
- Needs ADR: yes. ADR "Auth client": secure storage adapter, deep-link scheme and redirect URLs (local and later remote), token refresh behaviour offline, new dependencies (`@supabase/supabase-js`, `expo-secure-store`, `expo-linking`).
- Data/contract changes: none.

## Dependencies
- Depends on: STORY-002, STORY-003, STORY-004, STORY-009, ADR auth client (ADR-0001 D7; ADR number assigned by the architect).

## Design (ux-designer)
- Spec: docs/design/STORY-010.md

## Test evidence (qa-engineer)
| Criterion | Test | Result |
|---|---|---|

## Review and compliance
- Code review: VERDICT …
- Compliance: COMPLIANCE … (if labelled)

## Done
- PR: #…  · Merged: …  · Accepted by product-owner: …
