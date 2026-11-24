create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text,
  target_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_name_format_check
    check (name = btrim(name) and char_length(name) between 1 and 80),
  constraint projects_description_format_check
    check (
      description is null
      or (description = btrim(description) and char_length(description) <= 500)
    ),
  constraint projects_id_owner_id_key unique (id, owner_id)
);

create table public.work_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid not null,
  title text not null,
  description text,
  status text not null default 'backlog',
  priority text not null default 'medium',
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint work_items_title_format_check
    check (title = btrim(title) and char_length(title) between 1 and 120),
  constraint work_items_description_format_check
    check (
      description is null
      or (description = btrim(description) and char_length(description) <= 2000)
    ),
  constraint work_items_status_check
    check (status in ('backlog', 'in_progress', 'review', 'ready')),
  constraint work_items_priority_check
    check (priority in ('low', 'medium', 'high')),
  constraint work_items_project_owner_fkey
    foreign key (project_id, owner_id)
    references public.projects (id, owner_id)
    on delete cascade
);

create index projects_owner_created_at_idx
  on public.projects (owner_id, created_at desc);

create index projects_owner_target_date_idx
  on public.projects (owner_id, target_date)
  where target_date is not null;

create index work_items_project_owner_idx
  on public.work_items (project_id, owner_id);

create index work_items_owner_status_idx
  on public.work_items (owner_id, status);

create index work_items_owner_due_date_idx
  on public.work_items (owner_id, due_date)
  where due_date is not null;

create function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

create trigger work_items_set_updated_at
before update on public.work_items
for each row execute function public.set_updated_at();

revoke all on function public.set_updated_at() from public, anon, authenticated;

alter table public.projects enable row level security;
alter table public.work_items enable row level security;

revoke all on table public.projects, public.work_items from anon, authenticated;
grant select, insert, update, delete on table public.projects, public.work_items to authenticated;

create policy "projects_select_own"
on public.projects
for select
to authenticated
using ((select auth.uid()) = owner_id);

create policy "projects_insert_own"
on public.projects
for insert
to authenticated
with check ((select auth.uid()) = owner_id);

create policy "projects_update_own"
on public.projects
for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "projects_delete_own"
on public.projects
for delete
to authenticated
using ((select auth.uid()) = owner_id);

create policy "work_items_select_own_project"
on public.work_items
for select
to authenticated
using (
  (select auth.uid()) = owner_id
  and exists (
    select 1
    from public.projects
    where projects.id = work_items.project_id
      and projects.owner_id = (select auth.uid())
  )
);

create policy "work_items_insert_own_project"
on public.work_items
for insert
to authenticated
with check (
  (select auth.uid()) = owner_id
  and exists (
    select 1
    from public.projects
    where projects.id = work_items.project_id
      and projects.owner_id = (select auth.uid())
  )
);

create policy "work_items_update_own_project"
on public.work_items
for update
to authenticated
using (
  (select auth.uid()) = owner_id
  and exists (
    select 1
    from public.projects
    where projects.id = work_items.project_id
      and projects.owner_id = (select auth.uid())
  )
)
with check (
  (select auth.uid()) = owner_id
  and exists (
    select 1
    from public.projects
    where projects.id = work_items.project_id
      and projects.owner_id = (select auth.uid())
  )
);

create policy "work_items_delete_own_project"
on public.work_items
for delete
to authenticated
using (
  (select auth.uid()) = owner_id
  and exists (
    select 1
    from public.projects
    where projects.id = work_items.project_id
      and projects.owner_id = (select auth.uid())
  )
);
