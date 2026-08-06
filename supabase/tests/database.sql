begin;

create extension if not exists pgtap with schema extensions;
select plan(15);

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'speler@example.nl', '', '{}', '{"first_name":"Test","last_name":"Speler","username":"testspeler"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'koen-dorreboom@hotmail.nl', '', '{}', '{"first_name":"Koen","last_name":"Dorreboom","username":"beheerder"}', now(), now());

insert into public.teams (id, name, sort_order) values ('rls-team-1', 'RLS Team 1', 901), ('rls-team-2', 'RLS Team 2', 902);
insert into public.events (id, name, start_at, points, sort_order, kind, locked_at)
values
  ('rls-open', 'RLS open', now() - interval '1 hour', 100, 901, 'onderdeel', null),
  ('rls-closed', 'RLS gesloten', now() + interval '1 hour', 100, 902, 'onderdeel', now());

select is((select role from public.profiles where id = '10000000-0000-0000-0000-000000000001'), 'participant', 'Nieuwe speler krijgt participant-rol');
select is((select role from public.profiles where id = '10000000-0000-0000-0000-000000000002'), 'admin', 'Alleen het ingestelde e-mailadres krijgt admin-rol');

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);

select lives_ok(
  $$insert into public.predictions (user_id, event_id, predicted_team_id) values ('10000000-0000-0000-0000-000000000001', 'rls-open', 'rls-team-1')$$,
  'Eigen voorspelling blijft na de starttijd mogelijk zolang de stemming open is'
);
select throws_ok(
  $$insert into public.predictions (user_id, event_id, predicted_team_id) values ('10000000-0000-0000-0000-000000000001', 'rls-closed', 'rls-team-1')$$,
  '42501',
  null,
  'Voorspelling wordt bij een handmatig gesloten stemming door RLS geweigerd'
);
select throws_ok(
  $$update public.events set winning_team_id = 'rls-team-1' where id = 'rls-open'$$,
  '42501',
  null,
  'Deelnemer kan geen uitslag aanpassen'
);
select is((select count(*)::integer from public.profiles), 1, 'Deelnemer kan alleen het eigen profiel lezen');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);
select throws_ok(
  $$update public.events set winning_team_id = 'rls-team-2' where id = 'rls-open'$$,
  '23514',
  null,
  'Ook een admin kan geen uitslag op een open stemming zetten'
);
select lives_ok(
  $$select public.set_event_locked('rls-open', true)$$,
  'Admin kan een stemming handmatig sluiten'
);
select ok((select locked_at is not null from public.events where id = 'rls-open'), 'Sluiten legt een sluitmoment vast');
select lives_ok(
  $$update public.events set winning_team_id = 'rls-team-2' where id = 'rls-open'$$,
  'Admin kan na sluiting een uitslag vastleggen'
);
select is((select count(*)::integer from public.result_audit where event_id = 'rls-open'), 1, 'Uitslagwijziging maakt één auditregel');
select throws_ok(
  $$select public.set_event_locked('rls-open', false)$$,
  '23514',
  null,
  'Een stemming met uitslag kan niet worden heropend'
);
select lives_ok(
  $$update public.events set winning_team_id = null where id = 'rls-open'$$,
  'Admin kan de uitslag intrekken'
);
select lives_ok(
  $$select public.set_event_locked('rls-open', false)$$,
  'Admin kan een stemming zonder uitslag heropenen'
);
select ok((select locked_at is null from public.events where id = 'rls-open'), 'Heropenen wist het sluitmoment');

select * from finish();
rollback;
