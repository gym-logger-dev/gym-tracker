# ADR-0001: Toolchain, baseline dependencies, repository layout and file ownership

- **Status:** Proposed
- **Date:** 2026-10-07
- **Deciders:** architect, lead (Sev for stack, cost or scope changes)

## Context

`docs/dev-plan.md` section "Target architecture" fixes the stack (Expo, Expo Router, TypeScript strict, expo-sqlite with SQLCipher, Drizzle, Supabase, Jest, pgTAP, Maestro, GitHub Actions, EAS, npm). It does not pin versions, folder layout, lint/test tooling or who may edit root config files. STORY-001 (tooling bootstrap and `npm run verify`) and STORY-002 (Expo app shell) are blocked until these are fixed; both name ADR-0001 in their technical notes. STORY-012 (encrypted local DB) adds one constraint now: SQLCipher is not available in Expo Go.

This ADR refines the stack; it does not change it. It adds no paid service. The repository is public, so no example here contains real data.

### Version evidence (checked 2026-10-07, primary sources)

An earlier research pass (HANDOFF "Architect hand-back (2026-10-06)") is model output. Each claim was re-checked; "npm view" means `npm view <pkg> ...` against the npm registry run on 2026-10-07.

| Claim | Result | Source (retrieved 2026-10-07) |
|---|---|---|
| Expo SDK 57 is latest stable | Verified. SDK 57 released 30 Jun 2026; SDK 56 released 21 May 2026; SDK 58 is Beta (15 Sep 2026) | https://expo.dev/changelog and https://expo.dev/changelog/sdk-57 |
| `expo ~57.0.x` | Verified. npm dist-tag `latest` = 57.0.27, `sdk-57` = 57.0.27, `next` = 58.0.6 (beta line) | npm view expo dist-tags |
| SDK 57 ships React Native 0.86 and React 19.2 | Verified. react-native 0.86.3, react 19.2.3, expo-router ~57.0.25, expo-sqlite ~57.0.4, jest-expo ~57.0.5 | https://expo.dev/changelog/sdk-57 and expo/expo repo `packages/expo/bundledNativeModules.json` on branch `sdk-57` |
| Node 24 is the LTS to use | Verified with a caveat. Node 24 "Krypton" is Active LTS today (released 6 May 2025, EOL 30 Apr 2028). Node 22 is Maintenance LTS (EOL 30 Apr 2027). Node 26 (released 5 May 2026) is "Current" and is scheduled to enter Active LTS on 28 Oct 2026, three weeks from today. The existing `.nvmrc` value `lts/*` would therefore silently move to Node 26 on that date | https://nodejs.org/en/about/previous-releases and https://github.com/nodejs/release#release-schedule |
| Expo SDK 57 minimum Node version | NOT verified. The SDK 57 changelog text does not state it. Node 24 is assumed compatible (it is Active LTS and Expo SDK 57 is current); STORY-001 must confirm by running `npx expo-doctor` on Node 24 and report the result | https://expo.dev/changelog/sdk-57 (silent) |
| TypeScript `~6.0`, not 7 | Verified, with a stronger reason than the hand-back gave. npm `latest` is 7.0.2, but `typescript-eslint@8.71.1` declares peer `typescript >=4.8.4 <6.1.0` and `ts-jest@29.4.14` declares `>=4.3 <7`. The Expo SDK 57 default template pins `typescript ~6.0.3` and `@types/react ~19.2.2`. 6.0.3 exists on npm | npm view typescript dist-tags; npm view typescript-eslint@8.71.1 peerDependencies; npm view ts-jest@29.4.14 peerDependencies; https://raw.githubusercontent.com/expo/expo/sdk-57/templates/expo-template-default/package.json |
| ESLint 9.x flat config | Verified, with a different reason. npm `latest` is 10.12.0 (`maintenance` tag = 9.39.5). `eslint-config-expo@57.0.2` (the Expo-supported config, flat config default since SDK 53) depends on `eslint-plugin-import ^2.30.0`, whose newest release 2.32.0 declares peer `eslint` up to `^9`. ESLint 10 would produce peer conflicts. ESLint 9 is in maintenance, so this is a temporary pin | npm view eslint dist-tags; npm view eslint-config-expo@57.0.2 dependencies; npm view eslint-plugin-import@^2.30.0 peerDependencies; https://docs.expo.dev/guides/using-eslint/ |
| Jest ~29.7 with jest-expo | Verified. npm `latest` for jest is 30.5.2, but `jest-expo@57.0.5` (the SDK 57 pin) depends on Jest 29 packages (`babel-jest ^29.2.1`, `@jest/globals ^29.2.1`, `jest-environment-jsdom ^29.2.1`). Jest 29 latest is 29.7.0. `@types/jest` latest 29 is 29.5.14 (latest overall is 30.0.0, not matching) | npm view jest-expo@57.0.5 dependencies; npm view jest@29 version; npm view @types/jest@29 version |
| (new, not in hand-back) jest-expo peer | `jest-expo@57.0.5` has a required peer `@react-native/jest-preset ^0.86.3` (MIT); `expo` and `react-server-dom-webpack` peers are optional. `@react-native/jest-preset@0.86.3` exists | npm view jest-expo@57.0.5 peerDependencies peerDependenciesMeta |
| (new) React Native Testing Library | `@testing-library/react-native` latest is 14.0.1, which needs a new peer `test-renderer ^1.0.0`; jest-expo 57 bundles `react-test-renderer 19.2.3`. 13.3.3 peers on `react-test-renderer >=18.2.0` and matches the jest-expo setup. Use 13.3.x until jest-expo documents v14 | npm view @testing-library/react-native dist-tags; npm view @testing-library/react-native@13 peerDependencies; npm view jest-expo@57.0.5 dependencies |
| Prettier | Not in the hand-back. npm `latest` is 3.9.9 (MIT) | npm view prettier version |
| SQLCipher is not in Expo Go | Verified. Enabled via the `expo-sqlite` config plugin option `useSQLCipher`, then `npx expo prebuild`; "SQLCipher is not supported on Expo Go" | https://docs.expo.dev/versions/latest/sdk/sqlite/ |

