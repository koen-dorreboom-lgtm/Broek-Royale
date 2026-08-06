alter table public.events
add column if not exists locked_at timestamptz,
add column if not exists locked_by uuid references public.profiles(id) on delete set null;

-- Een bestaande uitslag betekent dat de stemming al afgelopen hoort te zijn.
update public.events
set locked_at = coalesce(locked_at, now())
where winning_team_id is not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'events_result_requires_lock'
      and conrelid = 'public.events'::regclass
  ) then
    alter table public.events
    add constraint events_result_requires_lock
    check (winning_team_id is null or locked_at is not null);
  end if;
end;
$$;

create index if not exists events_locked_at_idx on public.events(locked_at);

create or replace function public.set_event_locked(target_event_id text, should_lock boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_winner text;
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'Alleen een beheerder mag een stemming openen of sluiten.'
      using errcode = '42501';
  end if;

  select winning_team_id
  into current_winner
  from public.events
  where id = target_event_id
  for update;

  if not found then
    raise exception 'Onderdeel niet gevonden.' using errcode = 'P0002';
  end if;

  if not should_lock and current_winner is not null then
    raise exception 'Trek eerst de uitslag in voordat je de stemming heropent.'
      using errcode = '23514';
  end if;

  if should_lock then
    update public.events
    set
      locked_at = coalesce(locked_at, now()),
      locked_by = coalesce(locked_by, auth.uid())
    where id = target_event_id
      and locked_at is null;
  else
    update public.events
    set locked_at = null, locked_by = null
    where id = target_event_id
      and locked_at is not null;
  end if;
end;
$$;

drop policy if exists "predictions_insert_own_before_start" on public.predictions;
drop policy if exists "predictions_update_own_before_start" on public.predictions;
drop policy if exists "predictions_delete_own_before_start" on public.predictions;
drop policy if exists "predictions_insert_own_while_open" on public.predictions;
drop policy if exists "predictions_update_own_while_open" on public.predictions;
drop policy if exists "predictions_delete_own_while_open" on public.predictions;

create policy "predictions_insert_own_while_open"
on public.predictions for insert to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.events
    where events.id = predictions.event_id
      and events.locked_at is null
  )
);

create policy "predictions_update_own_while_open"
on public.predictions for update to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.events
    where events.id = predictions.event_id
      and events.locked_at is null
  )
)
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.events
    where events.id = predictions.event_id
      and events.locked_at is null
  )
);

create policy "predictions_delete_own_while_open"
on public.predictions for delete to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.events
    where events.id = predictions.event_id
      and events.locked_at is null
  )
);

revoke all on function public.set_event_locked(text, boolean) from public;
grant execute on function public.set_event_locked(text, boolean) to authenticated;
