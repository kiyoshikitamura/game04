-- Exact live read-master validator. This replaces the bootstrap validator after
-- the standalone current territory master has been installed.
create or replace function public.game04_validate_territory_master(cfg jsonb) returns void
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
revoke all on function public.game04_validate_territory_master(jsonb) from public,anon,authenticated;
grant execute on function public.game04_validate_territory_master(jsonb) to service_role;
