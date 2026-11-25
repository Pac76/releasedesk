begin;
select plan(19);

insert into auth.users (id, email)
values
  ('11111111-1111-4111-8111-111111111111', 'repository-a@example.test'),
  ('22222222-2222-4222-8222-222222222222', 'repository-b@example.test');

set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);

insert into public.projects (id, owner_id, name, repository_full_name)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', auth.uid(), 'Release A', 'owner/repo');

select lives_ok(
  $$ insert into public.repository_snapshots (
    owner_id, project_id, repository_full_name, default_branch, head_sha,
    head_committed_at, workflow_status, open_pull_requests, open_issues
  ) values (
    auth.uid(), 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'owner/repo', 'main',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', now(), 'success', 0, 0
  ) $$,
  'owner can insert a matching snapshot'
);

select results_eq(
  $$ select count(*)::bigint from public.repository_snapshots $$,
  array[1::bigint],
  'owner can select the snapshot'
);

select throws_ok(
  $$ update public.repository_snapshots set workflow_status = 'failure' $$,
  '42501', null,
  'snapshots cannot be updated'
);

select throws_ok(
  $$ delete from public.repository_snapshots $$,
  '42501', null,
  'snapshots cannot be deleted'
);

select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);

select results_eq(
  $$ select count(*)::bigint from public.repository_snapshots $$,
  array[0::bigint],
  'another owner cannot read the snapshot'
);

select throws_ok(
  $$ insert into public.repository_snapshots (
    owner_id, project_id, repository_full_name, default_branch, head_sha,
    head_committed_at, workflow_status, open_pull_requests, open_issues
  ) values (
    auth.uid(), 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'owner/repo', 'main',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', now(), 'success', 0, 0
  ) $$,
  '42501', null,
  'RLS rejects a cross-owner insert before constraint disclosure'
);

reset role;
select throws_ok(
  $$ insert into public.repository_snapshots (
    owner_id, project_id, repository_full_name, default_branch, head_sha,
    head_committed_at, workflow_status, open_pull_requests, open_issues
  ) values (
    '22222222-2222-4222-8222-222222222222',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'owner/repo', 'main',
    'cccccccccccccccccccccccccccccccccccccccc', now(), 'success', 0, 0
  ) $$,
  '23503', null,
  'composite foreign key rejects mismatched project ownership for privileged writes'
);

set local role anon;
select throws_ok(
  $$ select * from public.repository_snapshots $$,
  '42501', null,
  'anon cannot select snapshots'
);
select throws_ok(
  $$ insert into public.repository_snapshots (
    owner_id, project_id, repository_full_name, default_branch, head_sha,
    head_committed_at, workflow_status, open_pull_requests, open_issues
  ) values (
    '11111111-1111-4111-8111-111111111111',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'owner/repo', 'main',
    'dddddddddddddddddddddddddddddddddddddddd', now(), 'success', 0, 0
  ) $$,
  '42501', null,
  'anon cannot insert snapshots'
);

select throws_ok(
  $$ select public.capture_repository_snapshot(
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'owner/repo', 'main',
    'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', now(), 'success', 0, 0
  ) $$,
  '42501', null,
  'anon cannot execute the snapshot capture function'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);

insert into public.projects (id, owner_id, name)
values
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', auth.uid(), 'RPC success'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', auth.uid(), 'RPC rollback');

select set_config(
  'test.repository_snapshot_id',
  public.capture_repository_snapshot(
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'owner/rpc-repo', 'main',
    'ffffffffffffffffffffffffffffffffffffffff', now(), 'success', 2, 3
  )::text,
  true
);

select ok(
  current_setting('test.repository_snapshot_id')::uuid is not null,
  'owner capture RPC succeeds and returns a UUID'
);

select results_eq(
  $$ select repository_full_name from public.projects
     where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' $$,
  array['owner/rpc-repo'::text],
  'capture RPC links the repository to the owner project'
);

select results_eq(
  $$ select count(*)::bigint
     from public.repository_snapshots
     where id = current_setting('test.repository_snapshot_id')::uuid
       and project_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
       and owner_id = auth.uid()
       and repository_full_name = 'owner/rpc-repo'
       and open_pull_requests = 2
       and open_issues = 3 $$,
  array[1::bigint],
  'capture RPC persists the returned immutable snapshot atomically with the link'
);

select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);
select throws_ok(
  $$ select public.capture_repository_snapshot(
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'other/attempt', 'main',
    '1111111111111111111111111111111111111111', now(), 'success', 0, 0
  ) $$,
  '42501', 'Project unavailable',
  'cross-owner capture RPC is denied without disclosing the project'
);

select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
select results_eq(
  $$ select repository_full_name from public.projects
     where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' $$,
  array['owner/rpc-repo'::text],
  'cross-owner capture denial leaves the project unchanged'
);

select throws_ok(
  $$ select public.capture_repository_snapshot(
    'cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'owner/invalid-snapshot', 'main',
    '2222222222222222222222222222222222222222', now(), 'invalid', 0, 0
  ) $$,
  '23514', null,
  'invalid snapshot data rejects the capture RPC'
);

select is(
  (select repository_full_name from public.projects
   where id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'),
  null::text,
  'failed snapshot validation rolls back the project link update'
);

select results_eq(
  $$ select count(*)::bigint from public.repository_snapshots
     where project_id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc' $$,
  array[0::bigint],
  'failed snapshot validation leaves no partial snapshot'
);

delete from public.projects where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
select results_eq(
  $$ select count(*)::bigint from public.repository_snapshots
     where project_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' $$,
  array[0::bigint],
  'project deletion cascades snapshots'
);

select * from finish();
rollback;
