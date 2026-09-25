create or replace function public.game04_kpi_receipt_detail(p_from timestamptz,p_to timestamptz)
returns jsonb language plpgsql stable security invoker set search_path=public,pg_temp as $$
declare aggregate_result jsonb;
begin
 if p_from is null or p_to is null or p_to<=p_from or p_to-p_from>interval '367 days' then raise exception 'Invalid measurement range'; end if;
 with grants as (
  -- Versioned transaction receipts only. Distinct grant key avoids replays even across request IDs.
  select distinct on(r.user_id,r.result#>>'{receipt,gameplayMeasurement,roomId}',g->>'grantId')
   r.user_id,r.created_at at,r.result#>>'{receipt,gameplayMeasurement,roomId}' room_id,g
  from public.game04_requests r cross join lateral jsonb_array_elements(coalesce(r.result#>'{receipt,gameplayMeasurement,grants}','[]'::jsonb)) g
  where r.result#>>'{receipt,gameplayMeasurement,contractVersion}'='game04-gameplay-v1'
   and r.result#>>'{receipt,gameplayMeasurement,action}'='raid_claim'
   and r.result#>>'{receipt,gameplayMeasurement,roomId}' is not null and g->>'grantId' is not null
  order by r.user_id,r.result#>>'{receipt,gameplayMeasurement,roomId}',g->>'grantId',r.created_at
 ), classified as (
  select g.*,case when s.subject_id is null then 'unmapped'
   when public.kpi_is_subject_excluded(s.subject_id,g.at) then 'excluded' else 'included' end classification
  from grants g left join public.kpi_subjects s on s.source_user_id=g.user_id where g.at>=p_from and g.at<p_to
 ), rewards as (
  select c.*,r->>'kind' kind,r->>'id' reward_id,(r->>'amount')::numeric quantity
  from classified c cross join lateral jsonb_array_elements(c.g->'rewards') r
 ), daily as (
  select (r.at at time zone 'Asia/Tokyo')::date day_jst,r.classification,r.kind,r.reward_id,
   count(*) reward_line_count,count(distinct (r.user_id,r.room_id,r.g->>'grantId')) grant_count,count(distinct r.user_id) user_count,sum(r.quantity) quantity
  from rewards r group by 1,2,3,4
 ), restores as (
  select (o.observed_at at time zone 'Asia/Tokyo')::date day_jst,
   case when s.subject_id is null then 'unmapped' when public.kpi_is_subject_excluded(s.subject_id,o.observed_at) then 'excluded' else 'included' end classification,
   count(*) event_count,count(distinct o.user_id) user_count
  from public.game04_state_restore_observations o left join public.kpi_subjects s on s.source_user_id=o.user_id
  where o.observed_at>=p_from and o.observed_at<p_to group by 1,2
 ), facts as (
  select b.user_id,b.created_at at,'battle_started'::text phase from public.game04_battles b where b.created_at>=p_from and b.created_at<p_to
  union all select q.user_id,q.created_at,'saved_action' from public.game04_requests q where q.created_at>=p_from and q.created_at<p_to
   and q.result#>>'{receipt,gameplayMeasurement,contractVersion}'='game04-gameplay-v1'
  union all select o.user_id,o.observed_at,'restore_ack' from public.game04_state_restore_observations o where o.observed_at>=p_from and o.observed_at<p_to
 ), source_link as (
  -- One earliest binding per subject: repeated journeys never multiply gameplay facts.
  select distinct on(b.subject_id) b.subject_id,b.bound_at,j.source
  from public.kpi_acquisition_subject_bindings b join public.kpi_acquisition_journeys j using(journey_id)
  order by b.subject_id,b.bound_at,b.journey_id
 ), funnel as (
  select coalesce(l.source,'unbound') source,
   case when s.subject_id is null then 'unmapped'
    when l.source='qa_v1' or public.kpi_is_subject_excluded(s.subject_id,f.at) then 'excluded' else 'included' end classification,
   f.phase,count(*) event_count,count(distinct f.user_id) user_count
  from facts f left join public.kpi_subjects s on s.source_user_id=f.user_id
  left join source_link l on l.subject_id=s.subject_id and l.bound_at<=f.at
  group by 1,2,3
 )
 select jsonb_build_object('raid_rewards',coalesce((select jsonb_agg(to_jsonb(d)) from daily d),'[]'::jsonb),
  'restore_acknowledgements',coalesce((select jsonb_agg(to_jsonb(r)) from restores r),'[]'::jsonb),
  'acquisition_subject_activity',coalesce((select jsonb_agg(to_jsonb(f)) from funnel f),'[]'::jsonb)) into aggregate_result;
 return aggregate_result;
end $$;
revoke all on function public.game04_kpi_receipt_detail(timestamptz,timestamptz) from public,anon,authenticated;
grant execute on function public.game04_kpi_receipt_detail(timestamptz,timestamptz) to service_role;
