-- Synthetic SQL acceptance, never evidence of real Stripe or Google success.
-- All fixture users/orders/wallet changes are rolled back inside the subtransaction.
begin;
set local lock_timeout='5s';
set local statement_timeout='30s';
do $test$
declare
 qa uuid:=extensions.gen_random_uuid(); rid uuid:=extensions.gen_random_uuid(); oid uuid; vid uuid;
 o jsonb; same jsonb; result jsonb; evidence jsonb:='[]'::jsonb; rejected boolean; n integer;
 baseline bigint:=700; gift record; persisted jsonb; expiry timestamptz;
begin
 begin
  if (select data->>'projectRef' from public.game04_redesign_master where key='isolated_environment') is distinct from 'znakrkaazliexzwihxge' then raise exception 'WRONG_PROJECT';end if;
  lock table public.game04_vip_deliveries in share row exclusive mode;
  if exists(select 1 from public.game04_vip_deliveries where delivered_at is null and due_at<=statement_timestamp()) then raise exception 'OTHER_DUE_VIP_ABORT';end if;
  insert into public.users(id,username,neon_diamonds,cash) values(qa,left(replace(qa::text,'-',''),8),baseline,1200);
  insert into public.game04_player_state(user_id,state) values(qa,'{"energyDrinks":0,"materials":{"skill":0,"equipmentLb":0},"progressFixture":"unchanged","deckFixture":["a","b"]}');
  o:=public.game04_billing_reserve_order(qa,rid,'beginner_pack_01','sandbox'); oid:=(o->>'id')::uuid;
  same:=public.game04_billing_reserve_order(qa,rid,'beginner_pack_01','sandbox');
  if same->>'id'<>o->>'id' then raise exception 'DUPLICATE_ORDER';end if;
  evidence:=evidence||jsonb_build_array('same request returns same order');
  rejected:=false;
  begin perform public.game04_billing_reserve_order(qa,rid,'diamond_300','sandbox');exception when others then if SQLERRM<>'REQUEST_CONFLICT' then raise;end if;rejected:=true;end;
  if not rejected then raise exception 'REQUEST_CONFLICT_ACCEPTED';end if;
  rejected:=false;
  begin perform public.game04_billing_reserve_order(qa,extensions.gen_random_uuid(),'beginner_pack_01','sandbox');exception when others then if SQLERRM<>'PURCHASE_LIMIT' then raise;end if;rejected:=true;end;
  if not rejected then raise exception 'LIMIT_NOT_ENFORCED';end if;
  evidence:=evidence||jsonb_build_array('product conflict and pending purchase limit rejected');
  rejected:=false;
  begin perform public.game04_billing_reserve_order(qa,rid,'beginner_pack_01','live');exception when others then if SQLERRM<>'TEST_MODE_REQUIRED' then raise;end if;rejected:=true;end;
  if not rejected then raise exception 'LIVE_ACCEPTED_IN_DEV';end if;
  perform public.billing_attach_session(oid,'cs_test_dbfixture');
  rejected:=false;
  begin perform public.game04_billing_grant_order(oid,'cs_test_dbfixture',99,'jpy');exception when others then if SQLERRM<>'PAYMENT_MISMATCH' then raise;end if;rejected:=true;end;
  if not rejected or exists(select 1 from public.billing_grants where order_id=oid) then raise exception 'BAD_PAYMENT_GRANTED';end if;
  evidence:=evidence||jsonb_build_array('live mode and wrong amount rejected without assets');
  result:=public.game04_billing_grant_order(oid,'cs_test_dbfixture',100,'jpy');
  if result->>'status'<>'GRANTED' then raise exception 'GRANT_FAILED';end if;
  result:=public.game04_billing_grant_order(oid,'cs_test_dbfixture',100,'jpy');
  if not (result->>'duplicate')::boolean then raise exception 'DUPLICATE_NOT_RECOGNIZED';end if;
  if (select count(*) from public.billing_grants where order_id=oid)<>1 or
     (select purchase_count from public.user_shop_purchases where user_id=qa and product_id='beginner_pack_01')<>1 or
     (select count(*) from public.payment_transactions where user_id=qa)<>1 or
     (select count(*) from public.billing_asset_lots where order_id=oid)<>5 then raise exception 'DUPLICATE_GRANT';end if;
  if exists(select 1 from public.billing_asset_lots where order_id=oid and expires_at-issued_at<>interval '120 days') then raise exception 'WRONG_EXPIRY';end if;
  if not exists(select 1 from public.billing_asset_lots where order_id=oid and item_id='DIAMOND' and issued_quantity=100) or exists(select 1 from public.billing_asset_lots where order_id=oid and item_id='CASH') then raise exception 'OLD_PACK';end if;
  evidence:=evidence||jsonb_build_array('100 JPY pack grants 5 lots once; DIAMOND100 replaces CASH; 120 days');
  perform set_config('request.jwt.claim.sub',qa::text,true);
  perform set_config('request.jwt.claims',jsonb_build_object('sub',qa,'role','authenticated')::text,true);
  for gift in select present_id from public.billing_asset_lots where order_id=oid order by present_id loop
    perform public.claim_present(gift.present_id);
  end loop;
  select state into persisted from public.game04_player_state where user_id=qa;
  if (select neon_diamonds from public.users where id=qa)<>baseline+100 or
     (select cash from public.users where id=qa)<>1200 or
     (persisted->>'energyDrinks')::integer<>2 or persisted->>'progressFixture'<>'unchanged' or persisted->'deckFixture'<>'["a","b"]'::jsonb or
     (select quantity from public.user_items where user_id=qa and item_id='SPECIAL_TICKET_CHARACTER')<>1 or
     (select quantity from public.user_items where user_id=qa and item_id='SPECIAL_TICKET_SKILL')<>3 or
     (select quantity from public.user_items where user_id=qa and item_id='SPECIAL_TICKET_EQUIPMENT')<>1 then raise exception 'CLAIM_STORAGE_MISMATCH';end if;
  rejected:=false;
  begin perform public.claim_present(gift.present_id);exception when others then if SQLERRM<>'Present is not claimable' then raise;end if;rejected:=true;end;
  if not rejected then raise exception 'CLAIM_TWICE';end if;
  if exists(select 1 from public.billing_asset_lots where order_id=oid and (claimed_at is null or remaining_quantity<>issued_quantity)) then raise exception 'LOT_CHANGED_ON_CLAIM';end if;
  evidence:=evidence||jsonb_build_array('BOX claim persists exact wallet/inventory; deck/progress unchanged; duplicate claim rejected');
  perform public.game04_record_billing_event('evt_dbfixture',oid,'cs_test_dbfixture','checkout.session.completed','RECEIVED','sandbox');
  perform public.game04_record_billing_event('evt_dbfixture',oid,'cs_test_dbfixture','checkout.session.completed','COMPLETED','sandbox');
  perform public.game04_record_billing_event('evt_dbfixture',oid,'cs_test_dbfixture','checkout.session.completed','RECEIVED','sandbox');
  perform public.game04_record_billing_event('evt_dbfixture',oid,'cs_test_dbfixture','checkout.session.completed','FAILED','sandbox');
  if not exists(select 1 from public.game04_billing_events where event_id='evt_dbfixture' and attempts=2 and state='COMPLETED') then raise exception 'EVENT_DEMOTED';end if;
  perform public.billing_expire_order(oid,'cs_test_dbfixture');
  if (select status from public.billing_orders where id=oid)<>'GRANTED' then raise exception 'GRANTED_DEMOTED';end if;
  evidence:=evidence||jsonb_build_array('duplicate/late notifications retain completed state and granted order');
  o:=public.game04_billing_reserve_order(qa,extensions.gen_random_uuid(),'diamond_300','sandbox');
  perform public.billing_expire_order((o->>'id')::uuid,'cs_test_cancelledfixture');
  if exists(select 1 from public.billing_grants where order_id=(o->>'id')::uuid) then raise exception 'CANCELLED_GRANTED';end if;
  evidence:=evidence||jsonb_build_array('expired unpaid order grants nothing');
  o:=public.game04_billing_reserve_order(qa,extensions.gen_random_uuid(),'game04_vip_30d','sandbox'); vid:=(o->>'id')::uuid;
  rejected:=false;
  begin perform public.game04_grant_vip(qa,vid::text);exception when others then if SQLERRM<>'VERIFIED_VIP_PAYMENT_REQUIRED' then raise;end if;rejected:=true;end;
  if not rejected then raise exception 'UNPAID_VIP_GRANTED';end if;
  rejected:=false;
  begin perform public.game04_billing_reserve_order(qa,extensions.gen_random_uuid(),'game04_vip_30d','sandbox');exception when others then if SQLERRM<>'VIP_ORDER_PENDING' then raise;end if;rejected:=true;end;
  if not rejected then raise exception 'SECOND_VIP_CHECKOUT';end if;
  perform public.game04_billing_grant_order(vid,'cs_test_vipfixture',480,'jpy');
  perform public.game04_billing_grant_order(vid,'cs_test_vipfixture',480,'jpy');
  if (select neon_diamonds from public.users where id=qa)<>baseline+200 or
     (select count(*) from public.game04_vip_deliveries where order_id=vid::text)<>30 or
     (select count(*) from public.game04_vip_deliveries where order_id=vid::text and delivered_at is not null)<>1 then raise exception 'VIP_INITIAL_SCHEDULE';end if;
  if exists(select 1 from public.billing_asset_lots where order_id=vid) then raise exception 'FREE_VIP_HAS_PAID_LOT';end if;
  rejected:=false;
  begin perform public.game04_billing_reserve_order(qa,extensions.gen_random_uuid(),'game04_vip_30d','sandbox');exception when others then if SQLERRM<>'VIP_ALREADY_ACTIVE' then raise;end if;rejected:=true;end;
  if not rejected then raise exception 'ACTIVE_VIP_ACCEPTED';end if;
  evidence:=evidence||jsonb_build_array('VIP pending/active duplicate purchase rejected; initial free100 once; 30 delivery slots');
  if public.game04_deliver_due_vip()<>0 then raise exception 'VIP_EARLY_DELIVERY';end if;
  update public.game04_vip_deliveries set due_at=statement_timestamp()-interval '1 hour' where order_id=vid::text and ordinal=2;
  if public.game04_deliver_due_vip()<>1 or public.game04_deliver_due_vip()<>0 then raise exception 'VIP_REPLAY';end if;
  update public.game04_vip_deliveries set due_at=statement_timestamp()-interval '1 hour' where order_id=vid::text;
  if public.game04_deliver_due_vip()<>28 or public.game04_deliver_due_vip()<>0 then raise exception 'VIP_CATCHUP';end if;
  if (select neon_diamonds from public.users where id=qa)<>baseline+100+3000 then raise exception 'VIP_TOTAL';end if;
  evidence:=evidence||jsonb_build_array('VIP due worker retry/catchup: free100x30 exactly; initial paid100 lot retained');
  raise exception using errcode='ZX001',message='ROLLBACK_FIXTURE_SUCCESS';
 exception when sqlstate 'ZX001' then null;
 end;
 if exists(select 1 from public.users where id=qa) or exists(select 1 from public.billing_orders where user_id=qa) then raise exception 'FIXTURE_NOT_ROLLED_BACK';end if;
 perform set_config('game04.qa_billing_result',jsonb_build_object('passed',true,'fixtureRolledBack',true,'groups',evidence)::text,true);
end $test$;
select current_setting('game04.qa_billing_result')::jsonb as evidence;
commit;
