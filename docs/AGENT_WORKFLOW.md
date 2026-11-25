# Agent Workflow and Evidence

```text
Orchestrator
  -> bounded task brief + acceptance criteria
Develop
  -> implementation + tests + evidence-based handoff
Testing (independent, read-only)
  -> REJECTED: findings return to Develop, then Testing reviews again
  -> APPROVED: Orchestrator performs final inspection and checks
```

## Evidence

Each completed increment gets a truthful record under `docs/agent-runs/` containing the task brief, Develop handoff summary, Testing verdict and findings, correction rounds, and Orchestrator verification. Agent transcripts are not fabricated or copied wholesale; concise evidence is enough.

## Planned increments

1. `RD-001` — repository and Next.js foundation, public landing, design system, scripts, and tests.
2. `RD-002` — Supabase clients, reproducible schema migration, RLS policies, SQL policy tests, and generated database types.
3. `RD-003` — authentication and protected app shell.
4. `RD-004` — project CRUD vertical slice.
5. `RD-005` — work-item CRUD, filters, quick status changes, and dashboard metrics.
6. `RD-006` — responsive/accessibility hardening, documentation, browser verification, and production deployment.
7. `RD-007` — public GitHub repository sync, immutable health snapshots, and evidence-backed readiness policy.
8. `RD-008` — add complete English and Spanish product copy with a persistent language control, without changing business behavior.

Each increment goes through Develop -> Testing -> Orchestrator. A rejected review is useful only when genuine; never introduce a deliberate defect.

