begin;

-- Functional read contract for the GAME04 raid screen. This migration is intentionally
-- additive: battle finalization and reward ledgers remain the existing authorities.
create or replace function public.raid_room_projection_v2(p_room_id uuid) returns jsonb
language sql stable security definer set search_path=public,pg_temp as $$
  select public.raid_room_projection_v1(p_room_id) || jsonb_build_object(
    'raidVariantId',jsonb_build_object('status','available','value',b.raid_variant_id),
    'raidLevel',case when master.reference_level is null then jsonb_build_object('status','unknown') else jsonb_build_object('status','available','value',master.reference_level) end,
    'attribute',case when master.attribute is null then jsonb_build_object('status','unknown') else jsonb_build_object('status','available','value',master.attribute) end,
    'capacity',case when rule.member_capacity is null then jsonb_build_object('status','unknown') else jsonb_build_object('status','available','value',rule.member_capacity) end
  )
  from public.raid_rooms r
  join public.raid_bosses b on b.id=r.raid_boss_instance_id
  left join public.canonical_raid_boss_master master on master.boss_id=coalesce(b.boss_master_id,b.boss_id)
  left join public.raid_room_difficulty_rules rule on rule.difficulty=r.difficulty_id
  where r.id=p_room_id
$$;

create or replace function public.get_raid_room_v1(p_room_id uuid) returns jsonb
language plpgsql stable security definer set search_path=public,pg_temp as $$
begin
  if auth.uid() is null or not public.raid_room_can_read_v1(p_room_id) then
    raise exception 'room unavailable' using errcode='P0002';
  end if;
  return public.raid_room_projection_v2(p_room_id);
end $$;

create or replace function public.get_raid_room_participants_v2(
  p_room_id uuid,p_limit integer default 20,p_offset integer default 0
) returns jsonb language plpgsql stable security definer set search_path=public,pg_temp as $$
declare
  base jsonb;
  items jsonb := '[]'::jsonb;
  item jsonb;
  uid uuid;
  attempts integer;
  wins integer;
  recent text;
  clear jsonb;
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode='42501'; end if;
  if p_limit is null or p_limit<1 or p_limit>100 or p_offset is null or p_offset<0 then
    raise exception 'invalid pagination' using errcode='22023';
  end if;
  base:=public.get_raid_room_participants_v1(p_room_id,p_limit,p_offset);
  for item in select value from jsonb_array_elements(coalesce(base->'participants','[]'::jsonb)) loop
    uid:=(item#>>'{player,userId}')::uuid;
    select count(*)::integer,
           count(*) filter (where coalesce(finalization_result->>'winner',finalization_result#>>'{result,winner}')='PLAYER')::integer,
           (array_agg(case when coalesce(finalization_result->>'winner',finalization_result#>>'{result,winner}')='PLAYER' then 'victory' else 'defeat' end order by finalized_at desc,id desc))[1]
      into attempts,wins,recent
      from public.battle_replay_sessions
     where battle_mode='RAID' and requester_user_id=uid and source_reference_id=(select raid_boss_instance_id from public.raid_rooms where id=p_room_id)
       and finalization_status='FINALIZED';
    if uid=auth.uid() then
      begin
        select to_jsonb(public.get_raid_room_clear_reward_v1(p_room_id)) into clear;
      exception when others then clear:=null;
      end;
    else clear:=null;
    end if;
    item:=item
      || jsonb_build_object('victoryCount',jsonb_build_object('status','available','value',coalesce(wins,0)))
      || jsonb_build_object('recentState',case when recent is null then jsonb_build_object('status','unknown') else jsonb_build_object('status','available','value',recent) end)
      || jsonb_build_object('participationProgress',jsonb_build_object('status','available','value',coalesce((item#>>'{finalizedBattles,value}')::integer,0)));
    if clear is not null then
      item:=item||jsonb_build_object('rewardEligibility',jsonb_build_object(
        'status',case when clear->>'status' in ('issued','pending') then 'eligible' else 'ineligible' end,
        'evaluatedAt',clock_timestamp(),
        'reasons',case when clear->>'status' in ('issued','pending') then '[]'::jsonb else jsonb_build_array(coalesce(clear#>>'{clearGate,status}','not_eligible')) end));
    end if;
    items:=items||jsonb_build_array(item);
  end loop;
  return jsonb_build_object('participants',items,'nextOffset',base->'nextOffset');
end $$;

create or replace function public.list_raid_room_history_v1(p_limit integer default 20,p_offset integer default 0) returns jsonb
language plpgsql stable security definer set search_path=public,pg_temp as $$
declare rows jsonb; total integer;
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode='42501'; end if;
  if p_limit is null or p_limit<1 or p_limit>100 or p_offset is null or p_offset<0 then raise exception 'invalid pagination' using errcode='22023'; end if;
  with page as (
    select r.id,r.created_at from public.raid_rooms r join public.raid_bosses b on b.id=r.raid_boss_instance_id
    where public.raid_room_can_read_v1(r.id)
      and (b.outcome_finalized_at is not null or b.status in ('CLEARED','EXPIRED') or b.expires_at<=statement_timestamp())
    order by r.created_at desc,r.id limit p_limit+1 offset p_offset
  ), numbered as (select *,row_number() over(order by created_at desc,id) n from page)
  select coalesce(jsonb_agg(public.raid_room_projection_v2(id) order by created_at desc,id) filter(where n<=p_limit),'[]'::jsonb),count(*)
    into rows,total from numbered;
  return jsonb_build_object('rooms',rows,'nextOffset',case when total>p_limit then p_offset+p_limit else null end);
end $$;

create function private.raid_page_entry_v2(p_room_id uuid,p_rescue_id uuid default null) returns jsonb
language sql stable security definer set search_path=public,pg_temp as $$
  select private.raid_page_entry_v1(p_room_id,p_rescue_id)
    || jsonb_build_object('room',public.raid_room_projection_v2(p_room_id))
$$;

create function public.list_raid_room_cards_v2(p_difficulty_id text,p_offset integer default 0) returns jsonb
language plpgsql stable security definer set search_path=public,pg_temp as $$
declare rows jsonb; total integer;
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode='42501'; end if;
  if p_difficulty_id is null or p_difficulty_id not in ('beginner','intermediate','advanced','expert') or p_offset is null or p_offset<0 then raise exception 'invalid page' using errcode='22023'; end if;
  with page as (
    select r.id,r.created_at from public.raid_rooms r join public.raid_bosses b on b.id=r.raid_boss_instance_id
    where r.difficulty_id=p_difficulty_id and b.status='ACTIVE' and b.current_hp>0 and b.expires_at>statement_timestamp() and b.outcome_finalized_at is null and public.raid_room_can_read_v1(r.id)
    order by r.created_at desc,r.id limit 21 offset p_offset
  ), numbered as (select *,row_number() over(order by created_at desc,id) n from page)
  select coalesce(jsonb_agg(private.raid_page_entry_v2(id) order by created_at desc,id) filter(where n<=20),'[]'::jsonb),count(*) into rows,total from numbered;
  return jsonb_build_object('entries',rows,'nextOffset',case when total>20 then p_offset+20 else null end);
end $$;

revoke all on function public.get_raid_room_participants_v2(uuid,integer,integer),public.list_raid_room_history_v1(integer,integer) from public,anon,authenticated;
grant execute on function public.get_raid_room_participants_v2(uuid,integer,integer),public.list_raid_room_history_v1(integer,integer),public.list_raid_room_cards_v2(text,integer) to authenticated;

commit;
