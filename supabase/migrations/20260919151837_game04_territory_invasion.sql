-- GAME04 dev territory hosting. Formal economic values remain provisional.
insert into public.game04_redesign_master(key,status,data) values('territory','PREVIEW_PROVISIONAL_20260920', $territory${"version":"PREVIEW_PROVISIONAL_20260920_v1","status":"PREVIEW_PROVISIONAL","initialExp":0,"legacyMigrationExp":0,"levelCap":3,"levels":[{"level":1,"requiredExp":0,"hostingSlots":1},{"level":2,"requiredExp":100,"hostingSlots":2},{"level":3,"requiredExp":300,"hostingSlots":3}],"destinations":[{"id":"azuchi","name":"安土城への侵攻","castle":"安土城","difficulty":"通常","itemSource":"クエストのレア報酬","raidMasterId":"unlock_shadow","requiredLevel":1,"itemName":"レイド解禁札","itemId":"raid_unlock","itemCount":1,"durationMinutes":4320,"clearExp":100},{"id":"gifu","name":"岐阜城への侵攻","castle":"岐阜城","difficulty":"上位","itemSource":"クエストのレア報酬","raidMasterId":"unlock_shadow","requiredLevel":2,"itemName":"レイド解禁札","itemId":"raid_unlock","itemCount":1,"durationMinutes":4320,"clearExp":100}],"battleRules":{"defenseFactor":0.45,"advantageMultiplier":1.5,"disadvantageMultiplier":0.75,"spRecoveryDivisor":120,"burstLukDivisor":20,"enemySpRecoveryDivisor":30,"maxPlayerActions":300,"initialSpRatio":0},"raidMasters":[{"id":"unlock_shadow","name":"常闇の覇将","type":"unlock","enemy":{"id":"raid_shadow","name":"常闇の覇将","image":"/characters/martina_transparent_asset.png","level":1,"element":"dark","stats":{"hp":6500,"sp":110,"atk":160,"def":45,"luk":20},"skills":[{"id":"SKILL_001","name":"一文字斬り","image":"/skills/skill_001_street_punch.jpg","rarity":"N","element":"fire","spCost":24,"condition":{"type":"always"},"target":"lowest_hp","effects":[{"type":"damage","power":180}],"description":"敵単体へ属性攻撃"}],"passives":[],"actionCount":4,"order":0,"boss":true,"phases":[{"hpBelow":0.4,"name":"烈火の陣","actionCount":3}]},"energyCost":5,"durationMinutes":4320,"maxParticipants":20,"maxLevel":20,"appearanceLevels":[1,10,20],"appearanceImages":{"10":"/characters/miyabi_transparent_asset.png","20":"/characters/ren_transparent_asset.png"},"enemyGrowthPerLevel":0.15,"sharedHpGrowthPerLevel":0.2,"victoryMultiplier":1.5,"sharedHp":200000,"participationRewards":[{"kind":"skill_material","amount":2}],"defeatRewards":[{"kind":"skill_material","amount":15},{"kind":"equipment_material","amount":5}]}]}$territory$::jsonb) on conflict(key) do nothing;

create table public.game04_territory_progress (
 user_id uuid primary key references public.users(id), experience bigint not null check(experience>=0), updated_at timestamptz not null default now()
);
create table public.game04_territory_clear_receipts (
 room_id uuid primary key references public.game04_raid_rooms(id),
 user_id uuid not null references public.game04_territory_progress(user_id),
 eligible boolean not null, experience bigint not null check(experience>=0), owner_wins integer not null,
 master_version text not null, created_at timestamptz not null default now()
);
alter table public.game04_territory_progress enable row level security;
alter table public.game04_territory_clear_receipts enable row level security;
revoke all on public.game04_territory_progress,public.game04_territory_clear_receipts from public,anon,authenticated;
grant all on public.game04_territory_progress,public.game04_territory_clear_receipts to service_role;
insert into public.game04_territory_progress(user_id,experience)
select u.id,(m.data->>'legacyMigrationExp')::bigint from public.users u cross join public.game04_redesign_master m where m.key='territory';

