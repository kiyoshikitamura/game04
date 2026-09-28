-- GAME04 G3 only. Apply after game04_g3_gacha_atomic_commit.sql.
-- Preserves the live G2 signatures, CTEs, event-time QA classification and grants.
-- Diamond spend is an in-game resource quantity; this file does not create purchase/revenue facts.

create or replace function public.game04_commit_gacha(
 p_user_id uuid,p_expected_version bigint,p_state jsonb,p_cash_delta bigint,
 p_before_diamonds integer,p_diamond_cost integer,p_request_id uuid,
 p_operation text,p_request_payload jsonb,p_receipt jsonb
) returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare
 u public.users%rowtype;
 prior jsonb;
 v_result jsonb;
 v_saved_state jsonb;
 v_ticket_id text;
 v_ticket_cost integer:=0;
 v_ticket_balance integer;
 v_receipt jsonb;
 v_jst_day text;
begin
 if p_request_id is null or p_operation not in ('normal_gacha','special_gacha','special_gacha_exchange','formal_gacha','formal_gacha_exchange')
  or jsonb_typeof(p_request_payload) is distinct from 'object' or jsonb_typeof(p_state) is distinct from 'object'
  or jsonb_typeof(p_receipt) is distinct from 'object' then raise exception 'INVALID_GACHA_REQUEST'; end if;
 if p_receipt#>>'{gameplayMeasurement,contractVersion}' is distinct from 'game04-gameplay-v1'
  or p_receipt#>>'{gameplayMeasurement,action}' is distinct from p_operation
  or jsonb_typeof(p_receipt#>'{gameplayMeasurement,gacha}') is distinct from 'object' then raise exception 'INVALID_GACHA_MEASUREMENT'; end if;
 select * into u from public.users where id=p_user_id for update;
 if not found then raise exception 'GAME_USER_NOT_FOUND'; end if;
 select r.result into prior from public.game04_requests r where r.user_id=p_user_id and r.request_id=p_request_id;
 if found then
  if prior->>'operation' is distinct from p_operation or prior->'requestPayload' is distinct from p_request_payload then raise exception 'REQUEST_ID_REUSED'; end if;
  return prior||jsonb_build_object('replayed',true);
 end if;
 select s.state into v_saved_state from public.game04_player_state s where s.user_id=p_user_id for update;
 if not found then raise exception 'GAME_STATE_NOT_FOUND'; end if;
 if coalesce(p_state->'questTicketGrants','{}'::jsonb) is distinct from coalesce(v_saved_state->'questTicketGrants','{}'::jsonb)
  or p_state ? 'gachaTicketBalances' then raise exception 'INVALID_GACHA_TICKET_STATE'; end if;
 if p_operation='special_gacha' and p_request_payload->>'payment'='TICKET' then
  if p_request_payload->>'count' is distinct from '1' then raise exception 'INVALID_GACHA_TICKET_COUNT'; end if;
  v_ticket_id:=case p_request_payload->>'category'
   when 'character' then 'SPECIAL_TICKET_CHARACTER'
   when 'skill' then 'SPECIAL_TICKET_SKILL'
   when 'equipment' then 'SPECIAL_TICKET_EQUIPMENT'
   else null end;
  if v_ticket_id is null then raise exception 'INVALID_GACHA_TICKET_CATEGORY'; end if;
  v_ticket_cost:=1;
 elsif p_request_payload->>'payment'='TICKET' then
  raise exception 'INVALID_GACHA_TICKET_OPERATION';
 end if;
 if p_operation='normal_gacha' then
  v_jst_day:=to_char(clock_timestamp() at time zone 'Asia/Tokyo','YYYY-MM-DD');
  if p_receipt->>'normalGachaJstDay' is distinct from v_jst_day
   or (p_request_payload->>'payment'='FREE' and p_state->>'dailyNormalGachaDate' is distinct from v_jst_day) then
   raise exception 'GACHA_DAY_CHANGED' using errcode='40001';
  end if;
 end if;
 if p_diamond_cost is null or p_diamond_cost<0 or p_diamond_cost>3000
  or p_before_diamonds is null or (p_state->>'diamonds')::integer is distinct from p_before_diamonds-p_diamond_cost then raise exception 'INVALID_GACHA_COST'; end if;
 update public.users set neon_diamonds=neon_diamonds where id=p_user_id returning * into u;
 if u.neon_diamonds<>p_before_diamonds then raise exception 'STATE_CONFLICT' using errcode='40001'; end if;
 if u.neon_diamonds<p_diamond_cost then raise exception 'INSUFFICIENT_RESOURCE'; end if;
 update public.users set neon_diamonds=neon_diamonds-p_diamond_cost where id=p_user_id;
 if v_ticket_id is not null then
  select i.quantity into v_ticket_balance from public.user_items i where i.user_id=p_user_id and i.item_id=v_ticket_id for update;
  if coalesce(v_ticket_balance,0)<v_ticket_cost then raise exception 'INSUFFICIENT_RESOURCE'; end if;
  update public.user_items set quantity=quantity-v_ticket_cost,updated_at=clock_timestamp()
   where user_id=p_user_id and item_id=v_ticket_id returning quantity into v_ticket_balance;
 end if;
 v_receipt:=p_receipt||case when v_ticket_id is null then '{}'::jsonb else jsonb_build_object(
  'specialGachaTicketId',v_ticket_id,'specialGachaTicketCost',v_ticket_cost,'specialGachaTicketBalanceAfter',v_ticket_balance) end;
 v_result:=public.game04_commit_growth_state(p_user_id,p_expected_version,p_state,p_cash_delta,0,p_request_id,p_receipt=>v_receipt);
 v_result:=v_result||jsonb_build_object('operation',p_operation,'requestPayload',p_request_payload,'receipt',v_receipt);
 update public.game04_requests set result=v_result where user_id=p_user_id and request_id=p_request_id;
 return v_result||jsonb_build_object('replayed',false);
end $$;
revoke all on function public.game04_commit_gacha(uuid,bigint,jsonb,bigint,integer,integer,uuid,text,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.game04_commit_gacha(uuid,bigint,jsonb,bigint,integer,integer,uuid,text,jsonb,jsonb) to service_role;

create or replace function public.game04_kpi_gameplay_daily(p_from timestamptz, p_to timestamptz)
returns table(day_jst date, environment text, classification text, action text, phase text,
 outcome text, event_count bigint, user_count bigint)
language plpgsql stable security invoker set search_path = public, pg_temp as $$
begin
 if p_from is null or p_to is null or p_to <= p_from or p_to-p_from > interval '367 days' then raise exception 'Invalid measurement range'; end if;
 return query
 with facts as (
   select b.user_id, b.created_at at, b.kind||'_battle' action, 'started' phase, null::text outcome
   from public.game04_battles b where b.created_at >= p_from and b.created_at < p_to
   union all
   select b.user_id, b.settled_at, b.kind||'_battle', 'settled', b.result->'battle'->>'outcome'
   from public.game04_battles b where b.status='settled' and b.settled_at >= p_from and b.settled_at < p_to
   union all
   select r.user_id, r.created_at, r.result->'receipt'->'gameplayMeasurement'->>'action', 'committed', null::text
   from public.game04_requests r
   where r.created_at >= p_from and r.created_at < p_to
    and r.result->'receipt'->'gameplayMeasurement'->>'contractVersion'='game04-gameplay-v1'
    and r.result->'receipt'->'gameplayMeasurement'->>'action' in
     ('save_deck','character_level','character_awaken','equipment_level','skill_level','equipment_lb',
      'soul_exchange','soul_select','character_unlock','use_energy_drink','claim_mission','raid_claim',
      'set_home','raid_join','raid_leave','raid_rescue','encounter_ignore','shop_exchange','territory_host','raid_unlock',
      'normal_gacha','special_gacha','special_gacha_exchange')
 ), classified as (
   select f.*, case
     when not exists(select 1 from public.kpi_subjects s where s.source_user_id=f.user_id) then 'unmapped'
     when exists(select 1 from public.kpi_subjects s where s.source_user_id=f.user_id and public.kpi_is_subject_excluded(s.subject_id,f.at)) then 'excluded'
     else 'included' end bucket
   from facts f
 )
 select (c.at at time zone 'Asia/Tokyo')::date, 'development'::text, c.bucket,
  c.action,c.phase,c.outcome,count(*),count(distinct c.user_id)
 from classified c group by 1,3,4,5,6 order by 1,3,4,5,6;
end $$;
revoke all on function public.game04_kpi_gameplay_daily(timestamptz,timestamptz) from public,anon,authenticated;
grant execute on function public.game04_kpi_gameplay_daily(timestamptz,timestamptz) to service_role;

create or replace function public.game04_kpi_receipt_detail(p_from timestamptz,p_to timestamptz)
returns jsonb language plpgsql stable security invoker set search_path=public,pg_temp as $$
declare aggregate_result jsonb;
begin
 if p_from is null or p_to is null or p_to<=p_from or p_to-p_from>interval '367 days' then raise exception 'Invalid measurement range'; end if;
 with grants as (
  select distinct on(r.user_id,r.result#>>'{receipt,gameplayMeasurement,roomId}',g->>'grantId')
   r.user_id,r.created_at at,r.result#>>'{receipt,gameplayMeasurement,roomId}' room_id,g
  from public.game04_requests r cross join lateral jsonb_array_elements(coalesce(r.result#>'{receipt,gameplayMeasurement,grants}','[]'::jsonb)) g
  where r.result#>>'{receipt,gameplayMeasurement,contractVersion}'='game04-gameplay-v1'
   and r.result#>>'{receipt,gameplayMeasurement,action}'='raid_claim'
   and r.result#>>'{receipt,gameplayMeasurement,roomId}' is not null and g->>'grantId' is not null
  order by r.user_id,r.result#>>'{receipt,gameplayMeasurement,roomId}',g->>'grantId',r.created_at
 ), classified as (
  select g.*,case when s.subject_id is null then 'unmapped' when public.kpi_is_subject_excluded(s.subject_id,g.at) then 'excluded' else 'included' end classification
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
  select distinct on(b.subject_id) b.subject_id,b.bound_at,j.source
  from public.kpi_acquisition_subject_bindings b join public.kpi_acquisition_journeys j using(journey_id)
  order by b.subject_id,b.bound_at,b.journey_id
 ), funnel as (
  select coalesce(l.source,'unbound') source,
   case when s.subject_id is null then 'unmapped' when l.source='qa_v1' or public.kpi_is_subject_excluded(s.subject_id,f.at) then 'excluded' else 'included' end classification,
   f.phase,count(*) event_count,count(distinct f.user_id) user_count
  from facts f left join public.kpi_subjects s on s.source_user_id=f.user_id
  left join source_link l on l.subject_id=s.subject_id and l.bound_at<=f.at group by 1,2,3
 ), gacha_base as (
  select q.user_id,q.request_id,q.created_at at,q.result#>>'{receipt,gameplayMeasurement,action}' action,
   q.result#>'{receipt,gameplayMeasurement,gacha}' g,
   case when s.subject_id is null then 'unmapped' when public.kpi_is_subject_excluded(s.subject_id,q.created_at) then 'excluded' else 'included' end classification
  from public.game04_requests q left join public.kpi_subjects s on s.source_user_id=q.user_id
  where q.created_at>=p_from and q.created_at<p_to
   and q.result#>>'{receipt,gameplayMeasurement,contractVersion}'='game04-gameplay-v1'
   and q.result#>>'{receipt,gameplayMeasurement,action}' in ('normal_gacha','special_gacha','special_gacha_exchange')
 ), gacha_actions as (
  select (g.at at time zone 'Asia/Tokyo')::date day_jst,g.classification,g.action,g.g->>'category' category,g.g->>'payment' payment,
   nullif(g.g->>'exchangeItemId','') exchange_item_id,count(*) event_count,count(distinct g.user_id) user_count,
   sum(case when g.action='special_gacha_exchange' then 0 else (g.g->>'count')::bigint end) draw_count,
   count(*) filter(where g.action='special_gacha_exchange') exchange_count,sum((g.g->>'diamondCost')::bigint) diamond_spent,
   sum((g.g->>'cashCost')::bigint) game_cash_spent,sum((g.g->>'ticketCost')::bigint) tickets_spent,
   sum((g.g->>'pointsAdded')::bigint) points_added,sum((g.g->>'pointsSpent')::bigint) points_spent
  from gacha_base g group by 1,2,3,4,5,6
 ), gacha_result_lines as (
  select g.*,line from gacha_base g cross join lateral jsonb_array_elements(coalesce(g.g->'resultSummary','[]'::jsonb)) line
 ), gacha_results as (
  select (g.at at time zone 'Asia/Tokyo')::date day_jst,g.classification,g.action,
   g.line->>'category' category,g.line->>'rarity' rarity,g.line->>'acquisition' acquisition,
   count(distinct (g.user_id,g.request_id)) event_count,count(distinct g.user_id) user_count,
   sum((g.line->>'count')::bigint) result_count,sum((g.line->>'convertedAmount')::bigint) converted_amount
  from gacha_result_lines g group by 1,2,3,4,5,6
 )
 select jsonb_build_object(
  'raid_rewards',coalesce((select jsonb_agg(to_jsonb(d)) from daily d),'[]'::jsonb),
  'restore_acknowledgements',coalesce((select jsonb_agg(to_jsonb(r)) from restores r),'[]'::jsonb),
  'acquisition_subject_activity',coalesce((select jsonb_agg(to_jsonb(f)) from funnel f),'[]'::jsonb),
  'gacha_actions',coalesce((select jsonb_agg(to_jsonb(g) order by g.day_jst,g.classification,g.action,g.category,g.payment) from gacha_actions g),'[]'::jsonb),
  'gacha_results',coalesce((select jsonb_agg(to_jsonb(g) order by g.day_jst,g.classification,g.action,g.category,g.rarity,g.acquisition) from gacha_results g),'[]'::jsonb)
 ) into aggregate_result;
 return aggregate_result;
end $$;
revoke all on function public.game04_kpi_receipt_detail(timestamptz,timestamptz) from public,anon,authenticated;
grant execute on function public.game04_kpi_receipt_detail(timestamptz,timestamptz) to service_role;
notify pgrst,'reload schema';
