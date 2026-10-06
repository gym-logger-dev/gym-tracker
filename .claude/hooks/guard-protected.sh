#!/usr/bin/env bash
# Project-wide PreToolUse hook for Edit|Write|NotebookEdit.
# Blocks edits to files no agent may change, whoever the agent is.
set -euo pipefail

input="$(cat)"
file="$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_input.notebook_path // empty')"
[ -z "$file" ] && exit 0

dir="$(dirname "$file")"
while [ ! -d "$dir" ] && [ "$dir" != "/" ]; do dir="$(dirname "$dir")"; done
root="$(git -C "$dir" rev-parse --show-toplevel 2>/dev/null || echo "${CLAUDE_PROJECT_DIR:-$PWD}")"
rel="${file#"$root"/}"
base="$(basename "$rel")"

deny() { echo "Blocked: $1" >&2; exit 2; }

case "$rel" in
  .claude/*)                 deny "'.claude/' holds the team's guardrails. Only Sev edits it." ;;
  docs/dev-plan.md|docs/agent-team-plan.md)
                             deny "'$rel' is a source-of-truth plan. Raise an open item to propose a change." ;;
  CLAUDE.md)                 deny "CLAUDE.md is maintained by Sev. Raise an open item to propose a change." ;;
esac

case "$base" in
  .env|.env.*|*.pem|*.p8|*.p12|*.keystore|*.jks|google-services.json|GoogleService-Info.plist)
                             deny "'$rel' may contain secrets. Agents never create or edit secret files." ;;
esac

# Applied migrations are append-only: an existing migration file may not be modified.
if [[ "$rel" == supabase/migrations/*.sql ]] && git -C "$root" ls-files --error-unmatch "$rel" >/dev/null 2>&1; then
  deny "'$rel' is a committed migration. Migrations are append-only; create a new migration instead."
fi

exit 0
