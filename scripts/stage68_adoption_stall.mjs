import fs from 'node:fs';
import assert from 'node:assert/strict';
import {OUT,rows,stalls,plans,metrics,write,gz,hash,active} from './stage68_adoption_lib.mjs';
import {inputFor,run} from './rebuild_stage68_five_tier.mjs';
const requested=process.argv.slice(2),ids=requested.length?requested:stalls;
for(const id of ids){
 const path=`${OUT}/stall-tests/${id}.json.gz`,checkpoint=fs.existsSync(path)?gz(path):null;if(checkpoint?.complete){console.log(id,'checkpoint complete');continue;}
 const r=rows.find(r=>r.stage===id),p=plans(r),rolePairs=[['primary',p.primary],['alternative',p.alt],['near60',p.next],['stalled',p.low]].filter(([,c])=>c);
 const selected=[...new Map(rolePairs.map(([,c])=>[c.inputHash,c])).values()];
 const result=checkpoint??{stage:id,status:'UNAPPROVED_STAGE_LOCAL_EXPERIMENT',sourceProposalHash:hash(p.d.stageProposal),roles:rolePairs.map(([role,c])=>({role,name:c.name,inputHash:c.inputHash,old:metrics(c.validation)})),variants:p.variants.map(v=>({...v,records:[]})),complete:false};
 for(const v of result.variants){
  for(const c of selected){if(v.records.some(x=>x.name===c.name))continue;const input=inputFor(v.stage,{party:c.input.party});assert.notEqual(hash(input),hash(c.input));const screen=run(input,310001,12,true);v.records.push({name:c.name,family:c.family,input,inputHash:hash(input),oldInputHash:hash(c.input),screen});write(path,result);}
  const rec=role=>v.records.find(c=>c.name===rolePairs.find(([r])=>r===role)?.[1].name),pr=rec('primary'),al=rec('alternative'),lo=rec('stalled');
  const old=metrics(p.low.validation),m=metrics(lo.screen);
  v.screenGate=pr.screen.wins===12&&al.screen.rate>=.6&&active(p.primary,pr.screen)&&active(p.alt,al.screen)&&m.actionLimit/12<old.actionLimit/old.n&&m.mean<old.mean-15&&m.rate<=.4;
  v.score=(12-pr.screen.wins)*1000+(Math.max(0,.6-al.screen.rate))*1000+m.actionLimit*20+m.mean;
  write(path,result);console.log(JSON.stringify({stage:id,variant:v.name,gate:v.screenGate,primary:pr.screen.wins,alt:al.screen.wins,low:metrics(lo.screen)}));
 }
 const candidate=result.variants.filter(v=>v.screenGate).sort((a,b)=>a.score-b.score)[0];
 if(candidate){
  result.selected=candidate.name;
  for(const c of candidate.records){if(c.validation)continue;c.validation=run(c.input,311001,200,true);write(path,result);}
  const rec=role=>candidate.records.find(c=>c.name===rolePairs.find(([r])=>r===role)?.[1].name),pr=rec('primary'),al=rec('alternative'),lo=rec('stalled'),m=metrics(lo.validation),old=metrics(p.low.validation);
  result.acceptance={primaryAllWin:pr.validation.wins===200,alternateAtLeast60:al.validation.rate>=.6,mechanismsActive:active(p.primary,pr.validation)&&active(p.alt,al.validation),stallRateHalved:m.actionLimit/200<=old.actionLimit/old.n/2,stalledP90AtMost240:m.p90<=240,weakPartyNotOver40:m.rate<=.4};
  result.recommendation=Object.values(result.acceptance).every(Boolean)?'LOCAL_CANDIDATE_PASSES_LIMITED_GATE':'REJECT_OR_REFINE';
  console.log(JSON.stringify({stage:id,selected:candidate.name,acceptance:result.acceptance,stalled:m}));
 }else result.recommendation='NO_SCREEN_CANDIDATE_PASSED';
 result.complete=true;write(path,result);
}
