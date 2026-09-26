import assert from 'node:assert/strict';
import {read,write,hash,OUT} from './audit_stage68.mjs';
import {simulateBattle} from '../src/domain/redesign/battle.ts';
const all=read(OUT+'/results.json');let count=0;
for(const row of all){const input=read(OUT+'/evidence/'+row.designId+'-input.json');for(const run of [...row.validation.runs,...(row.additionalValidation?.runs??[])]){const result=simulateBattle({...structuredClone(input),seed:run.seed});assert.equal(hash(result),run.resultHash,row.designId+' seed '+run.seed);count++;}}
const p=read(OUT+'/DBG047-proposal.json');
for(const key of ['beforeResult','afterResult','withoutDebuff']){let input=structuredClone(p.input);if(key==='beforeResult')input.waves.forEach(w=>w[0].stats.def=p.before);if(key==='withoutDebuff')input.party[1].skills=[];for(const run of p[key].runs){const result=simulateBattle({...structuredClone(input),seed:run.seed});assert.equal(hash(result),run.resultHash,key+' '+run.seed);count++;}}
write('saved-replay-summary.json',{allPrimaryAndAdditionalAndProposalHashesMatch:true,replayed:count,stageCount:all.length});console.log('Exact saved replay:',count,'battles');
