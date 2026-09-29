CREATE OR REPLACE FUNCTION public.game04_kpi_dashboard_v1(p_from date, p_to date, p_period text, p_stages jsonb, p_tutorial_steps integer DEFAULT 17)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public', 'pg_temp'
 SET statement_timeout TO '25s'
AS $function$
declare v_now timestamptz:=statement_timestamp(); v_today date:=(statement_timestamp() at time zone 'Asia/Tokyo')::date; v_result jsonb;
begin
 if p_from is null or p_to is null or p_period is null or p_period not in ('daily','monthly')
 or p_from>p_to or p_to>v_today or p_to-p_from>366
 or p_tutorial_steps is null or p_tutorial_steps<1
 or p_stages is null or jsonb_typeof(p_stages)<>'array' or jsonb_array_length(p_stages)<>68 then
  raise exception 'Invalid GAME04 KPI request';
 end if;
 with exclusions as materialized (
  select s.source_user_id user_id,c.classification,c.valid_from,c.valid_to
  from public.kpi_subjects s join public.kpi_account_classification_periods c using(subject_id)
  where c.classification in ('admin','qa','test','fraud_suspended')
  union all select e.user_id,'reroll'::text,e.created_at,null::timestamptz from public.game04_kpi_reroll_exclusions e where e.revoked_at is null
 ), periods as materialized (
  select d::date start_day,least(case when p_period='daily' then d::date+1 else (d+interval '1 month')::date end,p_to+1) end_day,
   to_char(d,case when p_period='daily' then 'YYYY-MM-DD' else 'YYYY-MM' end) key
  from generate_series(case when p_period='daily' then p_from::timestamp else date_trunc('month',p_from::timestamp) end,
   p_to::timestamp,case when p_period='daily' then interval '1 day' else interval '1 month' end) d
 ), first_touch as materialized (
  select distinct on (s.source_user_id) s.source_user_id user_id,
   coalesce(b.first_touch_source,j.metadata->>'utm_source','unknown') source
  from public.kpi_subjects s join public.kpi_acquisition_subject_bindings b using(subject_id)
  join public.kpi_acquisition_journeys j using(journey_id)
  where b.source<>'qa_v1' and j.source<>'qa_v1'
  order by s.source_user_id,b.bound_at,b.journey_id
 ), users_base as materialized (
  select u.id,u.created_at,(u.created_at at time zone 'Asia/Tokyo')::date registered_day,
   case lower(coalesce(f.source,'')) when 'meta' then 'meta' when 'facebook' then 'meta' when 'instagram' then 'meta'
    when 'x' then 'x' when 'twitter' then 'x' when 'organic' then 'organic' when 'direct' then 'direct' else 'unknown' end source
  from public.users u left join first_touch f on f.user_id=u.id
  where u.created_at<=v_now and not exists(select 1 from exclusions x where x.user_id=u.id and (
    (x.classification in ('admin','qa','test','reroll') and x.valid_from<=v_now)
    or (x.classification='fraud_suspended' and x.valid_from<=u.created_at and (x.valid_to is null or u.created_at<x.valid_to))))
 ), completions as materialized (
  select r.user_id,min(r.created_at) completed_at from public.game04_requests r
  where p_tutorial_steps=17 and r.created_at<=v_now
   and CASE WHEN jsonb_typeof(r.result#>'{state,tutorial,step}')='number' THEN (r.result#>>'{state,tutorial,step}')::numeric>=17 ELSE false END
   and not exists(select 1 from exclusions x where x.user_id=r.user_id and (
    (x.classification in ('admin','qa','test','reroll') and x.valid_from<=v_now)
    or (x.classification='fraud_suspended' and x.valid_from<=r.created_at and (x.valid_to is null or r.created_at<x.valid_to))))
  group by r.user_id
  union all
  select r.user_id,min(r.created_at) completed_at from public.game04_requests r
  where p_tutorial_steps<>17 and r.created_at<=v_now and jsonb_typeof(r.result#>'{state,tutorial,step}')='number'
   and (r.result#>>'{state,tutorial,step}')::numeric>=p_tutorial_steps
   and not exists(select 1 from exclusions x where x.user_id=r.user_id and (
    (x.classification in ('admin','qa','test','reroll') and x.valid_from<=v_now)
    or (x.classification='fraud_suspended' and x.valid_from<=r.created_at and (x.valid_to is null or r.created_at<x.valid_to))))
  group by r.user_id
 ), activity_events as (
  select user_id,created_at at from public.game04_requests where created_at>=(p_from::timestamp at time zone 'Asia/Tokyo') and created_at<=v_now
  union all select user_id,observed_at from public.game04_state_restore_observations where observed_at>=(p_from::timestamp at time zone 'Asia/Tokyo') and observed_at<=v_now
  union all select user_id,created_at from public.game04_battles where created_at>=(p_from::timestamp at time zone 'Asia/Tokyo') and created_at<=v_now
  union all select user_id,settled_at from public.game04_battles where settled_at>=(p_from::timestamp at time zone 'Asia/Tokyo') and settled_at<=v_now
 ), activity as materialized (
  select distinct user_id,(at at time zone 'Asia/Tokyo')::date as day from activity_events
  where not exists(select 1 from exclusions x where x.user_id=activity_events.user_id and (
    (x.classification in ('admin','qa','test','reroll') and x.valid_from<=v_now)
    or (x.classification='fraud_suspended' and x.valid_from<=at and (x.valid_to is null or at<x.valid_to))))
 ), payments as materialized (
  select user_id,amount_jpy,(granted_at at time zone 'Asia/Tokyo')::date as day from public.billing_orders
  where status='GRANTED' and billing_mode='live' and granted_at>=(p_from::timestamp at time zone 'Asia/Tokyo') and granted_at<=v_now
   and not exists(select 1 from exclusions x where x.user_id=billing_orders.user_id and (
    (x.classification in ('admin','qa','test','reroll') and x.valid_from<=v_now)
    or (x.classification='fraud_suspended' and x.valid_from<=granted_at and (x.valid_to is null or granted_at<x.valid_to))))
 ), cohorts as materialized (
  select p.key,u.*,c.completed_at from periods p join users_base u on u.registered_day>=p.start_day and u.registered_day<p.end_day
  left join completions c on c.user_id=u.id
 ), retention as materialized (
  select p.key,d.day,count(c.id) filter(where c.registered_day+d.day<=v_today) denominator,
   count(c.id) filter(where c.registered_day+d.day<=v_today and exists(select 1 from activity a where a.user_id=c.id and a.day=c.registered_day+d.day)) numerator,
   count(c.id) filter(where c.registered_day+d.day>=v_today) immature
  from periods p cross join generate_series(1,5) d(day) left join cohorts c on c.key=p.key group by p.key,d.day
 ), overview as (
  select p.key,p.start_day,p.end_day,
   (select count(*) from cohorts c where c.key=p.key) new_users,
   (select count(*) from users_base u where u.registered_day<p.end_day) total_registered,
   (select count(distinct a.user_id) from activity a where a.day>=p.start_day and a.day<p.end_day) active_users,
   (select count(*) from cohorts c where c.key=p.key and c.completed_at is not null) tutorial_completed,
   (select count(distinct b.user_id) from payments b where b.day>=p.start_day and b.day<p.end_day) payers,
   (select coalesce(sum(b.amount_jpy),0) from payments b where b.day>=p.start_day and b.day<p.end_day) revenue
  from periods p
 ), overview_json as (
  select jsonb_agg(jsonb_build_object('date',o.key,'new_users',o.new_users,'total_registered',o.total_registered,
   'active_users',o.active_users,'tutorial_completed',o.tutorial_completed,'tutorial_rate',o.tutorial_completed::numeric/nullif(o.new_users,0),
   'payers',o.payers,'revenue',o.revenue,'payer_rate',o.payers::numeric/nullif(o.active_users,0),
   'arppu',o.revenue::numeric/nullif(o.payers,0),'arpu',o.revenue::numeric/nullif(o.active_users,0),
   'partial',o.end_day>v_today,'retention',(select jsonb_agg(jsonb_build_object('day',r.day,'numerator',case when r.denominator>0 then r.numerator end,
    'denominator',nullif(r.denominator,0),'value',r.numerator::numeric/nullif(r.denominator,0),'immature',r.immature,'status',case when r.denominator=0 then case when r.immature>0 then 'not_reached' else 'no_subjects' end when r.immature>0 then 'provisional' else 'final' end) order by r.day) from retention r where r.key=o.key)) order by o.start_day desc) data from overview o
 ), stages as (
  select item->>'id' id,item->>'design_id' design_id,item->>'name' name,ordinality from jsonb_array_elements(p_stages) with ordinality as s(item,ordinality)
 ), quest_executions as (
  select b.target_id,count(*) executions from public.game04_battles b
  where b.kind='quest' and b.created_at<=v_now and not exists(select 1 from exclusions x where x.user_id=b.user_id and (
    (x.classification in ('admin','qa','test','reroll') and x.valid_from<=v_now)
    or (x.classification='fraud_suspended' and x.valid_from<=b.created_at and (x.valid_to is null or b.created_at<x.valid_to))))
  group by b.target_id
 ), quest_clears as (
  select b.target_id,count(*) clears from public.game04_battles b
  where b.kind='quest' and b.status='settled' and b.result#>>'{battle,outcome}'='win'
   and b.created_at<=v_now and b.settled_at<=v_now
   and not exists(select 1 from exclusions x where x.user_id=b.user_id and (
    (x.classification in ('admin','qa','test','reroll') and x.valid_from<=v_now)
    or (x.classification='fraud_suspended' and x.valid_from<=b.created_at and (x.valid_to is null or b.created_at<x.valid_to))))
   and not exists(select 1 from exclusions x where x.user_id=b.user_id and (
    (x.classification in ('admin','qa','test','reroll') and x.valid_from<=v_now)
    or (x.classification='fraud_suspended' and x.valid_from<=b.settled_at and (x.valid_to is null or b.settled_at<x.valid_to))))
  group by b.target_id
 ), stage_counts as (
  select e.target_id,e.executions,coalesce(c.clears,0) clears
  from quest_executions e left join quest_clears c using(target_id)
 ), stage_json as (
  select jsonb_agg(jsonb_build_object('id',s.id,'design_id',s.design_id,'name',s.name,
   'executions',coalesce(c.executions,0),'clears',coalesce(c.clears,0),'clear_rate',coalesce(c.clears,0)::numeric/nullif(c.executions,0)) order by s.ordinality) data
  from stages s left join stage_counts c on c.target_id=s.id
 ), all_rooms as materialized (
  select r.id,r.created_at,r.state->>'status' status,r.state->>'ownerId' owner_id,
   coalesce(r.state#>>'{raidSnapshot,type}',r.state#>>'{territorySnapshot,raidMaster,type}',
    case r.state->>'masterId' when 'encounter_flame' then 'encounter' when 'unlock_shadow' then 'unlock' end) kind
  from public.game04_raid_rooms r where r.created_at<=v_now
 ), rooms as materialized (
  select * from all_rooms r where not exists(select 1 from exclusions x where x.user_id=r.owner_id::uuid and (
    (x.classification in ('admin','qa','test','reroll') and x.valid_from<=v_now)
    or (x.classification='fraud_suspended' and x.valid_from<=r.created_at and (x.valid_to is null or r.created_at<x.valid_to))))
 ), first_defeats as materialized (
  -- Immutable committed receipts, never room.updated_at (claims can change it).
  select distinct on(r.result#>>'{room,id}') r.result#>>'{room,id}' room_id,r.created_at at,r.user_id
  from public.game04_requests r where r.result#>>'{room,status}'='defeated' and r.created_at<=v_now
  order by r.result#>>'{room,id}',r.created_at,r.request_id
 ), raid_events as materialized (
  select r.kind,r.created_at at,'hosted' event,null::uuid user_id from rooms r
  union all select r.kind,d.at,'defeated',null::uuid from rooms r join first_defeats d on d.room_id=r.id::text
   where not exists(select 1 from exclusions x where x.user_id=d.user_id and (
    (x.classification in ('admin','qa','test','reroll') and x.valid_from<=v_now)
    or (x.classification='fraud_suspended' and x.valid_from<=d.at and (x.valid_to is null or d.at<x.valid_to))))
  union all select r.kind,b.created_at,'participant',b.user_id from public.game04_battles b join rooms r on r.id::text=b.target_id
   where b.kind='raid' and b.created_at<=v_now and not exists(select 1 from exclusions x where x.user_id=b.user_id and (
    (x.classification in ('admin','qa','test','reroll') and x.valid_from<=v_now)
    or (x.classification='fraud_suspended' and x.valid_from<=b.created_at and (x.valid_to is null or b.created_at<x.valid_to))))
 ), raids as (
  select p.key,k.kind,count(*) filter(where e.event='hosted') hosted,count(*) filter(where e.event='defeated') defeated,
   count(distinct e.user_id) filter(where e.event='participant') participants
  from periods p cross join (values('encounter'),('unlock')) k(kind) left join raid_events e on e.kind=k.kind
   and e.at>=(p.start_day::timestamp at time zone 'Asia/Tokyo') and e.at<(p.end_day::timestamp at time zone 'Asia/Tokyo')
  group by p.key,k.kind
 ), source_names as (select unnest(array['meta','x','organic','direct','unknown']) source),
 landings as materialized (
  select j.journey_id,(coalesce(j.first_arrived_at,j.started_at) at time zone 'Asia/Tokyo')::date as day,
   case lower(coalesce(j.metadata->>'utm_source','')) when 'meta' then 'meta' when 'facebook' then 'meta' when 'instagram' then 'meta'
    when 'x' then 'x' when 'twitter' then 'x' when 'organic' then 'organic' when 'direct' then 'direct' else 'unknown' end source,
   s.source_user_id user_id
  from public.kpi_acquisition_journeys j left join public.kpi_acquisition_subject_bindings b using(journey_id)
   left join public.kpi_subjects s using(subject_id)
  where j.source<>'qa_v1' and coalesce(b.source,'')<>'qa_v1' and coalesce(j.first_arrived_at,j.started_at)<=v_now
   and not exists(select 1 from exclusions x where x.user_id=s.source_user_id and (
    (x.classification in ('admin','qa','test','reroll') and x.valid_from<=v_now)
    or (x.classification='fraud_suspended' and x.valid_from<=coalesce(j.first_arrived_at,j.started_at) and (x.valid_to is null or coalesce(j.first_arrived_at,j.started_at)<x.valid_to))))
 ), sources as (
  select p.key,n.source,
   (select count(*) from landings l where l.source=n.source and l.day>=p.start_day and l.day<p.end_day) landings,
   (select count(*) from landings l where l.source=n.source and l.day>=p.start_day and l.day<p.end_day and l.user_id is not null) landing_starts,
   (select count(*) from cohorts c where c.key=p.key and c.source=n.source) new_users,
   (select count(*) from cohorts c where c.key=p.key and c.source=n.source and c.completed_at is not null) tutorial_completed,
   (select jsonb_agg(jsonb_build_object('day',d.day,
    'status',case
     when not exists(select 1 from cohorts c where c.key=p.key and c.source=n.source) then 'no_subjects'
     when not exists(select 1 from cohorts c where c.key=p.key and c.source=n.source and c.registered_day+d.day<=v_today) then 'not_reached'
     when exists(select 1 from cohorts c where c.key=p.key and c.source=n.source and c.registered_day+d.day>=v_today) then 'provisional'
     else 'final' end,
    'denominator',nullif((select count(*) from cohorts c where c.key=p.key and c.source=n.source and c.registered_day+d.day<=v_today),0),
    'numerator',(select count(*) from cohorts c where c.key=p.key and c.source=n.source and c.registered_day+d.day<=v_today and exists(select 1 from activity a where a.user_id=c.id and a.day=c.registered_day+d.day))) order by d.day)
    from (values(1),(3)) d(day)) retention
  from periods p cross join source_names n
 )
 select jsonb_build_object('definition_version','game04-kpi-v1-20260930-retention-progress','timezone','Asia/Tokyo','updated_at',v_now,
  'period',p_period,'from',p_from,'to',p_to,'rows',(select data from overview_json),'stages',(select data from stage_json),
  'raids',(select jsonb_agg(to_jsonb(r) order by r.key desc,r.kind) from raids r),
  'sources',(select jsonb_agg(to_jsonb(s) order by s.key desc,s.source) from sources s),
  'coverage',jsonb_build_object('raid_defeat_without_receipt',(select count(*) from rooms r where r.status='defeated' and not exists(select 1 from first_defeats d where d.room_id=r.id::text)),
   'raid_unknown_type',(select count(*) from rooms where kind is null or kind not in ('encounter','unlock')),
   'stage_unknown_id',(select coalesce(sum(c.executions),0) from stage_counts c where not exists(select 1 from stages s where s.id=c.target_id)))) into v_result;
 return v_result;
end $function$
;
