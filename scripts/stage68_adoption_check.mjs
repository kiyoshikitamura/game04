import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {OUT,read,gz,write,hash,rows,previous,candidatesFor} from './stage68_adoption_lib.mjs';
const enemy=read(`${OUT}/enemy43.json`),supply=read(`${OUT}/supply44.json`),stalls=read(`${OUT}/stall14.json`),remaining=read(`${OUT}/remaining59.json`),summary=read(`${OUT}/experiment-summary.json`);
assert.equal(enemy.length,43);assert.equal(supply.length,44);assert.equal(stalls.length,14);assert.equal(new Set(remaining.map(x=>x.stage)).size,59);
assert.equal(rows.filter(r=>!previous(r.stage).missingWithinBudget.length).length,9);
const fields={};for(const s of enemy)for(const e of s.enemies){assert.deepEqual(e.behaviorBefore,e.behaviorAfter);for(const c of e.changes){assert.equal(e.statsBefore[c.field],c.before);assert.equal(e.statsAfter[c.field],c.after);fields[c.field]=(fields[c.field]??0)+1;}}
assert.deepEqual(fields,{def:57,atk:154,hp:62});
const growthMismatch=[];const growth=c=>({characters:c.state.characters.map(x=>({id:x.id,level:x.level,awakening:x.awakening})).sort((a,b)=>a.id.localeCompare(b.id)),equipment:c.state.equipment.map(x=>({masterId:x.masterId,level:x.level,lb:x.lb})).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)))});
for(const e of enemy){const cs=candidatesFor(rows.find(r=>r.stage===e.stage)).cs,p=cs.find(c=>c.name===e.primary.name);for(const b of [e.alternative,e.lowerSameBudget].filter(Boolean)){const c=cs.find(x=>x.name===b.name);if(hash(growth(p))!==hash(growth(c)))growthMismatch.push({stage:e.stage,name:c.name});}}
assert.deepEqual(growthMismatch,[],'Character/equipment growth differs in claimed same-growth comparison');
for(const p of supply){assert(rows.findIndex(r=>r.stage===p.grantOn)<rows.findIndex(r=>r.stage===p.requiredBefore));assert.deepEqual(p.proposedFirstRewards,[...p.currentFirstRewards,...p.additions]);assert(p.additions.every(r=>r.amount>0));}
let screens=0,independent=0;const inputHashes=new Set(),records=[];
for(const s of stalls){const t=gz(`${OUT}/stall-tests/${s.stage}.json.gz`),base=candidatesFor(rows.find(r=>r.stage===s.stage)).d.stageProposal;assert(t.complete);assert.equal(hash(base),t.sourceProposalHash);
 for(const v of t.variants){const expected=structuredClone(base);for(const c of v.changes){assert.equal(expected.waves[v.target.wave-1][v.target.position-1].stats[c.field],c.before);expected.waves[v.target.wave-1][v.target.position-1].stats[c.field]=c.after;}assert.deepEqual(v.stage,expected);
  for(const r of v.records){assert.equal(hash(r.input),r.inputHash);assert.notEqual(r.inputHash,r.oldInputHash);assert(!inputHashes.has(r.inputHash));inputHashes.add(r.inputHash);
   for(const [k,start,n]of [['screen',310001,12],['validation',311001,200]])if(r[k]){const x=r[k];assert.equal(x.n,n);assert.equal(x.runs.length,n);assert.deepEqual(x.runs.map(r=>r.seed),Array.from({length:n},(_,i)=>start+i));assert.equal(x.wins,x.runs.filter(r=>r.outcome==='win').length);assert(x.runs.every(r=>r.actions<=300));if(k==='screen')screens+=n;else independent+=n;}
  }
 }
 records.push({stage:s.stage,complete:true,selected:t.selected??null,recommendation:t.recommendation});
}
assert.equal(inputHashes.size,106);assert.equal(screens,1272);assert.equal(independent,3200);assert.equal(summary.totalTrials,screens+independent);
const changed=execFileSync('git',['diff','--name-only','77142a4f2f7488067173475c40fd4f2a168dd63a'],{encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean);
assert(changed.every(p=>p.startsWith(`${OUT}/`)||p.startsWith('scripts/stage68_adoption_')));
write(`${OUT}/checks.json`,{passed:true,kind:'saved-evidence-integrity-not-battle-rerun',baseline:'77142a4f2f7488067173475c40fd4f2a168dd63a',enemyStages:43,fields,supplySites:44,receiptStrictlyBeforeUse:true,oldEvidenceAndBattleImplementationUnchanged:true,conditionalFiveBands:9,remaining:59,uniqueNewInputs:inputHashes.size,screenTrials:screens,independentTrials:independent,records,deviceMeasured:false,G5:false});
console.log('PASS: 43 enemy stages, 44 grants, 14 checkpoints, 106 distinct changed inputs, 4472 trials; baseline preserved.');
