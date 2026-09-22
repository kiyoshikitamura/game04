import assert from 'node:assert/strict';
import fs from 'node:fs';
import {QUEST_AREAS,QUEST_STAGES,getQuestStage,isQuestStageUnlocked,nextQuestStage} from '../src/domain/redesign/quests';
import {createQuestBattleInput,questEnergyCost,questVictoryRewards,QUEST_ID_MAPPING,QUEST_MASTER_VERSION} from '../src/domain/redesign/questMaster';
import {createInitialState,grantReward,BATTLE_RULES,buildBattleParty} from '../src/domain/redesign/masters';
import {APPROVED_ACQUISITION_MASTER} from '../src/domain/redesign/acquisitions';
import {TERRITORY_MASTER} from '../src/domain/redesign/territory';
import {simulateBattle} from '../src/domain/redesign/battle';
import {evaluateMissions} from '../src/domain/redesign/missions';
const read=(p:string)=>JSON.parse(fs.readFileSync(p,'utf8'));
const approved=read('docs/product/balance_audits_20260922/round17_effective62.json');
const end=JSON.parse(fs.readFileSync('docs/product/balance_audits_20260922/endgame_approved_handoff.md','utf8').match(/```json\r?\n([\s\S]*?)\r?\n```/)![1]);
const normalize=(waves:unknown)=>JSON.parse(JSON.stringify(waves,(key,value)=>key==='image'?'':value));
assert.deepEqual(QUEST_AREAS.map(a=>a.stages.length),[3,4,5,5,6,6,8,8,10,10]);
assert.equal(QUEST_ID_MAPPING.filter(r=>r.disposition==='same_area_and_index').length,57);
assert.equal(QUEST_ID_MAPPING.filter(r=>r.disposition==='new_stage').length,8);
assert.equal(QUEST_ID_MAPPING.filter(r=>r.disposition==='retain_legacy_record_no_formal_target').length,13);
let state=createInitialState('00000000-0000-4000-8000-000000000001');
const party=buildBattleParty(state);
const summary={stages:65,enemies:0,inputMatches:0,routeCaptures:0,progression:0,rewardTotals:{SR:0,SSR:0,C:0,S:0,E:0,orders:0,exp:0},checks:[] as string[]};
for(const stage of QUEST_STAGES){
  const wanted=approved.stages.find((s:any)=>s.stage===stage.designId)?.waves??end.waves[stage.designId];
  const input=createQuestBattleInput(1,party,stage,BATTLE_RULES);
  assert.deepEqual(normalize(input.waves),wanted,stage.designId);
  summary.inputMatches++;summary.enemies+=input.waves.flat().length;
  assert.equal(nextQuestStage(state.clearedStages).id,stage.id);
  assert.ok(isQuestStageUnlocked(stage.id,state.clearedStages));
  assert.equal(questEnergyCost(stage,state),0);
  state.questAttempts={...state.questAttempts,[stage.id]:1};assert.equal(questEnergyCost(stage,state),1);
  const result=questVictoryRewards(stage,state,party,1);assert.ok(result.firstClear);
  const expItems=stage.rewards.filter(r=>r.kind.endsWith('_exp_item'));assert.ok(expItems.length>=2);
  state.clearedStages.push(stage.id);state.questClearCounts={...state.questClearCounts,[stage.id]:result.count};
  assert.equal(questEnergyCost(stage,state),stage.energyCost);
  assert.equal(questVictoryRewards(stage,state,party,1).firstClear,false);
  for(const r of stage.firstRewards){
    if(r.kind==='ticket')summary.rewardTotals[r.id==='SPECIAL_TICKET_CHARACTER'?'C':r.id==='SPECIAL_TICKET_SKILL'?'S':'E']+=r.amount;
    if(r.kind==='unlock_item')summary.rewardTotals.orders+=r.amount;
    if(r.kind==='soul')summary.rewardTotals[stage.soulDrops.find(d=>d.id===r.id)!.rarity as 'SR'|'SSR']+=r.amount;
  }
  summary.rewardTotals.exp+=stage.playerExp;
  summary.progression++;
}
assert.deepEqual(summary.rewardTotals,{SR:240,SSR:160,C:40,S:50,E:30,orders:7,exp:7054});
assert.equal(isQuestStageUnlocked('mikawa-4',state.clearedStages),false);
assert.equal(isQuestStageUnlocked('kyoto-8',[]),false);
assert.ok(isQuestStageUnlocked('izumo-1',['izumo-1']),'previously cleared remains replayable');
assert.ok(!isQuestStageUnlocked('izumo-1',['kyoto-7']),'new 7-8 is not silently skipped');
const guarantee=getQuestStage('satsuma-5')!;
const atBoundary=questVictoryRewards(guarantee,{clearedStages:[guarantee.id],questClearCounts:{[guarantee.id]:99}},party,42);
assert.equal(atBoundary.guaranteed.length,2);
assert.deepEqual(atBoundary,questVictoryRewards(guarantee,{clearedStages:[guarantee.id],questClearCounts:{[guarantee.id]:99}},party,42));
for(let seed=1;seed<=1000;seed++)assert.ok(questVictoryRewards(guarantee,{clearedStages:[guarantee.id]},party,seed).rewards.filter(r=>r.kind==='ticket').length<=1);
const first=createInitialState('00000000-0000-4000-8000-000000000001');
const one=getQuestStage('mikawa-1')!;
const battle=simulateBattle(createQuestBattleInput(1,buildBattleParty(first),one,BATTLE_RULES));
assert.equal(battle.outcome,'win','actual first stage battle');
const victory=questVictoryRewards(one,first,buildBattleParty(first),1);
let rewarded=first;victory.rewards.forEach((reward,i)=>{rewarded=grantReward(rewarded,reward,`test:${i}`);});
assert.equal(rewarded.questTicketGrants?.SPECIAL_TICKET_SKILL,1);
assert.ok(rewarded.characters.some(c=>c.id===one.firstRewards.find(r=>r.kind==='character')?.id));
const mission=evaluateMissions({...state,clearedStages:QUEST_AREAS[0].stages.map(s=>s.id)}, {enabled:true,missions:[{id:'area1',name:'a',description:'',enabled:true,condition:{type:'area_clear',areaId:'mikawa'},rewards:[]}]});
assert.equal(mission[0].target,3);assert.equal(mission[0].status,'claimable');
summary.checks.push('65-stage progression','first/retry/repeat energy','fixed reward totals','guarantee boundary','single ticket draw','seed-stable rewards','actual 1-1 win and grant','mission area count','legacy IDs retained');

