-- GAME04 Common Game Core: server-authoritative player profile mutation.
-- Reference pattern: TRIBE NEON accepted commit
-- 826f8b770f36a6f6844d920b0adcd2853188b91d.
-- No GAME03 onboarding, starter grant, product value, or presentation is included.

drop policy if exists "players can update their own profile" on public.players;
revoke update on table public.players from authenticated;

create or replace function public.initialize_current_player()
returns public.players
language plpgsql
security definer
set search_path = public
as $$
declare
  v_player_id uuid := auth.uid();
  v_player public.players;
begin
  if v_player_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('player-init:' || v_player_id::text, 0));

  insert into public.players (id)
  values (v_player_id)
  on conflict (id) do nothing;

  select * into strict v_player
  from public.players
  where id = v_player_id;

  return v_player;
end;
$$;

create or replace function public.update_current_player_profile(p_display_name text)
returns public.players
language plpgsql
security definer
set search_path = public
as $$
declare
  v_player_id uuid := auth.uid();
  v_display_name text := nullif(btrim(p_display_name), '');
  v_player public.players;
begin
  if v_player_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  if v_display_name is not null and char_length(v_display_name) > 32 then
    raise exception 'display name must contain at most 32 characters' using errcode = '22023';
  end if;

  update public.players
  set display_name = v_display_name,
      updated_at = timezone('utc', now())
  where id = v_player_id
  returning * into v_player;

  if v_player.id is null then
    raise exception 'player profile is required' using errcode = 'P0002';
  end if;

  return v_player;
end;
$$;

revoke all on function public.initialize_current_player() from public, anon;
revoke all on function public.update_current_player_profile(text) from public, anon;
grant execute on function public.initialize_current_player() to authenticated;
grant execute on function public.update_current_player_profile(text) to authenticated;
