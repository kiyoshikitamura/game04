import fs from 'node:fs';
import assert from 'node:assert/strict';
import {rows,gz,write,candidatesFor,inBand,assetCheck} from './stage68_decision_lib.mjs';
import {hash} from './audit_stage68.mjs';
import {run,inputFor} from './rebuild_stage68_five_tier.mjs';
import {FORMAL_QUEST_STAGES} from '../src/domain/redesign/questMaster.ts';
const OUT='docs/verification/stage68-implementation-20260927';
const proposals=gz('docs/verification/stage68-decision-20260927/candidate-inputs.json.gz');
const combat=x=>hash({party:x.party,waves:x.waves,rules:x.rules,earlyQuestAssist:x.earlyQuestAssist});
for(const batch of proposals){
 if(process.argv.length>2&&!process.argv.slice(2).includes(batch.stage))continue;
 const path=`${OUT}/bands/${batch.stage}.json.gz`,r=rows.find(r=>r.stage===batch.stage),stage=FORMAL_QUEST_STAGES.find(s=>s.designId===batch.stage),{cs}=candidatesFor(r);
 const result=fs.existsSync(path)?gz(path):{stage:batch.stage,records:[],complete:false};if(result.complete){console.log(batch.stage,'saved');continue;}
 for(const c of cs)assert.equal(combat(inputFor(stage,{party:c.input.party})),combat(c.input),'Combat differs from saved proposal');
 for(const p of batch.proposals){
  if(result.records.some(c=>c.inputHash===p.inputHash))continue;
  const existing=cs.find(c=>c.inputHash===p.inputHash);if(existing)continue;
  assert(assetCheck(p,r).covered);assert.equal(combat(p.input),combat(inputFor(stage,{party:p.input.party})));
  const validation=run(p.input,410001,200,true);result.records.push({...p,status:'EVALUATED',validation});write(path,result);
  console.log(JSON.stringify({stage:batch.stage,name:p.name,wins:validation.wins,n:200}));
 }
 const all=[...cs.filter(c=>c.asset.covered),...result.records];result.missing=[0,1,2,3,4].filter(b=>!all.some(c=>inBand(c.validation.rate,b)));result.complete=true;write(path,result);console.log(JSON.stringify({stage:batch.stage,missing:result.missing}));
}
