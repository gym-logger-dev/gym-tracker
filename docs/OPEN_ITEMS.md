# Open items for Sev

Master register of questions and decisions only Sev can make. Agents add rows with `/raise-question`; the lead consolidates.
New `OPEN` rows trigger a phone alert (ntfy). Blocking or `WAIT` items are mirrored as GitHub issues labelled `needs-sev`.
Answer by editing the **Decision** and **Decided** cells (or reply on the GitHub issue) — the lead applies answers at the start of the next work window.

| ID | Status | Blocking | Question (one line) | Raised by | Date | Phase | Options | Recommendation | Default if no answer by | Decision | Decided |
|---|---|---|---|---|---|---|---|---|---|---|---|
| OI-001 | OPEN | blocking | Set up the GitHub repo: private, branch protection on `main` requiring the `ci` and `merge-gate` checks, squash merges only, labels created | plan | 2026-10-02 | P1 | Do it now (10 min, steps in detail) | Do it now | WAIT | | |
| OI-002 | OPEN | non-blocking | Set up phone alerts: install the ntfy app, subscribe to a private random topic, put `NTFY_TOPIC` in `.claude/settings.local.json` | plan | 2026-10-02 | P1 | ntfy (free) · GitHub mobile only · none | ntfy | Desktop notifications only | | |
| OI-003 | OPEN | non-blocking | Export the Notion Exercises and Workout Log databases as CSV into `data/import/` | plan | 2026-10-02 | P1 | Export now · later in P1 | Before the migration story | Migration story waits; other P1 work continues | | |
| OI-004 | OPEN | non-blocking | iPhone distribution: free installable web app first, or pay Apple membership (~AU$149/yr) now | dev plan | 2026-10-02 | P5 | PWA + Android first · Apple now | PWA + Android first; enrol before public launch | PWA + Android | | |
| OI-005 | OPEN | non-blocking | Does a single-athlete Strava app need your paid Strava subscription? (dev plan A1) | dev plan | 2026-10-02 | P4 | Check in Strava API settings when registering | Check during P4 | Strava story waits; rest of P4 continues | | |
| OI-006 | OPEN | non-blocking | Models on Pro: all agents on Sonnet, or Opus for architect, code-reviewer and security-compliance at phase gates only | plan | 2026-10-02 | All | All Sonnet · Opus at gates · Opus always | All Sonnet; Opus only for gate reviews if your plan allows | All Sonnet | | |
| OI-007 | CLOSED | blocking | Your PC's OS, and whether Docker Desktop can run (needed for the local Supabase stack) | plan | 2026-10-02 | P1 | Windows + WSL2 · macOS · Linux | Confirm OS; install Docker Desktop | WAIT | Windows PC with Docker Desktop → run everything in WSL2 (Ubuntu) with Docker Desktop's WSL integration on | Sev 2026-10-02 |
| OI-008 | OPEN | non-blocking | Audience: personal use only, or public release (changes compliance scope R1–R10) | dev plan | 2026-10-02 | All | Personal · public | Build for public, release personally first | Build to public standard | | |
| OI-009 | OPEN | non-blocking | Smallest plate and dumbbell increments at Nairne and Pirie St (progression engine) | dev plan | 2026-10-02 | P4 | Supply values | Supply before P4 | 2.5 kg barbell, 2 kg dumbbell, machine stack step from history | | |
| OI-010 | OPEN | non-blocking | Share one sample body-scan report (InBody, DEXA or scale export) with personal values redacted | dev plan | 2026-10-02 | P4 | Supply sample | Before P4 | Manual entry only until supplied | | |
| OI-011 | OPEN | non-blocking | Keep separate progression tracks per gym (loads feel different at each gym)? | dev plan | 2026-10-02 | P3 | Per gym · combined with gym filter | Combined with gym filter | Combined with gym filter | | |
| OI-012 | CLOSED | blocking | Run the agents through a separate GitHub machine user so review labels and merges are attributable and you get GitHub notifications | plan | 2026-10-02 | P1 | Machine user (free, one extra account) · keep your own login | Machine user before P2 | Keep your own login; weekly merge spot-check | Yes — agents get their own GitHub account; set up in P1 (story STORY-000, runbook in README) | Sev 2026-10-02 |
| OI-013 | OPEN | blocking | Create a free GitHub organisation to own the repo, so the agents' account can use a token limited to this one repository | plan | 2026-10-02 | P1 | Free org owns repo (single-repo fine-grained token) · repo stays on your account (classic token or SSH key, wider access) | Free org | WAIT | | |
| OI-014 | OPEN | non-blocking | Verify GitHub's terms on machine accounts (one free machine account per person) and that fine-grained tokens can be limited to one org repo | plan | 2026-10-02 | P1 | Check docs.github.com terms and PAT pages | Check during setup | Proceed as planned; one bot account | | |

## OI-001 detail — GitHub repository setup (Sev only)
1. Create a **private** repo (e.g. `gym-tracker`) and push the starter kit.
2. Settings → General → Pull Requests: allow **squash merging** only; enable "Automatically delete head branches".
3. Settings → Branches → add a rule (or ruleset) for `main`: require a pull request; require status checks `ci` and `merge-gate`; block force pushes and deletions. (No required human review — you delegated merging to the team; `merge-gate` enforces the review labels.)
4. Create labels: `review:approved`, `compliance:approved`, `sev-approved`, `needs-sev`, `ui`, `data`, `auth`, `health`, `integration`, `migration`, `bug`.
5. Settings → Code security: enable Dependabot alerts and secret scanning.

## OI-002 detail — phone alerts
1. Install **ntfy** on your phone; subscribe to a long random topic name (treat it like a password; anyone with the name can read the alerts).
2. Create `.claude/settings.local.json` (gitignored) from `.claude/settings.local.example.json` and set `NTFY_TOPIC`.
3. Alerts contain only item IDs and one-line titles — never health data or code.

## OI-012 / OI-013 detail — the agents' own GitHub account (Sev only, ~20 min)
Why: agents currently act as you, so GitHub cannot tell their work from yours, cannot notify you of their issues, and review labels are only an honest record. A separate account fixes all three.
1. **Organisation (OI-013):** create a free GitHub organisation (e.g. `sev-gym`) and transfer the repo into it. You stay owner.
2. **Bot account:** create one account, e.g. `sev-gym-bot`, with its own email (a `+bot` alias works) and 2FA on. One account serves all ten agents; each commit names the agent in a trailer.
3. **Access:** invite the bot to the org as a member with **Write** on this repo only — not Admin, not Maintain.
4. **Token:** signed in as the bot, create a **fine-grained personal access token**: resource owner = the org, repository = this repo only, permissions Contents R/W, Pull requests R/W, Issues R/W, Metadata R, Actions R, Commit statuses R. Expiry 90 days (calendar reminder). Approve it in the org if prompted.
5. **Give it to Claude Code only:** in WSL, put it in `.claude/settings.local.json` under `env.GH_TOKEN` (gitignored). Never in your shell profile, so your own `gh` stays you.
6. **Git identity in the repo:** `git config user.name "sev-gym-bot"` and `git config user.email "<bot-id>+sev-gym-bot@users.noreply.github.com"`; then `gh auth setup-git` so pushes use the bot token.
7. **Branch protection:** keep required checks `ci` and `merge-gate`. Add yourself to `.github/CODEOWNERS` for workflows, migrations and `.claude/` (already drafted). `merge-gate` now checks that `sev-approved` was applied by **you**, not the bot.
8. **Notifications:** watch the repo from your own account; the GitHub mobile app will now alert you on `needs-sev` issues and bot PRs.
