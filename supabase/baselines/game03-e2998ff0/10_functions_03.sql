SET check_function_bodies = false;
SET search_path = public, extensions, pg_catalog;
CREATE OR REPLACE FUNCTION public.finalize_raid_season_rewards(p_season_id uuid)
 RETURNS integer
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ select 0 $function$
;
CREATE OR REPLACE FUNCTION public.find_gvg_match_opponent(p_session_key text, p_guild_id uuid)
 RETURNS TABLE(guild_id uuid, rating integer, total_power bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_rating INTEGER; v_power BIGINT;
BEGIN
  SELECT COALESCE(rating_row.rating, 1000) INTO v_rating
  FROM public.guilds guild LEFT JOIN public.gvg_guild_ratings rating_row ON rating_row.guild_id = guild.id
  WHERE guild.id = p_guild_id;
  SELECT COALESCE(SUM(power.total_power), 0) INTO v_power
  FROM public.guild_members member LEFT JOIN public.user_power_rankings power ON power.user_id = member.user_id
  WHERE member.guild_id = p_guild_id;

  RETURN QUERY
  WITH active_guilds AS (
    SELECT session.guild_a_id AS id FROM public.gvg_match_sessions session
    WHERE session.session_key = p_session_key AND session.status IN ('MATCHING', 'CONFIRMED', 'ACTIVE')
    UNION
    SELECT session.guild_b_id AS id FROM public.gvg_match_sessions session
    WHERE session.session_key = p_session_key AND session.status IN ('MATCHING', 'CONFIRMED', 'ACTIVE')
  ), candidates AS (
    SELECT guild.id,
      COALESCE(rating_row.rating, 1000) AS candidate_rating,
      COALESCE(SUM(power.total_power), 0)::BIGINT AS candidate_power
    FROM public.guilds guild
    JOIN public.guild_members member ON member.guild_id = guild.id
    LEFT JOIN public.gvg_guild_ratings rating_row ON rating_row.guild_id = guild.id
    LEFT JOIN public.user_power_rankings power ON power.user_id = member.user_id
    WHERE guild.id <> p_guild_id
      AND NOT EXISTS (SELECT 1 FROM active_guilds active WHERE active.id = guild.id)
    GROUP BY guild.id, rating_row.rating
  )
  SELECT candidates.id, candidates.candidate_rating, candidates.candidate_power
  FROM candidates
  ORDER BY
    ABS(candidates.candidate_rating - v_rating),
    ABS(candidates.candidate_power - v_power)::NUMERIC / GREATEST(1, v_power),
    candidates.id
  LIMIT 1;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.funnel_mission_trigger_type(p_milestone text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
 select case p_milestone
  when 'first_gacha' then 'FUNNEL_FIRST_GACHA' when 'first_growth' then 'FUNNEL_FIRST_GROWTH'
  when 'first_battle' then 'FUNNEL_FIRST_BATTLE' when 'first_pvp' then 'FUNNEL_FIRST_PVP'
  when 'first_raid' then 'FUNNEL_FIRST_RAID' when 'guild_detail_view' then 'FUNNEL_GUILD_VIEW'
  when 'guild_join_applied' then 'FUNNEL_GUILD_JOIN' when 'guild_joined' then 'FUNNEL_GUILD_JOIN'
  when 'guild_activation' then 'FUNNEL_GUILD_ACTIVATION' when 'second_raid' then 'FUNNEL_SECOND_RAID'
 end
$function$
;
CREATE OR REPLACE FUNCTION public.generate_canonical_quest_encounter_snapshot(p_user_id uuid, p_quest_id text, p_allow_repeat_reroll boolean DEFAULT true)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_q record; v_payload jsonb; v_base jsonb; v_area jsonb; v_growth jsonb;
  v_entry record; v_members jsonb:='[]'; v_used text[]:='{}'; v_rarity text;
  v_count integer; v_slot integer:=0; v_iteration integer; v_sr integer;
  v_stats jsonb; v_skills jsonb; v_signature text; v_previous text;
begin
 select * into v_q from public.canonical_quest_master where version='2026-08-30' and quest_id=p_quest_id and is_production_enabled;
 if not found then raise exception 'Canonical Quest is unavailable' using errcode='P0002'; end if;
 select payload into v_payload from public.canonical_master_freeze_versions where domain='QUEST_ENEMY_POOL' and version='2026-08-30' and is_production_enabled;
 v_base:=v_payload#>array['contract','baseStats',v_q.difficulty]; v_area:=v_payload#>array['areaModifiers',upper(v_q.town_id)];
 select encounter_party_signature into v_previous from public.user_patrols where user_id=p_user_id and course_id=p_quest_id and encounter_party_signature is not null order by started_at desc limit 1;
 v_sr:=case when v_q.difficulty='NORMAL' then 1+floor(random()*2)::integer when v_q.difficulty='HARD' then 2+floor(random()*2)::integer else 0 end;
 foreach v_rarity in array array['N','R','SR'] loop
  v_count:=case when v_q.difficulty='EASY' and v_rarity='N' then 2 when v_q.difficulty='EASY' and v_rarity='R' then 1 when v_q.difficulty='NORMAL' and v_rarity='N' then 2 when v_q.difficulty='NORMAL' and v_rarity='R' then 5-2-v_sr when v_q.difficulty='NORMAL' and v_rarity='SR' then v_sr when v_q.difficulty='HARD' and v_rarity='R' then 5-v_sr when v_q.difficulty='HARD' and v_rarity='SR' then v_sr else 0 end;
  for v_iteration in 1..v_count loop
   v_slot:=v_slot+1;
   select * into v_entry from public.canonical_quest_enemy_pool_entries e where e.version='2026-08-30' and e.pool_key=v_q.enemy_pool_key and e.rarity=v_rarity and e.character_id<>all(v_used) order by -ln(greatest(random(),0.000000000001))/e.weight limit 1;
   if not found then raise exception 'Canonical enemy pool cannot satisfy unique party'; end if;
   v_used:=array_append(v_used,v_entry.character_id); v_growth:=v_payload#>array['growthModifiers',v_entry.growth_pattern];
   v_stats:=jsonb_build_object('hp',round((v_base->>'hp')::numeric*(v_area->>'hp')::numeric*(v_growth->>'hp')::numeric),'atk',round((v_base->>'atk')::numeric*(v_area->>'atk')::numeric*(v_growth->>'atk')::numeric),'def',round((v_base->>'def')::numeric*(v_area->>'def')::numeric*(v_growth->>'def')::numeric),'spd',round(((v_base->>'spdMin')::numeric+random()*((v_base->>'spdMax')::numeric-(v_base->>'spdMin')::numeric))*(v_area->>'spd')::numeric*(v_growth->>'spd')::numeric),'luk',0);
   select coalesce(jsonb_agg(jsonb_build_object('id',s.skill_id,'name',s.display_name,'activationType',s.activation_type,'cooldown',s.cooldown,'availableFromRound',s.available_from_round,'target',s.target,'effects',s.effects,'exclusiveCharacterId',s.exclusive_character_id) order by x.ordinality),'[]') into v_skills from jsonb_array_elements_text(v_entry.skill_loadout) with ordinality x(skill_id,ordinality) join public.canonical_skill_master s on s.version='2026-08-21' and s.skill_id=x.skill_id;
   v_members:=v_members||jsonb_build_array(jsonb_build_object('id','enemy_'||p_quest_id||'_'||v_slot,'characterId',v_entry.character_id,'name',coalesce((select display_name from public.canonical_character_master where version='2026-08-21' and character_id=v_entry.character_id),v_entry.character_id),'team','ENEMY','alignment',coalesce((select attribute from public.canonical_character_master where version='2026-08-21' and character_id=v_entry.character_id),'NEUTRAL'),'level',case v_q.difficulty when 'EASY' then 5 when 'NORMAL' then 12 else 20 end,'awakeningLevel',0,'rarity',v_entry.rarity,'stats',v_stats,'equipment','[]'::jsonb,'equippedSkillRefs',v_entry.skill_loadout,'skills',v_skills));
  end loop;
 end loop;
 select string_agg(value->>'characterId','|' order by value->>'characterId') into v_signature from jsonb_array_elements(v_members);
 if p_allow_repeat_reroll and v_previous is not null and v_signature=v_previous then return public.generate_canonical_quest_encounter_snapshot(p_user_id,p_quest_id,false); end if;
 return jsonb_build_object('members',v_members,'partySignature',v_signature,'enemyTactic','BALANCED');
end $function$
;
CREATE OR REPLACE FUNCTION public.generate_current_user_invite_code()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
 if auth.uid() is null then raise exception 'authentication required' using errcode='42501'; end if;
 return public.generate_user_gift_code(auth.uid());
end $function$
;
CREATE OR REPLACE FUNCTION public.generate_user_gift_code(p_user_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_code text;
  v_exists boolean := true;
  v_chars constant text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  i integer;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'not authorized' USING errcode = '42501';
  END IF;

  SELECT gift_code INTO v_code
  FROM public.users
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'player profile is not initialized' USING errcode = 'P0002';
  END IF;
  IF v_code IS NOT NULL AND v_code <> '' THEN
    RETURN v_code;
  END IF;

  WHILE v_exists LOOP
    v_code := '';
    FOR i IN 1..8 LOOP
      v_code := v_code || substr(v_chars, floor(random() * length(v_chars) + 1)::integer, 1);
    END LOOP;
    SELECT EXISTS (SELECT 1 FROM public.users WHERE gift_code = v_code) INTO v_exists;
  END LOOP;

  UPDATE public.users SET gift_code = v_code WHERE id = p_user_id;
  RETURN v_code;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.get_active_mission_events()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_uid uuid:=auth.uid();
  v_result jsonb;
begin
  if v_uid is null then raise exception 'authentication required' using errcode='42501'; end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'event_id',event.id,'display_name',event.display_name,'start_at',event.start_at,
    'progress_end_at',event.progress_end_at,'claim_deadline',event.claim_deadline,
    'banner_image_url',event.banner_image_url,'banner_title',event.banner_title,
    'banner_subtitle',event.banner_subtitle,'banner_cta_label',event.banner_cta_label,
    'progress_open',clock_timestamp()>=event.start_at and clock_timestamp()<event.progress_end_at,
    'is_progress_active',clock_timestamp()>=event.start_at and clock_timestamp()<event.progress_end_at,
    'has_claimable_rewards',exists(
      select 1 from public.user_missions um join public.missions m on m.id=um.mission_id
      where um.user_id=v_uid and m.event_id=event.id and m.is_enabled and um.status='CLEAR'
        and (event.claim_deadline is null or clock_timestamp()<event.claim_deadline)
    )
  ) order by event.start_at),'[]'::jsonb) into v_result
  from public.mission_events event
  where event.is_enabled and (event.claim_deadline is null or clock_timestamp()<event.claim_deadline) and (
    (clock_timestamp()>=event.start_at and clock_timestamp()<event.progress_end_at)
    or exists(
      select 1 from public.user_missions um join public.missions m on m.id=um.mission_id
      where um.user_id=v_uid and m.event_id=event.id and um.status in ('CLEAR','CLAIMED')
    )
  );
  return v_result;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.get_active_ranking_seasons()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode='42501'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('season_id',season.id,'ranking_type',season.ranking_type,'starts_at',season.starts_at,'ends_at',season.ends_at,'status',season.status) order by season.ranking_type)
    from public.ranking_seasons season where season.ranking_type<>'RAID' and season.status='ACTIVE' and clock_timestamp()>=season.starts_at and clock_timestamp()<season.ends_at),'[]'::jsonb);
