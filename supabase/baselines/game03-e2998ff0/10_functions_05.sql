SET check_function_bodies = false;
SET search_path = public, extensions, pg_catalog;
CREATE OR REPLACE FUNCTION public.on_guild_chat_activation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ begin
 if new.target_type='GUILD' and new.user_id is not null and exists(select 1 from public.guild_members where user_id=new.user_id and guild_id=new.target_id) then
  perform public.record_funnel_milestone(new.user_id,'guild_activation',jsonb_build_object('guildId',new.target_id)); end if; return new; end $function$
;
CREATE OR REPLACE FUNCTION public.on_guild_funnel()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ begin
 if tg_table_name='guild_join_requests' then perform public.record_funnel_milestone(new.user_id,'guild_join_applied',jsonb_build_object('guildId',new.guild_id));
 else perform public.record_funnel_milestone(new.user_id,'guild_joined',jsonb_build_object('guildId',new.guild_id)); end if; return new; end $function$
;
CREATE OR REPLACE FUNCTION public.on_m9x_first_human_response()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if new.target_type<>'GUILD' or new.is_system or new.user_id is null then return new; end if;
  update public.guild_human_response_metrics metric
  set first_human_response_message_id=new.id,first_human_response_at=new.created_at,
      response_seconds=greatest(0,extract(epoch from(new.created_at-metric.joined_at))::integer),updated_at=now()
  where metric.guild_id=new.target_id and metric.joined_user_id<>new.user_id
    and metric.first_human_response_at is null and new.created_at>=metric.joined_at;
  return new;
end $function$
;
CREATE OR REPLACE FUNCTION public.on_m9x_gacha_activity()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_result jsonb; v_name text;
begin
  if new.status<>'COMPLETED' or new.result_payload is null or old.status='COMPLETED' then return new; end if;
  select username into v_name from public.users where id=new.user_id;
  for v_result in select value from jsonb_array_elements(coalesce(new.result_payload->'results','[]'::jsonb))
  loop
    if v_result->>'rarity'='SSR' then
      insert into public.social_activity_feed(
        activity_type,actor_user_id,actor_display_name,object_master_id,display_payload
      ) values(
        case v_result->>'type'
          when 'SKILL' then 'SSR_SKILL'
          when 'EQUIPMENT' then 'SSR_EQUIPMENT'
          else 'SSR_CHARACTER'
        end,
        new.user_id,coalesce(v_name,'PLAYER'),
        coalesce(v_result->>'character_id',v_result->>'item_id'),
        jsonb_build_object('rarity','SSR','outcome',v_result->>'outcome')
      );
    end if;
  end loop;
  return new;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.on_m9x_guild_created_activity()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_name text;
begin
  select username into v_name from public.users where id=new.leader_id;
  insert into public.social_activity_feed(activity_type,actor_user_id,actor_display_name,guild_id,display_payload,permanent)
  values('GUILD_CREATED',new.leader_id,coalesce(v_name,'PLAYER'),new.id,jsonb_build_object('guild_name',new.name),true);
  return new;
end $function$
;
CREATE OR REPLACE FUNCTION public.on_m9x_power_leader_activity()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_current uuid; v_name text;
begin
  if exists(select 1 from public.user_power_rankings other where other.user_id<>new.user_id and other.total_power>new.total_power) then return new; end if;
  select subject_user_id into v_current from public.social_activity_projection_state where projection_key='POWER_RANK_1' for update;
  if v_current is not distinct from new.user_id then return new; end if;
  insert into public.social_activity_projection_state(projection_key,subject_user_id) values('POWER_RANK_1',new.user_id)
  on conflict(projection_key) do update set subject_user_id=excluded.subject_user_id,updated_at=now();
  select username into v_name from public.users where id=new.user_id;
  insert into public.social_activity_feed(activity_type,actor_user_id,actor_display_name,display_payload)
  values('POWER_RANK_1',new.user_id,coalesce(v_name,'PLAYER'),jsonb_build_object('total_power',new.total_power));
  return new;
end $function$
;
CREATE OR REPLACE FUNCTION public.on_main_formation_special_mission_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  perform public.ensure_active_special_missions(coalesce(new.user_id, old.user_id));
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.on_mission_claim_unlock()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if new.status<>'CLAIMED' or old.status='CLAIMED' then return new; end if;
  insert into public.user_missions(user_id,mission_id,current_progress,progress_val,status,cycle_date)
  select new.user_id,child.id,0,0,'PROGRESS',null
  from public.missions child
  where child.is_enabled and child.category='NORMAL' and child.prerequisite_mission_id=new.mission_id
  on conflict(user_id,mission_id) do nothing;

  update public.user_missions unlocked set
    current_progress=child.target_value,progress_val=child.target_value,status='CLEAR',updated_at=clock_timestamp()
  from public.missions child
  where unlocked.user_id=new.user_id and unlocked.mission_id=child.id
    and child.prerequisite_mission_id=new.mission_id and unlocked.status='PROGRESS'
    and public.canonical_funnel_milestone_satisfied(new.user_id,child.trigger_type);
  return new;
end $function$
;
CREATE OR REPLACE FUNCTION public.on_official_battle_funnel()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_first boolean; v_needed integer:=0; v_level integer; v_xp integer; v_l integer;
begin
 if new.finalization_status<>'FINALIZED' or old.finalization_status='FINALIZED' then return new; end if;
 if new.battle_mode='PVP' and new.resolution_authority='PVP_SERVER' then
   v_first:=public.record_funnel_milestone(new.requester_user_id,'first_pvp',jsonb_build_object('replayId',new.id));
   if v_first then
     select level,xp into v_level,v_xp from public.users where id=new.requester_user_id for update;
     if v_level<5 then
       v_needed:=-v_xp;
       for v_l in v_level..4 loop v_needed:=v_needed+coalesce((select next_xp from public.user_level_master where level=v_l),0); end loop;
       if v_needed>0 then perform public.apply_user_xp(new.requester_user_id,v_needed); end if;
     end if;
   end if;
 elsif new.battle_mode='RAID' and new.resolution_authority='RAID_SERVER' then
   if not exists(select 1 from public.user_funnel_milestones where user_id=new.requester_user_id and milestone='first_raid') then
     perform public.record_funnel_milestone(new.requester_user_id,'first_raid',jsonb_build_object('replayId',new.id,'raidInstanceId',new.source_reference_id));
   elsif not exists(select 1 from public.user_funnel_milestones where user_id=new.requester_user_id and milestone='second_raid') then
     perform public.record_funnel_milestone(new.requester_user_id,'second_raid',jsonb_build_object('replayId',new.id,'raidInstanceId',new.source_reference_id));
   end if;
 end if;
 return new;
end; $function$
;
CREATE OR REPLACE FUNCTION public.on_post_tutorial_free_asset_gacha()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_milestone text;
begin
  if new.status <> 'COMPLETED'
     or new.payment_source <> 'free'
     or new.pull_count <> 10
     or new.gacha_id not in ('SKILL_NORMAL', 'EQUIP_NORMAL') then
    return new;
  end if;
  if not exists (
    select 1 from public.tutorial_progress
    where user_id = new.user_id
      and (
        step_id = 'AUTHENTICATION'
        or (step_id = 'COMPLETE' and authentication_pending = true)
      )
  ) then
    return new;
  end if;

  v_milestone := case new.gacha_id
    when 'SKILL_NORMAL' then 'first_free_skill_ten_pull'
    else 'first_free_equipment_ten_pull'
  end;
  perform public.record_post_tutorial_guide_milestone(
    new.user_id,
    v_milestone,
    jsonb_build_object('gachaId', new.gacha_id, 'requestId', new.request_id, 'pullCount', new.pull_count)
  );
  return new;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.on_progression_growth_funnel()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_changed boolean:=false;
  v_tutorial_step text;
