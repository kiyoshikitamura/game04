/** Dedicated QA account only. Session is read from an external, untracked file. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');
require.extensions['.ts'] = (mod, filename) => mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2022}}).outputText, filename);
const {applyGrowthAction} = require('../src/domain/redesign/growth.ts');
const {CHARACTER_MASTERS} = require('../src/domain/redesign/masters.ts');
const QA = '8aab5b69-efc8-4b8e-9e9c-147a2102c2dc';
const endpoint = 'https://lrgyllgzcdcphlbmkknc.supabase.co/functions/v1/game04-redesign-api';
const session = JSON.parse(fs.readFileSync(process.env.GAME04_QA_SESSION || '/tmp/character-qa-0924/session.json', 'utf8'));
assert.equal(session.user.id, QA);
const out = path.resolve(__dirname, '../docs/verification/character-20260923');
fs.mkdirSync(out, {recursive:true});
const prior = process.env.GAME04_QA_CAPS_ONLY==='1' ? JSON.parse(fs.readFileSync(path.join(out,'live-api.json'),'utf8')) : null;
const report = prior || {timestamp:new Date().toISOString(), project:'lrgyllgzcdcphlbmkknc', qaUserId:QA, checks:[]};
const persist = () => fs.writeFileSync(path.join(out,'live-api.json'),JSON.stringify(report,null,2)+'\n');
const fields = s => Object.fromEntries(['cash','characters','souls','skills','equipment','materials','growthInventory','deck'].map(k=>[k,s[k]]));
async function request(action,payload={},requestId=crypto.randomUUID()) {
 const r=await fetch(endpoint,{method:'POST',headers:{Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},body:JSON.stringify({action,payload,requestId})});
 return {status:r.status,body:await r.json()};
}
let state;
async function run(label, action, payload={}, rejection=false) {
 const before=fields(state);let expected,error;
 try {expected=applyGrowthAction(state,action,payload)} catch(e) {error=e.message}
 assert.equal(Boolean(error),rejection, `${label}: domain expectation`);
 const id=crypto.randomUUID(), first=await request(action,payload,id);
 const check={label,action,payload,status:first.status,expectedError:error};
 try {
  if(error) {assert.equal(first.body.error,error);assert.ok(first.status>=400)}
  else {assert.equal(first.status,200);assert.deepEqual(fields(first.body.state),fields(expected));const replay=await request(action,payload,id);assert.equal(replay.status,200);assert.deepEqual(fields(replay.body.state),fields(expected));check.replay=true;}
  const reload=await request('get_state');assert.equal(reload.status,200);assert.deepEqual(fields(reload.body.state),error?before:fields(expected));state=reload.body.state;check.reload=true;check.pass=true;
 } catch(e) {check.pass=false;check.failure=e.message;report.checks.push(check);persist();throw e}
 report.checks.push(check);persist();console.log('PASS',label);
}
(async()=>{
 const initial=await request('get_state');assert.equal(initial.status,200,JSON.stringify(initial.body));state=initial.body.state;assert.equal(state.userId,QA);if(!prior) report.initial=fields(state);persist();
 if(process.env.GAME04_QA_CAPS_ONLY==='1') {
  const c=state.characters.find(c=>c.awakening===0&&c.level<50);
  await run('character reach unlocked cap','character_level',{characterId:c.id,items:{xlarge:200}});
  await run('character level cap rejected','character_level',{characterId:c.id,items:{small:1}},true);
  const e=state.equipment.find(e=>e.instanceId.startsWith('character-qa-0924-')&&e.lb===0);
  await run('equipment reach unlocked cap','equipment_level',{instanceId:e.instanceId,items:{xlarge:200}});
  await run('equipment level cap rejected','equipment_level',{instanceId:e.instanceId,items:{small:1}},true);
  report.final=fields(state);report.completed=true;persist();return;
 }
 const character=state.characters.find(c=>c.awakening<5&&c.level<50).id;
 await run('character level','character_level',{characterId:character,items:{small:1}});
 const level=state.characters.find(c=>c.id===character).level;
 await run('character awakening','character_awaken',{characterId:character});assert.equal(state.characters.find(c=>c.id===character).level,level);
 const unowned=CHARACTER_MASTERS.find(c=>!state.characters.some(o=>o.id===c.id)&&state.souls[c.id]>=100);
 await run('character unlock','character_unlock',{characterId:unowned.id});
 await run('soul exchange minimum ten','soul_exchange',{characterId:character,amount:10});
 await run('soul selection','soul_select',{characterId:character,amount:1});
 await run('skill LB','skill_level',{skillId:state.skills.find(s=>s.level<10).id});
 const eq=state.equipment.filter(e=>e.instanceId.startsWith('character-qa-0924-'));
 const [trained,protectedEq,assigned,single,bulk1,bulk2]=eq.map(e=>e.instanceId);
 await run('equipment level','equipment_level',{instanceId:trained,items:{small:1}});
 await run('equipment LB','equipment_lb',{instanceId:trained});
 await run('equipment protect','equipment_lock',{instanceId:protectedEq,locked:true});
 await run('protected dismantle rejected','equipment_dismantle',{instanceIds:[protectedEq]},true);
 const deck=structuredClone(state.deck);deck[0].equipment.accessory1=assigned;
 await run('deck persistence','save_deck',{deck});
 await run('assigned dismantle rejected','equipment_dismantle',{instanceIds:[assigned]},true);
 await run('trained confirmation required','equipment_dismantle',{instanceIds:[trained]},true);
 await run('trained confirmed dismantle','equipment_dismantle',{instanceIds:[trained],confirmTrained:true});
 await run('single dismantle','equipment_dismantle',{instanceIds:[single]});
 await run('bulk dismantle','equipment_dismantle',{instanceIds:[bulk1,bulk2]});
 await run('insufficient EXP rejected','character_level',{characterId:character,items:{small:999999}},true);
 await run('insufficient souls rejected','soul_exchange',{characterId:character,amount:1000000},true);
 await run('invalid exchange below ten','soul_exchange',{characterId:character,amount:2},true);
 await run('already owned unlock rejected','character_unlock',{characterId:character},true);
 report.final=fields(state);report.completed=true;persist();
 fs.writeFileSync(path.join(out,'live-api.md'),`# Character live API verification\n\n${report.timestamp}\n\nDedicated GAME04 dev QA account only. Each successful action matched the local growth domain, replayed the same request ID without extra spending, and survived get_state reload. Rejections preserved growth inventory and deck state. Awakening preserved character level.\n\n${report.checks.map(c=>`- ${c.pass?'PASS':'FAIL'}: ${c.label}`).join('\n')}\n\nCaps not exercised unless separately recorded; no production writes.\n`);
 console.log('COMPLETE',report.checks.length);
})().catch(e=>{report.error=e.message;persist();console.error(e.message);process.exitCode=1});
