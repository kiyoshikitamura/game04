/** GAME04 dev only. Session files remain outside Git. Requires guarded TEST_ONLY rooms. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
const config=JSON.parse(fs.readFileSync('config/game04-preview-public.json'));
assert.equal(config.supabaseUrl,'https://lrgyllgzcdcphlbmkknc.supabase.co');
const fixture=JSON.parse(fs.readFileSync(process.env.RAID_FIXTURE_PATH||'/tmp/raid-live-fixtures.json'));
const sessions={owner:JSON.parse(fs.readFileSync(process.env.RAID_OWNER_SESSION||'/tmp/game04-raid-session.json')),guest:JSON.parse(fs.readFileSync(process.env.RAID_GUEST_SESSION||'/tmp/game04-raid-guest-session.json'))};
assert.equal(sessions.owner.user.id,fixture.owner);assert.equal(sessions.guest.user.id,fixture.guest);
const reportPath='docs/design/raid/2026-09-23/final-integration/live-results.json';
const report=process.argv.includes('--finish')?JSON.parse(fs.readFileSync(reportPath)): {project:'lrgyllgzcdcphlbmkknc',scope:'Real authenticated Edge + DB with TEST_ONLY battle-strength fixtures; not formal balance acceptance',checks:[]};
const api=async(who,action,payload={},requestId=crypto.randomUUID())=>{
 const r=await fetch(config.supabaseUrl+'/functions/v1/game04-redesign-api',{method:'POST',headers:{apikey:config.supabaseAnonKey,Authorization:`Bearer ${sessions[who].access_token}`,'Content-Type':'application/json'},body:JSON.stringify({action,payload,requestId})});
 const result=await r.json();assert.equal(r.status,200,JSON.stringify({action,status:r.status,result}));return result;
};
const roomId=fixture.rooms[0].id,lossId=fixture.rooms[1].id;
const room=(r,id=roomId)=>r.rooms.find(v=>v.id===id);
const me=r=>room(r).participants.find(p=>p.userId===fixture.guest);
if(!process.argv.includes('--finish')){
 const initial=await api('guest','get_state');assert.equal(room(initial).territorySnapshot.masterVersion,'TEST_ONLY_RAID_INTEGRATION_20260923');
 const owner=room(initial).participants.find(p=>p.userId===fixture.owner);assert.match(owner.portraitUrl,/^\/creative\/characters\/portrait\//);assert.match(owner.name,/^RQA/);
 report.checks.push({name:'owner profile and portrait projection',pass:true});
 const lost=await api('owner','raid_battle',{roomId:lossId});assert.equal(lost.battle.outcome,'lose');const loser=room(lost,lossId).participants.find(p=>p.userId===fixture.owner);assert.equal(loser.attempts,1);assert.equal(loser.wins,0);report.checks.push({name:'loss increments attempts only',pass:true});
 await api('guest','raid_join',{roomId});const joined=await api('guest','get_state');assert.equal(me(joined).joinedLevel,1);assert.equal(me(joined).wins,0);
 const requestId=crypto.randomUUID();const first=await api('guest','raid_battle',{roomId},requestId);assert.equal(first.battle.outcome,'win');assert.equal(me(first).wins,1);assert.equal(first.state.energy,joined.state.energy-20);
 const retried=await api('guest','raid_battle',{roomId},requestId);assert.equal(me(retried).attempts,me(first).attempts);assert.equal(me(retried).wins,1);assert.equal(room(retried).hp,room(first).hp);assert.equal(retried.state.energy,first.state.energy);
 report.checks.push({name:'join / win / energy20 / same-request replay',pass:true});
 const second=await api('guest','raid_battle',{roomId});assert.equal(me(second).wins,2);assert.equal(room(second).status,'active');assert.equal(room(second).rewardGrants.some(g=>g.id.startsWith('defeat:')),false);
 report.checks.push({name:'two wins do not grant defeat qualification',pass:true,remainingHp:room(second).hp});
 report.next='Refill only this disposable QA account outside the gameplay flow, then --finish. No existing player updates.';
}else{
 const third=await api('guest','raid_battle',{roomId});assert.equal(third.battle.outcome,'win');assert.equal(me(third).wins,3);assert.equal(room(third).status,'defeated');
 assert.equal(room(third).rewardGrants.filter(g=>g.userId===fixture.guest&&g.id.startsWith('defeat:')).length,1);
 const reloaded=await api('guest','get_state');assert.deepEqual(me(reloaded),me(third));assert.equal(room(reloaded).status,'defeated');
 report.checks.push({name:'third win / ended history / qualification / reload consistency',pass:true});
 const claimed=await api('guest','raid_claim',{roomId});assert.ok(room(claimed).rewardGrants.filter(g=>g.userId===fixture.guest).every(g=>g.claimed));
 const again=await api('guest','raid_claim',{roomId});assert.deepEqual(again.state.growthInventory,claimed.state.growthInventory);assert.equal(again.state.cash,claimed.state.cash);
 const final=await api('guest','get_state');assert.ok(room(final).rewardGrants.filter(g=>g.userId===fixture.guest).every(g=>g.claimed));
 report.checks.push({name:'claim / new-request duplicate claim / persisted inventory',pass:true});delete report.next;report.completed=true;report.fixtureEnergyRefill='Disposable guest only, after two wins; excluded from gameplay acceptance';
}
fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');console.log(report);
