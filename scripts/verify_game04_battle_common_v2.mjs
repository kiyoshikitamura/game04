import assert from 'node:assert/strict';
import { simulateBattle as simulateLegacy } from '../src/domain/redesign/battleLegacy.ts';
import { simulateBattle, commonSpGain, commonBurstChance, splitDisplayDamage } from '../src/domain/redesign/battle.ts';
import { rules, skill, unit, enemy, input, actions, enemyActions } from './game04-battle-common/fixtures.mjs';

// Every master in this suite is TEST_ONLY. These tests approve mechanics, never economy/balance.
const passed=[];
const failures=[];
function test(name,fn){try{fn();passed.push(name);console.log('PASS',name);}catch(error){failures.push(name);console.error('FAIL',name,error.stack);}}
const simulate=(extra={})=>simulateBattle(input(extra));
const player=(f,id='p0')=>f.party.find(u=>u.id===id);
const foe=(f,id='e')=>f.enemies.find(u=>u.id===id);
const hpDrop=(r,n=0)=>{const fs=actions(r),before=n===0?r.frames[0]:fs[n-1];return before.enemies[0].hp-fs[n].enemies[0].hp;};

test('01 damage: exact DEF subtraction, floor, elements and minimum 1',()=>{
 const mulberry=(seed)=>{let t=(seed+0x6D2B79F5)|0;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};
 for(const [attack,defend,mult] of [['fire','wind',1.5],['wind','fire',.75],['light','dark',1.5],['dark','light',1.5],['fire','fire',1],['fire','light',1]]){
  const party=input().party;party[0]=unit('p0',{element:attack,stats:{hp:100000,sp:9999,atk:100.7,def:0,luk:0}});
  const r=simulate({party,waves:[[enemy('e',{element:defend,stats:{hp:100000,sp:1,atk:1,def:20.3,luk:0}})]]});
  assert.equal(hpDrop(r),Math.max(1,Math.floor((100.7-20.3)*mult*(.9+.2*mulberry(42)))));
 }
 const r=simulate({waves:[[enemy('e',{stats:{hp:100000,sp:1,atk:1,def:100000,luk:0}})]]});
 assert.equal(hpDrop(r),1);
 assert.ok(r.frames.every(f=>!f.text.includes('CRITICAL')));
});

test('02 SP fixed 400/initial 0; LUK gains; capped SP still increases gauge',()=>{
 for(const [luk,gain] of [[0,20],[25,22],[50,25],[75,27],[100,30],[999,30]]){
  const party=input().party;party[0]=unit('p0',{stats:{hp:100000,sp:9999,atk:100,def:0,luk}});
  const r=simulate({party});assert.equal(r.frames[0].partySp,0);assert.equal(r.frames[0].maxSp,400);
  assert.equal(actions(r)[0].partySp,gain);assert.equal(actions(r)[0].burstGauge,gain);
 }
 assert.equal(commonSpGain(-10,true),20);assert.equal(commonBurstChance(-10),.5);assert.equal(commonBurstChance(1000),.8);
 const r=simulate();const fs=actions(r);assert.ok(fs.some((f,i)=>i>0&&!f.burst&&f.partySp===400&&fs[i-1].partySp===400&&f.burstGauge>fs[i-1].burstGauge),'overflow gain still reaches independent gauge');
});

test('03 BURST success/failure; replaces normal action, fallback basic, zero resource gains',()=>{
 let success,failed;
 for(let seed=1;seed<=20&&(!success||!failed);seed++){
  const r=simulate({seed});
  if(r.frames.some(f=>f.kind==='burst'&&f.burst))success??=r;
  if(r.frames.some(f=>f.kind==='burst'&&!f.burst&&/失敗/.test(f.text)))failed??=r;
 }
 assert.ok(success,'success sample');assert.ok(failed,'failure sample');
 const start=success.frames.findIndex(f=>f.kind==='burst'&&f.burst);
 const previous=success.frames.slice(0,start).filter(f=>f.kind==='action'&&f.event==='action_end').at(-1);
 assert.equal(previous.burstGauge,200,'full gauge made by prior action');
 assert.notEqual(previous.actorId,success.frames[start].actorId,'next deck character draws');
 const block=success.frames.slice(start+1).slice(0,success.frames.slice(start+1).findIndex(f=>f.kind==='burst'&&!f.burst));
 const burstActs=block.filter(f=>f.kind==='action'&&f.event==='action_end');
 assert.equal(burstActs.length,5);assert.ok(burstActs.every(f=>f.skillId==='basic'));
 assert.ok(burstActs.every(f=>f.partySp===success.frames[start].partySp&&f.burstGauge===0));
});

