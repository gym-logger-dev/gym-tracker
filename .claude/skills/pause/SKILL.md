---
name: pause
description: Stop the team cleanly mid-window. Finish the current step, commit work-in-progress to the story branch, update HANDOFF, and stop. Use when Sev needs his Claude capacity back.
disable-model-invocation: true
---

Pause now.
1. Do not start any new delegation. Let the current tool call finish.
2. If a developer agent has uncommitted changes in its worktree, ask it to commit them as `wip: <summary> [STORY-n]` on its story branch (no push needed).
3. Update `docs/HANDOFF.md`: story, exact step, branch and worktree path, what was in progress, the next command to run, and anything the next agent must know.
4. Reply to Sev in 3 lines: what finished, where it stopped, and that `/work-window` resumes it.
