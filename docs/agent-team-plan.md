# Gym Tracker — Claude Agent Team Plan

Oct 2, 2026 · @Sev

## Summary

A team of ten Claude Code agents builds the Gym Tracker app from the [development plan](https://claude.ai/code/artifact/a56d2b6e-02d8-4488-bcd2-42a57043e29e). One lead agent plans and assigns work; specialists build, test and review; and nothing merges without passing automated gates. The team works only in windows you open on your Pro plan, and stops cleanly when you say. It merges its own pull requests once review passes. You sign off phase gates, anything that costs money or touches production, CI or migration changes, store submission, and open questions the agents cannot answer from the plan.

**What you still do (about 1–2 hours a week)**

- Answer questions in the open-items register, normally within 48 hours. Each new question pings your phone. Agents work around anything blocked.
- Open work windows with /work-window when you have spare Claude capacity, and /pause when you need it back. The team works one agent at a time, so a window never surprises you with a burst of usage.
- Do the account and payment steps agents must never do: Apple, Google, Strava and Supabase sign-ups, billing, and store submission.
- Test on your own phone at each phase gate.

**How to hand this plan to Claude Code**

1. Create an empty private GitHub repository and clone it.
2. Copy in the starter kit attached to this plan (`CLAUDE.md`, `.claude/`, `docs/`, `.github/`). Both plans are already inside it as `docs/dev-plan.md` and `docs/agent-team-plan.md`.
3. Run `claude --agent lead` in the repository, then `/kickoff P1`. The lead reads both plans, drafts the P1 backlog, and raises its first questions in `docs/OPEN_ITEMS.md`.

The starter kit is the executable form of this plan; this document is the reasoning behind it.

## Operating model

The lead is the only agent that talks to you. It moves each story through four stages, one specialist at a time, and nothing reaches `main` without passing CI and the merge gate.

> Operating model (diagram in the Claude doc version): Sev opens `/work-window` and `/pause`, answers questions and signs off gates → **lead** (main session) delegates one agent at a time → **1 Plan** (product-owner, architect, ux-designer) → **2 Build** (mobile-dev or backend-dev, own worktree) → **3 Verify** (qa-engineer, code-reviewer, security-compliance; "changes requested" loops back to Build) → **4 Ship** (devops-release: CI green, preview; lead opens PR) → **merge-gate + CI** (review and compliance labels; sev-approved if sensitive) → **main** (protected, squash only). The lead raises questions into the open-items register, which pushes an alert to Sev's phone.

A failed verification sends the story back to build, up to three times before it becomes an open item. Any agent can raise a question; the lead consolidates it into the register, which alerts your phone.

## Agent roster

Ten roles mirror a small product team. Each is a Claude Code subagent file in `.claude/agents/`, with its tools, model and file ownership fixed in its frontmatter, so no agent can quietly do another's job.

| Agent | Role | Owns (may edit) | Must not | Key outputs |
| --- | --- | --- | --- | --- |
| `lead` | Engineering lead and orchestrator; runs as the main session; merges PRs that pass the merge rules | `docs/backlog/`, `docs/status/`, `docs/HANDOFF.md`, `docs/OPEN_ITEMS.md` | Write app code; merge without review labels; answer Sev-level questions | Phase backlog, delegation, PRs, merges, handoff, status |
| `product-owner` | Turns the dev plan into stories with testable acceptance criteria | `docs/backlog/STORY-*.md` | Change scope without an open item | Stories, acceptance checks |
| `architect` | Owns structure, data model and contracts | `docs/adr/`, new files in `supabase/migrations/`, `src/db/schema.ts`, `packages/contracts/` | Implement features; edit committed migrations | ADRs, schema, sync and MCP contracts |
| `ux-designer` | Design system, screen specs, copy, accessibility | `src/ui/theme/`, `docs/design/` | Change business logic | Tokens, screen specs, UX copy |
| `mobile-dev` | Expo app: screens, local DB, sync client, charts | `app/`, `src/` (except theme and schema) | Touch backend, migrations or QA's tests | Feature code with unit tests, in its own worktree |
| `backend-dev` | Supabase: Edge Functions, Strava, MCP connector, progression engine | `supabase/functions/`, `packages/engine/` | Touch any remote Supabase project | Functions and engine with unit tests, in its own worktree |
| `qa-engineer` | Independent test strategy and verification | `tests/`, `e2e/`, `supabase/tests/` | Edit app source to make a test pass | Unit, RLS (pgTAP) and E2E (Maestro) tests; bug reproductions |
| `code-reviewer` | Independent review of every diff | Nothing (read-only) | Write code | `VERDICT: APPROVE` or blockers with file and line |
| `security-compliance` | Australian privacy, store rules, OWASP MASVS; veto on sensitive changes | `docs/compliance/` | Write code | Reviews mapped to R1–R10, threat models, privacy-policy drafts |
| `devops-release` | CI, EAS builds, preview channels, release notes | `.github/`, `eas.json`, `docs/release/` | Submit to stores; hold credentials | Green CI, preview builds, release checklist |

**Why this split:** builders never review or test their own work, and reviewers never write the code they judge. The two agents with veto power (code-reviewer, security-compliance) cannot edit app code. Ownership is enforced by a hook in each agent's file that blocks edits outside its paths, not left to good behaviour.

**Models on Pro:** every agent runs on Sonnet by default to stretch your Pro capacity. Switching the architect, code-reviewer and security-compliance to Opus for phase-gate reviews is open item OI-006.

## Use cases and workflows

Eight repeatable workflows cover the work. Each is a skill (`/name`) the lead or you can invoke, so the steps are the same every time.

| # | Use case | Trigger | Agents, in order | Output | Your touchpoint |
| --- | --- | --- | --- | --- | --- |
| U1 | Kick off a phase | `/kickoff P1` | lead → product-owner → architect | Phase backlog of stories, ADRs, first open items | Approve the backlog |
| U2 | Deliver a story | `/story STORY-012` | architect (if needed) → ux-designer (if UI) → mobile-dev or backend-dev → qa-engineer → code-reviewer → security-compliance (if labelled) → devops-release → lead | A pull request with tests, review verdicts and a preview build | None; the lead merges. You only see PRs labelled needs-sev |
| U3 | Fix a bug | `/bugfix` or a GitHub issue labelled `bug` | qa-engineer reproduces with a failing test → developer fixes → code-reviewer | PR whose failing test now passes | None |
| U4 | Compliance check | `/compliance-check` on any PR touching auth, data, health, Strava or Claude | security-compliance | Findings mapped to R1–R10 and the security controls; pass or block | Only if it escalates |
| U5 | Migrate Notion history | `/migrate-notion` in P1 | architect → backend-dev → qa-engineer | Import script, 811-of-811 reconciliation report | Supply the Notion CSV export |
| U6 | Phase gate | `/phase-gate P2` | qa-engineer → security-compliance → lead | Gate report with evidence for each exit criterion | Test on your phone; sign off |
| U7 | Ask Sev | `/raise-question` (any agent) | lead consolidates | New open item, plus a GitHub issue labelled `needs-sev` | Answer within 48 hours |
| U8 | Weekly status | `/status-report` (every Friday) | lead | `docs/status/YYYY-Www.md`: done, next, blocked, open items, usage | Read (5 minutes) |

### Definition of ready (before a developer starts)

- The story has acceptance criteria written as checks ("Given … when … then …").
- Dependencies and data-model changes are named, and ADRs exist where needed.
- No blocking open item is attached.

### Definition of done (before a PR merges)

- `npm run verify` passes: lint, type-check, unit tests, RLS tests.
- New behaviour has tests written or reviewed by qa-engineer.
- code-reviewer has approved; security-compliance has approved if the story is labelled `data`, `auth`, `health` or `integration`.
- A preview build or Expo Go link is attached, plus a short "how to test" for you.
- Docs are updated: ADR, story status, open items, and the obligations register where relevant.

## Escalation to Sev

Agents never block and never guess silently: a question goes into the register with a recommendation and a safe default, your phone is alerted, and the team carries on with reversible work.

### What always comes to you

| Category | Examples | Default while waiting |
| --- | --- | --- |
| Money or accounts | Apple, Google Play, Strava, Supabase sign-ups; any paid tier | `WAIT` |
| Scope | Anything not in the dev plan, or a plan item that proves unworkable | Continue other stories |
| Law and store policy beyond R1–R10 | New data types, minors, new third parties | `WAIT` |
| Production and real data | Prod migrations, Notion import into prod, deleting user data | `WAIT` |
| Guardrail changes | CI workflows, `.claude/`, migrations, app permissions (`sev-approved` label) | `WAIT` |
| Phase gates | Sign-off after you test on your phone | Next phase does not start |
| Unresolved disagreement | code-reviewer or security-compliance blocks three times on the same story | Story parked |

### How questions reach you

1. Any agent runs `/raise-question`. It adds a row to `docs/OPEN_ITEMS.md` with options, a recommendation and a default.
2. A hook spots the new row and sends its ID and one-line title to your phone through **ntfy**, a free push-notification app. Blocking items are sent at high priority. Health data, code and personal details are never included.
3. Blocking or `WAIT` items are also opened as GitHub issues labelled `needs-sev`.
4. When Claude Code itself is waiting on you, or stops at a Pro usage limit, a second hook alerts your phone and logs it in `docs/status/waiting.log`.
5. You answer by filling in the Decision column, or by replying on the issue. The lead applies answers at the start of the next work window.

Because the agents use their own GitHub account, the GitHub mobile app also notifies you of their `needs-sev` issues and pull requests. ntfy remains the fast, guaranteed channel.

### Register format

`| ID | Status | Blocking | Question | Raised by | Date | Phase | Options | Recommendation | Default if no answer by | Decision | Decided |`

Defaults are only ever reversible choices. Anything irreversible, paid or legal defaults to `WAIT`. The register is seeded with 14 items (OI-001 to OI-014) from both plans; OI-007 and OI-012 are already closed.

## Claude Code repository setup

The starter kit uses only documented Claude Code features: subagent files, skills, hooks, permission rules and project memory. It runs with agent teams switched off, because they are experimental and use far more tokens than Pro allows.

```
CLAUDE.md                      project memory: stack, rules, escalation, commands
README.md                      setup and daily use for Sev
.claude/
  settings.json                permissions (allow / ask / deny), hooks, env
  settings.local.example.json  template for your ntfy topic (real file is gitignored)
  agents/                      10 subagent definitions (frontmatter + role prompt)
  skills/                      10 workflows: kickoff, work-window, pause, story, bugfix,
                               raise-question, phase-gate, compliance-check,
                               migrate-notion, status-report
  hooks/                       guard-protected, guard-bash, guard-paths, format,
                               verify-gate, notify, alert-open-item, phone
docs/
  dev-plan.md                  the development plan (source of truth)
  agent-team-plan.md           this plan (source of truth)
  OPEN_ITEMS.md  HANDOFF.md    escalation register; resume point
  backlog/  adr/  design/  status/  compliance/  release/
.github/
  workflows/ci.yml             lint, types, tests, RLS tests
  workflows/merge-gate.yml     enforces review, compliance and sev-approved labels
  PULL_REQUEST_TEMPLATE.md  ISSUE_TEMPLATE/needs-sev.md  dependabot.yml
```

| Mechanism | How it is used here | Claude Code feature |
| --- | --- | --- |
| Roles | One Markdown file per agent with `name`, `description`, `tools`, `model`, `isolation: worktree` for builders, and per-agent `hooks` | [Subagents](https://code.claude.com/docs/en/sub-agents) |
| Lead as main session | `claude --agent lead`; its `initialPrompt` reads HANDOFF and open items on start | Subagent `initialPrompt` |
| Repeatable workflows | Skills with `disable-model-invocation: true` for the ones only you trigger (`/work-window`, `/pause`, `/kickoff`, `/phase-gate`) | [Skills](https://code.claude.com/docs/en/skills) |
| File ownership | `guard-paths.sh` in each agent's PreToolUse hook; exit code 2 blocks an edit outside the agent's paths | [Hooks](https://code.claude.com/docs/en/hooks-guide) |
| Done means green | `verify-gate.sh` on builders' Stop hook runs `npm run verify` and sends failures back | Hooks |
| Capacity | `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS=1`, agent teams off, all Sonnet | Settings `env` |

All ten agents and their hooks were checked against the current docs. The three guard hooks were tested against sample commands and paths: force-push, push to `main`, `--admin` merges, `eas submit`, `supabase db push` and `.env` reads are blocked; normal work is allowed.

## Guardrails

Every high-impact action is blocked in at least two independent layers, so one misconfiguration does not open it up.

| Risk | Layer 1: Claude Code permissions | Layer 2: hooks | Layer 3: GitHub |
| --- | --- | --- | --- |
| Bad code reaches `main` | `git push origin main` and `--force` denied | `guard-bash` blocks push to main, force-push, `--admin` merges | Branch protection: PR required; `ci` and `merge-gate` must pass |
| Merge without review | Merge allowed only as `gh pr merge … --squash --delete-branch` | Non-squash and `--admin` merges blocked | `merge-gate` requires `review:approved`, plus `compliance:approved` for sensitive labels |
| Agents change their own rules | `Edit(./.claude/**)` and the plans denied | `guard-protected` blocks `.claude/`, `CLAUDE.md`, plans | `merge-gate` requires `sev-approved` for those paths |
| Secrets leak | `Read(./.env*)`, key files and `printenv` denied | `guard-bash` blocks env reads and `curl` uploads; `guard-protected` blocks secret files | Secret scanning; `.gitignore` covers secret files |
| Production damage | `supabase link`, `db push`, `functions deploy`, `eas submit` denied | Same commands blocked by pattern | Production steps exist only in your runbook |
| Agent edits another's files | — | `guard-paths` per agent | `code-reviewer` checks ownership |
| Migration rewrites history | — | Committed migrations are read-only | `sev-approved` needed for migration PRs |
| New dependencies | `npm install` set to ask | — | Dependabot; ADR required |
| Runaway usage on Pro | One subagent at a time; agent teams off | `StopFailure` hook on rate limits writes a handoff and alerts you | — |

**Agents' own GitHub account (decided 2 Oct 2026).** The agents work through a dedicated bot account, not your login. It is a member of a free GitHub organisation that owns the repo, with Write access to this one repo and a token limited to it. Every commit names the agent in an `Agent:` trailer. `merge-gate` accepts `sev-approved` only when your own account applied it. The agents cannot change their git identity, credentials or `gh` login. Your own token never enters the agents' environment.

**Cost and capacity**

- Sonnet everywhere by default; `maxTurns` and `effort` are set per role.
- One story per window by default. The lead reports stories per window so you can size the next one.
- EAS builds are batched, with over-the-air updates for JavaScript-only changes, to stay within 15 + 15 free builds a month.
- CI runs once per push, cancels superseded runs, and times out at 15 minutes.

## Execution plan

The team follows the five phases of the development plan. The window counts below are rough estimates for one-story windows on Pro, to be re-baselined after P1.

| Phase | Lead agents | First stories the team will write | Gate evidence | Needs you for | Est. windows |
| --- | --- | --- | --- | --- | --- |
| P1 Foundation | architect, backend-dev, mobile-dev, qa-engineer | Repo scaffold and CI; Supabase local stack and schema with RLS; auth; Notion import with reconciliation; Quick Log screen ported | 811/811 reconciliation report; RLS deny tests green | OI-001, OI-003, OI-013; bot account; Supabase project in Sydney; production import | 8–12 |
| P2 Sessions and sync | mobile-dev, backend-dev, qa-engineer, security-compliance | Session start/finish; per-set records; encrypted SQLite; outbox sync; rest timer; privacy policy and collection notice | 60-minute offline session, zero lost sets; R1, R3, R4, R5, R6 reviewed | Approve privacy policy text; recruit 12 Android testers | 10–14 |
| P3 Charts and history | ux-designer, mobile-dev, qa-engineer | Chart screen; tap-to-inspect sheet; PR markers; filters; CSV/JSON export | Tap opens session under 200 ms; export matches DB | OI-011 | 5–8 |
| P4 Integrations | backend-dev, architect, security-compliance, qa-engineer | Strava connect and publish; MCP connector with OAuth; plan drafts and approval screen; body-scan consent; progression engine | PDF plan approved in app; Strava post verified; engine back-test within caps; R2 and R4 reviewed | OI-005, OI-009, OI-010; Strava app registration; adding the connector in Claude | 12–18 |
| P5 Hardening and release | security-compliance, devops-release, qa-engineer | MASVS L1 fixes; account deletion; store listings and forms; release builds | MASVS checklist; R7–R10 evidenced; store forms drafted | OI-004; store accounts and submission | 6–10 |

Each phase starts with `/kickoff` and ends with `/phase-gate`, which always stops for your sign-off.

## Bootstrap runbook

About 60 minutes, once. After that, your weekly routine is: open a window, answer pings, test at gates.

1. **Set up WSL2 on your Windows PC.** Run `wsl --install` (Ubuntu), and turn on Docker Desktop → Settings → Resources → WSL integration for Ubuntu. Inside Ubuntu install Git, GitHub CLI, Node LTS (via nvm), Supabase CLI, `jq` and Claude Code (signed in with Pro). Keep the repo under `~/code`, not `/mnt/c`.
2. **Create the org and repo.** A free GitHub organisation, then a private repo inside it. Unzip the starter kit, put your username in `.github/CODEOWNERS`, run `chmod +x .claude/hooks/*.sh`, commit and push. Set the repo variable `SEV_LOGIN` to your username.
3. **Protect `main`.** Follow OI-001: squash merges only, required checks `ci` and `merge-gate`, no force-push, and create the labels.
4. **Give the agents their own account.** Follow the OI-012/OI-013 detail in `docs/OPEN_ITEMS.md`: bot account, Write on this repo only, single-repo fine-grained token in `.claude/settings.local.json`, repo-local git identity, `gh auth setup-git`.
5. **Phone alerts.** Install ntfy, subscribe to a long random topic, and add it to `.claude/settings.local.json`. Watch the repo in the GitHub app from your own account.
6. **Trust and test.** Run `claude` in the repo and accept the trust prompt. Run `/agents` to confirm all ten agents are listed. Ask Claude to "push a test commit to main"; it must be blocked. Add a dummy open-item row and check your phone rings.
7. **Start the team.** Run `claude --agent lead`, then `/kickoff P1`. The first story, STORY-000, proves the bot identity and merge gate work. Then `/work-window stories=1`.
8. **Notion export (when asked).** Export both Notion databases as CSV into `data/import/` (OI-003). The folder is gitignored.

If a window is cut short by a usage limit, run `claude --agent lead` again later; it starts from `docs/HANDOFF.md`.

## Appendix A: Decisions and open items

### Decisions recorded (2 Oct 2026)

| # | Decision | Effect on this plan |
| --- | --- | --- |
| D1 | Claude Code runs on the Pro plan; agents work only when you start them and stop when you say | `/work-window` and `/pause`; one agent at a time; agent teams off; all Sonnet; handoff file |
| D2 | Agents may merge once review passes | Lead merges under the rules in `lead.md`; `merge-gate` check; `sev-approved` for sensitive paths |
| D3 | The team runs on your PC, with GitHub | No cloud or GitHub Actions agents; CI only runs tests |
| D4 | Questions arrive in the register and as GitHub issues, plus a phone alert | ntfy push from hooks; `needs-sev` issues |
| D5 | Your PC is Windows with Docker Desktop (closes OI-007) | Everything runs in WSL2 (Ubuntu) with Docker's WSL integration; repo kept in the Linux filesystem |
| D6 | The agents get their own GitHub account (closes OI-012) | Free org owns the repo; bot account with a single-repo token; `Agent:` commit trailers; `merge-gate` checks you applied `sev-approved`; first P1 story verifies it |

### Open items specific to this plan

These are seeded in `docs/OPEN_ITEMS.md` along with the development plan's open items.

| # | Item | Why it is open | Default |
| --- | --- | --- | --- |
| OI-006 | Whether your Pro plan gives enough Opus usage in Claude Code for gate reviews | Plan model access and limits change; not verified for your account | All Sonnet |
| OI-013 | Create a free GitHub organisation to own the repo | Fine-grained tokens can only be limited to a single repository the token's owner or organisation owns; with the repo on your personal account, the bot would need a broader token | `WAIT` |
| OI-014 | Verify GitHub's terms on machine accounts and fine-grained token scoping | GitHub's pages could not be fetched while you were away; the setup relies on one free machine account per person and single-repo org tokens, from prior knowledge | Proceed as planned |

### Assumptions to confirm on first run

- **A1.** Hooks declared in a subagent's frontmatter run while that subagent works, and a `Stop` hook there fires when it finishes. This is documented, but confirm in the smoke test.
- **A2.** `guard-paths.sh` resolves paths inside git worktrees correctly. Tested on a normal checkout and a worktree in this workspace; confirm on your PC.
- **A3.** The ntfy public server stays free and reachable from your network. If not, the same hook can post to any webhook you prefer.
- **A4.** Window estimates in the execution plan are guesses until P1 gives real stories-per-window data.

## Appendix B: Sources

Claude Code documentation pages opened on 2 October 2026.

- [Claude Code — Create custom subagents](https://code.claude.com/docs/en/sub-agents)
- [Claude Code — Orchestrate teams of Claude Code sessions (agent teams, experimental)](https://code.claude.com/docs/en/agent-teams)
- [Claude Code — Automate actions with hooks](https://code.claude.com/docs/en/hooks-guide)
- [Claude Code — Skills](https://code.claude.com/docs/en/skills)
- [Claude Code — Configure permissions](https://code.claude.com/docs/en/permissions)
- [Claude Code — GitHub Actions](https://code.claude.com/docs/en/github-actions)
- [Claude Code documentation map](https://code.claude.com/docs/en/claude_code_docs_map.md)
- [Gym Tracker App — Development Plan](https://claude.ai/code/artifact/a56d2b6e-02d8-4488-bcd2-42a57043e29e) (source for phases, workstreams and obligations R1–R10)