test('04 slot order and SP cannot borrow future gain',()=>{
 const party=input().party;party[0]=unit('p0',{skills:[skill('cheap-first',1),skill('expensive-second',50)]});
 const r=simulate({party});const fs=actions(r).filter(f=>f.actorId==='p0');
 assert.equal(fs[0].skillId,'basic','initial 0 SP prevents 1 SP skill');
 assert.equal(fs[1].skillId,'cheap-first','slot beats cost');
 assert.equal(fs[1].spDelta,9);
});

test('04b healing auto conditions, target and final floor; max HP cap',()=>{
 const party=input().party.map(p=>({...p,stats:{...p.stats,hp:100,atk:10}}));
 party[1].skills=[skill('single-heal',1,{target:'lowest_ally',effects:[{type:'heal',power:55,healingFormula:'caster_atk_percent'}]})];
 const r=simulate({party,waves:[[enemy('e',{initialCount:1,actionCount:10000,stats:{hp:100000,sp:1,atk:60,def:0,luk:0}})]]});
 const h=actions(r).find(f=>f.skillId==='single-heal');assert.ok(h);
 const before=r.frames.slice(0,h.index).findLast(f=>f.event==='action_start'&&f.actorId==='p1');assert.equal(player(h).hp-player(before).hp,5,'5.5 final heal floors to 5');
 const full=simulate({party});assert.ok(actions(full).every(f=>f.skillId!=='single-heal'),'no injured target means no consumption');
 party[1].skills=[skill('all-heal',1,{target:'all_allies',effects:[{type:'heal',power:99999,healingFormula:'caster_atk_percent'}]})];
 const aoe=simulate({party,waves:[[enemy('e',{initialCount:1,actionCount:10000,stats:{hp:100000,sp:1,atk:60,def:0,luk:0},skills:[skill('all-hit',1,{target:'all_enemies'})]})]]});
 const heal=actions(aoe).find(f=>f.skillId==='all-heal');assert.ok(heal);assert.ok(heal.party.every(p=>p.hp===p.maxHp));
});

test('05 independent buff intensity survives cap; same skill not refreshed',()=>{
 const party=input().party;
 party[0]=unit('p0',{skills:[skill('plus40',1,{target:'self',effects:[{type:'atk_up',power:40,duration:2}]}),skill('plus25',1,{target:'self',effects:[{type:'atk_up',power:25,duration:5}]})]});
 const r=simulate({party});const fs=actions(r).filter(f=>f.actorId==='p0');
 const pair=fs.find(f=>player(f).statuses.some(s=>s.power===40)&&player(f).statuses.some(s=>s.power===25));
 assert.ok(pair,'both raw strengths retained');assert.equal(player(pair).effectiveAtk,150,'combined positive cap applies only to effective value');
 assert.ok(fs.some(f=>player(f).statuses.some(s=>s.power===25)&&!player(f).statuses.some(s=>s.power===40)),'independent expiration');
 assert.ok(fs.some(f=>f.skillId==='plus25'),'same source still active skips to next slot');
});

test('06 enemy stun skips whole block; resistance until actual action',()=>{
 const party=input().party;party[1]=unit('p1',{skills:[skill('stun',1,{effects:[{type:'stun',power:100,chance:1}]})]});
 const r=simulate({party,waves:[[enemy('e',{initialCount:2,actionCount:2,stats:{hp:100000,sp:3,atk:1,def:0,luk:0},skills:[skill('enemy-chain',1)]})]]});
 assert.ok(r.frames.some(f=>/行動不能/.test(f.text)),'skip recorded');
 const firstActions=enemyActions(r);assert.ok(firstActions.length>0,'enemy eventually acts instead of stun lock');
});

test('07 simultaneous interrupts use enemy order; positive SP chain not fixed 3',()=>{
 const r=simulate({waves:[[enemy('e0',{order:2,initialCount:1,actionCount:10000}),enemy('e1',{order:0,initialCount:1,actionCount:10000,stats:{hp:100000,sp:4,atk:1,def:0,luk:0},skills:[skill('first-priority',1),skill('expensive',4)]}),enemy('e2',{order:1,initialCount:1,actionCount:10000})]]});
 const fs=enemyActions(r);assert.deepEqual(fs.slice(0,6).map(f=>f.actorId),['e1','e1','e1','e1','e2','e0']);
 assert.ok(fs.slice(0,4).every(f=>f.skillId==='first-priority'));
 assert.equal(fs.filter(f=>f.actorId==='e1').length,4,'no extra basic after skill chain');
});