Licences checked via npm view: expo, expo-sqlite, jest-expo, @react-native/jest-preset, ts-jest, prettier, eslint are MIT; typescript is Apache-2.0.

## Decision

### D1. Expo SDK pin and upgrade policy
- Pin Expo SDK 57 (`expo ~57.0.x`; 57.0.27 on 2026-10-07). All Expo-managed packages are installed with `npx expo install` so versions follow the SDK's `bundledNativeModules.json` (tilde ranges). `npx expo-doctor` is run in STORY-001/002 and its output attached to the PR.
- Upgrade only at a phase boundary (P1 to P2, P2 to P3, and so on), only to a stable SDK, one SDK at a time, in its own story with an ADR addendum recording what changed. Never adopt a Beta or canary (SDK 58 is Beta today). Patch releases within SDK 57 (`npx expo install --fix`) may be taken in any story and do not need an ADR.
- Expo's cadence is currently about six weeks between SDKs (56 on 21 May, 57 on 30 Jun 2026), so SDK 57 may be superseded before P2. That is accepted: we do not chase it.

### D2. Node and engines
- Node 24 LTS. `.nvmrc` contains `24` (not `lts/*`, which floats to Node 26 on 28 Oct 2026 and would make local and CI toolchains drift). `package.json` `engines.node` is `>=24 <25`. CI reads `.nvmrc` (already so in `.github/workflows/ci.yml`).
- Node 26 is reconsidered at the P1 to P2 boundary, once it is Active LTS and Expo/EAS tooling states support (evidence required, see the unverified row above).

### D3. Language and tooling versions
| Tool | Pin | Note |
|---|---|---|
| TypeScript | `~6.0.3`, `strict: true` | tsconfig extends `expo/tsconfig.base` |
| ESLint | `~9.39.5`, flat config `eslint.config.js` | `eslint-config-expo/flat` plus `typescript-eslint ~8.71`; revisit when `eslint-plugin-import` supports ESLint 10 |
| Prettier | `~3.9.9`, `.prettierrc` | formatting enforced by `lint` via `prettier --check` |
| Jest | `~29.7.0` | with `jest-expo ~57.0.5` and `@react-native/jest-preset ~0.86.3` |
| Test libraries | `@testing-library/react-native ~13.3.3`, `@types/jest ~29.5.14`, `ts-jest ~29.4.14` | ts-jest only for the pure-Node project |
| Runtime validation | `zod` (contracts) | version chosen by the architect in STORY-005 after `npm view` checks; npm `latest` is 4.6.5 (2026-10-07) |

Tooling devDependencies use tilde ranges; `package-lock.json` is committed and CI uses `npm ci`. No tool is installed globally.

