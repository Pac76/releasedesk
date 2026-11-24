# ReleaseDesk — Product Specification

## Product

ReleaseDesk is a focused release-readiness workspace for individual software makers. It turns projects and their work items into a clear path from backlog to ready-for-release while demonstrating a secure, production-minded full-stack implementation.

The UI is Spanish. Code, identifiers, commits, and technical documentation are English.

## Stack

- Next.js 16 App Router, strict TypeScript, React 19, and Tailwind CSS.
- Supabase PostgreSQL and Auth through current `@supabase/supabase-js` and `@supabase/ssr` packages.
- Vitest and Testing Library where component behavior benefits from it.
- Vercel production deployment.

Use exact compatible package versions in the lockfile. Do not commit secrets.

## MVP journeys

### Public and authentication

- A public landing page explains the product and provides sign-in/register actions.
- Email/password registration, sign-in, and sign-out use Supabase Auth.
- Protected routes redirect unauthenticated visitors to sign-in.
- Auth errors and missing Supabase configuration are explained without leaking details.

### Dashboard

- Show total projects, total work items, items in progress, items in review, ready items, and overdue items.
- Show a useful upcoming/recent work-item list and navigation to projects.
- Provide loading, empty, and error states.

### Projects

- List, create, rename/edit, and delete the signed-in user's projects.
- Fields: name, optional description, and optional target release date.
- Deletion requires confirmation and deliberately cascades to its work items.

### Work items

- Create, read, edit, delete, and filter work items within a project.
- Fields: title, optional description, status, priority, optional due date.
- Status: `backlog`, `in_progress`, `review`, `ready`.
- Priority: `low`, `medium`, `high`.
- Status can be advanced from the list without opening the full edit form.
- Overdue items are visually identifiable.

## Data model

Use UUID primary keys and `timestamptz` timestamps.

### `projects`

- `id uuid primary key`
- `owner_id uuid not null references auth.users(id) on delete cascade`
- `name text not null`, trimmed, 1–80 characters
- `description text null`, maximum 500 characters
- `target_date date null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### `work_items`

- `id uuid primary key`
- `owner_id uuid not null references auth.users(id) on delete cascade`
- `project_id uuid not null references public.projects(id) on delete cascade`
- `title text not null`, trimmed, 1–120 characters
- `description text null`, maximum 2,000 characters
- `status text not null default 'backlog'` with the four allowed values
- `priority text not null default 'medium'` with the three allowed values
- `due_date date null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Enforce a work item's owner/project consistency in the database as well as server logic. Add indexes justified by the dashboard and list queries.

## Security

- Enable RLS on every exposed table.
- Revoke default client grants and grant only select/insert/update/delete to `authenticated`; `anon` receives no table privileges.
- Use separate per-operation policies. Ownership is always `(select auth.uid()) = owner_id`.
- Work-item policies also ensure the referenced project belongs to the authenticated user.
- Update policies require both `USING` and `WITH CHECK`, and update requires a matching select policy.
- Validate and normalize writes on the server. Never rely on client filtering as authorization.
- Use only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in the browser. A service-role or secret key is out of scope.

## UI direction

- Clean release-operations dashboard with a warm neutral canvas, ink/navy typography, and a restrained coral/amber accent.
- Professional and distinctive rather than a generic kanban clone.
- Responsive desktop/mobile layouts with clear hierarchy, concise metric cards, readable tables/cards, and consistent status/priority badges.
- Avoid decorative gradients, excessive motion, glassmorphism, and emoji-heavy UI.

## Out of scope

- Teams, invitations, shared workspaces, roles, billing, notifications, uploads, AI chat, calendar integrations, and drag-and-drop.
- Service-role operations and admin dashboards.
- Elaborate charts or analytics infrastructure.

## Complete MVP acceptance criteria

1. A visitor can understand the product from the public landing page.
2. A new user can register, sign in, and sign out after Supabase is configured.
3. Unauthenticated visitors cannot access protected application data.
4. A signed-in user can manage projects and work items, including filters and quick status changes.
5. User A cannot read or mutate User B's data through UI, direct requests, guessed UUIDs, or server actions.
6. Project deletion cascades predictably and destructive actions require confirmation.
7. Server-side validation produces clear UI feedback.
8. Desktop and mobile layouts include loading, empty, success, and error states.
9. Lint, typecheck, tests, and production build pass.
10. The production Vercel URL is public, repository credentials are absent, and an evaluator account can be supplied separately.

