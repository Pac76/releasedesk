# ReleaseDesk

ReleaseDesk is a release-readiness workspace for individual software makers. It turns projects and their work items into a clear path from backlog to ready while demonstrating a secure, production-minded Next.js and Supabase implementation.

- **Live application:** [releasedesk-three.vercel.app](https://releasedesk-three.vercel.app/)
- **Public repository:** [github.com/Pac76/releasedesk](https://github.com/Pac76/releasedesk)

The public landing page has been observed returning HTTP 200 without Vercel Authentication. Hosted Supabase migration, Auth, evaluator-account, and authenticated CRUD verification remain explicit owner steps; see the [deployment checklist](docs/DEPLOYMENT_CHECKLIST.md).

## Product capabilities

- Spanish public landing page and responsive release-operations interface.
- Email/password registration, sign-in, email confirmation, and sign-out through Supabase Auth.
- Protected dashboard and project routes with verified server-side claims.
- Project create, edit, list, and confirmed deletion.
- Project-scoped work-item CRUD, allowlisted status/priority filters, and quick status advancement.
- Real owner-scoped dashboard counts and active-work summaries.
- Buenos Aires operational calendar semantics for accurate overdue detection.
- Loading, empty, error, pending, and success states across the main journeys.

## Stack

- Next.js `16.4.6`, React `19.3.1`, strict TypeScript, and Tailwind CSS.
- Supabase PostgreSQL, Auth, `@supabase/supabase-js`, and `@supabase/ssr`.
- Vitest and Testing Library.
- Vercel production hosting and GitHub Actions CI.

All package versions are exact and committed in `package-lock.json`. CI and the verified local toolchain use Node.js 24 and npm 11.

## Architecture and security

ReleaseDesk uses React Server Components by default and limits Client Components to interactive forms, navigation, and error boundaries. Supabase browser and server factories consume only the public project URL and publishable key.

Security is enforced at multiple layers:

- Next.js 16 Proxy refreshes Supabase cookies with verified claims and protects workspace routes.
- Protected layouts and every server action independently verify authentication.
- Every write is normalized and validated on the server.
- Reads and mutations explicitly filter by the verified owner; work-item mutations also filter by project and item IDs.
- PostgreSQL RLS provides separate owner-scoped policies for select, insert, update, and delete.
- The composite foreign key prevents a work item from referencing another owner's project.
- `anon` has no table privileges; `authenticated` receives only the required CRUD grants.
- No service-role key, secret key, password, or evaluator credential belongs in this repository.
- Global response headers deny framing, disable content sniffing, restrict referrers, and disable unused browser capabilities.

The full data contract is in [docs/APP_SPEC.md](docs/APP_SPEC.md), and the reproducible migration is in [supabase/migrations/20261124233226_initial_release_schema.sql](supabase/migrations/20261124233226_initial_release_schema.sql).

## Local setup

Requirements: Node.js 24.x and npm 11.x.

```bash
git clone https://github.com/Pac76/releasedesk.git
cd releasedesk
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The public landing page and production build work without Supabase variables. Authentication and protected data require a configured project.

Create an ignored `.env.local` only for local integration:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Only those two public values are supported. Never add a `service_role` or secret key.

## Supabase and Vercel setup

The exact owner sequence is maintained in [docs/DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md). In summary:

1. Create or select a Supabase project and apply the checked-in migration.
2. Run database advisors and the pgTAP policy suites from an environment where the Supabase stack/remote connection works.
3. Configure the Supabase Auth Site URL, redirect allowlist, and token-hash confirmation template.
4. Add the two public environment variables to the intended Vercel environments and redeploy.
5. Create evaluator credentials outside Git, verify authenticated CRUD and cross-user isolation, then confirm the production domain remains public in an incognito session.

The checked-in `src/types/database.ts` matches the migration but is not claimed as remotely generated. After connecting the project, regenerate and review it with:

```bash
npx supabase gen types --remote=<project-ref> --lang=typescript --schema public > src/types/database.ts
```

## Quality commands

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

GitHub Actions runs `npm ci` followed by those four checks on pushes and pull requests to `main`. CI requires no Supabase or Vercel secrets because the public application must remain buildable without configuration.

For a working local Docker stack, database verification is:

```bash
npx supabase start
npx supabase db reset
npx supabase test db
```

The Windows host used during RD-002 could not start the Supabase local stack because of a CLI wrapper argument issue, so the SQL suites were reviewed but not falsely reported as executed. They remain available under `supabase/tests/`.

## Repository map

```text
src/app/                 App Router pages, server actions, and route states
src/components/          Focused interactive and presentational components
src/lib/                 Auth, validation, Supabase, and domain helpers
src/types/database.ts    Migration-aligned Supabase database types
supabase/migrations/     Reproducible PostgreSQL schema and RLS
supabase/tests/          pgTAP ownership and policy tests
agents/                  Develop and Testing operating directives
.codex/agents/           Custom-agent definitions
docs/agent-runs/         Truthful task/review evidence
.github/workflows/       Secret-free CI
```

## Three-agent workflow

`AGENTS.md` defines the Orchestrator. It creates bounded increments, delegates implementation to the custom `develop` agent, and then delegates independent read-only review to `testing`. A rejected review returns to Develop as a focused correction before Testing reviews again. The Orchestrator integrates only approved work and records real outcomes rather than fabricated agent transcripts.

Evidence for each completed increment:

- [RD-001 — Next.js foundation and public landing](docs/agent-runs/RD-001.md)
- [RD-002 — Supabase schema, RLS, and typed clients](docs/agent-runs/RD-002.md)
- [RD-003 — Authentication and protected workspace](docs/agent-runs/RD-003.md)
- [RD-004 — Owner-scoped project CRUD](docs/agent-runs/RD-004.md)
- [RD-005 — Work-item CRUD, filters, dashboard, and date correction](docs/agent-runs/RD-005.md)

The protocol and increment plan are documented in [docs/AGENT_WORKFLOW.md](docs/AGENT_WORKFLOW.md). RD-006 evidence is added by the Orchestrator only after independent review and final verification.

## Assessment handoff

[docs/SUBMISSION.md](docs/SUBMISSION.md) is a safe delivery template. It intentionally contains no private submission URL, password, token, or invented answer. Evaluator credentials and the four form answers must be supplied separately after the hosted integration has been verified.
