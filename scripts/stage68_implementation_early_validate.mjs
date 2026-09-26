import fs from 'node:fs';
import {gz,write,inBand,targets} from './stage68_decision_lib.mjs';
import {run} from './rebuild_stage68_five_tier.mjs';
const OUT='docs/verification/stage68-implementation-20260927';
const kind=process.argv.includes('--late')?'late':'early';
for(const id of (kind==='late'?['5-2','5-5','6-3']:['1-2','1-3','1-4','1-5','2-1','2-2'])){
 const source=gz(`${OUT}/${kind}-design/${id}.json.gz`),chosen=source.variants.filter(v=>v.coverage[0]&&v.coverage.filter(Boolean).length>=4).sort((a,b)=>b.coverage.filter(Boolean).length-a.coverage.filter(Boolean).length)[0],path=`${OUT}/${kind}-validation/${id}.json.gz`;
 if(!chosen)continue;const result=fs.existsSync(path)?gz(path):{stage:id,variant:chosen.name,stageProposal:chosen.stage,records:[],complete:false};if(result.complete)continue;
 const evaluate=c=>{let tested=result.records.find(r=>r.inputHash===c.inputHash);if(!tested){tested={...c,validation:run(c.input,461001,200,true)};result.records.push(tested);write(path,result);}return tested;};
 for(let band=0;band<5;band++)for(const c of [...chosen.records].filter(c=>inBand(c.screen.rate,band)).sort((a,b)=>Math.abs(a.screen.rate-targets[band])-Math.abs(b.screen.rate-targets[band])).slice(0,4)){if(result.records.some(r=>inBand(r.validation.rate,band)))break;evaluate(c);}
 const skills=[...new Set(chosen.records.flatMap(r=>r.state.skills.map(s=>s.id)))];result.dependency=[];
 for(const skill of skills){let candidate=result.records.find(r=>!r.state.skills.some(s=>s.id===skill)&&r.validation.rate>=.3);if(!candidate)for(const c of chosen.records.filter(r=>!r.state.skills.some(s=>s.id===skill)&&r.screen.rate>=.5).sort((a,b)=>b.screen.rate-a.screen.rate).slice(0,3)){const t=evaluate(c);if(t.validation.rate>=.3){candidate=t;break;}}result.dependency.push({skill,without:candidate?.name??null,wins:candidate?.validation.wins??null});}
 result.missing=[0,1,2,3,4].filter(b=>!result.records.some(c=>inBand(c.validation.rate,b)));result.noObservedStall=result.records.every(c=>c.validation.runs.every(r=>r.reason!=='action_limit'));result.complete=true;write(path,result);console.log(JSON.stringify({stage:id,missing:result.missing,dependency:result.dependency,noObservedStall:result.noObservedStall,rates:result.records.map(c=>({name:c.name,wins:c.validation.wins}))}));
}
