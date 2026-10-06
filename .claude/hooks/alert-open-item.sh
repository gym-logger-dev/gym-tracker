#!/usr/bin/env bash
# PostToolUse hook (Edit|Write): when docs/OPEN_ITEMS.md gains a new OPEN item,
# push its ID and one-line title to Sev's phone. Only IDs and titles are sent.
input="$(cat)"
file="$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')"
case "$file" in */docs/OPEN_ITEMS.md|docs/OPEN_ITEMS.md) ;; *) exit 0 ;; esac
root="${CLAUDE_PROJECT_DIR:-$PWD}"
state="$root/.claude/.alerted-items"          # local, gitignored
trim() { sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//'; }
first_run=0; [ -f "$state" ] || first_run=1
touch "$state"
# Rows look like: | OI-012 | OPEN | blocking | <title> | ...
grep -E '^\| *OI-[0-9]+ *\| *OPEN *\|' "$file" 2>/dev/null | while IFS='|' read -r _ id status block title _rest; do
  id="$(printf '%s' "$id" | trim)"; block="$(printf '%s' "$block" | trim)"; title="$(printf '%s' "$title" | trim | cut -c1-120)"
  grep -qx "$id" "$state" && continue
  echo "$id" >> "$state"
  [ "$first_run" = 1 ] && continue   # items that existed before alerts were set up are not re-sent
  prio=3; [ "$block" = "blocking" ] && prio=5
  "$root/.claude/hooks/phone.sh" "Question for Sev: $id" "$title" "$prio"
done
exit 0
