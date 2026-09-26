-- Minimal initial-read contracts required by the isolated G3 browser and Edge GET.
-- No historical guild/user rows, raid mutations, rewards, tutorial supply or GAME03 tables.

create table public.guilds (
 id uuid primary key default extensions.gen_random_uuid(), name text not null,
 leader_id uuid references public.users(id), level integer default 1, xp integer default 0,
 funds bigint default 0, main_alignment text default 'NEUTRAL', sub_alignment text default 'NEUTRAL',
 banner_id text, decoration_id text, created_at timestamptz default now(), description text not null default '',
 logo_icon text not null default 'guild_icon_default.png', color_theme text not null default 'red', cash bigint not null default 0,
 approval_required boolean not null default false, auto_kick_days integer not null default 7,
 unlocked_decorations jsonb not null default '[]', unlocked_banners jsonb not null default '[]',
 equipped_decoration text, equipped_banner text, welcome_message text,
 recruitment_mode text not null default 'OPEN_JOIN', is_disbanded boolean not null default false, disbanded_at timestamptz
);
create table public.guild_members (
 id uuid primary key default extensions.gen_random_uuid(), guild_id uuid references public.guilds(id),
 user_id uuid references public.users(id), role text default 'MEMBER', contribution_points integer default 0,
 joined_at timestamptz default now(), weekly_contribution integer not null default 0,
 total_contribution integer not null default 0, unique(user_id)
);
alter table public.guilds enable row level security;
alter table public.guild_members enable row level security;
create policy guilds_authenticated_read on public.guilds for select to authenticated using(true);
create policy guild_members_owner_read on public.guild_members for select to authenticated using((select auth.uid())=user_id);
revoke all on public.guilds,public.guild_members from public,anon,authenticated;
grant select on public.guilds,public.guild_members to authenticated;
grant all on public.guilds,public.guild_members to service_role;

create table public.game04_territory_progress (
 user_id uuid primary key references public.users(id), experience bigint not null check(experience>=0),
 updated_at timestamptz not null default now()
);
alter table public.game04_territory_progress enable row level security;
revoke all on public.game04_territory_progress from public,anon,authenticated;
grant all on public.game04_territory_progress to service_role;

-- Bootstrap master only. 16 replaces it with the current generated 2026-09-23
-- contract before the Edge function is exercised.
insert into public.game04_redesign_master(key,status,data) values('territory','PREVIEW_PROVISIONAL_20260920',
 '{"version":"PREVIEW_PROVISIONAL_20260920_v1","status":"PREVIEW_PROVISIONAL","initialExp":0,"legacyMigrationExp":0,"levelCap":1,"levels":[{"level":1,"requiredExp":0,"hostingSlots":1}],"destinations":[{"id":"azuchi","name":"安土城への侵攻","castle":"安土城","difficulty":"通常","itemSource":"交換所・報酬","raidMasterId":"unlock_shadow","requiredLevel":1,"itemName":"侵攻令","itemId":"raid_unlock","itemCount":1,"durationMinutes":4320,"clearExp":100}],"battleRules":{"defenseFactor":0.45,"advantageMultiplier":1.5,"disadvantageMultiplier":0.75,"spRecoveryDivisor":120,"burstLukDivisor":20,"enemySpRecoveryDivisor":30,"maxPlayerActions":300,"initialSpRatio":0},"raidMasters":[{"id":"unlock_shadow","name":"常闇の覇将","type":"unlock","enemy":{"id":"raid_shadow","name":"常闇の覇将","image":"/characters/martina_transparent_asset.png","level":1,"element":"dark","stats":{"hp":6500,"sp":110,"atk":160,"def":45,"luk":20},"skills":[],"passives":[],"actionCount":4,"order":0,"boss":true},"energyCost":5,"durationMinutes":4320,"maxParticipants":20,"maxLevel":1,"appearanceLevels":[1],"appearanceImages":{},"enemyGrowthPerLevel":0,"sharedHpGrowthPerLevel":0,"victoryMultiplier":1.5,"sharedHp":200000,"participationRewards":[],"defeatRewards":[]}]}')
on conflict(key) do nothing;

