# Gym Tracker App — Development Plan

Oct 2, 2026 · @Sev

## Executive summary

Build one Expo (React Native) app for iPhone and Android, offline-first on the phone, synced to a free Supabase backend in the Sydney region, with Strava publishing and a Claude connector. It is achievable as a solo build over five phases, but three parts of the brief need adjusting before work starts.

**Brief items that cannot be met as written**

| Brief item | Constraint (verified) | Recommended approach |
| --- | --- | --- |
| Free to build and publish on iPhone | App Store distribution requires the Apple Developer Program: US$99 a year, about AU$149. TestFlight needs it too. | Pay the fee for a native iOS app, or ship iPhone as an installable web app (PWA) for $0 in the meantime. Android costs a one-off US$25. |
| Claude agent linked to the user's Claude plan | Anthropic does not permit Claude Free, Pro or Max sign-ins inside third-party apps; apps must use a paid API key. | The app publishes its own **Claude connector** (a remote MCP server). The user adds it in Claude, uploads a plan PDF or body scan there, and Claude writes the plan into the app. This uses the user's own plan at no cost to the app. Optional: an in-app import with the user's own API key. |
| Track and publish workouts natively to Strava | Strava accepts a manual activity (name, sport type, duration, description) but has no structure for exercises or sets. Standard-tier apps serve up to 10 athletes; the developer needs a paid Strava subscription. Strava data may not be used in AI prompts. | Publish each session as a Weight Training activity, with the exercise and set summary in its description. Never send Strava data to Claude. |

**What makes the rest work**

- Body-scan results and progression advice are health information. The Privacy Act applies to the app regardless of turnover, and collection needs express consent.
- Keep the app positioned as general fitness and wellness. Make no disease or diagnostic claims, so it stays outside TGA medical-device regulation.
- Progression advice is computed by deterministic rules in the app. Claude explains it and proposes values, but cannot apply them unchecked.

**Decisions needed from you**

| Decision | Options | Recommendation |
| --- | --- | --- |
| iOS distribution | Pay \~AU$149/yr for the App Store, or iPhone PWA (free) | Start with the PWA plus Android; buy Apple membership before public launch |
| Audience | Personal use only, or public release | Personal first (lighter compliance); design for public from day one |
| Strava | Your own account only (1 athlete), or up to 10 users (self-upgrade) | Your account only until Phase 4 is proven |
| Notion | Keep syncing, or retire after migration | Migrate once, keep a read-only CSV export |

## Current state baseline

Today the tracker is a Notion workspace plus a browser-based logger, with no native app, no session concept and no backend of its own.

| Component | What it does | Limitation for the target state |
| --- | --- | --- |
| Notion Gym Tracker hub | 46 exercises, 811 historical entries imported from Gym.md; Variant and Gym tags; formulas for top set, volume, Epley est. 1RM | Notion API quotas (SQL query limit already hit on 2 Oct 2026); no offline use; not distributable to other users |
| Workout Log data model | One row per exercise per day; Sets stored as text (`45x10, 9, 8`) and parsed by formulas | Sets are not structured rows; no session grouping; no timestamps beyond date |
| Gym Quick Log (Claude artifact) | Phone-friendly logger; pre-fills last session; +/− steppers; writes to Notion through the Notion connector | Runs only inside Claude while signed in; single user; depends on Notion and connector consent |
| Charts | Notion chart view; sparklines in Quick Log | Not interactive; no date/time drill-down |

The historical data is clean enough to migrate: every entry carries its source line, so the import into a new database can be reconciled row for row (811 in, 811 out).

## Target architecture

One Expo codebase ships to iPhone and Android. The phone holds the full history offline, and Supabase in the Sydney region is the only server.

