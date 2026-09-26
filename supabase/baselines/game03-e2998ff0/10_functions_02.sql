SET check_function_bodies = false;
SET search_path = public, extensions, pg_catalog;
CREATE OR REPLACE FUNCTION public.create_bbs_thread(p_category text, p_title text, p_content text)
 RETURNS bbs_threads
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_thread public.bbs_threads;
  v_username TEXT;
  v_avatar_url TEXT;
BEGIN
  IF auth.uid() IS NULL OR p_category NOT IN ('RECRUIT', 'STRATEGY_CHAT') OR p_title IS NULL OR p_content IS NULL OR char_length(trim(p_title)) NOT BETWEEN 1 AND 50 OR char_length(trim(p_content)) NOT BETWEEN 1 AND 200 THEN
    RAISE EXCEPTION 'Invalid BBS thread';
  END IF;
  SELECT username, avatar_url INTO v_username, v_avatar_url FROM public.users WHERE id = auth.uid();
  INSERT INTO public.bbs_threads (category, title, content, user_id, author_name, author_avatar_url)
  VALUES (p_category, trim(p_title), trim(p_content), auth.uid(), COALESCE(v_username, 'Player'), v_avatar_url)
  RETURNING * INTO v_thread;
  RETURN v_thread;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.create_guild(p_user_id uuid, p_guild_name text, p_guild_description text, p_guild_logo text, p_guild_color text, p_creation_cost integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_cash INTEGER;
    v_new_guild_id UUID;
BEGIN
    SELECT cash INTO v_cash FROM public.users WHERE id = p_user_id;
    IF v_cash IS NULL OR v_cash < p_creation_cost THEN
        RETURN jsonb_build_object('error', 'キャッシュが不足しています。');
    END IF;

    INSERT INTO public.guilds (name, description, logo_icon, color_theme, level, xp, cash, approval_required, auto_kick_days)
    VALUES (p_guild_name, p_guild_description, COALESCE(p_guild_logo, 'guild_icon_default.png'), COALESCE(p_guild_color, 'red'), 1, 0, 0, false, 7)
    RETURNING id INTO v_new_guild_id;

    INSERT INTO public.guild_members (guild_id, user_id, role)
    VALUES (v_new_guild_id, p_user_id, 'MASTER');

    UPDATE public.users SET cash = cash - p_creation_cost, guild_id = v_new_guild_id WHERE id = p_user_id;

    PERFORM public.evaluate_mission_progress(p_user_id, 'GUILD_JOIN', 1);
    RETURN jsonb_build_object('guild_id', v_new_guild_id);
END;
$function$
;
CREATE OR REPLACE FUNCTION public.create_guild_v2(p_user_id uuid, p_guild_name text, p_creation_cost integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_user public.users%rowtype; v_name text:=trim(coalesce(p_guild_name,'')); v_guild uuid;
begin
 if auth.uid() is null or auth.uid()<>p_user_id then raise exception 'Only the current user can create a guild' using errcode='42501'; end if;
 if char_length(v_name) not between 1 and 12 or p_creation_cost<>500 then raise exception 'Invalid guild creation request' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text||':guild-create',0));
 select * into v_user from public.users where id=auth.uid() for update;
 if not found or v_user.level<5 or v_user.cash<500 then raise exception 'Guild creation requirements are not met' using errcode='P0001'; end if;
 if v_user.guild_id is not null or exists(select 1 from public.guild_members where user_id=auth.uid()) then raise exception 'Leave the current guild before creating another guild' using errcode='23505'; end if;
 perform 1 from public.guilds where lower(trim(name))=lower(v_name) and not is_disbanded for update;
 if found then raise exception 'Guild name is already in use' using errcode='23505'; end if;
 update public.guild_join_requests set status='CANCELLED',reviewed_at=now(),reviewed_by=auth.uid() where user_id=auth.uid() and status='PENDING';
 insert into public.guilds(name,leader_id,level,xp,funds,recruitment_mode,approval_required) values(v_name,auth.uid(),1,0,0,'OPEN_JOIN',false) returning id into v_guild;
 insert into public.guild_members(guild_id,user_id,role,weekly_contribution,total_contribution) values(v_guild,auth.uid(),'MASTER',0,0);
 update public.users set cash=cash-500,guild_id=v_guild where id=auth.uid();
 perform public.evaluate_mission_progress(auth.uid(),'GUILD_JOIN',1);
 return jsonb_build_object('status','success','guild_id',v_guild,'cash_spent',500);
end $function$
;
CREATE OR REPLACE FUNCTION public.create_gvg_match_session(p_session_key text, p_scheduled_start_at timestamp with time zone, p_scheduled_end_at timestamp with time zone, p_guild_a_id uuid, p_guild_b_id uuid, p_guild_a_phase_hp bigint, p_guild_b_phase_hp bigint, p_npc_guild_name text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_match_id UUID;
BEGIN
  IF p_scheduled_end_at <= p_scheduled_start_at THEN RAISE EXCEPTION 'Invalid GvG schedule'; END IF;
  IF p_guild_a_phase_hp < 1 OR p_guild_b_phase_hp < 1 THEN RAISE EXCEPTION 'Invalid GvG phase HP'; END IF;
  IF p_guild_b_id IS NOT NULL AND p_guild_a_id = p_guild_b_id THEN RAISE EXCEPTION 'A guild cannot match itself'; END IF;
  IF EXISTS (
    SELECT 1 FROM public.gvg_match_sessions existing
    WHERE existing.session_key = p_session_key
      AND (existing.guild_a_id IN (p_guild_a_id, p_guild_b_id) OR existing.guild_b_id IN (p_guild_a_id, p_guild_b_id))
      AND existing.status IN ('MATCHING', 'CONFIRMED', 'ACTIVE')
  ) THEN RAISE EXCEPTION 'Guild already has a match in this GvG slot'; END IF;

  INSERT INTO public.gvg_match_sessions (
    session_key, scheduled_start_at, scheduled_end_at, status, is_npc_match,
    guild_a_id, guild_b_id, npc_guild_name,
    guild_a_phase_max_hp, guild_b_phase_max_hp, guild_a_phase_hp, guild_b_phase_hp
  ) VALUES (
    p_session_key, p_scheduled_start_at, p_scheduled_end_at, 'MATCHING', p_guild_b_id IS NULL,
    p_guild_a_id, p_guild_b_id, p_npc_guild_name,
    p_guild_a_phase_hp, p_guild_b_phase_hp, p_guild_a_phase_hp, p_guild_b_phase_hp
  ) RETURNING id INTO v_match_id;

  PERFORM public.snapshot_gvg_match_members(v_match_id);
  RETURN v_match_id;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.current_gameplay_reset_eligibility(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if p_user_id is null or not exists(select 1 from public.users where id=p_user_id) then
    return jsonb_build_object('eligible',false,'reason','UNSUPPORTED');
  end if;
  if exists(select 1 from public.payment_transactions where user_id=p_user_id)
    or exists(select 1 from public.user_shop_purchases where user_id=p_user_id)
    or exists(select 1 from public.user_monthly_passes where user_id=p_user_id) then
    return jsonb_build_object('eligible',false,'reason','PAYMENT');
  end if;
  if exists(select 1 from public.guild_members where user_id=p_user_id)
    or exists(select 1 from public.guilds where leader_id=p_user_id) then
    return jsonb_build_object('eligible',false,'reason','GUILD');
  end if;
  if exists(select 1 from public.user_patrols where user_id=p_user_id and status<>'COMPLETED')
    or exists(select 1 from public.battle_replay_sessions where requester_user_id=p_user_id
      and (status='PENDING' or finalization_status='PENDING')) then
    return jsonb_build_object('eligible',false,'reason','ACTIVE_GAMEPLAY');
  end if;
  if not exists(select 1 from public.user_lifetime_onboarding_grants where user_id=p_user_id) then
    return jsonb_build_object('eligible',false,'reason','UNSUPPORTED');
  end if;
  return jsonb_build_object('eligible',true,'reason',null);
end;
$function$
;
CREATE OR REPLACE FUNCTION public.defer_tutorial_authentication()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth', 'pg_temp'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_progress public.tutorial_progress%rowtype;
begin
  if v_user_id is null then
    raise exception 'Authentication is required' using errcode = '28000';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text, 0));

  select * into v_progress
  from public.tutorial_progress
  where user_id = v_user_id
  for update;

  if not found or v_progress.step_id <> 'COMPLETE' then
    raise exception 'Tutorial completion is required' using errcode = '23514';
  end if;
  if v_progress.authentication_pending then
    return 'COMPLETE';
  end if;
  if coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) is not true
     or not exists(select 1 from auth.users where id = v_user_id and is_anonymous is true) then
    raise exception 'Only the current anonymous account can defer authentication' using errcode = '42501';
  end if;
  if exists(select 1 from public.user_account_auth_methods where user_id = v_user_id)
     or exists(select 1 from auth.identities where user_id = v_user_id and provider <> 'anonymous') then
    raise exception 'A connected identity cannot defer authentication' using errcode = '42501';
  end if;

  update public.tutorial_progress
  set authentication_pending = true,
      completed_at = coalesce(completed_at, now()),
      updated_at = now()
  where user_id = v_user_id;

  return 'COMPLETE';
end;
$function$
;
CREATE OR REPLACE FUNCTION public.discard_current_anonymous_account_for_switch()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth', 'pg_temp'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_auth_user auth.users%rowtype;
  v_deleted_public integer := 0;
  v_deleted_auth integer := 0;
begin
  if v_user_id is null then
    raise exception 'Authentication is required' using errcode = '28000';
  end if;

  select * into v_auth_user
  from auth.users
  where id = v_user_id
  for update;

  if not found then
    raise exception 'Authenticated user was not found' using errcode = 'P0002';
  end if;
  if v_auth_user.is_anonymous is not true
     or coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) is not true then
    raise exception 'Only the current anonymous account can be discarded' using errcode = '42501';
  end if;

  perform 1 from public.users where id = v_user_id for update;
  if not found then
    raise exception 'Anonymous gameplay profile was not found' using errcode = 'P0002';
  end if;

  if exists(select 1 from public.user_account_auth_methods row where row.user_id = v_user_id)
     or exists(select 1 from auth.identities row where row.user_id = v_user_id and row.provider <> 'anonymous') then
    raise exception 'A formally connected identity cannot be discarded' using errcode = '42501';
  end if;

  -- External, competitive, guild, invite and financial attribution must never
  -- be cascaded by account switching. Operations review is required instead.
  if exists(select 1 from public.payment_transactions row where row.user_id = v_user_id)
     or exists(select 1 from public.user_monthly_passes row where row.user_id = v_user_id)
     or exists(select 1 from public.user_invitations row where row.inviter_user_id = v_user_id or row.invitee_user_id = v_user_id)
     or exists(select 1 from public.user_friends row where row.user_id = v_user_id or row.friend_id = v_user_id)
     or exists(select 1 from public.guild_members row where row.user_id = v_user_id)
     or exists(select 1 from public.guilds row where row.leader_id = v_user_id)
     or exists(select 1 from public.guild_exp_daily_ledger row where row.user_id = v_user_id)
     or exists(select 1 from public.guild_exp_daily_progress row where row.user_id = v_user_id)
     or exists(select 1 from public.raid_damage_logs row where row.user_id = v_user_id)
     or exists(select 1 from public.raid_reward_grants row where row.user_id = v_user_id)
     or exists(select 1 from public.raid_production_reward_grants row where row.user_id = v_user_id)
     or exists(select 1 from public.raid_completion_xp_grants row where row.user_id = v_user_id)
     or exists(select 1 from public.raid_instance_user_progress row where row.user_id = v_user_id)
     or exists(select 1 from public.user_raid_daily_attempts row where row.user_id = v_user_id)
     or exists(select 1 from public.pvp_defense_logs row where row.user_id = v_user_id)
     or exists(select 1 from public.pvp_ranking_reward_grants row where row.user_id = v_user_id)
     or exists(select 1 from public.pvp_daily_wins row where row.user_id = v_user_id)
     or exists(select 1 from public.gvg_attack_logs row where row.attacker_user_id = v_user_id)
     or exists(select 1 from public.gvg_individual_season_rankings row where row.user_id = v_user_id) then
    raise exception 'Anonymous account has protected history and cannot be discarded' using errcode = '55000';
  end if;

  delete from public.users where id = v_user_id;
  get diagnostics v_deleted_public = row_count;
  if v_deleted_public <> 1 then
    raise exception 'Anonymous gameplay profile discard did not complete' using errcode = 'P0001';
  end if;

  delete from auth.users where id = v_user_id;
  get diagnostics v_deleted_auth = row_count;
  if v_deleted_auth <> 1 then
    raise exception 'Anonymous auth account discard did not complete' using errcode = 'P0001';
  end if;

  return jsonb_build_object(
    'status', 'DISCARDED',
    'discardedUserId', v_user_id,
    'gameplayMerged', false
  );
end;
$function$
;
CREATE OR REPLACE FUNCTION public.dispatch_completed_free_normal_gacha_mission()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if new.status = 'COMPLETED'
    and old.status is distinct from new.status
    and new.payment_source = 'free'
    and new.pull_count = 10
    and new.gacha_id in ('CHAR_NORMAL', 'SKILL_NORMAL', 'EQUIP_NORMAL') then
    perform public.evaluate_mission_progress(new.user_id, 'GACHA_PULL', 1);
  end if;
  return new;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.dispatch_guild_chat_mission()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid := coalesce(new.user_id, new.author_id);
begin
  if new.target_type = 'GUILD'
    and not coalesce(new.is_system, false)
    and v_user_id is not null then
    perform public.evaluate_mission_progress(v_user_id, 'GUILD_CHAT', 1);
  end if;
  return new;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.distribute_ranking_rewards()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- This is a stub for real ranking distribution logic
    -- In actual implementation, this will query user_power_rankings etc.
    -- and insert into user_presents.
    RETURN jsonb_build_object('success', true);
