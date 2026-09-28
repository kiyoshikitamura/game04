-- GAME04 ONLY. Live GAME03 production bc2f256 snapshot. No source users or one-off backfills.

SET check_function_bodies = false;

-- クエスト新進行の利用者単位有効化と移行。適用だけでは利用者を変更しない。
create table if not exists public.quest_progression_user_versions (
 user_id uuid primary key references public.users(id) on delete cascade,
 progression_version text not null,
 activated_at timestamptz not null default now(),
 migration_key text not null
);
alter table public.quest_progression_user_versions enable row level security;
create policy quest_progression_version_owner_read on public.quest_progression_user_versions
 for select to authenticated using ((select auth.uid())=user_id);
revoke all on public.quest_progression_user_versions from public,anon,authenticated;
grant select on public.quest_progression_user_versions to authenticated;
grant all on public.quest_progression_user_versions to service_role;

create table public.quest_progression_migration_runs (
 migration_key text not null,
 user_id uuid not null references public.users(id) on delete cascade,
 progression_version text not null,
 cutoff_at timestamptz not null,
 compensation jsonb not null,
 compensation_scope text not null,
 old_first_clears jsonb not null default '[]',
 result jsonb,
 completed_at timestamptz,
 primary key(migration_key,user_id),
 unique(user_id,progression_version)
);
create table public.quest_progression_migration_patrols (
 migration_key text not null,
 user_id uuid not null,
 patrol_id uuid not null,
 old_patrol jsonb not null,
 entitled boolean not null,
 reward_payload jsonb not null default '[]',
 primary key(migration_key,patrol_id),
 foreign key(migration_key,user_id) references public.quest_progression_migration_runs(migration_key,user_id)
);
-- 新Master差し替え後でも旧探索の受取権利を同じ基準で保全する。
create table public.quest_progression_legacy_reward_master (
 quest_id text primary key,
 quest_snapshot jsonb not null,
 pool_snapshot jsonb not null
);
insert into public.quest_progression_legacy_reward_master(quest_id,quest_snapshot,pool_snapshot)
select q.quest_id,to_jsonb(q),coalesce((select jsonb_agg(to_jsonb(i) order by i.roll_index)
 from public.canonical_quest_reward_pool_items i
 where i.version=q.version and i.reward_pool_id=q.reward_pool_id),'[]'::jsonb)
from public.canonical_quest_master q where q.version='2026-08-30';

alter table public.quest_progression_migration_runs enable row level security;
alter table public.quest_progression_migration_patrols enable row level security;
alter table public.quest_progression_legacy_reward_master enable row level security;
revoke all on public.quest_progression_migration_runs,public.quest_progression_migration_patrols,
 public.quest_progression_legacy_reward_master from public,anon,authenticated;
grant all on public.quest_progression_migration_runs,public.quest_progression_migration_patrols,
 public.quest_progression_legacy_reward_master to service_role;



alter table public.canonical_quest_master
 add column if not exists progression_vitality_cost integer check(progression_vitality_cost>0),
 add column if not exists progression_duration_sec integer check(progression_duration_sec>0),
 add column if not exists progression_user_exp integer check(progression_user_exp>=0),
 add column if not exists progression_cash_reward integer check(progression_cash_reward>=0),
 add column if not exists progression_reward_pool_id text,
 add column if not exists progression_first_clear_user_exp integer check(progression_first_clear_user_exp>=0),
 add column if not exists progression_first_clear_cash_reward integer check(progression_first_clear_cash_reward>=0),
 add column if not exists progression_first_clear_reward_pool_id text,
 add column if not exists progression_boss_stat_multiplier_bp integer check(progression_boss_stat_multiplier_bp>0),
 add column if not exists progression_boss_stats jsonb,
 add column if not exists progression_normal_reward_timing text check(progression_normal_reward_timing in ('EXPLORATION_COMPLETE','BOSS_VICTORY')),
 add column if not exists progression_first_clear_reward_timing text check(progression_first_clear_reward_timing in ('BOSS_VICTORY')),
 add column if not exists progression_is_provisional boolean;


create table if not exists public.quest_progression_first_reward_receipts (
 user_id uuid not null references public.users(id) on delete cascade,
 quest_id text not null references public.quests(id),
 patrol_id uuid not null,
 reward jsonb not null default '{}'::jsonb,
 granted_at timestamptz not null default clock_timestamp(),
 primary key(user_id,quest_id)
);
alter table public.quest_progression_first_reward_receipts enable row level security;
revoke all on public.quest_progression_first_reward_receipts from public,anon,authenticated;
grant select on public.quest_progression_first_reward_receipts to authenticated;
grant all on public.quest_progression_first_reward_receipts to service_role;
drop policy if exists quest_progression_first_reward_own on public.quest_progression_first_reward_receipts;
create policy quest_progression_first_reward_own on public.quest_progression_first_reward_receipts for select to authenticated using(user_id=(select auth.uid()));



create table if not exists private.quest_progression_rollout_config (
  singleton boolean primary key default true check(singleton),
  new_users_enabled boolean not null default false
);
insert into private.quest_progression_rollout_config(singleton) values(true) on conflict do nothing;
revoke all on private.quest_progression_rollout_config from public,anon,authenticated;

create table if not exists public.quest_progression_guides (
  user_id uuid primary key references public.users(id) on delete cascade,
  step text not null check(step in ('QUEST_ENTRY','PLAY','GACHA','LOADOUT','RETRY','DONE')),
  seen_story_towns text[] not null default '{}',
  updated_at timestamptz not null default now()
);
alter table public.quest_progression_guides enable row level security;
revoke all on public.quest_progression_guides from public,anon,authenticated;



alter table public.user_patrols add column if not exists progression_kind text not null default 'LEGACY';
alter table public.user_patrols add column if not exists active_replay_id uuid;
alter table public.user_patrols add column if not exists exploration_reward_receipt jsonb;
alter table public.user_patrols add column if not exists first_clear_reward_receipt jsonb;



alter table public.canonical_quest_master add column if not exists progression_boss_members jsonb, add column if not exists progression_recommended_power integer, add column if not exists progression_boss_design_tactic text, add column if not exists progression_strategy_hint text;


