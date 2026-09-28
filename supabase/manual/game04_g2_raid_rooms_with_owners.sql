-- Additive read-only projection. Existing rooms visibility/order and owner fallbacks remain authoritative.
create or replace function public.game04_raid_rooms_with_owners(p_user_id uuid)
returns jsonb language sql stable security invoker set search_path=public,pg_temp as $$
 with rooms as (
  select item,ordinality from jsonb_array_elements(public.game04_raid_rooms_for_user(p_user_id)) with ordinality as r(item,ordinality)
 )
 select coalesce(jsonb_agg(jsonb_build_object(
  'state',r.item->'state','version',r.item->'version',
  'ownerName',u.username,'ownerLeaderCharacterId',p.state#>>'{deck,0,characterId}'
 ) order by r.ordinality),'[]'::jsonb)
 from rooms r
 left join public.users u on u.id=(r.item#>>'{state,ownerId}')::uuid
 left join public.game04_player_state p on p.user_id=(r.item#>>'{state,ownerId}')::uuid;
$$;
revoke all on function public.game04_raid_rooms_with_owners(uuid) from public,anon,authenticated;
grant execute on function public.game04_raid_rooms_with_owners(uuid) to service_role;
