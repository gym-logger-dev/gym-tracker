# STORY-000: Verify the agents' GitHub identity

- **Status:** Ready
- **Phase / workstream / obligations:** P1 · W: none (team infrastructure, enables all W1–W5 delivery) · R: none
- **Labels:** needs-sev (steps 5 and 6 need Sev's own account). No `ui/data/auth/health/integration/migration` label; no code or CI change.
- **Owner (build):** lead executes the bot-side checks (no code; docs-only PR). Sev executes the Sev-side checks. Nominal build owner: none (neither mobile-dev nor backend-dev).
- **Branch:** story/STORY-000-verify-agent-github-identity

## User story
As Sev, I want proof that the agents act only as `gym-logger-bot` and cannot bypass `main` protection or fake my approval, so that every later merge is attributable and the guardrails in `docs/agent-team-plan.md` (Guardrails, "Agents' own GitHub account") are known to work.

Setup is already done by Sev: bot `gym-logger-bot` in free org `gym-logger-dev` (owner Sev); repo is PUBLIC; `main` protected (required checks `ci` and `merge-gate`, squash-only, no required human review). This story is verification only. Nothing is reconfigured.

## Who does what
- **Lead (as the bot, inside Claude Code):** steps 1, 2, 3, 4, 7.
- **Sev (own account, own browser/terminal, never inside the agents' environment):** steps 5, 6, and the confirmation in step 3b. Sev's token never enters the agents' environment.

## Acceptance criteria
1. Given the repo checkout, when the lead runs `git config user.name` / `git config user.email` and makes a docs-only commit on `story/STORY-000-verify-agent-github-identity`, then the author is `gym-logger-bot` (noreply address), the commit message ends with an `Agent: lead` trailer, and `git log -1 --format=fuller` is pasted into the PR body. No Sev identity appears.
2. Given that branch is pushed, when the lead opens a PR whose only change is a one-line note in `docs/status/` (no-op), then the PR author in GitHub is `gym-logger-bot`, `ci` and `merge-gate` both run and pass, and the lead merges with `gh pr merge --squash --delete-branch` without `--admin`. The resulting commit on `main` shows the bot as author and the branch is deleted.
3. Given the bot token, when the lead attempts a direct push to `main`, then it is refused. 3a (lead): record the refusal (the `guard-bash` hook block, and GitHub's `GH006` rejection if the request reaches GitHub). The lead must not work around a hook to obtain the GitHub-side message. 3b (Sev): confirm in GitHub Settings that the bot's role on the repo is Write (not Maintain or Admin), that the `main` ruleset has "require PR", required checks `ci` and `merge-gate`, force-push and deletion blocked, and no bypass for the bot; reply with "confirmed" or the discrepancy.
4. Given an open no-op PR, when the lead (as the bot) applies the `sev-approved` label, then `merge-gate` fails with a message that the label was not applied by `SEV_LOGIN`, and the PR cannot be merged. If the Claude Code permission layer blocks the bot from applying the label at all, record that as layer-1 evidence and Sev runs criterion 6 only; the criterion is then "partially evidenced" and noted in the PR.
5. Given the failing PR from criterion 4, when Sev removes the bot's label and the lead re-runs `merge-gate`, then it returns to passing. (Sev)
6. Given a PR where `sev-approved` is required, when Sev himself applies `sev-approved` from his own account, then `merge-gate` passes. This is the positive control for criterion 4. (Sev)
7. Error state: if any criterion fails, the lead raises an open item via `/raise-question` (default `WAIT` for any merge until resolved) and does not merge further stories.
8. Offline/empty states: not applicable (no app behaviour). No tokens, `ntfy` topic or personal identifiers appear in the PR body, commit, or evidence (repo is public).

## Technical notes (architect)
- Needs ADR: no
- ADRs: none
- Data/contract changes: none. Related: OI-001, OI-012, OI-013, OI-014 (OI-014 terms check remains Sev's).

## Dependencies
- Depends on: none (first story).

## Design (ux-designer)
- Spec: docs/design/STORY-000.md

## Test evidence (qa-engineer)
| Criterion | Test | Result |
|---|---|---|

## Review and compliance
- Code review: VERDICT …
- Compliance: COMPLIANCE … (if labelled)

## Done
- PR: #…  · Merged: …  · Accepted by product-owner: …
