create extension if not exists citext with schema extensions;
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null check (char_length(first_name) between 1 and 80),
  last_name text not null check (char_length(last_name) between 1 and 120),
  username extensions.citext not null unique check (char_length(username::text) between 3 and 30),
  avatar_path text,
  role text not null default 'participant' check (role in ('participant', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.teams (
  id text primary key,
  name text not null unique,
  sort_order integer not null check (sort_order > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id text primary key,
  name text not null,
  description text not null default '',
  start_at timestamptz not null,
  points integer not null check (points > 0),
  sort_order integer not null check (sort_order > 0),
  kind text not null default 'onderdeel' check (kind in ('onderdeel', 'overall')),
  winning_team_id text references public.teams(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.predictions (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_id text not null references public.events(id) on delete cascade,
  predicted_team_id text not null references public.teams(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, event_id)
);

create table if not exists public.result_audit (
  id bigint generated always as identity primary key,
  event_id text not null references public.events(id) on delete cascade,
  previous_team_id text references public.teams(id) on delete set null,
  winning_team_id text references public.teams(id) on delete set null,
  changed_by uuid references public.profiles(id) on delete set null,
  changed_at timestamptz not null default now()
);

create index if not exists events_start_at_idx on public.events(start_at);
create index if not exists predictions_user_id_idx on public.predictions(user_id);
create index if not exists predictions_event_id_idx on public.predictions(event_id);
create index if not exists result_audit_event_id_idx on public.result_audit(event_id, changed_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists teams_set_updated_at on public.teams;
create trigger teams_set_updated_at before update on public.teams
for each row execute function public.set_updated_at();

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at before update on public.events
for each row execute function public.set_updated_at();

drop trigger if exists predictions_set_updated_at on public.predictions;
create trigger predictions_set_updated_at before update on public.predictions
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_username text;
begin
  requested_username := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'username'), ''),
    'speler-' || left(new.id::text, 8)
  );

  insert into public.profiles (id, first_name, last_name, username, role)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'first_name'), ''), 'Broeker'),
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'last_name'), ''), 'Speler'),
    requested_username,
    case
      when lower(new.email) = 'koen-dorreboom@hotmail.nl' then 'admin'
      else 'participant'
    end
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin(check_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = check_user_id and role = 'admin'
  );
$$;

create or replace function public.is_username_available(candidate text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    char_length(trim(candidate)) between 3 and 30
    and not exists (
      select 1 from public.profiles where username = trim(candidate)::extensions.citext
    );
$$;

create or replace function public.audit_result_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.winning_team_id is distinct from new.winning_team_id then
    insert into public.result_audit (
      event_id,
      previous_team_id,
      winning_team_id,
      changed_by
    ) values (
      new.id,
      old.winning_team_id,
      new.winning_team_id,
      auth.uid()
    );
  end if;
  return new;
end;
$$;

drop trigger if exists events_audit_result on public.events;
create trigger events_audit_result
after update of winning_team_id on public.events
for each row execute function public.audit_result_change();

create or replace function public.get_public_leaderboard()
returns table (
  position bigint,
  user_id uuid,
  username text,
  avatar_path text,
  points integer,
  correct_predictions integer
)
language sql
stable
security definer
set search_path = ''
as $$
  with scores as (
    select
      profile.id as user_id,
      profile.username::text as username,
      profile.avatar_path,
      coalesce(sum(
        case
          when event.winning_team_id is not null
            and prediction.predicted_team_id = event.winning_team_id
          then event.points
          else 0
        end
      ), 0)::integer as points,
      count(*) filter (
        where event.winning_team_id is not null
          and prediction.predicted_team_id = event.winning_team_id
      )::integer as correct_predictions
    from public.profiles as profile
    left join public.predictions as prediction on prediction.user_id = profile.id
    left join public.events as event on event.id = prediction.event_id
    group by profile.id, profile.username, profile.avatar_path
  ), ranked as (
    select
      rank() over (order by points desc, correct_predictions desc) as position,
      scores.*
    from scores
  )
  select
    ranked.position,
    ranked.user_id,
    ranked.username,
    ranked.avatar_path,
    ranked.points,
    ranked.correct_predictions
  from ranked
  order by ranked.position, ranked.username;
$$;

alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.events enable row level security;
alter table public.predictions enable row level security;
alter table public.result_audit enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles for select to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "teams_public_read" on public.teams;
create policy "teams_public_read"
on public.teams for select to anon, authenticated
using (true);

drop policy if exists "teams_admin_write" on public.teams;
create policy "teams_admin_write"
on public.teams for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "events_public_read" on public.events;
create policy "events_public_read"
on public.events for select to anon, authenticated
using (true);

drop policy if exists "events_admin_write" on public.events;
create policy "events_admin_write"
on public.events for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "predictions_select_own" on public.predictions;
create policy "predictions_select_own"
on public.predictions for select to authenticated
using (user_id = auth.uid());

drop policy if exists "predictions_insert_own_before_start" on public.predictions;
create policy "predictions_insert_own_before_start"
on public.predictions for insert to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.events
    where events.id = predictions.event_id and events.start_at > now()
  )
);

drop policy if exists "predictions_update_own_before_start" on public.predictions;
create policy "predictions_update_own_before_start"
on public.predictions for update to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1 from public.events
    where events.id = predictions.event_id and events.start_at > now()
  )
)
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.events
    where events.id = predictions.event_id and events.start_at > now()
  )
);

drop policy if exists "predictions_delete_own_before_start" on public.predictions;
create policy "predictions_delete_own_before_start"
on public.predictions for delete to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1 from public.events
    where events.id = predictions.event_id and events.start_at > now()
  )
);

drop policy if exists "result_audit_admin_read" on public.result_audit;
create policy "result_audit_admin_read"
on public.result_audit for select to authenticated
using (public.is_admin());

revoke all on public.profiles from anon, authenticated;
revoke all on public.teams from anon, authenticated;
revoke all on public.events from anon, authenticated;
revoke all on public.predictions from anon, authenticated;
revoke all on public.result_audit from anon, authenticated;

grant select on public.profiles to authenticated;
grant update (first_name, last_name, username, avatar_path) on public.profiles to authenticated;
grant select on public.teams to anon, authenticated;
grant insert, update, delete on public.teams to authenticated;
grant select on public.events to anon, authenticated;
grant insert, update, delete on public.events to authenticated;
grant select, insert, update, delete on public.predictions to authenticated;
grant select on public.result_audit to authenticated;
grant usage, select on sequence public.result_audit_id_seq to authenticated;

revoke all on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to authenticated;
revoke all on function public.is_username_available(text) from public;
grant execute on function public.is_username_available(text) to anon, authenticated;
revoke all on function public.get_public_leaderboard() from public;
grant execute on function public.get_public_leaderboard() to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  524288,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
on storage.objects for select to anon, authenticated
using (bucket_id = 'avatars');

drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own"
on storage.objects for update to authenticated
using (
  bucket_id = 'avatars'
  and owner_id = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own"
on storage.objects for delete to authenticated
using (
  bucket_id = 'avatars'
  and owner_id = auth.uid()::text
);
