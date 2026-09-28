const fs=require('fs'),assert=require('assert/strict'),{parseEnv}=require('util'),{createClient}=require('@supabase/supabase-js');
const env=parseEnv(fs.readFileSync('.env.preview.local','utf8'));
assert.equal(env.NEXT_PUBLIC_SUPABASE_URL,'https://znakrkaazliexzwihxge.supabase.co');
const sessionPath='scratch/additional29-session.json';
const client=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.NEXT_PUBLIC_SUPABASE_ANON_KEY||env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const out='docs/verification/battle-device-five';
(async()=>{
 const auth=await client.auth.setSession(JSON.parse(fs.readFileSync(sessionPath,'utf8')));if(auth.error)throw auth.error;
 assert.equal(auth.data.user.id,'99d27360-1f5a-4ef2-869e-1ee697757953','Dedicated QA account only');
 fs.writeFileSync(sessionPath,JSON.stringify(auth.data.session));
 async function call(action,payload={},requestId=crypto.randomUUID()) {const r=await client.functions.invoke('game04-redesign-api',{body:{action,payload,requestId}});if(r.error)throw Error(await r.error.context.text());return r.data;}
 const checkpoint='scratch/battle-five-pending.json';
 const pending=await call('get_state');if(pending.pendingBattle){assert.equal(pending.pendingBattle.id,JSON.parse(fs.readFileSync(checkpoint,'utf8')).battleId,'Do not interrupt another QA battle');await call('battle_finish',{battleId:pending.pendingBattle.id,decision:'retire'});}
 const before=await call('get_state');assert(!before.pendingBattle);
 const battleId=crypto.randomUUID();fs.writeFileSync(checkpoint,JSON.stringify({battleId}));const preview=await call('quest_battle',{stageId:'mikawa-1',deferSettlement:true},battleId);
 assert.equal(preview.battle.pendingSettlementId,battleId);assert.equal(preview.battle.burstPolicy,'attack-free-enemy-pause-v2-20260927');assert.deepEqual(preview.rewards,[]);
 assert.equal(preview.state.cash,before.state.cash);assert.deepEqual(preview.state.clearedStages,before.state.clearedStages);
 const pausedCounts=[];let counts;
 for(const frame of preview.battle.frames){if(frame.event==='burst_start')counts=frame.enemies.map(e=>e.count);if(frame.burst){assert(!['interrupt_start','counter','counts'].includes(frame.event));if(frame.event==='action_start')assert(preview.battle.party.some(p=>p.id===frame.actorId));frame.enemies.forEach((enemy,index)=>{if(enemy.hp>0)assert.equal(enemy.count,counts[index]);});pausedCounts.push(frame.index);}}
 const retired=await call('battle_finish',{battleId,decision:'retire'});assert(retired.retired);assert.equal(retired.state.energy,preview.state.energy);assert.equal(retired.state.cash,before.state.cash);assert.deepEqual(retired.state.clearedStages,before.state.clearedStages);
 const replay=await call('battle_finish',{battleId,decision:'complete'});assert(replay.retired);assert.equal(replay.state.cash,retired.state.cash);assert.deepEqual(replay.state.clearedStages,retired.state.clearedStages);assert(!replay.pendingBattle);
 fs.writeFileSync(checkpoint,JSON.stringify({battleId:null}));
 const successId=crypto.randomUUID();fs.writeFileSync(checkpoint,JSON.stringify({battleId:successId}));const second=await call('quest_battle',{stageId:'mikawa-1',deferSettlement:true},successId);const success=await call('battle_finish',{battleId:successId,decision:'complete'});assert(success.battle);const again=await call('battle_finish',{battleId:successId,decision:'complete'});assert.equal(again.state.cash,success.state.cash);assert.deepEqual(again.state.questClearCounts,success.state.questClearCounts);assert(!again.pendingBattle);
 fs.writeFileSync(checkpoint,JSON.stringify({battleId:null}));
 const result={project:'znakrkaazliexzwihxge',battleId,completedBattleId:successId,policy:preview.battle.burstPolicy,burstFramesVerified:pausedCounts.length,retire:{beforeEnergy:before.state.energy,startedEnergy:preview.state.energy,retiredEnergy:retired.state.energy,cashUnchanged:true,clearsUnchanged:true,delayedCompletionRetired:true},completion:{outcome:second.battle.outcome,rewardCount:success.rewards.length,replayUnchanged:true},pass:true};
 fs.writeFileSync(out+'/live.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
})().catch(error=>{console.error(error.stack);process.exitCode=1});
