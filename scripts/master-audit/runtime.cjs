const fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),Module=require('node:module');
const root=path.resolve(__dirname,'../..');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
const resolve=Module._resolveFilename;Module._resolveFilename=function(n,...args){return resolve.call(this,n.startsWith('@/')?path.join(root,'src',n.slice(2)):n,...args)};
const req=n=>require(path.join(root,'src/domain/redesign',n+'.ts'));
const json=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const clean=v=>JSON.parse(JSON.stringify(v));
const keyed=(rows,key='id')=>{const out={};for(const r of rows){const k=typeof key==='function'?key(r):r[key];if(!k||Object.hasOwn(out,k))throw Error('missing/duplicate ID '+k);out[k]=r;}return out};
function collect(){
 const m=req('masters'),f=req('formalOwnedSkills'),gm=req('growthMaster'),bi=req('balanceV2Masters'),qi=req('questMaster'),ri=req('raidInvasionMaster'),t=req('territory'),l=req('loginBonus'),v=req('vip');
 const cat=require(path.join(root,'src/server/billing/catalog.ts'));
 return clean({
 characters:keyed(m.CHARACTER_MASTERS.map(c=>({...c,stats:undefined,levels:Object.fromEntries(Array.from({length:100},(_,i)=>[i+1,m.getCharacterStats(c,i+1,0)])),passives:Object.fromEntries(Array.from({length:6},(_,i)=>[i,bi.getCharacterPassive(c,i)??null]))}))),
 skills:keyed(f.FORMAL_SKILL_IDS.flatMap(id=>Array.from({length:11},(_,lb)=>({lb,...f.getFormalOwnedSkill(id,lb)}))),r=>r.id+':'+r.lb),
 equipment:keyed(m.EQUIPMENT_MASTERS.map(e=>({...e,levels:Object.fromEntries(Array.from({length:100},(_,i)=>[i+1,m.getEquipmentStats(e,i+1,0)]))}))),
 quests:keyed(qi.FORMAL_QUEST_STAGES),encounters:keyed(req('raidFormalMaster').FORMAL_ENCOUNTER_MASTERS),
 invasions:keyed(ri.FORMAL_CASTLES.flatMap(c=>[0,.5,.999999].map(draw=>({draw,...ri.createFormalInvasionMaster(c.id,()=>draw)}))),r=>r.id+':'+r.draw),
 territoryPolicy:{levels:t.TERRITORY_HOST_LEVELS,castles:t.TERRITORY_CASTLE_HOST_POLICY,unlockStageId:t.TERRITORY_UNLOCK_STAGE_ID,version:t.TERRITORY_HOST_POLICY_VERSION},
 missions:keyed(req('formalMissions').FORMAL_MISSION_CONFIG.missions),
 login:keyed(Array.from({length:30},(_,i)=>({id:String(i+1),...l.loginBonusForDay(i+1)}))),vip:v.VIP_PRODUCT,
 shop:req('shop').SHOP_EXCHANGE_OPTIONS,billing:{packs:cat.PAID_PACKS,diamonds:cat.DIA_PRODUCTS,vip:cat.VIP_CATALOG_PRODUCT},
 growth:{version:gm.GROWTH_VERSION,expValues:gm.EXP_VALUES,soulUnlock:gm.SOUL_UNLOCK,awakening:gm.AWAKENING_SOULS,lbSteps:gm.LB_STEPS,skillLbFactors:gm.SKILL_LB_FACTORS,equipmentLbFactors:gm.EQUIPMENT_LB_FACTORS,duplicates:gm.DUPLICATE_SKILL_MATERIALS,totals:gm.EXP_TOTALS,rows:['character','equipment'].flatMap(kind=>['N','R','SR','SSR'].flatMap(rarity=>Array.from({length:100},(_,i)=>({kind,rarity,level:i+1,exp:gm.cumulativeExp(kind,rarity,i+1),cash:gm.cumulativeCash(kind,rarity,i+1)})))),playerExp:Array.from({length:100},(_,i)=>gm.playerCumulativeExp(i+1))},
 battleRules:m.BATTLE_RULES,acquisition:req('acquisitions').APPROVED_ACQUISITION_MASTER,
 initial:m.createInitialState('AUDIT_NEW_USER'),
 formalGacha:fs.existsSync(path.join(root,'src/domain/redesign/data/formalGachaMaster.json'))?json('src/domain/redesign/data/formalGachaMaster.json'):null,
 items:json('src/domain/gameplay/canonical/data/items_20260822.json'),
 });
}
module.exports={collect,req,json,clean,keyed,root};
if(require.main===module)fs.writeFileSync(process.argv[2],JSON.stringify(collect(),null,2)+'\n');
