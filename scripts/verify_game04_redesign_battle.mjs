import assert from 'node:assert/strict';
import { simulateBattle, burstChance, elementMultiplier } from '../src/domain/redesign/battle.ts';
const rules = { advantageMultiplier: 1.5, disadvantageMultiplier: .75, spRecoveryDivisor: 200, burstLukDivisor: 100, enemySpRecoveryDivisor: 10, maxPlayerActions: 80, initialSpRatio: 0, defenseFactor: .45 };
const skill = (id, spCost, extra = {}) => ({ id, name: id, image: '', rarity: 'N', element: 'fire', spCost, condition: { type: 'always' }, target: 'first', effects: [{ type: 'damage', power: 100 }], description: '', ...extra });
const unit = (id, extra = {}) => ({ id, name: id, image: '', level: 10, element: 'fire', stats: { hp: 1000, sp: 100, atk: 100, def: 20, luk: 10 }, skills: [], passives: [], ...extra });
const party = Array.from({length: 5}, (_, i) => unit(`p${i}`));
const enemy = (id, extra = {}) => unit(id, { actionCount: 3, order: 0, ...extra });
const input = {seed: 42, party, waves: [[enemy('e', { stats: {hp: 900, sp: 100, atk: 20, def: 20, luk: 0} })]], rules};
const result = simulateBattle(input);
assert.deepEqual(result, simulateBattle(input), 'seed replay deterministic');
assert.equal(input.party[0].stats.hp, 1000, 'inputs unchanged');
assert.deepEqual(result.frames.filter(f => f.kind === 'action').slice(0,5).map(f => f.actorId), ['p0','p1','p2','p3','p4']);
assert.equal(result.frames[0].partySp, 0);
assert.equal(result.frames[0].maxSp, 500);
assert.equal(result.frames[0].enemies[0].sp, 100);
const firstEnemy = result.frames.findIndex(f => f.kind === 'enemy');
assert.equal(result.frames.slice(0,firstEnemy).filter(f => f.kind === 'action').length, 3);
assert.equal(elementMultiplier('fire','wind',rules),1.5);
assert.equal(elementMultiplier('light','dark',rules),1.5);
assert.equal(elementMultiplier('dark','light',rules),1.5);
assert.equal(burstChance(300,10000,1),.8);
const priorityParty = party.map((p,i) => i ? p : {...p,skills:[skill('cheap',10),skill('expensive',30),skill('equal',30),skill('unmet',60,{condition:{type:'hp_below',value:.1}})]});
const priority = simulateBattle({...input,party:priorityParty,rules:{...rules,initialSpRatio:1}});
assert.equal(priority.frames.find(f=>f.kind==='action').skillId,'expensive');
const waves = simulateBattle({...input,rules:{...rules,initialSpRatio:.2},waves:[[enemy('e1',{stats:{hp:1,sp:20,atk:1,def:1,luk:1}})],[enemy('e2',{stats:{hp:1,sp:20,atk:1,def:1,luk:1}})]]});
assert.equal(waves.outcome,'win'); assert.equal(waves.wavesCleared,2);
const transition = waves.frames.find(f=>f.kind==='wave');
assert.ok(transition.partySp > 0,'SP carries across waves');
assert.equal(waves.frames.filter(f=>f.kind==='action')[1].actorId,'p1','fixed order continues across wave');
const passive = simulateBattle({...input,party:party.map(p=>({...p,passives:[{id:'p',name:'p',stat:'hp',percent:10,target:'party'}]}))});
assert.equal(passive.frames[0].party[0].maxHp,1500,'five additive passives');
const phase = simulateBattle({...input,waves:[[enemy('boss',{stats:{hp:500,sp:100,atk:1,def:0,luk:1},phases:[{hpBelow:.5,name:'怒り',actionCount:1}]})]]});
assert.ok(phase.frames.some(f=>f.kind==='phase'&&f.text.includes('怒り')));
// Seed search guarantees exercising burst rather than relying on probability happening once.
let burst;
for(let seed=1;seed<30&&!burst;seed++) {
 const r=simulateBattle({...input,seed,party:party.map(p=>({...p,level:100,skills:[skill('repeat',20)]})),waves:[[enemy('e',{actionCount:999,stats:{hp:100000,sp:1,atk:1,def:1,luk:1}})]],rules:{...rules,spRecoveryDivisor:1,maxPlayerActions:25}});
 if(r.frames.some(f=>f.burst)) burst=r;
}
assert.ok(burst,'burst executed');
let count=0; for(const f of burst.frames) { if(f.kind==='burst'&&f.burst) count=0; if(f.kind==='action'&&f.burst) { count++; assert.ok(count<=5); assert.equal(f.skillId,'repeat'); } }
const poisonParty = party.map((p,i)=>({...p,skills:i ? [] : [skill('poison',1,{effects:[{type:'poison',power:20,duration:3}]})]}));
const poison = simulateBattle({...input,party:poisonParty,rules:{...rules,initialSpRatio:1},waves:[[enemy('poisoned',{actionCount:1,stats:{hp:100,sp:1,atk:1,def:10000,luk:1}})]]});
assert.ok(poison.frames.some(f=>f.text.includes('毒 −')));
assert.ok(poison.analysis.find(a=>a.id==='p0').damage >= 20,'poison counted in raid damage and source analysis');
console.log('PASS seeded replay, five-person order, SP, enemy interrupts, skill priority, elements, wave carry, additive passives, phase, BURST cap');
