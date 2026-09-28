-- Append to both candidate DDLs with their COMMITs removed. Everything rolls back.
do $$
declare uid uuid; order_doc jsonb; oid uuid; sid text; pid uuid; source_id uuid; source_expiry timestamptz;
 s jsonb; after_state jsonb; result jsonb; req uuid; before_energy bigint; before_unlock bigint; before_cash bigint;
 qty bigint; lot_count bigint; caught boolean:=false;
begin
 select u.id into uid from public.users u join public.game04_player_state s on s.user_id=u.id where u.username like 'G2QA%' limit 1;
 if uid is null then raise exception 'DEDICATED_QA_REQUIRED';end if;
 -- Isolate this rollback-only wallet from pre-existing QA lots; no persistent conversion.
 update public.billing_asset_lots set remaining_quantity=0 where user_id=uid;
 update public.users set neon_diamonds=120 where id=uid;
 perform set_config('request.jwt.claim.sub',uid::text,true);
 order_doc:=public.game04_billing_reserve_order(uid,gen_random_uuid(),'diamond_300','sandbox');oid:=(order_doc->>'id')::uuid;
 sid:='cs_test_'||replace(gen_random_uuid()::text,'-','');perform public.billing_attach_session(oid,sid);
 perform public.game04_billing_grant_order(oid,sid,300,'jpy');
 select l.present_id,l.id,l.expires_at into pid,source_id,source_expiry from public.billing_asset_lots l where l.order_id=oid and l.item_id='DIAMOND';
 perform public.claim_present(pid);
 s:=public.game04_get_growth_state(uid);before_energy:=coalesce((s->>'energyDrinks')::bigint,0);
 if (s->>'diamonds')::int<>420 then raise exception 'FIXTURE_WALLET';end if;
 after_state:=jsonb_set(jsonb_set(s,'{diamonds}','270'),'{energyDrinks}',to_jsonb(before_energy+3));req:=gen_random_uuid();
 result:=public.game04_commit_shop_exchange(uid,(s->>'version')::bigint,after_state,420,150,0,req);
 if (select remaining_quantity from public.billing_asset_lots where id=source_id)<>270 then raise exception 'FREE_FIRST_SOURCE';end if;
 select count(*),sum(issued_quantity) into lot_count,qty from public.billing_asset_lots where source_lot_id=source_id;
 if lot_count<>1 or qty<>1 then raise exception 'MIXED_CEIL_ALLOCATION';end if;
 if exists(select 1 from public.billing_asset_lots where source_lot_id=source_id and (expires_at<>source_expiry or item_id<>'ENERGY_DRINK' or claimed_at is null)) then raise exception 'DERIVED_PROVENANCE';end if;
 perform public.game04_commit_shop_exchange(uid,(s->>'version')::bigint,after_state,420,150,0,req);
 if (select count(*) from public.billing_asset_lots where source_lot_id=source_id)<>1 then raise exception 'DUPLICATE_DERIVED';end if;
 if (select neon_diamonds from public.users where id=uid)<>270 then raise exception 'DUPLICATE_DEBIT';end if;
 -- Failed CAS must not debit or issue provenance.
 s:=public.game04_get_growth_state(uid);after_state:=jsonb_set(jsonb_set(s,'{diamonds}','220'),'{energyDrinks}',to_jsonb(before_energy+4));
 begin
  perform public.game04_commit_shop_exchange(uid,-1,after_state,270,50,0,gen_random_uuid());
 exception when serialization_failure then caught:=true;end;
 if not caught or (select neon_diamonds from public.users where id=uid)<>270 or (select count(*) from public.billing_asset_lots where source_lot_id=source_id)<>1 then raise exception 'FAILED_EXCHANGE_NOT_ATOMIC';end if;
 -- Consuming one item uses the paid derived item once, leaving the free items untouched.
 update public.game04_player_state set state=jsonb_set(state,'{energyDrinks}',to_jsonb(before_energy+2)),version=version+1 where user_id=uid;
 if (select sum(remaining_quantity) from public.billing_asset_lots where source_lot_id=source_id)<>0 then raise exception 'DERIVED_CONSUMPTION';end if;
 s:=public.game04_get_growth_state(uid);after_state:=jsonb_set(jsonb_set(s,'{diamonds}','170'),'{energyDrinks}',to_jsonb(before_energy+4));
 perform public.game04_commit_shop_exchange(uid,(s->>'version')::bigint,after_state,270,100,0,gen_random_uuid());
 update public.billing_asset_lots set issued_at=statement_timestamp()-interval '121 days',expires_at=statement_timestamp()-interval '1 day' where source_lot_id=source_id and remaining_quantity>0;
 perform public.game04_get_state(uid);
 if (select (state->>'energyDrinks')::bigint from public.game04_player_state where user_id=uid)<>before_energy+2 then raise exception 'ENERGY_EXPIRY_REMOVED_FREE';end if;
 -- CASH: paid 170 + free 130 buys 3000, of which 1700 inherits expiry.
 update public.users set neon_diamonds=300 where id=uid;
 s:=public.game04_get_growth_state(uid);before_cash:=(s->>'cash')::bigint;
 after_state:=jsonb_set(jsonb_set(s,'{diamonds}','0'),'{cash}',to_jsonb(before_cash+3000));
 perform public.game04_commit_shop_exchange(uid,(s->>'version')::bigint,after_state,300,300,3000,gen_random_uuid());
 if (select sum(remaining_quantity) from public.billing_asset_lots where source_lot_id=source_id and item_id='CASH')<>1700 then raise exception 'CASH_PAID_SHARE';end if;
 update public.billing_asset_lots set issued_at=statement_timestamp()-interval '121 days',expires_at=statement_timestamp()-interval '1 day' where source_lot_id=source_id and item_id='CASH';
 update public.users set cash=cash where id=uid;
 if (select cash from public.users where id=uid)<>before_cash+1300 then raise exception 'CASH_EXPIRY_REMOVED_FREE';end if;
 -- Invasion order: a second paid DIA lot funds the single order; expiry removes only it.
 order_doc:=public.game04_billing_reserve_order(uid,gen_random_uuid(),'diamond_300','sandbox');oid:=(order_doc->>'id')::uuid;
 sid:='cs_test_'||replace(gen_random_uuid()::text,'-','');perform public.billing_attach_session(oid,sid);perform public.game04_billing_grant_order(oid,sid,300,'jpy');
 select l.present_id,l.id into pid,source_id from public.billing_asset_lots l where l.order_id=oid and l.item_id='DIAMOND';perform public.claim_present(pid);
 s:=public.game04_get_growth_state(uid);before_unlock:=coalesce((s#>>'{materials,unlock}')::bigint,0);
 after_state:=jsonb_set(jsonb_set(s,'{diamonds}','200'),'{materials,unlock}',to_jsonb(before_unlock+1));
 perform public.game04_commit_shop_exchange(uid,(s->>'version')::bigint,after_state,300,100,0,gen_random_uuid());
 if (select sum(remaining_quantity) from public.billing_asset_lots where source_lot_id=source_id and item_id='RAID_UNLOCK_TICKET')<>1 then raise exception 'INVASION_LOT_MISSING';end if;
 update public.billing_asset_lots set issued_at=statement_timestamp()-interval '121 days',expires_at=statement_timestamp()-interval '1 day' where source_lot_id=source_id;
 perform public.game04_get_state(uid);
 if (select (state#>>'{materials,unlock}')::bigint from public.game04_player_state where user_id=uid)<>before_unlock then raise exception 'INVASION_EXPIRY';end if;
 raise notice 'PASS derived lots: free first, inherited expiry, ceil share, retry, CAS rollback, consumption, energy/CASH/invasion expiry, free balances preserved';
end $$;
rollback;
