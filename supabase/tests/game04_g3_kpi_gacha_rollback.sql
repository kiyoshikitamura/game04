-- Apply the G3 KPI candidate first. This fixture creates its own QA subject and rolls back every row.
begin;
do $$
declare
 qa uuid:=gen_random_uuid(); sid uuid:=gen_random_uuid(); at_time timestamptz:='2099-01-01 00:00:00+00';
 normal_id uuid:=gen_random_uuid(); detail jsonb; n bigint; actions jsonb; results jsonb;
begin
 insert into public.users(id,username) values(qa,'G3KPIQA');
 insert into public.kpi_subjects(subject_id,source_user_id,registered_at,registration_type)
 values(sid,qa,at_time,'authenticated');
 insert into public.kpi_account_classification_periods(subject_id,classification,valid_from,reason)
 values(sid,'qa',at_time-interval '1 second','G3 isolated rollback fixture');

 insert into public.game04_requests(user_id,request_id,created_at,result) values
 (qa,normal_id,at_time,jsonb_build_object('operation','normal_gacha','receipt',jsonb_build_object(
  'gameplayMeasurement',jsonb_build_object('contractVersion','game04-gameplay-v1','action','normal_gacha',
   'gacha',jsonb_build_object('masterVersion','fixture','category','mixed','count',1,'payment','CASH','diamondCost',0,'cashCost',1000,'ticketCost',0,
    'pointsAdded',0,'pointsSpent',0,'pointsAfter',0,'exchangeItemId',null,'resultSummary',jsonb_build_array(
     jsonb_build_object('category','character','rarity','R','acquisition','new','count',1,'convertedAmount',0))))))),
 (qa,gen_random_uuid(),at_time,jsonb_build_object('operation','special_gacha','receipt',jsonb_build_object(
  'gameplayMeasurement',jsonb_build_object('contractVersion','game04-gameplay-v1','action','special_gacha',
   'gacha',jsonb_build_object('masterVersion','fixture','category','skill','count',1,'payment','DIAMONDS','diamondCost',300,'cashCost',0,'ticketCost',0,
    'pointsAdded',1,'pointsSpent',0,'pointsAfter',1,'exchangeItemId',null,'resultSummary',jsonb_build_array(
     jsonb_build_object('category','skill','rarity','SR','acquisition','duplicate','count',1,'convertedAmount',5))))))),
 (qa,gen_random_uuid(),at_time,jsonb_build_object('operation','special_gacha_exchange','receipt',jsonb_build_object(
  'gameplayMeasurement',jsonb_build_object('contractVersion','game04-gameplay-v1','action','special_gacha_exchange',
   'gacha',jsonb_build_object('masterVersion','fixture','category','equipment','count',1,'payment','POINTS','diamondCost',0,'cashCost',0,'ticketCost',0,
    'pointsAdded',0,'pointsSpent',100,'pointsAfter',5,'exchangeItemId','EQD001','resultSummary',jsonb_build_array(
     jsonb_build_object('category','equipment','rarity','SSR','acquisition','instance','count',1,'convertedAmount',0)))))));

 -- The same request cannot create a second success fact.
 insert into public.game04_requests(user_id,request_id,created_at,result)
 select user_id,request_id,created_at,result from public.game04_requests where user_id=qa and request_id=normal_id
 on conflict(user_id,request_id) do nothing;
 select count(*) into n from public.game04_requests where user_id=qa;
 if n<>3 then raise exception 'fixture replay produced % request rows',n; end if;

 select count(*) into n from public.game04_kpi_gameplay_daily(at_time-interval '1 second',at_time+interval '1 second')
 where classification='excluded' and action in ('normal_gacha','special_gacha','special_gacha_exchange');
 if n<>3 then raise exception 'daily KPI did not expose all three gacha actions: %',n; end if;
 if exists(select 1 from public.game04_kpi_gameplay_daily(at_time-interval '1 second',at_time+interval '1 second')
  where classification<>'excluded' and action in ('normal_gacha','special_gacha','special_gacha_exchange')) then
  raise exception 'QA gacha escaped event-time exclusion';
 end if;

 detail:=public.game04_kpi_receipt_detail(at_time-interval '1 second',at_time+interval '1 second');
 actions:=detail->'gacha_actions'; results:=detail->'gacha_results';
 select count(*) into n from jsonb_array_elements(actions) a where a->>'classification'='excluded';
 if n<>3 then raise exception 'gacha action detail mismatch: %',actions; end if;
 if (select sum((a->>'diamond_spent')::bigint) from jsonb_array_elements(actions) a)<>300
  or (select sum((a->>'game_cash_spent')::bigint) from jsonb_array_elements(actions) a)<>1000
  or (select sum((a->>'points_added')::bigint) from jsonb_array_elements(actions) a)<>1
  or (select sum((a->>'points_spent')::bigint) from jsonb_array_elements(actions) a)<>100 then
  raise exception 'gacha resource quantities mismatch: %',actions;
 end if;
 if (select sum((a->>'draw_count')::bigint) from jsonb_array_elements(actions) a)<>2
  or (select sum((a->>'exchange_count')::bigint) from jsonb_array_elements(actions) a)<>1
  or (select sum((r->>'result_count')::bigint) from jsonb_array_elements(results) r)<>3 then
  raise exception 'gacha draw/exchange/result quantities mismatch: % / %',actions,results;
 end if;
 if actions::text ~* 'revenue|yen|jpy|purchase' then raise exception 'in-game spend leaked into revenue fields'; end if;
 if has_function_privilege('anon','public.game04_kpi_gameplay_daily(timestamptz,timestamptz)','execute')
  or has_function_privilege('authenticated','public.game04_kpi_receipt_detail(timestamptz,timestamptz)','execute') then
  raise exception 'KPI role boundary regressed';
 end if;
 raise notice 'PASS: G3 three-action KPI, one-row replay, event-time QA exclusion, quantities/results, no revenue projection';
end $$;
rollback;
