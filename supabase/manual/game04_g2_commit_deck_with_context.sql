-- UNDEPLOYED CANDIDATE. GAME04 dev only, after G3 acceptance and exclusive write handoff.
-- Feature flag GAME04_SAVE_CONTEXT_RPC remains absent/false until SQL and integration acceptance.
-- Keep the original growth commit authority; collapse its dependent response HTTP wave only.
create or replace function public.game04_commit_deck_with_context(
 p_user_id uuid,p_expected_version bigint,p_state jsonb,p_cash_delta bigint,p_energy_delta integer,p_request_id uuid,
 p_battle jsonb default null,p_raid jsonb default null,p_raid_expected_version bigint default null,p_receipt jsonb default '{}'
) returns jsonb language plpgsql volatile security invoker set search_path=public,pg_temp as $$
declare saved jsonb; rooms jsonb; events jsonb; pending jsonb; territory jsonb;
begin
 -- This wrapper is deliberately restricted to resource-neutral deck saves.
 if p_receipt#>>'{gameplayMeasurement,action}' is distinct from 'save_deck'
    or p_cash_delta is distinct from 0 or p_energy_delta is distinct from 0
    or p_battle is not null or p_raid is not null or p_raid_expected_version is not null then
   raise exception 'DECK_CONTEXT_ONLY';
 end if;
 saved:=public.game04_commit_growth_state(p_user_id,p_expected_version,p_state,p_cash_delta,p_energy_delta,p_request_id,p_battle,p_raid,p_raid_expected_version,p_receipt);
 -- The committed deck must be visible to owner portrait projection. Never prefetch this context.
 rooms:=public.game04_raid_rooms_with_owners(p_user_id);
 select coalesce(jsonb_agg(to_jsonb(e) order by e.created_at desc),'[]'::jsonb) into events
 from (select * from public.game04_social_events order by created_at desc limit 30) e;
 select coalesce(jsonb_agg(to_jsonb(b)-'created_at' order by b.created_at asc),'[]'::jsonb) into pending
 from (select id,kind,target_id,created_at from public.game04_battles
       where user_id=p_user_id and status='started' order by created_at asc limit 1) b;
 -- This existing function may initialise territory progress; it is NOT a readonly prefetch.
 territory:=public.game04_territory_context(p_user_id);
 -- Context is an ephemeral response, never written into the idempotency receipt.
 return saved||jsonb_build_object('responseContext',jsonb_build_object(
   'rooms',rooms,'socialEvents',events,'pending',pending,'territory',territory));
end $$;
revoke all on function public.game04_commit_deck_with_context(uuid,bigint,jsonb,bigint,integer,uuid,jsonb,jsonb,bigint,jsonb) from public,anon,authenticated;
grant execute on function public.game04_commit_deck_with_context(uuid,bigint,jsonb,bigint,integer,uuid,jsonb,jsonb,bigint,jsonb) to service_role;
