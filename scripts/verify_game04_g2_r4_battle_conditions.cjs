// R02/R03: formal playable master inputs; local simulation is not live acceptance.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
const resolve=Module._resolveFilename;Module._resolveFilename=function(n,p,...r){return resolve.call(this,n.startsWith('@/')?path.resolve(__dirname,'../src',n.slice(2)):n,p,...r)};
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
const {createInitialState,buildBattleParty,BATTLE_RULES}=require('../src/domain/redesign/masters.ts');
const {FORMAL_QUEST_STAGES,createQuestBattleInput}=require('../src/domain/redesign/questMaster.ts');
const {simulateBattle}=require('../src/domain/redesign/battle.ts');
const {FORMAL_ENCOUNTER_MASTERS}=require('../src/domain/redesign/raidFormalMaster.ts');
const {createRaidRoom,applyRaidAction}=require('../src/domain/redesign/raid.ts');
const {APPROVED_ACQUISITION_MASTER}=require('../src/domain/redesign/acquisitions.ts');
const out=path.resolve(__dirname,'../docs/verification/g2-20260925/r4');fs.mkdirSync(out,{recursive:true});
const state=createInitialState('DEDICATED_QA_USER_ID');state.characters.forEach(c=>c.level=30);state.skills=[{id:'SKD071',level:1}];state.deck=state.characters.map((c,i)=>({characterId:c.id,skillIds:i===4?['SKD071']:[],equipment:{}}));
const results=[];
for(const [stageId,category] of [['kai-4','debuff'],['echigo-6','dot']])for(const seed of [7,11,23,47]){
 const stage=FORMAL_QUEST_STAGES.find(s=>s.id===stageId),input=createQuestBattleInput(seed,buildBattleParty(state),stage,BATTLE_RULES),r=simulateBattle(input);
 const cleared=r.frames.filter(f=>f.event==='cleanse'&&f.skillId==='SKD071'&&f.reason===category&&/ [1-9]件解除/.test(f.text));assert(cleared.length,`${stageId}/${seed} must reach target condition`);
 for(const f of cleared){const prev=r.frames[f.index-1];for(const id of f.targetIds){const before=prev.party.find(p=>p.id===id),after=f.party.find(p=>p.id===id),types=category==='debuff'?['atk_down','def_down']:['dot'];assert.equal(before.statuses.filter(s=>types.includes(s.type)).length-after.statuses.filter(s=>types.includes(s.type)).length,1);}}
 const action=r.frames.find(f=>f.event==='action_start'&&f.skillId==='SKD071');assert(action);assert.equal(input.party[4].skills[0].spCost,139);
 results.push({stageId,seed,outcome:r.outcome,spCost:139,cleared:cleared.map(f=>({index:f.index,text:f.text,targetIds:f.targetIds,reason:f.reason}))});
}
const owner=createInitialState('DEDICATED_QA_OWNER_ID');owner.energy=100;const guest={...structuredClone(owner),userId:'DEDICATED_QA_GUEST_ID'};
const now=Date.UTC(2026,8,25),master=FORMAL_ENCOUNTER_MASTERS[0],room=createRaidRoom(master.id,owner.userId,'DEDICATED_QA_ROOM_UUID',now);
const joined=applyRaidAction(room,guest,'raid_join',{name:'G2 QA participant'},now);assert.equal(joined.room.participants.length,2);assert.deepEqual(joined.state,guest);assert.deepEqual(applyRaidAction(joined.room,guest,'raid_join',{},now).room,joined.room);
let current=joined.room,currentState=guest;const damage=Math.ceil(master.sharedHp/(master.victoryMultiplier*3));
for(let n=1;n<=3;n++){const payload={battleId:`fixture-battle-${n}`,battleLevel:1,result:{outcome:'win',totalDamage:damage}};const settled=applyRaidAction(current,currentState,'raid_battle',payload,now,APPROVED_ACQUISITION_MASTER);assert.equal(settled.state.energy,currentState.energy-master.energyCost);assert.deepEqual(applyRaidAction(settled.room,settled.state,'raid_battle',payload,now,APPROVED_ACQUISITION_MASTER),{...settled,rewards:[]});current=settled.room;currentState=settled.state;if(n<3)assert.equal(current.rewardGrants.length,0);}
assert.equal(current.status,'defeated');assert.equal(current.rewardGrants.length,1);assert.equal(current.rewardGrants[0].userId,guest.userId);const claimed=applyRaidAction(current,currentState,'raid_claim',{},now,APPROVED_ACQUISITION_MASTER);assert(claimed.room.rewardGrants.every(g=>g.claimed));assert.deepEqual(applyRaidAction(claimed.room,claimed.state,'raid_claim',{},now,APPROVED_ACQUISITION_MASTER),claimed);
const fixture={scope:'Dedicated QA setup only; do not replace existing user holdings wholesale. Merge character level/skill/deck fields into a new QA; preserve actual userId/version.',characterPatches:state.characters.map(c=>({id:c.id,level:c.level})),skill:{id:'SKD071',level:1},deck:state.deck,requests:[{action:'quest_battle',payload:{stageId:'kai-4'}},{action:'quest_battle',payload:{stageId:'echigo-6'}}],formalEncounter:{masterId:master.id,sharedHp:master.sharedHp,energyCost:master.energyCost,room:{...room,createdAt:'REPLACE_WITH_CURRENT_ISO',expiresAt:'REPLACE_WITH_CURRENT_PLUS_60_MIN_ISO',rescueWindowStartedAt:'REPLACE_WITH_CURRENT_ISO'}},raidRequests:[{action:'raid_join',payload:{roomId:'DEDICATED_QA_ROOM_UUID'}},{action:'raid_battle',payload:{roomId:'DEDICATED_QA_ROOM_UUID'}},{action:'raid_claim',payload:{roomId:'DEDICATED_QA_ROOM_UUID'}}]};
fs.writeFileSync(path.join(out,'r02-r03-qa-fixture.json'),JSON.stringify(fixture,null,2)+'\n');
const evidence={status:'PASS',scope:'Local formal-input simulations and synthetic raid transitions, not live API/DB acceptance',skills:results,raid:{masterId:master.id,checks:['join adds one participant without cost; duplicate join stable','one charge per new battle; settlement replay stable','third win grants eligible guest only; idle owner ineligible','claim and repeat claim inventory stable'],sharedHp:master.sharedHp,syntheticBattleDamage:damage}};
fs.writeFileSync(path.join(out,'r02-r03-local-evidence.json'),JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify({status:evidence.status,skillCases:results.length,raidChecks:evidence.raid.checks.length,masterId:master.id,sharedHp:master.sharedHp},null,2));
