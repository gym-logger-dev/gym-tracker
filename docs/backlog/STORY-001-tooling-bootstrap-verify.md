# STORY-001: Repo and tooling bootstrap (`npm run verify`)

- **Status:** Ready (ADR-0001 approved by Sev 2026-10-07; OI-015 resolved, mobile-dev owns the four config files). Part B below needs devops-release (see Scope).
- **Phase / workstream / obligations:** P1 · W1 (enabler) · R6 (no analytics/identifier SDKs), R7 (applies to all P1 UI copy; see STORY-002)
- **Labels:** none of ui/data/auth/health/integration/migration (tooling only)
- **Owner (build):** mobile-dev (Part A); devops-release (Part B)
- **Branch:** story/STORY-001-tooling-bootstrap-verify (Part A); devops-release sub-PR branch for Part B, named by the lead

## User story
As Sev, I want a `package.json` with lint, typecheck, unit-test and verify scripts, so that CI stops skipping `npm run verify` and every later story has a real gate.

## Scope
Per ADR-0001 D2, D3, D6, D9. Two parts because file ownership differs. The lead sequences Part B (mobile-dev asks the lead; mobile-dev never edits Part B files).

**Part A, mobile-dev (one PR, target < 250 lines excluding lockfile):**
- `package.json`: scripts, `workspaces: ["packages/*"]`, devDependencies at the ADR-0001 D3 pins; `package-lock.json` generated.
- `tsconfig.json` (strict, extends `expo/tsconfig.base`, alias `@/*` to `src/*`), `eslint.config.js`, `jest.config.js`, `.prettierrc`, `.prettierignore` (all owned by mobile-dev since OI-015).
- Pins: TypeScript `~6.0.3`; ESLint `~9.39.5` flat config (`eslint-config-expo/flat`, `typescript-eslint ~8.71`); Prettier `~3.9.9`; Jest `~29.7.0` with `ts-jest ~29.4.14` and `@types/jest ~29.5.14`. Jest `node` project only (the `app` project arrives in STORY-002). Exactly one trivial passing test.
- Scripts: `lint` (ESLint then `prettier --check`), `typecheck` (`tsc --noEmit`), `test`, `verify:rls`, `verify` (lint, typecheck, test, verify:rls, stopping at first failure). `verify:rls` prints an explicit skip line while `supabase/config.toml` is absent and runs `supabase test db` once it exists (a missing `supabase` CLI with the file present is a failure).
- No Expo, no app code (STORY-002).

**Part B, devops-release (small separate PR):** `.nvmrc` containing `24`; `package.json` `engines.node` set to `>=24 <25` (devops-release edits limited to `engines`); `.gitignore` additions (criterion 4).

## Acceptance criteria
1. Given a clean clone on Node 24, when `npm ci` then `npm run lint`, `npm run typecheck`, `npm run test` run, then each exits 0 and the Jest run reports at least one passing test.
2. Given a clean clone, when `npm run verify` runs, then it executes lint, typecheck, unit tests and `verify:rls` in that order and exits non-zero if any fails. When a deliberately broken lint rule or type error is introduced, then `verify` fails (shown once in the PR, not committed).
3. Given `supabase/config.toml` does not exist, when `npm run verify` runs, then it prints a line stating that the RLS step was skipped and why (STORY-004 not merged), and exits 0 if the other steps pass. Given the file exists and the `supabase` CLI is missing, then `verify:rls` fails (never a skip). Once the file exists (STORY-004) the step runs `supabase test db`. (CI currently uses `npm run verify --if-present`; removing `--if-present` is STORY-023.)
4. Part B. Given the repo is PUBLIC, when `.gitignore` is inspected, then it ignores `.env*`, `data/import/`, `.claude/settings.local.json`, `*.key`, `*.pem`, `node_modules/`, SQLite/dump files, and a unit test fails if `git check-ignore data/import/example.csv` returns not-ignored.
5. Given CI runs on the PR, when `ci` completes, then `verify` ran (not skipped) and passed.
6. Part B. Given `.nvmrc` is `24` and `engines.node` is `>=24 <25`, when `npm ci` runs on another major Node version, then npm warns with the expected range (`.nvmrc` is read by CI; the warning is shown once in the PR).
7. Given Node 24, when `npx expo-doctor` is run, then its output is attached to the PR and any failure is reported as an open item (ADR-0001 leaves Expo's minimum Node unverified; Expo packages themselves arrive in STORY-002, so if doctor cannot run before then, the evidence moves to STORY-002).
8. Offline: `npm run verify` needs no network after `npm ci` (no calls to external services).
9. No analytics, crash-reporting or ad SDK is added (R6). Dependencies are limited to the ADR-0001 D3 and D7 lists.
10. Given the four config files (`eslint.config.js`, `jest.config.js`, `.prettierrc`, `.prettierignore`), when the PR is inspected, then they are authored by mobile-dev and `.gitignore`, `.nvmrc` and `engines` are not touched by the Part A PR.

## Technical notes (architect)
- ADR-0001 (approved 2026-10-07) fixes versions, scripts and ownership (D9). No further ADR needed.
- Data/contract changes: none.

## Dependencies
- Depends on: STORY-000 (identity verified before first code PR).
- Part B can merge independently; criteria 4 and 6 close only when it has merged.

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
