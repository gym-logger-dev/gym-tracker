#!/usr/bin/env bash
# PostToolUse hook for Edit|Write: format the edited file. Never blocks.
file="$(jq -r '.tool_input.file_path // empty')"
[ -z "$file" ] || [ ! -f "$file" ] && exit 0
case "$file" in
  *.ts|*.tsx|*.js|*.jsx|*.json|*.md|*.yml|*.yaml)
    npx --no-install prettier --write "$file" >/dev/null 2>&1 || true ;;
  *.sql)
    npx --no-install sql-formatter --fix "$file" >/dev/null 2>&1 || true ;;
esac
exit 0
