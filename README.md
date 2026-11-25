# ReleaseDesk

ReleaseDesk is a focused release-readiness workspace for individual software makers. It is being built as a production-minded Next.js assessment with a real Orchestrator → Develop → Testing review loop.

## Current status

`RD-001` establishes the Next.js foundation, public Spanish landing page, responsive visual system, route states, and quality scripts. `RD-002` adds the local Supabase project configuration, reproducible schema migration, owner-scoped RLS policies and tests, typed SSR clients, and checked-in database types. `RD-003` adds email/password registration and sign-in actions, email confirmation handling, cookie refresh through the Next.js 16 proxy, sign-out, and a defense-in-depth protected dashboard shell. `RD-004` adds the owner-scoped project CRUD vertical slice with validated server actions, shared protected workspace navigation, and explicit loading, empty, error, and mutation feedback states. `RD-005` completes the core workspace with project-scoped work-item CRUD, allowlisted URL filters, quick status advancement, overdue identification, and real owner-scoped dashboard metrics and active-work summaries.

Project and work-item CRUD are available after Supabase is configured and the checked-in migration is applied. Dashboard values are calculated from owned rows rather than fabricated samples. Production hardening and hosted browser verification remain part of `RD-006`.

Remote Supabase Auth configuration and the production flow have not been verified from this repository, and no deployment result is claimed here.

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

Without configuration, `/login` renders an honest setup state and protected routes such as `/dashboard` and `/projects` redirect back to it. Never add a `service_role` or secret key: the browser and SSR clients need only these public values.

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

## Configure Supabase Auth

In **Authentication → URL Configuration** set:

- Site URL: `https://releasedesk-three.vercel.app`
- Redirect URL for local development: `http://localhost:3000/**`
- Redirect URL for production: `https://releasedesk-three.vercel.app/**`

The registration action passes only one of those trusted origins as `emailRedirectTo`; arbitrary request hosts are never copied into confirmation emails.

For server-side email confirmation, open **Authentication → Email Templates → Confirm signup** and use a token-hash link:

```html
<a href="{{ .RedirectTo }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/dashboard">
  Confirmar correo
</a>
```

With **Confirm Email** enabled, registration displays a check-your-email state and `/auth/confirm` exchanges the token hash for cookie-backed authentication. With confirmation disabled, Supabase returns a session immediately and registration continues directly to `/dashboard`.

These dashboard settings must be applied and tested manually after the hosted project is connected. Do not create evaluator accounts from automated checks.

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

