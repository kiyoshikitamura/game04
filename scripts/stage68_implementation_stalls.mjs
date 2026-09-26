import fs from 'node:fs';
import {rows,gz,write} from './stage68_decision_lib.mjs';
import {select,metrics,active,stalls} from './stage68_adoption_lib.mjs';
import {hash} from './audit_stage68.mjs';
import {inputFor,run} from './rebuild_stage68_five_tier.mjs';
const OUT='docs/verification/stage68-implementation-20260927';
const pressure=process.argv.includes('--pressure');
const refine=process.argv.includes('--refine');
for(const id of stalls){
 if(process.argv.slice(2).filter(x=>!x.startsWith('--')).length&&!process.argv.slice(2).includes(id))continue;
 if((pressure||refine)&&gz(`${OUT}/stalls/${id}.json.gz`).passed)continue;
 const path=`${OUT}/${refine?'stall-refine':pressure?'stall-pressure':'stalls'}/${id}.json.gz`,p=select(rows.find(r=>r.stage===id));
 const roles=[['primary',p.primary],['alternative',p.alt],['near60',p.next],['low',p.low]].filter(([,c])=>c),unique=[...new Map(roles.map(([,c])=>[c.inputHash,c])).values()];
 const result=fs.existsSync(path)?gz(path):{stage:id,roles:roles.map(([role,c])=>({role,name:c.name,old:metrics(c.validation)})),variants:[],complete:false};if(result.complete)continue;
 for(const [hp,def,atk]of (refine?[[.45,.95,1.25],[.45,.9,1.5],[.3,.9,1.5],[.5,.85,1.5]]:pressure?[[.8,1,2],[.65,1,3],[.5,1,4]]:[[.6,.85,1.25],[.45,.7,1.5],[.35,.55,1.75]])){
  const name=`hp${hp}-def${def}-atk${atk}`;if(result.variants.some(v=>v.name===name))continue;
  const stage=structuredClone(p.d.stageProposal),changes=[];for(const [wi,w]of stage.waves.entries())for(const [ei,e]of w.entries())for(const [field,factor]of Object.entries({hp,def,atk})){const before=e.stats[field],after=Math.max(1,Math.round(before*factor));e.stats[field]=after;changes.push({wave:wi+1,position:ei+1,enemy:e.id,field,before,after});}
  const records=[];for(const c of unique){const input=inputFor(stage,{party:c.input.party});records.push({name:c.name,family:c.family,state:c.state,input,inputHash:hash(input),screen:run(input,430001,12,true)});}
  const pr=records.find(c=>c.name===p.primary.name),al=records.find(c=>c.name===p.alt.name),lo=records.find(c=>c.name===p.low.name);
  const gate=pr.screen.wins===12&&al.screen.rate>=.6&&active(p.primary,pr.screen)&&active(p.alt,al.screen)&&records.every(c=>metrics(c.screen).actionLimit===0)&&lo.screen.rate<=.4;
  result.variants.push({name,stage,changes,records,gate,score:records.reduce((n,c)=>n+metrics(c.screen).mean,0)});write(path,result);console.log(JSON.stringify({stage:id,name,gate,roles:records.map(c=>({name:c.name,wins:c.screen.wins,timeouts:metrics(c.screen).actionLimit}))}));
 }
 const v=result.variants.filter(v=>v.gate).sort((a,b)=>a.score-b.score)[0];
 if(v){result.selected=v.name;for(const c of v.records){if(c.validation)continue;c.validation=run(c.input,431001,200,true);write(path,result);}
  result.acceptance={primaryAllWin:v.records.find(c=>c.name===p.primary.name).validation.wins===200,alternateAtLeast60:v.records.find(c=>c.name===p.alt.name).validation.rate>=.6,coreActive:active(p.primary,v.records.find(c=>c.name===p.primary.name).validation)&&active(p.alt,v.records.find(c=>c.name===p.alt.name).validation),noTimeoutInAllRoles:v.records.every(c=>metrics(c.validation).actionLimit===0),lowAtMost40:v.records.find(c=>c.name===p.low.name).validation.rate<=.4};result.passed=Object.values(result.acceptance).every(Boolean);
 }
 result.complete=true;write(path,result);console.log(JSON.stringify({stage:id,selected:result.selected,acceptance:result.acceptance}));
}
