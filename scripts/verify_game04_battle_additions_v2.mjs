import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {BALANCE_V2_CHARACTER_ASSIGNMENTS as assignments,BALANCE_V2_LB_DISPLAY_ROWS as rows,BALANCE_V2_SKILL_CANDIDATES as candidates,BALANCE_V2_SKILL_ID_MAPPING as mapping,getCharacterPassive,getBalanceV2Skill} from '../src/domain/redesign/balanceV2Masters.ts';
import {CHARACTER_MASTERS as characterMasters,getCharacterStats} from '../src/domain/redesign/masters.ts';
import {simulateBattle} from '../src/domain/redesign/battle.ts';
import {input,unit,enemy,skill,passive,state,statuses,events,acts} from './game04-battle-additions/fixtures.mjs';
const failures=[],passed=[];
const test=(name,fn)=>{try{fn();passed.push(name);console.log('PASS',name);}catch(e){failures.push(name);console.error('FAIL',name,e.stack);}};
const run=(extra={})=>simulateBattle(input(extra));
const stats=(extra={})=>({hp:1000,sp:1,atk:100,def:0,luk:0,...extra});
const applied=(r,id,type)=>r.frames.find(f=>f.event==='effect_applied'&&f.targetIds?.includes(id)&&statuses(f,id,type).length);

