# ReleaseDesk

ReleaseDesk is a focused release-readiness workspace for individual software makers. It is being built as a production-minded Next.js assessment with a real Orchestrator → Develop → Testing review loop.

## Current status

`RD-001` establishes the Next.js foundation, public Spanish landing page, responsive visual system, route states, and quality scripts. `RD-002` adds the local Supabase project configuration, reproducible schema migration, owner-scoped RLS policies and tests, typed SSR clients, and checked-in database types.

The `/login` route remains an honest placeholder until the Supabase authentication increment is implemented.

No remote Supabase or Vercel project is connected at this stage, and no production deployment is claimed.

## Run locally

Requirements: Node.js 20.9 or newer and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Environment

Copy `.env.example` to `.env.local` only when the Supabase project exists. Never commit `.env.local` or real credentials.

Expected public variables for the future integration:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

The public app continues to build without these variables. Calling a Supabase client factory before they are configured fails with a clear error that contains no credential value.

## Connect Supabase later

1. Create a free Supabase project manually.
2. Open the project's **Connect** dialog and copy only the Project URL and publishable key into a local `.env.local` file:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

3. Apply `supabase/migrations/20261124233226_initial_release_schema.sql` to the project. This can be pasted into the Supabase SQL Editor, or applied later through an intentionally linked CLI workflow.
4. Verify Database API exposure if the project disables automatic table exposure. The migration already revokes defaults, grants only `select`, `insert`, `update`, and `delete` to `authenticated`, and gives `anon` no table access.
5. Regenerate the checked-in database types from the connected project and review the diff:

   ```bash
   npx supabase gen types --remote=<project-ref> --lang=typescript --schema public > src/types/database.ts
   ```

The current `src/types/database.ts` is aligned manually with the migration; it is not claimed as remotely generated.

Never add a `service_role` or secret key to this application. ReleaseDesk requires only the public URL and publishable key because authorization is enforced by RLS.

## Local database verification

Docker is required for the local Supabase stack. The CLI is pinned in `devDependencies`, so no global installation is needed.

```bash
npx supabase start
npx supabase db reset
npx supabase test db
```

`db reset` applies all migrations and the intentionally empty `supabase/seed.sql`. The pgTAP tests prove anonymous denial, owner CRUD, cross-user isolation, composite owner/project integrity, and project deletion cascades.

To regenerate types from the local database instead:

```bash
npx supabase gen types --lang=typescript --schema public > src/types/database.ts
```

## Agent workflow

- `AGENTS.md` defines the Orchestrator and mandatory review loop.
- `.codex/agents/develop.toml` and `agents/DEVELOP.md` configure implementation work.
- `.codex/agents/testing.toml` and `agents/TESTING.md` configure independent read-only QA.
- `docs/AGENT_WORKFLOW.md` defines the evidence and increment plan.
- `docs/agent-runs/` contains truthful summaries of completed review cycles.

Product scope and security requirements live in `docs/APP_SPEC.md`.