### D4. Folder layout and alias
```
app/                  Expo Router routes only; root _layout.tsx exports an ErrorBoundary
src/db/               local SQLite, Drizzle schema (architect-owned schema.ts)
src/ui/               shared components; src/ui/theme/ design tokens (ux-designer)
src/features/<name>/  screens' logic, hooks, components per feature
src/lib/              pure helpers (dates, units), no React
src/__tests__/routes/ one render test per route (kept out of app/ so Expo Router does not treat tests as routes)
packages/contracts/   zod schemas and TS types (architect)
packages/engine/      progression rules (backend-dev)
supabase/             migrations, functions, tests (existing ownership)
tests/, e2e/          integration and Maestro (qa-engineer)
```
- Alias `@/*` maps to `src/*` in `tsconfig.json` `paths`, mirrored in Jest `moduleNameMapper`. Expo's Metro resolves tsconfig paths natively, so no Babel plugin is added.
- Unit tests are colocated as `*.test.ts(x)` beside the code, except route tests above.
- Packages are imported by name, scope `@gym-tracker/*` (for example `@gym-tracker/contracts`), never by relative path across package boundaries.
- Later packages (for example `packages/importer`, decided in a later ADR) follow the same rules.

### D5. npm workspaces
- Root `package.json` declares `"workspaces": ["packages/*"]`. One root lockfile. Each package has its own `package.json` (name `@gym-tracker/<dir>`, `private: true`, no publish) owned by the package's owner.
- A single root `tsconfig.json` covers `app`, `src`, `packages` and `tests`; packages do not carry their own tsconfig unless a story shows the need. This avoids new root config files.
- Metro monorepo resolution is automatic in current Expo SDKs; STORY-002 must confirm that the app can import `@gym-tracker/contracts` (a one-line smoke import in a unit test is enough).

### D6. npm scripts
| Script | Behaviour |
|---|---|
| `lint` | ESLint over the repo, then `prettier --check` |
| `typecheck` | `tsc --noEmit` against the root tsconfig |
| `test` | Jest with two projects: `node` (ts-jest; `packages/*` and pure logic; created in STORY-001 with one trivial test) and `app` (jest-expo; `src/` and routes; added in STORY-002) |
| `verify:rls` | If `supabase/config.toml` exists, run `supabase test db`; otherwise print a line that says the RLS step was skipped and why (STORY-004 not merged). A missing `supabase` CLI when the file exists is a failure, never a skip |
| `verify` | `lint`, `typecheck`, `test`, `verify:rls` in that order, stopping at the first failure |

The skip is explicit and loud, never silent (STORY-001 criterion 3). CI keeps `npm run verify --if-present` until STORY-023 removes `--if-present`. `verify` needs no network after `npm ci`.

### D7. Dependency policy
An ADR (or an addendum to one) is required before adding any of:
1. a new runtime dependency (anything in `dependencies`) beyond the baseline below;
2. any native module or Expo config plugin (changes the dev build);
3. any dependency that touches auth, storage, cryptography, networking, or the filesystem;
4. any analytics, crash-reporting, advertising or identifier SDK (not permitted at all, R6);
5. any licence other than MIT, Apache-2.0, BSD-2/3-Clause or ISC (anything else needs Sev);
6. any package with no release in 12 months or a single maintainer for a security-relevant role (justify in the ADR).

devDependencies that are pure tooling and listed in D3 need no further ADR. Before approval the architect checks licence and maintenance with `npm view` and records the result. Transitive licence/vulnerability scanning belongs to devops-release (Dependabot, secret scanning).

Baseline runtime list approved by this ADR (all installed via `npx expo install` where Expo-managed): `expo`, `react`, `react-native`, `expo-router` and the packages its peers require (`react-native-screens`, `react-native-safe-area-context`, `expo-linking`, `expo-constants`, `expo-status-bar`), and `expo-dev-client`. `expo-sqlite`, `drizzle-orm`, `drizzle-kit`, `expo-secure-store`, Supabase client, and auth packages are NOT approved here; each gets its own ADR just before its story (SQLCipher/key storage before STORY-012, auth client before STORY-010).

