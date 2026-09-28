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
end $function$;
REVOKE ALL ON FUNCTION public.game04_deliver_due_vip() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.game04_deliver_due_vip() TO service_role;

CREATE OR REPLACE FUNCTION public.game04_grant_vip(p_user_id uuid,p_order_id text)
RETURNS timestamptz LANGUAGE plpgsql SET search_path TO public,pg_temp AS $function$
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
end $function$;
REVOKE ALL ON FUNCTION public.game04_grant_vip(uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.game04_grant_vip(uuid,text) TO service_role;
-- Parent: attach game04_deliver_due_vip() to an existing DB scheduler and verify retries.
-- Checkout reservation must reject an active entitlement BEFORE charging (P02).
-- Do not enable sales until that reservation guard and scheduled delivery are verified.