test('01 P01/P02 strongest same type+element despite different character IDs; N-like recipient eligible',()=>{
 const a=unit('a',{passives:[passive('P01',10,{id:'charA',target:'party',targetElement:'fire'})]}),b=unit('b',{passives:[passive('P01',20,{id:'charB',target:'party',targetElement:'fire'})]}),n=unit('n');
 const r=run({party:[a,b,n,unit('water',{element:'water'})]});
 assert.equal(state(r.frames[0],'n').effectiveAtk,120);
 assert.equal(state(r.frames[0],'water').effectiveAtk,100);
});
test('02 damage modifier after DEF; no ATK inflation; conditional passive frozen within action',()=>{
 const plain=run({party:[unit('p',{stats:stats(),skills:[skill('strike',[{type:'damage',power:100}])]})],waves:[[enemy('e',{stats:stats({hp:100000,def:80})})]]});
 const boosted=run({party:[unit('p',{stats:stats(),passives:[passive('P06',20)],skills:[skill('strike',[{type:'damage',power:100}])]})],waves:[[enemy('e',{stats:stats({hp:100000,def:80})})]]});
 assert.equal(state(boosted.frames[0],'p').effectiveAtk,100);
 const d=100000-state(events(boosted,'damage')[0],'e').hp;assert.ok(d>=21&&d<=26,`post DEF damage ${d}`);
 assert.ok(d>100000-state(events(plain,'damage')[0],'e').hp);
 const scenario=percent=>run({party:[unit('p',{passives:[passive('P08',percent)],skills:[skill('compound',[{type:'def_down',power:10,duration:3},{type:'damage',power:100}])]})]});
 assert.equal(state(events(scenario(30),'damage')[0],'e').hp,state(events(scenario(0),'damage')[0],'e').hp,'new debuff cannot turn on start-snapshot passive');
});
test('03 DoT does not tick on application, does on each execution',()=>{
 const r=run({party:[unit('p',{stats:stats(),skills:[skill('dot',[{type:'dot',power:10,duration:3}],{target:'self'})]})]});
 const first=acts(r,'p')[0];assert.equal(state(first,'p').hp,1000);assert.equal(statuses(first,'p','dot')[0].remaining,3);
 const second=acts(r,'p')[1];assert.equal(state(second,'p').hp,990);assert.equal(statuses(second,'p','dot')[0].remaining,2);
});
test('04 periodic sum floors once; cap retains raw strength and independent duration',()=>{
 const party=[1,2,3].map(i=>unit('p'+i,{stats:stats({atk:10.5}),skills:[skill('dot'+i,[{type:'damage',power:0},{type:'dot',power:100,duration:i}])]}));
 const r=run({party,waves:[[enemy('e',{stats:stats({hp:100000}),initialCount:3,actionCount:10000})]]});
 const before=acts(r,'p3')[0];assert.equal(statuses(before,'e','dot').length,3);
 const dot=events(r,'dot')[0];assert.equal(state(before,'e').hp-state(dot,'e').hp,21,'31.5 raw capped to21 then floored');
 const end=acts(r,'e')[0];assert.equal(statuses(end,'e','dot').length,2);

});
test('05 shield cap clips new amount, no hidden excess; no same-ID refresh',()=>{
 const r=run({party:[unit('p',{stats:stats(),skills:[skill('shieldA',[{type:'shield',power:400,duration:3}],{target:'self'}),skill('shieldB',[{type:'shield',power:400,duration:3}],{target:'self'})]})]});
 const fs=acts(r,'p');assert.equal(statuses(fs[0],'p','shield').reduce((n,s)=>n+s.amount,0),400);
 assert.equal(fs[1].skillId,'shieldB');assert.equal(statuses(fs[1],'p','shield').reduce((n,s)=>n+s.amount,0),500);
 assert.equal(statuses(fs[1],'p','shield').find(s=>s.sourceSkillId==='shieldB').amount,100);
});
test('06 direct shield absorption still gains enemy SP; multi-hit and multiple effects gain once',()=>{
 const p=unit('p',{stats:stats({hp:100000,atk:1}),skills:[skill('multi',[{type:'damage',power:1,displayHits:5},{type:'damage',power:1}])]});
 const e=enemy('e',{stats:stats({hp:100000,sp:10}),hitSpGain:3,initialCount:1,actionCount:10000,skills:[skill('shield',[{type:'shield',power:1000,duration:9}],{spCost:10,target:'self'})]});
 const r=run({party:[p],waves:[[e]]});const f=acts(r,'p')[1];assert.equal(state(f,'e').sp,3);assert.equal(state(f,'e').hp,99998,'subsequent two attacks fully shielded');
});
test('07 taunt redirects ordinary attack but not fixed last Target Rule',()=>{
 const enemies=[enemy('e0',{initialCount:1,skills:[skill('taunt',[{type:'taunt',power:100,duration:5}],{spCost:1,target:'self'})]}),enemy('e1')];
 const r=run({party:[unit('p',{skills:[skill('last',[{type:'damage',power:100}],{target:'last',fixedTarget:true})]})],waves:[enemies]});
 assert.ok(events(r,'damage').filter(f=>f.actorId==='p').every(f=>f.targetIds[0]==='e1'));
});
test('08 counter once per attacked unit, no action opportunity/resource',()=>{
 const r=run({party:[unit('p',{stats:stats({hp:100000}),skills:[skill('stance',[{type:'counter',power:50,duration:3}],{target:'self'})]})],waves:[[enemy('e',{stats:stats({hp:100000}),initialCount:1,actionCount:10000,skills:[skill('strike',[{type:'damage',power:100,displayHits:8}],{spCost:1})]})]]});
 const counters=events(r,'counter');assert.equal(counters.length,1);assert.equal(counters[0].playerActions,1);assert.equal(counters[0].burstGauge,10);
});
test('09 cleanse counts independent ATK/DEF effects; pure empty cleanse skipped',()=>{
 const r=run({party:[unit('p',{skills:[skill('strip',[{type:'cleanse',power:1,cleanseCategory:'buff'}])]})],waves:[[enemy('e',{initialCount:1,actionCount:10000,skills:[skill('buff',[{type:'atk_up',power:10,duration:3},{type:'def_up',power:20,duration:3}],{target:'self',spCost:1})]})]]});
 assert.equal(acts(r,'p')[0].skillId,'basic');assert.equal(acts(r,'p')[1].skillId,'strip');
 assert.equal(state(acts(r,'p')[1],'e').statuses.filter(s=>['atk_up','def_up'].includes(s.type)).length,1);
});
test('10 last enemy kill then DoT, mutual annihilation loses; completed resources still awarded',()=>{
 const p=unit('p',{stats:stats({hp:1,atk:100}),skills:[skill('self-dot',[{type:'dot',power:100,duration:3}],{target:'self'})]});
 const r=run({party:[p],waves:[[enemy('e',{stats:stats({hp:1})})]]});
 assert.equal(r.outcome,'lose');assert.equal(state(r.frames.at(-1),'e').hp,0);assert.equal(state(r.frames.at(-1),'p').hp,0);
 assert.equal(r.frames.at(-1).partySp,30);assert.equal(r.playerActions,2);
});
test('11 death+auto-revive clears queued HoT and counter; no zombie pending replay',()=>{
 const p=unit('p',{stats:stats({hp:10,atk:100}),deathEffects:[{type:'revive',power:50,healingFormula:'target_max_hp_percent'}],skills:[skill('setup',[{type:'dot',power:100,duration:3},{type:'hot',power:100,duration:3}],{target:'self'})]});
 const r=run({party:[p]});const revive=events(r,'revive')[0];assert.ok(revive);const end=r.frames.slice(revive.index).find(f=>f.event==='action_end');
 assert.equal(state(end,'p').hp,5);assert.equal(state(end,'p').statuses.length,0);
});
test('12 deterministic input and seed; original input immutable; 300 rules retained',()=>{
 const i=input({party:[unit('p',{skills:[skill('dot',[{type:'dot',power:5,duration:3}]),skill('guard',[{type:'shield',power:50,duration:3}],{target:'self'})]})]});const before=structuredClone(i);
 const a=simulateBattle(i),b=simulateBattle(i);assert.deepEqual(a,b);assert.deepEqual(i,before);assert.equal(a.rulesVersion,'balance-v2-20260920');assert.ok(a.playerActions<=300);
});

