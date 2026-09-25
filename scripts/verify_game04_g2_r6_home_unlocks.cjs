const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
const resolve=Module._resolveFilename;Module._resolveFilename=function(n,p,...r){return resolve.call(this,n.startsWith('@/')?path.resolve(__dirname,'../src',n.slice(2)):n,p,...r)};
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
const {createInitialState,CHARACTER_MASTERS}=require('../src/domain/redesign/masters.ts');
const {SSR_HOME_BACKGROUNDS}=require('../src/domain/redesign/approvedBackgrounds.ts');
const {HOME_BACKGROUNDS,synchronizeHomeBackgroundUnlocks:sync,applyHomeSelection:select,isHomeBackgroundUnlocked:unlocked,resolveHomeBackground}=require('../src/domain/redesign/home.ts');
const {QUEST_AREAS,isQuestStageUnlocked}=require('../src/domain/redesign/quests.ts');
const state=createInitialState('r6-home-qa');state.characters=[];state.homeBackgroundId='bg_kabukicho';
assert.equal(SSR_HOME_BACKGROUNDS.length,10);assert.equal(new Set(SSR_HOME_BACKGROUNDS.map(x=>x.id)).size,10);
assert.equal(sync(state),state);
for(const b of SSR_HOME_BACKGROUNDS){
 assert(CHARACTER_MASTERS.some(c=>c.id===b.characterId&&c.rarity==='SSR'));
 assert(fs.existsSync('public'+b.image));
 const bg=HOME_BACKGROUNDS.find(x=>x.id===b.id);
 assert.equal(unlocked(bg,[]),false);assert.throws(()=>select(state,{backgroundId:bg.id}));
 const soulOnly={...state,souls:{[b.characterId]:1000}};assert.equal(sync(soulOnly),soulOnly);
 const owned={...state,characters:[{id:b.characterId,level:1,exp:0,awakening:0}]};const before=structuredClone(owned),after=sync(owned);
 assert.deepEqual(owned,before);assert.notEqual(after,owned);assert.deepEqual(after.unlockedHomeBackgroundIds,[b.id]);assert.equal(after.homeBackgroundId,state.homeBackgroundId);
 assert.equal(sync(after),after);assert.equal(unlocked(bg,[],after.unlockedHomeBackgroundIds),true);
 const chosen=select(after,{backgroundId:b.id});assert.equal(chosen.homeBackgroundId,b.id);
 const restored=JSON.parse(JSON.stringify(chosen));assert.deepEqual(sync(restored),restored);assert.equal(unlocked(bg,[],restored.unlockedHomeBackgroundIds),true);
 const duplicate={...chosen,characters:[...chosen.characters,...chosen.characters]};assert.equal(sync(duplicate),duplicate);
 const noLongerOwned={...chosen,characters:[]};assert.equal(sync(noLongerOwned),noLongerOwned);assert.equal(select(noLongerOwned,{backgroundId:b.id}).homeBackgroundId,b.id);
}
const all=sync({...state,characters:SSR_HOME_BACKGROUNDS.map(b=>({id:b.characterId,level:1,exp:0,awakening:0}))});assert.equal(all.unlockedHomeBackgroundIds.length,10);assert.equal(sync(all),all);assert.equal(all.homeBackgroundId,'bg_kabukicho');
assert.equal(resolveHomeBackground('bg_kabukicho').id,'castle-town');assert.equal(select(state,{backgroundId:'bg_kabukicho'}).homeBackgroundId,'bg_kabukicho');assert.throws(()=>select(state,{backgroundId:'unknown'}));
const stages=[];for(const area of QUEST_AREAS){const bg=HOME_BACKGROUNDS.find(b=>b.areaId===area.id);assert.equal(unlocked(bg,stages),isQuestStageUnlocked(area.stages[0].id,stages));stages.push(...area.stages.map(s=>s.id));}
console.log(JSON.stringify({status:'PASS',scope:'local SSR background domain contract, not API/DB or browser acceptance',ssr:10,checks:['locked rejection','souls do not unlock','existing owner and first acquisition','no input mutation','no-op same reference','permanent set after ownership change','duplicate and repeated synchronization','selection unchanged by unlock','JSON roundtrip','all ten','legacy IDs','area rules']}));
