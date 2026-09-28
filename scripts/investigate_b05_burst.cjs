// Investigation only: instrumentation is compiled in memory; production engine is untouched.
const fs=require('fs'),path=require('path'),os=require('os'),ts=require('typescript'),Module=require('module'),assert=require('assert/strict');
const compile=s=>ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
require.extensions['.ts']=(m,f)=>m._compile(compile(fs.readFileSync(f,'utf8')),f);
const {simulateBattle}=require('../src/domain/redesign/battle.ts');
const {BATTLE_RULES,buildBattleParty,createInitialState}=require('../src/domain/redesign/masters.ts');
const {createFormalBattleInput}=require('../src/domain/redesign/formalBattleInput.ts');
const {projectRecordedBattleFrame,recordedBattleFrameDuration}=require('../src/domain/presentation/recordedBattlePresentation.ts');
const {recordedBattleSounds}=require('../src/audio/recordedBattleSound.ts');
const engine=path.resolve('src/domain/redesign/battleBalanceV2.ts');let source=fs.readFileSync(engine,'utf8');
const old='const choose = (u: Unit, discount = 1) => u.skills.find(s => usable(u, s) && Math.ceil(s.spCost * discount) <= (u.enemy ? u.sp : partySp));';assert(source.includes(old));
source=source.replace(old,`const choose = (u: Unit, discount = 1) => {
 const picked=u.skills.find(s => usable(u,s) && Math.ceil(s.spCost*discount)<=(u.enemy?u.sp:partySp));
 if(!u.enemy) (globalThis as any).__burstAudit.push({nextFrame:frames.length,actor:u.id,burst,gauge,sp:partySp,selected:picked?.id??'basic',candidates:u.skills.map((s,i)=>({id:s.id,priority:i+1,cost:Math.ceil(s.spCost*discount),condition:condition(u,s.condition),targets:[...new Set(s.effects.flatMap(e=>effectTargets(u,s,e,undefined,true).map(t=>t.id)))],reason:s.unsupportedReason?'unsupported':!condition(u,s.condition)?'condition_unmet':!usable(u,s)?'no_applicable_target':Math.ceil(s.spCost*discount)>partySp?'insufficient_sp':s===picked?'selected':'lower_priority'}))});
 return picked; };`);
