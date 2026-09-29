-- A single scheduled event; no edits to permanent encounter/energy masters.
create table public.game04_ccu_events (
 id text primary key,
 starts_at timestamptz not null,
 ends_at timestamptz not null,
 enabled boolean not null default true,
 check (ends_at > starts_at)
);
alter table public.game04_ccu_events enable row level security;
revoke all on public.game04_ccu_events from public, anon, authenticated;
grant select, insert, update, delete on public.game04_ccu_events to service_role;

insert into public.game04_ccu_events(id,starts_at,ends_at)
values ('ccu-20260929','2026-09-29 21:00:00+09','2026-09-30 00:00:00+09');

create table public.game04_ccu_event_grants (
 event_id text not null references public.game04_ccu_events(id),
 user_id uuid not null references public.users(id) on delete cascade,
 item_id text not null check (item_id='SPECIAL_TICKET_CHARACTER'),
 quantity integer not null check (quantity=3),
 granted_at timestamptz not null default clock_timestamp(),
 primary key(event_id,user_id)
);
alter table public.game04_ccu_event_grants enable row level security;
revoke all on public.game04_ccu_event_grants from public, anon, authenticated;
grant select, insert on public.game04_ccu_event_grants to service_role;

create or replace function public.game04_ccu_event_status()
returns jsonb language sql volatile security invoker
set search_path=public,pg_temp as $$
 select jsonb_build_object('id',id,'startsAt',starts_at,'endsAt',ends_at,
   'enabled',enabled,'serverNow',clock_timestamp())
 from public.game04_ccu_events where id='ccu-20260929';
$$;
revoke all on function public.game04_ccu_event_status() from public,anon,authenticated;
grant execute on function public.game04_ccu_event_status() to service_role;

create or replace function public.game04_claim_ccu_event_reward(p_user_id uuid)
returns jsonb language plpgsql security invoker
set search_path=public,pg_temp as $$
declare e public.game04_ccu_events%rowtype; n integer; grant_time timestamptz;
begin
 select * into e from public.game04_ccu_events where id='ccu-20260929';
 grant_time:=clock_timestamp();
 if not found or not e.enabled or grant_time<e.starts_at or grant_time>=e.ends_at then
   return jsonb_build_object('granted',false);
 end if;
 -- Follow the same users -> inventory lock order as gacha consumption.
 perform 1 from public.users where id=p_user_id for update;
 if not found then raise exception 'GAME_USER_NOT_FOUND'; end if;
 grant_time:=clock_timestamp();
 if grant_time<e.starts_at or grant_time>=e.ends_at then
   return jsonb_build_object('granted',false);
 end if;
 insert into public.game04_ccu_event_grants(event_id,user_id,item_id,quantity,granted_at)
 values(e.id,p_user_id,'SPECIAL_TICKET_CHARACTER',3,grant_time)
 on conflict(event_id,user_id) do nothing;
 get diagnostics n=row_count;
 if n=0 then return jsonb_build_object('granted',false,'alreadyGranted',true); end if;
 insert into public.user_items(user_id,item_id,quantity,updated_at)
 values(p_user_id,'SPECIAL_TICKET_CHARACTER',3,grant_time)
 on conflict(user_id,item_id) do update
 set quantity=coalesce(public.user_items.quantity,0)+excluded.quantity,updated_at=excluded.updated_at;
 return jsonb_build_object('granted',true,'eventId',e.id,'itemId','SPECIAL_TICKET_CHARACTER','quantity',3);
end;
$$;
revoke all on function public.game04_claim_ccu_event_reward(uuid) from public,anon,authenticated;
grant execute on function public.game04_claim_ccu_event_reward(uuid) to service_role;