CREATE OR REPLACE FUNCTION public._claim_quest_exploration_v1(p_user_id uuid, p_patrol_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
 v_uid uuid:=p_user_id;
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
 select patrol.*,quest.display_name,quest.difficulty,quest.progression_normal_reward_timing,case when patrol.progression_kind='TUTORIAL' then quest.user_exp else coalesce(quest.progression_user_exp,quest.user_exp) end as user_exp,case when patrol.progression_kind='TUTORIAL' then quest.reward_pool_id else coalesce(quest.progression_reward_pool_id,quest.reward_pool_id) end as reward_pool_id,case when patrol.progression_kind='TUTORIAL' then patrol.base_cash_snapshot else coalesce(quest.progression_cash_reward,patrol.base_cash_snapshot) end as cash_reward
 into v_patrol
 from public.user_patrols patrol
 join public.canonical_quest_master quest
   on quest.version='2026-08-30'
  and quest.quest_id=coalesce(patrol.course_id,patrol.quest_id)
  and quest.is_production_enabled
 where patrol.id=p_patrol_id and patrol.user_id=v_uid
 for update of patrol;
 if not found then raise exception 'patrol not found' using errcode='P0002'; end if;
 if v_patrol.status not in ('ONGOING','CLAIMABLE','COMPLETED') then raise exception 'inactive patrol' using errcode='23514';end if;
 if v_patrol.exploration_reward_receipt is not null then return v_patrol.exploration_reward_receipt;end if;
 if v_patrol.status='COMPLETED' then raise exception 'patrol is already completed' using errcode='23514';end if;
 if v_patrol.expires_at>now() and v_patrol.status<>'CLAIMABLE' then raise exception 'patrol is not complete' using errcode='23514';end if;
 if v_patrol.progression_kind='TUTORIAL' and (not coalesce(v_patrol.battle_resolved,false) or v_patrol.battle_result is distinct from 'VICTORY') then raise exception 'tutorial battle not won' using errcode='23514';end if;
 if v_patrol.progression_kind='FIRST_CLEAR' and v_patrol.progression_normal_reward_timing='BOSS_VICTORY' and v_patrol.battle_result is distinct from 'VICTORY' then return jsonb_build_object('cash',0,'xp',0,'items','[]'::jsonb,'deferred',true);end if;
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
 set exploration_reward_receipt=jsonb_build_object('course_name',v_patrol.display_name,'outcome','VICTORY','cash',v_cash,'base_cash',v_patrol.cash_reward,'hometown_bonus_applied',(v_bonus->>'matched')::boolean,'hometown_bonus_cash',v_bonus_cash,'hometown_drop_bonus_bp',v_drop_bp,'xp',v_total_xp,'items',v_items,'first_clear',false,'level',v_xp->'level','current_xp',v_xp->'xp','leveled_up',v_xp->'leveled_up')
 where id=p_patrol_id;
 if v_patrol.progression_kind<>'FIRST_CLEAR' then perform public.evaluate_mission_progress(v_uid,'PATROL_CLEAR',1);end if;
 if v_patrol.progression_kind='TUTORIAL' and v_patrol.difficulty='HARD' and v_patrol.has_battle_event and v_patrol.battle_result='VICTORY' then
   perform public.evaluate_mission_progress(v_uid,'QUEST_HARD_COMPLETE_COUNT',1);
 end if;
 return jsonb_build_object('status','success','patrol_id',p_patrol_id,'course_name',v_patrol.display_name,'outcome','VICTORY','cash',v_cash,'base_cash',v_patrol.cash_reward,'hometown_bonus_applied',(v_bonus->>'matched')::boolean,'hometown_bonus_cash',v_bonus_cash,'hometown_drop_bonus_bp',v_drop_bp,'xp',v_total_xp,'items',v_items,'first_clear',v_first,'level',v_xp->'level','current_xp',v_xp->'xp','leveled_up',v_xp->'leveled_up');
end $function$
;

REVOKE ALL ON FUNCTION public._claim_quest_exploration_v1(p_user_id uuid, p_patrol_id uuid) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public._claim_quest_exploration_v1(p_user_id uuid, p_patrol_id uuid) TO service_role;

CREATE OR REPLACE FUNCTION public._grant_quest_progression_first_reward_v1(p_user_id uuid, p_quest_id text, p_patrol_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_q public.canonical_quest_master%rowtype; v_receipt jsonb; v_inserted boolean; v_item record;
 v_items jsonb:='[]'::jsonb; v_cash integer; v_xp integer; v_xp_result jsonb;
begin
 if p_user_id is null or (auth.uid() is not null and auth.uid()<>p_user_id) then raise exception 'Quest reward owner mismatch' using errcode='42501'; end if;
 if not exists(select 1 from public.user_quest_first_clears where user_id=p_user_id and quest_id=p_quest_id) then raise exception 'Quest first clear is not recorded'; end if;
 if not exists(select 1 from public.user_patrols where id=p_patrol_id and user_id=p_user_id and coalesce(course_id,quest_id)=p_quest_id) then raise exception 'Quest patrol owner mismatch'; end if;
 select * into strict v_q from public.canonical_quest_master where version='2026-08-30' and quest_id=p_quest_id and is_production_enabled;
 insert into public.quest_progression_first_reward_receipts(user_id,quest_id,patrol_id)
 values(p_user_id,p_quest_id,p_patrol_id) on conflict do nothing returning true into v_inserted;
 if not coalesce(v_inserted,false) then
  select reward into v_receipt from public.quest_progression_first_reward_receipts where user_id=p_user_id and quest_id=p_quest_id;
  return v_receipt;
 end if;
 v_cash:=coalesce(v_q.progression_first_clear_cash_reward,0); v_xp:=coalesce(v_q.progression_first_clear_user_exp,0);
 for v_item in select * from public.canonical_quest_reward_pool_items where version=v_q.version and reward_pool_id=v_q.progression_first_clear_reward_pool_id order by roll_index loop
  if floor(random()*10000)::integer<v_item.probability_bp then
   v_item.item_id:=public.resolve_canonical_reward_item(v_item.item_id);
   perform public._grant_gameplay_reward_v1(p_user_id,'QUEST_DROP','progression:first:'||p_quest_id||':'||v_item.roll_index,v_item.item_id,v_item.quantity);
   v_items:=v_items||jsonb_build_array(jsonb_build_object('item_id',v_item.item_id,'quantity',v_item.quantity));
  end if;
 end loop;
 if v_cash>0 then update public.users set cash=coalesce(cash,0)+v_cash where id=p_user_id; end if;
 if v_xp>0 then v_xp_result:=public.apply_user_xp(p_user_id,v_xp); end if;
 v_receipt:=jsonb_build_object('cash',v_cash,'xp',v_xp,'items',v_items,'first_clear',true,'xp_result',v_xp_result);
 update public.quest_progression_first_reward_receipts set reward=v_receipt where user_id=p_user_id and quest_id=p_quest_id;
 return v_receipt;
end $function$
;

REVOKE ALL ON FUNCTION public._grant_quest_progression_first_reward_v1(p_user_id uuid, p_quest_id text, p_patrol_id uuid) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public._grant_quest_progression_first_reward_v1(p_user_id uuid, p_quest_id text, p_patrol_id uuid) TO service_role;

CREATE OR REPLACE FUNCTION public._quest_raid_cash_xp_v2(p_patrol uuid)
 RETURNS jsonb
 LANGUAGE sql
 STABLE
 SET search_path TO 'pg_catalog'
AS $function$
 select case when p.progression_kind in('FIRST_CLEAR','REPEAT') then
 jsonb_build_object('cash',coalesce((p.exploration_reward_receipt->>'base_cash')::bigint,q.progression_cash_reward,p.base_cash_snapshot),
 'userXp',floor(coalesce((p.exploration_reward_receipt->>'xp')::numeric,q.progression_user_exp::numeric,q.user_exp::numeric)*0.5)::integer)
 else jsonb_build_object('cash',coalesce((p.rewards_accrued->>'base_cash')::bigint,p.base_cash_snapshot,q.cash_reward::bigint),
 'userXp',floor(coalesce((p.rewards_accrued->>'xp')::numeric,q.user_exp::numeric)*0.5)::integer) end
 from public.user_patrols p join public.canonical_quest_master q on q.version='2026-08-30' and q.quest_id=coalesce(p.course_id,p.quest_id) where p.id=p_patrol
$function$
;

REVOKE ALL ON FUNCTION public._quest_raid_cash_xp_v2(p_patrol uuid) FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.advance_quest_progression_guide(p_action text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_user uuid:=auth.uid(); v_step text;
begin
  if v_user is null then raise exception 'authentication required' using errcode='42501'; end if;
  if not exists(select 1 from public.quest_progression_user_versions where user_id=v_user and progression_version='2026-09-16') then raise exception 'quest progression inactive'; end if;
  select step into v_step from public.quest_progression_guides where user_id=v_user for update;
  if p_action='ENTER_QUEST' and v_step='QUEST_ENTRY' then v_step:='PLAY';
  elsif p_action='OPEN_LOADOUT' and v_step='GACHA' then v_step:='LOADOUT';
  elsif p_action='APPLY_LOADOUT' and v_step='LOADOUT' then
    begin
      perform public.apply_recommended_main_loadout();
    exception when check_violation then
      -- 所持ゼロでも有料購入を要求しない。既存の装着関数で所持分だけ装着する。
      -- 編成不整合など別の制約違反は隠さない。
      if sqlerrm <> 'Main Formation requires at least one Skill and one Equipment' then raise; end if;
      perform private.apply_recommended_main_skills_v1(v_user);
      perform private.apply_recommended_main_equipment_v1(v_user);
      perform public.refresh_user_power_projection(v_user);
    end;
    v_step:='RETRY';
  elsif p_action='RETURN_QUEST' and v_step='RETRY' then v_step:='DONE';
  elsif p_action not in ('ENTER_QUEST','OPEN_LOADOUT','APPLY_LOADOUT','RETURN_QUEST') then raise exception 'unknown guide action';
  end if;
  update public.quest_progression_guides set step=v_step,updated_at=now() where user_id=v_user;
  return public.get_quest_progression_guide();
end $function$
;

REVOKE ALL ON FUNCTION public.advance_quest_progression_guide(p_action text) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.advance_quest_progression_guide(p_action text) TO authenticated;

GRANT EXECUTE ON FUNCTION public.advance_quest_progression_guide(p_action text) TO service_role;

CREATE OR REPLACE FUNCTION public.canonical_quest_is_unlocked(p_user_id uuid, p_quest_id text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare previous_id text;
begin
 if not public.quest_progression_enabled_v1(p_user_id) then return public.canonical_quest_is_unlocked_pre_progression_v1(p_user_id,p_quest_id);end if;
 if not exists(select 1 from public.canonical_quest_master where version='2026-08-30' and quest_id=p_quest_id and is_production_enabled) then return false;end if;
 select prev.quest_id into previous_id from public.canonical_quest_master target join public.canonical_quest_master prev
 on prev.version=target.version and prev.display_order<target.display_order and prev.is_production_enabled
 where target.version='2026-08-30' and target.quest_id=p_quest_id order by prev.display_order desc limit 1;
 return previous_id is null or exists(select 1 from public.user_quest_first_clears where user_id=p_user_id and quest_id=previous_id);
end $function$
;

REVOKE ALL ON FUNCTION public.canonical_quest_is_unlocked(p_user_id uuid, p_quest_id text) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.canonical_quest_is_unlocked(p_user_id uuid, p_quest_id text) TO service_role;

CREATE OR REPLACE FUNCTION public.canonical_quest_is_unlocked_pre_progression_v1(p_user_id uuid, p_quest_id text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 select case when m.unlock_condition='OPEN' then true when m.unlock_condition like 'FIRST_CLEAR:%' then exists(select 1 from public.user_quest_first_clears c where c.user_id=p_user_id and c.quest_id=substring(m.unlock_condition from 13)) else false end from public.canonical_quest_master m where m.version='2026-08-30' and m.quest_id=p_quest_id and m.is_production_enabled
$function$
;

REVOKE ALL ON FUNCTION public.canonical_quest_is_unlocked_pre_progression_v1(p_user_id uuid, p_quest_id text) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.canonical_quest_is_unlocked_pre_progression_v1(p_user_id uuid, p_quest_id text) TO service_role;

CREATE OR REPLACE FUNCTION public.capture_quest_progression_hard_complete_v1()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
 if not exists(select 1 from public.canonical_quest_master where version='2026-08-30' and quest_id=coalesce(new.course_id,new.quest_id) and difficulty='HARD') then return new;end if;
 if (new.progression_kind='FIRST_CLEAR' and new.battle_result='VICTORY' and old.battle_result is distinct from 'VICTORY' and new.battle_resolved)
 or (new.progression_kind='REPEAT' and new.status='COMPLETED' and old.status is distinct from 'COMPLETED') then
  perform public.evaluate_mission_progress(new.user_id,'QUEST_HARD_COMPLETE_COUNT',1);
 end if;
 return new;
end $function$
;

REVOKE ALL ON FUNCTION public.capture_quest_progression_hard_complete_v1() FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.capture_quest_progression_hard_complete_v1() TO service_role;

CREATE OR REPLACE FUNCTION public.capture_quest_raid_encounter_v1()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
declare v_area text;
begin
 if new.progression_kind='LEGACY' then
  if new.status is distinct from 'COMPLETED' or old.status='COMPLETED' or new.battle_result is distinct from 'VICTORY' or not coalesce(new.battle_resolved,false) or not coalesce(new.has_battle_event,false) then return new;end if;
 elsif new.progression_kind not in('FIRST_CLEAR','REPEAT') or new.exploration_reward_receipt is null or old.exploration_reward_receipt is not null then return new;
 end if;
 if not exists(select 1 from public.quest_raid_encounter_settings where singleton and enabled) or not exists(select 1 from public.tutorial_progress where user_id=new.user_id and step_id='COMPLETE') then return new;end if;
 select public.quest_town_key(town_id) into v_area from public.canonical_quest_master where version='2026-08-30' and quest_id=coalesce(new.course_id,new.quest_id) and is_production_enabled;
 if v_area is not null then insert into public.quest_raid_encounters(patrol_id,user_id,area_id) values(new.id,new.user_id,v_area) on conflict do nothing;end if;
 return new;
end $function$
;

REVOKE ALL ON FUNCTION public.capture_quest_raid_encounter_v1() FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.claim_all_presents()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_uid uuid:=auth.uid(); v_present public.presents%rowtype; v_count integer:=0;
begin
 if v_uid is null then raise exception 'Authentication required' using errcode='42501';end if;
 for v_present in select * from public.presents where user_id=v_uid and status='UNCLAIMED'
  and (expire_at is null or expire_at>clock_timestamp()) order by id for update loop
  perform public.claim_present(v_present.id);v_count:=v_count+1;
 end loop;
 return jsonb_build_object('status','success','claimed_count',v_count);
end $function$
;

REVOKE ALL ON FUNCTION public.claim_all_presents() FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.claim_all_presents() TO authenticated;

GRANT EXECUTE ON FUNCTION public.claim_all_presents() TO service_role;

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

REVOKE ALL ON FUNCTION public.claim_all_presents(p_user_id uuid) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.claim_all_presents(p_user_id uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.claim_patrol_rewards(p_patrol_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare p public.user_patrols%rowtype; receipt jsonb;
begin
 if auth.uid() is null then raise exception 'authentication required' using errcode='42501';end if;
 perform 1 from public.users where id=auth.uid() for update;
 select * into p from public.user_patrols where id=p_patrol_id and user_id=auth.uid() for update;
 if not found then raise exception 'patrol not found' using errcode='P0002';end if;
 if p.status not in('ONGOING','CLAIMABLE','COMPLETED') then raise exception 'inactive patrol' using errcode='23514';end if;
 if p.progression_kind='LEGACY' then return public.claim_patrol_rewards_pre_progression_v1(p_patrol_id);end if;
 if p.status='COMPLETED' then
  -- Repair the response for repeats completed by the earlier empty-summary path.
  -- This uses already granted receipts and never invokes the grant helper again.
  receipt:=case when p.progression_kind='REPEAT' then coalesce(p.exploration_reward_receipt,p.rewards_accrued)
   else coalesce(nullif(p.rewards_accrued,'{}'::jsonb),p.exploration_reward_receipt) end;
  return receipt||jsonb_build_object('status','success','patrol_id',p.id,'already_claimed',true);
 end if;
 receipt:=public._claim_quest_exploration_v1(auth.uid(),p.id);
 if p.progression_kind='FIRST_CLEAR' and p.battle_result is distinct from 'VICTORY' then
  return receipt||jsonb_build_object('status','success','patrol_id',p.id,'outcome',coalesce(p.battle_result,'BOSS_READY'),'retryable',true,'boss_ready',true);
 end if;
 -- FIRST_CLEAR/TUTORIAL can carry a combined victory receipt. REPEAT has only
 -- the exploration receipt; rewards_accrued starts as {}, which is not SQL NULL.
 if p.progression_kind<>'REPEAT' then receipt:=coalesce(nullif(p.rewards_accrued,'{}'::jsonb),receipt);end if;
 receipt:=receipt||jsonb_build_object('status','success','patrol_id',p.id);
 update public.user_patrols set status='COMPLETED',rewards_accrued=receipt where id=p.id;
 return receipt;
end $function$
;

REVOKE ALL ON FUNCTION public.claim_patrol_rewards(p_patrol_id uuid) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.claim_patrol_rewards(p_patrol_id uuid) TO authenticated;

GRANT EXECUTE ON FUNCTION public.claim_patrol_rewards(p_patrol_id uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.claim_patrol_rewards_pre_progression_v1(p_patrol_id uuid)
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

REVOKE ALL ON FUNCTION public.claim_patrol_rewards_pre_progression_v1(p_patrol_id uuid) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.claim_patrol_rewards_pre_progression_v1(p_patrol_id uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.claim_present(p_present_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_uid uuid:=auth.uid(); v_present public.presents%rowtype;
begin
 if v_uid is null then raise exception 'Authentication required' using errcode='42501';end if;
 select * into v_present from public.presents where id=p_present_id and user_id=v_uid and status='UNCLAIMED'
  and (expire_at is null or expire_at>clock_timestamp()) for update;
 if not found then raise exception 'Present is not claimable';end if;
 if v_present.item_id='PLAYER_XP' then
  if v_present.source_kind is distinct from 'QUEST_PROGRESSION_LEGACY' then raise exception 'Unsupported XP source';end if;
  perform public.apply_user_xp(v_uid,v_present.quantity);
 else perform public.grant_present_payload(v_uid,v_present.item_id,v_present.quantity);end if;
 update public.presents set status='CLAIMED',claimed_at=clock_timestamp() where id=v_present.id;
 return jsonb_build_object('status','success','present_id',v_present.id);
end $function$
;

REVOKE ALL ON FUNCTION public.claim_present(p_present_id uuid) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.claim_present(p_present_id uuid) TO authenticated;

GRANT EXECUTE ON FUNCTION public.claim_present(p_present_id uuid) TO service_role;

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

REVOKE ALL ON FUNCTION public.claim_present(p_user_id uuid, p_present_id uuid) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.claim_present(p_user_id uuid, p_present_id uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.create_patrol_battle_replay(p_patrol_id uuid, p_tactic_id text DEFAULT 'ATTACK_PRIORITY'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare p public.user_patrols%rowtype; previous public.battle_replay_sessions%rowtype; result jsonb; replay_id uuid; stats jsonb; multiplier integer; enemy jsonb;
begin
 if auth.uid() is null then raise exception 'authentication required' using errcode='42501';end if;
 perform 1 from public.users where id=auth.uid() for update;
 select * into p from public.user_patrols where id=p_patrol_id and user_id=auth.uid() for update;
 if not found then raise exception 'patrol not found' using errcode='P0002';end if;
 if p.progression_kind='LEGACY' then return public.create_patrol_battle_replay_pre_progression_v1(p_patrol_id,p_tactic_id);end if;
 if p.status not in('ONGOING','CLAIMABLE') or p.expires_at>now() or not p.has_battle_event or p.battle_result='VICTORY' then raise exception 'eligible patrol encounter not found' using errcode='23514';end if;
 if p.active_replay_id is not null then
  select * into previous from public.battle_replay_sessions where id=p.active_replay_id;
  if previous.status='RESOLVED' then
   perform public.finalize_quest_progression_battle_v1(previous.id);
   select * into p from public.user_patrols where id=p.id;
   if p.battle_result='VICTORY' then raise exception 'stage already cleared' using errcode='23514';end if;
  end if;
  if previous.status='PENDING' then return jsonb_build_object('replay_session_id',previous.id,'player_snapshot',previous.player_snapshot,'enemy_snapshot',previous.enemy_snapshot,'enemy_tactic',previous.enemy_tactic_id);end if;
 end if;
 if p.progression_kind='FIRST_CLEAR' then perform public._claim_quest_exploration_v1(auth.uid(),p.id);end if;
 update public.user_patrols set battle_resolved=false,battle_result=null,status='CLAIMABLE' where id=p.id;
 result:=public.create_patrol_battle_replay_pre_progression_v1(p.id,p_tactic_id);
 replay_id:=(result->>'replay_session_id')::uuid;
 if p.progression_kind='FIRST_CLEAR' and exists(select 1 from public.quest_raid_encounter_settings where singleton and enabled) then
  insert into public.quest_raid_encounters(patrol_id,user_id,area_id)
   select p.id,p.user_id,public.quest_town_key(town_id) from public.canonical_quest_master where version='2026-08-30' and quest_id=coalesce(p.course_id,p.quest_id)
   on conflict do nothing;
 end if;
 update public.user_patrols set active_replay_id=replay_id where id=p.id;
 return result;
end $function$
;

REVOKE ALL ON FUNCTION public.create_patrol_battle_replay(p_patrol_id uuid, p_tactic_id text) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.create_patrol_battle_replay(p_patrol_id uuid, p_tactic_id text) TO authenticated;

GRANT EXECUTE ON FUNCTION public.create_patrol_battle_replay(p_patrol_id uuid, p_tactic_id text) TO service_role;

CREATE OR REPLACE FUNCTION public.create_patrol_battle_replay_pre_progression_v1(p_patrol_id uuid, p_tactic_id text DEFAULT 'ATTACK_PRIORITY'::text)
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

REVOKE ALL ON FUNCTION public.create_patrol_battle_replay_pre_progression_v1(p_patrol_id uuid, p_tactic_id text) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.create_patrol_battle_replay_pre_progression_v1(p_patrol_id uuid, p_tactic_id text) TO service_role;

CREATE OR REPLACE FUNCTION public.finalize_quest_progression_battle_v1(p_replay_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare s public.battle_replay_sessions%rowtype; p public.user_patrols%rowtype; normal jsonb; first_reward jsonb; receipt jsonb; inserted boolean:=false;
begin
 select * into s from public.battle_replay_sessions where id=p_replay_id;
 if not found or s.battle_mode<>'QUEST' or s.resolution_authority<>'PATROL_SERVER' or s.status<>'RESOLVED' or s.result->>'winner' not in('PLAYER','ENEMY') then raise exception 'resolved official quest replay required' using errcode='23514';end if;
 perform 1 from public.users where id=s.requester_user_id for update;
 select * into p from public.user_patrols where id=s.source_reference_id and user_id=s.requester_user_id for update;
 if not found then raise exception 'patrol not found' using errcode='P0002';end if;
 if p.progression_kind='LEGACY' then return jsonb_build_object('legacy',true);end if;
 -- Old replay retries cannot overwrite a later attempt, and migrated patrols stay retired.
 if p.active_replay_id is distinct from s.id or p.status not in('ONGOING','CLAIMABLE') then return jsonb_build_object('ignored',true);end if;
 if coalesce(p.battle_resolved,false) then return coalesce(p.rewards_accrued,jsonb_build_object('outcome',p.battle_result));end if;
 update public.user_patrols set battle_result=case when s.result->>'winner'='PLAYER' then 'VICTORY' else 'DEFEAT' end,battle_resolved=true where id=p.id;
 if s.result->>'winner'='ENEMY' then return jsonb_build_object('outcome','DEFEAT','retryable',true);end if;
 normal:=public._claim_quest_exploration_v1(p.user_id,p.id);
 if p.progression_kind='FIRST_CLEAR' or (p.progression_kind='TUTORIAL' and exists(select 1 from public.tutorial_progress t where t.user_id=p.user_id and t.step_id in ('COMPLETE','AUTHENTICATION') and t.completed_at<=p.started_at)) then
  insert into public.user_quest_first_clears(user_id,quest_id) values(p.user_id,coalesce(p.course_id,p.quest_id)) on conflict do nothing returning true into inserted;
  if inserted then
   first_reward:=public._grant_quest_progression_first_reward_v1(p.user_id,coalesce(p.course_id,p.quest_id),p.id);
   perform public.evaluate_mission_progress(p.user_id,'PATROL_CLEAR',1);
  end if;
 end if;
 first_reward:=coalesce(first_reward,'{}'::jsonb);
 first_reward:=first_reward||jsonb_build_object('level',first_reward->'xp_result'->'level','current_xp',first_reward->'xp_result'->'xp','leveled_up',coalesce(first_reward->'xp_result'->'leveled_up','false'::jsonb));
 receipt:=normal||jsonb_build_object('outcome','VICTORY','first_clear',coalesce(inserted,false),
 'cash',coalesce((normal->>'cash')::bigint,0)+coalesce((first_reward->>'cash')::bigint,0),
 'xp',coalesce((normal->>'xp')::integer,0)+coalesce((first_reward->>'xp')::integer,0),
 'items',coalesce(normal->'items','[]'::jsonb)||coalesce(first_reward->'items','[]'::jsonb),
 'level',coalesce(nullif(first_reward->'level','null'::jsonb),normal->'level'),'current_xp',coalesce(nullif(first_reward->'current_xp','null'::jsonb),normal->'current_xp'),
 'leveled_up',coalesce((normal->>'leveled_up')::boolean,false) or coalesce((first_reward->>'leveled_up')::boolean,false));
 update public.user_patrols set rewards_accrued=receipt,first_clear_reward_receipt=first_reward where id=p.id;
 return receipt;
end $function$
;

REVOKE ALL ON FUNCTION public.finalize_quest_progression_battle_v1(p_replay_id uuid) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.finalize_quest_progression_battle_v1(p_replay_id uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.get_canonical_quest_progression()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare result jsonb;
begin
 if auth.uid() is null then raise exception 'authentication required' using errcode='42501';end if;
 if not public.quest_progression_enabled_v1(auth.uid()) then return public.get_canonical_quest_progression_pre_progression_v1();end if;
 select coalesce(jsonb_agg(jsonb_build_object('quest_id',m.quest_id,'progression_enabled',true,
 'stage_order',m.display_order,'unlock_condition',m.unlock_condition,
 'is_unlocked',public.canonical_quest_is_unlocked(auth.uid(),m.quest_id),
 'is_first_cleared',exists(select 1 from public.user_quest_first_clears c where c.user_id=auth.uid() and c.quest_id=m.quest_id),
 'boss_patrol_id',p.id,'boss_ready',coalesce(p.expires_at<=now() and p.battle_result is distinct from 'VICTORY',false),
 'last_battle_result',p.battle_result,'enemy_tactic','BALANCED',
 'enemy_member_count',jsonb_array_length(coalesce(p.encounter_snapshot->'members',m.progression_boss_members,'[]'::jsonb)),
 'enemy_members',coalesce(p.encounter_snapshot->'members',m.progression_boss_members,'[]'::jsonb),
 'recommended_power',m.progression_recommended_power,
 'enemy_attributes',coalesce((select jsonb_agg(distinct member->>'alignment') from jsonb_array_elements(coalesce(p.encounter_snapshot->'members',m.progression_boss_members,'[]'::jsonb)) member),'[]'::jsonb)) order by m.display_order),'[]'::jsonb) into result
 from public.canonical_quest_master m left join lateral(select x.* from public.user_patrols x where x.user_id=auth.uid()
 and coalesce(x.course_id,x.quest_id)=m.quest_id and x.progression_kind='FIRST_CLEAR' and x.status in('ONGOING','CLAIMABLE') order by x.started_at desc limit 1)p on true
 where m.version='2026-08-30' and m.is_production_enabled;
 return result;
end $function$
;

REVOKE ALL ON FUNCTION public.get_canonical_quest_progression() FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.get_canonical_quest_progression() TO authenticated;

GRANT EXECUTE ON FUNCTION public.get_canonical_quest_progression() TO service_role;

CREATE OR REPLACE FUNCTION public.get_canonical_quest_progression_pre_progression_v1()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 select coalesce(jsonb_agg(jsonb_build_object('quest_id',m.quest_id,'unlock_condition',m.unlock_condition,'is_unlocked',public.canonical_quest_is_unlocked(auth.uid(),m.quest_id),'is_first_cleared',exists(select 1 from public.user_quest_first_clears c where c.user_id=auth.uid() and c.quest_id=m.quest_id),'enemy_tactic','BALANCED','enemy_member_count',case when m.difficulty='EASY' then 3 else 5 end,'enemy_members','[]'::jsonb,'recommended_level',case m.difficulty when 'EASY' then 5 when 'NORMAL' then 12 else 20 end,'enemy_attributes','[]'::jsonb) order by m.display_order),'[]'::jsonb) from public.canonical_quest_master m where m.version='2026-08-30' and m.is_production_enabled
$function$
;

REVOKE ALL ON FUNCTION public.get_canonical_quest_progression_pre_progression_v1() FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.get_canonical_quest_progression_pre_progression_v1() TO service_role;

CREATE OR REPLACE FUNCTION public.get_patrol_battle_enemy(p_patrol_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_patrol public.user_patrols%rowtype;
  v_first_member jsonb;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  select patrol.*
  into v_patrol
  from public.user_patrols patrol
  where patrol.id = p_patrol_id
    and patrol.user_id = v_user_id
    and (
      patrol.status = 'CLAIMABLE'
      or (patrol.status = 'ONGOING' and patrol.expires_at <= now())
    )
    and patrol.has_battle_event = true
    and (coalesce(patrol.battle_resolved, false) = false or (patrol.progression_kind in('FIRST_CLEAR','TUTORIAL') and patrol.battle_result='DEFEAT'))
    and patrol.encounter_snapshot is not null
  limit 1;

  if not found then
    raise exception 'eligible patrol encounter not found' using errcode = 'P0002';
  end if;

  v_first_member := v_patrol.encounter_snapshot->'members'->0;
  return jsonb_build_object(
    'id', coalesce(v_patrol.encounter_snapshot->>'encounterId', v_patrol.id::text),
    'quest_id', coalesce(v_patrol.course_id, v_patrol.quest_id),
    'npc_name', 'Canonical NPC Party',
    'npc_level', coalesce((v_first_member->>'level')::integer, 1),
    'encounter_rate', 1,
    'enemy_data', v_patrol.encounter_snapshot
  );
end;
$function$
;

REVOKE ALL ON FUNCTION public.get_patrol_battle_enemy(p_patrol_id uuid) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.get_patrol_battle_enemy(p_patrol_id uuid) TO authenticated;

GRANT EXECUTE ON FUNCTION public.get_patrol_battle_enemy(p_patrol_id uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.get_quest_progression_guide()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_user uuid:=auth.uid(); v_result jsonb;
begin
  if v_user is null then raise exception 'authentication required' using errcode='42501'; end if;
  if not exists(select 1 from public.quest_progression_user_versions where user_id=v_user and progression_version='2026-09-16') then return null; end if;
  select jsonb_build_object('step',step,'seen_story_towns',seen_story_towns) into v_result
  from public.quest_progression_guides where user_id=v_user;
  return v_result;
end $function$
;

REVOKE ALL ON FUNCTION public.get_quest_progression_guide() FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.get_quest_progression_guide() TO authenticated;

GRANT EXECUTE ON FUNCTION public.get_quest_progression_guide() TO service_role;

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
    and ( (feed.activity_type='SYSTEM_NEWS' and feed.actor_user_id is null and exists(select 1 from public.news n where n.id::text=feed.display_payload->>'news_id' and n.is_published and n.start_at<=statement_timestamp() and (n.end_at is null or n.end_at>statement_timestamp()))) or (feed.activity_type in (
      
      'SSR_CHARACTER','POWER_RANK_1','PVP_DAILY_RANK_1','GUILD_CREATED','RAID_HELP_REQUEST','RAID_BOSS_DEFEATED'
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
  )) order by feed.created_at desc,feed.id desc
  limit greatest(1,least(coalesce(p_limit,20),50));
end;
$function$
;

REVOKE ALL ON FUNCTION public.get_recent_social_activity_feed(p_limit integer) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.get_recent_social_activity_feed(p_limit integer) TO authenticated;

CREATE OR REPLACE FUNCTION public.mark_quest_story_seen(p_town text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_user uuid:=auth.uid();
begin
  if v_user is null then raise exception 'authentication required' using errcode='42501'; end if;
  if p_town not in ('shinjuku','shibuya','ikebukuro','roppongi','akihabara','kawasaki','yokohama') then raise exception 'unknown town'; end if;
  if not exists(select 1 from public.quest_progression_user_versions where user_id=v_user and progression_version='2026-09-16') then raise exception 'quest progression inactive'; end if;
  update public.quest_progression_guides set seen_story_towns=array_append(seen_story_towns,p_town),updated_at=now()
  where user_id=v_user and not(p_town=any(seen_story_towns));
  return public.get_quest_progression_guide();
end $function$
;

REVOKE ALL ON FUNCTION public.mark_quest_story_seen(p_town text) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.mark_quest_story_seen(p_town text) TO authenticated;

GRANT EXECUTE ON FUNCTION public.mark_quest_story_seen(p_town text) TO service_role;

CREATE OR REPLACE FUNCTION public.migrate_quest_progression_v1(p_user_ids uuid[], p_migration_key text, p_cutoff_at timestamp with time zone, p_compensation jsonb, p_compensation_scope text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
 v_user uuid; v_patrol public.user_patrols%rowtype; v_master record;
 v_existing public.quest_progression_migration_runs%rowtype;
 v_reward jsonb; v_item jsonb; v_rewards jsonb; v_entitled boolean;
 v_cash bigint; v_xp integer; v_drop integer; v_index integer;
 v_retired integer; v_entitlements integer; v_presents integer; v_any_active boolean;
 v_summary jsonb:='[]'; v_result jsonb;
begin
 if p_user_ids is null or cardinality(p_user_ids)=0 or cardinality(p_user_ids)>1000
    or array_position(p_user_ids,null) is not null then
  raise exception 'Explicit user IDs required (1..1000)' using errcode='22023'; end if;
 if p_migration_key is null or btrim(p_migration_key)='' or p_cutoff_at is null
    or p_cutoff_at>clock_timestamp() then raise exception 'Migration key and nonfuture cutoff required' using errcode='22023';end if;
 if p_compensation is null or jsonb_typeof(p_compensation)<>'array'
    or p_compensation_scope is null or p_compensation_scope not in('ALL_TARGETS','ACTIVE_PATROLS') then
  raise exception 'Explicit compensation and scope required' using errcode='22023';end if;
 for v_item in select value from jsonb_array_elements(p_compensation) loop
  if jsonb_typeof(v_item)<>'object' or coalesce(v_item->>'item_id','')='' or
    coalesce(v_item->>'quantity','') !~ '^[1-9][0-9]*$' or (v_item->>'quantity')::numeric>2147483647 then
   raise exception 'Invalid compensation payload' using errcode='22023';end if;
  if v_item->>'item_id'='PLAYER_XP' then raise exception 'Compensation XP is not an item';end if;
 end loop;
 for v_user in select distinct u from unnest(p_user_ids) u order by u loop
  -- 開始APIもusersロックを取る。移行中の新規探索開始と同時実行しない。
  perform 1 from public.users where id=v_user for update;
  if not found then raise exception 'Migration target missing' using errcode='P0002';end if;
  select * into v_existing from public.quest_progression_migration_runs
   where user_id=v_user and progression_version='2026-09-16';
  if found then
   if v_existing.migration_key<>p_migration_key or v_existing.compensation<>p_compensation
      or v_existing.cutoff_at<>p_cutoff_at or v_existing.compensation_scope<>p_compensation_scope then
    raise exception 'Migration inputs differ from completed run' using errcode='23514';end if;
   v_summary:=v_summary||jsonb_build_array(v_existing.result||jsonb_build_object('replayed',true));
   continue;
  end if;
  if exists(select 1 from public.quest_progression_user_versions where user_id=v_user) then
   raise exception 'User already activated; refusing to reset new progress' using errcode='23514';end if;
  -- cutoff後に作成された旧探索があると、対象漏れになるため明示的に再計画。
  if exists(select 1 from public.user_patrols where user_id=v_user
    and status not in('COMPLETED','MIGRATED') and started_at>p_cutoff_at) then
   raise exception 'Active patrol newer than cutoff' using errcode='23514';end if;
  insert into public.quest_progression_migration_runs(migration_key,user_id,progression_version,cutoff_at,compensation,compensation_scope,old_first_clears)
  values(p_migration_key,v_user,'2026-09-16',p_cutoff_at,p_compensation,p_compensation_scope,
   coalesce((select jsonb_agg(to_jsonb(c)) from public.user_quest_first_clears c where user_id=v_user),'[]'));
  v_retired:=0;v_entitlements:=0;v_presents:=0;v_any_active:=false;
  for v_patrol in select * from public.user_patrols where user_id=v_user
    and status not in('COMPLETED','MIGRATED') order by id for update loop
   v_any_active:=true;
   v_entitled:=(v_patrol.status='CLAIMABLE' or v_patrol.expires_at<=p_cutoff_at)
     and (not coalesce(v_patrol.has_battle_event,false)
       or (coalesce(v_patrol.battle_resolved,false) and v_patrol.battle_result='VICTORY'));
   v_entitled:=coalesce(v_entitled,false); v_rewards:='[]';
   if v_entitled then
    select * into v_master from public.quest_progression_legacy_reward_master
      where quest_id=coalesce(v_patrol.course_id,v_patrol.quest_id);
    if not found or v_patrol.base_cash_snapshot is null or v_patrol.hometown_bonus_snapshot is null then
     raise exception 'Legacy reward snapshot missing; refusing to discard entitlement' using errcode='23514';end if;
    v_cash:=v_patrol.base_cash_snapshot+(v_patrol.hometown_bonus_snapshot->>'cash')::bigint;
    v_xp:=(v_master.quest_snapshot->>'user_exp')::integer;
    v_drop:=(v_patrol.hometown_bonus_snapshot->>'drop_bonus_bp')::integer;
    if v_cash is null or v_cash<0 or v_cash>2147483647 or v_xp is null or v_xp<0 or v_drop is null then
     raise exception 'Invalid legacy reward snapshot' using errcode='23514';end if;
    if v_cash>0 then v_rewards:=v_rewards||jsonb_build_array(jsonb_build_object('item_id','CASH','quantity',v_cash));end if;
    if v_xp>0 then v_rewards:=v_rewards||jsonb_build_array(jsonb_build_object('item_id','PLAYER_XP','quantity',v_xp));end if;
    for v_item in select value from jsonb_array_elements(v_master.pool_snapshot) loop
     if (v_item->>'probability_bp')::integer>0 and floor(random()*10000)::integer<least(10000,(v_item->>'probability_bp')::integer+v_drop) then
      v_rewards:=v_rewards||jsonb_build_array(jsonb_build_object('item_id',public.resolve_canonical_reward_item(v_item->>'item_id'),'quantity',(v_item->>'quantity')::integer));
     end if;
    end loop;
    v_entitlements:=v_entitlements+1;
   end if;
   insert into public.quest_progression_migration_patrols(migration_key,user_id,patrol_id,old_patrol,entitled,reward_payload)
    values(p_migration_key,v_user,v_patrol.id,to_jsonb(v_patrol),v_entitled,v_rewards);
   v_index:=0;
   for v_reward in select value from jsonb_array_elements(v_rewards) loop
    v_index:=v_index+1;
    insert into public.presents(user_id,item_id,quantity,message,source_kind,source_key,source_metadata)
    values(v_user,v_reward->>'item_id',(v_reward->>'quantity')::integer,'クエスト更新：未受取報酬','QUEST_PROGRESSION_LEGACY',
      p_migration_key||':'||v_patrol.id::text||':'||v_index::text,
      jsonb_build_object('migration_key',p_migration_key,'patrol_id',v_patrol.id,'progression_version','2026-09-16'));
    v_presents:=v_presents+1;
   end loop;
   -- row自体は残してquest_raid_encounters FKと既存レイド参加状態を維持。
   update public.user_patrols set status='MIGRATED' where id=v_patrol.id;
   v_retired:=v_retired+1;
  end loop;
  delete from public.user_quest_first_clears where user_id=v_user;
  if p_compensation_scope='ALL_TARGETS' or v_any_active then
   v_index:=0;
   for v_reward in select value from jsonb_array_elements(p_compensation) loop
    v_index:=v_index+1;
    insert into public.presents(user_id,item_id,quantity,message,source_kind,source_key,source_metadata)
    values(v_user,public.resolve_canonical_reward_item(v_reward->>'item_id'),(v_reward->>'quantity')::integer,
      'クエスト更新：探索リセットのお詫び','QUEST_PROGRESSION_COMPENSATION',p_migration_key||':'||v_index::text,
      jsonb_build_object('migration_key',p_migration_key,'scope',p_compensation_scope));
    v_presents:=v_presents+1;
   end loop;
  end if;
  insert into public.quest_progression_user_versions(user_id,progression_version,migration_key)
   values(v_user,'2026-09-16',p_migration_key);
  v_result:=jsonb_build_object('retired_patrols',v_retired,'preserved_entitlements',v_entitlements,'presents_created',v_presents,'replayed',false);
  update public.quest_progression_migration_runs set result=v_result,completed_at=clock_timestamp()
   where migration_key=p_migration_key and user_id=v_user;
  v_summary:=v_summary||jsonb_build_array(v_result);
 end loop;
 return jsonb_build_object('status','success','progression_version','2026-09-16','results',v_summary);
end $function$
;

REVOKE ALL ON FUNCTION public.migrate_quest_progression_v1(p_user_ids uuid[], p_migration_key text, p_cutoff_at timestamp with time zone, p_compensation jsonb, p_compensation_scope text) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.migrate_quest_progression_v1(p_user_ids uuid[], p_migration_key text, p_cutoff_at timestamp with time zone, p_compensation jsonb, p_compensation_scope text) TO service_role;

CREATE OR REPLACE FUNCTION public.on_canonical_patrol_snapshot()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare snapshot jsonb;
begin
 if new.progression_kind='FIRST_CLEAR' then
  snapshot:=public.quest_progression_enemy_snapshot_v1(null,coalesce(new.course_id,new.quest_id));
 end if;
 if snapshot is null then snapshot:=public.generate_canonical_quest_encounter_snapshot(new.user_id,coalesce(new.course_id,new.quest_id));end if;
 new.encounter_snapshot:=snapshot;new.encounter_party_signature:=snapshot->>'partySignature';return new;
end $function$
;

REVOKE ALL ON FUNCTION public.on_canonical_patrol_snapshot() FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.on_canonical_patrol_snapshot() TO PUBLIC;

GRANT EXECUTE ON FUNCTION public.on_canonical_patrol_snapshot() TO anon;

GRANT EXECUTE ON FUNCTION public.on_canonical_patrol_snapshot() TO authenticated;

GRANT EXECUTE ON FUNCTION public.on_canonical_patrol_snapshot() TO service_role;

CREATE OR REPLACE FUNCTION public.on_daily_pvp_leader_activity()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_day date := (clock_timestamp() at time zone 'Asia/Tokyo')::date;
  v_key text;
  v_leader uuid;
  v_previous uuid;
  v_wins integer;
  v_name text;
begin
  if new.activity_date <> v_day or new.wins <= 0 then return new; end if;
  if tg_op='UPDATE' then
    if new.wins is not distinct from old.wins then return new; end if;
  end if;
  if coalesce(current_setting('tribe_neon.ranking_reconcile',true),'')='on' then return new; end if;
  v_key := 'PVP_DAILY_RANK_1:' || v_day::text;
  -- Serialize announcements across concurrent winners, including the first win of a day.
  perform pg_advisory_xact_lock(hashtextextended(v_key,0));
  select daily.user_id,daily.wins,player.username into v_leader,v_wins,v_name
  from public.pvp_daily_wins daily
  join public.pvp_ranks rank on rank.user_id=daily.user_id
  join public.users player on player.id=daily.user_id
  where daily.activity_date=v_day and daily.wins>0
  order by daily.wins desc,daily.user_id
  limit 1;
  if v_leader is null then return new; end if;
  select subject_user_id into v_previous from public.social_activity_projection_state
  where projection_key=v_key for update;
  if v_previous is not distinct from v_leader then return new; end if;
  insert into public.social_activity_projection_state(projection_key,subject_user_id,updated_at)
  values(v_key,v_leader,clock_timestamp())
  on conflict(projection_key) do update set
    subject_user_id=excluded.subject_user_id,updated_at=excluded.updated_at;
  insert into public.social_activity_feed(activity_type,actor_user_id,actor_display_name,display_payload,created_at)
  values('PVP_DAILY_RANK_1',v_leader,coalesce(v_name,'PLAYER'),
    jsonb_build_object('ranking_day_key',v_day,'wins',v_wins),clock_timestamp());
  return new;
end;
$function$
;

REVOKE ALL ON FUNCTION public.on_daily_pvp_leader_activity() FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.on_daily_pvp_leader_activity() TO service_role;

CREATE OR REPLACE FUNCTION public.on_quest_hometown_snapshot()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare base_cash bigint;
begin
 new.hometown_bonus_snapshot:=public.quest_hometown_snapshot(new.user_id,new.character_id,coalesce(new.course_id,new.quest_id));
 if new.progression_kind in('FIRST_CLEAR','REPEAT') then
  select coalesce(progression_cash_reward,cash_reward) into base_cash from public.canonical_quest_master where version='2026-08-30' and quest_id=coalesce(new.course_id,new.quest_id);
  new.hometown_bonus_snapshot:=new.hometown_bonus_snapshot||jsonb_build_object('cash',floor(base_cash::numeric*coalesce((new.hometown_bonus_snapshot->>'cash_bonus_rate')::numeric,0))::bigint,'progression_base_cash',base_cash);
 end if;
 return new;
end $function$
;

REVOKE ALL ON FUNCTION public.on_quest_hometown_snapshot() FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.on_quest_hometown_snapshot() TO service_role;

CREATE OR REPLACE FUNCTION public.quest_progression_enabled_v1(p_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 select exists(select 1 from public.quest_progression_user_versions where user_id=p_user_id and progression_version='2026-09-16')
$function$
;

REVOKE ALL ON FUNCTION public.quest_progression_enabled_v1(p_user_id uuid) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.quest_progression_enabled_v1(p_user_id uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.quest_progression_enemy_snapshot_v1(p_snapshot jsonb, p_quest_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare q public.canonical_quest_master%rowtype; members jsonb;
begin
 select * into q from public.canonical_quest_master where version='2026-08-30' and quest_id=p_quest_id;
 if q.progression_boss_members is null then return p_snapshot; end if;
 select jsonb_agg(m||jsonb_build_object('skills',jsonb_build_array(jsonb_build_object(
  'id',s.skill_id,'name',s.display_name,'activationType',s.activation_type,'cooldown',s.cooldown,
  'availableFromRound',s.available_from_round,'target',s.target,'effects',s.effects,
  'exclusiveCharacterId',s.exclusive_character_id,'skillPlusVal',0))) order by ord) into members
 from jsonb_array_elements(q.progression_boss_members) with ordinality e(m,ord)
 join public.canonical_skill_master s on s.version='2026-08-21' and s.skill_id=m#>>'{equippedSkillRefs,0}';
 if jsonb_array_length(members)<>5 then raise exception 'Fixed boss must contain five valid skills'; end if;
 return jsonb_build_object('members',members,'partySignature',(select string_agg(m->>'characterId','|' order by ord) from jsonb_array_elements(members) with ordinality e(m,ord)),
  'enemyTactic','BALANCED','designTactic',q.progression_boss_design_tactic,'progressionBalanceVersion','2026-09-17','recommendedPower',q.progression_recommended_power);
end $function$
;

REVOKE ALL ON FUNCTION public.quest_progression_enemy_snapshot_v1(p_snapshot jsonb, p_quest_id text) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.quest_progression_enemy_snapshot_v1(p_snapshot jsonb, p_quest_id text) TO service_role;

CREATE OR REPLACE FUNCTION public.quest_progression_mission_clear_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
 perform public.refresh_quest_progression_missions(new.user_id);
 return new;
end $function$
;

REVOKE ALL ON FUNCTION public.quest_progression_mission_clear_trigger() FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.quest_progression_mission_clear_trigger() TO service_role;

CREATE OR REPLACE FUNCTION public.quest_raid_encounter_projection_v1(p_patrol_id uuid)
 RETURNS jsonb
 LANGUAGE sql
 STABLE
 SET search_path TO 'pg_catalog'
AS $function$
 select jsonb_build_object('patrolId',e.patrol_id,'status',e.status,'roomId',e.room_id,'areaId',e.area_id,
 'difficulty',e.difficulty,'bossName',v.raid_name,'leaderId',v.member_character_ids->>0,
 'rewardMultiplier',1,'bonusCash',coalesce(e.bonus_cash,(public._quest_raid_cash_xp_v2(e.patrol_id)->>'cash')::bigint),'bonusUserXp',coalesce(e.bonus_user_xp,(public._quest_raid_cash_xp_v2(e.patrol_id)->>'userXp')::integer),'bonusItems','[]'::jsonb,'acknowledged',e.acknowledged_at is not null,
 'participated',exists(select 1 from public.raid_room_battle_start_requests started where started.room_id=e.room_id and started.user_id=e.user_id),'expiresAt',b.expires_at,'ended',b.id is not null and (b.status<>'ACTIVE' or b.current_hp<=0 or b.expires_at<=now() or b.outcome_finalized_at is not null))
 from public.quest_raid_encounters e left join public.canonical_raid_variants v on v.raid_variant_id=e.variant_id
 left join public.raid_rooms r on r.id=e.room_id left join public.raid_bosses b on b.id=r.raid_boss_instance_id
 where e.patrol_id=p_patrol_id
$function$
;

REVOKE ALL ON FUNCTION public.quest_raid_encounter_projection_v1(p_patrol_id uuid) FROM PUBLIC, anon, authenticated, service_role;

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
perform public.refresh_quest_progression_missions(p_user_id);
end;
$function$
;

REVOKE ALL ON FUNCTION public.refresh_normal_mission_owned_state(p_user_id uuid) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.refresh_normal_mission_owned_state(p_user_id uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.refresh_quest_progression_missions(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
 if p_user_id is null or (auth.uid() is not null and auth.uid()<>p_user_id) then
  raise exception 'Mission progress owner mismatch' using errcode='42501';
 end if;
 if not exists(select 1 from public.quest_progression_user_versions where user_id=p_user_id and progression_version='2026-09-16') then return; end if;
 with stages as (
  select q.quest_id,q.town_id from public.canonical_quest_master q
  where q.version='2026-08-30' and q.is_production_enabled
 ), clears as (
  select s.quest_id,s.town_id from stages s join public.user_quest_first_clears c using(quest_id)
  where c.user_id=p_user_id
 ), observations as (
  select m.id,case m.trigger_type
   when 'QUEST_STAGE_CLEAR' then case when exists(select 1 from clears where quest_id=m.condition_params->>'quest_id') then 1 else 0 end
   when 'QUEST_TOWN_CLEAR' then case when
    (select count(*) from stages where town_id=m.condition_params->>'town_id')>0
    and not exists(select 1 from stages s where s.town_id=m.condition_params->>'town_id' and not exists(select 1 from clears c where c.quest_id=s.quest_id))
    then 1 else 0 end
   when 'QUEST_STAGE_CLEAR_COUNT' then (select count(*)::integer from clears)
   when 'QUEST_ALL_STAGES_CLEAR' then case when (select count(*) from stages)=21 and (select count(*) from clears)=21 then 1 else 0 end
   end as value
  from public.missions m
  where m.is_enabled and m.category in ('NORMAL','SPECIAL')
   and m.trigger_type in ('QUEST_STAGE_CLEAR','QUEST_TOWN_CLEAR','QUEST_STAGE_CLEAR_COUNT','QUEST_ALL_STAGES_CLEAR')
   and (m.event_id is null or exists(select 1 from public.mission_events e where e.id=m.event_id and e.is_enabled and now()>=e.start_at and now()<e.progress_end_at))
 )
 update public.user_missions um
 set current_progress=least(m.target_value,o.value),progress_val=least(m.target_value,o.value),
  status=case when o.value>=m.target_value then 'CLEAR' else 'PROGRESS' end,updated_at=clock_timestamp()
 from observations o join public.missions m on m.id=o.id
 where um.user_id=p_user_id and um.mission_id=o.id and um.status='PROGRESS'
  and (um.current_progress is distinct from least(m.target_value,o.value)
   or um.status is distinct from case when o.value>=m.target_value then 'CLEAR' else 'PROGRESS' end);
end $function$
;

REVOKE ALL ON FUNCTION public.refresh_quest_progression_missions(p_user_id uuid) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.refresh_quest_progression_missions(p_user_id uuid) TO service_role;

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
  -- Quest Encounter uses deterministic Stage mapping; normal Raid keeps its own authority.
  e.difficulty := case
    when e.area_id in ('shinjuku','shibuya') then 'beginner'
    when e.area_id in ('ikebukuro','roppongi') then 'intermediate'
    when e.area_id in ('akihabara','kawasaki') then 'advanced'
    when e.area_id='yokohama' and coalesce(e.quest_id,'') like '%_1' then 'advanced'
    when e.area_id='yokohama' then 'expert'
    else null
  end;
  if e.difficulty is null then return jsonb_build_object('status','DEFERRED','patrolId',p_patrol_id);end if;
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

REVOKE ALL ON FUNCTION public.resolve_quest_raid_encounter_v1(p_patrol_id uuid) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.resolve_quest_raid_encounter_v1(p_patrol_id uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.start_patrol(p_course_id text, p_character_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_uid uuid:=auth.uid(); v_character text; v_q record; v_id uuid; v_active integer; v_vitality integer; v_kind text; v_cost integer; v_duration integer;
begin
 if v_uid is null then raise exception 'authentication required' using errcode='42501'; end if;
 if not public.quest_progression_enabled_v1(v_uid) then return public.start_patrol_pre_progression_v1(p_course_id,p_character_id);end if;
 select * into v_q from public.canonical_quest_master where version='2026-08-30' and quest_id=p_course_id and is_production_enabled;
 if not found then raise exception 'quest not found' using errcode='23503'; end if;
 if not public.canonical_quest_is_unlocked(v_uid,p_course_id) then raise exception 'quest is locked' using errcode='23514'; end if;
 perform 1 from public.users where id=v_uid for update;
 v_kind:=case when not exists(select 1 from public.tutorial_progress where user_id=v_uid and step_id in ('COMPLETE','AUTHENTICATION')) then 'TUTORIAL' when exists(select 1 from public.user_quest_first_clears where user_id=v_uid and quest_id=p_course_id) then 'REPEAT' else 'FIRST_CLEAR' end;
 v_cost:=case when v_kind='TUTORIAL' then v_q.vitality_cost else coalesce(v_q.progression_vitality_cost,v_q.vitality_cost) end;
 v_duration:=case when v_kind='TUTORIAL' then v_q.duration_sec else coalesce(v_q.progression_duration_sec,v_q.duration_sec) end;
 select owned.character_id into v_character from public.user_characters owned where owned.user_id=v_uid and(owned.id::text=p_character_id or owned.character_id=p_character_id) order by(owned.id::text=p_character_id)desc limit 1;
 if v_character is null then raise exception 'character is not owned' using errcode='23503'; end if;
 perform 1 from public.users where id=v_uid for update;
 if v_kind='FIRST_CLEAR' and exists(select 1 from public.user_patrols where user_id=v_uid and coalesce(course_id,quest_id)=p_course_id and progression_kind='FIRST_CLEAR' and status in('ONGOING','CLAIMABLE')) then raise exception 'stage exploration already started' using errcode='23505';end if;
 select count(*) into v_active from public.user_patrols where user_id=v_uid and status in('ONGOING','CLAIMABLE') and not(progression_kind='FIRST_CLEAR' and expires_at<=now()); if v_active>=5 then raise exception 'all dispatch slots are occupied' using errcode='23514'; end if;
 if exists(select 1 from public.user_patrols where user_id=v_uid and character_id=v_character and status in('ONGOING','CLAIMABLE') and not(progression_kind='FIRST_CLEAR' and expires_at<=now())) then raise exception 'character is already dispatched' using errcode='23505'; end if;
 perform public.sync_and_recover_vitality_and_pvp_points(v_uid); select vitality into v_vitality from public.users where id=v_uid for update;
 if coalesce(v_vitality,0)<v_cost then raise exception 'insufficient vitality' using errcode='23514'; end if;
 insert into public.user_patrols(user_id,course_id,character_id,started_at,expires_at,status,has_battle_event,battle_resolved,progression_kind) values(v_uid,p_course_id,v_character,now(),now()+v_duration*interval '1 second','ONGOING',v_kind<>'REPEAT',false,v_kind) returning id into v_id;
 update public.users set vitality=vitality-v_cost,vitality_last_recovered_at=case when vitality>=50 then now() else vitality_last_recovered_at end where id=v_uid;
 return jsonb_build_object('status','success','base_cash_snapshot',(select base_cash_snapshot from public.user_patrols where id=v_id),'hometown_bonus_snapshot',(select hometown_bonus_snapshot from public.user_patrols where id=v_id),'patrol_id',v_id,'has_battle',v_kind<>'REPEAT','progression_kind',v_kind,'duration_seconds',v_duration,'cost_vitality',v_cost,'remaining_vitality',v_vitality-v_cost);
end $function$
;

REVOKE ALL ON FUNCTION public.start_patrol(p_course_id text, p_character_id text) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.start_patrol(p_course_id text, p_character_id text) TO authenticated;

GRANT EXECUTE ON FUNCTION public.start_patrol(p_course_id text, p_character_id text) TO service_role;

CREATE OR REPLACE FUNCTION public.start_patrol_pre_progression_v1(p_course_id text, p_character_id text)
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

REVOKE ALL ON FUNCTION public.start_patrol_pre_progression_v1(p_course_id text, p_character_id text) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.start_patrol_pre_progression_v1(p_course_id text, p_character_id text) TO service_role;

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
  v_recovered := floor(extract(epoch from (v_now - coalesce(v_user.pvp_points_last_recovered_at, v_now))) / 600);
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

REVOKE ALL ON FUNCTION public.start_pvp_battle(p_opponent_user_id uuid, p_character_ids text[], p_tactic text) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.start_pvp_battle(p_opponent_user_id uuid, p_character_ids text[], p_tactic text) TO authenticated;

GRANT EXECUTE ON FUNCTION public.start_pvp_battle(p_opponent_user_id uuid, p_character_ids text[], p_tactic text) TO service_role;

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
 if coalesce((select finalized_battles from public.raid_instance_user_progress where raid_boss_instance_id=v_instance.id and user_id=v_uid),0)>=3
 then raise exception 'room battle limit reached' using errcode='42501'; end if;
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

REVOKE ALL ON FUNCTION public.start_raid_room_battle_v1(p_room_id uuid, p_character_ids text[], p_tactic text, p_request_id uuid) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.start_raid_room_battle_v1(p_room_id uuid, p_character_ids text[], p_tactic text, p_request_id uuid) TO authenticated;

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
  v_pvp_steps:=greatest(0,floor(extract(epoch from(v_now-coalesce(v_pvp_at,v_now)))/600));
  v_pvp:=least(5,v_pvp+v_pvp_steps);
  if v_pvp_steps>0 then v_pvp_at:=case when v_pvp=5 then v_now else v_pvp_at+(v_pvp_steps*interval '600 seconds') end; end if;
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
  'pvp_next_recovery_at',case when v_pvp<5 then v_pvp_at+interval '600 seconds' else null end,
  'raid_next_recovery_at',case when v_raid<5 then v_raid_at+interval '7200 seconds' else null end);
end $function$
;

REVOKE ALL ON FUNCTION public.sync_and_recover_vitality_and_pvp_points(p_user_id uuid) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.sync_and_recover_vitality_and_pvp_points(p_user_id uuid) TO authenticated;

GRANT EXECUTE ON FUNCTION public.sync_and_recover_vitality_and_pvp_points(p_user_id uuid) TO service_role;

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
  perform public.refresh_quest_progression_missions(v_user_id);
  return jsonb_build_object('cycle_date',v_cycle_date,'rescued_count',v_rescued);
end;
$function$
;

REVOKE ALL ON FUNCTION public.sync_current_missions() FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.sync_current_missions() TO authenticated;

GRANT EXECUTE ON FUNCTION public.sync_current_missions() TO service_role;

CREATE OR REPLACE FUNCTION private.seed_quest_progression_guide()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if new.progression_version='2026-09-16' then
    insert into public.quest_progression_guides(user_id,step)
    values(new.user_id,case when new.migration_key='registration:2026-09-16' then 'QUEST_ENTRY' else 'PLAY' end)
    on conflict(user_id) do nothing;
  end if;
  return new;
end $function$
;

REVOKE ALL ON FUNCTION private.seed_quest_progression_guide() FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION private.activate_new_quest_progression()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if exists(select 1 from private.quest_progression_rollout_config where singleton and new_users_enabled) then
    insert into public.quest_progression_user_versions(user_id,progression_version,migration_key)
    values(new.id,'2026-09-16','registration:2026-09-16') on conflict do nothing;
  end if;
  return new;
end $function$
;

REVOKE ALL ON FUNCTION private.activate_new_quest_progression() FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION private.quest_first_defeat_guide()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if new.progression_kind='FIRST_CLEAR' and new.battle_result='DEFEAT'
    and exists(select 1 from public.quest_progression_user_versions where user_id=new.user_id and progression_version='2026-09-16') then
    update public.quest_progression_guides set step='GACHA',updated_at=now()
    where user_id=new.user_id and step in ('QUEST_ENTRY','PLAY');
  end if;
  return new;
end $function$
;

REVOKE ALL ON FUNCTION private.quest_first_defeat_guide() FROM PUBLIC, anon, authenticated, service_role;

DROP TRIGGER IF EXISTS capture_quest_raid_encounter_v1 ON public.user_patrols;

CREATE TRIGGER capture_quest_raid_encounter_v1 AFTER UPDATE OF status, exploration_reward_receipt ON public.user_patrols FOR EACH ROW EXECUTE FUNCTION capture_quest_raid_encounter_v1();

DROP TRIGGER IF EXISTS quest_first_defeat_guide ON public.user_patrols;

CREATE TRIGGER quest_first_defeat_guide AFTER UPDATE OF battle_result ON public.user_patrols FOR EACH ROW EXECUTE FUNCTION private.quest_first_defeat_guide();

DROP TRIGGER IF EXISTS quest_progression_hard_complete_v1 ON public.user_patrols;

CREATE TRIGGER quest_progression_hard_complete_v1 AFTER UPDATE OF status, battle_result ON public.user_patrols FOR EACH ROW EXECUTE FUNCTION capture_quest_progression_hard_complete_v1();

DROP TRIGGER IF EXISTS seed_quest_progression_guide ON public.quest_progression_user_versions;

CREATE TRIGGER seed_quest_progression_guide AFTER INSERT ON public.quest_progression_user_versions FOR EACH ROW EXECUTE FUNCTION private.seed_quest_progression_guide();

DROP TRIGGER IF EXISTS daily_pvp_leader_activity ON public.pvp_daily_wins;

CREATE TRIGGER daily_pvp_leader_activity AFTER INSERT OR UPDATE OF wins ON public.pvp_daily_wins FOR EACH ROW EXECUTE FUNCTION on_daily_pvp_leader_activity();

DROP TRIGGER IF EXISTS quest_progression_mission_clear ON public.user_quest_first_clears;

CREATE TRIGGER quest_progression_mission_clear AFTER INSERT ON public.user_quest_first_clears FOR EACH ROW EXECUTE FUNCTION quest_progression_mission_clear_trigger();

DROP TRIGGER IF EXISTS activate_new_quest_progression ON public.users;

CREATE TRIGGER activate_new_quest_progression AFTER INSERT ON public.users FOR EACH ROW EXECUTE FUNCTION private.activate_new_quest_progression();

ALTER TABLE public.quest_raid_encounters DROP CONSTRAINT quest_raid_encounters_difficulty_check; ALTER TABLE public.quest_raid_encounters ADD CONSTRAINT quest_raid_encounters_difficulty_check CHECK (difficulty IN ('beginner','intermediate','advanced','expert'));

ALTER TABLE public.social_activity_feed DROP CONSTRAINT social_activity_feed_activity_type_check; ALTER TABLE public.social_activity_feed ADD CONSTRAINT social_activity_feed_activity_type_check CHECK (activity_type IN ('SSR_CHARACTER','SSR_SKILL','SSR_EQUIPMENT','POWER_RANK_1','PVP_DAILY_RANK_1','GUILD_CREATED','RAID_HELP_REQUEST','RAID_BOSS_DEFEATED','SYSTEM_NEWS'));

NOTIFY pgrst, 'reload schema';