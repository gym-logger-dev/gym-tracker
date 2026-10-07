# STORY-014: Notion importer: Sets text parser (`45x10, 9, 8`)

- **Status:** Draft (blocked until ADR on importer location, and until Sev supplies sample Sets strings or approves the grammar below)
- **Phase / workstream / obligations:** P1 · W1 · R3
- **Labels:** data, migration
- **Owner (build):** backend-dev
- **Branch:** story/STORY-014-importer-sets-parser

## User story
As Sev, I want the Notion `Sets` text turned into one record per set, so that my 811 entries become structured data without losing a single set.

## Scope (one PR, target < 250 lines excluding tests)
A pure, side-effect-free function `parseSets(text): { sets: {order, weightKg, reps}[], warnings[] }` in the importer package. No file or database access. Developed against synthetic fixtures only. The grammar below is inferred from the dev-plan example (`45x10, 9, 8` means 45 kg for 10 reps, then 9 reps and 8 reps at the carried-forward weight); everything else is a warning, never a guess.

## Acceptance criteria
1. Given `"45x10, 9, 8"`, when parsed, then three sets: (45 kg, 10), (45 kg, 9), (45 kg, 8) with order 1, 2, 3.
2. Given `"45x10, 50x8, 9"`, when parsed, then (45,10), (50,8), (50,9): the weight carries forward until changed.
3. Given decimals and spacing variants (`"22.5x8,8"`, `"22.5 x 8 , 8"`, `"1.25x12"`), when parsed, then weights and reps are read exactly with no floating-point drift (1.25 stays 1.25).
4. Given an empty or whitespace-only string, when parsed, then zero sets and no error (valid "no sets" entry, flagged in the report by STORY-016).
5. Given a token that does not match the grammar (e.g. `"45x10, abc, 8"`), when parsed, then parsing does not drop the rest silently: it returns the sets it could read AND a warning with the token position, and the caller treats the entry as "needs review".
6. Given a leading reps-only token (`"10, 9"` with no weight), when parsed, then a warning "no weight" is returned and sets carry `weightKg = null` (bodyweight/unknown) rather than 0.
7. Given any input, when parsed and then re-serialised for display, then no set is lost: `sets.length` equals the number of recognised tokens (property-style test over 50 generated strings).
8. Given unit tests, when run, then every case above passes; the PR lists the grammar so Sev can confirm or correct it.
9. Error: non-string input throws a typed error (no crash on `null`/`undefined`).
10. Offline: pure function, no network. Fixtures are synthetic (repo is PUBLIC): no real exercise logs.

## Technical notes (architect)
- Needs ADR: yes. Importer location and language (suggested: a TypeScript package under `packages/` or a `tools/` script run with Node; not in the current repository map), and where the grammar lives.
- Data/contract changes: none.
- Real-data formats beyond the example (units in lb, "BW", drop sets, "x" vs "×", ranges) are unknown until OI-003 is delivered; extend the parser only via new stories.

## Dependencies
- Depends on: STORY-001, STORY-005.

## Design (ux-designer)
- Spec: docs/design/STORY-014.md

## Test evidence (qa-engineer)
| Criterion | Test | Result |
|---|---|---|

## Review and compliance
- Code review: VERDICT …
- Compliance: COMPLIANCE … (if labelled)

## Done
- PR: #…  · Merged: …  · Accepted by product-owner: …