> Architecture (diagram in the Claude doc version):
> - **Phone (iPhone and Android):** Gym Tracker app (Expo, React Native) with sessions, Quick Log, charts and progression rules; local encrypted SQLite holding full history and the offline queue; Apple Health / Health Connect for workouts and bodyweight.
> - **Supabase (Sydney):** Auth (email, Apple, Google; OAuth 2.1 for Claude), Postgres + RLS (sessions, sets, plans, body scans), Edge Functions (Strava OAuth and publish, nightly backup), MCP connector (plan drafts, history, load proposals).
> - **Flows:** app ⇄ Postgres sync over HTTPS; Claude app (user's own plan) → MCP connector via OAuth; Edge Functions → Strava API (manual activity on session finish); Notion → Postgres one-off import of 811 entries.

Claude never talks to the phone directly: it reads and writes through the connector, under the same row-level security as the app. The optional in-app import (user's own Anthropic API key) is left out of the picture.

| Layer | Choice | Why |
| --- | --- | --- |
| App framework | Expo SDK (React Native, TypeScript), Expo Router | One codebase for iOS, Android and web (PWA); free cloud builds; over-the-air updates |
| Local data | expo-sqlite with SQLCipher, Drizzle ORM | Offline-first; encrypted health data; fast chart queries |
| Sync | Outbox table plus last-write-wins per set row, keyed by client-generated UUIDs | Simple and conflict-safe for a single user on several devices |
| Charts | Victory Native XL (Skia) | Tap-to-inspect points at 60 fps on 800+ points |
| Backend | Supabase: Postgres, Auth, Storage, Edge Functions (Deno) | Free tier covers the load; RLS; built-in OAuth 2.1 server for the MCP connector |
| Claude | Remote MCP server (Edge Function) plus a Claude Skill for the plan schema | Uses the user's own Claude plan; compliant with Anthropic's third-party rules |
| CI/CD | GitHub Actions, EAS Build and Submit | Free tiers; signed builds; test gate before release |

**Core data model:** `exercise` (name, muscle group, equipment increment), `variant`, `gym`, `session` (start, end, gym, plan day, Strava activity id), `set` (session, exercise, variant, order, weight kg, reps, RPE, completed at), `plan` and `plan_day` (draft or approved, source), `body_scan` (date, metrics, consent id), `consent` (type, granted at, withdrawn at). Every row carries `user_id` for RLS.

## Feature workstreams

Each workstream lists what it delivers, how it is built, and the test that proves it done.

### W1. Workout sessions

A session groups everything done in one visit: start time, gym, exercises in order, every set, rest periods and end time.

- **Start** from a plan day, a repeat of the last session, or empty. Date, time and gym are pre-filled; the gym is taken from the last session (optional GPS match later).
- **Log** with the existing Quick Log steppers. Each set is its own record (weight, reps, optional RPE, timestamp), not a text string.
- **Rest timer** starts on set completion, shows on the lock screen, and vibrates at zero.
- **Finish** shows a summary (duration, volume, PRs), then optionally publishes to Strava (W3).
- **Offline:** a session survives airplane mode, app kill and phone restart; sync runs when back online.
- **Done when:** a 60-minute session logged fully offline syncs with zero lost sets, and the 811 migrated entries reconcile one-for-one.

### W2. Interactive charts and history

- Per-exercise charts of top set, estimated 1RM and volume, filterable by variant and gym.
- **Tap a point** to open a sheet with that session's date, time, gym, every set, notes and the change from the previous session. Swipe moves between neighbouring points.
- Personal-best markers and a 4/12/52-week range switch.
- Built with a Skia-based chart library, so 800+ points stay at 60 fps.
- **Done when:** a tap on any point in a 52-week chart opens the correct session in under 200 ms.

### W3. Strava integration

- **Connect:** Strava OAuth with the `activity:write` scope. The token exchange and refresh run in a Supabase Edge Function, so the client secret never ships in the app. Refresh tokens are stored encrypted, server-side only.
- **Publish:** on session finish, create a manual activity: sport type Weight Training, name, start time, elapsed time, and a description listing exercises and top sets (e.g. `Bench Press 3×10 @ 45 kg`). Publishing is one tap and never automatic until the user opts in.
- **Read-back:** none by default. If heart-rate or calorie data is wanted, read it from Apple Health / Health Connect instead of Strava. Strava data cannot be shown to other users, cached past policy limits, or used in AI prompts.
- **Limits:** 1 athlete in single-player mode, self-upgrade to 10; beyond 10 needs Strava's Extended Access review, with no guaranteed timeline.
- **Done when:** a finished session appears on your Strava feed with the correct duration and description, and disconnecting revokes the token.

### W4. Claude agent: plan ingestion

The compliant route is a **Gym Tracker connector**: a remote MCP server hosted as a Supabase Edge Function, secured with Supabase Auth's OAuth 2.1 server. Each user signs in once when adding it in Claude.

| Tool exposed to Claude | Purpose | Guard |
| --- | --- | --- |
| `list_exercises`, `get_history` | Read the user's exercises and recent sessions for context | Read-only; the user's own rows only (row-level security) |
| `create_plan_draft` | Write a multi-week plan (days, exercises, sets, rep ranges, target loads) | Lands as a **draft**; the user approves it in the app |
| `record_body_scan` | Store body-scan metrics (weight, lean mass, body fat %, segmental lean mass) and scan date | Needs prior in-app health-data consent; values range-checked |
| `propose_progression` | Suggest the next loads per exercise | Returns values checked against W5 rules; never auto-applied |

- **PDF workout plans:** the user uploads the PDF in a Claude chat with the connector on. Claude reads it, maps exercises to the user's list (new ones flagged), and calls `create_plan_draft`.
- **Typed workouts:** same flow from free text, e.g. "PPL, 4 days, hypertrophy".
- **In-app alternative (optional):** the user pastes their own Anthropic API key, stored in the iOS Keychain or Android Keystore and sent only to Anthropic. The app sends the PDF to the Messages API and receives the same JSON plan schema. Usage is billed to that key.
- A published Claude **Skill** describing the plan schema and coaching rules keeps both paths consistent.
- **Done when:** a 4-week PDF plan becomes an approved in-app plan with every exercise mapped or flagged, and no write happens without approval.

### W5. Body scan and progression recommendations

- **Inputs:** body-scan files (e.g. InBody or DEXA reports) read through W4, or entered manually; goal (strength, hypertrophy, recomposition); training history.
- **Engine (in-app, deterministic):** double progression on rep ranges (add load when the top of the range is hit for all sets), with increments by equipment (e.g. 2.5 kg barbell, the next dumbbell size). Estimated-1RM trend and a weekly cap on load increases guard against jumps.
- **Body scan's role:** adjusts volume and goal emphasis (e.g. lean-mass trend vs. bodyweight trend), never prescribes diet or medical action.
- **Claude's role:** explains the recommendation in plain language and may propose alternatives; the engine validates every number before it is shown.
- **Wording:** every recommendation is labelled general fitness guidance, with advice to consult a professional for injury or medical conditions.
- **Done when:** recommendations replay correctly against your 2025–26 history (back-test), and no suggestion exceeds the weekly cap.

## Australian regulation and security

Once body-scan data is collected, the app is a health service provider holding sensitive information. The Privacy Act then applies in full, whatever the turnover.

### Regulatory obligations register

| # | Obligation | Source | Applies because | Control in this plan | Phase |
| --- | --- | --- | --- | --- | --- |
| R1 | Privacy Act 1988 applies regardless of the small business exemption | [OAIC: health service provider](https://www.oaic.gov.au/privacy/your-privacy-rights/health-information/what-is-a-health-service-provider) | Assessing or improving an individual's physical health while holding health information | Treat the app as an APP entity from first public release; APP 1 privacy policy in-app and on the web | P2 |
| R2 | Express, informed, specific consent before collecting health information (APP 3) | [OAIC APP Guidelines ch. B](https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-b-key-concepts) | Body-scan metrics and progression advice are health information | Separate opt-in screen before the first body scan; withdrawable in Settings; scan data deletable on its own | P4 |
| R3 | Collection notice (APP 5), use limited to stated purpose (APP 6), access and correction (APP 12, 13) | OAIC APP Guidelines | Any personal information | Notice at sign-up; in-app data export (JSON/CSV) and edit | P2 |
| R4 | Cross-border disclosure (APP 8) | OAIC APP Guidelines | Data sent to Anthropic (US) and Strava (US) | Host the database in Sydney; disclose Anthropic and Strava as overseas recipients; both are user-initiated and opt-in | P2 |
| R5 | Notifiable Data Breaches scheme | [OAIC NDB guide](https://www.oaic.gov.au/privacy/notifiable-data-breaches/quick-reference-guide-for-responding-to-data-breaches) | Health information held | Breach runbook: assess within 30 days, notify individuals and the OAIC as soon as practicable; access logs retained 12 months | P2 |
| R6 | Statutory tort for serious invasions of privacy (from 10 June 2025) | [OAIC](https://www.oaic.gov.au/privacy/your-privacy-rights/more-privacy-rights/statutory-tort-for-serious-invasions-of-privacy) | Misuse of personal information | Data minimisation; no sharing beyond R4; no analytics SDKs that collect identifiers | P2 |
| R7 | TGA software-as-medical-device rules | [TGA wellness exclusion](https://www.tga.gov.au/resources/guidance/understanding-general-health-or-wellness-software-exclusion) | Excluded only while the app promotes general wellness and makes no claims about serious disease | Wellness-only claims in store listings and UI; no diagnosis, disease thresholds or clinical use; legal check before any medical feature | P1–P5 |
| R8 | Australian Consumer Law: no misleading claims | ACL (Competition and Consumer Act 2010, Sch. 2) | Store listing and in-app claims about results | No promised outcomes ("gain X kg"); recommendations labelled as estimates | P5 |
| R9 | Apple: in-app account deletion; consent before sharing personal data with third-party AI; HealthKit data not used for advertising or stored in iCloud | [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) 5.1.1(v), 5.1.2(i), 5.1.3 | iOS release | Delete-account flow that purges server data; explicit AI-sharing consent; privacy nutrition label | P5 |
| R10 | Google Play: Data safety form, Health apps declaration, Health Connect permissions declaration | [Play: health apps declaration](https://support.google.com/googleplay/android-developer/answer/14738291?hl=en) | Android release with health features | Complete the forms; request only the Health Connect data types used | P5 |

### Security controls

| Control | Implementation |
| --- | --- |
| Authentication | Supabase Auth with email magic link plus Sign in with Apple / Google; optional passkeys. Short-lived JWTs, refresh token rotation |
| Authorisation | Postgres row-level security on every table (`user_id = auth.uid()`); tested with a deny-by-default test suite in CI |
| Secrets | Strava client secret and any service keys only in Edge Function secrets; nothing secret in the app bundle; the user's own Anthropic key only in Keychain/Keystore |
| Data at rest | Supabase encryption at rest; on-device SQLite encrypted (SQLCipher) because it holds health data; body-scan files deleted after extraction unless the user keeps them |
| Data in transit | TLS only; certificate pinning not required, but no plain-HTTP fallbacks |
| MCP connector | OAuth 2.1 with PKCE; scopes split read vs write; every write lands as a draft; tool inputs schema-validated; rate-limited per user |
| Prompt injection | Treat PDF contents as data; the connector never deletes; destructive actions are app-only |
| Secure development | OWASP MASVS L1 checklist before release; dependency scanning (Dependabot) and secret scanning on the GitHub repo; signed builds |
| Backups | Free tier has no automatic backups: nightly `pg_dump` via GitHub Actions to an encrypted artefact (7-day retention) |
| Logging | Auth and data-export events logged; no set data or health values in logs |

## Cost model

The build and backend can run at $0; publishing does not. The unavoidable minimum is US$25 once for Google Play, about AU$149 a year for the Apple App Store, and a Strava subscription while the Strava integration exists.

| Item | Cost | Free-tier limit that matters | Source |
| --- | --- | --- | --- |
| Apple Developer Program | US$99 / yr (about AU$149) | Required for App Store and TestFlight; waivers only for non-profits, education and government | [Apple](https://developer.apple.com/programs/enroll/), [OzBargain](https://www.ozbargain.com.au/node/519154) |
| Google Play developer account | US$25 once | New personal accounts need 12 testers opted in for 14 consecutive days before production | [Play fee](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en), [testing rule](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en) |
| Strava API | Free API; developer needs a paid Strava subscription (Standard tier, from 1 June 2026) | 1 athlete by default, self-upgrade to 10; 200 requests / 15 min, 2,000 / day | [Strava update](https://communityhub.strava.com/insider-journal-9/an-update-to-our-developer-program-13428), [Strava getting started](https://developers.strava.com/docs/getting-started/) |
| Supabase (database, auth, storage, functions) | $0 (Pro is US$25 / month) | 500 MB database, 1 GB storage, 5 GB egress, 50,000 MAU, 500,000 function calls; paused after 1 week of inactivity; no automatic backups | [Supabase pricing](https://supabase.com/pricing) |
| Expo EAS Build | $0 (Starter US$19 / month) | 15 Android + 15 iOS cloud builds per month; 1,000 MAU for over-the-air updates | [Expo pricing](https://expo.dev/pricing) |
| Claude | $0 to the app | Users run plan ingestion on their own Claude plan through the connector; in-app import bills the user's own API key | [Anthropic policy (The Register)](https://www.theregister.com/2026/02/20/anthropic_clarifies_ban_third_party_claude_access/) |
| GitHub (code, CI, Pages for privacy policy) | $0 | Private repo and Actions minutes on the free plan | — |

Sizing check: 811 entries took no meaningful space in Notion. At roughly 25 sets per session and 4 sessions a week, one user adds about 5,000 set rows a year. That is well under 5 MB, so the 500 MB free database covers hundreds of active users. The binding free-tier limits are the one-week inactivity pause and the lack of backups. For personal use, regular training keeps the project active and the app works offline if it pauses. For a public launch, budget Supabase Pro (US$25 a month) for daily backups and no pausing.

## Delivery roadmap

Five phases over about 16 weeks. Each ends in a working app you can use, and none starts until the previous gate passes.

> Roadmap (diagram in the Claude doc version):
> - **P1 Foundation (weeks 1–3):** Expo app shell, Supabase project (Sydney); schema, RLS, auth, Notion import; Quick Log ported. **Gate:** 811 of 811 entries reconciled; RLS deny tests pass.
> - **P2 Sessions and sync (weeks 4–7):** start/finish sessions, per-set records; offline SQLite, sync, rest timer; privacy policy; 12 Android testers begin. **Gate:** 60-minute offline session, zero sets lost.
> - **P3 Charts and history (weeks 8–9):** tap-to-inspect charts, PR markers; variant and gym filters; CSV/JSON export. **Gate:** tapped point opens its session in under 200 ms.
> - **P4 Integrations (weeks 10–13):** Strava connect and publish; Claude connector, plan drafts, Skill; body-scan consent, progression engine. **Gate:** PDF plan approved in app; Strava post verified; back-test within caps.
> - **P5 Hardening and release (weeks 14–16):** OWASP MASVS L1, backups, NDB runbook; store forms; Play production, App Store if enrolled. **Gate:** store approval; R1–R10 evidenced.

Notion stays the system of record until the P2 gate passes. Start the Google Play 12-tester, 14-day clock during P2, so it is not on the critical path at release. Durations assume about 10 hours a week of solo development (see Appendix A).

## Risk register

| # | Risk | Likelihood | Impact | Mitigation | Owner |
| --- | --- | --- | --- | --- | --- |
| K1 | Strava changes terms again or refuses capacity above 10 athletes | Medium | Medium | Strava is an optional publish target, not a dependency; also write sessions to Apple Health / Health Connect | Sev |
| K2 | Free Supabase project pauses or data is lost (no automatic backups) | Medium | High | Offline-first client holds full history; nightly encrypted dump; move to Pro before public launch | Sev |
| K3 | Claude writes a wrong plan or load from a misread PDF | Medium | Medium | Drafts only; schema validation; progression engine caps; side-by-side review screen before approval | Sev |
| K4 | Body-scan features drift into medical claims and fall under TGA regulation | Low | High | Wellness-only wording reviewed at each release; no disease, injury or diet prescriptions | Sev |
| K5 | Health-data breach (device loss, misconfigured row-level security) | Low | High | Encrypted local DB; RLS tests in CI; NDB runbook; minimal data retention | Sev |
| K6 | App Store rejection (account deletion, AI data-sharing consent, health claims) | Medium | Medium | Pre-submission checklist mapped to R9; TestFlight review first | Sev |
| K7 | Google Play 12-tester requirement delays the Android launch | High | Low | Recruit 12+ testers (gym friends) at the start of Phase 2; run the 14 days in parallel with development | Sev |
| K8 | Anthropic connector or MCP spec changes break plan ingestion | Low | Medium | Keep the plan JSON schema app-owned; the in-app API-key path as fallback | Sev |
| K9 | Solo-developer bandwidth | High | Medium | Ship phase by phase; each phase usable alone; Notion stays the fallback until Phase 2 exit | Sev |

## Further recommendations

These are beyond the brief, ordered by value for effort.

1. **Apple Health and Health Connect.** Write each session as a workout, and read bodyweight and heart rate. This gives Strava-independent tracking and smartwatch data. Google Fit APIs are supported only until the end of 2026, so use Health Connect, not Fit ([Android migration guide](https://developer.android.com/health-and-fitness/health-connect/migration/fit)).
2. **Plate calculator and warm-up generator.** Per-side plates for barbell lifts and ramped warm-up sets from the working weight. Cheap to build and used every session.
3. **Lock-screen controls.** iOS Live Activity and an Android ongoing notification for the rest timer and next set.
4. **Watch companion (later).** Apple Watch / Wear OS set logging. High effort; defer until after launch.
5. **Exercise library hygiene.** Merge duplicates, add primary and secondary muscles, and store each equipment's increment (e.g. 2.5 kg plates, 1.25 kg dumbbells). The progression engine depends on this.
6. **Data portability.** One-tap CSV/JSON export and a Notion export, so you are never locked in. This also satisfies APP 12 access requests.
7. **Analytics without identifiers.** If needed, self-hosted, privacy-preserving crash reporting only (e.g. Sentry with PII scrubbing). No advertising SDKs, given health data.
8. **Accessibility.** 44 pt minimum touch targets (already met), Dynamic Type, VoiceOver labels on steppers, and colour plus symbol (▲/▼) for deltas (already met).
9. **Age gate.** Restrict accounts to 18+ for now; serving minors brings additional privacy obligations (see Appendix A).
10. **Monetisation later.** If you ever charge for it, store commissions and ACL consumer guarantees apply. Check current small-business commission rates at that point, and keep a free core.

## Appendix A: Open items and assumptions

These items are inferred or not yet verified against a primary source. Each needs confirmation before the phase it affects.

| # | Item | Why it is open | Confirm by | Affects |
| --- | --- | --- | --- | --- |
| A1 | Whether a single-player (1-athlete) Strava app also needs the developer's paid Strava subscription | Strava's June 2026 update says new Standard-tier developers need one; single-player mode is not addressed explicitly | Strava API settings dashboard when registering the app | P4, cost |
| A2 | Strava `sport_type` value for strength sessions (`WeightTraining`) | The API reference page fetched did not list the full SportType enum | Strava API models reference | W3 |
| A3 | Supabase free projects can be created in the Sydney region (ap-southeast-2) | Region choice is standard, but its availability on the free plan was not checked on a primary page | Supabase project creation screen | R4 |
| A4 | Custom connector limits on the Claude Free plan | Docs confirm Free, Pro and Max can add custom connectors; any per-plan count limit was not confirmed | Claude Help Center | W4 |
| A5 | Audience: personal use only, or public | Personal use lowers the compliance and store burden; public triggers R1–R10 in full | Your decision (Executive summary) | Scope |
| A6 | Children's online privacy obligations if under-18s could use the app | Privacy reforms include a children's online privacy code; its final scope and dates were not verified here | OAIC website before public launch | Age gate |
| A7 | Body-scan formats you actually have (InBody, DEXA, smart scale export) | Extraction prompts and field mapping depend on the report layout | Share one sample report | W5 |
| A8 | Equipment increments at each gym (smallest plate and dumbbell steps at Nairne and Pirie St) | The progression engine needs real increments | Your input | W5 |
| A9 | Variant vs gym load differences | You noted the same machine feels different between gyms; whether to keep separate progression tracks per gym | Your decision | W2, W5 |

**A10 — Schedule assumption.** The 16-week roadmap assumes about 10 hours a week of solo development with Claude Code assistance. It is an estimate, not a measured velocity. Re-baseline after the P1 gate.

## Appendix B: Sources

All pages opened on 2 October 2026.

- [Apple Developer Program — enrol](https://developer.apple.com/programs/enroll/)
- [OzBargain — Apple Developer Program AU$149](https://www.ozbargain.com.au/node/519154)
- [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play — registration fee](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en)
- [Google Play — testing requirements for new personal accounts](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)
- [Google Play — Health apps declaration](https://support.google.com/googleplay/android-developer/answer/14738291?hl=en)
- [Android — Google Fit migration guide](https://developer.android.com/health-and-fitness/health-connect/migration/fit)
- [Strava — An update to our developer program (1 June 2026)](https://communityhub.strava.com/insider-journal-9/an-update-to-our-developer-program-13428)
- [Strava — Getting started](https://developers.strava.com/docs/getting-started/)
- [Strava — API reference](https://developers.strava.com/docs/reference/)
- [Strava — API Agreement](https://www.strava.com/legal/api)
- [Terra — Strava API changes 2026](https://tryterra.co/blog/strava-api-changes-2026) (secondary; AI-use restriction)
- [Supabase — pricing](https://supabase.com/pricing)
- [Supabase — MCP authentication with the OAuth 2.1 server](https://supabase.com/docs/guides/auth/oauth-server/mcp-authentication)
- [Expo — pricing](https://expo.dev/pricing)
- [Claude — custom connectors with remote MCP](https://claude.com/docs/connectors/custom/remote-mcp)
- [The Register — Anthropic clarifies ban on third-party subscription access (20 Feb 2026)](https://www.theregister.com/2026/02/20/anthropic_clarifies_ban_third_party_claude_access/)
- [OAIC — What is a health service provider?](https://www.oaic.gov.au/privacy/your-privacy-rights/health-information/what-is-a-health-service-provider)
- [OAIC — APP Guidelines, Chapter B: key concepts](https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-b-key-concepts)
- [OAIC — Quick reference guide for responding to data breaches](https://www.oaic.gov.au/privacy/notifiable-data-breaches/quick-reference-guide-for-responding-to-data-breaches)
- [OAIC — Statutory tort for serious invasions of privacy](https://www.oaic.gov.au/privacy/your-privacy-rights/more-privacy-rights/statutory-tort-for-serious-invasions-of-privacy)
- [TGA — General health or wellness software exclusion](https://www.tga.gov.au/resources/guidance/understanding-general-health-or-wellness-software-exclusion)
