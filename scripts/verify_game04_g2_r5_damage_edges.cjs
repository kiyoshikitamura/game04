const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
const resolve=Module._resolveFilename;Module._resolveFilename=function(n,p,...r){return resolve.call(this,n.startsWith('@/')?path.resolve(__dirname,'../src',n.slice(2)):n,p,...r)};
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
const {BATTLE_RULES}=require('../src/domain/redesign/masters.ts');
const {simulateBattle}=require('../src/domain/redesign/battle.ts');
const {createFormalBattleInput}=require('../src/domain/redesign/formalBattleInput.ts');
const skill=(id,target,effects,condition={type:'always'})=>({id,name:id,image:'',rarity:'N',element:'fire',spCost:1,condition,target,effects,description:''});
const unit=(id,hp,atk,skills=[])=>({id,name:id,image:'',level:1,element:'fire',stats:{hp,atk,def:0,sp:100,luk:0},skills,passives:[],initialSp:100,hitSpGain:10,initialCount:1,actionCount:1,order:0});
const cases=[
 ['multihit',[unit('p',10000,100,[skill('multi','first',[{type:'damage',power:10000,displayHits:7}])])],[unit('e',500,10)],['damage']],
 ['shield',[unit('p',10000,20)],[unit('e',200,50,[skill('shield','self',[{type:'shield',power:100,duration:3}])])],['shield_absorbed']],
 ['dot',[unit('p',10000,40,[skill('poison','first',[{type:'dot',power:100,duration:3}])])],[unit('e',200,10)],['dot']],
 ['counter',[unit('p',10000,40,[skill('counter','self',[{type:'counter',power:150,duration:3}])])],[unit('e',200,10)],['counter']],
 ['heal',[unit('p',10000,40)],[unit('e',200,50,[skill('heal','self',[{type:'heal',power:100,healingFormula:'caster_atk_percent'}],{type:'hp_below',value:0.8})])],['heal']],
 ['revive',[unit('p',10000,80)],[unit('front',70,10),unit('reviver',300,20,[skill('revive','dead_ally',[{type:'revive',power:50,healingFormula:'target_max_hp_percent'}],{type:'ally_dead'})])],['revive']],
];
const results=[];
for(const [name,party,enemies,required] of cases){
 const input=createFormalBattleInput(123,party,[enemies],BATTLE_RULES),old=simulateBattle(input),current=simulateBattle({...input,raidDamagePolicy:'actual-hp-v1-20260925'});
 const stripped={...current};delete stripped.actualHpDamage;assert.deepEqual(stripped,old,`${name}: legacy display/result unchanged`);
 const hp=new Map(enemies.map(e=>[e.id,e.stats.hp]));let observed=0;
 for(const frame of current.frames)for(const enemy of frame.enemies){observed+=Math.max(0,(hp.get(enemy.id)??enemy.hp)-enemy.hp);hp.set(enemy.id,enemy.hp);}
 assert.equal(current.actualHpDamage,observed,`${name}: damage equals independently reconstructed frame HP reductions`);
 for(const event of required)assert(current.frames.some(f=>f.event===event),`${name}: missing exercised ${event}`);
 if(name==='multihit'){assert.equal(current.actualHpDamage,500);assert(current.totalDamage>500);assert(current.frames.some(f=>f.hits?.length>1));}
 if(name==='heal'||name==='revive')assert(current.actualHpDamage>enemies.reduce((n,e)=>n+e.stats.hp,0),`${name}: healed/revived HP counted again`);
 results.push({name,events:required,outcome:current.outcome,displayDamage:current.totalDamage,actualHpDamage:current.actualHpDamage,reconstructedHpLoss:observed,displayAndFramesUnchanged:true});
}
console.log(JSON.stringify({status:'PASS',scope:'synthetic local combat edge cases; no DB changes or balance approval',results},null,2));
