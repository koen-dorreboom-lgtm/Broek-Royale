-- Definitieve teamlijst en een eenmalige lege start voor alle deelnemers.
-- Voer deze migratie slechts eenmaal uit: na de reset kunnen deelnemers direct opnieuw stemmen.
delete from public.predictions;

update public.teams
set is_active = false
where id not in (
  'team-1', 'team-2', 'team-3', 'team-4', 'team-5', 'team-6', 'team-7',
  'team-8', 'team-9', 'team-10', 'team-11', 'team-12', 'team-13'
);

insert into public.teams (id, name, sort_order, is_active)
values
  ('team-1', 'The B-Team', 1, true),
  ('team-2', 'BDF Spreid De Vleugels', 2, true),
  ('team-3', 'Pirates in Waterland', 3, true),
  ('team-4', '20 jaar toppers', 4, true),
  ('team-5', 'Broek Royale', 5, true),
  ('team-6', 'De Broeker Fanfare', 6, true),
  ('team-7', 'New Kids in de keuken', 7, true),
  ('team-8', 'Los Amigos', 8, true),
  ('team-9', 'Sons of Anarchy', 9, true),
  ('team-10', 'De Tijgers', 10, true),
  ('team-11', 'De Freddies', 11, true),
  ('team-12', 'De judobaby’s', 12, true),
  ('team-13', 'Narcos en Aqualandia', 13, true)
on conflict (id) do update set
  name = excluded.name,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;
