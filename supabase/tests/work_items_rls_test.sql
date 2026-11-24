begin;
select plan(18);

insert into auth.users (id, email)
values
  ('11111111-1111-1111-1111-111111111111', 'owner@example.test'),
  ('22222222-2222-2222-2222-222222222222', 'other@example.test');

insert into public.projects (id, owner_id, name)
values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'Owner project'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '22222222-2222-2222-2222-222222222222',
    'Other project'
  );

insert into public.work_items (id, owner_id, project_id, title)
values (
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '11111111-1111-1111-1111-111111111111',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Existing item'
);

set local role anon;
select throws_ok(
  $$select * from public.work_items$$,
  '42501',
  null,
  'anon cannot read work items'
);
select throws_ok(
  $$insert into public.work_items (owner_id, project_id, title)
    values (
      '11111111-1111-1111-1111-111111111111',
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'Anonymous item'
    )$$,
  '42501',
  null,
  'anon cannot create work items'
);
select throws_ok(
  $$update public.work_items set title = 'Anonymous update'$$,
  '42501',
  null,
  'anon cannot update work items'
);
select throws_ok(
  $$delete from public.work_items$$,
  '42501',
  null,
  'anon cannot delete work items'
);

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select results_eq(
  $$insert into public.work_items (id, owner_id, project_id, title)
    values (
      'dddddddd-dddd-dddd-dddd-dddddddddddd',
      '11111111-1111-1111-1111-111111111111',
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'Owner item'
    )
    returning title$$,
  array['Owner item'],
  'the owner creates a work item in their project'
);
select results_eq(
  $$select count(*) from public.work_items$$,
  array[2::bigint],
  'the owner reads their work items'
);
select results_eq(
  $$update public.work_items
    set status = 'review'
    where id = 'dddddddd-dddd-dddd-dddd-dddddddddddd'
    returning status$$,
  array['review'],
  'the owner updates their work item'
);

set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
select throws_ok(
  $$insert into public.work_items (owner_id, project_id, title)
    values (
      '11111111-1111-1111-1111-111111111111',
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'Stolen item'
    )$$,
  '42501',
  null,
  'another user cannot create an item for the owner'
);
select is_empty(
  $$select * from public.work_items$$,
  'another user reads no owner work items'
);
select is_empty(
  $$update public.work_items set status = 'ready' returning id$$,
  'another user updates no owner work items'
);

set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select results_eq(
  $$select status from public.work_items
    where id = 'dddddddd-dddd-dddd-dddd-dddddddddddd'$$,
  array['review'],
  'the denied update left the owner work item intact'
);

set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
select is_empty(
  $$delete from public.work_items returning id$$,
  'another user deletes no owner work items'
);

set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select results_eq(
  $$select title from public.work_items
    where id = 'dddddddd-dddd-dddd-dddd-dddddddddddd'$$,
  array['Owner item'],
  'the denied delete left the owner work item intact'
);
select throws_ok(
  $$insert into public.work_items (owner_id, project_id, title)
    values (
      '11111111-1111-1111-1111-111111111111',
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      'Wrong project item'
    )$$,
  '42501',
  null,
  'an owner cannot add work to another users project'
);

reset role;
select throws_ok(
  $$insert into public.work_items (owner_id, project_id, title)
    values (
      '22222222-2222-2222-2222-222222222222',
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'Mismatched owner item'
    )$$,
  '23503',
  null,
  'the composite foreign key rejects mismatched project ownership'
);

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select results_eq(
  $$delete from public.work_items
    where id = 'dddddddd-dddd-dddd-dddd-dddddddddddd'
    returning title$$,
  array['Owner item'],
  'the owner deletes their own work item'
);
select results_eq(
  $$delete from public.projects
    where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
    returning id$$,
  array['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid],
  'the owner deletes their project'
);

reset role;
select results_eq(
  $$select count(*) from public.work_items
    where owner_id = '11111111-1111-1111-1111-111111111111'$$,
  array[0::bigint],
  'deleting a project cascades to its remaining work items'
);

select * from finish();
rollback;
