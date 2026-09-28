-- Synthetic QA only; every fixture and draw is rolled back.
begin;
do $test$
declare
 qa uuid:=gen_random_uuid(); request uuid; st jsonb; res jsonb; payload jsonb; receipt jsonb;
 category text; qty integer; before_balance integer; after_balance integer; before_version bigint;
 failed boolean; payment text; op text; cost integer; delta bigint;
begin
 insert into public.users(id,username,cash,neon_diamonds) values(qa,'GachaQA',100000,10000);
 insert into public.game04_player_state(user_id,state) values(qa,'{"questTicketGrants":{},"characters":[],"skills":[],"equipment":[],"specialGachaPoints":{}}');
 foreach category in array array['character','skill','equipment'] loop
  insert into public.user_items(user_id,item_id,quantity) values(qa,'SPECIAL_TICKET_'||upper(category),30);
  foreach qty in array array[1,10] loop
   st:=public.game04_get_growth_state(qa); before_version:=(st->>'version')::bigint;
   request:=gen_random_uuid(); payload:=jsonb_build_object('category',category,'count',qty,'payment','TICKET');
   receipt:=jsonb_build_object('gameplayMeasurement',jsonb_build_object('contractVersion','game04-gameplay-v1','action','special_gacha','gacha',jsonb_build_object('category',category,'count',qty,'payment','TICKET','ticketCost',qty,'resultSummary','[]'::jsonb)));
   select quantity into before_balance from public.user_items where user_id=qa and item_id='SPECIAL_TICKET_'||upper(category);
   res:=public.game04_commit_gacha(qa,before_version,st,0,(st->>'diamonds')::integer,0,request,'special_gacha',payload,receipt);
   select quantity into after_balance from public.user_items where user_id=qa and item_id='SPECIAL_TICKET_'||upper(category);
   if after_balance<>before_balance-qty or (res#>>'{receipt,specialGachaTicketCost}')::integer<>qty then raise exception 'ticket debit mismatch'; end if;
   res:=public.game04_commit_gacha(qa,before_version,st,0,(st->>'diamonds')::integer,0,request,'special_gacha',payload,receipt);
   if res->>'replayed'<>'true' or (select quantity from public.user_items where user_id=qa and item_id='SPECIAL_TICKET_'||upper(category))<>after_balance then raise exception 'replay double charged'; end if;
  end loop;
 end loop;
 -- Invalid counts and insufficient tickets leave state/version/balances unchanged.
 foreach qty in array array[0,2,11] loop
  st:=public.game04_get_growth_state(qa); failed:=false;
  begin
   perform public.game04_commit_gacha(qa,(st->>'version')::bigint,st,0,(st->>'diamonds')::integer,0,gen_random_uuid(),'special_gacha',jsonb_build_object('category','character','count',qty,'payment','TICKET'),receipt);
  exception when others then
   if sqlerrm<>'INVALID_GACHA_TICKET_COUNT' then raise; end if; failed:=true;
  end;
  if not failed or (select version from public.game04_player_state where user_id=qa)<>(st->>'version')::bigint then raise exception 'invalid count not atomic'; end if;
 end loop;
 update public.user_items set quantity=9 where user_id=qa and item_id='SPECIAL_TICKET_CHARACTER';
 st:=public.game04_get_growth_state(qa); failed:=false;
 begin
  perform public.game04_commit_gacha(qa,(st->>'version')::bigint,st,0,(st->>'diamonds')::integer,0,gen_random_uuid(),'special_gacha','{"category":"character","count":10,"payment":"TICKET"}',receipt);
 exception when others then
  if sqlerrm<>'INSUFFICIENT_RESOURCE' then raise; end if; failed:=true;
 end;
 if not failed or (select quantity from public.user_items where user_id=qa and item_id='SPECIAL_TICKET_CHARACTER')<>9 then raise exception 'insufficient ticket guard'; end if;
 -- Other gacha operations still commit after rejected tickets.
 foreach payment in array array['CASH','FREE','DIAMONDS','POINTS'] loop
  st:=public.game04_get_growth_state(qa);
  op:=case when payment in ('CASH','FREE') then 'normal_gacha' when payment='DIAMONDS' then 'special_gacha' else 'special_gacha_exchange' end;
  cost:=case when payment='DIAMONDS' then 300 else 0 end;
  delta:=case when payment='CASH' then -1000 else 0 end;
  payload:=jsonb_build_object('category','character','count',case when payment='FREE' then 10 else 1 end,'payment',payment);
  receipt:=jsonb_build_object('normalGachaJstDay',to_char(clock_timestamp() at time zone 'Asia/Tokyo','YYYY-MM-DD'),'gameplayMeasurement',jsonb_build_object('contractVersion','game04-gameplay-v1','action',op,'gacha',jsonb_build_object('category','character','count',1,'payment',payment,'resultSummary','[]'::jsonb)));
  if payment='FREE' then st:=st||jsonb_build_object('dailyNormalGachaDate',receipt->>'normalGachaJstDay'); end if;
  res:=public.game04_commit_gacha(qa,(st->>'version')::bigint,st||jsonb_build_object('diamonds',(st->>'diamonds')::integer-cost),delta,(st->>'diamonds')::integer,cost,gen_random_uuid(),op,payload,receipt);
  if (res#>>'{state,version}')::bigint<>(st->>'version')::bigint+1 then raise exception 'other gacha commit failed'; end if;
 end loop;
 if has_function_privilege('anon','public.game04_commit_gacha(uuid,bigint,jsonb,bigint,integer,integer,uuid,text,jsonb,jsonb)','execute')
 or has_function_privilege('authenticated','public.game04_commit_gacha(uuid,bigint,jsonb,bigint,integer,integer,uuid,text,jsonb,jsonb)','execute') then raise exception 'RPC role boundary'; end if;
end $test$;
rollback;
select 'PASS: 3 categories x 1/10 tickets, replay, invalid count, insufficient balance, CASH/FREE/DIAMONDS/POINTS after failure; all QA changes rolled back' as result;
