import fs from 'node:fs';
import {rows,OUT,candidatesFor,propose,write,gz} from './stage68_decision_lib.mjs';
import {run} from './rebuild_stage68_five_tier.mjs';
for(const stage of process.argv.slice(2)){
 const path=`${OUT}/${stage}-order.json.gz`,checkpoint=fs.existsSync(path)?gz(path):null;if(checkpoint?.completed||checkpoint&&!checkpoint.plans&&checkpoint.records.every(c=>c.validation)){console.log(stage,'already saved');continue;}
 const r=rows.find(r=>r.stage===stage),{cs}=candidatesFor(r),plans=propose(r,cs);
 const unique=checkpoint?.plans??[...new Map(plans.map(p=>[p.inputHash,p])).values()],result=checkpoint??{stage,status:'UNAPPROVED_ISOLATED_COMPARISON',selectionSeeds:[220001,220020],validationSeeds:[221001,221200],plans:unique,records:[]};write(path,result);
 for(const p of unique){
  let c=result.records.find(c=>c.inputHash===p.inputHash);if(c?.validation)continue;if(!c){c={...p,screen:run(p.input,220001,20,true),newTrials:20};result.records.push(c);write(path,result);}
  c.validation=run(p.input,221001,200,true);c.newTrials=220;c.status='VALIDATED_NEW_INPUT';write(path,result);
  console.log(JSON.stringify({stage,name:c.name,band:c.label,wins:c.validation.wins,n:200}));
 }
 result.completed=true;write(path,result);
}
