-- Additional 22/23/28/29. Apply to isolated GAME04 Preview only.
-- Gameplay state, balance, paid-asset expiry, and existing claim_present are unchanged.
create table if not exists public.game04_home_promotion_state (
 user_id uuid primary key references auth.users(id) on delete cascade,
 visits bigint not null default 0,
 free_shown_day text,
 starter_shown_at timestamptz,
 reserved_visit uuid,
 reserved_until timestamptz,
 reserved_kind text
);
create table if not exists public.game04_home_promotion_visits (
 user_id uuid not null references auth.users(id) on delete cascade,
 visit_id uuid not null,
 created_at timestamptz not null default now(),
 shown_kind text,
 primary key(user_id,visit_id)
);
alter table public.game04_home_promotion_state enable row level security;
alter table public.game04_home_promotion_visits enable row level security;
create policy game04_promotion_own_read on public.game04_home_promotion_state for select to authenticated using(user_id=(select auth.uid()));
create policy game04_promotion_visit_own_read on public.game04_home_promotion_visits for select to authenticated using(user_id=(select auth.uid()));
revoke all on public.game04_home_promotion_state,public.game04_home_promotion_visits from anon,authenticated;
grant select on public.game04_home_promotion_state,public.game04_home_promotion_visits to authenticated;

