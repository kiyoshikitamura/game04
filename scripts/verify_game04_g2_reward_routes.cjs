// Producer coverage: selected formal reward -> real grantReward inventory destination.
// Does not prove authenticated transactions or browser acceptance.
const fs=require('node:fs'),assert=require('node:assert/strict'),ts=require('typescript');
require.extensions['.ts']=(module,name)=>module._compile(ts.transpileModule(fs.readFileSync(name,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,name);
const base='../src/domain/redesign/';
const {createInitialState,grantReward}=require(base+'masters.ts');
const {FORMAL_QUEST_STAGES}=require(base+'questMaster.ts');
const {FORMAL_MISSION_CONFIG}=require(base+'formalMissions.ts');
const {FORMAL_ENCOUNTER_MASTERS}=require(base+'raidFormalMaster.ts');
const {FORMAL_CASTLES,createFormalInvasionMaster}=require(base+'raidInvasionMaster.ts');
const {loginBonusForDay}=require(base+'loginBonus.ts');
const {APPROVED_ACQUISITION_MASTER}=require(base+'acquisitions.ts');
const {emptyGrowthInventory}=require(base+'growthMaster.ts');
const families={};
for(const s of FORMAL_QUEST_STAGES) families[`quest:${s.id}`]=[...s.rewards,...s.firstRewards,...['SPECIAL_TICKET_CHARACTER','SPECIAL_TICKET_SKILL','SPECIAL_TICKET_EQUIPMENT'].map(id=>({kind:'ticket',id,amount:1})),...s.soulDrops];
for(const m of FORMAL_MISSION_CONFIG.missions.filter(m=>m.enabled)) families[`mission:${m.id}`]=m.rewards;
for(const m of FORMAL_ENCOUNTER_MASTERS)families[`encounter:${m.id}`]=[...m.participationRewards,...m.victoryRewards,...m.defeatRewards];
for(const c of FORMAL_CASTLES){const m=createFormalInvasionMaster(c.id,()=>0);families[`invasion:${c.id}`]=[...m.victoryRewards,...m.stages.flatMap(s=>s.defeatRewards)];}
for(let d=1;d<=30;d++)families[`login:${d}`]=loginBonusForDay(d).rewards;
const counts={},kinds={};let rows=0;
for(const [source,rewards]of Object.entries(families))for(const r of rewards){
 const original=createInitialState('domain-coverage');original.growthInventory=emptyGrowthInventory();original.characters=[];original.skills=[];original.equipment=[];
 const before=structuredClone(original),after=grantReward(original,r,`route:${source}:${rows++}`,APPROVED_ACQUISITION_MASTER);
 assert.deepEqual(original,before,`${source} mutated input`);
 let path;
 if(['character','skill','equipment'].includes(r.kind)){
  const target={character:'characters',skill:'skills',equipment:'equipment'}[r.kind];
  assert.equal(after[target].filter(x=>(x.masterId??x.id)===r.id).length,r.amount,`${source} acquisition missing`);
  counts[source.split(':')[0]]=(counts[source.split(':')[0]]??0)+1;kinds[r.kind]=(kinds[r.kind]??0)+1;continue;
 }
 switch(r.kind){
 case 'cash':path=['cash'];break;
 case 'character_exp_item':case 'equipment_exp_item':path=['growthInventory','expItems',r.kind==='character_exp_item'?'character':'equipment',r.id];break;
 case 'generic_soul':case 'soul_selector':path=['growthInventory',r.kind==='generic_soul'?'genericSouls':'soulSelectors',r.id];break;
 case 'soul':path=['souls',r.id];break;
 case 'ticket':path=['questTicketGrants',r.id];break;
 case 'skill_material':path=['materials','skill'];break;
 case 'equipment_lb':path=['materials','equipmentLb'];break;
 case 'unlock_item':path=['materials','unlock'];break;
 default:throw Error(`Unhandled formal producer ${source}: ${r.kind}`);
 }
 const get=s=>path.reduce((a,k)=>a?.[k],s)??0;
 assert.equal(get(after)-get(before),r.amount,`${source}/${r.kind}/${r.id} wrong destination`);
 if(['character_exp_item','equipment_exp_item','generic_soul','soul_selector'].includes(r.kind))assert.deepEqual(after.materials,before.materials,`${source} contaminated legacy material`);
 counts[source.split(':')[0]]=(counts[source.split(':')[0]]??0)+1;
 kinds[r.kind]=(kinds[r.kind]??0)+1;
}
console.log(JSON.stringify({status:'PASS',scope:'DOMAIN ONLY: formal producer reward rows reach exact inventory; quantities/chance authority and DB/browser acceptance are separate',producers:Object.keys(families).length,rows,counts,kinds},null,2));
