-- Applied GAME04 dev function definitions, read back 2026-09-24. Do not run as a bulk migration.

CREATE OR REPLACE FUNCTION private.game04_update_own_profile(p_username text DEFAULT NULL::text, p_bio text DEFAULT NULL::text, p_title_id text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid := auth.uid();
  v_user public.users%rowtype;
begin
  if v_uid is null then raise exception 'authentication required' using errcode='42501'; end if;
  select * into v_user from public.users where id=v_uid for update;
  if not found then raise exception 'player profile not found' using errcode='P0002'; end if;
  if p_username is not null and (char_length(btrim(p_username))<1 or char_length(btrim(p_username))>8) then
    raise exception 'Username must be between 1 and 8 characters' using errcode='22023';
  end if;
  if p_bio is not null and char_length(btrim(p_bio))>200 then
    raise exception 'Bio must be 200 characters or fewer' using errcode='22023';
  end if;
  if p_title_id is not null and p_title_id is distinct from v_user.title_equipped
    and not exists (select 1 from public.user_titles where user_id=v_uid and title_id=p_title_id) then
    raise exception 'Title is not owned' using errcode='42501';
  end if;
  if p_title_id is not null and p_title_id is distinct from v_user.title_equipped then
    update public.users set title_equipped=p_title_id where id=v_uid;
  end if;
  update public.users set
    username=case when p_username is null then username else btrim(p_username) end,
    bio=case when p_bio is null then bio else btrim(p_bio) end
  where id=v_uid returning * into v_user;
  return jsonb_build_object('id',v_user.id,'username',v_user.username,'bio',v_user.bio,'title',v_user.title_equipped);
end;
$function$


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
end $function$


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
end $function$


CREATE OR REPLACE FUNCTION public.game04_commit_shop_exchange(p_user_id uuid, p_expected_version bigint, p_state jsonb, p_before_diamonds integer, p_diamond_cost integer, p_cash_delta bigint, p_request_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
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
end $function$


CREATE OR REPLACE FUNCTION public.game04_deliver_due_vip()
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare item public.game04_vip_deliveries%rowtype; delivered integer:=0;
begin
 -- Unclaimed days are still delivered after expiry when a worker recovers from downtime.
 for item in select * from public.game04_vip_deliveries
  where delivered_at is null and due_at<=statement_timestamp()
  order by due_at,order_id,ordinal for update skip locked limit 1000 loop
  update public.users set neon_diamonds=neon_diamonds+item.amount where id=item.user_id;
  if not found then raise exception 'GAME_USER_NOT_FOUND';end if;
  update public.game04_vip_deliveries set delivered_at=statement_timestamp() where order_id=item.order_id and ordinal=item.ordinal;
  delivered:=delivered+1;
 end loop;
 return delivered;
end $function$


CREATE OR REPLACE FUNCTION public.game04_get_session_state(p_user_id uuid, p_initial jsonb DEFAULT NULL::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare st jsonb; claim jsonb;
begin
 st:=public.game04_get_growth_state(p_user_id,p_initial);
 if st is null then return null;end if;
 claim:=public.game04_process_login_bonus(p_user_id);
 if coalesce((claim->>'claimed')::boolean,false) then
  st:=public.game04_get_growth_state(p_user_id);
 end if;
 return st;
end $function$


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
end $function$


CREATE OR REPLACE FUNCTION public.game04_grant_vip(p_user_id uuid, p_order_id text)
 RETURNS timestamp with time zone
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare paid public.billing_orders%rowtype; expiry timestamptz; started timestamptz; row_count integer;
begin
 select * into paid from public.billing_orders where id::text=p_order_id and user_id=p_user_id for update;
 if not found or paid.product_id<>'game04_vip_30d' or paid.status<>'GRANTED' or paid.amount_jpy<>480 or paid.granted_at is null then raise exception 'VERIFIED_VIP_PAYMENT_REQUIRED';end if;
 perform 1 from public.users where id=p_user_id for update;
 if not found then raise exception 'GAME_USER_NOT_FOUND';end if;
 if exists(select 1 from public.game04_vip_grants where order_id=p_order_id and user_id<>p_user_id) then raise exception 'ORDER_USER_MISMATCH';end if;
 if exists(select 1 from public.game04_vip_grants where order_id=p_order_id) then
  return paid.granted_at+interval '720 hours';
 end if;
 started:=paid.granted_at;
 select expires_at into expiry from public.game04_vip_entitlements where user_id=p_user_id;
 if expiry>started then raise exception 'VIP_ALREADY_ACTIVE';end if;
 expiry:=started+interval '720 hours';
 insert into public.game04_vip_grants(order_id,user_id,days,created_at) values(p_order_id,p_user_id,30,started);
 insert into public.game04_vip_entitlements(user_id,expires_at) values(p_user_id,expiry)
 on conflict(user_id) do update set expires_at=excluded.expires_at;
 insert into public.game04_vip_deliveries(order_id,user_id,ordinal,due_at)
 select p_order_id,p_user_id,n+1,started+make_interval(hours=>24*n) from generate_series(0,29)n;
 -- Purchase-time grant is in the same transaction as entitlement, never deferred to login.
 update public.users set neon_diamonds=neon_diamonds+100 where id=p_user_id;
 update public.game04_vip_deliveries set delivered_at=statement_timestamp() where order_id=p_order_id and ordinal=1;
 return expiry;
end $function$


CREATE OR REPLACE FUNCTION public.game04_process_login_bonus(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare u public.users%rowtype; s public.game04_player_state%rowtype; progress public.user_login_bonuses%rowtype;
 today date:=(statement_timestamp() at time zone 'Asia/Tokyo')::date; step integer; total integer;
 st jsonb; rewards jsonb; receipt jsonb; row jsonb; gems integer:=0; amount integer; path text[];
begin
 select * into u from public.users where id=p_user_id for update;
 if not found then raise exception 'GAME_USER_NOT_FOUND';end if;
 select * into s from public.game04_player_state where user_id=p_user_id for update;
 if not found then return jsonb_build_object('claimed',false,'reason','STATE_NOT_READY');end if;
 select * into progress from public.user_login_bonuses where user_id=p_user_id for update;
 if found and (progress.last_claimed_at at time zone 'Asia/Tokyo')::date=today then
  return jsonb_build_object('claimed',false,'already_claimed',true,'current_step',progress.current_day,'total_logins',progress.total_logins,'last_claimed_date',today,'delivery','DIRECT','masterVersion',case when s.state->>'loginBonusLastDate'=today::text then s.state->>'loginBonusVersion' else null end);
 end if;
 step:=case when progress.user_id is null then 1 else progress.current_day%30+1 end;
 total:=coalesce(progress.total_logins,0)+1;
 st:=s.state||jsonb_build_object('loginBonusVersion','game04-login-30-v1-20260921','loginBonusLastDate',today);
 st:=jsonb_set(st,'{souls}',coalesce(st->'souls','{}'::jsonb));
 st:=jsonb_set(st,'{souls,char_reiji_01}',to_jsonb(coalesce((st#>>'{souls,char_reiji_01}')::integer,0)+2));
 rewards:=jsonb_build_array(jsonb_build_object('kind','soul','id','char_reiji_01','amount',2),jsonb_build_object('kind','cash','amount',10000));
 if step in (3,8,13,18,23,28) then
  st:=jsonb_set(st,'{growthInventory}',coalesce(st->'growthInventory','{"expItems":{"character":{"small":0,"medium":0,"large":0,"xlarge":0},"equipment":{"small":0,"medium":0,"large":0,"xlarge":0}},"carryExp":{"character":0,"equipment":0},"genericSouls":{"N":0,"R":0,"SR":0,"SSR":0},"soulSelectors":{"N":0,"R":0,"SR":0,"SSR":0}}'::jsonb));
  st:=jsonb_set(st,'{growthInventory,expItems}',coalesce(st#>'{growthInventory,expItems}','{}'::jsonb));
  st:=jsonb_set(st,'{growthInventory,expItems,character}',coalesce(st#>'{growthInventory,expItems,character}','{"small":0,"medium":0,"large":0,"xlarge":0}'::jsonb));
  st:=jsonb_set(st,'{growthInventory,expItems,equipment}',coalesce(st#>'{growthInventory,expItems,equipment}','{"small":0,"medium":0,"large":0,"xlarge":0}'::jsonb));
  st:=jsonb_set(st,'{growthInventory,expItems,character,large}',to_jsonb(coalesce((st#>>'{growthInventory,expItems,character,large}')::integer,0)+1));
  st:=jsonb_set(st,'{growthInventory,expItems,equipment,large}',to_jsonb(coalesce((st#>>'{growthInventory,expItems,equipment,large}')::integer,0)+2));
  rewards:=rewards||jsonb_build_array(jsonb_build_object('kind','character_exp_item','id','large','amount',1),jsonb_build_object('kind','equipment_exp_item','id','large','amount',2));
 end if;
 if step in (5,20,10,25,15,30) then
  path:=array['questTicketGrants',case when step in (5,20) then 'SPECIAL_TICKET_CHARACTER' when step in (10,25) then 'SPECIAL_TICKET_SKILL' else 'SPECIAL_TICKET_EQUIPMENT' end];
  amount:=case when step in (10,25) then 2 else 1 end;
  st:=jsonb_set(st,'{questTicketGrants}',coalesce(st->'questTicketGrants','{}'::jsonb));
  st:=jsonb_set(st,path,to_jsonb(coalesce((st#>>path)::integer,0)+amount));
  rewards:=rewards||jsonb_build_array(jsonb_build_object('kind','ticket','id',path[2],'amount',amount));
 end if;
 if step in (7,14,21) then gems:=100;end if;
 receipt:=jsonb_build_object('claimed',true,'already_claimed',false,'current_step',step,'day_number',step,'total_logins',total,'last_claimed_date',today,'delivery','DIRECT','rewards',rewards,'freeDiamonds',gems,'masterVersion','game04-login-30-v1-20260921');
 st:=jsonb_set(st,'{loginBonusReceipt}',receipt);
 update public.users set cash=cash+10000,neon_diamonds=neon_diamonds+gems where id=p_user_id;
 -- Ticket delta trigger delivers to the existing ticket inventory in the same transaction.
 update public.game04_player_state set state=st,version=version+1,updated_at=statement_timestamp() where user_id=p_user_id;
 insert into public.user_login_bonuses(user_id,current_day,total_logins,last_claimed_at)
 values(p_user_id,step,total,statement_timestamp()) on conflict(user_id) do update
 set current_day=excluded.current_day,total_logins=excluded.total_logins,last_claimed_at=excluded.last_claimed_at;
 return receipt;
end $function$


CREATE OR REPLACE FUNCTION public.game04_update_own_profile(p_username text DEFAULT NULL::text, p_bio text DEFAULT NULL::text, p_title_id text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE sql
 SET search_path TO ''
AS $function$ select private.game04_update_own_profile(p_username,p_bio,p_title_id) $function$


CREATE OR REPLACE FUNCTION public.process_login_bonus()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
begin
 if auth.uid() is null then raise exception 'Player authentication required';end if;
 return public.game04_process_login_bonus(auth.uid());
end $function$

