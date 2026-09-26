import {gz,write} from './stage68_decision_lib.mjs';
import {simulateBattle} from '../src/domain/redesign/battle.ts';
const out='docs/verification/stage68-implementation-20260927';
for(const stage of ['9-6','10-8']){
 const t=gz(`${out}/stalls/${stage}.json.gz`),v=t.variants.find(v=>v.name===t.selected);
 for(const role of ['primary','low']){const r=v.records.find(r=>r.name===t.roles.find(x=>x.role===role).name);const seed=r.validation.runs[Math.floor(r.validation.runs.length/2)].seed;write(`${out}/playback-fixtures/${stage}-${role}.json.gz`,{case:`${stage}-${role}`,stage,recipe:r.name,seed,input:r.input,result:simulateBattle({...structuredClone(r.input),seed})});}
 const old=gz(`docs/verification/stage68-adoption-20260927/stall-tests/${stage}.json.gz`),name=t.roles.find(x=>x.role==='low').name;
 const prior=gz(`docs/verification/stage68-five-tier-20260926/${stage}-validated.json.gz`),r=[...prior.records,...prior.controls].find(x=>x.name===name),seed=r.validation.runs.find(x=>x.reason==='action_limit').seed;
 write(`${out}/playback-fixtures/${stage}-old-stall.json.gz`,{case:`${stage}-old-stall`,stage,recipe:name,seed,input:r.input,result:simulateBattle({...structuredClone(r.input),seed})});
}
