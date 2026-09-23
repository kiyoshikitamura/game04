/** Root executes --run. Cooperation continuation, never modifies DB/energy/enemies. */
import fs from 'node:fs';import assert from 'node:assert/strict';import {api} from './raid-work-live.mjs';
const dir='docs/verification/raid-20260923',priorPath=`${dir}/natural-invasion-live.json`,outPath=`${dir}/natural-rescue-live.json`;
async function run(){
 const prior=JSON.parse(fs.readFileSync(priorPath,'utf8')),roomId=prior.roomId;
 const sessions=Object.fromEntries([['host','RQAPolA'],['helperB','RQAPolB'],['helperOwner','owner']].map(([role,name])=>[role,JSON.parse(fs.readFileSync(`/tmp/game04-work-live/${name}.json`,'utf8'))]));
 assert.equal(new Set(Object.values(sessions).map(s=>s.user.id)).size,3);
 const report=fs.existsSync(outPath)?JSON.parse(fs.readFileSync(outPath,'utf8')):{status:'running',roomId,priorEvidence:priorPath,conditions:'Continuation after solo attempt reached final stage and stopped at quest 9-1 three losses. Pre-grown SR5/no equipment/no active skills remain QA prerequisites. Two helpers use their existing normal energy <=50, at most two battles each; no manual energy refill. This is cooperative resource/API flow evidence, not solo/balance/visual acceptance.',startedAt:new Date().toISOString(),baselines:{},battles:[],checks:[]};
 const save=()=>fs.writeFileSync(outPath,JSON.stringify(report,null,2));
 const call=async(role,action,payload={},id)=>{const r=await api(sessions[role],action,payload,id);assert.equal(r.status,200,JSON.stringify({role,action,status:r.status,error:r.data.error}));return r.data;};
 const room=d=>{const r=d.rooms.find(r=>r.id===roomId);assert.ok(r,'ongoing/ended room returned');return r;};
 const me=(role,d)=>room(d).participants.find(p=>p.userId===sessions[role].user.id);
 const snapshot=d=>assert.deepEqual(room(d).territorySnapshot,prior.snapshot,'formal snapshot unchanged');
 const assets=s=>Object.fromEntries(['cash','diamonds','souls','materials','growthInventory','characters','skills','equipment','territoryItems'].map(k=>[k,s[k]]));
 let current;
 try{
 current=await call('host','get_state');snapshot(current);assert.equal(room(current).level,12);
 if(!report.baselines.host){assert.equal(room(current).status,'active');assert.equal(room(current).hp,prior.blockedState.raid.hp);report.baselines.host={hostExp:current.territory.experience,playerProgress:current.state.playerProgress,energy:current.state.energy,wins:me('host',current).wins};assert.ok(report.baselines.host.wins>=3);save();}
 for(const role of ['helperB','helperOwner'])if(!report.baselines[role]){const d=await call(role,'get_state');assert.ok(d.state.energy<=50&&d.state.energy>=20,`${role} needs existing normal 20..50 energy; never refill`);report.baselines[role]={energy:d.state.energy,energyMax:d.state.energyMax,hostExp:d.territory.experience,playerProgress:d.state.playerProgress,orders:d.state.materials.unlock,characters:d.state.characters,deck:d.state.deck};save();}
 report.rescueRequestId??=crypto.randomUUID();save();
 if(!report.rescueSent){await call('host','raid_rescue',{roomId},report.rescueRequestId);report.rescueSent=true;save();}
 report.joinIds??={};
 if(room(current).status==='active')for(const role of ['helperB','helperOwner']){report.joinIds[role]??=crypto.randomUUID();save();const joined=await call(role,'raid_join',{roomId},report.joinIds[role]);assert.equal(joined.state.materials.unlock,report.baselines[role].orders);}
 for(const role of ['helperB','helperOwner']){
  current=await call('host','get_state');if(room(current).status!=='active'&&report.pending?.role!==role)continue;
  report.joinIds??={};report.joinIds[role]??=crypto.randomUUID();save();let d=await call(role,'get_state');snapshot(d);
  assert.equal(d.state.materials.unlock,report.baselines[role].orders,'rescue needs no invasion order');
  while((room(d).status==='active'||report.pending?.role===role)&&report.battles.filter(b=>b.role===role).length<2){
   assert.ok(report.pending?.role===role||d.state.energy>=20,`${role} energy shortage; stop without refill`);
   report.pending??={role,requestId:crypto.randomUUID(),beforeEnergy:d.state.energy,beforeAt:Date.now()};assert.equal(report.pending.role,role);save();
   const p=report.pending;d=await call(role,'raid_battle',{roomId},p.requestId);snapshot(d);assert.equal(room(d).level,12);assert.equal(room(d).maxHp,prior.snapshot.raidMaster.stages[11].sharedHp);
   const natural=d.state.energy-(p.beforeEnergy-20),allowance=Math.ceil((Date.now()-p.beforeAt)/300000)+1;
   assert.ok(natural>=0&&natural<=allowance,'20 energy spent plus bounded natural recovery');assert.ok(d.state.energy<=50);assert.equal(d.playerGrowth?.gainedExp??0,0);assert.equal(d.playerGrowth?.energyRecovered??0,0);assert.deepEqual(d.state.playerProgress,report.baselines[role].playerProgress);
   assert.equal(d.territory.experience,report.baselines[role].hostExp,'helper earns no host EXP');assert.equal(d.state.materials.unlock,report.baselines[role].orders);assert.deepEqual(d.state.characters,report.baselines[role].characters);assert.deepEqual(d.state.deck,report.baselines[role].deck);
   assert.ok(me(role,d).wins<=2);assert.equal(room(d).rewardGrants.filter(g=>g.userId===sessions[role].user.id).length,0,'less than 3 wins earns no defeat grant');
   const entry={role,requestId:p.requestId,outcome:d.battle.outcome,damage:d.battle.totalDamage,level:room(d).level,hp:room(d).hp,status:room(d).status,beforeEnergy:p.beforeEnergy,energy:d.state.energy,naturalRecovery:natural,wins:me(role,d).wins,hostExp:d.territory.experience,orders:d.state.materials.unlock,playerProgress:d.state.playerProgress,at:new Date().toISOString()};
   if(!report.battles.some(b=>b.requestId===p.requestId))report.battles.push(entry);report.pending=null;save();console.log(`${role} ${report.battles.filter(b=>b.role===role).length}/2 ${entry.outcome} HP=${entry.hp} energy=${entry.energy}`);
  }
 }
 current=await call('host','get_state');snapshot(current);assert.equal(room(current).status,'defeated','helpers max four battles exhausted without completion');assert.equal(room(current).hp,0);assert.equal(current.territory.experience,report.baselines.host.hostExp+100);assert.deepEqual(current.state.playerProgress,report.baselines.host.playerProgress);assert.ok(me('host',current).wins>=3);
 const claimed=await call('host','raid_claim',{roomId}),again=await call('host','raid_claim',{roomId});assert.deepEqual(assets(again.state),assets(claimed.state));assert.equal(again.territory.experience,claimed.territory.experience);const reload=await call('host','get_state');assert.deepEqual(assets(reload.state),assets(again.state));assert.deepEqual(room(reload),room(again));
 for(const role of ['helperB','helperOwner']){const d=await call(role,'get_state');assert.equal(d.territory.experience,report.baselines[role].hostExp);assert.equal(d.state.materials.unlock,report.baselines[role].orders);assert.deepEqual(d.state.playerProgress,report.baselines[role].playerProgress);assert.ok(d.state.energy<=50);const participant=me(role,d);if(participant){assert.ok(participant.wins<=2);assert.equal(room(d).rewardGrants.filter(g=>g.userId===sessions[role].user.id).length,0);}}
 report.status='pass';report.pass=true;report.finishedAt=new Date().toISOString();report.checks=['original solo natural-resource evidence retained without rewriting its stop','host rescue and helper joins without order consumption','helpers max2 battles each; normal energy debit ledger; no PlayerEXP/hostEXP','cooperative final defeat and host EXP100 once','helpers below3 wins receive no defeat reward','host claim twice and reload keep assets/EXP unchanged'];report.final={status:room(reload).status,level:room(reload).level,hp:room(reload).hp,hostExp:reload.territory.experience,hostEnergy:reload.state.energy,hostWins:me('host',reload).wins,helperBattles:report.battles.length};save();console.log(JSON.stringify({pass:true,roomId,...report.final}));
 }catch(error){report.status='failed';report.pass=false;report.error=error.message;save();throw error;}
}
if(process.argv.includes('--run'))await run();
