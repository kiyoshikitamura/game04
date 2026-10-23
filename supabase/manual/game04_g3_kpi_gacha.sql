-- Read-only receipt projection. No revenue facts, historic backfill or G2 function replacement.
create or replace function public.game04_kpi_gacha_daily(p_from timestamptz,p_to timestamptz)
returns table(day_jst date,environment text,classification text,action text,category text,payment text,
 request_count bigint,draw_count bigint,exchange_count bigint,user_count bigint,cost_amount bigint,
 points_gained bigint,result_distribution jsonb)
language plpgsql stable security invoker set search_path=public,pg_temp as $$
begin
 if p_from is null or p_to is null or p_to<=p_from or p_to-p_from>interval '367 days' then raise exception 'Invalid measurement range'; end if;
 return query
 with facts as (
  -- Primary key (user_id,request_id) is the logical operation: retries add no facts.
  select q.user_id,(q.created_at at time zone 'Asia/Tokyo')::date day,
   q.result#>>'{receipt,gameplayMeasurement,action}' operation,
   q.result#>>'{receipt,gachaReceipt,category}' kind,
   q.result#>>'{receipt,gachaReceipt,payment}' paid_with,
   q.result#>'{receipt,gachaReceipt}' receipt,
   case when not exists(select 1 from public.kpi_subjects s where s.source_user_id=q.user_id) then 'unmapped'
    when exists(select 1 from public.kpi_subjects s where s.source_user_id=q.user_id and public.kpi_is_subject_excluded(s.subject_id,q.created_at)) then 'excluded'
    else 'included' end bucket
  from public.game04_requests q where q.created_at>=p_from and q.created_at<p_to
   and q.result#>>'{receipt,gameplayMeasurement,contractVersion}'='game04-gameplay-v1'
   and q.result#>>'{receipt,gameplayMeasurement,action}' in ('gacha_draw','gacha_exchange')
 ), groups as (
  select f.day,f.bucket,f.operation,f.kind,f.paid_with,count(*) requests,
   sum(case when f.operation='gacha_draw' then (f.receipt->>'count')::integer else 0 end)::bigint draws,
   count(*) filter(where f.operation='gacha_exchange') exchanges,count(distinct f.user_id) users,
   sum((f.receipt->>'cost')::integer)::bigint cost,sum((f.receipt->>'pointGain')::integer)::bigint points
  from facts f group by 1,2,3,4,5
 ), result_counts as (
  select f.day,f.bucket,f.operation,f.kind,f.paid_with,
   (item->>'kind')||':'||(item->>'rarity') result_key,count(*) amount
  from facts f cross join lateral jsonb_array_elements(f.receipt->'results') item group by 1,2,3,4,5,6
 ), distributions as (
  select r.day,r.bucket,r.operation,r.kind,r.paid_with,jsonb_object_agg(r.result_key,r.amount) distribution
  from result_counts r group by 1,2,3,4,5
 )
 select g.day,'development'::text,g.bucket,g.operation,g.kind,g.paid_with,g.requests,g.draws,g.exchanges,g.users,g.cost,g.points,d.distribution
 from groups g join distributions d using(day,bucket,operation,kind,paid_with)
 order by g.day,g.bucket,g.operation,g.kind,g.paid_with;
end $$;
revoke all on function public.game04_kpi_gacha_daily(timestamptz,timestamptz) from public,anon,authenticated;
grant execute on function public.game04_kpi_gacha_daily(timestamptz,timestamptz) to service_role;
