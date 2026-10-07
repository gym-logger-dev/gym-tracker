# STORY-012: Local encrypted database (expo-sqlite + SQLCipher)

- **Status:** Draft (blocked until ADR on SQLCipher setup and dev-build approach)
- **Phase / workstream / obligations:** P1 · W1 · R6 (data minimisation), Security control "Data at rest" (on-device encryption)
- **Labels:** data
- **Owner (build):** mobile-dev
- **Branch:** story/STORY-012-local-encrypted-db

## User story
As Sev, I want the phone's local database encrypted with a key kept in the device keystore, so that my training history stays private if the phone is lost.

## Scope (one PR, target < 250 lines)
Open an encrypted `expo-sqlite` database with SQLCipher enabled, generate a random key on first launch, store it in Keychain/Keystore (`expo-secure-store`), provide a `getDb()` singleton and a small versioned migration runner (empty migration list). No tables beyond a `schema_version` row (tables arrive in STORY-013).

## Acceptance criteria
1. Given first launch, when the DB is opened, then a 256-bit random key is created and stored in secure storage, and the DB file is created.
2. Given the DB file on disk, when opened with a standard (non-SQLCipher) SQLite reader without the key (shown once from an emulator/dev build in the PR evidence), then it fails with "file is not a database" (the file is not readable plaintext).
3. Given a restart, when the app reopens the DB, then it unlocks with the stored key and the `schema_version` persists.
4. Offline: Given airplane mode, when the DB opens, then it works (no network dependency).
5. Error: Given the key is missing from secure storage but the DB file exists (e.g. keystore wiped), when the app starts, then it does NOT silently create a new empty DB over the old file: it shows a recovery screen ("Local data can't be unlocked. Sign in to restore from your account.") and keeps the old file until the user confirms; until sync (P2) the message says local-only data may be lost. Tested with a mocked secure-store.
6. Error: Given the migration runner fails midway, when the app restarts, then the DB is not left half-migrated (migrations run in a transaction; tested).
7. Given a unit test, when the key is generated, then it comes from a CSPRNG (`expo-crypto`) and is never logged; a test spies on `console` during open.
8. Empty state: a fresh DB with no tables reports `schema_version` 0 and the app still launches.
9. Given the build, when run in plain Expo Go, then the story documents that SQLCipher is NOT available there; verification uses a development build (see notes). CI unit tests use a mocked driver.

## Technical notes (architect)
- Needs ADR: yes. SQLCipher enablement in Expo (config plugin option), development build vs Expo Go (EAS builds cost the free monthly allowance of 15 per platform; prefer local `npx expo run:android` on Sev's PC where possible), key storage and rotation, migration-runner design, dependency list.
- Data/contract changes: none server-side.

## Dependencies
- Depends on: STORY-002.

## Design (ux-designer)
- Spec: docs/design/STORY-012.md

## Test evidence (qa-engineer)
| Criterion | Test | Result |
|---|---|---|

## Review and compliance
- Code review: VERDICT …
- Compliance: COMPLIANCE … (if labelled)

## Done
- PR: #…  · Merged: …  · Accepted by product-owner: …
