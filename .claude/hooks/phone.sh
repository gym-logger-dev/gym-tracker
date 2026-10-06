#!/usr/bin/env bash
# Send a short push notification to Sev's phone via ntfy (https://ntfy.sh).
# Usage: phone.sh "<title>" "<message>" [priority 1-5]
# The topic comes from NTFY_TOPIC (set in .claude/settings.local.json, never committed).
# Messages must never contain health values, set data, tokens or personal information.
title="${1:-Gym Tracker team}"; msg="${2:-Update}"; prio="${3:-3}"
[ -z "${NTFY_TOPIC:-}" ] && exit 0
server="${NTFY_SERVER:-https://ntfy.sh}"
curl -fsS -m 10 -H "Title: $title" -H "Priority: $prio" -H "Tags: weight_lifter" \
     -d "$msg" "$server/$NTFY_TOPIC" >/dev/null 2>&1 || true
exit 0
