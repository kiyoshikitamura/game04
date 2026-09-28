-- GAME04 dev candidate. Apply after game04_p02_paid_formal_inventory.sql.
-- New exchanges only. Existing balances/lots are never reclassified.
-- Authority: GAME03 20260913120945 derived lots inherit source expiry; GAME04 free DIA first.
begin;
create or replace function public.game04_commit_shop_exchange(p_user_id uuid,p_expected_version bigint,p_state jsonb,p_before_diamonds integer,p_diamond_cost integer,p_cash_delta bigint,p_request_id uuid)
returns jsonb language plpgsql set search_path=public,pg_temp as $$
declare u public.users%rowtype; prior jsonb; old_state jsonb; old_version bigint; result jsonb;
 paid_total bigint; remaining_paid bigint; take_qty bigint; segment jsonb; paid_segments jsonb:='[]';
 lot public.billing_asset_lots; item text; reward_qty bigint; energy_delta bigint; unlock_delta bigint;
 cumulative bigint:=0; previous_alloc bigint:=0; allocated bigint; pid uuid; source_kind text;
begin
 select * into u from public.users where id=p_user_id for update;
 if not found then raise exception 'GAME_USER_NOT_FOUND';end if;
 select r.result into prior from public.game04_requests r where r.user_id=p_user_id and r.request_id=p_request_id;
 if found then return prior;end if;
 if p_diamond_cost is null or p_diamond_cost<0 or p_diamond_cost>5000
 or p_before_diamonds is null or (p_state->>'diamonds')::integer is distinct from p_before_diamonds-p_diamond_cost then
  raise exception 'INVALID_EXCHANGE_COST';end if;
 update public.users set neon_diamonds=neon_diamonds where id=p_user_id returning * into u;
 if u.neon_diamonds<>p_before_diamonds then raise exception 'STATE_CONFLICT' using errcode='40001';end if;
 if u.neon_diamonds<p_diamond_cost then raise exception 'INSUFFICIENT_RESOURCE';end if;
 select state,version into old_state,old_version from public.game04_player_state where user_id=p_user_id for update;
 if not found then raise exception 'STATE_NOT_INITIALIZED';end if;
 if old_version is distinct from p_expected_version then raise exception 'STATE_CONFLICT' using errcode='40001';end if;
 if p_diamond_cost>0 then
  energy_delta:=coalesce((p_state->>'energyDrinks')::bigint,0)-coalesce((old_state->>'energyDrinks')::bigint,0);
  unlock_delta:=coalesce((p_state#>>'{materials,unlock}')::bigint,0)-coalesce((old_state#>>'{materials,unlock}')::bigint,0);
  if energy_delta between 1 and 10 and unlock_delta=0 and p_cash_delta=0 and p_diamond_cost=50*energy_delta then
   item:='ENERGY_DRINK';reward_qty:=energy_delta;source_kind:='GAME04_PAID_FORMAL';
  elsif unlock_delta=1 and energy_delta=0 and p_cash_delta=0 and p_diamond_cost=100 then
   item:='RAID_UNLOCK_TICKET';reward_qty:=1;source_kind:='GAME04_PAID_FORMAL';
  elsif energy_delta=0 and unlock_delta=0 and p_diamond_cost in (300,500,1000,3000,5000) and p_cash_delta=p_diamond_cost::bigint*10 then
   item:='CASH';reward_qty:=p_cash_delta;source_kind:='GAME04_PAID_DERIVED';
  else raise exception 'INVALID_EXCHANGE_REWARD';end if;
  select coalesce(sum(remaining_quantity),0) into paid_total from public.billing_asset_lots
   where user_id=p_user_id and item_id='DIAMOND' and claimed_at is not null and remaining_quantity>0 and expires_at>statement_timestamp();
  -- Match billing_apply_lot_delta: free first, then earliest paid expiry.
  remaining_paid:=greatest(0,p_diamond_cost-greatest(0,u.neon_diamonds-paid_total));
  for lot in select * from public.billing_asset_lots where user_id=p_user_id and item_id='DIAMOND'
   and claimed_at is not null and remaining_quantity>0 and expires_at>statement_timestamp() order by expires_at,id for update loop
   exit when remaining_paid=0;take_qty:=least(remaining_paid,lot.remaining_quantity);
   paid_segments:=paid_segments||jsonb_build_array(jsonb_build_object('id',lot.id,'order',lot.order_id,'quantity',take_qty,'issued',lot.issued_at,'expiry',lot.expires_at));
   remaining_paid:=remaining_paid-take_qty;
  end loop;
  if remaining_paid<>0 then raise exception 'PAID_LOT_SOURCE_MISMATCH';end if;
 end if;
 update public.users set neon_diamonds=neon_diamonds-p_diamond_cost where id=p_user_id;
 -- Existing state/receipt transaction and CAS guard; failures also roll back DIA expiry/debit.
 result:=public.game04_commit_growth_state(p_user_id,p_expected_version,p_state,p_cash_delta,0,p_request_id,
  p_receipt=>jsonb_build_object('gameplayMeasurement',jsonb_build_object('contractVersion','game04-gameplay-v1','action','shop_exchange','stateVersionBefore',p_expected_version,'stateVersionAfter',p_expected_version+1,'diamondCost',p_diamond_cost)));
 -- Inventory has already been granted above. These CLAIMED presents are provenance only.
 -- New lots are inserted after state commit, so that grant cannot consume its own newly issued lot.
 for segment in select value from jsonb_array_elements(paid_segments) loop
  cumulative:=cumulative+(segment->>'quantity')::bigint;
  allocated:=ceil(reward_qty::numeric*cumulative/p_diamond_cost)::bigint-previous_alloc;
  previous_alloc:=previous_alloc+allocated;
  if allocated>0 then
   insert into public.presents(user_id,item_id,quantity,message,status,expire_at,claimed_at,source_kind,source_metadata)
   values(p_user_id,item,allocated,'輝石交換','CLAIMED',(segment->>'expiry')::timestamptz,clock_timestamp(),source_kind,
    jsonb_build_object('game04PaidVersion','APPROVED_GROWTH_V1_20260921','funding','paid','orderId',segment->>'order','sourceLotId',segment->>'id','exchangeRequestId',p_request_id)) returning id into pid;
   insert into public.billing_asset_lots(order_id,user_id,present_id,item_id,issued_quantity,remaining_quantity,issued_at,expires_at,source_lot_id,claimed_at)
   values((segment->>'order')::uuid,p_user_id,pid,item,allocated,allocated,(segment->>'issued')::timestamptz,(segment->>'expiry')::timestamptz,(segment->>'id')::uuid,clock_timestamp());
  end if;
 end loop;
 return result;
end $$;

-- Expire paid CASH on ordinary state reads as well as explicit legacy refresh.
CREATE OR REPLACE FUNCTION public.game04_get_state(p_user_id uuid, p_initial jsonb DEFAULT NULL::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare u public.users%rowtype; s public.game04_player_state%rowtype; cfg jsonb; recovered integer; recovery_seconds integer; energy_max integer; vip timestamptz;
begin
 select * into u from public.users where id=p_user_id for update;
 if not found then raise exception 'GAME_USER_NOT_FOUND'; end if;
 update public.users set neon_diamonds=neon_diamonds,cash=cash where id=p_user_id returning * into u;
 select data into cfg from public.game04_redesign_master where key='runtime';
 energy_max := (cfg->>'energyMax')::integer; recovery_seconds := (cfg->>'energyRecoverySeconds')::integer;
 recovered := greatest(0,floor(extract(epoch from (now()-coalesce(u.vitality_last_recovered_at,now())))/recovery_seconds)::integer);
 if u.vitality < energy_max and recovered>0 then
  update public.users set vitality=least(energy_max,vitality+recovered),vitality_last_recovered_at=case when vitality+recovered>=energy_max then now() else coalesce(vitality_last_recovered_at,now())+make_interval(secs=>recovered*recovery_seconds) end where id=p_user_id returning * into u;
 elsif u.vitality>=energy_max then
  update public.users set vitality_last_recovered_at=now() where id=p_user_id returning * into u;
 end if;
 if p_initial is not null then insert into public.game04_player_state(user_id,state) values(p_user_id,p_initial) on conflict(user_id) do nothing; end if;
 -- Only expired claimed formal lots require a state write; ordinary reads remain read-only here.
 if exists(select 1 from public.billing_asset_lots l join public.presents p on p.id=l.present_id
  where l.user_id=p_user_id and l.claimed_at is not null and l.remaining_quantity>0 and l.expires_at<=statement_timestamp() and p.source_kind='GAME04_PAID_FORMAL') then
  update public.game04_player_state set state=state where user_id=p_user_id;
 end if;
 select * into s from public.game04_player_state where user_id=p_user_id;
 if not found then return null; end if;
 select expires_at into vip from public.game04_vip_entitlements where user_id=p_user_id;
 return s.state || jsonb_build_object('userId',p_user_id,'version',s.version,'cash',u.cash,'diamonds',u.neon_diamonds,'energy',u.vitality,'energyMax',energy_max,'vipExpiresAt',vip);
end $function$
;
commit;
