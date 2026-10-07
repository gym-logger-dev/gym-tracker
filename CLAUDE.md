# Gym Tracker — project memory for the agent team

You are part of a ten-agent Claude Code team building the Gym Tracker mobile app for Sev (product owner and sole human).
Read this file fully before any work. It overrides your defaults; Sev's direct instructions override it.

## Source of truth (read, never edit)
- `docs/dev-plan.md` — what we are building (architecture, workstreams W1–W5, obligations R1–R10, roadmap P1–P5).
- `docs/agent-team-plan.md` — how this team works (roles, workflows, escalation, guardrails).
If the plan and reality disagree, do not silently pick one: raise an open item (`/raise-question`).

## Product in one paragraph
Offline-first Expo (React Native, TypeScript) app for iPhone and Android to log strength sessions set by set,
show interactive progress charts, publish sessions to Strava, and accept workout plans and body-scan data from
Claude through a remote MCP connector. Backend: Supabase free tier, Sydney region (Postgres + RLS, Auth with
OAuth 2.1 server, Storage, Edge Functions). Australian Privacy Act applies in full because body-scan data is
health information.

## Stack (do not change without an ADR approved by Sev)
- App: Expo SDK (latest stable), Expo Router, TypeScript strict, expo-sqlite + SQLCipher, Drizzle ORM, Victory Native XL.
- Backend: Supabase (Postgres 15+, RLS on every table, Edge Functions in Deno/TypeScript).
- Tests: Jest + React Native Testing Library (unit), pgTAP via `supabase test db` (RLS), Maestro (E2E).
- CI/CD: GitHub Actions, EAS Build/Update/Submit (Submit is run by Sev only).
- Package manager: npm. Node: current LTS.
- Environment: Sev's Windows PC, everything inside WSL2 (Ubuntu) with Docker Desktop's WSL integration. Use Linux paths and tools; never call Windows-side tools except the notification hook.

## Repository map
```
app/                    Expo Router screens            (mobile-dev)
src/                    app logic, db client, sync     (mobile-dev)
src/ui/theme/           design tokens                  (ux-designer)
src/db/schema.ts        local schema                   (architect)
packages/contracts/     shared types, MCP tool schemas (architect)
packages/engine/        progression rules engine       (backend-dev)
supabase/migrations/    SQL migrations, append-only    (architect)
supabase/functions/     Edge Functions                 (backend-dev)
supabase/tests/         pgTAP RLS tests                (qa-engineer)
tests/, e2e/            unit and Maestro tests         (qa-engineer)
docs/                   plans, backlog, ADRs, status, compliance
.github/                CI and templates               (devops-release)
.claude/                team config — no agent edits this
```

## Working rules (all agents)
1. **Stay in your lane.** Only edit paths your agent file says you own. Need a change elsewhere? Ask the owner via the lead.
2. **Branch per story:** `story/STORY-<n>-<slug>`. Never commit to `main`. Never force-push. Developers work in a git worktree.
3. **Small diffs.** One story per PR, ideally < 400 changed lines excluding tests and lockfiles.
4. **Tests are not optional.** Every behaviour change ships with tests. Never weaken or delete a test to make it pass — escalate instead.
5. **`npm run verify` must pass** (lint, typecheck, unit, RLS) before you report done.
6. **Never handle secrets.** Do not read, print, create or commit `.env*`, keys, tokens, or service-role credentials. Use local Supabase (`supabase start`) only. Production is Sev's.
7. **Never spend money or create accounts.** Store submission, paid plans, Apple/Google/Strava/Supabase account actions are Sev's — raise an open item with exact steps.
8. **Don't block, don't guess silently.** If a decision is Sev's (see escalation rules), raise it with `/raise-question`, state your default, and continue on reversible work. Irreversible work waits.
9. **Australian compliance by default.** Health data needs explicit consent (R2). No analytics/ad SDKs. No health values in logs. Wellness wording only — no diagnosis or disease claims (R7). Strava data never goes to Claude or any AI (Strava policy).
10. **Units and locale:** kg, metric, en-AU spelling in UI copy, dates as `d MMM yyyy`, timezone Australia/Adelaide for display; store UTC.
11. **Traceability.** Reference the story ID, workstream (W1–W5) and obligation (R1–R10) in commit messages and PR bodies, e.g. `feat(sessions): rest timer [STORY-014][W1]`.
12. **Identity.** You act as the team's GitHub account (the bot), never as Sev. Every commit ends with a trailer naming you, e.g. `Agent: mobile-dev`. Never change git identity, git credentials or `gh auth`; never print or reference tokens.
13. **Write for Sev.** He is a cybersecurity graduate: terse, precise, audit-ready. Claims must cite a file, test or source; inferences go in open items.

## Escalation — these always go to Sev
Money or accounts · scope change vs `docs/dev-plan.md` · interpreting law or store policy beyond R1–R10 ·
deleting or migrating real user data · production deploys or migrations · store submission · any security
exception · disagreement between agents that the lead cannot resolve with the plan.

## Commands
- `npm run verify` — full local gate
- `npm run test`, `npm run lint`, `npm run typecheck`
- `supabase start` / `supabase test db` — local backend and RLS tests
- `npx expo start` — dev server

## PR hygiene (Sev, 2026-10-07)
- Never open a new docs PR while an earlier docs PR is unmerged. Add to the open one instead.
- Run `gh pr merge` as a standalone command, never chained with other commands.
- Agent memory under `.claude/` is read-only by design. Standing rules live in this file; propose changes as an open item.
