-- Candidate only. GAME04 dev lrgyllgzcdcphlbmkknc. Parent applies after review.
-- Existing paid lots retain provenance and expiry; no balance conversion.
CREATE OR REPLACE FUNCTION public.billing_apply_lot_delta(p_user uuid, p_item text, p_old bigint, p_new bigint)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_lot public.billing_asset_lots; v_expired bigint:=0; v_spend bigint:=greatest(p_old-p_new,0); v_take bigint; v_paid_balance bigint;
begin
 for v_lot in select * from public.billing_asset_lots where user_id=p_user and item_id=p_item
 and claimed_at is not null and remaining_quantity>0 order by expires_at,id for update loop
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
   and claimed_at is not null and remaining_quantity>0;
  v_spend:=greatest(0,v_spend-greatest(0,p_old-v_expired-v_paid_balance));
 end if;
 for v_lot in select * from public.billing_asset_lots where user_id=p_user and item_id=p_item
 and claimed_at is not null and remaining_quantity>0 order by expires_at,id for update loop
  exit when v_spend=0;
  v_take:=least(v_spend,v_lot.remaining_quantity);
  update public.billing_asset_lots set remaining_quantity=remaining_quantity-v_take where id=v_lot.id;
  v_spend:=v_spend-v_take;
 end loop;
 return p_new-v_expired;
end $function$;

CREATE OR REPLACE FUNCTION public.billing_buy_dia_product(p_user_id uuid, p_request_id uuid, p_product_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare v_product public.billing_products; v_receipt public.billing_shop_receipts; v_item jsonb;
 v_qty integer; v_id text; v_paid jsonb:='[]'; v_lot public.billing_asset_lots; v_remaining integer;
 v_take integer; v_segment jsonb; v_alloc integer; v_cumulative bigint; v_previous integer;
 v_present uuid; v_total_balance bigint; v_paid_balance bigint;
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
 select neon_diamonds into v_total_balance from public.users where id=p_user_id;
 select coalesce(sum(remaining_quantity),0) into v_paid_balance from public.billing_asset_lots
 where user_id=p_user_id and item_id='DIAMOND' and claimed_at is not null
 and remaining_quantity>0 and expires_at>statement_timestamp();
 v_remaining:=greatest(0,v_product.price_dia-greatest(0,v_total_balance-v_paid_balance));
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
end $function$;


-- Preserve legacy users.diamonds unchanged; all 46 observed balances are zero.
CREATE OR REPLACE FUNCTION public.game04_get_state(p_user_id uuid, p_initial jsonb DEFAULT NULL::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare u public.users%rowtype; s public.game04_player_state%rowtype; cfg jsonb; recovered integer; recovery_seconds integer; energy_max integer; vip timestamptz;
begin
 select * into u from public.users where id=p_user_id for update;
 if not found then raise exception 'GAME_USER_NOT_FOUND'; end if;
 update public.users set neon_diamonds=neon_diamonds where id=p_user_id returning * into u;
 select data into cfg from public.game04_redesign_master where key='runtime';
 energy_max := (cfg->>'energyMax')::integer; recovery_seconds := (cfg->>'energyRecoverySeconds')::integer;
 recovered := greatest(0,floor(extract(epoch from (now()-coalesce(u.vitality_last_recovered_at,now())))/recovery_seconds)::integer);
 if u.vitality < energy_max and recovered>0 then
  update public.users set vitality=least(energy_max,vitality+recovered),vitality_last_recovered_at=case when vitality+recovered>=energy_max then now() else coalesce(vitality_last_recovered_at,now())+make_interval(secs=>recovered*recovery_seconds) end where id=p_user_id returning * into u;
 elsif u.vitality>=energy_max then
  update public.users set vitality_last_recovered_at=now() where id=p_user_id returning * into u;
 end if;
 if p_initial is not null then insert into public.game04_player_state(user_id,state) values(p_user_id,p_initial) on conflict(user_id) do nothing; end if;
 select * into s from public.game04_player_state where user_id=p_user_id;
 if not found then return null; end if;
 select expires_at into vip from public.game04_vip_entitlements where user_id=p_user_id;
 return s.state || jsonb_build_object('userId',p_user_id,'version',s.version,'cash',u.cash,'diamonds',u.neon_diamonds,'energy',u.vitality,'energyMax',energy_max,'vipExpiresAt',vip);
end $function$;

CREATE OR REPLACE FUNCTION public.game04_commit_shop_exchange(
 p_user_id uuid, p_expected_version bigint, p_state jsonb,
 p_before_diamonds integer, p_diamond_cost integer, p_cash_delta bigint,
 p_request_id uuid)
RETURNS jsonb LANGUAGE plpgsql SET search_path TO public, pg_temp AS $function$
declare u public.users%rowtype; prior jsonb;
begin
 select * into u from public.users where id=p_user_id for update;
 if not found then raise exception 'GAME_USER_NOT_FOUND'; end if;
 select result into prior from public.game04_requests where user_id=p_user_id and request_id=p_request_id;
 if found then return prior; end if;
 if p_diamond_cost is null or p_diamond_cost<0 or p_diamond_cost>5000
  or p_before_diamonds is null or (p_state->>'diamonds')::integer is distinct from p_before_diamonds-p_diamond_cost then
  raise exception 'INVALID_EXCHANGE_COST';
 end if;
 -- Expired paid lots are removed by the existing balance trigger before sufficiency comparison.
 update public.users set neon_diamonds=neon_diamonds where id=p_user_id returning * into u;
 if u.neon_diamonds<>p_before_diamonds then raise exception 'STATE_CONFLICT' using errcode='40001'; end if;
 if u.neon_diamonds<p_diamond_cost then raise exception 'INSUFFICIENT_RESOURCE'; end if;
 update public.users set neon_diamonds=neon_diamonds-p_diamond_cost where id=p_user_id;
 -- The same transaction persists inventory/cash and the request receipt. Any conflict rolls debit back.
 return public.game04_commit_growth_state(p_user_id,p_expected_version,p_state,p_cash_delta,0,p_request_id);
end $function$;
REVOKE ALL ON FUNCTION public.game04_commit_shop_exchange(uuid,bigint,jsonb,integer,integer,bigint,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.game04_commit_shop_exchange(uuid,bigint,jsonb,integer,integer,bigint,uuid) TO service_role;
