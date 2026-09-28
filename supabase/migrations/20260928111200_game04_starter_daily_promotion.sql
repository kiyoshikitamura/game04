-- Approved 2026-09-28: 100 yen / character tickets x10 + diamonds x500.
-- Existing orders retain their immutable product_snapshot and purchase count.
update public.billing_products
set title='初陣応援パック', amount_jpy=100, purchase_limit=1,
 items='[{"itemId":"SPECIAL_TICKET_CHARACTER","quantity":10},{"itemId":"DIAMOND","quantity":500,"validity_days":120}]'::jsonb
where id='beginner_pack_01';

create or replace function public.game04_home_promotion(p_visit_id uuid,p_action text default 'enter') returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare uid uuid:=auth.uid(); st jsonb; ps public.game04_home_promotion_state; day text:=to_char(statement_timestamp() at time zone 'Asia/Tokyo','YYYY-MM-DD'); offer text; inserted integer; purchased boolean;
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
  if ps.reserved_visit is distinct from p_visit_id or ps.reserved_kind is null or ps.reserved_until<=statement_timestamp() then return jsonb_build_object('recorded',false); end if;
  offer:=ps.reserved_kind;
  update public.game04_home_promotion_visits set shown_kind=offer where user_id=uid and visit_id=p_visit_id;
  update public.game04_home_promotion_state set free_shown_day=case when offer='daily-free' then day else free_shown_day end,
   starter_shown_at=case when offer='starter' then statement_timestamp() else starter_shown_at end,
   reserved_visit=null,reserved_until=null,reserved_kind=null where user_id=uid;
  return jsonb_build_object('recorded',true);
 end if;
 -- Initial sortie and pending acquisition/mission guides take priority, including on another device.
 if (st->'tutorial' is not null and not coalesce((st#>>'{tutorial,departed}')::boolean,false))
  or coalesce((st#>>'{earlyProgress,missionNavigationPending}')::boolean,false)
  or exists(select 1 from jsonb_each_text(coalesce(st#>'{earlyProgress,guides}','{}'::jsonb)) as g where g.value='pending') then
  return jsonb_build_object('blocked',true);
 end if;
 if ps.reserved_visit is not null and ps.reserved_visit<>p_visit_id and ps.reserved_until>statement_timestamp() then return '{}'::jsonb; end if;
 if not exists(select 1 from public.game04_home_promotion_visits where user_id=uid and visit_id=p_visit_id and shown_kind is null) then return '{}'::jsonb; end if;
 purchased:=exists(select 1 from public.user_shop_purchases where user_id=uid and product_id='beginner_pack_01' and purchase_count>0)
  or exists(select 1 from public.billing_orders where user_id=uid and product_id='beginner_pack_01' and status='GRANTED');
 if to_char(ps.starter_shown_at at time zone 'Asia/Tokyo','YYYY-MM-DD') is distinct from day then
  offer:='starter';
 elsif ps.visits>=2 and ps.free_shown_day is distinct from day and coalesce(st->>'dailyNormalGachaDate','')<>day then offer:='daily-free';
 end if;
 if offer is null then return jsonb_build_object('visits',ps.visits); end if;
 if p_action='reserve' then
  update public.game04_home_promotion_state set reserved_visit=p_visit_id,reserved_until=statement_timestamp()+interval '90 seconds',reserved_kind=offer where user_id=uid;
 end if;
 return jsonb_build_object('kind',offer,'visits',ps.visits,'day',day,'purchased',purchased);
end $$;
