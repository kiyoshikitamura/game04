import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {OUT,rows,stageResults,hash} from './stage68_implementation_results.mjs';
import {assetCheck,write} from './stage68_decision_lib.mjs';
import {inputFor} from './rebuild_stage68_five_tier.mjs';
import {FORMAL_QUEST_STAGES,QUEST_MASTER_VERSION,questVictoryRewards,usesCurrentQuestProgress,usesFormalQuestRewards} from '../src/domain/redesign/questMaster.ts';
const baseline='bc6fd2a4f1c2a96600c6b1f0e32acbbf8d2412f4',masterPath='src/domain/redesign/data/quest65.json';
const read=p=>JSON.parse(fs.readFileSync(p));
const old=JSON.parse(execFileSync('git',['show',`${baseline}:${masterPath}`],{encoding:'utf8',maxBuffer:20e6})),expected=structuredClone(old),current=read(masterPath);
const enemies=read('docs/verification/stage68-adoption-20260927/enemy43.json'),supply=read('docs/verification/stage68-adoption-20260927/supply44.json'),additional=read(`${OUT}/additional-enemy-patch.json`);
let fields=0;
for(const r of enemies)for(const e of r.enemies)for(const c of e.changes){const target=expected.stages.find(s=>s.designId===r.stage).waves[e.wave-1][e.position-1];assert.equal(target.id,e.id);assert.equal(target.stats[c.field],c.before);target.stats[c.field]=c.after;fields++;}
for(const r of supply){const i=expected.stages.findIndex(s=>s.designId===r.grantOn),j=expected.stages.findIndex(s=>s.designId===r.requiredBefore);assert(i>=0&&i<j);assert.deepEqual(expected.stages[i].firstRewards,r.currentFirstRewards);expected.stages[i].firstRewards.push(...r.additions);}
for(const c of additional){const e=expected.stages.find(s=>s.designId===c.stage).waves[c.wave-1][c.position-1];assert.equal(e.id,c.enemy);assert.equal(e.stats[c.field],c.before);e.stats[c.field]=c.after;}
expected.version=QUEST_MASTER_VERSION;assert.deepEqual(current,expected);
const amounts=rs=>{const m={};for(const r of rs){const k=r.kind+':'+(r.id??'');m[k]=(m[k]??0)+r.amount;}return m;};
for(const stage of FORMAL_QUEST_STAGES){const before=old.stages.find(s=>s.id===stage.id),grant=supply.find(s=>s.grantOn===stage.designId),empty={clearedStages:[],questClearCounts:{}};
 const now=questVictoryRewards(stage,empty,[],123).rewards,prior=questVictoryRewards(before,empty,[],123).rewards;assert.deepEqual(amounts(now),amounts([...prior,...(grant?.additions??[])]));
 const cleared={clearedStages:[stage.id],questClearCounts:{[stage.id]:1}};assert.deepEqual(questVictoryRewards(stage,cleared,[],123),questVictoryRewards(before,cleared,[],123));
}
assert(usesCurrentQuestProgress(QUEST_MASTER_VERSION));assert(usesCurrentQuestProgress(old.version));assert(usesFormalQuestRewards('APPROVED_QUEST65_ROUND17_20260922'));assert(!usesCurrentQuestProgress('APPROVED_QUEST65_ROUND17_20260922'));assert(!usesFormalQuestRewards('unknown'));
const combat=x=>hash({party:x.party,waves:x.waves,rules:x.rules,earlyQuestAssist:x.earlyQuestAssist});
let checked=0;const growthWarnings=[];
for(const row of rows){const x=stageResults(row),stage=FORMAL_QUEST_STAGES.find(s=>s.designId===row.stage);
 for(const c of x.current){assert.equal(combat(c.input),combat(inputFor(stage,{party:c.input.party})),`${row.stage}/${c.name}: stale combat input`);assert(assetCheck(c,row).covered,`${row.stage}/${c.name}: unfunded`);checked++;}
 const growth=c=>hash({characters:[...c.state.characters].sort((a,b)=>a.id.localeCompare(b.id)),equipment:[...c.state.equipment].sort((a,b)=>a.instanceId.localeCompare(b.instanceId))});
 const tiers=x.assessment.tiers.filter(Boolean);if(new Set(tiers.map(growth)).size>1)growthWarnings.push(row.stage);
}
assert.deepEqual(growthWarnings,[],'5 bands must not use character/equipment growth gradients');
const immutable=['src/domain/redesign/battle.ts','src/domain/redesign/masters.ts','src/domain/redesign/formalBattleInput.ts','src/app/components/redesign/BattleView.tsx','docs/verification/stage68-recovery-20260927','docs/verification/stage68-decision-20260927','docs/verification/stage68-adoption-20260927','docs/verification/stage68-five-tier-20260926'];
for(const p of immutable)assert.equal(execFileSync('git',['diff','--name-only',baseline,'--',p],{encoding:'utf8'}).trim(),'','Preserved path changed: '+p);
const result={pass:true,enemyStages:enemies.length,enemyFields:fields,rewardSites:supply.length,additionalFields:additional.length,combatAndAssetInputsChecked:checked,all68FirstRewardAndRepeatRewardChecks:true,grantBeforeUse:true,characterEquipmentGrowthParity:true,legacySnapshotVersionRouting:true,commonRulesAndRecoveredEvidenceUnchanged:true,apiDeployment:false,deviceAccepted:false,G5:false};write(`${OUT}/implementation-checks.json`,result);console.log(JSON.stringify(result));
