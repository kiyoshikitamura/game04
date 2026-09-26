-- GAME04 development only. No bulk EXP/level/material migration and no reward supply values.
-- Existing battle / raid / territory commit remains the transaction authority.
update public.game04_redesign_master set status='APPROVED_GROWTH_V1_20260921',
 data=data||'{"characterDuplicateSouls":20,"skillDuplicateMaterials":{"N":1,"R":2,"SR":5,"SSR":20},"characterAtCap":"convert","skillAtCap":"convert"}'::jsonb,
 updated_at=now() where key='acquisition_conversion';
insert into public.game04_redesign_master(key,status,data) values
 ('quest_player_exp','UNCONFIGURED','{"version":"QUEST_PLAYER_EXP_UNCONFIGURED_20260921","stages":{}}')
 on conflict(key) do nothing;

create or replace function public.game04_growth_cumulative_exp(p_level integer) returns integer
language sql immutable strict security invoker set search_path=public,pg_temp as $$
 select coalesce(sum((l+9)*(l+9)),0)::integer from generate_series(1,least(100,p_level)-1) l
$$;

-- Legacy users retain their actual level and per-level XP. They are not silently rebased.
create or replace function public.game04_get_growth_state(p_user_id uuid,p_initial jsonb default null) returns jsonb
language plpgsql security invoker set search_path=public,pg_temp as $$
declare result jsonb; progress jsonb; u public.users%rowtype;
begin
 result:=public.game04_get_state(p_user_id,p_initial);
 if result is null then return null; end if;
 select * into u from public.users where id=p_user_id;
 progress:=result->'playerProgress';
 if progress->>'version'='APPROVED_GROWTH_V1_20260921' and progress->>'status'='active'
  and (progress->>'level')::integer=u.level
  and (progress->>'exp')::integer-public.game04_growth_cumulative_exp(u.level)=u.xp then
  return result;
 end if;
 if progress is null and u.level=1 and u.xp=0 then
  progress:=jsonb_build_object('version','APPROVED_GROWTH_V1_20260921','status','active','level',1,'exp',0);
 else
  progress:=jsonb_build_object('version',coalesce(progress->>'version','LEGACY_UNMIGRATED'),'status','migration_pending','level',u.level,'exp',u.xp);
 end if;
 return result||jsonb_build_object('playerProgress',progress);
end $$;

-- User lock, original commit, level synchronization, recovery and request receipt are one transaction.
create or replace function public.game04_commit_growth_state(
 p_user_id uuid,p_expected_version bigint,p_state jsonb,p_cash_delta bigint,p_energy_delta integer,p_request_id uuid,
 p_battle jsonb default null,p_raid jsonb default null,p_raid_expected_version bigint default null,p_receipt jsonb default '{}'
) returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare u public.users%rowtype; prior jsonb; before_progress jsonb; next_progress jsonb; v_result jsonb;
 current_exp integer; current_level integer; next_exp integer; next_level integer; expected_exp integer; expected_level integer;
 gain integer; energy_delta integer:=p_energy_delta; energy_limit integer; saved_input jsonb;
begin
 select * into u from public.users where id=p_user_id for update;
 if not found then raise exception 'GAME_USER_NOT_FOUND'; end if;
 select r.result into prior from public.game04_requests r where r.user_id=p_user_id and r.request_id=p_request_id;
 if found then return prior; end if;
 before_progress:=public.game04_get_growth_state(p_user_id)->'playerProgress';
 -- get_state can apply natural recovery; use the actual locked balance for refill, never stack refill deltas.
 select * into u from public.users where id=p_user_id;
 next_progress:=p_state->'playerProgress';
 if next_progress->>'status'='active' then
  if before_progress->>'status' is distinct from 'active' or next_progress->>'version' is distinct from 'APPROVED_GROWTH_V1_20260921' then raise exception 'PLAYER_GROWTH_MIGRATION_REQUIRED'; end if;
  current_exp:=(before_progress->>'exp')::integer; current_level:=(before_progress->>'level')::integer;
  next_exp:=(next_progress->>'exp')::integer; next_level:=(next_progress->>'level')::integer;
  if next_exp is null or next_level is null or next_exp<current_exp or next_level<current_level or next_level>100 then raise exception 'PLAYER_GROWTH_INVALID'; end if;
  if next_exp<>current_exp or next_level<>current_level then
   if p_battle->>'status' is distinct from 'settled' or p_battle#>>'{result,battle,outcome}' is distinct from 'win' then raise exception 'PLAYER_EXP_QUEST_ONLY'; end if;
   select b.input into saved_input from public.game04_battles b where b.id=(p_battle->>'id')::uuid and b.user_id=p_user_id and b.kind='quest' and b.status='started';
   if saved_input is null or saved_input->'playerExpReward' is null then raise exception 'PLAYER_EXP_SNAPSHOT_REQUIRED'; end if;
   gain:=(saved_input#>>'{playerExpReward,amount}')::integer;
   if gain is null or gain<0 then raise exception 'PLAYER_EXP_INVALID'; end if;
   expected_exp:=case when current_level>=100 then current_exp else least(public.game04_growth_cumulative_exp(100),current_exp::bigint+gain)::integer end;
   select max(l) into expected_level from generate_series(current_level,100) l where public.game04_growth_cumulative_exp(l)<=expected_exp;
   if next_exp<>expected_exp or next_level<>expected_level then raise exception 'PLAYER_GROWTH_INVALID'; end if;
   if next_level>current_level then
    select (data->>'energyMax')::integer into energy_limit from public.game04_redesign_master where key='runtime';
    energy_delta:=greatest(0,energy_limit-u.vitality);
    p_battle:=jsonb_set(p_battle,'{result,playerGrowth,energyRecovered}',to_jsonb(energy_delta));
    p_battle:=jsonb_set(p_battle,'{result,playerGrowth,energy}',to_jsonb(u.vitality+energy_delta));
   end if;
  end if;
 end if;
 v_result:=public.game04_commit_state(p_user_id,p_expected_version,p_state,p_cash_delta,energy_delta,p_request_id,p_battle,p_raid,p_raid_expected_version);
 if next_progress->>'status'='active' then
  update public.users set level=next_level,xp=next_exp-public.game04_growth_cumulative_exp(next_level) where id=p_user_id;
 end if;
 v_result:=v_result||jsonb_build_object('state',public.game04_get_growth_state(p_user_id),'receipt',coalesce(p_receipt,'{}'::jsonb));
 if p_battle->>'status'='settled' then v_result:=v_result||jsonb_build_object('battleResult',p_battle->'result'); end if;
 update public.game04_requests set result=v_result where user_id=p_user_id and request_id=p_request_id;
 return v_result;
end $$;
revoke all on function public.game04_growth_cumulative_exp(integer) from public,anon,authenticated;
revoke all on function public.game04_get_growth_state(uuid,jsonb) from public,anon,authenticated;
revoke all on function public.game04_commit_growth_state(uuid,bigint,jsonb,bigint,integer,uuid,jsonb,jsonb,bigint,jsonb) from public,anon,authenticated;
grant execute on function public.game04_growth_cumulative_exp(integer) to service_role;
grant execute on function public.game04_get_growth_state(uuid,jsonb) to service_role;
grant execute on function public.game04_commit_growth_state(uuid,bigint,jsonb,bigint,integer,uuid,jsonb,jsonb,bigint,jsonb) to service_role;
