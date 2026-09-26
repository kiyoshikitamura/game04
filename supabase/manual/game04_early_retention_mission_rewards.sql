-- Candidate only. Integration owner applies after the current growth/runtime RPCs.
-- Regular mission delivery ledger; no retrospective compensation.
begin;
create table if not exists public.game04_mission_free_diamond_grants (
 user_id uuid not null references public.users(id),
 mission_id text not null check (mission_id ~ '^NM0(6[6-9]|7[0-5])$'),
 amount integer not null check (amount=300),
 request_id uuid not null,
 created_at timestamptz not null default statement_timestamp(),
 primary key(user_id,mission_id), unique(user_id,request_id)
);
alter table public.game04_mission_free_diamond_grants enable row level security;
revoke all on public.game04_mission_free_diamond_grants from public,anon,authenticated;
grant select,insert on public.game04_mission_free_diamond_grants to service_role;
create or replace function public.game04_commit_mission_reward(
 p_user_id uuid,p_expected_version bigint,p_state jsonb,p_cash_delta bigint,p_request_id uuid,p_mission_id text
) returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare prior jsonb; old_state jsonb; old_version bigint; result jsonb; gems integer;
 area text; stage_count integer; required_stages jsonb;
begin
 if p_request_id is null or p_mission_id is null then raise exception 'INVALID_MISSION';end if;
 -- Same lock order as all existing GAME04 writers; serializes competing request IDs.
 perform 1 from public.users where id=p_user_id for update;
 if not found then raise exception 'GAME_USER_NOT_FOUND';end if;
 select r.result into prior from public.game04_requests r where r.user_id=p_user_id and r.request_id=p_request_id;
 if found then
  if prior#>>'{receipt,missionId}' is distinct from p_mission_id then raise exception 'REQUEST_ID_REUSED';end if;
  return prior;
 end if;
 select s.state,s.version into old_state,old_version from public.game04_player_state s where s.user_id=p_user_id for update;
 if not found or old_version is distinct from p_expected_version then raise exception 'STATE_CONFLICT' using errcode='40001';end if;
 if coalesce(old_state->'claimedMissionIds','[]') ? p_mission_id then raise exception 'MISSION_ALREADY_CLAIMED';end if;
 if p_state->'claimedMissionIds' is distinct from (coalesce(old_state->'claimedMissionIds','[]'::jsonb)||jsonb_build_array(p_mission_id)) then raise exception 'INVALID_MISSION_CLAIM_STATE';end if;
 gems:=case when p_mission_id ~ '^NM0(6[6-9]|7[0-5])$' then 300 else 0 end;
 if gems>0 then
  select a.id,a.n into area,stage_count from (values
   ('NM066','mikawa',5),('NM067','owari',5),('NM068','mino',5),('NM069','omi',5),('NM070','kai',6),
   ('NM071','echigo',6),('NM072','kyoto',8),('NM073','izumo',8),('NM074','satsuma',10),('NM075','sekigahara',10)
  ) a(mission,id,n) where a.mission=p_mission_id;
  select jsonb_agg(area||'-'||n) into required_stages from generate_series(1,stage_count) n;
  if not (coalesce(old_state->'clearedStages','[]') @> required_stages)
   and not (coalesce(old_state#>'{earlyProgress,completedAreas}','[]') ? area) then raise exception 'MISSION_NOT_COMPLETE';end if;
  insert into public.game04_mission_free_diamond_grants(user_id,mission_id,amount,request_id) values(p_user_id,p_mission_id,gems,p_request_id);
  -- Existing balance/paid-lot expiry triggers remain active. No paid lot is created.
  update public.users set neon_diamonds=neon_diamonds+gems where id=p_user_id;
 end if;
 result:=public.game04_commit_growth_state(p_user_id,p_expected_version,p_state,p_cash_delta,0,p_request_id,
  p_receipt=>jsonb_build_object('missionId',p_mission_id,'freeDiamonds',gems));
 return result;
end $$;
revoke all on function public.game04_commit_mission_reward(uuid,bigint,jsonb,bigint,uuid,text) from public,anon,authenticated;
grant execute on function public.game04_commit_mission_reward(uuid,bigint,jsonb,bigint,uuid,text) to service_role;
notify pgrst,'reload schema';
commit;