begin
  if tg_table_name='user_characters' then
    v_changed:=coalesce(new.level,1)>coalesce(old.level,1)
      or coalesce(new.awakening_level,0)>coalesce(old.awakening_level,0);

    -- Tutorial gacha duplicate resolution may increase awakening. It must not
    -- complete the explicit Growth funnel step before the player levels up.
    if coalesce(new.level,1)=coalesce(old.level,1)
       and coalesce(new.awakening_level,0)>coalesce(old.awakening_level,0) then
      select step_id into v_tutorial_step
      from public.tutorial_progress
      where user_id=new.user_id;
      if v_tutorial_step='FREE_GACHA' then v_changed:=false; end if;
    end if;
  elsif tg_table_name='user_equipments' then
    v_changed:=coalesce(new.level,1)>coalesce(old.level,1)
      or coalesce(new.plus_val,0)>coalesce(old.plus_val,0);
  elsif tg_table_name='user_skills' then
    v_changed:=coalesce(new.plus_val,0)>coalesce(old.plus_val,0);
  end if;

  if v_changed then
    perform public.record_funnel_milestone(
      new.user_id,
      'first_growth',
      jsonb_build_object('source',tg_table_name)
    );
  end if;
  return new;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.on_ranking_successful_view_special_mission()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if new.event_name = 'ranking_viewed' then
    perform public.evaluate_mission_progress(new.user_id, 'RANKING_PAGE_SUCCESSFUL_VIEW_COUNT', 1);
  end if;
  return new;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.on_special_mission_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_mission public.missions%rowtype;
begin
  if old.status is not distinct from new.status or new.status <> 'CLEAR' then
    return new;
  end if;
  select * into v_mission from public.missions where id = new.mission_id;
  if not found or v_mission.category <> 'SPECIAL' or v_mission.event_id is null then
    return new;
  end if;

  insert into public.mission_event_telemetry(
    event_id, user_id, event_name, mission_id, jst_date, source, metadata
  ) values (
    v_mission.event_id, new.user_id,
    case when v_mission.trigger_type = 'GVG_PREP_REQUIRED_MISSIONS_COMPLETED'
      then 'complete_achieved' else 'mission_achieved' end,
    new.mission_id, (clock_timestamp() at time zone 'Asia/Tokyo')::date,
    'server_authority', jsonb_build_object('progress', new.current_progress)
  );

  if v_mission.trigger_type <> 'GVG_PREP_REQUIRED_MISSIONS_COMPLETED' then
    perform public.refresh_special_event_completion(new.user_id, v_mission.event_id);
  end if;
  return new;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.on_tutorial_complete_funnel()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if new.step_id='COMPLETE' and old.step_id is distinct from new.step_id then
    perform public.record_funnel_milestone(new.user_id,'tutorial_complete',jsonb_build_object('source','tutorial_progress'));
  end if;
  return new;
end; $function$
;
CREATE OR REPLACE FUNCTION public.operations_feature_state(p_feature_key text)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 select coalesce((select state from public.feature_operating_states where feature_key=upper(p_feature_key)),'CLOSED')
$function$
;
CREATE OR REPLACE FUNCTION public.power_projection_master_changed()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin perform public.refresh_all_user_power_projections(); return null; end;
$function$
;
CREATE OR REPLACE FUNCTION public.prepare_current_tutorial_growth()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid:=auth.uid(); v_step text; v_character_id text; v_owned_id uuid;
  v_level integer; v_required_level constant integer:=7; v_required integer;
  v_before integer:=0; v_after integer:=0;
begin
  if v_user_id is null then raise exception 'authentication required' using errcode='42501'; end if;
  select step_id into v_step from public.tutorial_progress where user_id=v_user_id for update;
  if v_step is null then raise exception 'tutorial progress not found' using errcode='P0002'; end if;
  if v_step<>'AUTO_FORMATION' then
    if v_step in ('DISPATCH','FREE_INSTANT','TUTORIAL_BATTLE','RULE_GUIDE','COMPLETE','AUTHENTICATION') then
      return jsonb_build_object('status','already_advanced','tutorial_step',v_step,'granted_quantity',0);
    end if;
    raise exception 'tutorial growth is not active' using errcode='23514';
  end if;
  select result->>'character_id' into v_character_id
  from public.gacha_execution_history history
  cross join lateral jsonb_array_elements(coalesce(history.result_payload->'results','[]'::jsonb)) result
  where history.user_id=v_user_id and history.status='COMPLETED'
    and coalesce((history.result_payload->>'tutorial')::boolean,false)
    and coalesce((result->>'tutorial_slot')::integer,0)=10
  order by history.created_at desc limit 1;
  select id,level into v_owned_id,v_level from public.user_characters
  where user_id=v_user_id and character_id=v_character_id for update;
  if v_owned_id is null then raise exception 'guaranteed tutorial Character is required' using errcode='23514'; end if;
  v_required:=greatest(v_required_level-coalesce(v_level,1),0);
  select coalesce(quantity,0) into v_before from public.user_items
  where user_id=v_user_id and item_id='CHAR_EXP_S' for update;
  if not found then v_before:=0; end if;
  if v_before<v_required then
    insert into public.user_items(user_id,item_id,quantity) values(v_user_id,'CHAR_EXP_S',v_required)
    on conflict(user_id,item_id) do update set quantity=greatest(public.user_items.quantity,excluded.quantity),updated_at=now();
  end if;
  select coalesce(quantity,0) into v_after from public.user_items where user_id=v_user_id and item_id='CHAR_EXP_S';
  return jsonb_build_object(
    'status',case when v_level>=v_required_level then 'growth_complete' else 'ready' end,
    'tutorial_step',v_step,'target_character_id',v_character_id,'target_user_character_id',v_owned_id,
    'current_level',v_level,'required_level',v_required_level,'required_quantity',v_required,
    'quantity',v_after,'granted_quantity',greatest(v_after-v_before,0),'cash_cost',v_required*100);