end;
$function$
;
CREATE OR REPLACE FUNCTION public.get_bbs_unread_counts()
 RETURNS TABLE(thread_id uuid, unread_count bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH current_player AS (
    SELECT id, created_at
    FROM public.users
    WHERE id = auth.uid()
  ), activities AS (
    SELECT t.id AS thread_id, t.created_at AS activity_at
    FROM public.bbs_threads t
    WHERE t.user_id <> auth.uid()
    UNION ALL
    SELECT p.thread_id, p.created_at
    FROM public.bbs_posts p
    WHERE p.user_id <> auth.uid()
  )
  SELECT t.id AS thread_id, count(a.activity_at)::bigint AS unread_count
  FROM public.bbs_threads t
  CROSS JOIN current_player cp
  LEFT JOIN public.bbs_read_states rs
    ON rs.user_id = cp.id AND rs.thread_id = t.id
  JOIN activities a
    ON a.thread_id = t.id
   AND a.activity_at > COALESCE(rs.last_read_at, cp.created_at)
  GROUP BY t.id
  HAVING count(a.activity_at) > 0
  ORDER BY t.id;
$function$
;
CREATE OR REPLACE FUNCTION public.get_canonical_quest_progression()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 select coalesce(jsonb_agg(jsonb_build_object('quest_id',m.quest_id,'unlock_condition',m.unlock_condition,'is_unlocked',public.canonical_quest_is_unlocked(auth.uid(),m.quest_id),'is_first_cleared',exists(select 1 from public.user_quest_first_clears c where c.user_id=auth.uid() and c.quest_id=m.quest_id),'enemy_tactic','BALANCED','enemy_member_count',case when m.difficulty='EASY' then 3 else 5 end,'enemy_members','[]'::jsonb,'recommended_level',case m.difficulty when 'EASY' then 5 when 'NORMAL' then 12 else 20 end,'enemy_attributes','[]'::jsonb) order by m.display_order),'[]'::jsonb) from public.canonical_quest_master m where m.version='2026-08-30' and m.is_production_enabled
$function$
;
CREATE OR REPLACE FUNCTION public.get_chat_unread_counts()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_guild_id uuid;
  v_global_target uuid := '00000000-0000-0000-0000-000000000000'::uuid;
  v_global_read_at timestamptz;
  v_guild_read_at timestamptz;
  v_global_count integer := 0;
  v_guild_count integer := 0;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  INSERT INTO public.chat_read_states (user_id, target_type, target_id, last_read_at)
  VALUES (v_user_id, 'GLOBAL', v_global_target, clock_timestamp())
  ON CONFLICT (user_id, target_type, target_id) DO NOTHING;

  SELECT last_read_at INTO v_global_read_at
  FROM public.chat_read_states
  WHERE user_id = v_user_id
    AND target_type = 'GLOBAL'
    AND target_id = v_global_target;

  SELECT count(*)::integer INTO v_global_count
  FROM public.board_posts
  WHERE target_type = 'GLOBAL'
    AND created_at > v_global_read_at
    AND COALESCE(user_id, author_id) IS DISTINCT FROM v_user_id;

  SELECT guild_id INTO v_guild_id
  FROM public.guild_members
  WHERE user_id = v_user_id;

  IF v_guild_id IS NOT NULL THEN
    INSERT INTO public.chat_read_states (user_id, target_type, target_id, last_read_at)
    VALUES (v_user_id, 'GUILD', v_guild_id, clock_timestamp())
    ON CONFLICT (user_id, target_type, target_id) DO NOTHING;

    SELECT last_read_at INTO v_guild_read_at
    FROM public.chat_read_states
    WHERE user_id = v_user_id
      AND target_type = 'GUILD'
      AND target_id = v_guild_id;

    SELECT count(*)::integer INTO v_guild_count
    FROM public.board_posts
    WHERE target_type = 'GUILD'
      AND target_id = v_guild_id
      AND created_at > v_guild_read_at
      AND COALESCE(user_id, author_id) IS DISTINCT FROM v_user_id;
  END IF;

  RETURN jsonb_build_object('GLOBAL', v_global_count, 'GUILD', v_guild_count);
END;
$function$
;
CREATE OR REPLACE FUNCTION public.get_current_main_formation()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_user_id uuid:=auth.uid();
begin
  if v_user_id is null then raise exception 'authentication required' using errcode='42501'; end if;
  return jsonb_build_object(
    'characters',coalesce((select jsonb_agg(jsonb_build_object(
      'slot',formation.slot,'character_id',owned.character_id,'level',owned.level,
      'awakening_level',coalesce(owned.awakening_level,0),'character_power',public.calculate_user_character_power(v_user_id,owned.id)
    ) order by formation.slot)
    from public.user_main_formations formation join public.user_characters owned on owned.id=formation.user_character_id
    where formation.user_id=v_user_id),'[]'::jsonb),
    'total_power',coalesce((select total_power from public.user_power_rankings where user_id=v_user_id),0)
  );
end;
$function$
;
CREATE OR REPLACE FUNCTION public.get_current_onboarding_state()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_is_anonymous boolean;
  v_has_profile boolean;
  v_tutorial_step text;
  v_authentication_pending boolean := false;
  v_auth_method text;
  v_identity_provider text;
  v_supported_identity_count integer;
  v_identity_integrity_valid boolean;
  v_is_legacy_authenticated boolean;
begin
  if v_user_id is null then raise exception 'Authentication is required'; end if;
  v_is_anonymous := coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false);
  select exists(select 1 from public.users where id = v_user_id) into v_has_profile;
  select progress.step_id, progress.authentication_pending
    into v_tutorial_step, v_authentication_pending
  from public.tutorial_progress progress where progress.user_id = v_user_id;
  select methods.auth_method into v_auth_method
  from public.user_account_auth_methods methods where methods.user_id = v_user_id;
  select count(distinct identity.provider), min(identity.provider)
    into v_supported_identity_count, v_identity_provider
  from auth.identities identity
  where identity.user_id = v_user_id and identity.provider in ('google', 'email');

  v_identity_integrity_valid :=
    (v_is_anonymous and v_supported_identity_count = 0 and v_auth_method is null)
    or (not v_is_anonymous and v_supported_identity_count = 1
      and (v_auth_method is null or lower(v_auth_method) = v_identity_provider));
  v_is_legacy_authenticated := not v_is_anonymous and v_identity_integrity_valid and v_has_profile
    and v_auth_method is null and (v_tutorial_step is null or v_tutorial_step = 'AUTHENTICATION');

  return jsonb_build_object(
    'user_id', v_user_id,
    'is_anonymous', v_is_anonymous,
    'has_profile', v_has_profile,
    'tutorial_step', v_tutorial_step,
    'authentication_pending', coalesce(v_authentication_pending, false),
    'auth_method', coalesce(v_auth_method, case v_identity_provider when 'google' then 'GOOGLE' when 'email' then 'EMAIL' else null end),
    'is_legacy_authenticated', v_is_legacy_authenticated,
    'identity_integrity_valid', v_identity_integrity_valid,
    'gameplay_authorized', v_has_profile and v_identity_integrity_valid and (
      (v_is_anonymous and v_tutorial_step = 'COMPLETE' and coalesce(v_authentication_pending, false))
      or (not v_is_anonymous and v_auth_method is not null and v_tutorial_step = 'AUTHENTICATION')
      or v_is_legacy_authenticated
    )
  );
end;
$function$
;
CREATE OR REPLACE FUNCTION public.get_my_power_snapshot()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_user_id uuid:=auth.uid(); v_power bigint;
begin
  if v_user_id is null then raise exception 'authentication required' using errcode='42501'; end if;
  v_power:=public.refresh_user_power_projection(v_user_id);
  return jsonb_build_object('user_id',v_user_id,'total_power',v_power,'calculated_at',clock_timestamp());
