begin;
select plan(14);

insert into auth.users (id, email)
values
  ('11111111-1111-1111-1111-111111111111', 'owner@example.test'),
  ('22222222-2222-2222-2222-222222222222', 'other@example.test');

set local role anon;
select throws_ok(
  $$select * from public.projects$$,
  '42501',
  null,
  'anon cannot read projects'
);
select throws_ok(
  $$insert into public.projects (owner_id, name)
    values ('11111111-1111-1111-1111-111111111111', 'Anonymous project')$$,
  '42501',
  null,
  'anon cannot create projects'
);
select throws_ok(
  $$update public.projects set name = 'Anonymous update'$$,
  '42501',
  null,
  'anon cannot update projects'
);
select throws_ok(
  $$delete from public.projects$$,
  '42501',
  null,
  'anon cannot delete projects'
);

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select results_eq(
  $$insert into public.projects (id, owner_id, name)
    values (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      '11111111-1111-1111-1111-111111111111',
      'Owner project'
    )
    returning name$$,
  array['Owner project'],
  'the owner creates their own project'
);
select results_eq(
  $$select name from public.projects
    where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'$$,
  array['Owner project'],
  'the owner reads their own project'
);
select results_eq(
  $$update public.projects
    set name = 'Updated project'
    where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
    returning name$$,
  array['Updated project'],
  'the owner updates their own project'
);

set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
select throws_ok(
  $$insert into public.projects (owner_id, name)
    values ('11111111-1111-1111-1111-111111111111', 'Stolen project')$$,
  '42501',
  null,
  'another user cannot create a project for the owner'
);
select is_empty(
  $$select * from public.projects$$,
  'another user reads no owner projects'
);
select is_empty(
  $$update public.projects set name = 'Stolen update' returning name$$,
  'another user updates no owner projects'
);

set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select results_eq(
  $$select name from public.projects
    where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'$$,
  array['Updated project'],
  'the denied update left the owner project intact'
);

set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
select is_empty(
  $$delete from public.projects returning id$$,
  'another user deletes no owner projects'
);

set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select results_eq(
  $$select name from public.projects
    where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'$$,
  array['Updated project'],
  'the denied delete left the owner project intact'
);
select results_eq(
  $$delete from public.projects
    where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
    returning id$$,
  array['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid],
  'the owner deletes their own project'
);

select * from finish();
rollback;
