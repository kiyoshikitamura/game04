const fs=require('node:fs');
const ts=require('typescript');
require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true,target:ts.ScriptTarget.ES2022}}).outputText,file);
const {FORMAL_CASTLES,createFormalInvasionMaster}=require('../src/domain/redesign/raidInvasionMaster.ts');
const {TERRITORY_HOST_POLICY_VERSION,TERRITORY_UNLOCK_STAGE_ID,TERRITORY_HOST_LEVELS,TERRITORY_CASTLE_HOST_POLICY}=require('../src/domain/redesign/territory.ts');
const masters=FORMAL_CASTLES.map(c=>createFormalInvasionMaster(c.id,()=>0));
const sql=`-- GAME04 dev only. Preserve all existing assets, rooms, snapshots and host progress.
do $raid_formal$
declare cfg jsonb; raids jsonb := $masters$${JSON.stringify(masters)}$masters$::jsonb; castles jsonb := $castles$${JSON.stringify(FORMAL_CASTLES)}$castles$::jsonb; policies jsonb := $policies$${JSON.stringify(TERRITORY_CASTLE_HOST_POLICY)}$policies$::jsonb; c jsonb; policy jsonb; destinations jsonb := '[]'::jsonb; d jsonb; previous_id text;
begin
 select data into cfg from public.game04_redesign_master where key='territory' for update;
 if cfg is null then raise exception 'TERRITORY_MASTER_MISSING'; end if;
 cfg:=cfg||jsonb_build_object('version','${TERRITORY_HOST_POLICY_VERSION}','status','PREVIEW_PROVISIONAL','unlockStageId','${TERRITORY_UNLOCK_STAGE_ID}','initialExp',0,'legacyMigrationExp',0,'levelCap',10);
 cfg:=jsonb_set(cfg,'{levels}',$levels$${JSON.stringify(TERRITORY_HOST_LEVELS)}$levels$::jsonb);
 cfg:=jsonb_set(cfg,'{raidMasters}',coalesce((select jsonb_agg(value) from jsonb_array_elements(cfg->'raidMasters') where value->>'id' not in ('TI01','TI02','TI03','TI04','TI05')),'[]'::jsonb)||raids);
 for c in select value from jsonb_array_elements(castles) loop
  select value into policy from jsonb_array_elements(policies) where value->>'id'=c->>'id';
  select value->>'id' into previous_id from jsonb_array_elements(cfg->'destinations') where value->>'castle'=c->>'name';
  d:=jsonb_build_object('id',coalesce(previous_id,c->>'id'),'name',(c->>'name')||'への侵攻','castle',c->>'name','difficulty','正式12段階','itemSource','交換所・報酬','raidMasterId',c->>'id','requiredLevel',policy->'requiredLevel','itemName','侵攻令','itemId','raid_unlock','itemCount',1,'durationMinutes',4320,'clearExp',policy->'clearExp');
  destinations:=destinations||jsonb_build_array(d);
 end loop;
 cfg:=jsonb_set(cfg,'{destinations}',destinations);
 perform public.game04_validate_territory_master(cfg);
 update public.game04_redesign_master set data=cfg,status='PREVIEW_PROVISIONAL_20260923' where key='territory';
end $raid_formal$;
`;
fs.writeFileSync('scripts/game04_raid_formal_master.sql',sql);
console.log('Generated formal invasion master SQL: 5 castles; provisional host policy adopted; existing progress and snapshots preserved.');
