-- GAME04 G3 candidate. Apply only after G2 latest functions are present.
-- Atomic resource debit + player-state grant + immutable request receipt.
create or replace function public.game04_commit_gacha(
 p_user_id uuid,p_expected_version bigint,p_state jsonb,p_cash_delta bigint,
 p_before_diamonds integer,p_diamond_cost integer,p_request_id uuid,
 p_operation text,p_request_payload jsonb,p_receipt jsonb
) returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare u public.users%rowtype; prior jsonb; v_result jsonb;
begin
 if p_request_id is null or p_operation not in ('normal_gacha','special_gacha','special_gacha_exchange','formal_gacha','formal_gacha_exchange') or jsonb_typeof(p_request_payload) is distinct from 'object' then raise exception 'INVALID_GACHA_REQUEST'; end if;
 select * into u from public.users where id=p_user_id for update;
 if not found then raise exception 'GAME_USER_NOT_FOUND'; end if;
 select r.result into prior from public.game04_requests r where r.user_id=p_user_id and r.request_id=p_request_id;
 if found then
  if prior->>'operation' is distinct from p_operation or prior->'requestPayload' is distinct from p_request_payload then raise exception 'REQUEST_ID_REUSED'; end if;
  return prior;
 end if;
 if p_diamond_cost is null or p_diamond_cost<0 or p_diamond_cost>3000
  or p_before_diamonds is null or (p_state->>'diamonds')::integer is distinct from p_before_diamonds-p_diamond_cost then raise exception 'INVALID_GACHA_COST'; end if;
 -- Existing expiry trigger remains the balance authority. Re-read after it runs.
 update public.users set neon_diamonds=neon_diamonds where id=p_user_id returning * into u;
 if u.neon_diamonds<>p_before_diamonds then raise exception 'STATE_CONFLICT' using errcode='40001'; end if;
 if u.neon_diamonds<p_diamond_cost then raise exception 'INSUFFICIENT_RESOURCE'; end if;
 update public.users set neon_diamonds=neon_diamonds-p_diamond_cost where id=p_user_id;
 v_result:=public.game04_commit_growth_state(p_user_id,p_expected_version,p_state,p_cash_delta,0,p_request_id,p_receipt=>p_receipt);
 v_result:=v_result||jsonb_build_object('operation',p_operation,'requestPayload',p_request_payload,'receipt',p_receipt);
 update public.game04_requests set result=v_result where user_id=p_user_id and request_id=p_request_id;
 return v_result;
end $$;
revoke all on function public.game04_commit_gacha(uuid,bigint,jsonb,bigint,integer,integer,uuid,text,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.game04_commit_gacha(uuid,bigint,jsonb,bigint,integer,integer,uuid,text,jsonb,jsonb) to service_role;
notify pgrst,'reload schema';
