-- Candidate only. G2 owner must review/apply on GAME04 dev lrgyllgzcdcphlbmkknc.
-- Uses current billing_* tables/functions and G2 game04_grant_vip; no copied wallet logic.
-- No feature opening, provider setup, scheduler or production change.
begin;
create or replace function public.game04_billing_reserve_order(
 p_user_id uuid,p_request_id uuid,p_product_id text,p_mode text
) returns jsonb language plpgsql security invoker set search_path='' as $$
declare existing public.billing_orders;
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
 return public.billing_reserve_order(p_user_id,p_request_id,p_product_id,p_mode);
end $$;
revoke all on function public.game04_billing_reserve_order(uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function public.game04_billing_reserve_order(uuid,uuid,text,text) to service_role;

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
 billing_mode text not null check(billing_mode='sandbox'),
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
 if p_mode is distinct from 'sandbox' or p_state is null or p_state not in ('RECEIVED','COMPLETED','FAILED') or
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
commit;
