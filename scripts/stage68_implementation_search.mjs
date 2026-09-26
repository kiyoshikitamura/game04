import fs from 'node:fs';
import {rows,candidatesFor,write,gz,inBand,assetCheck,targets} from './stage68_decision_lib.mjs';
import {hash} from './audit_stage68.mjs';
import {run,inputFor} from './rebuild_stage68_five_tier.mjs';
import {FORMAL_QUEST_STAGES} from '../src/domain/redesign/questMaster.ts';
import {buildBattleParty} from '../src/domain/redesign/masters.ts';
const OUT='docs/verification/stage68-implementation-20260927',signature=x=>hash({party:x.party,waves:x.waves,rules:x.rules,earlyQuestAssist:x.earlyQuestAssist});
const changed=process.argv.includes('--stalls');
for(const row of rows){
 const id=row.stage;if(process.argv.slice(2).filter(x=>!x.startsWith('--')).length&&!process.argv.slice(2).includes(id))continue;
 let chosen;if(changed){for(const folder of ['stalls','stall-pressure']){const p=`${OUT}/${folder}/${id}.json.gz`;if(fs.existsSync(p)){const t=gz(p);if(t.passed)chosen=t.variants.find(v=>v.name===t.selected);}}if(!chosen)continue;}
 const path=`${OUT}/${changed?'search-stall':'search'}/${id}.json.gz`,saved=fs.existsSync(path)?gz(path):{stage:id,records:[],complete:false};if(saved.complete)continue;
 const stage=chosen?.stage??FORMAL_QUEST_STAGES.find(s=>s.designId===id),old=chosen?chosen.records.filter(c=>c.validation):candidatesFor(row).cs.filter(c=>c.asset.covered),bands=changed?[]:gz(`${OUT}/bands/${id}.json.gz`).records;
 const early=!changed&&fs.existsSync(`${OUT}/early/${id}.json.gz`)?gz(`${OUT}/early/${id}.json.gz`).records:[];
 const all=[...old,...bands,...early,...saved.records.filter(c=>c.validation)],seen=new Set([...all,...saved.records].map(c=>signature(c.input)));
 const missing=()=>[0,1,2,3,4].filter(b=>!all.some(c=>inBand(c.validation.rate,b)));
 let count=saved.records.length;
 while(missing().length&&count<48){
  const bs=missing(),band=bs[count%bs.length];
  const bases=[...all].sort((a,b)=>Math.abs(a.validation.rate-targets[band])-Math.abs(b.validation.rate-targets[band]));
  let candidate;
  for(const base of bases){
   const n=base.input.party.length;
   for(let mode=0;mode<2&&!candidate;mode++)for(let i=0;i<n&&!candidate;i++)for(let j=mode===0?i+1:0;j<(mode===0?n:base.state.deck[i].skillIds.length)&&!candidate;j++){
    const state=structuredClone(base.state);if(mode===0)[state.deck[i],state.deck[j]]=[state.deck[j],state.deck[i]];else state.deck[i].skillIds.splice(j,1);
    const input=inputFor(stage,{party:buildBattleParty(state)}),sig=signature(input);if(seen.has(sig))continue;
    if(!assetCheck({state},row).covered)continue;
    candidate={name:`search-${count}-${mode===0?'swap':'remove'}-${i}-${j}-${base.name}`,family:base.family,state,input,inputHash:hash(input),base:base.name,operation:{mode:mode===0?'swap-order':'remove-skill-slot',i,j},targetBand:band};seen.add(sig);
   }
   if(candidate)break;
  }
  if(!candidate)break;
  candidate.screen=run(candidate.input,440001,24,true);
  if(bs.some(b=>inBand(candidate.screen.rate,b))){candidate.validation=run(candidate.input,441001,200,true);all.push(candidate);console.log(JSON.stringify({stage:id,name:candidate.name,wins:candidate.validation.wins,missing:missing()}));}
  saved.records.push(candidate);count++;write(path,saved);
 }
 saved.missing=missing();saved.complete=true;write(path,saved);console.log(JSON.stringify({stage:id,screened:count,missing:saved.missing}));
}
