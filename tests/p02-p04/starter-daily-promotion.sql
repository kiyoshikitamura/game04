-- Synthetic acceptance on the authorized isolated DB. All fixture writes roll back.
begin;
set local lock_timeout='5s';
set local statement_timeout='30s';
do $test$
declare qa uuid:=gen_random_uuid(); v1 uuid:=gen_random_uuid(); v2 uuid:=gen_random_uuid();
 result jsonb; order_data jsonb; oid uuid; gift record; rejected boolean; evidence jsonb:='[]';
 today text:=to_char(statement_timestamp() at time zone 'Asia/Tokyo','YYYY-MM-DD');
begin
 begin
  if (select data->>'projectRef' from public.game04_redesign_master where key='isolated_environment') is distinct from 'znakrkaazliexzwihxge' then raise exception 'WRONG_PROJECT'; end if;
  insert into auth.users(id,raw_user_meta_data) values(qa,'{"qa":true}');
  insert into public.users(id,username,neon_diamonds,cash) values(qa,left(qa::text,8),700,1200) on conflict(id) do update set neon_diamonds=700,cash=1200;
  insert into public.game04_player_state(user_id,state) values(qa,jsonb_build_object('tutorial',jsonb_build_object('step',16,'departed',false),'energyDrinks',0,'dailyNormalGachaDate',today,'clearedStages','[]'::jsonb));
  perform set_config('request.jwt.claim.sub',qa::text,true);
  perform set_config('request.jwt.claims',jsonb_build_object('sub',qa,'role','authenticated')::text,true);
  if public.game04_home_promotion(v1,'enter') ? 'kind' then raise exception 'TUTORIAL_VISIBLE'; end if;
  update public.game04_player_state set state=jsonb_set(state,'{tutorial,step}','17') where user_id=qa;
  if public.game04_home_promotion(v1,'enter') ? 'kind' then raise exception 'FIRST_SORTIE_VISIBLE'; end if;
  update public.game04_player_state set state=jsonb_set(state,'{tutorial,departed}','true') where user_id=qa;
  if public.game04_home_promotion(v1,'enter')->>'kind' is distinct from 'starter' then raise exception 'NO_EARLY_OFFER'; end if;
  update public.game04_player_state set state=state||'{"earlyProgress":{"guides":{"join-maeda":"pending"}}}' where user_id=qa;
  if public.game04_home_promotion(v1,'reserve') ? 'kind' then raise exception 'PENDING_GUIDE_VISIBLE'; end if;
  update public.game04_player_state set state=jsonb_set(state,'{earlyProgress,guides,join-maeda}','"completed"') where user_id=qa;
  if public.game04_home_promotion(v1,'reserve')->>'kind' is distinct from 'starter' then raise exception 'GUIDE_DID_NOT_RESUME'; end if;
  if public.game04_home_promotion(v2,'enter') ? 'kind' then raise exception 'SECOND_DEVICE_RESERVED'; end if;
  perform public.game04_home_promotion(v1,'release');
  if public.game04_home_promotion(v2,'reserve')->>'kind' is distinct from 'starter' then raise exception 'RELEASE_CONSUMED_DAY'; end if;
  if public.game04_home_promotion(v2,'shown')->>'recorded' is distinct from 'true' then raise exception 'NOT_RECORDED'; end if;
  if public.game04_home_promotion(v2,'shown')->>'recorded' is distinct from 'true' then raise exception 'ACK_NOT_IDEMPOTENT'; end if;
  if public.game04_home_promotion(v1,'reserve') ? 'kind' then raise exception 'SAME_DAY_REPLAY'; end if;
  evidence:=evidence||'["tutorial/first-sortie/pending guides suppressed; resumes before area clear","second visit/device reservation excluded; release does not consume day; shown idempotent","same JST day suppressed"]';
  update public.game04_home_promotion_state set starter_shown_at=(today::date::timestamp at time zone 'Asia/Tokyo')-interval '1 millisecond' where user_id=qa;
  if public.game04_home_promotion(v1,'reserve')->>'kind' is distinct from 'starter' then raise exception 'NEW_JST_DAY_MISSING'; end if;
  perform public.game04_home_promotion(v1,'release');
  order_data:=public.game04_billing_reserve_order(qa,gen_random_uuid(),'beginner_pack_01','sandbox'); oid:=(order_data->>'id')::uuid;
  if order_data->'product_snapshot'->'items' is distinct from '[{"itemId":"SPECIAL_TICKET_CHARACTER","quantity":10},{"itemId":"DIAMOND","quantity":500,"validity_days":120}]'::jsonb then raise exception 'SNAPSHOT_WRONG'; end if;
  perform public.billing_attach_session(oid,'cs_test_starterDaily');
  result:=public.game04_billing_grant_order(oid,'cs_test_starterDaily',100,'jpy');
  if result->>'status' is distinct from 'GRANTED' then raise exception 'GRANT_FAILED'; end if;
  result:=public.game04_billing_grant_order(oid,'cs_test_starterDaily',100,'jpy');
  if result->>'duplicate' is distinct from 'true' then raise exception 'DUPLICATE_GRANT'; end if;
  if (select count(*) from public.billing_asset_lots where order_id=oid)<>2 then raise exception 'EXTRA_ITEMS'; end if;
  for gift in select present_id from public.billing_asset_lots where order_id=oid loop perform public.claim_present(gift.present_id); end loop;
  if (select neon_diamonds from public.users where id=qa)<>1200 or
     (select quantity from public.user_items where user_id=qa and item_id='SPECIAL_TICKET_CHARACTER')<>10 or
     exists(select 1 from public.user_items where user_id=qa and item_id in ('SPECIAL_TICKET_SKILL','SPECIAL_TICKET_EQUIPMENT','ENERGY_DRINK')) or
     (select state->>'energyDrinks' from public.game04_player_state where user_id=qa)<>'0' then raise exception 'WRONG_RECEIPT'; end if;
  rejected:=false;
  begin perform public.game04_billing_reserve_order(qa,gen_random_uuid(),'beginner_pack_01','sandbox'); exception when others then if SQLERRM<>'PURCHASE_LIMIT' then raise; end if; rejected:=true; end;
  if not rejected then raise exception 'REPURCHASE_ACCEPTED'; end if;
  result:=public.game04_home_promotion(v1,'reserve');
  if result->>'kind' is distinct from 'starter' or result->>'purchased' is distinct from 'true' then raise exception 'BUYER_NOT_INCLUDED'; end if;
  perform public.game04_home_promotion(v1,'release');
  update public.game04_player_state set state=state||'{"tutorial":null,"earlyProgress":{"guides":null}}' where user_id=qa;
  if public.game04_home_promotion(v1,'reserve')->>'kind' is distinct from 'starter' then raise exception 'LEGACY_NULL_BLOCKED'; end if;
  evidence:=evidence||'["JST boundary eligible again","100 yen grants exactly character tickets x10 and diamond x500; duplicate delivery safe","purchase limit retained; buyer included with purchased flag"]';
  raise exception using errcode='ZX001',message='ROLLBACK_FIXTURE_SUCCESS';
 exception when sqlstate 'ZX001' then null;
 end;
 if exists(select 1 from auth.users where id=qa) or exists(select 1 from public.users where id=qa) then raise exception 'FIXTURE_REMAINED'; end if;
 perform set_config('game04.qa_starter_result',jsonb_build_object('passed',true,'fixtureRolledBack',true,'checks',evidence)::text,true);
end $test$;
select current_setting('game04.qa_starter_result')::jsonb as evidence;
commit;
