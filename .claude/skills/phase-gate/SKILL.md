---
name: phase-gate
description: Run a phase exit gate. QA and security-compliance produce evidence against the phase's exit criteria; the lead compiles a gate report for Sev's sign-off. Sev always signs off gates.
disable-model-invocation: true
argument-hint: "[P1|P2|P3|P4|P5]"
---

Gate for $ARGUMENTS.

1. Read the exit criteria for this phase in `docs/dev-plan.md` (roadmap) and every story in the phase.
2. **qa-engineer:** run the full suite (unit, RLS, E2E) and the phase-specific gate tests, e.g. P1: 811/811 reconciliation and RLS deny tests; P2: 60-minute offline session with zero lost sets; P3: chart point opens session < 200 ms; P4: PDF plan → approved plan, Strava post verified, engine back-test within caps; P5: MASVS L1 checklist and store-form readiness.
3. **security-compliance:** re-check obligations R1–R10 touched in this phase; re-verify volatile facts against primary sources (record date checked); verdict.
4. **lead:** write `docs/status/gate-<phase>.md`: each criterion → PASS/FAIL with evidence links; open items; residual risks; what Sev must test on his phone (step list, under 10 minutes).
5. Raise a blocking open item "Sign off gate <phase>" and stop. The next phase starts only after Sev records the decision.
