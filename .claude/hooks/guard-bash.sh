#!/usr/bin/env bash
# Project-wide PreToolUse hook for Bash. Blocks destructive or Sev-only commands.
# Permission deny rules in settings.json are the first line; this catches variants
# (chained commands, flags in different positions) that prefix rules can miss.
set -euo pipefail

cmd="$(cat | jq -r '.tool_input.command // empty')"
[ -z "$cmd" ] && exit 0

deny() { echo "Blocked: $1 If this is genuinely needed, raise an open item for Sev with the exact command and why." >&2; exit 2; }

shopt -s nocasematch
[[ "$cmd" =~ (^|[;&|[:space:]])rm[[:space:]]+-[a-z]*r[a-z]*f|rm[[:space:]]+-[a-z]*f[a-z]*r ]] && deny "recursive force delete."
[[ "$cmd" =~ git[[:space:]]+push.*(--force|-f([[:space:]]|$)|--force-with-lease) ]] && deny "force push."
[[ "$cmd" =~ git[[:space:]]+push[[:space:]]+[^[:space:]]+[[:space:]]+(HEAD:)?(main|master)([[:space:]]|$) ]] && deny "push to main."
[[ "$cmd" =~ git[[:space:]]+(reset[[:space:]]+--hard|clean[[:space:]]+-[a-z]*f|branch[[:space:]]+-D) ]] && deny "history- or work-destroying git command."
[[ "$cmd" =~ gh[[:space:]]+pr[[:space:]]+merge.*--admin ]] && deny "bypassing branch protection."
[[ "$cmd" =~ gh[[:space:]]+pr[[:space:]]+merge ]] && [[ ! "$cmd" =~ --squash ]] && deny "merges must be squash merges via the merge rules in lead.md."
[[ "$cmd" =~ sev-approved ]] && deny "only Sev applies the sev-approved label."
[[ "$cmd" =~ gh[[:space:]]+label ]] && deny "label management is Sev's."
[[ "$cmd" =~ gh[[:space:]]+(repo[[:space:]]+(delete|edit)|secret|api[[:space:]].*-X[[:space:]]*(DELETE|PUT)) ]] && deny "repository settings and secrets are Sev's."
[[ "$cmd" =~ eas[[:space:]]+(submit|credentials|secret) ]] && deny "store submission and credentials are Sev's."
[[ "$cmd" =~ supabase[[:space:]]+(db[[:space:]]+push|link|projects|secrets|functions[[:space:]]+deploy) ]] && deny "remote Supabase actions are Sev's; use the local stack."
[[ "$cmd" =~ (cat|less|more|head|tail|grep|printenv|env)([[:space:]].*)?\.env ]] && deny "reading environment files."
[[ "$cmd" =~ (^|[;&|[:space:]])(printenv|env)([[:space:]]*$|[[:space:]]*\|) ]] && deny "dumping the environment."
[[ "$cmd" =~ curl.*(-d|--data|-F|--upload-file) ]] && deny "sending data to external hosts with curl."
[[ "$cmd" =~ npm[[:space:]]+(publish|adduser|login|token) ]] && deny "npm registry actions."
[[ "$cmd" =~ gh[[:space:]]+auth[[:space:]]+(login|logout|refresh|token|switch) ]] && deny "the agents' GitHub identity is set up by Sev."
[[ "$cmd" =~ git[[:space:]]+config.*(--global|--system|user\.name|user\.email|credential) ]] && deny "git identity and credentials are set up by Sev."
[[ "$cmd" =~ (GH_TOKEN|GITHUB_TOKEN|NTFY_TOPIC) ]] && deny "referencing tokens or alert topics in commands."
exit 0