test('08 automatic revive once; death chain resolves before victory and both dead loses',()=>{
 const r=simulate({waves:[[enemy('e',{stats:{hp:1,sp:5,atk:1,def:0,luk:0},deathEffects:[{type:'revive',power:100,healingFormula:'target_max_hp_percent'}]})]]});
 assert.equal(r.outcome,'win');assert.equal(actions(r).length,2,'one auto revive only');
 const all=simulate({party:input().party.map(p=>({...p,stats:{...p.stats,hp:1}})),waves:[[enemy('e',{stats:{hp:1,sp:1,atk:10000,def:0,luk:0},deathEffects:[{type:'damage',power:100,target:'all_enemies'}]})]]});
 assert.equal(all.outcome,'lose','simultaneous annihilation is loss');
 assert.ok(all.frames.at(-1).party.every(p=>p.hp===0));
});

test('09 phase one step/action; count preserved; SP cap clamps',()=>{
 const r=simulate({waves:[[enemy('e',{initialCount:10,actionCount:10,stats:{hp:10000,sp:50,atk:1,def:0,luk:0},phases:[{hpBelow:1,name:'phase-one',actionCount:2,maxSp:20},{hpBelow:1,name:'phase-two',actionCount:1,maxSp:10}]})]]});
 const ps=r.frames.filter(f=>f.kind==='phase');assert.equal(ps[0].enemies[0].phase,'phase-one');assert.equal(ps[0].enemies[0].count,10);assert.equal(ps[0].enemies[0].sp,20);
 assert.equal(ps[1].enemies[0].phase,'phase-two');assert.equal(ps[1].enemies[0].count,9);assert.equal(ps[1].enemies[0].sp,10);
 assert.ok(ps[1].index>ps[0].index+1);
});

test('09b compound ordering and chosen target does not migrate after death',()=>{
 const scenario=effects=>{const party=input().party;party[1]=unit('p1',{skills:[skill('compound',1,{effects})]});return simulate({party,waves:[[enemy('e',{stats:{hp:100000,sp:1,atk:1,def:90,luk:0}})]]});};
 const down={type:'def_down',power:50,duration:3},damage={type:'damage',power:100};
 const first=scenario([down,damage]),last=scenario([damage,down]);
 assert.ok(hpDrop(first,1)>hpDrop(last,1),'earlier DEF-down affects current hit');
 const party=input().party;party[1]=unit('p1',{skills:[skill('fixed-target',1,{effects:[damage,down]})]});
 const r=simulate({party,waves:[[enemy('e',{stats:{hp:150,sp:1,atk:1,def:0,luk:0}}),enemy('other')]]});
 const second=actions(r)[1];assert.equal(second.enemies[0].hp,0);assert.equal(second.enemies[1].statuses.length,0,'post-kill debuff cannot migrate');
});

test('10 Wave carries SP/gauge; 300th victory beats limit; unresolved is loss',()=>{
 const r=simulate({party:input().party.map(p=>({...p,stats:{...p.stats,atk:1}})),waves:[[enemy('e',{stats:{hp:299,sp:1,atk:1,def:999,luk:0}})],[enemy('e2',{stats:{hp:1,sp:1,atk:1,def:999,luk:0}})]]});
 assert.equal(r.playerActions,300);assert.equal(r.outcome,'win');assert.equal(r.wavesCleared,2);
 const w=r.frames.find(f=>f.kind==='wave');assert.ok(w.partySp>0);assert.equal(actions(r).filter(f=>f.wave===2).length,1);
 const timeout=simulate({waves:[[enemy('e',{initialCount:300,actionCount:300,stats:{hp:10000000,sp:1,atk:1,def:999,luk:0}})]]});
 assert.equal(timeout.outcome,'lose');assert.equal(timeout.playerActions,300);assert.equal(enemyActions(timeout).length,0,'no interrupt after exhausted budget');
});

