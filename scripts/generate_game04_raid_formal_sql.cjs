const fs=require('node:fs');
const ts=require('typescript');
require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true,target:ts.ScriptTarget.ES2022}}).outputText,file);
const {FORMAL_CASTLES,createFormalInvasionMaster}=require('../src/domain/redesign/raidInvasionMaster.ts');
const masters=FORMAL_CASTLES.map(c=>createFormalInvasionMaster(c.id,()=>0));
const sql=`-- GAME04 dev only. Preserve all existing assets, rooms, snapshots and host progress.
do $raid_formal$
declare cfg jsonb; raids jsonb := $masters$${JSON.stringify(masters)}$masters$::jsonb; castles jsonb := $castles$${JSON.stringify(FORMAL_CASTLES)}$castles$::jsonb; c jsonb; destinations jsonb; d jsonb;
begin
 select data into cfg from public.game04_redesign_master where key='territory' for update;
 if cfg is null then raise exception 'TERRITORY_MASTER_MISSING'; end if;
 cfg:=jsonb_set(cfg,'{version}','"GAME04_RAID_FORMAL_20260923"');
 cfg:=jsonb_set(cfg,'{levels}',(select jsonb_agg(value||'{"hostingSlots":1}'::jsonb) from jsonb_array_elements(cfg->'levels')));
 cfg:=jsonb_set(cfg,'{raidMasters}',coalesce((select jsonb_agg(value) from jsonb_array_elements(cfg->'raidMasters') where value->>'id' not in ('TI01','TI02','TI03','TI04','TI05')),'[]'::jsonb)||raids);
 destinations:=cfg->'destinations';
 for c in select value from jsonb_array_elements(castles) loop
  if exists(select 1 from jsonb_array_elements(destinations) where value->>'castle'=c->>'name') then
   select jsonb_agg(case when value->>'castle'=c->>'name' then value||jsonb_build_object('raidMasterId',c->>'id','itemName','侵攻令','itemCount',1,'durationMinutes',4320) else value end) into destinations from jsonb_array_elements(destinations);
  else
   d:=jsonb_build_object('id',c->>'id','name',(c->>'name')||'への侵攻','castle',c->>'name','difficulty','正式12段階','itemSource','交換所・報酬','raidMasterId',c->>'id','requiredLevel',1,'itemName','侵攻令','itemId','raid_unlock','itemCount',1,'durationMinutes',4320,'clearExp',0,'unavailableReason','主催解放条件・主催者EXPの設定待ち');
   destinations:=destinations||jsonb_build_array(d);
  end if;
 end loop;
 cfg:=jsonb_set(cfg,'{destinations}',destinations);
 perform public.game04_validate_territory_master(cfg);
 update public.game04_redesign_master set data=cfg where key='territory';
end $raid_formal$;
`;
fs.writeFileSync('scripts/game04_raid_formal_master.sql',sql);
console.log('Generated formal invasion master SQL: 5 castles; existing host policy preserved.');
