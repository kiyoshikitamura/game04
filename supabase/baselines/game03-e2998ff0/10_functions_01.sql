SET check_function_bodies = false;
SET search_path = public, extensions, pg_catalog;
CREATE OR REPLACE FUNCTION public.calculate_user_total_power(p_user_id uuid)
 RETURNS bigint
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select coalesce(sum(public.calculate_user_character_power(formation.user_id, formation.user_character_id)),0)::bigint
  from public.user_main_formations formation
  where formation.user_id = p_user_id
$function$
;
CREATE OR REPLACE FUNCTION public.cancel_guild_join_request(p_request_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication is required'; END IF;
  UPDATE public.guild_join_requests
  SET status = 'CANCELLED', reviewed_at = now(), reviewed_by = auth.uid()
  WHERE id = p_request_id AND user_id = auth.uid() AND status = 'PENDING';
  IF NOT FOUND THEN RAISE EXCEPTION 'Pending guild application not found'; END IF;
  RETURN jsonb_build_object('status', 'cancelled');
END;
$function$
;
CREATE OR REPLACE FUNCTION public.cancel_unresolved_gvg_attack(p_attack_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_replay_id UUID;
BEGIN
  SELECT battle_replay_session_id
  INTO v_replay_id
  FROM public.gvg_attack_logs
  WHERE id = p_attack_id
    AND attacker_user_id = auth.uid()
    AND battle_result = 'PENDING'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Only an unresolved own GvG attack can be cancelled';
  END IF;

  IF v_replay_id IS NOT NULL THEN
    PERFORM 1
    FROM public.battle_replay_sessions
    WHERE id = v_replay_id
      AND requester_user_id = auth.uid()
      AND battle_mode = 'GVG'
      AND source_reference_id = p_attack_id
      AND status = 'PENDING'
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Only a pending GvG replay can be cancelled';
    END IF;

    DELETE FROM public.battle_replay_sessions WHERE id = v_replay_id;
  ELSE
    -- create_battle_replay_pending links by source_reference_id first; the
    -- attack log receives its direct replay ID only during final resolution.
    DELETE FROM public.battle_replay_sessions
    WHERE requester_user_id = auth.uid()
      AND battle_mode = 'GVG'
      AND source_reference_id = p_attack_id
      AND status = 'PENDING';
  END IF;

  DELETE FROM public.gvg_attack_logs WHERE id = p_attack_id;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.canonical_character_awakening_required(p_awakening_level integer)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE
AS $function$
  select case greatest(0,least(5,coalesce(p_awakening_level,0)))
    when 0 then 1 when 1 then 1 when 2 then 2 when 3 then 3 when 4 then 4 else 0 end
$function$
;
CREATE OR REPLACE FUNCTION public.canonical_character_stats(p_character_id text, p_level integer, p_awakening integer)
 RETURNS TABLE(hp integer, atk integer, def integer, spd integer, luk integer)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
WITH source AS (
 SELECT c.*,e.hp AS hp_exponent,e.atk AS atk_exponent,e.def AS def_exponent,e.spd AS spd_exponent,e.luk AS luk_exponent,
 greatest(least(p_level,100),1)::integer AS character_level,
 greatest(least(p_awakening,5),0)::integer AS awakening
 FROM public.canonical_character_master c
 JOIN public.canonical_character_growth_assignments a USING(version,character_id)
 JOIN public.canonical_character_growth_exponents e USING(growth_pattern_id)
 WHERE c.version='2026-08-21' AND c.character_id=p_character_id
), level_stats AS (
 SELECT
 round(lv1_hp::numeric+(lv100_hp::numeric-lv1_hp::numeric)*power((character_level-1)::numeric/99,hp_exponent))::bigint AS hp,
 round(lv1_atk::numeric+(lv100_atk::numeric-lv1_atk::numeric)*power((character_level-1)::numeric/99,atk_exponent))::bigint AS atk,
 round(lv1_def::numeric+(lv100_def::numeric-lv1_def::numeric)*power((character_level-1)::numeric/99,def_exponent))::bigint AS def,
 round(lv1_spd::numeric+(lv100_spd::numeric-lv1_spd::numeric)*power((character_level-1)::numeric/99,spd_exponent))::bigint AS spd,
 round(lv1_luk::numeric+(lv100_luk::numeric-lv1_luk::numeric)*power((character_level-1)::numeric/99,luk_exponent))::bigint AS luk,
 awakening FROM source
)
SELECT
 (hp*(array[10000,10800,11500,13200,15000,17500]::bigint[])[awakening+1]/10000)::integer,
 (atk*(array[10000,10800,11500,13200,15000,17500]::bigint[])[awakening+1]/10000)::integer,
 (def*(array[10000,10800,11500,13200,15000,17500]::bigint[])[awakening+1]/10000)::integer,
 (spd*(array[10000,10300,10600,11000,11500,12000]::bigint[])[awakening+1]/10000)::integer,
 (luk*(array[10000,10300,10600,11000,11500,12000]::bigint[])[awakening+1]/10000)::integer
FROM level_stats
$function$
;
CREATE OR REPLACE FUNCTION public.canonical_equipment_flat_stat(p_master_flat integer, p_level integer, p_plus_val integer)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$
  select floor(
    p_master_flat::numeric
    * public.equipment_level_battle_scale(p_level)
    * (100 + greatest(least(p_plus_val,10),0) * 4)::numeric / 100
  )::integer
$function$
;
CREATE OR REPLACE FUNCTION public.canonical_equipment_lb_multiplier(p_plus_val integer)
 RETURNS numeric
 LANGUAGE sql
 IMMUTABLE
AS $function$ select 1 + greatest(least(coalesce(p_plus_val,0),10),0) * 0.04 $function$
;
CREATE OR REPLACE FUNCTION public.canonical_equipment_lb_options(p_category text, p_plus_val integer)
 RETURNS jsonb
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  select coalesce(jsonb_agg(jsonb_build_object('unlock_level', unlock_level, 'slot_options', options) order by unlock_level), '[]'::jsonb)
  from public.canonical_equipment_lb_slot_options
  where version='2026-08-21' and category=upper(p_category) and unlock_level<=greatest(least(coalesce(p_plus_val,0),10),0)
$function$
;
CREATE OR REPLACE FUNCTION public.canonical_equipment_runtime_projection(p_user_id uuid, p_user_character_id uuid)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select public.canonical_equipment_runtime_projection_00171(p_user_id,p_user_character_id)
    || jsonb_build_object('_equipmentUtilityCorrection',jsonb_build_object(
      'spd',coalesce(sum(public.canonical_equipment_flat_stat((master.base_stats->>'spd')::integer,coalesce(owned.level,1),coalesce(owned.plus_val,0))-(master.base_stats->>'spd')::integer),0),
      'luk',coalesce(sum(public.canonical_equipment_flat_stat((master.base_stats->>'luk')::integer,coalesce(owned.level,1),coalesce(owned.plus_val,0))-(master.base_stats->>'luk')::integer),0)
    ))
  from public.user_characters character
  left join public.user_equipments owned on owned.user_id=p_user_id and owned.equipped_character_id=p_user_character_id::text
  left join public.canonical_equipment_master master on master.version='2026-08-21'
    and master.equipment_id=coalesce(nullif(owned.equipment_id,''),owned.equipment_master_id)
    and (master.exclusive_character_id is null or master.exclusive_character_id=character.character_id)
  where character.id=p_user_character_id and character.user_id=p_user_id
  group by character.character_id
$function$
;
CREATE OR REPLACE FUNCTION public.canonical_equipment_runtime_projection_00170(p_user_id uuid, p_user_character_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_status_chance integer := 0;
  v_status_resist integer := 0;
  v_blind_resist integer := 0;
  v_silence_resist integer := 0;
  v_crit_rate integer := 0;
  v_crit_damage integer := 0;
  v_damage_dealt integer := 0;
  v_damage_reduction integer := 0;
  v_effects jsonb := '[]'::jsonb;
  v_match text[];
  v_record record;
  v_raw text;
begin
  for v_record in
    select master.category, master.fixed_effects, greatest(least(coalesce(owned.plus_val,0),10),0) plus_val
    from public.user_equipments owned
    join public.canonical_equipment_master master
      on master.version='2026-08-21'
     and master.equipment_id=coalesce(nullif(owned.equipment_id,''),owned.equipment_master_id)
    join public.user_characters character
      on character.id=p_user_character_id and character.user_id=p_user_id
    where owned.user_id=p_user_id
      and owned.equipped_character_id=p_user_character_id::text
      and (master.exclusive_character_id is null or master.exclusive_character_id=character.character_id)
  loop
    v_effects := v_effects || v_record.fixed_effects || public.canonical_equipment_lb_options(v_record.category,v_record.plus_val);
    for v_raw in select jsonb_array_elements_text(v_record.fixed_effects)
    loop
      if v_raw !~* 'First Skill' then
        v_match := regexp_match(v_raw,'Status Chance([0-9]+)%','i');
        if v_match is not null then v_status_chance := greatest(v_status_chance,v_match[1]::integer*100); end if;
      end if;
      if v_raw !~* 'First Status' then
        v_match := regexp_match(v_raw,'Status Resist([0-9]+)%','i');
        if v_match is not null then v_status_resist := greatest(v_status_resist,v_match[1]::integer*100); end if;
      end if;
      v_match := regexp_match(v_raw,'Blind Resist([0-9]+)%','i');
      if v_match is not null then v_blind_resist := greatest(v_blind_resist,v_match[1]::integer*100); end if;
      v_match := regexp_match(v_raw,'Silence Resist([0-9]+)%','i');
      if v_match is not null then v_silence_resist := greatest(v_silence_resist,v_match[1]::integer*100); end if;
      v_match := regexp_match(v_raw,'Crit Rate([0-9]+)%','i');
      if v_match is not null then v_crit_rate := greatest(v_crit_rate,v_match[1]::integer*100); end if;
      v_match := regexp_match(v_raw,'Crit Damage([0-9]+)%','i');
      if v_match is not null then v_crit_damage := greatest(v_crit_damage,v_match[1]::integer*100); end if;
      v_match := regexp_match(v_raw,'DR([0-9]+)%','i');
      if v_match is not null then v_damage_reduction := greatest(v_damage_reduction,v_match[1]::integer*100); end if;
    end loop;

    if v_record.category='HEAD' and v_record.plus_val>=5 then v_status_resist:=greatest(v_status_resist,800); end if;
    if v_record.category='HEAD' and v_record.plus_val>=10 then v_damage_reduction:=greatest(v_damage_reduction,600); end if;
    if v_record.category='BODY' and v_record.plus_val>=10 then v_damage_reduction:=greatest(v_damage_reduction,800); end if;
    if v_record.category='ACCESSORY' and v_record.plus_val>=5 then v_crit_rate:=greatest(v_crit_rate,500); end if;
    if v_record.category='ACCESSORY' and v_record.plus_val>=10 then v_crit_damage:=greatest(v_crit_damage,1000); end if;
    if v_record.category='WEAPON' and v_record.plus_val>=5 then v_crit_damage:=greatest(v_crit_damage,800); end if;
    if v_record.category='WEAPON' and v_record.plus_val>=10 then v_damage_dealt:=greatest(v_damage_dealt,800); end if;
  end loop;

  return jsonb_build_object(
    'statusModifiers',jsonb_build_object(
      'statusChanceGenericBp',v_status_chance,
      'statusChanceIndividualBp',jsonb_build_object('STUN',0,'SILENCE',0,'BLIND',0,'POISON',0,'BLEED',0,'TAUNT',0),
      'statusResistanceGenericBp',least(v_status_resist,4000),
      'statusResistanceIndividualBp',jsonb_build_object('STUN',0,'SILENCE',least(v_silence_resist,5000),'BLIND',least(v_blind_resist,5000),'POISON',0,'BLEED',0,'TAUNT',0)
    ),
    'combatModifiers',jsonb_build_object(
      'criticalRatePositiveBp',v_crit_rate,
      'criticalRateNegativeBp',0,
      'criticalDamageBp',v_crit_damage,
      'damageDealtPositiveBp',v_damage_dealt,
      'damageDealtNegativeBp',0,
      'damageReductionBp',least(v_damage_reduction,6000)
    ),
    'equipmentEffects',v_effects
  );
end $function$
;
CREATE OR REPLACE FUNCTION public.canonical_quest_enemy_snapshot(p_quest_id text)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 with encounter as (select * from public.canonical_quest_encounter_master where version='2026-08-22' and quest_id=p_quest_id and is_production_enabled),
 members as (select encounter.*,value member,ordinality from encounter,jsonb_array_elements(encounter.members) with ordinality),
 resolved as (
  select members.encounter_id,members.ordinality,members.member,master.display_name,master.attribute,stats.*,
   coalesce((select jsonb_agg(jsonb_build_object('id',skill.skill_id,'name',skill.display_name,'activationType',skill.activation_type,'cooldown',skill.cooldown,'availableFromRound',skill.available_from_round,'target',skill.target,'effects',skill.effects,'exclusiveCharacterId',skill.exclusive_character_id) order by loadout.ordinality)
    from jsonb_array_elements_text(members.member->'skillLoadout') with ordinality loadout(skill_id,ordinality)
    join public.canonical_skill_master skill on skill.version='2026-08-21' and skill.skill_id=loadout.skill_id),'[]'::jsonb) skills
  from members join public.canonical_character_master master on master.version='2026-08-21' and master.character_id=members.member->>'characterId'
  cross join lateral public.canonical_character_stats(members.member->>'characterId',(members.member->>'level')::integer,(members.member->>'awakening')::integer) stats
 )
 select jsonb_agg(jsonb_build_object('id','enemy_'||encounter_id||'_'||ordinality,'characterId',member->>'characterId','name',display_name,'team','ENEMY','alignment',attribute,'level',(member->>'level')::integer,'awakeningLevel',(member->>'awakening')::integer,'stats',jsonb_build_object('hp',hp,'atk',atk,'def',def,'spd',spd,'luk',luk),'equipment','[]'::jsonb,'equippedSkillRefs',member->'skillLoadout','skills',skills) order by ordinality) from resolved
$function$
;
CREATE OR REPLACE FUNCTION public.canonical_quest_is_unlocked(p_user_id uuid, p_quest_id text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 select case when m.unlock_condition='OPEN' then true when m.unlock_condition like 'FIRST_CLEAR:%' then exists(select 1 from public.user_quest_first_clears c where c.user_id=p_user_id and c.quest_id=substring(m.unlock_condition from 13)) else false end from public.canonical_quest_master m where m.version='2026-08-30' and m.quest_id=p_quest_id and m.is_production_enabled
$function$
;
CREATE OR REPLACE FUNCTION public.canonical_raid_rotation_pair(p_date date)
 RETURNS text[]
 LANGUAGE sql
 IMMUTABLE
AS $function$
 with towns as(select array['shinjuku','shibuya','ikebukuro','roppongi','akihabara','kawasaki','yokohama']::text[] value),pairs as(select array[value[i],value[j]] pair,row_number() over(order by i,j)-1 idx from towns,generate_subscripts(value,1)i,generate_subscripts(value,1)j where i<j)
 select pair from pairs where idx=mod((p_date-date '2026-08-30')::integer,21)
$function$
;
CREATE OR REPLACE FUNCTION public.canonical_ranking_reward_payload()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_payload jsonb; v_daily jsonb;
begin
  select master.payload into v_payload
  from public.canonical_master_freeze_versions master
  where master.domain='RANKING_REWARD' and master.version='2026-09-03'
    and master.is_production_enabled;
  if v_payload is null then
    raise exception 'active canonical ranking reward master is missing' using errcode='P0002';
  end if;
  select jsonb_object_agg(grouped.ranking_type,grouped.rewards order by grouped.ranking_type)
  into v_daily
  from (
    select master.ranking_type,
      jsonb_agg(jsonb_build_array(master.rank_min,master.rank_max,master.item_id,master.quantity)
        order by master.rank_min,master.item_id) rewards
    from public.canonical_daily_ranking_reward_master master
    where master.version='2026-09-03' and master.is_production_enabled
    group by master.ranking_type
  ) grouped;
  return v_payload||jsonb_build_object('daily',coalesce(v_daily,'{}'::jsonb));
end;
$function$
;
CREATE OR REPLACE FUNCTION public.canonical_skill_slot_count(p_awakening integer)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
AS $function$ select (array[3,4,5,5,5,6])[greatest(least(coalesce(p_awakening,0),5),0)+1] $function$
;
CREATE OR REPLACE FUNCTION public.capture_current_lifetime_onboarding_grant(p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_history public.gacha_execution_history%rowtype;
  v_history_count integer;
  v_results jsonb;
  v_guaranteed text;
  v_growth_level integer;
  v_formation jsonb;
  v_formation_count integer;
  v_leader text;
  v_leader_owned uuid;
  v_skill text;
begin
  if p_user_id is null or not exists(select 1 from public.users where id=p_user_id) then return false; end if;
  if exists(select 1 from public.user_lifetime_onboarding_grants where user_id=p_user_id) then return true; end if;

  select count(*) into v_history_count
  from public.gacha_execution_history h
  where h.user_id=p_user_id and h.status='COMPLETED'
    and coalesce((h.result_payload->>'tutorial')::boolean,false)
    and jsonb_array_length(coalesce(h.result_payload->'results','[]'::jsonb))=10;
  if v_history_count<>1 then return false; end if;

  select * into v_history from public.gacha_execution_history h
  where h.user_id=p_user_id and h.status='COMPLETED'
    and coalesce((h.result_payload->>'tutorial')::boolean,false)
    and jsonb_array_length(coalesce(h.result_payload->'results','[]'::jsonb))=10
  limit 1;
  v_results:=v_history.result_payload->'results';
  select result->>'character_id' into v_guaranteed
  from jsonb_array_elements(v_results) result
  where coalesce((result->>'tutorial_slot')::integer,0)=10
    and result->>'rarity'='SSR';
  if v_guaranteed is null then return false; end if;

  select id,level into v_leader_owned,v_growth_level
  from public.user_characters
  where user_id=p_user_id and character_id=v_guaranteed
  order by created_at,id limit 1;
  if v_leader_owned is null or coalesce(v_growth_level,0)<7 then return false; end if;

  select jsonb_agg(owned.character_id order by formation.slot),count(*)
    into v_formation,v_formation_count
  from public.user_main_formations formation
  join public.user_characters owned on owned.id=formation.user_character_id and owned.user_id=formation.user_id
  where formation.user_id=p_user_id;
  if v_formation_count<>5 then return false; end if;

  select favorite_character_id into v_leader from public.users where id=p_user_id;
  if v_leader is null or v_leader<>v_formation->>0 then return false; end if;
  select skill_card_id into v_skill from public.user_skills
  where user_id=p_user_id
    and (equipped_character_id=v_leader_owned::text or equipped_character_id=v_leader)
  order by slot_index nulls last,created_at,id limit 1;
  if v_skill is null then return false; end if;

  insert into public.user_lifetime_onboarding_grants(
    user_id,canonical_payload,source,source_reference,canonical_master_version,first_granted_at
  ) values (
    p_user_id,
    jsonb_build_object(
      'gacha_results',v_results,
      'guaranteed_ssr',v_guaranteed,
      'growth_target_character',v_guaranteed,
      'growth_target_level',7,
      'starter_skill',v_skill,
      'formation_character_ids',v_formation,
      'formation_order',jsonb_build_array(1,2,3,4,5),
      'leader_character',v_leader
    ),
    'TUTORIAL_CANONICAL_HISTORY',v_history.request_id,'2026-08-21',v_history.created_at
  ) on conflict(user_id) do nothing;
  return exists(select 1 from public.user_lifetime_onboarding_grants where user_id=p_user_id);
end;
$function$
;
CREATE OR REPLACE FUNCTION public.capture_daily_ranking_guild_membership()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_day date:=(clock_timestamp() at time zone 'Asia/Tokyo')::date;
begin
  if tg_op='DELETE' then
    update public.ranking_daily_activity_snapshots set guild_id=null
    where ranking_day_key=v_day and user_id=old.user_id;
    return old;
  end if;
  if tg_op='UPDATE' and old.user_id is distinct from new.user_id then
    update public.ranking_daily_activity_snapshots set guild_id=null
    where ranking_day_key=v_day and user_id=old.user_id;
  end if;
  update public.ranking_daily_activity_snapshots set guild_id=new.guild_id
  where ranking_day_key=v_day and user_id=new.user_id;
  return new;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.capture_daily_ranking_participation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_type text; v_day date;
begin
  if old.finalization_status='FINALIZED' or new.finalization_status<>'FINALIZED' then return new; end if;
  if new.battle_mode='RAID' then return new; end if;
  v_type:=case new.battle_mode when 'PVP' then 'PVP' when 'RAID' then 'RAID_PERSONAL' end;
  if v_type is null or new.finalized_at is null then return new; end if;
  v_day:=(new.finalized_at at time zone 'Asia/Tokyo')::date;
  insert into public.ranking_daily_participation(
    ranking_day_key,ranking_type,user_id,finalized_count,first_finalized_at,last_finalized_at
  ) values(v_day,v_type,new.requester_user_id,1,new.finalized_at,new.finalized_at)
  on conflict(ranking_day_key,ranking_type,user_id) do update set
    finalized_count=public.ranking_daily_participation.finalized_count+1,
    first_finalized_at=least(public.ranking_daily_participation.first_finalized_at,excluded.first_finalized_at),
    last_finalized_at=greatest(public.ranking_daily_participation.last_finalized_at,excluded.last_finalized_at);
  return new;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.capture_gvg_guild_result()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_season uuid; v_guild uuid;
begin
  if old.status<>'COMPLETED' and new.status='COMPLETED' then
    v_season:=public.current_ranking_season_id('GVG',coalesce(new.completed_at,clock_timestamp()));
    if v_season is not null then
      foreach v_guild in array array_remove(array[new.guild_a_id,new.guild_b_id],null) loop
        insert into public.gvg_guild_season_rankings(season_id,guild_id,rate,wins,losses)
        select v_season,v_guild,coalesce(rating.rating,1000),
          case when new.winner_guild_id=v_guild then 1 else 0 end,
          case when new.winner_guild_id is not null and new.winner_guild_id<>v_guild then 1 else 0 end
        from (select 1) seed left join public.gvg_guild_ratings rating on rating.guild_id=v_guild
        on conflict(season_id,guild_id) do update set
          rate=excluded.rate,wins=public.gvg_guild_season_rankings.wins+excluded.wins,
          losses=public.gvg_guild_season_rankings.losses+excluded.losses,updated_at=clock_timestamp();
      end loop;
    end if;
  end if;
  return new;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.capture_gvg_individual_damage()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_season uuid;
begin
  if old.battle_result='PENDING' and new.battle_result in('VICTORY','DEFEAT') then
    v_season:=public.current_ranking_season_id('GVG',coalesce(new.resolved_at,clock_timestamp()));
    if v_season is not null then
      insert into public.gvg_individual_season_rankings(season_id,user_id,guild_id,actual_damage)
      values(v_season,new.attacker_user_id,new.attacker_guild_id,new.raw_damage)
      on conflict(season_id,user_id) do update set
        guild_id=excluded.guild_id,actual_damage=public.gvg_individual_season_rankings.actual_damage+excluded.actual_damage,updated_at=clock_timestamp();
    end if;
  end if;
  return new;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.capture_pvp_daily_win()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_delta integer;
begin
  if coalesce(current_setting('tribe_neon.ranking_reconcile',true),'')='on' then
    return new;
  end if;
  v_delta:=case when tg_op='INSERT' then greatest(coalesce(new.daily_wins,0),0)
                else greatest(coalesce(new.daily_wins,0)-coalesce(old.daily_wins,0),0) end;
  if v_delta>0 then
    insert into public.pvp_daily_wins(activity_date,user_id,wins,updated_at)
    values((clock_timestamp() at time zone 'Asia/Tokyo')::date,new.user_id,v_delta,clock_timestamp())
    on conflict(activity_date,user_id) do update set
      wins=public.pvp_daily_wins.wins+excluded.wins,updated_at=excluded.updated_at;
  end if;
  return new;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.character_awaken(p_user_id uuid, p_character_id text, p_cash_cost integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_cash INTEGER;
    v_item_qty INTEGER;
    v_awaken_level INTEGER;
BEGIN
    SELECT cash INTO v_cash FROM public.users WHERE id = p_user_id;
    IF v_cash IS NULL OR v_cash < p_cash_cost THEN
        RETURN jsonb_build_object('error', 'キャッシュが不足しています。');
    END IF;

    SELECT quantity INTO v_item_qty FROM public.user_items WHERE user_id = p_user_id AND item_id = 'LAW_OF_STRIFE';
    IF v_item_qty IS NULL OR v_item_qty < 1 THEN
        RETURN jsonb_build_object('error', '覚醒の書が不足しています。');
    END IF;

    SELECT awakening_level INTO v_awaken_level FROM public.user_characters WHERE user_id = p_user_id AND character_id = p_character_id;
    IF v_awaken_level IS NULL OR v_awaken_level >= 5 THEN
        RETURN jsonb_build_object('error', 'キャラクターが存在しないか、覚醒上限です。');
    END IF;

    UPDATE public.users SET cash = cash - p_cash_cost WHERE id = p_user_id;
    UPDATE public.user_items SET quantity = quantity - 1 WHERE user_id = p_user_id AND item_id = 'LAW_OF_STRIFE';
    UPDATE public.user_characters SET awakening_level = awakening_level + 1 WHERE user_id = p_user_id AND character_id = p_character_id;

    RETURN jsonb_build_object('status', 'success');
END;
$function$
;
CREATE OR REPLACE FUNCTION public.character_level_up(p_user_id uuid, p_character_id text, p_exp_item_id text, p_count integer, p_cash_cost integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_cash INTEGER;
    v_item_qty INTEGER;
    v_char_level INTEGER;
BEGIN
    SELECT cash INTO v_cash FROM public.users WHERE id = p_user_id;
    IF v_cash IS NULL OR v_cash < p_cash_cost THEN
        RETURN jsonb_build_object('error', 'キャッシュが不足しています。');
    END IF;

    SELECT quantity INTO v_item_qty FROM public.user_items WHERE user_id = p_user_id AND item_id = p_exp_item_id;
    IF v_item_qty IS NULL OR v_item_qty < p_count THEN
        RETURN jsonb_build_object('error', '経験の書が不足しています。');
    END IF;

    SELECT level INTO v_char_level FROM public.user_characters WHERE user_id = p_user_id AND character_id = p_character_id;
    IF v_char_level IS NULL THEN
        RETURN jsonb_build_object('error', 'キャラクターが存在しません。');
    END IF;

    UPDATE public.users SET cash = cash - p_cash_cost WHERE id = p_user_id;
    UPDATE public.user_items SET quantity = quantity - p_count WHERE user_id = p_user_id AND item_id = p_exp_item_id;
    UPDATE public.user_characters SET level = LEAST(100, level + p_count) WHERE user_id = p_user_id AND character_id = p_character_id;

    PERFORM public.evaluate_mission_progress(p_user_id, 'CHAR_LEVEL_UP', p_count);
    RETURN jsonb_build_object('status', 'success');
END;
$function$
;
CREATE OR REPLACE FUNCTION public.check_current_gameplay_reset_eligibility()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_user_id uuid:=auth.uid();
begin
  if v_user_id is null then return jsonb_build_object('eligible',false,'reason','AUTHENTICATION'); end if;
  return public.current_gameplay_reset_eligibility(v_user_id);
end;
$function$
;
CREATE OR REPLACE FUNCTION public.claim_all_mission_rewards(p_mission_ids text[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_uid uuid := auth.uid();
  v_entry record;
  v_count integer := 0;
  v_claim_key text;
  v_ledger_id uuid;
  v_entry_rewards jsonb;
  v_rewards jsonb := '[]'::jsonb;
begin
  if v_uid is null or p_mission_ids is null or cardinality(p_mission_ids) not between 1 and 100 then
    raise exception 'Invalid mission claim request' using errcode='22023';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(v_uid::text||':missions',0));
  perform public.sync_current_missions();
  for v_entry in
    select um.id user_mission_id,um.cycle_date,um.mission_id,m.*
    from public.user_missions um join public.missions m on m.id=um.mission_id and m.is_enabled
    where um.user_id=v_uid and um.status='CLEAR'
      and um.mission_id in(select distinct unnest(p_mission_ids))
    order by m.display_order,um.mission_id for update of um
  loop
    -- Recheck per grant, including after waiting for the user mission lock.
    if exists(select 1 from public.mission_events event
      where event.id=v_entry.event_id and event.claim_deadline is not null
        and clock_timestamp()>=event.claim_deadline) then
      continue;
    end if;
    v_claim_key:=concat_ws(':',v_uid::text,v_entry.mission_id,coalesce(v_entry.cycle_date::text,'ONCE'));
    insert into public.mission_reward_delivery_ledger(
      claim_key,user_mission_id,user_id,mission_id,cycle_date,resolved_item_id,
      item_quantity,cash_quantity,delivery_status
    ) values (
      v_claim_key,v_entry.user_mission_id,v_uid,v_entry.mission_id,v_entry.cycle_date,
      public.resolve_canonical_reward_item(v_entry.reward_item_id),v_entry.reward_quantity,
      greatest(coalesce(v_entry.cash_reward,0),0),'PENDING'
    ) returning id into v_ledger_id;
    v_entry_rewards:=public.grant_mission_reward_bundle(v_ledger_id,v_uid,v_entry.mission_id);
    select coalesce(jsonb_agg(value||jsonb_build_object('mission_id',v_entry.mission_id)),'[]'::jsonb)
      into v_entry_rewards from jsonb_array_elements(v_entry_rewards) item(value);
    v_rewards:=v_rewards||v_entry_rewards;
    update public.user_missions set status='CLAIMED',claimed_at=clock_timestamp(),updated_at=clock_timestamp()
      where id=v_entry.user_mission_id;
    insert into public.user_missions(user_id,mission_id,current_progress,progress_val,status)
    select v_uid,next.id,0,0,'PROGRESS' from public.missions next
    where next.is_enabled and next.category='NORMAL' and next.prerequisite_mission_id=v_entry.mission_id
    on conflict(user_id,mission_id) do nothing;
    update public.mission_reward_delivery_ledger set delivery_status='DELIVERED',delivered_at=clock_timestamp()
      where id=v_ledger_id;
    if v_entry.event_id is not null then
      insert into public.mission_event_telemetry(event_id,user_id,event_name,mission_id,jst_date,source)
      values(v_entry.event_id,v_uid,
        case when v_entry.trigger_type='GVG_PREP_REQUIRED_MISSIONS_COMPLETED'
          then 'complete_reward_claimed' else 'mission_reward_claimed' end,
        v_entry.mission_id,(clock_timestamp() at time zone 'Asia/Tokyo')::date,'bulk_claim');
    end if;
    v_count:=v_count+1;
  end loop;
  if exists(select 1 from public.missions where id=any(p_mission_ids) and event_id is not null) then
    insert into public.mission_event_telemetry(event_id,user_id,event_name,jst_date,source,metadata)
    values('GVG_PREP_20260904',v_uid,'bulk_claim',(clock_timestamp() at time zone 'Asia/Tokyo')::date,
      'bulk_claim',jsonb_build_object('claimed_count',v_count));
  end if;
  perform public.refresh_normal_mission_owned_state(v_uid);
  return jsonb_build_object('claimed_count',v_count,'delivery','DIRECT','rewards',v_rewards,'mission_state',public.get_current_mission_reward_state());
end;
$function$
;
CREATE OR REPLACE FUNCTION public.claim_all_mission_rewards(p_user_id uuid, p_mission_ids text[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_mission_id TEXT;
    v_mission public.missions%ROWTYPE;
    v_next_step TEXT;
    v_count INTEGER := 0;
BEGIN
    FOREACH v_mission_id IN ARRAY p_mission_ids LOOP
        UPDATE public.user_missions SET status = 'CLAIMED', updated_at = now() WHERE user_id = p_user_id AND mission_id = v_mission_id AND status = 'PROGRESS';

        SELECT * INTO v_mission FROM public.missions WHERE id = v_mission_id;
        IF v_mission.id IS NOT NULL THEN
            INSERT INTO public.presents (user_id, item_id, quantity, message, expire_at, status)
            VALUES (p_user_id, v_mission.reward_item_id, v_mission.reward_quantity, 'ミッション報酬: ' || v_mission.title, now() + interval '24 hours', 'UNCLAIMED');

            v_next_step := NULL;
            IF v_mission_id = 'm_pvp_01' THEN v_next_step := 'm_pvp_02';
            ELSIF v_mission_id = 'm_exp_01' THEN v_next_step := 'm_exp_02';
            ELSIF v_mission_id = 'm_lvl_01' THEN v_next_step := 'm_lvl_02';
            END IF;

            IF v_next_step IS NOT NULL THEN
                INSERT INTO public.user_missions (user_id, mission_id, current_progress, status)
                VALUES (p_user_id, v_next_step, 0, 'PROGRESS')
                ON CONFLICT (user_id, mission_id) DO NOTHING;
            END IF;
            v_count := v_count + 1;
        END IF;
    END LOOP;

    RETURN jsonb_build_object('status', 'success', 'claimed_count', v_count);
END;
$function$
;
CREATE OR REPLACE FUNCTION public.claim_all_presents()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_present public.presents%ROWTYPE;
  v_count integer := 0;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  FOR v_present IN
    SELECT * FROM public.presents
    WHERE user_id = v_user_id
      AND status = 'UNCLAIMED'
      AND (expire_at IS NULL OR expire_at > clock_timestamp())
    ORDER BY id
    FOR UPDATE
  LOOP
    PERFORM public.grant_present_payload(v_user_id, v_present.item_id, v_present.quantity);
    UPDATE public.presents
    SET status = 'CLAIMED', claimed_at = clock_timestamp()
    WHERE id = v_present.id;
    v_count := v_count + 1;
  END LOOP;
  RETURN jsonb_build_object('status', 'success', 'claimed_count', v_count);
END;
$function$
;
CREATE OR REPLACE FUNCTION public.claim_all_presents(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_present public.presents%ROWTYPE; v_count INTEGER := 0;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN RAISE EXCEPTION 'not authorized'; END IF;
  FOR v_present IN SELECT * FROM public.presents WHERE user_id = p_user_id AND status = 'UNCLAIMED' FOR UPDATE LOOP
    IF v_present.item_id = 'CASH' THEN
      UPDATE public.users SET cash = cash + v_present.quantity WHERE id = p_user_id;
    ELSIF v_present.item_id IN ('DIA', 'DIAMOND') THEN
      UPDATE public.users SET neon_diamonds = neon_diamonds + v_present.quantity WHERE id = p_user_id;
    ELSIF v_present.item_id LIKE 'EQUIP_%' THEN
      INSERT INTO public.user_equipments (user_id, equipment_id, equipment_master_id, level, plus_val)
      VALUES (p_user_id, v_present.item_id, v_present.item_id, 1, 0);
    ELSE
      INSERT INTO public.user_items (user_id, item_id, quantity) VALUES (p_user_id, v_present.item_id, v_present.quantity)
      ON CONFLICT (user_id, item_id) DO UPDATE SET quantity = public.user_items.quantity + EXCLUDED.quantity;
    END IF;
    UPDATE public.presents SET status = 'CLAIMED', claimed_at = now() WHERE id = v_present.id;
    v_count := v_count + 1;
  END LOOP;
  RETURN jsonb_build_object('status', 'success', 'claimed_count', v_count);
END;
$function$
;
CREATE OR REPLACE FUNCTION public.claim_battle_rewards(p_user_id uuid, p_cash_amount integer, p_exp_amount integer, p_item_rewards jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_item JSONB;
BEGIN
    UPDATE public.users SET cash = COALESCE(cash, 0) + p_cash_amount WHERE id = p_user_id;
    
    IF p_exp_amount > 0 THEN
        PERFORM public.add_user_xp(p_user_id, p_exp_amount);
    END IF;

    IF jsonb_typeof(p_item_rewards) = 'array' THEN
        FOR v_item IN SELECT * FROM jsonb_array_elements(p_item_rewards)
        LOOP
            INSERT INTO public.user_items (user_id, item_id, quantity)
            VALUES (p_user_id, v_item->>'item_id', (v_item->>'quantity')::INTEGER)
            ON CONFLICT (user_id, item_id) 
            DO UPDATE SET quantity = public.user_items.quantity + (v_item->>'quantity')::INTEGER;
        END LOOP;
    END IF;

    RETURN jsonb_build_object('status', 'success');
END;
$function$
;
CREATE OR REPLACE FUNCTION public.claim_daily_pass_reward(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ begin perform public.assert_feature_mutation_allowed('PAYMENT'); return public.claim_daily_pass_reward_core_20260823(p_user_id); end $function$
;
CREATE OR REPLACE FUNCTION public.claim_daily_pass_reward_core_20260823(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_pass public.user_monthly_passes%ROWTYPE;
BEGIN
    SELECT * INTO v_pass FROM public.user_monthly_passes WHERE user_id = p_user_id AND is_active = true AND expires_at > now() FOR UPDATE;
    IF v_pass.id IS NULL THEN
        RAISE EXCEPTION '有効な月額パスがありません。';
    END IF;

    IF v_pass.daily_claimed_at = CURRENT_DATE THEN
        RAISE EXCEPTION '本日の報酬は既に受け取り済みです。';
    END IF;

    UPDATE public.user_monthly_passes SET daily_claimed_at = CURRENT_DATE WHERE id = v_pass.id;
    UPDATE public.users SET diamonds = diamonds + 100 WHERE id = p_user_id;

    RETURN jsonb_build_object('success', true);
END;
$function$
;
CREATE OR REPLACE FUNCTION public.claim_gvg_base(p_guild_id uuid, p_base_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN jsonb_build_object('status', 'success');
END;
$function$
;
CREATE OR REPLACE FUNCTION public.claim_mission_reward(p_mission_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_uid uuid := auth.uid();
  v_mission public.missions%rowtype;
  v_progress public.user_missions%rowtype;
  v_claim_key text;
  v_ledger_id uuid;
  v_rewards jsonb;
begin
  if v_uid is null or p_mission_id is null then
    raise exception 'Player authentication required' using errcode='42501';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(v_uid::text||':missions',0));
  perform public.sync_current_missions();
  select * into v_progress from public.user_missions
    where user_id=v_uid and mission_id=p_mission_id for update;
  if not found or v_progress.status<>'CLEAR' then
    raise exception 'Mission reward is not claimable' using errcode='23514';
  end if;
  select * into strict v_mission from public.missions where id=p_mission_id and is_enabled;
  if exists(select 1 from public.mission_events event
    where event.id=v_mission.event_id and event.claim_deadline is not null
      and clock_timestamp()>=event.claim_deadline) then
    raise exception 'Mission reward claim deadline has passed' using errcode='23514';
  end if;
  v_claim_key := concat_ws(':',v_uid::text,p_mission_id,coalesce(v_progress.cycle_date::text,'ONCE'));
  insert into public.mission_reward_delivery_ledger(
    claim_key,user_mission_id,user_id,mission_id,cycle_date,resolved_item_id,
    item_quantity,cash_quantity,delivery_status
  ) values (
    v_claim_key,v_progress.id,v_uid,p_mission_id,v_progress.cycle_date,
    public.resolve_canonical_reward_item(v_mission.reward_item_id),v_mission.reward_quantity,
    greatest(coalesce(v_mission.cash_reward,0),0),'PENDING'
  ) returning id into v_ledger_id;
  v_rewards := public.grant_mission_reward_bundle(v_ledger_id,v_uid,p_mission_id);
  update public.user_missions set status='CLAIMED',claimed_at=clock_timestamp(),updated_at=clock_timestamp()
    where id=v_progress.id;
  insert into public.user_missions(user_id,mission_id,current_progress,progress_val,status)
  select v_uid,next.id,0,0,'PROGRESS' from public.missions next
  where next.is_enabled and next.category='NORMAL' and next.prerequisite_mission_id=p_mission_id
  on conflict(user_id,mission_id) do nothing;
  update public.mission_reward_delivery_ledger set delivery_status='DELIVERED',delivered_at=clock_timestamp()
    where id=v_ledger_id;
  if v_mission.event_id is not null then
    insert into public.mission_event_telemetry(event_id,user_id,event_name,mission_id,jst_date,source)
    values(v_mission.event_id,v_uid,
      case when v_mission.trigger_type='GVG_PREP_REQUIRED_MISSIONS_COMPLETED'
        then 'complete_reward_claimed' else 'mission_reward_claimed' end,
      p_mission_id,(clock_timestamp() at time zone 'Asia/Tokyo')::date,'individual_claim');
  end if;
  perform public.refresh_normal_mission_owned_state(v_uid);
  return jsonb_build_object('claimed',true,'mission_id',p_mission_id,'delivery','DIRECT','rewards',v_rewards,'mission_state',public.get_current_mission_reward_state());
end;
$function$
;
CREATE OR REPLACE FUNCTION public.claim_mission_reward(p_user_id uuid, p_mission_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_mission public.missions%ROWTYPE;
    v_next_step TEXT;
BEGIN
    -- This RPC assumes we already updated user_missions on client and just need to create the present safely
    -- Wait, the client shouldn't update user_missions. RPC should do it.
    UPDATE public.user_missions SET status = 'CLAIMED', updated_at = now() WHERE user_id = p_user_id AND mission_id = p_mission_id AND status = 'PROGRESS';

    SELECT * INTO v_mission FROM public.missions WHERE id = p_mission_id;
    IF v_mission.id IS NOT NULL THEN
        INSERT INTO public.presents (user_id, item_id, quantity, message, expire_at, status)
        VALUES (p_user_id, v_mission.reward_item_id, v_mission.reward_quantity, 'ミッション報酬: ' || v_mission.title, now() + interval '24 hours', 'UNCLAIMED');

        IF p_mission_id = 'm_pvp_01' THEN v_next_step := 'm_pvp_02';
        ELSIF p_mission_id = 'm_exp_01' THEN v_next_step := 'm_exp_02';
        ELSIF p_mission_id = 'm_lvl_01' THEN v_next_step := 'm_lvl_02';
        END IF;

        IF v_next_step IS NOT NULL THEN
            INSERT INTO public.user_missions (user_id, mission_id, current_progress, status)
            VALUES (p_user_id, v_next_step, 0, 'PROGRESS')
            ON CONFLICT (user_id, mission_id) DO NOTHING;
        END IF;
    END IF;

    RETURN jsonb_build_object('status', 'success');
END;
$function$
;
CREATE OR REPLACE FUNCTION public.claim_present(p_present_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_present public.presents%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  SELECT * INTO v_present
  FROM public.presents
  WHERE id = p_present_id
    AND user_id = v_user_id
    AND status = 'UNCLAIMED'
    AND (expire_at IS NULL OR expire_at > clock_timestamp())
  FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Present is not claimable'; END IF;

  PERFORM public.grant_present_payload(v_user_id, v_present.item_id, v_present.quantity);
  UPDATE public.presents
  SET status = 'CLAIMED', claimed_at = clock_timestamp()
  WHERE id = v_present.id;
  RETURN jsonb_build_object('status', 'success', 'present_id', v_present.id);
END;
$function$
;
CREATE OR REPLACE FUNCTION public.claim_present(p_user_id uuid, p_present_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_present public.presents%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN RAISE EXCEPTION 'not authorized'; END IF;
  SELECT * INTO v_present FROM public.presents WHERE id = p_present_id AND user_id = p_user_id AND status = 'UNCLAIMED' FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('error', 'present not found or already claimed'); END IF;
  IF v_present.item_id = 'CASH' THEN
    UPDATE public.users SET cash = cash + v_present.quantity WHERE id = p_user_id;
  ELSIF v_present.item_id IN ('DIA', 'DIAMOND') THEN
    UPDATE public.users SET neon_diamonds = neon_diamonds + v_present.quantity WHERE id = p_user_id;
  ELSIF v_present.item_id LIKE 'EQUIP_%' THEN
    INSERT INTO public.user_equipments (user_id, equipment_id, equipment_master_id, level, plus_val)
    VALUES (p_user_id, v_present.item_id, v_present.item_id, 1, 0);
  ELSE
    INSERT INTO public.user_items (user_id, item_id, quantity) VALUES (p_user_id, v_present.item_id, v_present.quantity)
    ON CONFLICT (user_id, item_id) DO UPDATE SET quantity = public.user_items.quantity + EXCLUDED.quantity;
  END IF;
  UPDATE public.presents SET status = 'CLAIMED', claimed_at = now() WHERE id = p_present_id;
  RETURN jsonb_build_object('status', 'success');
END;
$function$
;
CREATE OR REPLACE FUNCTION public.cleanup_expired_anonymous_onboarding()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth', 'pg_temp'
AS $function$
declare
  v_run_id bigint;
  v_candidate_count integer := 0;
  v_deleted_count integer := 0;
  v_skipped_count integer := 0;
  v_skipped_user_ids uuid[] := '{}'::uuid[];
  v_candidate record;
begin
  insert into public.anonymous_onboarding_cleanup_runs default values
  returning id into v_run_id;

  for v_candidate in
    select au.id
    from auth.users au
    join public.users u on u.id = au.id
    join public.tutorial_progress tp on tp.user_id = au.id
    where au.is_anonymous is true
      and tp.step_id not in ('COMPLETE', 'AUTHENTICATION')
      and greatest(
        au.created_at,
        coalesce(au.last_sign_in_at, au.created_at),
        tp.updated_at
      ) < now() - interval '24 hours'
      -- A linked method or non-anonymous identity makes the account persistent.
      and not exists (
        select 1 from public.user_account_auth_methods method
        where method.user_id = au.id
      )
      and not exists (
        select 1 from auth.identities identity_row
        where identity_row.user_id = au.id
          and identity_row.provider <> 'anonymous'
      )
      -- A recently active anonymous browser is not abandoned.
      and not exists (
        select 1
        from auth.sessions session_row
        where session_row.user_id = au.id
          and session_row.refreshed_at >= now() - interval '24 hours'
          and (session_row.not_after is null or session_row.not_after > now())
      )
      -- Durable social, competitive, payment, or reward ownership is never
      -- removed automatically. Operations must review those anomalous rows.
      and not exists (select 1 from public.user_invitations row where row.inviter_user_id=au.id or row.invitee_user_id=au.id)
      and not exists (select 1 from public.guild_members row where row.user_id=au.id)
      and not exists (select 1 from public.guilds row where row.leader_id=au.id)
      and not exists (select 1 from public.raid_damage_logs row where row.user_id=au.id)
      and not exists (select 1 from public.raid_reward_grants row where row.user_id=au.id)
      and not exists (select 1 from public.raid_production_reward_grants row where row.user_id=au.id)
      and not exists (select 1 from public.pvp_defense_logs row where row.user_id=au.id)
      and not exists (select 1 from public.pvp_ranking_reward_grants row where row.user_id=au.id)
      and not exists (select 1 from public.gvg_attack_logs row where row.attacker_user_id=au.id)
      and not exists (select 1 from public.payment_transactions row where row.user_id=au.id)
    order by au.created_at
    for update of au skip locked
  loop
    v_candidate_count := v_candidate_count + 1;
    begin
      delete from public.users where id = v_candidate.id;
      delete from auth.users where id = v_candidate.id;
      v_deleted_count := v_deleted_count + 1;
    exception when foreign_key_violation then
      v_skipped_count := v_skipped_count + 1;
      v_skipped_user_ids := array_append(v_skipped_user_ids, v_candidate.id);
    end;
  end loop;

  update public.anonymous_onboarding_cleanup_runs
  set finished_at = now(),
      candidate_count = v_candidate_count,
      deleted_count = v_deleted_count,
      skipped_count = v_skipped_count,
      skipped_user_ids = v_skipped_user_ids
  where id = v_run_id;

  return jsonb_build_object(
    'runId', v_run_id,
    'candidates', v_candidate_count,
    'deleted', v_deleted_count,
    'skipped', v_skipped_count
  );
end;
$function$
;
CREATE OR REPLACE FUNCTION public.complete_gvg_match_on_timeout(p_match_session_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_match public.gvg_match_sessions%ROWTYPE; v_a NUMERIC; v_b NUMERIC; v_winner UUID; v_reason TEXT;
BEGIN
  SELECT * INTO v_match FROM public.gvg_match_sessions WHERE id = p_match_session_id FOR UPDATE;
  IF NOT FOUND OR v_match.status <> 'ACTIVE' THEN RAISE EXCEPTION 'GvG match is not active'; END IF;
  IF now() < v_match.scheduled_end_at THEN RAISE EXCEPTION 'GvG match has not ended'; END IF;
  v_a := v_match.guild_a_collapses + ((v_match.guild_a_phase_max_hp - v_match.guild_a_phase_hp)::NUMERIC / v_match.guild_a_phase_max_hp);
  v_b := v_match.guild_b_collapses + ((v_match.guild_b_phase_max_hp - v_match.guild_b_phase_hp)::NUMERIC / v_match.guild_b_phase_max_hp);
  IF v_a > v_b THEN v_winner := v_match.guild_b_id; v_reason := 'TIMEOUT_PROGRESS';
  ELSIF v_b > v_a THEN v_winner := v_match.guild_a_id; v_reason := 'TIMEOUT_PROGRESS';
  ELSIF v_match.guild_a_last_progress_at IS NOT NULL AND (v_match.guild_b_last_progress_at IS NULL OR v_match.guild_a_last_progress_at < v_match.guild_b_last_progress_at) THEN v_winner := v_match.guild_b_id; v_reason := 'TIMEOUT_TIMESTAMP';
  ELSIF v_match.guild_b_last_progress_at IS NOT NULL AND (v_match.guild_a_last_progress_at IS NULL OR v_match.guild_b_last_progress_at < v_match.guild_a_last_progress_at) THEN v_winner := v_match.guild_a_id; v_reason := 'TIMEOUT_TIMESTAMP';
  ELSE v_winner := NULL; v_reason := 'DRAW'; END IF;
  UPDATE public.gvg_match_sessions SET status = 'COMPLETED', completed_at = now(), winner_guild_id = v_winner, result_reason = v_reason WHERE id = v_match.id;
  RETURN jsonb_build_object('winner_guild_id', v_winner, 'reason', v_reason, 'guild_a_progress', v_a, 'guild_b_progress', v_b);
END;
$function$
;
CREATE OR REPLACE FUNCTION public.billing_validate_special_payment()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
  -- 抽選履歴の作成をDBの境界とし、Clientを介さない呼出しにも同じ制限を適用。
  -- 例外時は既存RPCの消費・抽選・付与も同一トランザクションでROLLBACK。
  if new.gacha_id in ('CHAR_SPECIAL','SKILL_SPECIAL','EQUIP_SPECIAL')
    and (new.payment_source is null or new.payment_source not in ('diamonds','ticket')) then
    raise exception 'SPECIAL_REQUIRES_DIA_OR_TICKET' using errcode='23514';
  end if;
  return new;
end $function$
;
CREATE OR REPLACE FUNCTION public.capture_quest_raid_encounter_v1()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
declare v_area text;
begin
 if new.status is distinct from 'COMPLETED' or old.status='COMPLETED'
   or new.battle_result is distinct from 'VICTORY' or not coalesce(new.battle_resolved,false)
   or not coalesce(new.has_battle_event,false) then return new; end if;
 if not exists(select 1 from public.quest_raid_encounter_settings where singleton and enabled)
   or not exists(select 1 from public.tutorial_progress where user_id=new.user_id and step_id='COMPLETE') then return new;end if;
 select public.quest_town_key(town_id) into v_area from public.canonical_quest_master
  where version='2026-08-30' and quest_id=coalesce(new.course_id,new.quest_id) and is_production_enabled;
 if v_area is not null then
  insert into public.quest_raid_encounters(patrol_id,user_id,area_id) values(new.id,new.user_id,v_area) on conflict do nothing;
 end if;
 return new;
end $function$
;
CREATE OR REPLACE FUNCTION public.complete_patrol_instant(p_user_id uuid, p_patrol_id uuid, p_diamond_cost integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_diamonds INTEGER;
    v_patrol_exists BOOLEAN;
BEGIN
    SELECT diamonds INTO v_diamonds FROM public.users WHERE id = p_user_id;
    IF v_diamonds IS NULL OR v_diamonds < p_diamond_cost THEN
        RETURN jsonb_build_object('error', 'ダイヤが不足しています。');
    END IF;

    SELECT EXISTS(SELECT 1 FROM public.user_patrols WHERE id = p_patrol_id AND user_id = p_user_id) INTO v_patrol_exists;
    IF NOT v_patrol_exists THEN
        RETURN jsonb_build_object('error', 'クエストが存在しません。');
    END IF;

    UPDATE public.users SET diamonds = diamonds - p_diamond_cost WHERE id = p_user_id;
    DELETE FROM public.user_patrols WHERE id = p_patrol_id;

    RETURN jsonb_build_object('status', 'success');
END;
$function$
;
CREATE OR REPLACE FUNCTION public.complete_patrol_instantly(p_user_id uuid, p_patrol_id uuid, p_use_currency text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_uid uuid:=auth.uid(); v_currency text:=upper(coalesce(p_use_currency,'')); v_status text; v_free integer; v_paid integer; v_reset date; v_today date:=(now() at time zone 'Asia/Tokyo')::date; v_step text;
begin
 if v_uid is null or v_uid<>p_user_id then raise exception 'not authorized' using errcode='42501'; end if;
 select status into v_status from public.user_patrols where id=p_patrol_id and user_id=v_uid for update;
 if v_status is null then raise exception 'patrol not found' using errcode='P0002'; end if;
 if v_status<>'ONGOING' then raise exception 'patrol is not eligible for instant completion' using errcode='23514'; end if;
 if v_currency='FREE_TUTORIAL' then
  select step_id into v_step from public.tutorial_progress where user_id=v_uid for update;
  if v_step<>'FREE_INSTANT' then raise exception 'tutorial free instant completion is unavailable' using errcode='55000'; end if;
  update public.tutorial_progress set step_id='TUTORIAL_BATTLE',updated_at=now() where user_id=v_uid and step_id='FREE_INSTANT';
 elsif v_currency in ('FREE_PREOPEN','FREE') then
  select quest_free_skips_count,quest_paid_skips_count,quest_skips_reset_date into v_free,v_paid,v_reset from public.users where id=v_uid for update;
  if v_reset is distinct from v_today then v_free:=0; v_paid:=0; end if;
  if v_free>=5 then raise exception 'daily free instant completion limit reached' using errcode='23514'; end if;
  update public.users set quest_free_skips_count=v_free+1,quest_paid_skips_count=v_paid,quest_skips_reset_date=v_today where id=v_uid;
 elsif v_currency='DIAMOND' then
  select quest_free_skips_count,quest_paid_skips_count,quest_skips_reset_date into v_free,v_paid,v_reset from public.users where id=v_uid for update;
  if v_reset is distinct from v_today then v_free:=0; v_paid:=0; end if;
  if v_paid>=10 then raise exception 'daily paid instant completion limit reached' using errcode='23514'; end if;
  if (select neon_diamonds from public.users where id=v_uid)<30 then raise exception 'diamond insufficient' using errcode='23514'; end if;
  update public.users set neon_diamonds=neon_diamonds-30,quest_free_skips_count=v_free,quest_paid_skips_count=v_paid+1,quest_skips_reset_date=v_today where id=v_uid;
 else raise exception 'invalid patrol instant completion currency' using errcode='22023'; end if;
 update public.user_patrols set status='CLAIMABLE',expires_at=now() where id=p_patrol_id and user_id=v_uid;
 return jsonb_build_object('status','success','patrol_id',p_patrol_id,'currency',v_currency,'diamond_cost',case when v_currency='DIAMOND' then 30 else 0 end,'free_skips_remaining',case when v_currency in ('FREE_PREOPEN','FREE') then 4-v_free else null end,'paid_skips_remaining',case when v_currency='DIAMOND' then 9-v_paid else null end,'tutorial_step',case when v_currency='FREE_TUTORIAL' then 'TUTORIAL_BATTLE' else null end);
end $function$
;
CREATE OR REPLACE FUNCTION public.complete_patrol_preopen(p_patrol_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_user uuid:=auth.uid(); v_level integer; v_status text;
begin
  if v_user is null then raise exception 'authentication required' using errcode='42501'; end if;
  if not exists(select 1 from public.feature_operating_states where feature_key='PRE_OPEN' and state='OPEN') then
    raise exception 'pre-open speed-up is closed';
  end if;
  select level into v_level from public.users where id=v_user;
  if coalesce(v_level,1)>=8 then raise exception 'pre-open speed-up is limited to players below level 8'; end if;
  select status into v_status from public.user_patrols where id=p_patrol_id and user_id=v_user for update;
  if v_status is null then raise exception 'patrol not found' using errcode='P0002'; end if;
  if v_status<>'ONGOING' then raise exception 'patrol is not eligible for speed-up'; end if;
  update public.user_patrols set status='CLAIMABLE',expires_at=now() where id=p_patrol_id and user_id=v_user;
  return jsonb_build_object('status','success','patrol_id',p_patrol_id,'currency','FREE_PREOPEN','cash_cost',0,'diamond_cost',0);
end $function$
;
CREATE OR REPLACE FUNCTION public.complete_patrol_v2(p_user_id uuid, p_patrol_id uuid, p_cash bigint, p_xp integer, p_course_name text, p_reward_item_id text, p_reward_qty integer, p_gear_dropped boolean, p_is_victory boolean, p_battle_reward_item_id text DEFAULT NULL::text, p_battle_reward_qty integer DEFAULT 0)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_now TIMESTAMPTZ := now();
    v_exp TIMESTAMPTZ := now() + interval '24 hours';
BEGIN
    UPDATE public.user_patrols SET status = 'COMPLETED' WHERE id = p_patrol_id AND user_id = p_user_id;

    INSERT INTO public.presents (user_id, item_id, quantity, message, status, sent_at, expire_at)
    VALUES (p_user_id, 'CASH', p_cash, '見回り完了報酬 (' || p_course_name || CASE WHEN p_is_victory THEN '・バトル勝利' ELSE '' END || ')', 'UNCLAIMED', v_now, v_exp);

    IF p_reward_item_id IS NOT NULL AND p_reward_qty > 0 THEN
        INSERT INTO public.presents (user_id, item_id, quantity, message, status, sent_at, expire_at)
        VALUES (p_user_id, p_reward_item_id, p_reward_qty, '見回りドロップ報酬 (' || p_course_name || ')', 'UNCLAIMED', v_now, v_exp);
    END IF;

    IF p_gear_dropped THEN
        INSERT INTO public.presents (user_id, item_id, quantity, message, status, sent_at, expire_at)
        VALUES (p_user_id, 'WEAPON_001', 1, '見回り追加ドロップ装備 (' || p_course_name || ')', 'UNCLAIMED', v_now, v_exp);
    END IF;

    IF p_battle_reward_item_id IS NOT NULL AND p_battle_reward_qty > 0 THEN
        INSERT INTO public.presents (user_id, item_id, quantity, message, status, sent_at, expire_at)
        VALUES (p_user_id, p_battle_reward_item_id, p_battle_reward_qty, '見回りバトル勝利追加報酬 (' || p_course_name || ')', 'UNCLAIMED', v_now, v_exp);
    END IF;

    RETURN jsonb_build_object('status', 'success');
END;
$function$
;
CREATE OR REPLACE FUNCTION public.complete_tutorial_authentication(p_auth_method text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_auth_method text := upper(trim(p_auth_method));
  v_existing_method text;
  v_tutorial_step text;
  v_is_anonymous boolean := coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false);
  v_supported_identity_count integer;
  v_identity_provider text;
begin
  if v_user_id is null then raise exception 'Authentication is required'; end if;
  if v_is_anonymous then raise exception 'Verified authentication identity is required'; end if;
  if v_auth_method is null or v_auth_method not in ('EMAIL', 'GOOGLE') then raise exception 'Unsupported authentication method'; end if;

  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text, 0));
  select count(distinct identity.provider), min(identity.provider)
    into v_supported_identity_count, v_identity_provider
  from auth.identities identity
  where identity.user_id = v_user_id and identity.provider in ('email', 'google');
  if v_supported_identity_count <> 1 then raise exception 'Exactly one authentication identity is required'; end if;
  if v_identity_provider <> lower(v_auth_method) then raise exception 'Requested authentication identity is not linked'; end if;

  select methods.auth_method into v_existing_method
  from public.user_account_auth_methods methods where methods.user_id = v_user_id for update;
  select progress.step_id into v_tutorial_step
  from public.tutorial_progress progress where progress.user_id = v_user_id for update;

  if v_existing_method = v_auth_method and v_tutorial_step = 'AUTHENTICATION' then return 'AUTHENTICATION'; end if;
  if v_existing_method is not null and v_existing_method <> v_auth_method then raise exception 'A different authentication method is already linked'; end if;
  if v_tutorial_step <> 'COMPLETE' then raise exception 'Tutorial completion is required'; end if;

  insert into public.user_account_auth_methods(user_id, auth_method)
  values(v_user_id, v_auth_method)
  on conflict(user_id) do update set authenticated_at = now()
    where public.user_account_auth_methods.auth_method = excluded.auth_method;

  update public.tutorial_progress
  set step_id = 'AUTHENTICATION', authentication_pending = false, updated_at = now()
  where user_id = v_user_id;
  return 'AUTHENTICATION';
end;
$function$
;
CREATE OR REPLACE FUNCTION public.consume_pvp_point(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_points integer;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN RAISE EXCEPTION 'not authorized'; END IF;
  SELECT pvp_points INTO v_points FROM public.users WHERE id = p_user_id FOR UPDATE;
  IF v_points IS NULL THEN RAISE EXCEPTION 'user not found'; END IF;
  IF v_points < 1 THEN RAISE EXCEPTION 'insufficient pvp points'; END IF;
  UPDATE public.users SET pvp_points = pvp_points - 1,
    pvp_points_last_recovered_at = CASE WHEN pvp_points = 5 THEN now() ELSE pvp_points_last_recovered_at END
  WHERE id = p_user_id;
  RETURN jsonb_build_object('success', true);
END;
$function$
;
CREATE OR REPLACE FUNCTION public.consume_raid_attempt(p_user_id uuid, p_cost_type text, p_cost_amount integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_user public.users%ROWTYPE;
    v_today DATE := CURRENT_DATE;
    v_reset_date DATE;
BEGIN
    SELECT * INTO v_user FROM public.users WHERE id = p_user_id FOR UPDATE;
    
    IF v_user.id IS NULL THEN
        RAISE EXCEPTION 'ユーザーが見つかりません。';
    END IF;

    IF p_cost_type = 'CASH' AND v_user.cash < p_cost_amount THEN
        RAISE EXCEPTION 'Cashが不足しています。';
    END IF;

    IF p_cost_type = 'DIAMOND' AND v_user.diamonds < p_cost_amount THEN
        RAISE EXCEPTION 'ダイヤが不足しています。';
    END IF;

    IF p_cost_type = 'CASH' THEN
        UPDATE public.users SET cash = cash - p_cost_amount WHERE id = p_user_id;
    END IF;
    IF p_cost_type = 'DIAMOND' THEN
        UPDATE public.users SET diamonds = diamonds - p_cost_amount WHERE id = p_user_id;
    END IF;

    v_reset_date := v_user.raid_attempts_reset_at::DATE;
    
    IF v_reset_date IS DISTINCT FROM v_today THEN
        UPDATE public.users SET raid_attempts_today = 1, raid_attempts_reset_at = now() WHERE id = p_user_id;
    ELSE
        UPDATE public.users SET raid_attempts_today = COALESCE(raid_attempts_today, 0) + 1 WHERE id = p_user_id;
    END IF;

    RETURN jsonb_build_object('success', true);
END;
$function$
;
CREATE OR REPLACE FUNCTION public.consume_tutorial_character_daily_free_gacha()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_today date := (clock_timestamp() at time zone 'Asia/Tokyo')::date;
  v_consumed integer := 0;
begin
  if new.gacha_id <> 'CHAR_NORMAL'
    or new.payment_source <> 'free'
    or new.pull_count <> 10
    or not exists (
      select 1
      from public.tutorial_progress progress
      where progress.user_id = new.user_id
        and progress.step_id = 'FREE_GACHA'
    ) then
    return new;
  end if;

  if exists (
    select 1
    from public.gacha_execution_history history
    where history.user_id = new.user_id
      and history.request_id = new.request_id
  ) then
    return new;
  end if;

  insert into public.user_daily_gacha_claims (
    user_id, gacha_type, last_claimed_date, updated_at
  ) values (
    new.user_id, 'CHARACTER', v_today, clock_timestamp()
  )
  on conflict (user_id, gacha_type) do update
  set last_claimed_date = excluded.last_claimed_date,
      updated_at = excluded.updated_at
  where public.user_daily_gacha_claims.last_claimed_date < excluded.last_claimed_date;

  get diagnostics v_consumed = row_count;
  if v_consumed <> 1 then
    raise exception 'daily free gacha already claimed' using errcode = '23505';
  end if;
  return new;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.consume_vitality_for_gvg(p_user_id uuid, p_cost integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_vitality INTEGER;
BEGIN
    SELECT vitality INTO v_vitality FROM public.users WHERE id = p_user_id FOR UPDATE;

    IF v_vitality < p_cost THEN
        RAISE EXCEPTION '行動力が不足しています。';
    END IF;

    UPDATE public.users
    SET vitality = vitality - p_cost
    WHERE id = p_user_id;

    RETURN jsonb_build_object('success', true, 'consumed', p_cost);
END;
$function$
;
CREATE OR REPLACE FUNCTION public.converge_ranking_lifecycle_safety(p_at timestamp with time zone DEFAULT clock_timestamp())
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_orphan record;
  v_active public.ranking_seasons%rowtype;
  v_previous public.ranking_seasons%rowtype;
  v_orphans integer := 0;
  v_cutovers integer := 0;
begin
  perform pg_advisory_xact_lock(hashtextextended('ranking-lifecycle-safety-convergence',0));

  -- A non-Preview clean chain may have run 00227 and then the schema-only path
  -- of 00228. Reconcile only the immediately superseded row left by that pair.
  for v_orphan in
    select distinct on (closed.ranking_type) closed.*
    from public.ranking_seasons closed
    join public.ranking_seasons active
      on active.ranking_type=closed.ranking_type and active.status='ACTIVE'
     and active.starts_at<closed.ends_at+interval '1 second'
     and active.ends_at>closed.ends_at
     and abs(extract(epoch from (active.created_at-closed.updated_at)))<300
    where closed.ranking_type='PVP' and closed.status='CLOSED'
      and closed.ends_at<=p_at
      and not exists(select 1 from public.ranking_season_transition_audits audit where audit.season_id=closed.id)
      and not exists(select 1 from public.ranking_pvp_season_snapshots snapshot where snapshot.season_id=closed.id)
      and not exists(select 1 from public.ranking_raid_personal_season_snapshots snapshot where snapshot.season_id=closed.id)
      and not exists(select 1 from public.ranking_raid_guild_season_snapshots snapshot where snapshot.season_id=closed.id)
      and not exists(select 1 from public.ranking_season_reward_grants grant_row where grant_row.season_id=closed.id)
    order by closed.ranking_type,closed.ends_at desc
  loop
    perform public.assert_pvp_boundary_replay_continuity(v_orphan.id,p_at);
    perform public.finalize_pvp_season_rewards(v_orphan.id);
    perform public.reconcile_pvp_after_season_boundary(v_orphan.id,p_at);
    v_orphans:=v_orphans+1;
  end loop;

  -- 廃止済みRaid Season境界は変更しない。
  return jsonb_build_object('orphanSeasons',v_orphans,'raidCutovers',v_cutovers);
end;
$function$
;
CREATE OR REPLACE FUNCTION public.create_battle_replay_pending(p_battle_mode text, p_tactic_id text, p_random_seed bigint, p_player_snapshot jsonb, p_enemy_snapshot jsonb, p_source_reference_id uuid DEFAULT NULL::uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_user_id UUID := auth.uid(); v_id UUID; v_server_seed BIGINT;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Authentication is required'; END IF;
  IF p_battle_mode NOT IN ('QUEST', 'PVP', 'RAID', 'GVG') THEN RAISE EXCEPTION 'Invalid battle mode'; END IF;
  IF p_tactic_id NOT IN ('ATTACK_PRIORITY', 'HEAL_PRIORITY', 'SKILL_PRIORITY', 'BALANCED', 'WEAKNESS_FOCUS') THEN RAISE EXCEPTION 'Invalid tactic'; END IF;
  IF jsonb_typeof(p_player_snapshot) <> 'array' OR jsonb_array_length(p_player_snapshot) NOT BETWEEN 1 AND 6 THEN RAISE EXCEPTION 'Invalid player roster'; END IF;
  IF jsonb_typeof(p_enemy_snapshot) <> 'array' OR jsonb_array_length(p_enemy_snapshot) NOT BETWEEN 1 AND 6 THEN RAISE EXCEPTION 'Invalid enemy roster'; END IF;
  v_server_seed := floor(random() * 2147483646)::BIGINT + 1;
  INSERT INTO public.battle_replay_sessions (
    requester_user_id, battle_mode, source_reference_id, tactic_id, random_seed, player_snapshot, enemy_snapshot
  ) VALUES (
    v_user_id, p_battle_mode, p_source_reference_id, p_tactic_id, v_server_seed, p_player_snapshot, p_enemy_snapshot
  ) RETURNING id INTO v_id;
  RETURN v_id;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.create_bbs_post(p_thread_id uuid, p_content text)
 RETURNS bbs_posts
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_post public.bbs_posts;
  v_username TEXT;
  v_avatar_url TEXT;
BEGIN
  IF auth.uid() IS NULL OR p_thread_id IS NULL OR p_content IS NULL OR char_length(trim(p_content)) NOT BETWEEN 1 AND 200 OR NOT EXISTS (SELECT 1 FROM public.bbs_threads WHERE id = p_thread_id) THEN
    RAISE EXCEPTION 'Invalid BBS post';
  END IF;
  SELECT username, avatar_url INTO v_username, v_avatar_url FROM public.users WHERE id = auth.uid();
  INSERT INTO public.bbs_posts (thread_id, user_id, author_name, author_avatar_url, content)
  VALUES (p_thread_id, auth.uid(), COALESCE(v_username, 'Player'), v_avatar_url, trim(p_content))
  RETURNING * INTO v_post;
  UPDATE public.bbs_threads SET updated_at = now() WHERE id = p_thread_id;
  RETURN v_post;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.current_ranking_season_id(p_type text, p_at timestamp with time zone DEFAULT clock_timestamp())
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select season.id
  from public.ranking_seasons season
  where season.ranking_type = upper(p_type)
    and season.status = 'ACTIVE'
    and p_at >= season.starts_at and p_at < season.ends_at
  order by season.starts_at desc
  limit 1
$function$
;
CREATE OR REPLACE FUNCTION public._exchange_pity_reward_before_special_release(p_user_id uuid, p_reward_type text, p_reward_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_points integer;
  v_exists boolean;
  v_awaken integer;
  v_character_row_id uuid;
  v_progress jsonb;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  IF p_reward_type NOT IN ('CHARACTER','SKILL','EQUIPMENT') OR p_reward_id IS NULL OR p_reward_id = '' THEN
    RAISE EXCEPTION 'invalid pity reward';
  END IF;

  SELECT current_points INTO v_points
  FROM public.user_gacha_pity_points
  WHERE user_id = p_user_id AND pity_master_id = 'pity_special_common'
  FOR UPDATE;
  IF COALESCE(v_points, 0) < 100 THEN
    RAISE EXCEPTION 'insufficient pity points';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.gacha_items_master
    WHERE item_id = p_reward_id
      AND gacha_id LIKE CASE p_reward_type WHEN 'CHARACTER' THEN 'CHAR_%' WHEN 'SKILL' THEN 'SKILL_%' ELSE 'EQUIP_%' END
  ) INTO v_exists;
  IF NOT v_exists THEN RAISE EXCEPTION 'invalid pity reward'; END IF;

  UPDATE public.user_gacha_pity_points
  SET current_points = v_points - 100, updated_at = now()
  WHERE user_id = p_user_id AND pity_master_id = 'pity_special_common';

  IF p_reward_type = 'CHARACTER' THEN
    SELECT id, awakening_level INTO v_character_row_id, v_awaken FROM public.user_characters
    WHERE user_id = p_user_id AND character_id = p_reward_id ORDER BY id LIMIT 1 FOR UPDATE;
    IF v_character_row_id IS NULL THEN
      INSERT INTO public.user_characters (user_id, character_id, level, awakening_level, awakening_progress) VALUES (p_user_id, p_reward_id, 1, 0, 0);
      RETURN jsonb_build_object('type', p_reward_type, 'item_id', p_reward_id, 'outcome', 'new');
    ELSIF v_awaken >= 5 THEN
      INSERT INTO public.user_items (user_id, item_id, quantity) VALUES (p_user_id, 'AWAKENING_BOOK', 1)
      ON CONFLICT (user_id, item_id) DO UPDATE SET quantity = public.user_items.quantity + 1, updated_at = now();
      RETURN jsonb_build_object('type', p_reward_type, 'item_id', p_reward_id, 'outcome', 'converted', 'converted_item_id', 'AWAKENING_BOOK', 'converted_quantity', 1);
    ELSE
      v_progress := public.apply_character_awakening_equivalent(p_user_id, v_character_row_id, 1);
      RETURN jsonb_build_object('type', p_reward_type, 'item_id', p_reward_id,
        'outcome', v_progress->>'outcome', 'awakening_progress_added', 1,
        'awakening_level', (v_progress->>'awakening_level')::integer,
        'awakening_progress', (v_progress->>'awakening_progress')::integer,
        'awakening_required', (v_progress->>'awakening_required')::integer);
    END IF;
  ELSIF p_reward_type = 'SKILL' THEN
    SELECT plus_val INTO v_awaken FROM public.user_skills WHERE user_id = p_user_id AND skill_card_id = p_reward_id ORDER BY id LIMIT 1 FOR UPDATE;
    IF v_awaken IS NULL THEN
      INSERT INTO public.user_skills (user_id, skill_card_id, plus_val) VALUES (p_user_id, p_reward_id, 0);
      RETURN jsonb_build_object('type', p_reward_type, 'item_id', p_reward_id, 'outcome', 'new');
    ELSIF v_awaken >= 10 THEN
      INSERT INTO public.user_items (user_id, item_id, quantity) VALUES (p_user_id, 'SKILL_MANUAL', 2)
      ON CONFLICT (user_id, item_id) DO UPDATE SET quantity = public.user_items.quantity + 2;
      RETURN jsonb_build_object('type', p_reward_type, 'item_id', p_reward_id, 'outcome', 'converted');
    ELSE
      UPDATE public.user_skills SET plus_val = v_awaken + 1 WHERE user_id = p_user_id AND skill_card_id = p_reward_id;
      RETURN jsonb_build_object('type', p_reward_type, 'item_id', p_reward_id, 'outcome', 'limit_break');
    END IF;
  ELSE
    INSERT INTO public.user_equipments (user_id, equipment_id, level, plus_val, random_options) VALUES (p_user_id, p_reward_id, 1, 0, '[]'::jsonb);
    RETURN jsonb_build_object('type', p_reward_type, 'item_id', p_reward_id, 'outcome', 'new');
  END IF;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.get_quest_raid_encounters_v1()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
begin
 if auth.uid() is null then raise exception 'authentication required' using errcode='42501';end if;
 return coalesce((select jsonb_agg(public.quest_raid_encounter_projection_v1(patrol_id) order by created_at) from public.quest_raid_encounters
 where user_id=auth.uid() and status<>'NO_ENCOUNTER' and (acknowledged_at is null or exists(select 1 from public.raid_rooms r join public.raid_bosses b on b.id=r.raid_boss_instance_id where r.id=room_id and b.status='ACTIVE' and b.current_hp>0 and b.expires_at>now()))),'[]'::jsonb);
end $function$
;
CREATE OR REPLACE FUNCTION public.acknowledge_quest_raid_encounter_v1(p_patrol_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
begin
 if auth.uid() is null then raise exception 'authentication required' using errcode='42501';end if;
 update public.quest_raid_encounters set acknowledged_at=coalesce(acknowledged_at,now()) where patrol_id=p_patrol_id and user_id=auth.uid() and status='CREATED';
 return found;
end $function$
;
CREATE OR REPLACE FUNCTION public._special_gacha_is_exclusive(p_type text, p_id text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 select case p_type when 'SKILL' then coalesce((select exclusive_character_id is not null from public.canonical_skill_master where version='2026-08-21' and skill_id=p_id),false)
 when 'EQUIPMENT' then coalesce((select exclusive_character_id is not null from public.canonical_equipment_master where version='2026-08-21' and equipment_id=p_id),false) else false end
$function$
;
CREATE OR REPLACE FUNCTION public.draw_gacha_item(p_gacha_id text, p_rarity text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare exclusive_group boolean; item text;
begin
 if p_gacha_id not in ('CHAR_JUSTICE_EVIL_SPECIAL','CHAR_ORDER_CHAOS_SPECIAL','SKILL_SPECIAL','EQUIP_SPECIAL') then
  return public._draw_gacha_item_before_special_release(p_gacha_id,p_rarity);
 end if;
 select is_exclusive into exclusive_group from public.special_gacha_pool_groups
 where gacha_id=p_gacha_id and rarity=p_rarity
 order by -ln(greatest(random(),0.000000000001))/weight limit 1;
 if not found then raise exception 'SPECIAL_POOL_GROUP_MISSING'; end if;
 select item_id into item from public.gacha_items_master p
 where p.gacha_id=p_gacha_id and p.rarity=p_rarity
 and public._special_gacha_is_exclusive(p.item_type,p.item_id)=exclusive_group
 order by random() limit 1;
 if item is null then raise exception 'SPECIAL_POOL_EMPTY'; end if;
 return item;
end $function$
;
CREATE OR REPLACE FUNCTION public.exchange_special_gacha_reward(p_reward_type text, p_reward_id text, p_request_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin raise exception 'GACHA_RELOAD_REQUIRED'; end $function$
;
CREATE OR REPLACE FUNCTION public.get_special_gacha_catalog()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 with pool as (
  select p.gacha_id,p.item_type,p.item_id,p.rarity,
   public._special_gacha_is_exclusive(p.item_type,p.item_id) is_exclusive,
   coalesce(c.display_name,s.display_name,e.display_name,p.item_id) name
  from public.gacha_items_master p
  left join public.canonical_character_master c on p.item_type='CHARACTER' and c.character_id=p.item_id and c.version='2026-08-21'
  left join public.canonical_skill_master s on p.item_type='SKILL' and s.version='2026-08-21' and s.skill_id=p.item_id
  left join public.canonical_equipment_master e on p.item_type='EQUIPMENT' and e.version='2026-08-21' and e.equipment_id=p.item_id
  where p.gacha_id in ('CHAR_JUSTICE_EVIL_SPECIAL','CHAR_ORDER_CHAOS_SPECIAL','SKILL_SPECIAL','EQUIP_SPECIAL')
 ), rates as (
  select p.*,100.0 * r.weight / (select sum(weight) from public.gacha_rarity_rates where gacha_id=p.gacha_id)
   * g.weight / (select sum(weight) from public.special_gacha_pool_groups where gacha_id=p.gacha_id and rarity=p.rarity)
   / count(*) over(partition by p.gacha_id,p.rarity,p.is_exclusive) probability
  from pool p join public.gacha_rarity_rates r using(gacha_id,rarity)
  join public.special_gacha_pool_groups g using(gacha_id,rarity,is_exclusive)
 ) select jsonb_build_object(
 'available',coalesce((select state='OPEN' from public.feature_operating_states where feature_key='SPECIAL_GACHA'),false),
 'pity_points',coalesce((select current_points from public.user_gacha_pity_points where user_id=auth.uid() and pity_master_id='pity_special_common'),0),
 'pity_cost',100,
 'gachas',(select jsonb_agg(jsonb_build_object('id',m.id,'name',m.name,'cost_diamond',m.cost_diamond,
 'items',(select jsonb_agg(to_jsonb(r) order by r.rarity,r.item_id) from rates r where r.gacha_id=m.id)) order by m.id)
 from public.gacha_masters m where m.id in ('CHAR_JUSTICE_EVIL_SPECIAL','CHAR_ORDER_CHAOS_SPECIAL','SKILL_SPECIAL','EQUIP_SPECIAL')))
$function$
;
