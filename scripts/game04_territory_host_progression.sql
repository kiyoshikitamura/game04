-- GAME04 dev. User-adopted provisional host progression, independent of player EXP.
-- Apply together with game04_raid_formal_master.sql. Existing room snapshots are untouched.
begin;

create or replace function public.game04_capture_territory_unlock() returns trigger
language plpgsql security invoker set search_path=public,pg_temp as $$
begin
 -- A stale application snapshot cannot clear the durable once-only receipt.
 if TG_OP='UPDATE' and old.state ? 'territoryUnlockGrantedVersion' then
  new.state:=jsonb_set(new.state,'{territoryUnlockGrantedVersion}',old.state->'territoryUnlockGrantedVersion');
 elsif coalesce(new.state->'clearedStages','[]'::jsonb) @> '["mino-5"]'::jsonb then
  -- Preserve the whole existing inventory and add exactly one invasion order.
  new.state:=jsonb_set(new.state,'{materials}',coalesce(new.state->'materials','{}'::jsonb)||jsonb_build_object('unlock',coalesce((new.state#>>'{materials,unlock}')::integer,0)+1));
  new.state:=jsonb_set(new.state,'{territoryUnlockGrantedVersion}','"GAME04_TERRITORY_HOST_PROVISIONAL_20260923"'::jsonb);
 end if;
 return new;
end $$;
revoke all on function public.game04_capture_territory_unlock() from public,anon,authenticated;
grant execute on function public.game04_capture_territory_unlock() to service_role;
drop trigger if exists game04_territory_unlock_once on public.game04_player_state;
create trigger game04_territory_unlock_once before insert or update of state on public.game04_player_state
for each row execute function public.game04_capture_territory_unlock();

-- Existing eligible players receive the same one-time unlock, with no EXP/inventory reset.
update public.game04_player_state set state=state,version=version+1,updated_at=now()
where coalesce(state->'clearedStages','[]'::jsonb) @> '["mino-5"]'::jsonb
and not state ? 'territoryUnlockGrantedVersion';

create or replace function public.game04_territory_context(p_user_id uuid) returns jsonb
language plpgsql security invoker set search_path=public,pg_temp as $$
declare cfg jsonb; xp bigint; current_level integer; active_count integer; stored jsonb; inventory jsonb; is_unlocked boolean;
begin
 select data into cfg from public.game04_redesign_master where key='territory';
 perform public.game04_validate_territory_master(cfg);
 insert into public.game04_territory_progress(user_id,experience) values(p_user_id,(cfg->>'initialExp')::bigint) on conflict(user_id) do nothing;
 select experience into xp from public.game04_territory_progress where user_id=p_user_id;
 select (l->>'level')::integer into current_level from jsonb_array_elements(cfg->'levels') l where (l->>'requiredExp')::bigint<=xp order by (l->>'level')::integer desc limit 1;
 select count(*) into active_count from public.game04_raid_rooms where state->>'ownerId'=p_user_id::text and state->>'status'='active' and (state->>'expiresAt')::timestamptz>clock_timestamp() and (state#>>'{territorySnapshot,raidMaster,type}'='unlock' or (not state ? 'territorySnapshot' and state->>'masterId'='unlock_shadow'));
 select state into stored from public.game04_player_state where user_id=p_user_id;
 is_unlocked:=coalesce(stored->'clearedStages','[]'::jsonb) @> jsonb_build_array(coalesce(cfg->>'unlockStageId','mino-5'));
 inventory:=coalesce(stored->'territoryItems','{}'::jsonb)||jsonb_build_object('raid_unlock',coalesce((stored#>>'{materials,unlock}')::integer,0));
 return jsonb_build_object('master',cfg,'progress',jsonb_build_object('experience',xp,'level',current_level,'unlocked',is_unlocked),'activeHostingCount',active_count,'items',inventory);
end $$;
revoke all on function public.game04_territory_context(uuid) from public,anon,authenticated;
grant execute on function public.game04_territory_context(uuid) to service_role;

-- Keep the existing atomic hosting implementation and its lock order.
-- Formal and legacy entry points both enforce the new feature gate for new hosts.
do $host_gate$
declare definition text; signature text;
 needle text := $needle$if d is null then raise exception 'TERRITORY_DESTINATION_NOT_FOUND'; end if;$needle$;
 guard text := $guard$if coalesce((context#>>'{progress,unlocked}')::boolean,false) is not true then raise exception 'TERRITORY_FEATURE_LOCKED'; end if;$guard$;
begin
 foreach signature in array array['public.game04_host_formal_territory(uuid,uuid,text,jsonb)','public.game04_host_territory(uuid,uuid,text)'] loop
  select pg_get_functiondef(signature::regprocedure) into definition;
  if strpos(definition,guard)>0 then continue; end if;
  if strpos(definition,needle)=0 then raise exception 'TERRITORY_HOST_GUARD_CHANGED_REVIEW_REQUIRED'; end if;
  execute replace(definition,needle,needle||E'\n '||guard);
 end loop;
end $host_gate$;
commit;
