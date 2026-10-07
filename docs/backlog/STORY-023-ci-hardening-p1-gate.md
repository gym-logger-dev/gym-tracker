# STORY-023: CI hardening for the P1 gate

- **Status:** Draft (blocked until STORY-001, STORY-009 and STORY-016 exist; needs Sev approval label because it changes CI)
- **Phase / workstream / obligations:** P1 · W1 · R5 (K5 misconfigured RLS), R6, R7
- **Labels:** data, needs-sev (CI workflow change requires `sev-approved` applied by Sev)
- **Owner (build):** backend-dev writes the npm-side checks; devops-release owns `.github/` edits (workflow change delivered by devops-release)
- **Branch:** story/STORY-023-ci-hardening-p1-gate

## User story
As Sev, I want CI to fail whenever verify, the RLS deny suite or the importer's fixture reconciliation would fail, and whenever personal data or secrets are about to land in this public repo, so that the P1 gate is enforced by machines, not memory.

## Scope (one PR, target < 200 lines)
Edit `.github/workflows/ci.yml`: remove `--if-present` and the `hashFiles` skips now that `package.json` and `supabase/config.toml` exist; keep concurrency cancel and the 15-minute timeout; add a public-repo hygiene step; make fixture import plus reconcile run in CI against the local stack. No deployment, no secrets, no new third-party actions without ADR.

## Acceptance criteria
1. Given `ci.yml`, when inspected, then `npm run verify` runs unconditionally (no `--if-present`), and a PR that breaks lint, types, a unit test or a pgTAP test shows `ci` failing.
2. Given a PR that adds a table without RLS (shown once on a throwaway branch, not merged), when `ci` runs, then the STORY-009 meta-test fails the check.
3. Given the synthetic fixtures, when `ci` runs, then the importer imports them into the CI local stack and `import:reconcile` exits 0; a deliberately corrupted fixture on a throwaway branch makes it fail.
4. Given a hygiene step, when a PR adds any of: a path under `data/import/`, a `.env*` file, a file matching `*.csv` outside the synthetic fixtures path set by ADR-0004, a string matching `service_role` key patterns or JWT-like tokens, then `ci` fails and prints the file path only (never the matched content).
5. Given `ci` passes on a clean PR, when run, then total time is under 15 minutes (existing limit) and no steps are skipped silently (skips print a reason).
6. Given secret scanning and Dependabot (repo settings, set by Sev per OI-001), when the story is done, then the PR notes whether they are enabled; if not, it raises an item for Sev with exact steps (Settings, Code security). No settings are changed by agents.
7. Given the workflow change, when the PR is opened, then it is labelled `needs-sev`, `merge-gate` blocks until Sev applies `sev-approved` himself, and the lead does not merge before that.
8. Offline/error: not applicable to the app. A failed `supabase start` in CI fails the job with a clear log rather than skipping.
9. R7 wording is reviewed by security-compliance per PR and at the gate, not by regex; the CI hygiene step covers only secrets and personal-data paths.

## Technical notes (architect)
- Needs ADR: no (CI behaviour follows existing plan). Any new GitHub Action requires an ADR and Sev approval.
- Data/contract changes: none.

## Dependencies
- Depends on: STORY-001, STORY-004, STORY-009, STORY-016.

## Design (ux-designer)
- Spec: docs/design/STORY-023.md

## Test evidence (qa-engineer)
| Criterion | Test | Result |
|---|---|---|

## Review and compliance
- Code review: VERDICT …
- Compliance: COMPLIANCE … (if labelled)

## Done
- PR: #…  · Merged: …  · Accepted by product-owner: …