end;
$function$
;
CREATE OR REPLACE FUNCTION public.monthly_power_live_rankings_v1(p_type text)
 RETURNS TABLE(entity_id uuid, score bigint, rank_position integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 select r.user_id,r.total_power::bigint,dense_rank() over(order by r.total_power desc,r.updated_at asc)::integer
 from public.user_power_rankings r join public.users u on u.id=r.user_id where p_type='POWER'
 union all
 select g.guild_id,g.score,dense_rank() over(order by g.score desc,g.guild_id)::integer from (
 select m.guild_id,sum(p.total_power)::bigint score
 from public.guild_members m join public.guilds guild on guild.id=m.guild_id
 join public.users u on u.id=m.user_id join public.user_power_rankings p on p.user_id=m.user_id
 where p_type='GUILD_POWER' group by m.guild_id) g
$function$
;
CREATE OR REPLACE FUNCTION public.reject_monthly_power_snapshot_mutation()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
 if tg_op<>'INSERT' or exists(select 1 from public.monthly_power_season_runs r where r.season_id=new.season_id and r.snapshotted_at is not null) then
 raise exception 'Monthly Season snapshot is immutable' using errcode='55000';end if;
 return new;
end $function$
;
CREATE OR REPLACE FUNCTION public.snapshot_monthly_power_season_v1(p_season_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare s public.ranking_seasons%rowtype;r public.monthly_power_season_runs%rowtype;
begin
 select * into strict s from public.ranking_seasons where id=p_season_id for update;
 select * into strict r from public.monthly_power_season_runs where season_id=s.id for update;
 if s.ranking_type not in ('POWER','GUILD_POWER') then raise exception 'Unsupported monthly ranking category';end if;
 if r.snapshotted_at is not null then return jsonb_build_object('status','SNAPSHOT_READY','season_id',s.id);end if;
 if s.status not in ('ACTIVE','FINALIZING') or clock_timestamp()<s.ends_at then raise exception 'Season not ready to snapshot';end if;
 perform pg_advisory_xact_lock(hashtextextended('monthly-power:'||s.id,0));
 insert into public.monthly_power_entity_snapshots select s.id,l.* from public.monthly_power_live_rankings_v1(s.ranking_type) l;
 if s.ranking_type='GUILD_POWER' then
 insert into public.monthly_power_member_snapshots
 select s.id,m.guild_id,m.user_id,m.joined_at,public.monthly_power_continuous_jst_days(m.joined_at,s.starts_at,s.ends_at),
 coalesce((select jsonb_agg(jsonb_build_object('joined_at',p.joined_at,'left_at',p.left_at,'source_membership_id',p.source_membership_id) order by p.joined_at)
 from public.kpi_guild_membership_periods p join public.kpi_subjects k on k.subject_id=p.subject_id
 where k.source_user_id=m.user_id and p.guild_id=m.guild_id and p.joined_at<s.ends_at and coalesce(p.left_at,s.ends_at)>s.starts_at),'[]'::jsonb)
 from public.guild_members m join public.monthly_power_entity_snapshots e on e.season_id=s.id and e.entity_id=m.guild_id;
 end if;
 insert into public.monthly_power_honor_requirements
 select s.id,e.entity_id,e.rank_position,m.honor_label from public.monthly_power_entity_snapshots e
 join public.monthly_power_reward_master m on m.reward_version=r.reward_version and m.ranking_type=s.ranking_type and e.rank_position between m.rank_min and m.rank_max
 where e.season_id=s.id;
 update public.monthly_power_season_runs set snapshotted_at=clock_timestamp() where season_id=s.id;
 return jsonb_build_object('status','SNAPSHOT_READY','season_id',s.id);
end $function$
;
CREATE OR REPLACE FUNCTION public.guard_monthly_power_season_cutoff()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare s record;
begin
 for s in select season.* from public.ranking_seasons season join public.monthly_power_season_runs r on r.season_id=season.id
 where r.snapshotted_at is null and season.status='ACTIVE' and season.starts_at<=clock_timestamp() order by season.id
 loop
 if clock_timestamp()>=s.ends_at then perform public.snapshot_monthly_power_season_v1(s.id);
 else
 perform 1 from public.ranking_seasons where id=s.id for share;
 perform pg_advisory_xact_lock_shared(hashtextextended('monthly-power:'||s.id,0));
 end if;
 end loop;
 return null;
end $function$
;
CREATE OR REPLACE FUNCTION public.grant_monthly_power_items_v1(p_season_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare s public.ranking_seasons%rowtype;r public.monthly_power_season_runs%rowtype;x record;i jsonb;n integer:=0;
begin
 select * into strict s from public.ranking_seasons where id=p_season_id for update;
 select * into strict r from public.monthly_power_season_runs where season_id=s.id for update;
 if r.snapshotted_at is null then raise exception 'Immutable snapshot required';end if;
 if s.ranking_type='GUILD_POWER' and r.eligibility_policy is distinct from 'CONTINUOUS_JST_DAY1' then raise exception 'Guild membership policy not approved';end if;
 for x in
 select e.entity_id,e.entity_id user_id,e.rank_position,m.items from public.monthly_power_entity_snapshots e
 join public.monthly_power_reward_master m on m.reward_version=r.reward_version and m.ranking_type=s.ranking_type and e.rank_position between m.rank_min and m.rank_max
 where e.season_id=s.id and s.ranking_type='POWER'
 union all
 select e.entity_id,ms.user_id,e.rank_position,m.items from public.monthly_power_entity_snapshots e
 join public.monthly_power_member_snapshots ms on ms.season_id=e.season_id and ms.guild_id=e.entity_id
 join public.monthly_power_reward_master m on m.reward_version=r.reward_version and m.ranking_type=s.ranking_type and e.rank_position between m.rank_min and m.rank_max
 where e.season_id=s.id and s.ranking_type='GUILD_POWER' and ms.continuous_season_days>=7
 loop
 for i in select value from jsonb_array_elements(x.items) loop
 insert into public.ranking_season_reward_grants(season_id,ranking_category,recipient_user_id,ranked_entity_id,rank_position,reward_key,master_reward_id,resolved_item_id,quantity)
 values(s.id,s.ranking_type,x.user_id,x.entity_id,x.rank_position,i->>'item_id','MONTHLY_POWER:'||r.reward_version||':'||(i->>'item_id'),i->>'item_id',(i->>'quantity')::integer)
 on conflict do nothing;
 if found then perform public.grant_present_payload(x.user_id,i->>'item_id',(i->>'quantity')::integer);n:=n+1;end if;
 end loop;
 insert into public.ranking_reward_notifications(recipient_user_id,period_kind,period_key) values(x.user_id,'SEASON',s.id::text) on conflict do nothing;
 end loop;
 return n;
end $function$
;
CREATE OR REPLACE FUNCTION public.finalize_monthly_power_season_rewards_v1(p_season_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare s public.ranking_seasons%rowtype;r public.monthly_power_season_runs%rowtype;x record;u record;ni integer;nh integer:=0;
begin
 select * into strict s from public.ranking_seasons where id=p_season_id for update;
 select * into strict r from public.monthly_power_season_runs where season_id=s.id for update;
 if r.granted_at is not null then return jsonb_build_object('season_id',s.id,'status','CLOSED','items_granted',0,'honors_granted',0,'retry',true);end if;
 if exists(select 1 from public.monthly_power_reward_master m where m.reward_version=r.reward_version and m.ranking_type=s.ranking_type and not exists(
 select 1 from public.monthly_power_honor_bindings b join public.cosmetic_master c on c.id=b.cosmetic_id and c.active where b.reward_version=m.reward_version and b.ranking_type=m.ranking_type and b.rank_min=m.rank_min)) then raise exception 'Season honor binding missing';end if;
 if r.reward_version<>'20260914' or exists(
 select 1 from (values ('POWER',1,'season_power_champion_profile_title_20260914'),('POWER',1,'season_power_champion_profile_badge_20260914'),('POWER',2,'season_power_top3_profile_title_20260914'),('POWER',2,'season_power_top3_profile_badge_20260914'),('POWER',4,'season_power_top10_profile_title_20260914'),('POWER',4,'season_power_top10_profile_badge_20260914'),('POWER',11,'season_power_top30_profile_badge_20260914'),('POWER',31,'season_power_top100_profile_badge_20260914'),('GUILD_POWER',1,'season_guild_power_champion_guild_emblem_20260914'),('GUILD_POWER',1,'season_guild_power_champion_guild_base_background_20260914'),('GUILD_POWER',1,'season_guild_power_champion_guild_title_20260914'),('GUILD_POWER',2,'season_guild_power_top3_guild_emblem_20260914'),('GUILD_POWER',2,'season_guild_power_top3_guild_base_background_20260914'),('GUILD_POWER',4,'season_guild_power_top10_guild_base_background_20260914'),('GUILD_POWER',4,'season_guild_power_top10_guild_badge_20260914'),('GUILD_POWER',11,'season_guild_power_top20_guild_badge_20260914')) expected(category,rank_min,id)
 full join (select b.ranking_type,b.rank_min,b.cosmetic_id from public.monthly_power_honor_bindings b join public.cosmetic_master c on c.id=b.cosmetic_id and c.active where b.reward_version=r.reward_version) actual
 on actual.ranking_type=expected.category and actual.rank_min=expected.rank_min and actual.cosmetic_id=expected.id
 where (coalesce(expected.category,actual.ranking_type)=s.ranking_type) and (expected.id is null or actual.cosmetic_id is null)) then raise exception 'Season honor exact binding mismatch';end if;
 perform public.snapshot_monthly_power_season_v1(s.id);
 ni:=public.grant_monthly_power_items_v1(s.id);
 for x in select e.entity_id,e.rank_position,b.cosmetic_id,c.owner_scope from public.monthly_power_entity_snapshots e
 join public.monthly_power_reward_master m on m.reward_version=r.reward_version and m.ranking_type=s.ranking_type and e.rank_position between m.rank_min and m.rank_max
 join public.monthly_power_honor_bindings b on b.reward_version=m.reward_version and b.ranking_type=m.ranking_type and b.rank_min=m.rank_min
 join public.cosmetic_master c on c.id=b.cosmetic_id and c.active where e.season_id=s.id
 loop
 insert into public.monthly_power_honor_grants(season_id,entity_id,cosmetic_id,rank_position) values(s.id,x.entity_id,x.cosmetic_id,x.rank_position) on conflict do nothing;
 if found then
 if x.owner_scope='USER' and s.ranking_type='POWER' then
 insert into public.user_cosmetics(user_id,cosmetic_id,source_type,source_reference) values(x.entity_id,x.cosmetic_id,'SEASON',s.id::text) on conflict do nothing;
 elsif x.owner_scope='GUILD' and s.ranking_type='GUILD_POWER' then
 insert into public.guild_cosmetics(guild_id,cosmetic_id,source_type,source_reference) values(x.entity_id,x.cosmetic_id,'SEASON',s.id::text) on conflict do nothing;
 else raise exception 'Season honor scope mismatch';end if;
 if exists(select 1 from public.title_master where id=x.cosmetic_id) then insert into public.user_titles(user_id,title_id) values(x.entity_id,x.cosmetic_id) on conflict do nothing;end if;
 nh:=nh+1;
 end if;
 -- Guild honors belong to the Guild; all end-members see the receipt, independent of seven-day ITEM eligibility.
 for u in select x.entity_id user_id where s.ranking_type='POWER' union all
 select ms.user_id from public.monthly_power_member_snapshots ms where ms.season_id=s.id and ms.guild_id=x.entity_id and s.ranking_type='GUILD_POWER'
 loop
 insert into public.monthly_power_honor_recipients values(s.id,x.entity_id,x.cosmetic_id,u.user_id) on conflict do nothing;
 if found then insert into public.ranking_reward_notifications(recipient_user_id,period_kind,period_key) values(u.user_id,'SEASON',s.id::text)
 on conflict(recipient_user_id,period_kind,period_key) do update set acknowledged_at=null,awarded_at=clock_timestamp();end if;
 end loop;
 end loop;
 update public.monthly_power_season_runs set granted_at=clock_timestamp() where season_id=s.id;
 update public.ranking_seasons set status='CLOSED',updated_at=clock_timestamp() where id=s.id;
 return jsonb_build_object('season_id',s.id,'status','CLOSED','items_granted',ni,'honors_granted',nh,'retry',false);
end $function$
;
CREATE OR REPLACE FUNCTION public.get_current_raid_attempt_state()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_user_id uuid:=auth.uid(); v_sync jsonb; v_free boolean;
begin
 if v_user_id is null then raise exception 'authentication required' using errcode='42501'; end if;
 v_sync:=public.sync_and_recover_vitality_and_pvp_points(v_user_id);
 select not raid_free_entry_consumed into v_free from public.users where id=v_user_id;
 return jsonb_build_object('raidPoints',(v_sync->>'out_raid_points')::integer,'maxRaidPoints',5,'firstEntryFree',v_free,'recoveryIntervalSeconds',7200);
end $function$
;
CREATE OR REPLACE FUNCTION public.get_current_raid_battle_rewards(p_replay_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_replay public.battle_replay_sessions%rowtype;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  select * into v_replay
  from public.battle_replay_sessions
  where id = p_replay_id
    and requester_user_id = v_user_id
    and battle_mode = 'RAID'
    and finalization_status = 'FINALIZED';
  if not found then
    raise exception 'finalized Raid replay not found' using errcode = 'P0002';
  end if;

  return coalesce((
    select claim.reward_payload
    from public.canonical_daily_activity_claims claim
    where claim.user_id = v_user_id
      and claim.source_key = 'RAID_BATTLE:' || p_replay_id::text
      and claim.source_ref = p_replay_id
  ), '[]'::jsonb);
end
$function$
;
CREATE OR REPLACE FUNCTION public.get_current_skill_display(p_skill_ids text[] DEFAULT NULL::text[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_result jsonb;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if p_skill_ids is not null and cardinality(p_skill_ids) > 70 then
    raise exception 'too many skill ids' using errcode = '22023';
  end if;

  with owned as (
    select
      skill.skill_card_id,
      max(coalesce(skill.plus_val, 0))::integer as enhancement_level,
      bool_or(skill.equipped_character_id is not null) as is_equipped
    from public.user_skills skill
    where skill.user_id = v_user_id
      and (p_skill_ids is null or skill.skill_card_id = any(p_skill_ids))
    group by skill.skill_card_id
  ), display_rows as (
    select
      master.skill_id,
      master.display_name,
      case
        when substring(master.skill_id from '[0-9]+$')::integer between 1 and 10 then 'N'
        when substring(master.skill_id from '[0-9]+$')::integer between 11 and 20 then 'R'
        when substring(master.skill_id from '[0-9]+$')::integer between 21 and 35 then 'SR'
        else 'SSR'
      end as rarity,
      master.kind as effect_type,
      master.target as target_type,
      master.cooldown,
      master.status as status_effect,
      owned.enhancement_level,
      owned.is_equipped,
      case master.kind
        when 'ATTACK' then '対象へダメージを与える'
        when 'HEAL' then '対象のHPを回復する'
        when 'BUFF' then '対象の能力を一定ターン強化する'
        when 'DEBUFF' then '対象の能力を一定ターン低下させる'
      end || case when master.status is not null then '。追加効果: ' || master.status else '' end as display_effect
    from owned
    join public.skill_battle_master master on master.skill_id = owned.skill_card_id and master.enabled
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'skill_master_id', row.skill_id,
    'display_name', row.display_name,
    'rarity', row.rarity,
    'description', row.display_effect,
    'display_effect', row.display_effect,
    'effect_type', row.effect_type,
    'target_type', row.target_type,
    'cooldown', row.cooldown,
    'status_effect', row.status_effect,
    'enhancement_level', row.enhancement_level,
    'max_enhancement_level', 10,
    'is_equipped', row.is_equipped
  ) order by row.skill_id), '[]'::jsonb)
  into v_result
  from display_rows row;

  return v_result;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.get_direct_message_unread_counts()
 RETURNS TABLE(sender_id uuid, sender_name text, unread_count bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT dm.sender_id, u.username AS sender_name, count(*)::bigint AS unread_count
  FROM public.direct_messages dm
  JOIN public.users u ON u.id = dm.sender_id
  WHERE dm.recipient_id = auth.uid()
    AND dm.is_read = false
  GROUP BY dm.sender_id, u.username
  ORDER BY max(dm.created_at) DESC;
$function$
;
CREATE OR REPLACE FUNCTION public.get_friend_helper_loadout(p_friend_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ begin perform public.assert_feature_mutation_allowed('FRIEND_HELPER'); return public.get_friend_helper_loadout_core_20260823(p_friend_user_id); end $function$
;
CREATE OR REPLACE FUNCTION public.get_friend_helper_loadout_core_20260823(p_friend_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
 if auth.uid() is null or not exists(select 1 from public.user_friends
   where user_id=auth.uid() and friend_id=p_friend_user_id and status='ACCEPTED') then
  raise exception 'accepted friendship required' using errcode='42501';
 end if;
 return public.get_public_battle_loadout(p_friend_user_id);
end $function$
;
CREATE OR REPLACE FUNCTION public.get_my_pending_ranking_reward_notification()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_uid uuid:=auth.uid(); v_notification_ids jsonb; v_grants jsonb;
begin
  if v_uid is null then raise exception 'authentication required' using errcode='42501'; end if;
  select jsonb_agg(notification.id order by notification.awarded_at,notification.id)
  into v_notification_ids from public.ranking_reward_notifications notification
  where notification.recipient_user_id=v_uid and notification.acknowledged_at is null;
  if v_notification_ids is null then return null; end if;
  with grant_rows as (
    select notification.awarded_at notification_at,notification.period_kind,notification.period_key,
      season.ranking_category,season.rank_position,season.resolved_item_id item_id,
      season.quantity,season.granted_at,season.reward_key ordering_key,
      'ITEM'::text reward_kind,null::text display_name
    from public.ranking_reward_notifications notification
    join public.ranking_season_reward_grants season
      on notification.period_kind='SEASON' and season.season_id::text=notification.period_key
      and season.recipient_user_id=notification.recipient_user_id
    where notification.recipient_user_id=v_uid and notification.acknowledged_at is null
    union all
    select notification.awarded_at,notification.period_kind,notification.period_key,
      award.ranking_type,award.rank_position,item.item_id,item.quantity,item.granted_at,item.item_id,
      'ITEM'::text,null::text
    from public.ranking_reward_notifications notification
    join public.ranking_daily_reward_awards award
      on notification.period_kind='DAILY' and award.ranking_day_key::text=notification.period_key
      and award.recipient_user_id=notification.recipient_user_id
    join public.ranking_daily_reward_item_grants item on item.award_id=award.id
    where notification.recipient_user_id=v_uid and notification.acknowledged_at is null
    union all
    select notification.awarded_at,notification.period_kind,notification.period_key,
      'GUILD_POWER',grant_row.rank_position,grant_row.cosmetic_id,1,
      grant_row.granted_at,grant_row.cosmetic_id,'GUILD_COSMETIC',cosmetic.display_name
    from public.ranking_reward_notifications notification
    join public.ranking_guild_power_reward_recipients recipient
      on notification.period_kind='SEASON' and recipient.season_id::text=notification.period_key
      and recipient.recipient_user_id=notification.recipient_user_id
    join public.ranking_guild_power_reward_grants grant_row
      on grant_row.season_id=recipient.season_id and grant_row.guild_id=recipient.guild_id
    join public.cosmetic_master cosmetic on cosmetic.id=grant_row.cosmetic_id
    where notification.recipient_user_id=v_uid and notification.acknowledged_at is null
    union all
    select n.awarded_at,n.period_kind,n.period_key,s.ranking_type,g.rank_position,g.cosmetic_id,1,g.granted_at,g.cosmetic_id,'COSMETIC',c.display_name
    from public.ranking_reward_notifications n
    join public.monthly_power_honor_recipients rr on rr.recipient_user_id=n.recipient_user_id and n.period_kind='SEASON' and rr.season_id::text=n.period_key
    join public.monthly_power_honor_grants g on g.season_id=rr.season_id and g.entity_id=rr.entity_id and g.cosmetic_id=rr.cosmetic_id
    join public.ranking_seasons s on s.id=g.season_id join public.cosmetic_master c on c.id=g.cosmetic_id
    where n.recipient_user_id=v_uid and n.acknowledged_at is null
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'period_kind',grant_row.period_kind,'period_key',grant_row.period_key,
    'ranking_category',grant_row.ranking_category,'rank_position',grant_row.rank_position,
    'item_id',grant_row.item_id,'quantity',grant_row.quantity,'granted_at',grant_row.granted_at,
    'reward_kind',grant_row.reward_kind,'display_name',grant_row.display_name
  ) order by grant_row.notification_at,grant_row.ranking_category,
    grant_row.rank_position,grant_row.ordering_key),'[]'::jsonb)
  into v_grants from grant_rows grant_row;
  return jsonb_build_object('notification_ids',v_notification_ids,'grants',v_grants);
end;
$function$
;
CREATE OR REPLACE FUNCTION public.get_patrol_battle_enemy(p_patrol_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_enemy record;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  select npc.id, npc.quest_id, npc.npc_name, npc.npc_level,
         npc.encounter_rate, npc.enemy_data
  into v_enemy
  from public.user_patrols patrol
  join public.patrol_npcs npc
    on npc.quest_id = coalesce(patrol.course_id, patrol.quest_id)
  where patrol.id = p_patrol_id
    and patrol.user_id = v_user_id
    and patrol.status = 'CLAIMABLE'
    and patrol.has_battle_event = true
    and coalesce(patrol.battle_resolved, false) = false
  order by npc.id
  limit 1;

  if not found then
    raise exception 'eligible patrol encounter not found' using errcode = 'P0002';
  end if;

  return jsonb_build_object(
    'id', v_enemy.id,
    'quest_id', v_enemy.quest_id,
    'npc_name', v_enemy.npc_name,
    'npc_level', v_enemy.npc_level,
    'encounter_rate', v_enemy.encounter_rate,
    'enemy_data', coalesce(v_enemy.enemy_data, '{}'::jsonb)
  );
end;
$function$
;
CREATE OR REPLACE FUNCTION public.get_pending_mission_event_dialog()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_uid uuid:=auth.uid();
  v_today date:=(clock_timestamp() at time zone 'Asia/Tokyo')::date;
  v_result jsonb;
begin
  if v_uid is null then raise exception 'authentication required' using errcode='42501'; end if;
  select jsonb_build_object(
    'event_id',event.id,'jst_date',v_today,'display_name',event.display_name,
    'dialog_image_url',event.dialog_image_url,'dialog_body',event.dialog_body,
    'primary_cta_label',event.primary_cta_label,'secondary_cta_label',event.secondary_cta_label
  ) into v_result
  from public.mission_events event
  where event.is_enabled and clock_timestamp()>=event.start_at and clock_timestamp()<event.progress_end_at
    and not exists(select 1 from public.mission_event_dialog_views views
      where views.user_id=v_uid and views.event_id=event.id and views.jst_date=v_today)
  order by event.start_at limit 1;
  return v_result;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.get_public_battle_loadout(p_target_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user record;
  v_char record;
  v_equips jsonb;
  v_skills jsonb;
BEGIN
  IF auth.uid() IS NULL OR p_target_user_id IS NULL THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT username INTO v_user FROM public.users WHERE id = p_target_user_id;
  SELECT id, character_id, level, awakening_level INTO v_char
  FROM public.user_characters
  WHERE user_id = p_target_user_id
  ORDER BY level DESC, awakening_level DESC, id
  LIMIT 1;
  IF v_char.id IS NULL THEN
    RETURN jsonb_build_object('username', v_user.username, 'character', null, 'equipments', '[]'::jsonb, 'skills', '[]'::jsonb);
  END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'equipment_id', equipment_id, 'level', level, 'plus_val', plus_val, 'slot_index', slot_index, 'random_options', random_options
  )), '[]'::jsonb) INTO v_equips
  FROM public.user_equipments WHERE user_id = p_target_user_id AND equipped_character_id = v_char.id::text;
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'skill_card_id', skill_card_id, 'plus_val', plus_val, 'slot_index', slot_index
  )), '[]'::jsonb) INTO v_skills
  FROM public.user_skills WHERE user_id = p_target_user_id AND equipped_character_id = v_char.id::text;

  RETURN jsonb_build_object(
    'username', v_user.username,
    'character', jsonb_build_object('id', v_char.id, 'character_id', v_char.character_id, 'level', v_char.level, 'awakening_level', v_char.awakening_level),
    'equipments', v_equips,
    'skills', v_skills
  );
END;
$function$
;
CREATE OR REPLACE FUNCTION public.get_public_battle_roster(p_target_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user record;
  v_roster jsonb;
BEGIN
  IF auth.uid() IS NULL OR p_target_user_id IS NULL THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  SELECT username INTO v_user FROM public.users WHERE id = p_target_user_id;
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', c.id,
    'character_id', c.character_id,
    'level', c.level,
    'awakening_level', c.awakening_level,
    'equipments', COALESCE((SELECT jsonb_agg(jsonb_build_object('equipment_id', e.equipment_id, 'level', e.level, 'plus_val', e.plus_val, 'slot_index', e.slot_index, 'random_options', e.random_options)) FROM public.user_equipments e WHERE e.user_id = c.user_id AND e.equipped_character_id = c.id::text), '[]'::jsonb),
    'skills', COALESCE((SELECT jsonb_agg(jsonb_build_object('skill_card_id', s.skill_card_id, 'plus_val', s.plus_val, 'slot_index', s.slot_index)) FROM public.user_skills s WHERE s.user_id = c.user_id AND s.equipped_character_id = c.id::text), '[]'::jsonb)
  ) ORDER BY c.level DESC, c.awakening_level DESC), '[]'::jsonb) INTO v_roster
  FROM public.user_characters c WHERE c.user_id = p_target_user_id;
  RETURN jsonb_build_object('username', v_user.username, 'characters', v_roster);
