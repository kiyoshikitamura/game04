const fs=require('fs'),ts=require('typescript'),assert=require('assert/strict');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
const {simulateBattle}=require('../src/domain/redesign/battle.ts');
const {projectRecordedBattleFrame:project,recordedBattleFrameDuration:duration}=require('../src/domain/presentation/recordedBattlePresentation.ts');
const {recordedBattleSounds:sounds}=require('../src/audio/recordedBattleSound.ts');
const base='docs/verification/device-debug/b05',rows=[];
for(const name of ['usable','sp-shortage','mixed','actor-death','enemy-defeated','stunned','area1-assist',...Array.from({length:5},(_,i)=>`saved-qa-stage${i+1}`)]){
 const fixture=JSON.parse(fs.readFileSync(`${base}/${name}.json`)),result=fixture.input?simulateBattle(fixture.input):fixture,before=JSON.stringify(result);let starts=0,resumes=0,active=null,episodes=[];
 result.frames.forEach((f,i)=>{const p=project(result,i),s=sounds(result,i);
 assert.equal(p.cutIn==='burst',f.event==='burst_start');assert.equal(s.includes('BATTLE_BURST'),f.event==='burst_start');
 if(f.event==='burst_start'){assert.equal(result.frames[i-1].burstGauge,200);active={start:i,actions:[],end:null};episodes.push(active);starts++;}
 if(active&&f.event==='action_start'&&f.actorId===result.frames[active.start].actorId)active.actions.push({frame:i,skill:f.skillId,sp:f.partySp});
 if(f.event==='burst_resume'){resumes++;assert.equal(duration(f),60);assert.equal(p.cutIn,null);assert.deepEqual(s,[]);}
 if(active){assert.equal(f.burstGauge,0);if(f.event==='burst_end'){active.end=i;active=null;}}
 });assert.equal(JSON.stringify(result),before,'presentation mutated saved result');
 if(fixture.input)assert.deepEqual(episodes.map(e=>e.actions.map(a=>a.skill)),fixture.result.episodes.map(e=>e.actions.map(a=>a.skill)),'action selection changed from investigation');
 if(['usable','sp-shortage','mixed'].includes(name))assert.equal(episodes[0].actions.length,5);
 if(name==='mixed')assert.deepEqual(episodes[0].actions.map(a=>a.skill),['cost20','cost20','cost20','basic','basic']);
 rows.push({name,starts,resumes,cutIns:starts,startSounds:starts,episodes});
}
fs.mkdirSync(`${base}/fix`,{recursive:true});fs.writeFileSync(`${base}/fix/regression.json`,JSON.stringify(rows,null,2));console.log('PASS',rows.map(({name,starts,resumes})=>({name,starts,resumes})));

