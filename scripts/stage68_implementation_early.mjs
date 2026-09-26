import fs from 'node:fs';
import assert from 'node:assert/strict';
import {rows,candidatesFor,write,gz,assetCheck} from './stage68_decision_lib.mjs';
import {hash} from './audit_stage68.mjs';
import {run,inputFor} from './rebuild_stage68_five_tier.mjs';
import {FORMAL_QUEST_STAGES} from '../src/domain/redesign/questMaster.ts';
import {buildBattleParty} from '../src/domain/redesign/masters.ts';
const OUT='docs/verification/stage68-implementation-20260927';
const deps=JSON.parse(fs.readFileSync('docs/verification/stage68-adoption-20260927/skill-dependency.json'));
for(const id of ['1-2','1-3','1-4','1-5','2-1']){
 const path=`${OUT}/early/${id}.json.gz`,d=deps.find(x=>x.stage===id),r=rows.find(x=>x.stage===id),{cs}=candidatesFor(r),stage=FORMAL_QUEST_STAGES.find(s=>s.designId===id);
 const result=fs.existsSync(path)?gz(path):{stage:id,records:[],complete:false};if(result.complete)continue;
 for(const skill of d.unresolved){
  const base=cs.find(c=>c.name===d.primary.name),name=`remove-${skill}-${base.name}`;if(result.records.some(c=>c.name===name))continue;
  const state=structuredClone(base.state);state.skills=state.skills.filter(s=>s.id!==skill);for(const m of state.deck)m.skillIds=m.skillIds.filter(s=>s!==skill);
  assert(assetCheck({state},r).covered);const input=inputFor(stage,{party:buildBattleParty(state)}),validation=run(input,420001,200,true);
  result.records.push({name,family:'sp-feed',removed:skill,state,input,inputHash:hash(input),validation,mechanism:{description:'外した技能枠では通常攻撃でSPを供給し、残る攻撃技とBURSTへ回す。回復除去では攻撃を優先する。',normalAndBurstRuns:validation.runs.filter(x=>(x.casts.basic??0)>0&&x.bursts>0).length,remainingCasts:Object.fromEntries([...new Set(input.party.flatMap(p=>p.skills.map(s=>s.id)))].map(id=>[id,validation.runs.filter(x=>(x.casts[id]??0)>0).length]))}});write(path,result);console.log(JSON.stringify({stage:id,removed:skill,wins:validation.wins,n:200}));
 }
 result.complete=true;write(path,result);
}
