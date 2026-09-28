-- Current GAME04 dev function snapshot; no user rows or migration replay.
begin;
CREATE OR REPLACE FUNCTION public.game04_capture_named_asset_item()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare delta integer; kind text; manifest jsonb; i integer; event_id text;
begin
 delta:=new.quantity-case when tg_op='INSERT' then 0 else old.quantity end;
 if delta<=0 then return new; end if;
 select data into manifest from public.game04_redesign_master where key='release_manifest';
 if exists(select 1 from jsonb_array_elements(coalesce(manifest->'characters','[]'::jsonb)) m where m->>'id'=new.item_id) then kind:='character';
 elsif exists(select 1 from jsonb_array_elements(coalesce(manifest->'skills','[]'::jsonb)) m where m->>'id'=new.item_id) then kind:='skill';
 else return new; end if;
 for i in 1..delta loop
  event_id:='item_asset:'||gen_random_uuid();
  insert into public.game04_acquisition_events(id,user_id,payload) values(event_id,new.user_id,jsonb_build_object('id',event_id,'kind',kind,'masterId',new.item_id));
 end loop;
 return new;
end $function$
;
CREATE OR REPLACE FUNCTION public.game04_commit_growth_state(p_user_id uuid, p_expected_version bigint, p_state jsonb, p_cash_delta bigint, p_energy_delta integer, p_request_id uuid, p_battle jsonb DEFAULT NULL::jsonb, p_raid jsonb DEFAULT NULL::jsonb, p_raid_expected_version bigint DEFAULT NULL::bigint, p_receipt jsonb DEFAULT '{}'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare u public.users%rowtype; prior jsonb; before_progress jsonb; next_progress jsonb; v_result jsonb;
 current_exp integer; current_level integer; next_exp integer; next_level integer; expected_exp integer; expected_level integer;
 gain integer; energy_delta integer:=p_energy_delta; energy_limit integer; saved_input jsonb;
begin
 select * into u from public.users where id=p_user_id for update;
 if not found then raise exception 'GAME_USER_NOT_FOUND'; end if;
 select r.result into prior from public.game04_requests r where r.user_id=p_user_id and r.request_id=p_request_id;
 if found then return prior; end if;
 before_progress:=public.game04_get_growth_state(p_user_id)->'playerProgress';
 -- get_state can apply natural recovery; use the actual locked balance for refill, never stack refill deltas.
 select * into u from public.users where id=p_user_id;
 next_progress:=p_state->'playerProgress';
 if next_progress->>'status'='active' then
  if before_progress->>'status' is distinct from 'active' or next_progress->>'version' is distinct from 'APPROVED_GROWTH_V1_20260921' then raise exception 'PLAYER_GROWTH_MIGRATION_REQUIRED'; end if;
  current_exp:=(before_progress->>'exp')::integer; current_level:=(before_progress->>'level')::integer;
  next_exp:=(next_progress->>'exp')::integer; next_level:=(next_progress->>'level')::integer;
  if next_exp is null or next_level is null or next_exp<current_exp or next_level<current_level or next_level>100 then raise exception 'PLAYER_GROWTH_INVALID'; end if;
  if next_exp<>current_exp or next_level<>current_level then
   if p_battle->>'status' is distinct from 'settled' or p_battle#>>'{result,battle,outcome}' is distinct from 'win' then raise exception 'PLAYER_EXP_QUEST_ONLY'; end if;
   select b.input into saved_input from public.game04_battles b where b.id=(p_battle->>'id')::uuid and b.user_id=p_user_id and b.status='started' and (
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
   );
   if saved_input is null or saved_input->'playerExpReward' is null then raise exception 'PLAYER_EXP_SNAPSHOT_REQUIRED'; end if;
   gain:=(saved_input#>>'{playerExpReward,amount}')::integer;
   if gain is null or gain<0 then raise exception 'PLAYER_EXP_INVALID'; end if;
   expected_exp:=case when current_level>=100 then current_exp else least(public.game04_growth_cumulative_exp(100),current_exp::bigint+gain)::integer end;
   select max(l) into expected_level from generate_series(current_level,100) l where public.game04_growth_cumulative_exp(l)<=expected_exp;
   if next_exp<>expected_exp or next_level<>expected_level then raise exception 'PLAYER_GROWTH_INVALID'; end if;
   if next_level>current_level then
    select (data->>'energyMax')::integer into energy_limit from public.game04_redesign_master where key='runtime';
    energy_delta:=greatest(0,energy_limit-u.vitality);
    p_battle:=jsonb_set(p_battle,'{result,playerGrowth,energyRecovered}',to_jsonb(energy_delta));
    p_battle:=jsonb_set(p_battle,'{result,playerGrowth,energy}',to_jsonb(u.vitality+energy_delta));
   end if;
  end if;
 end if;
 v_result:=public.game04_commit_state(p_user_id,p_expected_version,p_state,p_cash_delta,energy_delta,p_request_id,p_battle,p_raid,p_raid_expected_version);
 if next_progress->>'status'='active' then
  update public.users set level=next_level,xp=next_exp-public.game04_growth_cumulative_exp(next_level) where id=p_user_id;
 end if;
 v_result:=v_result||jsonb_build_object('state',public.game04_get_growth_state(p_user_id),'receipt',coalesce(p_receipt,'{}'::jsonb));
 if p_battle->>'status'='settled' then v_result:=v_result||jsonb_build_object('battleResult',p_battle->'result'); end if;
 update public.game04_requests set result=v_result where user_id=p_user_id and request_id=p_request_id;
 return v_result;
end $function$
;
CREATE OR REPLACE FUNCTION public.game04_commit_shop_exchange(p_user_id uuid, p_expected_version bigint, p_state jsonb, p_before_diamonds integer, p_diamond_cost integer, p_cash_delta bigint, p_request_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare u public.users%rowtype; prior jsonb; old_state jsonb; old_version bigint; result jsonb;
 paid_total bigint; remaining_paid bigint; take_qty bigint; segment jsonb; paid_segments jsonb:='[]';
 lot public.billing_asset_lots; item text; reward_qty bigint; energy_delta bigint; unlock_delta bigint;
 cumulative bigint:=0; previous_alloc bigint:=0; allocated bigint; pid uuid; source_kind text;
begin
 select * into u from public.users where id=p_user_id for update;
 if not found then raise exception 'GAME_USER_NOT_FOUND';end if;
 select r.result into prior from public.game04_requests r where r.user_id=p_user_id and r.request_id=p_request_id;
 if found then return prior;end if;
 if p_diamond_cost is null or p_diamond_cost<0 or p_diamond_cost>5000
 or p_before_diamonds is null or (p_state->>'diamonds')::integer is distinct from p_before_diamonds-p_diamond_cost then
  raise exception 'INVALID_EXCHANGE_COST';end if;
 update public.users set neon_diamonds=neon_diamonds where id=p_user_id returning * into u;
 if u.neon_diamonds<>p_before_diamonds then raise exception 'STATE_CONFLICT' using errcode='40001';end if;
 if u.neon_diamonds<p_diamond_cost then raise exception 'INSUFFICIENT_RESOURCE';end if;
 select state,version into old_state,old_version from public.game04_player_state where user_id=p_user_id for update;
 if not found then raise exception 'STATE_NOT_INITIALIZED';end if;
 if old_version is distinct from p_expected_version then raise exception 'STATE_CONFLICT' using errcode='40001';end if;
 if p_diamond_cost>0 then
  energy_delta:=coalesce((p_state->>'energyDrinks')::bigint,0)-coalesce((old_state->>'energyDrinks')::bigint,0);
  unlock_delta:=coalesce((p_state#>>'{materials,unlock}')::bigint,0)-coalesce((old_state#>>'{materials,unlock}')::bigint,0);
  if energy_delta between 1 and 10 and unlock_delta=0 and p_cash_delta=0 and p_diamond_cost=50*energy_delta then
   item:='ENERGY_DRINK';reward_qty:=energy_delta;source_kind:='GAME04_PAID_FORMAL';
  elsif unlock_delta=1 and energy_delta=0 and p_cash_delta=0 and p_diamond_cost=100 then
   item:='RAID_UNLOCK_TICKET';reward_qty:=1;source_kind:='GAME04_PAID_FORMAL';
  elsif energy_delta=0 and unlock_delta=0 and p_diamond_cost in (300,500,1000,3000,5000) and p_cash_delta=p_diamond_cost::bigint*10 then
   item:='CASH';reward_qty:=p_cash_delta;source_kind:='GAME04_PAID_DERIVED';
  else raise exception 'INVALID_EXCHANGE_REWARD';end if;
  select coalesce(sum(remaining_quantity),0) into paid_total from public.billing_asset_lots
   where user_id=p_user_id and item_id='DIAMOND' and claimed_at is not null and remaining_quantity>0 and expires_at>statement_timestamp();
  -- Match billing_apply_lot_delta: free first, then earliest paid expiry.
  remaining_paid:=greatest(0,p_diamond_cost-greatest(0,u.neon_diamonds-paid_total));
  for lot in select * from public.billing_asset_lots where user_id=p_user_id and item_id='DIAMOND'
   and claimed_at is not null and remaining_quantity>0 and expires_at>statement_timestamp() order by expires_at,id for update loop
   exit when remaining_paid=0;take_qty:=least(remaining_paid,lot.remaining_quantity);
   paid_segments:=paid_segments||jsonb_build_array(jsonb_build_object('id',lot.id,'order',lot.order_id,'quantity',take_qty,'issued',lot.issued_at,'expiry',lot.expires_at));
   remaining_paid:=remaining_paid-take_qty;
  end loop;
  if remaining_paid<>0 then raise exception 'PAID_LOT_SOURCE_MISMATCH';end if;
 end if;
 update public.users set neon_diamonds=neon_diamonds-p_diamond_cost where id=p_user_id;
 -- Existing state/receipt transaction and CAS guard; failures also roll back DIA expiry/debit.
 result:=public.game04_commit_growth_state(p_user_id,p_expected_version,p_state,p_cash_delta,0,p_request_id,
  p_receipt=>jsonb_build_object('gameplayMeasurement',jsonb_build_object('contractVersion','game04-gameplay-v1','action','shop_exchange','stateVersionBefore',p_expected_version,'stateVersionAfter',p_expected_version+1,'diamondCost',p_diamond_cost)));
 -- Inventory has already been granted above. These CLAIMED presents are provenance only.
 -- New lots are inserted after state commit, so that grant cannot consume its own newly issued lot.
 for segment in select value from jsonb_array_elements(paid_segments) loop
  cumulative:=cumulative+(segment->>'quantity')::bigint;
  allocated:=ceil(reward_qty::numeric*cumulative/p_diamond_cost)::bigint-previous_alloc;
  previous_alloc:=previous_alloc+allocated;
  if allocated>0 then
   insert into public.presents(user_id,item_id,quantity,message,status,expire_at,claimed_at,source_kind,source_metadata)
   values(p_user_id,item,allocated,'輝石交換','CLAIMED',(segment->>'expiry')::timestamptz,clock_timestamp(),source_kind,
    jsonb_build_object('game04PaidVersion','APPROVED_GROWTH_V1_20260921','funding','paid','orderId',segment->>'order','sourceLotId',segment->>'id','exchangeRequestId',p_request_id)) returning id into pid;
   insert into public.billing_asset_lots(order_id,user_id,present_id,item_id,issued_quantity,remaining_quantity,issued_at,expires_at,source_lot_id,claimed_at)
   values((segment->>'order')::uuid,p_user_id,pid,item,allocated,allocated,(segment->>'issued')::timestamptz,(segment->>'expiry')::timestamptz,(segment->>'id')::uuid,clock_timestamp());
  end if;
 end loop;
 return result;
end $function$
;
CREATE OR REPLACE FUNCTION public.game04_host_formal_territory(p_user_id uuid, p_request_id uuid, p_destination_id text, p_raid_master jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
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
 if coalesce((context#>>'{progress,unlocked}')::boolean,false) is not true then raise exception 'TERRITORY_FEATURE_LOCKED'; end if;
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
end $function$
;
CREATE OR REPLACE FUNCTION public.game04_host_territory(p_user_id uuid, p_request_id uuid, p_destination_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
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
 if coalesce((context#>>'{progress,unlocked}')::boolean,false) is not true then raise exception 'TERRITORY_FEATURE_LOCKED'; end if;
 if (context#>>'{progress,level}')::integer<(d->>'requiredLevel')::integer then raise exception 'TERRITORY_LEVEL_REQUIRED'; end if;
 select (value->>'hostingSlots')::integer into slots from jsonb_array_elements(cfg->'levels') where (value->>'level')::integer=(context#>>'{progress,level}')::integer;
 if (context->>'activeHostingCount')::integer>=slots then raise exception 'TERRITORY_HOSTING_SLOTS_FULL'; end if;
 available:=coalesce((context->'items'->>(d->>'itemId'))::integer,0);
 if available<(d->>'itemCount')::integer then raise exception 'TERRITORY_ITEM_REQUIRED'; end if;
 select value||jsonb_build_object('durationMinutes',d->'durationMinutes') into boss from jsonb_array_elements(cfg->'raidMasters') where value->>'id'=d->>'raidMasterId';
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
 result:=result||jsonb_build_object('receipt',jsonb_build_object('gameplayMeasurement',jsonb_build_object('contractVersion','game04-gameplay-v1','action','territory_host','stateVersionBefore',s.version,'stateVersionAfter',s.version+1)));
 insert into public.game04_requests(user_id,request_id,result) values(p_user_id,p_request_id,result);
 return result;
end $function$
;
revoke all on function public.game04_capture_named_asset_item(),public.game04_commit_growth_state(uuid,bigint,jsonb,bigint,integer,uuid,jsonb,jsonb,bigint,jsonb),public.game04_commit_shop_exchange(uuid,bigint,jsonb,integer,integer,bigint,uuid),public.game04_host_formal_territory(uuid,uuid,text,jsonb),public.game04_host_territory(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.game04_capture_named_asset_item(),public.game04_commit_growth_state(uuid,bigint,jsonb,bigint,integer,uuid,jsonb,jsonb,bigint,jsonb),public.game04_commit_shop_exchange(uuid,bigint,jsonb,integer,integer,bigint,uuid),public.game04_host_formal_territory(uuid,uuid,text,jsonb),public.game04_host_territory(uuid,uuid,text) to service_role;
drop trigger if exists game04_named_asset_acquisition on public.user_items;
create trigger game04_named_asset_acquisition after insert or update on public.user_items for each row execute function public.game04_capture_named_asset_item();
commit;

