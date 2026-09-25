begin;
create table if not exists public.game04_territory_clear_receipts(room_id uuid primary key references public.game04_raid_rooms(id),user_id uuid not null references public.users(id),eligible boolean not null,experience bigint not null,owner_wins integer not null,master_version text not null,created_at timestamptz not null default now());
alter table public.game04_territory_clear_receipts enable row level security;
revoke all on public.game04_territory_clear_receipts from public,anon,authenticated;
grant all on public.game04_territory_clear_receipts to service_role;
CREATE OR REPLACE FUNCTION public.game04_capture_territory_unlock()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
begin
 -- A stale application snapshot cannot clear the durable once-only receipt.
 if TG_OP='UPDATE' and old.state ? 'territoryUnlockGrantedVersion' then
  new.state:=jsonb_set(new.state,'{territoryUnlockGrantedVersion}',old.state->'territoryUnlockGrantedVersion');
 elsif coalesce(new.state->'clearedStages','[]'::jsonb) @> '["mino-5"]'::jsonb then
  -- Preserve the whole existing inventory and add exactly one invasion order.
  new.state:=jsonb_set(new.state,'{materials}',coalesce(new.state->'materials','{}'::jsonb)||jsonb_build_object('unlock',coalesce((new.state#>>'{materials,unlock}')::integer,0)+1));
  new.state:=jsonb_set(new.state,'{territoryUnlockGrantedVersion}','"GAME04_TERRITORY_HOST_PROVISIONAL_20260923"'::jsonb);
 end if;
 return new;
end $function$
;
revoke all on function public.game04_capture_territory_unlock() from public,anon,authenticated;
grant execute on function public.game04_capture_territory_unlock() to service_role;
CREATE TRIGGER game04_territory_unlock_once BEFORE INSERT OR UPDATE OF state ON public.game04_player_state FOR EACH ROW EXECUTE FUNCTION game04_capture_territory_unlock();
CREATE OR REPLACE FUNCTION public.game04_capture_territory_clear()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare snap jsonb; owner uuid; wins integer; amount bigint; inserted integer;
begin
 if old.state->>'status'<>'active' or new.state->>'status'<>'defeated' then return new; end if;
 snap:=old.state->'territorySnapshot';
 if snap#>>'{raidMaster,type}' is distinct from 'unlock' then return new; end if;
 if (new.state->>'level')::integer<>(snap#>>'{raidMaster,maxLevel}')::integer or (new.state->>'hp')::bigint<>0 or (old.state->>'expiresAt')::timestamptz<=clock_timestamp() then return new; end if;
 owner:=(old.state->>'ownerId')::uuid;
 -- Result already includes the triggering battle win. Later settled battles cannot change this receipt.
 select coalesce((p->>'wins')::integer,0) into wins from jsonb_array_elements(new.state->'participants') p where p->>'userId'=owner::text;
 wins:=coalesce(wins,0); amount:=case when wins>=3 then (snap#>>'{destination,clearExp}')::bigint else 0 end;
 insert into public.game04_territory_clear_receipts(room_id,user_id,eligible,experience,owner_wins,master_version) values(new.id,owner,wins>=3,amount,wins,snap->>'masterVersion') on conflict(room_id) do nothing;
 get diagnostics inserted=row_count;
 if inserted=1 and amount>0 then
  -- Only the independent progress row is touched: never owner users/state locks from another player's settlement.
  update public.game04_territory_progress set experience=experience+amount,updated_at=now() where user_id=owner;
  if not found then raise exception 'TERRITORY_OWNER_PROGRESS_MISSING'; end if;
 end if;
 return new;
end $function$
;
revoke all on function public.game04_capture_territory_clear() from public,anon,authenticated;
grant execute on function public.game04_capture_territory_clear() to service_role;
CREATE TRIGGER game04_territory_clear AFTER UPDATE ON public.game04_raid_rooms FOR EACH ROW EXECUTE FUNCTION game04_capture_territory_clear();
CREATE OR REPLACE FUNCTION public.game04_preserve_territory_snapshot()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
begin
 if old.state ? 'territorySnapshot' and (old.state->'territorySnapshot' is distinct from new.state->'territorySnapshot' or old.state->>'ownerId' is distinct from new.state->>'ownerId') then raise exception 'TERRITORY_SNAPSHOT_IMMUTABLE'; end if;
 return new;
end $function$
;
revoke all on function public.game04_preserve_territory_snapshot() from public,anon,authenticated;
grant execute on function public.game04_preserve_territory_snapshot() to service_role;
CREATE TRIGGER game04_territory_snapshot_guard BEFORE UPDATE ON public.game04_raid_rooms FOR EACH ROW EXECUTE FUNCTION game04_preserve_territory_snapshot();
commit;