END;
$function$
;
CREATE OR REPLACE FUNCTION public.donate_to_guild(p_user_id uuid, p_guild_id uuid, p_amount integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_cash bigint;v_inserted integer;v_result jsonb;v_day date:=public.guild_jst_date();
begin if auth.uid() is null or auth.uid()<>p_user_id or p_amount<>5000 then raise exception 'Invalid Production donation'; end if;
 if not exists(select 1 from public.guild_members where guild_id=p_guild_id and user_id=auth.uid()) then raise exception 'Guild membership required'; end if;
 select cash into v_cash from public.users where id=auth.uid() for update; if v_cash<5000 then raise exception 'Insufficient cash'; end if;
 perform 1 from public.guilds where id=p_guild_id and not is_disbanded for update; if not found then raise exception 'Active guild not found'; end if;
 insert into public.guild_exp_daily_ledger(guild_id,user_id,source,jst_date,exp_granted) values(p_guild_id,auth.uid(),'DONATION',v_day,20)
 on conflict(guild_id,user_id,source,jst_date) do nothing; get diagnostics v_inserted=row_count;
 if v_inserted=0 then raise exception 'Guild donation already completed today'; end if;
 update public.users set cash=cash-5000 where id=auth.uid() returning cash into v_cash;
 update public.guilds set funds=coalesce(funds,0)+5000 where id=p_guild_id;
 v_result:=public.apply_canonical_guild_exp(p_guild_id,20);
 return jsonb_build_object('status','success','next_cash',v_cash,'xp_gained',20,'guild',v_result); end $function$
;
CREATE OR REPLACE FUNCTION public.enforce_guild_member_cap()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_level INTEGER;
  v_cap INTEGER;
  v_count INTEGER;
BEGIN
  IF TG_OP <> 'INSERT' THEN RETURN NEW; END IF;
  SELECT level INTO v_level FROM public.guilds WHERE id = NEW.guild_id FOR UPDATE;
  IF v_level IS NULL THEN RAISE EXCEPTION 'Guild not found'; END IF;
  SELECT max_members INTO v_cap FROM public.guild_level_master WHERE level = v_level;
  v_cap := LEAST(COALESCE(v_cap, 10), 20);
  SELECT count(*) INTO v_count FROM public.guild_members WHERE guild_id = NEW.guild_id;
  IF v_count >= v_cap THEN RAISE EXCEPTION 'Guild member limit reached (% members)', v_cap; END IF;
  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.equip_guild_cosmetic(p_guild_id uuid, p_slot text, p_cosmetic_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE v_role text;
BEGIN
 IF p_slot='GUILD_EMBLEM' THEN RETURN public.set_guild_emblem(p_guild_id,p_cosmetic_id); END IF;
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'authentication required' USING ERRCODE='42501'; END IF;
 PERFORM 1 FROM public.guilds WHERE id=p_guild_id AND NOT is_disbanded FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'active guild required'; END IF;
 SELECT role INTO v_role FROM public.guild_members WHERE guild_id=p_guild_id AND user_id=auth.uid() FOR UPDATE;
 IF v_role IS DISTINCT FROM 'MASTER' THEN RAISE EXCEPTION 'guild master permission required' USING ERRCODE='42501'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.guild_cosmetics gc JOIN public.cosmetic_master cm ON cm.id=gc.cosmetic_id
 WHERE gc.guild_id=p_guild_id AND gc.cosmetic_id=p_cosmetic_id AND cm.owner_scope='GUILD' AND cm.slot=p_slot AND cm.active
 AND (gc.expires_at IS NULL OR gc.expires_at>now())) THEN RAISE EXCEPTION 'guild cosmetic is not owned or is unavailable'; END IF;
 INSERT INTO public.guild_equipped_cosmetics(guild_id,slot,cosmetic_id) VALUES(p_guild_id,p_slot,p_cosmetic_id)
 ON CONFLICT(guild_id,slot) DO UPDATE SET cosmetic_id=EXCLUDED.cosmetic_id,equipped_at=now();
 IF p_slot='GUILD_BASE_BACKGROUND' THEN UPDATE public.guilds SET equipped_decoration=p_cosmetic_id WHERE id=p_guild_id; END IF;
 IF p_slot='GUILD_BANNER' THEN UPDATE public.guilds SET equipped_banner=p_cosmetic_id WHERE id=p_guild_id; END IF;
 RETURN jsonb_build_object('status','success');
END $function$
;
CREATE OR REPLACE FUNCTION public.process_gvg_battle_result_v2(p_user_id uuid, p_guild_id uuid, p_base_id text, p_is_practice boolean, p_is_win boolean)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF p_is_practice THEN RETURN jsonb_build_object('status', 'success', 'practice', true); END IF;
  RAISE EXCEPTION 'Official GvG results must be resolved through resolve-battle';
END;
$function$
;
CREATE OR REPLACE FUNCTION public.resolve_quest_raid_encounter_v1(p_patrol_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
declare
 uid uuid:=auth.uid(); e public.quest_raid_encounters%rowtype; cfg public.quest_raid_encounter_settings%rowtype;
 progress public.quest_raid_encounter_progress%rowtype; variant public.canonical_raid_variants%rowtype;
 rule public.raid_room_lifecycle_rules%rowtype; power bigint; lvl integer; options jsonb:='[]'; opt jsonb;
 total_weight integer:=0; draw integer; instance_id uuid; new_room uuid; created_time timestamptz; bonus jsonb; active_count integer; launch_profile jsonb;
begin
 if uid is null then raise exception 'authentication required' using errcode='42501';end if;
 if current_setting('transaction_isolation')<>'read committed' then raise exception 'read committed required' using errcode='25001';end if;
 -- Same lock order as manual creation. Claims do not lock Encounter progress.
 select level into lvl from public.users where id=uid for no key update;
 if not found then raise exception 'user unavailable' using errcode='42501';end if;
 select * into e from public.quest_raid_encounters where patrol_id=p_patrol_id and user_id=uid for update;
 if not found then return jsonb_build_object('status','NO_ENCOUNTER','patrolId',p_patrol_id);end if;
 if e.status in ('CREATED','NO_ENCOUNTER') then return public.quest_raid_encounter_projection_v1(p_patrol_id);end if;
 select * into cfg from public.quest_raid_encounter_settings where singleton for share;
 if not cfg.enabled or not exists(select 1 from public.raid_room_creation_settings where singleton and enabled) or lvl<5 then
  return jsonb_build_object('status','DEFERRED','patrolId',p_patrol_id);
 end if;
 select count(*) into active_count from public.quest_raid_encounters x join public.raid_rooms r on r.id=x.room_id
 join public.raid_bosses b on b.id=r.raid_boss_instance_id where x.user_id=uid and b.status='ACTIVE' and b.current_hp>0 and b.expires_at>now() and b.outcome_finalized_at is null;
 if active_count>=cfg.personal_active_limit then
  if e.status='PENDING' then update public.quest_raid_encounters set status='NO_ENCOUNTER' where patrol_id=p_patrol_id;end if;
  return jsonb_build_object('status','DEFERRED','patrolId',p_patrol_id);
 end if;
 power:=public.calculate_user_total_power(uid);
 insert into public.quest_raid_encounter_progress(user_id) values(uid) on conflict do nothing;
 select * into progress from public.quest_raid_encounter_progress where user_id=uid for update;
 if e.status='PENDING' then
  select * into variant from public.canonical_raid_variants where lower(area_id)=e.area_id and is_production_enabled order by raid_variant_id limit 1;
  if not found then return jsonb_build_object('status','DEFERRED','patrolId',p_patrol_id);end if;
  if not cfg.allow_outside_daily and not exists(select 1 from jsonb_array_elements(private.raid_daily_targets_v1()->'targets') t where t->>'variantId'=variant.raid_variant_id) then
   return jsonb_build_object('status','DEFERRED','patrolId',p_patrol_id);
  end if;
  for opt in select jsonb_build_object('difficulty',d,'weight',w) from (values ('beginner',cfg.beginner_weight),('intermediate',cfg.intermediate_weight),('advanced',cfg.advanced_weight)) a(d,w) where w>0 loop
   if (public._raid_room_power_gate_v1(opt->>'difficulty',power)->>'status')='passed' then
    options:=options||jsonb_build_array(opt);total_weight:=total_weight+(opt->>'weight')::integer;
   end if;
  end loop;
  if total_weight=0 then return jsonb_build_object('status','DEFERRED','patrolId',p_patrol_id);end if;
  draw:=floor(random()*total_weight)::integer;
  for opt in select * from jsonb_array_elements(options) loop
   draw:=draw-(opt->>'weight')::integer;
   if draw<0 then e.difficulty:=opt->>'difficulty';exit;end if;
  end loop;
  -- Capacity is checked before the occurrence roll so cap failures do not consume the guarantee.
  select * into rule from public.raid_room_lifecycle_rules where difficulty=e.difficulty for update;
  select count(*) into active_count from public.raid_rooms r join public.raid_bosses b on b.id=r.raid_boss_instance_id
   where r.difficulty_id=e.difficulty and b.status='ACTIVE' and b.current_hp>0 and b.expires_at>now() and b.outcome_finalized_at is null;
  if active_count>=rule.max_active_rooms then
   update public.quest_raid_encounters set status='NO_ENCOUNTER' where patrol_id=p_patrol_id;
   return jsonb_build_object('status','DEFERRED','patrolId',p_patrol_id);
  end if;
  if progress.misses<cfg.guaranteed_after-1 and floor(random()*10000)>=cfg.probability_bp then
   update public.quest_raid_encounters set status='NO_ENCOUNTER',rule_version=cfg.version where patrol_id=p_patrol_id;
   update public.quest_raid_encounter_progress set misses=misses+1 where user_id=uid;
   return public.quest_raid_encounter_projection_v1(p_patrol_id);
  end if;
  bonus:='[]'::jsonb;
  update public.quest_raid_encounters set status='DRAWN',difficulty=e.difficulty,variant_id=variant.raid_variant_id,rule_version=cfg.version,bonus_items='[]'::jsonb,reward_multiplier=1,bonus_cash=(public._quest_raid_cash_xp_v2(p_patrol_id)->>'cash')::bigint,bonus_user_xp=(public._quest_raid_cash_xp_v2(p_patrol_id)->>'userXp')::integer where patrol_id=p_patrol_id returning * into e;
 end if;
 -- Once drawn, retry the same difficulty/Boss. Never reroll a failed creation.
 select * into variant from public.canonical_raid_variants where raid_variant_id=e.variant_id and is_production_enabled;
 if not found or (public._raid_room_power_gate_v1(e.difficulty,power)->>'status') is distinct from 'passed' then return jsonb_build_object('status','DEFERRED','patrolId',p_patrol_id);end if;
 select * into rule from public.raid_room_lifecycle_rules where difficulty=e.difficulty for update;
 select count(*) into active_count from public.raid_rooms r join public.raid_bosses b on b.id=r.raid_boss_instance_id
  where r.difficulty_id=e.difficulty and b.status='ACTIVE' and b.current_hp>0 and b.expires_at>now() and b.outcome_finalized_at is null;
 if active_count>=rule.max_active_rooms then return jsonb_build_object('status','DEFERRED','patrolId',p_patrol_id);end if;
 -- Registration, lifecycle, battle and membership remain the existing Raid authority.
 begin
  -- Same difficulty-specific profile and HP authority as create_raid_room_v1.
  -- Missing/invalid profile leaves DRAWN retryable; no partial Boss/Room can survive.
  select profile into launch_profile from public.raid_room_combat_profiles
   where raid_variant_id=e.variant_id and difficulty_id=e.difficulty;
  if not found then raise exception 'raid launch profile unavailable' using errcode='55000';end if;
  variant.max_hp:=(launch_profile->>'maxHp')::bigint;
  if variant.max_hp is null or variant.max_hp<=0 then raise exception 'invalid raid launch HP' using errcode='22023';end if;
  instance_id:=gen_random_uuid();created_time:=clock_timestamp();
  insert into public.raid_bosses(id,boss_id,boss_master_id,current_hp,max_hp,base_id,status,spawned_at,expires_at,cycle_id,rotation_date,raid_variant_id,raid_day_key)
  values(instance_id,variant.raid_variant_id,variant.raid_variant_id,variant.max_hp,variant.max_hp,lower(variant.area_id),'ACTIVE',created_time,created_time+make_interval(hours=>rule.duration_hours),gen_random_uuid(),(created_time at time zone 'Asia/Tokyo')::date,variant.raid_variant_id,'ROOM:'||instance_id::text);
  new_room:=(public._raid_room_register_v1(instance_id,uid,e.difficulty)->>'roomId')::uuid;
  insert into public.raid_room_combat_snapshots(room_id,profile,enemy_snapshot)
   values(new_room,launch_profile,public._raid_room_launch_enemy_snapshot_v1(launch_profile,instance_id,variant.max_hp));
  update public.quest_raid_encounters set status='CREATED',room_id=new_room where patrol_id=p_patrol_id;
  update public.quest_raid_encounter_progress set first_created=true,misses=0 where user_id=uid;
 exception when others then
  -- Keep DRAWN on generation failure. The Quest reward was a separate committed transaction.
  return jsonb_build_object('status','DEFERRED','patrolId',p_patrol_id,'reason','CREATE_FAILED');
 end;
 return public.quest_raid_encounter_projection_v1(p_patrol_id);
end $function$
;
CREATE OR REPLACE FUNCTION public.list_guild_emblems(p_guild_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'authentication required' USING ERRCODE='42501'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.guilds g JOIN public.guild_members gm ON gm.guild_id=g.id
 WHERE g.id=p_guild_id AND NOT g.is_disbanded AND gm.user_id=auth.uid()) THEN
 RAISE EXCEPTION 'guild membership required' USING ERRCODE='42501'; END IF;
 RETURN (SELECT coalesce(jsonb_agg(jsonb_build_object('id',cm.id,'display_name',cm.display_name,'asset_path',cm.asset_key)
 ORDER BY coalesce((cm.metadata->>'sort_order')::integer,999),cm.id),'[]'::jsonb)
 FROM public.cosmetic_master cm WHERE cm.owner_scope='GUILD' AND cm.slot='GUILD_EMBLEM' AND cm.active
 AND (cm.metadata @> '{"standard":true}'::jsonb OR EXISTS(SELECT 1 FROM public.guild_cosmetics gc
 WHERE gc.guild_id=p_guild_id AND gc.cosmetic_id=cm.id AND (gc.expires_at IS NULL OR gc.expires_at>now()))));
END $function$
;
CREATE OR REPLACE FUNCTION public.get_guild_emblems(p_guild_ids uuid[])
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'authentication required' USING ERRCODE='42501'; END IF;
 IF cardinality(p_guild_ids)>500 THEN RAISE EXCEPTION 'too many guild ids' USING ERRCODE='22023'; END IF;
 RETURN (SELECT coalesce(jsonb_agg(jsonb_build_object('guild_id',g.id,
 'emblem_id',coalesce(chosen.id,'guild_standard_01'),
 'asset_path',coalesce(chosen.asset_key,CASE WHEN NOT EXISTS(SELECT 1 FROM public.guild_equipped_cosmetics old WHERE old.guild_id=g.id AND old.slot='GUILD_EMBLEM') THEN nullif(g.logo_icon,'') END,'/guild-emblems/guild_standard_01.svg')) ORDER BY g.id),'[]'::jsonb)
 FROM public.guilds g LEFT JOIN LATERAL (
 SELECT cm.id,cm.asset_key FROM public.guild_equipped_cosmetics ec
 JOIN public.cosmetic_master cm ON cm.id=ec.cosmetic_id
 WHERE ec.guild_id=g.id AND ec.slot='GUILD_EMBLEM' AND cm.slot='GUILD_EMBLEM' AND cm.owner_scope='GUILD' AND cm.active
 AND (cm.metadata @> '{"standard":true}'::jsonb OR EXISTS(SELECT 1 FROM public.guild_cosmetics gc
 WHERE gc.guild_id=g.id AND gc.cosmetic_id=cm.id AND (gc.expires_at IS NULL OR gc.expires_at>now())))
 ) chosen ON true WHERE g.id=ANY(p_guild_ids) AND NOT g.is_disbanded);
END $function$
;
CREATE OR REPLACE FUNCTION public.set_guild_emblem(p_guild_id uuid, p_emblem_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE v_role text; v_asset text;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'authentication required' USING ERRCODE='42501'; END IF;
 -- Same guild -> membership lock order as leave/transfer authority.
 PERFORM 1 FROM public.guilds WHERE id=p_guild_id AND NOT is_disbanded FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'active guild required' USING ERRCODE='22023'; END IF;
 SELECT role INTO v_role FROM public.guild_members WHERE guild_id=p_guild_id AND user_id=auth.uid() FOR UPDATE;
 IF v_role IS NULL OR v_role NOT IN ('MASTER','SUB_MASTER') THEN
 RAISE EXCEPTION 'guild master or sub master permission required' USING ERRCODE='42501'; END IF;
 SELECT cm.asset_key INTO v_asset FROM public.cosmetic_master cm
 WHERE cm.id=p_emblem_id AND cm.owner_scope='GUILD' AND cm.slot='GUILD_EMBLEM' AND cm.active
 AND (cm.metadata @> '{"standard":true}'::jsonb OR EXISTS(SELECT 1 FROM public.guild_cosmetics gc
 WHERE gc.guild_id=p_guild_id AND gc.cosmetic_id=cm.id AND (gc.expires_at IS NULL OR gc.expires_at>now()))) FOR SHARE;
 IF NOT FOUND OR v_asset IS NULL THEN RAISE EXCEPTION 'guild emblem is unavailable' USING ERRCODE='22023'; END IF;
 INSERT INTO public.guild_equipped_cosmetics(guild_id,slot,cosmetic_id) VALUES(p_guild_id,'GUILD_EMBLEM',p_emblem_id)
 ON CONFLICT(guild_id,slot) DO UPDATE SET cosmetic_id=EXCLUDED.cosmetic_id,equipped_at=now();
 UPDATE public.guilds SET logo_icon=v_asset WHERE id=p_guild_id;
 RETURN jsonb_build_object('status','success','guild_id',p_guild_id,'emblem_id',p_emblem_id,'asset_path',v_asset);
END $function$
;
CREATE OR REPLACE FUNCTION public.initialize_guild_emblem()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
 INSERT INTO public.guild_equipped_cosmetics(guild_id,slot,cosmetic_id)
 VALUES(NEW.id,'GUILD_EMBLEM','guild_standard_01') ON CONFLICT(guild_id,slot) DO NOTHING;
 IF nullif(NEW.logo_icon,'') IS NULL THEN UPDATE public.guilds
 SET logo_icon='/guild-emblems/guild_standard_01.svg' WHERE id=NEW.id; END IF;
 RETURN NEW;
END $function$
;
CREATE OR REPLACE FUNCTION public.set_profile_leader_v1(p_character_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if p_character_id is null or btrim(p_character_id) = '' then
    raise exception 'character id required' using errcode = '22023';
  end if;

  -- Serialize profile changes, then keep ownership stable through the update.
  perform 1 from public.users where id = v_user_id for update;
  if not found then
    raise exception 'profile not found' using errcode = 'P0002';
  end if;
  perform 1 from public.user_characters
  where user_id = v_user_id and character_id = p_character_id
  for key share;
  if not found then
    raise exception 'owned character not found' using errcode = 'P0002';
  end if;

  update public.users set favorite_character_id = p_character_id
  where id = v_user_id and favorite_character_id is distinct from p_character_id;
  return jsonb_build_object('status', 'success', 'favorite_character_id', p_character_id);
end;
$function$
;
CREATE OR REPLACE FUNCTION public.create_patrol_battle_replay(p_patrol_id uuid, p_tactic_id text DEFAULT 'ATTACK_PRIORITY'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_uid uuid:=auth.uid(); v_patrol public.user_patrols%rowtype; v_ids text[]; v_player jsonb; v_enemy jsonb; v_replay uuid; v_seed bigint; v_enemy_tactic text;
begin
 if v_uid is null then raise exception 'authentication required' using errcode='42501'; end if;
 if p_tactic_id not in('ATTACK_PRIORITY','HEAL_PRIORITY','SKILL_PRIORITY','BALANCED','WEAKNESS_FOCUS') then raise exception 'invalid tactic' using errcode='22023'; end if;
 select * into v_patrol from public.user_patrols where id=p_patrol_id and user_id=v_uid and (status='CLAIMABLE' or(status='ONGOING' and expires_at<=now())) and has_battle_event and not coalesce(battle_resolved,false) for update;
 if not found or v_patrol.encounter_snapshot is null then raise exception 'eligible patrol encounter not found' using errcode='P0002'; end if;
 update public.user_patrols set status='CLAIMABLE' where id=p_patrol_id and status='ONGOING';
 -- Read the saved Main Formation for every new battle, in saved slot order.
 -- Exploration ownership/bonus stays on user_patrols and never selects combatants.
 select array_agg(entry.value->>'character_id' order by entry.ordinality) into v_ids
 from jsonb_array_elements(public.get_current_main_formation()->'characters')
 with ordinality entry(value,ordinality);
 if coalesce(cardinality(v_ids),0) not between 1 and 5 then
   raise exception 'saved main formation required' using errcode='23514';
 end if;
 -- Keep the existing tutorial adjustments; these are pass-through outside Tutorial Battle.
 v_player:=public.apply_tutorial_player_snapshot(v_uid,public.build_server_battle_snapshot(v_uid,v_ids,'PLAYER'));
 v_enemy:=v_patrol.encounter_snapshot->'members';
 v_enemy:=public.apply_tutorial_enemy_snapshot(v_uid,v_player,v_enemy);
 v_enemy_tactic:=coalesce(v_patrol.encounter_snapshot->>'enemyTactic','BALANCED');
 v_seed:=floor(random()*2147483646)::bigint+1;
 insert into public.battle_replay_sessions(requester_user_id,battle_mode,source_reference_id,tactic_id,enemy_tactic_id,random_seed,player_snapshot,enemy_snapshot,resolution_authority) values(v_uid,'QUEST',p_patrol_id,p_tactic_id,v_enemy_tactic,v_seed,v_player,v_enemy,'PATROL_SERVER') returning id into v_replay;
 return jsonb_build_object('replay_session_id',v_replay,'player_snapshot',v_player,'enemy_snapshot',v_enemy,'enemy_tactic',v_enemy_tactic);
end $function$
;
CREATE OR REPLACE FUNCTION public._draw_gacha_item_before_special_release(p_gacha_id text, p_rarity text)
 RETURNS text
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select item_id
  from public.gacha_items_master
  where gacha_id = p_gacha_id and rarity = p_rarity
  order by random()
  limit 1
$function$
;
CREATE OR REPLACE FUNCTION public.draw_gacha_rarity(p_gacha_id text)
 RETURNS text
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select rarity
  from public.gacha_rarity_rates
  where gacha_id = p_gacha_id
  order by -ln(greatest(random(), 0.000000000001)) / weight
  limit 1
$function$
;
CREATE OR REPLACE FUNCTION public.enforce_canonical_guild_join_level()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_level integer;
begin
 select level into v_level from public.users where id=new.user_id;
 if coalesce(v_level,0)<3 then raise exception 'Guild joining requires user level 3' using errcode='42501'; end if;
 return new;
end $function$
;
CREATE OR REPLACE FUNCTION public.enforce_mission_claim_prerequisite()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_prerequisite text;
begin
  if new.status='CLAIMED' and old.status is distinct from 'CLAIMED' then
    select prerequisite_mission_id into v_prerequisite from public.missions where id=new.mission_id;
    if v_prerequisite is not null and not exists(
      select 1 from public.user_missions prerequisite
      where prerequisite.user_id=new.user_id and prerequisite.mission_id=v_prerequisite
        and prerequisite.status='CLAIMED'
    ) then raise exception 'mission prerequisite is not claimed' using errcode='23514'; end if;
  end if;
  return new;
end $function$
;
CREATE OR REPLACE FUNCTION public.ensure_active_special_missions(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_event record;
  v_power bigint;
begin
  if p_user_id is null or not exists (select 1 from public.users where id = p_user_id) then
    return;
  end if;

  for v_event in
    select * from public.mission_events event
    where event.is_enabled
      and clock_timestamp() >= event.start_at
      and clock_timestamp() < event.progress_end_at
  loop
    insert into public.user_missions(user_id, mission_id, current_progress, progress_val, status, cycle_date)
    select p_user_id, mission.id, 0, 0, 'PROGRESS', null
    from public.missions mission
    where mission.is_enabled and mission.category = 'SPECIAL' and mission.event_id = v_event.id
    on conflict(user_id, mission_id) do nothing;

    v_power := public.calculate_user_total_power(p_user_id);
    update public.user_missions um
    set current_progress = least(m.target_value, least(v_power, 2147483647)::integer),
        progress_val = least(m.target_value, least(v_power, 2147483647)::integer),
        status = case when v_power >= m.target_value then 'CLEAR' else um.status end,
        updated_at = clock_timestamp()
    from public.missions m
    where um.user_id = p_user_id
      and um.mission_id = m.id
      and m.event_id = v_event.id
      and m.trigger_type = 'MAIN_DECK_TOTAL_POWER_AT_LEAST'
      and um.status = 'PROGRESS';

    perform public.refresh_special_event_completion(p_user_id, v_event.id);
  end loop;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.ensure_current_player_profile()
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_name text;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'authentication required'; END IF;
  SELECT username INTO v_name FROM public.users WHERE id = v_user_id;
  IF v_name IS NULL THEN
    v_name := 'u' || substring(replace(v_user_id::text, '-', '') FROM 1 FOR 7);
    INSERT INTO public.users (id, username, current_base_id, favorite_character_id)
    VALUES (v_user_id, v_name, 'neon_tower', '11111111-1111-1111-1111-111111111111')
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN v_user_id;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.equip_character_cosmetic(p_user_character_id uuid, p_slot text, p_cosmetic_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'authentication required'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.user_characters WHERE id = p_user_character_id AND user_id = v_user_id) THEN
    RAISE EXCEPTION 'character is not owned by the current user';
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM public.character_cosmetics cc
    JOIN public.cosmetic_master cm ON cm.id = cc.cosmetic_id
    WHERE cc.user_character_id = p_user_character_id
      AND cc.cosmetic_id = p_cosmetic_id
      AND cm.owner_scope = 'CHARACTER'
      AND cm.slot = p_slot
      AND (cc.expires_at IS NULL OR cc.expires_at > now())
  ) THEN
    RAISE EXCEPTION 'cosmetic is not owned or is unavailable';
  END IF;

  INSERT INTO public.equipped_cosmetics (user_id, slot, cosmetic_id)
  VALUES (v_user_id, 'CHARACTER:' || p_user_character_id::text || ':' || p_slot, p_cosmetic_id)
  ON CONFLICT (user_id, slot) DO UPDATE
  SET cosmetic_id = EXCLUDED.cosmetic_id, equipped_at = now();

  RETURN jsonb_build_object('status', 'success');
END;
$function$
;
CREATE OR REPLACE FUNCTION public.equip_gear_bulk(p_character_id text, p_user_id uuid, p_gear_ids jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_gear_id TEXT;
    v_idx INTEGER := 0;
BEGIN
    PERFORM public.unequip_gear_bulk(p_character_id, p_user_id);

    FOR v_gear_id IN SELECT jsonb_array_elements_text(p_gear_ids) LOOP
        UPDATE public.user_equipments 
        SET equipped_character_id = p_character_id, slot_index = v_idx 
        WHERE id::text = v_gear_id AND user_id = p_user_id;
        v_idx := v_idx + 1;
    END LOOP;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.equip_guild_decoration(p_guild_id uuid, p_type text, p_item_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_role TEXT;
  v_list JSONB;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication is required';
  END IF;

  SELECT role INTO v_role
  FROM public.guild_members
  WHERE guild_id = p_guild_id AND user_id = auth.uid();

  IF COALESCE(v_role, '') <> 'MASTER' THEN
    RAISE EXCEPTION 'Only the guild master can change guild page items';
  END IF;

  IF p_type IS NULL OR p_type NOT IN ('DECORATION', 'BANNER') THEN
    RAISE EXCEPTION 'Invalid guild item type';
  END IF;

  IF p_type = 'DECORATION' THEN
    SELECT COALESCE(unlocked_decorations, '[]'::jsonb) INTO v_list
    FROM public.guilds WHERE id = p_guild_id FOR UPDATE;
  ELSE
    SELECT COALESCE(unlocked_banners, '[]'::jsonb) INTO v_list
    FROM public.guilds WHERE id = p_guild_id FOR UPDATE;
  END IF;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Guild not found';
  END IF;

  IF p_item_id IS NOT NULL AND NOT (v_list ? p_item_id) THEN
    RAISE EXCEPTION 'Guild item is not owned';
  END IF;

  IF p_type = 'DECORATION' THEN
    UPDATE public.guilds SET equipped_decoration = p_item_id WHERE id = p_guild_id;
  ELSE
    UPDATE public.guilds SET equipped_banner = p_item_id WHERE id = p_guild_id;
  END IF;

  RETURN jsonb_build_object('status', 'success');
END;
$function$
;
CREATE OR REPLACE FUNCTION public.equip_owned_title(p_title_id text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Authentication is required'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.user_titles owned WHERE owned.user_id = v_user_id AND owned.title_id = p_title_id) THEN
    RAISE EXCEPTION 'Title is not owned';
  END IF;
  UPDATE public.users SET title_equipped = p_title_id WHERE id = v_user_id;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.equip_skill_bulk(p_character_id text, p_user_id uuid, p_skill_ids jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_skill_id TEXT;
    v_idx INTEGER := 0;
BEGIN
    PERFORM public.unequip_skill_bulk(p_character_id, p_user_id);

    FOR v_skill_id IN SELECT jsonb_array_elements_text(p_skill_ids) LOOP
        UPDATE public.user_skills 
        SET equipped_character_id = p_character_id, slot_index = v_idx 
        WHERE id::text = v_skill_id AND user_id = p_user_id;
        v_idx := v_idx + 1;
    END LOOP;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.equip_user_cosmetic(p_slot text, p_cosmetic_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'authentication required'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.user_cosmetics uc JOIN public.cosmetic_master cm ON cm.id = uc.cosmetic_id WHERE uc.user_id = v_user_id AND uc.cosmetic_id = p_cosmetic_id AND cm.slot = p_slot AND (uc.expires_at IS NULL OR uc.expires_at > now())) THEN
    RAISE EXCEPTION 'cosmetic is not owned or is unavailable';
  END IF;
  INSERT INTO public.equipped_cosmetics (user_id, slot, cosmetic_id) VALUES (v_user_id, p_slot, p_cosmetic_id)
  ON CONFLICT (user_id, slot) DO UPDATE SET cosmetic_id = EXCLUDED.cosmetic_id, equipped_at = now();
  IF p_slot = 'HOME_BACKGROUND' THEN UPDATE public.users SET selected_bg_mode = p_cosmetic_id WHERE id = v_user_id; END IF;
  IF p_slot = 'HOME_FOREGROUND' THEN UPDATE public.users SET equipped_front_effect = p_cosmetic_id WHERE id = v_user_id; END IF;
  IF p_slot = 'HOME_INTERIOR' THEN UPDATE public.users SET interior_item = p_cosmetic_id WHERE id = v_user_id; END IF;
  RETURN jsonb_build_object('status', 'success');
END; $function$
;
CREATE OR REPLACE FUNCTION public.equipment_level_battle_scale(p_level integer)
 RETURNS numeric
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$
  select case
    when p_level not between 1 and 100 then null
    when p_level <= 50 then (p_level + 97)::numeric / 196
    else (p_level + 100)::numeric / 200
  end
$function$
;
CREATE OR REPLACE FUNCTION public.execute_character_gacha(p_user_id uuid, p_gacha_id text, p_pull_count integer, p_currency_type text, p_request_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_history record;
BEGIN
 IF auth.uid() IS NULL OR auth.uid()<>p_user_id THEN RAISE EXCEPTION 'not authorized'; END IF;
 IF p_currency_type='free' THEN
   SELECT * INTO v_history FROM public.gacha_execution_history
   WHERE user_id=p_user_id AND request_id=p_request_id;
   IF FOUND THEN
     IF v_history.gacha_id IS DISTINCT FROM p_gacha_id
        OR v_history.payment_source IS DISTINCT FROM p_currency_type
        OR v_history.pull_count IS DISTINCT FROM p_pull_count THEN
       RAISE EXCEPTION 'request_id was already used for a different gacha request';
     END IF;
     IF v_history.status='COMPLETED' AND v_history.result_payload IS NOT NULL THEN
       RETURN v_history.result_payload;
     END IF;
   END IF;
   RAISE EXCEPTION 'DAILY_FREE_RATE_VERSION_MISMATCH: reload required' USING ERRCODE='22023';
 END IF;
 RETURN public.execute_character_gacha(p_user_id,p_gacha_id,p_pull_count,p_currency_type,p_request_id,NULL);
END;
$function$
;
CREATE OR REPLACE FUNCTION public.finalize_daily_ranking_rewards(p_ranking_day_key date DEFAULT NULL::date)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_day date:=coalesce(p_ranking_day_key,(clock_timestamp() at time zone 'Asia/Tokyo')::date-1);
  v_today date:=(clock_timestamp() at time zone 'Asia/Tokyo')::date;
  v_start timestamptz; v_end timestamptz; v_row record;
  v_power integer:=0; v_guild integer:=0; v_pvp integer:=0; v_raid integer:=0;
begin
  if v_day>=v_today then raise exception 'daily ranking day is not closed' using errcode='22023'; end if;
  perform pg_advisory_xact_lock(hashtextextended('DAILY_RANKING:'||v_day::text,0));
  if exists(select 1 from public.ranking_daily_finalization_audits audit where audit.ranking_day_key=v_day) then
    return (select jsonb_build_object('ranking_day_key',audit.ranking_day_key,'status','ALREADY_FINALIZED',
      'POWER',audit.power_recipients,'GUILD_POWER',audit.guild_recipients,
      'PVP',audit.pvp_recipients,'RAID_PERSONAL',audit.raid_recipients)
      from public.ranking_daily_finalization_audits audit where audit.ranking_day_key=v_day);
  end if;
  v_start:=v_day::timestamp at time zone 'Asia/Tokyo';
  v_end:=(v_day+1)::timestamp at time zone 'Asia/Tokyo';

  insert into public.ranking_daily_entity_snapshots(ranking_day_key,ranking_type,ranked_entity_id,score,rank_position)
  select v_day,'POWER',ranked.user_id,ranked.score,ranked.rank_position
  from (
    select activity.user_id,activity.total_power score,
      row_number() over(order by activity.total_power desc,activity.user_id)::integer rank_position
    from public.ranking_daily_activity_snapshots activity
    where activity.ranking_day_key=v_day
  ) ranked where ranked.rank_position<=100;
  insert into public.ranking_daily_recipient_snapshots
  select snapshot.ranking_day_key,snapshot.ranking_type,snapshot.ranked_entity_id,
    snapshot.ranked_entity_id,snapshot.rank_position,snapshot.score
  from public.ranking_daily_entity_snapshots snapshot
  where snapshot.ranking_day_key=v_day and snapshot.ranking_type='POWER';

  with active_members as (
    select activity.guild_id,activity.user_id,activity.total_power member_power
    from public.ranking_daily_activity_snapshots activity
    where activity.ranking_day_key=v_day and activity.guild_id is not null
  ), ranked as (
    select member.guild_id,sum(member.member_power)::bigint score,
      row_number() over(order by sum(member.member_power) desc,member.guild_id)::integer rank_position
    from active_members member group by member.guild_id
  )
  insert into public.ranking_daily_entity_snapshots(ranking_day_key,ranking_type,ranked_entity_id,score,rank_position)
  select v_day,'GUILD_POWER',ranked.guild_id,ranked.score,ranked.rank_position
  from ranked where ranked.rank_position<=100;
  insert into public.ranking_daily_recipient_snapshots
  select snapshot.ranking_day_key,snapshot.ranking_type,snapshot.ranked_entity_id,
    member.user_id,snapshot.rank_position,snapshot.score
  from public.ranking_daily_entity_snapshots snapshot
  join public.ranking_daily_activity_snapshots member
    on member.ranking_day_key=snapshot.ranking_day_key
   and member.guild_id=snapshot.ranked_entity_id
  where snapshot.ranking_day_key=v_day and snapshot.ranking_type='GUILD_POWER'
    and member.guild_id is not null;

  insert into public.ranking_daily_entity_snapshots(ranking_day_key,ranking_type,ranked_entity_id,score,rank_position)
  select v_day,'PVP',ranked.user_id,ranked.score,ranked.rank_position
  from (
    select participation.user_id,coalesce(wins.wins,0)::bigint score,
      row_number() over(order by coalesce(wins.wins,0) desc,participation.first_finalized_at,participation.user_id)::integer rank_position
    from public.ranking_daily_participation participation
    left join public.pvp_daily_wins wins on wins.activity_date=v_day and wins.user_id=participation.user_id
    where participation.ranking_day_key=v_day and participation.ranking_type='PVP'
      and participation.finalized_count>=1
  ) ranked where ranked.rank_position<=100;
  insert into public.ranking_daily_recipient_snapshots
  select snapshot.ranking_day_key,snapshot.ranking_type,snapshot.ranked_entity_id,
    snapshot.ranked_entity_id,snapshot.rank_position,snapshot.score
  from public.ranking_daily_entity_snapshots snapshot
  where snapshot.ranking_day_key=v_day and snapshot.ranking_type='PVP';

  -- レイド順位snapshotと新規受取者は生成しない。
  for v_row in
    select * from public.ranking_daily_recipient_snapshots recipient
    where recipient.ranking_day_key=v_day and recipient.ranking_type<>'RAID_PERSONAL'
    order by recipient.ranking_type,recipient.rank_position,recipient.recipient_user_id
  loop
    perform public.grant_canonical_daily_ranking_reward(v_day,v_row.ranking_type,
      v_row.recipient_user_id,v_row.ranked_entity_id,v_row.rank_position,v_row.score);
  end loop;
  select count(*) filter(where ranking_type='POWER'),count(*) filter(where ranking_type='GUILD_POWER'),
    count(*) filter(where ranking_type='PVP'),count(*) filter(where ranking_type='RAID_PERSONAL')
  into v_power,v_guild,v_pvp,v_raid
  from public.ranking_daily_reward_awards where ranking_day_key=v_day;
  insert into public.ranking_daily_finalization_audits(
    ranking_day_key,power_recipients,guild_recipients,pvp_recipients,raid_recipients
  ) values(v_day,v_power,v_guild,v_pvp,v_raid);
  return jsonb_build_object('ranking_day_key',v_day,'status','FINALIZED','POWER',v_power,
    'GUILD_POWER',v_guild,'PVP',v_pvp,'RAID_PERSONAL',v_raid);
end;
$function$
;
CREATE OR REPLACE FUNCTION public.get_raid_room_rescue_reward_v1(p_room_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
declare v_uid uuid:=auth.uid();v_room public.raid_rooms%rowtype;v_saved public.raid_room_rescue_rewards%rowtype;
 v_progress jsonb;v_items jsonb:='[]';v_status text;
begin
 if v_uid is null then raise exception 'authentication required' using errcode='42501';end if;
 select * into v_room from public.raid_rooms where id=p_room_id;
 if not found then raise exception 'room unavailable' using errcode='P0002';end if;
 select * into v_saved from public.raid_room_rescue_rewards where room_id=p_room_id and user_id=v_uid;
 if found then
  v_status:='issued';v_progress:=jsonb_build_object('rescueGate',v_saved.rescue_gate);
  select coalesce(jsonb_agg(jsonb_build_object('itemId',g.item_id,'quantity',g.quantity,
   'presentId',g.present_id,'delivery',case when g.direct_delivery_id is not null then 'DIRECT' else 'PRESENT' end,'presentStatus',p.status,'claimedAt',coalesce(d.delivered_at,p.claimed_at),'expiresAt',p.expire_at) order by g.item_id),'[]') into v_items
  from public.raid_room_rescue_reward_grants g left join public.presents p on p.id=g.present_id and p.user_id=g.user_id left join public.gameplay_reward_delivery_ledger d on d.id=g.direct_delivery_id and d.user_id=g.user_id
  where g.room_id=p_room_id and g.user_id=v_uid;
 else
  v_progress:=public._raid_room_rescue_reward_progress_v1(p_room_id,v_uid);
  if v_progress->'rescueGate'->>'status'='unknown' or not exists(
   select 1 from public.raid_room_rescue_reward_rules r where r.difficulty=v_room.difficulty_id and r.enabled
    and exists(select 1 from public.raid_room_rescue_reward_items i where i.difficulty=r.difficulty)) then v_status:='unconfigured';
  elsif v_progress->'rescueGate'->>'status'='succeeded' then v_status:='pending';
  else v_status:='not_eligible';end if;
 end if;
 return jsonb_build_object('roomId',p_room_id,'status',v_status,'rescueGate',v_progress->'rescueGate',
  'issuedAt',v_saved.issued_at,'expiresAt',case when exists(select 1 from public.raid_room_rescue_reward_grants where room_id=p_room_id and user_id=v_uid and present_id is not null) then v_saved.expires_at else null end,'items',v_items);
end $function$
;
CREATE OR REPLACE FUNCTION public._grant_gameplay_reward_v1(p_user uuid, p_source text, p_key text, p_item text, p_quantity integer)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare v_id uuid; v_saved public.gameplay_reward_delivery_ledger%rowtype; v_item text;
begin
 if p_user is null or p_key is null or p_key='' or p_item is null or p_quantity is null or p_quantity<=0 then
  raise exception 'Invalid gameplay reward';
 end if;
 v_item:=public.resolve_canonical_reward_item(p_item);
 insert into public.gameplay_reward_delivery_ledger(user_id,source_kind,source_key,item_id,quantity)
 values(p_user,p_source,p_key,v_item,p_quantity) on conflict do nothing returning id into v_id;
 if v_id is null then
  select * into strict v_saved from public.gameplay_reward_delivery_ledger
   where user_id=p_user and source_kind=p_source and source_key=p_key and item_id=v_item;
  if v_saved.quantity<>p_quantity then raise exception 'Gameplay reward replay mismatch';end if;
  return v_saved.id;
 end if;
 -- 既存の資産付与Authorityを再利用。失敗はledgerを含む呼出全体をrollback。
 perform public.grant_present_payload(p_user,v_item,p_quantity);
 return v_id;
end $function$
;
CREATE OR REPLACE FUNCTION public.finalize_preopen_guild_power_season_v2(p_cosmetic_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_season public.ranking_seasons%rowtype;
  v_ranked_count integer;
  v_grant_count integer;
  v_job_id bigint;
begin
  -- All paths lock the season row before the event advisory lock. This avoids
  -- inversion with a transaction that edits season state then Power inputs.
  select season.* into strict v_season
  from public.ranking_seasons season
  join public.ranking_guild_power_season_master master on master.season_id=season.id
  where master.event_key='PREOPEN_GUILD_POWER_2026'
  for update of season;
  if v_season.status='PREPARING' and clock_timestamp()>=v_season.starts_at then
    perform public.activate_preopen_guild_power_season();
    select * into strict v_season from public.ranking_seasons where id=v_season.id;
  end if;
  perform pg_advisory_xact_lock(hashtextextended('PREOPEN_GUILD_POWER_2026',0));

  if clock_timestamp()<v_season.ends_at then
    raise exception 'pre-open guild Power season is not closed' using errcode='22023';
  end if;

  if exists(select 1 from public.ranking_guild_power_finalization_audits audit
            where audit.season_id=v_season.id) then
    select jobid into v_job_id from cron.job
    where jobname='preopen-guild-power-finalize-20260909-jst';
    if v_job_id is not null then perform cron.unschedule(v_job_id); end if;
    return (select jsonb_build_object(
      'season_id',audit.season_id,'status','ALREADY_FINALIZED',
      'ranked_guild_count',audit.ranked_guild_count,
      'reward_grant_count',audit.reward_grant_count)
      from public.ranking_guild_power_finalization_audits audit
      where audit.season_id=v_season.id);
  end if;

  if v_season.status='CLOSED' then
    raise exception 'Closed season without finalization audit requires review' using errcode='23514';
  end if;
  -- audit済みは上の早期returnで保持。未確定報酬は適切な限定Emblem設定まで停止。
  if not exists(select 1 from public.cosmetic_master cosmetic
    where cosmetic.id=p_cosmetic_id and cosmetic.owner_scope='GUILD'
      and cosmetic.slot='GUILD_EMBLEM' and cosmetic.active
      and not coalesce(cosmetic.metadata @> '{"standard":true}'::jsonb,false)) then
    raise exception 'FORMAL OPEN LIMITED EMBLEM NOT CONFIGURED' using errcode='23514';
  end if;
  if exists(select 1 from public.ranking_guild_power_reward_grants where season_id=v_season.id) then
    raise exception 'Unfinalized historical reward grants require review' using errcode='23514';
  end if;
  update public.ranking_seasons set status='FINALIZING',updated_at=clock_timestamp()
  where id=v_season.id and status<>'CLOSED';

  insert into public.ranking_guild_power_season_snapshots(
    season_id,guild_id,guild_name,total_power,member_count,rank_position
  )
  with totals as (
    select guild.id guild_id,guild.name guild_name,
      sum(public.calculate_user_total_power(member.user_id))::bigint total_power,
      count(*)::integer member_count
    from public.guilds guild
    join public.guild_members member on member.guild_id=guild.id
    where not exists(
      select 1 from public.ranking_guild_exclusions exclusion where exclusion.guild_id=guild.id
    )
    group by guild.id,guild.name
    having sum(public.calculate_user_total_power(member.user_id))>0
  ), ranked as (
    select totals.*,rank() over(order by totals.total_power desc)::integer rank_position
    from totals
  )
  select v_season.id,ranked.guild_id,ranked.guild_name,ranked.total_power,
    ranked.member_count,ranked.rank_position
  from ranked
  on conflict(season_id,guild_id) do nothing;

  insert into public.ranking_guild_power_reward_grants(
    season_id,guild_id,cosmetic_id,rank_position
  )
  select snapshot.season_id,snapshot.guild_id,reward.cosmetic_id,snapshot.rank_position
  from public.ranking_guild_power_season_snapshots snapshot
  cross join lateral (
    select p_cosmetic_id as cosmetic_id
  ) reward
  where snapshot.season_id=v_season.id and snapshot.rank_position=1
  on conflict(season_id,guild_id,cosmetic_id) do nothing;

  insert into public.guild_cosmetics(
    guild_id,cosmetic_id,source_type,source_reference
  )
  select grant_row.guild_id,grant_row.cosmetic_id,'RANKING',
    concat('PREOPEN_GUILD_POWER_2026:',grant_row.season_id)
  from public.ranking_guild_power_reward_grants grant_row
  where grant_row.season_id=v_season.id
  on conflict(guild_id,cosmetic_id) do nothing;

  insert into public.ranking_guild_power_reward_recipients(
    season_id,guild_id,recipient_user_id
  )
  select snapshot.season_id,snapshot.guild_id,member.user_id
  from public.ranking_guild_power_season_snapshots snapshot
  join public.guild_members member on member.guild_id=snapshot.guild_id
  where snapshot.season_id=v_season.id
  on conflict(season_id,guild_id,recipient_user_id) do nothing;

  insert into public.ranking_reward_notifications(
    recipient_user_id,period_kind,period_key,awarded_at,acknowledged_at
  )
  select recipient.recipient_user_id,'SEASON',recipient.season_id::text,clock_timestamp(),null
  from public.ranking_guild_power_reward_recipients recipient
  where recipient.season_id=v_season.id and exists(
    select 1 from public.ranking_guild_power_reward_grants grant_row
    where grant_row.season_id=recipient.season_id and grant_row.guild_id=recipient.guild_id)
  on conflict(recipient_user_id,period_kind,period_key) do nothing;

  select count(*) into v_ranked_count
  from public.ranking_guild_power_season_snapshots where season_id=v_season.id;
  select count(*) into v_grant_count
  from public.ranking_guild_power_reward_grants where season_id=v_season.id;

  update public.ranking_seasons set status='CLOSED',updated_at=clock_timestamp()
  where id=v_season.id;
  insert into public.ranking_guild_power_finalization_audits(
    season_id,ranked_guild_count,reward_grant_count
  ) values(v_season.id,v_ranked_count,v_grant_count);

  select jobid into v_job_id from cron.job
  where jobname='preopen-guild-power-finalize-20260909-jst';
  if v_job_id is not null then perform cron.unschedule(v_job_id); end if;

  return jsonb_build_object(
    'season_id',v_season.id,'status','FINALIZED',
    'ranked_guild_count',v_ranked_count,'reward_grant_count',v_grant_count
  );
end;
$function$
;
CREATE OR REPLACE FUNCTION public.close_gvg_preparation_missions_v1(p_progress_end timestamp with time zone, p_claim_anchor timestamp with time zone)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_event public.mission_events%rowtype;v_deadline timestamptz;
begin
 if p_progress_end is null or p_claim_anchor is null or p_claim_anchor<p_progress_end
   or p_claim_anchor>clock_timestamp() then raise exception 'Confirmed maintenance timestamps required';end if;
 select * into strict v_event from public.mission_events where id='GVG_PREP_20260904' for update;
 if p_progress_end<=v_event.start_at then raise exception 'Invalid event close boundary';end if;
 v_deadline:=p_claim_anchor+interval '30 days';
 if v_event.claim_deadline is not null and
   (v_event.progress_end_at<>p_progress_end or v_event.claim_deadline<>v_deadline) then
   raise exception 'Existing claim contract differs; explicit review required';
 end if;
 update public.mission_events set progress_end_at=p_progress_end,claim_deadline=v_deadline,updated_at=clock_timestamp()
 where id=v_event.id;
 return jsonb_build_object('event_id',v_event.id,'progress_end_at',p_progress_end,'claim_deadline',v_deadline);
end $function$
;
CREATE OR REPLACE FUNCTION public.evaluate_mission_progress(p_user_id uuid, p_trigger_type text, p_progress_increment integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_types text[];
  v_event record;
begin
  if auth.uid() is not null and p_user_id is distinct from auth.uid() then
    raise exception 'Mission progress owner mismatch' using errcode = '42501';
  end if;
  if p_trigger_type is null or btrim(p_trigger_type) = ''
    or p_progress_increment not between 1 and 1000 then
    raise exception 'Invalid mission progress event' using errcode = '22023';
  end if;

  perform public.ensure_active_special_missions(p_user_id);

  v_types := case p_trigger_type
    when 'GACHA_PULL' then array['NORMAL_FREE_GACHA_PULL_COUNT']
    when 'CHAR_LEVEL_UP' then array['CHARACTER_ENHANCE_COUNT','CHARACTER_LEVEL_AT_LEAST','CHARACTER_LEVEL_TOTAL_INCREASE']
    when 'GEAR_UPGRADE' then array['EQUIPMENT_ENHANCE_COUNT','EQUIPMENT_LEVEL_AT_LEAST','EQUIPMENT_LEVEL_TOTAL_INCREASE']
    when 'GEAR_LIMIT_BREAK' then array['EQUIPMENT_LIMIT_BREAK_COUNT']
    when 'SKILL_LIMIT_BREAK' then array['SKILL_ENHANCE_COUNT','SKILL_LEVEL_AT_LEAST','SKILL_LEVEL_TOTAL_INCREASE']
    when 'PATROL_CLEAR' then array['QUEST_COMPLETE_COUNT','QUEST_CLEAR_COUNT']
    when 'PVP_FINALIZED' then array['PVP_FINALIZED_BATTLE_COUNT']
    when 'PVP_BATTLE_COUNT' then array['PVP_FINALIZED_BATTLE_COUNT']
    when 'PVP_WIN' then array['PVP_WIN_COUNT']
    when 'RAID_FINALIZED' then array['RAID_FINALIZED_BATTLE_COUNT']
    when 'RAID_CLEAR_ELIGIBLE' then array['RAID_CLEAR_ELIGIBLE_COUNT']
    when 'GUILD_JOIN' then array['GUILD_JOIN_COUNT']
    when 'GUILD_ACTIVITY' then array['GUILD_ACTIVITY_COUNT']
    when 'GUILD_CHAT' then array['GUILD_ACTIVITY_COUNT','GUILD_CHAT_MESSAGE_COUNT']
    when 'GVG_FINALIZED' then array['GVG_FINALIZED_BATTLE_COUNT']
    when 'GVG_WIN' then array['GVG_WIN_COUNT']
    else array[p_trigger_type]
  end;

  update public.user_missions um
  set current_progress = least(m.target_value, um.current_progress + p_progress_increment),
      progress_val = least(m.target_value, um.current_progress + p_progress_increment),
      status = case when um.current_progress + p_progress_increment >= m.target_value then 'CLEAR' else 'PROGRESS' end,
      updated_at = clock_timestamp()
  from public.missions m
  left join public.mission_events event on event.id = m.event_id
  where um.user_id = p_user_id
    and um.mission_id = m.id
    and m.is_enabled
    and m.trigger_type = any(v_types)
    and not (m.category='NORMAL' and m.trigger_type in (
      'CHARACTER_LEVEL_AT_LEAST','CHARACTER_AWAKENING_AT_LEAST',
      'SKILL_AWAKENING_AT_LEAST','EQUIPMENT_LIMIT_BREAK_AT_LEAST'))
    and m.trigger_type <> 'GVG_PREP_REQUIRED_MISSIONS_COMPLETED'
    and um.status = 'PROGRESS'
    and (
      m.category <> 'SPECIAL'
      or (
        event.is_enabled
        and clock_timestamp() >= event.start_at
        and clock_timestamp() < event.progress_end_at
      )
    );

  perform public.refresh_normal_mission_owned_state(p_user_id);

  -- Re-evaluate canonical main-deck power after authoritative growth events.
  perform public.ensure_active_special_missions(p_user_id);
  for v_event in select id from public.mission_events where is_enabled loop
    perform public.refresh_special_event_completion(p_user_id, v_event.id);
  end loop;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.execute_asset_gacha(p_user_id uuid, p_gacha_id text, p_pull_count integer, p_currency_type text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
 SET "TimeZone" TO 'Asia/Tokyo'
AS $function$
declare v_result jsonb;
BEGIN
  IF p_currency_type='free' THEN
    RAISE EXCEPTION 'DAILY_FREE_RATE_VERSION_MISMATCH: reload required' USING ERRCODE='22023';
  END IF;
  if auth.uid() is null or auth.uid()<>p_user_id then raise exception 'not authorized'; end if;
  if p_currency_type='free' and p_gacha_id not in ('SKILL_NORMAL','EQUIP_NORMAL') then raise exception 'daily free is only available for normal gacha'; end if;
  v_result:=public.execute_asset_gacha_core_20260812(p_user_id,p_gacha_id,p_pull_count,p_currency_type);
  perform public.record_funnel_milestone(p_user_id,'first_gacha',jsonb_build_object('gachaId',p_gacha_id,'pullCount',p_pull_count));
  return v_result;
end; $function$
;
CREATE OR REPLACE FUNCTION public.execute_asset_gacha(p_user_id uuid, p_gacha_id text, p_pull_count integer, p_currency_type text, p_request_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_history record;
BEGIN
 IF auth.uid() IS NULL OR auth.uid()<>p_user_id THEN RAISE EXCEPTION 'not authorized'; END IF;
 IF p_currency_type='free' THEN
   SELECT * INTO v_history FROM public.gacha_execution_history
   WHERE user_id=p_user_id AND request_id=p_request_id;
   IF FOUND THEN
     IF v_history.gacha_id IS DISTINCT FROM p_gacha_id
        OR v_history.payment_source IS DISTINCT FROM p_currency_type
        OR v_history.pull_count IS DISTINCT FROM p_pull_count THEN
       RAISE EXCEPTION 'request_id was already used for a different gacha request';
     END IF;
     IF v_history.status='COMPLETED' AND v_history.result_payload IS NOT NULL THEN
       RETURN v_history.result_payload;
     END IF;
   END IF;
   RAISE EXCEPTION 'DAILY_FREE_RATE_VERSION_MISMATCH: reload required' USING ERRCODE='22023';
 END IF;
 RETURN public.execute_asset_gacha(p_user_id,p_gacha_id,p_pull_count,p_currency_type,p_request_id,NULL);
END;
$function$
;
CREATE OR REPLACE FUNCTION public.execute_character_gacha(p_user_id uuid, p_gacha_id text, p_pull_count integer, p_currency_type text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
 SET "TimeZone" TO 'Asia/Tokyo'
AS $function$
declare v_result jsonb;
BEGIN
  IF p_currency_type='free' THEN
    RAISE EXCEPTION 'DAILY_FREE_RATE_VERSION_MISMATCH: reload required' USING ERRCODE='22023';
  END IF;
  if auth.uid() is null or auth.uid()<>p_user_id then raise exception 'not authorized'; end if;
  if p_currency_type='free' and p_gacha_id<>'CHAR_NORMAL' then raise exception 'daily free is only available for normal gacha'; end if;
  v_result:=public.execute_character_gacha_core_20260812(p_user_id,p_gacha_id,p_pull_count,p_currency_type);
  perform public.record_funnel_milestone(p_user_id,'first_gacha',jsonb_build_object('gachaId',p_gacha_id,'pullCount',p_pull_count));
  return v_result;
end; $function$
;
CREATE OR REPLACE FUNCTION public.execute_character_gacha_core_20260812(p_user_id uuid, p_gacha_id text, p_pull_count integer, p_currency_type text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_gacha RECORD;
  v_user RECORD;
  v_item_id TEXT;
  v_existing RECORD;
  v_result JSONB := '[]'::jsonb;
  v_cost INTEGER;
  v_today DATE := (now() AT TIME ZONE 'Asia/Tokyo')::date;
  v_index INTEGER;
BEGIN
  IF p_currency_type='free' THEN
    RAISE EXCEPTION 'DAILY_FREE_RATE_VERSION_MISMATCH: reload required' USING ERRCODE='22023';
  END IF;
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  IF p_pull_count IS NULL OR p_pull_count < 1 OR p_pull_count > 10 THEN
    RAISE EXCEPTION 'invalid pull count';
  END IF;
  IF p_currency_type = 'free' AND p_pull_count <> 10 THEN
    RAISE EXCEPTION 'free gacha requires 10 pulls';
  END IF;

  SELECT id, gacha_type, cost_cash, cost_diamond
  INTO v_gacha
  FROM public.gacha_masters
  WHERE id = p_gacha_id AND gacha_type = 'CHARACTER';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'character gacha not found';
  END IF;

  IF p_currency_type = 'free' THEN
    INSERT INTO public.user_daily_gacha_claims (user_id, gacha_type, last_claimed_date)
    VALUES (p_user_id, 'CHARACTER', v_today)
    ON CONFLICT (user_id, gacha_type) DO UPDATE
      SET last_claimed_date = EXCLUDED.last_claimed_date, updated_at = now()
      WHERE public.user_daily_gacha_claims.last_claimed_date < v_today;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'daily free gacha already claimed';
    END IF;
  ELSIF p_currency_type = 'cash' OR p_currency_type = 'diamonds' THEN
    v_cost := CASE WHEN p_currency_type = 'cash' THEN v_gacha.cost_cash ELSE v_gacha.cost_diamond END * p_pull_count;
    IF p_currency_type = 'cash' THEN
      UPDATE public.users SET cash = cash - v_cost
      WHERE id = p_user_id AND cash >= v_cost;
    ELSE
      UPDATE public.users SET neon_diamonds = neon_diamonds - v_cost
      WHERE id = p_user_id AND neon_diamonds >= v_cost;
    END IF;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'insufficient gacha currency';
    END IF;
  ELSIF p_currency_type = 'ticket' THEN
    UPDATE public.user_items SET quantity = quantity - p_pull_count
    WHERE user_id = p_user_id AND item_id = 'GACHA_TICKET' AND quantity >= p_pull_count;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'insufficient gacha tickets';
    END IF;
  ELSE
    RAISE EXCEPTION 'invalid currency type';
  END IF;

  FOR v_index IN 1..p_pull_count LOOP
    SELECT item_id INTO v_item_id
    FROM public.gacha_items_master
    WHERE gacha_id = p_gacha_id
    ORDER BY -ln(random()) / GREATEST(weight, 1)
    LIMIT 1;
    IF v_item_id IS NULL THEN
      RAISE EXCEPTION 'gacha pool is empty';
    END IF;

    SELECT id, awakening_level INTO v_existing
    FROM public.user_characters
    WHERE user_id = p_user_id AND character_id = v_item_id
    FOR UPDATE;

    IF FOUND AND COALESCE(v_existing.awakening_level, 0) < 5 THEN
      UPDATE public.user_characters
      SET awakening_level = COALESCE(awakening_level, 0) + 1
      WHERE id = v_existing.id;
      v_result := v_result || jsonb_build_array(jsonb_build_object(
        'type', 'CHARACTER', 'character_id', v_item_id, 'outcome', 'awakening'
      ));
    ELSIF FOUND THEN
      INSERT INTO public.user_items (user_id, item_id, quantity)
      VALUES (p_user_id, 'LAW_OF_STRIFE', 1)
      ON CONFLICT (user_id, item_id) DO UPDATE
        SET quantity = public.user_items.quantity + 1;
      v_result := v_result || jsonb_build_array(jsonb_build_object(
        'type', 'CHARACTER', 'character_id', v_item_id, 'outcome', 'converted'
      ));
    ELSE
      INSERT INTO public.user_characters (user_id, character_id, level, awakening_level)
      VALUES (p_user_id, v_item_id, 1, 0);
      v_result := v_result || jsonb_build_array(jsonb_build_object(
        'type', 'CHARACTER', 'character_id', v_item_id, 'outcome', 'new'
      ));
    END IF;
  END LOOP;

  IF p_currency_type <> 'free' AND p_gacha_id = 'CHAR_SPECIAL' THEN
    INSERT INTO public.user_gacha_pity_points (user_id, pity_master_id, current_points)
    VALUES (p_user_id, 'pity_special_common', p_pull_count)
    ON CONFLICT (user_id, pity_master_id) DO UPDATE
      SET current_points = public.user_gacha_pity_points.current_points + p_pull_count,
          updated_at = now();
  END IF;

  SELECT cash, neon_diamonds INTO v_user FROM public.users WHERE id = p_user_id;
  RETURN jsonb_build_object(
    'status', 'success',
    'results', v_result,
    'cash', v_user.cash,
    'diamonds', v_user.neon_diamonds
  );
END;
$function$
;
CREATE OR REPLACE FUNCTION public.execute_gacha(p_user_id uuid, p_currency_type text, p_currency_cost integer, p_results jsonb DEFAULT '[]'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_cash BIGINT;
  v_diamonds BIGINT;
  v_tickets INTEGER;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  IF p_currency_cost IS NULL OR p_currency_cost <= 0 OR p_currency_cost > 1000000 THEN
    RAISE EXCEPTION 'invalid gacha cost';
  END IF;
  IF p_results IS NOT NULL AND jsonb_array_length(p_results) <> 0 THEN
    RAISE EXCEPTION 'client supplied gacha results are not accepted';
  END IF;

  IF p_currency_type = 'cash' THEN
    UPDATE public.users
    SET cash = cash - p_currency_cost
    WHERE id = p_user_id AND cash >= p_currency_cost
    RETURNING cash INTO v_cash;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'insufficient cash';
    END IF;
    RETURN jsonb_build_object('status', 'charged', 'cash', v_cash);
  ELSIF p_currency_type = 'diamonds' THEN
    UPDATE public.users
    SET neon_diamonds = neon_diamonds - p_currency_cost
    WHERE id = p_user_id AND neon_diamonds >= p_currency_cost
    RETURNING neon_diamonds INTO v_diamonds;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'insufficient diamonds';
    END IF;
    RETURN jsonb_build_object('status', 'charged', 'diamonds', v_diamonds);
  ELSIF p_currency_type = 'ticket' THEN
    UPDATE public.user_items
    SET quantity = quantity - p_currency_cost
    WHERE user_id = p_user_id
      AND item_id = 'GACHA_TICKET'
      AND quantity >= p_currency_cost
    RETURNING quantity INTO v_tickets;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'insufficient gacha tickets';
    END IF;
    RETURN jsonb_build_object('status', 'charged', 'tickets', v_tickets);
  ELSE
    RAISE EXCEPTION 'invalid currency type';
  END IF;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.execute_gacha(p_user_id uuid, p_scout_type text, p_scout_count integer, p_use_currency text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- ガチャ抽選・決済ロジック (通常時はMockDBで実行される)
    RETURN jsonb_build_object('success', true);
END;
$function$
;
CREATE OR REPLACE FUNCTION public.execute_tutorial_character_gacha(p_request_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid:=auth.uid(); v_history record; v_existing record; v_grant jsonb;
  v_results jsonb:='[]'::jsonb; v_response jsonb; v_item_id text; v_rarity text;
  v_index integer; v_inserted integer; v_progress jsonb; v_saved_result jsonb;
begin
  if v_user_id is null then raise exception 'authentication required' using errcode='42501'; end if;
  if p_request_id is null then raise exception 'request_id is required' using errcode='22023'; end if;
  if not exists(select 1 from public.tutorial_progress where user_id=v_user_id and step_id='FREE_GACHA') then
    raise exception 'tutorial gacha is unavailable' using errcode='42501';
  end if;
  select canonical_payload into v_grant from public.user_lifetime_onboarding_grants where user_id=v_user_id;
  if v_grant is not null and jsonb_array_length(coalesce(v_grant->'gacha_results','[]'::jsonb))<>10 then
    raise exception 'lifetime tutorial grant is invalid' using errcode='23514';
  end if;

  insert into public.gacha_execution_history(user_id,request_id,gacha_id,payment_source,pull_count,cost_amount,pity_before,pity_after)
  values(v_user_id,p_request_id,'CHAR_NORMAL','free',10,0,0,0) on conflict(user_id,request_id) do nothing;
  get diagnostics v_inserted=row_count;
  if v_inserted=0 then
    select * into v_history from public.gacha_execution_history where user_id=v_user_id and request_id=p_request_id for update;
    if v_history.gacha_id<>'CHAR_NORMAL' or v_history.pull_count<>10 then raise exception 'request_id was already used for a different request'; end if;
    if v_history.status='COMPLETED' and v_history.result_payload is not null then return v_history.result_payload; end if;
    raise exception 'tutorial gacha request is already in progress';
  end if;

  for v_index in 1..10 loop
    if v_grant is not null then
      select value into v_saved_result from jsonb_array_elements(v_grant->'gacha_results') value
      where coalesce((value->>'tutorial_slot')::integer,0)=v_index;
      v_item_id:=v_saved_result->>'character_id';
      v_rarity:=v_saved_result->>'rarity';
    elsif v_index=10 then
      v_item_id:=public.draw_gacha_item('CHAR_SPECIAL','SSR');
    else
      v_rarity:=public.draw_gacha_rarity('CHAR_NORMAL');
      v_item_id:=public.draw_gacha_item('CHAR_NORMAL',v_rarity);
    end if;
    if v_item_id is null then raise exception 'canonical tutorial gacha bucket is empty'; end if;
    select rarity into v_rarity from public.canonical_character_master
      where version='2026-08-21' and character_id=v_item_id;
    if v_rarity is null then raise exception 'tutorial gacha Character is absent from Canonical Master' using errcode='P0002'; end if;
    if v_index=10 and v_rarity<>'SSR' then raise exception 'tutorial guaranteed slot is not Canonical SSR' using errcode='23514'; end if;

    select id,awakening_level into v_existing from public.user_characters
      where user_id=v_user_id and character_id=v_item_id for update;
    if found and coalesce(v_existing.awakening_level,0)<5 then
      v_progress:=public.apply_character_awakening_equivalent(v_user_id,v_existing.id,1);
      v_results:=v_results||jsonb_build_array(jsonb_build_object('type','CHARACTER','character_id',v_item_id,'rarity',v_rarity,
        'outcome',v_progress->>'outcome','awakening_progress_added',1,'awakening_level',(v_progress->>'awakening_level')::integer,
        'awakening_progress',(v_progress->>'awakening_progress')::integer,'awakening_required',(v_progress->>'awakening_required')::integer,'tutorial_slot',v_index));
    elsif found then
      insert into public.user_items(user_id,item_id,quantity) values(v_user_id,'AWAKENING_BOOK',1)
      on conflict(user_id,item_id) do update set quantity=public.user_items.quantity+1,updated_at=now();
      v_results:=v_results||jsonb_build_array(jsonb_build_object('type','CHARACTER','character_id',v_item_id,'rarity',v_rarity,
        'outcome','converted','converted_item_id','AWAKENING_BOOK','converted_quantity',1,'tutorial_slot',v_index));
    else
      insert into public.user_characters(user_id,character_id,level,awakening_level) values(v_user_id,v_item_id,1,0);
      v_results:=v_results||jsonb_build_array(jsonb_build_object('type','CHARACTER','character_id',v_item_id,'rarity',v_rarity,'outcome','new','tutorial_slot',v_index));
    end if;
  end loop;
  perform public.record_funnel_milestone(v_user_id,'first_gacha',jsonb_build_object('source','tutorial_guaranteed_ssr','pullCount',10,'lifetimeReplay',v_grant is not null));
  v_response:=jsonb_build_object('status','success','request_id',p_request_id,'results',v_results,'tutorial',true,'guaranteed_ssr_slot',10,'lifetime_replay',v_grant is not null);
  update public.gacha_execution_history set result_payload=v_response,status='COMPLETED',completed_at=now()
    where user_id=v_user_id and request_id=p_request_id;
  return v_response;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.finalize_preopen_guild_power_season()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_season public.ranking_seasons%rowtype;
  v_ranked_count integer;
  v_grant_count integer;
  v_job_id bigint;
begin
  -- All paths lock the season row before the event advisory lock. This avoids
  -- inversion with a transaction that edits season state then Power inputs.
  select season.* into strict v_season
  from public.ranking_seasons season
  join public.ranking_guild_power_season_master master on master.season_id=season.id
  where master.event_key='PREOPEN_GUILD_POWER_2026'
  for update of season;
  if v_season.status='PREPARING' and clock_timestamp()>=v_season.starts_at then
    perform public.activate_preopen_guild_power_season();
    select * into strict v_season from public.ranking_seasons where id=v_season.id;
  end if;
  perform pg_advisory_xact_lock(hashtextextended('PREOPEN_GUILD_POWER_2026',0));

  if clock_timestamp()<v_season.ends_at then
    raise exception 'pre-open guild Power season is not closed' using errcode='22023';
  end if;

  if exists(select 1 from public.ranking_guild_power_finalization_audits audit
            where audit.season_id=v_season.id) then
    select jobid into v_job_id from cron.job
    where jobname='preopen-guild-power-finalize-20260909-jst';
    if v_job_id is not null then perform cron.unschedule(v_job_id); end if;
    return (select jsonb_build_object(
      'season_id',audit.season_id,'status','ALREADY_FINALIZED',
      'ranked_guild_count',audit.ranked_guild_count,
      'reward_grant_count',audit.reward_grant_count)
      from public.ranking_guild_power_finalization_audits audit
      where audit.season_id=v_season.id);
  end if;

  update public.ranking_seasons set status='FINALIZING',updated_at=clock_timestamp()
  where id=v_season.id and status<>'CLOSED';

  insert into public.ranking_guild_power_season_snapshots(
    season_id,guild_id,guild_name,total_power,member_count,rank_position
  )
  with totals as (
    select guild.id guild_id,guild.name guild_name,
      sum(public.calculate_user_total_power(member.user_id))::bigint total_power,
      count(*)::integer member_count
    from public.guilds guild
    join public.guild_members member on member.guild_id=guild.id
    where not exists(
      select 1 from public.ranking_guild_exclusions exclusion where exclusion.guild_id=guild.id
    )
    group by guild.id,guild.name
    having sum(public.calculate_user_total_power(member.user_id))>0
  ), ranked as (
    select totals.*,rank() over(order by totals.total_power desc)::integer rank_position
    from totals
  )
  select v_season.id,ranked.guild_id,ranked.guild_name,ranked.total_power,
    ranked.member_count,ranked.rank_position
  from ranked
  on conflict(season_id,guild_id) do nothing;

  insert into public.ranking_guild_power_reward_grants(
    season_id,guild_id,cosmetic_id,rank_position
  )
  select snapshot.season_id,snapshot.guild_id,reward.cosmetic_id,snapshot.rank_position
  from public.ranking_guild_power_season_snapshots snapshot
  cross join lateral (
    values ('guild_preopen_2026_participation'::text),
      (case snapshot.rank_position
        when 1 then 'guild_preopen_2026_rank_1'
        when 2 then 'guild_preopen_2026_rank_2'
        when 3 then 'guild_preopen_2026_rank_3'
        else null end)
  ) reward(cosmetic_id)
  where snapshot.season_id=v_season.id and reward.cosmetic_id is not null
  on conflict(season_id,guild_id,cosmetic_id) do nothing;

  insert into public.guild_cosmetics(
    guild_id,cosmetic_id,source_type,source_reference
  )
  select grant_row.guild_id,grant_row.cosmetic_id,'RANKING',
    concat('PREOPEN_GUILD_POWER_2026:',grant_row.season_id)
  from public.ranking_guild_power_reward_grants grant_row
  where grant_row.season_id=v_season.id
  on conflict(guild_id,cosmetic_id) do nothing;

  insert into public.ranking_guild_power_reward_recipients(
    season_id,guild_id,recipient_user_id
  )
  select snapshot.season_id,snapshot.guild_id,member.user_id
  from public.ranking_guild_power_season_snapshots snapshot
  join public.guild_members member on member.guild_id=snapshot.guild_id
  where snapshot.season_id=v_season.id
  on conflict(season_id,guild_id,recipient_user_id) do nothing;

  insert into public.ranking_reward_notifications(
    recipient_user_id,period_kind,period_key,awarded_at,acknowledged_at
  )
  select recipient.recipient_user_id,'SEASON',recipient.season_id::text,clock_timestamp(),null
  from public.ranking_guild_power_reward_recipients recipient
  where recipient.season_id=v_season.id
  on conflict(recipient_user_id,period_kind,period_key) do update set
    awarded_at=excluded.awarded_at,acknowledged_at=null;

  select count(*) into v_ranked_count
  from public.ranking_guild_power_season_snapshots where season_id=v_season.id;
  select count(*) into v_grant_count
  from public.ranking_guild_power_reward_grants where season_id=v_season.id;

  update public.ranking_seasons set status='CLOSED',updated_at=clock_timestamp()
  where id=v_season.id;
  insert into public.ranking_guild_power_finalization_audits(
    season_id,ranked_guild_count,reward_grant_count
  ) values(v_season.id,v_ranked_count,v_grant_count);

  select jobid into v_job_id from cron.job
  where jobname='preopen-guild-power-finalize-20260909-jst';
  if v_job_id is not null then perform cron.unschedule(v_job_id); end if;

  return jsonb_build_object(
    'season_id',v_season.id,'status','FINALIZED',
    'ranked_guild_count',v_ranked_count,'reward_grant_count',v_grant_count
  );
end;
$function$
;
CREATE OR REPLACE FUNCTION public.finalize_pvp_battle(p_replay_id uuid, p_result jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_replay public.battle_replay_sessions%rowtype; v_win boolean; v_player integer; v_opponent integer; v_delta integer; v_new integer; v_final jsonb; v_name text;
begin
 select * into v_replay from public.battle_replay_sessions where id=p_replay_id for update;
 if not found then raise exception 'PvP replay not found' using errcode='P0002'; end if;
 if v_replay.battle_mode<>'PVP' or v_replay.resolution_authority<>'PVP_SERVER' then raise exception 'replay is not official PvP' using errcode='42501'; end if;
 if v_replay.finalization_status='FINALIZED' then return v_replay.finalization_result; end if;
 if v_replay.status<>'PENDING' or v_replay.finalization_status<>'PENDING' then raise exception 'PvP replay is not finalizable' using errcode='23514'; end if;
 perform public.advance_ranking_season('PVP',clock_timestamp());
 perform public.validate_official_battle_result(p_result); v_win:=p_result->>'winner'='PLAYER';
 v_player:=coalesce((v_replay.official_context->>'playerRankPointsAtStart')::integer,1000); v_opponent:=coalesce((v_replay.official_context->>'opponentRankPointsAtStart')::integer,1000); v_delta:=public.canonical_pvp_rating_delta(v_player,v_opponent,case when v_win then 'WIN' else 'LOSS' end);
 insert into public.pvp_ranks(user_id,rank_points,daily_wins,season_wins,updated_at) values(v_replay.requester_user_id,greatest(1000+v_delta,0),case when v_win then 1 else 0 end,case when v_win then 1 else 0 end,now()) on conflict(user_id) do update set rank_points=greatest(public.pvp_ranks.rank_points+v_delta,0),daily_wins=public.pvp_ranks.daily_wins+case when v_win then 1 else 0 end,season_wins=public.pvp_ranks.season_wins+case when v_win then 1 else 0 end,updated_at=now() returning rank_points into v_new;
 select username into v_name from public.users where id=v_replay.requester_user_id; insert into public.pvp_defense_logs(user_id,attacker_id,attacker_name,result,points_change) values(v_replay.source_reference_id,v_replay.requester_user_id,v_name,case when v_win then 'DEFEAT' else 'VICTORY' end,-v_delta);
 v_final:=p_result||jsonb_build_object('mode','PVP','oldRating',v_player,'opponentRating',v_opponent,'rankDelta',v_delta,'newRankPoints',v_new,'remainingPvpPoints',coalesce((v_replay.official_context->>'remainingPvpPoints')::integer,0),'rewards',jsonb_build_object('cash',0,'diamonds',0,'xp',0));
 insert into public.battle_replay_events(battle_replay_session_id,event_index,round_number,event_type,payload) select p_replay_id,greatest(coalesce((e.value->>'index')::integer,e.ordinality::integer-1),0),greatest(coalesce((e.value->>'round')::integer,1),1),coalesce(nullif(e.value->>'type',''),'UNKNOWN'),coalesce(e.value->'payload','{}'::jsonb) from jsonb_array_elements(p_result->'events') with ordinality e(value,ordinality) on conflict do nothing;
 update public.battle_replay_sessions set status='RESOLVED',result=v_final,resolved_at=now(),finalization_status='FINALIZED',finalized_at=now(),finalization_result=v_final where id=p_replay_id;
 -- The AFTER-finalize trigger has committed its claim rows and direct asset grants
 -- in this transaction. Project that exact receipt, never a client estimate.
 select v_final || jsonb_build_object(
   'reward_items',coalesce(jsonb_agg(item.value) filter (where item.value is not null),'[]'::jsonb),
   'reward_delivery','INVENTORY',
   'rewards',jsonb_build_object('cash',coalesce(sum((item.value->>'quantity')::integer) filter(where item.value->>'itemId'='CASH'),0),'diamonds',0,'xp',0)
 ) into v_final
 from public.canonical_daily_activity_claims claim
 cross join lateral jsonb_array_elements(claim.reward_payload) item(value)
 where claim.user_id=v_replay.requester_user_id and claim.source_ref=p_replay_id
   and item.value->>'delivery'='INVENTORY';
 -- Do not update finalization_status again: keep all finalize triggers exactly once.
 update public.battle_replay_sessions set result=v_final,finalization_result=v_final where id=p_replay_id;
 perform public.evaluate_mission_progress(v_replay.requester_user_id,'PVP_BATTLE_COUNT',1); if v_win then perform public.evaluate_mission_progress(v_replay.requester_user_id,'PVP_WIN_COUNT',1); end if;
 return v_final;
end $function$
;
CREATE OR REPLACE FUNCTION public.finalize_pvp_season_rewards(p_season_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_season public.ranking_seasons%rowtype;
  v_row record;
  v_granted integer := 0;
begin
  select * into v_season from public.ranking_seasons where id=p_season_id for update;
  if not found or v_season.ranking_type<>'PVP'
     or not (v_season.status in ('FINALIZING','CLOSED')
       or (v_season.status='ACTIVE' and v_season.ends_at<=clock_timestamp())) then
    raise exception 'PvP season is not finalizable' using errcode='23514';
  end if;

  insert into public.ranking_pvp_season_snapshots(
    season_id,user_id,rank_points,daily_wins,season_wins,rank_position,achieved_at
  )
  select p_season_id,ranked.user_id,ranked.boundary_rating,ranked.boundary_daily_wins,
    ranked.boundary_season_wins,ranked.rank_position,ranked.achieved_at
  from (
    select boundary.*,
      rank() over(order by boundary.boundary_rating desc) rank_position
    from (
      select rank.user_id,
        coalesce(first_event.new_rank-first_event.rank_delta,rank.rank_points) boundary_rating,
        rank.daily_wins-coalesce(post_events.win_count,0) boundary_daily_wins,
        rank.season_wins-coalesce(post_events.win_count,0) boundary_season_wins,
        case when first_event.user_id is null then rank.updated_at else v_season.ends_at end achieved_at
      from public.pvp_ranks rank
      left join lateral (
        select replay.requester_user_id user_id,
          (replay.finalization_result->>'newRankPoints')::integer new_rank,
          (replay.finalization_result->>'rankDelta')::integer rank_delta
        from public.battle_replay_sessions replay
        where replay.requester_user_id=rank.user_id and replay.battle_mode='PVP'
          and replay.finalization_status='FINALIZED' and replay.finalized_at>=v_season.ends_at
        order by replay.finalized_at,replay.id limit 1
      ) first_event on true
      left join lateral (
        select count(*) filter(where replay.finalization_result->>'winner'='PLAYER')::integer win_count
        from public.battle_replay_sessions replay
        where replay.requester_user_id=rank.user_id and replay.battle_mode='PVP'
          and replay.finalization_status='FINALIZED' and replay.finalized_at>=v_season.ends_at
      ) post_events on true
    ) boundary
  ) ranked
  on conflict do nothing;

  for v_row in
    select snapshot.* from public.ranking_pvp_season_snapshots snapshot
    where snapshot.season_id=p_season_id
    order by snapshot.rank_position,snapshot.achieved_at,snapshot.user_id
  loop
    v_granted := v_granted + public.grant_canonical_ranking_season_reward(
      p_season_id,'PVP',v_row.user_id,v_row.user_id,v_row.rank_position
    );
  end loop;
  return v_granted;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.finalize_raid_battle(p_replay_id uuid, p_result jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_replay public.battle_replay_sessions%rowtype;
  v_instance public.raid_bosses%rowtype;
  v_raw bigint;
  v_applied bigint;
  v_remaining bigint;
  v_total bigint;
  v_progress public.raid_instance_user_progress%rowtype;
  v_final jsonb;
begin
  select * into v_replay
  from public.battle_replay_sessions
  where id = p_replay_id
  for update;

  if not found
     or v_replay.battle_mode <> 'RAID'
     or v_replay.resolution_authority <> 'RAID_SERVER' then
    raise exception 'not an official Raid replay' using errcode = '42501';
  end if;
  if v_replay.finalization_status = 'FINALIZED' then
    return v_replay.finalization_result;
  end if;
  if v_replay.status <> 'PENDING'
     or v_replay.finalization_status <> 'PENDING' then
    raise exception 'Raid replay is not finalizable' using errcode = '23514';
  end if;

  select * into v_instance
  from public.raid_bosses
  where id = v_replay.source_reference_id
  for update;
  if not found or v_instance.raid_day_key is null or v_instance.raid_variant_id is null then
    raise exception 'Canonical Raid instance missing' using errcode = 'P0002';
  end if;


 -- Room登録の正本は台帳。bossロック待機後の別SQLで確認する。
 if exists(select 1 from public.raid_rooms where raid_boss_instance_id=v_instance.id) then raise exception 'Room battles require the Room finalization entry point' using errcode='55000'; end if;
  -- 229の非Roomランキングlifecycle hookを復元。Room拒否後にのみ実行。
  perform public.advance_ranking_season('RAID',clock_timestamp());
  perform public.validate_official_battle_result(p_result);
  v_raw := greatest(coalesce((p_result->>'playerRawDamage')::bigint, 0), 0);
  v_applied := least(v_raw, greatest(v_instance.current_hp, 0));
  v_remaining := greatest(v_instance.current_hp - v_applied, 0);

  update public.raid_bosses
  set current_hp = v_remaining
  where id = v_instance.id;

  insert into public.raid_damage_logs(
    boss_id, raid_boss_id, user_id, damage, damage_dealt,
    raid_boss_instance_id, battle_replay_session_id, guild_id,
    raw_damage, applied_damage
  ) values (
    v_instance.boss_id, v_instance.boss_id, v_replay.requester_user_id,
    v_raw, v_raw, v_instance.id, p_replay_id,
    nullif(v_replay.official_context->>'guildIdSnapshot', '')::uuid,
    v_raw, v_applied
  );

  insert into public.raid_instance_user_progress(
    raid_boss_instance_id, user_id, finalized_battles,
    raid_points_consumed, last_guild_id
  ) values (
    v_instance.id, v_replay.requester_user_id, 1,
    case when v_replay.official_context->>'costType' = 'RAID_POINT' then 1 else 0 end,
    nullif(v_replay.official_context->>'guildIdSnapshot', '')::uuid
  )
  on conflict(raid_boss_instance_id, user_id) do update set
    finalized_battles = public.raid_instance_user_progress.finalized_battles + 1,
    raid_points_consumed = public.raid_instance_user_progress.raid_points_consumed
      + excluded.raid_points_consumed,
    last_guild_id = excluded.last_guild_id,
    updated_at = clock_timestamp()
  returning * into v_progress;

  select coalesce(sum(raw_damage), 0) into v_total
  from public.raid_damage_logs
  where raid_boss_instance_id = v_instance.id
    and user_id = v_replay.requester_user_id;

  v_final := p_result || jsonb_build_object(
    'mode', 'RAID',
    'raidInstanceId', v_instance.id,
    'baseId', v_instance.base_id,
    'raidDayKey', v_instance.raid_day_key,
    'raidVariantId', v_instance.raid_variant_id,
    'rawDamage', v_raw,
    'appliedDamage', v_applied,
    'remainingBossHp', v_remaining,
    'personalContribution', v_total,
    'guildIdSnapshot', v_replay.official_context->>'guildIdSnapshot',
    'participationProgress', to_jsonb(v_progress)
  );

  insert into public.battle_replay_events(
    battle_replay_session_id, event_index, round_number, event_type, payload
  )
  select p_replay_id,
         greatest(coalesce((event.value->>'index')::integer, event.ordinality::integer - 1), 0),
         greatest(coalesce((event.value->>'round')::integer, 1), 1),
         coalesce(nullif(event.value->>'type', ''), 'UNKNOWN'),
         coalesce(event.value->'payload', '{}'::jsonb)
  from jsonb_array_elements(p_result->'events') with ordinality event(value, ordinality)
  on conflict do nothing;

  update public.battle_replay_sessions
  set status = 'RESOLVED',
      result = v_final,
      resolved_at = clock_timestamp(),
      finalization_status = 'FINALIZED',
      finalized_at = clock_timestamp(),
      finalization_result = v_final
  where id = p_replay_id;

  perform public.evaluate_mission_progress(
    v_replay.requester_user_id,
    'RAID_FINALIZED_BATTLE_COUNT',
    1
  );

  if v_remaining = 0 then
    perform public.finalize_expired_raid_instance(v_instance.id);
  end if;
  return v_final;
end
$function$
;
CREATE OR REPLACE FUNCTION public.get_public_ranking_reward_master()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_payload jsonb;
  v_guild_cosmetics jsonb;
begin
  v_payload := public.canonical_ranking_reward_payload();

  select coalesce(jsonb_agg(jsonb_build_object(
    'cosmeticId', cosmetic.id,
    'displayName', cosmetic.display_name,
    'rewardKind', 'GUILD_COSMETIC',
    'quantity', 1,
    'isParticipation', cosmetic.id = 'guild_preopen_2026_participation',
    'eligibilityLabel', case
      when cosmetic.id = 'guild_preopen_2026_participation' then '参加ギルド'
      else null
    end,
    'rankMin', case cosmetic.id
      when 'guild_preopen_2026_rank_1' then 1
      when 'guild_preopen_2026_rank_2' then 2
      when 'guild_preopen_2026_rank_3' then 3
      else null
    end,
    'rankMax', case cosmetic.id
      when 'guild_preopen_2026_rank_1' then 1
      when 'guild_preopen_2026_rank_2' then 2
      when 'guild_preopen_2026_rank_3' then 3
      else null
    end
  ) order by case cosmetic.id
    when 'guild_preopen_2026_participation' then 0
    when 'guild_preopen_2026_rank_1' then 1
    when 'guild_preopen_2026_rank_2' then 2
    when 'guild_preopen_2026_rank_3' then 3
    else 99
  end), '[]'::jsonb)
  into v_guild_cosmetics
  from public.cosmetic_master cosmetic
  where cosmetic.active and cosmetic.id = 'guild_preopen_2026_rank_1'
    and cosmetic.owner_scope = 'GUILD'
    and cosmetic.source_type = 'RANKING'
    and cosmetic.source_reference = 'PREOPEN_GUILD_POWER_2026'
    and exists (
      select 1
      from public.ranking_guild_power_season_master season_master
      where season_master.event_key = 'PREOPEN_GUILD_POWER_2026'
    );

  return v_payload || jsonb_build_object(
    'guildSeasonCosmetics', v_guild_cosmetics
  );
end;
$function$
;
CREATE OR REPLACE FUNCTION public.record_current_guild_login()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin if auth.uid() is null then raise exception 'authentication required' using errcode='42501'; end if;
 return public.grant_canonical_guild_daily_exp(auth.uid(),'LOGIN',null); end $function$
;
CREATE OR REPLACE FUNCTION public.get_growth_exp_master()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
select jsonb_build_object(
 'version','2026-09-14',
 'character',(select jsonb_agg(jsonb_build_object('level',level,'required_exp',required_exp,'cost_cash',cost_cash) order by level) from public.character_level_up_master where level between 2 and 100),
 'equipment',(select jsonb_agg(jsonb_build_object('level',level,'required_exp',required_exp,'cost_cash',cost_cash) order by level) from public.equipment_level_up_master where level between 2 and 100),
 'items',(select jsonb_agg(jsonb_build_object('item_id',item_id,'effect_value',(runtime_usage->>'effectValue')::bigint) order by item_id) from public.canonical_item_master where version='2026-08-22' and is_production_enabled and item_id in ('CHAR_EXP_S','CHAR_EXP_M','CHAR_EXP_L','EQUIP_EXP_S','EQUIP_EXP_M','EQUIP_EXP_L'))
)
$function$
;
CREATE OR REPLACE FUNCTION public.quote_growth_exp(p_kind text, p_owned_id uuid, p_materials jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
 u uuid:=auth.uid(); original_level integer; original_xp bigint; lv integer; exp bigint;
 cap integer; enhancement integer; req integer; cost_per_level integer; cash_cost bigint:=0;
 cash_balance bigint; gained bigint:=0; entry record; qty bigint; effect bigint; count_items bigint:=0;
begin
 if u is null then raise exception 'authentication required' using errcode='42501'; end if;
 if p_kind is null or p_kind not in ('CHARACTER','EQUIPMENT') or p_owned_id is null
    or p_materials is null or jsonb_typeof(p_materials)<>'object' then
  raise exception 'invalid growth request' using errcode='22023';
 end if;
 if p_kind='CHARACTER' then
  select level,xp,awakening_level into lv,exp,enhancement from public.user_characters where id=p_owned_id and user_id=u;
  cap:=least(100,50+least(greatest(coalesce(enhancement,0),0),5)*10);
 else
  select level,xp,plus_val into lv,exp,enhancement from public.user_equipments where id=p_owned_id and user_id=u;
  cap:=public.canonical_equipment_level_cap(coalesce(enhancement,0));
 end if;
 if lv is null then raise exception 'owned growth target not found' using errcode='P0002'; end if;
 original_level:=lv; original_xp:=exp;
 for entry in select key,value from jsonb_each(p_materials) order by key loop
  if jsonb_typeof(entry.value)<>'number' or (entry.value::text)!~'^[0-9]+$' then
   raise exception 'material quantity must be a nonnegative integer' using errcode='22023';
  end if;
  qty:=(entry.value::text)::bigint;
  if (p_kind='CHARACTER' and entry.key not in ('CHAR_EXP_S','CHAR_EXP_M','CHAR_EXP_L'))
   or (p_kind='EQUIPMENT' and entry.key not in ('EQUIP_EXP_S','EQUIP_EXP_M','EQUIP_EXP_L')) then
   raise exception 'invalid growth material' using errcode='22023';
  end if;
  if qty>2147483647 then raise exception 'material quantity too large' using errcode='22023'; end if;
  select (runtime_usage->>'effectValue')::bigint into effect from public.canonical_item_master
   where version='2026-08-22' and item_id=entry.key and is_production_enabled;
  if effect is null or effect<=0 then raise exception 'growth item master incomplete' using errcode='P0002'; end if;
  gained:=gained+qty*effect; count_items:=count_items+qty;
 end loop;
 if lv>=100 then raise exception 'final level cap reached' using errcode='23514'; end if;
 exp:=exp+gained;
 while lv<cap loop
  if p_kind='CHARACTER' then
   select required_exp,cost_cash into req,cost_per_level from public.character_level_up_master where level=lv+1;
  else
   select required_exp,cost_cash into req,cost_per_level from public.equipment_level_up_master where level=lv+1;
  end if;
  if req is null or req<=0 or cost_per_level is null or cost_per_level<0 then
   raise exception 'growth level master incomplete' using errcode='P0002';
  end if;
  exit when exp<req;
  exp:=exp-req; lv:=lv+1; cash_cost:=cash_cost+cost_per_level;
 end loop;
 req:=null;
 if lv<100 then
  if p_kind='CHARACTER' then select required_exp into req from public.character_level_up_master where level=lv+1;
  else select required_exp into req from public.equipment_level_up_master where level=lv+1; end if;
  if req is null or req<=0 then raise exception 'growth level master incomplete' using errcode='P0002'; end if;
 end if;
 select cash into cash_balance from public.users where id=u;
 return jsonb_build_object('status','success','kind',p_kind,'owned_id',p_owned_id,
  'current_level',original_level,'current_xp',original_xp,
  'level',lv,'xp',exp,'level_cap',cap,'next_required_exp',req,
  'levels_gained',lv-original_level,'gained_exp',gained,'cash_spent',cash_cost,
  'remaining_cash',cash_balance-cash_cost,'consumed_materials',p_materials);
end
$function$
;
CREATE OR REPLACE FUNCTION public.execute_growth_exp(p_kind text, p_owned_id uuid, p_materials jsonb, p_request_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
 u uuid:=auth.uid(); history public.growth_exp_execution_history%rowtype;
 result jsonb; entry record; qty bigint; owned_qty bigint; cash_balance bigint;
 normalized jsonb; inserted integer; gained_levels integer;
begin
 if u is null then raise exception 'authentication required' using errcode='42501'; end if;
 if p_request_id is null or p_kind is null or p_kind not in ('CHARACTER','EQUIPMENT')
  or p_owned_id is null or p_materials is null or jsonb_typeof(p_materials)<>'object' then
  raise exception 'invalid growth request' using errcode='22023';
 end if;
 -- Keep original request identity, including explicitly selected zero values.
 normalized:=p_materials;
 insert into public.growth_exp_execution_history(user_id,request_id,kind,owned_id,materials)
 values(u,p_request_id,p_kind,p_owned_id,normalized) on conflict(user_id,request_id) do nothing;
 get diagnostics inserted=row_count;
 if inserted=0 then
  select * into history from public.growth_exp_execution_history where user_id=u and request_id=p_request_id for update;
  if history.kind<>p_kind or history.owned_id<>p_owned_id or history.materials<>normalized then
   raise exception 'request_id already used for a different growth request' using errcode='22023';
  end if;
  if history.result_payload is not null then return history.result_payload; end if;
  raise exception 'growth request already in progress' using errcode='55000';
 end if;
 -- Preserve owned-target -> cash -> inventory locking order of legacy growth.
 if p_kind='CHARACTER' then
  perform 1 from public.user_characters where id=p_owned_id and user_id=u for update;
 else
  perform 1 from public.user_equipments where id=p_owned_id and user_id=u for update;
 end if;
 if not found then raise exception 'owned growth target not found' using errcode='P0002'; end if;
 select cash into cash_balance from public.users where id=u for update;
 result:=public.quote_growth_exp(p_kind,p_owned_id,normalized);
 gained_levels:=(result->>'levels_gained')::integer;
 if (result->>'gained_exp')::bigint=0 and gained_levels=0 then
  raise exception 'no EXP or level increase to apply' using errcode='22023';
 end if;
 if cash_balance<(result->>'cash_spent')::bigint then
  raise exception 'insufficient cash' using errcode='23514';
 end if;
 for entry in select key,value from jsonb_each(normalized) order by key loop
  qty:=(entry.value::text)::bigint;
  if qty=0 then continue; end if;
  select quantity into owned_qty from public.user_items where user_id=u and item_id=entry.key for update;
  if coalesce(owned_qty,0)<qty then raise exception 'insufficient growth material' using errcode='23514'; end if;
 end loop;
 update public.users set cash=cash-(result->>'cash_spent')::bigint where id=u;
 for entry in select key,value from jsonb_each(normalized) order by key loop
  qty:=(entry.value::text)::bigint;
  if qty>0 then
   update public.user_items set quantity=quantity-qty,updated_at=now() where user_id=u and item_id=entry.key;
  end if;
 end loop;
 if p_kind='CHARACTER' then
  update public.user_characters set level=(result->>'level')::integer,xp=(result->>'xp')::bigint where id=p_owned_id and user_id=u;
 else
  update public.user_equipments set level=(result->>'level')::integer,xp=(result->>'xp')::bigint where id=p_owned_id and user_id=u;
 end if;
 if gained_levels>0 then
  perform public.evaluate_mission_progress(u,case when p_kind='CHARACTER' then 'CHAR_LEVEL_UP' else 'GEAR_UPGRADE' end,gained_levels);
 end if;
 result:=result||jsonb_build_object('request_id',p_request_id);
 update public.growth_exp_execution_history set result_payload=result where user_id=u and request_id=p_request_id;
 return result;
end
$function$
;
CREATE OR REPLACE FUNCTION public.level_up_character_exp(p_character_id uuid, p_materials jsonb, p_request_id uuid)
 RETURNS jsonb
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 select public.execute_growth_exp('CHARACTER',p_character_id,p_materials,p_request_id)
$function$
;
CREATE OR REPLACE FUNCTION public.level_up_equipment_exp(p_equipment_id uuid, p_materials jsonb, p_request_id uuid)
 RETURNS jsonb
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 select public.execute_growth_exp('EQUIPMENT',p_equipment_id,p_materials,p_request_id)
$function$
;
CREATE OR REPLACE FUNCTION public.monthly_power_continuous_jst_days(p_joined timestamp with time zone, p_start timestamp with time zone, p_end timestamp with time zone)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO ''
AS $function$
 select case when p_joined is null then null when greatest(p_joined,p_start)>=p_end then 0
 else greatest(0,((p_end-interval '1 microsecond') at time zone 'Asia/Tokyo')::date
 -(greatest(p_joined,p_start) at time zone 'Asia/Tokyo')::date+1) end
$function$
;
