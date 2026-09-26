/** Root-only execution: --run. No DB access, refill, enemy change or forced results. */
import fs from 'node:fs';import assert from 'node:assert/strict';import {api} from './raid-work-live.mjs';
const master=JSON.parse(fs.readFileSync('src/domain/redesign/data/quest65.json','utf8'));
const dir='docs/verification/raid-20260923',file=`${dir}/natural-invasion-live.json`;
async function run(){
 const session=JSON.parse(fs.readFileSync('/tmp/game04-work-live/RQAPolA.json','utf8')),uid=session.user.id;
 fs.mkdirSync(dir,{recursive:true});
 const report=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{version:1,status:'running',startedAt:new Date().toISOString(),conditions:'Pre-grown legal SR5 party is a QA prerequisite. Starting vitality50, PlayerLv1/EXP0, mino-5 cleared, hostLv2; no manual refill after start. Quest first-clear battles award real PlayerEXP and level-up energy. Formal enemies/snapshots unchanged. This verifies resource/API flow, not new-player balance.',steps:[],checks:[],pending:null};
 const save=()=>fs.writeFileSync(file,JSON.stringify(report,null,2));
 const call=async(action,payload={},id)=>{const r=await api(session,action,payload,id);assert.equal(r.status,200,JSON.stringify({action,status:r.status,error:r.data.error}));return r.data;};
 const room=d=>{const r=d.rooms.find(r=>r.id===report.roomId);assert.ok(r,'room returned');return r;};
 let data;
 try{
 data=await call('get_state');
 if(!report.baseline){assert.equal(data.state.playerProgress?.level,1);assert.equal(data.state.playerProgress?.exp,0);assert.ok(data.state.energy>=50&&data.state.energy<=51,'root initialized normal vitality50');assert.ok(data.state.energy<=data.state.energyMax);assert.equal(data.territory.level,2);assert.ok(data.state.clearedStages.includes('mino-5'));assert.equal(master.stages.length,65);report.baseline={energy:data.state.energy,energyMax:data.state.energyMax,playerProgress:data.state.playerProgress,hostExp:data.territory.experience,characters:data.state.characters,deck:data.state.deck,clearedStages:data.state.clearedStages};save();}
 if(!report.roomId){report.hostRequestId??=crypto.randomUUID();save();const hosted=await call('territory_host',{destinationId:'TI01'},report.hostRequestId);report.roomId=hosted.territoryRoomId;assert.ok(report.roomId);data=hosted;report.snapshot=room(data).territorySnapshot;assert.equal(report.snapshot.destination.clearExp,100);assert.equal(report.snapshot.raidMaster.stages.length,12);save();}
 function invariant(d){assert.deepEqual(room(d).territorySnapshot,report.snapshot);assert.equal(room(d).maxHp,report.snapshot.raidMaster.stages[room(d).level-1].sharedHp);assert.deepEqual(d.state.characters.filter(c=>report.baseline.characters.some(b=>b.id===c.id)),report.baseline.characters,'pre-grown party characters unchanged; quest rewards may unlock other characters');assert.deepEqual(d.state.deck,report.baseline.deck);assert.ok(d.state.energy<=d.state.energyMax,'no energy above normal cap');}
 invariant(data);
 async function step(action,payload,cost){
  if(!report.pending){const failures=report.steps.filter(s=>s.action===action&&s.target===(payload.stageId??report.roomId)&&(action!=='raid_battle'||s.startedRaidLevel===room(data).level)&&s.outcome!=='win');assert.ok(failures.length<3,'same-stage 3-failure ceiling already reached');report.pending={requestId:crypto.randomUUID(),action,payload,cost,beforeEnergy:data.state.energy,beforePlayer:structuredClone(data.state.playerProgress),startedAt:new Date().toISOString(),raidLevel:room(data).level};save();}
  const pending=report.pending;data=await call(pending.action,pending.payload,pending.requestId);invariant(data);
  const recovered=data.playerGrowth?.energyRecovered??0,expected=pending.beforeEnergy-pending.cost+recovered;
  const allowance=Math.ceil((Date.now()-Date.parse(pending.startedAt))/300000)+1;
  assert.ok(recovered>=0,'recovery nonnegative');assert.ok(data.state.energy>=expected&&data.state.energy<=Math.min(data.state.energyMax,expected+allowance),'energy must reconcile to debit + API level-up recovery + bounded natural recovery');
  if(pending.action==='raid_battle'){assert.deepEqual(data.state.playerProgress,pending.beforePlayer);assert.equal(recovered,0);assert.equal(data.playerGrowth?.gainedExp??0,0);}else if(data.battle.outcome==='win'){const q=master.stages.find(s=>s.id===pending.payload.stageId);assert.equal(data.playerGrowth?.gainedExp,q.playerExp,'formal quest PlayerEXP');assert.ok(data.state.clearedStages.includes(q.id));if(recovered>0)assert.ok(data.playerGrowth.level>data.playerGrowth.beforeLevel,'only level up restores energy');}
  const entry={requestId:pending.requestId,action:pending.action,target:pending.payload.stageId??report.roomId,startedRaidLevel:pending.raidLevel,endedRaidLevel:room(data).level,outcome:data.battle.outcome,damage:data.battle.totalDamage,raidHp:room(data).hp,raidStatus:room(data).status,cost:pending.cost,beforeEnergy:pending.beforeEnergy,energy:data.state.energy,energyRecovered:recovered,naturalRecovery:data.state.energy-expected,playerGrowth:data.playerGrowth??null,playerProgress:data.state.playerProgress,hostExp:data.territory.experience,firstClear:data.firstClear??false,at:new Date().toISOString()};
  if(!report.steps.some(s=>s.requestId===entry.requestId))report.steps.push(entry);report.pending=null;save();console.log(`${report.steps.length} ${entry.action} ${pending.payload.stageId??entry.startedRaidLevel}: ${entry.outcome} E=${entry.energy} recovered=${recovered} raidLv=${entry.endedRaidLevel} HP=${entry.raidHp}`);
  if(room(data).status==='active')assert.equal(data.territory.experience,report.baseline.hostExp,'no interim host EXP');
  const sameFailures=report.steps.filter(s=>s.action===entry.action&&s.target===entry.target&&(entry.action!=='raid_battle'||s.startedRaidLevel===entry.startedRaidLevel)&&s.outcome!=='win');
  assert.ok(sameFailures.length<3,`3 failures at ${entry.action} ${entry.action==='raid_battle'?entry.startedRaidLevel:entry.target}; stop without altering party/enemies/energy`);
 }
 if(report.pending)await step(report.pending.action,report.pending.payload,report.pending.cost);
 while(room(data).status==='active'){
  const raidSteps=report.steps.filter(s=>s.action==='raid_battle'),questSteps=report.steps.filter(s=>s.action==='quest_battle');
  if(data.state.energy>=20){assert.ok(raidSteps.length<50,'raid 50-attempt ceiling');await step('raid_battle',{roomId:report.roomId},20);continue;}
  assert.ok(questSteps.length<100,'quest 100-attempt ceiling');
  const cleared=data.state.clearedStages;
  const candidate=master.stages.find((s,index)=>!cleared.includes(s.id)&&(index===0||cleared.includes(master.stages[index-1].id)));
  assert.ok(candidate,'no unlocked uncleared quest remains to restore energy');
  const cost=(data.state.questAttempts?.[candidate.id]??0)>0?1:0;
  assert.ok(data.state.energy>=cost,'insufficient energy for paid retry; stop, never refill');
  await step('quest_battle',{stageId:candidate.id},cost);
 }
 assert.equal(room(data).status,'defeated');assert.equal(room(data).level,12);assert.equal(room(data).hp,0);
 assert.deepEqual([...new Set(report.steps.filter(s=>s.action==='raid_battle').map(s=>s.startedRaidLevel))].sort((a,b)=>a-b),Array.from({length:12},(_,i)=>i+1));
 assert.equal(data.territory.experience,report.baseline.hostExp+100);assert.ok(report.steps.some(s=>s.energyRecovered>0));
 const beforeReload=room(data);data=await call('get_state');invariant(data);assert.deepEqual(room(data),beforeReload);
 const claimed=await call('raid_claim',{roomId:report.roomId});const again=await call('raid_claim',{roomId:report.roomId});for(const key of ['cash','souls','materials','growthInventory','skills','equipment','characters','territoryItems'])assert.deepEqual(again.state[key],claimed.state[key]);assert.equal(again.territory.experience,claimed.territory.experience);
 report.status='pass';report.pass=true;report.finishedAt=new Date().toISOString();report.checks=['12 formal invasion stages with untouched snapshot','normal starting energy50; no manual refill API or DB operation','real first-clear quest PlayerEXP and level-up recovery','per-action energy debit/recovery ledger','host EXP100 once; invasion PlayerEXP0','reload and claim replay'];report.summary={raidBattles:report.steps.filter(s=>s.action==='raid_battle').length,questBattles:report.steps.filter(s=>s.action==='quest_battle').length,totalEnergyCost:report.steps.reduce((n,s)=>n+s.cost,0),totalLevelUpRecovery:report.steps.reduce((n,s)=>n+s.energyRecovered,0),totalObservedNaturalRecovery:report.steps.reduce((n,s)=>n+s.naturalRecovery,0),finalEnergy:again.state.energy,finalPlayerProgress:again.state.playerProgress,finalHostExp:again.territory.experience};save();console.log(JSON.stringify({pass:true,roomId:report.roomId,...report.summary}));
 }catch(error){report.status='failed';report.pass=false;report.error=error.message;report.blockedState=data?{energy:data.state.energy,energyMax:data.state.energyMax,playerProgress:data.state.playerProgress,clearedStages:data.state.clearedStages,raid:data.rooms?.find(r=>r.id===report.roomId)?{level:room(data).level,hp:room(data).hp,maxHp:room(data).maxHp,status:room(data).status}:null}:null;save();throw error;}
}
if(process.argv.includes('--run'))await run();