create function public.game04_validate_territory_master(cfg jsonb) returns void
language plpgsql immutable security invoker set search_path=public,pg_temp as $$
declare l jsonb; d jsonb; r jsonb; prev_exp bigint:=-1; prev_level integer:=0; prev_slots integer:=0; cap integer;
begin
 if cfg is null or not cfg ?& array['version','status','levelCap','initialExp','legacyMigrationExp','levels','destinations','raidMasters','battleRules'] or nullif(cfg->>'version','') is null or coalesce(cfg->>'status','') not in ('PREVIEW_PROVISIONAL','APPROVED') then raise exception 'TERRITORY_MASTER_INVALID'; end if;
 if exists(select 1 from unnest(array['levelCap','initialExp','legacyMigrationExp']) k where jsonb_typeof(cfg->k) is distinct from 'number') then raise exception 'TERRITORY_LEVEL_MASTER_INVALID'; end if;
 if jsonb_typeof(cfg->'battleRules') is distinct from 'object' or exists(select 1 from unnest(array['defenseFactor','advantageMultiplier','disadvantageMultiplier','spRecoveryDivisor','burstLukDivisor','enemySpRecoveryDivisor','maxPlayerActions','initialSpRatio']) k where jsonb_typeof(cfg->'battleRules'->k) is distinct from 'number') then raise exception 'TERRITORY_BATTLE_RULES_INVALID'; end if;
 cap:=(cfg->>'levelCap')::integer;
 if cap<1 or (cfg->>'initialExp')::bigint<0 or (cfg->>'legacyMigrationExp')::bigint<0 or jsonb_typeof(cfg->'levels') is distinct from 'array' or jsonb_array_length(cfg->'levels')<>cap then raise exception 'TERRITORY_LEVEL_MASTER_INVALID'; end if;
 for l in select value from jsonb_array_elements(cfg->'levels') loop
  if exists(select 1 from unnest(array['level','requiredExp','hostingSlots']) k where jsonb_typeof(l->k) is distinct from 'number') then raise exception 'TERRITORY_LEVEL_MASTER_INVALID'; end if;
  if not l ?& array['level','requiredExp','hostingSlots'] or (l->>'level')::integer<>prev_level+1 or (l->>'requiredExp')::bigint<=prev_exp or (l->>'hostingSlots')::integer<1 or (l->>'hostingSlots')::integer<prev_slots then raise exception 'TERRITORY_LEVEL_MASTER_INVALID'; end if;
  if prev_level=0 and (l->>'requiredExp')::bigint<>0 then raise exception 'TERRITORY_LEVEL_MASTER_INVALID'; end if;
  prev_slots:=(l->>'hostingSlots')::integer;prev_level:=(l->>'level')::integer;prev_exp:=(l->>'requiredExp')::bigint;
 end loop;
 if jsonb_typeof(cfg->'destinations') is distinct from 'array' or jsonb_array_length(cfg->'destinations')<1 or jsonb_typeof(cfg->'raidMasters') is distinct from 'array' then raise exception 'TERRITORY_DESTINATION_MASTER_INVALID'; end if;
 if (select count(*)<>count(distinct value->>'id') from jsonb_array_elements(cfg->'destinations')) or (select count(*)<>count(distinct value->>'id') from jsonb_array_elements(cfg->'raidMasters')) then raise exception 'TERRITORY_DUPLICATE_MASTER_ID'; end if;
 for d in select value from jsonb_array_elements(cfg->'destinations') loop
  if exists(select 1 from unnest(array['requiredLevel','itemCount','durationMinutes','clearExp']) k where jsonb_typeof(d->k) is distinct from 'number') or exists(select 1 from unnest(array['id','itemId','raidMasterId']) k where jsonb_typeof(d->k) is distinct from 'string') then raise exception 'TERRITORY_DESTINATION_MASTER_INVALID'; end if;
  if not d ?& array['id','itemId','requiredLevel','itemCount','durationMinutes','clearExp','raidMasterId'] or nullif(d->>'id','') is null or nullif(d->>'itemId','') is null or (d->>'requiredLevel')::integer<1 or (d->>'requiredLevel')::integer>cap or (d->>'itemCount')::integer<1 or (d->>'durationMinutes')::integer<1 or (d->>'clearExp')::bigint<0 then raise exception 'TERRITORY_DESTINATION_MASTER_INVALID'; end if;
  select value into r from jsonb_array_elements(cfg->'raidMasters') where value->>'id'=d->>'raidMasterId';
  if exists(select 1 from unnest(array['sharedHp','maxLevel','maxParticipants','enemyGrowthPerLevel','sharedHpGrowthPerLevel']) k where jsonb_typeof(r->k) is distinct from 'number') then raise exception 'TERRITORY_RAID_MASTER_INVALID'; end if;
  if r is null or not r ?& array['id','type','sharedHp','maxLevel','maxParticipants','enemy','appearanceImages','enemyGrowthPerLevel','sharedHpGrowthPerLevel'] or r->>'type'<>'unlock' or (r->>'sharedHp')::bigint<1 or (r->>'maxLevel')::integer<1 or (r->>'maxParticipants')::integer<1 or r->'enemy' is null then raise exception 'TERRITORY_RAID_MASTER_INVALID'; end if;
 end loop;
