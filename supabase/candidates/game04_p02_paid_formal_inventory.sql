-- GAME04 dev only. New versioned paid orders; no conversion of historical assets.
-- Apply after PR31 wrappers/auth/catalog. Keep existing free reward and legacy paid paths.
begin;
create or replace function public.game04_paid_item_path(p_item text) returns text[]
language sql immutable set search_path='' as $$
 select case p_item
 when 'RAID_UNLOCK_TICKET' then array['materials','unlock']
 when 'ENERGY_DRINK' then array['energyDrinks']
 when 'SKILL_LB_PART' then array['materials','skill']
 when 'EQUIP_LB_PART' then array['materials','equipmentLb']
 when 'SOUL_SELECTOR_SSR' then array['growthInventory','soulSelectors','SSR']
 when 'CHAR_EXP_XL' then array['growthInventory','expItems','character','xlarge']
 when 'EQUIP_EXP_XL' then array['growthInventory','expItems','equipment','xlarge']
 else null end;
$$;
revoke all on function public.game04_paid_item_path(text) from public,anon,authenticated;
grant execute on function public.game04_paid_item_path(text) to service_role;

create or replace function public.game04_formal_paid_balance_trigger() returns trigger
language plpgsql security definer set search_path='' as $$
declare item text; path text[]; before_qty bigint; after_qty bigint; expired bigint; paid bigint; spend bigint; take_qty bigint; lot public.billing_asset_lots;
begin
 for item in select distinct l.item_id from public.billing_asset_lots l
 join public.presents p on p.id=l.present_id
 where l.user_id=new.user_id and l.claimed_at is not null and l.remaining_quantity>0
 and p.source_kind='GAME04_PAID_FORMAL' loop
  path:=public.game04_paid_item_path(item);
  if path is null then raise exception 'UNSUPPORTED_PAID_FORMAL_ITEM'; end if;
  if jsonb_typeof(old.state#>path) is distinct from 'number' or jsonb_typeof(new.state#>path) is distinct from 'number' then raise exception 'INVALID_PAID_FORMAL_INVENTORY';end if;
  before_qty:=(old.state#>>path)::bigint; after_qty:=(new.state#>>path)::bigint;
  if before_qty<0 or after_qty<0 then raise exception 'INVALID_PAID_FORMAL_INVENTORY';end if;
  expired:=0;paid:=0;spend:=greatest(before_qty-after_qty,0);
  for lot in select l.* from public.billing_asset_lots l join public.presents p on p.id=l.present_id
   where l.user_id=new.user_id and l.item_id=item and l.claimed_at is not null and l.remaining_quantity>0 and p.source_kind='GAME04_PAID_FORMAL'
   order by l.expires_at,l.id for update of l loop
   if lot.expires_at<=statement_timestamp() then
    expired:=expired+lot.remaining_quantity;
    update public.billing_asset_lots set expired_quantity=expired_quantity+remaining_quantity,remaining_quantity=0 where id=lot.id;
   else paid:=paid+lot.remaining_quantity;end if;
  end loop;
  if before_qty-expired<spend then raise exception 'EXPIRED_ASSET_BALANCE';end if;
  -- Preserve the existing paid-item consumption policy: earliest paid expiry first.
  for lot in select l.* from public.billing_asset_lots l join public.presents p on p.id=l.present_id
   where l.user_id=new.user_id and l.item_id=item and l.claimed_at is not null and l.remaining_quantity>0 and p.source_kind='GAME04_PAID_FORMAL'
   order by l.expires_at,l.id for update of l loop
   exit when spend=0;take_qty:=least(spend,lot.remaining_quantity);
   update public.billing_asset_lots set remaining_quantity=remaining_quantity-take_qty where id=lot.id;spend:=spend-take_qty;
  end loop;
  new.state:=jsonb_set(new.state,path,to_jsonb(after_qty-expired));
 end loop;
 if new.state is distinct from old.state and new.version=old.version then new.version:=old.version+1;new.updated_at:=clock_timestamp();end if;
 return new;
end $$;
revoke all on function public.game04_formal_paid_balance_trigger() from public,anon,authenticated;
drop trigger if exists game04_formal_paid_lots on public.game04_player_state;
create trigger game04_formal_paid_lots before update of state on public.game04_player_state for each row execute function public.game04_formal_paid_balance_trigger();
CREATE OR REPLACE FUNCTION public.billing_apply_lot_delta(p_user uuid, p_item text, p_old bigint, p_new bigint)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_lot public.billing_asset_lots; v_expired bigint:=0; v_spend bigint:=greatest(p_old-p_new,0); v_take bigint; v_paid_balance bigint;
begin
 for v_lot in select * from public.billing_asset_lots where user_id=p_user and item_id=p_item
 and claimed_at is not null and remaining_quantity>0
 and not exists(select 1 from public.presents fp where fp.id=billing_asset_lots.present_id and fp.source_kind='GAME04_PAID_FORMAL') order by expires_at,id for update loop
  if v_lot.expires_at<=statement_timestamp() then
   v_expired:=v_expired+v_lot.remaining_quantity;
   update public.billing_asset_lots set expired_quantity=expired_quantity+remaining_quantity,remaining_quantity=0 where id=v_lot.id;
  end if;
 end loop;
 if p_old-v_expired<v_spend then raise exception 'EXPIRED_ASSET_BALANCE'; end if;
 -- GAME04 approved wallet: spend free balance before paid lots for diamonds only.
 if p_item='DIAMOND' then
  select coalesce(sum(remaining_quantity),0) into v_paid_balance
  from public.billing_asset_lots where user_id=p_user and item_id=p_item
   and claimed_at is not null and remaining_quantity>0
 and not exists(select 1 from public.presents fp where fp.id=billing_asset_lots.present_id and fp.source_kind='GAME04_PAID_FORMAL');
  v_spend:=greatest(0,v_spend-greatest(0,p_old-v_expired-v_paid_balance));
 end if;
 for v_lot in select * from public.billing_asset_lots where user_id=p_user and item_id=p_item
 and claimed_at is not null and remaining_quantity>0
 and not exists(select 1 from public.presents fp where fp.id=billing_asset_lots.present_id and fp.source_kind='GAME04_PAID_FORMAL') order by expires_at,id for update loop
  exit when v_spend=0;
  v_take:=least(v_spend,v_lot.remaining_quantity);
  update public.billing_asset_lots set remaining_quantity=remaining_quantity-v_take where id=v_lot.id;
  v_spend:=v_spend-v_take;
 end loop;
 return p_new-v_expired;
end $function$
;
create or replace function public.game04_billing_reserve_order(
 p_user_id uuid,p_request_id uuid,p_product_id text,p_mode text
) returns jsonb language plpgsql security invoker set search_path='' as $$
declare existing public.billing_orders; reserved jsonb;
begin
 if p_mode is distinct from 'sandbox' then raise exception 'TEST_MODE_REQUIRED'; end if;
 if p_product_id is null or p_product_id not in ('beginner_pack_01','ticket_pack_01','growth_pack_01','awakening_pack_01',
 'diamond_300','diamond_500','diamond_1000','diamond_3000','diamond_5000','diamond_10000','game04_vip_30d') then raise exception 'INVALID_PRODUCT';end if;
 perform 1 from public.users where id=p_user_id for update;
 if not found then raise exception 'USER_NOT_FOUND';end if;
 select * into existing from public.billing_orders where user_id=p_user_id and request_id=p_request_id;
 if existing.id is not null then
  -- Existing request keeps the original immutable snapshot and delegate conflict checks.
  return public.billing_reserve_order(p_user_id,p_request_id,p_product_id,p_mode);
 end if;
 if p_product_id='game04_vip_30d' then
  if exists(select 1 from public.game04_vip_entitlements where user_id=p_user_id and expires_at>statement_timestamp()) then
   raise exception 'VIP_ALREADY_ACTIVE';
  end if;
  if exists(select 1 from public.billing_orders o where o.user_id=p_user_id and o.product_id=p_product_id and
   (o.status='PENDING' or (o.status='GRANTED' and not exists(select 1 from public.game04_vip_grants g where g.order_id=o.id::text)))) then
   raise exception 'VIP_ORDER_PENDING';
  end if;
 end if;
 reserved:=public.billing_reserve_order(p_user_id,p_request_id,p_product_id,p_mode);
 update public.billing_orders set product_snapshot=product_snapshot||jsonb_build_object('game04InventoryVersion','APPROVED_GROWTH_V1_20260921') where id=(reserved->>'id')::uuid;
 select to_jsonb(o) into reserved from public.billing_orders o where o.id=(reserved->>'id')::uuid;
 return reserved;
end $$;

create or replace function public.game04_billing_grant_order(
 p_order_id uuid,p_session_id text,p_amount_jpy integer,p_currency text
) returns jsonb language plpgsql security invoker set search_path='' as $$
declare item public.billing_orders; result jsonb;
begin
 select * into item from public.billing_orders where id=p_order_id for update;
 if not found then raise exception 'ORDER_NOT_FOUND';end if;
 if item.billing_mode is distinct from 'sandbox' then raise exception 'TEST_MODE_REQUIRED';end if;
 if item.product_id='game04_vip_30d' and (item.amount_jpy<>480 or item.product_snapshot->'items' is distinct from '[]'::jsonb) then
  raise exception 'VIP_PRODUCT_CONTRACT_REQUIRED';
 end if;
 -- Existing grant records payment, ordinary assets, lots and purchase count once.
 result:=public.billing_grant_order(p_order_id,p_session_id,p_amount_jpy,p_currency);
 if item.product_snapshot->>'game04InventoryVersion'='APPROVED_GROWTH_V1_20260921' then
  update public.presents p set source_kind='GAME04_PAID_FORMAL',source_metadata=jsonb_build_object('game04PaidVersion','APPROVED_GROWTH_V1_20260921','funding','paid','orderId',item.id::text)
  from public.billing_asset_lots l where l.order_id=item.id and l.present_id=p.id and p.status='UNCLAIMED'
   and public.game04_paid_item_path(p.item_id) is not null;
 end if;
 if item.product_id='game04_vip_30d' then
  -- Same transaction: entitlement failure rolls back order GRANTED/payment ledger too.
  perform public.game04_grant_vip(item.user_id,item.id::text);
 end if;
 return result;
end $$;

CREATE OR REPLACE FUNCTION public.claim_present(p_present_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare uid uuid:=auth.uid(); p public.presents%rowtype;
begin
 if uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
 perform 1 from public.users where id=uid for update;
 if not found then raise exception 'GAME_USER_NOT_FOUND'; end if;
 select * into p from public.presents where id=p_present_id and user_id=uid for update;
 if not found or p.status<>'UNCLAIMED' or (p.expire_at is not null and p.expire_at<=clock_timestamp()) then raise exception 'Present is not claimable'; end if;
 if p.quantity<=0 then raise exception 'INVALID_PRESENT_QUANTITY'; end if;
 if p.source_kind='GAME04_PAID_FORMAL' then
  if p.source_metadata->>'game04PaidVersion' is distinct from 'APPROVED_GROWTH_V1_20260921'
   or p.source_metadata->>'funding' is distinct from 'paid' or public.game04_paid_item_path(p.item_id) is null
   or not exists(select 1 from public.billing_asset_lots l join public.billing_orders o on o.id=l.order_id
     where l.present_id=p.id and l.user_id=uid and l.item_id=p.item_id and l.issued_quantity=p.quantity
     and l.remaining_quantity=p.quantity and l.claimed_at is null and l.expires_at=p.expire_at
     and o.user_id=uid and o.status='GRANTED' and o.id::text=p.source_metadata->>'orderId'
     and o.product_snapshot->>'game04InventoryVersion'='APPROVED_GROWTH_V1_20260921') then
   raise exception 'INVALID_PAID_FORMAL_SOURCE';
  end if;
  perform public.game04_apply_formal_present(uid,p.item_id,p.quantity);
 elsif p.source_kind in ('GAME04_FORMAL_REWARD','GAME04_QA') or p.source_metadata ? 'game04RewardVersion' then
  if p.source_metadata->>'game04RewardVersion' is distinct from 'APPROVED_GROWTH_V1_20260921'
   or p.source_kind is null or p.source_kind not in ('GAME04_FORMAL_REWARD','GAME04_QA')
   or p.source_metadata->>'funding' is distinct from 'free'
   or p.source_metadata ?| array['orderId','order_id','lotId','lot_id','expiresAt','expires_at'] then
    raise exception 'UNSUPPORTED_FORMAL_PRESENT_SOURCE';
  end if;
  perform public.game04_apply_formal_present(uid,p.item_id,p.quantity);
 elsif p.item_id='PLAYER_XP' then
  if p.source_kind is distinct from 'QUEST_PROGRESSION_LEGACY' then raise exception 'Unsupported XP source'; end if;
  perform public.apply_user_xp(uid,p.quantity);
 else
  perform public.grant_present_payload(uid,p.item_id,p.quantity);
 end if;
 update public.presents set status='CLAIMED',claimed_at=clock_timestamp() where id=p.id;
 return jsonb_build_object('status','success','present_id',p.id);
end $function$
;
CREATE OR REPLACE FUNCTION public.game04_get_state(p_user_id uuid, p_initial jsonb DEFAULT NULL::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare u public.users%rowtype; s public.game04_player_state%rowtype; cfg jsonb; recovered integer; recovery_seconds integer; energy_max integer; vip timestamptz;
begin
 select * into u from public.users where id=p_user_id for update;
 if not found then raise exception 'GAME_USER_NOT_FOUND'; end if;
 update public.users set neon_diamonds=neon_diamonds,cash=cash where id=p_user_id returning * into u;
 select data into cfg from public.game04_redesign_master where key='runtime';
 energy_max := (cfg->>'energyMax')::integer; recovery_seconds := (cfg->>'energyRecoverySeconds')::integer;
 recovered := greatest(0,floor(extract(epoch from (now()-coalesce(u.vitality_last_recovered_at,now())))/recovery_seconds)::integer);
 if u.vitality < energy_max and recovered>0 then
  update public.users set vitality=least(energy_max,vitality+recovered),vitality_last_recovered_at=case when vitality+recovered>=energy_max then now() else coalesce(vitality_last_recovered_at,now())+make_interval(secs=>recovered*recovery_seconds) end where id=p_user_id returning * into u;
 elsif u.vitality>=energy_max then
  update public.users set vitality_last_recovered_at=now() where id=p_user_id returning * into u;
 end if;
 if p_initial is not null then insert into public.game04_player_state(user_id,state) values(p_user_id,p_initial) on conflict(user_id) do nothing; end if;
 -- Only expired claimed formal lots require a state write; ordinary reads remain read-only here.
 if exists(select 1 from public.billing_asset_lots l join public.presents p on p.id=l.present_id
  where l.user_id=p_user_id and l.claimed_at is not null and l.remaining_quantity>0 and l.expires_at<=statement_timestamp() and p.source_kind='GAME04_PAID_FORMAL') then
  update public.game04_player_state set state=state where user_id=p_user_id;
 end if;
 select * into s from public.game04_player_state where user_id=p_user_id;
 if not found then return null; end if;
 select expires_at into vip from public.game04_vip_entitlements where user_id=p_user_id;
 return s.state || jsonb_build_object('userId',p_user_id,'version',s.version,'cash',u.cash,'diamonds',u.neon_diamonds,'energy',u.vitality,'energyMax',energy_max,'vipExpiresAt',vip);
end $function$
;
commit;
