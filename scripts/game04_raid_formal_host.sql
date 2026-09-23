-- GAME04 dev only. Additive RPC; existing rooms and snapshots are untouched.
create or replace function public.game04_host_formal_territory(p_user_id uuid,p_request_id uuid,p_destination_id text,p_raid_master jsonb) returns jsonb
language plpgsql security invoker set search_path=public,pg_temp as $$
declare cfg jsonb; d jsonb; boss jsonb; s public.game04_player_state%rowtype; prior jsonb; context jsonb; slots integer; available integer; rid uuid:=gen_random_uuid(); room jsonb; result jsonb; user_name text;
begin
 if p_request_id is null then raise exception 'REQUEST_ID_REQUIRED'; end if;
 -- Same user mutex and state lock order as game04_commit_state.
 select username into user_name from public.users where id=p_user_id for update;
 if not found then raise exception 'GAME_USER_NOT_FOUND'; end if;
 select q.result into prior from public.game04_requests q where q.user_id=p_user_id and q.request_id=p_request_id;
 if found then
  if prior->>'operation' is distinct from 'host_territory' or prior->>'destinationId' is distinct from p_destination_id then raise exception 'REQUEST_ID_REUSED'; end if;
  return prior;
 end if;
 select * into s from public.game04_player_state where user_id=p_user_id for update;
 if not found then raise exception 'STATE_NOT_INITIALIZED'; end if;
 context:=public.game04_territory_context(p_user_id);cfg:=context->'master';
 -- Hosting never locks existing rooms; clear-trigger order room -> progress cannot cycle.
 perform 1 from public.game04_territory_progress where user_id=p_user_id for update;
 context:=public.game04_territory_context(p_user_id);cfg:=context->'master';
 select value into d from jsonb_array_elements(cfg->'destinations') where value->>'id'=p_destination_id;
 if d is null then raise exception 'TERRITORY_DESTINATION_NOT_FOUND'; end if;
 if d ? 'unavailableReason' then raise exception 'TERRITORY_HOSTING_POLICY_UNCONFIRMED'; end if;
 if (context#>>'{progress,level}')::integer<(d->>'requiredLevel')::integer then raise exception 'TERRITORY_LEVEL_REQUIRED'; end if;
 select (value->>'hostingSlots')::integer into slots from jsonb_array_elements(cfg->'levels') where (value->>'level')::integer=(context#>>'{progress,level}')::integer;
 if (context->>'activeHostingCount')::integer>=slots then raise exception 'TERRITORY_HOSTING_SLOTS_FULL'; end if;
 available:=coalesce((context->'items'->>(d->>'itemId'))::integer,0);
 if available<(d->>'itemCount')::integer then raise exception 'TERRITORY_ITEM_REQUIRED'; end if;
 select value||jsonb_build_object('durationMinutes',d->'durationMinutes') into boss from jsonb_array_elements(cfg->'raidMasters') where value->>'id'=d->>'raidMasterId';
 if p_raid_master is not null then
  if p_raid_master->>'id' is distinct from boss->>'id' or p_raid_master->>'masterVersion' is distinct from boss->>'masterVersion' or jsonb_array_length(p_raid_master->'stages')<>12 then raise exception 'TERRITORY_FORMAL_MASTER_MISMATCH'; end if;
  boss:=p_raid_master||jsonb_build_object('durationMinutes',d->'durationMinutes');
 end if;
 if d->>'itemId'='raid_unlock' then s.state:=jsonb_set(s.state,'{materials,unlock}',to_jsonb(available-(d->>'itemCount')::integer));
 else s.state:=jsonb_set(s.state,'{territoryItems}',coalesce(s.state->'territoryItems','{}'::jsonb)||jsonb_build_object(d->>'itemId',available-(d->>'itemCount')::integer)); end if;
 room:=jsonb_build_object('id',rid,'masterId',boss->>'id','ownerId',p_user_id,'level',1,'hp',boss->'sharedHp','maxHp',boss->'sharedHp',
 'createdAt',clock_timestamp(),'expiresAt',clock_timestamp()+make_interval(mins=>(d->>'durationMinutes')::integer),'status','active','rescueCount',0,'rescueWindowStartedAt',clock_timestamp(),
 'participants',jsonb_build_array(jsonb_build_object('userId',p_user_id,'name',coalesce(user_name,'主催者'),'wins',0,'attempts',0,'totalDamage',0,'joinedLevel',1)),
 'settledBattleIds','[]'::jsonb,'rewardGrants','[]'::jsonb,
 'territorySnapshot',jsonb_build_object('masterVersion',cfg->>'version','status',cfg->>'status','destination',d,'raidMaster',boss,'battleRules',cfg->'battleRules'));
 insert into public.game04_raid_rooms(id,state) values(rid,room);
 update public.game04_player_state set state=s.state,version=version+1,updated_at=now() where user_id=p_user_id;
 result:=jsonb_build_object('operation','host_territory','destinationId',p_destination_id,'state',public.game04_get_state(p_user_id),'room',room||jsonb_build_object('version',0),'territory',public.game04_territory_context(p_user_id));
 insert into public.game04_requests(user_id,request_id,result) values(p_user_id,p_request_id,result);
 return result;
end $$;

revoke all on function public.game04_host_formal_territory(uuid,uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.game04_host_formal_territory(uuid,uuid,text,jsonb) to service_role;
