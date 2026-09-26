import fs from 'node:fs';
import {gz,write,inBand,targets} from './stage68_decision_lib.mjs';
import {metrics,active} from './stage68_adoption_lib.mjs';
import {inputFor,run} from './rebuild_stage68_five_tier.mjs';
import {hash} from './audit_stage68.mjs';
const OUT='docs/verification/stage68-implementation-20260927';
for(const id of ['10-6','10-7']){
 const path=`${OUT}/stall-micro/${id}.json.gz`,t=gz(`${OUT}/stalls/${id}.json.gz`),base=t.variants.find(v=>v.name===t.selected),search=gz(`${OUT}/search-stall/${id}.json.gz`).records.filter(c=>c.validation),all=[...base.records,...search];
 const choices=[...base.records,...[0,1,2,3,4].map(b=>all.filter(c=>inBand(c.validation.rate,b)).sort((a,bx)=>Math.abs(a.validation.rate-targets[b])-Math.abs(bx.validation.rate-targets[b]))[0]),...search.filter(c=>metrics(c.validation).actionLimit)].filter(Boolean);
 const unique=[...new Map(choices.map(c=>[hash(c.input.party),c])).values()];
 const result=fs.existsSync(path)?gz(path):{stage:id,variants:[],roles:t.roles,complete:false};if(result.complete)continue;
 for(const factor of [1.05,1.1,1.2]){
  if(result.variants.some(v=>v.factor===factor))continue;const stage=structuredClone(base.stage),changes=[];
  for(const [wi,w]of stage.waves.entries())for(const [ei,e]of w.entries()){const before=e.stats.atk;e.stats.atk=Math.round(before*factor);changes.push({wave:wi+1,position:ei+1,enemy:e.id,field:'atk',before,after:e.stats.atk});}
  const records=unique.map(c=>{const input=inputFor(stage,{party:c.input.party});return {name:c.name,family:c.family,state:c.state,input,inputHash:hash(input),screen:run(input,470001,12,true)};});
  const p=records.find(c=>c.name===t.roles.find(r=>r.role==='primary').name),a=records.find(c=>c.name===t.roles.find(r=>r.role==='alternative').name);
  const gate=p.screen.wins===12&&a.screen.rate>=.6&&records.every(c=>!metrics(c.screen).actionLimit)&&active(p,p.screen)&&active(a,a.screen);
  result.variants.push({factor,stage,changes,records,gate});write(path,result);console.log(JSON.stringify({stage:id,factor,gate}));
 }
 const v=result.variants.find(v=>v.gate);if(v){result.selectedFactor=v.factor;for(const c of v.records){if(c.validation)continue;c.validation=run(c.input,471001,200,true);write(path,result);}const p=v.records.find(c=>c.name===t.roles.find(r=>r.role==='primary').name),a=v.records.find(c=>c.name===t.roles.find(r=>r.role==='alternative').name);result.passed=p.validation.wins===200&&a.validation.rate>=.6&&v.records.every(c=>!metrics(c.validation).actionLimit)&&active(p,p.validation)&&active(a,a.validation);result.missing=[0,1,2,3,4].filter(b=>!v.records.some(c=>inBand(c.validation.rate,b)));}
 result.complete=true;write(path,result);console.log(JSON.stringify({stage:id,passed:result.passed,missing:result.missing}));
}
