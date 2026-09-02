-- GAME04 Common Game Core: player identity only.
-- Do not add GAME03 character, economy, battle, guild, or tutorial data here.

create table if not exists public.players (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.players enable row level security;

create policy "players can read their own profile"
  on public.players for select to authenticated
  using ((select auth.uid()) = id);

create policy "players can update their own profile"
  on public.players for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

grant select, update on table public.players to authenticated;

create or replace function public.initialize_current_player()
returns public.players
language plpgsql
security definer
set search_path = public
as $$
declare
  current_player public.players;
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;

  insert into public.players (id)
  values (auth.uid())
  on conflict (id) do update set updated_at = timezone('utc', now())
  returning * into current_player;

  return current_player;
end;
$$;

revoke all on function public.initialize_current_player() from public;
grant execute on function public.initialize_current_player() to authenticated;
