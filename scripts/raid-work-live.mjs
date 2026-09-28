import fs from 'node:fs';
import assert from 'node:assert/strict';
const cfg=JSON.parse(fs.readFileSync('config/game04-preview-public.json'));
assert.equal(new URL(cfg.supabaseUrl).hostname,'lrgyllgzcdcphlbmkknc.supabase.co');
const dir='/tmp/game04-work-live';fs.mkdirSync(dir,{recursive:true,mode:0o700});
export async function api(session,action,payload={},requestId=crypto.randomUUID()){
 const r=await fetch(cfg.supabaseUrl+'/functions/v1/game04-redesign-api',{method:'POST',headers:{apikey:cfg.supabaseAnonKey,Authorization:`Bearer ${session.access_token}`,'Content-Type':'application/json'},body:JSON.stringify({action,payload,requestId})});return {status:r.status,data:await r.json()};
}
if(process.argv.includes('--verify')){
 const owner=JSON.parse(fs.readFileSync(dir+'/owner.json')),guest=JSON.parse(fs.readFileSync(dir+'/guest.json')),fx=JSON.parse(fs.readFileSync(dir+'/fixture.json'));
 const report={project:'lrgyllgzcdcphlbmkknc',apiVersion:14,fixture:{...fx,preparation:'Disposable QA only; guest initial N party Lv50 with matching cumulative EXP; formal enemy/shared HP unchanged; energy not refilled during operations'},checks:[]};
 const call=async(who,action,payload={},id)=>{const r=await api(who,action,payload,id);assert.equal(r.status,200,JSON.stringify({action,...r}));return r.data;};
 const room=d=>d.rooms.find(r=>r.id===fx.roomId),me=d=>room(d).participants.find(p=>p.userId===fx.guest);
 const save=()=>{fs.mkdirSync('docs/verification/raid-20260923',{recursive:true});fs.writeFileSync('docs/verification/raid-20260923/live-api-results.json',JSON.stringify(report,null,2));};
 try {
 let d=await call(guest,'get_state');assert.equal(room(d).maxHp,39000);assert.equal(room(d).raidSnapshot.enemy.stats.hp,6500);
 if(!room(d).participants.find(p=>p.userId===fx.owner).attempts){const lost=await call(owner,'raid_battle',{roomId:fx.roomId});assert.equal(lost.battle.outcome,'lose');assert.equal(lost.rewards.length,0);}report.checks.push({name:'formal loss, no personal victory reward',pass:true});save();
 await call(guest,'raid_join',{roomId:fx.roomId});await call(guest,'raid_rescue',{roomId:fx.roomId});
 const id=fx.firstBattleId||crypto.randomUUID();fx.firstBattleId=id;fs.writeFileSync(dir+'/fixture.json',JSON.stringify(fx));d=await call(guest,'raid_battle',{roomId:fx.roomId},id);assert.equal(d.battle.outcome,'win');assert.equal(me(d).wins,1);assert.ok(d.rewards.length);const repeated=await call(guest,'raid_battle',{roomId:fx.roomId},id);assert.deepEqual(me(repeated),me(d));assert.equal(room(repeated).hp,room(d).hp);assert.equal(repeated.state.cash,d.state.cash);report.checks.push({name:'join/rescue/formal win/same request replay',pass:true,damage:d.battle.totalDamage,energy:d.state.energy,playerGrowth:d.playerGrowth});save();
 for(let n=0;n<8&&room(d).status==='active';n++){d=await call(guest,'raid_battle',{roomId:fx.roomId});assert.equal(d.battle.outcome,'win');report.checks.push({name:'formal successive win',wins:me(d).wins,hp:room(d).hp,energy:d.state.energy,playerGrowth:d.playerGrowth});save();}
 assert.equal(room(d).status,'defeated');assert.ok(me(d).wins>=3);assert.equal(room(d).rewardGrants.filter(g=>g.userId===fx.guest).length,1);
 const reload=await call(guest,'get_state');assert.deepEqual(room(reload),room(d));report.checks.push({name:'qualification/defeat/history/reload',pass:true});
 const claimed=await call(guest,'raid_claim',{roomId:fx.roomId}),again=await call(guest,'raid_claim',{roomId:fx.roomId});assert.deepEqual(again.state.growthInventory,claimed.state.growthInventory);assert.equal(again.state.cash,claimed.state.cash);assert.ok(room(again).rewardGrants.filter(g=>g.userId===fx.guest).every(g=>g.claimed));report.checks.push({name:'claim/reload/new request duplicate claim',pass:true});report.pass=true;save();console.log(JSON.stringify(report));
 }catch(e){report.pass=false;report.error=e.message;save();throw e;}
}
if(process.argv.includes('--setup'))for(const [role,name] of [['owner','RQAWOwn'],['guest','RQAWGst']]){
 const p=dir+'/'+role+'.json';let session;if(fs.existsSync(p))session=JSON.parse(fs.readFileSync(p));else {
 const res=await fetch(cfg.supabaseUrl+'/auth/v1/signup',{method:'POST',headers:{apikey:cfg.supabaseAnonKey,'Content-Type':'application/json'},body:JSON.stringify({})});session=await res.json();assert.ok(session.access_token,'anonymous session creation');fs.writeFileSync(p,JSON.stringify(session),{mode:0o600});}
 const r=await fetch(cfg.supabaseUrl+'/rest/v1/rpc/initialize_current_player',{method:'POST',headers:{apikey:cfg.supabaseAnonKey,Authorization:`Bearer ${session.access_token}`,'Content-Type':'application/json'},body:JSON.stringify({p_username:name,p_invite_code:null})});assert.ok(r.ok,await r.text());
 const state=await api(session,'get_state');assert.equal(state.status,200,JSON.stringify(state.data));console.log(JSON.stringify({role,id:session.user.id,stateInitialized:true}));
}
