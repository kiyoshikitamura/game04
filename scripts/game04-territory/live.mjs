/** Private tokens and evidence stay outside the repository. Dev project only. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const root=process.env.GAME04_TERRITORY_QA_DIR;
if(!root || !root.startsWith('/tmp/')) throw Error('GAME04_TERRITORY_QA_DIR must be a private /tmp directory');
fs.mkdirSync(root,{recursive:true,mode:0o700});
const cfg=JSON.parse(fs.readFileSync(new URL('../../config/game04-preview-public.json',import.meta.url)));
assert.equal(cfg.supabaseUrl,'https://lrgyllgzcdcphlbmkknc.supabase.co');
const phase=process.argv[2];
async function session(label){
 const file=`${root}/${label}.json`;let s;
 if(fs.existsSync(file))s=JSON.parse(fs.readFileSync(file));
 else {if(phase!=='bootstrap')throw Error('Run bootstrap first');
  const r=await fetch(cfg.supabaseUrl+'/auth/v1/signup',{method:'POST',headers:{apikey:cfg.supabaseAnonKey,'Content-Type':'application/json'},body:JSON.stringify({data:{qa:true,purpose:'game04-territory-20260920'}})});
  s=await r.json();assert.ok(r.ok,`signup ${r.status}`);fs.writeFileSync(file,JSON.stringify(s),{mode:0o600});}
 if(s.expires_at*1000<Date.now()+60000){const r=await fetch(cfg.supabaseUrl+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:cfg.supabaseAnonKey,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:s.refresh_token})});s=await r.json();assert.ok(r.ok);fs.writeFileSync(file,JSON.stringify(s),{mode:0o600});}
 return s;
}
const sessions={};for(const label of ['owner','helper','helper2'])sessions[label]=await session(label);
async function call(s,path,body){const r=await fetch(cfg.supabaseUrl+path,{method:'POST',headers:{apikey:cfg.supabaseAnonKey,Authorization:`Bearer ${s.access_token}`,'Content-Type':'application/json'},body:JSON.stringify(body)});const data=await r.json();if(!r.ok)throw Error(JSON.stringify({status:r.status,error:data.error||data.message,path}));return data;}
async function api(label,action,payload={},requestId=crypto.randomUUID()){return call(sessions[label],'/functions/v1/game04-redesign-api',{action,payload,requestId});}
if(phase==='bootstrap'){
 for(const label of Object.keys(sessions)){await call(sessions[label],'/rest/v1/rpc/initialize_current_player',{p_username:({owner:'QA侵攻主',helper:'QA侵攻援1',helper2:'QA侵攻援2'})[label],p_invite_code:null});const d=await api(label,'get_state');fs.writeFileSync(`${root}/${label}-state.json`,JSON.stringify(d.state));}
 const ids=Object.fromEntries(Object.entries(sessions).map(([k,s])=>[k,s.user.id]));fs.writeFileSync(`${root}/ids.json`,JSON.stringify(ids,null,2));console.log(JSON.stringify(ids));
}
if(phase==='state'){const label=process.argv[3]||'owner';const d=await api(label,'get_state');fs.writeFileSync(`${root}/${label}-latest.json`,JSON.stringify(d));console.log(JSON.stringify({userId:d.state.userId,territory:d.territory,stateKeys:Object.keys(d.state),rooms:d.rooms?.length}));}
if(phase==='run'){
 const plan=JSON.parse(fs.readFileSync(`${root}/plan.json`));const evidence=[];
 for(const step of plan){const requests=step.requests||[step];const responses=await Promise.all(requests.map(q=>api(q.user,q.action,q.payload,q.requestId).then(data=>({ok:true,data})).catch(e=>({ok:false,error:e.message}))));
  const ownerState=await api('owner','get_state'); evidence.push({name:step.name,responses,ownerTerritory:ownerState.territory});fs.writeFileSync(`${root}/evidence.json`,JSON.stringify(evidence));
  console.log(JSON.stringify({name:step.name,responses:responses.map(r=>r.ok?{ok:true,outcome:r.data.battle?.outcome,room:r.data.battle?.raidId}:r)}));
 }
}

if(phase==='verify'){
 const ev=JSON.parse(fs.readFileSync(`${root}/evidence.json`));
 const by=name=>ev.find(e=>e.name===name);
 for(const e of ev)for(const r of e.responses)assert.ok(r.ok,`${e.name}: ${r.error}`);
 const xp=name=>by(name).ownerTerritory.experience;
 assert.equal(xp('intermediate'),0);assert.equal(xp('two_wins'),0);
 assert.equal(xp('absent_owner'),100);assert.equal(xp('absent_owner_replay'),100);
 assert.equal(xp('third_win'),200);assert.equal(xp('third_win_replay'),200);
 assert.equal(xp('late_clear'),200);assert.equal(xp('late_third'),200);
 assert.equal(xp('parallel_clear'),400);assert.equal(xp('expired_claim'),400);
 const fixtures=JSON.parse(fs.readFileSync(`${root}/fixtures.json`));const expired=by('expired_claim').responses[0].data.rooms.find(r=>r.id===fixtures.expired.roomId);assert.equal(expired.status,'expired');assert.ok(expired.rewardGrants.every(g=>g.claimed));
 for(const label of ['helper','helper2'])assert.equal((await api(label,'get_state')).territory.experience,0);
 console.log(JSON.stringify({clearBoundary:'PASS',ownerExperience:400,rescuerExperience:0,parallelClear:'PASS',replay:'PASS',lateThirdNonretro:'PASS'}));
}

if(phase==='normal'){
 const f=JSON.parse(fs.readFileSync(`${root}/normal-fixture.json`)).normal;
 const before=await api('owner','get_state');const r=await api('owner','raid_battle',{roomId:f.roomId});const room=d=>d.rooms.find(x=>x.id===f.roomId);
 assert.equal(r.battle.outcome,'win');assert.equal(room(r).level,2);assert.equal(before.state.energy-r.state.energy,5);
 fs.writeFileSync(`${root}/normal-first.json`,JSON.stringify({before,r}));console.log(JSON.stringify({normalStart:'PASS',energyCost:5,level:2}));
}
if(phase==='normal-resume'){
 const f=JSON.parse(fs.readFileSync(`${root}/normal-fixture.json`)).normal;const {before,r}=JSON.parse(fs.readFileSync(`${root}/normal-first.json`));const room=d=>d.rooms.find(x=>x.id===f.roomId);
 const old=await api('owner','raid_battle',{roomId:f.roomId},f.staleBattleId);assert.equal(old.battle.outcome,'win');assert.equal(room(old).hp,room(r).hp);
 const next=await api('owner','raid_battle',{roomId:f.roomId});assert.equal(next.battle.outcome,'win');assert.ok(next.battle.frames[0].enemies[0].maxHp>r.battle.frames[0].enemies[0].maxHp);
 fs.writeFileSync(`${root}/normal-evidence.json`,JSON.stringify({before,r,old,next}));
 console.log(JSON.stringify({normalStart:'PASS',energyCost:5,oldLevelNoSharedDamage:'PASS',firstEnemyHp:r.battle.frames[0].enemies[0].maxHp,nextEnemyHp:next.battle.frames[0].enemies[0].maxHp}));
}
if(phase==='lose'){
 const f=JSON.parse(fs.readFileSync(`${root}/lose-fixture.json`));const room=d=>d.rooms.find(x=>x.id===f.roomId);
 const before=await api('owner','get_state');const r=await api('owner','raid_battle',{roomId:f.roomId});assert.equal(r.battle.outcome,'lose');
 assert.equal(room(before).participants.find(p=>p.userId===sessions.owner.user.id).wins,room(r).participants.find(p=>p.userId===sessions.owner.user.id).wins);
 fs.writeFileSync(`${root}/lose-evidence.json`,JSON.stringify(r));console.log(JSON.stringify({normalLose:'PASS',winsUnchanged:true}));
}
