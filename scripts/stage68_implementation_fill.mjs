import fs from 'node:fs';
import {rows,candidatesFor,gz,write,inBand,targets,assetCheck} from './stage68_decision_lib.mjs';
import {hash} from './audit_stage68.mjs';
import {inputFor,run} from './rebuild_stage68_five_tier.mjs';
import {buildBattleParty} from '../src/domain/redesign/masters.ts';
import {FORMAL_QUEST_STAGES} from '../src/domain/redesign/questMaster.ts';
const OUT='docs/verification/stage68-implementation-20260927',sig=x=>hash({party:x.party,waves:x.waves,rules:x.rules,earlyQuestAssist:x.earlyQuestAssist});
for(const id of ['4-2','5-4']){
 const row=rows.find(r=>r.stage===id),stage=FORMAL_QUEST_STAGES.find(s=>s.designId===id),path=`${OUT}/fill/${id}.json.gz`,result=fs.existsSync(path)?gz(path):{stage:id,records:[],complete:false};if(result.complete)continue;
 const search=gz(`${OUT}/search/${id}.json.gz`).records,all=[...candidatesFor(row).cs.filter(c=>c.asset.covered),...gz(`${OUT}/bands/${id}.json.gz`).records,...search.filter(c=>c.validation),...result.records.filter(c=>c.validation)],seen=new Set([...all,...search,...result.records].map(c=>sig(c.input)));
 const missing=()=>[0,1,2,3,4].filter(b=>!all.some(c=>inBand(c.validation.rate,b)));
 while(missing().length&&result.records.length<120){const band=missing()[result.records.length%missing().length];let found;
  for(const base of [...all].sort((a,b)=>Math.abs(a.validation.rate-targets[band])-Math.abs(b.validation.rate-targets[band]))){
   for(let i=0;i<base.state.deck.length&&!found;i++)for(const skill of row.acquisition.trainedSkills){const state=structuredClone(base.state);state.deck[i].skillIds=[skill.id];state.skills=structuredClone(row.acquisition.trainedSkills.filter(s=>state.deck.some(d=>d.skillIds.includes(s.id))));if(!assetCheck({state},row).covered)continue;const input=inputFor(stage,{party:buildBattleParty(state)});if(seen.has(sig(input)))continue;found={name:`fill-${result.records.length}-${i}-${skill.id}`,state,input,inputHash:hash(input),base:base.name};seen.add(sig(input));break;}if(found)break;
  }if(!found)break;found.screen=run(found.input,490001,24,true);if(missing().some(b=>inBand(found.screen.rate,b))){found.validation=run(found.input,491001,200,true);all.push(found);console.log({stage:id,name:found.name,wins:found.validation.wins});}result.records.push(found);write(path,result);
 }
 result.missing=missing();result.complete=true;write(path,result);console.log({stage:id,missing:result.missing});
}
