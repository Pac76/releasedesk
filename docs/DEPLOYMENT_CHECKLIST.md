# ReleaseDesk deployment checklist

This checklist separates completed repository work from manual operations that require the owner's Supabase, Vercel, and assessment accounts. Do not paste passwords, access tokens, database credentials, or the private submission URL into Git.

## Verified starting point

- [ ] Confirm the repository is public at <https://github.com/Pac76/releasedesk>.
- [ ] Confirm the production landing page is reachable at <https://releasedesk-three.vercel.app/>.
- [ ] Pull the final `main` branch and confirm GitHub Actions is green.
- [ ] Run `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` locally.

The public production URL previously returned anonymous HTTP 200 without Vercel Authentication. Authenticated Supabase behavior is not considered verified until the remaining sections pass.

## 1. Apply and verify the Supabase schema

Use one of these owner-controlled paths.

### Option A — SQL Editor

1. Open the intended Supabase project.
2. Open **SQL Editor** and run the complete contents of `supabase/migrations/20261124233226_initial_release_schema.sql` once.
3. Verify that `public.projects` and `public.work_items` exist and that RLS is enabled on both.
4. Confirm `anon` has no table privileges and `authenticated` has only select, insert, update, and delete.

### Option B — pinned CLI

Supabase CLI 3 targets local resources by default, so every hosted command below names `--remote` explicitly. Review the dry run before applying anything.

```bash
npx supabase link <project-ref>
npx supabase db push --remote --dry-run
npx supabase db push --remote
```

Then run the remote checks supported by the pinned CLI:

```bash
npx supabase db advisors --remote --type security
npx supabase db advisors --remote --type performance
npx supabase test db --remote
```

If remote pgTAP is not appropriate for the selected project, run `npx supabase start`, `npx supabase db reset`, and `npx supabase test db` in a working Docker/WSL/Linux environment instead. Record the real result; do not mark an unavailable check as passed.

Regenerate types from the connected project and review the diff:

```bash
npx supabase gen types --remote=<project-ref> --lang=typescript --schema public > src/types/database.ts
git diff -- src/types/database.ts
```

## 2. Configure Supabase Auth

In **Authentication → URL Configuration**:

- Set **Site URL** to `https://releasedesk-three.vercel.app`.
- Add `https://releasedesk-three.vercel.app` to the redirect allowlist.
- Add `https://releasedesk-three.vercel.app/**` if future production flows need nested redirect targets.
- Add `http://localhost:3000/**` for local development.
- Add preview-domain patterns only if previews will intentionally share this Auth project; keep the production origin exact.

In **Authentication → Email Templates → Confirm signup**, use the token-hash route expected by the application:

```html
<a href="{{ .RedirectTo }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/dashboard">
  Confirmar correo
</a>
```

Decide whether **Confirm Email** is enabled and test the corresponding supported outcome:

- Enabled: registration shows the check-email state and the email link establishes the cookie-backed session.
- Disabled: registration receives an immediate session and continues to the dashboard.

## 3. Configure Vercel

In the ReleaseDesk Vercel project, add these variables using values from the Supabase **Connect** dialog:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Apply them to **Production**. Apply them to **Preview** only if preview deployments should use the same project or an intentionally separate preview project. Never add a service-role or secret key.

Redeploy after changing environment variables. The owner-configured Git integration deploys pushes to `main`; confirm the latest production deployment corresponds to the intended commit.

Under **Settings → Deployment Protection**:

- Disable Vercel Authentication for the production deployment.
- Confirm the production domain is `releasedesk-three.vercel.app`, not a preview URL.
- Preview protection may remain enabled if desired; only the submitted production URL must be public.

## 4. Create evaluator access outside Git

- [ ] Register a dedicated evaluator email through the application or an owner-controlled Supabase Auth workflow.
- [ ] Complete email confirmation if enabled.
- [ ] Store the evaluator email and password in a private password manager or the submission form only.
- [ ] Do not add the password to `docs/SUBMISSION.md`, an issue, commit, CI variable, screenshot, or chat log.

## 5. Verify the authenticated product

Use the evaluator account in a clean browser session:

- [ ] Sign in and sign out successfully.
- [ ] Create, edit, list, and delete a project; confirm deletion warns that work items cascade.
- [ ] Open a project and create, edit, filter, advance, and delete work items.
- [ ] Confirm overdue behavior follows the `America/Argentina/Buenos_Aires` calendar and never marks `ready` items overdue.
- [ ] Confirm dashboard counts and active work reflect the owned rows.
- [ ] Confirm malformed or guessed UUIDs return the generic unavailable/not-found experience.

Use a separate second account for the isolation check:

- [ ] User B cannot list User A's projects or work items.
- [ ] User B cannot update/delete User A's rows through guessed IDs or direct server-action submissions.
- [ ] User B cannot create a work item under User A's project.

## 6. Verify public production

In a signed-out incognito/private window with no Vercel session:

- [ ] `/` loads with HTTP 200 and no platform login prompt.
- [ ] `/login` loads the ReleaseDesk form, not a setup-error state.
- [ ] `/dashboard` and `/projects` redirect to ReleaseDesk login.
- [ ] Registration/confirmation/sign-in work against the intended production project.
- [ ] Response headers include `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, the configured `Referrer-Policy`, and `Permissions-Policy`.
- [ ] Desktop and mobile layouts remain readable and keyboard operable.

## 7. Prepare the assessment submission

- [ ] Copy the public app URL: `https://releasedesk-three.vercel.app/`.
- [ ] Copy the repository URL: `https://github.com/Pac76/releasedesk`.
- [ ] Paste the evaluator email/password directly into the private form, never into Git.
- [ ] Open the personal submission link privately and copy the four short questions into a temporary private note.
- [ ] Answer only the questions actually shown; do not invent them in advance.
- [ ] Use `docs/SUBMISSION.md` as the safe handoff outline.
- [ ] Submit only after repeating the incognito production check.