const auditModule=new Module(engine,module);auditModule.filename=engine;auditModule.paths=module.paths;auditModule._compile(compile(source),engine);
const out='docs/verification/device-debug/b05';fs.mkdirSync(out,{recursive:true});
function summarize(result,decisions=[]){
 const episodes=[];let current;
 for(let i=0;i<result.frames.length;i++){const f=result.frames[i],prev=result.frames[i-1];
  if(f.event==='burst_start'){assert.equal(prev.burstGauge,200);assert.equal(f.burstGauge,0);current={id:episodes.length+1,start:i,actor:f.actorId,actions:[],timeline:[]};episodes.push(current);}
  if(!current)continue;
  const p=projectRecordedBattleFrame(result,i),action=f.event==='action_start'&&f.actorId===current.actor;
  if(action){const d=decisions.find(d=>d.nextFrame===i);current.actions.push({frame:i,skill:f.skillId,spBefore:prev.partySp,spAfter:f.partySp,cost:prev.partySp-f.partySp,candidates:d?.candidates??prev.skillStates?.[f.actorId],candidateSource:d?'instrumented pre-choice':'saved previous frame (not exact pre-choice audit)'});}
  current.timeline.push({frame:i,event:f.event,actor:f.actorId,skill:f.skillId,burst:f.burst,sp:[prev?.partySp,f.partySp],gauge:[prev?.burstGauge,f.burstGauge],targets:f.targetIds??[],actionNumber:current.actions.length,cutIn:p.cutIn,sounds:recordedBattleSounds(result,i),duration:recordedBattleFrameDuration(f)});
  assert.equal(f.burstGauge,0,`gauge increased inside burst ${i}`);
  if(f.event==='burst_end'){
   current.end=i;const actor=f.party.find(u=>u.id===current.actor);
   const actorDied=current.timeline.some(t=>t.event==='death'&&t.actor===current.actor);
   current.endReason=current.timeline.some(t=>t.event==='burst_interrupted')?'stunned':!f.enemies.some(e=>e.hp>0)?'enemies_defeated':actorDied||!actor?.hp?'actor_dead':f.playerActions>=300?'battle_action_limit':current.actions.length===5?'five_actions':'unclassified';
   current.burstCutIns=current.timeline.filter(t=>t.cutIn==='burst').length;current.burstSounds=current.timeline.filter(t=>t.sounds.includes('BATTLE_BURST')).length;
   current.next=result.frames.slice(i+1).find(x=>x.event==='action_start')?.event;current=null;
  }
 }
 const betweenBursts=episodes.slice(0,-1).map((e,n)=>({from:e.id,to:episodes[n+1].id,frames:result.frames.slice(e.end+1,episodes[n+1].start+1).filter(f=>['action_start','action_end','burst_failed','burst_start'].includes(f.event)).map(f=>({frame:f.index,event:f.event,sp:f.partySp,gauge:f.burstGauge,burst:f.burst}))}));
 for(const x of betweenBursts)assert(x.frames.some(f=>f.event==='action_end'&&f.gauge===200&&!f.burst));
 return {seed:result.seed,outcome:result.outcome,rulesVersion:result.rulesVersion,burstStarts:episodes.length,episodes,betweenBursts};
}
const unit=buildBattleParty(createInitialState('b05-offline'))[0];
const skill=(id,cost,condition={type:'always'})=>({id,name:id,image:'',rarity:'N',element:'fire',spCost:cost,condition,target:'first',effects:[{type:'damage',power:100}],description:'investigation fixture'});
function input(skills=[],enemyPatch={}){return createFormalBattleInput(1,[{...unit,id:'qa-actor',name:'調査行動者',passives:[],skills,stats:{hp:1000,atk:10,def:0,luk:0,sp:100}}],[[{...unit,id:'qa-enemy',name:'調査敵',passives:[],skills:[],stats:{hp:100000,atk:1,def:0,luk:0,sp:100},initialSp:0,hitSpGain:0,actionCount:1000,initialCount:1000,order:0,...enemyPatch}]],BATTLE_RULES);}
function run(name,make,predicate=()=>true){for(let seed=1;seed<=30;seed++){const x=make();x.seed=seed;global.__burstAudit=[];const a=auditModule.exports.simulateBalanceBattle(x),normal=simulateBattle(x);assert.deepEqual(a,normal,'instrumentation changed output');const s=summarize(a,global.__burstAudit);if(s.episodes.length&&predicate(s)){fs.writeFileSync(`${out}/${name}.json`,JSON.stringify({source:'synthetic deterministic isolated input; not user battle',input:x,result:s},null,2)+'\n');return s;}}throw Error('No scenario '+name);}
const cases={};
cases.usable=run('usable',()=>input([skill('attack-ready',1)]),s=>s.episodes[0].actions.length===5);
cases.spShortage=run('sp-shortage',()=>input([skill('too-expensive',1000)]));
cases.mixed=run('mixed',()=>input([skill('cost20',20)]),s=>s.episodes.some(e=>e.actions.some(a=>a.skill==='basic')&&e.actions.some(a=>a.skill==='cost20')));
cases.condition=run('conditions',()=>input([skill('hp-condition',1,{type:'hp_below',value:.2}),{...skill('heal-no-target',1),target:'lowest_ally',effects:[{type:'heal',power:10,healingFormula:'caster_atk_percent'}]},skill('attack-ready',1)]));
cases.priority=run('priority',()=>input([skill('priority-first',1),skill('priority-second',1)]));
const ownedState=createInitialState('b05-owned-not-equipped');assert(ownedState.skills.length>0);ownedState.deck.forEach(m=>m.skillIds=[]);assert(buildBattleParty(ownedState).every(u=>u.skills.length===0));
cases.notEquipped=run('not-equipped',()=>input());
cases.death=run('actor-death',()=>input([],{stats:{hp:100000,atk:100000,def:0,luk:0,sp:100},initialCount:11,actionCount:11}),s=>s.episodes[0].endReason==='actor_dead');
cases.kill=run('enemy-defeated',()=>input([],{stats:{hp:120,atk:1,def:0,luk:0,sp:100}}),s=>s.episodes[0].endReason==='enemies_defeated'&&s.episodes[0].actions.length<5);
cases.stun=run('stunned',()=>input([],{initialSp:1,initialCount:11,actionCount:1000,skills:[{...skill('enemy-stun',1),effects:[{type:'stun',power:1,chance:1,duration:1}]}]}),s=>s.episodes[0].endReason==='stunned');
cases.assist=run('area1-assist',()=>({...input([skill('attack-ready',1)]),earlyQuestAssist:{version:'area1-assist-v1-20260926',stageId:'mikawa-1',actionGainMultiplier:2,burstChance:.8}}));
assert(cases.usable.episodes[0].actions.every(a=>a.skill==='attack-ready'));
assert(cases.spShortage.episodes[0].actions.length===5&&cases.spShortage.episodes[0].actions.every(a=>a.skill==='basic'));
assert(cases.usable.episodes.length>1);assert.equal(cases.usable.episodes[0].burstCutIns,5);
const {createQuestBattleInput}=require('../src/domain/redesign/questMaster.ts'),{getQuestStage}=require('../src/domain/redesign/quests.ts');
const saved=[];for(let n=1;n<=5;n++){const r={battle:JSON.parse(fs.readFileSync(`${out}/saved-qa-stage${n}.json`))};const x=createQuestBattleInput(r.battle.seed,r.battle.party,getQuestStage(`mikawa-${n}`),BATTLE_RULES);global.__burstAudit=[];const rebuilt=auditModule.exports.simulateBalanceBattle(x);assert(require('util').isDeepStrictEqual(JSON.parse(JSON.stringify(rebuilt.frames)),r.battle.frames),`saved frames differ stage ${n}`);const s=summarize(r.battle,global.__burstAudit);saved.push({stage:`mikawa-${n}`,source:'Previously saved dedicated QA real API result (B03), not user-reported battle',reconstruction:'All reconstructed frames deep-equal original saved API frames; audit reasons are from exact replay, saved result unchanged',...s});if(n===1)fs.writeFileSync(`${out}/saved-qa-battle.json`,JSON.stringify(r.battle));}
fs.writeFileSync(`${out}/saved-qa-timelines.json`,JSON.stringify(saved,null,2)+'\n');
const summary={cases:Object.fromEntries(Object.entries(cases).map(([k,v])=>[k,{seed:v.seed,starts:v.burstStarts,first:v.episodes[0]}])),saved:saved.map(s=>({stage:s.stage,starts:s.burstStarts,episodes:s.episodes.map(e=>({start:e.start,end:e.end,actions:e.actions.length,reason:e.endReason,cutIns:e.burstCutIns}))}))};
fs.writeFileSync(`${out}/summary.json`,JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify({cases:Object.fromEntries(Object.entries(summary.cases).map(([k,v])=>[k,{seed:v.seed,starts:v.starts,actions:v.first.actions.length,end:v.first.endReason,cutIns:v.first.burstCutIns}])),saved:summary.saved},null,2));

