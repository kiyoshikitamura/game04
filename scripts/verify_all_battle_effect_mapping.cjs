const fs=require('fs'),assert=require('assert/strict'),ts=require('typescript'),Module=require('module'),path=require('path');
const resolve=Module._resolveFilename;
Module._resolveFilename=function(id,...args){return resolve.call(this,id.startsWith('@/')?path.resolve('src',id.slice(2)):id,...args)};
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
const {resolveSkillCutin}=require('../src/app/components/redesign/battle-effects/tutorialEffects.ts');
const catalog=require('../src/theme/local-characters.json'),cutins=require('../src/app/components/redesign/battle-effects/tutorial-cutins.json');
for(const [id,fx] of Object.entries(cutins)){const c=catalog.find(c=>c.id===id),actor={id,name:c.name,image:c.battle||c.full};assert.equal(resolveSkillCutin(actor).src,fx.src);assert.equal(resolveSkillCutin({...actor,id:'enemy-instance'}).src,fx.src);assert.equal(resolveSkillCutin({...actor,id:'enemy-instance',name:'unknown'}),undefined);assert.equal(resolveSkillCutin(actor,'/unknown-phase.png'),undefined);}
const {FORMAL_QUEST_STAGES}=require('../src/domain/redesign/questMaster.ts');
const {FORMAL_ENCOUNTER_MASTERS}=require('../src/domain/redesign/raidFormalMaster.ts');
const {FORMAL_CASTLES,createFormalInvasionMaster}=require('../src/domain/redesign/raidInvasionMaster.ts');
const pools={quest:FORMAL_QUEST_STAGES.flatMap(s=>s.waves.flat()),encounter:FORMAL_ENCOUNTER_MASTERS.flatMap(s=>s.enemies||[s.enemy]),invasion:FORMAL_CASTLES.flatMap(c=>createFormalInvasionMaster(c.id,()=>0).stages.flatMap(s=>s.enemies))};
const report={catalog:Object.keys(cutins).length,pools:{}};
for(const [name,units] of Object.entries(pools)){let matched=0;for(const actor of units){const canonical=catalog.find(c=>c.name===actor.name),expected=canonical&&cutins[canonical.id];assert.equal(resolveSkillCutin(actor)?.src,expected?.src,`${name}: ${actor.id}/${actor.name}`);if(expected)matched++;}report.pools[name]={units:units.length,ssr:matched};}
fs.mkdirSync('docs/verification/all-battle-effects-20260928',{recursive:true});fs.writeFileSync('docs/verification/all-battle-effects-20260928/mapping.json',JSON.stringify(report,null,2));console.log(report);

