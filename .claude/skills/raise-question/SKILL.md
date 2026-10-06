---
name: raise-question
description: Record a question or decision that only Sev can make, with options, a recommendation and a safe default, so work can continue. Any agent can use this; the lead consolidates. Triggers a phone alert.
argument-hint: "<the question>"
---

Raise an open item for Sev: $ARGUMENTS

1. Check `docs/OPEN_ITEMS.md` for an existing item on the same subject; if found, add context to it instead of duplicating.
2. Otherwise add a row to the register table with the next ID (`OI-###`), in exactly this column order:
   `| ID | Status | Blocking | Question (one line) | Raised by | Date | Phase | Options | Recommendation | Default if no answer by | Decision | Decided |`
   - Status: `OPEN`. Blocking: `blocking` only if no reversible work can proceed without it, else `non-blocking`.
   - Options: 2–3, with the cost/risk of each. Recommendation: one, with a reason.
   - Default: what the team will do if there is no answer in 48 hours — only ever a reversible choice. For irreversible or money/account/legal items write `WAIT`.
3. Below the table, add a short "OI-### detail" section if the question needs more than a line (links to files, evidence).
4. If blocking or `WAIT`: `gh issue create --label needs-sev --title "OI-###: <question>" --body "<detail and link to OPEN_ITEMS.md>"`.
5. Continue on other reversible work. Never put secrets, health data or personal information in an open item or issue.