test('01b all-target independent draws and presentation hits preserve total/minimum',()=>{
 const party=input().party;party[1]=unit('p1',{skills:[skill('aoe',1,{target:'all_enemies',effects:[{type:'damage',power:100,displayHits:7}]})]});
 const r=simulate({party,waves:[[enemy('e0'),enemy('e1'),enemy('e2')]]});
 const shots=r.frames.filter(f=>f.event==='damage'&&f.skillId==='aoe').slice(0,3);
 assert.equal(shots.length,3);assert.ok(new Set(shots.map(f=>f.hits.reduce((a,b)=>a+b,0))).size>1,'per-target random');
 for(const f of shots){assert.equal(f.hits.length,7);const before=r.frames[f.index-1].enemies.find(u=>u.id===f.targetIds[0]);const after=f.enemies.find(u=>u.id===f.targetIds[0]);assert.equal(f.hits.reduce((a,b)=>a+b,0),before.hp-after.hp);}
 assert.deepEqual(splitDisplayDamage(1,7),[1,0,0,0,0,0,0]);
 const minimum=simulate({party,waves:[[enemy('e',{stats:{hp:100000,sp:1,atk:1,def:100000,luk:0}})]]});
 assert.equal(minimum.frames.find(f=>f.event==='damage'&&f.skillId==='aoe').hits.reduce((a,b)=>a+b,0),1);
});

test('03b burst half SP rounds up; interrupts resume; skill unavailable falls back basic',()=>{
 const party=input().party.map(p=>({...p,skills:[skill('odd-cost',101,{condition:{type:'every_n_actions',value:3}})]}));
 const r=simulate({party,waves:[[enemy('e',{initialCount:1,actionCount:1,stats:{hp:100000,sp:1,atk:1,def:0,luk:0}})]]});
 const starts=r.frames.filter(f=>f.event==='action_start'&&f.burst&&f.skillId==='odd-cost');assert.ok(starts.length);
 for(const f of starts)assert.equal(r.frames[f.index-1].partySp-f.partySp,51);
 assert.ok(r.frames.some(f=>f.event==='burst_resume'));
 assert.ok(actions(r).some(f=>f.burst&&f.skillId==='basic'));
 assert.ok(actions(r).filter(f=>f.burst).every(f=>f.gaugeDelta===0&&f.spDelta<=0));
});

test('05b passive strongest same-id, independent cap and living-source fallback',()=>{
 const party=input().party;
 party[0]=unit('p0',{stats:{hp:1,sp:1,atk:100,def:0,luk:0},passives:[{id:'same',name:'strong',stat:'atk',percent:40,target:'party'}]});
 party[1].passives=[{id:'same',name:'weak',stat:'atk',percent:25,target:'party'}];
 party[2].passives=[{id:'other',name:'independent',stat:'atk',percent:20,target:'party'}];
 const r=simulate({party,waves:[[enemy('e',{initialCount:1,actionCount:10000,stats:{hp:100000,sp:1,atk:100,def:0,luk:0}})]]});
 assert.equal(player(r.frames[0],'p1').effectiveAtk,150);
 const second=actions(r)[1];assert.equal(second.actorId,'p1');assert.equal(player(second,'p1').effectiveAtk,145,'strong source death switches to weak25 + other20');
 const pair=r.frames.find(f=>f.event==='death'&&f.actorId==='p0');assert.ok(pair);
});

test('06b stun skip preserves ready gauge and active buff duration',()=>{
 const party=input().party;
 party[0].skills=[skill('selfbuff',1,{target:'self',effects:[{type:'atk_up',power:10,duration:3}]})];
 const r=simulate({party,waves:[[enemy('e',{initialCount:10,actionCount:1,stats:{hp:100000,sp:1,atk:1,def:0,luk:0},skills:[skill('stop-all',1,{target:'all_enemies',effects:[{type:'stun',power:100,chance:1}]})]})]]});
 const skips=r.frames.filter(f=>f.event==='stun_skip'&&f.kind==='action');assert.ok(skips.length);
 for(const f of skips){const before=r.frames[f.index-1];assert.equal(f.partySp,before.partySp);assert.equal(f.burstGauge,before.burstGauge);const old=before.party.find(p=>p.id===f.actorId);const now=player(f,f.actorId);assert.equal(now.stunImmune,true);assert.deepEqual(now.statuses.filter(s=>s.type!=='stun'),old.statuses.filter(s=>s.type!=='stun'));}
 const fullness=simulate({waves:[[enemy('e',{initialCount:10,actionCount:10000,stats:{hp:100000,sp:1,atk:1,def:0,luk:0},skills:[skill('stop-all',1,{target:'all_enemies',effects:[{type:'stun',power:100,chance:1}]})]})]]});
 const fullSkips=fullness.frames.filter(f=>f.event==='stun_skip'&&f.kind==='action');assert.equal(fullSkips.length,5);assert.ok(fullSkips.every(f=>f.burstGauge===200));
});

