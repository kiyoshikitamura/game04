-- Independent regression for RV01. Parent executes on GAME04 dev only.
-- Dedicated QA account only; all fixtures and state changes roll back.
begin;
do $$
declare
 uid uuid := 'd6dabf02-3eb2-430e-8352-561f8d735469';
 base_state jsonb; bad_state jsonb; actual_state jsonb; base_version bigint; actual_version bigint;
 case_row record; pid uuid; rejected boolean; err text; present_status text; n integer:=0;
begin
 perform 1 from public.users where id=uid and username='G2QA薬F' for update;
 if not found then raise exception 'DEDICATED_QA_NOT_FOUND'; end if;
 select state,version into base_state,base_version from public.game04_player_state where user_id=uid for update;
 if not found then raise exception 'QA_STATE_NOT_FOUND'; end if;
 perform set_config('request.jwt.claim.sub',uid::text,true);
 perform set_config('request.jwt.claims',jsonb_build_object('sub',uid,'role','authenticated')::text,true);
 -- Temporary normalized inventory only to isolate each malformed ancestor.
 base_state:=base_state||jsonb_build_object('materials',coalesce(base_state->'materials','{}'::jsonb),
  'growthInventory','{"expItems":{"character":{"small":0,"medium":0,"large":0,"xlarge":0},"equipment":{"small":0,"medium":0,"large":0,"xlarge":0}},"carryExp":{"character":0,"equipment":0},"genericSouls":{"N":0,"R":0,"SR":0,"SSR":0},"soulSelectors":{"N":0,"R":0,"SR":0,"SSR":0}}'::jsonb);
 for case_row in select * from (values
  ('materials array','SKILL_LB_PART',array['materials'],'[]'::jsonb),
  ('materials scalar','EQUIP_LB_PART',array['materials'],'0'::jsonb),
  ('materials null','SKILL_LB_PART',array['materials'],'null'::jsonb),
  ('inventory array','CHAR_EXP_M',array['growthInventory'],'[]'::jsonb),
  ('inventory scalar','CHAR_EXP_M',array['growthInventory'],'0'::jsonb),
  ('inventory null','CHAR_EXP_M',array['growthInventory'],'null'::jsonb),
  ('exp parent array','CHAR_EXP_M',array['growthInventory','expItems'],'[]'::jsonb),
  ('exp parent null','EQUIP_EXP_M',array['growthInventory','expItems'],'null'::jsonb),
  ('character scalar','CHAR_EXP_M',array['growthInventory','expItems','character'],'0'::jsonb),
  ('character array','CHAR_EXP_M',array['growthInventory','expItems','character'],'[]'::jsonb),
  ('selector null','SOUL_SELECTOR_N',array['growthInventory','soulSelectors'],'null'::jsonb),
  ('selector array','SOUL_SELECTOR_N',array['growthInventory','soulSelectors'],'[]'::jsonb),
  ('generic scalar','GENERIC_SOUL_SR',array['growthInventory','genericSouls'],'7'::jsonb),
  ('quantity string','CHAR_EXP_M',array['growthInventory','expItems','character','medium'],'"2"'::jsonb),
  ('quantity null','ENERGY_DRINK',array['energyDrinks'],'null'::jsonb),
  ('quantity array','ENERGY_DRINK',array['energyDrinks'],'[]'::jsonb)
 ) as c(label,item,path,value) loop
  bad_state:=jsonb_set(base_state,case_row.path,case_row.value,true);
  update public.game04_player_state set state=bad_state,version=base_version where user_id=uid;
  pid:=gen_random_uuid();
  insert into public.presents(id,user_id,item_id,quantity,status,source_kind,source_metadata)
  values(pid,uid,case_row.item,2,'UNCLAIMED','GAME04_QA','{"game04RewardVersion":"APPROVED_GROWTH_V1_20260921","funding":"free","qaFixture":"G2_RV01_ROLLBACK"}');
  rejected:=false; err:=null;
  begin
   perform public.claim_present(pid);
  exception when others then rejected:=true; err:=sqlerrm;
  end;
  if not rejected or err not in ('INVALID_INVENTORY_STRUCTURE','INVALID_INVENTORY_QUANTITY') then
   raise exception 'Expected inventory rejection: %, actual %',case_row.label,coalesce(err,'SUCCESS');
  end if;
  select state,version into actual_state,actual_version from public.game04_player_state where user_id=uid;
  select status into present_status from public.presents where id=pid;
  if actual_state is distinct from bad_state or actual_version is distinct from base_version or present_status is distinct from 'UNCLAIMED' then
   raise exception 'Failed claim mutated state/present: %',case_row.label;
  end if;
  n:=n+1;
 end loop;
 raise notice 'PASS RV01: % malformed parent/quantity cases rejected; state/version and UNCLAIMED preserved',n;
 -- RV02: JSON null version must not pass SQL three-valued <> comparison.
 update public.game04_player_state set state=base_state,version=base_version where user_id=uid;
 pid:=gen_random_uuid();
 insert into public.presents(id,user_id,item_id,quantity,status,source_kind,source_metadata)
 values(pid,uid,'CHAR_EXP_M',2,'UNCLAIMED','GAME04_QA','{"game04RewardVersion":null,"funding":"free","qaFixture":"G2_RV02_ROLLBACK"}');
 rejected:=false; err:=null;
 begin
  perform public.claim_present(pid);
 exception when others then rejected:=true; err:=sqlerrm;
 end;
 if not rejected or err is distinct from 'UNSUPPORTED_FORMAL_PRESENT_SOURCE' then
  raise exception 'Expected NULL version rejection; actual %',coalesce(err,'SUCCESS');
 end if;
 select state,version into actual_state,actual_version from public.game04_player_state where user_id=uid;
 select status into present_status from public.presents where id=pid;
 if actual_state is distinct from base_state or actual_version is distinct from base_version or present_status is distinct from 'UNCLAIMED' then
  raise exception 'NULL version mutated state/present';
 end if;
 raise notice 'PASS RV02: NULL formal version rejected; state/version and UNCLAIMED preserved';
end $$;
rollback;
