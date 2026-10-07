# STORY-004: Local Supabase project config

- **Status:** Ready
- **Phase / workstream / obligations:** P1 · W1 (backend foundation) · R4 (data location: Sydney for the remote project, see notes)
- **Labels:** data
- **Owner (build):** backend-dev
- **Branch:** story/STORY-004-local-supabase-config

## User story
As Sev, I want a Supabase project definition that runs entirely on my PC with `supabase start`, so that schema, RLS and import work can be built and tested without touching any remote project.

## Scope (one PR, target < 150 lines)
`supabase/config.toml` (project id `gym-tracker`), empty `supabase/migrations/` and `supabase/tests/` directories (with `.gitkeep`), `supabase/seed.sql` empty, README snippet in `docs/` is not needed (commands live in CLAUDE.md). Auth config for local only: email sign-in enabled, signups enabled locally, Apple/Google disabled. No remote link: `supabase link`, `db push` and `functions deploy` are denied to agents.

## Acceptance criteria
1. Given Docker Desktop with WSL integration, when `supabase start` runs in the repo, then the local stack starts and `supabase status` shows the API and DB URLs (local only; no keys pasted into the PR).
2. Given the stack is running, when `supabase db reset` runs, then it completes with zero migrations and no error.
3. Given `supabase test db` and no tests yet, when run, then it exits 0 (or the PR documents that pgTAP needs at least one test and adds a trivial placeholder `00-smoke.test.sql` that checks `select 1`).
4. Given CI `.github/workflows/ci.yml` runs the RLS step only if `supabase/config.toml` exists, when this PR lands, then the `ci` check runs `supabase start` and `supabase test db` successfully (this activates that step; no workflow edit in this story).
5. Given the repo is PUBLIC, when the diff is inspected, then `config.toml` contains no project ref, keys, JWT secrets, SMTP credentials, OAuth client secrets or personal addresses (env-substitution placeholders only), and `supabase/.temp/` and `supabase/.env*` are gitignored.
6. Error state: if Docker is not running, `npm run verify` prints "Supabase not available; RLS tests not run" and exits non-zero in CI but only warns locally unless `VERIFY_REQUIRE_RLS=1` (behaviour documented in the PR; wired with STORY-001's script).
7. Offline: after images are pulled, `supabase start` works without internet.

## Technical notes (architect)
- Needs ADR: no. (ADR is only needed if Postgres major version or auth settings deviate from CLAUDE.md: Postgres 15+.)
- The remote project region (Sydney, ap-southeast-2) is Sev's step (dev-plan Appendix A item A3); see STORY-017. Agents never touch remote.
- Ownership gap: `supabase/config.toml` is not listed in the repository map; confirm backend-dev (or architect) owns it.
- Data/contract changes: none.

## Dependencies
- Depends on: STORY-001 (for the verify script wiring in criterion 6).

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
