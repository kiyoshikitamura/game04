-- QA display fixture only; NOT natural progression or an earned reward.
do $fixture$
declare src jsonb; dst jsonb; rid uuid:=gen_random_uuid(); g jsonb;
begin
 if exists(select 1 from public.game04_raid_rooms where state->>'ownerId'='d6dabf02-3eb2-430e-8352-561f8d735469' and state->>'qaFixture'='G2_PENDING_REWARD_DISPLAY_20260924') then return; end if;
 select state into strict src from public.game04_raid_rooms where id='a8dd1582-12fe-4161-8c34-0c423d1e04c4' and state->>'ownerId'='229ac838-28c3-48e4-a86a-45a25fbf72b9';
 g:=(src->'rewardGrants'->0)||jsonb_build_object('id','qa-display:'||rid::text,'userId','d6dabf02-3eb2-430e-8352-561f8d735469','claimed',false);
 dst:=src||jsonb_build_object('id',rid::text,'ownerId','d6dabf02-3eb2-430e-8352-561f8d735469','createdAt',now(),'qaFixture','G2_PENDING_REWARD_DISPLAY_20260924','settledBattleIds','[]'::jsonb,'rewardGrants',jsonb_build_array(g),'participants',jsonb_build_array((src->'participants'->0)||jsonb_build_object('userId','d6dabf02-3eb2-430e-8352-561f8d735469','name','G2QA薬F')));
 insert into public.game04_raid_rooms(id,version,state) values(rid,1,dst);
end $fixture$;
select id,version,state->'level' as level,state->'rewardGrants' as pending from public.game04_raid_rooms where state->>'ownerId'='d6dabf02-3eb2-430e-8352-561f8d735469' and state->>'qaFixture'='G2_PENDING_REWARD_DISPLAY_20260924';
