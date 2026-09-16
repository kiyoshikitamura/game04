SET check_function_bodies = false;
SET search_path = public, extensions, pg_catalog;
CREATE OR REPLACE FUNCTION public.on_post_tutorial_quest_complete()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if old.status='COMPLETED' or new.status<>'COMPLETED' then return new; end if;
  if not exists(select 1 from public.tutorial_progress where user_id=new.user_id
    and step_id in ('AUTHENTICATION','COMPLETE')) then return new; end if;
  perform public.record_post_tutorial_guide_milestone(new.user_id,'post_tutorial_quest',
    jsonb_build_object('source','quest_claim','patrolId',new.id));
  return new;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.acknowledge_initial_raid_guide()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_user_id uuid:=auth.uid(); v_legacy_enabled boolean; v_journey jsonb;
begin
  if v_user_id is null then raise exception 'authentication required' using errcode='42501'; end if;
  v_journey:=public.get_beginner_mission_journey();
  if (v_journey->>'reflow_completed')::boolean or (v_journey->>'raid_unavailable_ack')::boolean then return true; end if;
  if not ((v_journey->'facts') @> '{"free_skill":true,"free_equipment":true,"character":true,"quest":true,"pvp":true}') then
    raise exception 'activation prerequisites not met' using errcode='55000';
  end if;
  -- get_active_raidsと同じ公開対象。既存の開催チェックを保持する。
  select enabled into v_legacy_enabled from public.raid_legacy_settings where singleton for share;
  if v_legacy_enabled is true and exists(
    select 1 from public.raid_bosses boss
    join public.canonical_raid_boss_master master on master.boss_id=boss.boss_master_id
    where boss.status='ACTIVE' and boss.expires_at>clock_timestamp()
      and not exists(select 1 from public.raid_rooms r where r.raid_boss_instance_id=boss.id)
  ) then raise exception 'active raid requires participation' using errcode='55000'; end if;
  insert into public.user_funnel_milestones(user_id,milestone,metadata)
    values(v_user_id,'initial_raid_unavailable_ack',jsonb_build_object(
      'source','raid','destination','guild','reason','no_available_legacy_raid'))
    on conflict(user_id,milestone) do nothing;
  return true;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.get_current_mission_reward_state()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare u uuid:=auth.uid(); result jsonb;
begin
 if u is null then raise exception 'authentication required' using errcode='42501'; end if;
 select jsonb_build_object('owner',u,'cash',p.cash,'diamonds',p.diamonds,'level',p.level,'xp',p.xp,
   'items',coalesce((select jsonb_agg(to_jsonb(i)) from public.user_items i where i.user_id=u),'[]'::jsonb),
   'missions',coalesce((select jsonb_agg(jsonb_build_object('mission_id',m.mission_id,'status',m.status,
      'current_progress',m.current_progress,'expires_at',e.claim_deadline))
      from public.user_missions m join public.missions master on master.id=m.mission_id
      left join public.mission_events e on e.id=master.event_id where m.user_id=u),'[]'::jsonb)) into result
 from public.users p where p.id=u;
 if result is null then raise exception 'player missing' using errcode='42501'; end if;
 return result;
end $function$
;
CREATE OR REPLACE FUNCTION public.on_leader_hometown_base()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare town text;
begin
 if new.favorite_character_id is distinct from old.favorite_character_id then
   select public.quest_town_key(m.hometown) into town from public.canonical_character_master m
   where m.version='2026-08-21' and m.character_id=new.favorite_character_id;
   if town is not null then new.current_base_id:=town; end if;
 end if;
 return new;
end $function$
;
