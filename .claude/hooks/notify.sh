#!/usr/bin/env bash
# Notification / StopFailure hook: Claude Code is waiting on Sev, or hit a usage limit.
# Logs to docs/status/waiting.log, shows a desktop notification, and pushes to Sev's phone.
input="$(cat)"
event="$(printf '%s' "$input" | jq -r '.hook_event_name // "Notification"')"
if [ "$event" = "StopFailure" ]; then
  msg="Usage limit reached. The team has stopped; HANDOFF.md says where to resume."
  prio=3
else
  msg="$(printf '%s' "$input" | jq -r '.message // "Claude Code needs your input"')"
  prio=4
fi
root="${CLAUDE_PROJECT_DIR:-$PWD}"
mkdir -p "$root/docs/status"
printf '%s  [%s] %s\n' "$(date -u +%Y-%m-%dT%H:%MZ)" "$event" "$msg" >> "$root/docs/status/waiting.log"
if command -v osascript >/dev/null 2>&1; then
  osascript -e "display notification \"${msg//\"/}\" with title \"Gym Tracker team\"" >/dev/null 2>&1
elif command -v notify-send >/dev/null 2>&1; then
  notify-send "Gym Tracker team" "$msg" >/dev/null 2>&1
elif command -v powershell.exe >/dev/null 2>&1; then
  powershell.exe -NoProfile -Command "[console]::beep(880,200)" >/dev/null 2>&1
fi
"$root/.claude/hooks/phone.sh" "Gym Tracker team" "$msg" "$prio"
exit 0
