const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
const resolve=Module._resolveFilename;Module._resolveFilename=function(n,p,...r){return resolve.call(this,n.startsWith('@/')?path.resolve(__dirname,'../src',n.slice(2)):n,p,...r)};
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
const home=require('../src/domain/redesign/home.ts');
const {QUEST_AREAS}=require('../src/domain/redesign/quests.ts');
const {SSR_HOME_BACKGROUNDS}=require('../src/domain/redesign/approvedBackgrounds.ts');
const {createInitialState}=require('../src/domain/redesign/masters.ts');
const {loginBoardRewards,loginBoardStatus}=require('../src/domain/presentation/formalLoginBoard.ts');
const {loginBonusForDay,nextLoginBonus,LOGIN_BONUS_VERSION}=require('../src/domain/redesign/loginBonus.ts');
assert.equal(home.HOME_BACKGROUNDS.length,21);
assert(!home.HOME_BACKGROUNDS.some(b=>b.id==='castle-approach'));
for(const id of [undefined,'bg_default','castle-approach','invalid','castle-town','bg_kabukicho'])assert.equal(home.resolveHomeBackground(id).id,'castle-town');
for(const b of home.HOME_BACKGROUNDS)assert.equal(home.resolveHomeBackground(b.id).id,b.id);
const unlocked=[SSR_HOME_BACKGROUNDS[2].id];
const cleared=QUEST_AREAS[0].stages.map(s=>s.id);
const sorted=home.sortedHomeBackgrounds(cleared,unlocked);
assert.deepEqual(sorted.slice(0,4).map(b=>b.id),['castle-town','area:mikawa','area:owari',unlocked[0]]);
assert(sorted.slice(4,12).every(b=>b.areaId));
const state=createInitialState('b07-check'),before=JSON.stringify(state);
assert.throws(()=>home.applyHomeSelection(state,{backgroundId:SSR_HOME_BACKGROUNDS[0].id}));
assert.equal(JSON.stringify(state),before);
assert.equal(home.resolveHomeBackground(home.applyHomeSelection(state,{backgroundId:'castle-approach'}).homeBackgroundId).id,'castle-town');
for(let day=1;day<=30;day++){
 const grant=loginBonusForDay(day),rows=loginBoardRewards(day);
 assert.deepEqual(rows.map(r=>r.amount),[...grant.rewards.map(r=>r.amount),...(grant.freeDiamonds?[grant.freeDiamonds]:[])]);
 for(const r of rows){assert(r.name&&!r.name.includes('×'));assert(r.image&&fs.existsSync(path.join(__dirname,'../public',r.image)));}
 assert.equal(loginBoardStatus(day,day),'本日');
}
assert.equal(loginBoardStatus(1,30),'受取済み');
assert.equal(loginBoardStatus(4,3),'次回');
assert.equal(loginBoardStatus(5,3),'未到達');
const progress={version:LOGIN_BONUS_VERSION,totalLogins:30,lastGrantedDate:'2026-09-25'};
const result=nextLoginBonus(progress,Date.parse('2026-09-26T01:00:00Z'));
assert.equal(result.progress.totalLogins,31);assert.equal(result.grant.day,1);
assert.equal(nextLoginBonus(result.progress,Date.parse('2026-09-26T01:01:00Z')).grant,null);
const report={initial:'castle-town',backgrounds:21,sort:sorted.map(b=>b.id),rewardDays:30,cycleAndDuplicateGrant:'pass',savePurity:'pass'};
fs.mkdirSync('docs/verification/device-debug/b07',{recursive:true});
fs.writeFileSync('docs/verification/device-debug/b07/domain-verification.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report));
