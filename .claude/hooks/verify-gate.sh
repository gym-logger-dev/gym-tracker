#!/usr/bin/env bash
# TaskCompleted / SubagentStop hook for builder agents: a task cannot be marked done
# while the local gate fails. Exit 2 sends the failure back so the agent keeps working.
set -uo pipefail
root="$(git rev-parse --show-toplevel 2>/dev/null || echo "${CLAUDE_PROJECT_DIR:-$PWD}")"
cd "$root" || exit 0
[ -f package.json ] || exit 0                       # before scaffolding exists
grep -q '"verify"' package.json || exit 0

if ! out="$(npm run --silent verify 2>&1)"; then
  echo "npm run verify failed — fix before reporting done. Last 40 lines:" >&2
  printf '%s\n' "$out" | tail -n 40 >&2
  exit 2
fi
exit 0
