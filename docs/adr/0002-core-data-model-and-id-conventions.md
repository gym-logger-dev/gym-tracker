# ADR-0002: Core data model, ID conventions, import provenance and RLS shape

- **Status:** Proposed
- **Date:** 2026-10-07
- **Deciders:** architect, lead (Sev for items marked "Assumption (Sev to confirm, reversible)")

## Context

`docs/dev-plan.md` section "Core data model" names the entities and says every row carries `user_id` for RLS and that sync is keyed by client-generated UUIDs. STORY-005 lists the decisions this ADR must make; STORY-006, 007, 008 (migrations), 009 (RLS tests), 013 (local Drizzle schema), 014 and 015 (importer) and 021 (Quick Log) cannot start until it is accepted. Obligations in play: R2 (consent for health data, built P4), R3 (structured, exportable data), R7 (no clinical wording in names or fields), R9 (account deletion must purge everything).

Facts from the dev plan that shape the model: 811 historical Notion entries and 46 exercises must reconcile one-for-one (the dev plan: every entry "carries its source line"); Notion has "Variant" and "Gym" tags; history has dates but no times; one user adds roughly 5,000 set rows a year; Notion remains the system of record until the P2 gate; sync (P2) is an outbox with last-write-wins per row.

Scope of this ADR: Postgres model (migrations by the architect), the matching local SQLite model (`src/db/schema.ts`) and zod contracts (`packages/contracts`). It adds no paid service and no dependency by itself (follow-ups below). The repository is public: every example here is synthetic.

