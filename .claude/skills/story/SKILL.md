---
name: story
description: Deliver one story end to end through the team pipeline — design, build, test, review, compliance, preview, PR and merge. The standard unit of work.
argument-hint: "STORY-<n>"
---

Deliver $ARGUMENTS. Sequential, one agent at a time. Update `docs/HANDOFF.md` after every step.

1. **Ready check (lead):** acceptance criteria are testable checks, labels set, no blocking open item, ADRs Accepted. If not ready, send back to product-owner or architect.
2. **Design (ux-designer, if label `ui`):** spec in `docs/design/<story>.md`.
3. **Build (mobile-dev or backend-dev):** branch `story/<story>-<slug>` in a worktree. Implement, add unit tests, run `npm run verify`. Report files changed and assumptions.
4. **Verify (qa-engineer):** test every acceptance criterion and edge case; add/extend tests; record evidence in the story file. Failures → back to step 3 with the failing test.
5. **Review (code-reviewer):** `VERDICT` must be APPROVE. CHANGES_REQUESTED → back to step 3 with the blockers. Max 3 loops, then raise an open item.
6. **Compliance (security-compliance, if label data/auth/health/integration/migration):** verdict PASS or PASS_WITH_CONDITIONS with conditions done. BLOCK → back to step 3, or raise an open item if it is a policy question.
7. **Preview (devops-release):** CI green; preview link or run instructions.
8. **PR (lead):** push the branch, `gh pr create` with the template filled with evidence; post the review and compliance verdicts as PR comments; add `review:approved` / `compliance:approved` labels only when those verdicts allow.
9. **Merge (lead):** only under the merge rules in `lead.md`. Otherwise label `needs-sev` and raise an open item.
10. **Close:** product-owner accepts against criteria; mark the story Done in the backlog; clear HANDOFF.
