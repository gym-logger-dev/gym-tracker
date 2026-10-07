# STORY-001: Repo and tooling bootstrap (`npm run verify`)

- **Status:** Draft (blocked until ADR-0001 baseline toolchain exists)
- **Phase / workstream / obligations:** P1 · W1 (enabler) · R6 (no analytics/identifier SDKs), R7 (applies to all P1 UI copy; see STORY-002)
- **Labels:** none of ui/data/auth/health/integration/migration (tooling only)
- **Owner (build):** mobile-dev
- **Branch:** story/STORY-001-tooling-bootstrap-verify

## User story
As Sev, I want a `package.json` with lint, typecheck, unit-test and verify scripts, so that CI stops skipping `npm run verify` and every later story has a real gate.

## Scope (one PR, target < 250 lines excluding lockfile)
`package.json`, `tsconfig.json` (strict), ESLint config, Jest config with one trivial passing test, `.gitignore` additions, `.nvmrc` (Node current LTS). No Expo, no app code (that is STORY-002).

## Acceptance criteria
1. Given a clean clone, when `npm ci` then `npm run lint`, `npm run typecheck`, `npm run test` run, then each exits 0 and the Jest run reports at least one passing test.
2. Given a clean clone, when `npm run verify` runs, then it executes lint, typecheck and unit tests in that order and exits non-zero if any fails. When a deliberately broken lint rule or type error is introduced, then `verify` fails (shown once in the PR, not committed).
3. Given `supabase/config.toml` does not yet exist, when `npm run verify` runs, then it prints that the RLS step was skipped and why; once it exists (STORY-004) the RLS step runs `supabase test db`. The skip is explicit, never silent. (Note: the CI workflow `.github/workflows/ci.yml` currently uses `npm run verify --if-present`; once `package.json` exists, `verify` runs in CI. Removing `--if-present` is STORY-023.)
4. Given the repo is PUBLIC, when `.gitignore` is inspected, then it ignores `.env*`, `data/import/`, `.claude/settings.local.json`, `*.key`, `*.pem`, `node_modules/`, SQLite/dump files, and a unit test fails if `git check-ignore data/import/example.csv` returns not-ignored.
5. Given CI runs on the PR, when `ci` completes, then `verify` ran (not skipped) and passed.
6. Error state: if Node version is not the pinned LTS, `npm run verify` (via `engines` and `.nvmrc`) warns with the expected version.
7. Offline: `npm run verify` needs no network after `npm ci` (no calls to external services).
8. No analytics, crash-reporting or ad SDK is added (R6). Dependencies are limited to the ADR-0001 list.

## Technical notes (architect)
- Needs ADR: yes. ADR-0001 "Baseline toolchain and dependency list": ESLint/Prettier choice, Jest preset, exact versions policy. (New dependencies require an ADR per the guardrails; `npm install` is set to ask.)
- Ownership gap: root files (`package.json`, `tsconfig.json`) are not in the repository map; confirm mobile-dev may edit them (raised in report).
- Data/contract changes: none.

## Dependencies
- Depends on: STORY-000 (identity verified before first code PR).

## Design (ux-designer)
- Spec: docs/design/STORY-001.md

## Test evidence (qa-engineer)
| Criterion | Test | Result |
|---|---|---|

## Review and compliance
- Code review: VERDICT …
- Compliance: COMPLIANCE … (if labelled)

## Done
- PR: #…  · Merged: …  · Accepted by product-owner: …