test('13 45 formal assignments, N none, passive level 0/2/4/6/8/10',()=>{
 assert.equal(assignments.length,45);assert.deepEqual(['R','SR','SSR'].map(r=>assignments.filter(a=>a.rarity===r).length),[20,15,10]);
 const doc=readFileSync('docs/product/GAME04_BALANCE_AUTHORITY_V2_2026-09-20.md','utf8');
 for(const a of assignments){assert.ok(doc.includes(`| ${a.name} |`),a.name);for(let awakening=0;awakening<=5;awakening++){const p=getCharacterPassive(a,awakening);assert.equal(p.level,awakening*2);assert.equal(p.type,a.passiveType);assert.ok(p.percent>0);}}
 assert.equal(getCharacterPassive({id:assignments[0].id,rarity:'N',element:'fire'},5),undefined);
});
test('14 72 x 11 candidate rows independently match authority table and unrounded growth',()=>{
 assert.equal(candidates.length,72);assert.equal(rows.length,792);assert.deepEqual(['N','R','SR','SSR'].map(r=>candidates.filter(a=>a.rarity===r).length),[9,33,16,14]);
 const doc=readFileSync('docs/product/GAME04_BALANCE_AUTHORITY_V2_2026-09-20.md','utf8');
 const table=[...doc.matchAll(/^\| (SKD\d+) \| [^|]+ \| (\d+) \| (\d+) \| (\d+) \| ([^|]+) \|$/gm)];assert.equal(table.length,792);
 for(const m of table){const [,id,lb,sp,burst,description]=m,s=getBalanceV2Skill(id,+lb),row=rows.find(r=>r.designId===id&&r.lb===+lb);assert.equal(s.spCost,+sp);assert.equal(Math.ceil(s.spCost/2),+burst);assert.equal(row.sp,+sp);for(const e of row.displayEffects)assert.ok(description.includes(`${e.label}:${e.value.toFixed(2)}${e.unit}`));const a=getBalanceV2Skill(id,0),b=getBalanceV2Skill(id,10);s.effects.forEach((e,i)=>{const expected=a.effects[i].power+(b.effects[i].power-a.effects[i].power)*(+lb/10)**1.25;assert.ok(Math.abs(e.power-expected)<1e-8);});}
 assert.ok(mapping.every(m=>m.legacyId===null&&m.candidateId.startsWith('qa_')),'no silent owned-ID replacement');
});