END;
$function$
;
CREATE OR REPLACE FUNCTION public.gvg_season_reset()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') <> 'admin' THEN RAISE EXCEPTION 'admin role required'; END IF;
  DELETE FROM public.user_gvg_ranks;
  UPDATE public.guild_base_controls SET daily_points = 0, total_seasonal_days = 0, is_controlling = false, updated_at = now();
  INSERT INTO public.gvg_season_status (id, current_day, updated_at) VALUES (1, 1, now())
  ON CONFLICT (id) DO UPDATE SET current_day = 1, updated_at = EXCLUDED.updated_at;
END;
$function$
;
CREATE OR REPLACE FUNCTION public._issue_raid_room_rescue_rewards_v1(p_room_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
declare v_room public.raid_rooms%rowtype;v_boss public.raid_bosses%rowtype;
 v_rule public.raid_room_rescue_reward_rules%rowtype;v_member record;v_item record;
 v_progress jsonb;v_items jsonb;v_issued timestamptz;v_present uuid;v_inserted integer;v_count integer:=0;
begin
 select * into strict v_room from public.raid_rooms where id=p_room_id;
 -- 呼出元finalizerはReplay→bossを保持済み。別Replay/Userの強いロックを取得しない。
 select * into strict v_boss from public.raid_bosses where id=v_room.raid_boss_instance_id for update;
 if v_boss.outcome is distinct from 'DEFEAT_SUCCESS' then return 0;end if;
 select * into v_rule from public.raid_room_rescue_reward_rules where difficulty=v_room.difficulty_id for share;
 if not found or not v_rule.enabled then return 0;end if;
 perform 1 from public.raid_room_difficulty_rules where difficulty=v_room.difficulty_id for share;
 perform 1 from public.raid_room_rescue_reward_items where difficulty=v_room.difficulty_id for share;
 if not found then return 0;end if;
 select jsonb_agg(jsonb_build_object('item_id',item_id,'quantity',quantity) order by item_id) into v_items
  from public.raid_room_rescue_reward_items where difficulty=v_room.difficulty_id;
 for v_member in select user_id from public.raid_room_rescue_members where room_id=p_room_id order by user_id loop
  if exists(select 1 from public.raid_room_rescue_rewards where room_id=p_room_id and user_id=v_member.user_id) then continue;end if;
  v_progress:=public._raid_room_rescue_reward_progress_v1(p_room_id,v_member.user_id);
  if v_progress->'rescueGate'->>'status' is distinct from 'succeeded' then continue;end if;
  v_issued:=clock_timestamp();
  insert into public.raid_room_rescue_rewards(room_id,user_id,rule_version,reward_version,
   finalized_battles,contribution_damage,rescue_gate,issued_at,expires_at)
  values(p_room_id,v_member.user_id,(v_progress->'rescueGate'->>'ruleVersion')::bigint,v_rule.reward_version,
   (v_progress->>'finalizedBattles')::bigint,(v_progress->>'contributionDamage')::bigint,
   v_progress->'rescueGate',v_issued,v_issued+interval '30 days') on conflict do nothing;
  get diagnostics v_inserted=row_count;
  if v_inserted=0 then continue;end if;
  for v_item in select * from jsonb_to_recordset(v_items) as item(item_id text,quantity integer) order by item_id loop
   v_present:=public._grant_gameplay_reward_v1(v_member.user_id,'RAID_ROOM_RESCUE',p_room_id::text,v_item.item_id,v_item.quantity);
   insert into public.raid_room_rescue_reward_grants(room_id,user_id,item_id,quantity,present_id,direct_delivery_id)
   values(p_room_id,v_member.user_id,v_item.item_id,v_item.quantity,null,v_present);
  end loop;
  v_count:=v_count+1;
 end loop;
 return v_count;
end $function$
;
CREATE OR REPLACE FUNCTION public._issue_raid_room_clear_rewards_v1(p_room_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
declare v_room public.raid_rooms%rowtype;v_boss public.raid_bosses%rowtype;
 v_rule public.raid_room_clear_reward_rules%rowtype;v_member record;v_item record;
 v_progress jsonb;v_items jsonb;v_issued timestamptz;v_present uuid;v_inserted integer;v_count integer:=0;
begin
 select * into strict v_room from public.raid_rooms where id=p_room_id;
 -- 呼出元finalizerはReplay→bossを保持済み。別Replay/Userの強いロックを取得しない。
 select * into strict v_boss from public.raid_bosses where id=v_room.raid_boss_instance_id for update;
 if v_boss.outcome is distinct from 'DEFEAT_SUCCESS' then return 0;end if;
 select * into v_rule from public.raid_room_clear_reward_rules where difficulty=v_room.difficulty_id for share;
 if not found or not v_rule.enabled or v_rule.minimum_contribution_damage is null then return 0;end if;
 perform 1 from public.raid_room_clear_reward_items where difficulty=v_room.difficulty_id for share;
 if not found then return 0;end if;
 select jsonb_agg(jsonb_build_object('item_id',item_id,'quantity',quantity) order by item_id) into v_items
  from public.raid_room_clear_reward_items where difficulty=v_room.difficulty_id;
 for v_member in select user_id from public.raid_room_members where room_id=p_room_id order by user_id loop
  if exists(select 1 from public.raid_room_clear_rewards where room_id=p_room_id and user_id=v_member.user_id) then continue;end if;
  v_progress:=public._raid_room_clear_reward_progress_v1(p_room_id,v_member.user_id);
  if v_progress->'clearGate'->>'status' is distinct from 'succeeded' then continue;end if;
  v_issued:=clock_timestamp();
  insert into public.raid_room_clear_rewards(room_id,user_id,rule_version,
   finalized_battles,contribution_damage,clear_gate,issued_at,expires_at)
  values(p_room_id,v_member.user_id,v_rule.rule_version,
   (v_progress->>'finalizedBattles')::bigint,(v_progress->>'contributionDamage')::bigint,
   v_progress->'clearGate',v_issued,v_issued+interval '30 days') on conflict do nothing;
  get diagnostics v_inserted=row_count;
  if v_inserted=0 then continue;end if;
  -- Clear gate通過・資格ledger新規作成時だけ。retryやitem数では増やさない。
  perform public.evaluate_mission_progress(v_member.user_id, 'RAID_CLEAR_ELIGIBLE', 1);
  for v_item in select * from jsonb_to_recordset(v_items) as item(item_id text,quantity integer) order by item_id loop
   v_present:=public._grant_gameplay_reward_v1(v_member.user_id,'RAID_ROOM_CLEAR',p_room_id::text,v_item.item_id,v_item.quantity);
   insert into public.raid_room_clear_reward_grants(room_id,user_id,item_id,quantity,present_id,direct_delivery_id)
   values(p_room_id,v_member.user_id,v_item.item_id,v_item.quantity,null,v_present);
  end loop;
  perform public._issue_raid_daily_clear_bonus_v2(p_room_id,v_member.user_id);
  v_count:=v_count+1;
 end loop;
 return v_count;
end $function$
;
CREATE OR REPLACE FUNCTION public.issue_quest_raid_encounter_bonus_v1()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
declare e public.quest_raid_encounters%rowtype; amounts jsonb; v_cash bigint; v_xp integer; inserted integer;
begin
 -- 救援成功だけでは付与しない。正式撃破受給ledgerを単一入口にする。
 if tg_table_name<>'raid_room_clear_rewards' then return new;end if;
 select * into e from public.quest_raid_encounters where room_id=new.room_id and status='CREATED';
 if not found then return new;end if;
 amounts:=public._quest_raid_cash_xp_v2(e.patrol_id);
 v_cash:=coalesce(e.bonus_cash,(amounts->>'cash')::bigint);
 v_xp:=coalesce(e.bonus_user_xp,(amounts->>'userXp')::integer);
 if v_cash is null or v_xp is null then raise exception 'quest bonus authority missing';end if;
 insert into public.quest_raid_encounter_bonus_grants(room_id,user_id,rule_version,cash,user_xp)
 values(new.room_id,new.user_id,3,v_cash,v_xp) on conflict do nothing;
 get diagnostics inserted=row_count;
 if inserted=0 then return new;end if;
 if v_cash>0 then update public.users set cash=cash+v_cash where id=new.user_id;end if;
 if v_xp>0 then perform public.apply_user_xp(new.user_id,v_xp);end if;
 return new;
end $function$
;
CREATE OR REPLACE FUNCTION public.get_monthly_power_season_rewards_v1(p_ranking_type text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare s public.ranking_seasons%rowtype;r public.monthly_power_season_runs%rowtype;uid uuid:=auth.uid();gid uuid;joined timestamptz;rank_value integer;day_count integer;tiers jsonb;items jsonb;policy_status text;
begin
 if uid is null then raise exception 'Authentication required' using errcode='42501';end if;
 if p_ranking_type not in ('POWER','GUILD_POWER') then raise exception 'Invalid ranking type';end if;
 select season.* into s from public.ranking_seasons season join public.monthly_power_season_runs run on run.season_id=season.id
 where season.ranking_type=p_ranking_type order by season.starts_at desc limit 1;
 select * into r from public.monthly_power_season_runs where season_id=s.id;
 select coalesce(jsonb_agg(jsonb_build_object('rank_min',rank_min,'rank_max',rank_max,'honor_label',honor_label,'items',m.items) order by rank_min),'[]'::jsonb)
 into tiers from public.monthly_power_reward_master m where reward_version=coalesce(r.reward_version,'20260914') and ranking_type=p_ranking_type;
 if p_ranking_type='GUILD_POWER' then
 if r.snapshotted_at is not null then
 select guild_id,joined_at,continuous_season_days into gid,joined,day_count from public.monthly_power_member_snapshots where season_id=s.id and user_id=uid;
 else select guild_id,joined_at into gid,joined from public.guild_members where user_id=uid;
 day_count:=public.monthly_power_continuous_jst_days(joined,s.starts_at,least(clock_timestamp()+interval '1 microsecond',s.ends_at));end if;
 end if;
 if s.id is not null then
 if r.snapshotted_at is not null then select rank_position into rank_value from public.monthly_power_entity_snapshots where season_id=s.id and entity_id=case when p_ranking_type='POWER' then uid else gid end;
 elsif clock_timestamp()>=s.starts_at and clock_timestamp()<s.ends_at then
 select rank_position into rank_value from public.monthly_power_live_rankings_v1(p_ranking_type) where entity_id=case when p_ranking_type='POWER' then uid else gid end;end if;
 end if;
 select m.items into items from public.monthly_power_reward_master m where reward_version=coalesce(r.reward_version,'20260914') and ranking_type=p_ranking_type and rank_value between rank_min and rank_max;
 policy_status:=case when p_ranking_type='POWER' then 'NOT_APPLICABLE' when gid is null then 'NOT_MEMBER' when r.eligibility_policy is null then 'MEMBERSHIP_POLICY_PENDING' else 'CONTINUOUS_JST_DAY1' end;
 return jsonb_build_object('season',case when s.id is null then null else to_jsonb(s) end,'tiers',tiers,'current_rank',rank_value,'planned_items',coalesce(items,'[]'::jsonb),
 'eligibility',jsonb_build_object('joined_at',joined,'season_days',day_count,'eligible',case when p_ranking_type='POWER' then true when r.eligibility_policy is null then null else coalesce(day_count>=7,false) end,'status',policy_status),
 'cosmetics_status','BOUND','finalized',r.snapshotted_at is not null);
end $function$
;
CREATE OR REPLACE FUNCTION public.start_formal_open_seasons_v1(p_open_at timestamp with time zone)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
 v_end timestamptz := '2026-09-30 15:00:00+00';
 v_old public.ranking_seasons%rowtype;
 v_ids jsonb; v_count integer;
begin
 if p_open_at is null or p_open_at<'2026-09-14 15:00:00+00'::timestamptz
   or p_open_at>=v_end or p_open_at>clock_timestamp() or clock_timestamp()>=v_end then
   raise exception 'Confirmed Formal Open timestamp required';
 end if;
 -- 実行はメンテナンスで操作停止を確認後。全カテゴリの行競合を同じTXで排除。
 perform pg_advisory_xact_lock(hashtextextended('ranking-season:PVP',0));
 lock table public.ranking_seasons in share row exclusive mode;
 select count(*),jsonb_object_agg(ranking_type,id) into v_count,v_ids
 from public.ranking_seasons where ranking_type in ('PVP','POWER','GUILD_POWER')
   and starts_at=p_open_at and ends_at=v_end and status='ACTIVE';
 if v_count=3 then
   if (select count(*) from public.ranking_seasons where ranking_type in ('PVP','POWER','GUILD_POWER') and status<>'CLOSED')<>3 then
     raise exception 'Unexpected concurrent season state';
   end if;
   if (select count(*) from public.monthly_power_season_runs where season_id in
       ((v_ids->>'POWER')::uuid,(v_ids->>'GUILD_POWER')::uuid))<>2 then
     raise exception 'Formal Open reward registration drift';
   end if;
   return jsonb_build_object('status','ALREADY_STARTED','season_ids',v_ids,'starts_at',p_open_at,'ends_at',v_end);
 end if;
 if exists(select 1 from public.ranking_seasons where ranking_type in ('PVP','POWER','GUILD_POWER')
   and starts_at=p_open_at) then raise exception 'Partial or conflicting Formal Open season requires review';end if;
 -- 旧POWERへの報酬転用・PREOPEN限定Emblemの黙示省略は禁止。
 if exists(select 1 from public.ranking_seasons where ranking_type in ('POWER','GUILD_POWER')
   and status<>'CLOSED') then raise exception 'Prior POWER/GUILD_POWER season disposition required';end if;
 if not exists(select 1 from public.ranking_guild_power_season_master m
   join public.ranking_seasons s on s.id=m.season_id
   join public.ranking_guild_power_finalization_audits a on a.season_id=s.id
   where m.event_key='PREOPEN_GUILD_POWER_2026' and s.status='CLOSED' and s.ends_at<=p_open_at) then
   raise exception 'Preopen Guild Power finalization audit required';
 end if;
 if (select count(*) from public.ranking_seasons where ranking_type='PVP' and status='ACTIVE')<>1
   or exists(select 1 from public.ranking_seasons where ranking_type='PVP' and status in ('PREPARING','FINALIZING')) then
   raise exception 'Unresolved PVP season state requires review';
 end if;
 select * into strict v_old from public.ranking_seasons where ranking_type='PVP' and status='ACTIVE' for update;
 if v_old.starts_at>=p_open_at or v_old.ends_at<p_open_at then
   raise exception 'PVP boundary does not cover Formal Open';
 end if;
 update public.ranking_seasons set ends_at=p_open_at,status='FINALIZING',updated_at=clock_timestamp() where id=v_old.id;
 perform public.assert_pvp_boundary_replay_continuity(v_old.id,clock_timestamp());
 perform public.finalize_pvp_season_rewards(v_old.id);
 perform public.reconcile_pvp_after_season_boundary(v_old.id,clock_timestamp());
 update public.ranking_seasons set status='CLOSED',updated_at=clock_timestamp() where id=v_old.id;
 insert into public.ranking_seasons(ranking_type,starts_at,ends_at,status)
 select t,p_open_at,v_end,'ACTIVE' from unnest(array['PVP','POWER','GUILD_POWER']) t;
 insert into public.monthly_power_season_runs(season_id)
 select id from public.ranking_seasons where starts_at=p_open_at and ranking_type in ('POWER','GUILD_POWER');
 select jsonb_object_agg(ranking_type,id) into v_ids from public.ranking_seasons
 where starts_at=p_open_at and ranking_type in ('PVP','POWER','GUILD_POWER');
 return jsonb_build_object('status','STARTED','season_ids',v_ids,'old_pvp_season_id',v_old.id,'starts_at',p_open_at,'ends_at',v_end);
end $function$
;
CREATE OR REPLACE FUNCTION public.finalize_due_monthly_power_seasons_v1()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare s record;results jsonb:='[]';begin
 for s in select season.id from public.ranking_seasons season join public.monthly_power_season_runs r on r.season_id=season.id
 where season.status in ('ACTIVE','FINALIZING') and season.ends_at<=clock_timestamp() and r.granted_at is null order by season.ends_at,season.id
 loop results:=results||jsonb_build_array(public.finalize_monthly_power_season_rewards_v1(s.id));end loop;return results;end $function$
;
CREATE OR REPLACE FUNCTION public.get_equipped_season_honors(p_owner_scope text, p_owner_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501';end if;
 if p_owner_scope not in ('USER','GUILD') then raise exception 'Invalid scope';end if;
 return (select coalesce(jsonb_agg(jsonb_build_object('slot',a.slot,'cosmetic_id',a.cosmetic_id,'display_name',c.display_name,'metadata',c.metadata)),'[]'::jsonb)
 from (select e.slot,e.cosmetic_id from public.equipped_cosmetics e where p_owner_scope='USER' and e.user_id=p_owner_id and e.slot<>'PROFILE_TITLE'
 union all select 'PROFILE_TITLE',u.title_equipped from public.users u where p_owner_scope='USER' and u.id=p_owner_id
 union all select e.slot,e.cosmetic_id from public.guild_equipped_cosmetics e where p_owner_scope='GUILD' and e.guild_id=p_owner_id) a
 join public.cosmetic_master c on c.id=a.cosmetic_id and c.active and c.source_reference='MONTHLY_POWER:20260914' and c.owner_scope=p_owner_scope);
end $function$
;
CREATE OR REPLACE FUNCTION public._issue_raid_daily_clear_bonus_v2(p_room_id uuid, p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog'
AS $function$
declare v_room public.raid_rooms%rowtype;v_boss public.raid_bosses%rowtype;
 v_rule public.raid_daily_clear_bonus_rules%rowtype;v_day date;v_won boolean;v_items jsonb:='[]';v_item jsonb;v_inserted integer;
begin
 select * into strict v_room from public.raid_rooms where id=p_room_id;
 select * into strict v_boss from public.raid_bosses where id=v_room.raid_boss_instance_id;
 if v_boss.outcome is distinct from 'DEFEAT_SUCCESS' or not exists(
  select 1 from public.raid_room_clear_rewards where room_id=p_room_id and user_id=p_user_id and rule_version=2
 ) then raise exception 'Daily bonus requires issued v2 instance clear';end if;
 if not exists(select 1 from public.raid_room_clear_reward_rules where difficulty=v_room.difficulty_id and enabled and minimum_contribution_damage is not null) then return;end if;
 select * into strict v_rule from public.raid_daily_clear_bonus_rules where difficulty=v_room.difficulty_id for share;
 -- Use the actual clear day, never client time or retry/claim time.
 if coalesce(v_boss.cleared_at,v_boss.outcome_finalized_at) is null then raise exception 'Missing authoritative clear time';end if;
 v_day:=(coalesce(v_boss.cleared_at,v_boss.outcome_finalized_at) at time zone 'Asia/Tokyo')::date;
 v_won:=random()*10000<v_rule.chance_bp;
 if v_won then
  for v_item in select value from jsonb_array_elements(v_rule.items) loop
   v_items:=v_items||jsonb_build_array(jsonb_build_object('itemId',public.resolve_canonical_reward_item(v_item->>'itemId'),'quantity',(v_item->>'quantity')::integer));
  end loop;
 end if;
 -- INSERT is the race winner. Misses also persist; another instance cannot reroll.
 insert into public.raid_daily_clear_bonus_ledger(raid_day_key,user_id,difficulty,source_instance_id,source_room_id,won,items)
 values(v_day,p_user_id,v_room.difficulty_id,v_boss.id,p_room_id,v_won,v_items)
 on conflict do nothing;
 get diagnostics v_inserted=row_count;
 if v_inserted=0 then return;end if;
 for v_item in select value from jsonb_array_elements(v_items) loop
  perform public._grant_gameplay_reward_v1(p_user_id,'RAID_ROOM_CLEAR','DAILY_CLEAR_BONUS:'||v_day::text||':'||v_room.difficulty_id,v_item->>'itemId',(v_item->>'quantity')::integer);
 end loop;
end $function$
;
CREATE OR REPLACE FUNCTION public.claim_patrol_rewards(p_patrol_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
 v_uid uuid:=auth.uid();
 v_patrol record;
 v_first boolean:=false;
 v_item record;
 v_items jsonb:='[]';
 v_xp jsonb;
 v_total_xp integer;
 v_cash bigint;
 v_bonus jsonb;
 v_bonus_cash bigint;
 v_drop_bp integer;
begin
 if v_uid is null then raise exception 'authentication required' using errcode='42501'; end if;
 select patrol.*,quest.display_name,quest.difficulty,quest.user_exp,quest.reward_pool_id,patrol.base_cash_snapshot as cash_reward
 into v_patrol
 from public.user_patrols patrol
 join public.canonical_quest_master quest
   on quest.version='2026-08-30'
  and quest.quest_id=coalesce(patrol.course_id,patrol.quest_id)
  and quest.is_production_enabled
 where patrol.id=p_patrol_id and patrol.user_id=v_uid
 for update of patrol;
 if not found then raise exception 'patrol not found' using errcode='P0002'; end if;
 if v_patrol.status='COMPLETED' then raise exception 'patrol rewards already claimed' using errcode='23505'; end if;
 if v_patrol.status<>'CLAIMABLE' and v_patrol.expires_at>now() then raise exception 'patrol is not complete' using errcode='23514'; end if;
 if v_patrol.has_battle_event and not coalesce(v_patrol.battle_resolved,false) then raise exception 'patrol battle must be resolved before claiming rewards' using errcode='23514'; end if;
 -- A resolved defeat releases the dispatch slot without awarding a clear.
 if v_patrol.has_battle_event and v_patrol.battle_result is distinct from 'VICTORY' then
   if v_patrol.battle_result is distinct from 'DEFEAT' then
     raise exception 'patrol battle outcome unavailable' using errcode='23514';
   end if;
   update public.user_patrols
   set status='COMPLETED', rewards_accrued=jsonb_build_object(
     'course_name',v_patrol.display_name,'outcome','DEFEAT',
     'cash',0,'xp',0,'items','[]'::jsonb,'first_clear',false)
   where id=p_patrol_id;
   return jsonb_build_object('status','success','patrol_id',p_patrol_id,
     'course_name',v_patrol.display_name,'outcome','DEFEAT',
     'cash',0,'xp',0,'items','[]'::jsonb,'first_clear',false);
 end if;
 insert into public.user_quest_first_clears(user_id,quest_id)
 values(v_uid,coalesce(v_patrol.course_id,v_patrol.quest_id))
 on conflict do nothing returning true into v_first;
 v_first:=coalesce(v_first,false);
 v_total_xp:=v_patrol.user_exp;
 v_bonus:=v_patrol.hometown_bonus_snapshot;
 if v_bonus is null then raise exception 'hometown snapshot missing' using errcode='23514'; end if;
 v_bonus_cash:=(v_bonus->>'cash')::bigint;
 v_drop_bp:=(v_bonus->>'drop_bonus_bp')::integer;
 if v_patrol.cash_reward is null then raise exception 'Quest base CASH snapshot missing' using errcode='23514';end if;
 v_cash:=v_patrol.cash_reward+v_bonus_cash;
 for v_item in
   select * from public.canonical_quest_reward_pool_items item
   where item.version='2026-08-30' and item.reward_pool_id=v_patrol.reward_pool_id
   order by item.roll_index
 loop
   if v_item.probability_bp>0 and floor(random()*10000)::integer<least(10000,v_item.probability_bp+v_drop_bp) then
     v_item.item_id:=public.resolve_canonical_reward_item(v_item.item_id);
     perform public._grant_gameplay_reward_v1(v_uid,'QUEST_DROP',p_patrol_id::text||':'||v_item.roll_index::text,v_item.item_id,v_item.quantity);
     v_items:=v_items||jsonb_build_array(jsonb_build_object('item_id',v_item.item_id,'quantity',v_item.quantity));
   end if;
 end loop;
 if v_cash>0 then
   update public.users set cash=cash+v_cash where id=v_uid;
 end if;
 v_xp:=public.apply_user_xp(v_uid,v_total_xp);
 update public.user_patrols
 set status='COMPLETED',
     rewards_accrued=jsonb_build_object('course_name',v_patrol.display_name,'outcome','VICTORY','cash',v_cash,'base_cash',v_patrol.cash_reward,'hometown_bonus_applied',(v_bonus->>'matched')::boolean,'hometown_bonus_cash',v_bonus_cash,'hometown_drop_bonus_bp',v_drop_bp,'xp',v_total_xp,'items',v_items,'first_clear',v_first)
 where id=p_patrol_id;
 perform public.evaluate_mission_progress(v_uid,'PATROL_CLEAR',1);
 if v_patrol.difficulty='HARD' and v_patrol.has_battle_event and v_patrol.battle_result='VICTORY' then
   perform public.evaluate_mission_progress(v_uid,'QUEST_HARD_COMPLETE_COUNT',1);
 end if;
 return jsonb_build_object('status','success','patrol_id',p_patrol_id,'course_name',v_patrol.display_name,'outcome','VICTORY','cash',v_cash,'base_cash',v_patrol.cash_reward,'hometown_bonus_applied',(v_bonus->>'matched')::boolean,'hometown_bonus_cash',v_bonus_cash,'hometown_drop_bonus_bp',v_drop_bp,'xp',v_total_xp,'items',v_items,'first_clear',v_first,'level',v_xp->'level','current_xp',v_xp->'xp','leveled_up',v_xp->'leveled_up');
end $function$
;
CREATE OR REPLACE FUNCTION public.get_public_battle_roster_by_character_ids(p_character_ids uuid[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_roster jsonb;
BEGIN
  IF auth.uid() IS NULL OR p_character_ids IS NULL OR cardinality(p_character_ids) = 0 THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', c.id, 'character_id', c.character_id, 'level', c.level, 'awakening_level', c.awakening_level,
    'equipments', COALESCE((SELECT jsonb_agg(jsonb_build_object('equipment_id', e.equipment_id, 'level', e.level, 'plus_val', e.plus_val, 'slot_index', e.slot_index, 'random_options', e.random_options)) FROM public.user_equipments e WHERE e.user_id = c.user_id AND e.equipped_character_id = c.id::text), '[]'::jsonb),
    'skills', COALESCE((SELECT jsonb_agg(jsonb_build_object('skill_card_id', s.skill_card_id, 'plus_val', s.plus_val, 'slot_index', s.slot_index)) FROM public.user_skills s WHERE s.user_id = c.user_id AND s.equipped_character_id = c.id::text), '[]'::jsonb)
  ) ORDER BY array_position(p_character_ids, c.id)), '[]'::jsonb) INTO v_roster
  FROM public.user_characters c WHERE c.id = ANY(p_character_ids);
  RETURN v_roster;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.get_public_guild_base_controls()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode='42501'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'base_id',control.base_id,
      'guild_id',control.guild_id,
      'guild_name',guild.name,
      'is_controlling',control.is_controlling,
      'total_seasonal_days',control.total_seasonal_days,
      'updated_at',control.updated_at
    ) order by control.base_id,control.is_controlling desc,control.guild_id)
    from public.guild_base_controls control
    left join public.guilds guild on guild.id=control.guild_id
  ),'[]'::jsonb);
end;
$function$
;
CREATE OR REPLACE FUNCTION public.get_public_guild_detail(p_guild_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_result jsonb;
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode='42501';
  end if;

  select jsonb_build_object(
    'guild_id', g.id,
    'name', g.name,
    'level', g.level,
    'xp', g.xp,
    'description', coalesce(g.description,''),
    'approval_required', coalesce(g.approval_required,false),
    'recruitment_mode', g.recruitment_mode,
    'member_count', (select count(*) from public.guild_members gm where gm.guild_id=g.id),
    'member_limit', public.canonical_guild_member_cap(g.id),
    'main_alignment', g.main_alignment,
    'sub_alignment', g.sub_alignment,
    'emblem_url', g.logo_icon,
    'leader_user_id', leader.id,
    'leader_name', coalesce(leader.username,'不在'),
    'leader_favorite_character_id', leader.favorite_character_id,
    'members', coalesce((
      select jsonb_agg(jsonb_build_object(
        'user_id', member_profile.id,
        'username', member_profile.username,
        'favorite_character_id', member_profile.favorite_character_id,
        'role', gm.role,
        'level', member_profile.level
      ) order by
        case gm.role when 'MASTER' then 0 when 'SUB_MASTER' then 1 when 'SUBMASTER' then 1 else 2 end,
        gm.joined_at,
        gm.user_id)
      from public.guild_members gm
      join public.users member_profile on member_profile.id = gm.user_id
      where gm.guild_id = g.id
    ), '[]'::jsonb),
    'controlled_base_ids', coalesce((
      select jsonb_agg(gbc.base_id order by gbc.base_id)
      from public.guild_base_controls gbc
      where gbc.guild_id = g.id and gbc.is_controlling
    ), '[]'::jsonb),
    'active_members_7d', (
      select count(*) from public.guild_members gm
      join public.users member_profile on member_profile.id = gm.user_id
      where gm.guild_id = g.id and member_profile.last_active_at >= now() - interval '7 days'
    ),
    'raid_contribution_7d', coalesce((
      select sum(rdl.raw_damage) from public.raid_damage_logs rdl
      where rdl.guild_id = g.id and rdl.created_at >= now() - interval '7 days'
    ), 0),
    'guild_power', coalesce((
      select sum(upr.total_power) from public.guild_members gm
      join public.user_power_rankings upr on upr.user_id = gm.user_id
      where gm.guild_id = g.id
    ), 0)
  ) into v_result
  from public.guilds g
  left join public.users leader on leader.id = g.leader_id
  where g.id = p_guild_id and not g.is_disbanded;

  if v_result is null then
    raise exception 'Guild not found' using errcode='P0002';
  end if;
  return v_result;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.get_public_guild_power_rankings(p_daily boolean, p_limit integer DEFAULT 100, p_offset integer DEFAULT 0)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_start timestamptz; v_end timestamptz;
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode='42501'; end if;
  if p_limit not between 1 and 100 or p_offset not between 0 and 10000 then raise exception 'invalid pagination' using errcode='22023'; end if;
  v_start:=date_trunc('day',clock_timestamp() at time zone 'Asia/Tokyo') at time zone 'Asia/Tokyo'; v_end:=v_start+interval '1 day';
  return coalesce((select jsonb_agg(to_jsonb(ranked) order by ranked.rank_position) from (
    select aggregated.*,dense_rank() over(order by aggregated.score desc,aggregated.guild_id) rank_position from (
      select guild.id guild_id,guild.name,
        sum(power.total_power)::bigint current_power,
        coalesce(sum(power.total_power) filter(where player.last_active_at>=v_start and player.last_active_at<v_end),0)::bigint daily_power,
        count(*)::integer member_count,
        count(*) filter(where player.last_active_at>=v_start and player.last_active_at<v_end)::integer active_member_count,
        case when p_daily then coalesce(sum(power.total_power) filter(where player.last_active_at>=v_start and player.last_active_at<v_end),0) else sum(power.total_power) end::bigint score
      from public.guilds guild join public.guild_members member on member.guild_id=guild.id
      join public.users player on player.id=member.user_id join public.user_power_rankings power on power.user_id=member.user_id
      group by guild.id,guild.name
    ) aggregated where not p_daily or aggregated.active_member_count>0
    order by score desc,guild_id limit p_limit offset p_offset
  ) ranked),'[]'::jsonb);
end;
$function$
;
CREATE OR REPLACE FUNCTION public.get_public_gvg_rankings(p_limit integer DEFAULT 100, p_offset integer DEFAULT 0)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_season public.ranking_seasons%rowtype;
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode='42501'; end if;
  if p_limit not between 1 and 100 or p_offset not between 0 and 10000 then raise exception 'invalid pagination' using errcode='22023'; end if;
  select * into v_season from public.ranking_seasons where id=public.current_ranking_season_id('GVG');
  return jsonb_build_object('season_id',v_season.id,'starts_at',v_season.starts_at,'ends_at',v_season.ends_at,
    'guild',coalesce((select jsonb_agg(to_jsonb(rows) order by rows.rate desc) from (
      select ranking.guild_id,guild.name guild_name,ranking.rate,ranking.rank_tier,ranking.wins,ranking.losses,
        dense_rank() over(order by ranking.rate desc,ranking.guild_id) rank_position
      from public.gvg_guild_season_rankings ranking join public.guilds guild on guild.id=ranking.guild_id
      where ranking.season_id=v_season.id order by ranking.rate desc,ranking.guild_id limit p_limit offset p_offset) rows),'[]'::jsonb),
    'individual',coalesce((select jsonb_agg(to_jsonb(rows) order by rows.actual_damage desc) from (
      select ranking.user_id,player.username,ranking.guild_id,guild.name guild_name,ranking.actual_damage,
        dense_rank() over(order by ranking.actual_damage desc,ranking.user_id) rank_position
      from public.gvg_individual_season_rankings ranking join public.users player on player.id=ranking.user_id
      left join public.guilds guild on guild.id=ranking.guild_id where ranking.season_id=v_season.id
      order by ranking.actual_damage desc,ranking.user_id limit p_limit offset p_offset) rows),'[]'::jsonb));
end;
$function$
;
CREATE OR REPLACE FUNCTION public.get_public_leader_characters(p_user_ids uuid[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL OR p_user_ids IS NULL OR cardinality(p_user_ids) = 0 THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  RETURN COALESCE((
    SELECT jsonb_agg(to_jsonb(x)) FROM (
      SELECT DISTINCT ON (c.user_id) c.user_id, c.id, c.character_id, c.level
      FROM public.user_characters c
      WHERE c.user_id = ANY(p_user_ids)
      ORDER BY c.user_id, c.level DESC, c.awakening_level DESC, c.id
    ) x
  ), '[]'::jsonb);
END;
$function$
;
CREATE OR REPLACE FUNCTION public.get_public_player_detail(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_result jsonb;
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode='42501'; end if;
  select jsonb_build_object(
    'user_id',player.id,'username',player.username,'avatar_url',player.avatar_url,'bio',player.bio,'level',player.level,
    'guild_id',member.guild_id,'guild_name',guild.name,'total_power',coalesce(power.total_power,0),
    'main_formation',coalesce((select jsonb_agg(jsonb_build_object(
      'slot',formation.slot,'character_master_id',owned.character_id,'display_name',release.display_name,
      'rarity',release.rarity,'asset_identifier',release.asset_path,'level',owned.level,
      'awakening_level',coalesce(owned.awakening_level,0),'character_power',public.calculate_user_character_power(player.id,owned.id)
    ) order by formation.slot)
    from public.user_main_formations formation join public.user_characters owned on owned.id=formation.user_character_id
    join public.character_release_master release on release.character_id=owned.character_id
    where formation.user_id=player.id),'[]'::jsonb)
  ) into v_result
  from public.users player left join public.guild_members member on member.user_id=player.id
  left join public.guilds guild on guild.id=member.guild_id left join public.user_power_rankings power on power.user_id=player.id
  where player.id=p_user_id;
  if v_result is null then raise exception 'public player was not found' using errcode='P0002'; end if;
  return v_result;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.get_public_power_rankings()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ select public.get_public_power_rankings(false,100,0) $function$
;
CREATE OR REPLACE FUNCTION public.get_public_power_rankings(p_daily boolean, p_limit integer DEFAULT 100, p_offset integer DEFAULT 0)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_start timestamptz; v_end timestamptz;
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode='42501'; end if;
  if p_limit not between 1 and 100 or p_offset not between 0 and 10000 then raise exception 'invalid pagination' using errcode='22023'; end if;
  v_start:=date_trunc('day',clock_timestamp() at time zone 'Asia/Tokyo') at time zone 'Asia/Tokyo'; v_end:=v_start+interval '1 day';
  return coalesce((select jsonb_agg(to_jsonb(row_data) order by row_data.rank_position) from (
    select ranking.user_id,player.username,player.avatar_url,ranking.total_power current_power,ranking.updated_at,
      member.guild_id,guild.name guild_name,
      dense_rank() over(order by ranking.total_power desc,ranking.updated_at asc) rank_position,
      (player.last_active_at>=v_start and player.last_active_at<v_end) is_daily_active
    from public.user_power_rankings ranking join public.users player on player.id=ranking.user_id
    left join public.guild_members member on member.user_id=ranking.user_id left join public.guilds guild on guild.id=member.guild_id
    where not p_daily or (player.last_active_at>=v_start and player.last_active_at<v_end)
    order by ranking.total_power desc,ranking.updated_at asc limit p_limit offset p_offset
  ) row_data),'[]'::jsonb);
end;
$function$
;
CREATE OR REPLACE FUNCTION public.get_public_profiles(p_user_ids uuid[])
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if auth.uid() is null or p_user_ids is null or cardinality(p_user_ids) not between 1 and 100 then
    raise exception 'invalid public profile request' using errcode='42501';
  end if;
  return coalesce((select jsonb_agg(to_jsonb(profile)) from (
    select player.id,player.id user_id,player.username,player.avatar_url,player.bio,player.favorite_character_id,
      player.level,player.xp,player.title_equipped,coalesce(title.name,player.title_equipped) title_name,
      member.guild_id,guild.name guild_name,coalesce(power.total_power,0) total_power,
      coalesce((select jsonb_agg(owned.character_id order by formation.slot)
        from public.user_main_formations formation join public.user_characters owned on owned.id=formation.user_character_id
        where formation.user_id=player.id),'[]'::jsonb) main_formation_character_ids
    from public.users player left join public.title_master title on title.id=player.title_equipped
    left join public.guild_members member on member.user_id=player.id left join public.guilds guild on guild.id=member.guild_id
    left join public.user_power_rankings power on power.user_id=player.id where player.id=any(p_user_ids)
  ) profile),'[]'::jsonb);
end;
$function$
;
CREATE OR REPLACE FUNCTION public._raid_room_clear_reward_progress_v1(p_room_id uuid, p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'pg_catalog'
AS $function$
declare v_room public.raid_rooms%rowtype;v_boss public.raid_bosses%rowtype;
 v_rule public.raid_room_clear_reward_rules%rowtype;v_count bigint:=0;v_damage bigint:=0;v_status text;v_min bigint;
begin
 select * into strict v_room from public.raid_rooms where id=p_room_id;
 select * into strict v_boss from public.raid_bosses where id=v_room.raid_boss_instance_id;
 select * into v_rule from public.raid_room_clear_reward_rules where difficulty=v_room.difficulty_id;
 select count(*),coalesce(sum(greatest(coalesce(l.applied_damage,0),0)),0) into v_count,v_damage
 from public.raid_damage_logs l
 join public.battle_replay_sessions b on b.id=l.battle_replay_session_id
 join public.raid_room_battle_start_requests s on s.replay_session_id=b.id and s.user_id=p_user_id 
 join public.raid_rooms sr on sr.id=s.room_id and sr.raid_boss_instance_id=v_room.raid_boss_instance_id
 join public.raid_room_members m on m.room_id=sr.id and m.user_id=p_user_id
 where l.raid_boss_instance_id=v_room.raid_boss_instance_id and l.user_id=p_user_id
  and b.requester_user_id=p_user_id and b.source_reference_id=v_room.raid_boss_instance_id
  and b.battle_mode='RAID' and b.resolution_authority='RAID_SERVER'
  and b.official_context->>'roomId'=sr.id::text
  and b.finalization_status='FINALIZED'
  and b.finalization_result->'lateFinalization'='false'::jsonb; -- Server non-late flag includes the killing battle; finalized_at is written after cleared_at.
 v_min:=ceil(v_boss.max_hp::numeric*v_rule.minimum_contribution_bp/10000)::bigint;
 if not coalesce(v_rule.enabled,false) or v_min is null then v_status:='unknown';
 elsif v_count>0 and (v_room.difficulty_id in ('beginner','intermediate') or v_damage>=v_min) and v_boss.outcome='DEFEAT_SUCCESS' then v_status:='succeeded';
 else v_status:='not_succeeded';end if;
 return jsonb_build_object('finalizedBattles',v_count,'contributionDamage',v_damage,
  'clearGate',jsonb_build_object('status',v_status,'ruleVersion',coalesce(v_rule.rule_version,1),
   'contributionDamage',v_damage,'minimumContributionDamage',v_min,'minimumContributionBp',v_rule.minimum_contribution_bp,
   'comparison','GTE','metric','APPLIED','maxHp',v_boss.max_hp,
   'cleared',coalesce(v_boss.outcome='DEFEAT_SUCCESS',false)));
end $function$
;
CREATE OR REPLACE FUNCTION public.quest_raid_encounter_projection_v1(p_patrol_id uuid)
 RETURNS jsonb
 LANGUAGE sql
 STABLE
 SET search_path TO 'pg_catalog'
AS $function$
 select jsonb_build_object('patrolId',e.patrol_id,'status',e.status,'roomId',e.room_id,'areaId',e.area_id,
 'difficulty',e.difficulty,'bossName',v.raid_name,'leaderId',v.member_character_ids->>0,
 'rewardMultiplier',1,'bonusCash',coalesce(e.bonus_cash,(public._quest_raid_cash_xp_v2(e.patrol_id)->>'cash')::bigint),'bonusUserXp',coalesce(e.bonus_user_xp,(public._quest_raid_cash_xp_v2(e.patrol_id)->>'userXp')::integer),'bonusItems','[]'::jsonb,'acknowledged',e.acknowledged_at is not null,
 'expiresAt',b.expires_at,'ended',b.id is not null and (b.status<>'ACTIVE' or b.current_hp<=0 or b.expires_at<=now() or b.outcome_finalized_at is not null))
 from public.quest_raid_encounters e left join public.canonical_raid_variants v on v.raid_variant_id=e.variant_id
 left join public.raid_rooms r on r.id=e.room_id left join public.raid_bosses b on b.id=r.raid_boss_instance_id
 where e.patrol_id=p_patrol_id
$function$
;
CREATE OR REPLACE FUNCTION public.get_quest_raid_bonus_v1(p_room_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
declare e public.quest_raid_encounters%rowtype; amounts jsonb; receipt public.quest_raid_encounter_bonus_grants%rowtype;
begin
 if auth.uid() is null then raise exception 'authentication required' using errcode='42501';end if;
 perform public.get_raid_room_v1(p_room_id);
 select * into e from public.quest_raid_encounters where room_id=p_room_id and status='CREATED';
 if not found then return null;end if;
 amounts:=public._quest_raid_cash_xp_v2(e.patrol_id);
 select * into receipt from public.quest_raid_encounter_bonus_grants where room_id=p_room_id and user_id=auth.uid();
 return jsonb_build_object('roomId',p_room_id,'rewardMultiplier',1,'items','[]'::jsonb,'delivery','DIRECT',
 'cash',coalesce(receipt.cash,e.bonus_cash,(amounts->>'cash')::bigint),
 'userXp',coalesce(receipt.user_xp,e.bonus_user_xp,(amounts->>'userXp')::integer),
 'issued',receipt.room_id is not null,'legacyIssued',receipt.room_id is not null and receipt.cash is null);
end $function$
;
CREATE OR REPLACE FUNCTION public.get_raid_reward_policy_v2()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
begin
 if auth.uid() is null then raise exception 'authentication required' using errcode='42501';end if;
 return (select jsonb_agg(jsonb_build_object(
 'difficulty',r.difficulty,'enabled',r.enabled and r.minimum_contribution_damage is not null,
 'status',case when r.enabled and r.minimum_contribution_damage is not null then 'ACTIVE' else 'PENDING_CONTRIBUTION' end,
 'version',r.rule_version,
 'eligibility',jsonb_build_object('minimumBattles',1,'minimumContributionBp',r.minimum_contribution_bp,'metric','APPLIED','comparison','GTE'),
 'strategyVersion',case when (select count(*) from public.raid_room_combat_profiles p where p.difficulty_id=r.difficulty and p.profile->>'strategyVersion'='2026-09-14')=7 then '2026-09-14' else null end,
 'instanceItems',(select jsonb_agg(jsonb_build_object('itemId',i.item_id,'quantity',i.quantity) order by i.item_id) from public.raid_room_clear_reward_items i where i.difficulty=r.difficulty),
 'daily',jsonb_build_object('chanceBp',d.chance_bp,'items',d.items)
 ) order by r.difficulty) from public.raid_room_clear_reward_rules r join public.raid_daily_clear_bonus_rules d using(difficulty));
end $function$
;
CREATE OR REPLACE FUNCTION public._quest_raid_cash_xp_v2(p_patrol uuid)
 RETURNS jsonb
 LANGUAGE sql
 STABLE
 SET search_path TO 'pg_catalog'
AS $function$
 select jsonb_build_object('cash',coalesce((p.rewards_accrued->>'base_cash')::bigint,p.base_cash_snapshot,q.cash_reward::bigint),
 'userXp',floor(coalesce((p.rewards_accrued->>'xp')::numeric,q.user_exp::numeric)*0.5)::integer)
 from public.user_patrols p join public.canonical_quest_master q
 on q.version='2026-08-30' and q.quest_id=coalesce(p.course_id,p.quest_id) where p.id=p_patrol
$function$
;
CREATE OR REPLACE FUNCTION public.on_quest_base_cash_snapshot()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
begin
 if TG_OP='INSERT' then
  select cash_reward into new.base_cash_snapshot from public.canonical_quest_master
   where version='2026-08-30' and quest_id=coalesce(new.course_id,new.quest_id);
 elsif new.base_cash_snapshot is distinct from old.base_cash_snapshot then
  raise exception 'Quest base CASH snapshot is immutable' using errcode='23514';
 end if;
 return new;
end $function$
;
CREATE OR REPLACE FUNCTION public.advance_monthly_power_seasons_v1()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
 p public.ranking_seasons%rowtype; g public.ranking_seasons%rowtype;
 pr public.monthly_power_season_runs%rowtype; gr public.monthly_power_season_runs%rowtype;
 v_now timestamptz:=clock_timestamp(); v_start timestamptz;v_end timestamptz;
 pid uuid;gid uuid;closure jsonb;
begin
 perform pg_advisory_xact_lock(hashtextextended('monthly-power:rollover',0));
 lock table public.ranking_seasons in share row exclusive mode;
 -- Never bootstrap Formal Open or adopt unregistered historic/Preopen Seasons.
 select s.* into p from public.ranking_seasons s join public.monthly_power_season_runs r on r.season_id=s.id
 where s.ranking_type='POWER' order by s.starts_at desc limit 1;
 select s.* into g from public.ranking_seasons s join public.monthly_power_season_runs r on r.season_id=s.id
 where s.ranking_type='GUILD_POWER' order by s.starts_at desc limit 1;
 if p.id is null and g.id is null then return jsonb_build_object('status','NOT_STARTED');end if;
 if p.id is null or g.id is null or p.starts_at<>g.starts_at or p.ends_at<>g.ends_at then
  raise exception 'Monthly category boundary mismatch';end if;
 select * into strict pr from public.monthly_power_season_runs where season_id=p.id;
 select * into strict gr from public.monthly_power_season_runs where season_id=g.id;
 if pr.reward_version<>gr.reward_version or pr.eligibility_policy is distinct from gr.eligibility_policy
   or gr.eligibility_policy is distinct from 'CONTINUOUS_JST_DAY1' then
  raise exception 'Monthly category registration mismatch';end if;
 if p.ends_at>v_now then
  if p.status<>'ACTIVE' or g.status<>'ACTIVE' then raise exception 'Current monthly Season requires review';end if;
  return jsonb_build_object('status','ACTIVE','POWER',p.id,'GUILD_POWER',g.id);
 end if;
 -- Reuse only server-side JST calendar bounds, never PVP advance/reward/reset.
 select b.starts_at,b.ends_at into v_start,v_end from public.ranking_period_bounds('PVP',v_now) b;
 if p.ends_at<>v_start then
  raise exception 'Missed monthly boundary requires historical review';end if;
 if exists(select 1 from public.ranking_seasons where ranking_type in('POWER','GUILD_POWER')
   and id not in(p.id,g.id) and (status<>'CLOSED' or starts_at>=v_start)) then
  raise exception 'Conflicting monthly Season state';end if;
 if p.status not in('ACTIVE','FINALIZING','CLOSED') or g.status not in('ACTIVE','FINALIZING','CLOSED')
 or (p.status='CLOSED' and pr.granted_at is null) or (g.status='CLOSED' and gr.granted_at is null) then
  raise exception 'Prior monthly finalization evidence required';end if;
 closure:=public.finalize_due_monthly_power_seasons_v1();
 if exists(select 1 from public.ranking_seasons s join public.monthly_power_season_runs r on r.season_id=s.id
  where s.id in(p.id,g.id) and (s.status<>'CLOSED' or r.granted_at is null)) then
  raise exception 'Prior monthly finalization incomplete';end if;
 insert into public.ranking_seasons(ranking_type,starts_at,ends_at,status)
 values('POWER',v_start,v_end,'ACTIVE') returning id into pid;
 insert into public.ranking_seasons(ranking_type,starts_at,ends_at,status)
 values('GUILD_POWER',v_start,v_end,'ACTIVE') returning id into gid;
 insert into public.monthly_power_season_runs(season_id,reward_version,eligibility_policy)
 values(pid,pr.reward_version,pr.eligibility_policy),(gid,gr.reward_version,gr.eligibility_policy);
 return jsonb_build_object('status','STARTED','POWER',pid,'GUILD_POWER',gid,'starts_at',v_start,'ends_at',v_end,'closed',closure);
end $function$
;
CREATE OR REPLACE FUNCTION private.apply_recommended_main_skills_v1(p_user_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'private'
AS $function$
declare v_member record; v_round integer; v_skill_id uuid; v_skill_count integer:=0;
begin
  perform 1 from public.user_main_formations where user_id=p_user_id order by slot for update;
  perform 1 from public.user_skills where user_id=p_user_id for update;
  update public.user_skills set equipped_character_id=null,slot_index=null
  where user_id=p_user_id and equipped_character_id in (
    select user_character_id::text from public.user_main_formations where user_id=p_user_id
  );
  for v_round in 0..5 loop
    for v_member in
      select formation.slot,owned.id,owned.character_id,owned.awakening_level
      from public.user_main_formations formation join public.user_characters owned on owned.id=formation.user_character_id
      where formation.user_id=p_user_id order by formation.slot
    loop
      if v_round>=public.canonical_skill_slot_count(v_member.awakening_level) then continue; end if;
      select candidate.id into v_skill_id
      from public.user_skills candidate join public.canonical_skill_master master
        on master.version='2026-08-21' and master.skill_id=candidate.skill_card_id
      where candidate.user_id=p_user_id and candidate.equipped_character_id is null
        and (master.exclusive_character_id is null or master.exclusive_character_id=v_member.character_id)
        and (master.exclusive_character_id is null or not exists(
          select 1 from public.user_skills equipped join public.canonical_skill_master equipped_master
            on equipped_master.version='2026-08-21' and equipped_master.skill_id=equipped.skill_card_id
          where equipped.user_id=p_user_id and equipped.equipped_character_id=v_member.id::text
            and equipped_master.exclusive_character_id is not null))
      order by (master.exclusive_character_id=v_member.character_id) desc nulls last,coalesce(candidate.plus_val,0) desc,
        case master.rarity when 'SSR' then 4 when 'SR' then 3 when 'R' then 2 else 1 end desc,
        master.skill_id,candidate.id limit 1;
      if v_skill_id is not null then
        update public.user_skills set equipped_character_id=v_member.id::text,slot_index=v_round where id=v_skill_id;
        v_skill_count:=v_skill_count+1;
      end if;
      v_skill_id:=null;
    end loop;
  end loop;
  return v_skill_count;
end;
$function$
;
CREATE OR REPLACE FUNCTION public._exchange_pity_reward_per_banner(p_user_id uuid, p_reward_type text, p_reward_id text, p_gacha_id text)
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
  WHERE user_id = p_user_id AND pity_master_id = ('pity_banner:'||p_gacha_id)
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
  WHERE user_id = p_user_id AND pity_master_id = ('pity_banner:'||p_gacha_id);

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
