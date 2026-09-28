-- Dedicated GAME04 QA only; all fixture mutations roll back.
begin;
do $$
declare u uuid:='67ee9a06-6d41-4858-8de4-b634e982c67e'; req uuid:=gen_random_uuid(); response jsonb; retry jsonb; rid uuid; before_count integer; after_count integer; item_count integer; failed boolean; snap jsonb; cfg jsonb;
begin
 perform 1 from public.game04_player_state where user_id=u;
 if not found then raise exception 'QA_USER_NOT_INITIALIZED'; end if;
 -- Hide only this QA owner's previous rooms for isolated slot assertions.
 update public.game04_raid_rooms set state=jsonb_set(state,'{status}','"expired"') where state->>'ownerId'=u::text and state->>'status'='active';
 update public.game04_territory_progress set experience=0 where user_id=u;
 update public.game04_player_state set state=jsonb_set(state,'{materials,unlock}','0') where user_id=u;
 select count(*) into before_count from public.game04_raid_rooms where state->>'ownerId'=u::text;
 failed:=false;begin perform public.game04_host_territory(u,gen_random_uuid(),'azuchi');exception when others then if sqlerrm='TERRITORY_ITEM_REQUIRED' then failed:=true;else raise;end if;end;
 if not failed then raise exception 'Zero-item hosting accepted';end if;
 update public.game04_player_state set state=jsonb_set(state,'{materials,unlock}','4') where user_id=u;
 failed:=false;begin perform public.game04_host_territory(u,gen_random_uuid(),'gifu');exception when others then if sqlerrm='TERRITORY_LEVEL_REQUIRED' then failed:=true;else raise;end if;end;
 if not failed then raise exception 'Locked destination accepted';end if;
 response:=public.game04_host_territory(u,req,'azuchi');rid:=(response#>>'{room,id}')::uuid;
 retry:=public.game04_host_territory(u,req,'azuchi');
 if retry#>>'{room,id}' is distinct from response#>>'{room,id}' then raise exception 'Idempotency room mismatch';end if;
 select (state#>>'{materials,unlock}')::integer into item_count from public.game04_player_state where user_id=u;
 if item_count<>3 then raise exception 'Hosting replay consumed twice';end if;
 failed:=false;begin perform public.game04_host_territory(u,gen_random_uuid(),'azuchi');exception when others then if sqlerrm='TERRITORY_HOSTING_SLOTS_FULL' then failed:=true;else raise;end if;end;
 if not failed then raise exception 'Slot overflow';end if;
 failed:=false;begin perform public.game04_host_territory(u,req,'gifu');exception when others then if sqlerrm='REQUEST_ID_REUSED' then failed:=true;else raise;end if;end;
 if not failed then raise exception 'Request ID accepted different destination';end if;
 select count(*) into after_count from public.game04_raid_rooms where state->>'ownerId'=u::text;
 if after_count<>before_count+1 then raise exception 'Failed hosting left a room';end if;
 select state->'territorySnapshot' into snap from public.game04_raid_rooms where id=rid;
 failed:=false;begin update public.game04_raid_rooms set state=jsonb_set(state,'{territorySnapshot,destination,clearExp}','999') where id=rid;exception when others then if sqlerrm='TERRITORY_SNAPSHOT_IMMUTABLE' then failed:=true;else raise;end if;end;
 if not failed then raise exception 'Snapshot was mutable';end if;
 select data into cfg from public.game04_redesign_master where key='territory';
 update public.game04_redesign_master set data=jsonb_set(data,'{destinations,0,clearExp}','999') where key='territory';
 if (select state->'territorySnapshot' from public.game04_raid_rooms where id=rid) is distinct from snap then raise exception 'Master update changed room';end if;
 update public.game04_redesign_master set data=cfg where key='territory';
 -- Time-expired active rows release slots without waiting for a refresh or reward claim.
 update public.game04_raid_rooms set state=jsonb_set(state,'{expiresAt}',to_jsonb((now()-interval '1 minute')::text)) where id=rid;
 response:=public.game04_host_territory(u,gen_random_uuid(),'azuchi');
 if response#>>'{room,id}'=rid::text then raise exception 'Rehosting returned old room';end if;
 if (select experience from public.game04_territory_progress where user_id=u)<>0 then raise exception 'Timeout or hosting granted XP';end if;
 if not exists(select 1 from jsonb_array_elements(public.game04_raid_rooms_for_user(u)) x where x#>>'{state,id}'=rid::text) then raise exception 'Expired result disappeared';end if;
 -- Corrupt required numeric values must not silently pass NULL comparisons.
 failed:=false;begin perform public.game04_validate_territory_master(jsonb_set(cfg,'{levels,0,hostingSlots}','null'));exception when others then failed:=true;end;
 if not failed then raise exception 'Invalid master accepted';end if;
 raise notice 'PASS: zero item, level gate, slot gate, atomic rollback, request replay, frozen snapshot, timeout slot release and history, invalid master';
end $$;
rollback;
