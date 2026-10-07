# STORY-014: Notion importer: Sets text parser (`45x10, 9, 8`)

- **Status:** Draft (grammar per ADR-0002 D10 approved with ADR-0002 on 2026-10-07; still blocked on the importer-location ADR; real-format extensions wait for OI-003)
- **Phase / workstream / obligations:** P1 · W1 · R3
- **Labels:** data, migration
- **Owner (build):** backend-dev
- **Branch:** story/STORY-014-importer-sets-parser

## User story
As Sev, I want the Notion `Sets` text turned into one record per set, so that my 811 entries become structured data without losing a single set.

## Scope (one PR, target < 250 lines excluding tests)
A pure, side-effect-free function `parseSets(text): { sets: {order, weightKg, reps}[], warnings[] }` in the importer package. No file or database access. Developed against synthetic fixtures only. The grammar is ADR-0002 D10 (inferred from the dev-plan example: `45x10, 9, 8` means 45 kg for 10 reps, then 9 reps and 8 reps at the carried-forward weight); everything else is a warning, never a guess. An unknown token creates no set, raises `unparsed_token` and resets the carried weight to null.

## Acceptance criteria
1. Given `"45x10, 9, 8"`, when parsed, then three sets: (45 kg, 10), (45 kg, 9), (45 kg, 8) with order 1, 2, 3.
2. Given `"45x10, 50x8, 9"`, when parsed, then (45,10), (50,8), (50,9): the weight carries forward until changed.
3. Given decimals and spacing variants (`"22.5x8,8"`, `"22.5 x 8 , 8"`, `"1.25x12"`), when parsed, then weights and reps are read exactly with no floating-point drift (1.25 stays 1.25).
4. Given an empty or whitespace-only string, when parsed, then zero sets, no error and the reason `empty_sets` (valid "no sets" entry, flagged `needs_review` and listed in the report by STORY-016).
5. Given a token that does not match the grammar (e.g. `"45x10, abc, 8"`), when parsed, then the unknown token creates no set, a warning `unparsed_token` with the token position is returned, the carried weight resets to null, and the remaining readable tokens are still parsed: the result is (45, 10) and (null, 8) plus `unparsed_token` and `no_weight`, and the caller marks the entry `needs_review`. A weight is never carried across an unknown token. Also covers `45lb`, `BW`, `8-10` and `40x8x3` as unknown tokens.
6. Given a leading reps-only token (`"10, 9"` with no weight), when parsed, then a warning "no weight" is returned and sets carry `weightKg = null` (bodyweight/unknown) rather than 0.
7. Given any input, when parsed, then no token is lost: `sets.length` plus the count of `unparsed_token` warnings equals the number of tokens (property-style test over 50 generated strings).
8. Given unit tests, when run, then every case above passes; the PR links ADR-0002 D10 as the grammar of record.
9. Error: non-string input throws a typed error (no crash on `null`/`undefined`).
10. Offline: pure function, no network. Fixtures are synthetic (repo is PUBLIC): no real exercise logs.

## Technical notes (architect)
- Grammar: ADR-0002 D10 (approved). Needs ADR: yes, for importer location and language (ADR-0004 per the README; ADR-0002 calls it the importer ADR). Suggested: a TypeScript package under `packages/` (ADR-0001 D4 allows later packages such as `packages/importer`) or a `tools/` script run with Node.
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
