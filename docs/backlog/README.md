# Backlog

Ordered by the lead. One line per story: `ID | title | phase | labels | status | depends on`.
Stories live in this folder as `STORY-<n>-<slug>.md` (template: `_TEMPLATE.md`). The story file is authoritative: this table is synced to each file's Status, Labels and "Depends on".

## P1 order (lead, 2026-10-07; updated after Sev approved ADR-0001 and ADR-0002 on 2026-10-07)

Resolved: OI-015 (mobile-dev owns `eslint.config.js`, `jest.config.js`, `.prettierrc`, `.prettierignore`), OI-016 (ADR-0001, ADR-0002 approved), OI-018.
Still open: OI-017. Its defaults apply and are marked "default, OI-017 open" below.

`needs-sev` also marks PRs that need Sev's `sev-approved` label on `merge-gate` (it guards `app.config.ts`, `supabase/migrations/` and `.github/`): 002, 006, 007, 008, 009, 023.

| # | ID | Title | Labels | Status | Depends on |
|---|---|---|---|---|---|
| 1 | STORY-000 | Verify agents' GitHub identity | needs-sev | Ready | none |
| 2 | STORY-001 | Tooling bootstrap (`npm run verify`) | none | Ready (Part B `.gitignore`, `.nvmrc`, `engines` is devops-release) | 000 |
| 3 | STORY-005 | Shared contract types (zod) per ADR-0002 | data | Ready | 001 |
| 4 | STORY-004 | Local Supabase config | data | Ready (parts A-D by four owners, lead-coordinated) | 001 |
| 5 | STORY-002 | Expo app shell | ui, needs-sev | Ready | 001 |
| 6 | STORY-003 | Theme tokens stub | ui | Ready | 002 |
| 7 | STORY-006 | Migration: reference tables | data, migration, needs-sev | Ready, start after Sev confirms OI-016 (d) | 004, 005 |
| 8 | STORY-007 | Migration: session, set, provenance | data, migration, needs-sev | Ready, start after Sev confirms OI-016 (d) | 004, 005, 006 |
| 9 | STORY-008 | Migration: plan, plan_day, consent | data, migration, needs-sev | Ready, start after Sev confirms OI-016 (d) | 004, 005, 007 |
| 10 | STORY-009 | RLS policies + pgTAP deny suite | data, auth, migration, needs-sev | Ready | 004, 006, 007, 008 |
| 11 | STORY-012 | Local encrypted DB (SQLCipher) | data | Draft | 002, ADR-0003 |
| 12 | STORY-013 | Drizzle local schema | data | Ready, start after Sev confirms OI-016 (d); also waits for 012 and ADR-0003 | 005, 012 |
| 13 | STORY-010 | Auth magic link | auth, ui | Draft | 002, 003, 004, 009, ADR auth client |
| 14 | STORY-018 | Quick Log stepper | ui | Ready | 003 |
| 15 | STORY-019 | Quick Log pre-fill query | data | Ready | 013 |
| 16 | STORY-020 | Quick Log selectors | ui, data | Ready | 013, 003 |
| 17 | STORY-014 | Importer: Sets parser | data, migration | Draft | 001, 005, ADR-0004; grammar approved with ADR-0002 (OI-016) |
| 18 | STORY-015 | Importer: CSV mapping | data, migration | Draft | 007, 008, 009, 014, ADR-0004 |
| 19 | STORY-016 | Importer: reconciliation (811/811) | data, migration | Draft | 015; real run needs OI-003 |
| 20 | STORY-021 | Quick Log screen | ui, data | Ready | 018, 019, 020, 010, 013 (implicit session: ADR-0002 D8) |
| 21 | STORY-023 | CI hardening for P1 gate | data, needs-sev | Draft | 001, 004, 009, 016; needs Sev's approval label |
| 22 | STORY-017 | Runbook: remote Supabase + prod import | data, migration, needs-sev | Draft (WAIT) | 015, 016; Sev executes |
| 23 | STORY-022 | Quick Log sparkline (optional) | ui | Draft; P3 (default, OI-017 open) | 021 |
| 24 | STORY-011 | Apple/Google sign-in | auth, ui, needs-sev | Draft; deferred to P2 (default, OI-017 open) | 010; OI-004, Sev |
| 25 | STORY-024 | P1 phase gate | data, auth, needs-sev | Draft | 000-023 (011, 017, 022 may be deferred); Sev sign-off |

## Defaults pending OI-017 (default, OI-017 open)
- Dev build is Android-only in P1 (iOS dev build deferred).
- On-device data in P1 is synthetic fixtures only.
- Sparkline (STORY-022) is P3.
- Apple/Google sign-in (STORY-011) is deferred.

Critical path: 001 -> 002; 001 -> 005 -> 006-008 -> 009; ADR-0003 -> 012 -> 013 -> Quick Log.
