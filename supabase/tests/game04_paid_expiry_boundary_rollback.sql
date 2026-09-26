-- Dedicated ephemeral users only. Every fixture row rolls back.
begin;
do $test$
declare uid uuid:=gen_random_uuid(); oid uuid:=gen_random_uuid(); pid uuid; lid uuid; item text; offset_ms integer; qty bigint; snap jsonb; path text[]; failed boolean; expiry timestamptz; original timestamptz; summary jsonb:='[]'; s jsonb; v bigint; request uuid; prior jsonb;
begin
 if (select data->>'projectRef' from public.game04_redesign_master where key='isolated_environment')<>'znakrkaazliexzwihxge' then raise exception 'WRONG_PROJECT';end if;
 insert into public.users(id,username,cash,neon_diamonds) values(uid,'期限境界QA',10,10);
 insert into public.game04_player_state(user_id,state) values(uid,'{"energyDrinks":10,"materials":{"unlock":10,"skill":10,"equipmentLb":10},"growthInventory":{"expItems":{"character":{"xlarge":10},"equipment":{"xlarge":10}},"soulSelectors":{"SSR":10}}}'::jsonb);
 insert into public.billing_products(id,title,amount_jpy,items,validity_days) values('EXPIRY_BOUNDARY_QA','期限境界QA',1,'[]',120) on conflict(id) do nothing;
 insert into public.billing_orders(id,user_id,request_id,product_id,amount_jpy,product_snapshot,status,billing_mode) values(oid,uid,gen_random_uuid(),'EXPIRY_BOUNDARY_QA',1,'{"fixtureTag":"expiry-boundary-20260927","revenue":false,"validity_days":120}','GRANTED','sandbox');
 perform set_config('request.jwt.claim.sub',uid::text,true);
 -- SQL statement_timestamp is constant for this statement. Place T at +1ms, 0ms, -1ms.
 foreach item in array array['ENERGY_DRINK','RAID_UNLOCK_TICKET','SKILL_LB_PART','EQUIP_LB_PART','CHAR_EXP_XL','EQUIP_EXP_XL','SOUL_SELECTOR_SSR','CASH','DIAMOND','SPECIAL_TICKET_CHARACTER','SPECIAL_TICKET_SKILL','SPECIAL_TICKET_EQUIPMENT'] loop
  path:=public.game04_paid_item_path(item);
  if path is null and item not in('CASH','DIAMOND') then insert into public.user_items(user_id,item_id,quantity) values(uid,item,10);end if;
  foreach offset_ms in array array[1,0,-1] loop
   expiry:=statement_timestamp()+offset_ms*interval '1 millisecond';
   insert into public.presents(user_id,item_id,quantity,status,expire_at,source_kind,source_metadata) values(uid,item,3,'UNCLAIMED',expiry,case when path is null then 'GAME04_QA' else 'GAME04_PAID_FORMAL' end,'{"fixtureTag":"expiry-boundary-20260927","funding":"paid","revenue":false}') returning id into pid;
   insert into public.billing_asset_lots(order_id,user_id,present_id,item_id,issued_quantity,remaining_quantity,issued_at,expires_at) values(oid,uid,pid,item,3,3,expiry-interval '120 days',expiry) returning id into lid;
   original:=expiry; failed:=false;
   begin perform public.claim_present(pid);exception when others then if SQLERRM<>'Present is not claimable' then raise;end if;failed:=true;end;
   if failed is distinct from (offset_ms<=0) then raise exception 'BOUNDARY_CLAIM % %',item,offset_ms;end if;
   if (select expires_at from public.billing_asset_lots where id=lid) is distinct from original then raise exception 'EXPIRY_EXTENDED';end if;
   if offset_ms=1 then
    -- At T-1ms, claimed stock remains usable; read does not expire.
    snap:=public.billing_refresh_paid_assets();
    if not exists(select 1 from public.billing_asset_lots where id=lid and remaining_quantity=3) then raise exception 'EARLY_EXPIRY';end if;
    -- Expiry arrival affects only this fixture lot; leave original timestamp evidence in summary.
    update public.billing_asset_lots set issued_at=statement_timestamp()-interval '120 days',expires_at=statement_timestamp() where id=lid;
    failed:=false;
    begin
     if path is not null then update public.game04_player_state set state=jsonb_set(state,path,'2'::jsonb) where user_id=uid;
     elsif item='CASH' then update public.users set cash=2 where id=uid;
     elsif item='DIAMOND' then update public.users set neon_diamonds=2 where id=uid;
     else update public.user_items set quantity=2 where user_id=uid and item_id=item;end if;
    exception when others then if SQLERRM<>'EXPIRED_ASSET_BALANCE' then raise;end if;failed:=true;end;
    if not failed then raise exception 'EXPIRED_SPEND_ACCEPTED %',item;end if;
    failed:=false;
   end if;
   snap:=public.billing_refresh_paid_assets();
   if not exists(select 1 from public.billing_asset_lots where id=lid and remaining_quantity=0 and expired_quantity=3) then raise exception 'EXPIRY_MISSING % %',item,offset_ms;end if;
   if path is not null then select (state#>>path)::bigint into qty from public.game04_player_state where user_id=uid;
   elsif item='CASH' then select cash into qty from public.users where id=uid;
   elsif item='DIAMOND' then select neon_diamonds into qty from public.users where id=uid;
   else select quantity into qty from public.user_items where user_id=uid and item_id=item;end if;
   if qty<>10 then raise exception 'FREE_BALANCE_CHANGED % %',item,qty;end if;
   perform public.billing_refresh_paid_assets();
   if not exists(select 1 from public.billing_asset_lots where id=lid and expired_quantity=3) then raise exception 'NON_IDEMPOTENT';end if;
   summary:=summary||jsonb_build_array(jsonb_build_object('item',item,'relative_to_T_ms',-offset_ms,'claim',case when failed then 'rejected' else 'accepted' end,'original_expiry_preserved',true,'expired_quantity',3,'free_balance',qty,'reload_idempotent',true));
  end loop;
 end loop;
 -- Multiple expiries: paid item earliest first, free stock preserved.
 for offset_ms in 1..2 loop
  expiry:=statement_timestamp()+offset_ms*interval '1 day';
  insert into public.presents(user_id,item_id,quantity,status,expire_at,source_kind) values(uid,'ENERGY_DRINK',3,'UNCLAIMED',expiry,'GAME04_PAID_FORMAL') returning id into pid;
  insert into public.billing_asset_lots(order_id,user_id,present_id,item_id,issued_quantity,remaining_quantity,issued_at,expires_at) values(oid,uid,pid,'ENERGY_DRINK',3,3,expiry-interval '120 days',expiry);
  perform public.claim_present(pid);
 end loop;
 select state,version into s,v from public.game04_player_state where user_id=uid;
 request:=gen_random_uuid();
 prior:=public.game04_commit_state(uid,v,jsonb_set(s,'{energyDrinks}','12'),0,0,request);
 if (select remaining_quantity from public.billing_asset_lots where user_id=uid and item_id='ENERGY_DRINK' and remaining_quantity>0)<>2 then raise exception 'EARLIEST_FIRST_FAILED';end if;
 if public.game04_commit_state(uid,v,jsonb_set(s,'{energyDrinks}','12'),0,0,request) is distinct from prior then raise exception 'RETRY_CHANGED';end if;
 failed:=false;
 begin perform public.game04_commit_state(uid,v,jsonb_set(s,'{energyDrinks}','11'),0,0,gen_random_uuid());exception when serialization_failure then failed:=true;end;
 if not failed then raise exception 'STALE_SAVE_ACCEPTED';end if;
 summary:=summary||'[{"case":"multiple_expiries_and_retry","initial_free":10,"paid_lots":[3,3],"consumed":4,"remaining_paid":[0,2],"remaining_total":12,"same_request_replayed":true,"stale_version_rejected":true}]';
 -- Diamonds use free balance first, then the earliest paid lot.
 for offset_ms in 1..2 loop
  expiry:=statement_timestamp()+offset_ms*interval '1 day';
  insert into public.presents(user_id,item_id,quantity,status,expire_at,source_kind) values(uid,'DIAMOND',3,'UNCLAIMED',expiry,'GAME04_QA') returning id into pid;
  insert into public.billing_asset_lots(order_id,user_id,present_id,item_id,issued_quantity,remaining_quantity,issued_at,expires_at) values(oid,uid,pid,'DIAMOND',3,3,expiry-interval '120 days',expiry);
  perform public.claim_present(pid);
 end loop;
 update public.users set neon_diamonds=neon_diamonds-11 where id=uid;
 if (select neon_diamonds from public.users where id=uid)<>5 or (select sum(remaining_quantity) from public.billing_asset_lots where user_id=uid and item_id='DIAMOND')<>5 then raise exception 'DIAMOND_FREE_FIRST_FAILED';end if;
 if (select remaining_quantity from public.billing_asset_lots where user_id=uid and item_id='DIAMOND' and remaining_quantity>0 order by expires_at,id limit 1)<>2 then raise exception 'DIAMOND_EARLIEST_FAILED';end if;
 summary:=summary||'[{"case":"diamond_free_first_then_earliest_paid","initial_free":10,"paid_lots":[3,3],"consumed":11,"remaining_paid":[2,3],"remaining_total":5}]';
 perform set_config('game04.qa_expiry_result',summary::text,true);
end $test$;
select current_setting('game04.qa_expiry_result')::jsonb as result;
rollback;
