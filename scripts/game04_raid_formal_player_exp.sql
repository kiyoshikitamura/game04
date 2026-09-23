-- GAME04 dev only. Expand the existing growth guard to formal Encounter wins.
-- No saved battle input, raid snapshot, player balance or existing quest rule changes.
do $raid_exp$
declare definition text;
 old_guard text := $old$and b.kind='quest' and b.status='started'$old$;
 new_guard text := $new$and b.status='started' and (
    b.kind='quest'
    or (b.kind='raid'
      and b.input->>'raidMasterVersion'='GAME04_RAID_FORMAL_20260923'
      and b.input#>>'{playerExpReward,status}'='APPROVED'
      and exists (
        select 1 from public.game04_raid_rooms r
        where r.id::text=b.target_id
          and r.state#>>'{raidSnapshot,type}'='encounter'
          and r.state#>>'{raidSnapshot,masterVersion}'=b.input->>'raidMasterVersion'
          and b.input#>>'{playerExpReward,version}'=b.input->>'raidMasterVersion'
          and r.state#>>'{raidSnapshot,playerExp}'=b.input#>>'{playerExpReward,amount}'
      )
    )
   )$new$;
begin
 select pg_get_functiondef('public.game04_commit_growth_state(uuid,bigint,jsonb,bigint,integer,uuid,jsonb,jsonb,bigint,jsonb)'::regprocedure) into definition;
 if strpos(definition,new_guard)>0 then return; end if;
 if strpos(definition,old_guard)=0 then raise exception 'PLAYER_EXP_GUARD_CHANGED_REVIEW_REQUIRED'; end if;
 execute replace(definition,old_guard,new_guard);
end $raid_exp$;