create or replace function public.game04_home_promotion(p_visit_id uuid,p_action text default 'enter') returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare uid uuid:=auth.uid(); st jsonb; ps public.game04_home_promotion_state; day text:=to_char(statement_timestamp() at time zone 'Asia/Tokyo','YYYY-MM-DD'); offer text; inserted integer;
begin
 if uid is null then raise exception 'Authentication required'; end if;
 if p_visit_id is null or p_action not in ('enter','reserve','shown','release') then raise exception 'Invalid promotion request'; end if;
 -- Serialize this user's requests without taking the gameplay state write lock.
 perform pg_advisory_xact_lock(hashtextextended('game04:home-promotion:'||uid::text,0));
 select state into st from public.game04_player_state where user_id=uid;
 if st is null or coalesce((st#>>'{tutorial,step}')::int,17)<17 then return '{}'::jsonb; end if;
 insert into public.game04_home_promotion_state(user_id) values(uid) on conflict do nothing;
 if p_action='enter' then
  insert into public.game04_home_promotion_visits(user_id,visit_id) values(uid,p_visit_id) on conflict do nothing;
  get diagnostics inserted=row_count;
  if inserted=1 then update public.game04_home_promotion_state set visits=visits+1 where user_id=uid; end if;
 end if;
 select * into ps from public.game04_home_promotion_state where user_id=uid;
 if p_action='release' then
  update public.game04_home_promotion_state set reserved_visit=null,reserved_until=null,reserved_kind=null where user_id=uid and reserved_visit=p_visit_id;
  return '{}'::jsonb;
 end if;
 if p_action='shown' then
  if exists(select 1 from public.game04_home_promotion_visits where user_id=uid and visit_id=p_visit_id and shown_kind is not null) then return jsonb_build_object('recorded',true); end if;
  if ps.reserved_visit is distinct from p_visit_id or ps.reserved_kind is null then return jsonb_build_object('recorded',false); end if;
  offer:=ps.reserved_kind;
  update public.game04_home_promotion_visits set shown_kind=offer where user_id=uid and visit_id=p_visit_id;
  update public.game04_home_promotion_state set free_shown_day=case when offer='daily-free' then day else free_shown_day end,
   starter_shown_at=case when offer='starter' then statement_timestamp() else starter_shown_at end,
   reserved_visit=null,reserved_until=null,reserved_kind=null where user_id=uid;
  return jsonb_build_object('recorded',true);
 end if;
 if ps.reserved_visit is not null and ps.reserved_visit<>p_visit_id and ps.reserved_until>statement_timestamp() then return '{}'::jsonb; end if;
 if not exists(select 1 from public.game04_home_promotion_visits where user_id=uid and visit_id=p_visit_id and shown_kind is null) then return '{}'::jsonb; end if;
 if ps.starter_shown_at is null
  and (coalesce(st#>'{earlyProgress,completedAreas}','[]'::jsonb) ? 'mikawa'
    or coalesce(st->'clearedStages','[]'::jsonb) ? 'mikawa-5'
    or (st->'earlyProgress' is null and coalesce(st->'clearedStages','[]'::jsonb) ? 'mikawa-3'))
  and not exists(select 1 from public.billing_orders where user_id=uid and product_id='beginner_pack_01' and status='GRANTED') then
  offer:='starter';
 elsif ps.visits>=2 and ps.free_shown_day is distinct from day and coalesce(st->>'dailyNormalGachaDate','')<>day then offer:='daily-free';
 end if;
 if offer is null then return jsonb_build_object('visits',ps.visits); end if;
 if p_action='reserve' then
  update public.game04_home_promotion_state set reserved_visit=p_visit_id,reserved_until=statement_timestamp()+interval '90 seconds',reserved_kind=offer where user_id=uid;
 end if;
 return jsonb_build_object('kind',offer,'visits',ps.visits,'day',day);
end $$;
revoke all on function public.game04_home_promotion(uuid,text) from public,anon;
grant execute on function public.game04_home_promotion(uuid,text) to authenticated;

-- Release campaign stays disabled until the release owner sets the official start
-- AND explicitly approves a separate BOX claim policy. End is JST, exclusive.
create table public.game04_release_campaigns (
 id text primary key,
 enabled boolean not null default false,
 starts_at timestamptz,
 ends_at timestamptz not null,
 claim_policy_approved boolean not null default false,
 claim_days integer check(claim_days is null or claim_days>0),
 amount integer not null check(amount>0)
);
create table public.game04_release_campaign_grants (
 campaign_id text not null references public.game04_release_campaigns(id),
 user_id uuid not null references auth.users(id) on delete cascade,
 present_id uuid not null unique references public.presents(id),
 granted_at timestamptz not null default now(),
 primary key(campaign_id,user_id)
);
alter table public.game04_release_campaigns enable row level security;
alter table public.game04_release_campaign_grants enable row level security;
revoke all on public.game04_release_campaigns,public.game04_release_campaign_grants from anon,authenticated;
insert into public.game04_release_campaigns(id,ends_at,amount) values('game04-release-2026','2026-12-31 15:00:00+00',300);

-- Private helper: caller cannot choose quantity, funding, recipient, date, or expiry.
create function public.game04_grant_release_campaign(p_user_id uuid) returns uuid
language plpgsql security definer set search_path=public,pg_temp as $$
declare c public.game04_release_campaigns; gift uuid; current_time_ timestamptz:=statement_timestamp();
begin
 -- Same user-before-gift lock order as claim_present; concurrent delivery is idempotent.
 perform 1 from public.users where id=p_user_id for update;
 if not found then return null; end if;
 select * into c from public.game04_release_campaigns where id='game04-release-2026';
 if not c.enabled or not c.claim_policy_approved or c.starts_at is null or current_time_<c.starts_at or current_time_>=c.ends_at then return null; end if;
 select present_id into gift from public.game04_release_campaign_grants where campaign_id=c.id and user_id=p_user_id;
 if gift is not null then return gift; end if;
 gift:=gen_random_uuid();
 insert into public.presents(id,user_id,item_id,quantity,message,status,expire_at,source_kind,source_key,source_metadata)
 values(gift,p_user_id,'DIAMOND',c.amount,'リリース記念！輝石300個プレゼント','UNCLAIMED',
 case when c.claim_days is null then null else current_time_+make_interval(days=>c.claim_days) end,
 'GAME04_FORMAL_REWARD',c.id,jsonb_build_object('campaignId',c.id,'funding','FREE'));
 insert into public.game04_release_campaign_grants(campaign_id,user_id,present_id) values(c.id,p_user_id,gift);
 return gift;
end $$;
revoke all on function public.game04_grant_release_campaign(uuid) from public,anon,authenticated;
grant execute on function public.game04_grant_release_campaign(uuid) to service_role;
create function public.game04_ensure_release_present() returns uuid
language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 return public.game04_grant_release_campaign(auth.uid());
end $$;
revoke all on function public.game04_ensure_release_present() from public,anon;
grant execute on function public.game04_ensure_release_present() to authenticated;

-- Existing product rows only; do not bootstrap/enable the separate billing system.
-- Preserve all other quantities and historical order snapshots.
update public.billing_products set items=(select jsonb_agg(case when item->>'itemId'='CASH' and (item->>'quantity')::int=10000 then jsonb_set(jsonb_set(item,'{itemId}','"DIAMOND"'),'{quantity}','100') else item end) from jsonb_array_elements(items) item)
where id='beginner_pack_01' and items @> '[{"itemId":"CASH","quantity":10000}]';
