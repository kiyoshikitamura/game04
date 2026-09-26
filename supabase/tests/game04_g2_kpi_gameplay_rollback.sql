-- Run after the parent applies function candidate. Rolls back ALL test data.
begin;
do $$
declare
 qa uuid := 'd6dabf02-3eb2-430e-8352-561f8d735469';
 sid uuid; rid uuid := gen_random_uuid(); n bigint; expected bigint;
 baseline bigint; after_count bigint;
 at_time timestamptz := now();
begin
 if has_function_privilege('anon','public.game04_kpi_gameplay_daily(timestamptz,timestamptz)','execute')
 or has_function_privilege('authenticated','public.game04_kpi_gameplay_daily(timestamptz,timestamptz)','execute')
 or not has_function_privilege('service_role','public.game04_kpi_gameplay_daily(timestamptz,timestamptz)','execute') then
  raise exception 'function role boundary failed';
 end if;
 select subject_id into strict sid from public.kpi_subjects where source_user_id=qa;
 insert into public.kpi_account_classification_periods(subject_id,classification,valid_from,reason)
 values(sid,'qa',at_time-interval '1 second','G2 KPI rollback fixture');
 select coalesce(sum(event_count),0) into baseline from public.game04_kpi_gameplay_daily(at_time-interval '1 second',at_time+interval '1 second')
 where action='use_energy_drink' and classification='excluded';
 insert into public.game04_requests(user_id,request_id,result,created_at)
 values(qa,rid,'{"receipt":{"gameplayMeasurement":{"contractVersion":"game04-gameplay-v1","action":"use_energy_drink"}}}',at_time)
 on conflict(user_id,request_id) do nothing;
 insert into public.game04_requests(user_id,request_id,result,created_at)
 values(qa,rid,'{"receipt":{"gameplayMeasurement":{"contractVersion":"game04-gameplay-v1","action":"use_energy_drink"}}}',at_time)
 on conflict(user_id,request_id) do nothing;
 select coalesce(sum(event_count),0) into after_count from public.game04_kpi_gameplay_daily(at_time-interval '1 second',at_time+interval '1 second')
 where action='use_energy_drink' and classification='excluded';
 if after_count<>baseline+1 then raise exception 'request duplicate or exclusion failed'; end if;
 select coalesce(sum(event_count),0) into n from public.game04_kpi_gameplay_daily('2026-09-01','2026-10-01') where phase='settled';
 select count(*) into expected from public.game04_battles where status='settled' and settled_at>='2026-09-01' and settled_at<'2026-10-01';
 if n<>expected then raise exception 'battle count mismatch %/%',n,expected; end if;
 if exists(select 1 from public.game04_kpi_gameplay_daily('2026-09-01','2026-10-01') where environment<>'development') then
  raise exception 'environment separation failed';
 end if;
 begin
  perform * from public.game04_kpi_gameplay_daily('2026-10-01','2026-09-01');
  raise exception 'invalid date accepted';
 exception when raise_exception then
  if sqlerrm<>'Invalid measurement range' then raise; end if;
 end;
 raise notice 'PASS: service-only, QA exclusion, duplicate request, battle facts, development isolation, date validation';
end $$;
rollback;