### D8. Development build from the start
- The app is built as a development build (`expo-dev-client`), not run in Expo Go, from STORY-002 onward, because SQLCipher is not available in Expo Go (https://docs.expo.dev/versions/latest/sdk/sqlite/). STORY-002 criterion 1 ("Expo Go or dev build") is satisfied by the dev build; Expo Go is allowed only for screens that touch no native module beyond the SDK.
- Android dev builds can run locally in WSL2 (`npx expo run:android`, needs the Android SDK) or on EAS. iOS cannot be built locally from WSL2 (needs macOS and Xcode), so iOS dev builds use EAS Build (`development` profile, devops-release). Installing on a physical iPhone needs Apple Developer Program membership (already costed in `docs/dev-plan.md`; not a new spend). EAS free-tier allowance (15 builds per platform per month, see `.claude/agents/devops-release.md`) means builds are batched and JS-only changes go over the air.
- CI unit tests never need a native build; the SQLite driver is mocked (STORY-012 criterion 9).

### D9. Ownership of root config files
Current guard-path hooks (`.claude/agents/*.md`) cover only some files. Proposed ownership, with the gap marked:

| File | Owner | Guard hook today |
|---|---|---|
| `package.json` (dependencies, scripts, workspaces) | mobile-dev | mobile-dev and devops-release both allowed |
| `package.json` `engines` and EAS hook scripts | devops-release (edits limited to these) | same |
| `package-lock.json` | mobile-dev (regenerated, never hand-edited) | mobile-dev |
| `tsconfig.json`, `app.config.ts`, `babel.config.js`, `metro.config.js` | mobile-dev | mobile-dev |
| `eslint.config.js`, `jest.config.js`, `.prettierrc`, `.prettierignore` | mobile-dev | **none: gap**, see below |
| `.gitignore`, `.nvmrc`, `eas.json`, `.github/*` | devops-release | devops-release |
| `supabase/config.toml`, `supabase/seed.sql` | backend-dev | per its agent file |
| `packages/<name>/package.json` | owner of that package (architect for contracts, backend-dev for engine) | per path |

Consequences for the stories: STORY-001's `.gitignore` additions and the `.nvmrc` value (`24`) move to devops-release scope (or a devops-release sub-PR); STORY-001 mobile-dev scope is `package.json`, `tsconfig.json`, ESLint, Jest and Prettier config plus the trivial test. The `.claude/` guard lists cannot be edited by any agent, so Sev must add `eslint.config.js`, `jest.config.js`, `.prettierrc` and `.prettierignore` to the mobile-dev guard list (open item). Until then mobile-dev cannot write those files and STORY-001 stays blocked on that part. App secrets are never placed in `app.config.ts` (STORY-002 criterion 8).

## Options considered
| Option | Pros | Cons | Cost |
|---|---|---|---|
| Expo SDK 57 stable (chosen) | Latest stable; matches `jest-expo`, `eslint-config-expo` 57 lines; RN 0.86, React 19.2 | May be superseded by 58 before P2 | Free |
| Expo SDK 58 beta | Newer | Beta; breaking risk; no stable support | Free, rework risk |
| Expo SDK 56 | Older, one more patch history | Already superseded; earlier upgrade needed | Free |
| Node 24 (chosen) | Active LTS, EOL 30 Apr 2028; long runway | Not the newest | Free |
| Node 26 | Becomes LTS 28 Oct 2026 | Not LTS yet; Expo/EAS support unverified | Free |
| Node `lts/*` floating | No maintenance | Moves to 26 on 28 Oct 2026; drift between machines and CI | Free |
| TypeScript 6.0 (chosen) | Matches Expo template, typescript-eslint, ts-jest | Not the newest major | Free |
| TypeScript 7.0 | Newest | Peer ranges of typescript-eslint and ts-jest exclude it | Free, tooling breakage |
| ESLint 9.39 (chosen) | Compatible with eslint-config-expo's plugins | Maintenance branch | Free |
| ESLint 10 | Newest | `eslint-plugin-import` peer conflict | Free, tooling breakage |
| Jest 29.7 (chosen) | What jest-expo 57 is built on | Not Jest 30 | Free |
| Jest 30 | Newest | Mismatch with jest-expo 57's Jest 29 dependencies | Free, risk |
| Biome instead of ESLint+Prettier | One fast tool | Not the Expo-supported lint path; extra dependency needing its own ADR | Free |
| Expo Go first, dev build later | Faster first run | SQLCipher cannot run; later switch redoes testing | Free |
| Separate package.json files per app/package without workspaces | Isolation | Duplicate installs, version drift, import friction | Free |
| Everything in `src/` (no `packages/`) | Simplest | Contracts and engine cannot be shared with Edge Functions and importer | Free |

## Consequences
- Easier: one reproducible toolchain; CI and local agree on Node 24; a single `verify` gate with explicit skip semantics; contracts shared by name.
- Harder: three pins (TypeScript 6, ESLint 9, Jest 29) are held back from npm `latest`, each for a documented peer-range reason. Revisit all three at each phase boundary and record the outcome in an ADR addendum; reversing is a version bump plus config fixes with no data impact.
- Follow-ups: (1) Sev adds three or four filenames to the mobile-dev guard list (open item); (2) devops-release takes `.gitignore`, `.nvmrc` and `eas.json` work (the current `.gitignore` lacks `*.key` and SQLite/dump patterns required by STORY-001 criterion 4); (3) STORY-001 confirms Node 24 with `expo-doctor`; (4) product-owner updates STORY-001 and STORY-002 to this ADR (Node 24, `app.config.ts`, route tests in `src/__tests__/routes/`, dev build); (5) ADR-0003 (SQLCipher, key storage, `getRandomValues` polyfill) precedes STORY-012; ADR for the auth client precedes STORY-010.
- Reversal: layout and alias are cheap to change early and expensive after P1; the SDK pin is reversible only forward (upgrade), not backward.
