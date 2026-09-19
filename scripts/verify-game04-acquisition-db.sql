-- Run ONLY after migration on lrgyllgzcdcphlbmkknc. Every test mutation rolls back.
begin;
do $$
declare u uuid; item text; equip_id uuid; req uuid:=gen_random_uuid(); c text; n integer; cfg jsonb;
begin
 u:='67ee9a06-6d41-4858-8de4-b634e982c67e';
 select equipment_id into item from public.equipment_battle_master limit 1;
 if u is null then raise exception 'Need one existing test user with equipment'; end if;
 select state->'characters'->0->>'id' into c from public.game04_player_state where user_id=u;
 if c is null then raise exception 'Need character for duplicate receipt fixture'; end if;
 select public.game04_acquisition_input(u) into cfg;
 if cfg->'legacy' is null or cfg->'master' is null then raise exception 'Input contract missing'; end if;
 insert into public.user_equipments(user_id,equipment_id,level,plus_val,random_options) values(u,item,1,0,'[]') returning id into equip_id;
 select count(*) into n from public.game04_acquisition_events where id='asset:equipment:'||equip_id;
 if n<>1 then raise exception 'Equipment capture failure'; end if;
 insert into public.gacha_execution_history(user_id,request_id,gacha_id,payment_source,pull_count,cost_amount,pity_before,pity_after) values(u,req,'CHAR_NORMAL','cash',2,0,0,0);
 update public.gacha_execution_history set status='COMPLETED',completed_at=now(),result_payload=jsonb_build_object('results',jsonb_build_array(jsonb_build_object('type','CHARACTER','character_id',c,'outcome','awakening_progress'),jsonb_build_object('type','CHARACTER','character_id',c,'outcome','converted'))) where user_id=u and request_id=req;
 select count(*) into n from public.game04_acquisition_events where id like 'receipt:gacha_execution_history:'||u||':'||req||':%';
 if n<>2 then raise exception 'Duplicate and cap capture failure'; end if;
 update public.gacha_execution_history set completed_at=now() where user_id=u and request_id=req;
 select count(*) into n from public.game04_acquisition_events where id like 'receipt:gacha_execution_history:'||u||':'||req||':%';
 if n<>2 then raise exception 'Receipt replay duplicated'; end if;
 if exists(select 1 from public.game04_legacy_asset_snapshot where user_id=u and assets::text like '%'||equip_id||'%') then raise exception 'Snapshot must not include post-cutover acquisition'; end if;
 raise notice 'PASS: insert capture, duplicate/cap receipt, replay, snapshot boundary';
end $$;
rollback;
