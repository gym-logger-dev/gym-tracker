# Backlog

Ordered by the lead. One line per story: `ID | title | phase | labels | status | depends on`.
Stories live in this folder as `STORY-<n>-<slug>.md` (template: `_TEMPLATE.md`).

## P1 order (lead, 2026-10-07; DRAFT until Sev answers the product-owner questions in HANDOFF)

| # | ID | Title | Labels | Status | Depends on |
|---|---|---|---|---|---|
| 1 | STORY-000 | Verify agents' GitHub identity | needs-sev | Ready | none |
| 2 | STORY-001 | Tooling bootstrap (`npm run verify`) | none | Draft | ADR-0001 |
| 3 | STORY-005 | Data model ADR and contracts | data | Ready | none (writes ADR-0002) |
| 4 | STORY-004 | Local Supabase config | data | Ready | none |
| 5 | STORY-002 | Expo app shell | ui | Draft | ADR-0001, 001 |
| 6 | STORY-003 | Theme tokens stub | ui | Ready | none |
| 7 | STORY-006 | Migration: reference tables | data, migration | Draft | 005 |
| 8 | STORY-007 | Migration: session, set, provenance | data, migration | Draft | 005, 006 |
| 9 | STORY-008 | Migration: plan, plan_day, consent | data, migration | Draft | 005 |
| 10 | STORY-009 | RLS policies + pgTAP deny suite | data, auth, migration | Ready | 004, 006-008 |
| 11 | STORY-012 | Local encrypted DB (SQLCipher) | data | Draft | ADR-0003 |
| 12 | STORY-013 | Drizzle local schema | data | Draft | 005, 012 |
| 13 | STORY-010 | Auth magic link | auth, ui | Draft | ADR auth client, 002 |
| 14 | STORY-018 | Quick Log stepper | ui | Ready | 002, 003 |
| 15 | STORY-019 | Quick Log pre-fill query | data | Ready | 013 |
| 16 | STORY-020 | Quick Log selectors | ui, data | Ready | 013 |
| 17 | STORY-014 | Importer: Sets parser | data, migration | Draft | ADR-0004, Sev grammar OK |
| 18 | STORY-015 | Importer: CSV mapping | data, migration | Draft | 005, 007, 014 |
| 19 | STORY-016 | Importer: reconciliation (811/811) | data, migration | Draft | 015; real run needs OI-003 |
| 20 | STORY-021 | Quick Log screen | ui, data | Draft | 010, 013, 018-020, ADR-0002 implicit session |
| 21 | STORY-023 | CI hardening for P1 gate | data, needs-sev | Draft | 001, 009, 016; needs Sev's approval label |
| 22 | STORY-017 | Runbook: remote Supabase + prod import | needs-sev | Draft (WAIT) | Sev |
| 23 | STORY-022 | Quick Log sparkline (optional) | ui | Draft | Sev: P1 or P3 |
| 24 | STORY-011 | Apple/Google sign-in (defer to P2?) | auth, ui, needs-sev | Draft | OI-004, Sev |
| 25 | STORY-024 | P1 phase gate | needs-sev | Draft | all above; Sev sign-off |

Critical path: ADR-0001 -> 001 -> 002; ADR-0002 (005) -> 006-008 -> 009; ADR-0003 -> 012 -> 013 -> Quick Log.
