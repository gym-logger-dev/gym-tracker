# STORY-005: Data model ADR and shared contract types

- **Status:** Ready
- **Phase / workstream / obligations:** P1 · W1 · R2 (body_scan and consent semantics decided here, built P4), R3 (export-friendly structure)
- **Labels:** data
- **Owner (build):** backend-dev (content authored by architect: `docs/adr/`, `packages/contracts/`)
- **Branch:** story/STORY-005-data-model-adr-contracts

## User story
As Sev, I want the data model decisions written down once (ADR) and mirrored as shared TypeScript types, so that the Postgres schema, the local SQLite schema and the importer agree on every field.

## Scope (one PR, target < 300 lines; docs plus types only, no SQL)
ADR-0002 "Core data model and ID/sync conventions" and `packages/contracts/` types for: exercise, variant, gym, session, set, plan, plan_day, consent. `body_scan` is documented as deferred to P4 (field list only, no table) unless the architect rules otherwise.

## Decisions the ADR must make (named for the architect)
- Primary keys: client-generated UUIDs on every table (dev-plan: sync keyed by client UUIDs); deterministic UUIDs (v5) for imported rows so re-import is idempotent.
- `user_id` on every row; `created_at`, `updated_at` (UTC), `deleted_at` (tombstone) for last-write-wins sync (P2).
- Weight in kg as `numeric(6,3)` (supports 1.25 steps) vs integer grams; reps integer; RPE optional numeric.
- Is `variant` a child of `exercise` or a global tag (Notion has "Variant" and "Gym" tags)? Is `gym` a flat user-owned list (real gym names are user data; they must not be hard-coded in schema, seeds or fixtures, repo is public)?
- Historical entries have no sessions or timestamps beyond date: how are they represented? Recommended default: one synthetic `session` per (date, gym) with `source = 'notion_import'`, `started_at` = date at 00:00 Australia/Adelaide stored as UTC, and a nullable `set.completed_at`.
- Provenance: where each entry's source line is kept (recommended default: `import_entry` table or `source_ref` column holding the Notion row id plus raw `Sets` text; never overwritten).
- Quick Log in P1 writes sets before the P2 session UI exists: implicit session rule (see STORY-021).
- Consent: `type`, `granted_at`, `withdrawn_at`; no health values in any log (R2 groundwork).

## Acceptance criteria
1. Given `docs/adr/0002-*.md`, when reviewed, then each decision above has a chosen option, alternatives considered, and consequences, using `docs/adr/0000-template.md`.
2. Given `packages/contracts`, when `npm run typecheck` runs, then types exist for all eight entities with `user_id`, id, timestamps, and nullable/optional fields exactly as in the ADR.
3. Given a unit test, when it runs, then it validates sample objects (including a set row derived from `45x10, 9, 8`) against runtime schemas if the ADR chooses runtime validation; otherwise a type-level test compiles.
4. Given the ADR, when read by qa-engineer, then every field names its nullability and unit (kg, UTC), so acceptance tests for STORY-006 to STORY-008 can be written without asking questions.
5. Error/empty state: the ADR states how missing fields in historical data are represented (no reps, no variant, no gym) and that nothing is dropped silently.
6. Offline: the ADR states which fields are client-assigned so rows can be created offline without server round-trips.
7. R7: no entity name or field implies clinical use (no "diagnosis", "condition", "injury" fields).
8. Repo is PUBLIC: examples in the ADR use synthetic names and values only.

## Technical notes (architect)
- Needs ADR: yes, this story is the ADR (ADR-0002).
- Data/contract changes: new `packages/contracts/` types; no migrations.

## Dependencies
- Depends on: STORY-001 (typecheck script). ADR text itself can start immediately.

## Design (ux-designer)
- Spec: docs/design/STORY-005.md

## Test evidence (qa-engineer)
| Criterion | Test | Result |
|---|---|---|

## Review and compliance
- Code review: VERDICT …
- Compliance: COMPLIANCE … (if labelled)

## Done
- PR: #…  · Merged: …  · Accepted by product-owner: …
