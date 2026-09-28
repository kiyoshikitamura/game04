-- Patch only the two ticket-count clauses; preserve concurrently updated RPC logic.
do $patch$
declare
 definition text:=pg_get_functiondef('public.game04_commit_gacha(uuid,bigint,jsonb,bigint,integer,integer,uuid,text,jsonb,jsonb)'::regprocedure);
 old_guard text:=$old$if p_request_payload->>'count' is distinct from '1' then raise exception 'INVALID_GACHA_TICKET_COUNT'; end if;$old$;
 new_guard text:=$new$if coalesce(p_request_payload->>'count','') not in ('1','10') then raise exception 'INVALID_GACHA_TICKET_COUNT'; end if;$new$;
begin
 if strpos(definition,old_guard)=0 or strpos(definition,'v_ticket_cost:=1;')=0 then
  raise exception 'GACHA_TICKET_PATCH_BASE_CHANGED';
 end if;
 definition:=replace(definition,old_guard,new_guard);
 definition:=replace(definition,'v_ticket_cost:=1;',$new$v_ticket_cost:=(p_request_payload->>'count')::integer;$new$);
 execute definition;
end $patch$;
