import fs from 'node:fs';
import {rows,candidatesFor,write,gz} from './stage68_decision_lib.mjs';
import {hash} from './audit_stage68.mjs';
import {run,inputFor} from './rebuild_stage68_five_tier.mjs';
const OUT='docs/verification/stage68-implementation-20260927',sig=x=>hash({party:x.party,waves:x.waves,rules:x.rules,earlyQuestAssist:x.earlyQuestAssist});
for(const id of ['9-6','10-6','10-7','10-8']){
 const path=`${OUT}/dependencies/${id}.json.gz`,t=gz(`${OUT}/stalls/${id}.json.gz`),v=t.variants.find(v=>v.name===t.selected),cs=candidatesFor(rows.find(r=>r.stage===id)).cs.filter(c=>c.asset.covered),search=gz(`${OUT}/search-stall/${id}.json.gz`).records.filter(c=>c.validation),known=[...v.records,...search];
 const result=fs.existsSync(path)?gz(path):{stage:id,records:[],skills:[],complete:false};if(result.complete)continue;
 const skills=[...new Set(v.records.filter(c=>t.roles.filter(x=>['primary','alternative'].includes(x.role)).some(x=>x.name===c.name)).flatMap(c=>c.state.skills.map(s=>s.id)))];
 for(const idSkill of skills){if(result.skills.some(s=>s.id===idSkill))continue;
  let found;
  for(const c of cs.filter(c=>!c.state.skills.some(s=>s.id===idSkill)).sort((a,b)=>b.validation.rate-a.validation.rate).slice(0,3)){
   const input=inputFor(v.stage,{party:c.input.party}),reuse=[...known,...result.records].find(x=>sig(x.input)===sig(input));let tested=reuse;
   if(!tested){tested={name:c.name,family:c.family,state:c.state,input,inputHash:hash(input),validation:run(input,450001,200,true)};result.records.push(tested);write(path,result);}
   if(tested.validation.rate>=.3){found={candidate:tested.name,wins:tested.validation.wins,n:tested.validation.n,reused:!!reuse,actionLimit:tested.validation.runs.filter(r=>r.reason==='action_limit').length};break;}
  }
  result.skills.push({id:idSkill,without:found??null});write(path,result);
 }
 result.complete=true;write(path,result);console.log(JSON.stringify({stage:id,skills:result.skills}));
}
