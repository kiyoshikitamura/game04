-- GAME04 dev only. Append-only runtime, preserving every legacy asset/table.
-- Numerical parameters are preview provisional; no Production release/economy FIX.
create table if not exists public.game04_player_state (
 user_id uuid primary key references public.users(id), version bigint not null default 0,
 state jsonb not null, updated_at timestamptz not null default now()
);
create table if not exists public.game04_raid_rooms (
 id uuid primary key, version bigint not null default 0, state jsonb not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.game04_social_events (
 id uuid primary key default gen_random_uuid(),room_id uuid not null references public.game04_raid_rooms(id),author_id uuid not null references public.users(id),kind text not null,body jsonb not null,created_at timestamptz not null default now()
);
create index if not exists game04_social_events_created on public.game04_social_events(created_at desc);
alter table public.game04_social_events enable row level security;
revoke all on public.game04_social_events from anon,authenticated;
grant all on public.game04_social_events to service_role;
create table if not exists public.game04_battles (
 id uuid primary key, user_id uuid not null references public.users(id), kind text not null,
 target_id text not null, seed bigint not null, input jsonb not null, result jsonb,
 status text not null check(status in ('started','settled')),
 created_at timestamptz not null default now(), settled_at timestamptz
);
create index if not exists game04_battles_user_created on public.game04_battles(user_id,created_at desc);
create table if not exists public.game04_requests (
 user_id uuid not null references public.users(id), request_id uuid not null,
 result jsonb not null, created_at timestamptz not null default now(), primary key(user_id,request_id)
);
create table if not exists public.game04_vip_entitlements (
 user_id uuid primary key references public.users(id), expires_at timestamptz not null
);
create table if not exists public.game04_vip_grants (
 order_id text primary key, user_id uuid not null references public.users(id), days integer not null check(days=30), created_at timestamptz not null default now()
);
create table if not exists public.game04_redesign_master (
 key text primary key, status text not null default 'PREVIEW_PROVISIONAL', data jsonb not null, updated_at timestamptz not null default now()
);
insert into public.game04_redesign_master(key,data) values ('runtime', '{"energyMax":50,"energyRecoverySeconds":180,"vipDays":30,"commercialEnabled":false}'::jsonb) on conflict(key) do nothing;

alter table public.game04_player_state enable row level security;
alter table public.game04_raid_rooms enable row level security;
alter table public.game04_battles enable row level security;
alter table public.game04_requests enable row level security;
alter table public.game04_vip_entitlements enable row level security;
alter table public.game04_vip_grants enable row level security;
alter table public.game04_redesign_master enable row level security;
revoke all on public.game04_player_state,public.game04_raid_rooms,public.game04_battles,public.game04_requests,public.game04_vip_entitlements,public.game04_vip_grants,public.game04_redesign_master from anon,authenticated;
grant all on public.game04_player_state,public.game04_raid_rooms,public.game04_battles,public.game04_requests,public.game04_vip_entitlements,public.game04_vip_grants,public.game04_redesign_master to service_role;

-- SECURITY INVOKER: only the Edge service role can call these RPCs. No browser result authority.
create or replace function public.game04_get_state(p_user_id uuid,p_initial jsonb default null)
returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare u public.users%rowtype; s public.game04_player_state%rowtype; cfg jsonb; recovered integer; recovery_seconds integer; energy_max integer; vip timestamptz;
begin
 select * into u from public.users where id=p_user_id for update;
 if not found then raise exception 'GAME_USER_NOT_FOUND'; end if;
 select data into cfg from public.game04_redesign_master where key='runtime';
 energy_max := (cfg->>'energyMax')::integer; recovery_seconds := (cfg->>'energyRecoverySeconds')::integer;
 recovered := greatest(0,floor(extract(epoch from (now()-coalesce(u.vitality_last_recovered_at,now())))/recovery_seconds)::integer);
 if u.vitality < energy_max and recovered>0 then
  update public.users set vitality=least(energy_max,vitality+recovered),vitality_last_recovered_at=case when vitality+recovered>=energy_max then now() else coalesce(vitality_last_recovered_at,now())+make_interval(secs=>recovered*recovery_seconds) end where id=p_user_id returning * into u;
 elsif u.vitality>=energy_max then
  update public.users set vitality_last_recovered_at=now() where id=p_user_id returning * into u;
 end if;
 if p_initial is not null then insert into public.game04_player_state(user_id,state) values(p_user_id,p_initial) on conflict(user_id) do nothing; end if;
 select * into s from public.game04_player_state where user_id=p_user_id;
 if not found then return null; end if;
 select expires_at into vip from public.game04_vip_entitlements where user_id=p_user_id;
 return s.state || jsonb_build_object('userId',p_user_id,'version',s.version,'cash',u.cash,'diamonds',u.diamonds,'energy',u.vitality,'energyMax',energy_max,'vipExpiresAt',vip);
end $$;

create or replace function public.game04_commit_state(
 p_user_id uuid,p_expected_version bigint,p_state jsonb,p_cash_delta bigint,p_energy_delta integer,p_request_id uuid,
 p_battle jsonb default null,p_raid jsonb default null,p_raid_expected_version bigint default null
) returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare s public.game04_player_state%rowtype; u public.users%rowtype; prior jsonb; battle_row public.game04_battles%rowtype; room public.game04_raid_rooms%rowtype; out_state jsonb; room_out jsonb; battle_id uuid;
begin
 select * into u from public.users where id=p_user_id for update;
 if not found then raise exception 'GAME_USER_NOT_FOUND'; end if;
 select result into prior from public.game04_requests where user_id=p_user_id and request_id=p_request_id;
 if found then return prior; end if;
 select * into s from public.game04_player_state where user_id=p_user_id for update;
 if not found then raise exception 'STATE_NOT_INITIALIZED'; end if;
 if s.version<>p_expected_version then raise exception 'STATE_CONFLICT' using errcode='40001'; end if;
 if u.cash+p_cash_delta<0 or u.vitality+p_energy_delta<0 then raise exception 'INSUFFICIENT_RESOURCE'; end if;
 if p_battle is not null then
  battle_id := (p_battle->>'id')::uuid;
  select * into battle_row from public.game04_battles where id=battle_id for update;
  if p_battle->>'status'='started' then
   if found then raise exception 'BATTLE_ALREADY_STARTED'; end if;
   insert into public.game04_battles(id,user_id,kind,target_id,seed,input,status) values(battle_id,p_user_id,p_battle->>'kind',p_battle->>'targetId',(p_battle->>'seed')::bigint,p_battle->'input','started');
  elsif p_battle->>'status'='settled' then
   if not found or battle_row.user_id<>p_user_id then raise exception 'BATTLE_NOT_FOUND'; end if;
   if battle_row.status='settled' then raise exception 'BATTLE_ALREADY_SETTLED'; end if;
   update public.game04_battles set status='settled',result=p_battle->'result',settled_at=now() where id=battle_id;
  else raise exception 'INVALID_BATTLE_STATUS'; end if;
 end if;
 if p_raid is not null then
  select * into room from public.game04_raid_rooms where id=(p_raid->>'id')::uuid for update;
  if found then
   if p_raid_expected_version is null or room.version<>p_raid_expected_version then raise exception 'RAID_CONFLICT' using errcode='40001'; end if;
   update public.game04_raid_rooms set state=p_raid,version=version+1,updated_at=now() where id=room.id returning state||jsonb_build_object('version',version) into room_out;
   if coalesce((p_raid->>'rescueCount')::integer,0)>coalesce((room.state->>'rescueCount')::integer,0)
      or (p_raid->>'rescueWindowStartedAt' is distinct from room.state->>'rescueWindowStartedAt' and coalesce((p_raid->>'rescueCount')::integer,0)>0) then
    insert into public.game04_social_events(room_id,author_id,kind,body) values(room.id,p_user_id,'raid_rescue',jsonb_build_object('roomId',room.id,'masterId',p_raid->>'masterId','level',p_raid->'level','channels',jsonb_build_array('global','activity')));
   end if;
  else
   if coalesce(p_raid_expected_version,-1)<>-1 then raise exception 'RAID_CONFLICT' using errcode='40001'; end if;
   insert into public.game04_raid_rooms(id,state) values((p_raid->>'id')::uuid,p_raid) returning state||jsonb_build_object('version',version) into room_out;
  end if;
 end if;
 update public.users set cash=cash+p_cash_delta,vitality=vitality+p_energy_delta,updated_at=now() where id=p_user_id;
 update public.game04_player_state set version=version+1,state=p_state-'vipExpiresAt'-'cash'-'diamonds'-'energy'-'version',updated_at=now() where user_id=p_user_id;
 out_state:=jsonb_build_object('state',public.game04_get_state(p_user_id),'room',room_out);
 insert into public.game04_requests(user_id,request_id,result) values(p_user_id,p_request_id,out_state);
 return out_state;
end $$;

create or replace function public.game04_grant_vip(p_user_id uuid,p_order_id text)
returns timestamptz language plpgsql security invoker set search_path=public,pg_temp as $$
declare v_days integer; expiry timestamptz;
begin
 perform 1 from public.users where id=p_user_id for update;
 if not found then raise exception 'GAME_USER_NOT_FOUND'; end if;
 if exists(select 1 from public.game04_vip_grants where order_id=p_order_id and user_id<>p_user_id) then raise exception 'ORDER_USER_MISMATCH'; end if;
 if exists(select 1 from public.game04_vip_grants where order_id=p_order_id) then select expires_at into expiry from public.game04_vip_entitlements where user_id=p_user_id; return expiry; end if;
 select (data->>'vipDays')::integer into v_days from public.game04_redesign_master where key='runtime';
 insert into public.game04_vip_grants(order_id,user_id,days) values(p_order_id,p_user_id,v_days);
 insert into public.game04_vip_entitlements(user_id,expires_at) values(p_user_id,now()+make_interval(days=>v_days)) on conflict(user_id) do update set expires_at=greatest(now(),game04_vip_entitlements.expires_at)+make_interval(days=>v_days) returning expires_at into expiry;
 return expiry;
end $$;
revoke all on function public.game04_get_state(uuid,jsonb) from public,anon,authenticated;
revoke all on function public.game04_commit_state(uuid,bigint,jsonb,bigint,integer,uuid,jsonb,jsonb,bigint) from public,anon,authenticated;
revoke all on function public.game04_grant_vip(uuid,text) from public,anon,authenticated;
grant execute on function public.game04_get_state(uuid,jsonb) to service_role;
grant execute on function public.game04_commit_state(uuid,bigint,jsonb,bigint,integer,uuid,jsonb,jsonb,bigint) to service_role;
grant execute on function public.game04_grant_vip(uuid,text) to service_role;
