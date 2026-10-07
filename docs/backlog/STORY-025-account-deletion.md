# STORY-025: Account deletion (in-app, purges server and device data)

- **Status:** Draft
- **Phase / workstream / obligations:** P2 (confirmed by Sev, OI-019; deviation from dev-plan, which lists R9 at P5, is recorded in docs/OPEN_ITEMS.md and the status report) · W1 · R9 (Apple 5.1.1(v) in-app account deletion), R2 (withdrawal and erasure), R3 (collection notice and retention wording)
- **Labels:** auth, data, ui, needs-sev
- **Owner (build):** backend-dev (deletion Edge Function), mobile-dev (Settings screen and device wipe), qa-engineer (pgTAP and integration evidence)
- **Branch:** story/STORY-025-account-deletion

## User story
As Sev, I want to delete my account from inside the app, so that all my data on the server and on the device is erased and the app meets Apple's account-deletion rule.

## Scope (two PRs if over 400 lines: A server path, B app screen)
- Server (backend-dev): an authenticated deletion path that removes the caller's `auth.users` row, so every table with `user_id references auth.users on delete cascade` is purged (ADR-0002 D2, D14). Local Supabase stack only; the service-role key is used server-side only and never appears in the app, bundle or repo (CLAUDE.md rule 6).
- App (mobile-dev): Settings > Delete account screen with typed confirmation (fixed word "DELETE") and a recent-sign-in step (user completes a fresh emailed sign-in, the same method as STORY-010: link, or code if the auth ADR adds one); on success wipe the local DB, the SQLCipher key and secure-storage entries, then return to sign-in.
- Tests (qa-engineer): pgTAP and integration test that every `public` table has zero rows for the user after deletion, including `consent` and `import_entry`.
- Out of scope: retention or backup wording (open question below), sign-out (STORY-010), per-feature deletion such as scan data only (R2, P4), Strava disconnect.

