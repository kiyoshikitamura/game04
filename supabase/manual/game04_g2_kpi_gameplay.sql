-- GAME04 development only. Parent applies once after reviewing the target project.
-- No backfill, event table, trigger, or mutation of existing gameplay rows.
create or replace function public.game04_kpi_gameplay_daily(p_from timestamptz, p_to timestamptz)
returns table(day_jst date, environment text, classification text, action text, phase text,
 outcome text, event_count bigint, user_count bigint)
language plpgsql stable security invoker set search_path = public, pg_temp as $$
begin
 if p_from is null or p_to is null or p_to <= p_from or p_to-p_from > interval '367 days' then
  raise exception 'Invalid measurement range';
 end if;
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
      'set_home','raid_join','raid_leave','raid_rescue','encounter_ignore','shop_exchange','territory_host','raid_unlock')
 ), classified as (
   select f.*, case
     when not exists(select 1 from public.kpi_subjects s where s.source_user_id=f.user_id) then 'unmapped'
     when exists(select 1 from public.kpi_subjects s where s.source_user_id=f.user_id
       and public.kpi_is_subject_excluded(s.subject_id,f.at)) then 'excluded'
     else 'included' end bucket
   from facts f
 )
 select (c.at at time zone 'Asia/Tokyo')::date, 'development'::text, c.bucket,
  c.action,c.phase,c.outcome,count(*),count(distinct c.user_id)
 from classified c group by 1,3,4,5,6 order by 1,3,4,5,6;
end $$;
revoke all on function public.game04_kpi_gameplay_daily(timestamptz,timestamptz) from public,anon,authenticated;
grant execute on function public.game04_kpi_gameplay_daily(timestamptz,timestamptz) to service_role;