test('07b damage-received SP during enemy chain added only after block',()=>{
 const party=input().party;party[0]=unit('p0',{stats:{hp:1,sp:1,atk:1,def:0,luk:0},deathEffects:[{type:'damage',power:100,target:'all_enemies'}]});
 const r=simulate({party,waves:[[enemy('e',{initialCount:1,actionCount:10000,hitSpGain:1,stats:{hp:100000,sp:1,atk:100,def:0,luk:0},skills:[skill('strike',1)]})]]});
 const es=enemyActions(r);assert.equal(es.length,1,'pending incoming gain cannot fund same chain');assert.equal(es[0].enemies[0].sp,0);
 const end=r.frames.find(f=>f.event==='interrupt_end');assert.equal(end.enemies[0].sp,1,'pending gain credited afterwards');
});

test('08b simultaneous death effects order, queue chain and revival next turn',()=>{
 const party=input().party;party[0]=unit('p0',{stats:{hp:1,sp:1,atk:100,def:0,luk:0},deathEffects:[{type:'damage',power:1,target:'all_enemies'},{type:'revive',power:100,healingFormula:'target_max_hp_percent'}]});
 party[1]=unit('p1',{stats:{hp:1,sp:1,atk:100,def:0,luk:0},deathEffects:[{type:'damage',power:1,target:'all_enemies'}]});
 const r=simulate({party,waves:[[enemy('e',{initialCount:1,actionCount:10000,stats:{hp:100000,sp:1,atk:100,def:0,luk:0},skills:[skill('cleave',1,{target:'all_enemies'})]})]]});
 const de=r.frames.filter(f=>f.skillId?.startsWith('death:')&&['damage','revive'].includes(f.event));
 assert.deepEqual(de.slice(0,3).map(f=>f.skillId),['death:p0:0','death:p0:1','death:p1:0']);
 assert.deepEqual(actions(r).slice(0,5).map(f=>f.actorId),['p0','p2','p3','p4','p0']);
 const wave=simulate({party:[unit('p0',{stats:{hp:1,sp:1,atk:100,def:0,luk:0},deathEffects:[{type:'revive',power:100,healingFormula:'target_max_hp_percent'}]})],waves:[[enemy('one',{stats:{hp:1,sp:1,atk:100,def:0,luk:0},deathEffects:[{type:'damage',power:100}]})],[enemy('two',{initialCount:1,actionCount:1,stats:{hp:10000,sp:1,atk:100,def:0,luk:0}})]]});
 assert.equal(wave.frames.filter(f=>f.event==='revive'&&f.actorId==='p0').length,1,'once per battle across waves');assert.equal(wave.outcome,'lose');
});

test('03c mid-BURST stun skips next action, ends without refund, then deck advances',()=>{
 let r;
 for(let seed=1;seed<=20&&!r;seed++){
  const sample=simulate({seed,waves:[[enemy('e',{initialCount:11,actionCount:10000,stats:{hp:100000,sp:1,atk:1,def:0,luk:0},skills:[skill('mid-burst-stop',1,{target:'all_enemies',effects:[{type:'stun',power:100,chance:1}]})]})]]});
  if(sample.frames.some(f=>f.event==='burst_interrupted'))r=sample;
 }
 assert.ok(r);const interrupted=r.frames.find(f=>f.event==='burst_interrupted');const skipped=r.frames[interrupted.index-1];
 assert.equal(skipped.event,'stun_skip');assert.equal(skipped.actorId,interrupted.actorId);assert.equal(interrupted.burstGauge,0);assert.equal(interrupted.playerActions,12);
 const next=r.frames.slice(interrupted.index+1).find(f=>f.event==='stun_skip'||f.event==='action_start');assert.notEqual(next.actorId,interrupted.actorId);
});

