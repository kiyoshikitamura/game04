const fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(m,n)=>m._compile(ts.transpileModule(fs.readFileSync(n,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,n);
const uid=JSON.parse(fs.readFileSync('.expiry-local/session.json')).user.id;
const s=require('../src/domain/redesign/masters.ts').createInitialState(uid);
s.energyDrinks=10;s.materials.unlock=10;s.materials.skill=10;s.materials.equipmentLb=10;
s.growthInventory=require('../src/domain/redesign/growthMaster.ts').emptyGrowthInventory();
s.growthInventory.expItems.character.xlarge=10;s.growthInventory.expItems.equipment.xlarge=10;s.growthInventory.soulSelectors.SSR=10;
s.tutorialComplete=true;s.energy=0;
fs.writeFileSync('.expiry-local/initial-state.json',JSON.stringify(s));
fs.writeFileSync('.expiry-local/fixture.sql',`begin;
insert into public.users(id,username,cash,neon_diamonds,vitality) values('${uid}','期限検証QA',10,10,0);
insert into public.game04_player_state(user_id,state) values('${uid}','${JSON.stringify(s).replaceAll("'","''")}'::jsonb);
with added as (insert into public.kpi_subjects(source_user_id,registered_at,registration_type) values('${uid}',now(),'anonymous') returning subject_id)
insert into public.kpi_account_classification_periods(subject_id,classification,valid_from,reason) select subject_id,'qa',now(),'expiry-verification-20260927' from added;
insert into public.game04_redesign_master(key,data) values('paid_expiry_preview_qa',jsonb_build_object('userIds',jsonb_build_array('${uid}'),'fixtureTag','expiry-verification-20260927'));
insert into public.billing_products(id,title,amount_jpy,items,validity_days) values('GAME04_EXPIRY_QA_20260927','期限処理専用QA',1,'[]',120);
do $test$
declare uid uuid:='${uid}';oid uuid:=gen_random_uuid();pid uuid;item text;path text[];kind integer;due timestamptz:=statement_timestamp()+interval '90 seconds';
begin
 insert into public.billing_orders(id,user_id,request_id,product_id,amount_jpy,product_snapshot,status,granted_at,billing_mode) values(oid,uid,gen_random_uuid(),'GAME04_EXPIRY_QA_20260927',1,'{"fixtureTag":"expiry-verification-20260927","revenue":false,"validity_days":120,"scope":"QA_NOT_STRIPE"}','GRANTED',now(),'sandbox');
 perform set_config('request.jwt.claim.sub',uid::text,true);
 foreach item in array array['ENERGY_DRINK','RAID_UNLOCK_TICKET','SKILL_LB_PART','EQUIP_LB_PART','CHAR_EXP_XL','EQUIP_EXP_XL','SOUL_SELECTOR_SSR','CASH','DIAMOND','SPECIAL_TICKET_CHARACTER','SPECIAL_TICKET_SKILL','SPECIAL_TICKET_EQUIPMENT'] loop
  path:=public.game04_paid_item_path(item);
  if path is null and item not in('CASH','DIAMOND') then insert into public.user_items(user_id,item_id,quantity) values(uid,item,10);end if;
  for kind in 1..3 loop
   insert into public.presents(user_id,item_id,quantity,status,expire_at,source_kind,source_metadata,message) values(uid,item,case kind when 1 then 3 when 2 then 4 else 2 end,'UNCLAIMED',case kind when 2 then due+interval '1 day' else due end,case when path is null then 'GAME04_QA' else 'GAME04_PAID_FORMAL' end,'{"fixtureTag":"expiry-verification-20260927","funding":"paid","revenue":false}', '期限検証専用QA') returning id into pid;
   insert into public.billing_asset_lots(order_id,user_id,present_id,item_id,issued_quantity,remaining_quantity,issued_at,expires_at) select oid,uid,pid,item,quantity,quantity,expire_at-interval '120 days',expire_at from public.presents where id=pid;
   if kind<>3 then perform public.claim_present(pid);end if;
  end loop;
 end loop;
end $test$;
commit;
select min(expires_at) as due_at,count(*) as lots from public.billing_asset_lots where user_id='${uid}';`);
console.log('Dedicated QA fixture SQL prepared');
