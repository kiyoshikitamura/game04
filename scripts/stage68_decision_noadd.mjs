import fs from 'node:fs';
import {rows,OUT,candidatesFor,write,gz} from './stage68_decision_lib.mjs';
import {stateFor,costs,loadout,hash} from './audit_stage68.mjs';
import {buildBattleParty} from '../src/domain/redesign/masters.ts';
import {inputFor,run} from './rebuild_stage68_five_tier.mjs';
const testIds=new Set(process.argv.slice(2));
for(const r of rows.slice(10)){
 const path=`${OUT}/no-add/${r.stage}.json.gz`;
 const {d}=candidatesFor(r),base=d.records.find(c=>c.name===r.primary.name);
 let result=fs.existsSync(path)?gz(path):null;
 if(!result){
  const ids=base.state.deck.map(x=>x.characterId),definitions=[['starter-single',[['SKD003'],['SKD035'],['SKD009'],['SKD009'],['SKD039']]],['starter-area',[[],[],['SKD019'],[],['SKD039']]]];
  const records=definitions.map(([name,skills])=>{
   let state,expense;for(let level=Math.min(50,r.profile.level);level>=1;level--){state=stateFor(ids.map((id,i)=>({id,skills:skills[i]})),level,null,1,0);expense=costs(state);if(expense.cash<=r.acquisition.existingEnumeratedSupply.cash&&expense.charExp<=r.acquisition.existingEnumeratedSupply.charExp)break;}
   const input=inputFor(d.stageProposal,{party:buildBattleParty(state)});
   return {name,state,costs:expense,loadout:loadout(state),input,inputHash:hash(input),status:'UNTESTED',newTrials:0};
  });
  result={stage:r.stage,status:'NO_ADDITIONAL_REWARD_FEASIBILITY_ONLY',note:'既クリア各面1回+ステージ/エリア任務の既存収入だけ。初期確定5名/技5種、装備なし、技LB0、覚醒0、資源内のLvに制限。仮に前面まで到達済でも成立するかの下限比較で、そこまでの連続到達を保証しない。五段階の同育成比較へ混ぜない。敵は回収済み提案入力なので現行敵での勝率とも呼ばない。',records};write(path,result);
 }
 if(testIds.has(r.stage))for(const c of result.records){if(c.validation)continue;c.validation=run(c.input,231001,200,true);c.newTrials=200;c.status='VALIDATED_NEW_INPUT';write(path,result);console.log(JSON.stringify({stage:r.stage,name:c.name,level:c.state.characters[0].level,wins:c.validation.wins,n:200}));}
}