test('15 given+received healing add, not multiply; revival excludes both',()=>{
 const p=unit('p',{stats:stats({hp:100}),passives:[passive('P10',20),passive('P11',30)],skills:[skill('heal',[{type:'heal',power:10,healingFormula:'caster_atk_percent'}],{target:'lowest_ally'})]});
 const r=run({party:[p],waves:[[enemy('e',{stats:stats({atk:60,hp:100000}),initialCount:1,actionCount:10000})]]});
 const heal=events(r,'heal')[0];assert.ok(heal);assert.equal(state(heal,'p').hp-state(r.frames[heal.index-1],'p').hp,15);
 const revive=run({party:[unit('p',{stats:stats({hp:10}),passives:p.passives,deathEffects:[{type:'revive',power:50,healingFormula:'target_max_hp_percent'}]})],waves:[[enemy('e',{stats:stats({atk:1000,hp:100000}),initialCount:1,actionCount:10000})]]});
 assert.equal(state(events(revive,'revive')[0],'p').hp,5);
});
test('16 stun skip neither ticks nor decrements DoT; actual subsequent action does',()=>{
 const r=run({party:[unit('p',{stats:stats()})],waves:[[enemy('e',{stats:stats({hp:100000}),initialCount:1,actionCount:10000,skills:[skill('bind',[{type:'dot',power:10,duration:3},{type:'stun',power:100,chance:1}],{spCost:1})]})]]});
 const skip=events(r,'stun_skip')[0];assert.ok(skip);assert.equal(state(skip,'p').hp,1000);assert.equal(statuses(skip,'p','dot')[0].remaining,3);
 const next=r.frames.slice(skip.index+1).find(f=>f.event==='action_end'&&f.actorId==='p');assert.equal(state(next,'p').hp,990);assert.equal(statuses(next,'p','dot')[0].remaining,2);
});
test('17 dead and revived counter owner cannot execute deleted pending counter',()=>{
 const r=run({party:[unit('p',{stats:stats({hp:100000})})],waves:[[enemy('e',{stats:stats({hp:150}),initialCount:1,actionCount:10000,deathEffects:[{type:'revive',power:100,healingFormula:'target_max_hp_percent'}],skills:[skill('counter',[{type:'counter',power:100,duration:3}],{spCost:1,target:'self'})]})]]});
 const revive=events(r,'revive')[0];assert.ok(revive);const next=r.frames.slice(revive.index).find(f=>f.event==='action_end');assert.equal(events(r,'counter').filter(f=>f.index>=revive.index&&f.index<=next.index).length,0);assert.equal(state(revive,'e').sp,0);
});
test('18 counter hit SP deferred to end of entire enemy block, death discards pending',()=>{
 const setup=[{type:'counter',power:1,duration:3}];
 const scenario=hp=>run({party:[unit('p',{stats:stats({hp:100000}),skills:[skill('counter',setup,{target:'self'})]})],waves:[[enemy('e',{stats:stats({hp,sp:2}),hitSpGain:3,initialCount:1,actionCount:10000,skills:[skill('hit',[{type:'damage',power:1}],{spCost:1})]})]]});
 const r=scenario(100000),block=events(r,'interrupt_end')[0];assert.equal(acts(r,'e').filter(f=>f.index<block.index).length,2,'deferred gains cannot fund same block');assert.equal(state(block,'e').sp,2);
 const dead=scenario(1);assert.equal(state(dead.frames.at(-1),'e').hp,0);assert.equal(state(dead.frames.at(-1),'e').sp,0);
});
test('19 300th last kill still processes lethal DoT, mutual annihilation not victory',()=>{
 const p=unit('p',{stats:stats({hp:1,atk:1}),skills:[skill('late-dot',[{type:'dot',power:100,duration:3}],{target:'self',condition:{type:'every_n_actions',value:299}})]});
 const r=run({party:[p],waves:[[enemy('e',{stats:stats({hp:299,def:999})})]]});assert.equal(r.playerActions,300);assert.equal(r.outcome,'lose');assert.equal(state(r.frames.at(-1),'p').hp,0);assert.equal(state(r.frames.at(-1),'e').hp,0);
});
test('20 stun cleanse gives common immunity; no empty pure cleanse spend',()=>{
 const party=[unit('a'),unit('b',{skills:[skill('unbind',[{type:'cleanse',power:1,cleanseCategory:'stun'}],{target:'first_ally'})]})];
 const r=run({party,waves:[[enemy('e',{initialCount:1,actionCount:10000,skills:[skill('stun',[{type:'stun',power:100,chance:1}],{spCost:1})]})]]});
 const f=events(r,'cleanse')[0];assert.ok(f);assert.equal(state(f,'a').stunImmune,true);assert.equal(statuses(f,'a','stun').length,0);
});

