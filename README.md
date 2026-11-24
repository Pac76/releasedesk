# ReleaseDesk

ReleaseDesk is a focused release-readiness workspace for individual software makers. It is being built as a production-minded Next.js assessment with a real Orchestrator → Develop → Testing review loop.

## Current status

`RD-001` establishes the Next.js foundation, public Spanish landing page, responsive visual system, route states, and quality scripts. The `/login` route is intentionally an honest placeholder until the Supabase authentication increment is implemented.

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

## Agent workflow

- `AGENTS.md` defines the Orchestrator and mandatory review loop.
- `.codex/agents/develop.toml` and `agents/DEVELOP.md` configure implementation work.
- `.codex/agents/testing.toml` and `agents/TESTING.md` configure independent read-only QA.
- `docs/AGENT_WORKFLOW.md` defines the evidence and increment plan.
- `docs/agent-runs/` contains truthful summaries of completed review cycles.

Product scope and security requirements live in `docs/APP_SPEC.md`.

