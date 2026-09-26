import fs from 'node:fs';
import {rows,candidatesFor,write,gz,assetCheck,inBand} from './stage68_decision_lib.mjs';
import {hash} from './audit_stage68.mjs';
import {run,inputFor} from './rebuild_stage68_five_tier.mjs';
import {FORMAL_QUEST_STAGES} from '../src/domain/redesign/questMaster.ts';
import {buildBattleParty} from '../src/domain/redesign/masters.ts';
const OUT='docs/verification/stage68-implementation-20260927',signature=x=>hash({party:x.party,waves:x.waves,rules:x.rules,earlyQuestAssist:x.earlyQuestAssist});
const middle=process.argv.includes('--middle');
for(const id of ['5-2','5-5','6-3']){
 if(middle&&id!=='5-5')continue;
 const path=`${OUT}/late-design/${id}.json.gz`,row=rows.find(r=>r.stage===id),stage=FORMAL_QUEST_STAGES.find(s=>s.designId===id),cs=candidatesFor(row).cs.filter(c=>c.asset.covered),base=cs.find(c=>c.validation.rate===1);
 const result=fs.existsSync(path)?gz(path):{stage:id,variants:[],complete:false};if(result.complete&&!middle)continue;result.complete=false;
 const pool=[null,...row.acquisition.trainedSkills],states=[];let random=131;const rng=()=>{random=(Math.imul(random,1664525)+1013904223)>>>0;return random;};
 for(let i=0;i<64;i++){const state=structuredClone(base.state);state.skills=[];for(const m of state.deck){const skill=pool[rng()%pool.length];m.skillIds=skill?[skill.id]:[];if(skill&&!state.skills.some(s=>s.id===skill.id))state.skills.push(skill);}if(assetCheck({state},row).covered&&!states.some(s=>hash(s.deck)===hash(state.deck)))states.push(state);}
 for(const [hp,atk]of (middle?[[1.2,1.1],[1.2,1.2],[1.2,1.3],[1.3,1.4]]:[[1,1],[1.4,1.5],[1.4,2],[1.6,2.5]])){
  const name=`hp${hp}-atk${atk}`;if(result.variants.some(v=>v.name===name))continue;const changed=structuredClone(stage);for(const e of changed.waves.flat()){e.stats.hp=Math.round(e.stats.hp*hp);e.stats.atk=Math.round(e.stats.atk*atk);}
  const records=[];for(const [i,state]of states.entries()){const input=inputFor(changed,{party:buildBattleParty(state)}),reuse=cs.find(c=>signature(c.input)===signature(input));records.push({name:`assignment-${i}`,state,input,inputHash:hash(input),screen:reuse?.validation??run(input,480001,12,true),screenReused:!!reuse});}
  const coverage=[0,1,2,3,4].map(b=>records.some(c=>inBand(c.screen.rate,b)));result.variants.push({name,stage:changed,records,coverage,status:hp===1?'ADOPTED_BASELINE':'EXPERIMENT_NOT_IMPLEMENTED'});write(path,result);console.log(JSON.stringify({stage:id,name,coverage}));if(coverage.every(Boolean))break;
 }
 result.complete=true;write(path,result);
}
