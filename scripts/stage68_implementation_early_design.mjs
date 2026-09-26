import fs from 'node:fs';
import {rows,candidatesFor,write,gz,assetCheck,inBand} from './stage68_decision_lib.mjs';
import {hash} from './audit_stage68.mjs';
import {run,inputFor} from './rebuild_stage68_five_tier.mjs';
import {FORMAL_QUEST_STAGES} from '../src/domain/redesign/questMaster.ts';
import {buildBattleParty} from '../src/domain/redesign/masters.ts';
const OUT='docs/verification/stage68-implementation-20260927';
const extend=process.argv.includes('--extend');
const middle=process.argv.includes('--middle');
for(const id of ['1-1','1-2','1-3','1-4','1-5','2-1','2-2']){
 if(extend&&!['1-3','1-4','1-5','2-2'].includes(id))continue;
 if(middle&&id!=='1-4')continue;
 const path=`${OUT}/early-design/${id}.json.gz`,r=rows.find(r=>r.stage===id),stage=FORMAL_QUEST_STAGES.find(s=>s.designId===id),{cs}=candidatesFor(r),base=cs.find(c=>c.asset.covered&&c.validation.rate===1);
 const result=fs.existsSync(path)?gz(path):{stage:id,variants:[],complete:false};if(result.complete&&!extend&&!middle)continue;result.complete=false;
 const pool=[null,...r.acquisition.availableGuaranteedSkills],states=[];
 for(let i=0;i<64;i++){const state=structuredClone(base.state);let n=i*37+11;state.skills=[];for(const m of state.deck){const skill=pool[n%pool.length];n=Math.floor(n/pool.length)+i;m.skillIds=skill?[skill]:[];if(skill&&!state.skills.some(s=>s.id===skill))state.skills.push({id:skill,level:0});}if(assetCheck({state},r).covered&&!states.some(s=>hash(s.deck)===hash(state.deck)))states.push(state);}
 for(const [hp,atk]of (middle?[[2.5,9],[2.5,11],[2.5,13]]:extend?(id==='2-2'?[[1.2,1.25],[1.2,1.5],[1.3,1.75]]:[[3,15],[3,25],[4,35]]):[[1,1],[1.5,3],[2,5],[2.5,7]])){
  const name=`hp${hp}-atk${atk}`;if(result.variants.some(v=>v.name===name))continue;
  const changed=structuredClone(stage);for(const e of changed.waves.flat()){e.stats.hp=Math.round(e.stats.hp*hp);e.stats.atk=Math.round(e.stats.atk*atk);}
  const records=[];for(const [i,state]of states.entries()){const input=inputFor(changed,{party:buildBattleParty(state)});records.push({name:`assignment-${i}`,state,input,inputHash:hash(input),screen:run(input,460001,12,true)});}
  const coverage=[0,1,2,3,4].map(b=>records.some(c=>inBand(c.screen.rate,b)));
  result.variants.push({name,stage:changed,records,coverage,screenWinRange:[Math.min(...records.map(c=>c.screen.wins)),Math.max(...records.map(c=>c.screen.wins))],status:hp===1?'ADOPTED_BASELINE':'EXPERIMENT_NOT_IMPLEMENTED'});write(path,result);console.log(JSON.stringify({stage:id,name,coverage,range:result.variants.at(-1).screenWinRange}));
 }
 result.complete=true;write(path,result);
}
