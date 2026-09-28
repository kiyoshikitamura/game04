-- Parent executes on confirmed GAME04 dev only. All fixture rows rolled back.
begin;
do $$
declare qa uuid:='d6dabf02-3eb2-430e-8352-561f8d735469'; sid uuid; v bigint; before_state jsonb;
 rid uuid:=gen_random_uuid(); room_id uuid:=gen_random_uuid(); receipt jsonb; result jsonb; n numeric; at_time timestamptz:=now();
begin
 if has_function_privilege('anon','public.game04_observe_state_restore(uuid,uuid,bigint)','execute')
 or has_function_privilege('authenticated','public.game04_kpi_receipt_detail(timestamptz,timestamptz)','execute')
 or has_table_privilege('authenticated','public.game04_state_restore_observations','select')
 or not has_function_privilege('service_role','public.game04_kpi_receipt_detail(timestamptz,timestamptz)','execute') then raise exception 'ROLE_BOUNDARY'; end if;
 select subject_id into strict sid from public.kpi_subjects where source_user_id=qa;
 select version,state into strict v,before_state from public.game04_player_state where user_id=qa;
 if not public.kpi_is_subject_excluded(sid,at_time) then
  raise exception 'KNOWN_QA_CLASSIFICATION_REQUIRED';
 end if;
 result:=public.game04_observe_state_restore(qa,rid,v);
 if result->>'recorded' is distinct from 'true' then raise exception 'RESTORE_NOT_RECORDED'; end if;
 perform public.game04_observe_state_restore(qa,rid,v);
 select count(*) into n from public.game04_state_restore_observations where user_id=qa and request_id=rid;
 if n is distinct from 1 then raise exception 'RESTORE_REPLAY'; end if;
 result:=public.game04_observe_state_restore(qa,gen_random_uuid(),v+1);
 if result->>'recorded' is distinct from 'false' then raise exception 'STALE_ACK_ACCEPTED'; end if;
 if exists(select 1 from public.game04_player_state where user_id=qa and (version<>v or state<>before_state)) then raise exception 'STATE_CHANGED'; end if;
 receipt:=jsonb_build_object('receipt',jsonb_build_object('gameplayMeasurement',jsonb_build_object(
 'contractVersion','game04-gameplay-v1','action','raid_claim','roomId',room_id,
 'grants',jsonb_build_array(jsonb_build_object('grantId','r09-test','rewards',jsonb_build_array(jsonb_build_object('kind','cash','id','R09_ROLLBACK_ONLY','amount',123),jsonb_build_object('kind','character_exp_item','id','R09_ROLLBACK_ONLY','amount',2)))))));
 insert into public.game04_requests(user_id,request_id,result,created_at) values(qa,gen_random_uuid(),receipt,at_time),(qa,gen_random_uuid(),receipt,at_time);
 result:=public.game04_kpi_receipt_detail(at_time-interval '1 second',at_time+interval '1 second');
 select sum((r->>'quantity')::numeric) into n from jsonb_array_elements(result->'raid_rewards') r where r->>'reward_id'='R09_ROLLBACK_ONLY' and r->>'kind'='cash' and r->>'classification'='excluded';
 if n is distinct from 123 then raise exception 'GRANT_QUANTITY_REPLAY_OR_QA %',n; end if;
 select sum((r->>'quantity')::numeric) into n from jsonb_array_elements(result->'raid_rewards') r where r->>'reward_id'='R09_ROLLBACK_ONLY' and r->>'kind'='character_exp_item';
 if n is distinct from 2 then raise exception 'ITEM_QUANTITY %',n; end if;
 if not exists(select 1 from jsonb_array_elements(result->'restore_acknowledgements') r where r->>'classification'='excluded' and (r->>'event_count')::integer>=1) then raise exception 'RESTORE_QA_EXCLUSION'; end if;
 if not exists(select 1 from jsonb_array_elements(result->'acquisition_subject_activity') r where r->>'classification'='excluded' and r->>'phase'='restore_ack') then raise exception 'SUBJECT_JOIN'; end if;
 raise notice 'PASS: receipt quantities, grant dedup, observation dedup/stale ACK, unchanged gameplay, QA exclusion, subject join, privilege checks';
end $$;
rollback;
