# STORY-004: Local Supabase project config

- **Status:** Ready
- **Phase / workstream / obligations:** P1 · W1 (backend foundation) · R4 (data location: Sydney for the remote project, see notes)
- **Labels:** data
- **Owner (build):** split by path owner per ADR-0001 D9 and the CLAUDE.md repo map, as sequential parts on one story branch (lead-coordinated: the lead sequences the parts and says whether they land as one PR or as one PR per part):
  - Part A, backend-dev: `supabase/config.toml`, `supabase/seed.sql` (empty).
  - Part B, devops-release: `.gitignore` additions (`supabase/.temp/`, `supabase/.env*`).
  - Part C, qa-engineer: `supabase/tests/` directory with `.gitkeep` and the smoke test `00-smoke.test.sql` (`select 1`).
  - Part D, architect: `supabase/migrations/` directory with `.gitkeep`.
- **Branch:** story/STORY-004-local-supabase-config

## User story
As Sev, I want a Supabase project definition that runs entirely on my PC with `supabase start`, so that schema, RLS and import work can be built and tested without touching any remote project.

## Scope (one PR, target < 150 lines; parts A to D above)
`supabase/config.toml` (project id `gym-tracker`), empty `supabase/migrations/` and `supabase/tests/` directories (with `.gitkeep`), `supabase/seed.sql` empty, README snippet in `docs/` is not needed (commands live in CLAUDE.md). Auth config for local only: email sign-in enabled, signups enabled locally, Apple/Google disabled. No remote link: `supabase link`, `db push` and `functions deploy` are denied to agents.

## Acceptance criteria
1. Given Docker Desktop with WSL integration, when `supabase start` runs in the repo, then the local stack starts and `supabase status` shows the API and DB URLs (local only; no keys pasted into the PR).
2. Given the stack is running, when `supabase db reset` runs, then it completes with zero migrations and no error.
3. Given `supabase test db` and the placeholder `supabase/tests/00-smoke.test.sql` (checks `select 1`; pgTAP needs at least one test), when run, then it exits 0.
4. Given CI `.github/workflows/ci.yml` runs the RLS step only if `supabase/config.toml` exists, when this PR lands, then the `ci` check runs `supabase start` and `supabase test db` successfully (this activates that step; no workflow edit in this story).
5. Given the repo is PUBLIC, when the diff is inspected, then `config.toml` contains no project ref, keys, JWT secrets, SMTP credentials, OAuth client secrets or personal addresses (env-substitution placeholders only), and `supabase/.temp/` and `supabase/.env*` are gitignored (Part B).
6. Error state: Given `supabase/config.toml` exists, when `npm run verify` runs and the RLS tests cannot run (Docker not running, `supabase` CLI missing, stack fails to start), then `verify:rls` exits non-zero with a message naming the cause, locally and in CI; no environment variable turns this into a warning (ADR-0001 D6, CLAUDE.md rule 5). The only permitted skip is while `config.toml` is absent, printed explicitly (STORY-001 criterion 3).
7. Offline: after images are pulled, `supabase start` works without internet.

## Technical notes (architect)
- Needs ADR: no. (ADR is only needed if Postgres major version or auth settings deviate from CLAUDE.md: Postgres 15+.)
- Ownership: per ADR-0001 D9, `supabase/config.toml` and `supabase/seed.sql` are backend-dev's; the parts above follow the CLAUDE.md repo map for the other paths.
- The remote project region (Sydney, ap-southeast-2) is Sev's step (dev-plan Appendix A item A3); see STORY-017. Agents never touch remote.
- Data/contract changes: none.

## Dependencies
- Depends on: STORY-001 (for the `verify:rls` script, criterion 6).

## Design (ux-designer)
- Spec: docs/design/STORY-004.md

## Test evidence (qa-engineer)
| Criterion | Test | Result |
|---|---|---|

## Review and compliance
- Code review: VERDICT …
- Compliance: COMPLIANCE … (if labelled)

## Done
- PR: #…  · Merged: …  · Accepted by product-owner: …