### Tables in scope
| Table | Where | Phase |
|---|---|---|
| `exercise`, `variant`, `gym`, `session`, `set` | server and device | P1 (STORY-006, 007, 013) |
| `plan`, `plan_day`, `consent` | server (device from P2/P4) | table in P1 (STORY-008) |
| `import_entry` | server only (new; not in the architect's original table list) | P1 (STORY-007) |
| `body_scan` | server and device | deferred to P4 (D12) |
| `strava_link` | server only (OAuth state; tokens never on device) | P4 |
| `sync_outbox` | device only | P2 |

## Decision

Each decision states the chosen option, alternatives and consequences. "Required by" cites stories that depend on it.

### D1. Identifiers
- **Chosen:** every primary key is a client-generated UUID, stored as native `uuid` on Postgres and as lowercase hyphenated text on the device. User-created rows (exercise, variant, gym, session, set, plan, plan_day, consent) use UUIDv7 (time-ordered, good index locality). Rows created by the importer, and the implicit Quick Log session (D8), use deterministic UUIDv5: namespace UUID `20448473-4ce0-4b10-a84a-4ab62677ea3a` (fixed, public, held as a constant in `packages/contracts`), name = UTF-8 string of `kind|user_id|natural key`.
  - `user_id` is part of every v5 name. Primary keys are globally unique, so without it two users importing the same export (or the same synthetic fixture) would collide on id, and a collision would also reveal that another user's row exists.
  - Name normalisation (frozen by contracts and tested): user_id lowercase hyphenated; dates `YYYY-MM-DD`; absent gym is the literal `none`; free text last, Unicode NFC, trimmed, internal whitespace collapsed, lowercased (locale independent).
  - Kinds: `exercise|<user>|<name>`, `variant|<user>|<name>`, `gym|<user>|<name>`, `import_entry|<user>|<source_system>|<source_row_id>`, `session|<user>|<source>|<date>|<gym id or none>`, `set|<user>|<import_entry id>|<k>` (k = 1-based position of the set within the entry's parsed Sets).
  - Importer reuse rule: for exercise, variant and gym the importer first looks up an existing live row by case-insensitive name and reuses its id; only if none exists does it derive the v5 id. A user-created (v7) row with the same name therefore wins and nothing duplicates.
- **Alternatives:** (a) bigint identity keys: need the server to allocate, breaks offline creation. (b) UUIDv4 everywhere: loses time ordering, no deterministic import. (c) v5 for everything: renames and re-use of names would change identities; no ordering benefit. (d) Random v4 for imports plus a lookup table: re-import not idempotent without extra reads.
- **Consequences:** offline creation needs no server round trip; re-import is idempotent (STORY-015 criterion 4). v7 and v5 generation needs a UUID library and a secure random source on React Native; candidate `uuid` (MIT) plus `getRandomValues`; that is a dependency decision for ADR-0003 (D7 of ADR-0001). Two devices creating the same exercise name offline get different v7 ids and the natural-key unique index will reject the second on sync; the P2 sync ADR must define "resolve by name, rewrite the id". Changing the namespace constant later would orphan deterministic ids, so it is frozen.
- Required by: STORY-006, 007, 013, 015, 021.

### D2. Common columns and tombstones
- **Chosen:** every table has `id`, `user_id` (not null, references `auth.users` on delete cascade, so account deletion purges everything, R9), `created_at` (timestamptz UTC, client-assigned), `updated_at` (timestamptz UTC, set by a server trigger on every insert and update; any client value is overwritten), `deleted_at` (timestamptz null, tombstone). Client-assigned fields: `id`, `user_id`, `created_at`, and every domain field; server-assigned: `updated_at` only. `user_id` must equal the caller's `auth.uid()` (enforced by RLS `with check`, D13).
  - Deletes in the app are tombstones (set `deleted_at`); hard delete happens only by account deletion cascade or a deliberate retention purge. Tombstoning a session also tombstones its sets in the same transaction. Foreign keys from a set to its session are `on delete cascade` as a backstop; foreign keys to exercise, variant, gym and plan_day are `no action` (never silently remove history by deleting a reference row). Because `no action` is checked after the statement, user deletion cascading from `auth.users` still succeeds; STORY-006 criterion 5 and STORY-008 criterion 9 must prove it.
  - Exceptions: `consent` has no `deleted_at` (D11, append-only evidence); `import_entry` has no `deleted_at` (immutable audit, D9).
  - Soft-deleted rows are ignored by reads (STORY-019 criterion 6). Uniqueness that applies to names and set positions is a partial unique index over live rows only (`deleted_at is null`) so an undone set (STORY-021 criterion 8) frees its position.
- **Alternatives:** (a) hard delete plus a deletion log: breaks LWW pull (a deleted row cannot be "seen" by another device). (b) client `updated_at`: simpler offline but trusts device clocks. (c) Version counter column: stronger conflict handling, more machinery than a single-user product needs.
- **Consequences:** a pull cursor can be `updated_at > last_sync`. Server-authoritative `updated_at` means last-write-wins is by arrival order at the server, so an older offline edit synced late overwrites a newer edit from another device. For one user on a few devices this is accepted; the P2 sync ADR confirms or replaces it. On device, `updated_at` is the device clock until the next pull replaces it. Tombstones accumulate (about 5,000 sets a year, immaterial).
- Required by: STORY-006, 007, 008, 013.

### D3. Numeric types and units
- **Chosen:** weight `weight_kg numeric(6,3)` nullable, check `>= 0` (range 0 to 999.999); `reps integer not null`, check `0 <= reps <= 1000`; `rpe numeric(3,1)` nullable, check `0 <= rpe <= 10`; `set_order integer not null`, check `>= 1` (the dev plan's "order" is a reserved SQL word, so the column is `set_order`); `equipment_increment_kg numeric(5,3)` nullable, check `> 0`. Names are text, 1 to 100 characters after trimming.
  - Weight null means bodyweight or unknown; 0 is a real value and is never used as a placeholder. Quick Log allows null weight only through an explicit "bodyweight" choice (STORY-021 criterion 6).
  - Contract type for weight and RPE is a JS number validated to at most three and one decimals respectively. On the device the column is `REAL`; all reads and writes pass through one rounding helper (round to 3 decimals), and equality in tests is on the rounded value. 1.25, 2.5 and 100 round-trip exactly (STORY-013 criterion 3). The parser reads decimals as strings, never floats (STORY-014 criterion 3).
  - Dates and times: `timestamptz` stored UTC on the server; ISO 8601 UTC text with millisecond precision and `Z` on the device and in contracts; `date` columns as `YYYY-MM-DD` text on the device. Display timezone is Australia/Adelaide (CLAUDE.md rule 10); nothing in storage depends on the device timezone.
  - Device type map: uuid to text, timestamptz to ISO text, date to text, numeric to REAL, boolean to INTEGER 0/1, jsonb to JSON text.
- **Alternatives:** integer grams (exact, but every export and API field needs conversion and contracts would diverge from the "weight kg" in the dev plan); `numeric` without scale (unbounded input); float8 on the server (drift); lb as a stored unit (non-goal, kg only, rule 10).
- **Consequences:** exact storage and JSON export in kg with 1.25 kg plate steps; the SQLite side is a float so precision is guaranteed only by the rounding helper, which is part of the repository layer's tests. Pounds and ranges in history are not representable and become review flags (D6).
- Required by: STORY-005 criterion 4, STORY-006 (criterion 7), STORY-007 (criterion 4), STORY-013.

### D4. Exercise, variant and gym
- **Chosen:**
  - `exercise`: `name` text not null, `muscle_group` text nullable (free text, with a suggested list in contracts, no database enum so new values need no migration), `equipment_increment_kg` numeric nullable. Unique on `(user_id, lower(name))` over live rows (STORY-006 criterion 4).
  - `variant`: a flat, per-user list of tags (`name`), not a child of `exercise`. A set carries `variant_id` nullable. Unique on `(user_id, lower(name))` over live rows.
  - `gym`: a flat, user-owned list (`name`), no hard-coded names in schema, seeds or fixtures (public repo). A session carries `gym_id` nullable. Unique on `(user_id, lower(name))` over live rows.
  - Assumption (Sev to confirm, reversible): the Notion "Variant" tag is a tag applied across exercises (for example "paused" or "wide grip") rather than a list that belongs to each exercise. Global tags allow one filter on charts across exercises (W2) and one import lookup. If the Notion variants are in fact per-exercise, add a nullable `exercise_id` to `variant` later (additive migration) and keep the same ids.
- **Alternatives:** variant as a child of exercise (duplicates "wide grip" per exercise and needs the importer to guess the owner); variant as a free-text column on `set` (no rename, no filter, case drift); gym as an enum or seeded list (real gym names are user data).
- **Consequences:** `session.gym_id` and `set.variant_id` can be null (unknown), and the importer never invents a gym or variant. Renaming a variant or gym changes every row that uses it; historic charts relabel, which is the desired behaviour.
- Required by: STORY-006, 007, 015.

### D5. Session and set
- **Chosen:** 
  - `session`: `started_at` timestamptz not null; `ended_at` timestamptz nullable (check `>= started_at`); `session_date` date not null (the Australia/Adelaide calendar day of the session; stored so grouping and display never depend on timezone conversion; contracts validate that it equals the Adelaide date of `started_at`); `gym_id` nullable; `plan_day_id` nullable (composite FK added in STORY-008); `strava_activity_id` bigint nullable (as the dev plan lists; OAuth state lives in `strava_link`, P4); `source` text not null, check in (`app`, `quick_log`, `notion_import`), default none (client sets it); common columns.
  - `set`: `session_id`, `exercise_id` not null; `variant_id` nullable; `set_order`, `weight_kg`, `reps`, `rpe` per D3; `completed_at` timestamptz nullable (null for imported history); common columns. Unique on `(session_id, exercise_id, set_order)` over live rows (STORY-007 criterion 5).
  - A session with zero sets is valid (started-but-empty, STORY-007 criterion 8).
- **Alternatives:** a `session_exercise` table between session and set (more structure than the dev plan names; exercises in a session are derivable from sets); a single `occurred_on` date without `started_at` (cannot sort two sessions on one day, STORY-019 criterion 5).
- **Consequences:** history by session, exercise, variant and gym is a plain join; chart queries use indexes on `(user_id, exercise_id, session_id)`-style paths chosen in the migration. Two devices logging the same session, exercise and `set_order` offline will conflict at sync; the P2 sync ADR must renumber `set_order` (flagged now so nobody is surprised).
- Required by: STORY-007, 013, 019, 021.

### D6. Cross-user reference safety
- **Chosen:** every parent table has `unique (user_id, id)`. Every foreign key from a child is composite, `(user_id, parent_id)` referencing the parent's `(user_id, id)`, and is `deferrable initially deferred`. A child can therefore never point at another user's row (STORY-007 criterion 3, STORY-009 criterion 5), and a P2 sync batch can insert children before parents inside one transaction. Nullable parent columns (variant, gym, plan_day) skip the check when null (default `match simple`).
- **Alternatives:** single-column FKs plus a validation trigger (slower, easy to forget on a new table); RLS `with check` subqueries only (RLS-bypassing roles such as the importer's would not be covered).
- **Consequences:** slightly wider indexes; migrations must follow the pattern for every future child table (a pgTAP meta-test can enforce "every FK to a user-owned table is composite"; qa-engineer to add in STORY-009).
- Required by: STORY-007, 008, 009.

### D7. Representation of historical entries (sessions without times)
- **Chosen:** one synthetic session per `(session_date, gym)` with `source = 'notion_import'`; `started_at` = 00:00 on that date in Australia/Adelaide converted to UTC (midnight always exists in Adelaide, daylight saving changes occur at 02:00, but DST-boundary dates are still tested, STORY-015 criterion 9); `ended_at` null; `session_date` = that date; `gym_id` null when the entry has no gym; sets have `completed_at` null. Session id is the v5 id from D1. Several entries on the same date and gym fall into the same session; sets of the same exercise from different entries are numbered `set_order` consecutively in source row order (the importer sorts entries by source row sequence, so the numbering is deterministic).
  - Missing fields are never dropped silently: no reps becomes no set plus a review flag; no variant or no gym stays null; no date means the entry cannot be placed in a session, so no session or sets are created, and the entry is kept in `import_entry` with `needs_review` and reason `missing_date` (D9). An entry with an unknown exercise name creates the exercise from the name (flag `unknown_exercise` only if the exercise export does not contain it); a blank exercise name creates no sets (`missing_exercise`).
  - Assumption (Sev to confirm, reversible): grouping by (date, gym) and the midnight placeholder start are the architect's recommended default from STORY-005, not something Sev has confirmed. Reversible because deterministic ids and the immutable raw text allow a re-import with another grouping.
- **Alternatives:** one session per entry (date plus exercise): shatters a workout into many sessions and breaks per-session charts; one session per date regardless of gym (loses gym split); placeholder date for undated entries (invents data).
- **Consequences:** history behaves like ordinary sessions in prefill and charts (STORY-019). Two training blocks on the same date at the same gym merge into one session, an accepted loss of time information that the data never had.
- Required by: STORY-005 criterion 5, STORY-007, 015, 016.

### D8. Quick Log implicit session (STORY-021)
- **Chosen:** until the P2 session UI exists, saving a set outside a formal session uses one implicit session per `(Adelaide calendar day, gym or none)`. Its id is deterministic v5 (`session|<user>|quick_log|<date>|<gym id or none>`), `source = 'quick_log'`, `started_at` = time of the first set saved, `ended_at` null, `session_date` = the Adelaide day, `gym_id` = the gym selected at save time (null if none). The first save inserts the session if its id does not exist, then the set, in one local transaction (so nothing is half-written, STORY-021 criterion 7); later saves reuse it. A different gym on the same day produces a second implicit session. Undo tombstones the set and leaves the session (a set saved just after midnight belongs to the new day, accepted).
  - Mapping to P2: implicit sessions are ordinary rows in `session`, with the same columns, valid for charts and prefill. The P2 session UI starts formal sessions with a v7 id and `source = 'app'`; it may continue or end an existing implicit session and needs no data migration. Because the id is deterministic, two devices logging offline on the same day for the same gym create the same session id and merge rather than duplicate.
- **Alternatives:** a v7 id per first set (two devices duplicate sessions); no session until P2 (violates the NOT NULL `set.session_id`); a nullable `set.session_id` (orphans, special cases in every query).
- **Consequences:** no schema change is needed for P2. The "day" boundary is Adelaide midnight regardless of device timezone.
- Required by: STORY-021, 019.

### D9. Import provenance: `import_entry`
- **Chosen:** a server-only table (not synced, absent from the device schema) with one row per source entry, never overwritten:
  - `id` (v5, D1), `user_id`, `created_at`; `import_batch_id` uuid (v7, one per run), `source_system` text (`notion_csv`), `source_row_id` text not null (the Notion page id if the export contains one; otherwise `row-<n>`, the 1-based data row number; Assumption (Sev to confirm, reversible): the real export's identifier column is unknown until OI-003), `raw_date` text nullable, `raw_sets` text nullable (null means the cell was absent; empty string means present and empty), `raw_fields` jsonb not null (every other source column verbatim, for example exercise, variant, gym, notes), `parsed_set_count` integer not null (sets recognised), `session_id` and `exercise_id` nullable (composite FKs), `needs_review` boolean not null default false, `review_reasons` text[] not null default empty, `reviewed_at` timestamptz nullable.
  - Reason codes (enumerated in contracts, not as a database check, so adding one needs no migration): `missing_date`, `missing_exercise`, `unknown_exercise`, `empty_sets`, `unparsed_token`, `no_weight`, `duplicate_source_row`.
  - Immutability: a trigger rejects any update to `source_system`, `source_row_id`, `raw_date`, `raw_sets`, `raw_fields` and `parsed_set_count`; only `reviewed_at` (Sev's acceptance, STORY-016 criterion 5) may change. Raw text is `text`, never trimmed or normalised (byte-for-byte, STORY-007 criterion 7). Triggers never log row contents.
  - Reconciliation (STORY-016) recomputes the set ids `set|<user>|<import_entry id>|k` for k = 1 to `parsed_set_count` and compares existence, weight and reps against the parsed raw text; no extra column on `set` is needed.
  - No `deleted_at`: the table is audit evidence. Rows are removed only by account deletion cascade.
- **Alternatives:** a `source_ref` text column on `set` (cannot hold entries that produce zero sets, nor the raw text once per entry); storing raw text on `session` (many entries per session); keeping provenance only in a gitignored file on Sev's PC (not on the server, lost on a new machine).
- **Consequences:** every one of the 811 entries is represented by exactly one row, including entries that produced no sets, which makes "811 in, 811 out" a count of `import_entry` rows plus reconciliation of sets. `raw_fields` holds personal training data: RLS applies, it is excluded from logs, it travels in data export (R3) but is not sent to any AI or to Strava. Idempotent re-import upserts by deterministic id and must leave raw columns unchanged (the immutability trigger makes a changed export fail loudly instead of overwriting). If the export has no stable row id, a reordered re-export is not idempotent (OI-003 pending).
- Required by: STORY-007, 015, 016, 017.

### D10. Sets text parsing rule (`45x10, 9, 8`)
- **Assumption (Sev to confirm, reversible):** inferred from the dev-plan example; real strings arrive with OI-003. Grammar for the `Sets` cell, applied by `parseSets` (STORY-014), tokens separated by commas, spaces optional:
  1. `WxR` (also `W x R`, `X` accepted): W is a decimal weight in kg, R a non-negative integer of reps. Creates a set and sets the carried weight to W.
  2. A bare integer `R`: creates a set with reps R at the carried weight. If no weight has been carried yet, the weight is null and the warning `no_weight` is raised.
  3. Any other token (for example `abc`, `45lb`, `BW`, `8-10`, `40x8x3`, a drop-set notation) creates no set, raises `unparsed_token` with the token position, and resets the carried weight to null, so a later bare reps token gets a null weight and a `no_weight` warning rather than a guessed weight.
  4. An empty or whitespace-only cell creates zero sets and the reason `empty_sets`.
  - Decimals are read as strings and converted to the `numeric(6,3)` value exactly. Anything that raises a warning marks the entry `needs_review` with the matching reason codes; sets that could be read are kept (STORY-014 criterion 5). Examples: `45x10, 9, 8` gives (45, 10), (45, 9), (45, 8); `45x10, abc, 8` gives (45, 10) and (null, 8) plus `unparsed_token` and `no_weight`.
- **Alternatives:** carry the weight across an unknown token (STORY-014 draft wording; risks attributing the wrong weight after a weight change that was not understood); reject the whole cell on any unknown token (loses readable sets); treat weight-only numbers `45` as reps (ambiguous with rule 2 and not decidable without data).
- **Consequences:** conservative, never a guess; the cost is more review flags. STORY-014 criterion 2 (carry-forward on valid tokens) is unchanged; its criterion for unknown tokens must state the reset (product-owner edit). Real-data formats (lb, bodyweight, ranges, drop sets) become new stories after OI-003.
- Required by: STORY-014, 015, 016.

### D11. Plan, plan day and consent
- **Chosen:**
  - `plan`: `name` text not null, `status` text not null check in (`draft`, `approved`) default `draft`, `approved_at` timestamptz nullable (required when status is `approved`), `source` text not null check in (`manual`, `claude_mcp`, `app_import`). Common columns.
  - `plan_day`: `plan_id` not null (composite FK), `day_index` integer not null (1-based, unique per plan over live rows), `label` text nullable, `prescription` jsonb not null (exercises, sets, rep ranges, load guidance; shape and `version` field defined by the plan JSON contract in `packages/contracts`, shared by the MCP tool and in-app import). Common columns. `session.plan_day_id` gets its composite FK in STORY-008.
  - `consent`: `type` text not null check in (`health_data`, `strava`, `ai_sharing`), `policy_version` text not null (the notice text version shown when the user agreed), `granted_at` timestamptz not null, `withdrawn_at` timestamptz nullable (check `>= granted_at`), `created_at`, `updated_at`, `user_id`; no `deleted_at`. A partial unique index allows only one active (not withdrawn) row per `(user_id, type)` (STORY-008 criterion 5). Append-only: a trigger permits an update only to set `withdrawn_at` once; regranting inserts a new row; no delete policy for `authenticated` (rows are removed only by account-deletion cascade). The `strava` consent and any Strava data are unrelated to `ai_sharing`; Strava data never goes to AI.
  - New consent types require a new migration that edits the check; type names are neutral wellness terms (R7). No health values are stored by this story.
- **Alternatives:** normalise `prescription` into plan_exercise/plan_set tables (heavy before the plan format is proven; MCP and import would need two mappings); mutable consent with a boolean flag (no evidence trail); consent rows tombstoned and re-activated (loses history).
- **Consequences:** plan format can evolve through the contract `version` without migrations; the database cannot query inside a prescription efficiently (not needed; plan days are read whole). Consent history is preserved for audit and R2; consent can be recorded offline and synced later (P2) because the id is client-generated.
- Required by: STORY-008, R2.

### D12. `body_scan` deferred to P4
- **Chosen:** no table in P1; documented here. When built (P4) it is a separate table, not a column set on `session`, so scan data can be deleted on its own (R2): `consent_id` not null (composite FK to `consent`, requires an active `health_data` consent at insert, enforced by trigger and RLS), `scan_date` date not null, `source` (`manual`, `claude_mcp`), numeric metrics all nullable with range checks (`weight_kg`, `body_fat_pct`, `lean_mass_kg`, segmental lean mass as a small jsonb object), common columns. No field named or implying diagnosis, condition or injury (R7). Uploaded scan files are deleted after extraction unless the user keeps them (dev plan, Security controls). Health values are never logged and never in analytics.
- **Alternatives:** build the table now (unused health table in the schema before consent UI exists); metrics on `session`.
- **Consequences:** the P1 schema holds no health data, so the P1 gate carries no health-consent obligation. P4 adds one migration plus the consent screen.
- Required by: STORY-005 (documentation), R2.

### D13. RLS shape
- **Chosen:** `enable row level security` on every table in `public` in the same migration that creates it (STORY-006 to 008 create tables with none yet; STORY-009 adds policies in its own migration). Policies are written `to authenticated` with `user_id = (select auth.uid())` in both `using` and `with check` (the `select` wrapper is the Supabase-recommended form so the value is evaluated once per statement). Normally four policies per table (select, insert, update, delete). Exceptions: `consent` has select, insert, update only (D11); `import_entry` has select only (written by the importer with a privileged local role; STORY-015 uses the local stack only). `anon` has no grants and no policy on any table (revoke explicitly; Supabase grants defaults to `anon` on new tables). The service role is never referenced in a policy. Every table has an index whose leading column is `user_id` (the `(user_id, id)` unique key covers parents; children carry a `(user_id, ...)` index). The STORY-009 meta-test fails if any `public` table lacks RLS or an `authenticated` policy.
- **Alternatives:** a single `for all` policy (harder to test per verb, STORY-009 criterion 2 requires per-verb); `auth.jwt()` claims in policies (slower, no benefit); relying on application filters.
- **Consequences:** sync (P2) and the MCP connector run under the same policies, so they do not weaken them. Server-side jobs that must bypass RLS (nightly backup, importer) use a privileged role confined to Edge Functions or localhost tooling and are never shipped to the device.
- Required by: STORY-006, 007, 008, 009.

### D14. Local database model and user scoping
- **Chosen:** `src/db/schema.ts` (Drizzle, SQLite) mirrors exercise, variant, gym, session, set with the same column names and nullability; `plan`, `plan_day`, `consent`, `body_scan` arrive when their features do; `import_entry` is never on the device. Every local row has `user_id` NOT NULL. The user must sign in before the first use of the app: the app never writes a row without a user id and there is no anonymous local mode. All local queries filter by the signed-in `user_id` (STORY-019 criterion 8).
  - Assumption (Sev to confirm; hard to reverse once real data exists): sign-in before first use is acceptable for a product that already requires an account (dev plan, Auth).
  - Reason: deterministic ids (D1, D8) embed `user_id`; backfilling a null `user_id` after sign-in would change those ids and break idempotent import and implicit-session merging.
  - Consistency between layers: `packages/contracts` (zod) is the single field list. Two automated checks: a unit test comparing `src/db/schema.ts` columns, nullability and types with the contracts (STORY-013 criterion 1), and a database test (pgTAP or integration test, qa-engineer) comparing the migrated Postgres columns with the contracts through catalog queries, so drift in either layer fails `verify`.
  - Consequences for stories: STORY-013 criterion 10 changes to "user_id NOT NULL; signed-in user's id". The first launch requires the network once (magic link), after which the persisted session works offline; any later switch of signed-in user keeps the previous user's encrypted rows on the device but invisible until the auth ADR defines purge on sign-out.
- **Alternatives:** nullable `user_id` until sign-in with backfill (breaks v5 ids); a fixed local placeholder user id then remap (same problem plus a migration of every key).
- **Consequences:** no "try before sign-in" mode; a hard-to-reverse choice, so recorded here deliberately (see open question Q4).
- Required by: STORY-013, 019, 021.

### D15. Contracts
- **Chosen:** `packages/contracts` holds zod schemas and inferred TypeScript types for exercise, variant, gym, session, set, plan, plan_day, consent, plus `import_entry` (importer-facing) and constants (v5 namespace, reason codes, source and consent enums, plan JSON). Timestamps are ISO 8601 UTC strings on the wire. `body_scan` is documented only (D12). Runtime validation is chosen (not types only) because the same schemas validate importer output, sync payloads (P2), MCP tool inputs (P4) and in-app plan import. The zod version is selected by `npm view` before STORY-005 (npm `latest` was 4.6.5 on 2026-10-07; MIT).
- **Alternatives:** types only (no validation of untrusted JSON from Claude or the CSV importer); generated types from SQL (Postgres cannot express the Adelaide-day rule or reason enums).
- **Consequences:** validation cost is paid at boundaries only; zod becomes a runtime dependency of the app and Edge Functions (dependency ADR addendum, per ADR-0001 D7).
- Required by: STORY-005 criteria 2 and 3.

### Synthetic example (illustrative)
Import entry `fake-row-0001`: exercise "Example Bench Press", gym "Example Gym A", date 4 Oct 2026, Sets `45x10, 9, 8`. Result: one `import_entry` (raw text kept as is, `parsed_set_count` 3, `needs_review` false), one session (`notion_import`, started 00:00 Adelaide on that date as UTC, `session_date` 2026-10-04), three sets with `set_order` 1 to 3, weight 45.000, reps 10, 9, 8, `completed_at` null, ids derived as in D1.

## Options considered
| Option | Pros | Cons | Cost |
|---|---|---|---|
| UUIDv7 for user rows, v5 for imports and implicit sessions (chosen) | Offline creation, ordered keys, idempotent import, same-day merge across devices | Needs UUID lib and secure random on RN; namespace frozen | Free |
| UUIDv4 / bigint ids | Simple | No offline (bigint) or no idempotent import (v4) | Free |
| `numeric(6,3)` kg server, REAL plus rounding helper on device (chosen) | Matches dev plan, 1.25 steps exact in storage | Float on SQLite needs one rounding rule | Free |
| Integer grams | Exact everywhere | Contract and export diverge from "weight kg" | Free |
| Variant as global per-user tag (chosen, assumption) | One filter across exercises; simple import | Wrong if Notion variants are per exercise | Free |
| Variant child of exercise | Natural if per exercise | Duplicates, importer guesses | Free |
| Synthetic session per (date, gym) (chosen) | Behaves like real sessions | Merges same-day blocks | Free |
| Session per entry | No merging | Fragments workouts | Free |
| `import_entry` server-only table (chosen) | Holds zero-set entries, raw text, review state, immutable | One more table (not in original list); not on device | Free |
| `source_ref` on `set` | No extra table | Cannot represent zero-set entries or raw text once per entry | Free |
| Conservative Sets parser with weight reset after unknown token (chosen, assumption) | Never guesses | More review flags | Free |
| Carry weight across unknown token | Fewer flags | Can attribute a wrong weight | Free |
| Composite deferrable FKs (chosen) | Cross-user refs impossible; sync-friendly | Wider keys | Free |
| Single-column FKs plus trigger | Narrow keys | Easy to forget; slower | Free |
| Local `user_id` NOT NULL (chosen) | Stable deterministic ids | No anonymous use; first sign-in needs network | Free |
| Local `user_id` nullable then backfill | Works before sign-in | Changes v5 ids; complex remap | Free |

## Consequences
- Easier: migrations, local schema and contracts can be written without further questions (field names, nullability, units and ids are fixed); re-import and offline Quick Log are idempotent; account deletion is one cascade; R3 export is straightforward JSON.
- Harder: a wider schema (`import_entry`, composite keys) and a UUID plus rounding discipline in the app layer; P2 sync must solve name collisions on offline-created exercises and `set_order` collisions (flagged in D1 and D5).
- Required follow-up work:
  1. Product-owner story edits: STORY-007 (composite deferrable FKs, `import_entry` columns and immutability, `set_order`, partial unique indexes), STORY-013 criterion 10 (local `user_id` NOT NULL), STORY-014 (reset to null after an unknown token), STORY-015 (missing date gives an `import_entry` with zero sets and `missing_date`), STORY-021 criterion 4 (rule in D8).
  2. Dependency ADR (ADR-0003): UUID library, secure random polyfill, SQLCipher and key storage (before STORY-012/013); importer ADR (location, local authentication, before STORY-014); auth client ADR (before STORY-010).
  3. The architect writes migrations and `packages/contracts` in STORY-005 to 008; qa-engineer adds the catalog and "composite FK" meta-tests in STORY-009.
  4. The P2 sync ADR confirms last-write-wins by server `updated_at`, name-collision resolution and `set_order` renumbering.
- Reversing: additive changes (new nullable columns, new tables, new enum values by migration) are cheap. Hard to reverse once real data exists: the v5 namespace and name formats, the use of `user_id` in v5 names, and local `user_id` NOT NULL. Variant-as-tag and the Sets grammar are reversible (additive column, importer re-run by deterministic ids after correcting raw reading, because raw text is kept).
- Open questions for Sev (all with a safe default; none blocks migrations if the default is accepted): see the architect's report and the OPEN_ITEMS register; summary: Q1 Sets grammar and unknown-token reset (D10), Q2 variant as global tag (D4), Q3 midnight-Adelaide placeholder start and (date, gym) grouping (D7), Q4 sign-in required before first use (D14), Q5 `source_row_id` fallback when the export has no Notion page id (D9).
