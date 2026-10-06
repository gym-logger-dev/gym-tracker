---
name: bugfix
description: Fix a reported bug — reproduce with a failing test first, fix, review, merge.
argument-hint: "<issue number or description>"
---

Bug: $ARGUMENTS
1. **qa-engineer:** reproduce; write a failing test that captures it; note severity and affected stories.
2. **Owner developer** (mobile-dev or backend-dev, by path): fix on branch `story/BUG-<n>-<slug>` until the new test and `npm run verify` pass.
3. **code-reviewer:** review; **security-compliance** if the bug touches data, auth, health or integrations.
4. **lead:** PR and merge under the normal merge rules. Link the issue.
A security bug that may have exposed data → stop and raise a blocking open item immediately (possible NDB assessment, R5).
