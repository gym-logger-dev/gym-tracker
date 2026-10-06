---
name: migrate-notion
description: Import Sev's Notion Gym Tracker history (46 exercises, 811 entries) into the app database with a row-by-row reconciliation report. P1 only.
disable-model-invocation: true
---

1. Check `data/import/` for Sev's Notion CSV exports (Exercises and Workout Log). If missing, raise a blocking open item asking Sev to export both databases as CSV into `data/import/` (exact Notion steps in the detail). `data/import/` is gitignored — never commit it.
2. **architect:** mapping spec in `docs/adr/` — Notion fields → `exercise`, `variant`, `gym`, `session`, `set`. Rules: the Sets text (e.g. `45×10, 45×9`) becomes one `set` row per set; `?` stays NULL; historical rows without dates keep `#` ordering via a `legacy_seq` column and no fabricated dates; `Original entry` and `Source line` are preserved for audit.
3. **backend-dev:** idempotent import script `scripts/import-notion.ts` that loads into the local stack.
4. **qa-engineer:** reconciliation report `docs/status/migration-report.md`: 811 in, 811 out; per-exercise counts; sum of reps and volume per exercise vs Notion formulas; list every row that needed interpretation.
5. Production import is Sev's step after the P1 gate.
