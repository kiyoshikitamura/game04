import fs from 'node:fs';import assert from 'node:assert/strict';
import {read,write,evaluate,OUT,hash} from './audit_stage68.mjs';
import {simulateBattle}from'../src/domain/redesign/battle.ts';
import{getFormalOwnedSkill}from'../src/domain/redesign/formalOwnedSkills.ts';
const rows=read(OUT+'/results.json'),checks=[],mechanics=[];
for(const row of rows){
 const input=read(OUT+'/evidence/'+row.designId+'-input.json');let matched=0;
 for(const run of row.validation.runs){const r=simulateBattle({...structuredClone(input),seed:run.seed});assert.equal(hash(r),run.resultHash,row.designId+' '+run.seed);matched++;if(matched===1)write('evidence/'+row.designId+'-sample.json',r);}
 checks.push({stage:row.designId,replayed:matched,exactResultHashes:true});
 const baseline=evaluate(input,66001,20);const c=structuredClone(input);c.party.forEach(p=>p.skills=p.skills.filter(s=>s.effects.some(e=>e.type==='damage')));
 const control=evaluate(c,66001,20),alt=structuredClone(input);
 alt.party.forEach(p=>p.skills=p.skills.map(s=>s.effects.some(e=>e.type==='damage')?getFormalOwnedSkill(s.id==='SKD008'?'SKD010':'SKD008',0):s));
 const alternative=evaluate(alt,66001,20);
 mechanics.push({stage:row.designId,method:'same seeds; remove all non-damage active skills as a group / swap damage skills to LB0 water-or-wind; not single-factor inference',baseline,control,alternative,controlWinsUnchanged:baseline.wins===control.wins,actionDeltaWithoutSupport:control.meanActions-baseline.meanActions});
 console.log(row.designId,'hashes',matched,'support',baseline.wins,control.wins,'alt',alternative.wins);
 write('final-replay-checks.json',checks);write('mechanic-comparisons.json',mechanics);
}
const saved=read(OUT+'/evidence/DBG047-saved-projection.json'),r=simulateBattle(read(OUT+'/evidence/DBG047-input.json'));
const projected={outcome:r.outcome,playerActions:r.playerActions,wavesCleared:r.wavesCleared,totalDamage:r.totalDamage,analysis:r.analysis,frames:r.frames.map(f=>({index:f.index,event:f.event,actorId:f.actorId,skillId:f.skillId,hits:f.hits,partySp:f.partySp,burstGauge:f.burstGauge,party:f.party.map(p=>({id:p.id,hp:p.hp,sp:p.sp,statuses:p.statuses})),enemies:f.enemies.map(p=>({id:p.id,hp:p.hp,sp:p.sp,statuses:p.statuses}))}))};
assert.deepEqual(JSON.parse(JSON.stringify(projected)),saved);write('DBG047-reproduction.json',{frames:r.frames.length,savedProjectionExact:true,outcome:r.outcome,actions:r.playerActions,wavesCleared:r.wavesCleared,damage:r.totalDamage,bursts:r.analysis.reduce((a,b)=>a+b.bursts,0),seed:r.seed});