// Execute the actual bundled Edge handler with a strict in-memory transport. No network or live player mutation.
let handler:(r:Request)=>Promise<Response>;
let capture:any;
let apiState:any;
const originalFetch=globalThis.fetch;
(globalThis as any).Deno={env:{get:(key:string)=>key==='SUPABASE_URL'?'https://lrgyllgzcdcphlbmkknc.supabase.co':'test-only'},serve:(fn:any)=>{handler=fn;}};
globalThis.fetch=async(input:any,options:any)=>{
  const url=new URL(String(input));assert.equal(url.hostname,'lrgyllgzcdcphlbmkknc.supabase.co');
  const body=options?.body?JSON.parse(options.body):{};const path=url.pathname;
  let result:any;
  if(path==='/auth/v1/user')result={id:apiState.userId};
  else if(path.endsWith('/users'))result=[{id:apiState.userId,username:'test'}];
  else if(path.endsWith('/game04_battles'))result=[];
  else if(path.endsWith('/game04_acquisition_input'))result={legacy:{characters:[],skills:[],equipment:[]},events:[],master:APPROVED_ACQUISITION_MASTER};
  else if(path.endsWith('/game04_get_growth_state'))result=apiState;
  else if(path.endsWith('/game04_commit_growth_state')){
    if(body.p_battle?.status==='started'){capture=body;return new Response(JSON.stringify({message:'CAPTURE_ONLY'}),{status:400});}
    apiState={...body.p_state,version:apiState.version+1};result={state:apiState};
  }else throw new Error(`Unexpected API request ${path}`);
  return new Response(JSON.stringify(result));
};
const apiBundleUrl = new URL('../scratch/quest65-api.mjs', import.meta.url);
await import(apiBundleUrl.href);
for(const stage of QUEST_STAGES){
  apiState={...structuredClone(state),energy:100};capture=undefined;
  const response=await handler!(new Request('https://test.invalid',{method:'POST',headers:{Authorization:'Bearer test'},body:JSON.stringify({action:'quest_battle',payload:{stageId:stage.id},requestId:crypto.randomUUID()})}));
  assert.ok(capture,`${stage.designId}: ${await response.text()}`);
  const wanted=approved.stages.find((s:any)=>s.stage===stage.designId)?.waves??end.waves[stage.designId];
  assert.deepEqual(normalize(capture.p_battle.input.waves),wanted,`${stage.designId}: API input`);
  assert.equal(capture.p_battle.input.questMasterVersion,QUEST_MASTER_VERSION);
  assert.equal(capture.p_energy_delta,-stage.energyCost);
  summary.routeCaptures++;
}
globalThis.fetch=originalFetch;
fs.writeFileSync('docs/development/GAME04_QUEST65_ACCEPTANCE_20260922.json',JSON.stringify(summary,null,2)+'\n');
console.log(summary);
