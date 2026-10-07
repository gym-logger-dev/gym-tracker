# STORY-013: Drizzle local schema mirroring the server model

- **Status:** Draft (ADR-0002 approved; still blocked on STORY-012 and ADR-0003 for SQLCipher, key storage and UUID library)
- **Phase / workstream / obligations:** P1 · W1 · R3
- **Labels:** data
- **Owner (build):** mobile-dev (`src/db/schema.ts` authored by architect)
- **Branch:** story/STORY-013-drizzle-local-schema

## User story
As Sev, I want the phone's local tables to match the server model, so that Quick Log can read and write sets offline now and sync can be added in P2 without reshaping data.

## Scope (one PR, target < 300 lines excluding generated SQL)
Drizzle schema in `src/db/schema.ts` for exercise, variant, gym, session, set (`import_entry` is server-only and is NOT on the device, ADR-0002 D9); generated local migration; typed repository helpers (create/read/list); a dev-only seeding function that loads a normalised JSON fixture bundle into local SQLite (for tests and demos). Not in scope: outbox, sync, plans, consent (P2/P4).

## Acceptance criteria
1. Given the schema, when compared with `packages/contracts` types by a unit test, then field names, nullability and UUID primary keys match for every table in scope.
2. Given a fresh install, when the app starts, then local migrations run once, create the tables, and bump `schema_version`; a second start runs nothing.
3. Given repository helpers, when a set row is inserted with a client-generated UUID, then it can be read back with kg values to 2 decimals exactly (1.25 stays 1.25; unit test with 1.25, 2.5, 100).
4. Given the dev seeding function and the synthetic fixture bundle, when called, then rows load in one transaction; calling it twice yields no duplicates (idempotent via the same deterministic IDs).
5. Given the seeding function is called in a production build, when invoked, then it is disabled (`__DEV__` guard tested) so fixtures cannot reach a real install.
6. Error: Given invalid data (weight < 0), when inserted, then a validation error is thrown and nothing is written.
7. Empty: Given no data, when list helpers run, then they return empty arrays.
8. Offline: all operations are local; a test asserts no network calls.
9. No real names or personal data in fixtures (repo is PUBLIC): synthetic exercise names only (e.g. "Example Bench Press").
10. User scoping (ADR-0002 D14): `user_id` is NOT NULL on every local table. Given no signed-in user, when a repository write is attempted, then it throws a typed error and nothing is written (the user signs in before first use; no anonymous local mode). Given a signed-in user, when a row is written, then it stores that user's id, and a unit test asserts the column is NOT NULL in the generated SQL.

## Technical notes (architect)
- ADR-0002 (approved) fixes the model and the contracts/schema consistency check (D14). Needs ADR: yes, a dependency ADR (ADR-0003 for SQLCipher/key storage/UUID library, per ADR-0001 D7) covering `drizzle-orm` / `drizzle-kit`.
- Data/contract changes: new local tables only.
- Gap to raise: how imported history reaches the phone before P2 sync exists (see report, Open questions).

## Dependencies
- Depends on: STORY-005, STORY-012.

## Design (ux-designer)
- Spec: docs/design/STORY-013.md

## Test evidence (qa-engineer)
| Criterion | Test | Result |
|---|---|---|

## Review and compliance
- Code review: VERDICT …
- Compliance: COMPLIANCE … (if labelled)

## Done
- PR: #…  · Merged: …  · Accepted by product-owner: …
