begin;
do $test$
declare uid uuid:='b9003819-973a-47b2-a1ef-9e503c60bb7b'; rid uuid:=gen_random_uuid(); a jsonb; b jsonb; initial_version bigint; before_rooms bigint; after_rooms bigint;
begin
 if not exists(select 1 from public.users where id=uid and username='G2QA独立E') then raise exception 'QA_USER_MISMATCH';end if;
 perform 1 from public.users where id=uid for update;
 update public.game04_player_state set state=jsonb_set(jsonb_set(state,'{clearedStages}',coalesce(state->'clearedStages','[]'::jsonb)||'["mino-5"]'::jsonb),'{materials,unlock}','1'::jsonb),version=version+1 where user_id=uid;
 select version into initial_version from public.game04_player_state where user_id=uid;
 select count(*) into before_rooms from public.game04_raid_rooms where state->>'ownerId'=uid::text;
 a:=public.game04_host_territory(uid,rid,'TI01');
 b:=public.game04_host_territory(uid,rid,'TI01');
 if a is distinct from b then raise exception 'REPLAY_DIFF';end if;
 if a#>>'{receipt,gameplayMeasurement,action}' is distinct from 'territory_host' then raise exception 'HOST_KPI_MISSING';end if;
 select count(*) into after_rooms from public.game04_raid_rooms where state->>'ownerId'=uid::text;
 if after_rooms<>before_rooms+1 then raise exception 'HOST_DUPLICATE_ROOM';end if;
 if (select version from public.game04_player_state where user_id=uid)<>initial_version+1 then raise exception 'HOST_DUPLICATE_STATE';end if;
 if (select count(*) from public.game04_requests where user_id=uid and request_id=rid)<>1 then raise exception 'HOST_DUPLICATE_RECEIPT';end if;
end $test$;
select 'PASS: host receipt and replay share one room, state update, and KPI fact; rollback all fixture.' as result;
rollback;
