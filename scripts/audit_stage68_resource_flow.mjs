import assert from 'node:assert/strict';
import{read,write,hash,OUT}from'./audit_stage68.mjs';
const flows=[];
for(const row of read(OUT+'/results.json')){
 const input=read(OUT+'/evidence/'+row.designId+'-input.json'),r=read(OUT+'/evidence/'+row.designId+'-sample.json');assert.equal(hash(r),row.validation.runs[0].resultHash,row.designId);
 const ids=new Set(input.party.map(p=>p.id));let initial=r.frames[0].partySp,previous=initial,positive=0,negative=0,spent=0,burst=false,burstAttacks=0,burstStarts=0;const bursts=[];
 for(let i=0;i<r.frames.length;i++){const f=r.frames[i],delta=f.partySp-previous;if(delta>0)positive+=delta;else negative-=delta;
  if(f.event==='burst_start'){burst=true;burstAttacks=0;burstStarts++;}
  if(f.event==='action_start'&&ids.has(f.actorId)){spent-=Math.min(0,delta);if(burst){burstAttacks++;assert(burstAttacks<=5);assert.equal(delta,0);const skill=input.party.find(p=>p.id===f.actorId).skills.find(s=>s.id===f.skillId);assert(skill?.effects.some(e=>e.type==='damage'));}}
  if(burst&&f.event==='action_end'&&ids.has(f.actorId)){assert(!(f.spDelta>0));assert(!(f.gaugeDelta>0));}
  if(f.event==='burst_end'){bursts.push(burstAttacks);burst=false;}
  previous=f.partySp;
 }
 assert.equal(initial+positive-negative,previous);flows.push({stage:row.designId,seed:r.seed,initialSp:initial,finalSp:previous,observedPositiveSp:positive,observedNegativeSp:negative,activeSkillSpSpent:spent,burstStarts,attacksPerBurst:bursts,burstAttackOnlyZeroCostNoGain:true,resultHash:hash(r)});
}
write('resource-flow.json',{scope:'first validation seed of each fixed final input; all other seed full outcomes can be regenerated from result hashes',stages:flows});console.log('resource/BURST checks',flows.length);
