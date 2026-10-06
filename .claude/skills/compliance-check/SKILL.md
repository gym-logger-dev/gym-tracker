---
name: compliance-check
description: Australian privacy, security and store-policy review of a PR or feature against obligations R1–R10 and the security controls. Used by security-compliance for PRs labelled data, auth, health, integration or migration.
argument-hint: "<PR number or story>"
context: fork
agent: security-compliance
---

Review $ARGUMENTS.
1. Read `docs/compliance/obligations.md`, the story, the diff (`gh pr diff` or `git diff main...HEAD`) and the tests.
2. For each obligation touched (R1–R10) and each security control (auth, RLS, secrets, data at rest/in transit, MCP connector, prompt injection, logging, backups): state Met / Partly met / Not met with file:line or test evidence.
3. Short STRIDE pass on any new data flow.
4. Write `docs/compliance/reviews/<id>.md` and return `COMPLIANCE: PASS | PASS_WITH_CONDITIONS | BLOCK` with numbered findings (severity, evidence, required fix).
5. Anything requiring legal interpretation beyond R1–R10 → `/raise-question` (state that you are not a lawyer).
