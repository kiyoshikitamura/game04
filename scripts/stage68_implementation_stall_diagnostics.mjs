import fs from 'node:fs';
import assert from 'node:assert/strict';
import {OUT,rows,stageResults,brief,metrics,hash} from './stage68_implementation_results.mjs';
import {write,gz} from './stage68_decision_lib.mjs';
import {simulateBattle} from '../src/domain/redesign/battle.ts';
const results=[];
for(const row of rows){const x=stageResults(row);if(!x.assessment.stalled.length)continue;
 const path=`${OUT}/stall-diagnostics/${row.stage}.json.gz`;if(fs.existsSync(path)){results.push(gz(path));continue;}
 const c=[...x.assessment.stalled].sort((a,b)=>metrics(b.validation).actionLimit-metrics(a.validation).actionLimit)[0],seed=c.validation.runs.find(r=>r.reason==='action_limit').seed;
 const replay=simulateBattle({...structuredClone(c.input),seed});assert.equal(replay.reason,'action_limit');
 const last=replay.frames.at(-1),tail=replay.frames.filter(f=>f.wave===last.wave&&f.playerActions>=250),partyIds=new Set(c.input.party.map(p=>p.id)),enemyIds=new Set(last.enemies.map(e=>e.id));
 const heal=tail.filter(f=>['heal','hot'].includes(f.event)).map(f=>({actor:f.actorId,skill:f.skillId,side:partyIds.has(f.actorId)?'party':'enemy',text:f.text}));
 const playerDamage=tail.filter(f=>f.event==='damage'&&partyIds.has(f.actorId)).flatMap(f=>f.hits??[]),oneRatio=playerDamage.filter(d=>d===1).length/Math.max(1,playerDamage.length);
 const survivors=last.enemies.filter(e=>!e.dead),defs=c.input.waves.flat(),candidate=[];
 const healer=survivors.map(e=>defs.find(d=>d.id===e.id)).find(e=>e?.skills.some(s=>s.effects.some(f=>['heal','hot'].includes(f.type))));
 if(healer)candidate.push({enemy:healer.id,field:'atk',before:healer.stats.atk,after:Math.max(1,Math.round(healer.stats.atk*.8)),why:'最後の生存回復役の回復供給を局所的に減らす。攻撃力にも影響するため他攻略を再評価。'});
 const blocker=[...survivors].sort((a,b)=>b.effectiveDef-a.effectiveDef)[0],b=defs.find(d=>d.id===blocker?.id);
 if(b){const field=oneRatio>.5?'def':'hp';candidate.push({enemy:b.id,field,before:b.stats[field],after:Math.max(1,Math.round(b.stats[field]*(field==='def'?.8:.7))),why:field==='def'?'終盤の1ダメージ比率が高い。最後の生存防御役だけに突破余地を作る。':'終盤の残存耐久を局所削減。序盤の全体火力や行動順は維持。'});}
 const result={stage:row.stage,status:'DESIGN_UNMET_NEXT_LOCAL_CANDIDATES_UNTESTED',candidate:brief(c),seed,inputHash:hash(c.input),wave:last.wave,reason:replay.reason,playerActions:replay.playerActions,final:last,tailEvents:tail.map(f=>({index:f.index,action:f.playerActions,event:f.event,actor:f.actorId,skill:f.skillId,text:f.text,hits:f.hits})),diagnostic:{partySurvivors:last.party.filter(p=>!p.dead).map(p=>p.id),enemySurvivors:survivors.map(e=>e.id),last50ActionsPlayerHitCount:playerDamage.length,last50ActionsOneDamageRatio:oneRatio,healingEvents:heal,interpretation:oneRatio>.5?'残存味方の火力と敵防御の不均衡が有力。':healer?'残存回復役による均衡を優先確認。':'最終生存者の攻撃対象・SP供給と残存HPを優先確認。',causalProof:false},nextPatch:candidate,retest:{roles:['主攻略','別攻略','次点','約30%','低勝率','観測0勝','保存済み停滞編成'],screenSeeds:{start:510001,n:24},independentSeeds:{start:511001,n:200},acceptance:'全5帯と技能個別非依存を保持し、検証した全編成で300行動なし。変えた入力だけ新しい証拠として扱う。'},measuredPlaybackSeconds:null};
 write(path,result);results.push(result);
}
write(`${OUT}/stall-next-candidates.json`,results.map(r=>({stage:r.stage,source:`stall-diagnostics/${r.stage}.json.gz`,seed:r.seed,wave:r.wave,interpretation:r.diagnostic.interpretation,changes:r.nextPatch,retest:r.retest,status:r.status})));
console.log(JSON.stringify({diagnosedStages:results.length,diagnosticReplaysOnly:true,newWinRateTrials:0}));
