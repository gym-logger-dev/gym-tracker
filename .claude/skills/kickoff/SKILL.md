---
name: kickoff
description: Kick off a phase (P1–P5). The lead reads the dev plan, the product-owner writes the phase's stories, the architect adds ADRs and contracts, and the lead orders the backlog and raises first questions. Run once per phase.
disable-model-invocation: true
argument-hint: "[P1|P2|P3|P4|P5]"
---

Kick off phase $ARGUMENTS (default P1).

1. Read `docs/dev-plan.md` sections for this phase: deliverables, exit gate, relevant workstreams and obligations.
2. Delegate to **product-owner**: write stories for this phase in `docs/backlog/` using `_TEMPLATE.md`, each traced to W/P/R references, with labels. Aim for stories that each fit one PR.
3. Delegate to **architect**: for stories marked "Needs ADR", write ADRs (status Proposed) and any contracts the phase needs first.
4. Order the backlog in `docs/backlog/README.md`: dependencies first, then highest user value. Mark each story Ready / Not ready.
5. Raise open items (`/raise-question`) for anything in the plan that needs Sev before work starts (accounts, data exports, decisions). For P1 this includes: the GitHub organisation and bot account (OI-012, OI-013), branch protection, the Notion CSV export, and ntfy topic setup. Make `STORY-000 Verify the agents' GitHub identity` the first P1 story: commits show the bot as author with an `Agent:` trailer, the bot can open and merge a no-op PR through `merge-gate`, it cannot push to `main`, and `sev-approved` applied by the bot fails `merge-gate`.
6. Report: number of stories, the first three to build, open items raised, and an estimate of how many work windows the phase needs.
