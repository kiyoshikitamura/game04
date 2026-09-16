SET check_function_bodies = false;
SET search_path = public, extensions, pg_catalog;
CREATE OR REPLACE FUNCTION public.get_active_raids()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_legacy_enabled boolean;
begin if auth.uid() is null then raise exception 'authentication required' using errcode='42501'; end if;
 -- 設定行を先に共有lockし、管理者の停止UPDATEと開始/生成を直列化する。
 select enabled into v_legacy_enabled from public.raid_legacy_settings where singleton for share;
 if v_legacy_enabled is distinct from true then return '[]'::jsonb; end if;
 perform public.rotate_daily_raids();
 return coalesce((select jsonb_agg(jsonb_build_object('id',boss.id,'bossMasterId',master.boss_id,'bossName',master.display_name,'profileType',master.profile_type,'attribute',master.attribute,'level',master.reference_level,'currentHp',boss.current_hp,'maxHp',boss.max_hp,'baseId',boss.base_id,'spawnedAt',boss.spawned_at,'expiresAt',boss.expires_at,'status',boss.status,'skillLoadout',master.skill_loadout) order by boss.base_id) from public.raid_bosses boss join public.canonical_raid_boss_master master on master.boss_id=boss.boss_master_id where not exists(select 1 from public.raid_rooms r where r.raid_boss_instance_id=boss.id) and boss.status='ACTIVE' and boss.expires_at>clock_timestamp()),'[]'::jsonb);
end $function$
;
CREATE OR REPLACE FUNCTION public.grant_canonical_raid_reward(p_instance uuid, p_user uuid, p_type text, p_key text)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare row record; granted integer:=0;
begin
 if p_type in ('PERSONAL_RANK','GUILD_RANK') then return 0; end if;
 perform 1 from public.raid_bosses where id=p_instance for update;
 -- Room登録の正本は台帳。bossロック待機後の別SQLで確認する。
 if exists(select 1 from public.raid_rooms where raid_boss_instance_id=p_instance) then return 0; end if;
 for row in select * from public.canonical_raid_reward_master where version='2026-08-22' and reward_type=p_type and reward_key=p_key loop
 insert into public.raid_production_reward_grants values(p_instance,p_user,p_type,p_key,row.item_id,row.quantity,now()) on conflict do nothing;
 if found then insert into public.presents(user_id,item_id,quantity,message,status,expire_at) values(p_user,row.item_id,row.quantity,'レイド報酬','UNCLAIMED',now()+interval '30 days'); granted:=granted+1; end if;
 end loop; return granted; end $function$
;
CREATE OR REPLACE FUNCTION public.grant_canonical_ranking_season_reward(p_season_id uuid, p_category text, p_recipient_user_id uuid, p_ranked_entity_id uuid, p_rank_position integer)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_entry record;
  v_reward_id text;
  v_item_id text;
  v_quantity integer;
  v_reward_key text;
  v_granted integer := 0;
  v_message text;
  v_present_id uuid;
