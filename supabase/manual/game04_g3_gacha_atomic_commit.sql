-- GAME04 G3 candidate. Apply only after G2 latest functions are present.
-- Atomic resource debit + player-state grant + immutable request receipt.
create or replace function public.game04_commit_gacha(
 p_user_id uuid,p_expected_version bigint,p_state jsonb,p_cash_delta bigint,
 p_before_diamonds integer,p_diamond_cost integer,p_request_id uuid,
 p_operation text,p_request_payload jsonb,p_receipt jsonb
) returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare
 u public.users%rowtype;
 prior jsonb;
 v_result jsonb;
 v_saved_state jsonb;
 v_ticket_id text;
 v_ticket_cost integer:=0;
 v_ticket_balance integer;
 v_receipt jsonb;
 v_jst_day text;
begin
 if p_request_id is null or p_operation not in ('normal_gacha','special_gacha','special_gacha_exchange','formal_gacha','formal_gacha_exchange')
  or jsonb_typeof(p_request_payload) is distinct from 'object' or jsonb_typeof(p_state) is distinct from 'object'
  or jsonb_typeof(p_receipt) is distinct from 'object' then raise exception 'INVALID_GACHA_REQUEST'; end if;
 select * into u from public.users where id=p_user_id for update;
 if not found then raise exception 'GAME_USER_NOT_FOUND'; end if;
 select r.result into prior from public.game04_requests r where r.user_id=p_user_id and r.request_id=p_request_id;
 if found then
  if prior->>'operation' is distinct from p_operation or prior->'requestPayload' is distinct from p_request_payload then raise exception 'REQUEST_ID_REUSED'; end if;
  return prior;
 end if;
 select s.state into v_saved_state from public.game04_player_state s where s.user_id=p_user_id for update;
 if not found then raise exception 'GAME_STATE_NOT_FOUND'; end if;
 -- questTicketGrants is the monotonic G2 delivery ledger. A gacha request may
 -- neither decrement it nor persist the server-only balance projection.
 if coalesce(p_state->'questTicketGrants','{}'::jsonb) is distinct from coalesce(v_saved_state->'questTicketGrants','{}'::jsonb)
  or p_state ? 'gachaTicketBalances' then raise exception 'INVALID_GACHA_TICKET_STATE'; end if;
 if p_operation='special_gacha' and p_request_payload->>'payment'='TICKET' then
  if p_request_payload->>'count' is distinct from '1' then raise exception 'INVALID_GACHA_TICKET_COUNT'; end if;
  v_ticket_id:=case p_request_payload->>'category'
   when 'character' then 'SPECIAL_TICKET_CHARACTER'
   when 'skill' then 'SPECIAL_TICKET_SKILL'
   when 'equipment' then 'SPECIAL_TICKET_EQUIPMENT'
   else null end;
  if v_ticket_id is null then raise exception 'INVALID_GACHA_TICKET_CATEGORY'; end if;
  v_ticket_cost:=1;
 elsif p_request_payload->>'payment'='TICKET' then
  raise exception 'INVALID_GACHA_TICKET_OPERATION';
 end if;
 if p_operation='normal_gacha' then
  v_jst_day:=to_char(clock_timestamp() at time zone 'Asia/Tokyo','YYYY-MM-DD');
  if p_receipt->>'normalGachaJstDay' is distinct from v_jst_day
   or (p_request_payload->>'payment'='FREE' and p_state->>'dailyNormalGachaDate' is distinct from v_jst_day) then
   raise exception 'GACHA_DAY_CHANGED' using errcode='40001';
  end if;
 end if;
 if p_diamond_cost is null or p_diamond_cost<0 or p_diamond_cost>3000
  or p_before_diamonds is null or (p_state->>'diamonds')::integer is distinct from p_before_diamonds-p_diamond_cost then raise exception 'INVALID_GACHA_COST'; end if;
 -- Existing expiry trigger remains the balance authority. Re-read after it runs.
 update public.users set neon_diamonds=neon_diamonds where id=p_user_id returning * into u;
 if u.neon_diamonds<>p_before_diamonds then raise exception 'STATE_CONFLICT' using errcode='40001'; end if;
 if u.neon_diamonds<p_diamond_cost then raise exception 'INSUFFICIENT_RESOURCE'; end if;
 update public.users set neon_diamonds=neon_diamonds-p_diamond_cost where id=p_user_id;
 if v_ticket_id is not null then
  select i.quantity into v_ticket_balance from public.user_items i
   where i.user_id=p_user_id and i.item_id=v_ticket_id for update;
  if coalesce(v_ticket_balance,0)<v_ticket_cost then raise exception 'INSUFFICIENT_RESOURCE'; end if;
  -- Keep the ordinary quantity update so the existing paid-lot expiry/spend
  -- trigger remains the authority for expiring and consuming paid ticket lots.
  update public.user_items set quantity=quantity-v_ticket_cost,updated_at=clock_timestamp()
   where user_id=p_user_id and item_id=v_ticket_id returning quantity into v_ticket_balance;
 end if;
 v_receipt:=p_receipt||case when v_ticket_id is null then '{}'::jsonb else jsonb_build_object(
  'specialGachaTicketId',v_ticket_id,
  'specialGachaTicketCost',v_ticket_cost,
  'specialGachaTicketBalanceAfter',v_ticket_balance
 ) end;
 v_result:=public.game04_commit_growth_state(p_user_id,p_expected_version,p_state,p_cash_delta,0,p_request_id,p_receipt=>v_receipt);
 v_result:=v_result||jsonb_build_object('operation',p_operation,'requestPayload',p_request_payload,'receipt',v_receipt);
 update public.game04_requests set result=v_result where user_id=p_user_id and request_id=p_request_id;
 return v_result;
end $$;
revoke all on function public.game04_commit_gacha(uuid,bigint,jsonb,bigint,integer,integer,uuid,text,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.game04_commit_gacha(uuid,bigint,jsonb,bigint,integer,integer,uuid,text,jsonb,jsonb) to service_role;
notify pgrst,'reload schema';
