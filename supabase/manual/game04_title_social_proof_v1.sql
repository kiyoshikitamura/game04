-- Additive companion to game04_title_arrivals_v1: same anonymous event/RPC pattern.
-- Apply to isolated Preview first. Production requires a separate release approval.
begin;
create table if not exists public.game04_title_proof_events (
 event_id uuid primary key,
 visit_id uuid not null,
 visitor_hash text not null,
 user_id uuid,
 event_type text not null check(event_type in ('TITLE_ARRIVED','TAP_TO_START','SELECTION_VIEWED','ONLINE_CHANGED','START_NEW_TAPPED','CONTINUE_TAPPED')),
 metadata jsonb not null,
 observed_at timestamptz not null default clock_timestamp()
);
create index if not exists game04_title_proof_visit_idx on public.game04_title_proof_events(visit_id,observed_at);
create index if not exists game04_title_proof_time_idx on public.game04_title_proof_events(observed_at);
alter table public.game04_title_proof_events enable row level security;
revoke all on public.game04_title_proof_events from public,anon,authenticated;
grant select,insert on public.game04_title_proof_events to service_role;

create or replace function public.game04_record_title_proof_event_v1(
 p_event_id uuid,p_visit_id uuid,p_visitor_id uuid,p_event_type text,p_metadata jsonb
) returns void language plpgsql security definer set search_path='' as $$
begin
 if p_event_id is null or p_visit_id is null or p_visitor_id is null
   or p_event_type is null or p_event_type not in ('TITLE_ARRIVED','TAP_TO_START','SELECTION_VIEWED','ONLINE_CHANGED','START_NEW_TAPPED','CONTINUE_TAPPED')
   or p_metadata is null or jsonb_typeof(p_metadata)<>'object' or octet_length(p_metadata::text)>2048
   or not (p_metadata ?& array['active_count','counted_at','display_range','displayed','new_game_eligible','selection_id','fixture'])
   or (p_metadata - array['active_count','counted_at','display_range','displayed','new_game_eligible','selection_id','fixture']) <> '{}'::jsonb
   or p_metadata->>'display_range' not in ('unknown','<30','30-39','40-49','50-59','60-69','70-79','80-89','90-99','100+')
   or jsonb_typeof(p_metadata->'displayed')<>'boolean'
   or jsonb_typeof(p_metadata->'new_game_eligible')<>'boolean'
   or jsonb_typeof(p_metadata->'fixture')<>'boolean'
 then raise exception 'Invalid title observation' using errcode='22023'; end if;
 insert into public.game04_title_proof_events(event_id,visit_id,visitor_hash,user_id,event_type,metadata)
 values(p_event_id,p_visit_id,encode(sha256(convert_to(p_visitor_id::text,'UTF8')),'hex'),auth.uid(),p_event_type,p_metadata)
 on conflict(event_id) do nothing;
end $$;
revoke all on function public.game04_record_title_proof_event_v1(uuid,uuid,uuid,text,jsonb) from public;
grant execute on function public.game04_record_title_proof_event_v1(uuid,uuid,uuid,text,jsonb) to anon,authenticated,service_role;
commit;
