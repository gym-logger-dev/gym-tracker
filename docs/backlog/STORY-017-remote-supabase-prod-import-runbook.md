# STORY-017: Runbook for Sev: remote Supabase project (Sydney) and production import

- **Status:** Draft (WAIT: production, accounts and real data are Sev's; not on the agents' critical path)
- **Phase / workstream / obligations:** P1 · W1 · R4 (database hosted in Sydney), R5 (no real data in repo), R6
- **Labels:** data, migration, needs-sev
- **Owner (build):** backend-dev writes the runbook text (docs only); Sev executes every step
- **Branch:** story/STORY-017-remote-supabase-prod-import-runbook

## User story
As Sev, I want an exact step list for creating the Supabase project in Sydney, applying the migrations and running the import against it, so that I do the production steps myself and agents never touch remote or real data.

## Scope (one PR, docs only, target < 150 lines)
A runbook under `docs/release/` (path to be confirmed with devops-release, who owns that folder) covering: creating the free project in region ap-southeast-2 (verify the region is offered on the free plan, dev-plan A3), `supabase link` and `db push` run by Sev from his own shell, auth redirect URLs, key handling (keys only in Sev's environment, never in the repo), the one-off import with the importer's production flag, running reconcile, rollback (delete import batch by id), and the project-pause caveat (free projects pause after 1 week inactive, no automatic backups).

## Acceptance criteria
1. Given the runbook, when Sev follows it on a throwaway local setup (steps that are non-destructive), then each command is copy-pasteable and states where it runs (WSL, Sev's account).
2. Given the runbook, when read, then it states that agents never run `supabase link`, `db push`, `functions deploy`, or the production import, and that no key, project ref, URL or personal identifier is written in the repo (PUBLIC).
3. Given the region step, when Sev creates the project, then the runbook has a "stop and raise an open item if ap-southeast-2 is not offered" instruction (A3, R4).
4. Given the import step, when completed, then Sev runs reconcile and records only counts (811/811) in the gate report.
5. Given rollback, when needed, then a documented, tested-locally command removes one import batch without touching other rows (tested against the local stack in this PR).
6. Error state: the runbook lists failure modes (migration error, RLS test failure, import refusal) and what to do; none instruct disabling RLS.
7. Offline/empty: not applicable.

## Technical notes (architect)
- Needs ADR: no.
- Needs Sev: Supabase account/project, production import. Default: WAIT; P1 can complete its gate on the local stack plus the real CSV, but production is only needed from P2 (sync).

## Dependencies
- Depends on: STORY-015, STORY-016.

## Design (ux-designer)
- Spec: docs/design/STORY-017.md

## Test evidence (qa-engineer)
| Criterion | Test | Result |
|---|---|---|

## Review and compliance
- Code review: VERDICT …
- Compliance: COMPLIANCE … (if labelled)

## Done
- PR: #…  · Merged: …  · Accepted by product-owner: …
