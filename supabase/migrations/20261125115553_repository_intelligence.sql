alter table public.projects
  add column repository_full_name text;

alter table public.projects
  add constraint projects_repository_full_name_format
  check (
    repository_full_name is null
    or (
      repository_full_name = lower(btrim(repository_full_name))
      and repository_full_name ~ '^[a-z0-9]([a-z0-9-]{0,37}[a-z0-9])?/[a-z0-9._-]{1,100}$'
      and split_part(repository_full_name, '/', 2) not in ('.', '..')
      and split_part(repository_full_name, '/', 2) not like '%.git'
    )
  );

create table public.repository_snapshots (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null,
  repository_full_name text not null,
  default_branch text not null,
  head_sha text not null,
  head_committed_at timestamptz not null,
  workflow_status text not null,
  open_pull_requests integer not null,
  open_issues integer not null,
  captured_at timestamptz not null default now(),
  constraint repository_snapshots_project_owner_fkey
    foreign key (project_id, owner_id)
    references public.projects(id, owner_id)
    on delete cascade,
  constraint repository_snapshots_repository_format check (
    repository_full_name = lower(btrim(repository_full_name))
    and repository_full_name ~ '^[a-z0-9]([a-z0-9-]{0,37}[a-z0-9])?/[a-z0-9._-]{1,100}$'
    and split_part(repository_full_name, '/', 2) not in ('.', '..')
    and split_part(repository_full_name, '/', 2) not like '%.git'
  ),
  constraint repository_snapshots_default_branch_format check (
    default_branch = btrim(default_branch)
    and char_length(default_branch) between 1 and 255
  ),
  constraint repository_snapshots_head_sha_format check (
    head_sha = lower(head_sha)
    and head_sha ~ '^[0-9a-f]{40,64}$'
  ),
  constraint repository_snapshots_workflow_status_check check (
    workflow_status in (
      'success', 'failure', 'pending', 'cancelled', 'neutral', 'skipped',
      'timed_out', 'action_required', 'stale', 'startup_failure',
      'unknown', 'not_configured'
    )
  ),
  constraint repository_snapshots_open_pull_requests_check check (open_pull_requests >= 0),
  constraint repository_snapshots_open_issues_check check (open_issues >= 0)
);

create index repository_snapshots_owner_project_captured_idx
  on public.repository_snapshots (owner_id, project_id, captured_at desc);

alter table public.repository_snapshots enable row level security;

revoke all on table public.repository_snapshots from anon, authenticated;
grant select, insert on table public.repository_snapshots to authenticated;

create policy repository_snapshots_select_owner
  on public.repository_snapshots
  for select
  to authenticated
  using (
    owner_id = (select auth.uid())
    and exists (
      select 1
      from public.projects
      where projects.id = repository_snapshots.project_id
        and projects.owner_id = (select auth.uid())
    )
  );

create policy repository_snapshots_insert_owner
  on public.repository_snapshots
  for insert
  to authenticated
  with check (
    owner_id = (select auth.uid())
    and exists (
      select 1
      from public.projects
      where projects.id = repository_snapshots.project_id
        and projects.owner_id = (select auth.uid())
        and projects.repository_full_name = repository_snapshots.repository_full_name
    )
  );

create or replace function public.capture_repository_snapshot(
  p_project_id uuid,
  p_repository_full_name text,
  p_default_branch text,
  p_head_sha text,
  p_head_committed_at timestamptz,
  p_workflow_status text,
  p_open_pull_requests integer,
  p_open_issues integer
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  snapshot_id uuid;
begin
  update public.projects
  set repository_full_name = p_repository_full_name
  where id = p_project_id
    and owner_id = (select auth.uid());

  if not found then
    raise exception using errcode = '42501', message = 'Project unavailable';
  end if;

  insert into public.repository_snapshots (
    owner_id,
    project_id,
    repository_full_name,
    default_branch,
    head_sha,
    head_committed_at,
    workflow_status,
    open_pull_requests,
    open_issues
  ) values (
    (select auth.uid()),
    p_project_id,
    p_repository_full_name,
    p_default_branch,
    p_head_sha,
    p_head_committed_at,
    p_workflow_status,
    p_open_pull_requests,
    p_open_issues
  )
  returning id into snapshot_id;

  return snapshot_id;
end;
$$;

revoke all on function public.capture_repository_snapshot(
  uuid, text, text, text, timestamptz, text, integer, integer
) from public, anon;
grant execute on function public.capture_repository_snapshot(
  uuid, text, text, text, timestamptz, text, integer, integer
) to authenticated;
