SET check_function_bodies = false;
SET search_path = public, extensions, pg_catalog;
CREATE OR REPLACE FUNCTION public.admin_respawn_raid_boss(p_boss_id text, p_max_hp integer, p_base_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.raid_bosses
  SET current_hp = p_max_hp,
      max_hp = p_max_hp,
      base_id = p_base_id,
      status = 'ACTIVE',
      cycle_id = gen_random_uuid(),
      expires_at = now() + interval '24 hours'
  WHERE boss_id = p_boss_id;

  DELETE FROM public.raid_damage_logs WHERE boss_id = p_boss_id;
  RETURN jsonb_build_object('status', 'success');
END;
$function$
;
CREATE OR REPLACE FUNCTION public.admin_update_guild(p_guild_id uuid, p_funds numeric, p_level integer, p_xp integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    UPDATE public.guilds SET funds = p_funds, level = p_level, xp = p_xp WHERE id = p_guild_id;
    RETURN jsonb_build_object('status', 'success');
END;
$function$
;
CREATE OR REPLACE FUNCTION public.admin_update_guild_finals(p_guild_id uuid, p_funds_add numeric, p_decorations jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    UPDATE public.guilds SET funds = funds + p_funds_add, unlocked_decorations = p_decorations WHERE id = p_guild_id;
    RETURN jsonb_build_object('status', 'success');
END;
$function$
;
CREATE OR REPLACE FUNCTION public.canonical_equipment_runtime_projection_00171(p_user_id uuid, p_user_character_id uuid)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select public.canonical_equipment_runtime_projection_00170(p_user_id,p_user_character_id)
    || jsonb_build_object('characterId',character_id)
  from public.user_characters
  where id=p_user_character_id and user_id=p_user_id
$function$
;
CREATE OR REPLACE FUNCTION public.canonical_funnel_milestone_satisfied(p_user_id uuid, p_trigger_type text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists(
    select 1 from public.user_funnel_milestones milestone
    where milestone.user_id=p_user_id
      and public.funnel_mission_trigger_type(milestone.milestone)=p_trigger_type
  )
$function$
;
CREATE OR REPLACE FUNCTION public.canonical_guild_member_cap(p_guild_id uuid)
 RETURNS integer
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
 select coalesce((select member_cap from public.canonical_guild_progression_master m join public.guilds g on g.level=m.level where g.id=p_guild_id),10)
$function$
;
CREATE OR REPLACE FUNCTION public.canonical_pvp_expected_score(p_player integer, p_opponent integer)
 RETURNS numeric
 LANGUAGE sql
 IMMUTABLE
AS $function$ select 1::numeric/(1+power(10::numeric,(p_opponent-p_player)::numeric/400)) $function$
;
CREATE OR REPLACE FUNCTION public.is_operations_maintenance_tester()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 select exists(select 1 from public.operations_maintenance_testers
 where user_id=auth.uid() and expires_at>now())
$function$
;
CREATE OR REPLACE FUNCTION public.billing_reserve_order(p_user_id uuid, p_request_id uuid, p_product_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare v_product public.billing_products; v_order public.billing_orders;
begin
  perform 1 from public.users where id=p_user_id for update;
  if not found then raise exception 'USER_NOT_FOUND'; end if;
  select * into v_order from public.billing_orders where user_id=p_user_id and request_id=p_request_id;
  if found then
    if v_order.product_id<>p_product_id then raise exception 'REQUEST_CONFLICT'; end if;
    return to_jsonb(v_order);
  end if;
  select * into v_product from public.billing_products where id=p_product_id and amount_jpy>0;
  if not found then raise exception 'INVALID_PRODUCT'; end if;
  if v_product.purchase_limit>0 and (
    (select count(*) from public.billing_orders where user_id=p_user_id and product_id=p_product_id and status<>'EXPIRED')>=v_product.purchase_limit
    or coalesce((select purchase_count from public.user_shop_purchases where user_id=p_user_id and product_id=p_product_id),0)>=v_product.purchase_limit
  ) then raise exception 'PURCHASE_LIMIT'; end if;
  insert into public.billing_orders(user_id,request_id,product_id,amount_jpy,product_snapshot)
  values(p_user_id,p_request_id,p_product_id,v_product.amount_jpy,to_jsonb(v_product)) returning * into v_order;
  return to_jsonb(v_order);
end $function$
;
CREATE OR REPLACE FUNCTION public.billing_attach_session(p_order_id uuid, p_session_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare v_order public.billing_orders;
begin
 select * into v_order from public.billing_orders where id=p_order_id for update;
 if not found then raise exception 'ORDER_NOT_FOUND'; end if;
 if not public.billing_session_matches(p_order_id,p_session_id) then raise exception 'BILLING_MODE_CONFLICT'; end if;
 if v_order.stripe_session_id is not null and v_order.stripe_session_id<>p_session_id then raise exception 'SESSION_CONFLICT'; end if;
 update public.billing_orders set stripe_session_id=p_session_id where id=p_order_id;
 return jsonb_build_object('order_id',p_order_id,'status',v_order.status);
end $function$
;
CREATE OR REPLACE FUNCTION public.billing_grant_order(p_order_id uuid, p_session_id text, p_amount_jpy integer, p_currency text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare v_order public.billing_orders; v_item jsonb; v_id text; v_qty integer;
 v_present uuid; v_issued timestamptz:=clock_timestamp(); v_days integer; v_expiry timestamptz;
begin
 select * into v_order from public.billing_orders where id=p_order_id for update;
 if not found then raise exception 'ORDER_NOT_FOUND'; end if;
 if not public.billing_session_matches(p_order_id,p_session_id) or p_amount_jpy is distinct from v_order.amount_jpy
 or p_currency is distinct from 'jpy' or (v_order.stripe_session_id is not null and v_order.stripe_session_id<>p_session_id)
 then raise exception 'PAYMENT_MISMATCH'; end if;
 if v_order.status='GRANTED' then return jsonb_build_object('status','GRANTED','duplicate',true,'order_id',p_order_id); end if;
 if v_order.status='EXPIRED' then raise exception 'ORDER_EXPIRED'; end if;
 v_days:=(v_order.product_snapshot->>'validity_days')::integer;
 -- 120日期限のない旧snapshotを新規付与しない。
 if v_days is distinct from 120 then raise exception 'PAID_ASSET_CONTRACT_REQUIRED'; end if;
 perform 1 from public.users where id=v_order.user_id for update;
 if not found then raise exception 'USER_NOT_FOUND'; end if;
 insert into public.billing_grants(order_id,stripe_session_id,user_id,items,created_at)
 values(p_order_id,p_session_id,v_order.user_id,v_order.product_snapshot->'items',v_issued);
 for v_item in select value from jsonb_array_elements(v_order.product_snapshot->'items') loop
  v_id:=v_item->>'itemId'; v_qty:=(v_item->>'quantity')::integer;
  if v_qty is null or v_qty<=0 or v_id='DIA' then raise exception 'INVALID_PAID_ASSET'; end if;
  v_expiry:=v_issued+interval '120 days';
  if v_id='DIAMOND' then
   if not (v_item ? 'validity_days') or ((v_item->>'validity_days')::integer is not null and (v_item->>'validity_days')::integer<>120) then raise exception 'DIA_CONTRACT_REQUIRED'; end if;
   if v_item->>'validity_days' is null then v_expiry:=null; end if;
  end if;
  insert into public.presents(user_id,item_id,quantity,message,status,expire_at)
  values(v_order.user_id,v_id,v_qty,'購入特典: '||(v_order.product_snapshot->>'title'),'UNCLAIMED',v_expiry) returning id into v_present;
  if v_expiry is not null then
  insert into public.billing_asset_lots(order_id,user_id,present_id,item_id,issued_quantity,remaining_quantity,issued_at,expires_at)
  values(p_order_id,v_order.user_id,v_present,v_id,v_qty,v_qty,v_issued,v_expiry);
  end if;
 end loop;
 insert into public.payment_transactions(user_id,product_id,amount,currency,status)
 values(v_order.user_id,v_order.product_id,v_order.amount_jpy,'JPY','COMPLETED');
 insert into public.user_shop_purchases(user_id,product_id,purchase_count,last_purchased_at)
 values(v_order.user_id,v_order.product_id,1,v_issued) on conflict(user_id,product_id)
 do update set purchase_count=public.user_shop_purchases.purchase_count+1,last_purchased_at=excluded.last_purchased_at;
 update public.billing_orders set status='GRANTED',granted_at=v_issued,stripe_session_id=p_session_id where id=p_order_id;
 return jsonb_build_object('status','GRANTED','duplicate',false,'order_id',p_order_id);
end $function$
;
CREATE OR REPLACE FUNCTION public.billing_expire_order(p_order_id uuid, p_session_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare v_order public.billing_orders;
begin
  select * into v_order from public.billing_orders where id=p_order_id for update;
  if not found then raise exception 'ORDER_NOT_FOUND'; end if;
  if not public.billing_session_matches(p_order_id,p_session_id) or (v_order.stripe_session_id is not null and v_order.stripe_session_id<>p_session_id)
    then raise exception 'SESSION_CONFLICT'; end if;
  if v_order.status='PENDING' then update public.billing_orders set status='EXPIRED',stripe_session_id=p_session_id where id=p_order_id; end if;
  return jsonb_build_object('order_id',p_order_id);
end $function$
;
CREATE OR REPLACE FUNCTION public.billing_buy_dia_product(p_user_id uuid, p_request_id uuid, p_product_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare v_product public.billing_products; v_receipt public.billing_shop_receipts; v_item jsonb;
 v_qty integer; v_id text; v_paid jsonb:='[]'; v_lot public.billing_asset_lots; v_remaining integer;
 v_take integer; v_segment jsonb; v_alloc integer; v_cumulative bigint; v_previous integer;
 v_present uuid;
begin
 perform 1 from public.users where id=p_user_id for update;
 if not found then raise exception 'USER_NOT_FOUND'; end if;
 select * into v_receipt from public.billing_shop_receipts where user_id=p_user_id and request_id=p_request_id;
 if found then
  if v_receipt.product_id<>p_product_id then raise exception 'REQUEST_CONFLICT'; end if;
  return jsonb_build_object('success',true,'duplicate',true,'receipt_id',v_receipt.id);
 end if;
 select * into v_product from public.billing_products where id=p_product_id and price_dia>0;
 if not found then raise exception 'INVALID_PRODUCT'; end if;
 update public.users set neon_diamonds=neon_diamonds where id=p_user_id;
 v_remaining:=v_product.price_dia;
 for v_lot in select * from public.billing_asset_lots where user_id=p_user_id and item_id='DIAMOND'
 and claimed_at is not null and remaining_quantity>0 and expires_at>statement_timestamp() order by expires_at,id for update loop
  exit when v_remaining=0;
  v_take:=least(v_remaining,v_lot.remaining_quantity);
  v_paid:=v_paid||jsonb_build_array(jsonb_build_object('id',v_lot.id,'order',v_lot.order_id,'quantity',v_take,'issued',v_lot.issued_at,'expiry',v_lot.expires_at));
  v_remaining:=v_remaining-v_take;
 end loop;
 update public.users set neon_diamonds=neon_diamonds-v_product.price_dia where id=p_user_id and neon_diamonds>=v_product.price_dia;
 if not found then raise exception 'INSUFFICIENT_DIA'; end if;
 for v_item in select value from jsonb_array_elements(v_product.items) loop
  v_id:=v_item->>'itemId'; v_qty:=(v_item->>'quantity')::integer;
  if v_qty is null or v_qty<=0 then raise exception 'INVALID_QUANTITY'; end if;
  v_cumulative:=0; v_previous:=0;
  for v_segment in select value from jsonb_array_elements(v_paid) loop
   v_cumulative:=v_cumulative+(v_segment->>'quantity')::bigint;
   v_alloc:=ceil(v_qty::numeric*v_cumulative/v_product.price_dia)::integer-v_previous;
   v_previous:=v_previous+v_alloc;
   if v_alloc>0 then
    insert into public.presents(user_id,item_id,quantity,message,status,expire_at)
    values(p_user_id,v_id,v_alloc,'ショップ購入: '||v_product.title,'UNCLAIMED',(v_segment->>'expiry')::timestamptz) returning id into v_present;
    insert into public.billing_asset_lots(order_id,user_id,present_id,item_id,issued_quantity,remaining_quantity,issued_at,expires_at,source_lot_id)
    values((v_segment->>'order')::uuid,p_user_id,v_present,v_id,v_alloc,v_alloc,(v_segment->>'issued')::timestamptz,(v_segment->>'expiry')::timestamptz,(v_segment->>'id')::uuid);
   end if;
  end loop;
  if v_qty>v_previous then
   insert into public.presents(user_id,item_id,quantity,message,status,expire_at)
   values(p_user_id,v_id,v_qty-v_previous,'ショップ購入: '||v_product.title,'UNCLAIMED',null);
  end if;
 end loop;
 insert into public.billing_shop_receipts(user_id,request_id,product_id,price_dia,items)
 values(p_user_id,p_request_id,p_product_id,v_product.price_dia,v_product.items) returning * into v_receipt;
 return jsonb_build_object('success',true,'duplicate',false,'receipt_id',v_receipt.id);
end $function$
;
CREATE OR REPLACE FUNCTION public.billing_mark_lot_claimed()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
 if old.status='UNCLAIMED' and new.status='CLAIMED' then
  update public.billing_asset_lots set claimed_at=new.claimed_at where present_id=new.id and claimed_at is null;
 end if;
 return new;
end $function$
;
CREATE OR REPLACE FUNCTION public.billing_apply_lot_delta(p_user uuid, p_item text, p_old bigint, p_new bigint)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_lot public.billing_asset_lots; v_expired bigint:=0; v_spend bigint:=greatest(p_old-p_new,0); v_take bigint;
begin
 for v_lot in select * from public.billing_asset_lots where user_id=p_user and item_id=p_item
 and claimed_at is not null and remaining_quantity>0 order by expires_at,id for update loop
  if v_lot.expires_at<=statement_timestamp() then
   v_expired:=v_expired+v_lot.remaining_quantity;
   update public.billing_asset_lots set expired_quantity=expired_quantity+remaining_quantity,remaining_quantity=0 where id=v_lot.id;
  end if;
 end loop;
 if p_old-v_expired<v_spend then raise exception 'EXPIRED_ASSET_BALANCE'; end if;
 for v_lot in select * from public.billing_asset_lots where user_id=p_user and item_id=p_item
 and claimed_at is not null and remaining_quantity>0 order by expires_at,id for update loop
  exit when v_spend=0;
  v_take:=least(v_spend,v_lot.remaining_quantity);
  update public.billing_asset_lots set remaining_quantity=remaining_quantity-v_take where id=v_lot.id;
  v_spend:=v_spend-v_take;
 end loop;
 return p_new-v_expired;
end $function$
;
CREATE OR REPLACE FUNCTION public.billing_asset_balance_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
 if tg_table_name='users' then
  new.cash:=public.billing_apply_lot_delta(old.id,'CASH',old.cash,new.cash);
 else
  new.quantity:=public.billing_apply_lot_delta(old.user_id,old.item_id,old.quantity,new.quantity);
 end if;
 return new;
end $function$
;
CREATE OR REPLACE FUNCTION public.billing_refresh_paid_assets()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_uid uuid:=auth.uid(); v_result jsonb;
begin
 if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
 update public.users set cash=cash,neon_diamonds=neon_diamonds where id=v_uid;
 update public.user_items set quantity=quantity where user_id=v_uid and item_id in
 (select item_id from public.billing_asset_lots where user_id=v_uid and claimed_at is not null and remaining_quantity>0);
 select coalesce(jsonb_agg(jsonb_build_object('item_id',item_id,'quantity',remaining_quantity,'expires_at',expires_at,'claimed',claimed_at is not null) order by expires_at),'[]')
 into v_result from public.billing_asset_lots where user_id=v_uid and remaining_quantity>0 and expires_at>statement_timestamp();
 return jsonb_build_object('lots',v_result,'dia_paid',coalesce((select sum(remaining_quantity) from public.billing_asset_lots where user_id=v_uid and item_id='DIAMOND' and claimed_at is not null and expires_at>statement_timestamp()),0),'dia_total',(select neon_diamonds from public.users where id=v_uid));
end $function$
;
CREATE OR REPLACE FUNCTION public.billing_session_matches(p_order_id uuid, p_session_id text)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SET search_path TO ''
AS $function$
 select coalesce((select case billing_mode when 'live' then p_session_id ~ '^cs_live_[a-zA-Z0-9]+$'
 else p_session_id ~ '^cs_test_[a-zA-Z0-9]+$' end from public.billing_orders where id=p_order_id),false)
$function$
;
CREATE OR REPLACE FUNCTION public.billing_reserve_order(p_user_id uuid, p_request_id uuid, p_product_id text, p_mode text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare v_existing public.billing_orders; v_result jsonb;
begin
 if p_mode is null or p_mode not in ('sandbox','live') then raise exception 'BILLING_MODE_INVALID'; end if;
 perform 1 from public.users where id=p_user_id for update;
 if not found then raise exception 'USER_NOT_FOUND'; end if;
 select * into v_existing from public.billing_orders where user_id=p_user_id and request_id=p_request_id;
 if found and v_existing.billing_mode<>p_mode then raise exception 'BILLING_MODE_CONFLICT'; end if;
 v_result:=public.billing_reserve_order(p_user_id,p_request_id,p_product_id);
 if v_existing.id is null then
  update public.billing_orders set billing_mode=p_mode where id=(v_result->>'id')::uuid;
 end if;
 return v_result||jsonb_build_object('billing_mode',p_mode);
end $function$
;
CREATE OR REPLACE FUNCTION public.billing_dia_balance_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
 new.neon_diamonds:=public.billing_apply_lot_delta(old.id,'DIAMOND',old.neon_diamonds,new.neon_diamonds);
 return new;
end $function$
;
CREATE OR REPLACE FUNCTION public.accept_friend_request(p_request_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ begin perform public.assert_feature_mutation_allowed('FRIEND'); return public.accept_friend_request_core_20260823(p_request_id); end $function$
;
CREATE OR REPLACE FUNCTION public.accept_friend_request(p_user_id uuid, p_friend_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    UPDATE public.user_friends SET status = 'ACCEPTED', updated_at = now()
    WHERE user_id = p_user_id AND friend_id = p_friend_id;

    UPDATE public.user_friends SET status = 'ACCEPTED', updated_at = now()
    WHERE user_id = p_friend_id AND friend_id = p_user_id;

    RETURN jsonb_build_object('success', true);
END;
$function$
;
CREATE OR REPLACE FUNCTION public.accept_friend_request_core_20260823(p_request_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_user uuid:=auth.uid(); v_request public.friend_requests%rowtype;
begin
 if v_user is null then raise exception 'authentication required' using errcode='42501'; end if;
 select * into v_request from public.friend_requests where id=p_request_id for update;
 if not found or v_request.receiver_id<>v_user or v_request.status<>'PENDING' then raise exception 'request is not acceptable' using errcode='42501'; end if;
 if (select count(*) from public.user_friends where user_id=v_request.sender_id and status='ACCEPTED')>=30
    or (select count(*) from public.user_friends where user_id=v_request.receiver_id and status='ACCEPTED')>=30 then
  raise exception 'friend limit reached' using errcode='23514';
 end if;
 insert into public.user_friends(user_id,friend_id,status) values
  (v_request.sender_id,v_request.receiver_id,'ACCEPTED'),(v_request.receiver_id,v_request.sender_id,'ACCEPTED')
 on conflict(user_id,friend_id) do update set status='ACCEPTED',updated_at=clock_timestamp();
 update public.friend_requests set status='ACCEPTED',resolved_at=clock_timestamp() where id=p_request_id;
 return jsonb_build_object('status','ACCEPTED');
end $function$
;
CREATE OR REPLACE FUNCTION public.acknowledge_ranking_reward_notifications(p_notification_ids uuid[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_uid uuid:=auth.uid();
  v_acknowledged integer:=0;
begin
  if v_uid is null then raise exception 'authentication required' using errcode='42501'; end if;
  if coalesce(cardinality(p_notification_ids),0)=0 then
    return jsonb_build_object('acknowledged',0);
  end if;
  update public.ranking_reward_notifications notification
  set acknowledged_at=clock_timestamp()
  where notification.recipient_user_id=v_uid
    and notification.id=any(p_notification_ids)
    and notification.acknowledged_at is null;
  get diagnostics v_acknowledged=row_count;
  return jsonb_build_object('acknowledged',v_acknowledged);
end;
$function$
;
CREATE OR REPLACE FUNCTION public.activate_gvg_match_session(p_match_session_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_match public.gvg_match_sessions%ROWTYPE;
BEGIN
  SELECT * INTO v_match FROM public.gvg_match_sessions WHERE id = p_match_session_id FOR UPDATE;
  IF NOT FOUND OR v_match.status <> 'CONFIRMED' THEN RAISE EXCEPTION 'GvG match is not confirmed'; END IF;
  IF now() < v_match.scheduled_start_at OR now() >= v_match.scheduled_end_at THEN RAISE EXCEPTION 'GvG match is outside its active window'; END IF;
  IF v_match.guild_a_phase_max_hp < 1 OR v_match.guild_b_phase_max_hp < 1 THEN RAISE EXCEPTION 'GvG phase HP is not initialized'; END IF;
  UPDATE public.gvg_match_sessions SET status = 'ACTIVE' WHERE id = p_match_session_id;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.activate_preopen_guild_power_season()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_season public.ranking_seasons%rowtype;
  v_job_id bigint;
begin
  select season.* into strict v_season
  from public.ranking_seasons season
  join public.ranking_guild_power_season_master master on master.season_id=season.id
  where master.event_key='PREOPEN_GUILD_POWER_2026'
  for update of season;
  perform pg_advisory_xact_lock(hashtextextended('PREOPEN_GUILD_POWER_2026',0));

  if v_season.status='CLOSED' then
    select jobid into v_job_id from cron.job
    where jobname='preopen-guild-power-activate-20260904-jst';
    if v_job_id is not null then perform cron.unschedule(v_job_id); end if;
    return jsonb_build_object('season_id',v_season.id,'status','ALREADY_CLOSED');
  end if;
  if clock_timestamp()<v_season.starts_at then
    return jsonb_build_object('season_id',v_season.id,'status','NOT_STARTED');
  end if;

  -- Only the start-boundary authority may supersede the generic active season.
  update public.ranking_seasons
  set status='CLOSED',updated_at=clock_timestamp()
  where ranking_type='GUILD_POWER' and status='ACTIVE' and id<>v_season.id;
  update public.ranking_seasons
  set status=case when clock_timestamp()<ends_at then 'ACTIVE' else 'FINALIZING' end,
      updated_at=clock_timestamp()
  where id=v_season.id;

  select jobid into v_job_id from cron.job
  where jobname='preopen-guild-power-activate-20260904-jst';
  if v_job_id is not null then perform cron.unschedule(v_job_id); end if;
  return jsonb_build_object(
    'season_id',v_season.id,
    'status',case when clock_timestamp()<v_season.ends_at then 'ACTIVE' else 'FINALIZING' end
  );
end;
$function$
;
CREATE OR REPLACE FUNCTION public.add_test_cash(p_user_id uuid, p_amount integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    UPDATE public.users SET cash = cash + p_amount WHERE id = p_user_id;
    RETURN jsonb_build_object('status', 'success');
END;
$function$
;
CREATE OR REPLACE FUNCTION public.add_test_diamonds(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    UPDATE public.users SET neon_diamonds = neon_diamonds + 50 WHERE id = p_user_id;
    RETURN jsonb_build_object('status', 'success');
END;
$function$
;
CREATE OR REPLACE FUNCTION public.add_test_diamonds(p_user_id uuid, p_amount integer DEFAULT 50)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    UPDATE public.users SET neon_diamonds = neon_diamonds + p_amount WHERE id = p_user_id;
    RETURN jsonb_build_object('status', 'success');
END;
$function$
;
CREATE OR REPLACE FUNCTION public.add_user_vitality(p_user_id uuid, p_amount integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    UPDATE public.users SET vitality = LEAST(vitality + p_amount, 200) WHERE id = p_user_id;
    RETURN jsonb_build_object('status', 'success');
END;
$function$
;
CREATE OR REPLACE FUNCTION public.add_user_xp(p_user_id uuid, p_xp_amount integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'you may only update your own XP' using errcode = '42501';
  end if;
  return public.apply_user_xp(p_user_id, p_xp_amount);
end;
$function$
;
CREATE OR REPLACE FUNCTION public.admin_add_guild_funds(p_guild_id uuid, p_amount numeric)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    UPDATE public.guilds SET funds = funds + p_amount WHERE id = p_guild_id;
    RETURN jsonb_build_object('status', 'success');
END;
$function$
;
CREATE OR REPLACE FUNCTION public.admin_reset_daily_missions(p_user_id uuid, p_mission_ids text[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    UPDATE public.user_missions SET current_progress = 0, status = 'PROGRESS', updated_at = now() WHERE user_id = p_user_id AND mission_id = ANY(p_mission_ids);
    RETURN jsonb_build_object('status', 'success');
END;
$function$
;
CREATE OR REPLACE FUNCTION public.advance_all_ranking_seasons(p_at timestamp with time zone DEFAULT clock_timestamp())
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  return jsonb_build_object(
    'PVP',public.advance_ranking_season('PVP',p_at),
    'RAID',public.advance_ranking_season('RAID',p_at)
  );
end;
$function$
;
CREATE OR REPLACE FUNCTION public.apply_recommended_main_loadout()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid:=auth.uid(); v_party_count integer; v_member record; v_round integer;
  v_skill_id uuid; v_skill_count integer:=0; v_equipment_count integer:=0;
  v_total_power bigint; v_results jsonb;
begin
  if v_user_id is null then raise exception 'authentication required' using errcode='42501'; end if;
  select count(*) into v_party_count from public.user_main_formations where user_id=v_user_id;
  if v_party_count<>5 then raise exception 'Main Formation must contain five Characters' using errcode='23514'; end if;
  v_skill_count:=private.apply_recommended_main_skills_v1(v_user_id);
  v_equipment_count:=private.apply_recommended_main_equipment_v1(v_user_id);
  if v_skill_count=0 or v_equipment_count=0 then
    raise exception 'Main Formation requires at least one Skill and one Equipment' using errcode='23514';
  end if;
  perform public.record_post_tutorial_guide_milestone(v_user_id,'first_main_loadout',jsonb_build_object('skillCount',v_skill_count,'equipmentCount',v_equipment_count));
  v_total_power:=public.refresh_user_power_projection(v_user_id);
  select coalesce(jsonb_agg(jsonb_build_object(
    'characterId',owned.character_id,'userCharacterId',owned.id,
    'skillCount',(select count(*) from public.user_skills skill where skill.user_id=v_user_id and skill.equipped_character_id=owned.id::text),
    'equipmentCount',(select count(*) from public.user_equipments equipment where equipment.user_id=v_user_id and equipment.equipped_character_id=owned.id::text)
  ) order by formation.slot),'[]'::jsonb) into v_results
  from public.user_main_formations formation join public.user_characters owned on owned.id=formation.user_character_id
  where formation.user_id=v_user_id;
  return jsonb_build_object('status','success','skillCount',v_skill_count,'equipmentCount',v_equipment_count,
    'totalPower',v_total_power,'characters',v_results);
end;
$function$
;
CREATE OR REPLACE FUNCTION public.assert_feature_mutation_allowed(p_feature_key text)
 RETURNS void
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
 if public.operations_feature_state('MAINTENANCE')='MAINTENANCE' and not public.is_operations_maintenance_tester() then
  raise exception 'MAINTENANCE: operations are temporarily unavailable' using errcode='55000';
 end if;
 if not exists(select 1 from public.feature_operating_states where feature_key=upper(p_feature_key) and state='OPEN' and mutation_allowed) then
  raise exception 'FEATURE_CLOSED: %',upper(p_feature_key) using errcode='55000';
 end if;
end $function$
;
CREATE OR REPLACE FUNCTION public.canonical_equipment_level_cap(p_plus_val integer)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$
  select case greatest(least(p_plus_val,10),0)
    when 0 then 50 when 1 then 60 when 2 then 70 when 3 then 80 when 4 then 90 else 100
  end
$function$
;
CREATE OR REPLACE FUNCTION public.canonical_pvp_rating_delta(p_player integer, p_opponent integer, p_result text)
 RETURNS integer
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
declare v_expected numeric:=public.canonical_pvp_expected_score(p_player,p_opponent);
begin if p_result='WIN' then return round(32*(1-v_expected)); elsif p_result='LOSS' then return round(16*(0-v_expected)); end if; raise exception 'invalid PvP result' using errcode='22023'; end $function$
;
CREATE OR REPLACE FUNCTION public.canonical_pvp_soft_reset(p_rating integer)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
AS $function$ select greatest(0,1000+floor((p_rating-1000)*0.5)::integer) $function$
;
CREATE OR REPLACE FUNCTION public.can_initialize_maintenance_google_player()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 select coalesce(public.operations_feature_state('MAINTENANCE') = 'MAINTENANCE', false)
   and public.is_operations_maintenance_tester()
   and exists(select 1 from auth.users u where u.id=auth.uid()
     and not coalesce(u.is_anonymous, false) and u.email_confirmed_at is not null)
   and (select count(distinct i.provider)=1 and min(i.provider)='google'
     from auth.identities i where i.user_id=auth.uid() and i.provider in ('google','email'))
$function$
;
CREATE OR REPLACE FUNCTION public.advance_current_tutorial_after_growth()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_user_id uuid:=auth.uid(); v_step text; v_character_id text; v_level integer;
begin
  if v_user_id is null then raise exception 'authentication required' using errcode='42501'; end if;
  select step_id into v_step from public.tutorial_progress where user_id=v_user_id for update;
  if v_step in ('DISPATCH','FREE_INSTANT','TUTORIAL_BATTLE','RULE_GUIDE','COMPLETE','AUTHENTICATION') then
    return jsonb_build_object('status','already_advanced','tutorial_step',v_step);
  end if;
  if v_step<>'AUTO_FORMATION' then raise exception 'tutorial growth is not active' using errcode='23514'; end if;
  if not exists(select 1 from public.user_funnel_milestones where user_id=v_user_id and milestone='first_growth') then
    raise exception 'character growth is required' using errcode='23514';
  end if;
  select result->>'character_id' into v_character_id
  from public.gacha_execution_history history
  cross join lateral jsonb_array_elements(coalesce(history.result_payload->'results','[]'::jsonb)) result
  where history.user_id=v_user_id and history.status='COMPLETED'
    and coalesce((history.result_payload->>'tutorial')::boolean,false)
    and coalesce((result->>'tutorial_slot')::integer,0)=10
  order by history.created_at desc limit 1;
  select level into v_level from public.user_characters where user_id=v_user_id and character_id=v_character_id;
  if coalesce(v_level,0)<7 then raise exception 'tutorial Character must reach level 7' using errcode='23514'; end if;
  return jsonb_build_object('status','ready_for_formation','tutorial_step','AUTO_FORMATION','target_character_id',v_character_id,'level',v_level);
end;
$function$
;
CREATE OR REPLACE FUNCTION public.advance_ranking_season(p_type text, p_at timestamp with time zone DEFAULT clock_timestamp())
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_type text := upper(p_type);
  v_expired public.ranking_seasons%rowtype;
  v_start timestamptz;
  v_end timestamptz;
  v_current_id uuid;
begin
  if v_type='RAID' then return null; end if;
  if v_type not in ('PVP','RAID') then
    raise exception 'unsupported automatic ranking season type' using errcode='22023';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('ranking-season:'||v_type,0));
  -- Explicit Formal Open reservation; never reopen the old calendar-month row.
  if v_type='PVP' and exists(select 1 from public.ranking_seasons where ranking_type='PVP'
    and starts_at='2026-09-15 15:00:00+00' and ends_at='2026-09-30 15:00:00+00'
    and status='PREPARING') then
    if p_at<'2026-09-15 15:00:00+00'::timestamptz then
      raise exception '新シーズンは9月16日 00:00から開始します' using errcode='55000';
    end if;
    if p_at>='2026-09-30 15:00:00+00'::timestamptz then raise exception 'Missed Formal Open activation requires review';end if;
    if exists(select 1 from public.ranking_seasons where ranking_type='PVP' and status in('ACTIVE','FINALIZING')) then raise exception 'Conflicting PVP lifecycle';end if;
    update public.ranking_seasons set status='ACTIVE',updated_at=clock_timestamp()
    where ranking_type='PVP' and starts_at='2026-09-15 15:00:00+00' and status='PREPARING';
  end if;


  select * into v_expired
  from public.ranking_seasons
  where ranking_type=v_type and status='ACTIVE' and ends_at<=p_at
  order by starts_at
  limit 1 for update;

  if found then
    update public.ranking_seasons set status='FINALIZING',updated_at=clock_timestamp()
    where id=v_expired.id;
    if v_type='PVP' then
      perform public.assert_pvp_boundary_replay_continuity(v_expired.id,p_at);
      perform public.finalize_pvp_season_rewards(v_expired.id);
      perform public.reconcile_pvp_after_season_boundary(v_expired.id,p_at);
    else
      perform public.finalize_raid_season_rewards(v_expired.id);
    end if;
    update public.ranking_seasons set status='CLOSED',updated_at=clock_timestamp()
    where id=v_expired.id;
  end if;

  select season.id into v_current_id
  from public.ranking_seasons season
  where season.ranking_type=v_type and season.status='ACTIVE'
    and p_at>=season.starts_at and p_at<season.ends_at
  order by season.starts_at desc limit 1;
  if v_current_id is not null then return v_current_id; end if;

  select bounds.starts_at,bounds.ends_at into v_start,v_end
  from public.ranking_period_bounds(v_type,p_at) bounds;
  insert into public.ranking_seasons(ranking_type,starts_at,ends_at,status)
  values(v_type,v_start,v_end,'ACTIVE')
  on conflict(ranking_type,starts_at) do update set
    ends_at=excluded.ends_at,status='ACTIVE',updated_at=clock_timestamp()
  returning id into v_current_id;
  return v_current_id;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.apply_canonical_guild_exp(p_guild_id uuid, p_exp integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_level integer;v_xp integer;v_required integer;
begin
 if p_exp<0 then raise exception 'guild EXP cannot be negative'; end if;
 select level,xp into v_level,v_xp from public.guilds where id=p_guild_id and not is_disbanded for update;
 if not found then raise exception 'active guild not found'; end if;
 v_xp:=coalesce(v_xp,0)+p_exp;
 while v_level<5 loop
  select required_exp into v_required from public.canonical_guild_progression_master where level=v_level;
  exit when v_xp<v_required;
  v_xp:=v_xp-v_required; v_level:=v_level+1;
 end loop;
 update public.guilds set level=v_level,xp=v_xp where id=p_guild_id;
 return jsonb_build_object('level',v_level,'xp',v_xp,'memberCap',public.canonical_guild_member_cap(p_guild_id));
end $function$
;
CREATE OR REPLACE FUNCTION public.apply_character_awakening_equivalent(p_user_id uuid, p_character_id uuid, p_equivalents integer DEFAULT 1)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_level integer;
  v_progress integer;
  v_remaining integer:=greatest(0,coalesce(p_equivalents,0));
  v_required integer;
  v_advanced integer:=0;
begin
  select coalesce(awakening_level,0),coalesce(awakening_progress,0) into v_level,v_progress
  from public.user_characters where id=p_character_id and user_id=p_user_id for update;
  if not found then raise exception 'owned character not found' using errcode='P0002'; end if;
  if v_level>=5 then
    return jsonb_build_object('outcome','max','awakening_level',5,'awakening_progress',0,'awakening_required',0,'levels_advanced',0);
  end if;
  while v_remaining>0 and v_level<5 loop
    v_progress:=v_progress+1;
    v_remaining:=v_remaining-1;
    v_required:=public.canonical_character_awakening_required(v_level);
    if v_progress>=v_required then
      v_progress:=v_progress-v_required;
      v_level:=v_level+1;
      v_advanced:=v_advanced+1;
      if v_level>=5 then v_progress:=0; end if;
    end if;
  end loop;
  update public.user_characters set awakening_level=v_level,awakening_progress=v_progress where id=p_character_id and user_id=p_user_id;
  return jsonb_build_object(
    'outcome',case when v_advanced>0 then 'awakening' else 'awakening_progress' end,
    'awakening_level',v_level,'awakening_progress',v_progress,
    'awakening_required',public.canonical_character_awakening_required(v_level),
    'levels_advanced',v_advanced,'copy_equivalent_added',p_equivalents);
end $function$
;
CREATE OR REPLACE FUNCTION public.apply_current_player_invitation(p_gift_code text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_invitee uuid:=auth.uid(); v_inviter uuid; v_code text:=upper(btrim(p_gift_code)); v_count integer;
begin
 if v_invitee is null then raise exception 'authentication required' using errcode='42501'; end if;
 if v_code is null or v_code='' then return jsonb_build_object('status','NONE'); end if;
 select id into v_inviter from public.users where gift_code=v_code;
 if v_inviter is null then raise exception 'invitation code not found' using errcode='P0002'; end if;
 if v_inviter=v_invitee then raise exception 'self invitation is not allowed' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended('INVITE:'||v_inviter::text,0));
 if exists(select 1 from public.user_invitations where invitee_user_id=v_invitee) then
  raise exception 'invitee already linked' using errcode='23505';
 end if;
 select count(*) into v_count from public.user_invitations where inviter_user_id=v_inviter;
 if v_count>=10 then raise exception 'invitation limit reached' using errcode='23514'; end if;
 insert into public.user_invitations(inviter_user_id,invitee_user_id,gift_code) values(v_inviter,v_invitee,v_code);
 v_count:=v_count+1;
 insert into public.presents(user_id,item_id,quantity,message,status,expire_at)
 values(v_invitee,'DIAMOND',100,'友達招待コード入力報酬','UNCLAIMED',clock_timestamp()+interval '30 days');
 insert into public.user_missions(user_id,mission_id,current_progress,progress_val,status)
 select v_inviter,m.id,least(v_count,m.target_value),least(v_count,m.target_value),
  case when v_count>=m.target_value then 'CLEAR' else 'PROGRESS' end
 from public.missions m where m.trigger_type='USER_INVITE' and m.is_enabled
 on conflict(user_id,mission_id) do update set current_progress=excluded.current_progress,progress_val=excluded.progress_val,
  status=case when public.user_missions.status='CLAIMED' then 'CLAIMED' else excluded.status end,updated_at=clock_timestamp();
 return jsonb_build_object('status','APPLIED','inviter_user_id',v_inviter,'invite_count',v_count);
end $function$
;
CREATE OR REPLACE FUNCTION public.apply_user_xp(p_user_id uuid, p_xp_amount integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_level integer; v_xp integer; v_required integer; v_leveled boolean:=false;
begin
 if p_xp_amount<0 then raise exception 'XP amount must not be negative' using errcode='22023'; end if;
 select level,xp into v_level,v_xp from public.users where id=p_user_id for update;
 if not found then raise exception 'user not found' using errcode='P0002'; end if;
 if v_level>100 then
  return jsonb_build_object('level',v_level,'xp',v_xp,'leveled_up',false,'level_cap',100,'over_cap_audit',true);
 end if;
 if v_level=100 then
  update public.users set xp=0 where id=p_user_id;
  return jsonb_build_object('level',100,'xp',0,'leveled_up',false,'level_cap',100);
 end if;
 v_xp:=greatest(coalesce(v_xp,0),0)+p_xp_amount;
 while v_level<100 loop
  select required_exp into v_required from public.canonical_user_level_master where version='2026-08-22' and level=v_level;
  exit when v_required is null or v_required=0 or v_xp<v_required;
  v_xp:=v_xp-v_required; v_level:=v_level+1; v_leveled:=true;
 end loop;
 if v_level=100 then v_xp:=0; end if;
 update public.users set level=v_level,xp=v_xp where id=p_user_id;
 return jsonb_build_object('level',v_level,'xp',v_xp,'leveled_up',v_leveled,'level_cap',100);
end $function$
;
CREATE OR REPLACE FUNCTION public.assert_pvp_boundary_replay_continuity(p_season_id uuid, p_transition_at timestamp with time zone)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_season public.ranking_seasons%rowtype;
  v_events integer;
  v_event_users integer;
  v_updated_users integer;
  v_invalid integer;
begin
  select * into strict v_season from public.ranking_seasons where id=p_season_id;

  with events as (
    select replay.id,replay.requester_user_id user_id,replay.finalized_at,
      replay.finalization_result->>'winner' winner,
      (replay.finalization_result->>'oldRating')::integer declared_old,
      (replay.finalization_result->>'opponentRating')::integer opponent_rating,
      (replay.finalization_result->>'rankDelta')::integer rank_delta,
      (replay.finalization_result->>'newRankPoints')::integer new_rank,
      row_number() over(partition by replay.requester_user_id order by replay.finalized_at,replay.id) event_no,
      lag((replay.finalization_result->>'newRankPoints')::integer)
        over(partition by replay.requester_user_id order by replay.finalized_at,replay.id) previous_new
    from public.battle_replay_sessions replay
    where replay.battle_mode='PVP' and replay.finalization_status='FINALIZED'
      and replay.finalized_at>=v_season.ends_at and replay.finalized_at<p_transition_at
  ), per_user as (
    select event.user_id,count(*) event_count,
      count(*) filter(where event.winner='PLAYER') win_count,
      max(event.new_rank) filter(where event.event_no=1) first_new,
      max(event.new_rank) filter(where event.finalized_at=(
        select max(last_event.finalized_at) from events last_event where last_event.user_id=event.user_id
      )) last_new,
      max(event.finalized_at) last_finalized,
      count(*) filter(where event.winner is null or event.declared_old is null
        or event.opponent_rating is null or event.rank_delta is null or event.new_rank is null) incomplete,
      count(*) filter(where event.event_no>1 and (
        event.new_rank<>greatest(event.previous_new+event.rank_delta,0)
        or event.declared_old<>event.previous_new)) discontinuities
    from events event group by event.user_id
  )
  select
    (select count(*) from events),
    (select count(*) from per_user),
    (select count(*) from public.pvp_ranks rank where rank.updated_at>=v_season.ends_at),
    (select count(*) from per_user summary
      left join public.pvp_ranks rank on rank.user_id=summary.user_id
      where summary.incomplete<>0 or summary.discontinuities<>0 or summary.first_new=0
        or rank.user_id is null or rank.rank_points<>summary.last_new
        or rank.updated_at>summary.last_finalized
        or rank.daily_wins<summary.win_count or rank.season_wins<summary.win_count)
      + (select count(*) from public.pvp_ranks rank
        where rank.updated_at>=v_season.ends_at
          and not exists(select 1 from per_user summary where summary.user_id=rank.user_id))
  into v_events,v_event_users,v_updated_users,v_invalid;

  if v_invalid<>0 or v_event_users<>v_updated_users then
    raise exception 'PVP boundary replay continuity cannot be proven: events %, users %, updated %, invalid %',
      v_events,v_event_users,v_updated_users,v_invalid using errcode='23514';
  end if;
  return v_events;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.audit_feature_operating_state_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
 if old.state is distinct from new.state then
  insert into public.operations_feature_state_audit(feature_key,old_state,new_state,actor)
  values(new.feature_key,old.state,new.state,auth.uid());
 end if;
 new.updated_at:=clock_timestamp();
 return new;
end $function$
;
CREATE OR REPLACE FUNCTION public.awaken_character(p_character_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid:=auth.uid();
  v_level integer;
  v_result jsonb;
begin
  if v_user_id is null then raise exception 'authentication required' using errcode='42501'; end if;
  select coalesce(awakening_level,0) into v_level from public.user_characters where id=p_character_id and user_id=v_user_id for update;
  if not found then raise exception 'owned character not found' using errcode='P0002'; end if;
  if v_level>=5 then raise exception 'character awakening is already at maximum' using errcode='23514'; end if;
  update public.user_items set quantity=quantity-1,updated_at=now()
  where user_id=v_user_id and item_id='AWAKENING_BOOK' and quantity>=1;
  if not found then raise exception 'insufficient Awakening Book' using errcode='23514'; end if;
  v_result:=public.apply_character_awakening_equivalent(v_user_id,p_character_id,1);
  return jsonb_build_object('status','success','consumed_item_id','AWAKENING_BOOK','consumed_quantity',1)||v_result;
end $function$
;
CREATE OR REPLACE FUNCTION public.begin_gvg_attack(p_match_session_id uuid)
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
  return public.begin_gvg_attack_core_20260817(p_match_session_id);
end;
$function$
;
CREATE OR REPLACE FUNCTION public.begin_gvg_attack_core_20260817(p_match_session_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID := auth.uid();
  v_match public.gvg_match_sessions%ROWTYPE;
  v_guild_id UUID;
  v_attacker_side TEXT;
  v_target_side TEXT;
  v_last_target_id UUID;
  v_target public.gvg_match_member_snapshots%ROWTYPE;
  v_attack_id UUID;
  v_vitality INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication is required';
  END IF;

  SELECT * INTO v_match
  FROM public.gvg_match_sessions
  WHERE id = p_match_session_id
  FOR UPDATE;

  IF NOT FOUND OR v_match.status <> 'ACTIVE' THEN
    RAISE EXCEPTION 'The GvG match is not active';
  END IF;
  IF now() >= v_match.scheduled_end_at THEN
    RAISE EXCEPTION 'The GvG match has ended';
  END IF;

  SELECT guild_id INTO v_guild_id
  FROM public.guild_members
  WHERE user_id = v_user_id;
  IF v_guild_id IS NULL THEN
    RAISE EXCEPTION 'Guild membership is required';
  END IF;

  IF v_match.guild_a_id = v_guild_id THEN
    v_attacker_side := 'A';
    v_target_side := 'B';
  ELSIF v_match.guild_b_id = v_guild_id THEN
    v_attacker_side := 'B';
    v_target_side := 'A';
  ELSE
    RAISE EXCEPTION 'You are not a member of this GvG match';
  END IF;

  PERFORM public.sync_and_recover_vitality_and_pvp_points(v_user_id);
  SELECT vitality INTO v_vitality FROM public.users WHERE id = v_user_id FOR UPDATE;
  IF COALESCE(v_vitality, 0) < 20 THEN
    RAISE EXCEPTION 'Insufficient AP';
  END IF;

  SELECT defender_snapshot_id INTO v_last_target_id
  FROM public.gvg_attack_logs
  WHERE match_session_id = p_match_session_id
    AND attacker_user_id = v_user_id
    AND battle_result <> 'PENDING'
  ORDER BY accepted_at DESC
  LIMIT 1;

  SELECT * INTO v_target
  FROM public.gvg_match_member_snapshots
  WHERE match_session_id = p_match_session_id
    AND side = v_target_side
    AND (v_last_target_id IS NULL OR id <> v_last_target_id)
  ORDER BY random()
  LIMIT 1;

  IF NOT FOUND THEN
    SELECT * INTO v_target
    FROM public.gvg_match_member_snapshots
    WHERE match_session_id = p_match_session_id
      AND side = v_target_side
    ORDER BY random()
    LIMIT 1;
  END IF;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No defense target is available';
  END IF;

  UPDATE public.users SET vitality = vitality - 20 WHERE id = v_user_id;

  INSERT INTO public.gvg_attack_logs (
    match_session_id, attacker_user_id, attacker_guild_id, defender_snapshot_id,
    battle_result, raw_damage, applied_damage, win_damage_multiplier, accepted_at
  ) VALUES (
    p_match_session_id, v_user_id, v_guild_id, v_target.id,
    'PENDING', 0, 0, 1.00, now()
  ) RETURNING id INTO v_attack_id;

  RETURN jsonb_build_object(
    'attack_id', v_attack_id,
    'match_session_id', p_match_session_id,
    'attacker_side', v_attacker_side,
    'remaining_ap', v_vitality - 20,
    'defender_snapshot_id', v_target.id,
    'defense_deck', v_target.defense_deck,
    'defense_is_npc', v_target.defense_is_npc,
    'npc_power', v_target.npc_power
  );
END;
$function$
;
CREATE OR REPLACE FUNCTION public.build_server_battle_snapshot(p_user_id uuid, p_character_ids text[], p_team text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_base jsonb; v_result jsonb;
begin
  v_base := public.build_server_battle_snapshot_00168(p_user_id,p_character_ids,p_team);
  select jsonb_agg(
    jsonb_set(
      jsonb_set(unit.value || (projection.value-'_equipmentUtilityCorrection'),'{stats,spd}',
        to_jsonb((unit.value#>>'{stats,spd}')::integer+coalesce((projection.value#>>'{_equipmentUtilityCorrection,spd}')::integer,0))),
      '{stats,luk}',to_jsonb((unit.value#>>'{stats,luk}')::integer+coalesce((projection.value#>>'{_equipmentUtilityCorrection,luk}')::integer,0))
    ) || jsonb_build_object('characterId',owned.character_id,'level',owned.level,
      'awakeningLevel',owned.awakening_level,'rarity',master.rarity) order by unit.ordinality)
  into v_result
  from jsonb_array_elements(v_base) with ordinality unit(value,ordinality)
  join public.user_characters owned on owned.user_id=p_user_id
    and owned.id=regexp_replace(unit.value->>'id','^[^_]+_','')::uuid
  join public.canonical_character_master master on master.version='2026-08-21'
    and master.character_id=owned.character_id
  cross join lateral (select public.canonical_equipment_runtime_projection(
    p_user_id,regexp_replace(unit.value->>'id','^[^_]+_','')::uuid
  ) value) projection;
  if coalesce(jsonb_array_length(v_result),0)<>coalesce(jsonb_array_length(v_base),0) then
    raise exception 'battle snapshot presentation metadata is incomplete' using errcode='23503';
  end if;
  return coalesce(v_result,'[]'::jsonb);
end $function$
;
CREATE OR REPLACE FUNCTION public.build_server_battle_snapshot_00168(p_user_id uuid, p_character_ids text[], p_team text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_requested text[]:=coalesce(array_remove(p_character_ids,null),array[]::text[]); v_snapshot jsonb; begin
 if p_user_id is null or p_team not in ('PLAYER','ENEMY') then raise exception 'invalid battle snapshot request' using errcode='22023'; end if;
 if cardinality(v_requested) not between 1 and 5 or cardinality(v_requested)<>(select count(distinct value) from unnest(v_requested) value) then raise exception 'invalid battle formation' using errcode='22023'; end if;
 with requested(character_ref,ordinality) as (select value,ordinality from unnest(v_requested) with ordinality picked(value,ordinality)), base as (select owned.id,owned.character_id,requested.ordinality,master.display_name,master.attribute,stats.* from requested join public.user_characters owned on owned.user_id=p_user_id and (owned.id::text=requested.character_ref or owned.character_id=requested.character_ref) join public.canonical_character_master master on master.version='2026-08-21' and master.character_id=owned.character_id cross join lateral public.canonical_character_stats(owned.character_id,owned.level,owned.awakening_level) stats), resolved as (select base.*,coalesce(eq.stats,'{"hp":0,"atk":0,"def":0,"spd":0,"luk":0}'::jsonb) equipment_stats,coalesce(eq.loadout,'[]'::jsonb) equipment,coalesce(sk.loadout,'[]'::jsonb) skills from base left join lateral (select jsonb_build_object('hp',coalesce(sum(floor((master.base_stats->>'hp')::numeric*public.equipment_level_battle_scale(coalesce(owned.level,1))*public.canonical_equipment_lb_multiplier(owned.plus_val))),0),'atk',coalesce(sum(floor((master.base_stats->>'atk')::numeric*public.equipment_level_battle_scale(coalesce(owned.level,1))*public.canonical_equipment_lb_multiplier(owned.plus_val))),0),'def',coalesce(sum(floor((master.base_stats->>'def')::numeric*public.equipment_level_battle_scale(coalesce(owned.level,1))*public.canonical_equipment_lb_multiplier(owned.plus_val))),0),'spd',coalesce(sum((master.base_stats->>'spd')::integer),0),'luk',coalesce(sum((master.base_stats->>'luk')::integer),0)) stats,jsonb_agg(jsonb_build_object('instanceId',owned.id,'equipmentId',master.equipment_id,'level',owned.level,'plusValue',greatest(least(coalesce(owned.plus_val,0),10),0),'fixedOptions',public.canonical_equipment_lb_options(master.category,owned.plus_val))) loadout from public.user_equipments owned join public.canonical_equipment_master master on master.version='2026-08-21' and master.equipment_id=coalesce(nullif(owned.equipment_id,''),owned.equipment_master_id) where owned.user_id=p_user_id and owned.equipped_character_id=base.id::text and (master.exclusive_character_id is null or master.exclusive_character_id=base.character_id)) eq on true left join lateral (select jsonb_agg(jsonb_build_object('id',master.skill_id,'name',master.display_name,'skillId',master.skill_id,'activationType',master.activation_type,'cooldown',master.cooldown,'availableFromRound',master.available_from_round,'target',master.target,'effects',master.effects,'exclusiveCharacterId',master.exclusive_character_id,'slotIndex',owned.slot_index,'plusValue',greatest(least(coalesce(owned.plus_val,0),10),0)) order by owned.slot_index) loadout from public.user_skills owned join public.canonical_skill_master master on master.version='2026-08-21' and master.skill_id=owned.skill_card_id where owned.user_id=p_user_id and owned.equipped_character_id=base.id::text and owned.slot_index between 0 and public.canonical_skill_slot_count((select awakening_level from public.user_characters where id=base.id))-1 and (master.exclusive_character_id is null or master.exclusive_character_id=base.character_id)) sk on true) select jsonb_agg(jsonb_build_object('id',lower(p_team)||'_'||id::text,'name',display_name,'team',p_team,'alignment',attribute,'stats',jsonb_build_object('hp',greatest(hp+(equipment_stats->>'hp')::integer,1),'atk',greatest(atk+(equipment_stats->>'atk')::integer,0),'def',greatest(def+(equipment_stats->>'def')::integer,0),'spd',greatest(spd+(equipment_stats->>'spd')::integer,0),'luk',greatest(luk+(equipment_stats->>'luk')::integer,0)),'equipment',equipment,'equippedSkillRefs',skills,'skills',skills) order by ordinality) into v_snapshot from resolved; if coalesce(jsonb_array_length(v_snapshot),0)<>cardinality(v_requested) then raise exception 'battle formation contains an unsupported or unowned character' using errcode='23503'; end if; return v_snapshot; end $function$
;
CREATE OR REPLACE FUNCTION public.buy_avatar_part(p_user_id uuid, p_part_id text, p_currency_type text, p_price integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_user RECORD;
BEGIN
    SELECT cash, neon_diamonds INTO v_user FROM public.users WHERE id = p_user_id;

    IF p_currency_type = 'CASH' THEN
        IF v_user.cash < p_price THEN
            RETURN jsonb_build_object('error', 'キャッシュが不足しています。');
        END IF;
        UPDATE public.users SET cash = cash - p_price WHERE id = p_user_id;
    ELSIF p_currency_type = 'DIAMOND' THEN
        IF v_user.neon_diamonds < p_price THEN
            RETURN jsonb_build_object('error', 'ダイヤが不足しています。');
        END IF;
        UPDATE public.users SET neon_diamonds = neon_diamonds - p_price WHERE id = p_user_id;
    ELSE
        RETURN jsonb_build_object('error', '不正な通貨タイプです。');
    END IF;

    RETURN jsonb_build_object('status', 'success');
END;
$function$
;
CREATE OR REPLACE FUNCTION public.buy_guild_decoration(p_user_id uuid, p_guild_id uuid, p_decoration_id text, p_cost integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_guild_cash INTEGER;
BEGIN
    SELECT cash INTO v_guild_cash FROM public.guilds WHERE id = p_guild_id;
    IF v_guild_cash IS NULL OR v_guild_cash < p_cost THEN
        RETURN jsonb_build_object('error', 'ギルド資金が不足しています。');
    END IF;

    INSERT INTO public.guild_decorations (guild_id, decoration_id)
    VALUES (p_guild_id, p_decoration_id);

    UPDATE public.guilds SET cash = cash - p_cost WHERE id = p_guild_id;

    RETURN jsonb_build_object('status', 'success');
END;
$function$
;
CREATE OR REPLACE FUNCTION public.buy_guild_decoration_v2(p_guild_id uuid, p_type text, p_item_id text, p_cost bigint)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_role text; v_funds bigint; v_list jsonb; v_expected_cost bigint;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication is required'; END IF;
  SELECT role INTO v_role FROM public.guild_members WHERE guild_id = p_guild_id AND user_id = auth.uid();
  IF COALESCE(v_role, '') NOT IN ('MASTER', 'SUB_MASTER') THEN RAISE EXCEPTION 'Only guild masters and submasters can purchase guild items'; END IF;
  v_expected_cost := CASE p_item_id
    WHEN 'bg_neon_kabukicho' THEN 5000 WHEN 'bg_industrial_docks' THEN 10000
    WHEN 'banner_neon_reign' THEN 3000 WHEN 'banner_kabukicho_king' THEN 8000 ELSE NULL END;
  IF p_type NOT IN ('DECORATION', 'BANNER') OR v_expected_cost IS NULL OR p_cost <> v_expected_cost
     OR (p_type = 'DECORATION' AND p_item_id NOT IN ('bg_neon_kabukicho', 'bg_industrial_docks'))
     OR (p_type = 'BANNER' AND p_item_id NOT IN ('banner_neon_reign', 'banner_kabukicho_king'))
  THEN RAISE EXCEPTION 'Invalid guild item purchase'; END IF;
  SELECT funds INTO v_funds FROM public.guilds WHERE id = p_guild_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Guild not found'; END IF;
  IF v_funds < v_expected_cost THEN RETURN jsonb_build_object('error', 'Insufficient guild funds'); END IF;
  IF p_type = 'DECORATION' THEN
    SELECT COALESCE(unlocked_decorations, '[]'::jsonb) INTO v_list FROM public.guilds WHERE id = p_guild_id;
    IF v_list ? p_item_id THEN RETURN jsonb_build_object('error', 'Guild item already owned'); END IF;
    UPDATE public.guilds SET funds = funds - v_expected_cost, unlocked_decorations = v_list || to_jsonb(p_item_id) WHERE id = p_guild_id;
  ELSE
    SELECT COALESCE(unlocked_banners, '[]'::jsonb) INTO v_list FROM public.guilds WHERE id = p_guild_id;
    IF v_list ? p_item_id THEN RETURN jsonb_build_object('error', 'Guild item already owned'); END IF;
    UPDATE public.guilds SET funds = funds - v_expected_cost, unlocked_banners = v_list || to_jsonb(p_item_id) WHERE id = p_guild_id;
  END IF;
  RETURN jsonb_build_object('status', 'success');
END;
$function$
;
CREATE OR REPLACE FUNCTION public.buy_normal_shop_product(p_user_id uuid, p_product_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ begin perform public.assert_feature_mutation_allowed('SHOP'); return public.buy_normal_shop_product_core_20260823(p_user_id,p_product_id); end $function$
;
CREATE OR REPLACE FUNCTION public.buy_normal_shop_product_core_20260823(p_user_id uuid, p_product_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- ショップ商品ロジック
    RETURN jsonb_build_object('success', true);
END;
$function$
;
CREATE OR REPLACE FUNCTION public.calculate_user_character_power(p_user_id uuid, p_user_character_id uuid)
 RETURNS bigint
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  with base as (
    select owned.id,owned.character_id,stats.hp,stats.atk,stats.def
    from public.user_characters owned
    cross join lateral public.canonical_character_stats(owned.character_id,owned.level,owned.awakening_level) stats
    where owned.user_id=p_user_id and owned.id=p_user_character_id
  ), equipment as (
    select coalesce(sum(
      public.canonical_equipment_flat_stat((master.base_stats->>'hp')::integer,coalesce(owned.level,1),coalesce(owned.plus_val,0))
      +public.canonical_equipment_flat_stat((master.base_stats->>'atk')::integer,coalesce(owned.level,1),coalesce(owned.plus_val,0))
      +public.canonical_equipment_flat_stat((master.base_stats->>'def')::integer,coalesce(owned.level,1),coalesce(owned.plus_val,0))
    ),0)::bigint value
    from base join public.user_equipments owned on owned.user_id=p_user_id and owned.equipped_character_id=base.id::text
    join public.canonical_equipment_master master on master.version='2026-08-21'
      and master.equipment_id=coalesce(nullif(owned.equipment_id,''),owned.equipment_master_id)
      and (master.exclusive_character_id is null or master.exclusive_character_id=base.character_id)
  ) select coalesce((select hp+atk+def+equipment.value from base cross join equipment),0)
$function$
;
CREATE OR REPLACE FUNCTION public.capture_lifetime_onboarding_grant_after_formation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if new.step_id='DISPATCH' and old.step_id is distinct from 'DISPATCH' then
    perform public.capture_current_lifetime_onboarding_grant(new.user_id);
  end if;
  return new;
end;
$function$
;
