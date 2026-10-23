-- Parent-run only on GAME04 dev after the additive G3 functions are installed.
-- Small transactional fixtures; rollback leaves no acquisitions, balances or measurement facts.
begin;
create function pg_temp.g3_fixture(uid uuid,category text,payment text,n integer,rid uuid)
returns jsonb language plpgsql as $$
declare s jsonb; a jsonb; r jsonb; fp jsonb; operation text; price integer; gain integer; balance integer;
 result_rows jsonb; ticket text; before_diamonds integer;
begin
 s:=public.game04_get_growth_state(uid); a:=s; before_diamonds:=(s->>'diamonds')::integer;
 operation:=case when payment='points' then 'gacha_exchange' else 'gacha_draw' end;
 price:=case payment when 'points' then case category when 'character' then 200 else 100 end
  when 'gems' then n*case category when 'equipment' then 200 else 300 end when 'cash' then n*1000 when 'ticket' then 1 else 0 end;
 gain:=case when category<>'normal' and payment<>'points' then n else 0 end;
 balance:=case when category='normal' then 0 else coalesce((s#>>array['gachaPoints',category])::integer,0)+gain-case when payment='points' then price else 0 end end;
 if category<>'normal' then a:=jsonb_set(a,'{gachaPoints}',coalesce(a->'gachaPoints','{}')||jsonb_build_object(category,balance)); end if;
 if payment='gems' then a:=jsonb_set(a,'{diamonds}',to_jsonb(before_diamonds-price)); end if;
 if payment='cash' then a:=jsonb_set(a,'{cash}',to_jsonb((a->>'cash')::bigint-price)); end if;
 if payment='free' then a:=jsonb_set(a,'{dailyNormalGachaDate}',to_jsonb((clock_timestamp() at time zone 'Asia/Tokyo')::date::text)); end if;
 -- A visible saved-state marker verifies debit and state rollback as one unit.
 a:=jsonb_set(a,'{souls}',coalesce(a->'souls','{}')||jsonb_build_object('g3_sql_atomic_marker',coalesce((a#>>'{souls,g3_sql_atomic_marker}')::integer,0)+n));
 select jsonb_agg(jsonb_build_object('id',case category when 'skill' then 'SKD001' when 'equipment' then 'g3-test-equipment' else 'char_reiji_01' end,
  'kind',case category when 'normal' then 'character' else category end,'rarity','SSR')) into result_rows from generate_series(1,n);
 fp:=jsonb_build_object('action',operation,'category',category,'count',n,'payment',payment);
 if payment='points' then fp:=fp||jsonb_build_object('masterId',result_rows->0->>'id'); end if;
 r:=jsonb_build_object('gachaFingerprint',fp::text,'gameplayMeasurement',jsonb_build_object('contractVersion','game04-gameplay-v1','action',operation),
  'gachaReceipt',jsonb_build_object('requestId',rid,'category',category,'payment',payment,'count',n,'cost',price,'pointGain',gain,'pointsAfter',balance,'results',result_rows,'masterVersion','game04-g3-formal-20260925'));
 ticket:=case when payment='ticket' then 'SPECIAL_TICKET_'||upper(category) end;
 return jsonb_build_object('before',s,'after',a,'receipt',r,'ticket',ticket,'diamondCost',case when payment='gems' then price else 0 end,'cashDelta',case when payment='cash' then -price else 0 end,'ticketCost',case when payment='ticket' then 1 else 0 end);
end $$;
create function pg_temp.g3_commit(uid uuid,rid uuid,f jsonb) returns jsonb language sql as $$
 select public.game04_commit_gacha(uid,(f#>>'{before,version}')::bigint,f->'after',(f#>>'{before,diamonds}')::integer,
  (f->>'diamondCost')::integer,(f->>'cashDelta')::bigint,f->>'ticket',(f->>'ticketCost')::integer,rid,f->'receipt');
$$;
do $test$
declare uid uuid:='b9003819-973a-47b2-a1ef-9e503c60bb7b'; rid uuid; f jsonb; actual jsonb; replay jsonb;
 s jsonb; prior_cash bigint; prior_gems integer; prior_quantity integer; prior_version bigint; amount bigint;
begin
 if not exists(select 1 from public.users where id=uid and username='G2QA独立E') then raise exception 'QA_USER_MISMATCH'; end if;
 if has_function_privilege('anon','public.game04_commit_gacha(uuid,bigint,jsonb,integer,integer,bigint,text,integer,uuid,jsonb)','EXECUTE')
  or has_function_privilege('authenticated','public.game04_commit_gacha(uuid,bigint,jsonb,integer,integer,bigint,text,integer,uuid,jsonb)','EXECUTE') then raise exception 'PUBLIC_GACHA_RPC'; end if;
 if not has_function_privilege('service_role','public.game04_commit_gacha(uuid,bigint,jsonb,integer,integer,bigint,text,integer,uuid,jsonb)','EXECUTE') then raise exception 'SERVICE_GACHA_RPC'; end if;
 perform public.game04_get_growth_state(uid);
 update public.users set cash=10000,neon_diamonds=neon_diamonds+300 where id=uid;
 update public.game04_player_state set state=(state-'dailyNormalGachaDate')||'{"gachaPoints":{"character":201,"skill":0,"equipment":0}}'::jsonb where user_id=uid;
 insert into public.user_items(user_id,item_id,quantity) values(uid,'SPECIAL_TICKET_CHARACTER',2) on conflict(user_id,item_id) do update set quantity=2;
 -- Paid normal, exact replay and changed-operation collision.
 rid:=gen_random_uuid(); f:=pg_temp.g3_fixture(uid,'normal','cash',1,rid); actual:=pg_temp.g3_commit(uid,rid,f);
 if (actual#>>'{state,cash}')::bigint<>9000 or actual->'receipt' is distinct from f->'receipt' then raise exception 'NORMAL_ATOMIC_COMMIT'; end if;
 replay:=pg_temp.g3_commit(uid,rid,f); if replay is distinct from actual then raise exception 'REPLAY_CHANGED'; end if;
 begin
  perform pg_temp.g3_commit(uid,rid,jsonb_set(f,'{receipt,gachaFingerprint}','"different"'));
  raise exception 'MISMATCH_NOT_REJECTED';
 exception when raise_exception then if sqlerrm<>'GACHA_REQUEST_MISMATCH' then raise; end if; end;
 -- Ticket inventory debits once, ledger remains cumulative, point adds once.
 s:=public.game04_get_growth_state(uid); rid:=gen_random_uuid(); f:=pg_temp.g3_fixture(uid,'character','ticket',1,rid);
 actual:=pg_temp.g3_commit(uid,rid,f); perform pg_temp.g3_commit(uid,rid,f);
 if (select quantity from public.user_items where user_id=uid and item_id='SPECIAL_TICKET_CHARACTER')<>1
  or (actual#>>'{state,gachaPoints,character}')::integer<>202
  or actual#>'{state,questTicketGrants}' is distinct from s->'questTicketGrants' then raise exception 'TICKET_REPLAY_OR_LEDGER'; end if;
 -- Currency debit, point addition and SSR exchange retaining surplus.
 rid:=gen_random_uuid(); f:=pg_temp.g3_fixture(uid,'character','gems',1,rid); actual:=pg_temp.g3_commit(uid,rid,f);
 if (actual#>>'{state,diamonds}')::integer<>(f#>>'{before,diamonds}')::integer-300 or (actual#>>'{state,gachaPoints,character}')::integer<>203 then raise exception 'GEM_ATOMIC_COMMIT'; end if;
 rid:=gen_random_uuid(); f:=pg_temp.g3_fixture(uid,'character','points',1,rid); actual:=pg_temp.g3_commit(uid,rid,f);
 if (actual#>>'{state,gachaPoints,character}')::integer<>3 or (actual#>>'{state,diamonds}')::integer<>(f#>>'{before,diamonds}')::integer then raise exception 'EXCHANGE_SURPLUS'; end if;
 -- Free ten uses current JST day once and replay remains valid on that day.
 rid:=gen_random_uuid(); f:=pg_temp.g3_fixture(uid,'normal','free',10,rid); actual:=pg_temp.g3_commit(uid,rid,f); perform pg_temp.g3_commit(uid,rid,f);
 if (actual#>>'{state,cash}')::bigint<>(f#>>'{before,cash}')::bigint then raise exception 'FREE_CHARGED'; end if;
 rid:=gen_random_uuid(); f:=pg_temp.g3_fixture(uid,'normal','free',10,rid);
 begin perform pg_temp.g3_commit(uid,rid,f); raise exception 'FREE_TWICE';
 exception when raise_exception then if sqlerrm<>'GACHA_FREE_ALREADY_USED' then raise; end if; end;
 -- Server timestamp crossing midnight causes a retryable failure, never a free debit.
 begin perform pg_temp.g3_commit(uid,rid,jsonb_set(f,'{after,dailyNormalGachaDate}','"2000-01-01"')); raise exception 'STALE_DAY_ACCEPTED';
 exception when serialization_failure then null; end;
 -- Stale CAS rejects without changing ticket inventory or state.
 s:=public.game04_get_growth_state(uid); prior_version:=(s->>'version')::bigint;
 rid:=gen_random_uuid(); f:=pg_temp.g3_fixture(uid,'character','ticket',1,rid);
 begin perform pg_temp.g3_commit(uid,rid,jsonb_set(f,'{before,version}','-1')); raise exception 'STALE_CAS_ACCEPTED';
 exception when serialization_failure then null; end;
 if (select quantity from public.user_items where user_id=uid and item_id='SPECIAL_TICKET_CHARACTER')<>1 or (public.game04_get_growth_state(uid)->>'version')::bigint<>prior_version then raise exception 'FAILED_CAS_MUTATION'; end if;
 -- Insufficient cash and ticket failures do not produce receipts or acquisitions.
 update public.users set cash=0 where id=uid;
 rid:=gen_random_uuid(); f:=pg_temp.g3_fixture(uid,'normal','cash',1,rid);
 begin perform pg_temp.g3_commit(uid,rid,f); raise exception 'INSUFFICIENT_CASH_ACCEPTED';
 exception when raise_exception then if sqlerrm<>'INSUFFICIENT_RESOURCE' then raise; end if; end;
 if exists(select 1 from public.game04_requests where user_id=uid and request_id=rid) then raise exception 'FAILED_REQUEST_RECEIPT'; end if;
 update public.user_items set quantity=0 where user_id=uid and item_id='SPECIAL_TICKET_CHARACTER';
 rid:=gen_random_uuid(); f:=pg_temp.g3_fixture(uid,'character','ticket',1,rid);
 begin perform pg_temp.g3_commit(uid,rid,f); raise exception 'INSUFFICIENT_TICKET_ACCEPTED';
 exception when raise_exception then if sqlerrm<>'INSUFFICIENT_RESOURCE' then raise; end if; end;
 if (public.game04_get_growth_state(uid)->>'version')::bigint<>prior_version then raise exception 'FAILED_RESOURCE_MUTATION'; end if;
 -- Mandatory owner guard and invalid price/result cardinality fail before mutation.
 rid:=gen_random_uuid(); f:=pg_temp.g3_fixture(uid,'normal','cash',1,rid);
 begin perform pg_temp.g3_commit(uid,rid,jsonb_set(f,'{after,userId}',to_jsonb(gen_random_uuid()::text))); raise exception 'OTHER_OWNER_ACCEPTED';
 exception when raise_exception then if sqlerrm<>'INVALID_GACHA_RECEIPT' then raise; end if; end;
 begin perform pg_temp.g3_commit(uid,rid,jsonb_set(f,'{receipt,gachaReceipt,results}','[]')); raise exception 'EMPTY_RESULTS_ACCEPTED';
 exception when raise_exception then if sqlerrm<>'INVALID_GACHA_RECEIPT' then raise; end if; end;
 select sum(request_count) into amount from public.game04_kpi_gacha_daily(now()-interval '1 minute',now()+interval '1 minute');
 if amount<5 then raise exception 'KPI_MISSING'; end if;
end $test$;
select 'PASS: DB atomicity/replay/payment/points/JST/owner/permissions/KPI contract; fixture does not replace API/UI or random/grant verification. All changes rolled back.' result;
rollback;
