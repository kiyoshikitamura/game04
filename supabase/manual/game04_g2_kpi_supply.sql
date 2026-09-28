-- GAME04 development only; parent applies after confirming lrgyllgzcdcphlbmkknc.
-- Append future formal login deliveries; never infer historical deliveries from current state.
create table if not exists public.game04_login_deliveries (
 user_id uuid not null references public.users(id),
 login_date date not null,
 total_logins integer not null check(total_logins > 0),
 day_number integer not null check(day_number between 1 and 30),
 delivered_at timestamptz not null,
 master_version text not null check(master_version='game04-login-30-v1-20260921'),
 primary key(user_id,login_date), unique(user_id,total_logins)
);
alter table public.game04_login_deliveries enable row level security;
revoke all on public.game04_login_deliveries from public,anon,authenticated;
grant select,insert on public.game04_login_deliveries to service_role;
create index if not exists game04_login_deliveries_at_idx on public.game04_login_deliveries(delivered_at);

create or replace function public.game04_capture_login_delivery()
returns trigger language plpgsql security invoker set search_path=public,pg_temp as $$
declare st jsonb; r jsonb; login_day date;
begin
 if tg_op='UPDATE' then
  if new.total_logins is not distinct from old.total_logins then return new; end if;
 end if;
 select state into st from public.game04_player_state where user_id=new.user_id;
 r:=st->'loginBonusReceipt';
 login_day:=(new.last_claimed_at at time zone 'Asia/Tokyo')::date;
 -- The formal producer updates state before progress, in the same transaction.
 -- Legacy progress changes and restored/stale receipts must not become formal delivery facts.
 if st->>'loginBonusVersion' is distinct from 'game04-login-30-v1-20260921'
  or r->>'masterVersion' is distinct from 'game04-login-30-v1-20260921'
  or r->>'claimed' is distinct from 'true' or r->>'delivery' is distinct from 'DIRECT'
  or r->>'total_logins' is distinct from new.total_logins::text
  or r->>'day_number' is distinct from new.current_day::text
  or st->>'loginBonusLastDate' is distinct from login_day::text
  or r->>'last_claimed_date' is distinct from login_day::text
  or login_day is distinct from (statement_timestamp() at time zone 'Asia/Tokyo')::date
 then return new; end if;
 insert into public.game04_login_deliveries(user_id,login_date,total_logins,day_number,delivered_at,master_version)
 values(new.user_id,login_day,new.total_logins,new.current_day,new.last_claimed_at,'game04-login-30-v1-20260921')
 on conflict do nothing;
 return new;
end $$;
revoke all on function public.game04_capture_login_delivery() from public,anon,authenticated;
grant execute on function public.game04_capture_login_delivery() to service_role;
drop trigger if exists game04_capture_login_delivery on public.user_login_bonuses;
create trigger game04_capture_login_delivery after insert or update on public.user_login_bonuses
 for each row execute function public.game04_capture_login_delivery();

create or replace function public.game04_kpi_supply_daily(p_from timestamptz,p_to timestamptz)
returns table(day_jst date,environment text,classification text,action text,reward_id text,
 event_count bigint,user_count bigint,quantity numeric)
language plpgsql stable security invoker set search_path=public,pg_temp as $$
begin
 if p_from is null or p_to is null or p_to<=p_from or p_to-p_from>interval '367 days' then
  raise exception 'Invalid measurement range';
 end if;
 return query
 with facts as (
  select l.user_id,l.delivered_at at,'login_bonus'::text action,'daily_bundle'::text reward_id,
   1::numeric quantity,false force_qa
  from public.game04_login_deliveries l where l.delivered_at>=p_from and l.delivered_at<p_to
  union all
  select v.user_id,v.delivered_at,'vip_delivery','free_diamonds',v.amount::numeric,false
  from public.game04_vip_deliveries v where v.delivered_at>=p_from and v.delivered_at<p_to
  union all
  select p.user_id,p.claimed_at,'present_claim',p.item_id::text,p.quantity::numeric,p.source_kind='GAME04_QA'
  from public.presents p where p.claimed_at>=p_from and p.claimed_at<p_to and p.status='CLAIMED'
   and (p.expire_at is null or p.claimed_at<p.expire_at)
   and p.source_kind in ('GAME04_FORMAL_REWARD','GAME04_QA')
   and p.source_metadata->>'game04RewardVersion'='APPROVED_GROWTH_V1_20260921'
   and p.source_metadata->>'funding'='free'
   and not (p.source_metadata ?| array['orderId','order_id','lotId','lot_id','expiresAt','expires_at'])
   and p.quantity>0
   and (p.item_id in ('ENERGY_DRINK','SKILL_LB_PART','EQUIP_LB_PART')
    or p.item_id ~ '^(CHAR|EQUIP)_EXP_(S|M|L|XL)$'
    or p.item_id ~ '^(SOUL_SELECTOR|GENERIC_SOUL)_(N|R|SR|SSR)$')
 ), classified as (
  select f.*,case when f.force_qa then 'excluded'
   when not exists(select 1 from public.kpi_subjects s where s.source_user_id=f.user_id) then 'unmapped'
   when exists(select 1 from public.kpi_subjects s where s.source_user_id=f.user_id
    and public.kpi_is_subject_excluded(s.subject_id,f.at)) then 'excluded'
   else 'included' end bucket from facts f
 )
 select (c.at at time zone 'Asia/Tokyo')::date,'development'::text,c.bucket,c.action,c.reward_id,
  count(*),count(distinct c.user_id),sum(c.quantity)
 from classified c group by 1,3,4,5 order by 1,3,4,5;
end $$;
revoke all on function public.game04_kpi_supply_daily(timestamptz,timestamptz) from public,anon,authenticated;
grant execute on function public.game04_kpi_supply_daily(timestamptz,timestamptz) to service_role;