end $$;
select public.game04_validate_territory_master(data) from public.game04_redesign_master where key='territory';

-- Snapshot every legacy unlock room before installing the clear trigger. No historical XP replay.
with migration_master as (
 select distinct on (boss.value->>'id') m.data,d.value destination,boss.value raid_master
 from public.game04_redesign_master m cross join lateral jsonb_array_elements(m.data->'destinations') with ordinality d(value,ord)
 cross join lateral jsonb_array_elements(m.data->'raidMasters') boss
 where m.key='territory' and boss.value->>'id'=d.value->>'raidMasterId'
 order by boss.value->>'id',d.ord
)
update public.game04_raid_rooms r set state=r.state||jsonb_build_object('territorySnapshot',jsonb_build_object(
 'masterVersion',m.data->>'version','status',m.data->>'status','destination',m.destination,'raidMaster',m.raid_master,'battleRules',m.data->'battleRules')),version=r.version+1,updated_at=now()
from migration_master m
where r.state->>'masterId'=m.raid_master->>'id' and not r.state ? 'territorySnapshot';

create function public.game04_territory_context(p_user_id uuid) returns jsonb
language plpgsql security invoker set search_path=public,pg_temp as $$
declare cfg jsonb; xp bigint; current_level integer; active_count integer; stored jsonb; inventory jsonb;
begin
 select data into cfg from public.game04_redesign_master where key='territory';
 perform public.game04_validate_territory_master(cfg);
 insert into public.game04_territory_progress(user_id,experience) values(p_user_id,(cfg->>'initialExp')::bigint) on conflict(user_id) do nothing;
 select experience into xp from public.game04_territory_progress where user_id=p_user_id;
 select (l->>'level')::integer into current_level from jsonb_array_elements(cfg->'levels') l where (l->>'requiredExp')::bigint<=xp order by (l->>'level')::integer desc limit 1;
 select count(*) into active_count from public.game04_raid_rooms where state->>'ownerId'=p_user_id::text and state->>'status'='active' and (state->>'expiresAt')::timestamptz>clock_timestamp() and (state#>>'{territorySnapshot,raidMaster,type}'='unlock' or (not state ? 'territorySnapshot' and state->>'masterId'='unlock_shadow'));
 select state into stored from public.game04_player_state where user_id=p_user_id;
 inventory:=coalesce(stored->'territoryItems','{}'::jsonb)||jsonb_build_object('raid_unlock',coalesce((stored#>>'{materials,unlock}')::integer,0));
 return jsonb_build_object('master',cfg,'progress',jsonb_build_object('experience',xp,'level',current_level),'activeHostingCount',active_count,'items',inventory);
end $$;

create function public.game04_host_territory(p_user_id uuid,p_request_id uuid,p_destination_id text) returns jsonb
language plpgsql security invoker set search_path=public,pg_temp as $$
declare cfg jsonb; d jsonb; boss jsonb; s public.game04_player_state%rowtype; prior jsonb; context jsonb; slots integer; available integer; rid uuid:=gen_random_uuid(); room jsonb; result jsonb; user_name text;
begin
 if p_request_id is null then raise exception 'REQUEST_ID_REQUIRED'; end if;
 -- Same user mutex and state lock order as game04_commit_state.
 select username into user_name from public.users where id=p_user_id for update;
 if not found then raise exception 'GAME_USER_NOT_FOUND'; end if;
 select q.result into prior from public.game04_requests q where q.user_id=p_user_id and q.request_id=p_request_id;
 if found then
  if prior->>'operation' is distinct from 'host_territory' or prior->>'destinationId' is distinct from p_destination_id then raise exception 'REQUEST_ID_REUSED'; end if;
  return prior;
 end if;
 select * into s from public.game04_player_state where user_id=p_user_id for update;
 if not found then raise exception 'STATE_NOT_INITIALIZED'; end if;
 context:=public.game04_territory_context(p_user_id);cfg:=context->'master';
 -- Hosting never locks existing rooms; clear-trigger order room -> progress cannot cycle.
 perform 1 from public.game04_territory_progress where user_id=p_user_id for update;
 context:=public.game04_territory_context(p_user_id);cfg:=context->'master';
 select value into d from jsonb_array_elements(cfg->'destinations') where value->>'id'=p_destination_id;
 if d is null then raise exception 'TERRITORY_DESTINATION_NOT_FOUND'; end if;
 if (context#>>'{progress,level}')::integer<(d->>'requiredLevel')::integer then raise exception 'TERRITORY_LEVEL_REQUIRED'; end if;
 select (value->>'hostingSlots')::integer into slots from jsonb_array_elements(cfg->'levels') where (value->>'level')::integer=(context#>>'{progress,level}')::integer;
 if (context->>'activeHostingCount')::integer>=slots then raise exception 'TERRITORY_HOSTING_SLOTS_FULL'; end if;
 available:=coalesce((context->'items'->>(d->>'itemId'))::integer,0);
 if available<(d->>'itemCount')::integer then raise exception 'TERRITORY_ITEM_REQUIRED'; end if;
 select value||jsonb_build_object('durationMinutes',d->'durationMinutes') into boss from jsonb_array_elements(cfg->'raidMasters') where value->>'id'=d->>'raidMasterId';
 if d->>'itemId'='raid_unlock' then s.state:=jsonb_set(s.state,'{materials,unlock}',to_jsonb(available-(d->>'itemCount')::integer));
 else s.state:=jsonb_set(s.state,'{territoryItems}',coalesce(s.state->'territoryItems','{}'::jsonb)||jsonb_build_object(d->>'itemId',available-(d->>'itemCount')::integer)); end if;
 room:=jsonb_build_object('id',rid,'masterId',boss->>'id','ownerId',p_user_id,'level',1,'hp',boss->'sharedHp','maxHp',boss->'sharedHp',
 'createdAt',clock_timestamp(),'expiresAt',clock_timestamp()+make_interval(mins=>(d->>'durationMinutes')::integer),'status','active','rescueCount',0,'rescueWindowStartedAt',clock_timestamp(),
 'participants',jsonb_build_array(jsonb_build_object('userId',p_user_id,'name',coalesce(user_name,'主催者'),'wins',0,'attempts',0,'totalDamage',0,'joinedLevel',1)),
 'settledBattleIds','[]'::jsonb,'rewardGrants','[]'::jsonb,
 'territorySnapshot',jsonb_build_object('masterVersion',cfg->>'version','status',cfg->>'status','destination',d,'raidMaster',boss,'battleRules',cfg->'battleRules'));
 insert into public.game04_raid_rooms(id,state) values(rid,room);
 update public.game04_player_state set state=s.state,version=version+1,updated_at=now() where user_id=p_user_id;
 result:=jsonb_build_object('operation','host_territory','destinationId',p_destination_id,'state',public.game04_get_state(p_user_id),'room',room||jsonb_build_object('version',0),'territory',public.game04_territory_context(p_user_id));
 insert into public.game04_requests(user_id,request_id,result) values(p_user_id,p_request_id,result);
 return result;
end $$;

create function public.game04_capture_territory_clear() returns trigger
language plpgsql security invoker set search_path=public,pg_temp as $$
declare snap jsonb; owner uuid; wins integer; amount bigint; inserted integer;
begin
 if old.state->>'status'<>'active' or new.state->>'status'<>'defeated' then return new; end if;
 snap:=old.state->'territorySnapshot';
 if snap#>>'{raidMaster,type}' is distinct from 'unlock' then return new; end if;
 if (new.state->>'level')::integer<>(snap#>>'{raidMaster,maxLevel}')::integer or (new.state->>'hp')::bigint<>0 or (old.state->>'expiresAt')::timestamptz<=clock_timestamp() then return new; end if;
 owner:=(old.state->>'ownerId')::uuid;
 -- Result already includes the triggering battle win. Later settled battles cannot change this receipt.
 select coalesce((p->>'wins')::integer,0) into wins from jsonb_array_elements(new.state->'participants') p where p->>'userId'=owner::text;
 wins:=coalesce(wins,0); amount:=case when wins>=3 then (snap#>>'{destination,clearExp}')::bigint else 0 end;
 insert into public.game04_territory_clear_receipts(room_id,user_id,eligible,experience,owner_wins,master_version) values(new.id,owner,wins>=3,amount,wins,snap->>'masterVersion') on conflict(room_id) do nothing;
 get diagnostics inserted=row_count;
 if inserted=1 and amount>0 then
  -- Only the independent progress row is touched: never owner users/state locks from another player's settlement.
  update public.game04_territory_progress set experience=experience+amount,updated_at=now() where user_id=owner;
  if not found then raise exception 'TERRITORY_OWNER_PROGRESS_MISSING'; end if;
 end if;
 return new;
end $$;
create trigger game04_territory_clear after update on public.game04_raid_rooms for each row execute function public.game04_capture_territory_clear();

create function public.game04_raid_rooms_for_user(p_user_id uuid) returns jsonb
language sql stable security invoker set search_path=public,pg_temp as $$
 select coalesce(jsonb_agg(jsonb_build_object('state',state,'version',version) order by created_at desc,id),'[]'::jsonb)
 from public.game04_raid_rooms r
 where (state->>'status'='active' and (state->>'expiresAt')::timestamptz>now())
 or state->>'ownerId'=p_user_id::text
 or exists(select 1 from jsonb_array_elements(state->'participants') p where p->>'userId'=p_user_id::text)
$$;
revoke all on function public.game04_validate_territory_master(jsonb),public.game04_territory_context(uuid),public.game04_host_territory(uuid,uuid,text),public.game04_capture_territory_clear(),public.game04_raid_rooms_for_user(uuid) from public,anon,authenticated;
grant execute on function public.game04_validate_territory_master(jsonb),public.game04_territory_context(uuid),public.game04_host_territory(uuid,uuid,text),public.game04_capture_territory_clear(),public.game04_raid_rooms_for_user(uuid) to service_role;

-- A running room keeps the exact same master snapshot until the room is archived.
create function public.game04_preserve_territory_snapshot() returns trigger
language plpgsql security invoker set search_path=public,pg_temp as $$
begin
 if old.state ? 'territorySnapshot' and (old.state->'territorySnapshot' is distinct from new.state->'territorySnapshot' or old.state->>'ownerId' is distinct from new.state->>'ownerId') then raise exception 'TERRITORY_SNAPSHOT_IMMUTABLE'; end if;
 return new;
end $$;
create trigger game04_territory_snapshot_guard before update on public.game04_raid_rooms for each row execute function public.game04_preserve_territory_snapshot();
revoke all on function public.game04_preserve_territory_snapshot() from public,anon,authenticated;
grant execute on function public.game04_preserve_territory_snapshot() to service_role;