test('21 P03 diversity, P04 excludes owner, P15 high HP and P16 active-buff existence',()=>{
 const a=unit('a',{stats:stats({def:100}),passives:[passive('P03',40),passive('P04',40,{stat:'def'}),passive('P15',20,{stat:'def'})]});
 const r=run({party:[a,unit('b',{element:'water'}),unit('c',{element:'wind'})]});assert.equal(state(r.frames[0],'a').effectiveAtk,120);assert.equal(state(r.frames[0],'a').effectiveDef,150,'DEF passive cap');
 const two=run({party:[a,unit('b',{element:'water'})]});assert.equal(state(two.frames[0],'a').effectiveDef,120,'P04 other allies only one element');
 const u=unit('p',{stats:stats({def:100}),passives:[passive('P16',30,{stat:'def'})],skills:[skill('cancelled-atk',[{type:'atk_up',power:20,duration:3},{type:'atk_down',power:20,duration:3}],{target:'self'})]});
 const f=acts(run({party:[u]}),'p')[0];assert.equal(state(f,'p').effectiveAtk,100);assert.equal(state(f,'p').effectiveDef,130,'buff exists even at net zero');
});
test('22 P14 switches only after action-end HP threshold; P12 applies shield correction before cap',()=>{
 const r=run({party:[unit('p',{stats:stats({hp:100}),passives:[passive('P14',40)]})],waves:[[enemy('e',{stats:stats({hp:100000,atk:70}),initialCount:1,actionCount:10000})]]});
 const end=acts(r,'e')[0];assert.ok(state(end,'p').hp<=40);assert.equal(state(end,'p').effectiveAtk,140);
 const shield=run({party:[unit('p',{stats:stats(),passives:[passive('P12',30)],skills:[skill('guard',[{type:'shield',power:100,duration:3}],{target:'self'})]})]});assert.equal(statuses(acts(shield,'p')[0],'p','shield')[0].amount,130);
});
test('23 shield absorption shortest remaining first, ties oldest first',()=>{
 const party=[unit('p',{stats:stats({hp:10000}),skills:[skill('long',[{type:'shield',power:100,duration:9}],{target:'self'}),skill('short',[{type:'shield',power:100,duration:3}],{target:'self'})]})];
 const r=run({party,waves:[[enemy('e',{stats:stats({hp:100000,atk:50}),initialCount:2,actionCount:10000})]]});
 const f=acts(r,'e')[0],sh=statuses(f,'p','shield');assert.equal(sh.find(s=>s.sourceSkillId==='long').amount,100);assert.ok(sh.find(s=>s.sourceSkillId==='short').amount<100);
});
test('24 applied enemy DoT persists after caster dies, no hit SP from DoT',()=>{
 const r=run({party:[unit('a',{stats:stats({hp:1}),skills:[skill('dot',[{type:'dot',power:10,duration:3}])]}),unit('b')],waves:[[enemy('e',{stats:stats({hp:100000,sp:10}),hitSpGain:4,initialCount:1,actionCount:10000,skills:[skill('kill',[{type:'damage',power:100}],{spCost:10})]})]]});
 const dot=events(r,'dot')[0];assert.ok(dot);assert.equal(state(dot,'a').hp,0);assert.equal(state(dot,'e').sp,0);assert.ok(statuses(dot,'e','dot').length);
});

