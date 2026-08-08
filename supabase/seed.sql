insert into public.teams (id, name, sort_order, is_active)
values
  ('team-1', 'The B-Team', 1, true),
  ('team-2', 'BDF Spreid De Vleugels', 2, true),
  ('team-3', 'Pirates in Waterland', 3, true),
  ('team-4', '20 jaar toppers', 4, true),
  ('team-5', 'Broek Royale', 5, true),
  ('team-6', 'De Broeker Fanfare', 6, true),
  ('team-7', 'New Kids in de keuken', 7, true),
  ('team-9', 'Sons of Anarchy', 8, true),
  ('team-10', 'De Tijgers', 9, true),
  ('team-11', 'De Freddies', 10, true),
  ('team-12', 'De judobaby’s', 11, true),
  ('team-13', 'Narcos en Aqualandia', 12, true),
  ('team-8', 'Los Amigos', 13, false)
on conflict (id) do update set
  name = excluded.name,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

insert into public.events (id, name, description, start_at, points, sort_order, kind)
values
  ('katknuppelen', 'Katknuppelen', 'De feestweek opent met een echte Broeker klassieker.', '2026-08-08T17:30:00+02:00', 100, 1, 'onderdeel'),
  ('fietstocht', 'Fietstocht', 'Voorspel welk team de zondagochtend het sterkst begint.', '2026-08-09T09:00:00+02:00', 100, 2, 'onderdeel'),
  ('onbekend-kaartspel', 'Onbekend Kaartspel', 'Een geheim kaartspel waarbij tactiek de doorslag geeft.', '2026-08-10T20:00:00+02:00', 100, 3, 'onderdeel'),
  ('pubquiz', 'Pubquiz', 'Welk team weet werkelijk alles van alles?', '2026-08-11T20:00:00+02:00', 100, 4, 'onderdeel'),
  ('brandweerspektakel', 'Brandweerspektakel', 'Een avond vol snelheid, water en spectaculaire proeven.', '2026-08-12T19:00:00+02:00', 100, 5, 'onderdeel'),
  ('talentshow', 'Talentshow', 'Het podium is voor het meest verrassende team.', '2026-08-13T19:30:00+02:00', 100, 6, 'onderdeel'),
  ('kermisspel', 'Kermisspel', 'Behendigheid en geluk komen samen op de kermis.', '2026-08-14T19:00:00+02:00', 100, 7, 'onderdeel'),
  ('broek-hangen', 'Broek hangen in Waterland', 'Wie houdt het hoofd koel boven het water?', '2026-08-15T12:00:00+02:00', 100, 8, 'onderdeel'),
  ('steenwerpen', 'Steenwerpen', 'De laatste zondag vraagt om kracht en precisie.', '2026-08-16T14:00:00+02:00', 100, 9, 'onderdeel'),
  ('verrassingselement', 'Verrassingselement', 'Niemand weet wat komt — kies dus extra zorgvuldig.', '2026-08-16T14:00:00+02:00', 100, 10, 'onderdeel'),
  ('feestweek-winnaar', 'Algehele Feestweek 2026 winnaar', 'Welk team verzamelt over de hele feestweek de meeste roem en kroont zich tot eindwinnaar?', '2026-08-08T17:30:00+02:00', 250, 11, 'overall')
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  start_at = excluded.start_at,
  points = excluded.points,
  sort_order = excluded.sort_order,
  kind = excluded.kind;
