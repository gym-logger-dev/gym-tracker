#!/usr/bin/env bash
# PreToolUse hook for Edit|Write|NotebookEdit, used in each agent's frontmatter.
# Usage: guard-paths.sh "<glob>" ["<glob>" ...]
# Allows the edit only if the target path (relative to its git repo/worktree root)
# matches one of the globs. Exit 2 blocks the tool call and tells the agent why.
#
# --defer-to-subagent (first argument, used only by the lead):
# hooks in the main session's agent file also fire inside subagents. With this flag,
# a call from a team subagent whose own agent file runs guard-paths.sh is left to that
# subagent's list. Any other subagent (built-in, plugin, or one without its own guard)
# is still held to this list.
set -euo pipefail

defer=0
if [ "${1:-}" = "--defer-to-subagent" ]; then defer=1; shift; fi

input="$(cat)"

if [ "$defer" = 1 ]; then
  agent_id="$(printf '%s' "$input" | jq -r '.agent_id // empty')"
  agent_type="$(printf '%s' "$input" | jq -r '.agent_type // empty')"
  if [ -n "$agent_id" ] && [[ "$agent_type" =~ ^[a-z0-9-]+$ ]]; then
    agent_file="${CLAUDE_PROJECT_DIR:-$PWD}/.claude/agents/$agent_type.md"
    if [ -f "$agent_file" ] && grep -q 'guard-paths\.sh' "$agent_file"; then exit 0; fi
  fi
fi
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