test('08c enemy dies and revives inside own chain: SP0/count reset, block cannot resume',()=>{
 const party=input().party;party[0]=unit('p0',{stats:{hp:1,sp:1,atk:1,def:0,luk:0},deathEffects:[{type:'damage',power:100000000,target:'all_enemies'}]});
 const r=simulate({party,waves:[[enemy('e',{initialCount:1,actionCount:3,stats:{hp:100000,sp:5,atk:100,def:0,luk:0},skills:[skill('strike',1)],deathEffects:[{type:'revive',power:100,healingFormula:'target_max_hp_percent'}]})]]});
 const start=r.frames.find(f=>f.event==='interrupt_start');const end=r.frames.find(f=>f.event==='interrupt_end');
 assert.equal(r.frames.slice(start.index,end.index).filter(f=>f.event==='action_start'&&f.kind==='enemy').length,1);
 const revive=r.frames.find(f=>f.event==='revive'&&f.actorId==='e');assert.ok(revive);assert.equal(foe(revive).sp,0);assert.equal(foe(revive).count,1);assert.equal(foe(end).count,1);
});

test('09c passive remains fixed within compound even when its source reaches HP0',()=>{
 const party=input().party;party[1]=unit('p1',{skills:[skill('compound-all',1,{target:'all_enemies',effects:[{type:'damage',power:100},{type:'def_down',power:10,duration:3}]})]});
 const r=simulate({party,waves:[[enemy('e0',{stats:{hp:150,sp:1,atk:1,def:0,luk:0},passives:[{id:'def-source',name:'source',stat:'def',percent:50,target:'party'}]}),enemy('e1',{stats:{hp:100000,sp:1,atk:1,def:40,luk:0}})]]});
 const deaths=r.frames.find(f=>f.event==='death'&&f.actorId==='e0');assert.ok(deaths);
 const hits=r.frames.filter(f=>f.event==='damage'&&f.skillId==='compound-all').slice(0,2);assert.deepEqual(hits.map(f=>f.targetIds[0]),['e0','e1']);
 assert.equal(hits[1].enemies[1].effectiveDef,60,'passive before formal death cleanup');
 const end=r.frames.find(f=>f.event==='action_end'&&f.skillId==='compound-all');assert.equal(end.enemies[1].effectiveDef,36);
});

test('11b legacy versionless/explicit-v1 stays exact; unknown versions fail closed',()=>{
 const v=input();delete v.rules.version;assert.deepEqual(simulateBattle(v),simulateLegacy(v));
 assert.deepEqual(simulateBattle({...v,rules:{...v.rules,version:'legacy-v1'}}),simulateLegacy(v));
 assert.throws(()=>simulate({...input(),rules:{...rules,version:'unknown'}}),/Unsupported/);
});

test('11 seeded replay exact, inputs immutable, frame/log monotonic resource bounds',()=>{
 const v=input();const before=structuredClone(v);const a=simulateBattle(v);const b=simulateBattle(v);
 assert.deepEqual(a,b);assert.deepEqual(v,before);
 a.frames.forEach((f,i)=>{assert.equal(f.index,i);assert.ok(f.partySp>=0&&f.partySp<=400);assert.ok(f.burstGauge>=0&&f.burstGauge<=200);});
});
test('12 malformed/unsupported masters fail closed instead of resolving valid battle',()=>{
 const mutateAndReject=mutate=>{const v=input();mutate(v);assert.throws(()=>simulateBattle(v));};
 mutateAndReject(v=>v.party[0].stats.atk=NaN);
 mutateAndReject(v=>v.party[0].passives=[{id:'bad',name:'bad',stat:'atk',percent:NaN,target:'party'}]);
 mutateAndReject(v=>v.waves[0][0].phases=[{hpBelow:.5,name:'bad',maxSp:NaN}]);
 mutateAndReject(v=>v.party[0].skills=[skill('not-fixed',1,{effects:[{type:'sp',power:100}]})]);
 mutateAndReject(v=>v.party[0].skills=[skill('heal-undefined',1,{effects:[{type:'heal',power:100}]})]);
 mutateAndReject(v=>v.party[0].skills=[skill('stun-undefined',1,{effects:[{type:'stun',power:100}]})]);
 mutateAndReject(v=>v.waves[0][0].skills=[skill('free-enemy',0)]);
 mutateAndReject(v=>v.party[0].skills=[skill('independent-multihit',1,{effects:[{type:'damage',power:100},{type:'damage',power:100}]})]);
});
console.log(JSON.stringify({fixtureStatus:'TEST_ONLY_NOT_BALANCE_APPROVAL',passed,failed:failures},null,2));
if(failures.length)process.exitCode=1;
