-- Synthetic DB fixture only. NOT proof of external payment, webhook, or checkout acceptance.
-- Parent runs only on GAME04 dev lrgyllgzcdcphlbmkknc, after applying VIP candidate.
-- All product/order/grant/balance changes roll back. No real purchase or sales enablement.
BEGIN;
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='30s';
CREATE TEMP TABLE vip_rollback_test_results(test text, passed boolean, detail text) ON COMMIT DROP;
DO $test$
DECLARE
 qa constant uuid := 'b9003819-973a-47b2-a1ef-9e503c60bb7b';
 order1 uuid := extensions.gen_random_uuid();
 order2 uuid := extensions.gen_random_uuid();
 other_user uuid;
 epoch timestamptz := statement_timestamp();
 baseline bigint; balance bigint; expiry timestamptz; old_expiry timestamptz;
 n integer; rejected boolean; stage record; delivered_count integer;
BEGIN
 BEGIN
  -- Exclude concurrent delivery inserts/updates while this global worker is exercised.
  LOCK TABLE public.game04_vip_deliveries IN SHARE ROW EXCLUSIVE MODE;
  PERFORM 1 FROM public.users WHERE id=qa FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'QA_USER_MISSING'; END IF;
  IF EXISTS(SELECT 1 FROM public.game04_vip_grants WHERE user_id=qa)
     OR EXISTS(SELECT 1 FROM public.game04_vip_entitlements WHERE user_id=qa)
     OR EXISTS(SELECT 1 FROM public.game04_vip_deliveries WHERE user_id=qa)
  THEN RAISE EXCEPTION 'QA_ALREADY_HAS_VIP_STATE'; END IF;
  IF EXISTS(SELECT 1 FROM public.game04_vip_deliveries WHERE user_id<>qa AND delivered_at IS NULL AND due_at<=epoch)
  THEN RAISE EXCEPTION 'OTHER_USER_DUE_DELIVERIES_ABORT_TEST'; END IF;
  IF EXISTS(SELECT 1 FROM public.billing_products WHERE id='game04_vip_30d')
  THEN RAISE EXCEPTION 'VIP_PRODUCT_ALREADY_EXISTS_REVIEW_FIXTURE'; END IF;
  IF EXISTS(SELECT 1 FROM public.billing_asset_lots WHERE user_id=qa AND item_id='DIAMOND' AND claimed_at IS NOT NULL AND remaining_quantity>0 AND expires_at<=epoch)
  THEN RAISE EXCEPTION 'QA_EXPIRED_LOTS_ABORT_TEST'; END IF;
  SELECT neon_diamonds INTO baseline FROM public.users WHERE id=qa;
  SELECT id INTO other_user FROM public.users WHERE id<>qa ORDER BY id LIMIT 1;
  IF other_user IS NULL THEN RAISE EXCEPTION 'SECOND_USER_REQUIRED_READ_ONLY'; END IF;
  -- Uncommitted FK fixture. It is invisible to other transactions and is never sold.
  INSERT INTO public.billing_products(id,title,amount_jpy,price_dia,items,purchase_limit,validity_days)
  VALUES('game04_vip_30d','QA rollback-only VIP fixture',480,NULL,'[]'::jsonb,0,30);
  INSERT INTO public.billing_orders(id,user_id,request_id,product_id,amount_jpy,product_snapshot,status,granted_at,billing_mode)
  VALUES(order1,qa,extensions.gen_random_uuid(),'game04_vip_30d',480,
   '{"fixture":"G2 rollback-only; not verified external payment","items":[]}'::jsonb,'PENDING',NULL,'sandbox');
  rejected:=false;
  BEGIN
   PERFORM public.game04_grant_vip(qa,order1::text);
  EXCEPTION WHEN OTHERS THEN
   IF SQLERRM<>'VERIFIED_VIP_PAYMENT_REQUIRED' THEN RAISE; END IF;
   rejected:=true;
  END;
  IF NOT rejected THEN RAISE EXCEPTION 'UNPAID_ORDER_ACCEPTED'; END IF;
  INSERT INTO vip_rollback_test_results VALUES('unpaid order rejection',true,'PENDING order grants nothing');

  UPDATE public.billing_orders SET status='GRANTED',granted_at=epoch WHERE id=order1;
  expiry:=public.game04_grant_vip(qa,order1::text);
  IF expiry IS DISTINCT FROM epoch+interval '720 hours' THEN RAISE EXCEPTION 'BAD_EXPIRY'; END IF;
  SELECT neon_diamonds INTO balance FROM public.users WHERE id=qa;
  IF balance-baseline<>100 THEN RAISE EXCEPTION 'BAD_INITIAL_100'; END IF;
  SELECT count(*) INTO n FROM public.game04_vip_deliveries WHERE order_id=order1::text;
  IF n<>30 OR EXISTS(SELECT 1 FROM public.game04_vip_deliveries WHERE order_id=order1::text AND (amount<>100 OR due_at<>epoch+make_interval(hours=>24*(ordinal-1)) OR (ordinal=1)<>(delivered_at IS NOT NULL))) THEN RAISE EXCEPTION 'BAD_SCHEDULE'; END IF;
  INSERT INTO vip_rollback_test_results VALUES('0h purchase / 30 slots / 720h expiry',true,'100 immediately, exact due slots 0..696h');

  PERFORM public.game04_grant_vip(qa,order1::text);
  SELECT neon_diamonds INTO balance FROM public.users WHERE id=qa;
  IF balance-baseline<>100 THEN RAISE EXCEPTION 'DUPLICATE_INITIAL_GRANT'; END IF;
  rejected:=false;
  BEGIN
   PERFORM public.game04_grant_vip(other_user,order1::text);
  EXCEPTION WHEN OTHERS THEN
   IF SQLERRM<>'VERIFIED_VIP_PAYMENT_REQUIRED' THEN RAISE; END IF;
   rejected:=true;
  END;
  IF NOT rejected THEN RAISE EXCEPTION 'OTHER_USER_ORDER_ACCEPTED'; END IF;
  INSERT INTO vip_rollback_test_results VALUES('same-order replay / other-user rejection',true,'no duplicate, other user untouched');

  INSERT INTO public.billing_orders(id,user_id,request_id,product_id,amount_jpy,product_snapshot,status,granted_at,billing_mode)
  VALUES(order2,qa,extensions.gen_random_uuid(),'game04_vip_30d',480,
   '{"fixture":"G2 rollback-only; not verified external payment","items":[]}'::jsonb,'GRANTED',epoch,'sandbox');
  rejected:=false;
  BEGIN
   PERFORM public.game04_grant_vip(qa,order2::text);
  EXCEPTION WHEN OTHERS THEN
   IF SQLERRM<>'VIP_ALREADY_ACTIVE' THEN RAISE; END IF;
   rejected:=true;
  END;
  IF NOT rejected OR EXISTS(SELECT 1 FROM public.game04_vip_grants WHERE order_id=order2::text)
  THEN RAISE EXCEPTION 'ACTIVE_REPURCHASE_NOT_ATOMICALLY_REJECTED'; END IF;
  SELECT neon_diamonds INTO balance FROM public.users WHERE id=qa;
  IF balance-baseline<>100 THEN RAISE EXCEPTION 'FAILED_REPURCHASE_CHANGED_BALANCE'; END IF;
  INSERT INTO vip_rollback_test_results VALUES('active repurchase rejection / atomicity',true,'no second grant/schedule/balance delta');

  -- Virtual clock: shift only this QA schedule, never the DB clock or other users.
  FOR stage IN SELECT * FROM (VALUES
   ('0h',interval '0 hours',1),
   ('24h minus 1us',interval '24 hours'-interval '1 microsecond',1),
   ('24h',interval '24 hours',2),
   ('696h minus 1us',interval '696 hours'-interval '1 microsecond',29),
   ('696h',interval '696 hours',30),
   ('720h',interval '720 hours',30)
  ) AS boundaries(label,age,expected_count)
  LOOP
   UPDATE public.game04_vip_deliveries SET due_at=epoch+make_interval(hours=>24*(ordinal-1))-stage.age WHERE order_id=order1::text;
   PERFORM public.game04_deliver_due_vip();
   SELECT count(*) INTO delivered_count FROM public.game04_vip_deliveries WHERE order_id=order1::text AND delivered_at IS NOT NULL;
   SELECT neon_diamonds INTO balance FROM public.users WHERE id=qa;
   IF delivered_count<>stage.expected_count OR balance-baseline<>100*stage.expected_count
   THEN RAISE EXCEPTION 'BOUNDARY_FAILED % delivered=% delta=%',stage.label,delivered_count,balance-baseline; END IF;
   n:=public.game04_deliver_due_vip();
   IF n<>0 THEN RAISE EXCEPTION 'DUPLICATE_DELIVERY %',stage.label; END IF;
   INSERT INTO vip_rollback_test_results VALUES(stage.label,true,'delivered='||delivered_count||', diamond delta='||(balance-baseline)||', replay=0');
  END LOOP;

  -- Move the synthetic original contract back 720h; its expiry is exactly now.
  UPDATE public.billing_orders SET granted_at=epoch-interval '720 hours' WHERE id=order1;
  UPDATE public.game04_vip_grants SET created_at=epoch-interval '720 hours' WHERE order_id=order1::text;
  UPDATE public.game04_vip_entitlements SET expires_at=epoch WHERE user_id=qa;
  expiry:=public.game04_grant_vip(qa,order2::text);
  IF expiry IS DISTINCT FROM epoch+interval '720 hours' THEN RAISE EXCEPTION 'REPURCHASE_EXPIRY_BAD'; END IF;
  SELECT neon_diamonds INTO balance FROM public.users WHERE id=qa;
  IF balance-baseline<>3100 THEN RAISE EXCEPTION 'REPURCHASE_INITIAL_GRANT_BAD'; END IF;
  old_expiry:=public.game04_grant_vip(qa,order1::text);
  IF old_expiry IS DISTINCT FROM epoch THEN RAISE EXCEPTION 'OLD_ORDER_EXPIRY_BAD'; END IF;
  SELECT expires_at INTO expiry FROM public.game04_vip_entitlements WHERE user_id=qa;
  SELECT neon_diamonds INTO balance FROM public.users WHERE id=qa;
  IF expiry<>epoch+interval '720 hours' OR balance-baseline<>3100 THEN RAISE EXCEPTION 'OLD_ORDER_CHANGED_NEW_CONTRACT'; END IF;
  INSERT INTO vip_rollback_test_results VALUES('720h repurchase / historical replay',true,'first contract=3000; second initial=100; historical order does not extend/overwrite new expiry');
  INSERT INTO vip_rollback_test_results VALUES('overall',true,'Synthetic SQL fixture only. Full transaction rolls back; P02 not accepted.');
 EXCEPTION WHEN OTHERS THEN
  -- Roll back the complete fixture subtransaction, then emit a reviewable failure.
  INSERT INTO vip_rollback_test_results VALUES('overall',false,SQLSTATE||': '||SQLERRM);
 END;
END $test$;
SELECT * FROM vip_rollback_test_results;
ROLLBACK;
