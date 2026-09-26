import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {rows,SOURCE,OUT,gz,inBand,assetCheck} from './stage68_decision_lib.mjs';
import {hash,costs} from './audit_stage68.mjs';
import {buildBattleParty} from '../src/domain/redesign/masters.ts';
import {validateDeck} from '../src/domain/redesign/growth.ts';
import {EXP_VALUES} from '../src/domain/redesign/growthMaster.ts';
const read=p=>JSON.parse(fs.readFileSync(p)),summary=read(`${OUT}/summary.json`),all=rows.map(r=>read(`${OUT}/stages/${r.stage}.json`));
assert.equal(all.length,68);assert.equal(new Set(all.map(r=>r.stage)).size,68);
assert.equal(execFileSync('git',['diff','--name-only','c130039','--',SOURCE,'src','supabase','config'],{encoding:'utf8'}).trim(),'','recovered evidence/runtime changed');
let validated=0,newTrials=0;const inputKeys=new Set(),cases=[];
for(const test of summary.newTests){
 const file=gz(test.path),c=file.records?file.records.find(c=>c.name===test.name):file;
 assert(c.validation);assert.equal(c.inputHash,hash(c.input));validateDeck(c.state,c.state.deck);assert.deepEqual(c.input.party,buildBattleParty(c.state));
 const d=gz(`${SOURCE}/${test.stage}-validated.json.gz`),withoutParty=input=>{const v=structuredClone(input);delete v.party;return v;};
 assert.deepEqual(withoutParty(c.input),withoutParty(d.records[0].input),'enemy/rules input changed');
 assert(![...d.records,...d.controls].some(p=>hash(p.input)===c.inputHash),'repeated recovered final input');
 const key=test.stage+'/'+c.inputHash;assert(!inputKeys.has(key));inputKeys.add(key);
 assert.equal(c.validation.n,200);assert.equal(c.validation.runs.length,200);assert.equal(new Set(c.validation.runs.map(x=>x.seed)).size,200);assert.equal(c.validation.wins,c.validation.runs.filter(x=>x.outcome==='win').length);assert.equal(c.validation.rate,c.validation.wins/200);
 if(c.screen)assert(c.screen.runs.every(x=>!c.validation.runs.some(y=>y.seed===x.seed)));
 const row=rows.find(r=>r.stage===test.stage);
 if(test.scope==='no-add-feasibility-not-five-tier'){
  const available=all.find(r=>r.stage===test.stage).supply.currentBeforeStage;
  assert(c.state.skills.every(s=>available.skills.some(x=>x.id===s.id)&&s.level===0));assert(c.state.characters.every(ch=>ch.awakening===0&&available.characters.some(x=>x.id===ch.id)));
  assert.equal(c.state.equipment.length,0);const cost=costs(c.state);assert(cost.cash<=available.resources.cash);assert(cost.charExp<=available.resources.charExp);
 }else {assert(assetCheck(c,row).covered);assert(c.state.characters.every(ch=>ch.level===row.profile.level));}
 cases.push({stage:test.stage,name:test.name,wins:c.validation.wins,n:200,newTrials:c.newTrials,scope:test.scope??'same-growth-comparison'});validated++;newTrials+=c.newTrials;
}
assert.equal(newTrials,summary.newTrials);
const farming={cash:0,charExp:0,eqExp:0};let successes=0,energy=0;
const rewardAmounts=rs=>{const x={cash:0,charExp:0,eqExp:0};for(const r of rs){if(r.kind==='cash')x.cash+=r.amount;if(r.kind==='character_exp_item')x.charExp+=r.amount*EXP_VALUES[r.id];if(r.kind==='equipment_exp_item')x.eqExp+=r.amount*EXP_VALUES[r.id];}return x;};
for(let i=0;i<all.length;i++){
 const r=all[i],supply=r.supply,option=supply.optionB;
 assert.equal(r.stage,rows[i].stage);for(const p of supply.allPreStageAdditions){const grant=all.findIndex(x=>x.stage===p.grantOn),need=all.findIndex(x=>x.stage===p.beforeStage);assert(grant<need&&need<=i);}
 if(i>0)assert.equal(option.priorStage,all[i-1].stage);assert(Number.isInteger(option.successfulClears));
 const yield_=rewardAmounts(option.repeatRewards);for(const k of Object.keys(farming)){farming[k]+=option.successfulClears*yield_[k];assert(supply.currentBeforeStage.resources[k]+farming[k]>=supply.requiredAssets.cumulativeTrainingCost[k]);}
 assert.deepEqual(farming,option.farmIncome);successes+=option.successfulClears;energy+=option.energy;
 for(let band=0;band<5;band++)if(r.tierRows[band].withinBudget){const c=r.tierRows[band].withinBudget;assert(c.assets.covered);assert(inBand(c.wins/c.n,band));}
 if(r.early)assert.equal(r.early.status.startsWith('二戦法'),r.early.pair.every(c=>c.wins/c.n>=.6&&c.coreRuns>=c.n/2&&c.assets.covered));
 if(r.stall){assert.equal(r.stall.continueValidationCloses,false);assert(r.stall.details.every(c=>c.actionLimit>c.n/2));assert.equal(r.primary.wins,r.primary.n);}
}
assert.equal(successes,summary.optionBFarmTotal);assert.equal(energy,summary.optionBEnergyTotal);
const proposals=gz(`${OUT}/candidate-inputs.json.gz`);assert.equal(proposals.length,68);
for(const p of proposals)for(const c of p.proposals){assert.equal(hash(c.input),c.inputHash);assert(assetCheck(c,rows.find(r=>r.stage===p.stage)).covered);assert.equal(c.status,'UNTESTED');validateDeck(c.state,c.state.deck);}
const fix=all.find(r=>r.stage==='8-5');assert.equal(fix.primary.name,'barrier');assert.equal(fix.alternative.name,'burst-focus');
const result={status:'PASS',runtime:process.version,platform:process.platform,stages:68,newValidatedCandidates:validated,newTrials,independentTrials:validated*200,cases,oldEvidenceAndRuntimeUnchanged:true,proposals:proposals.reduce((n,p)=>n+p.proposals.length,0),optionBSuccesfulClears:successes,optionBEnergy:energy,eightFiveCorrectionPreserved:true,deviceAcceptance:false,G5:false};
fs.writeFileSync(`${OUT}/checks.json`,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({...result,cases:undefined}));