test('25 all-target composite cleanse reaches different category holders (SKD071)',()=>{
 const a=unit('a',{skills:[skill('bad-atk',[{type:'atk_down',power:10,duration:9}],{target:'self'})]}),b=unit('b',{skills:[skill('bad-dot',[{type:'dot',power:1,duration:9}],{target:'self'})]}),c=unit('c',{skills:[{...getBalanceV2Skill('SKD071',0),spCost:0}]});
 const r=run({party:[a,b,c]});const end=acts(r,'c')[0];assert.equal(statuses(end,'a','atk_down').length,0);assert.equal(statuses(end,'b','dot').length,0);assert.equal(events(r,'cleanse').filter(f=>f.index<end.index).length,2);
});
test('26 all 60 character projections preserve IDs; N15 passive none; attack HP DEF anchors exact',()=>{
 assert.equal(characterMasters.length,60);assert.equal(characterMasters.filter(c=>c.rarity==='N').length,15);assert.ok(characterMasters.filter(c=>c.rarity==='N').every(c=>!c.passive));
 const doc=readFileSync('docs/product/GAME04_BALANCE_AUTHORITY_V2_2026-09-20.md','utf8');const names={fire:'火',water:'水',earth:'土',wind:'風',light:'光',dark:'闇'};
 for(const a of assignments){assert.ok(doc.includes(`| ${a.name} | ${names[a.element]} | ${a.role} | ${a.passiveType}：`),a.name);const c=characterMasters.find(c=>c.id===a.id);assert.equal(c.element,a.element);assert.equal(c.role,a.role);assert.equal(c.rarity,a.rarity);}
 const expected={N:[[600,4600,13600],[30,380,1230]],R:[[750,6300,19300],[40,550,1850]],SR:[[1050,9700,30700],[60,880,3180]],SSR:[[1500,14200,47200],[90,1400,5150]]};
 for(const [rarity,[hp,def]] of Object.entries(expected)){const c={...characterMasters.find(c=>c.rarity===rarity),role:'攻撃'};[1,50,100].forEach((level,i)=>{const actual=getCharacterStats(c,level,5);assert.equal(actual.hp,hp[i]);assert.equal(actual.def,def[i]);});}
});
test('27 300th unresolved action emits no subsequent phase or interrupt',()=>{
 const r=run({party:[unit('p',{stats:stats({atk:1})})],waves:[[enemy('e',{stats:stats({hp:10000,def:999}),phases:[{hpBelow:.97005,name:'late-phase',actionCount:1}],initialCount:300})]]});
 assert.equal(r.playerActions,300);assert.equal(r.reason,'action_limit');const end=acts(r,'p').at(-1);assert.equal(r.frames.slice(end.index+1).filter(f=>['phase','interrupt_start'].includes(f.event)).length,0);
});

test('28 P03 diversity remains snapshotted when ally dies midway through compound action',()=>{
 const scenario=pas=>run({party:[unit('p',{stats:stats(),passives:[pas],skills:[skill('compound',[{type:'damage',power:1,target:'all_allies'},{type:'damage',power:100}])]}),unit('fragile',{element:'water',stats:stats({hp:1})}),unit('survivor',{element:'wind'})]});
 const dynamic=scenario(passive('P03',40)),fixed=scenario({id:'fixed-test',name:'fixed',stat:'atk',percent:20,target:'self'});
 const hit=r=>events(r,'damage').find(f=>f.targetIds?.includes('e'));assert.equal(state(hit(dynamic),'fragile').hp,0);assert.equal(state(hit(dynamic),'e').hp,state(hit(fixed),'e').hp);
});
test('29 highest enemy ATK Target Rule uses current buffed ATK',()=>{
 const p=unit('p',{skills:[skill('weaken',[{type:'atk_down',power:10,duration:3}],{target:'highest_atk_enemy',condition:{type:'every_n_actions',value:2}})]});
 const e0=enemy('e0',{stats:stats({hp:100000,atk:100}),initialCount:1,actionCount:10000,skills:[skill('boost',[{type:'atk_up',power:50,duration:3}],{spCost:1,target:'self'})]}),e1=enemy('e1',{stats:stats({hp:100000,atk:140})});
 const r=run({party:[p],waves:[[e0,e1]]});const f=r.frames.find(f=>f.event==='effect_applied'&&f.skillId==='weaken');assert.deepEqual(f.targetIds,['e0']);
});

console.log(JSON.stringify({status:failures.length?'FAIL':'PASS',masterStatus:'TEST_ONLY_NOT_BALANCE_APPROVAL',passed:passed.length,failures}));
if(failures.length)process.exitCode=1;