## Acceptance criteria
1. Confirmation: Given a signed-in user on Settings > Delete account, when the screen opens, then it states in en-AU wording what will be erased (account, sessions, sets, plans, consent records, imports, on-device data) and that this cannot be undone; the delete button is disabled until the user types the word DELETE. Matching is case-insensitive after trimming leading and trailing whitespace ("delete" and " Delete " enable the button; "DELET" and "DELETE ME" do not).
2. Purge: Given a user with rows in every `public` table (reference tables, session, set, provenance, plan, plan_day, consent, import_entry), when deletion succeeds, then a query for that `user_id` returns zero rows in each table, and the test enumerates tables from `information_schema` so a new table fails the test if it is not covered.
3. Isolation: Given two users A and B with data, when A is deleted, then B's rows and sign-in are unchanged.
4. Device wipe: Given deletion succeeded on the server, when the app handles the response, then the local DB file, the SQLCipher key and all secure-storage entries (session tokens) are removed, and the app shows sign-in; a unit test asserts each wipe call.
5. Signed-out gate: Given deletion completed, when the app is relaunched, then only sign-in is reachable (STORY-010 criterion 14) and the old session cannot read or write data (integration test returns no rows or an auth error).
6. Offline: Given airplane mode, when the user taps Delete, then "You're offline. Connect to delete your account." is shown, nothing is requested, and no local data is wiped.
7. Error: Given the server returns an error or times out, when deletion is attempted, then the account and data remain intact, the app shows "Your account was not deleted. Try again." with a retry, the local data is NOT wiped, and no raw error JSON is shown.
8. Idempotent retry: Given a first attempt that succeeded on the server but whose response was lost, and the retry carries the same still-valid JWT (valid signature, unexpired, subject is the already-deleted user), when the deletion path is called again, then it returns a defined success result (not 5xx, not 401/404) and the app completes the device wipe. Test: delete user, replay the same request with the same valid JWT, assert success result and zero rows.
9. Authorisation: Given a token that is invalid (bad signature), expired, malformed or absent, or a request naming another user's id, when the deletion path is called, then it refuses with an auth error and deletes nothing; the app does not wipe and shows the criterion 7 message. The target is always the caller's own id from the verified token, never a request parameter. Tests: one case each for bad signature, expired, malformed, absent, and body naming user B while signed in as A (B untouched). Criteria 8 and 9 do not overlap: a valid JWT for an absent user is success; any invalid token is refusal.
10. Local-first order: Given a failure partway through the device wipe after server success, when the app next launches, then it completes the wipe or shows sign-in, and never shows deleted-account data.
11. Logging: Given any deletion outcome, when logs are inspected (app console, Edge Function logs), then they contain no email address, token, key, or health or training values; asserted by a test spying on `console` and by a grep of function log statements.
12. Secrets: Given the repo and app bundle, when CI greps for `service_role`, then it matches only server-side function code and docs, never `app/` or `src/` (extends STORY-010 criterion 12).
13. Wording: Given all new copy, when reviewed, then it is neutral and en-AU with no health claims (R7). It does not state a backup or retention period.
14. Empty state: Given a user with no data beyond the account, when deleting, then the flow works the same and succeeds.
15. Copy constraint: Given the Delete account screen strings and the privacy text, when a test greps them (case-insensitive), then neither contains "permanently" or "immediately erased everywhere", and the deletion statement reads exactly "Your data is removed from our live systems on deletion."
16. Recent sign-in required: Given a session older than the recency threshold (set by the architect ADR; default 5 minutes), when the user taps Delete, then the app requires a fresh emailed sign-in (the same method as STORY-010: link, or code if the auth ADR adds one) before any deletion request runs.
17. Fresh sign-in passes: Given a session within the threshold or a just-completed fresh sign-in, when the user confirms with DELETE, then deletion proceeds.
18. Failed re-auth: Given a failed, wrong or expired fresh sign-in (expired or already-used link, or wrong or expired code), when the user attempts it, then deletion does not run, the account and all data remain intact (server and device), and a neutral message with a resend option is shown (no raw error JSON).
19. Offline re-auth: Given airplane mode, when the user must re-authenticate, then "You're offline. Connect to delete your account." is shown, no request is made and nothing is wiped.
20. Server-side recency: Given a valid JWT whose sign-in time is older than the threshold, when the deletion path is called directly (bypassing the app), then it refuses and deletes nothing; recency is derived from the verified token claims, never from a client-supplied flag or timestamp. Test: same request with a stale token refused; with a client-asserted "recent" field in the body, still refused. (Interaction with criterion 8: recency is checked only while the user exists; a retry for an already-deleted user with a valid JWT remains success.)

## Open questions (do not decide in this story)
- Backups and retention: closed for this story by Sev (OI-020): no retention claim in the UI or privacy text now. The plan-retention check is a P5 item (see README, "Later / P5").
- Phase placement: closed (OI-019), P2.

## Technical notes (architect)
- Needs ADR: yes. Deletion path: Edge Function using the service role (`auth.admin.deleteUser`) versus an RPC; how the app proves it is the owner (verified JWT); behaviour when a request is retried. The architect must verify against Supabase docs that an email change keeps `auth.users.id` stable, so the cascade still reaches all rows after a user changes email.
- The architect's ADR also covers recency verification (threshold, which token claim carries sign-in time, how the fresh emailed sign-in refreshes it). Needs ADR.
- Additional P5 items exist for backup retention and store-wording checks (README, "Later / P5"); they do not block this story.
- Data/contract changes: possibly a contract type for the deletion response in `packages/contracts/`. No new tables; relies on cascade FKs from STORY-006 to STORY-008 (any table lacking the cascade is a defect in that story).

## Dependencies
- Depends on: STORY-006, STORY-007, STORY-008 (tables), STORY-009 (RLS), STORY-010 (auth), ADR deletion path. Uses STORY-012 for the key wipe if that story has landed.

## Design (ux-designer)
- Spec: docs/design/STORY-025.md

## Test evidence (qa-engineer)
| Criterion | Test | Result |
|---|---|---|

## Review and compliance
- Code review: VERDICT …
- Compliance: COMPLIANCE … (labelled auth, data; R2, R3, R9)

## Done
- PR: #…  · Merged: …  · Accepted by product-owner: …
