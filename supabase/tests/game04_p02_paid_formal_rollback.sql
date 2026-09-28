-- Run together with candidate DDL in one transaction, replacing candidate COMMIT with this test body.
-- All mutations including schema/functions rollback. No Stripe payment is represented by this fixture.
do $$
declare uid uuid; reserved jsonb; rid uuid:=gen_random_uuid(); oid uuid; pid uuid; sid text:='cs_test_'||replace(gen_random_uuid()::text,'-',''); before_qty bigint; after_qty bigint; old_version bigint; total_lots bigint; caught boolean:=false; ticket text; qty bigint;
begin
 select s.user_id into uid from public.game04_player_state s join public.users u on u.id=s.user_id
 where s.user_id='0fe9ead0-f738-4771-977a-9de7d93454af'::uuid
 and jsonb_typeof(s.state#>'{growthInventory,expItems,character,xlarge}')='number';
 if uid is null then raise exception 'NO_INITIALIZED_FIXTURE_USER';end if;
 -- These counters are test-local only, to avoid a prior QA purchase blocking the rollback fixture.
 delete from public.user_shop_purchases where user_id=uid and product_id='growth_pack_01';
 reserved:=public.game04_billing_reserve_order(uid,rid,'growth_pack_01','sandbox');oid:=(reserved->>'id')::uuid;
 if reserved#>>'{product_snapshot,game04InventoryVersion}' is distinct from 'APPROVED_GROWTH_V1_20260921' then raise exception 'SNAPSHOT_VERSION_MISSING';end if;
 if public.game04_billing_reserve_order(uid,rid,'growth_pack_01','sandbox')->>'id' is distinct from oid::text then raise exception 'RESERVE_RETRY_CHANGED_ORDER';end if;
 perform public.billing_attach_session(oid,sid);
 perform public.game04_billing_grant_order(oid,sid,500,'jpy');
 select p.id into pid from public.presents p join public.billing_asset_lots l on l.present_id=p.id where l.order_id=oid and p.item_id='CHAR_EXP_XL';
 if pid is null or (select source_kind from public.presents where id=pid) is distinct from 'GAME04_PAID_FORMAL' then raise exception 'PAID_SOURCE_MISSING';end if;
 select count(*) into total_lots from public.billing_asset_lots where order_id=oid;
 perform public.game04_billing_grant_order(oid,sid,500,'jpy');
 if total_lots<>(select count(*) from public.billing_asset_lots where order_id=oid) then raise exception 'DUPLICATE_GRANT';end if;
 select (state#>>'{growthInventory,expItems,character,xlarge}')::bigint into before_qty from public.game04_player_state where user_id=uid;
 perform set_config('request.jwt.claim.sub',uid::text,true);
 perform public.claim_present(pid);
 select (state#>>'{growthInventory,expItems,character,xlarge}')::bigint into after_qty from public.game04_player_state where user_id=uid;
 if after_qty<>before_qty+5 then raise exception 'FORMAL_CLAIM_QUANTITY';end if;
 if not exists(select 1 from public.billing_asset_lots where present_id=pid and claimed_at is not null and remaining_quantity=5) then raise exception 'LOT_CLAIM_NOT_ATOMIC';end if;
 begin perform public.claim_present(pid);exception when others then caught:=true;end;
 if not caught then raise exception 'CLAIM_DUPLICATE_ACCEPTED';end if;
 -- Saving formal consumption debits the same lot; unrelated save cannot debit twice.
 update public.game04_player_state set state=jsonb_set(state,'{growthInventory,expItems,character,xlarge}',to_jsonb(after_qty-2)),version=version+1 where user_id=uid;
 if (select remaining_quantity from public.billing_asset_lots where present_id=pid)<>3 then raise exception 'FORMAL_CONSUME_LOT';end if;
 update public.game04_player_state set state=state where user_id=uid;
 if (select remaining_quantity from public.billing_asset_lots where present_id=pid)<>3 then raise exception 'UNRELATED_SAVE_CONSUMED';end if;
 -- Legacy refresh must not consume or expire JSON inventory lots.
 perform public.billing_refresh_paid_assets();
 if (select remaining_quantity from public.billing_asset_lots where present_id=pid)<>3 then raise exception 'LEGACY_REFRESH_CONSUMED_FORMAL';end if;
 -- Force fixture lot into the past, preserving issued_at<expires_at.
 update public.billing_asset_lots set issued_at=statement_timestamp()-interval '121 days',expires_at=statement_timestamp()-interval '1 day' where present_id=pid;
 perform public.game04_get_state(uid);
 if (select (state#>>'{growthInventory,expItems,character,xlarge}')::bigint from public.game04_player_state where user_id=uid)<>before_qty then raise exception 'EXPIRY_WRONG_BALANCE';end if;
 if not exists(select 1 from public.billing_asset_lots where present_id=pid and remaining_quantity=0 and expired_quantity=3) then raise exception 'EXPIRY_NOT_RECORDED';end if;
 perform public.game04_get_state(uid);
 if (select (state#>>'{growthInventory,expItems,character,xlarge}')::bigint from public.game04_player_state where user_id=uid)<>before_qty then raise exception 'EXPIRY_REPEAT';end if;
 -- Special tickets remain in existing user_items authority; cumulative quest grants are untouched.
 delete from public.user_shop_purchases where user_id=uid and product_id='ticket_pack_01';
 reserved:=public.game04_billing_reserve_order(uid,gen_random_uuid(),'ticket_pack_01','sandbox');oid:=(reserved->>'id')::uuid;
 sid:='cs_test_'||replace(gen_random_uuid()::text,'-','');perform public.billing_attach_session(oid,sid);
 perform public.game04_billing_grant_order(oid,sid,1500,'jpy');
 foreach ticket in array array['SPECIAL_TICKET_CHARACTER','SPECIAL_TICKET_SKILL','SPECIAL_TICKET_EQUIPMENT'] loop
  select p.id into pid from public.presents p join public.billing_asset_lots l on l.present_id=p.id where l.order_id=oid and p.item_id=ticket;
  select coalesce((select quantity from public.user_items where user_id=uid and item_id=ticket),0) into qty;
  perform public.claim_present(pid);
  if (select quantity from public.user_items where user_id=uid and item_id=ticket)<>qty+5 then raise exception 'G3_TICKET_CLAIM';end if;
  update public.user_items set quantity=qty+4 where user_id=uid and item_id=ticket;
  if (select remaining_quantity from public.billing_asset_lots where present_id=pid)<>4 then raise exception 'G3_TICKET_CONSUME';end if;
 end loop;
 raise notice 'PASS paid formal reserve, retry, grant, duplicate, claim, formal quantity, consume, legacy separation, expiry, reload';
end $$;
rollback;
