import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { simulateBattle } from '../src/domain/redesign/battle.ts';
import { createFormalBattleInput } from '../src/domain/redesign/formalBattleInput.ts';
import { input, unit, enemy, skill, rules as baseRules } from './game04-battle-common/fixtures.mjs';
export const rules={...baseRules,version:'balance-v2-20260920',inputVersion:'wave-sp-v1-20260921',balanceV2:{status:'PREVIEW_PROVISIONAL',version:'TEST_ONLY_WAVE_SP',damageBonusCap:50,healingBonusCap:80,shieldBonusCap:50,shieldHpCap:.5,periodicCapMultiplier:2,lowHpThreshold:.4,highHpThreshold:.7,diversityFactors:[0,.25,.5,.75,1]}};
const foe=(extra={})=>enemy('e',{initialSp:0,...extra});
const run=(extra={})=>simulateBattle(input({rules,party:[unit('p')],waves:[[foe()]],...extra}));
const passed=[];
function test(name,fn){fn();passed.push(name);console.log('PASS',name);}
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');

test('6 waves complete; 7 waves and 4 enemies rejected',()=>{
 const waves=Array.from({length:6},()=>[foe({stats:{hp:1,sp:100,atk:0,def:0,luk:0}})]);
 const r=run({waves}); assert.equal(r.outcome,'win');assert.equal(r.wavesCleared,6);assert.equal(r.frames.at(-1).wave,6);
 assert.throws(()=>run({waves:[...waves,waves[0]]}),/formation/);
 assert.throws(()=>run({waves:[[...waves[0],...waves[0],...waves[0],...waves[0]]]}),/formation/);
 for(const f of r.frames.filter(f=>f.event==='wave')){
  const prev=r.frames[f.index-1]; assert.deepEqual(f.party,prev.party);assert.equal(f.partySp,prev.partySp);assert.equal(f.burstGauge,prev.burstGauge);assert.equal(f.playerActions,prev.playerActions);assert.equal(f.burst,false);
 }
});
test('6 waves share 300 opportunities; persistent HP/SP/status/gauge and BURST ends',()=>{
 const p=unit('p',{stats:{hp:1000000,sp:1,atk:1,def:0,luk:100},skills:[skill('guard',1,{target:'self',effects:[{type:'def_up',power:1,duration:1000,carryAcrossWaves:true}]})]});
 const waves=Array.from({length:6},(_,i)=>[foe({stats:{hp:i===5?100000:26,sp:100,atk:1,def:100,luk:0},actionCount:1,initialCount:1})]);
 const r=run({party:[p],waves});assert.equal(r.reason,'action_limit');assert.equal(r.playerActions,300);assert.equal(r.frames.at(-1).wave,6);
 const transitions=r.frames.filter(f=>f.event==='wave');assert.equal(transitions.length,5);
 assert.ok(transitions.some(f=>f.party[0].statuses.length));assert.ok(transitions.some(f=>f.party[0].hp<f.party[0].maxHp));
 for(const f of transitions){const prev=r.frames[f.index-1];assert.deepEqual(f.party,prev.party);assert.equal(f.partySp,prev.partySp);assert.equal(f.burstGauge,prev.burstGauge);assert.equal(f.burst,false);}
 assert.ok(r.frames.some((f,i)=>f.event==='burst_end'&&!f.enemies.some(e=>e.hp>0)&&r.frames[i+1]?.event==='wave'));
});
test('explicit starts 0/100, 35/100, 50/100, 175/180 apply on every wave; hit gain capped',()=>{
 for(const [start,cap] of [[0,100],[35,100],[50,100],[175,180]]){
  const e=foe({initialSp:start,stats:{hp:1000000,sp:cap,atk:1,def:0,luk:0},hitSpGain:10});
  const r=run({waves:[[e]]});assert.equal(r.frames[0].enemies[0].sp,start);assert.equal(r.frames[0].enemies[0].maxSp,cap);
  assert.equal(r.frames.find(f=>f.event==='damage').enemies[0].sp,Math.min(cap,start+10));
  const r2=run({waves:[[foe({stats:{hp:1,sp:100,atk:0,def:0,luk:0}})],[e]]});assert.equal(r2.frames.find(f=>f.event==='wave').enemies[0].sp,start);
 }
 for(const initialSp of [undefined,-1,101,NaN])assert.throws(()=>run({waves:[[foe({initialSp,stats:{hp:1000,sp:100,atk:1,def:0,luk:0}})]]}),/initialSp/);
});
test('insufficient SP uses basic; skill pays full cost; block hit SP deferred',()=>{
 const e=foe({initialSp:35,stats:{hp:1000000,sp:100,atk:1,def:0,luk:0},actionCount:1,initialCount:1,hitSpGain:0,skills:[skill('cost40',40)]});
 const r=run({waves:[[e]]});assert.equal(r.frames.find(f=>f.event==='action_start'&&f.actorId==='e').skillId,'basic');
 const p=unit('p',{skills:[skill('counter-buff',0,{target:'self',effects:[{type:'counter',power:1,duration:1000}]})]});
 const r2=run({party:[p],waves:[[{...e,initialSp:80,hitSpGain:30}]]});
 const start=r2.frames.findIndex(f=>f.event==='interrupt_start');const end=r2.frames.findIndex(f=>f.event==='interrupt_end');const block=r2.frames.slice(start,end+1);
 assert.deepEqual(block.filter(f=>f.event==='action_start').map(f=>[f.skillId,f.enemies[0].sp]),[['cost40',40],['cost40',0]]);
 assert.equal(block.at(-1).enemies[0].sp,60);
});
test('enemy revival remains SP0 even with nonzero configured start',()=>{
 const dead=foe({id:'dead',initialSp:35,stats:{hp:1,sp:100,atk:1,def:0,luk:0}});
 const healer=foe({id:'healer',initialSp:100,stats:{hp:1000000,sp:100,atk:1,def:0,luk:0},actionCount:1,initialCount:1,skills:[skill('revive',100,{target:'dead_ally',effects:[{type:'revive',power:100,healingFormula:'target_max_hp_percent'}]})]});
 const r=run({waves:[[dead,healer]]});const revived=r.frames.find(f=>f.skillId==='revive'&&f.enemies.find(e=>e.id==='dead')?.hp>0);assert.ok(revived);assert.equal(revived.enemies.find(e=>e.id==='dead').sp,0);
});
test('formal input snapshot + JSON save/load deterministic result/log/replay',()=>{
 const data=createFormalBattleInput(917,[unit('p')],Array.from({length:6},(_,i)=>[foe({initialSp:i===5?175:35,stats:{hp:120,sp:i===5?180:100,atk:1,def:0,luk:0}})]),rules);
 const before=JSON.stringify(data);const result=simulateBattle(data);assert.equal(JSON.stringify(data),before);
 assert.deepEqual(simulateBattle(JSON.parse(before)),result);assert.equal(JSON.stringify(JSON.parse(JSON.stringify(result)).frames),JSON.stringify(result.frames));
 assert.equal(result.inputVersion,rules.inputVersion);assert.equal(result.masterVersion,rules.balanceV2.version);
 assert.throws(()=>createFormalBattleInput(1,[unit('p')],[[enemy()]],rules),/initialSp/);
});
// Golden hashes captured from the unmodified 01328e4 calculator, including an ignored initialSp field.
const golden=["dd45a03c2f94703702d7929a7d89a4448888266111efe2eb261907b2b8e85441","553899cd46df155ea539e4519ee2a01f130ddd13978d12e2b793ebf6645c90ee","4d2d4c63921ff10f56c33279574d3c5f7f7dc55c55cb36f8e586bc0642c9b817","ddb2ff9dbac10fb7ab69a2b95a18160b29e6e04bc9acee3668bcd874e29e3a04","353830d3aa8fff8307c3d64e355d5343b40d23b3cce5c598cfa38b602059d017"];
const legacyHashes=[];
for(let count=1;count<=5;count++){
 const legacyRules={...rules};delete legacyRules.inputVersion;
 const data=input({rules:legacyRules,waves:Array.from({length:count},()=>[enemy('e',{initialSp:0,stats:{hp:400,sp:100,atk:1,def:0,luk:0},hitSpGain:10,actionCount:2,initialCount:2,skills:[skill('cost40',40)]})])});
 const r=run(data);legacyHashes.push(hash(r));assert.equal(r.frames[0].enemies[0].sp,100);
 const explicit=structuredClone(data);explicit.rules.inputVersion=rules.inputVersion;explicit.waves.flat().forEach(e=>e.initialSp=e.stats.sp);
 const revised=simulateBattle(explicit);delete revised.inputVersion;delete revised.masterVersion;
 explicit.waves.flat().forEach(e=>e.initialSp=0); // input metadata differs; compare actual mechanics/logs.
 assert.deepEqual(revised.frames,r.frames);assert.equal(revised.outcome,r.outcome);
}
assert.deepEqual(legacyHashes,golden);
console.log('PASS legacy 1-5 wave golden results and explicit full-SP parity');
console.log(JSON.stringify({passed:passed.length,scope:'mechanics only; formal balance acceptance excluded'}));