begin
  if p_category in ('RAID_PERSONAL','RAID_GUILD') then return 0; end if;
  if p_category not in ('PVP','RAID_PERSONAL','RAID_GUILD') then
    raise exception 'unsupported ranking reward category' using errcode='22023';
  end if;
  v_message := case p_category
    when 'PVP' then 'PvPシーズンランキング報酬'
    when 'RAID_PERSONAL' then 'レイド個人ランキング報酬'
    else 'レイドギルドランキング報酬'
  end;

  for v_entry in
    select entry.value,entry.ordinality
    from jsonb_array_elements(public.canonical_ranking_reward_payload()#>array['progression',p_category])
      with ordinality entry(value,ordinality)
    where p_rank_position between (entry.value->>0)::integer and (entry.value->>1)::integer
  loop
    v_reward_id := v_entry.value->>2;
    v_quantity := (v_entry.value->>3)::integer;
    v_reward_key := concat_ws(':',v_entry.value->>0,v_entry.value->>1,v_reward_id,v_entry.ordinality);
    v_item_id := public.resolve_canonical_reward_item(v_reward_id);

    insert into public.ranking_season_reward_grants(
      season_id,ranking_category,recipient_user_id,ranked_entity_id,rank_position,
      reward_key,master_reward_id,resolved_item_id,quantity
    ) values (
      p_season_id,p_category,p_recipient_user_id,p_ranked_entity_id,p_rank_position,
      v_reward_key,v_reward_id,v_item_id,v_quantity
    ) on conflict do nothing;

    if found then
      perform public._grant_gameplay_reward_v1(p_recipient_user_id,'RANKING_SEASON',p_season_id::text||':'||p_category||':'||v_reward_key,v_item_id,v_quantity);

      -- One notification per user and season. Personal and guild Raid rewards
      -- are therefore shown in the same Home dialog. A later genuinely new
      -- grant for the same season reopens an already acknowledged notification.
      insert into public.ranking_reward_notifications(
        recipient_user_id,period_kind,period_key,awarded_at,acknowledged_at
      ) values (
        p_recipient_user_id,'SEASON',p_season_id::text,clock_timestamp(),null
      ) on conflict(recipient_user_id,period_kind,period_key) do update set
        awarded_at=excluded.awarded_at,acknowledged_at=null;
      v_granted := v_granted + 1;
    end if;
  end loop;
  return v_granted;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.grant_raid_reward(p_instance_id uuid, p_user_id uuid, p_reward_id integer, p_reason text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_reward record;
begin
  if p_reason in ('RANK_PERSONAL','RANK_GUILD','PERSONAL_RANK','GUILD_RANK') or exists(select 1 from public.raid_rewards_master where id=p_reward_id and reward_type in ('RANK_PERSONAL','RANK_GUILD','PERSONAL_RANK','GUILD_RANK')) then return false; end if;
  perform 1 from public.raid_bosses where id=p_instance_id for update;
 -- Room登録の正本は台帳。bossロック待機後の別SQLで確認する。
 if exists(select 1 from public.raid_rooms where raid_boss_instance_id=p_instance_id) then return false; end if;
  insert into public.raid_reward_grants(raid_boss_instance_id,user_id,reward_id,reward_reason)
  values(p_instance_id,p_user_id,p_reward_id,p_reason) on conflict do nothing;
  if not found then return false; end if;
  select coalesce(reward_item_id,item_id) item_id, greatest(coalesce(reward_quantity,quantity,1),1) quantity
  into v_reward from public.raid_rewards_master where id=p_reward_id;
  insert into public.presents(user_id,item_id,quantity,message,status,expire_at)
  values(p_user_id,v_reward.item_id,v_reward.quantity,'レイド報酬','UNCLAIMED',now()+interval '30 days');
  return true;
end; $function$
;
CREATE OR REPLACE FUNCTION public.respawn_cleared_raid_slot(p_cleared_instance_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_legacy_enabled boolean; v_old public.raid_bosses%rowtype; v_new uuid;
begin
 -- 設定行を先に共有lockし、管理者の停止UPDATEと開始/生成を直列化する。
 select enabled into v_legacy_enabled from public.raid_legacy_settings where singleton for share;
 if v_legacy_enabled is distinct from true then return null; end if;

 perform pg_advisory_xact_lock(hashtextextended(p_cleared_instance_id::text||':respawn',0));
 select * into v_old from public.raid_bosses where id=p_cleared_instance_id and status='CLEARED' and respawn_after<=now() for update;
 if not found then return null; end if;
 -- Room登録の正本は台帳。bossロック待機後の別SQLで確認する。
 if exists(select 1 from public.raid_rooms where raid_boss_instance_id=p_cleared_instance_id) then return null; end if;

 if exists(select 1 from public.raid_bosses where raid_day_key=v_old.raid_day_key and base_id=v_old.base_id and status='ACTIVE' and not exists(select 1 from public.raid_rooms r where r.raid_boss_instance_id=public.raid_bosses.id)) then return null; end if;
 insert into public.raid_bosses(boss_id,boss_master_id,current_hp,max_hp,base_id,status,spawned_at,expires_at,cycle_id,rotation_date,raid_variant_id,raid_day_key)
 values(v_old.boss_id,v_old.boss_master_id,v_old.max_hp,v_old.max_hp,v_old.base_id,'ACTIVE',now(),v_old.expires_at,gen_random_uuid(),v_old.rotation_date,v_old.raid_variant_id,v_old.raid_day_key) returning id into v_new;
 return v_new;
end $function$
;
CREATE OR REPLACE FUNCTION public.rotate_daily_raids()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_legacy_enabled boolean; v_today date:=(clock_timestamp() at time zone 'Asia/Tokyo')::date; v_pair text[]; v_area text; v_variant public.canonical_raid_variants%rowtype; v_start timestamptz; v_end timestamptz; v_cleared record;
begin
 -- 設定行を先に共有lockし、管理者の停止UPDATEと開始/生成を直列化する。
 select enabled into v_legacy_enabled from public.raid_legacy_settings where singleton for share;
 if v_legacy_enabled is distinct from true then return; end if;

 perform pg_advisory_xact_lock(hashtextextended('CANONICAL_RAID_ROTATION:'||v_today::text,0));
 for v_cleared in select id from public.raid_bosses where not exists(select 1 from public.raid_rooms r where r.raid_boss_instance_id=public.raid_bosses.id) and status='ACTIVE' and (current_hp=0 or expires_at<=now()) for update loop perform public.finalize_expired_raid_instance(v_cleared.id); end loop;
 for v_cleared in select id from public.raid_bosses where not exists(select 1 from public.raid_rooms r where r.raid_boss_instance_id=public.raid_bosses.id) and status='CLEARED' and raid_day_key=v_today::text and respawn_after<=now() for update loop perform public.respawn_cleared_raid_slot(v_cleared.id); end loop;
 v_pair:=public.canonical_raid_rotation_pair(v_today); v_start:=(v_today::timestamp at time zone 'Asia/Tokyo'); v_end:=v_start+interval '24 hours';
 foreach v_area in array v_pair loop
  if not exists(select 1 from public.raid_bosses where not exists(select 1 from public.raid_rooms r where r.raid_boss_instance_id=public.raid_bosses.id) and raid_day_key=v_today::text and base_id=v_area and status='ACTIVE') and not exists(select 1 from public.raid_bosses where not exists(select 1 from public.raid_rooms r where r.raid_boss_instance_id=public.raid_bosses.id) and raid_day_key=v_today::text and base_id=v_area and status='CLEARED' and respawn_after>now()) then
   select * into v_variant from public.canonical_raid_variants where area_id=upper(v_area) and is_production_enabled order by raid_variant_id limit 1;
   insert into public.raid_bosses(boss_id,boss_master_id,current_hp,max_hp,base_id,status,spawned_at,expires_at,cycle_id,rotation_date,raid_variant_id,raid_day_key) values(v_variant.raid_variant_id,v_variant.raid_variant_id,v_variant.max_hp,v_variant.max_hp,v_area,'ACTIVE',greatest(now(),v_start),v_end,gen_random_uuid(),v_today,v_variant.raid_variant_id,v_today::text);
  end if;
 end loop;
end $function$
;
CREATE OR REPLACE FUNCTION public.list_raid_room_boss_choices_v1()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
declare v_daily jsonb;
begin
 if auth.uid() is null then raise exception 'authentication required' using errcode='42501'; end if;
 v_daily := private.raid_daily_targets_v1();
 return jsonb_build_object('choices',coalesce((select jsonb_agg(
  jsonb_build_object('raidVariantId',v.raid_variant_id,'name',v.raid_name) order by v.raid_variant_id)
  from public.canonical_raid_variants v where v.is_production_enabled and exists (
   select 1 from jsonb_array_elements(v_daily->'targets') t where t->>'variantId'=v.raid_variant_id
  )),'[]'::jsonb));
end $function$
;
CREATE OR REPLACE FUNCTION public.cancel_raid_room_battle_request_v1(p_request_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
declare v_uid uuid:=auth.uid();v_receipt jsonb;
begin
 if v_uid is null then raise exception 'authentication required' using errcode='42501';end if;
 if current_setting('transaction_isolation')<>'read committed' then raise exception 'read committed required' using errcode='25001';end if;
 if p_request_id is null then raise exception 'request id required' using errcode='22023';end if;
 perform 1 from public.users where id=v_uid for no key update;
 if not found then raise exception 'user unavailable' using errcode='42501';end if;
 v_receipt:=public.get_raid_room_battle_start_receipt_v1(p_request_id);
 if v_receipt is not null then return jsonb_build_object('status','started','receipt',v_receipt);end if;
 insert into public.raid_room_battle_request_cancellations(user_id,request_id)
 values(v_uid,p_request_id) on conflict(user_id,request_id) do nothing;
 return jsonb_build_object('status','cancelled');
end $function$
;
CREATE OR REPLACE FUNCTION public.request_raid_room_rescue_v1(p_room_id uuid, p_request_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
declare v_uid uuid:=auth.uid();v_room public.raid_rooms%rowtype;v_boss public.raid_bosses%rowtype;
 v_saved public.raid_room_rescue_requests%rowtype;v_name text;v_avatar text;v_guild_id uuid;
 v_activity integer;v_guild integer;v_enabled boolean;v_id uuid;v_publications jsonb:='[]';v_result jsonb;
begin
 if v_uid is null then raise exception 'authentication required' using errcode='42501';end if;
 if p_room_id is null or p_request_id is null then raise exception 'invalid rescue input' using errcode='22023';end if;
 if current_setting('transaction_isolation')<>'read committed' then raise exception 'read committed required' using errcode='25001';end if;
 -- 設定→user→boss→Room: 開始/参加と同じ順序。設定の切替とも直列化する。
 select enabled into v_enabled from public.raid_room_rescue_settings where singleton for share;
 select username,avatar_url into v_name,v_avatar from public.users where id=v_uid for no key update;
 if not found or v_name is null then raise exception 'user unavailable' using errcode='42501';end if;
 select * into v_saved from public.raid_room_rescue_requests where user_id=v_uid and request_id=p_request_id;
 if found then
  if v_saved.room_id<>p_room_id then raise exception 'request payload mismatch' using errcode='22023';end if;
  return v_saved.response;
 end if;
 if v_enabled is distinct from true then raise exception 'rescue disabled' using errcode='42501';end if;
 select * into v_room from public.raid_rooms where id=p_room_id;
 if not found then raise exception 'room unavailable' using errcode='P0002';end if;
 if v_room.owner_user_id<>v_uid then raise exception 'room owner required' using errcode='42501';end if;
 select * into v_boss from public.raid_bosses where id=v_room.raid_boss_instance_id for update;
 perform 1 from public.raid_rooms where id=p_room_id for update;
 if v_boss.status is distinct from 'ACTIVE' or v_boss.current_hp is null or v_boss.current_hp<=0 or v_boss.expires_at is null or v_boss.expires_at<=clock_timestamp() or v_boss.outcome_finalized_at is not null then raise exception 'room inactive' using errcode='22023';end if;
 select guild_id into v_guild_id from public.guild_members where user_id=v_uid for share;
 select count(*) filter(where channel='ACTIVITY'),count(*) filter(where channel='GUILD') into v_activity,v_guild from public.raid_room_rescue_publications where room_id=p_room_id;
 if v_activity>=3 and (v_guild_id is null or v_guild>=3) then raise exception 'rescue publication limit' using errcode='22023';end if;
 if v_activity<3 then
  v_activity:=v_activity+1;
  insert into public.raid_room_rescue_publications(room_id,requester_user_id,request_id,channel,ordinal)
   values(p_room_id,v_uid,p_request_id,'ACTIVITY',v_activity) returning id into v_id;
  insert into public.social_activity_feed(activity_type,actor_user_id,actor_display_name,display_payload)
   values('RAID_HELP_REQUEST',v_uid,v_name,jsonb_build_object('roomId',p_room_id,'rescueId',v_id));
  v_publications:=v_publications||jsonb_build_array(jsonb_build_object('rescueId',v_id,'channel','ACTIVITY','guildId',null));
 end if;
 if v_guild_id is not null and v_guild<3 then
  v_guild:=v_guild+1;
  insert into public.raid_room_rescue_publications(room_id,requester_user_id,request_id,channel,guild_id,ordinal)
   values(p_room_id,v_uid,p_request_id,'GUILD',v_guild_id,v_guild) returning id into v_id;
  -- システム投稿: 発言報酬/mission/KPI/human responseとchatters集計へ混入させない。
  insert into public.board_posts(title,content,author_id,user_id,author_name,author_avatar_url,target_type,target_id,is_system,raid_rescue_id)
   values('','レイドの救援をお願いします。',v_uid,null,v_name,v_avatar,'GUILD',v_guild_id,true,v_id);
  v_publications:=v_publications||jsonb_build_array(jsonb_build_object('rescueId',v_id,'channel','GUILD','guildId',v_guild_id));
 end if;
 v_result:=jsonb_build_object('roomId',p_room_id,'requestId',p_request_id,'publications',v_publications,'activityCount',v_activity,'guildCount',v_guild,'maxPerChannel',3);
 insert into public.raid_room_rescue_requests values(v_uid,p_request_id,p_room_id,v_result);
 return v_result;
end $function$
;
CREATE OR REPLACE FUNCTION public.join_raid_room_rescue_v1(p_rescue_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
declare v_uid uuid:=auth.uid();v_ref jsonb;v_room uuid;v_result jsonb;v_via boolean;v_enabled boolean;
begin
 if v_uid is null then raise exception 'authentication required' using errcode='42501';end if;
 if current_setting('transaction_isolation')<>'read committed' then raise exception 'read committed required' using errcode='25001';end if;
 select enabled into v_enabled from public.raid_room_rescue_settings where singleton for share;
 if v_enabled is distinct from true then raise exception 'rescue disabled' using errcode='42501';end if;
 perform 1 from public.users where id=v_uid for no key update;
 if not found then raise exception 'user unavailable' using errcode='42501';end if;
 v_ref:=public.get_raid_room_rescue_v1(p_rescue_id);v_room:=(v_ref->>'roomId')::uuid;
 -- 通常登録と同じuserロック下で加入。既存通常参加を救援へ昇格させない。
 v_result:=public.register_raid_room_v1(v_room);
 if v_result->>'membershipStatus'='joined' and not exists(select 1 from public.raid_rooms where id=v_room and owner_user_id=v_uid) then
  insert into public.raid_room_rescue_members(room_id,user_id,rescue_id,joined_at)
   select room_id,user_id,p_rescue_id,joined_at from public.raid_room_members where room_id=v_room and user_id=v_uid;
 end if;
 select exists(select 1 from public.raid_room_rescue_members where room_id=v_room and user_id=v_uid) into v_via;
 return v_result||jsonb_build_object('viaRescue',v_via);
end $function$
;
CREATE OR REPLACE FUNCTION public.get_my_raid_contribution_v1(p_instance_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_uid uuid:=auth.uid(); v_day text; v_room boolean; v_contribution bigint;
begin
 if v_uid is null then raise exception 'authentication required' using errcode='42501'; end if;
 select raid_day_key into v_day from public.raid_bosses where id=p_instance_id;
 if not found then raise exception 'Raid not found' using errcode='P0002'; end if;
 select exists(select 1 from public.raid_rooms where raid_boss_instance_id=p_instance_id) into v_room;
 select coalesce(sum(log.raw_damage),0) into v_contribution
 from public.raid_damage_logs log join public.raid_bosses boss on boss.id=log.raid_boss_instance_id
 where log.user_id=v_uid and ((v_room and boss.id=p_instance_id) or (not v_room and boss.raid_day_key=v_day));
 return jsonb_build_object('contribution',v_contribution);
end $function$
;
CREATE OR REPLACE FUNCTION public.on_raid_room_clear_reward_finalized_v1()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
declare v_room uuid;
begin
 if old.finalization_status='FINALIZED' or new.finalization_status<>'FINALIZED'
  or new.battle_mode<>'RAID' or new.resolution_authority<>'RAID_SERVER' then return new;end if;
 select id into v_room from public.raid_rooms where raid_boss_instance_id=new.source_reference_id;
 if found then perform public._issue_raid_room_clear_rewards_v1(v_room);end if;
 return new;
end $function$
;
CREATE OR REPLACE FUNCTION public.get_raid_room_clear_reward_v1(p_room_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
declare v_uid uuid:=auth.uid();v_room public.raid_rooms%rowtype;v_saved public.raid_room_clear_rewards%rowtype;
 v_progress jsonb;v_items jsonb:='[]';v_status text;
begin
 if v_uid is null then raise exception 'authentication required' using errcode='42501';end if;
 select * into v_room from public.raid_rooms where id=p_room_id;
 if not found then raise exception 'room unavailable' using errcode='P0002';end if;
 select * into v_saved from public.raid_room_clear_rewards where room_id=p_room_id and user_id=v_uid;
 if found then
  v_status:='issued';v_progress:=jsonb_build_object('clearGate',v_saved.clear_gate);
  select coalesce(jsonb_agg(jsonb_build_object('itemId',g.item_id,'quantity',g.quantity,
   'presentId',g.present_id,'delivery',case when g.direct_delivery_id is not null then 'DIRECT' else 'PRESENT' end,'presentStatus',p.status,'claimedAt',coalesce(d.delivered_at,p.claimed_at),'expiresAt',p.expire_at) order by g.item_id),'[]') into v_items
  from public.raid_room_clear_reward_grants g left join public.presents p on p.id=g.present_id and p.user_id=g.user_id left join public.gameplay_reward_delivery_ledger d on d.id=g.direct_delivery_id and d.user_id=g.user_id
  where g.room_id=p_room_id and g.user_id=v_uid;
 else
  v_progress:=public._raid_room_clear_reward_progress_v1(p_room_id,v_uid);
  if v_progress->'clearGate'->>'status'='unknown' or not exists(
   select 1 from public.raid_room_clear_reward_rules r where r.difficulty=v_room.difficulty_id and r.enabled
    and exists(select 1 from public.raid_room_clear_reward_items i where i.difficulty=r.difficulty)) then v_status:='unconfigured';
  elsif v_progress->'clearGate'->>'status'='succeeded' then v_status:='pending';
  else v_status:='not_eligible';end if;
 end if;
 return jsonb_build_object('roomId',p_room_id,'status',v_status,'clearGate',v_progress->'clearGate',
  'issuedAt',v_saved.issued_at,'expiresAt',case when exists(select 1 from public.raid_room_clear_reward_grants where room_id=p_room_id and user_id=v_uid and present_id is not null) then v_saved.expires_at else null end,'items',v_items,
 'dailyBonus',(select jsonb_build_object('dayKey',d.raid_day_key,'won',d.won,'items',d.items,'sourceRoomId',d.source_room_id,'issuedAt',d.issued_at) from public.raid_daily_clear_bonus_ledger d where d.source_room_id=p_room_id and d.user_id=v_uid));
end $function$
;
CREATE OR REPLACE FUNCTION private.raid_daily_targets_v1()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
declare
 v_day date;
 v_saved private.raid_daily_targets%rowtype;
 v_variants text[];
 v_areas text[];
 v_count integer;
begin
 if auth.uid() is null then raise exception 'authentication required' using errcode='42501'; end if;
 if current_setting('transaction_isolation') <> 'read committed' then
  raise exception 'read committed required' using errcode='25001';
 end if;
 loop
  v_day := (clock_timestamp() at time zone 'Asia/Tokyo')::date;
  select * into v_saved from private.raid_daily_targets where date_jst=v_day;
  if found then exit; end if;
  -- Two-key namespace is dedicated to this authority. Serialize first initialization per JST day.
  perform pg_advisory_xact_lock(726402, v_day-date '2000-01-01');
  -- Waiting across midnight must initialize the new day, never return yesterday as today.
  if v_day <> (clock_timestamp() at time zone 'Asia/Tokyo')::date then continue; end if;
  select * into v_saved from private.raid_daily_targets where date_jst=v_day;
  if found then exit; end if;
  select count(distinct area_id) into v_count from public.canonical_raid_variants
   where is_production_enabled and area_id in ('SHINJUKU','SHIBUYA','IKEBUKURO','ROPPONGI','AKIHABARA','KAWASAKI','YOKOHAMA');
  if v_count <> 7 then raise exception 'daily raid master unavailable' using errcode='55000'; end if;
  -- Uniform area selection without replacement; a canonical variant is frozen for each selected area.
  select array_agg(raid_variant_id order by area_id),array_agg(area_id order by area_id)
   into v_variants,v_areas from (
    select area_id,min(raid_variant_id) raid_variant_id from public.canonical_raid_variants
    where is_production_enabled and area_id in ('SHINJUKU','SHIBUYA','IKEBUKURO','ROPPONGI','AKIHABARA','KAWASAKI','YOKOHAMA')
    group by area_id order by random() limit 2
   ) picked;
  if cardinality(v_variants) <> 2 then raise exception 'daily raid master unavailable' using errcode='55000'; end if;
  insert into private.raid_daily_targets(date_jst,first_variant_id,second_variant_id,first_area_id,second_area_id)
   values(v_day,v_variants[1],v_variants[2],v_areas[1],v_areas[2]) returning * into v_saved;
  exit;
 end loop;
 return jsonb_build_object('dateJst',v_saved.date_jst::text,'targets',jsonb_build_array(
  jsonb_build_object('variantId',v_saved.first_variant_id),jsonb_build_object('variantId',v_saved.second_variant_id)));
end $function$
;
CREATE OR REPLACE FUNCTION private.raid_top_snapshot_v1()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
declare
  v_uid uuid := auth.uid();
  v_now timestamptz := statement_timestamp();
  v_daily jsonb;
  v_result jsonb;
begin
  if v_uid is null or not exists(select 1 from public.users where id = v_uid) then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  -- 日次の遅延確定以外に書込を発生させない。失敗は例外のまま返す。
  v_daily := private.raid_daily_targets_v1();
  -- 日次ロック待機中の期限到達も反映する。
  v_now := clock_timestamp();
  with
  participating_page as materialized (
    select r.id, r.created_at
    from public.raid_rooms r
    join public.raid_bosses b on b.id = r.raid_boss_instance_id
    where b.status = 'ACTIVE' and b.current_hp > 0 and b.expires_at > v_now
      and b.outcome_finalized_at is null
      and (r.owner_user_id = v_uid or exists (
        select 1 from public.raid_room_members m where m.room_id = r.id and m.user_id = v_uid
      ))
    order by r.created_at desc, r.id desc limit 20
  ),
  visible_rescues as (
    select p.*, row_number() over (
      partition by p.room_id order by p.created_at desc, p.id desc
    ) as publication_number
    from public.raid_room_rescue_publications p
    join public.raid_rooms r on r.id = p.room_id
    join public.raid_bosses b on b.id = r.raid_boss_instance_id
    where b.status = 'ACTIVE' and b.current_hp > 0 and b.expires_at > v_now
      and b.outcome_finalized_at is null
      -- get_raid_room_rescue_v1 と同じ現在所属判定。移籍前Guildを認めない。
      and (p.channel = 'ACTIVITY' or (p.channel = 'GUILD' and exists (
        select 1 from public.guild_members gm
        where gm.user_id = v_uid and gm.guild_id = p.guild_id
      )))
  ),
  rescue_page as materialized (
    select * from visible_rescues where publication_number = 1
    order by created_at desc, id desc limit 20
  ),
  selected_ids as materialized (
    select id from participating_page union select room_id from rescue_page
  ),
  selected_rooms as materialized (
    select r.*, b.raid_variant_id, b.max_hp, b.current_hp, b.expires_at, b.outcome_finalized_at
    from selected_ids s join public.raid_rooms r on r.id = s.id
    join public.raid_bosses b on b.id = r.raid_boss_instance_id
  ),
  registered as materialized (
    -- 登録参加人数。オンライン数や戦績ログ件数ではない。主催者を重複排除する。
    select r.id as room_id, r.owner_user_id as user_id from selected_rooms r
    union
    select m.room_id, m.user_id from public.raid_room_members m
    join selected_ids s on s.id = m.room_id
  ),
  member_numbers as materialized (
    select m.*, count(*) over(partition by m.room_id) as registered_count,
      row_number() over(partition by m.room_id order by (m.user_id = r.owner_user_id) desc, m.user_id) as face_number
    from registered m join selected_rooms r on r.id = m.room_id
  ),
  profile_ids as materialized (
    select owner_user_id as user_id from selected_rooms
    union select user_id from member_numbers where face_number <= 5
  ),
  profiles as materialized (
    select u.id, jsonb_build_object(
      'userId', u.id, 'name', u.username,
      'leaderIconUrl', jsonb_build_object('status', 'unknown'),
      -- 画像URLはクライアントの現行キャラクターマスターで解決する。
      -- avatar_urlは任意プロフィール画像であり、リーダーの代用にしない。
      'leaderCharacterId', jsonb_build_object('status', 'available', 'value', u.favorite_character_id)
    ) as dto
    from profile_ids p join public.users u on u.id = p.user_id
  ),
  member_summaries as (
    select m.room_id, max(m.registered_count) as registered_count,
      jsonb_agg(p.dto order by m.face_number) filter(where m.face_number <= 5) as faces
    from member_numbers m join profiles p on p.id = m.user_id
    where m.face_number <= 5
    group by m.room_id
  ),
  projected as materialized (
    select r.id, jsonb_build_object(
      'room', jsonb_build_object(
        'roomId', r.id, 'difficultyId', r.difficulty_id,
        'owner', jsonb_build_object('status', 'available', 'value', owner.dto),
        'state', jsonb_build_object('status', 'available', 'value', 'active'),
        'createdAt', jsonb_build_object('status', 'available', 'value', r.created_at),
        'expiresAt', jsonb_build_object('status', 'available', 'value', r.expires_at),
        'endedAt', jsonb_build_object('status', 'available', 'value', r.outcome_finalized_at),
        'hp', case when r.max_hp is not null and r.current_hp is not null then
          jsonb_build_object('status', 'available', 'value', jsonb_build_object('current', r.current_hp, 'max', r.max_hp))
          else jsonb_build_object('status', 'unknown') end,
        'participantCount', jsonb_build_object('status', 'available', 'value', members.registered_count),
        'serverEligibility', jsonb_build_object('status', 'unknown')
      ),
      'enemy', case when r.raid_variant_id is null then jsonb_build_object('status', 'unknown')
        else jsonb_build_object('status', 'available', 'value', jsonb_build_object('variantId', r.raid_variant_id)) end,
      'ownerGuild', case when gm.guild_id is not null and g.id is null then jsonb_build_object('status', 'unknown')
        else jsonb_build_object('status', 'available', 'value', case when g.id is null then null
          else jsonb_build_object('guildId', g.id, 'name', g.name) end) end,
      'participants', jsonb_build_object('status', 'available', 'value', coalesce(members.faces, '[]'::jsonb)),
      'membership', jsonb_build_object('status', 'available', 'value', case
        when r.owner_user_id = v_uid then 'owner'
        when rescue_member.user_id is not null then 'rescue'
        when my_member.user_id is not null then 'member'
        else 'not_joined' end),
      'rescue', jsonb_build_object('status', 'unknown')
    ) as dto
    from selected_rooms r
    join profiles owner on owner.id = r.owner_user_id
    join member_summaries members on members.room_id = r.id
    left join public.guild_members gm on gm.user_id = r.owner_user_id
    left join public.guilds g on g.id = gm.guild_id
    left join public.raid_room_members my_member on my_member.room_id = r.id and my_member.user_id = v_uid
    left join public.raid_room_rescue_members rescue_member on rescue_member.room_id = r.id and rescue_member.user_id = v_uid
  )
  select jsonb_build_object(
    'participating', jsonb_build_object('status', 'ready', 'data', coalesce((
      select jsonb_agg(p.dto order by page.created_at desc, page.id desc)
      from participating_page page join projected p on p.id = page.id
    ), '[]'::jsonb)),
    'rescues', jsonb_build_object('status', 'ready', 'data', coalesce((
      select jsonb_agg(p.dto || jsonb_build_object('rescue', jsonb_build_object('status', 'available', 'value',
        jsonb_build_object('rescueId', page.id,
          'source', case page.channel when 'ACTIVITY' then 'activity' else 'guild_chat' end,
          'scope', page.channel, 'guildId', page.guild_id)
      )) order by page.created_at desc, page.id desc)
      from rescue_page page join projected p on p.id = page.room_id
    ), '[]'::jsonb)),
    'dailyTargets', jsonb_build_object('status', 'ready', 'data', v_daily)
  ) into v_result;
  return v_result;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.get_raid_top_v1()
 RETURNS jsonb
 LANGUAGE sql
 SET search_path TO 'pg_catalog'
AS $function$ select private.raid_top_snapshot_v1() $function$
;
CREATE OR REPLACE FUNCTION private.raid_room_display_v1(p_room_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
declare
 v_uid uuid:=auth.uid(); v_room public.raid_rooms%rowtype;
 v_joined boolean; v_member text; v_leaders jsonb; v_guild jsonb;
 v_clear jsonb; v_rescue jsonb;
begin
 if v_uid is null or not exists(select 1 from public.users where id=v_uid) then
  raise exception 'authentication required' using errcode='42501'; end if;
 select * into v_room from public.raid_rooms where id=p_room_id;
 if not found or not public.raid_room_can_read_v1(p_room_id) then
  raise exception 'room unavailable' using errcode='P0002'; end if;
 v_joined:=v_room.owner_user_id=v_uid or exists(select 1 from public.raid_room_members where room_id=p_room_id and user_id=v_uid)
  or exists(select 1 from public.raid_instance_user_progress where raid_boss_instance_id=v_room.raid_boss_instance_id and user_id=v_uid and finalized_battles>0);
 v_member:=case when v_room.owner_user_id=v_uid then 'owner'
  when exists(select 1 from public.raid_room_rescue_members where room_id=p_room_id and user_id=v_uid) then 'rescue'
  when v_joined then 'member' else 'not_joined' end;
 -- Same participant privacy as SQL255. An outsider receives the public owner only.
 with members as (
  select v_room.owner_user_id as user_id
  union select user_id from public.raid_room_members where room_id=p_room_id and v_joined
  union select user_id from public.raid_instance_user_progress where raid_boss_instance_id=v_room.raid_boss_instance_id and finalized_battles>0 and v_joined
 ), page as (select user_id from members order by user_id limit 20), ids as (
  select user_id from page union select v_room.owner_user_id
 ) select coalesce(jsonb_object_agg(u.id::text,u.favorite_character_id),'{}'::jsonb) into v_leaders
 from ids join public.users u on u.id=ids.user_id;
 select case when m.guild_id is not null and g.id is null then jsonb_build_object('status','unknown')
  else jsonb_build_object('status','available','value',case when g.id is null then null
   else jsonb_build_object('guildId',g.id,'name',g.name) end) end into v_guild
 from (select v_room.owner_user_id as id) owner
 left join public.guild_members m on m.user_id=owner.id left join public.guilds g on g.id=m.guild_id;
 -- Plans are read from current configuration, never copied into the issued Present collection.
 select jsonb_build_object('status',case when r.enabled and count(i.item_id)>0 then 'configured' else 'unconfigured' end,
  'items',case when r.enabled then coalesce(jsonb_agg(jsonb_build_object('itemId',i.item_id,'quantity',i.quantity) order by i.item_id) filter(where i.item_id is not null),'[]'::jsonb) else '[]'::jsonb end)
 into v_clear from public.raid_room_clear_reward_rules r left join public.raid_room_clear_reward_items i on i.difficulty=r.difficulty
 where r.difficulty=v_room.difficulty_id group by r.enabled;
 select jsonb_build_object('status',case when r.enabled and count(i.item_id)>0 then 'configured' else 'unconfigured' end,
  'items',case when r.enabled then coalesce(jsonb_agg(jsonb_build_object('itemId',i.item_id,'quantity',i.quantity) order by i.item_id) filter(where i.item_id is not null),'[]'::jsonb) else '[]'::jsonb end)
 into v_rescue from public.raid_room_rescue_reward_rules r left join public.raid_room_rescue_reward_items i on i.difficulty=r.difficulty
 where r.difficulty=v_room.difficulty_id group by r.enabled;
 return jsonb_build_object('roomId',p_room_id,'ownerGuild',v_guild,'leaderCharacterIds',v_leaders,'membership',v_member,
  'clearPlan',coalesce(v_clear,'{"status":"unconfigured","items":[]}'::jsonb),
  'rescuePlan',coalesce(v_rescue,'{"status":"unconfigured","items":[]}'::jsonb));
end $function$
;
CREATE OR REPLACE FUNCTION public.get_raid_room_display_v1(p_room_id uuid)
 RETURNS jsonb
 LANGUAGE sql
 STABLE
 SET search_path TO 'pg_catalog'
AS $function$select private.raid_room_display_v1(p_room_id)$function$
;
CREATE OR REPLACE FUNCTION private.raid_page_entry_v1(p_room_id uuid, p_rescue_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
 select jsonb_build_object(
  'room',jsonb_set(public.raid_room_projection_v1(r.id),'{owner,value,leaderCharacterId}',jsonb_build_object('status','available','value',u.favorite_character_id)),
  'enemy',case when b.raid_variant_id is null then jsonb_build_object('status','unknown') else jsonb_build_object('status','available','value',jsonb_build_object('variantId',b.raid_variant_id)) end,
  'ownerGuild',case when gm.guild_id is not null and g.id is null then jsonb_build_object('status','unknown') else jsonb_build_object('status','available','value',case when g.id is null then null else jsonb_build_object('guildId',g.id,'name',g.name) end) end,
  'participants',jsonb_build_object('status','unknown'),
  'membership',jsonb_build_object('status','available','value',case when r.owner_user_id=auth.uid() then 'owner'
   when exists(select 1 from public.raid_room_rescue_members where room_id=r.id and user_id=auth.uid()) then 'rescue'
   when exists(select 1 from public.raid_room_members where room_id=r.id and user_id=auth.uid()) then 'member' else 'not_joined' end),
  'rescue',case when p.id is null then jsonb_build_object('status','unknown') else jsonb_build_object('status','available','value',jsonb_build_object('rescueId',p.id,'source',case when p.channel='GUILD' then 'guild_chat' else 'activity' end,'scope',p.channel,'guildId',p.guild_id)) end)
 from public.raid_rooms r join public.raid_bosses b on b.id=r.raid_boss_instance_id
 join public.users u on u.id=r.owner_user_id left join public.guild_members gm on gm.user_id=u.id left join public.guilds g on g.id=gm.guild_id
 left join public.raid_room_rescue_publications p on p.id=p_rescue_id and p.room_id=r.id where r.id=p_room_id
$function$
;
CREATE OR REPLACE FUNCTION public.on_post_tutorial_manual_loadout()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if new.equipped_character_id is not distinct from old.equipped_character_id
    or nullif(new.equipped_character_id,'') is null then return new; end if;
  if not exists(select 1 from public.tutorial_progress where user_id=new.user_id
    and step_id in ('AUTHENTICATION','COMPLETE')) then return new; end if;
  if exists(select 1 from public.user_skills where user_id=new.user_id and nullif(equipped_character_id,'') is not null)
    and exists(select 1 from public.user_equipments where user_id=new.user_id and nullif(equipped_character_id,'') is not null) then
    perform public.record_post_tutorial_guide_milestone(new.user_id,'first_main_loadout',
      jsonb_build_object('source','post_tutorial_equip','table',tg_table_name));
  end if;
  return new;
end;
$function$
;
CREATE OR REPLACE FUNCTION private.raid_browse_page_v1(p_difficulty_id text, p_offset integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
declare v_rows jsonb; v_count integer;
begin
 if auth.uid() is null or not exists(select 1 from public.users where id=auth.uid()) then raise exception 'authentication required' using errcode='42501'; end if;
 if p_difficulty_id is null or p_difficulty_id not in ('beginner','intermediate','advanced','expert') or p_offset is null or p_offset<0 or p_offset>1000000 then raise exception 'invalid page' using errcode='22023'; end if;
 with page as (select r.id,r.created_at from public.raid_rooms r join public.raid_bosses b on b.id=r.raid_boss_instance_id
  where r.difficulty_id=p_difficulty_id and b.status='ACTIVE' and b.current_hp>0 and b.expires_at>statement_timestamp() and b.outcome_finalized_at is null
   and public.raid_room_can_read_v1(r.id) order by r.created_at desc,r.id limit 21 offset p_offset),
 numbered as(select *,row_number() over(order by created_at desc,id) n from page)
 select coalesce(jsonb_agg(private.raid_page_entry_v1(id) order by created_at desc,id) filter(where n<=20),'[]'::jsonb),count(*) into v_rows,v_count from numbered;
 return jsonb_build_object('entries',v_rows,'nextOffset',case when v_count>20 then p_offset+20 else null end);
end $function$
;
CREATE OR REPLACE FUNCTION private.raid_rescue_cards_v1(p_rescue_ids uuid[])
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
declare v_rows jsonb;
begin
 if auth.uid() is null or not exists(select 1 from public.users where id=auth.uid()) then raise exception 'authentication required' using errcode='42501'; end if;
 if p_rescue_ids is null or cardinality(p_rescue_ids)>50 then raise exception 'invalid page' using errcode='22023'; end if;
 -- Ended raids remain visible on already-published links; current Guild membership still gates visibility.
 select coalesce(jsonb_agg(private.raid_page_entry_v1(p.room_id,p.id) order by p.id),'[]'::jsonb) into v_rows
 from public.raid_room_rescue_publications p where p.id=any(p_rescue_ids)
  and (p.channel='ACTIVITY' or (p.channel='GUILD' and exists(select 1 from public.guild_members where user_id=auth.uid() and guild_id=p.guild_id)))
  and public.raid_room_can_read_v1(p.room_id);
 return jsonb_build_object('entries',v_rows);
end $function$
;
CREATE OR REPLACE FUNCTION private.raid_enemy_info_v1(p_variant_id text, p_difficulty_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
declare v_members jsonb; v_member text; v_refs jsonb; v_skills jsonb; v_map jsonb:='{}'; v_clear jsonb; v_rescue jsonb; v_launch jsonb; v_unit jsonb;
begin
 if auth.uid() is null or not exists(select 1 from public.users where id=auth.uid()) then raise exception 'authentication required' using errcode='42501'; end if;
 if p_difficulty_id is null or p_difficulty_id not in ('beginner','intermediate','advanced','expert') then raise exception 'invalid difficulty' using errcode='22023'; end if;
 select profile into v_launch from public.raid_room_combat_profiles where raid_variant_id=p_variant_id and difficulty_id=p_difficulty_id;
 if found then
 select jsonb_agg(x->>'characterId' order by (x->>'slot')::integer) into v_members from jsonb_array_elements(v_launch->'members') x;
 else
 select member_character_ids into v_members from public.canonical_raid_variants where raid_variant_id=p_variant_id;
 end if;
 if v_members is null or jsonb_array_length(v_members)<>5 then raise exception 'enemy unavailable' using errcode='P0002'; end if;
 for v_member in select value from jsonb_array_elements_text(v_members) loop
  -- Match start_raid_room_battle_v1 (SQL260) exactly: HARD entry override, exclusive, then regular skills.
  if v_launch is not null then
   select x into v_unit from jsonb_array_elements(v_launch->'members') x where x->>'characterId'=v_member;
   select jsonb_agg(x->>'skillId' order by n) into v_refs from jsonb_array_elements(v_unit->'skills') with ordinality e(x,n);
  else
  select coalesce((select skill_loadout from public.canonical_quest_enemy_pool_entries where version='2026-08-30' and character_id=v_member and difficulty='HARD' order by local_affinity desc,weight desc limit 1),
   (select jsonb_agg(skill_id order by skill_id) from(select skill_id from public.canonical_skill_master where version='2026-08-21' and exclusive_character_id=v_member order by skill_id limit 2)s),
   (select jsonb_agg(skill_id order by skill_id) from(select skill_id from public.canonical_skill_master where version='2026-08-21' and exclusive_character_id is null order by skill_id limit 2)s),'[]'::jsonb) into v_refs;
  end if;
  select coalesce(jsonb_agg(jsonb_build_object('id',s.skill_id,'name',s.display_name) order by x.ordinality),'[]'::jsonb) into v_skills
   from jsonb_array_elements_text(v_refs) with ordinality x(id,ordinality) join public.canonical_skill_master s on s.version='2026-08-21' and s.skill_id=x.id;
  if jsonb_array_length(v_refs)<>jsonb_array_length(v_skills) then raise exception 'enemy skills unavailable' using errcode='P0002'; end if;
  v_map:=v_map||jsonb_build_object(v_member,v_skills);
 end loop;
 select jsonb_build_object('status',case when r.enabled and count(i.item_id)>0 then 'configured' else 'unconfigured' end,'items',case when r.enabled then coalesce(jsonb_agg(jsonb_build_object('itemId',i.item_id,'quantity',i.quantity) order by i.item_id) filter(where i.item_id is not null),'[]'::jsonb) else '[]'::jsonb end)
 into v_clear from public.raid_room_clear_reward_rules r left join public.raid_room_clear_reward_items i on i.difficulty=r.difficulty where r.difficulty=p_difficulty_id group by r.enabled;
 select jsonb_build_object('status',case when r.enabled and count(i.item_id)>0 then 'configured' else 'unconfigured' end,'items',case when r.enabled then coalesce(jsonb_agg(jsonb_build_object('itemId',i.item_id,'quantity',i.quantity) order by i.item_id) filter(where i.item_id is not null),'[]'::jsonb) else '[]'::jsonb end)
 into v_rescue from public.raid_room_rescue_reward_rules r left join public.raid_room_rescue_reward_items i on i.difficulty=r.difficulty where r.difficulty=p_difficulty_id group by r.enabled;
 return jsonb_build_object('variantId',p_variant_id,'memberCharacterIds',v_members,'skillsByCharacterId',v_map,'clearPlan',coalesce(v_clear,'{"status":"unconfigured","items":[]}'),'rescuePlan',coalesce(v_rescue,'{"status":"unconfigured","items":[]}'));
end $function$
;
CREATE OR REPLACE FUNCTION public.list_raid_room_cards_v1(p_difficulty_id text, p_offset integer DEFAULT 0)
 RETURNS jsonb
 LANGUAGE sql
 STABLE
 SET search_path TO 'pg_catalog'
AS $function$select private.raid_browse_page_v1(p_difficulty_id,p_offset)$function$
;
CREATE OR REPLACE FUNCTION public.get_raid_rescue_cards_v1(p_rescue_ids uuid[])
 RETURNS jsonb
 LANGUAGE sql
 STABLE
 SET search_path TO 'pg_catalog'
AS $function$select private.raid_rescue_cards_v1(p_rescue_ids)$function$
;
CREATE OR REPLACE FUNCTION public.get_raid_enemy_info_v1(p_variant_id text, p_difficulty_id text)
 RETURNS jsonb
 LANGUAGE sql
 STABLE
 SET search_path TO 'pg_catalog'
AS $function$select private.raid_enemy_info_v1(p_variant_id,p_difficulty_id)$function$
;
CREATE OR REPLACE FUNCTION private.ensure_initial_equipment_v1()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
 actor uuid := auth.uid(); receipt private.initial_equipment_receipts;
 owned_character uuid; issued uuid[];
begin
 if actor is null then raise exception 'authentication required' using errcode='42501'; end if;
 -- Match actor-row serialization used by reset/economic mutations.
 perform 1 from public.users where id=actor for update;
 if not found then raise exception 'player profile required' using errcode='P0002'; end if;
 select * into receipt from private.initial_equipment_receipts where user_id=actor for update;
 if not found then return jsonb_build_object('status','not_eligible'); end if;
 if receipt.state<>'PENDING' then return jsonb_build_object('status',lower(receipt.state),'equipmentIds',receipt.equipment_ids); end if;
 -- A nonempty inventory cannot establish first-grant eligibility.
 if exists(select from public.user_equipments where user_id=actor) then
   update private.initial_equipment_receipts set state='SKIPPED',completed_at=now() where user_id=actor;
   return jsonb_build_object('status','skipped');
 end if;
 if not exists(select from public.gacha_execution_history where user_id=actor and status='COMPLETED'
    and result_payload->'tutorial'='true'::jsonb) then
   return jsonb_build_object('status','pending');
 end if;
 select id into owned_character from public.user_characters where user_id=actor order by created_at,id limit 1 for update;
 if owned_character is null then return jsonb_build_object('status','pending'); end if;
 if (select count(*) from public.canonical_equipment_master where version='2026-08-21'
     and equipment_id=any(array['WEAPON_001','HEAD_001','BODY_001','LEGS_001','ACCESSORY_001']))<>5 then
   raise exception 'initial equipment master unavailable' using errcode='55000';
 end if;
 with inserted as (
   insert into public.user_equipments(user_id,equipment_id,level,plus_val,equipped_character_id,slot_index,random_options)
   select actor,equipment_id,1,0,owned_character::text,slot_index,
     '[{"name":"クリティカル率","val":"+5%","unlocked":true},{"name":"命中率","val":"+8%","unlocked":false},{"name":"回避率","val":"+6%","unlocked":false},{"name":"防御貫通力","val":"+12%","unlocked":false}]'::jsonb
   from (values('WEAPON_001',0),('HEAD_001',2),('BODY_001',3),('LEGS_001',4),('ACCESSORY_001',5)) as fixed(equipment_id,slot_index)
   returning id
 ) select array_agg(id order by id) into issued from inserted;
 update private.initial_equipment_receipts set state='GRANTED',equipment_ids=issued,completed_at=now() where user_id=actor;
 return jsonb_build_object('status','granted','equipmentIds',issued);
end;
$function$
;
CREATE OR REPLACE FUNCTION public.ensure_initial_equipment_v1()
 RETURNS jsonb
 LANGUAGE sql
 SET search_path TO ''
AS $function$select private.ensure_initial_equipment_v1()$function$
;
CREATE OR REPLACE FUNCTION public._raid_room_launch_enemy_snapshot_v1(p_profile jsonb, p_instance uuid, p_max_hp bigint)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'pg_catalog'
AS $function$
declare m jsonb; e jsonb; s jsonb; c record; eq record; sk record; k text;
 stats jsonb; equipment jsonb; skills jsonb; refs jsonb; result jsonb:='[]'; categories text[];
begin
 if jsonb_array_length(p_profile->'members')<>5 or p_max_hp<=0 then raise exception 'invalid combat profile'; end if;
 if (select count(distinct x->>'characterId') from jsonb_array_elements(p_profile->'members') x)<>5 then raise exception 'duplicate raid character';end if;
 for m in select x from jsonb_array_elements(p_profile->'members') x order by (x->>'slot')::integer loop
  select * into c from public.canonical_character_master where version='2026-08-21' and character_id=m->>'characterId';
  if not found then raise exception 'raid character unavailable';end if;
  stats:=jsonb_set(m->'baseStats','{hp}',to_jsonb(ceil(p_max_hp::numeric/5)::bigint));
  equipment:='[]';skills:='[]';refs:='[]';categories:='{}';
  for e in select x from jsonb_array_elements(m->'equipment') x loop
   select * into eq from public.canonical_equipment_master where version='2026-08-21' and equipment_id=e->>'equipmentId';
   if not found then raise exception 'raid equipment unavailable';end if;
   if eq.exclusive_character_id is not null and eq.exclusive_character_id<>c.character_id then raise exception 'invalid raid equipment owner';end if;
   if eq.category=any(categories) then raise exception 'duplicate raid equipment slot';end if;
   if (e->>'level')::integer not between 1 and 100 or (e->>'plus')::integer not between 0 and 2 then raise exception 'invalid raid equipment progression';end if;
   categories:=array_append(categories,eq.category);
   foreach k in array array['hp','atk','def','spd','luk'] loop
    stats:=jsonb_set(stats,array[k],to_jsonb((stats->>k)::bigint+public.canonical_equipment_flat_stat(coalesce((eq.base_stats->>k)::integer,0),(e->>'level')::integer,(e->>'plus')::integer)));
   end loop;
   equipment:=equipment||jsonb_build_array(jsonb_build_object('equipmentId',eq.equipment_id,'name',eq.display_name,'category',eq.category,'level',(e->>'level')::integer,'plusValue',(e->>'plus')::integer));
  end loop;
  for s in select x from jsonb_array_elements(m->'skills') x loop
   select * into sk from public.canonical_skill_master where version='2026-08-21' and skill_id=s->>'skillId';
   if not found then raise exception 'raid skill unavailable';end if;
   if (s->>'plus')::integer not between 0 and 10 then raise exception 'invalid raid skill progression';end if;
   skills:=skills||jsonb_build_array(jsonb_build_object('id',sk.skill_id,'name',sk.display_name,'activationType',sk.activation_type,'cooldown',sk.cooldown,'availableFromRound',sk.available_from_round,'target',sk.target,'effects',sk.effects,'exclusiveCharacterId',sk.exclusive_character_id,'plusValue',(s->>'plus')::integer));
   refs:=refs||jsonb_build_array(sk.skill_id);
  end loop;
  if jsonb_array_length(skills) not between 1 and 5 then raise exception 'invalid raid skill count';end if;
  foreach k in array array['hp','atk','def','spd','luk'] loop
   if (stats->>k)::bigint<0 or (stats->>k)::bigint>2147483647 then raise exception 'invalid raid stat';end if;
  end loop;
  result:=result||jsonb_build_array(jsonb_build_object('id','raid_'||p_instance||'_'||(m->>'slot'),'characterId',c.character_id,'name',c.display_name,'team','ENEMY','alignment',c.attribute,'level',(m->>'level')::integer,'awakeningLevel',(m->>'awakeningLevel')::integer,'stats',stats,'equippedSkillRefs',refs,'skills',skills,'equipment',equipment));
 end loop;
 return result;
end $function$
;
CREATE OR REPLACE FUNCTION public.request_kpi_overview_saved_refresh(p_today date DEFAULT ((now() AT TIME ZONE 'Asia/Tokyo'::text))::date)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
 SET statement_timeout TO '120s'
AS $function$
begin
  if p_today is null or p_today > (now() at time zone 'Asia/Tokyo')::date then
    raise exception 'invalid observation date';
  end if;
  return public.refresh_kpi_overview_saved_results(p_today);
end;
$function$
;
CREATE OR REPLACE FUNCTION public.on_raid_boss_defeated_activity()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_room public.raid_rooms%rowtype; v_owner_name text; v_boss_name text;
begin
  if old.status='CLEARED' or new.status<>'CLEARED' or coalesce(new.current_hp,0)<>0 then
    return new;
  end if;
  select * into v_room from public.raid_rooms where raid_boss_instance_id=new.id;
  if not found then return new; end if;
  select username into v_owner_name from public.users where id=v_room.owner_user_id;
  select raid_name into v_boss_name from public.canonical_raid_variants
  where raid_variant_id=new.raid_variant_id and is_production_enabled limit 1;
  insert into public.social_activity_feed(
    activity_type,actor_user_id,actor_display_name,object_master_id,display_payload
  ) values (
    'RAID_BOSS_DEFEATED',v_room.owner_user_id,coalesce(v_owner_name,'プレイヤー'),new.id::text,
    jsonb_build_object('room_id',v_room.id,'boss_name',v_boss_name,'raid_owner_name',coalesce(v_owner_name,'プレイヤー'))
  ) on conflict do nothing;
  return new;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.on_short_tutorial_character_setup_eligible()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if new.step_id='COMPLETE' and old.step_id in ('TUTORIAL_BATTLE','RULE_GUIDE') then
    insert into public.user_funnel_milestones(user_id,milestone,metadata)
    values(new.user_id,'character_setup_dialog_eligible',jsonb_build_object('flow','post_tutorial_setup','completed_from',old.step_id))
    on conflict(user_id,milestone) do nothing;
  end if;
  return new;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.resume_short_tutorial()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_user_id uuid:=auth.uid(); v_step text;
begin
  if v_user_id is null then raise exception 'authentication required' using errcode='42501'; end if;
  select step_id into v_step from public.tutorial_progress where user_id=v_user_id;
  if v_step is null then raise exception 'Tutorial has not started'; end if;
  return jsonb_build_object('status','accepted_flow_restored','tutorial_step',v_step);
end;
$function$
;
CREATE OR REPLACE FUNCTION private.apply_recommended_main_equipment_v1(p_user_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'private'
AS $function$
declare v_member record; v_slot integer; v_equipment_id uuid; v_count integer:=0;
begin
  perform 1 from public.user_main_formations where user_id=p_user_id order by slot for update;
  perform 1 from public.user_equipments where user_id=p_user_id for update;
  update public.user_equipments set equipped_character_id=null,slot_index=null
  where user_id=p_user_id and equipped_character_id in (
    select user_character_id::text from public.user_main_formations where user_id=p_user_id
  );
  for v_slot in 0..6 loop
    for v_member in
      select formation.slot,owned.id,owned.character_id
      from public.user_main_formations formation join public.user_characters owned on owned.id=formation.user_character_id
      where formation.user_id=p_user_id
      order by case when mod(v_slot,2)=0 then formation.slot else 6-formation.slot end
    loop
      select candidate.id into v_equipment_id
      from public.user_equipments candidate join public.canonical_equipment_master master
        on master.version='2026-08-21' and master.equipment_id=coalesce(nullif(candidate.equipment_id,''),candidate.equipment_master_id)
      where candidate.user_id=p_user_id and candidate.equipped_character_id is null
        and master.category=case v_slot when 0 then 'WEAPON' when 1 then 'WEAPON' when 2 then 'HEAD' when 3 then 'BODY' when 4 then 'LEGS' else 'ACCESSORY' end
        and (master.exclusive_character_id is null or master.exclusive_character_id=v_member.character_id)
      order by (master.exclusive_character_id=v_member.character_id) desc nulls last,
        (public.canonical_equipment_flat_stat((master.base_stats->>'hp')::integer,coalesce(candidate.level,1),coalesce(candidate.plus_val,0))
        +public.canonical_equipment_flat_stat((master.base_stats->>'atk')::integer,coalesce(candidate.level,1),coalesce(candidate.plus_val,0))
        +public.canonical_equipment_flat_stat((master.base_stats->>'def')::integer,coalesce(candidate.level,1),coalesce(candidate.plus_val,0))) desc,
        coalesce(candidate.level,1) desc,coalesce(candidate.plus_val,0) desc,
        case master.rarity when 'SSR' then 4 when 'SR' then 3 when 'R' then 2 else 1 end desc,
        master.equipment_id,candidate.id limit 1;
      if v_equipment_id is not null then
        update public.user_equipments set equipped_character_id=v_member.id::text,slot_index=v_slot where id=v_equipment_id;
        v_count:=v_count+1;
      end if;
      v_equipment_id:=null;
    end loop;
  end loop;
  return v_count;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.get_character_setup_dialog_state()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select case when auth.uid() is null then null else jsonb_build_object(
    'eligible',exists(select 1 from public.user_funnel_milestones where user_id=auth.uid() and milestone='character_setup_dialog_eligible'),
    'consumed',exists(select 1 from public.user_funnel_milestones where user_id=auth.uid() and milestone='character_setup_dialog_consumed')
  ) end;
$function$
;
CREATE OR REPLACE FUNCTION public.complete_character_setup_dialog(p_action text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'private'
AS $function$
declare
  v_user_id uuid:=auth.uid(); v_action text:=upper(coalesce(p_action,'')); v_before bigint;
  v_after bigint; v_formation jsonb; v_equipment_count integer:=0; v_skill_count integer:=0; v_existing jsonb;
begin
  if v_user_id is null then raise exception 'authentication required' using errcode='42501'; end if;
  if v_action not in ('AUTO_SETUP','LATER') then raise exception 'invalid dialog action' using errcode='22023'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text,0));
  if not exists(select 1 from public.user_funnel_milestones where user_id=v_user_id and milestone='character_setup_dialog_eligible') then
    raise exception 'character setup dialog is unavailable' using errcode='42501';
  end if;
  select metadata into v_existing from public.user_funnel_milestones
  where user_id=v_user_id and milestone='character_setup_dialog_consumed';
  if v_existing is not null then return jsonb_build_object('status','already_consumed','result',v_existing); end if;
  v_before:=public.refresh_user_power_projection(v_user_id);
  if v_action='AUTO_SETUP' then
    v_formation:=public.save_recommended_main_formation();
    v_skill_count:=private.apply_recommended_main_skills_v1(v_user_id);
    v_equipment_count:=private.apply_recommended_main_equipment_v1(v_user_id);
    v_after:=public.refresh_user_power_projection(v_user_id);
    perform public.record_post_tutorial_guide_milestone(v_user_id,'first_main_loadout',
      jsonb_build_object('source','character_setup_dialog','skillCount',v_skill_count,'equipmentCount',v_equipment_count));
  else
    v_after:=v_before;
  end if;
  insert into public.user_funnel_milestones(user_id,milestone,metadata)
  values(v_user_id,'character_setup_dialog_consumed',jsonb_build_object(
    'action',lower(v_action),'powerBefore',v_before,'powerAfter',v_after,
    'skillCount',v_skill_count,'equipmentCount',v_equipment_count,'partyCount',coalesce(jsonb_array_length(v_formation->'character_ids'),0)
  )) on conflict(user_id,milestone) do nothing;
  return jsonb_build_object('status','success','action',lower(v_action),'powerBefore',v_before,'powerAfter',v_after,
    'skillCount',v_skill_count,'equipmentCount',v_equipment_count,'partyCount',coalesce(jsonb_array_length(v_formation->'character_ids'),0),
    'formation',v_formation);
end;
$function$
;
CREATE OR REPLACE FUNCTION public.get_beginner_mission_journey()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_user uuid:=auth.uid(); v_sync jsonb; v_milestones text[];
  v_skill boolean; v_equipment boolean; v_facts jsonb; v_missions jsonb;
begin
  if v_user is null or not exists(select 1 from public.users where id=v_user) then
    raise exception 'Player authentication required' using errcode='42501';
  end if;
  v_sync:=public.sync_current_missions();
  select coalesce(array_agg(milestone),'{}'::text[]) into v_milestones
    from public.user_funnel_milestones where user_id=v_user;
  v_skill:= 'first_main_loadout'=any(v_milestones)
    or exists(select 1 from public.user_skills s where s.user_id=v_user and nullif(s.equipped_character_id,'') is not null);
  v_equipment:= 'first_main_loadout'=any(v_milestones)
    or exists(select 1 from public.user_equipments e where e.user_id=v_user and nullif(e.equipped_character_id,'') is not null);
  update public.user_missions set status='CLEAR',current_progress=1,progress_val=1,updated_at=clock_timestamp()
    where user_id=v_user and status='PROGRESS'
      and ((mission_id='MIS_N_P002' and v_skill) or (mission_id='MIS_N_P003' and v_equipment));
  -- 加入/設立はいずれも所属成功。閲覧/申請だけでは報酬を達成しない。
  update public.user_missions set status='CLEAR',current_progress=1,progress_val=1,updated_at=clock_timestamp()
    where user_id=v_user and mission_id='MIS_N_P010' and status='PROGRESS'
      and ('guild_joined'=any(v_milestones)
        or exists(select 1 from public.guild_members where user_id=v_user));
  v_facts:=jsonb_build_object(
    'free_skill','first_free_skill_ten_pull'=any(v_milestones) or exists(
      select 1 from public.gacha_execution_history where user_id=v_user and status='COMPLETED'
        and payment_source='free' and pull_count=10 and gacha_id='SKILL_NORMAL'),
    'free_equipment','first_free_equipment_ten_pull'=any(v_milestones) or exists(
      select 1 from public.gacha_execution_history where user_id=v_user and status='COMPLETED'
        and payment_source='free' and pull_count=10 and gacha_id='EQUIP_NORMAL'),
    'character','first_main_loadout'=any(v_milestones),
    'quest','post_tutorial_quest'=any(v_milestones),
    'pvp','first_pvp'=any(v_milestones),
    'raid','first_raid'=any(v_milestones),
    'guild','post_tutorial_guild_view'=any(v_milestones) or 'guild_joined'=any(v_milestones)
      or exists(select 1 from public.guild_members where user_id=v_user)
  );
  select coalesce(jsonb_agg(jsonb_build_object('id',m.id,'category',m.category,'status',um.status,
    'expires_at',e.claim_deadline,'cycle_date',um.cycle_date) order by m.display_order,m.id),'[]'::jsonb)
    into v_missions from public.user_missions um join public.missions m on m.id=um.mission_id
    left join public.mission_events e on e.id=m.event_id
    where um.user_id=v_user and m.is_enabled;
  return jsonb_build_object('version',1,'facts',v_facts,'missions',v_missions,
    'reflow_completed','activation_mission_handoff'=any(v_milestones),
    'raid_unavailable_ack','initial_raid_unavailable_ack'=any(v_milestones),
    'cycle_date',v_sync->'cycle_date','synced_at',clock_timestamp());
end;
$function$
;
CREATE OR REPLACE FUNCTION public.quest_town_key(p_value text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
 select case lower(btrim(p_value))
 when '新宿' then 'shinjuku' when 'shinjuku' then 'shinjuku'
 when '渋谷' then 'shibuya' when 'shibuya' then 'shibuya'
 when '池袋' then 'ikebukuro' when 'ikebukuro' then 'ikebukuro'
 when '六本木' then 'roppongi' when 'roppongi' then 'roppongi'
 when '秋葉原' then 'akihabara' when 'akihabara' then 'akihabara'
 when '川崎' then 'kawasaki' when 'kawasaki' then 'kawasaki'
 when '横浜' then 'yokohama' when 'yokohama' then 'yokohama' end
$function$
;
CREATE OR REPLACE FUNCTION public.quest_hometown_snapshot(p_user uuid, p_character text, p_course text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
declare v record; v_match boolean;
begin
 select c.character_id,c.level,c.awakening_level,m.hometown,q.town_id,q.cash_reward into v
 from public.user_characters c
 join public.canonical_character_master m on m.version='2026-08-21' and m.character_id=c.character_id
 join public.canonical_quest_master q on q.version='2026-08-30' and q.quest_id=p_course
 where c.user_id=p_user and (c.character_id=p_character or c.id::text=p_character)
 order by (c.id::text=p_character) desc,c.id limit 1;
 if not found then raise exception 'hometown snapshot source missing' using errcode='23503'; end if;
 v_match:=coalesce(public.quest_town_key(v.hometown)=public.quest_town_key(v.town_id),false);
 return jsonb_build_object('version',2,'character_id',v.character_id,'level',v.level,'awakening',v.awakening_level,
 'town',public.quest_town_key(v.town_id),'matched',v_match,
 'cash_bonus_rate',case when v_match then 0.10 else 0 end,
 'cash',case when v_match then floor(v.cash_reward::numeric * 0.10)::bigint else 0 end,
 'drop_bonus_bp',case when v_match then 200 else 0 end);
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
CREATE OR REPLACE FUNCTION public.advance_tutorial_progress(p_expected_step text, p_next_step text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
declare
  v_user_id uuid:=auth.uid();
  v_current_step text;
  v_is_anonymous boolean:=coalesce((auth.jwt()->>'is_anonymous')::boolean,false);
begin
  if v_user_id is null then raise exception 'Authentication is required'; end if;
  select step_id into v_current_step
  from public.tutorial_progress
  where user_id=v_user_id
  for update;
  if v_current_step is null then raise exception 'Tutorial has not started'; end if;
  if v_current_step<>p_expected_step then raise exception 'Unexpected tutorial step'; end if;
  if (p_expected_step,p_next_step) not in (
    ('WORLD_INTRO','FREE_GACHA'),('FREE_GACHA','AUTO_FORMATION'),
    ('AUTO_FORMATION','DISPATCH'),('DISPATCH','FREE_INSTANT'),
    ('FREE_INSTANT','TUTORIAL_BATTLE'),('TUTORIAL_BATTLE','RULE_GUIDE'),
    ('RULE_GUIDE','COMPLETE')
  ) then raise exception 'Invalid tutorial transition'; end if;

  update public.tutorial_progress
  set step_id=p_next_step,
      authentication_pending=case
        when p_next_step='COMPLETE' and v_is_anonymous then true
        else authentication_pending
      end,
      updated_at=now(),
      completed_at=case when p_next_step='COMPLETE' then coalesce(completed_at,now()) else completed_at end
  where user_id=v_user_id;
  return p_next_step;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.apply_tutorial_enemy_snapshot(p_user_id uuid, p_player_snapshot jsonb, p_enemy_snapshot jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_player_hp integer; v_player_def integer;
begin
  if not exists(select 1 from public.tutorial_progress where user_id=p_user_id and step_id='TUTORIAL_BATTLE') then return p_enemy_snapshot; end if;
  select max((unit#>>'{stats,hp}')::integer),max((unit#>>'{stats,def}')::integer)
  into v_player_hp,v_player_def from jsonb_array_elements(coalesce(p_player_snapshot,'[]'::jsonb)) unit;
  return coalesce((select jsonb_agg(
    jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(unit,'{stats,hp}','1800'::jsonb,true),
      '{stats,def}','0'::jsonb,true),'{stats,spd}',to_jsonb(case when unit_ordinality=1 then 150 else 25 end),true),
      '{stats,atk}',to_jsonb(case when unit_ordinality=1 then greatest(1,round(coalesce(v_player_hp,1)*0.45+coalesce(v_player_def,0))::integer) else 0 end),true),
      '{skills}','[]'::jsonb,true)
    order by unit_ordinality)
  from jsonb_array_elements(coalesce(p_enemy_snapshot,'[]'::jsonb)) with ordinality enemies(unit,unit_ordinality)),'[]'::jsonb);
end;
$function$
;
CREATE OR REPLACE FUNCTION public.apply_tutorial_player_snapshot(p_user_id uuid, p_snapshot jsonb)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select case when exists(select 1 from public.tutorial_progress where user_id=p_user_id and step_id='TUTORIAL_BATTLE') then
    coalesce((select jsonb_agg(
      jsonb_set(
        jsonb_set(unit,'{stats,spd}',to_jsonb(case
          when exists(select 1 from jsonb_array_elements(coalesce(unit->'skills','[]'::jsonb)) skill where skill->>'id'='SKILL_022') then 250
          when exists(select 1 from jsonb_array_elements(coalesce(unit->'skills','[]'::jsonb)) skill where skill->>'id'='SKILL_001') then 200
          else 50 end),true),
        '{stats,atk}',to_jsonb(case
          when exists(select 1 from jsonb_array_elements(coalesce(unit->'skills','[]'::jsonb)) skill where skill->>'id'='SKILL_022') then 2000
          when exists(select 1 from jsonb_array_elements(coalesce(unit->'skills','[]'::jsonb)) skill where skill->>'id'='SKILL_001') then 1000
          else 200 end),true)
      || case when exists(select 1 from jsonb_array_elements(coalesce(unit->'skills','[]'::jsonb)) skill where skill->>'id'='SKILL_022')
        then jsonb_build_object('turnAvailableFromRound',2) else '{}'::jsonb end
      order by unit_ordinality)
    from jsonb_array_elements(coalesce(p_snapshot,'[]'::jsonb)) with ordinality units(unit,unit_ordinality)
    where exists(select 1 from jsonb_array_elements(coalesce(unit->'skills','[]'::jsonb)) skill where skill->>'id' in ('SKILL_001','SKILL_003','SKILL_022'))),'[]'::jsonb)
  else p_snapshot end;
$function$
;
CREATE OR REPLACE FUNCTION public.complete_activation_mission_handoff()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_user uuid:=auth.uid(); v_journey jsonb; v_facts jsonb;
begin
  if v_user is null then raise exception 'authentication required' using errcode='42501'; end if;
  v_journey:=public.get_beginner_mission_journey(); v_facts:=v_journey->'facts';
  if (v_journey->>'reflow_completed')::boolean then return true; end if;
  if not (v_facts @> '{"free_skill":true,"free_equipment":true,"character":true,"quest":true,"pvp":true,"guild":true}') then
    raise exception 'activation prerequisites not met' using errcode='55000';
  end if;
  if not ((v_facts->>'raid')::boolean or (v_journey->>'raid_unavailable_ack')::boolean) then
    -- 未開催の承認はクライアント値でなく既存server開催確認を通す。
    perform public.acknowledge_initial_raid_guide();
  end if;
  insert into public.user_funnel_milestones(user_id,milestone,metadata)
    values(v_user,'activation_mission_handoff',jsonb_build_object('source','beginner_mission','destination','home'))
    on conflict(user_id,milestone) do nothing;
  return true;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.complete_current_tutorial_formation()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid:=auth.uid(); v_step text; v_prepared jsonb; v_guaranteed_master text;
  v_target_ids uuid[]; v_target_masters text[]; v_skill_masters text[]:=array['SKILL_022','SKILL_001','SKILL_003'];
  v_skill_names text[]:=array['重鉄パイプ大薙ぎ','ストリートパンチ','ノイズヒール'];
  v_skill_id uuid; v_index integer; v_granted boolean; v_assignments jsonb:='[]'::jsonb;
begin
  if v_user_id is null then raise exception 'authentication required' using errcode='42501'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text,0));
  select step_id into v_step from public.tutorial_progress where user_id=v_user_id for update;
  if v_step in ('DISPATCH','FREE_INSTANT','TUTORIAL_BATTLE','RULE_GUIDE','COMPLETE','AUTHENTICATION') then
    return jsonb_build_object('status','already_advanced','tutorial_step',v_step);
  end if;
  if v_step<>'AUTO_FORMATION' then raise exception 'tutorial formation is unavailable' using errcode='23514'; end if;
  v_prepared:=public.prepare_current_tutorial_formation();
  v_guaranteed_master:=v_prepared->>'leader_character_id';

  select array_agg(owned.id order by case when owned.character_id=v_guaranteed_master then 0 else formation.slot end),
         array_agg(owned.character_id order by case when owned.character_id=v_guaranteed_master then 0 else formation.slot end)
  into v_target_ids,v_target_masters
  from public.user_main_formations formation join public.user_characters owned on owned.id=formation.user_character_id
  where formation.user_id=v_user_id
    and (owned.character_id=v_guaranteed_master or formation.slot in (
      select candidate.slot from public.user_main_formations candidate join public.user_characters other on other.id=candidate.user_character_id
      where candidate.user_id=v_user_id and other.character_id<>v_guaranteed_master order by candidate.slot limit 2
    ));
  if coalesce(cardinality(v_target_ids),0)<>3 or v_target_masters[1] is distinct from v_guaranteed_master then
    raise exception 'tutorial Skill targets are unavailable' using errcode='23514';
  end if;

  for v_index in 1..3 loop
    if not exists(select 1 from public.canonical_skill_master where version='2026-08-21' and skill_id=v_skill_masters[v_index] and exclusive_character_id is null) then
      raise exception 'canonical tutorial Skill is unavailable' using errcode='P0002';
    end if;
    v_granted:=false;
    select id into v_skill_id from public.user_skills
    where user_id=v_user_id and skill_card_id=v_skill_masters[v_index]
    order by created_at,id limit 1 for update;
    if v_skill_id is null then
      insert into public.user_skills(user_id,skill_card_id,plus_val) values(v_user_id,v_skill_masters[v_index],0) returning id into v_skill_id;
      v_granted:=true;
    end if;
    perform public.set_character_skill(v_target_ids[v_index],v_skill_id,0);
    v_assignments:=v_assignments || jsonb_build_array(jsonb_build_object(
      'character_id',v_target_masters[v_index],'user_character_id',v_target_ids[v_index],
      'skill_id',v_skill_masters[v_index],'skill_name',v_skill_names[v_index],'slot_index',0,'granted',v_granted
    ));
    v_skill_id:=null;
  end loop;

  perform private.ensure_initial_equipment_v1();
  update public.tutorial_progress set step_id='DISPATCH',updated_at=now() where user_id=v_user_id and step_id='AUTO_FORMATION';
  return jsonb_build_object('status','advanced','tutorial_step','DISPATCH','formation',v_prepared->'formation',
    'leader_character_id',v_guaranteed_master,'skills',v_assignments,'skill_equipped',true,'skill_count',3);
end;
$function$
;
CREATE OR REPLACE FUNCTION public.execute_asset_gacha_core_20260812(p_user_id uuid, p_gacha_id text, p_pull_count integer, p_currency_type text)
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
  v_is_skill BOOLEAN;
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
  WHERE id = p_gacha_id AND gacha_type IN ('SKILL', 'EQUIPMENT');
  IF NOT FOUND THEN
    RAISE EXCEPTION 'asset gacha not found';
  END IF;
  v_is_skill := v_gacha.gacha_type = 'SKILL';

  IF p_currency_type = 'free' THEN
    INSERT INTO public.user_daily_gacha_claims (user_id, gacha_type, last_claimed_date)
    VALUES (p_user_id, v_gacha.gacha_type, v_today)
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

    IF v_is_skill THEN
      SELECT id, plus_val INTO v_existing
      FROM public.user_skills
      WHERE user_id = p_user_id AND skill_card_id = v_item_id
      FOR UPDATE;
      IF FOUND AND COALESCE(v_existing.plus_val, 0) < 10 THEN
        UPDATE public.user_skills SET plus_val = COALESCE(plus_val, 0) + 1 WHERE id = v_existing.id;
        v_result := v_result || jsonb_build_array(jsonb_build_object('type', 'SKILL', 'item_id', v_item_id, 'outcome', 'limit_break'));
      ELSIF FOUND THEN
        INSERT INTO public.user_items (user_id, item_id, quantity)
        VALUES (p_user_id, 'TRAINING_MANUAL', 2)
        ON CONFLICT (user_id, item_id) DO UPDATE SET quantity = public.user_items.quantity + 2;
        v_result := v_result || jsonb_build_array(jsonb_build_object('type', 'SKILL', 'item_id', v_item_id, 'outcome', 'converted'));
      ELSE
        INSERT INTO public.user_skills (user_id, skill_card_id, plus_val)
        VALUES (p_user_id, v_item_id, 0);
        v_result := v_result || jsonb_build_array(jsonb_build_object('type', 'SKILL', 'item_id', v_item_id, 'outcome', 'new'));
      END IF;
    ELSE
      INSERT INTO public.user_equipments (user_id, equipment_id, level, plus_val, random_options)
      VALUES (p_user_id, v_item_id, 1, 0, '[]'::jsonb);
      v_result := v_result || jsonb_build_array(jsonb_build_object('type', 'EQUIPMENT', 'item_id', v_item_id, 'outcome', 'new'));
    END IF;
  END LOOP;

  IF p_currency_type <> 'free' AND p_gacha_id IN ('SKILL_SPECIAL', 'EQUIP_SPECIAL') THEN
    INSERT INTO public.user_gacha_pity_points (user_id, pity_master_id, current_points)
    VALUES (p_user_id, 'pity_special_common', p_pull_count)
    ON CONFLICT (user_id, pity_master_id) DO UPDATE
      SET current_points = public.user_gacha_pity_points.current_points + p_pull_count, updated_at = now();
  END IF;

  SELECT cash, neon_diamonds INTO v_user FROM public.users WHERE id = p_user_id;
  RETURN jsonb_build_object('status', 'success', 'results', v_result, 'cash', v_user.cash, 'diamonds', v_user.neon_diamonds);
END;
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
CREATE OR REPLACE FUNCTION public.initialize_current_player(p_username text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid:=auth.uid();
  v_username text:=btrim(p_username);
  v_is_anonymous boolean:=coalesce((auth.jwt()->>'is_anonymous')::boolean,false);
begin
  if v_user_id is null then raise exception 'Authentication is required'; end if;
  if not v_is_anonymous and not public.can_initialize_maintenance_google_player() then raise exception 'Anonymous onboarding session is required'; end if;
  if v_username is null or char_length(v_username) not between 1 and 8 then
    raise exception 'Username must contain 1 to 8 characters';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text,0));
  if exists(select 1 from public.users where id=v_user_id) then
    insert into public.tutorial_progress(user_id,step_id) values(v_user_id,'WORLD_INTRO') on conflict(user_id) do nothing;
    return jsonb_build_object('status','already_initialized','tutorial_step',(select step_id from public.tutorial_progress where user_id=v_user_id));
  end if;
  if exists(select 1 from public.users where lower(btrim(username))=lower(v_username)) then
    raise exception 'Username is already in use' using errcode='23505';
  end if;
  insert into public.users(id,username,current_base_id,favorite_character_id)
  values(v_user_id,v_username,'shinjuku',null);
  insert into private.initial_equipment_receipts(user_id) values(v_user_id);
  insert into public.tutorial_progress(user_id,step_id) values(v_user_id,'WORLD_INTRO') on conflict(user_id) do nothing;
  return jsonb_build_object('status','success','tutorial_step','WORLD_INTRO');
end;
$function$
;
CREATE OR REPLACE FUNCTION public.set_character_skill(p_character_id uuid, p_skill_id uuid, p_slot_index integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_awakening integer;
  v_character_id text;
  v_skill_id text;
  v_exclusive text;
begin
  if v_user_id is null then raise exception 'authentication required' using errcode = '42501'; end if;
  select character_id, coalesce(awakening_level, 0) into v_character_id, v_awakening
  from public.user_characters where id = p_character_id and user_id = v_user_id for update;
  if not found then raise exception 'owned character not found' using errcode = 'P0002'; end if;
  if p_slot_index < 0 or p_slot_index >= public.canonical_skill_slot_count(v_awakening) then raise exception 'skill slot is locked' using errcode = '23514'; end if;
  select owned.skill_card_id, master.exclusive_character_id into v_skill_id, v_exclusive
  from public.user_skills owned join public.canonical_skill_master master
    on master.version = '2026-08-21' and master.skill_id = owned.skill_card_id
  where owned.id = p_skill_id and owned.user_id = v_user_id for update;
  if not found then raise exception 'owned canonical skill not found' using errcode = 'P0002'; end if;
  if v_exclusive is not null and v_exclusive <> v_character_id then raise exception 'exclusive skill character mismatch' using errcode = '23514'; end if;
  if v_exclusive is not null and exists (
    select 1 from public.user_skills owned join public.canonical_skill_master master
      on master.version = '2026-08-21' and master.skill_id = owned.skill_card_id
    where owned.user_id = v_user_id and owned.equipped_character_id = p_character_id::text
      and owned.id <> p_skill_id and master.exclusive_character_id is not null
  ) then raise exception 'only one exclusive skill may be equipped' using errcode = '23514'; end if;
  update public.user_skills set equipped_character_id = null, slot_index = null
  where user_id = v_user_id and (id = p_skill_id or (equipped_character_id = p_character_id::text and slot_index = p_slot_index));
  update public.user_skills set equipped_character_id = p_character_id::text, slot_index = p_slot_index
  where id = p_skill_id and user_id = v_user_id;
  perform public.evaluate_mission_progress(v_user_id, 'SKILL_EQUIP_COUNT', 1);
  return jsonb_build_object('status', 'success', 'skill_id', v_skill_id, 'slot_index', p_slot_index);
end;
$function$
;
CREATE OR REPLACE FUNCTION public.set_character_skill_loadout(p_character_id uuid, p_skill_ids uuid[], p_slot_indexes integer[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_awakening integer;
  v_character_id text;
  v_count integer := coalesce(cardinality(p_skill_ids), 0);
begin
  if v_user_id is null then raise exception 'authentication required' using errcode = '42501'; end if;
  if p_skill_ids is null or p_slot_indexes is null or v_count <> coalesce(cardinality(p_slot_indexes), 0) or v_count > 6 then raise exception 'invalid skill loadout arrays' using errcode = '22023'; end if;
  if v_count <> (select count(distinct value) from unnest(p_skill_ids) value)
    or v_count <> (select count(distinct value) from unnest(p_slot_indexes) value) then raise exception 'duplicate skill or slot' using errcode = '23514'; end if;
  select character_id, coalesce(awakening_level, 0) into v_character_id, v_awakening
  from public.user_characters where id = p_character_id and user_id = v_user_id for update;
  if not found then raise exception 'owned character not found' using errcode = 'P0002'; end if;
  if exists (select 1 from unnest(p_slot_indexes) slot where slot < 0 or slot >= public.canonical_skill_slot_count(v_awakening)) then raise exception 'skill slot is locked' using errcode = '23514'; end if;
  if v_count <> (
    select count(*) from public.user_skills owned join public.canonical_skill_master master
      on master.version = '2026-08-21' and master.skill_id = owned.skill_card_id
    where owned.user_id = v_user_id and owned.id = any(p_skill_ids)
      and (master.exclusive_character_id is null or master.exclusive_character_id = v_character_id)
  ) then raise exception 'invalid owned canonical skill loadout' using errcode = '23514'; end if;
  if (select count(*) from public.user_skills owned join public.canonical_skill_master master
      on master.version = '2026-08-21' and master.skill_id = owned.skill_card_id
      where owned.user_id = v_user_id and owned.id = any(p_skill_ids)
        and master.exclusive_character_id is not null) > 1 then raise exception 'only one exclusive skill may be equipped' using errcode = '23514'; end if;
  update public.user_skills set equipped_character_id = null, slot_index = null
  where user_id = v_user_id and (equipped_character_id = p_character_id::text or id = any(p_skill_ids));
  update public.user_skills owned set equipped_character_id = p_character_id::text, slot_index = selected.slot_index
  from unnest(p_skill_ids, p_slot_indexes) selected(skill_id, slot_index)
  where owned.id = selected.skill_id and owned.user_id = v_user_id;
  if v_count > 0 then perform public.evaluate_mission_progress(v_user_id, 'SKILL_EQUIP_COUNT', 1); end if;
  return jsonb_build_object('status', 'success', 'equipped_count', v_count);
end;
$function$
;
CREATE OR REPLACE FUNCTION public.ensure_daily_raid_rooms_v1()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public', 'private'
AS $function$
declare
  v_system_owner constant uuid := '00000000-0000-0000-0000-524149445359'::uuid;
  v_day date;
  v_now timestamptz;
  v_target record;
  v_variant public.canonical_raid_variants%rowtype;
  v_rule public.raid_room_lifecycle_rules%rowtype;
  v_instance_id uuid;
  v_room_id uuid;
  v_was_existing boolean;
  v_created integer := 0;
  v_existing integer := 0;
  v_rooms jsonb := '[]'::jsonb;
begin
  if current_setting('transaction_isolation') <> 'read committed' then
    raise exception 'read committed required' using errcode = '25001';
  end if;

  -- private.raid_daily_targets_v1() intentionally requires an authenticated
  -- context. The fixed internal owner is only used as that scheduler identity.
  perform set_config('request.jwt.claim.sub', v_system_owner::text, true);
  v_day := (clock_timestamp() at time zone 'Asia/Tokyo')::date;
  perform pg_advisory_xact_lock(
    hashtextextended('raid_daily_room_generation:' || v_day::text, 0)
  );

  -- Resolve/initialize today's two-target authority once, then freeze the day.
  -- Recheck across midnight so a boundary during the first call cannot leave
  -- the scheduler with a stale date and zero targets.
  loop
    v_day := (clock_timestamp() at time zone 'Asia/Tokyo')::date;
    perform private.raid_daily_targets_v1();
    exit when v_day = (clock_timestamp() at time zone 'Asia/Tokyo')::date;
  end loop;

  select * into v_rule
  from public.raid_room_lifecycle_rules
  where difficulty = 'beginner'
  for update;
  if not found then
    raise exception 'beginner lifecycle rule unavailable' using errcode = '55000';
  end if;

  for v_target in
    select date_jst, first_variant_id as variant_id
    from private.raid_daily_targets
    where date_jst = v_day
    union all
    select date_jst, second_variant_id
    from private.raid_daily_targets
    where date_jst = v_day
  loop
    select * into v_variant
    from public.canonical_raid_variants
    where raid_variant_id = v_target.variant_id
      and is_production_enabled
    for share;
    if not found or v_variant.max_hp is null or v_variant.max_hp <= 0 then
      raise exception 'daily raid variant unavailable: %', v_target.variant_id
        using errcode = '55000';
    end if;

    v_now := clock_timestamp();
    select r.id into v_room_id
    from public.raid_rooms r
    join public.raid_bosses b on b.id = r.raid_boss_instance_id
    where b.rotation_date = v_day
      and b.raid_variant_id = v_target.variant_id
      and r.difficulty_id = 'beginner'
      and b.status = 'ACTIVE'
      and b.current_hp > 0
      and b.expires_at > v_now
      and b.outcome_finalized_at is null
    order by r.created_at, r.id
    limit 1;

    if found then
      v_was_existing := true;
      v_existing := v_existing + 1;
    else
      v_was_existing := false;
      if (
        select count(*)
        from public.raid_rooms r
        join public.raid_bosses b on b.id = r.raid_boss_instance_id
        where r.difficulty_id = 'beginner'
          and b.status = 'ACTIVE'
          and b.current_hp > 0
          and b.expires_at > v_now
          and b.outcome_finalized_at is null
      ) >= v_rule.max_active_rooms then
        raise exception 'active beginner room limit reached' using errcode = '55000';
      end if;

      v_instance_id := gen_random_uuid();
      insert into public.raid_bosses(
        id, boss_id, boss_master_id, current_hp, max_hp, base_id, status,
        spawned_at, expires_at, cycle_id, rotation_date, raid_variant_id, raid_day_key
      ) values (
        v_instance_id,
        v_variant.raid_variant_id,
        v_variant.raid_variant_id,
        v_variant.max_hp,
        v_variant.max_hp,
        lower(v_variant.area_id),
        'ACTIVE',
        v_now,
        v_now + make_interval(hours => v_rule.duration_hours),
        gen_random_uuid(),
        v_day,
        v_variant.raid_variant_id,
        'DAILY:' || v_day::text || ':' || v_variant.raid_variant_id
      );

      v_room_id := gen_random_uuid();
      insert into public.raid_rooms(
        id, raid_boss_instance_id, owner_user_id, difficulty_id, created_at
      ) values (
        v_room_id, v_instance_id, v_system_owner, 'beginner', v_now
      );
      insert into public.raid_room_members(room_id, user_id, joined_at)
      values (v_room_id, v_system_owner, v_now);
      v_created := v_created + 1;
    end if;

    v_rooms := v_rooms || jsonb_build_array(jsonb_build_object(
      'dateJst', v_day,
      'variantId', v_target.variant_id,
      'roomId', v_room_id,
      'created', not v_was_existing
    ));
  end loop;

  return jsonb_build_object(
    'dateJst', v_day,
    'created', v_created,
    'existing', v_existing,
    'rooms', v_rooms
  );
end;
$function$
;
CREATE OR REPLACE FUNCTION public.prepare_current_tutorial_formation()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid:=auth.uid(); v_step text; v_party text[]; v_guaranteed_master text;
  v_grant jsonb; v_saved jsonb; v_defense jsonb;
begin
  if v_user_id is null then raise exception 'authentication required' using errcode='42501'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text,0));
  select step_id into v_step from public.tutorial_progress where user_id=v_user_id for update;
  if v_step in ('DISPATCH','FREE_INSTANT','TUTORIAL_BATTLE','RULE_GUIDE','COMPLETE','AUTHENTICATION') then
    return jsonb_build_object('status','already_advanced','tutorial_step',v_step);
  end if;
  if v_step<>'AUTO_FORMATION' then raise exception 'tutorial formation is unavailable' using errcode='23514'; end if;

  select canonical_payload into v_grant from public.user_lifetime_onboarding_grants where user_id=v_user_id;
  if v_grant is not null then
    v_guaranteed_master:=v_grant->>'guaranteed_ssr';
    select array_agg(value order by ordinality) into v_party
    from jsonb_array_elements_text(v_grant->'formation_character_ids') with ordinality picked(value,ordinality);
    if cardinality(v_party)<>5 or (select count(*) from public.user_characters where user_id=v_user_id and character_id=any(v_party))<>5 then
      raise exception 'lifetime tutorial formation cannot be restored' using errcode='23514';
    end if;
  else
    select result->>'character_id' into v_guaranteed_master
    from public.gacha_execution_history history
    cross join lateral jsonb_array_elements(coalesce(history.result_payload->'results','[]'::jsonb)) result
    where history.user_id=v_user_id and history.status='COMPLETED'
      and coalesce((history.result_payload->>'tutorial')::boolean,false)
      and coalesce((result->>'tutorial_slot')::integer,0)=10
    order by history.created_at desc limit 1;
    select array_agg(character_id order by is_guaranteed desc,is_ssr desc,created_at desc) into v_party from (
      select owned.character_id,owned.created_at,(owned.character_id=v_guaranteed_master) is_guaranteed,(master.rarity='SSR') is_ssr
      from public.user_characters owned join public.canonical_character_master master
        on master.version='2026-08-21' and master.character_id=owned.character_id
      where owned.user_id=v_user_id
      order by (owned.character_id=v_guaranteed_master) desc,(master.rarity='SSR') desc,owned.created_at desc limit 5
    ) selected;
  end if;
  if v_guaranteed_master is null then raise exception 'guaranteed tutorial gacha result is required' using errcode='23514'; end if;
  if coalesce(cardinality(v_party),0)<3 then raise exception 'three owned tutorial Characters are required' using errcode='23514'; end if;
  if v_party[1] is distinct from v_guaranteed_master then
    v_party:=array_prepend(v_guaranteed_master,array_remove(v_party,v_guaranteed_master));
    v_party:=v_party[1:5];
  end if;
  v_saved:=public.save_main_formation(v_party);
  v_defense:=public.save_pvp_defense_deck(v_party,'ATTACK_PRIORITY');
  update public.users set favorite_character_id=v_guaranteed_master where id=v_user_id;
  return jsonb_build_object('status','prepared','tutorial_step','AUTO_FORMATION','formation',v_saved || jsonb_build_object('character_ids',to_jsonb(v_party)),
    'defense',v_defense,'leader_character_id',v_guaranteed_master);
end;
$function$
;
CREATE OR REPLACE FUNCTION public.set_main_formation_leader(p_character_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_character_ids text[];
  v_result jsonb;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if nullif(trim(p_character_id), '') is null then
    raise exception 'leader character is required' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text, 0));

  select array_agg(owned.character_id order by
    case when owned.character_id = p_character_id then 0 else 1 end,
    formation.slot)
  into v_character_ids
  from public.user_main_formations formation
  join public.user_characters owned
    on owned.id = formation.user_character_id
   and owned.user_id = v_user_id
  where formation.user_id = v_user_id;

  if coalesce(cardinality(v_character_ids), 0) = 0
     or not (p_character_id = any(v_character_ids)) then
    raise exception 'leader must belong to the current main formation' using errcode = '23514';
  end if;

  v_result := public.save_main_formation(v_character_ids);
  update public.users
  set favorite_character_id = p_character_id
  where id = v_user_id;
  if not found then
    raise exception 'player profile is not initialized' using errcode = 'P0002';
  end if;

  return v_result || jsonb_build_object(
    'status', 'success',
    'leader_character_id', p_character_id
  );
end;
$function$
;
CREATE OR REPLACE FUNCTION public.get_daily_free_gacha_rates()
 RETURNS TABLE(gacha_id text, rarity text, weight numeric, version text)
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
 SELECT v.gacha_id,v.rarity,v.weight,'daily-free-2026-09-12-v1'::text
 FROM (VALUES
 ('CHAR_NORMAL','N',60.7::numeric),('CHAR_NORMAL','R',30),('CHAR_NORMAL','SR',9),('CHAR_NORMAL','SSR',0.3),
 ('SKILL_NORMAL','N',52),('SKILL_NORMAL','R',30),('SKILL_NORMAL','SR',17),('SKILL_NORMAL','SSR',1),
 ('EQUIP_NORMAL','N',49),('EQUIP_NORMAL','R',30),('EQUIP_NORMAL','SR',20),('EQUIP_NORMAL','SSR',1)
 ) AS v(gacha_id,rarity,weight)
$function$
;
CREATE OR REPLACE FUNCTION public.draw_daily_free_gacha_rarity(p_gacha_id text)
 RETURNS text
 LANGUAGE sql
 SET search_path TO 'public'
AS $function$
 SELECT rarity FROM public.get_daily_free_gacha_rates() rates
 WHERE rates.gacha_id=p_gacha_id
 ORDER BY -ln(greatest(random(),0.000000000001))/weight LIMIT 1
$function$
;
CREATE OR REPLACE FUNCTION public.execute_character_gacha(p_user_id uuid, p_gacha_id text, p_pull_count integer, p_currency_type text, p_request_id uuid, p_rate_version text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_gacha record;
  v_user record;
  v_existing record;
  v_history record;
  v_result jsonb := '[]'::jsonb;
  v_response jsonb;
  v_item_id text;
  v_rarity text;
  v_ticket_item_id text;
  v_cost integer := 0;
  v_pity_before integer := 0;
  v_pity_after integer := 0;
  v_today date := (now() at time zone 'Asia/Tokyo')::date;
  v_index integer;
  v_inserted integer;
  v_is_special boolean;
  v_progress jsonb;
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'not authorized';
  end if;
  -- 確率改定前の完了要求は、版が古くても保存結果を返す。再抽選しない。
  if p_currency_type='free' then
    select * into v_history from public.gacha_execution_history
    where user_id=p_user_id and request_id=p_request_id;
    if found then
      if v_history.gacha_id is distinct from p_gacha_id
         or v_history.payment_source is distinct from p_currency_type
         or v_history.pull_count is distinct from p_pull_count then
        raise exception 'request_id was already used for a different gacha request';
      end if;
      if v_history.status='COMPLETED' and v_history.result_payload is not null then
        return v_history.result_payload;
      end if;
    end if;
  end if;
  if p_currency_type = 'free' and p_rate_version is distinct from 'daily-free-2026-09-12-v1' then
    raise exception 'DAILY_FREE_RATE_VERSION_MISMATCH: reload required' using errcode='22023';
  end if;
  if p_request_id is null then raise exception 'request_id is required'; end if;
  if p_pull_count is null or p_pull_count < 1 or p_pull_count > 10 then
    raise exception 'invalid pull count';
  end if;

  select id, gacha_type, cost_cash, cost_diamond into v_gacha
  from public.gacha_masters
  where id = p_gacha_id and gacha_type = 'CHARACTER';
  if not found then raise exception 'character gacha not found'; end if;

  v_is_special := p_gacha_id in ('CHAR_JUSTICE_EVIL_SPECIAL','CHAR_ORDER_CHAOS_SPECIAL');
  if p_gacha_id not in ('CHAR_NORMAL','CHAR_JUSTICE_EVIL_SPECIAL','CHAR_ORDER_CHAOS_SPECIAL') then
    raise exception 'unsupported character gacha';
  end if;
  if v_is_special and (p_currency_type is null or p_currency_type not in ('diamonds','ticket')) then
    raise exception 'SPECIAL_REQUIRES_DIA_OR_TICKET';
  end if;
  if v_is_special and p_pull_count not in (1,10) then raise exception 'SPECIAL_INVALID_PULL_COUNT'; end if;
  if v_is_special and not exists (
    select 1 from public.feature_operating_states
    where feature_key = 'SPECIAL_GACHA' and state = 'OPEN'
  ) then
    raise exception 'special gacha is closed';
  end if;
  if p_currency_type = 'free' and (p_gacha_id <> 'CHAR_NORMAL' or p_pull_count <> 10) then
    raise exception 'daily free is only available as a normal ten-pull';
  end if;
  if p_currency_type not in ('free', 'cash', 'diamonds', 'ticket') then
    raise exception 'invalid currency type';
  end if;

  v_ticket_item_id := case when v_is_special then 'SPECIAL_TICKET_CHARACTER' else 'NORMAL_GACHA_TICKET_CHARACTER' end;
  v_cost := case p_currency_type
    when 'cash' then v_gacha.cost_cash * p_pull_count
    when 'diamonds' then v_gacha.cost_diamond * p_pull_count
    when 'ticket' then p_pull_count
    else 0 end;
  if v_is_special then perform 1 from public.users where id=p_user_id for update; end if;
  select coalesce(current_points, 0) into v_pity_before
  from public.user_gacha_pity_points
  where user_id = p_user_id and pity_master_id = (case when v_is_special then 'pity_banner:'||p_gacha_id else 'pity_special_common' end);
  v_pity_before := coalesce(v_pity_before, 0);

  insert into public.gacha_execution_history (
    user_id, request_id, gacha_id, payment_source, pull_count,
    ticket_item_id, cost_amount, pity_before, pity_after
  ) values (
    p_user_id, p_request_id, p_gacha_id, p_currency_type, p_pull_count,
    case when p_currency_type = 'ticket' then v_ticket_item_id end,
    v_cost, v_pity_before, v_pity_before
  ) on conflict (user_id, request_id) do nothing;
  get diagnostics v_inserted = row_count;

  if v_inserted = 0 then
    select * into v_history from public.gacha_execution_history
    where user_id = p_user_id and request_id = p_request_id for update;
    if v_history.gacha_id <> p_gacha_id
       or v_history.payment_source <> p_currency_type
       or v_history.pull_count <> p_pull_count then
      raise exception 'request_id was already used for a different gacha request';
    end if;
    if v_history.status = 'COMPLETED' and v_history.result_payload is not null then
      return v_history.result_payload;
    end if;
    raise exception 'gacha request is already in progress';
  end if;

  if p_currency_type = 'free' then
    insert into public.user_daily_gacha_claims (user_id, gacha_type, last_claimed_date)
    values (p_user_id, 'CHARACTER', v_today)
    on conflict (user_id, gacha_type) do update
      set last_claimed_date = excluded.last_claimed_date, updated_at = now()
      where public.user_daily_gacha_claims.last_claimed_date < v_today;
    if not found then raise exception 'daily free gacha already claimed'; end if;
  elsif p_currency_type = 'cash' then
    update public.users set cash = cash - v_cost where id = p_user_id and cash >= v_cost;
    if not found then raise exception 'insufficient gacha currency'; end if;
  elsif p_currency_type = 'diamonds' then
    update public.users set neon_diamonds = neon_diamonds - v_cost
    where id = p_user_id and neon_diamonds >= v_cost;
    if not found then raise exception 'insufficient gacha currency'; end if;
  else
    update public.user_items set quantity = quantity - v_cost, updated_at = now()
    where user_id = p_user_id and item_id = v_ticket_item_id and quantity >= v_cost;
    if not found then raise exception 'insufficient gacha tickets'; end if;
  end if;

  for v_index in 1..p_pull_count loop
    v_rarity := case when p_currency_type='free'
      then public.draw_daily_free_gacha_rarity(p_gacha_id)
      else public.draw_gacha_rarity(p_gacha_id) end;
    v_item_id := public.draw_gacha_item(p_gacha_id, v_rarity);
    if v_rarity is null or v_item_id is null then raise exception 'gacha bucket is empty'; end if;

    select id, awakening_level into v_existing
    from public.user_characters
    where user_id = p_user_id and character_id = v_item_id
    for update;

    if found and coalesce(v_existing.awakening_level, 0) < 5 then
      v_progress := public.apply_character_awakening_equivalent(p_user_id, v_existing.id, 1);
      v_result := v_result || jsonb_build_array(jsonb_build_object(
        'type', 'CHARACTER', 'character_id', v_item_id, 'rarity', v_rarity,
        'outcome', v_progress->>'outcome',
        'awakening_progress_added', 1,
        'awakening_level', (v_progress->>'awakening_level')::integer,
        'awakening_progress', (v_progress->>'awakening_progress')::integer,
        'awakening_required', (v_progress->>'awakening_required')::integer));
    elsif found then
      insert into public.user_items (user_id, item_id, quantity)
      values (p_user_id, 'AWAKENING_BOOK', 1)
      on conflict (user_id, item_id) do update
        set quantity = public.user_items.quantity + 1, updated_at = now();
      v_result := v_result || jsonb_build_array(jsonb_build_object(
        'type', 'CHARACTER', 'character_id', v_item_id, 'rarity', v_rarity, 'outcome', 'converted', 'converted_item_id', 'AWAKENING_BOOK', 'converted_quantity', 1));
    else
      insert into public.user_characters (user_id, character_id, level, awakening_level)
      values (p_user_id, v_item_id, 1, 0);
      v_result := v_result || jsonb_build_array(jsonb_build_object(
        'type', 'CHARACTER', 'character_id', v_item_id, 'rarity', v_rarity, 'outcome', 'new'));
    end if;
  end loop;

  if p_currency_type <> 'free' and v_is_special then
    insert into public.user_gacha_pity_points (user_id, pity_master_id, current_points)
    values (p_user_id, (case when v_is_special then 'pity_banner:'||p_gacha_id else 'pity_special_common' end), p_pull_count)
    on conflict (user_id, pity_master_id) do update
      set current_points = public.user_gacha_pity_points.current_points + p_pull_count,
          updated_at = now();
    v_pity_after := v_pity_before + p_pull_count;
  else
    v_pity_after := v_pity_before;
  end if;

  perform public.record_funnel_milestone(p_user_id, 'first_gacha',
    jsonb_build_object('gachaId', p_gacha_id, 'pullCount', p_pull_count));
  select cash, neon_diamonds into v_user from public.users where id = p_user_id;
  v_response := jsonb_build_object(
    'status', 'success', 'request_id', p_request_id, 'results', v_result,
    'cash', v_user.cash, 'diamonds', v_user.neon_diamonds,
    'pity_before', v_pity_before, 'pity_after', v_pity_after);
  if p_currency_type='free' then
    v_response := v_response || jsonb_build_object('rate_version',p_rate_version);
  end if;
  update public.gacha_execution_history
  set pity_after = v_pity_after, result_payload = v_response,
      status = 'COMPLETED', completed_at = now()
  where user_id = p_user_id and request_id = p_request_id;
  return v_response;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.execute_asset_gacha(p_user_id uuid, p_gacha_id text, p_pull_count integer, p_currency_type text, p_request_id uuid, p_rate_version text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_gacha record;
  v_user record;
  v_existing record;
  v_history record;
  v_result jsonb := '[]'::jsonb;
  v_response jsonb;
  v_item_id text;
  v_rarity text;
  v_ticket_item_id text;
  v_cost integer := 0;
  v_pity_before integer := 0;
  v_pity_after integer := 0;
  v_today date := (now() at time zone 'Asia/Tokyo')::date;
  v_index integer;
  v_inserted integer;
  v_is_skill boolean;
  v_is_special boolean;
begin
  if auth.uid() is null or auth.uid() <> p_user_id then raise exception 'not authorized'; end if;
  -- 確率改定前の完了要求は、版が古くても保存結果を返す。再抽選しない。
  if p_currency_type='free' then
    select * into v_history from public.gacha_execution_history
    where user_id=p_user_id and request_id=p_request_id;
    if found then
      if v_history.gacha_id is distinct from p_gacha_id
         or v_history.payment_source is distinct from p_currency_type
         or v_history.pull_count is distinct from p_pull_count then
        raise exception 'request_id was already used for a different gacha request';
      end if;
      if v_history.status='COMPLETED' and v_history.result_payload is not null then
        return v_history.result_payload;
      end if;
    end if;
  end if;
  if p_currency_type = 'free' and p_rate_version is distinct from 'daily-free-2026-09-12-v1' then
    raise exception 'DAILY_FREE_RATE_VERSION_MISMATCH: reload required' using errcode='22023';
  end if;
  if p_request_id is null then raise exception 'request_id is required'; end if;
  if p_pull_count is null or p_pull_count < 1 or p_pull_count > 10 then raise exception 'invalid pull count'; end if;

  select id, gacha_type, cost_cash, cost_diamond into v_gacha
  from public.gacha_masters
  where id = p_gacha_id and gacha_type in ('SKILL', 'EQUIPMENT');
  if not found then raise exception 'asset gacha not found'; end if;
  if p_gacha_id not in ('SKILL_NORMAL', 'SKILL_SPECIAL', 'EQUIP_NORMAL', 'EQUIP_SPECIAL') then
    raise exception 'unsupported asset gacha';
  end if;
  v_is_skill := v_gacha.gacha_type = 'SKILL';
  v_is_special := p_gacha_id in ('SKILL_SPECIAL', 'EQUIP_SPECIAL');
  if v_is_special and (p_currency_type is null or p_currency_type not in ('diamonds','ticket')) then
    raise exception 'SPECIAL_REQUIRES_DIA_OR_TICKET';
  end if;
  if v_is_special and p_pull_count not in (1,10) then raise exception 'SPECIAL_INVALID_PULL_COUNT'; end if;
  if v_is_special and not exists (
    select 1 from public.feature_operating_states
    where feature_key = 'SPECIAL_GACHA' and state = 'OPEN'
  ) then raise exception 'special gacha is closed'; end if;
  if p_currency_type = 'free' and (v_is_special or p_pull_count <> 10) then
    raise exception 'daily free is only available as a normal ten-pull';
  end if;
  if p_currency_type not in ('free', 'cash', 'diamonds', 'ticket') then raise exception 'invalid currency type'; end if;

  v_ticket_item_id := case
    when v_is_skill and v_is_special then 'SPECIAL_TICKET_SKILL'
    when v_is_skill then 'NORMAL_GACHA_TICKET_SKILL'
    when v_is_special then 'SPECIAL_TICKET_EQUIPMENT'
    else 'NORMAL_GACHA_TICKET_EQUIPMENT'
  end;
  v_cost := case p_currency_type
    when 'cash' then v_gacha.cost_cash * p_pull_count
    when 'diamonds' then v_gacha.cost_diamond * p_pull_count
    when 'ticket' then p_pull_count
    else 0 end;
  if v_is_special then perform 1 from public.users where id=p_user_id for update; end if;
  select coalesce(current_points, 0) into v_pity_before
  from public.user_gacha_pity_points
  where user_id = p_user_id and pity_master_id = (case when v_is_special then 'pity_banner:'||p_gacha_id else 'pity_special_common' end);
  v_pity_before := coalesce(v_pity_before, 0);

  insert into public.gacha_execution_history (
    user_id, request_id, gacha_id, payment_source, pull_count,
    ticket_item_id, cost_amount, pity_before, pity_after
  ) values (
    p_user_id, p_request_id, p_gacha_id, p_currency_type, p_pull_count,
    case when p_currency_type = 'ticket' then v_ticket_item_id end,
    v_cost, v_pity_before, v_pity_before
  ) on conflict (user_id, request_id) do nothing;
  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then
    select * into v_history from public.gacha_execution_history
    where user_id = p_user_id and request_id = p_request_id for update;
    if v_history.gacha_id <> p_gacha_id
       or v_history.payment_source <> p_currency_type
       or v_history.pull_count <> p_pull_count then
      raise exception 'request_id was already used for a different gacha request';
    end if;
    if v_history.status = 'COMPLETED' and v_history.result_payload is not null then return v_history.result_payload; end if;
    raise exception 'gacha request is already in progress';
  end if;

  if p_currency_type = 'free' then
    insert into public.user_daily_gacha_claims (user_id, gacha_type, last_claimed_date)
    values (p_user_id, v_gacha.gacha_type, v_today)
    on conflict (user_id, gacha_type) do update
      set last_claimed_date = excluded.last_claimed_date, updated_at = now()
      where public.user_daily_gacha_claims.last_claimed_date < v_today;
    if not found then raise exception 'daily free gacha already claimed'; end if;
  elsif p_currency_type = 'cash' then
    update public.users set cash = cash - v_cost where id = p_user_id and cash >= v_cost;
    if not found then raise exception 'insufficient gacha currency'; end if;
  elsif p_currency_type = 'diamonds' then
    update public.users set neon_diamonds = neon_diamonds - v_cost
    where id = p_user_id and neon_diamonds >= v_cost;
    if not found then raise exception 'insufficient gacha currency'; end if;
  else
    update public.user_items set quantity = quantity - v_cost, updated_at = now()
    where user_id = p_user_id and item_id = v_ticket_item_id and quantity >= v_cost;
    if not found then raise exception 'insufficient gacha tickets'; end if;
  end if;

  for v_index in 1..p_pull_count loop
    v_rarity := case when p_currency_type='free'
      then public.draw_daily_free_gacha_rarity(p_gacha_id)
      else public.draw_gacha_rarity(p_gacha_id) end;
    v_item_id := public.draw_gacha_item(p_gacha_id, v_rarity);
    if v_rarity is null or v_item_id is null then raise exception 'gacha bucket is empty'; end if;

    if v_is_skill then
      select id, plus_val into v_existing from public.user_skills
      where user_id = p_user_id and skill_card_id = v_item_id for update;
      if found and coalesce(v_existing.plus_val, 0) < 10 then
        update public.user_skills set plus_val = coalesce(plus_val, 0) + 1 where id = v_existing.id;
        v_result := v_result || jsonb_build_array(jsonb_build_object(
          'type', 'SKILL', 'item_id', v_item_id, 'rarity', v_rarity, 'outcome', 'limit_break', 'plus_val', coalesce(v_existing.plus_val, 0) + 1));
      elsif found then
        insert into public.user_items (user_id, item_id, quantity)
        values (p_user_id, 'SKILL_MANUAL', 2)
        on conflict (user_id, item_id) do update
          set quantity = public.user_items.quantity + 2, updated_at = now();
        v_result := v_result || jsonb_build_array(jsonb_build_object(
          'type', 'SKILL', 'item_id', v_item_id, 'rarity', v_rarity, 'outcome', 'converted', 'conversion_item_id', 'SKILL_MANUAL', 'conversion_quantity', 2));
      else
        insert into public.user_skills (user_id, skill_card_id, plus_val)
        values (p_user_id, v_item_id, 0);
        v_result := v_result || jsonb_build_array(jsonb_build_object(
          'type', 'SKILL', 'item_id', v_item_id, 'rarity', v_rarity, 'outcome', 'new'));
      end if;
    else
      insert into public.user_equipments (user_id, equipment_id, level, plus_val, random_options)
      values (p_user_id, v_item_id, 1, 0, '[]'::jsonb);
      v_result := v_result || jsonb_build_array(jsonb_build_object(
        'type', 'EQUIPMENT', 'item_id', v_item_id, 'rarity', v_rarity, 'outcome', 'new'));
    end if;
  end loop;

  if p_currency_type <> 'free' and v_is_special then
    insert into public.user_gacha_pity_points (user_id, pity_master_id, current_points)
    values (p_user_id, (case when v_is_special then 'pity_banner:'||p_gacha_id else 'pity_special_common' end), p_pull_count)
    on conflict (user_id, pity_master_id) do update
      set current_points = public.user_gacha_pity_points.current_points + p_pull_count,
          updated_at = now();
    v_pity_after := v_pity_before + p_pull_count;
  else
    v_pity_after := v_pity_before;
  end if;

  perform public.record_funnel_milestone(p_user_id, 'first_gacha',
    jsonb_build_object('gachaId', p_gacha_id, 'pullCount', p_pull_count));
  select cash, neon_diamonds into v_user from public.users where id = p_user_id;
  v_response := jsonb_build_object(
    'status', 'success', 'request_id', p_request_id, 'results', v_result,
    'cash', v_user.cash, 'diamonds', v_user.neon_diamonds,
    'pity_before', v_pity_before, 'pity_after', v_pity_after);
  if p_currency_type='free' then
    v_response := v_response || jsonb_build_object('rate_version',p_rate_version);
  end if;
  update public.gacha_execution_history
  set pity_after = v_pity_after, result_payload = v_response,
      status = 'COMPLETED', completed_at = now()
  where user_id = p_user_id and request_id = p_request_id;
  return v_response;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.get_ranking_self_context(p_category text, p_daily boolean)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
 v_start timestamptz := date_trunc('day',clock_timestamp() at time zone 'Asia/Tokyo') at time zone 'Asia/Tokyo';
 v_end timestamptz := v_start + interval '1 day';
 v_today date := (clock_timestamp() at time zone 'Asia/Tokyo')::date;
 v_season uuid := public.current_ranking_season_id('PVP');
 v_uid uuid := auth.uid(); v_guild uuid; v_result jsonb; v_self_status text;
begin
 if v_uid is null then raise exception 'authentication required' using errcode='42501'; end if;
 if p_daily is null or p_category is null then raise exception 'invalid ranking input' using errcode='22023'; end if;
 select guild_id into v_guild from public.guild_members where user_id=v_uid;
 if p_category='power' then
 with ranked as (
    select ranking.user_id,player.username,player.avatar_url,ranking.total_power current_power,ranking.updated_at,
      member.guild_id,guild.name guild_name,
      dense_rank() over(order by ranking.total_power desc,ranking.updated_at asc) rank_position,
      (player.last_active_at>=v_start and player.last_active_at<v_end) is_daily_active
    from public.user_power_rankings ranking join public.users player on player.id=ranking.user_id
    left join public.guild_members member on member.user_id=ranking.user_id left join public.guilds guild on guild.id=member.guild_id
    where not p_daily or (player.last_active_at>=v_start and player.last_active_at<v_end)
    order by ranking.total_power desc,ranking.updated_at asc

), numbered as (select ranked.*, row_number() over(order by rank_position,user_id) position from ranked), mine as (select * from numbered where user_id=v_uid)
 select jsonb_build_object('self', (select to_jsonb(mine)-'position' from mine),
 'neighbors',coalesce((select jsonb_agg(to_jsonb(n)-'position' order by n.position) from numbered n, mine m where n.position between m.position-2 and m.position+2),'[]'::jsonb)) into v_result;
 elsif p_category='guild_power' then
 with ranked as (
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
    order by score desc,guild_id

), numbered as (select ranked.*, row_number() over(order by rank_position,guild_id) position from ranked), mine as (select * from numbered where guild_id=v_guild)
 select jsonb_build_object('self', (select to_jsonb(mine)-'position' from mine),
 'neighbors',coalesce((select jsonb_agg(to_jsonb(n)-'position' order by n.position) from numbered n, mine m where n.position between m.position-2 and m.position+2),'[]'::jsonb)) into v_result;
 elsif p_category='pvp' then
 with ranked as (
    select row_data.*,dense_rank() over(order by row_data.score desc,row_data.user_id) rank_position from (
      select rank.user_id,player.username,player.avatar_url,coalesce(rank.rank_points,1000) rank_points,
        coalesce(daily.wins,0) daily_wins,coalesce(power.total_power,0) current_power,
        member.guild_id,guild.name guild_name,v_season season_id,
        case when p_daily then coalesce(daily.wins,0) else coalesce(rank.rank_points,1000) end score
      from public.pvp_ranks rank join public.users player on player.id=rank.user_id
      left join public.pvp_daily_wins daily on daily.user_id=rank.user_id and daily.activity_date=v_today
      left join public.user_power_rankings power on power.user_id=rank.user_id
      left join public.guild_members member on member.user_id=rank.user_id left join public.guilds guild on guild.id=member.guild_id
    ) row_data order by score desc,user_id

), numbered as (select ranked.*, row_number() over(order by rank_position,user_id) position from ranked), mine as (select * from numbered where user_id=v_uid)
 select jsonb_build_object('self', (select to_jsonb(mine)-'position' from mine),
 'neighbors',coalesce((select jsonb_agg(to_jsonb(n)-'position' order by n.position) from numbered n, mine m where n.position between m.position-2 and m.position+2),'[]'::jsonb)) into v_result;
 else raise exception 'invalid category' using errcode='22023'; end if;
 v_self_status := case
   when v_result->'self' is not null and v_result->'self'<>'null'::jsonb then 'RANKED'
   when p_category='guild_power' and v_guild is null then 'NO_GUILD'
   when p_category='pvp' and not exists(select 1 from public.pvp_ranks where user_id=v_uid) then 'NO_PVP_RECORD'
   when p_category='power' and not exists(select 1 from public.user_power_rankings where user_id=v_uid) then 'NO_POWER_RECORD'
   when p_category='power' and p_daily and not exists(
     select 1 from public.users where id=v_uid and last_active_at>=v_start and last_active_at<v_end
   ) then 'DAILY_INACTIVE'
   when p_category='guild_power' and p_daily and not exists(
     select 1 from public.guild_members m join public.users u on u.id=m.user_id
       join public.user_power_rankings r on r.user_id=m.user_id
     where m.guild_id=v_guild and u.last_active_at>=v_start and u.last_active_at<v_end
   ) then 'DAILY_INACTIVE'
   else 'NO_RANKING_RECORD' end;
 -- POWER一覧は現在総合力。期間外ACTIVEも隠さず、期間管理の未整合をUIへ返す。
 -- 期間の延長・確定・報酬配布は行わない。CLOSEDを現在順位の期間に流用しない。
 if p_category='power' and not p_daily then
   return v_result || jsonb_build_object('self_status',v_self_status,'updated_at',clock_timestamp())
     || coalesce((select jsonb_build_object('season_id',s.id,'starts_at',s.starts_at,
          'ends_at',s.ends_at,'status',s.status)
        from public.ranking_seasons s
        where s.ranking_type='POWER' and s.status='ACTIVE'
        order by s.starts_at desc limit 1), '{}'::jsonb);
 end if;
 return v_result || jsonb_build_object('self_status',v_self_status,'updated_at',clock_timestamp(), 'starts_at',case when p_daily then v_start else null end,'ends_at',case when p_daily then v_end else null end);
end; $function$
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
CREATE OR REPLACE FUNCTION public.record_post_tutorial_guild_view()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_user uuid:=auth.uid();
begin
  if v_user is null then raise exception 'authentication required' using errcode='42501'; end if;
  if not exists(select 1 from public.tutorial_progress where user_id=v_user and step_id in ('COMPLETE','AUTHENTICATION')) then
    return false;
  end if;
  insert into public.user_funnel_milestones(user_id,milestone,metadata)
  values(v_user,'post_tutorial_guild_view',jsonb_build_object('source','guild','meaning','page_contact'))
  on conflict(user_id,milestone) do nothing;
  return true;
end;
$function$
;
