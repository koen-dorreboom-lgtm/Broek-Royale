-- Los Amigos doet niet meer mee. Wis uitsluitend voorspellingen op dit team,
-- zodat getroffen deelnemers opnieuw een geldig team kunnen kiezen.
delete from public.predictions
where predicted_team_id = 'team-8';

update public.teams
set is_active = false,
    sort_order = 13
where id = 'team-8';

update public.teams
set sort_order = case id
  when 'team-9' then 8
  when 'team-10' then 9
  when 'team-11' then 10
  when 'team-12' then 11
  when 'team-13' then 12
  else sort_order
end
where id in ('team-9', 'team-10', 'team-11', 'team-12', 'team-13');
