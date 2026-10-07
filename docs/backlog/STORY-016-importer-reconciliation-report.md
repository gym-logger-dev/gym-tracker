# STORY-016: Notion importer: row-for-row reconciliation report (811 in, 811 out)

- **Status:** Draft (blocked until STORY-015; real 811/811 run blocked on OI-003)
- **Phase / workstream / obligations:** P1 · W1 · R3, R6
- **Labels:** data, migration
- **Owner (build):** backend-dev (test cases by qa-engineer)
- **Branch:** story/STORY-016-importer-reconciliation-report

## User story
As Sev, I want a report proving every one of my 811 Notion entries is in the new database with the same sets, so that I can trust the migration before retiring Notion.

## Scope (one PR, target < 300 lines excluding tests)
`npm run import:reconcile -- --dir <path>` compares the source CSV with the database after import and writes `data/import/reports/reconciliation-<timestamp>.json` and `.md` (gitignored). Checks: entry counts, per-entry set counts, per-set weight and reps, exercise count (expect 46 on real data), variant and gym coverage, warnings and `needs_review` entries. Only an aggregate summary with counts (no names, weights, dates) may be pasted into PRs or the gate report.

## Acceptance criteria
1. Given the synthetic fixtures imported by STORY-015, when reconcile runs, then it reports `entries_in = entries_out`, `sets_in = sets_out`, zero mismatches, exit code 0.
2. Given a fixture where one set row is deleted from the DB, when reconcile runs, then it exits non-zero and names the entry row number and the missing set position.
3. Given a fixture where a weight or reps value is altered in the DB, when reconcile runs, then it exits non-zero and reports the entry row number, the field, and both values (in the local gitignored report only).
4. Given a duplicate entry in the DB, when reconcile runs, then it reports it as an extra and fails.
5. Given an entry with a parser warning, when reconcile runs, then it is counted as "in, reviewed" only if flagged `needs_review`; an unflagged lossy entry fails the run. Final gate requires zero unresolved `needs_review` or Sev's explicit acceptance of each.
6. Given the real CSV in `data/import/` (OI-003) and a local import, when reconcile runs on Sev's PC, then the summary reads 811 entries in, 811 out, 46 exercises, zero mismatches. This criterion is evidenced by Sev or the lead running it locally; the PR contains only the aggregate numbers.
7. Given the source CSV is missing or unreadable, when run, then it exits non-zero with a clear message and no partial report.
8. Offline: no network. No reconciliation data is uploaded, committed or logged to CI (reports live only under gitignored `data/import/reports/`; a test asserts the path is gitignored).
9. Empty: an empty source and empty DB produce `0 in, 0 out` with exit 0.
10. Given the report, when reviewed, then each entry in the report retains its source line reference (CSV row number plus raw `Sets` text, local report only).

## Technical notes (architect)
- Needs ADR: no (follows ADR-0002 and the importer ADR from STORY-014/015).
- Data/contract changes: none.
- Needs Sev: CSV export (OI-003). Default while waiting: fixture evidence only; the P1 gate cannot pass without the real run.

## Dependencies
- Depends on: STORY-015.

## Design (ux-designer)
- Spec: docs/design/STORY-016.md

## Test evidence (qa-engineer)
| Criterion | Test | Result |
|---|---|---|

## Review and compliance
- Code review: VERDICT …
- Compliance: COMPLIANCE … (if labelled)

## Done
- PR: #…  · Merged: …  · Accepted by product-owner: …
