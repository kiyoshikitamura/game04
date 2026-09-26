-- Pre-update GAME04 function definitions; manual recovery reference. Does not reset user progress.
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
CREATE OR REPLACE FUNCTION public.canonical_quest_is_unlocked(p_user_id uuid, p_quest_id text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 select case when m.unlock_condition='OPEN' then true when m.unlock_condition like 'FIRST_CLEAR:%' then exists(select 1 from public.user_quest_first_clears c where c.user_id=p_user_id and c.quest_id=substring(m.unlock_condition from 13)) else false end from public.canonical_quest_master m where m.version='2026-08-30' and m.quest_id=p_quest_id and m.is_production_enabled
$function$
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
CREATE OR REPLACE FUNCTION public.get_canonical_quest_progression()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 select coalesce(jsonb_agg(jsonb_build_object('quest_id',m.quest_id,'unlock_condition',m.unlock_condition,'is_unlocked',public.canonical_quest_is_unlocked(auth.uid(),m.quest_id),'is_first_cleared',exists(select 1 from public.user_quest_first_clears c where c.user_id=auth.uid() and c.quest_id=m.quest_id),'enemy_tactic','BALANCED','enemy_member_count',case when m.difficulty='EASY' then 3 else 5 end,'enemy_members','[]'::jsonb,'recommended_level',case m.difficulty when 'EASY' then 5 when 'NORMAL' then 12 else 20 end,'enemy_attributes','[]'::jsonb) order by m.display_order),'[]'::jsonb) from public.canonical_quest_master m where m.version='2026-08-30' and m.is_production_enabled
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
CREATE OR REPLACE FUNCTION public.get_recent_social_activity_feed(p_limit integer DEFAULT 20)
 RETURNS TABLE(id uuid, activity_type text, actor_user_id uuid, actor_display_name text, guild_id uuid, object_master_id text, display_payload jsonb, permanent boolean, created_at timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode='42501'; end if;
  return query
  select feed.id,feed.activity_type,feed.actor_user_id,feed.actor_display_name,
    feed.guild_id,feed.object_master_id,feed.display_payload,feed.permanent,feed.created_at
  from public.social_activity_feed feed
  where feed.created_at>=statement_timestamp()-interval '24 hours'
    and feed.created_at<=statement_timestamp()
    and feed.activity_type in (
      
      'SSR_CHARACTER','POWER_RANK_1','GUILD_CREATED','RAID_HELP_REQUEST','RAID_BOSS_DEFEATED'
    )
    and exists(
      select 1 from public.users actor
      where actor.id=feed.actor_user_id
        and actor.favorite_character_id is not null
    )
    and not exists(
      select 1
      from public.kpi_subjects subject
      join public.kpi_account_classification_periods classification
        on classification.subject_id=subject.subject_id
      where subject.source_user_id=feed.actor_user_id
        and classification.classification in ('qa','test')
        and classification.valid_from<=feed.created_at
        and (classification.valid_to is null or feed.created_at<classification.valid_to)
    )
  order by feed.created_at desc,feed.id desc
  limit greatest(1,least(coalesce(p_limit,20),50));
end;
$function$
;
CREATE OR REPLACE FUNCTION public.on_canonical_patrol_snapshot()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_snapshot jsonb;
begin
 v_snapshot:=public.generate_canonical_quest_encounter_snapshot(new.user_id,coalesce(new.course_id,new.quest_id));
 new.encounter_snapshot:=v_snapshot; new.encounter_party_signature:=v_snapshot->>'partySignature'; return new;
end $function$
;
CREATE OR REPLACE FUNCTION public.on_quest_hometown_snapshot()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
 new.hometown_bonus_snapshot:=public.quest_hometown_snapshot(new.user_id,new.character_id,coalesce(new.course_id,new.quest_id));
 return new;
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
CREATE OR REPLACE FUNCTION public.refresh_normal_mission_owned_state(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if p_user_id is null or (auth.uid() is not null and auth.uid() is distinct from p_user_id) then
    raise exception 'Mission progress owner mismatch' using errcode='42501';
  end if;
  with observed(trigger_type, value) as (
    select 'CHARACTER_LEVEL_AT_LEAST', coalesce(max(level),0) from public.user_characters where user_id=p_user_id
    union all select 'CHARACTER_AWAKENING_AT_LEAST',coalesce(max(awakening_level),0) from public.user_characters where user_id=p_user_id
    union all select 'SKILL_AWAKENING_AT_LEAST',coalesce(max(plus_val),0) from public.user_skills where user_id=p_user_id
    union all select 'EQUIPMENT_LIMIT_BREAK_AT_LEAST',coalesce(max(plus_val),0) from public.user_equipments where user_id=p_user_id
    -- Approved 2026-09-14: membership joining date is Day 1, in JST.
    -- No current membership => no observation, so progress stops on leaving.
    -- A new membership's joined_at projects its own tenure (no accumulated login count).
    union all select 'GUILD_TENURE_DAYS',
      (statement_timestamp() at time zone 'Asia/Tokyo')::date
        - (joined_at at time zone 'Asia/Tokyo')::date + 1
    from public.guild_members
    where user_id=p_user_id and joined_at is not null and joined_at<=statement_timestamp()
  )
  update public.user_missions um
  set current_progress=least(m.target_value,greatest(o.value,0)),
      progress_val=least(m.target_value,greatest(o.value,0)),
      status=case when o.value>=m.target_value then 'CLEAR' else 'PROGRESS' end,
      updated_at=clock_timestamp()
  from public.missions m join observed o on o.trigger_type=m.trigger_type
  where um.user_id=p_user_id and um.mission_id=m.id and m.is_enabled and m.category='NORMAL'
    -- Once authoritatively attained, keep CLEAR even if an item is later consumed.
    -- Existing suspect CLEAR rows are blocked by the apply-time impact guard above.
    and um.status = 'PROGRESS'
    and (um.current_progress is distinct from least(m.target_value,greatest(o.value,0))
      or um.status is distinct from case when o.value>=m.target_value then 'CLEAR' else 'PROGRESS' end);
end;
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
CREATE OR REPLACE FUNCTION public.start_patrol(p_course_id text, p_character_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_uid uuid:=auth.uid(); v_character text; v_q record; v_id uuid; v_active integer; v_vitality integer;
begin
 if v_uid is null then raise exception 'authentication required' using errcode='42501'; end if;
 select * into v_q from public.canonical_quest_master where version='2026-08-30' and quest_id=p_course_id and is_production_enabled;
 if not found then raise exception 'quest not found' using errcode='23503'; end if;
 if not public.canonical_quest_is_unlocked(v_uid,p_course_id) then raise exception 'quest is locked' using errcode='23514'; end if;
 select owned.character_id into v_character from public.user_characters owned where owned.user_id=v_uid and(owned.id::text=p_character_id or owned.character_id=p_character_id) order by(owned.id::text=p_character_id)desc limit 1;
 if v_character is null then raise exception 'character is not owned' using errcode='23503'; end if;
 perform 1 from public.users where id=v_uid for update;
 select count(*) into v_active from public.user_patrols where user_id=v_uid and status<>'COMPLETED'; if v_active>=5 then raise exception 'all dispatch slots are occupied' using errcode='23514'; end if;
 if exists(select 1 from public.user_patrols where user_id=v_uid and character_id=v_character and status<>'COMPLETED') then raise exception 'character is already dispatched' using errcode='23505'; end if;
 perform public.sync_and_recover_vitality_and_pvp_points(v_uid); select vitality into v_vitality from public.users where id=v_uid for update;
 if coalesce(v_vitality,0)<v_q.vitality_cost then raise exception 'insufficient vitality' using errcode='23514'; end if;
 insert into public.user_patrols(user_id,course_id,character_id,started_at,expires_at,status,has_battle_event,battle_resolved) values(v_uid,p_course_id,v_character,now(),now()+v_q.duration_sec*interval '1 second','ONGOING',true,false) returning id into v_id;
 update public.users set vitality=vitality-v_q.vitality_cost,vitality_last_recovered_at=case when vitality>=50 then now() else vitality_last_recovered_at end where id=v_uid;
 return jsonb_build_object('status','success','base_cash_snapshot',(select base_cash_snapshot from public.user_patrols where id=v_id),'hometown_bonus_snapshot',(select hometown_bonus_snapshot from public.user_patrols where id=v_id),'patrol_id',v_id,'has_battle',true,'duration_seconds',v_q.duration_sec,'cost_vitality',v_q.vitality_cost,'remaining_vitality',v_vitality-v_q.vitality_cost);
end $function$
;
CREATE OR REPLACE FUNCTION public.start_pvp_battle(p_opponent_user_id uuid, p_character_ids text[], p_tactic text DEFAULT 'ATTACK_PRIORITY'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_user public.users%rowtype;
  v_now timestamptz := now();
  v_recovered integer;
  v_remaining integer;
  v_my_rank integer;
  v_opponent_rank integer;
  v_opponent_name text;
  v_opponent_guild_id uuid;
  v_opponent_guild_name text;
  v_opponent_character_ids text[];
  v_player_snapshot jsonb;
  v_enemy_snapshot jsonb;
  v_replay_id uuid;
  v_seed bigint;
begin
  if v_user_id is null then raise exception 'authentication required' using errcode = '42501'; end if;
  if p_opponent_user_id is null or p_opponent_user_id = v_user_id then
    raise exception 'invalid PvP opponent' using errcode = '22023';
  end if;
  if p_tactic not in ('ATTACK_PRIORITY', 'HEAL_PRIORITY', 'SKILL_PRIORITY', 'BALANCED', 'WEAKNESS_FOCUS') then
    raise exception 'invalid tactic' using errcode = '22023';
  end if;

  perform public.advance_ranking_season('PVP',clock_timestamp());
  select * into v_user from public.users where id = v_user_id for update;
  if not found then raise exception 'player not found' using errcode = 'P0002'; end if;
  v_recovered := floor(extract(epoch from (v_now - coalesce(v_user.pvp_points_last_recovered_at, v_now))) / 7200);
  v_remaining := least(5, coalesce(v_user.pvp_points, 0) + greatest(v_recovered, 0));
  if v_remaining < 1 then raise exception 'insufficient PvP points' using errcode = '23514'; end if;
  v_remaining := v_remaining - 1;
  update public.users
  set pvp_points = v_remaining,
      pvp_points_last_recovered_at = case
        when v_recovered > 0 or coalesce(v_user.pvp_points, 0) = 5 then v_now
        else v_user.pvp_points_last_recovered_at
      end
  where id = v_user_id;

  -- Match get_pvp_opponents_page: the saved Main Formation is the opponent authority.
  select array_agg(formation.user_character_id::text order by formation.slot)
  into v_opponent_character_ids
  from public.user_main_formations formation
  where formation.user_id = p_opponent_user_id;
  if coalesce(cardinality(v_opponent_character_ids), 0) = 0 then
    raise exception 'opponent main formation not found' using errcode = 'P0002';
  end if;

  select player.username, coalesce(rank.rank_points, 1000), member.guild_id, guild.name
  into v_opponent_name, v_opponent_rank, v_opponent_guild_id, v_opponent_guild_name
  from public.users player
  left join public.pvp_ranks rank on rank.user_id = player.id
  left join public.guild_members member on member.user_id = player.id
  left join public.guilds guild on guild.id = member.guild_id
  where player.id = p_opponent_user_id;
  if not found then raise exception 'opponent not found' using errcode = 'P0002'; end if;

  select coalesce(rank.rank_points, 1000) into v_my_rank
  from public.users player left join public.pvp_ranks rank on rank.user_id = player.id
  where player.id = v_user_id;

  v_player_snapshot := public.build_server_battle_snapshot(v_user_id, p_character_ids, 'PLAYER');
  v_enemy_snapshot := public.build_server_battle_snapshot(p_opponent_user_id, v_opponent_character_ids, 'ENEMY');
  v_seed := floor(random() * 2147483646)::bigint + 1;

  insert into public.battle_replay_sessions(
    requester_user_id, battle_mode, source_reference_id, tactic_id,
    random_seed, player_snapshot, enemy_snapshot, resolution_authority,
    finalization_status, official_context
  ) values (
    v_user_id, 'PVP', p_opponent_user_id, p_tactic,
    v_seed, v_player_snapshot, v_enemy_snapshot, 'PVP_SERVER',
    'PENDING', jsonb_build_object(
      'opponentUserId', p_opponent_user_id,
      'opponentName', v_opponent_name,
      'opponentGuildId', v_opponent_guild_id,
      'opponentGuildName', v_opponent_guild_name,
      'playerRankPointsAtStart', v_my_rank,
      'opponentRankPointsAtStart', v_opponent_rank,
      'remainingPvpPoints', v_remaining,
      'rewardRevision', 'OPEN_BETA_P0_V1'
    )
  ) returning id into v_replay_id;

  return jsonb_build_object(
    'replay_session_id', v_replay_id,
    'player_snapshot', v_player_snapshot,
    'enemy_snapshot', v_enemy_snapshot,
    'opponent_name', v_opponent_name,
    'opponent_guild_id', v_opponent_guild_id,
    'opponent_guild_name', v_opponent_guild_name,
    'opponent_rank_points', v_opponent_rank,
    'remaining_pvp_points', v_remaining
  );
end;
$function$
;
CREATE OR REPLACE FUNCTION public.start_raid_room_battle_v1(p_room_id uuid, p_character_ids text[], p_tactic text, p_request_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
declare v_uid uuid:=auth.uid();v_user public.users%rowtype;v_instance record;v_room public.raid_rooms%rowtype;
 v_request public.raid_room_battle_start_requests%rowtype;v_enabled boolean;v_power bigint;v_gate jsonb;v_response jsonb;
 v_cost integer;v_cost_type text;v_guild uuid;v_players jsonb;v_enemy jsonb:='[]';v_member text;
 v_entry record;v_skill_refs jsonb;v_skills jsonb;v_replay uuid;v_seed bigint;v_slot integer:=0;v_started_at timestamptz;
begin
 if v_uid is null then raise exception 'authentication required' using errcode='42501';end if;
 if current_setting('transaction_isolation')<>'read committed' then raise exception 'read committed required' using errcode='25001';end if;
 if p_room_id is null or p_request_id is null or p_tactic is null
 or p_tactic not in('ATTACK_PRIORITY','HEAL_PRIORITY','SKILL_PRIORITY','BALANCED','WEAKNESS_FOCUS')
 or p_character_ids is null or cardinality(p_character_ids) not between 1 and 5
 or array_position(p_character_ids,null) is not null
 or (select count(distinct x) from unnest(p_character_ids) x)<>cardinality(p_character_ids)
 then raise exception 'invalid battle input' using errcode='22023';end if;
 select enabled into v_enabled from public.raid_room_battle_settings where singleton for share;
 if v_enabled is distinct from true then raise exception 'room battle disabled' using errcode='55000';end if;
 select * into v_user from public.users where id=v_uid for no key update;
 if not found then raise exception 'user unavailable' using errcode='42501';end if;
 if exists(select 1 from public.raid_room_battle_request_cancellations where user_id=v_uid and request_id=p_request_id)
 then raise exception 'battle request cancelled' using errcode='23514';end if;
 select * into v_request from public.raid_room_battle_start_requests where user_id=v_uid and request_id=p_request_id;
 if found then
 if v_request.room_id<>p_room_id or v_request.character_ids is distinct from p_character_ids or v_request.tactic<>p_tactic
 then raise exception 'request payload conflict' using errcode='22023';end if;
 return v_request.response;end if;
 if v_user.level is null or v_user.level<5 then raise exception 'raid level requirement' using errcode='42501';end if;
 select * into v_room from public.raid_rooms where id=p_room_id;
 if not found then raise exception 'room unavailable' using errcode='P0002';end if;
 select boss.*,variant.raid_name,variant.atk,variant.def,variant.spd,variant.member_character_ids into v_instance
 from public.raid_bosses boss join public.canonical_raid_variants variant on variant.raid_variant_id=boss.raid_variant_id
 where boss.id=v_room.raid_boss_instance_id and variant.is_production_enabled for update of boss;
 if not found then raise exception 'raid instance unavailable' using errcode='P0002';end if;
 if v_instance.status is distinct from 'ACTIVE' or v_instance.current_hp is null or v_instance.current_hp<=0
 or v_instance.expires_at is null or v_instance.expires_at<=clock_timestamp()
 or v_instance.spawned_at is null or v_instance.spawned_at>clock_timestamp() or v_instance.outcome_finalized_at is not null
 then raise exception 'room ended' using errcode='23514';end if;
 if not exists(select 1 from public.raid_room_members where room_id=p_room_id and user_id=v_uid)
 then raise exception 'room membership required' using errcode='42501';end if;
 v_players:=public.build_server_battle_snapshot(v_uid,p_character_ids,'PLAYER');
 if v_players is null or jsonb_array_length(v_players)<>cardinality(p_character_ids)
 or (select count(distinct x->>'id') from jsonb_array_elements(v_players) x)<>cardinality(p_character_ids)
 then raise exception 'invalid snapshot' using errcode='23514';end if;
 if exists(select 1 from jsonb_array_elements(v_players) x cross join (values('hp'),('atk'),('def')) k(key)
 where jsonb_typeof(x->'stats'->k.key) is distinct from 'number')
 then raise exception 'invalid snapshot stats' using errcode='23514';end if;
 if exists(select 1 from jsonb_array_elements(v_players) x cross join (values('hp'),('atk'),('def')) k(key)
 where (x->'stats'->>k.key)::numeric<0 or (x->'stats'->>k.key)::numeric>2147483647
 or trunc((x->'stats'->>k.key)::numeric)<>(x->'stats'->>k.key)::numeric
 or (k.key='hp' and (x->'stats'->>k.key)::numeric=0))
 then raise exception 'invalid snapshot stats' using errcode='23514';end if;
 select sum((x#>>'{stats,hp}')::bigint+(x#>>'{stats,atk}')::bigint+(x#>>'{stats,def}')::bigint) into v_power
 from jsonb_array_elements(v_players) x;
 v_gate:=public._raid_room_power_gate_v1(v_room.difficulty_id,v_power);
 if v_gate->>'status' is distinct from 'passed' then raise exception 'raid power requirement' using errcode='42501';end if;
 perform public.sync_and_recover_vitality_and_pvp_points(v_uid);
 select * into v_user from public.users where id=v_uid;
 if v_user.raid_free_entry_consumed is false then
 v_cost:=0;v_cost_type:='FREE_FIRST';update public.users set raid_free_entry_consumed=true where id=v_uid;
 elsif v_user.raid_points>=1 then
 v_cost:=1;v_cost_type:='RAID_POINT';update public.users set raid_points=raid_points-1,
 raid_points_last_recovered_at=case when raid_points=5 then now() else raid_points_last_recovered_at end where id=v_uid;
 v_user.raid_points:=v_user.raid_points-1;
 else raise exception 'insufficient Raid points' using errcode='23514';end if;
 select guild_id into v_guild from public.guild_members where user_id=v_uid;

 select enemy_snapshot into v_enemy from public.raid_room_combat_snapshots where room_id=p_room_id;
 if not found then
 v_enemy := '[]'::jsonb;
 -- Rooms created before this delta retain the original enemy construction.
 for v_member in select value from jsonb_array_elements_text(v_instance.member_character_ids) loop
  v_slot:=v_slot+1; select * into v_entry from public.canonical_quest_enemy_pool_entries where version='2026-08-30' and character_id=v_member and difficulty='HARD' order by(local_affinity)desc,weight desc limit 1;
  v_skill_refs:=coalesce(v_entry.skill_loadout,(select jsonb_agg(skill_id order by skill_id) from(select skill_id from public.canonical_skill_master where version='2026-08-21' and exclusive_character_id=v_member order by skill_id limit 2)s),(select jsonb_agg(skill_id order by skill_id) from(select skill_id from public.canonical_skill_master where version='2026-08-21' and exclusive_character_id is null order by skill_id limit 2)s),'[]'::jsonb);
  select coalesce(jsonb_agg(jsonb_build_object('id',s.skill_id,'name',s.display_name,'activationType',s.activation_type,'cooldown',s.cooldown,'availableFromRound',s.available_from_round,'target',s.target,'effects',s.effects,'exclusiveCharacterId',s.exclusive_character_id) order by x.ordinality),'[]') into v_skills from jsonb_array_elements_text(v_skill_refs) with ordinality x(skill_id,ordinality) join public.canonical_skill_master s on s.version='2026-08-21' and s.skill_id=x.skill_id;
  v_enemy:=v_enemy||jsonb_build_array(jsonb_build_object('id','raid_'||v_instance.id||'_'||v_slot,'characterId',v_member,'name',coalesce((select display_name from public.canonical_character_master where version='2026-08-21' and character_id=v_member),v_member),'team','ENEMY','alignment',coalesce((select attribute from public.canonical_character_master where version='2026-08-21' and character_id=v_member),'NEUTRAL'),'level',30,'stats',jsonb_build_object('hp',ceil(v_instance.max_hp::numeric/5),'atk',v_instance.atk,'def',v_instance.def,'spd',v_instance.spd,'luk',0),'equippedSkillRefs',v_skill_refs,'skills',v_skills,'equipment','[]'::jsonb));
 end loop;
 end if;
 if jsonb_array_length(v_enemy)<>5 then raise exception 'invalid enemy formation' using errcode='23514';end if;
 v_started_at:=clock_timestamp();
 if v_instance.expires_at<=v_started_at then raise exception 'room ended' using errcode='23514';end if;
 v_seed:=floor(random()*2147483646)::bigint+1;
 insert into public.battle_replay_sessions(requester_user_id,battle_mode,source_reference_id,tactic_id,random_seed,player_snapshot,enemy_snapshot,resolution_authority,finalization_status,official_context)
 values(v_uid,'RAID',v_instance.id,p_tactic,v_seed,v_players,v_enemy,'RAID_SERVER','PENDING',
 jsonb_build_object('guildIdSnapshot',v_guild,'costType',v_cost_type,'cost',v_cost,'remainingRaidPoints',v_user.raid_points,
 'bossHpAtStart',v_instance.current_hp,'bossMaxHp',v_instance.max_hp,'baseId',v_instance.base_id,
 'raidDayKey',v_instance.raid_day_key,'raidVariantId',v_instance.raid_variant_id,
 'roomId',p_room_id,'raidRoomVersion',1,'difficultyId',v_room.difficulty_id,'formationPower',v_power,
 'roomExpiresAt',v_instance.expires_at,'startedAt',v_started_at)) returning id into v_replay;
 v_response:=jsonb_build_object('room_id',p_room_id,'replay_session_id',v_replay,'player_snapshot',v_players,
 'enemy_snapshot',v_enemy,'cost_type',v_cost_type,'cost',v_cost,'remaining_raid_points',v_user.raid_points,'guild_id_snapshot',v_guild);
 insert into public.raid_room_battle_start_requests(user_id,request_id,room_id,character_ids,tactic,replay_session_id,response)
 values(v_uid,p_request_id,p_room_id,p_character_ids,p_tactic,v_replay,v_response);
 return v_response;
end $function$
;
CREATE OR REPLACE FUNCTION public.sync_and_recover_vitality_and_pvp_points(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_user public.users%rowtype; v_now timestamptz:=now(); v_vit_steps integer; v_pvp_steps integer; v_raid_steps integer;
 v_vit integer; v_pvp integer; v_raid integer; v_vit_at timestamptz; v_pvp_at timestamptz; v_raid_at timestamptz;
begin
 if auth.uid() is null or auth.uid()<>p_user_id then raise exception 'not authorized' using errcode='42501'; end if;
 select * into v_user from public.users where id=p_user_id for update;
 if not found then raise exception 'user not found' using errcode='P0002'; end if;
 v_vit:=least(500,greatest(0,v_user.vitality)); v_pvp:=least(5,greatest(0,v_user.pvp_points)); v_raid:=least(5,greatest(0,v_user.raid_points));
 v_vit_at:=v_user.vitality_last_recovered_at; v_pvp_at:=v_user.pvp_points_last_recovered_at; v_raid_at:=v_user.raid_points_last_recovered_at;
 if v_vit<50 then
  v_vit_steps:=greatest(0,floor(extract(epoch from(v_now-coalesce(v_vit_at,v_now)))/360));
  v_vit:=least(50,v_vit+v_vit_steps);
  if v_vit_steps>0 then v_vit_at:=case when v_vit=50 then v_now else v_vit_at+(v_vit_steps*interval '360 seconds') end; end if;
 end if;
 if v_pvp<5 then
  v_pvp_steps:=greatest(0,floor(extract(epoch from(v_now-coalesce(v_pvp_at,v_now)))/7200));
  v_pvp:=least(5,v_pvp+v_pvp_steps);
  if v_pvp_steps>0 then v_pvp_at:=case when v_pvp=5 then v_now else v_pvp_at+(v_pvp_steps*interval '7200 seconds') end; end if;
 end if;
 if v_raid<5 then
  v_raid_steps:=greatest(0,floor(extract(epoch from(v_now-coalesce(v_raid_at,v_now)))/7200));
  v_raid:=least(5,v_raid+v_raid_steps);
  if v_raid_steps>0 then v_raid_at:=case when v_raid=5 then v_now else v_raid_at+(v_raid_steps*interval '7200 seconds') end; end if;
 end if;
 update public.users set vitality=v_vit,vitality_last_recovered_at=v_vit_at,pvp_points=v_pvp,pvp_points_last_recovered_at=v_pvp_at,
  raid_points=v_raid,raid_points_last_recovered_at=v_raid_at where id=p_user_id;
 return jsonb_build_object('out_vitality',v_vit,'out_pvp_points',v_pvp,'out_raid_points',v_raid,
  'out_cash',v_user.cash,'out_diamonds',v_user.neon_diamonds,'raid_first_entry_free',not v_user.raid_free_entry_consumed,
  'vitality_next_recovery_at',case when v_vit<50 then v_vit_at+interval '360 seconds' else null end,
  'pvp_next_recovery_at',case when v_pvp<5 then v_pvp_at+interval '7200 seconds' else null end,
  'raid_next_recovery_at',case when v_raid<5 then v_raid_at+interval '7200 seconds' else null end);
end $function$
;
CREATE OR REPLACE FUNCTION public.sync_current_missions()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_cycle_date date := (clock_timestamp() at time zone 'Asia/Tokyo')::date;
  v_rescue record;
  v_rescued integer := 0;
begin
  if v_user_id is null or not exists (select 1 from public.users where id = v_user_id) then
    raise exception 'Player authentication required';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text || ':missions', 0));

  for v_rescue in
    select um.mission_id, m.title, m.reward_item_id, m.reward_quantity
    from public.user_missions um join public.missions m on m.id = um.mission_id
    where um.user_id = v_user_id and m.category = 'DAILY'
      and um.cycle_date is distinct from v_cycle_date and um.status = 'CLEAR'
    for update of um
  loop
    insert into public.presents(user_id,item_id,quantity,message,status,sent_at,expire_at)
    values(v_user_id,v_rescue.reward_item_id,v_rescue.reward_quantity,
      'デイリーミッション未受取補填: ' || v_rescue.title,
      'UNCLAIMED',clock_timestamp(),clock_timestamp()+interval '24 hours');
    v_rescued := v_rescued + 1;
  end loop;

  update public.user_missions um
  set current_progress=0,progress_val=0,status='PROGRESS',claimed_at=null,
      cycle_date=v_cycle_date,updated_at=clock_timestamp()
  from public.missions m
  where um.user_id=v_user_id and um.mission_id=m.id and m.category='DAILY'
    and um.cycle_date is distinct from v_cycle_date;

  insert into public.user_missions(user_id,mission_id,current_progress,progress_val,status,cycle_date)
  select v_user_id,m.id,0,0,'PROGRESS',case when m.category='DAILY' then v_cycle_date else null end
  from public.missions m
  where m.is_enabled and (
    m.category='DAILY' or (
      m.category='NORMAL' and (
        m.prerequisite_mission_id is null or exists(
          select 1 from public.user_missions prerequisite
          where prerequisite.user_id=v_user_id
            and prerequisite.mission_id=m.prerequisite_mission_id
            and prerequisite.status='CLAIMED'
        )
      )
    )
  )
  on conflict(user_id,mission_id) do nothing;

  update public.user_missions um
  set current_progress=m.target_value,progress_val=m.target_value,status='CLEAR',updated_at=clock_timestamp()
  from public.missions m
  where um.user_id=v_user_id and um.mission_id=m.id and m.category='DAILY'
    and m.trigger_type='DAILY_LOGIN' and um.cycle_date=v_cycle_date and um.status='PROGRESS';

  perform public.refresh_normal_mission_owned_state(v_user_id);
  perform public.ensure_active_special_missions(v_user_id);
  return jsonb_build_object('cycle_date',v_cycle_date,'rescued_count',v_rescued);
end;
$function$
;