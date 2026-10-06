---
name: status-report
description: Write the team status report — end of a work window or weekly. Short, evidence-based, for Sev.
argument-hint: "[window|weekly]"
---

Write `docs/status/<YYYY>-W<ww>.md` (weekly) or append a "Window <date>" section to it (window). Max ~40 lines:
- **Done:** stories merged (PR links), gates passed.
- **In flight:** story, step, HANDOFF pointer.
- **Waiting on Sev:** open items by ID, blocking first, with the default and its date.
- **Risks/changes:** anything that changes scope, cost or dates; volatile facts re-checked.
- **Capacity:** stories per window this week, EAS builds used this month (of 15+15), anything that wasted tokens.
- **Next window:** recommended size and the stories it should cover.
