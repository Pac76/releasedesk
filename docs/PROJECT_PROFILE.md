# ReleaseDesk project profile

## Product

ReleaseDesk is a project-operations control plane for independent software developers. It combines release work with immutable snapshots of public GitHub repository health and produces an evidence-backed readiness verdict: ready, at risk, blocked, or unknown.

The current product deliberately uses deterministic policy rather than an opaque score or generated opinion. A reviewer can see the exact workflow, commit age, pull-request count, issue count, and rule that produced the verdict.

## Why it exists

Independent developers often maintain several products at once. Repository state, deployment state, release work, and external blockers become scattered across provider dashboards and memory. ReleaseDesk establishes a private operational record for each project and makes the next release decision inspectable.

## Working surface

- Public Spanish product site and private authenticated workspace.
- Owner-scoped projects and release work.
- Manual connection of one public GitHub repository per project.
- Server-only GitHub REST synchronization.
- Immutable repository-health snapshots in PostgreSQL.
- Deterministic readiness policy with Spanish evidence.
- Supabase Auth, verified server-side identity, RLS, composite ownership constraints, and least-privilege grants.
- Responsive UI, explicit loading/error/empty states, CI, and automated tests.

## Engineering highlights

- React Server Components perform independent reads in parallel; Client Components are limited to interactive forms and boundaries.
- A `security invoker` PostgreSQL function atomically links a repository and inserts its snapshot while deriving ownership from `auth.uid()`.
- Snapshot clients receive only `select` and `insert`; updates and deletes are unavailable, and project deletion cascades intentionally.
- GitHub failures are mapped to fixed product errors without leaking provider bodies or credentials.
- Pagination counts pull requests and issues separately, excludes PRs from issue totals, and fails safely above a documented ceiling.
- The readiness engine is a pure function tested with a fixed clock for all four verdicts.

## Verification evidence

- `npm run lint`
- `npm run typecheck`
- `npm test` — 25 files and 119 tests
- `npm run build`
- Hosted Supabase migrations aligned with the repository migration history.
- Live demo-account sign-in, owner snapshot capture for `pac76/releasedesk`, matching GitHub head SHA, and anonymous `42501` denial verified.
- Develop implementation and independent Testing review recorded under `docs/agent-runs/`.

The Windows Supabase CLI Docker wrapper cannot mount the workspace path for pgTAP. The SQL suites are checked in for Linux/WSL/CI execution; this limitation is not represented as a pass.

## Public links

- Application: <https://releasedesk-three.vercel.app/>
- Repository: <https://github.com/Pac76/releasedesk>

Demo credentials are supplied privately and never committed.

## Next product increments

1. Correlate the GitHub head SHA with the production Vercel deployment.
2. Add GitHub App/OAuth installation for private repositories and higher rate limits.
3. Schedule idempotent background synchronization and snapshot retention controls.
4. Add portfolio-level views for stale, blocked, and production-drifted projects.

AI-generated summaries are intentionally deferred until the deterministic evidence model is mature enough to ground them.
