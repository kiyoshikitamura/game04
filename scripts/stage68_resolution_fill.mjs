import fs from 'node:fs';
import {rows,stageResults,assess,metrics,hash} from './stage68_implementation_results.mjs';
import {write,gz,inBand,targets,assetCheck} from './stage68_decision_lib.mjs';
import {inputFor,run} from './rebuild_stage68_five_tier.mjs';
import {buildBattleParty} from '../src/domain/redesign/masters.ts';
const OUT='docs/verification/stage68-resolution-20260927',folder=process.argv[2]??'pressure-aoe',ids=process.argv.slice(3),sig=c=>hash(c.input.party);
for(const row of rows){if(ids.length&&!ids.includes(row.stage))continue;const p=`${OUT}/${folder}/${row.stage}.json.gz`;if(!fs.existsSync(p))continue;const source=gz(p),v=source.variants.find(v=>v.name===source.selected);if(!v||v.records.some(c=>!c.validation||metrics(c.validation).actionLimit))continue;
 const path=`${OUT}/fill-${folder}/${row.stage}.json.gz`,d=fs.existsSync(path)?gz(path):{stage:row.stage,source:p,selected:source.selected,stageProposal:v.stage,records:structuredClone(v.records),screened:0,complete:false};if(d.complete)continue;
 const old=stageResults(row),extra=[];for(const f of ['fill-pressure-aoe','fill-pressure-combined','fill-pressure-refined']){const p=`${OUT}/${f}/${row.stage}.json.gz`;if(fs.existsSync(p)&&p!==path)extra.push(...gz(p).records.filter(c=>c.validation&&metrics(c.validation).actionLimit>0));}const guard=[...old.assessment.stalled,...extra,...old.assessment.dependency.map(d=>d.without).filter(Boolean)];
 for(const c of guard){if(d.records.some(r=>sig(r)===sig(c)))continue;const input=inputFor(v.stage,{party:c.input.party}),r={name:c.name,state:c.state,family:c.family,input,inputHash:hash(input),validation:run(input,532001,200,true),purpose:'old-stall-and-skill-independence-guard'};d.records.push(r);write(path,d);if(metrics(r.validation).actionLimit){d.guardFailure=r.name;break;}}
 if(!d.guardFailure){const seen=new Set(d.records.map(sig));let q=assess(d.records.filter(c=>c.validation));
  while(q.missing.length&&d.screened<80){const band=q.missing[d.screened%q.missing.length],bases=d.records.filter(c=>c.validation).sort((a,b)=>Math.abs(a.validation.rate-targets[band])-Math.abs(b.validation.rate-targets[band]));let next;
   for(const b of bases){for(let mode=0;mode<2&&!next;mode++)for(let i=0;i<b.state.deck.length&&!next;i++)for(let j=mode===0?i+1:0;j<(mode===0?b.state.deck.length:b.state.deck[i].skillIds.length)&&!next;j++){
    const state=structuredClone(b.state);if(mode===0)[state.deck[i],state.deck[j]]=[state.deck[j],state.deck[i]];else state.deck[i].skillIds.splice(j,1);
    if(!assetCheck({state},row).covered)continue;const input=inputFor(v.stage,{party:buildBattleParty(state)});if(seen.has(hash(input.party)))continue;next={name:`fill-${d.screened}-${mode}-${i}-${j}-${b.name}`,family:b.family,state,input,inputHash:hash(input),operation:{base:b.name,mode:mode===0?'order':'skill-slot-removal',i,j}};seen.add(hash(input.party));
   }if(next)break;}
   if(!next)break;next.screen=run(next.input,531001,24,true);if(q.missing.some(i=>inBand(next.screen.rate,i))){next.validation=run(next.input,532001,200,true);console.log(JSON.stringify({stage:row.stage,folder,name:next.name,wins:next.validation.wins,stall:metrics(next.validation).actionLimit}));}
   d.records.push(next);d.screened++;write(path,d);q=assess(d.records.filter(c=>c.validation));if(q.stalled.length){d.guardFailure=q.stalled[0].name;break;}
  }
 }
 const a=assess(d.records.filter(c=>c.validation));d.result={missing:a.missing,stalled:a.stalled.map(c=>c.name),alternative:!!a.alternative,dependencyMissing:a.dependency.filter(d=>!d.without).map(d=>d.id)};d.passed=!d.guardFailure&&!a.missing.length&&!a.stalled.length&&!!a.alternative&&a.dependency.every(d=>d.without);d.complete=true;write(path,d);console.log(JSON.stringify({stage:row.stage,folder,passed:d.passed,result:d.result}));
}
