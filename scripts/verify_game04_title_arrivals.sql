begin;
select set_config('request.jwt.claims','{}',true);
select public.game04_record_title_arrival_v1('a9212781-691d-4f2a-832a-7106aa5a7101','b9212781-691d-4f2a-832a-7106aa5a7101');
select public.game04_record_title_arrival_v1('a9212781-691d-4f2a-832a-7106aa5a7101','b9212781-691d-4f2a-832a-7106aa5a7101');
select public.game04_record_title_arrival_v1('a9212781-691d-4f2a-832a-7106aa5a7102','b9212781-691d-4f2a-832a-7106aa5a7101');
select public.game04_record_title_arrival_v1('a9212781-691d-4f2a-832a-7106aa5a7103','b9212781-691d-4f2a-832a-7106aa5a7102');
update public.game04_title_arrivals set arrived_at=case when event_id='a9212781-691d-4f2a-832a-7106aa5a7101' then '2001-01-01 14:59:59Z'::timestamptz else '2001-01-01 15:00:00Z'::timestamptz end where event_id::text like 'a9212781%';
do $$ declare d jsonb; m jsonb; begin
 if (select count(*) from public.game04_title_arrivals where event_id::text like 'a9212781%')<>3 then raise exception 'Retry dedup failed';end if;
 d:=public.game04_title_uu_v1('2001-01-01','2001-01-02','daily');
 m:=public.game04_title_uu_v1('2001-01-01','2001-01-31','monthly');
 if (d#>>'{rows,0,title_uu}')::int<>2 or (d#>>'{rows,1,title_uu}')::int<>1 or (m#>>'{rows,0,title_uu}')::int<>2 then raise exception 'Browser UU / JST / monthly dedup failed';end if;
 if has_table_privilege('anon','public.game04_title_arrivals','select') or has_table_privilege('anon','public.game04_title_arrivals','insert') or has_function_privilege('anon','public.game04_title_uu_v1(date,date,text)','execute') then raise exception 'Anonymous read/direct write exposed'; end if;
end $$;
insert into auth.users(id) values('c9212781-691d-4f2a-832a-7106aa5a7101');
insert into public.users(id,username) values('c9212781-691d-4f2a-832a-7106aa5a7101','UU検証');
insert into public.kpi_subjects(source_user_id,registered_at,registration_type) values('c9212781-691d-4f2a-832a-7106aa5a7101',now(),'unknown') on conflict(source_user_id) do nothing;
insert into public.kpi_account_classification_periods(subject_id,classification,valid_from,reason) select subject_id,'qa',now(),'Title UU rollback fixture' from public.kpi_subjects where source_user_id='c9212781-691d-4f2a-832a-7106aa5a7101';
select set_config('request.jwt.claim.sub','c9212781-691d-4f2a-832a-7106aa5a7101',true);
select public.game04_record_title_arrival_v1('a9212781-691d-4f2a-832a-7106aa5a7101','b9212781-691d-4f2a-832a-7106aa5a7101');
do $$ declare d jsonb; begin
 d:=public.game04_title_uu_v1('2001-01-01','2001-01-02','daily');
 if (d#>>'{rows,0,title_uu}')::int<>1 or (d#>>'{rows,1,title_uu}')::int<>0 then raise exception 'Late QA browser exclusion failed';end if;
end $$;
rollback;
select 'PASS retry dedup, browser dedup, monthly distinct, JST, no public table read/write or aggregate access; fixtures rolled back' as result;
