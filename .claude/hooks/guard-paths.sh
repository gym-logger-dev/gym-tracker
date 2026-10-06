#!/usr/bin/env bash
# PreToolUse hook for Edit|Write|NotebookEdit, used in each agent's frontmatter.
# Usage: guard-paths.sh "<glob>" ["<glob>" ...]
# Allows the edit only if the target path (relative to its git repo/worktree root)
# matches one of the globs. Exit 2 blocks the tool call and tells the agent why.
set -euo pipefail

input="$(cat)"
file="$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_input.notebook_path // empty')"
[ -z "$file" ] && exit 0

# Find the repo/worktree root from the nearest existing parent directory.
dir="$(dirname "$file")"
while [ ! -d "$dir" ] && [ "$dir" != "/" ]; do dir="$(dirname "$dir")"; done
root="$(git -C "$dir" rev-parse --show-toplevel 2>/dev/null || echo "${CLAUDE_PROJECT_DIR:-$PWD}")"
rel="${file#"$root"/}"

# Exclusions first: a pattern starting with "!" denies even if another pattern allows.
for pattern in "$@"; do
  if [[ "$pattern" == !* ]] && [[ "$rel" == ${pattern#!} ]]; then
    echo "Blocked: '$rel' is owned by another agent. Ask the owner through the lead." >&2
    exit 2
  fi
done
for pattern in "$@"; do
  [[ "$pattern" == !* ]] && continue
  # In [[ ]], * also matches '/', so "docs/backlog/*" covers nested files.
  if [[ "$rel" == $pattern ]]; then exit 0; fi
done

echo "Blocked: '$rel' is outside the paths this agent owns ($*). Ask the owning agent through the lead, or raise an open item." >&2
exit 2
