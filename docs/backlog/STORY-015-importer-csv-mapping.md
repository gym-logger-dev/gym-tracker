# STORY-015: Notion importer: CSV to database mapping (idempotent, source line kept)

- **Status:** Draft (ADR-0002 approved; still blocked on STORY-007, STORY-014 and the importer ADR; real run also blocked on OI-003)
- **Phase / workstream / obligations:** P1 · W1 · R3, R6 (no personal data leaves Sev's PC)
- **Labels:** data, migration
- **Owner (build):** backend-dev nominally; location and ownership of importer code per ADR-0004; `package.json` edits via mobile-dev
- **Branch:** story/STORY-015-importer-csv-mapping

## User story
As Sev, I want my exported Notion Exercises and Workout Log CSVs loaded into my local database as exercises, variants, gyms, sessions and sets, so that my 811 entries become real data I can re-run safely.

## Scope (one PR, target < 400 lines excluding tests)
Importer location, language and ownership are decided in ADR-0004 (`packages/importer` is not in the CLAUDE.md repo map). The `import:*` scripts live in the root `package.json`, which mobile-dev owns (ADR-0001 D9): until ADR-0004 is accepted, any `package.json` edit goes through mobile-dev via the lead. CLI (`npm run import:notion -- --dir <path> [--dry-run]`) that reads two CSVs, maps rows to the ADR-0002 model using `parseSets` (STORY-014), and writes to the LOCAL Supabase DB only (or to a gitignored output bundle, per ADR). Until `data/import/` exists, development and CI use SYNTHETIC fixture CSVs in the fixtures path set by ADR-0004 (not `tests/` unless qa-engineer owns them; generated, with fake exercise/gym names and an obviously fake Notion row id format). Real personal data is never committed: `data/import/` is gitignored (verified in STORY-001) and must not be referenced by tests.

## Acceptance criteria
1. Given the synthetic fixtures (e.g. 12 entries, 3 exercises, 2 gyms, 2 variants), when `--dry-run` runs, then nothing is written and the output states counts of entries, sessions and sets that would be created.
2. Given the fixtures, when the import runs against the local stack, then every exercise, variant and gym appears once (no duplicates by case-insensitive name) and every entry becomes exactly one `import_entry` row; every set parsed from an entry becomes a `set` row under the synthetic session for its (date, gym) as decided in ADR-0002 D7. Entries that parse to zero sets (AC5, AC5a) have an `import_entry` row and no `set` rows.
3. Given each imported entry, when its `import_entry` row is read, then it holds the original CSV row identifier (`source_row_id`: the Notion page id if the export has one, else `row-<n>`, ADR-0002 D9) and the raw `Sets` text unchanged (source line kept for every entry).
4. Given the import is run twice, when the second run completes, then row counts are identical (deterministic UUIDv5 from source row id and set order; no duplicates).
5. Given a row with an unknown exercise name, or a `Sets` warning from the parser, when imported, then the row is NOT dropped: it is imported as far as parseable, flagged `needs_review` with the matching reason codes (ADR-0002 D9) in its `import_entry` row, and listed in the report (STORY-016).
5a. Given a row with a missing date, when imported, then an `import_entry` row is written (raw text kept, `needs_review = true`, reason `missing_date`, `session_id` null, `parsed_set_count` 0) and zero sessions and zero sets are created for it; no placeholder date is invented. A blank exercise name likewise creates an `import_entry` with `missing_exercise` and zero sets. The "811 in, 811 out" count is of `import_entry` rows.
6. Given a malformed CSV (missing required column, bad encoding), when run, then the CLI exits non-zero before writing anything, naming the missing column.
7. Given the importer target configuration, when it is not the local stack (any non-localhost DB URL), then it refuses to run unless `--i-know-this-is-not-local` is passed AND an environment flag set by Sev; agents never set it. Production import is STORY-017 (Sev only).
8. Given the whole import, when it fails midway, then the transaction rolls back (all or nothing).
9. Given the dates in CSV (`d MMM yyyy` or ISO per real export), when converted, then they are stored as UTC for the Australia/Adelaide local date (DST-boundary test dates included).
10. Empty: an empty CSV produces a report with zero in, zero out and exit 0 with a warning.
11. Logging: no row contents (exercise names, weights) are printed beyond counts and row numbers.
12. Offline: runs with no internet access.
13. RLS: the importer writes rows with the target `user_id` supplied by flag (a local test user), and a pgTAP/integration test confirms another user cannot read them.

## Technical notes (architect)
- Needs ADR: yes. Importer location/language, how it authenticates to local DB (local service role against localhost only vs SQL file output applied with `psql`), deterministic ID namespace, `needs_review` representation. Local keys are never printed or committed.
- Data/contract changes: none beyond STORY-006 to STORY-008 (provenance table must exist).
- Needs Sev: supply the CSV export (OI-003) into gitignored `data/import/`. Default while waiting: fixtures only; real reconciliation (STORY-016 criterion 6) waits.

## Dependencies
- Depends on: STORY-007, STORY-008, STORY-009, STORY-014, ADR-0004 (importer location, ownership, fixtures path, local authentication).

## Design (ux-designer)
- Spec: docs/design/STORY-015.md

## Test evidence (qa-engineer)
| Criterion | Test | Result |
|---|---|---|

## Review and compliance
- Code review: VERDICT …
- Compliance: COMPLIANCE … (if labelled)

## Done
- PR: #…  · Merged: …  · Accepted by product-owner: …
