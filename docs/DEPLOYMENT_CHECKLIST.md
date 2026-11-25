# ReleaseDesk operations checklist

This checklist keeps the public deployment, Supabase project, and repository reproducible. Credentials belong in local environment files, provider settings, or a password manager; never in Git.

## Verified production baseline

- Public application: <https://releasedesk-three.vercel.app/>
- Public repository: <https://github.com/Pac76/releasedesk>
- Supabase migrations are aligned through `20261125115553_repository_intelligence.sql`.
- Demo-account sign-in, owner-scoped CRUD, repository capture, and anonymous denial have been exercised against the hosted project.
- A live capture for `pac76/releasedesk` persisted the GitHub head SHA and latest workflow result.

Re-run the local quality gate before each production push:

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

## 1. Apply and inspect Supabase migrations

Link the intended project, review the dry run, and then apply every pending migration:

```bash
npx supabase link <project-ref>
npx supabase db push --remote --dry-run
npx supabase db push --remote
npx supabase migration list --linked
```

Run database advisors and the pgTAP suites from Linux, WSL, or another environment where Docker can mount the repository path correctly:

```bash
npx supabase db advisors --remote --type security
npx supabase db advisors --remote --type performance
npx supabase test db --remote
```

The current Windows CLI wrapper mangles this workspace path before the pgTAP container starts. Keep that limitation visible; do not report the suite as executed until the runner reaches the SQL tests.

After a schema change, regenerate types from the linked project and review the diff:

```bash
npx supabase gen types --remote=<project-ref> --lang=typescript --schema public > src/types/database.ts
git diff -- src/types/database.ts
```

## 2. Configure authentication

In **Supabase → Authentication → URL Configuration**:

- Set **Site URL** to `https://releasedesk-three.vercel.app`.
- Allow `https://releasedesk-three.vercel.app` and the required nested callback paths.
- Allow `http://localhost:3000/**` for local development.
- Add preview domains only when they intentionally share this Auth project.

The confirmation template must target the application's token-hash route:

```html
<a href="{{ .RedirectTo }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/dashboard">
  Confirmar correo
</a>
```

Exercise whichever confirmation policy is enabled: email confirmation must establish the cookie-backed session, while disabled confirmation must return an immediate session.

## 3. Configure Vercel

Set these values for Production, and for Preview only when intended:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `GITHUB_TOKEN` — optional server-only token for a higher public GitHub API rate limit

The Supabase URL and publishable key are browser configuration. `GITHUB_TOKEN` is private and must not use a `NEXT_PUBLIC_` prefix. The application does not require a Supabase service-role key.

After changing variables, redeploy and confirm the production deployment corresponds to the expected `main` commit. Keep Vercel Authentication disabled for the production domain; preview protection may remain enabled.

## 4. Maintain demo access privately

- Keep one confirmed demo account with realistic sample data.
- Store its email and password outside the repository.
- Before sharing it, sign in from a clean browser and verify the linked project and latest repository snapshot are visible.
- Never put the credentials in source, issues, CI logs, screenshots, or documentation.

## 5. Verify the product end to end

In a signed-out private window:

- `/` returns the ReleaseDesk landing page without a Vercel login.
- `/login` renders the product form rather than a configuration error.
- `/dashboard` and `/projects` redirect to the ReleaseDesk login.
- Security headers include `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy`.

With the demo account:

- Sign in and sign out.
- Create, edit, list, and delete a project.
- Create, filter, advance, and delete work items.
- Connect `owner/repository`, capture a snapshot, and inspect its deterministic verdict and evidence.
- Confirm a failed GitHub read does not create a partial snapshot.
- Confirm malformed or guessed IDs return the generic unavailable/not-found experience.

For authorization changes, repeat the isolation checks with a second account and verify that cross-owner reads, writes, repository captures, and guessed IDs are denied.

## 6. Keep the presentation current

- Product narrative and roadmap: [`docs/PROJECT_PROFILE.md`](PROJECT_PROFILE.md)
- Data and behavior contract: [`docs/APP_SPEC.md`](APP_SPEC.md)
- Multi-agent protocol: [`docs/AGENT_WORKFLOW.md`](AGENT_WORKFLOW.md)
- Real implementation/review records: [`docs/agent-runs/`](agent-runs/)

Update these documents when behavior changes. They should describe the product and evidence that actually exist on `main`, never a planned or fabricated result.
