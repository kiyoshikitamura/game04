const fs=require('fs'),assert=require('assert/strict'),ts=require('typescript');
const source=fs.readFileSync('supabase/functions/game04-redesign-api/source.ts','utf8');
const fn=source.slice(source.indexOf('async function runBattle('),source.indexOf('\nDeno.serve'));
const js=ts.transpileModule(fn,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
class ApiError extends Error{constructor(message,status=400){super(message);this.status=status;}}
let state,record,receipts,simulations;
const stage={id:'qa-stage',encounterChance:0,designId:'1-1'};
function reset(){state={userId:'qa',version:1,cash:50,energy:8,clearedStages:[],questClearCounts:{}};record={id:'battle',user_id:'qa',status:'started',kind:'quest',target_id:stage.id,seed:1,input:{settlementPolicy:'playback-confirm-v1-20260927',questMasterVersion:'formal',questSnapshot:stage,party:[],rules:{}}};receipts=new Map();simulations=0;}
const dependencies={ApiError,simulateBattle:()=>{simulations++;return {outcome:'win',frames:[],seed:1}},uuidFor:async id=>id,
 db:async query=>query.includes('user_id=eq.other')?[]:[structuredClone(record)],
 stateFor:async()=>structuredClone(state),responseFor:async(user,extra)=>({state:structuredClone(state),...extra}),
 commit:async(before,after,id,battle)=>{if(receipts.has(id))return structuredClone(receipts.get(id));assert.equal(before.version,state.version);state={...structuredClone(after),version:state.version+1};record={...record,status:battle.status,result:structuredClone(battle.result)};const r={state:structuredClone(state),battleResult:structuredClone(battle.result)};receipts.set(id,r);return r;},
 QUEST_MASTER_VERSION:'formal',GROWTH_VERSION:'growth',questVictoryRewards:()=>({rewards:[{kind:'cash',amount:100}],firstClear:true,count:1,encounterRoll:1}),rewardPolicy:async()=>({}),grantReward:(s,r)=>({...s,cash:s.cash+r.amount}),recordEarlyQuestClear:(before,after)=>after,recordMissionEvent:s=>s,progressionActivities:()=>[],
};
const run=new Function(...Object.keys(dependencies),js+';return runBattle;')(...Object.values(dependencies));
(async()=>{
 reset();const preview=await run('qa','quest_battle',{},'battle','QA');assert(preview.battle.pendingSettlementId);assert.deepEqual(preview.rewards,[]);assert.equal(state.cash,50);assert.equal(record.status,'started');
 const retired=await run('qa','battle_finish',{},'battle','QA','retire');assert(retired.retired);assert.equal(state.energy,8);assert.equal(state.cash,50);assert.deepEqual(state.clearedStages,[]);
 const simulationCount=simulations;const delayed=await run('qa','battle_finish',{},'battle','QA','complete');assert(delayed.retired);assert.equal(simulations,simulationCount);assert.equal(state.cash,50);assert.equal(receipts.size,1);
 reset();const complete=await run('qa','battle_finish',{},'battle','QA','complete');assert.equal(complete.state.cash,150);assert.deepEqual(state.clearedStages,['qa-stage']);await run('qa','battle_finish',{},'battle','QA','complete');assert.equal(state.cash,150);assert.equal(receipts.size,1);
 reset();const race=await Promise.all([run('qa','battle_finish',{},'battle','QA','retire'),run('qa','battle_finish',{},'battle','QA','complete')]);assert(race.every(r=>r.retired));assert.equal(state.cash,50);assert.equal(receipts.size,1);
 reset();await assert.rejects(run('other','battle_finish',{},'battle','QA','retire'),/見つかりません/);
 console.log('PASS deferred rewards; retire retains start energy cost; late completion/retry/race cannot grant; completion once; foreign owner denied');
})().catch(error=>{console.error(error);process.exitCode=1});
