/** Local planning only. Never alters enemies, shared HP, DB or accounts. */
import fs from 'node:fs';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),ts=require('typescript');require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
const {createInitialState,buildBattleParty,BATTLE_RULES,CHARACTER_MASTERS}=require('../src/domain/redesign/masters.ts');
const {createFormalInvasionMaster}=require('../src/domain/redesign/raidInvasionMaster.ts');const {createFormalBattleInput}=require('../src/domain/redesign/formalBattleInput.ts');const {simulateBattle}=require('../src/domain/redesign/battle.ts');const {validateDeck}=require('../src/domain/redesign/growth.ts');
const {cumulativeExp,GROWTH_VERSION}=require('../src/domain/redesign/growthMaster.ts');
const file=process.argv[2];const raid=file?JSON.parse(fs.readFileSync(file,'utf8')).territorySnapshot.raidMaster:createFormalInvasionMaster('TI01',()=>0);
const state=createInitialState('invasion-qa-plan');
const selected=CHARACTER_MASTERS.filter(c=>c.rarity==='SR'&&c.role.includes('攻撃')).slice(0,5);
for(const c of CHARACTER_MASTERS.filter(c=>c.rarity==='SR'))if(selected.length<5&&!selected.includes(c))selected.push(c);
state.characters=selected.map(c=>({id:c.id,level:100,awakening:5,exp:cumulativeExp('character',c.rarity,100),growthVersion:GROWTH_VERSION}));state.deck=selected.map(c=>({characterId:c.id,skillIds:[],equipment:{}}));validateDeck(state,state.deck);
const party=buildBattleParty(state,BATTLE_RULES);let total=0;const stages=[];
for(const stage of raid.stages){let worst=0;const trials=[];for(const seed of [42,517,9271]){const result=simulateBattle(createFormalBattleInput(seed,party,[stage.enemies],BATTLE_RULES));const contribution=Math.floor(result.totalDamage*(result.outcome==='win'?raid.victoryMultiplier:1));const battles=Math.ceil(stage.sharedHp/contribution);worst=Math.max(worst,battles);trials.push({seed,outcome:result.outcome,damage:result.totalDamage,contribution,battles});}total+=worst;stages.push({level:stage.level,sharedHp:stage.sharedHp,names:stage.enemies.map(e=>e.name),trials});}
console.log(JSON.stringify({scope:'Existing runtime buildBattleParty; no enemy/stat/result mutation; local planning not live acceptance',raidId:raid.id,state,party:party.map(c=>({id:c.id,name:c.name,level:c.level,stats:c.stats})),stages,totalBattlesWorstOfThree:total,totalEnergyWorstOfThree:total*raid.energyCost},null,2));
