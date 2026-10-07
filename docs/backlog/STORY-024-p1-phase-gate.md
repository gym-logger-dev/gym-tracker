# STORY-024: P1 phase-gate checklist

- **Status:** Draft (runs last; every P1 story above must be Done or explicitly deferred by Sev)
- **Phase / workstream / obligations:** P1 · W1 · R7 (P1 to P5 wording check); R5, R6 evidence for what exists in P1
- **Labels:** data, auth, needs-sev (Sev tests on his phone and signs off)
- **Owner (build):** none (docs only). qa-engineer gathers evidence, security-compliance reviews, lead assembles; build owner nominally backend-dev for the gate script if one is needed.
- **Branch:** story/STORY-024-p1-phase-gate

## User story
As Sev, I want one gate report that proves the P1 exit criteria with evidence, so that I can sign off P1 and P2 can start.

## Scope (one PR, docs only: `docs/status/P1-gate.md` plus compliance notes)
Run `/phase-gate P1`. The report lists each criterion, the evidence (command output, test name, PR number) and pass or fail.

## Acceptance criteria
1. Given the real Notion CSV export in gitignored `data/import/` and a local import, when `npm run import:reconcile` runs on Sev's PC, then the report records `811 in, 811 out`, 46 exercises, zero unresolved `needs_review` entries (only aggregate counts in the repo).
2. Given `supabase test db` in CI on `main`, when run, then all RLS deny tests pass (list the count of tables covered, equal to the count of tables in `public`).
3. Given `npm run verify` in CI on `main`, when run, then it passes with no skipped steps (STORY-023).
4. Given the stories STORY-000 to STORY-023, when the lead audits them, then each is Done or deferred with Sev's written decision; open items attached to P1 are answered or defaulted.
5. Given the app, when Sev installs the development build or Expo Go on his own phone, then he can sign in with a magic link against the local stack (or the documented alternative), pick an exercise, see pre-filled values from fixture data, save a set in airplane mode and see it after restarting the app.
6. Given security-compliance, when it reviews P1, then it records: no secrets, keys, ntfy topics, personal data or real CSV rows in the repo or git history (secret scan output), local DB encryption evidenced (STORY-012), no analytics SDK, RLS and auth verified, and R7: every user-visible string reviewed for wellness-only wording, with the date checked in `docs/compliance/obligations.md`.
7. Given the report, when read, then it states what P1 deliberately does not do (sync, sessions UI, privacy policy and collection notice (P2), health data and consent (P4)) so no one assumes they are covered.
8. Given Sev's signoff, when he replies "P1 approved" (or lists failures), then the lead records it in the gate report; P2 does not start before that. If any criterion fails, the report lists the failing story and the lead opens a fix story.
9. Offline/empty/error: criteria 5 and 6 explicitly cover offline use and failure handling; the report notes any untested state.
10. The report also records the re-baselined window count per story (dev-plan A10 / team-plan A4) to calibrate P2 estimates.

## Technical notes (architect)
- Needs ADR: no
- Data/contract changes: none.

## Dependencies
- Depends on: STORY-000 to STORY-023 (STORY-011, STORY-017 and STORY-022 may be deferred by Sev; criterion 1 needs OI-003 supplied).

## Design (ux-designer)
- Spec: docs/design/STORY-024.md

## Test evidence (qa-engineer)
| Criterion | Test | Result |
|---|---|---|

## Review and compliance
- Code review: VERDICT …
- Compliance: COMPLIANCE … (if labelled)

## Done
- PR: #…  · Merged: …  · Accepted by product-owner: …
