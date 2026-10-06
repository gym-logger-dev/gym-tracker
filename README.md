# Gym Tracker — Claude Code agent team starter kit

This repository is built by a ten-agent Claude Code team. Sev (product owner) opens work windows on his Pro plan; the team delivers stories, merges what passes review, and raises questions to Sev's phone.

## First-time setup (Sev, about 60 minutes)
1. **Prerequisites (Windows PC):** install WSL2 with Ubuntu (`wsl --install`), and in Docker Desktop turn on Settings → Resources → WSL integration for Ubuntu. Inside Ubuntu install Git, GitHub CLI, Node LTS (via nvm), Supabase CLI, `jq`, and Claude Code (signed in with your Pro plan). Keep the repo in the Linux filesystem (`~/code/gym-tracker`), not under `/mnt/c`, for speed and correct file permissions.
2. **Repo:** create a free GitHub organisation (OI-013), then a **private** repo inside it; copy this kit in, set your username in `.github/CODEOWNERS`, commit, push. Then do OI-001 (branch protection, labels) and set the repo variable `SEV_LOGIN` to your own username.
3. **Agents' own GitHub account:** follow the OI-012/OI-013 detail in `docs/OPEN_ITEMS.md` — bot account with Write on this repo only, single-repo fine-grained token in `.claude/settings.local.json` (`GH_TOKEN`), repo-local git identity, `gh auth setup-git`.
4. **Plans:** confirm `docs/dev-plan.md` and `docs/agent-team-plan.md` are present (exported from the Claude docs).
5. **Phone alerts:** OI-002 — install ntfy, copy `.claude/settings.local.example.json` to `.claude/settings.local.json`, set your topic.
6. **Trust the folder:** run `claude` once in the repo and accept the trust prompt (project hooks and agents only load in trusted folders). Make the hooks executable: `chmod +x .claude/hooks/*.sh`.

## Daily use
| You want to… | Run |
|---|---|
| Start the team (lead as main session) | `claude --agent lead` |
| Kick off a phase | `/kickoff P1` |
| Give the team a block of your capacity | `/work-window stories=2 until=21:30` |
| Stop now and keep your capacity | `/pause` |
| See where things stand | `/status-report` or read `docs/HANDOFF.md` |
| Run a phase gate | `/phase-gate P1` |
| Answer questions | edit Decision/Decided in `docs/OPEN_ITEMS.md`, or reply on the `needs-sev` issue |

## What the team may and may not do
- **May:** build on story branches, run local tests and the local Supabase stack, open PRs, and **merge** PRs that pass CI, code review and (where required) compliance review.
- **Must ask you (sev-approved label):** CI workflows, database migrations, app permissions, anything labelled `needs-sev`.
- **Never:** push to `main` directly, force-push, read or write secrets, touch production Supabase, run `eas submit`, create accounts or spend money, edit `.claude/` or the plans.

Guardrails are enforced three ways: permission rules (`.claude/settings.json`), hooks (`.claude/hooks/`), and GitHub checks (`ci`, `merge-gate`).
