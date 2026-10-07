# STORY-005: Shared contract types (zod) per ADR-0002, and ADR status headers

- **Status:** Ready (contracts-only; ADR-0002 already exists and is approved)
- **Phase / workstream / obligations:** P1 · W1 · R2 (consent semantics; body_scan documented only, built P4), R3 (export-friendly structure), R7 (neutral field names)
- **Labels:** data
- **Owner (build):** architect for `packages/contracts/*` and `docs/adr/*` (owned paths); backend-dev supports
- **Branch:** story/STORY-005-data-model-adr-contracts

## User story
As Sev, I want the approved data model mirrored as shared zod schemas and TypeScript types, so that the Postgres schema, the local SQLite schema and the importer agree on every field.

## Scope (one PR, target < 300 lines excluding tests; types and docs only, no SQL)
- `packages/contracts/` (npm workspace `@gym-tracker/contracts`, ADR-0001 D5): zod schemas and inferred types per ADR-0002 D15 for exercise, variant, gym, session, set, plan, plan_day, consent and `import_entry`, plus constants: UUIDv5 namespace `20448473-4ce0-4b10-a84a-4ab62677ea3a`, `import_entry` reason codes, source and consent enums, name-normalisation rules (D1). `body_scan` is not implemented (D12).
- Status headers of `docs/adr/0001-toolchain-dependencies-layout.md` and `docs/adr/0002-core-data-model-and-id-conventions.md` change from Proposed to Accepted, citing OI-016 (Sev, 2026-10-07).
- The architect confirms the importer ADR number (ADR-0004, per `docs/backlog/README.md`) and references it where the importer is mentioned.
- No ADR needed (ADR-0002 exists). Choosing the zod version by `npm view` and the runtime-dependency note follow ADR-0001 D3 and D7 and are recorded in the PR.

## Acceptance criteria
1. Given `packages/contracts`, when `npm run typecheck` runs, then types exist for all nine entities with `id`, `user_id`, `created_at`, `updated_at`, `deleted_at` (not on `consent` or `import_entry`), and nullability and units exactly as in ADR-0002 D2 to D5, D9, D11.
2. Given a unit test, when it runs, then it validates sample objects against the zod schemas: accepting a set derived from `45x10, 9, 8` (weight 45, reps 10) and rejecting weight < 0, weight with more than 3 decimals, reps outside 0 to 1000, RPE outside 0 to 10 or with more than 1 decimal, `set_order` < 1, and a `session_date` that differs from the Adelaide date of `started_at`.
3. Given the UUIDv5 helpers or constants, when tested with synthetic inputs, then the namespace constant equals the ADR value, name normalisation follows D1 (lowercase hyphenated user id, `YYYY-MM-DD`, absent gym is `none`, NFC, trim, collapse whitespace, lowercase) and the same inputs always give the same id; different `user_id` values give different ids. (If UUID generation needs a library, that choice is deferred to ADR-0003 and the test covers the name-building function only.)
4. Given the reason-code constant, when read, then it holds exactly `missing_date`, `missing_exercise`, `unknown_exercise`, `empty_sets`, `unparsed_token`, `no_weight`, `duplicate_source_row`.
5. Given the schemas, when `import_entry` is validated, then `raw_sets` accepts null (cell absent) and empty string (present and empty) as distinct values, and `needs_review` defaults to false with empty `review_reasons`.
6. Given `consent`, when validated, then `type` accepts only `health_data`, `strava`, `ai_sharing` and `withdrawn_at` earlier than `granted_at` is rejected.
7. Given the app and the importer, when they import `@gym-tracker/contracts` by package name (never by relative path), then resolution works under Jest (ties to STORY-002 AC4).
8. Given the two ADR files, when inspected, then both show Status Accepted with the OI-016 reference and no other text of the ADRs changed.
9. R7: no entity or field name implies clinical use (no diagnosis, condition or injury). Repo is PUBLIC: all fixtures and examples are synthetic.
10. Offline and empty states: schemas are pure (no network, no I/O); optional fields are omitted-or-null as ADR-0002 states, so a historical entry with no variant, no gym or no completion time validates, and nothing is dropped silently.

## Technical notes (architect)
- Needs ADR: no. ADR-0002 D1 to D15 are the source; ADR-0001 D3 and D7 govern the zod dependency.
- Data/contract changes: new `packages/contracts/` only; no migrations.

## Dependencies
- Depends on: STORY-001 (jest, typecheck and lint scripts).
- Unblocks: STORY-006 to 008 (field lists), STORY-013 (schema/contracts consistency test), STORY-014, 015.

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
