import fs from 'node:fs';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
import {mechanics} from './stage68_five_tier_mechanics.mjs';
const root='docs/verification/stage68-five-tier-20260926';
const dest='docs/verification/stage68-recovery-20260927';
const d=JSON.parse(zlib.gunzipSync(fs.readFileSync(`${root}/8-5-validated.json.gz`)));
const row=JSON.parse(fs.readFileSync(`${root}/audit-table.json`)).find(r=>r.stage==='8-5');
const primary=d.records.find(c=>c.name==='barrier'),alternative=d.records.find(c=>c.name==='burst-focus');
assert(mechanics(primary,primary.validation));
const checks=[];
for(const c of [primary,alternative]){
 assert.equal(c.validation.wins,200);assert.equal(c.validation.n,200);
 for(const s of c.state.skills)assert(row.acquisition.trainedSkills.some(t=>t.id===s.id&&t.level>=s.level));
 const available=[...row.acquisition.trainedEquipment];
 for(const e of c.state.equipment){const i=available.findIndex(t=>t.masterId===e.masterId&&t.level>=e.level&&t.lb>=e.lb);assert(i>=0);available.splice(i,1);}
 for(const ch of c.state.characters)assert(row.acquisition.trainedCharacters.some(t=>t.id===ch.id&&t.level>=ch.level&&t.awakening>=ch.awakening));
 const ids=[...new Set(c.input.party.flatMap(p=>p.skills.map(s=>s.id)))];
 const activations=ids.map(id=>({id,runs:c.validation.runs.filter(r=>(r.casts[id]??0)>0).length}));
 const burstRuns=c.validation.runs.filter(r=>r.bursts>0&&(r.casts.basic??0)>0&&r.spGain>0).length;
 if(c===alternative)assert(burstRuns>=100);
 checks.push({name:c.name,family:c.family,wins:200,n:200,seedFirst:c.validation.runs[0].seed,seedLast:c.validation.runs.at(-1).seed,loadout:c.loadout,inputHash:c.inputHash,activations,burstRuns,existingProposedTrainingCovers:true});
}
const result={stage:'8-5',status:'UNAPPROVED_ISOLATED_PROPOSAL',reason:'旧主候補burst-focus-regenのSKD043は0/200試行で発動。継続回復攻略としては不合格。既存保存候補からbarrierを主、burst-focusを別戦法へ選び直す。',primary:checks[0],alternative:checks[1],enemyDeltaChanged:false,additionalSupplyChanged:false,newSimulationTrials:0,evidence:'../stage68-five-tier-20260926/8-5-validated.json.gz',supersedes:'旧ガイド8-5の主/別戦法欄のみ。5段階実測値・敵値・旧失敗証拠は保存したまま。'};
fs.writeFileSync(`${dest}/8-5-guide-correction.json`,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({stage:result.stage,primary:primary.name,alternative:alternative.name,checks:checks.map(c=>({name:c.name,activations:c.activations,burstRuns:c.burstRuns})),additionalSupplyChanged:false,newSimulationTrials:0}));
