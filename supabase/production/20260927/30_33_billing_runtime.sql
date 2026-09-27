-- GAME04 isolated Preview only. Reuses read-only GAME03 production billing RPCs.
-- No existing orders, balances, lot expiry, claim functions, API or feature opening modified.

do $$ begin
 if (select data->>'projectRef' from public.game04_redesign_master where key='production_environment') is distinct from 'soiksqgtmcnspfedmanr' then raise exception 'WRONG_PROJECT'; end if;
 if to_regprocedure('public.billing_reserve_order(uuid,uuid,text,text)') is not null then raise exception 'BILLING_ALREADY_INSTALLED_REVIEW_LATEST'; end if;
end $$;
create table public.billing_grants (
 order_id uuid primary key references public.billing_orders(id),stripe_session_id text not null unique,
 user_id uuid not null references public.users(id),items jsonb not null,created_at timestamptz not null default now()
);
create table public.payment_transactions (
 id uuid primary key default extensions.gen_random_uuid(),user_id uuid not null references public.users(id),
 product_id text not null,amount integer not null,currency text not null,status text not null,created_at timestamptz not null default now()
);
create table public.user_shop_purchases (
 user_id uuid not null references public.users(id),product_id text not null,purchase_count integer not null default 0 check(purchase_count>=0),
 last_purchased_at timestamptz not null default now(),primary key(user_id,product_id)
);
create table public.feature_operating_states (
 feature_key text primary key,state text not null check(state in ('OPEN','CLOSED','MAINTENANCE')),
 mutation_allowed boolean not null default false
);
create table public.operations_maintenance_testers (
 user_id uuid primary key references public.users(id),expires_at timestamptz not null
);
alter table public.billing_grants enable row level security;
alter table public.payment_transactions enable row level security;
alter table public.user_shop_purchases enable row level security;
alter table public.feature_operating_states enable row level security;
alter table public.operations_maintenance_testers enable row level security;
revoke all on public.billing_grants,public.payment_transactions,public.user_shop_purchases,public.feature_operating_states,public.operations_maintenance_testers from public,anon,authenticated;
grant all on public.billing_grants,public.payment_transactions,public.user_shop_purchases,public.feature_operating_states,public.operations_maintenance_testers to service_role;
-- Fail closed. Later acceptance can allow only designated maintenance testers.
insert into public.feature_operating_states values ('MAINTENANCE','MAINTENANCE',false),('PAYMENT','CLOSED',false),('SHOP','CLOSED',false);
create index billing_orders_user_created on public.billing_orders(user_id,created_at desc);
create index billing_grants_user on public.billing_grants(user_id);
create function public.billing_session_matches(p_order_id uuid,p_session_id text)
returns boolean language sql stable security invoker set search_path='' as $$
 select coalesce((select case billing_mode when 'live' then p_session_id ~ '^cs_live_[a-zA-Z0-9]+$'
 else p_session_id ~ '^cs_test_[a-zA-Z0-9]+$' end from public.billing_orders where id=p_order_id),false)