end;
$function$
;
CREATE OR REPLACE FUNCTION public.process_daily_reset(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_last_login DATE;
  v_today DATE := CURRENT_DATE;
BEGIN
  -- 1. Check user's last login date
  SELECT last_login_date INTO v_last_login
  FROM users
  WHERE id = p_user_id;

  -- 2. If already logged in today, do nothing
  IF v_last_login = v_today THEN
    RETURN;
  END IF;

  -- 3. Reset Daily Missions
  UPDATE user_missions
  SET status = 'IN_PROGRESS', progress_val = 0, claimed_at = NULL, updated_at = NOW()
  WHERE user_id = p_user_id 
    AND mission_id IN (
      SELECT id FROM missions_master WHERE category = 'DAILY'
    );

  -- 4. Reset Raid Attempts Today (Set to 0)
  UPDATE users
  SET raid_attempts_today = 0,
      last_login_date = v_today,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- 5. Restore Vitality if below 100
  UPDATE users
  SET vitality = GREATEST(vitality, 100)
  WHERE id = p_user_id AND vitality < 100;

END;
$function$
;
CREATE OR REPLACE FUNCTION public.process_gvg_battle_result(p_user_id uuid, p_guild_id uuid, p_base_id text, p_is_practice boolean, p_is_win boolean)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN jsonb_build_object('success', true);
END;
$function$
;
CREATE OR REPLACE FUNCTION public.process_gvg_battle_result_v2(p_guild_id uuid, p_battle_id text, p_points integer, p_is_guild_a boolean)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RAISE EXCEPTION 'Legacy GvG result RPC is retired; use server replay resolution';
END;
$function$
;
CREATE OR REPLACE FUNCTION public.process_login_bonus()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_current_step integer;
  v_total_logins integer;
  v_last_claimed_at timestamptz;
  v_now timestamptz := clock_timestamp();
  v_today_jst date := (clock_timestamp() AT TIME ZONE 'Asia/Tokyo')::date;
  v_reward public.login_bonus_master%ROWTYPE;
BEGIN
  IF v_user_id IS NULL OR NOT EXISTS (SELECT 1 FROM public.users WHERE id = v_user_id) THEN
    RAISE EXCEPTION 'Player authentication required';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(v_user_id::text || ':login_bonus', 0));

  SELECT current_day, total_logins, last_claimed_at
  INTO v_current_step, v_total_logins, v_last_claimed_at
  FROM public.user_login_bonuses
  WHERE user_id = v_user_id
  FOR UPDATE;

  IF FOUND AND (v_last_claimed_at AT TIME ZONE 'Asia/Tokyo')::date = v_today_jst THEN
    RETURN jsonb_build_object(
      'delivery', case when exists(select 1 from public.gameplay_reward_delivery_ledger where user_id=v_user_id and source_kind='LOGIN_BONUS' and source_key=v_today_jst::text) then 'DIRECT' else 'PRESENT' end,
      'claimed', false,
      'already_claimed', true,
      'reason', 'ALREADY_CLAIMED',
      'current_step', v_current_step,
      'day_number', v_current_step,
      'total_logins', v_total_logins,
      'last_claimed_date', v_today_jst::text
    );
  END IF;

  IF NOT FOUND THEN
    v_current_step := 1;
    v_total_logins := 1;
  ELSE
    v_current_step := (v_current_step % 30) + 1;
    v_total_logins := v_total_logins + 1;
  END IF;

  SELECT * INTO v_reward
  FROM public.login_bonus_master
  WHERE day_number = v_current_step;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Login bonus master is missing for step %', v_current_step;
  END IF;

  INSERT INTO public.user_login_bonuses (
    user_id, current_day, total_logins, last_claimed_at
  ) VALUES (
    v_user_id, v_current_step, v_total_logins, v_now
  )
  ON CONFLICT (user_id) DO UPDATE
  SET current_day = EXCLUDED.current_day,
      total_logins = EXCLUDED.total_logins,
      last_claimed_at = EXCLUDED.last_claimed_at;

  PERFORM public._grant_gameplay_reward_v1(v_user_id,'LOGIN_BONUS',v_today_jst::text,v_reward.item_id,v_reward.quantity);

  RETURN jsonb_build_object(
    'delivery', 'DIRECT',
    'claimed', true,
    'already_claimed', false,
    'current_step', v_current_step,
    'day_number', v_current_step,
    'total_logins', v_total_logins,
    'last_claimed_date', v_today_jst::text,
    'item_id', v_reward.item_id,
    'quantity', v_reward.quantity,
    'item_name', v_reward.item_name,
    'reward', jsonb_build_object(
      'day_number', v_reward.day_number,
      'item_id', v_reward.item_id,
      'item_name', v_reward.item_name,
      'quantity', v_reward.quantity,
      'is_featured', v_reward.is_featured
    )
  );
END;
$function$
;
CREATE OR REPLACE FUNCTION public.process_pvp_match_result(p_user_id uuid, p_target_user_id uuid, p_is_win boolean, p_point_diff integer, p_cash_reward integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_points INTEGER;
  v_cash BIGINT;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  IF p_point_diff IS NULL OR p_point_diff < -1000 OR p_point_diff > 1000 THEN
    RAISE EXCEPTION 'invalid point change';
  END IF;
  IF p_cash_reward IS NULL OR p_cash_reward < 0 OR p_cash_reward > 1000000 THEN
    RAISE EXCEPTION 'invalid cash reward';
  END IF;

  INSERT INTO public.pvp_ranks (user_id, rank_points, daily_wins, season_wins)
  VALUES (
    p_user_id,
    GREATEST(1000 + p_point_diff, 0),
    CASE WHEN p_is_win THEN 1 ELSE 0 END,
    CASE WHEN p_is_win THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id) DO UPDATE SET
    rank_points = GREATEST(COALESCE(public.pvp_ranks.rank_points, 0) + p_point_diff, 0),
    daily_wins = COALESCE(public.pvp_ranks.daily_wins, 0) + CASE WHEN p_is_win THEN 1 ELSE 0 END,
    season_wins = COALESCE(public.pvp_ranks.season_wins, 0) + CASE WHEN p_is_win THEN 1 ELSE 0 END,
    updated_at = now();

  UPDATE public.users
  SET cash = cash + p_cash_reward
  WHERE id = p_user_id
  RETURNING cash INTO v_cash;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'user not found';
  END IF;

  SELECT rank_points INTO v_points
  FROM public.pvp_ranks
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'status', 'success',
    'rank_points', v_points,
    'cash', v_cash,
    'target_user_id', p_target_user_id
  );
