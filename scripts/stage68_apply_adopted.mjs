import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const baseline='bc6fd2a4f1c2a96600c6b1f0e32acbbf8d2412f4';
const path='src/domain/redesign/data/quest65.json',out='docs/verification/stage68-implementation-20260927';
const read=p=>JSON.parse(fs.readFileSync(p));
const original=JSON.parse(execFileSync('git',['show',`${baseline}:${path}`],{encoding:'utf8',maxBuffer:20e6}));
const result=structuredClone(original),changes=read('docs/verification/stage68-adoption-20260927/enemy43.json'),supply=read('docs/verification/stage68-adoption-20260927/supply44.json');
let fields=0;
for(const s of changes){const stage=result.stages.find(x=>x.designId===s.stage);for(const e of s.enemies){const target=stage.waves[e.wave-1][e.position-1];assert.equal(target.id,e.id);for(const c of e.changes){assert.equal(target.stats[c.field],c.before);target.stats[c.field]=c.after;fields++;}}}
for(const p of supply){const i=result.stages.findIndex(s=>s.designId===p.grantOn),j=result.stages.findIndex(s=>s.designId===p.requiredBefore);assert(i>=0&&i<j);assert.deepEqual(result.stages[i].firstRewards,p.currentFirstRewards);result.stages[i].firstRewards.push(...p.additions);}
result.version='game04-quest68-development-balance-20260927';
const current=read(path);assert(JSON.stringify(current)===JSON.stringify(original)||JSON.stringify(current)===JSON.stringify(result),'Master diverged: review concurrent changes before applying');
fs.writeFileSync(path,JSON.stringify(result,null,2)+'\n');fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(`${out}/adopted-manifest.json`,JSON.stringify({baseline,scope:'DEVELOPMENT_BASELINE_USER_ADOPTED_NOT_PRODUCTION',enemyStages:changes.length,enemyFields:fields,rewardSites:supply.length,preserveExistingRewards:true,grantBeforeRequiredStage:true,firstStageException:{stage:'1-1',waived:'multiple-tactics-required',fiveBandsStillRequired:true},commonRulesChanged:false},null,2)+'\n');
console.log({enemyStages:changes.length,fields,rewardSites:supply.length});