$$;
CREATE OR REPLACE FUNCTION public.billing_attach_session(p_order_id uuid, p_session_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare v_order public.billing_orders;
begin
 perform 1 from public.users where id=(select user_id from public.billing_orders where id=p_order_id) for update;
 select * into v_order from public.billing_orders where id=p_order_id for update;
 if not found then raise exception 'ORDER_NOT_FOUND'; end if;
 if not public.billing_session_matches(p_order_id,p_session_id) then raise exception 'BILLING_MODE_CONFLICT'; end if;
 if v_order.stripe_session_id is not null and v_order.stripe_session_id<>p_session_id then raise exception 'SESSION_CONFLICT'; end if;
 update public.billing_orders set stripe_session_id=p_session_id where id=p_order_id;
 return jsonb_build_object('order_id',p_order_id,'status',v_order.status);
end $function$
;
CREATE OR REPLACE FUNCTION public.billing_expire_order(p_order_id uuid, p_session_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare v_order public.billing_orders;
begin
  perform 1 from public.users where id=(select user_id from public.billing_orders where id=p_order_id) for update;
 select * into v_order from public.billing_orders where id=p_order_id for update;
  if not found then raise exception 'ORDER_NOT_FOUND'; end if;
  if not public.billing_session_matches(p_order_id,p_session_id) or (v_order.stripe_session_id is not null and v_order.stripe_session_id<>p_session_id)
    then raise exception 'SESSION_CONFLICT'; end if;
  if v_order.status='PENDING' then update public.billing_orders set status='EXPIRED',stripe_session_id=p_session_id where id=p_order_id; end if;
  return jsonb_build_object('order_id',p_order_id);
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
 perform 1 from public.users where id=(select user_id from public.billing_orders where id=p_order_id) for update;
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

revoke all on function public.billing_session_matches(uuid,text),public.billing_reserve_order(uuid,uuid,text),public.billing_reserve_order(uuid,uuid,text,text),public.billing_attach_session(uuid,text),public.billing_grant_order(uuid,text,integer,text),public.billing_expire_order(uuid,text) from public,anon,authenticated;
grant execute on function public.billing_session_matches(uuid,text),public.billing_reserve_order(uuid,uuid,text),public.billing_reserve_order(uuid,uuid,text,text),public.billing_attach_session(uuid,text),public.billing_grant_order(uuid,text,integer,text),public.billing_expire_order(uuid,text) to service_role;
create or replace function public.game04_billing_reserve_order(
 p_user_id uuid,p_request_id uuid,p_product_id text,p_mode text
) returns jsonb language plpgsql security invoker set search_path='' as $$
declare existing public.billing_orders;
begin
 if p_mode is distinct from 'live' then raise exception 'LIVE_MODE_REQUIRED'; end if;
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
 return public.billing_reserve_order(p_user_id,p_request_id,p_product_id,p_mode);
end $$;
revoke all on function public.game04_billing_reserve_order(uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function public.game04_billing_reserve_order(uuid,uuid,text,text) to service_role;

create or replace function public.game04_billing_grant_order(
 p_order_id uuid,p_session_id text,p_amount_jpy integer,p_currency text
) returns jsonb language plpgsql security invoker set search_path='' as $$
declare item public.billing_orders; result jsonb;
begin
 perform 1 from public.users where id=(select user_id from public.billing_orders where id=p_order_id) for update;
 select * into item from public.billing_orders where id=p_order_id for update;
 if not found then raise exception 'ORDER_NOT_FOUND';end if;
 if item.billing_mode is distinct from 'live' then raise exception 'LIVE_MODE_REQUIRED';end if;
 if item.product_id='game04_vip_30d' and (item.amount_jpy<>480 or item.product_snapshot->'items' is distinct from '[]'::jsonb) then
  raise exception 'VIP_PRODUCT_CONTRACT_REQUIRED';
 end if;
 -- Existing grant records payment, ordinary assets, lots and purchase count once.
 result:=public.billing_grant_order(p_order_id,p_session_id,p_amount_jpy,p_currency);
 if item.product_id='game04_vip_30d' then
  -- Same transaction: entitlement failure rolls back order GRANTED/payment ledger too.
  perform public.game04_grant_vip(item.user_id,item.id::text);
 end if;
 return result;
end $$;
revoke all on function public.game04_billing_grant_order(uuid,text,integer,text) from public,anon,authenticated;
grant execute on function public.game04_billing_grant_order(uuid,text,integer,text) to service_role;

create table if not exists public.game04_billing_events (
 event_id text primary key check(event_id ~ '^evt_[a-zA-Z0-9]+$'),
 order_id uuid not null references public.billing_orders(id),
 session_id text not null,
 event_type text not null,
 billing_mode text not null check(billing_mode='live'),
 state text not null check(state in ('RECEIVED','COMPLETED','FAILED')),
 attempts integer not null default 1,
 received_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.game04_billing_events enable row level security;
revoke all on public.game04_billing_events from public,anon,authenticated;
grant all on public.game04_billing_events to service_role;
create index if not exists game04_billing_events_order_idx on public.game04_billing_events(order_id);
create or replace function public.game04_record_billing_event(
 p_event_id text,p_order_id uuid,p_session_id text,p_event_type text,p_state text,p_mode text
) returns void language plpgsql security invoker set search_path='' as $$
begin
 if p_mode is distinct from 'live' or p_state is null or p_state not in ('RECEIVED','COMPLETED','FAILED') or
 p_event_type is null or p_event_type not in ('checkout.session.completed','checkout.session.async_payment_succeeded',
 'checkout.session.async_payment_failed','checkout.session.expired') then raise exception 'INVALID_EVENT_RECORD';end if;
 insert into public.game04_billing_events(event_id,order_id,session_id,event_type,billing_mode,state)
 values(p_event_id,p_order_id,p_session_id,p_event_type,p_mode,p_state)
 on conflict(event_id) do update set
  state=case when game04_billing_events.state='COMPLETED' then 'COMPLETED' else excluded.state end,
  attempts=game04_billing_events.attempts+case when excluded.state='RECEIVED' then 1 else 0 end,
  updated_at=clock_timestamp()
 where game04_billing_events.order_id=excluded.order_id and game04_billing_events.session_id=excluded.session_id
 and game04_billing_events.billing_mode=excluded.billing_mode and game04_billing_events.event_type=excluded.event_type;
 if not found then raise exception 'EVENT_CONFLICT';end if;
end $$;
revoke all on function public.game04_record_billing_event(text,uuid,text,text,text,text) from public,anon,authenticated;
grant execute on function public.game04_record_billing_event(text,uuid,text,text,text,text) to service_role;


-- GAME04 development candidate. Does not enable the product or configure any payment provider.
CREATE TABLE IF NOT EXISTS public.game04_vip_deliveries (
 order_id text NOT NULL REFERENCES public.game04_vip_grants(order_id),
 user_id uuid NOT NULL REFERENCES public.users(id),
 ordinal integer NOT NULL CHECK (ordinal BETWEEN 1 AND 30),
 due_at timestamptz NOT NULL,
 delivered_at timestamptz,
 amount integer NOT NULL DEFAULT 100 CHECK(amount=100),
 PRIMARY KEY(order_id,ordinal)
);
ALTER TABLE public.game04_vip_deliveries ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.game04_vip_deliveries FROM PUBLIC,anon,authenticated;
GRANT ALL ON public.game04_vip_deliveries TO service_role;
CREATE INDEX IF NOT EXISTS game04_vip_deliveries_due_idx ON public.game04_vip_deliveries(due_at) WHERE delivered_at IS NULL;

CREATE OR REPLACE FUNCTION public.game04_deliver_due_vip()
RETURNS integer LANGUAGE plpgsql SET search_path TO public,pg_temp AS $function$
declare candidate record; item public.game04_vip_deliveries%rowtype; delivered integer:=0;
begin
 for candidate in select order_id,ordinal,user_id from public.game04_vip_deliveries
 where delivered_at is null and due_at<=statement_timestamp()
 order by user_id,due_at,order_id,ordinal limit 1000 loop
  perform 1 from public.users where id=candidate.user_id for update;
  if not found then raise exception 'GAME_USER_NOT_FOUND';end if;
  select * into item from public.game04_vip_deliveries
  where order_id=candidate.order_id and ordinal=candidate.ordinal and delivered_at is null
    and due_at<=statement_timestamp() for update;
  if not found then continue;end if;
  update public.users set neon_diamonds=neon_diamonds+item.amount where id=item.user_id;
  update public.game04_vip_deliveries set delivered_at=statement_timestamp()
  where order_id=item.order_id and ordinal=item.ordinal;
  delivered:=delivered+1;
 end loop;
 return delivered;
end $function$;
REVOKE ALL ON FUNCTION public.game04_deliver_due_vip() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.game04_deliver_due_vip() TO service_role;

CREATE OR REPLACE FUNCTION public.game04_grant_vip(p_user_id uuid,p_order_id text)
RETURNS timestamptz LANGUAGE plpgsql SET search_path TO public,pg_temp AS $function$
declare paid public.billing_orders%rowtype; expiry timestamptz; started timestamptz; row_count integer;
begin
 perform 1 from public.users where id=p_user_id for update;
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
end $function$;
REVOKE ALL ON FUNCTION public.game04_grant_vip(uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.game04_grant_vip(uuid,text) TO service_role;
-- Parent: attach game04_deliver_due_vip() to an existing DB scheduler and verify retries.
-- Checkout reservation must reject an active entitlement BEFORE charging (P02).
-- Do not enable sales until that reservation guard and scheduled delivery are verified.


notify pgrst,'reload schema';

