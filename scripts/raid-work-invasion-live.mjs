/** CONDITIONED API integration verification only. Root runs --run after QA initialization.
 * Uses actual stored enemies/shared HP and server battle outcomes. No DB mutation/refill.
 */
import fs from 'node:fs';import assert from 'node:assert/strict';import {api} from './raid-work-live.mjs';
const ROOM='ce66da02-5a43-4e09-b1e2-a5feaf061e1b',dir='docs/verification/raid-20260923',file=`${dir}/invasion-live-results.json`;
async function run(){
 const session=JSON.parse(fs.readFileSync('/tmp/game04-work-live/RQAPolA.json','utf8')),uid=session.user.id;
 fs.mkdirSync(dir,{recursive:true});
 const report=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{roomId:ROOM,apiVersion:15,status:'running',conditions:'Dedicated QA initialized with SR5 Lv100 awakening5, no equipment/active skills, initial vitality1000. No refill during operations. Formal enemies/shared HP untouched. Conditioned API integration; not balance/visual acceptance.',battles:[],checks:[],startedAt:new Date().toISOString()};
 const save=()=>fs.writeFileSync(file,JSON.stringify(report,null,2));
 const call=async(action,payload={},id)=>{const r=await api(session,action,payload,id);assert.equal(r.status,200,JSON.stringify({action,status:r.status,error:r.data.error}));return r.data;};
 const room=d=>{const r=d.rooms.find(r=>r.id===ROOM);assert.ok(r,'room exists in API list/history');return r;};
 const me=d=>room(d).participants.find(p=>p.userId===uid);
 const assets=s=>({cash:s.cash,diamonds:s.diamonds,souls:s.souls,growthInventory:s.growthInventory,materials:s.materials,skills:s.skills,equipment:s.equipment,characters:s.characters,territoryItems:s.territoryItems});
 let data;
 try{
 data=await call('get_state');
 if(!report.baseline){assert.equal(room(data).level,1);assert.equal(room(data).status,'active');assert.equal(room(data).territorySnapshot.destination.clearExp,100);assert.equal(room(data).territorySnapshot.raidMaster.stages.length,12);assert.equal(data.territory.experience,0);report.baseline={room:room(data),energy:data.state.energy,energyMax:data.state.energyMax,playerProgress:data.state.playerProgress??null,hostExp:data.territory.experience,ownerId:uid};save();}
 const snapshot=report.baseline.room.territorySnapshot;
 const invariant=d=>{const r=room(d);assert.deepEqual(r.territorySnapshot,snapshot,'stored master snapshot must remain unchanged');assert.equal(r.maxHp,snapshot.raidMaster.stages[r.level-1].sharedHp,'stage shared HP must be formal snapshot value');assert.deepEqual(d.state.playerProgress??null,report.baseline.playerProgress,'invasion must not award PlayerEXP');assert.equal(d.playerGrowth?.gainedExp??0,0);};
 invariant(data);
 async function fight(level,kind){
  const before=data,prior=room(before),beforeTime=Date.now();
  const requestId=report.pending?.requestId??crypto.randomUUID();
  const payload=report.pending?.payload??{roomId:ROOM,level};
  if(report.pending){kind=report.pending.kind;level=payload.level;}
  report.pending={requestId,payload,kind};save();
  data=await call('raid_battle',payload,requestId);invariant(data);assert.ok(['win','lose','draw'].includes(data.battle.outcome),'real battle result present');
  // A checkpoint replay after interruption may already have charged before get_state.
  const existing=report.battles.some(b=>b.requestId===requestId);
  const chargedAlready=prior.settledBattleIds?.includes(requestId);
  if(!existing&&!chargedAlready){const allowance=before.state.energy>before.state.energyMax?0:Math.ceil((Date.now()-beforeTime)/300000)+1;assert.ok(data.state.energy>=before.state.energy-20&&data.state.energy<=before.state.energy-20+allowance,'20 energy debit; natural recovery only');}
  if(kind==='past-stage'&&!chargedAlready){assert.equal(room(data).level,prior.level);assert.equal(room(data).hp,prior.hp,'past-stage retry must not damage current boss');assert.deepEqual(room(data).rewardGrants,prior.rewardGrants,'past-stage retry must not create defeat rewards');if(data.battle.outcome==='win'){assert.equal(me(data).wins,me(before).wins+1);assert.ok(data.rewards.length>0);}}
  const entry={requestId,kind,startedLevel:level,endedLevel:room(data).level,status:room(data).status,outcome:data.battle.outcome,damage:data.battle.totalDamage,hp:room(data).hp,maxHp:room(data).maxHp,wins:me(data).wins,attempts:me(data).attempts,energy:data.state.energy,hostExp:data.territory.experience,playerProgress:data.state.playerProgress??null,rewardGrants:room(data).rewardGrants.length,rewardKinds:data.rewards.map(r=>r.kind)};
  if(!existing)report.battles.push(entry);report.pending=null;save();console.log(`battle ${report.battles.length}: ${kind} ${level}->${entry.endedLevel} ${entry.outcome} HP=${entry.hp} energy=${entry.energy}`);
  if(!report.checks.includes('first request replay')){const replay=await call('raid_battle',payload,requestId);assert.deepEqual(room(replay),room(data));assert.deepEqual(assets(replay.state),assets(data.state));assert.equal(replay.state.energy,data.state.energy);assert.equal(replay.territory.experience,data.territory.experience);report.checks.push('first request replay');save();data=replay;}
  if(room(data).status==='active')assert.equal(data.territory.experience,report.baseline.hostExp,'no hosting EXP before final defeat');
 }
 if(report.pending)await fight(report.pending.payload.level,report.pending.kind);
 while(room(data).status==='active'&&report.battles.length<45){
  if(room(data).level>1&&!report.battles.some(b=>b.kind==='past-stage'))await fight(1,'past-stage');
  else await fight(room(data).level,'current-stage');
 }
 assert.equal(room(data).status,'defeated','must finish within 45 real battles');assert.equal(room(data).level,12);assert.equal(room(data).hp,0);assert.ok(me(data).wins>=3);
 assert.deepEqual([...new Set(report.battles.filter(b=>b.kind==='current-stage').map(b=>b.startedLevel))].sort((a,b)=>a-b),Array.from({length:12},(_,i)=>i+1));
 assert.equal(data.territory.experience,report.baseline.hostExp+100);assert.equal(data.territory.level,2);assert.ok(report.battles.some(b=>b.kind==='past-stage'));
 report.checks.push('all 12 formal stages; snapshot unchanged; actual outcomes','past-stage retry leaves current HP/rewards intact','final host EXP100/Lv2; no PlayerEXP or interim hosting EXP');save();
 const reloaded=await call('get_state');invariant(reloaded);assert.deepEqual(room(reloaded),room(data));assert.equal(reloaded.territory.experience,data.territory.experience);report.checks.push('final history/reload');save();
 const claimed=await call('raid_claim',{roomId:ROOM});const again=await call('raid_claim',{roomId:ROOM});assert.deepEqual(assets(again.state),assets(claimed.state));assert.equal(again.territory.experience,claimed.territory.experience);assert.ok(room(again).rewardGrants.filter(g=>g.userId===uid).every(g=>g.claimed));const final=await call('get_state');assert.deepEqual(assets(final.state),assets(again.state));assert.equal(final.territory.experience,100);
 report.checks.push('claim twice and reload: assets and host EXP unchanged');report.status='pass';report.pass=true;report.finishedAt=new Date().toISOString();report.final={hostExp:final.territory.experience,hostLevel:final.territory.level,energy:final.state.energy,wins:me(final).wins,attempts:me(final).attempts,rewardGrants:room(final).rewardGrants.length};save();console.log(JSON.stringify({pass:true,roomId:ROOM,battles:report.battles.length,...report.final}));
 }catch(error){report.status='failed';report.pass=false;report.error=error.message;save();throw error;}
}
if(process.argv.includes('--run'))await run();
