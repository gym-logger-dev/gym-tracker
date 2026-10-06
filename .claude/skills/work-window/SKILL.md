---
name: work-window
description: Start a bounded work window on Sev's Pro plan. The lead works through the next stories one agent at a time until the window's budget is used, then writes a handoff and stops. Sev runs this when he has spare capacity.
disable-model-invocation: true
argument-hint: "[stories=1] [until=HH:MM]"
---

Sev has opened a work window: $ARGUMENTS (default: finish 1 story, no time limit).

1. Read `docs/HANDOFF.md`, `docs/OPEN_ITEMS.md` (answered items since last window) and the backlog. Apply any of Sev's answers first; close those items with the decision recorded.
2. State in 3 lines what you will attempt in this window and what "done for this window" means.
3. Work strictly sequentially: one subagent at a time, per the `/story` workflow. After each agent returns, update `docs/HANDOFF.md` (story, step done, next step, branch, worktree).
4. Stop when the story budget is reached, the `until` time passes, Sev runs `/pause`, or you hit a usage limit — whichever comes first. Never start a new story with less than ~20% of the window apparently left; finish or checkpoint instead.
5. Close the window with `/status-report window`: what finished (with PR links), what's mid-flight (with HANDOFF pointer), new open items, and a recommendation for the next window's size.