create or replace function public.game04_validate_territory_master(cfg jsonb) returns void
language plpgsql immutable security invoker set search_path=public,pg_temp as $$
declare l jsonb;d jsonb;r jsonb;prev_exp bigint:=-1;prev_level integer:=0;prev_slots integer:=0;cap integer;
begin
 if cfg is null or not cfg ?& array['version','status','levelCap','initialExp','legacyMigrationExp','levels','destinations','raidMasters','battleRules'] or nullif(cfg->>'version','') is null or coalesce(cfg->>'status','') not in('PREVIEW_PROVISIONAL','APPROVED') then raise exception 'TERRITORY_MASTER_INVALID';end if;
 cap:=(cfg->>'levelCap')::integer;
 if cap<1 or (cfg->>'initialExp')::bigint<0 or (cfg->>'legacyMigrationExp')::bigint<0 or jsonb_typeof(cfg->'levels') is distinct from 'array' or jsonb_array_length(cfg->'levels')<>cap then raise exception 'TERRITORY_LEVEL_MASTER_INVALID';end if;
 for l in select value from jsonb_array_elements(cfg->'levels') loop
  if not l ?& array['level','requiredExp','hostingSlots'] or (l->>'level')::integer<>prev_level+1 or (l->>'requiredExp')::bigint<=prev_exp or (l->>'hostingSlots')::integer<1 or (l->>'hostingSlots')::integer<prev_slots then raise exception 'TERRITORY_LEVEL_MASTER_INVALID';end if;
  if prev_level=0 and (l->>'requiredExp')::bigint<>0 then raise exception 'TERRITORY_LEVEL_MASTER_INVALID';end if;
  prev_slots:=(l->>'hostingSlots')::integer;prev_level:=(l->>'level')::integer;prev_exp:=(l->>'requiredExp')::bigint;
 end loop;
 if jsonb_typeof(cfg->'destinations') is distinct from 'array' or jsonb_array_length(cfg->'destinations')<1 or jsonb_typeof(cfg->'raidMasters') is distinct from 'array' then raise exception 'TERRITORY_DESTINATION_MASTER_INVALID';end if;
 if (select count(*)<>count(distinct value->>'id') from jsonb_array_elements(cfg->'destinations')) or (select count(*)<>count(distinct value->>'id') from jsonb_array_elements(cfg->'raidMasters')) then raise exception 'TERRITORY_DUPLICATE_MASTER_ID';end if;
 for d in select value from jsonb_array_elements(cfg->'destinations') loop
  select value into r from jsonb_array_elements(cfg->'raidMasters') where value->>'id'=d->>'raidMasterId';
  if not d ?& array['id','itemId','requiredLevel','itemCount','durationMinutes','clearExp','raidMasterId'] or nullif(d->>'id','') is null or nullif(d->>'itemId','') is null or (d->>'requiredLevel')::integer<1 or (d->>'requiredLevel')::integer>cap or (d->>'itemCount')::integer<1 or (d->>'durationMinutes')::integer<1 or (d->>'clearExp')::bigint<0 then raise exception 'TERRITORY_DESTINATION_MASTER_INVALID';end if;
  if r is null or not r ?& array['id','type','sharedHp','maxLevel','maxParticipants','enemy','appearanceImages','enemyGrowthPerLevel','sharedHpGrowthPerLevel'] or r->>'type'<>'unlock' or (r->>'sharedHp')::bigint<1 or (r->>'maxLevel')::integer<1 or (r->>'maxParticipants')::integer<1 or r->'enemy' is null then raise exception 'TERRITORY_RAID_MASTER_INVALID';end if;
 end loop;
end $$;

create or replace function public.game04_territory_context(p_user_id uuid) returns jsonb
language plpgsql security invoker set search_path=public,pg_temp as $$
declare cfg jsonb;xp bigint;current_level integer;active_count integer;stored jsonb;inventory jsonb;is_unlocked boolean;
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
revoke all on function public.game04_validate_territory_master(jsonb),public.game04_territory_context(uuid) from public,anon,authenticated;
grant execute on function public.game04_validate_territory_master(jsonb),public.game04_territory_context(uuid) to service_role;
