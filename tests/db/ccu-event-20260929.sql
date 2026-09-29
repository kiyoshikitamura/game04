begin;
do $test$
declare uid uuid; before_qty integer; after_qty integer; r jsonb;
begin
 select id into uid from public.users order by id limit 1;
 if uid is null then raise exception 'No preview fixture user'; end if;
 select coalesce(quantity,0) into before_qty from public.user_items where user_id=uid and item_id='SPECIAL_TICKET_CHARACTER';
 before_qty:=coalesce(before_qty,0);
 update public.game04_ccu_events set starts_at=clock_timestamp()+interval '1 hour',ends_at=clock_timestamp()+interval '4 hour';
 r:=public.game04_claim_ccu_event_reward(uid);
 if (r->>'granted')::boolean then raise exception 'Granted before start'; end if;
 update public.game04_ccu_events set starts_at=clock_timestamp()-interval '1 hour',ends_at=clock_timestamp()+interval '1 hour';
 r:=public.game04_claim_ccu_event_reward(uid);
 if not (r->>'granted')::boolean then raise exception 'Missing active grant'; end if;
 r:=public.game04_claim_ccu_event_reward(uid);
 if (r->>'granted')::boolean or not (r->>'alreadyGranted')::boolean then raise exception 'Duplicate grant'; end if;
 select quantity into after_qty from public.user_items where user_id=uid and item_id='SPECIAL_TICKET_CHARACTER';
 if after_qty<>before_qty+3 then raise exception 'Wrong balance'; end if;
 -- Consuming a ticket must not allow this event to be claimed again.
 update public.user_items set quantity=quantity-1 where user_id=uid and item_id='SPECIAL_TICKET_CHARACTER';
 perform public.game04_claim_ccu_event_reward(uid);
 select quantity into after_qty from public.user_items where user_id=uid and item_id='SPECIAL_TICKET_CHARACTER';
 if after_qty<>before_qty+2 then raise exception 'Claim reset after spending'; end if;
 update public.game04_ccu_events set starts_at=clock_timestamp()-interval '4 hour',ends_at=clock_timestamp()-interval '1 hour';
 r:=public.game04_claim_ccu_event_reward(uid);
 if (r->>'granted')::boolean then raise exception 'Granted after end'; end if;
 if has_function_privilege('authenticated','public.game04_claim_ccu_event_reward(uuid)','EXECUTE')
 or has_function_privilege('anon','public.game04_claim_ccu_event_reward(uuid)','EXECUTE')
 or has_table_privilege('authenticated','public.game04_ccu_event_grants','INSERT')
 then raise exception 'Client grant access'; end if;
end;
$test$;
select 'PASS: before/active/end, +3 once, retry after spending, client access denied; rolled back' result;
rollback;