END;
$function$
;
CREATE OR REPLACE FUNCTION public.process_pvp_match_result_v2(p_user_id uuid, p_is_win boolean, p_point_diff integer, p_cash_reward integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_next_daily INTEGER;
    v_next_season INTEGER;
    v_next_points INTEGER;
BEGIN
    INSERT INTO public.pvp_ranks (user_id, rank_points, daily_wins, season_wins)
    VALUES (p_user_id, GREATEST(1000 + p_point_diff, 0), CASE WHEN p_is_win THEN 1 ELSE 0 END, CASE WHEN p_is_win THEN 1 ELSE 0 END)
    ON CONFLICT (user_id) DO UPDATE SET 
        rank_points = GREATEST(public.pvp_ranks.rank_points + p_point_diff, 0),
        daily_wins = public.pvp_ranks.daily_wins + CASE WHEN p_is_win THEN 1 ELSE 0 END,
        season_wins = public.pvp_ranks.season_wins + CASE WHEN p_is_win THEN 1 ELSE 0 END;

    IF p_cash_reward > 0 THEN
        UPDATE public.users SET cash = cash + p_cash_reward WHERE id = p_user_id;
    END IF;

    RETURN jsonb_build_object('status', 'success');
END;
$function$
;
CREATE OR REPLACE FUNCTION public.process_stripe_shop_purchase(p_user_id uuid, p_product_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Stripe購入ロジック
    RETURN jsonb_build_object('success', true);
END;
$function$
;
CREATE OR REPLACE FUNCTION public.process_stripe_shop_purchase(p_user_id uuid, p_product_id text, p_stripe_session_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RAISE EXCEPTION 'Stripe purchases must be fulfilled by a verified webhook';
END;
$function$
;
CREATE OR REPLACE FUNCTION public.process_stripe_shop_purchase(p_user_id uuid, p_stripe_session_id text, p_product_id text, p_amount_jpy integer, p_items jsonb, p_product_title text, p_is_beginner boolean DEFAULT false, p_purchase_limit integer DEFAULT 0)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RAISE EXCEPTION 'Stripe purchases must be fulfilled by a verified webhook';
END;
$function$
;
CREATE OR REPLACE FUNCTION public.purchase_monthly_pass(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ begin perform public.assert_feature_mutation_allowed('PAYMENT'); return public.purchase_monthly_pass_core_20260823(p_user_id); end $function$
;
CREATE OR REPLACE FUNCTION public.purchase_monthly_pass_core_20260823(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    INSERT INTO public.user_monthly_passes (user_id, expires_at)
    VALUES (p_user_id, now() + interval '30 days')
    ON CONFLICT (id) DO NOTHING;

    RETURN jsonb_build_object('success', true);
END;
$function$
;
CREATE OR REPLACE FUNCTION public.pvp_season_reset(p_user_id uuid, p_current_rate integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_reward public.pvp_rewards_master%ROWTYPE;
BEGIN
  IF COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') <> 'admin' THEN RAISE EXCEPTION 'admin role required'; END IF;
  SELECT * INTO v_reward FROM public.pvp_rewards_master WHERE threshold_points <= p_current_rate ORDER BY threshold_points DESC LIMIT 1;
  IF FOUND THEN
    INSERT INTO public.presents (user_id, item_id, quantity, message, status, sent_at, expire_at)
    VALUES (p_user_id, v_reward.reward_item_id, v_reward.reward_quantity, 'PvP season reward', 'UNCLAIMED', now(), now() + interval '1 day');
  END IF;
  UPDATE public.pvp_ranks SET rank_points = 1000, daily_wins = 0, season_wins = 0, updated_at = now();
END;
$function$
;
CREATE OR REPLACE FUNCTION public.raid_boss_defeat()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') <> 'admin' THEN RAISE EXCEPTION 'admin role required'; END IF;
  UPDATE public.raid_bosses SET current_hp = max_hp, status = 'ACTIVE', expires_at = now() + interval '1 day';
  DELETE FROM public.raid_damage_logs;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.raid_season_reset()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
 if coalesce(auth.jwt()->'app_metadata'->>'role','')<>'admin' then raise exception 'admin role required'; end if;
 return;
end $function$
;
CREATE OR REPLACE FUNCTION public.ranking_period_bounds(p_type text, p_at timestamp with time zone DEFAULT clock_timestamp())
 RETURNS TABLE(starts_at timestamp with time zone, ends_at timestamp with time zone)
 LANGUAGE plpgsql
 IMMUTABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_local timestamp := p_at at time zone 'Asia/Tokyo';
  v_start timestamp;
begin
  case upper(p_type)
    when 'PVP' then v_start := date_trunc('month',v_local);
    when 'RAID' then v_start := date_trunc('week',v_local);
    else raise exception 'unsupported automatic ranking season type' using errcode='22023';
  end case;
  starts_at := v_start at time zone 'Asia/Tokyo';
  ends_at := (v_start + case upper(p_type) when 'PVP' then interval '1 month' else interval '1 week' end)
    at time zone 'Asia/Tokyo';
  return next;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.reconcile_pvp_after_season_boundary(p_season_id uuid, p_transition_at timestamp with time zone)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_season public.ranking_seasons%rowtype;
  v_snapshot record;
  v_event record;
  v_rating integer;
  v_wins integer;
  v_replay_count integer;
  v_before jsonb;
  v_expected jsonb;
  v_after jsonb;
begin
  select * into strict v_season from public.ranking_seasons where id=p_season_id for update;
  v_replay_count:=public.assert_pvp_boundary_replay_continuity(p_season_id,p_transition_at);
  select coalesce(jsonb_agg(jsonb_build_object('user_id',rank.user_id,'rank_points',rank.rank_points,
    'daily_wins',rank.daily_wins,'season_wins',rank.season_wins) order by rank.user_id),'[]'::jsonb)
  into v_before from public.pvp_ranks rank;
  v_expected:='[]'::jsonb;

  perform set_config('tribe_neon.ranking_reconcile','on',true);
  perform public.soft_reset_pvp_ratings();
  for v_snapshot in
    select * from public.ranking_pvp_season_snapshots where season_id=p_season_id order by user_id
  loop
    v_rating:=public.canonical_pvp_soft_reset(v_snapshot.rank_points);
    v_wins:=0;
    for v_event in
      select (replay.finalization_result->>'rankDelta')::integer rank_delta,
        replay.finalization_result->>'winner' winner
      from public.battle_replay_sessions replay
      where replay.requester_user_id=v_snapshot.user_id and replay.battle_mode='PVP'
        and replay.finalization_status='FINALIZED'
        and replay.finalized_at>=v_season.ends_at and replay.finalized_at<p_transition_at
      order by replay.finalized_at,replay.id
    loop
      v_rating:=greatest(v_rating+v_event.rank_delta,0);
      if v_event.winner='PLAYER' then v_wins:=v_wins+1; end if;
    end loop;
    v_expected:=v_expected||jsonb_build_array(jsonb_build_object(
      'user_id',v_snapshot.user_id,'rank_points',v_rating,
      'daily_wins',v_wins,'season_wins',v_wins
    ));
    update public.pvp_ranks set rank_points=v_rating,daily_wins=v_wins,season_wins=v_wins,
      updated_at=clock_timestamp() where user_id=v_snapshot.user_id;
  end loop;
  perform set_config('tribe_neon.ranking_reconcile','off',true);

  select coalesce(jsonb_agg(jsonb_build_object('user_id',rank.user_id,'rank_points',rank.rank_points,
    'daily_wins',rank.daily_wins,'season_wins',rank.season_wins) order by rank.user_id),'[]'::jsonb)
  into v_after from public.pvp_ranks rank;
  if v_after<>v_expected then raise exception 'PVP reconstructed projection mismatch'; end if;
  insert into public.ranking_season_transition_audits(
    season_id,ranking_type,replay_count,post_boundary_user_count,
    before_projection,expected_projection,after_projection
  ) values (
    p_season_id,'PVP',v_replay_count,
    (select count(distinct replay.requester_user_id) from public.battle_replay_sessions replay
      where replay.battle_mode='PVP' and replay.finalization_status='FINALIZED'
        and replay.finalized_at>=v_season.ends_at and replay.finalized_at<p_transition_at),
    v_before,v_expected,v_after
  ) on conflict(season_id) do update set
    replay_count=excluded.replay_count,post_boundary_user_count=excluded.post_boundary_user_count,
    before_projection=excluded.before_projection,expected_projection=excluded.expected_projection,
    after_projection=excluded.after_projection,completed_at=clock_timestamp();
  return v_replay_count;
exception when others then
  perform set_config('tribe_neon.ranking_reconcile','off',true);
  raise;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.record_client_funnel_event(p_event_name text, p_source_screen text DEFAULT NULL::text, p_source_cta text DEFAULT NULL::text, p_object_id text DEFAULT NULL::text, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user uuid:=auth.uid();
  v_guild_events text[]:=array['guild_recommendation_click','ranking_guild_detail','guild_detail_view','guild_detail_join_click','guild_welcome_chat_click','guild_chat_raid_click'];
begin
  if v_user is null then raise exception 'authentication required' using errcode='42501'; end if;
  if p_event_name not in (
    'game_start','tutorial_complete','first_gacha','first_growth','first_battle',
    'ranking_viewed','guild_recommendation_impression','guild_detail_view',
    'pvp_to_raid_cta','raid_to_guild_cta','home_primary_cta_impression',
    'home_primary_cta_click','mission_cta_click','ranking_player_detail',
    'ranking_guild_detail','guild_recommendation_click','guild_detail_join_click',
    'guild_welcome_chat_click','guild_chat_raid_click'
  ) then
    raise exception 'event is not allowlisted' using errcode='22023';
  end if;
  if pg_column_size(coalesce(p_metadata,'{}'::jsonb))>4096 then raise exception 'event metadata is too large'; end if;
  if p_event_name=any(v_guild_events) and (p_object_id is null or not exists(select 1 from public.guilds where id::text=p_object_id)) then
    raise exception 'valid Guild target is required' using errcode='22023';
  end if;
  if p_event_name='ranking_player_detail' and (p_object_id is null or not exists(select 1 from public.users where id::text=p_object_id)) then
    raise exception 'valid player target is required' using errcode='22023';
  end if;
  if p_event_name='guild_recommendation_impression' and coalesce(p_source_screen,'') not in ('raid','home','guild') then
    raise exception 'invalid recommendation source' using errcode='22023';
  end if;
  insert into public.client_funnel_events(user_id,event_name,source_screen,source_cta,object_id,metadata)
  values(v_user,p_event_name,left(p_source_screen,64),left(p_source_cta,64),left(p_object_id,128),coalesce(p_metadata,'{}'::jsonb));
  if p_event_name='guild_detail_view' then
    perform public.record_funnel_milestone(v_user,'guild_detail_view',jsonb_build_object('guildId',p_object_id,'source',p_source_screen));
  elsif p_event_name='ranking_viewed' then
    perform public.record_funnel_milestone(v_user,'ranking_viewed',jsonb_build_object('source',coalesce(p_source_screen,'ranking')));
  end if;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.record_funnel_milestone(p_user_id uuid, p_milestone text, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_inserted boolean;
begin
  if p_milestone not in (
    'tutorial_complete','first_gacha','first_growth','first_battle','first_pvp',
    'ranking_viewed','first_raid','guild_detail_view','guild_join_applied',
    'guild_joined','guild_activation','second_raid'
  ) then
    raise exception 'unsupported funnel milestone';
  end if;
  insert into public.user_funnel_milestones(user_id,milestone,metadata)
  values(p_user_id,p_milestone,coalesce(p_metadata,'{}'::jsonb))
  on conflict(user_id,milestone) do update set
    last_occurred_at=now(),
    occurrence_count=public.user_funnel_milestones.occurrence_count+1,
    metadata=public.user_funnel_milestones.metadata||excluded.metadata
  returning xmax=0 into v_inserted;
  return v_inserted;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.record_guild_activity(p_action_type text, p_source_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_guild_id uuid;
  v_xp_grant integer;
  v_contribution_grant integer;
  v_level integer;
  v_xp integer;
  v_next_xp integer;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication is required'; END IF;
  IF p_action_type <> 'QUEST' OR NOT EXISTS (
    SELECT 1 FROM public.user_patrols
    WHERE id = p_source_id AND user_id = auth.uid() AND status = 'COMPLETED'
  ) THEN RAISE EXCEPTION 'Invalid guild activity source'; END IF;
  SELECT guild_id INTO v_guild_id FROM public.guild_members WHERE user_id = auth.uid();
  IF v_guild_id IS NULL THEN RETURN jsonb_build_object('status', 'not_in_guild'); END IF;
  SELECT xp_grant, contribution_grant INTO v_xp_grant, v_contribution_grant
  FROM public.guild_xp_action_master WHERE action_type = p_action_type;
  IF NOT FOUND THEN RAISE EXCEPTION 'Guild activity master not found'; END IF;
  INSERT INTO public.guild_activity_grants(guild_id, user_id, action_type, source_id)
  VALUES (v_guild_id, auth.uid(), p_action_type, p_source_id)
  ON CONFLICT (user_id, action_type, source_id) DO NOTHING;
  IF NOT FOUND THEN RETURN jsonb_build_object('status', 'already_recorded'); END IF;
  UPDATE public.guild_members
  SET weekly_contribution = weekly_contribution + v_contribution_grant,
      total_contribution = total_contribution + v_contribution_grant,
      contribution_points = COALESCE(contribution_points, 0) + v_contribution_grant
  WHERE guild_id = v_guild_id AND user_id = auth.uid();
  SELECT level, xp INTO v_level, v_xp FROM public.guilds WHERE id = v_guild_id FOR UPDATE;
  SELECT next_xp INTO v_next_xp FROM public.guild_level_master WHERE level = v_level;
  IF v_next_xp IS NOT NULL AND v_xp + v_xp_grant >= v_next_xp
     AND EXISTS (SELECT 1 FROM public.guild_level_master WHERE level = v_level + 1) THEN
    UPDATE public.guilds SET level = level + 1, xp = v_xp + v_xp_grant - v_next_xp WHERE id = v_guild_id;
  ELSE
    UPDATE public.guilds SET xp = xp + v_xp_grant WHERE id = v_guild_id;
  END IF;
  RETURN jsonb_build_object('status', 'success', 'xp_gained', v_xp_grant, 'contribution_gained', v_contribution_grant);
END;
$function$
;
CREATE OR REPLACE FUNCTION public.record_mission_event_telemetry(p_event_id text, p_event_name text, p_source text DEFAULT NULL::text, p_mission_id text DEFAULT NULL::text, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_uid uuid:=auth.uid();
begin
  if v_uid is null then raise exception 'authentication required' using errcode='42501'; end if;
  if p_event_name not in (
    'dialog_primary_cta','dialog_later','banner_impression','banner_click','special_tab_view'
  ) then raise exception 'mission event telemetry is not allowlisted' using errcode='22023'; end if;
  if pg_column_size(coalesce(p_metadata,'{}'::jsonb))>4096 then
    raise exception 'event metadata is too large' using errcode='22023';
  end if;
  if not exists(select 1 from public.mission_events where id=p_event_id and is_enabled) then
    raise exception 'mission event not found' using errcode='23503';
  end if;
  if p_mission_id is not null and not exists(
    select 1 from public.missions where id=p_mission_id and event_id=p_event_id
  ) then raise exception 'mission does not belong to event' using errcode='23503'; end if;
  insert into public.mission_event_telemetry(
    event_id,user_id,event_name,mission_id,jst_date,source,metadata
  ) values (
    p_event_id,v_uid,p_event_name,p_mission_id,
    (clock_timestamp() at time zone 'Asia/Tokyo')::date,left(p_source,64),coalesce(p_metadata,'{}'::jsonb)
  );
end;
$function$
;
CREATE OR REPLACE FUNCTION public.record_post_tutorial_guide_milestone(p_user_id uuid, p_milestone text, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_inserted boolean;
begin
  if p_milestone not in (
    'first_free_skill_ten_pull','first_free_equipment_ten_pull',
    'first_main_loadout','post_tutorial_quest'
  ) then
    raise exception 'unsupported post-tutorial guide milestone' using errcode='22023';
  end if;
  insert into public.user_funnel_milestones(user_id,milestone,metadata)
  values(p_user_id,p_milestone,coalesce(p_metadata,'{}'::jsonb))
  on conflict(user_id,milestone) do nothing returning true into v_inserted;
  return coalesce(v_inserted,false);
end;
$function$
;
CREATE OR REPLACE FUNCTION public.record_raid_boss_damage(p_user_id uuid, p_boss_id text, p_damage integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_current_hp BIGINT;
  v_max_hp BIGINT;
  v_status TEXT;
  v_new_hp BIGINT;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  IF p_damage IS NULL OR p_damage <= 0 OR p_damage > 1000000000 THEN
    RAISE EXCEPTION 'invalid damage';
  END IF;

  SELECT current_hp, max_hp, status
  INTO v_current_hp, v_max_hp, v_status
  FROM public.raid_bosses
  WHERE boss_id = p_boss_id AND expires_at > now()
  FOR UPDATE;
  IF NOT FOUND OR v_status = 'DEFEATED' OR COALESCE(v_current_hp, 0) <= 0 THEN
    RAISE EXCEPTION 'raid boss is not active';
  END IF;

  v_new_hp := GREATEST(v_current_hp - p_damage, 0);
  UPDATE public.raid_bosses
  SET current_hp = v_new_hp,
      status = CASE WHEN v_new_hp = 0 THEN 'DEFEATED' ELSE status END
  WHERE boss_id = p_boss_id;

  INSERT INTO public.raid_damage_logs (boss_id, user_id, damage)
  VALUES (p_boss_id, p_user_id, p_damage);

  RETURN jsonb_build_object(
    'status', 'success',
    'damage', p_damage,
    'remaining_hp', v_new_hp,
    'defeated', v_new_hp = 0
  );
END;
$function$
;
CREATE OR REPLACE FUNCTION public.reject_friend_request_core_20260823(p_request_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_user uuid:=auth.uid();
begin
 if v_user is null then raise exception 'authentication required' using errcode='42501'; end if;
 update public.friend_requests set status='REJECTED',resolved_at=clock_timestamp()
 where id=p_request_id and receiver_id=v_user and status='PENDING';
 if not found then raise exception 'request is not rejectable' using errcode='42501'; end if;
 return jsonb_build_object('status','REJECTED');
end $function$
;
CREATE OR REPLACE FUNCTION public.record_raid_boss_damage_v2(p_user_id uuid, p_boss_id text, p_damage integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_boss public.raid_bosses%ROWTYPE;
  v_remaining_hp BIGINT;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  IF p_damage IS NULL OR p_damage <= 0 THEN
    RAISE EXCEPTION 'Damage must be positive';
  END IF;

  SELECT * INTO v_boss
  FROM public.raid_bosses
  WHERE boss_id = p_boss_id AND status = 'ACTIVE' AND expires_at > now()
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Raid boss is not active';
  END IF;

  v_remaining_hp := GREATEST(0, v_boss.current_hp - p_damage);
  UPDATE public.raid_bosses
  SET current_hp = v_remaining_hp,
      status = CASE WHEN v_remaining_hp = 0 THEN 'DEFEATED' ELSE 'ACTIVE' END
  WHERE id = v_boss.id;

  INSERT INTO public.raid_damage_logs (boss_id, user_id, damage)
  VALUES (p_boss_id, p_user_id, p_damage);

  RETURN jsonb_build_object(
    'status', 'success',
    'remaining_hp', v_remaining_hp,
    'defeated', v_remaining_hp = 0
  );
END;
$function$
;
CREATE OR REPLACE FUNCTION public.refresh_all_user_power_projections()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare target record; refreshed integer := 0;
begin
  for target in
    select id user_id from public.users
  loop
    perform public.refresh_user_power_projection(target.user_id);
    refreshed := refreshed + 1;
  end loop;
  return refreshed;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.refresh_daily_mission_completion_aggregates(p_user_id uuid, p_cycle_date date DEFAULT ((clock_timestamp() AT TIME ZONE 'Asia/Tokyo'::text))::date)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_completed integer;
begin
  select count(*)::integer into v_completed
  from public.user_missions um
  join public.missions m on m.id = um.mission_id
  where um.user_id = p_user_id
    and um.cycle_date = p_cycle_date
    and m.is_enabled
    and m.category = 'DAILY'
    and m.trigger_type <> 'DAILY_MISSION_COMPLETED_COUNT'
    and um.status in ('CLEAR', 'CLAIMED');

  update public.user_missions um
  set current_progress = least(m.target_value, v_completed),
      progress_val = least(m.target_value, v_completed),
      status = case
        when um.status = 'CLAIMED' then 'CLAIMED'
        when v_completed >= m.target_value then 'CLEAR'
        else 'PROGRESS'
      end,
      updated_at = clock_timestamp()
  from public.missions m
  where um.user_id = p_user_id
    and um.cycle_date = p_cycle_date
    and um.mission_id = m.id
    and m.is_enabled
    and m.category = 'DAILY'
    and m.trigger_type = 'DAILY_MISSION_COMPLETED_COUNT';
end;
$function$
;
CREATE OR REPLACE FUNCTION public.refresh_special_event_completion(p_user_id uuid, p_event_id text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_completed integer;
  v_complete_target integer;
begin
  if not exists(select 1 from public.mission_events where id=p_event_id and is_enabled
    and clock_timestamp()>=start_at and clock_timestamp()<progress_end_at) then return;end if;
  select count(*)::integer into v_completed
  from public.user_missions um
  join public.missions m on m.id = um.mission_id
  where um.user_id = p_user_id
    and m.event_id = p_event_id
    and m.trigger_type <> 'GVG_PREP_REQUIRED_MISSIONS_COMPLETED'
    and um.status in ('CLEAR', 'CLAIMED');

  select target_value into v_complete_target
  from public.missions
  where event_id = p_event_id
    and trigger_type = 'GVG_PREP_REQUIRED_MISSIONS_COMPLETED'
    and is_enabled;

  if v_complete_target is not null and v_completed >= v_complete_target then
    update public.user_missions um
    set current_progress = v_complete_target,
        progress_val = v_complete_target,
        status = case when um.status = 'CLAIMED' then 'CLAIMED' else 'CLEAR' end,
        updated_at = clock_timestamp()
    from public.missions m
    where um.user_id = p_user_id
      and um.mission_id = m.id
      and m.event_id = p_event_id
      and m.trigger_type = 'GVG_PREP_REQUIRED_MISSIONS_COMPLETED'
      and um.status = 'PROGRESS';
  end if;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.refresh_user_power_projection(p_user_id uuid)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_power bigint; v_day date:=(clock_timestamp() at time zone 'Asia/Tokyo')::date;
begin
  if p_user_id is null then return 0; end if;
  if not exists(select 1 from public.users where id=p_user_id) then
    delete from public.user_power_rankings where user_id=p_user_id;
    return 0;
  end if;
  v_power:=public.calculate_user_total_power(p_user_id);
  insert into public.user_power_rankings(user_id,total_power,updated_at)
  values(p_user_id,least(v_power,2147483647)::integer,clock_timestamp())
  on conflict(user_id) do update set total_power=excluded.total_power,updated_at=excluded.updated_at;
  update public.ranking_daily_activity_snapshots set total_power=v_power,last_active_at=clock_timestamp()
  where ranking_day_key=v_day and user_id=p_user_id;
  return v_power;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.reject_guild_power_snapshot_mutation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if tg_op='INSERT' then
    if exists(
      select 1 from public.ranking_guild_power_finalization_audits audit
      where audit.season_id=new.season_id
    ) then
      raise exception 'final guild Power snapshot is immutable' using errcode='55000';
    end if;
    return new;
  end if;
  raise exception 'final guild Power snapshot is immutable' using errcode='55000';
end;
$function$
;
CREATE OR REPLACE FUNCTION public.reject_mutation_during_maintenance()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
 if public.operations_feature_state('MAINTENANCE')='MAINTENANCE' and not public.is_operations_maintenance_tester() and coalesce(auth.role(),'authenticated')<>'service_role' then
  raise exception 'MAINTENANCE: operations are temporarily unavailable' using errcode='55000';
 end if;
 return coalesce(new,old);
end $function$
;
CREATE OR REPLACE FUNCTION public.remove_friend(p_friend_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ begin perform public.assert_feature_mutation_allowed('FRIEND'); return public.remove_friend_core_20260823(p_friend_id); end $function$
;
CREATE OR REPLACE FUNCTION public.remove_friend(p_user_id uuid, p_friend_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    DELETE FROM public.user_friends WHERE user_id = p_user_id AND friend_id = p_friend_id;
    DELETE FROM public.user_friends WHERE user_id = p_friend_id AND friend_id = p_user_id;

    RETURN jsonb_build_object('success', true);
END;
$function$
;
CREATE OR REPLACE FUNCTION public.remove_friend_core_20260823(p_friend_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_user uuid:=auth.uid(); v_deleted integer;
begin
 if v_user is null then raise exception 'authentication required' using errcode='42501'; end if;
 delete from public.user_friends where (user_id=v_user and friend_id=p_friend_id) or (user_id=p_friend_id and friend_id=v_user);
 get diagnostics v_deleted=row_count;
 if v_deleted=0 then raise exception 'friendship not found' using errcode='P0002'; end if;
 return jsonb_build_object('status','REMOVED');
end $function$
;
CREATE OR REPLACE FUNCTION public.remove_legacy_pvp_cash_before_finalize()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_legacy_cash integer;
begin
 if old.finalization_status<>'FINALIZED' and new.finalization_status='FINALIZED' and new.battle_mode='PVP' then
  v_legacy_cash:=greatest(coalesce((new.finalization_result#>>'{rewards,cash}')::integer,0),0);
  if v_legacy_cash>0 then update public.users set cash=cash-v_legacy_cash where id=new.requester_user_id; end if;
  new.finalization_result:=jsonb_set(new.finalization_result,'{rewards,cash}','0'::jsonb,true);
  new.result:=jsonb_set(new.result,'{rewards,cash}','0'::jsonb,true);
 end if;
 return new;
end $function$
;
CREATE OR REPLACE FUNCTION public.request_guild_join(p_guild_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_mode text;
  v_cap integer;
  v_count integer;
  v_request uuid;
  v_user public.users%rowtype;
begin
  if auth.uid() is null then raise exception 'Authentication is required'; end if;
  select * into v_user from public.users where id = auth.uid() for update;
  if not found then raise exception 'Guild application requirements are not met'; end if;
  if v_user.last_guild_left_at is not null and v_user.last_guild_left_at > now() - interval '24 hours' then
    raise exception 'Guild rejoin cooldown is active'
      using errcode = 'P0001', detail = 'GUILD_JOIN_COOLDOWN_ACTIVE';
  end if;
  if exists(select 1 from public.guild_members where user_id = auth.uid()) then raise exception 'Already in a guild'; end if;
  select recruitment_mode, public.canonical_guild_member_cap(id)
    into v_mode, v_cap
  from public.guilds
  where id = p_guild_id and not is_disbanded
  for update;
  if not found or v_mode <> 'APPLICATION_REQUIRED' then raise exception 'Guild is not accepting applications'; end if;
  select count(*) into v_count from public.guild_members where guild_id = p_guild_id;
  if v_count >= v_cap then raise exception 'Guild member cap reached'; end if;
  if exists(select 1 from public.guild_join_requests where user_id = auth.uid() and status = 'PENDING') then
    raise exception 'A pending guild application already exists';
  end if;
  insert into public.guild_join_requests(guild_id, user_id)
  values(p_guild_id, auth.uid())
  returning id into v_request;
  return jsonb_build_object('status', 'pending', 'request_id', v_request);
end;
$function$
;
CREATE OR REPLACE FUNCTION public.reset_current_gameplay(p_request_id uuid, p_acknowledged boolean)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid:=auth.uid();
  v_request public.gameplay_reset_requests%rowtype;
  v_eligibility jsonb;
  v_result jsonb;
begin
  if v_user_id is null then raise exception 'authentication required' using errcode='42501'; end if;
  if p_request_id is null then raise exception 'request_id is required' using errcode='22023'; end if;
  if p_acknowledged is distinct from true then raise exception 'reset acknowledgement is required' using errcode='22023'; end if;

  perform pg_advisory_xact_lock(hashtextextended('gameplay-reset:'||v_user_id::text,0));
  perform 1 from public.users where id=v_user_id for update;
  if not found then raise exception 'player profile is required' using errcode='P0002'; end if;

  select * into v_request from public.gameplay_reset_requests where request_id=p_request_id for update;
  if found then
    if v_request.user_id<>v_user_id then raise exception 'request_id belongs to another user' using errcode='42501'; end if;
    if v_request.status='COMPLETED' then return v_request.result; end if;
    raise exception 'reset request is already in progress' using errcode='55000';
  end if;

  v_eligibility:=public.current_gameplay_reset_eligibility(v_user_id);
  if not coalesce((v_eligibility->>'eligible')::boolean,false) then
    return jsonb_build_object('status','not_resettable','reason',v_eligibility->>'reason');
  end if;

  insert into public.gameplay_reset_requests(request_id,user_id) values(p_request_id,v_user_id);

  delete from public.user_main_formations where user_id=v_user_id;
  delete from public.pvp_defense_decks where user_id=v_user_id;
  delete from public.gvg_defense_decks where user_id=v_user_id;
  update public.user_skills set equipped_character_id=null,slot_index=null where user_id=v_user_id;
  update public.user_equipments set equipped_character_id=null,slot_index=null where user_id=v_user_id;
  update public.users set favorite_character_id=null where id=v_user_id;
  delete from public.user_skills where user_id=v_user_id;
  delete from public.user_equipments where user_id=v_user_id;
  delete from public.user_characters where user_id=v_user_id;
  delete from public.user_items where user_id=v_user_id;
  update public.user_missions set current_progress=0,updated_at=now()
    where user_id=v_user_id and status='PROGRESS';
  delete from public.user_power_rankings where user_id=v_user_id;

  update public.users set
    level=default,xp=default,cash=default,neon_diamonds=default,diamonds=default,
    vitality=default,vitality_last_recovered_at=default,
    pvp_points=default,pvp_points_last_recovered_at=default,
    raid_points=default,raid_points_last_recovered_at=default,raid_free_entry_consumed=default,
    daily_cash_skips_count=default,daily_cash_skips_reset_date=default,
    quest_free_skips_count=default,quest_paid_skips_count=default,quest_skips_reset_date=default,
    current_base_id=default,favorite_character_id=null
  where id=v_user_id;

  insert into public.tutorial_progress(user_id,step_id,updated_at,completed_at)
  values(v_user_id,'WORLD_INTRO',now(),null)
  on conflict(user_id) do update set step_id='WORLD_INTRO',updated_at=now(),completed_at=null;

  v_result:=jsonb_build_object('status','success','tutorial_step','WORLD_INTRO','request_id',p_request_id);
  update public.gameplay_reset_requests
    set status='COMPLETED',result=v_result,completed_at=now()
    where request_id=p_request_id and user_id=v_user_id;
  return v_result;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.reset_daily_power_rankings()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN jsonb_build_object('status', 'success');
END;
$function$
;
CREATE OR REPLACE FUNCTION public.reset_seasonal_power_rankings()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN jsonb_build_object('status', 'success');
END;
$function$
;
CREATE OR REPLACE FUNCTION public.resolve_canonical_reward_item(p_reward_id text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_roll integer:=floor(random()*3)::integer;
begin
 if p_reward_id='NORMAL_GACHA_TICKET_RANDOM' then return (array['NORMAL_GACHA_TICKET_CHARACTER','NORMAL_GACHA_TICKET_SKILL','NORMAL_GACHA_TICKET_EQUIPMENT'])[v_roll+1]; end if;
 if p_reward_id='SPECIAL_TICKET_RANDOM' then return (array['SPECIAL_TICKET_CHARACTER','SPECIAL_TICKET_SKILL','SPECIAL_TICKET_EQUIPMENT'])[v_roll+1]; end if;
 if p_reward_id='SPECIAL_TICKET_SKILL_OR_EQUIPMENT' then return (array['SPECIAL_TICKET_SKILL','SPECIAL_TICKET_EQUIPMENT'])[floor(random()*2)::integer+1]; end if;
 return p_reward_id;
end $function$
;
CREATE OR REPLACE FUNCTION public.resolve_gvg_attack(p_attack_id uuid, p_battle_replay_session_id uuid, p_is_victory boolean, p_raw_damage bigint)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if not exists (
    select 1 from public.feature_operating_states
    where feature_key = 'GVG' and state = 'OPEN'
  ) then raise exception 'GvG is closed'; end if;
  return public.resolve_gvg_attack_core_20260817(
    p_attack_id, p_battle_replay_session_id, p_is_victory, p_raw_damage);
end;
$function$
;
CREATE OR REPLACE FUNCTION public.resolve_gvg_attack_core_20260817(p_attack_id uuid, p_battle_replay_session_id uuid, p_is_victory boolean, p_raw_damage bigint)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_result JSONB;
BEGIN
  SELECT result INTO v_result
  FROM public.battle_replay_sessions
  WHERE id = p_battle_replay_session_id
    AND requester_user_id = auth.uid()
    AND battle_mode = 'GVG'
    AND source_reference_id = p_attack_id
    AND status = 'RESOLVED';
  IF v_result IS NULL THEN
    RAISE EXCEPTION 'The battle replay does not belong to this resolved GvG attack';
  END IF;
  p_is_victory := COALESCE(v_result->>'winner' = 'PLAYER', false);
  p_raw_damage := GREATEST(0, COALESCE((v_result->>'playerRawDamage')::BIGINT, 0));

  RETURN public.resolve_gvg_attack_legacy(p_attack_id, p_battle_replay_session_id, p_is_victory, p_raw_damage);
END;
$function$
;
CREATE OR REPLACE FUNCTION public.resolve_gvg_attack_legacy(p_attack_id uuid, p_battle_replay_session_id uuid, p_is_victory boolean, p_raw_damage bigint)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID := auth.uid();
  v_attack public.gvg_attack_logs%ROWTYPE;
  v_match public.gvg_match_sessions%ROWTYPE;
  v_side TEXT;
  v_applied BIGINT;
  v_hp BIGINT;
  v_phase SMALLINT;
  v_collapses SMALLINT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication is required';
  END IF;
  IF p_raw_damage < 0 THEN
    RAISE EXCEPTION 'Damage cannot be negative';
  END IF;

  SELECT * INTO v_attack
  FROM public.gvg_attack_logs
  WHERE id = p_attack_id
  FOR UPDATE;
  IF NOT FOUND OR v_attack.battle_result <> 'PENDING' THEN
    RAISE EXCEPTION 'GvG attack is not pending';
  END IF;
  IF v_attack.attacker_user_id <> v_user_id THEN
    RAISE EXCEPTION 'Only the attacker can resolve this GvG attack';
  END IF;
  IF p_battle_replay_session_id IS NULL THEN
    RAISE EXCEPTION 'A battle replay session is required';
  END IF;
  PERFORM 1
  FROM public.battle_replay_sessions
  WHERE id = p_battle_replay_session_id
    AND requester_user_id = v_user_id
    AND battle_mode = 'GVG'
    AND source_reference_id = p_attack_id
    AND status = 'RESOLVED';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'The battle replay does not belong to this GvG attack';
  END IF;

  SELECT * INTO v_match
  FROM public.gvg_match_sessions
  WHERE id = v_attack.match_session_id
  FOR UPDATE;
  IF NOT FOUND OR v_match.status <> 'ACTIVE' THEN
    RAISE EXCEPTION 'GvG match is not active';
  END IF;
  IF now() >= v_match.scheduled_end_at THEN
    RAISE EXCEPTION 'GvG match has ended';
  END IF;

  SELECT side INTO v_side
  FROM public.gvg_match_member_snapshots
  WHERE id = v_attack.defender_snapshot_id;
  IF v_side IS NULL THEN
    RAISE EXCEPTION 'GvG defense snapshot is missing';
  END IF;

  v_applied := CASE WHEN p_is_victory THEN FLOOR(p_raw_damage * 1.5) ELSE p_raw_damage END;
  IF v_side = 'A' THEN
    v_hp := GREATEST(0, v_match.guild_a_phase_hp - v_applied);
    v_phase := v_match.guild_a_phase;
    v_collapses := v_match.guild_a_collapses;
    IF v_hp = 0 THEN
      v_collapses := v_collapses + 1;
      IF v_collapses < 2 THEN
        v_phase := v_phase + 1;
        v_hp := v_match.guild_a_phase_max_hp;
      END IF;
    END IF;
    UPDATE public.gvg_match_sessions
    SET guild_a_phase_hp = v_hp,
        guild_a_phase = v_phase,
        guild_a_collapses = v_collapses,
        guild_b_total_applied_damage = guild_b_total_applied_damage + v_applied,
        guild_a_last_progress_at = CASE WHEN v_applied > 0 THEN now() ELSE guild_a_last_progress_at END
    WHERE id = v_match.id;
  ELSE
    v_hp := GREATEST(0, v_match.guild_b_phase_hp - v_applied);
    v_phase := v_match.guild_b_phase;
    v_collapses := v_match.guild_b_collapses;
    IF v_hp = 0 THEN
      v_collapses := v_collapses + 1;
      IF v_collapses < 2 THEN
        v_phase := v_phase + 1;
        v_hp := v_match.guild_b_phase_max_hp;
      END IF;
    END IF;
    UPDATE public.gvg_match_sessions
    SET guild_b_phase_hp = v_hp,
        guild_b_phase = v_phase,
        guild_b_collapses = v_collapses,
        guild_a_total_applied_damage = guild_a_total_applied_damage + v_applied,
        guild_b_last_progress_at = CASE WHEN v_applied > 0 THEN now() ELSE guild_b_last_progress_at END
    WHERE id = v_match.id;
  END IF;

  UPDATE public.gvg_attack_logs
  SET battle_replay_session_id = p_battle_replay_session_id,
      battle_result = CASE WHEN p_is_victory THEN 'VICTORY' ELSE 'DEFEAT' END,
      raw_damage = p_raw_damage,
      applied_damage = v_applied,
      win_damage_multiplier = CASE WHEN p_is_victory THEN 1.50 ELSE 1.00 END,
      resolved_at = now()
  WHERE id = v_attack.id;

  IF v_collapses >= 2 THEN
    UPDATE public.gvg_match_sessions
    SET status = 'COMPLETED',
        completed_at = now(),
        result_reason = 'TWO_COLLAPSES',
        winner_guild_id = CASE WHEN v_side = 'A' THEN guild_b_id ELSE guild_a_id END
    WHERE id = v_match.id;
  END IF;

  RETURN jsonb_build_object(
    'applied_damage', v_applied,
    'raw_damage', p_raw_damage,
    'victory_multiplier', CASE WHEN p_is_victory THEN 1.5 ELSE 1.0 END,
    'defender_side', v_side,
    'phase', v_phase,
    'collapses', v_collapses,
    'phase_hp', v_hp
  );
END;
$function$
;
CREATE OR REPLACE FUNCTION public.review_guild_join_request(p_request_id uuid, p_approve boolean)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_request public.guild_join_requests%rowtype;v_role text;v_cap integer;v_count integer;
begin
 if auth.uid() is null then raise exception 'Authentication is required'; end if;
 select * into v_request from public.guild_join_requests where id=p_request_id for update;
 if not found or v_request.status<>'PENDING' then raise exception 'Pending guild application not found'; end if;
 select role into v_role from public.guild_members where guild_id=v_request.guild_id and user_id=auth.uid();
 if coalesce(v_role,'') not in('MASTER','SUB_MASTER') then raise exception 'Guild application review permission required'; end if;
 perform 1 from public.guilds where id=v_request.guild_id and not is_disbanded for update; if not found then raise exception 'Active guild not found'; end if;
 if p_approve then
  if exists(select 1 from public.guild_members where user_id=v_request.user_id) then raise exception 'Applicant already belongs to a guild'; end if;
  v_cap:=public.canonical_guild_member_cap(v_request.guild_id); select count(*) into v_count from public.guild_members where guild_id=v_request.guild_id;
  if v_count>=v_cap then raise exception 'Guild member cap reached'; end if;
  insert into public.guild_members(guild_id,user_id,role,weekly_contribution,total_contribution) values(v_request.guild_id,v_request.user_id,'MEMBER',0,0);
  update public.guild_join_requests set status='CANCELLED',reviewed_at=now(),reviewed_by=auth.uid() where user_id=v_request.user_id and status='PENDING' and id<>p_request_id;
  perform public.evaluate_mission_progress(v_request.user_id,'GUILD_JOIN',1);
 end if;
 update public.guild_join_requests set status=case when p_approve then 'APPROVED' else 'REJECTED' end,reviewed_at=now(),reviewed_by=auth.uid() where id=p_request_id;
 return jsonb_build_object('status',case when p_approve then 'approved' else 'rejected' end);
end $function$
;
