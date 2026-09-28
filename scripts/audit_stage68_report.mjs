import fs from 'node:fs';
import assert from 'node:assert/strict';
import {read,write,evaluate,loadout,costs,hash,OUT} from './audit_stage68.mjs';
import {FORMAL_QUEST_STAGES as stages,createQuestBattleInput} from '../src/domain/redesign/questMaster.ts';
import {QUEST_AREAS,QUEST_STAGES,isQuestStageUnlocked} from '../src/domain/redesign/quests.ts';
import {CHARACTER_MASTERS as CM,EQUIPMENT_MASTERS as EM,buildBattleParty,BATTLE_RULES} from '../src/domain/redesign/masters.ts';
import {FORMAL_NORMAL_MISSIONS as missions} from '../src/domain/redesign/formalMissions.ts';
import {FORMAL_GACHA_POOL,formalGachaProbability} from '../src/domain/redesign/formalGachaMaster.ts';
import {getFormalOwnedSkill} from '../src/domain/redesign/formalOwnedSkills.ts';
import {EXP_VALUES,SOUL_UNLOCK,cumulativeExp} from '../src/domain/redesign/growthMaster.ts';
const results=read(OUT+'/results.json'),alternatives=read(OUT+'/alternatives.json'),mechanics=read(OUT+'/mechanic-comparisons.json');
for(let i=0;i<10;i++){const a=alternatives[i],r=results[i];if(a.validation.winRate===1){r.previousLoadout=r.loadout;r.previousValidation=r.validation;r.validation=a.validation;r.loadout=a.loadout;r.costs=a.costs;write('evidence/'+r.designId+'-state.json',a.state);write('evidence/'+r.designId+'-input.json',a.input);r.selectedDescription='到達前確定配布の編成・技のみ';}}
const scrub=x=>JSON.parse(JSON.stringify(x,(k,v)=>k==='image'?undefined:v));
const approved=read('docs/product/balance_audits_20260922/round17_effective62.json').stages;
const end=JSON.parse(fs.readFileSync('docs/product/balance_audits_20260922/endgame_approved_handoff.md','utf8').match(/```json\s*([\s\S]*?)```/)[1]);
const api=read(OUT+'/api-parity.json');
const rows=[];const allDetails=[];const fixedChars=new Set(['char_joe_01','char_daimon_01','char_aoi_01']),fixedSkills=new Set(['SKD003','SKD039','SKD035']);
const total={cash:0,charExp:0,eqExp:0,skillMaterials:0};const prior=[];const priorRewards=[];
function sumRewards(rewards){const v={cash:0,charExp:0,eqExp:0,skillMaterials:0};for(const r of rewards){if(r.kind==='cash')v.cash+=r.amount;if(r.kind==='character_exp_item')v.charExp+=r.amount*EXP_VALUES[r.id];if(r.kind==='equipment_exp_item')v.eqExp+=r.amount*EXP_VALUES[r.id];if(r.kind==='skill_material')v.skillMaterials+=r.amount;}return v;}
function source(kind,id,index){
 if(kind==='character'&&fixedChars.has(id)||kind==='skill'&&fixedSkills.has(id))return {kind,id,guaranteed:true,route:'チュートリアル／既クリア面初回確定',beforeStage:true};
 const pool=FORMAL_GACHA_POOL.find(x=>x.category===kind&&x.id===id);
 const souls=kind==='character'?priorRewards.filter(r=>r.kind==='soul'&&r.id===id).reduce((a,b)=>a+b.amount,0):0;
 const farm=kind==='character'?prior.filter(s=>s.soulDrops.some(d=>d.id===id)).map(s=>({stage:s.designId,period:s.soulDrops.find(d=>d.id===id).period,chance:s.soulDrops.find(d=>d.id===id).chance})):[];
 return {kind,id,guaranteed:false,beforeStage:!!pool,route:pool?'通常ガチャ（到達前から抽選可能・所持保証なし）':'未確認',normalProbabilityPercent:pool?formalGachaProbability(pool,'normal'):0,priorFixedSouls:souls,soulUnlock:kind==='character'?SOUL_UNLOCK[CM.find(c=>c.id===id).rarity]:undefined,priorSoulFarms:farm};
}
for(let i=0;i<results.length;i++){
 const r=results[i],s=stages[i],state=read(OUT+'/evidence/'+r.designId+'-state.json'),input=read(OUT+'/evidence/'+r.designId+'-input.json');
 // Alternative fixture character swaps must retain internally valid growth EXP.
 for(const c of state.characters)c.exp=cumulativeExp('character',CM.find(m=>m.id===c.id).rarity,c.level);
 const sources=[...state.characters.map(c=>source('character',c.id,i)),...state.skills.map(c=>source('skill',c.id,i)),...new Set(state.equipment.map(e=>e.masterId))].map(x=>typeof x==='string'?source('equipment',x,i):x);
 const previousMissionRewards=missions.filter(m=>m.condition.type==='stage_clear'&&prior.some(s=>s.id===m.condition.stageId)||m.condition.type==='area_clear'&&QUEST_AREAS.find(a=>a.id===m.condition.areaId)?.stages.every(s=>prior.some(p=>p.id===s.id))).flatMap(m=>m.rewards);
 const budget=sumRewards([...priorRewards,...previousMissionRewards]);
 const short=Object.fromEntries(Object.keys(budget).map(k=>[k,Math.max(0,(r.costs[k]??0)-budget[k])]));
 const farmOptions=prior.map(p=>{const v=sumRewards(p.rewards);const runs=Math.max(...['cash','charExp','eqExp'].map(k=>short[k]===0?0:v[k]?Math.ceil(short[k]/v[k]):Infinity));return {stage:p.designId,stageId:p.id,yield:v,runs,energy:runs*p.energyCost};}).filter(x=>Number.isFinite(x.runs)).sort((a,b)=>a.energy-b.energy||a.runs-b.runs);
 let farm=null;
 for(const candidate of farmOptions.slice(0,4)){if(!candidate.runs){farm={...candidate,validation:null};break;}const v=evaluate(createQuestBattleInput(1,input.party,stages.find(s=>s.id===candidate.stageId),BATTLE_RULES),65001,20);if(v.wins===20){farm={...candidate,validation:v};break;}}
 write('evidence/'+r.designId+'-state.json',state);
 const comparison=mechanics.find(x=>x.stage===r.designId);
 const a=alternatives[i];const old=approved.find(a=>a.stage===s.designId)?.waves??end.waves[s.designId];const historicalMatch=old?hash(scrub(old))===hash(scrub(s.waves)):false;
 assert(api.stages[i].inputMatch);assert.deepEqual(QUEST_STAGES[i],s);assert(isQuestStageUnlocked(s.id,prior.map(x=>x.id),{version:'early-retention-v1-20260926',clearedAdditionalStages:prior.filter(p=>['mikawa-4','mikawa-5','owari-5'].includes(p.id)).map(x=>x.id),preservedUnlockedStages:[],additionalStageAttempts:{},completedAreas:[],deckSlots:5,guides:{}}));
 const condition=sources.some(x=>!x.guaranteed)||state.characters.some(c=>c.awakening>0)||state.skills.some(c=>c.level>0)||Object.values(short).some(x=>x>0);
 const rate=(r.additionalValidation&&r.designId!=='10-7')?((r.validation.wins+r.additionalValidation.wins)/(r.validation.n+r.additionalValidation.n)):r.validation.winRate;
 const status=rate>=.95?(condition?'条件付き':'成立'):'条件付き（不安定）';
 const unstable=r.validation.runs.filter(x=>x.outcome!=='win');
 const summary={stage:s.designId,id:s.id,name:s.name,intent:s.description,data:'正式JSON／表示共用／配信API入力一致',historical:historicalMatch?'旧承認敵表一致':'エリア1・2の新承認上書き（旧表と異なる）',status,win:`${r.validation.wins}/${r.validation.n}`,additional:r.additionalValidation?`${r.additionalValidation.wins}/${r.additionalValidation.n}`:'',actions:r.validation.actions,conditions:r.loadout,costs:r.costs,acquisition:sources,priorFixedBudget:budget,shortfallAgainstEnumeratedSupply:short,mechanicComparison:comparison,farm,alternative:{label:a.label,wins:a.validation.wins,n:a.validation.n,loadout:a.loadout},defeatReasons:r.validation.reasons,baseline:{wins:r.baseline.wins,n:r.baseline.n,level:r.baselineLevel,allOneRuns:r.baseline.allOneRuns},response:'検証済み条件へガイド修正',maxEnemyDef:Math.max(...s.waves.flat().map(e=>e.stats.def)),minPartyAtk:Math.min(...input.party.map(p=>p.stats.atk)),maxPartyAtk:Math.max(...input.party.map(p=>p.stats.atk))};rows.push(summary);
 const detail=[`## ${s.designId} ${s.name} — ${status}`,`ID: ${s.id}。設計意図: ${s.description}。${s.waves.length}派。`,
  `データ: ${summary.data}。${summary.historical}。解放: ${i?stages[i-1].designId+'クリア':'初期解放'}（旧進行保持の例外あり）。`,
  `戦闘: ${summary.win}勝、行動数${r.validation.actions.join('〜')}。${summary.additional?'追加seed: '+summary.additional+'勝。':''} 敗北内訳: ${JSON.stringify(r.validation.reasons)}。`,
  `旧案の比較条件: Lv${r.baselineLevel}、装備なし、LB0で${r.baseline.wins}/${r.baseline.n}勝。全攻撃1ダメージの試行${r.baseline.allOneRuns}。旧ガイドに装備/LB指定がなかったため、この比較条件を明示して補完した。`,
  '|順|武将ID・名前|Lv/覚醒|技（左から装備順）|装備個体・部位・Lv/LB・加算値|','|---|---|---|---|---|'];
 r.loadout.forEach((c,j)=>detail.push(`|${j+1}|${c.id} ${c.name}|${c.level}/+${c.awakening}|${c.skills.map(z=>z.id+' '+getFormalOwnedSkill(z.id,z.lb).name+' LB'+z.lb).join(' → ')||'なし'}|${c.equipment.map(e=>`${e.masterId}(${e.instanceId},${e.slot}) Lv${e.level}/LB${e.lb} HP${e.stats.hp.toFixed(2)} ATK${e.stats.atk.toFixed(2)} DEF${e.stats.def.toFixed(2)} LUK${e.stats.luk.toFixed(2)}`).join('<br>')||'なし'}|`));
 detail.push('','### 敵・各派（現行API入力と照合済み）','|派/順|敵|Lv|HP/ATK/DEF|SP/行動|技・形態|','|---|---|---|---|---|---|');
 s.waves.forEach((wave,wi)=>wave.forEach((e,ei)=>detail.push(`|${wi+1}/${ei+1}|${e.id} ${e.name}|${e.level}|${e.stats.hp}/${e.stats.atk}/${e.stats.def}|初期SP${e.initialSp??0}/上限${e.stats.sp}、初期count${e.initialCount??e.count??'—'}、reset${e.actionCount??'—'}|${e.skills.map(k=>k.id+'（SP'+k.spCost+'）').join('、')}。形態${e.phases?.length??0}、パッシブ${e.passives?.length??0}|`)));
 detail.push('技の倍率・対象・条件・状態持続・解除/保護・形態移行の完全値は、その面の evidence/api-面番号-input.json に保存。行動上限300（敵割込みは味方行動数に含めない）。装備/スキルの省略値を推測で補わない。');
 detail.push('','### 入手・育成条件',...sources.map(x=>`- ${x.id}: ${x.route}。${x.normalProbabilityPercent?'1回抽選率 '+x.normalProbabilityPercent.toFixed(5)+'%。':''}${x.kind==='character'&&!x.guaranteed?` 直前までの固定魂${x.priorFixedSouls}、解放必要${x.soulUnlock}。前面までの魂周回: ${x.priorSoulFarms.map(f=>f.stage+'（'+f.period+'勝ごと確定1、通常'+Math.round(f.chance*100)+'%）').join('、')||'なし'}。`:''}`),
  `- Lv1・LB0からの育成総額: 銭${r.costs.cash.toLocaleString()}、武将EXP${r.costs.charExp.toLocaleString()}、装備EXP${r.costs.eqExp.toLocaleString()}、技LB素材${r.costs.skillMaterials}、装備LB素材${r.costs.equipmentMaterials}。ガチャ抽選費・初回解放に消費する魂は含めない。通常ガチャ1回1,000銭/10回10,000銭、指定品の入手回数は保証されない。`,
  `- 覚醒魂（初回解放とは別）: ${Object.entries(r.costs.awakeningSouls).map(([k,v])=>k+'='+v).join('、')}。`,
  `- この面より前の各面1回報酬＋到達済みステージ/エリア任務だけを集計: 銭${budget.cash.toLocaleString()}、武将EXP${budget.charExp.toLocaleString()}、装備EXP${budget.eqExp.toLocaleString()}、技素材${budget.skillMaterials}。本面の初回報酬は含まない。`,
  `- 上記の限定した供給だけとの費用差額（実際の所持不足ではない）: ${JSON.stringify(short)}。過去消費は不足を増やし、未計上のレベル任務・日次任務・ログボ等は不足を減らす。周回数は最低回数ではない。`,
  `- 不足EXP/銭の周回案: ${farm?farm.stage+'を'+farm.runs+'勝（行動力'+farm.energy+'）、1勝収入 '+JSON.stringify(farm.yield)+(farm.validation?'。同じ検証編成で20/20勝確認':'。不足0のため周回不要'):'前面周回だけの成立経路なし／追加検証が必要'}。技素材不足はノーマルガチャの所持済み技重複（N1/R2/SR5/SSR20）。装備LB素材は未装備・未ロック装備の分解（同量）。必要な重複/分解物の所持は保証しない。`,
  `- ガチャ依存品、覚醒魂、LB素材が未所持なら、この条件を推奨として実行しない。技は複数武将で共有可、装備個体は共有不可。装飾2枠の同IDも別個体を用いる。`,
  '',`### 代替・実ダメージ・SP`,
  `- 初期武将への代替${a.validation.wins}/${a.validation.n}勝。${a.validation.winRate>=.95?'代替も検証済み条件。':'この代替は安定推奨しない。'} 具体入力: evidence/alternative-${s.designId}-input.json。`,
  `- 主条件の与ダメージ範囲: ${Math.min(...r.validation.runs.map(x=>x.damageMin))}〜${Math.max(...r.validation.runs.map(x=>x.damageMax))}。SP獲得合計${Math.min(...r.validation.runs.map(x=>x.spGenerated))}〜${Math.max(...r.validation.runs.map(x=>x.spGenerated))}。BURST発動${Math.min(...r.validation.runs.map(x=>x.bursts))}〜${Math.max(...r.validation.runs.map(x=>x.bursts))}回。技能別発動回数・解除/付与・敗北派はresults.jsonの各seedに保存。`,
  `- 最終条件・同じ20seedでの比較: 基準${comparison.baseline.wins}/20勝、支援技をまとめて外すと${comparison.control.wins}/20勝、攻撃技をLB0の別属性へ差し替えると${comparison.alternative.wins}/20勝。いずれも複数要因の比較であり、個別技の必須性は断定しない。平均行動数の支援除外差: ${comparison.actionDeltaWithoutSupport.toFixed(2)}。mechanic-comparisons.jsonに全seed記録。`,
  '',`### 報酬`, `毎回: ${JSON.stringify(s.rewards)}。初回: ${JSON.stringify(s.firstRewards)}。魂・券・遭遇: evidence/api-${s.designId}-input.json のquestSnapshotに全件保存。`,
  `証拠: evidence/${s.designId}-input.json、evidence/${s.designId}-state.json、results.json。数値は「検証済み条件」であり「最低」ではない。`);
 allDetails.push(detail.join('\n'));write('evidence/alternative-'+s.designId+'-input.json',a.input);
 prior.push(s);priorRewards.push(...s.rewards,...s.firstRewards);for(const reward of s.firstRewards){if(reward.kind==='character')fixedChars.add(reward.id);if(reward.kind==='skill')fixedSkills.add(reward.id);}
}
assert.equal(rows.length,68);const areaRewards=missions.filter(m=>m.condition.type==='area_clear');assert.equal(areaRewards.length,10);assert(areaRewards.every(m=>m.rewards.some(r=>r.kind==='free_diamonds'&&r.amount===300)));
write('audit-table.json',rows);write('results.json',results);
const intro=`# GAME04 全68面 攻略ガイド・再監査\n\n2026-09-26。開始基準 b958bbf。統合追従 d804d2a。公開識別APIで配信19c8f28、戦闘API v8。追従差分に戦闘エンジン・正式マスター変更なし。\n\n全68面を現行エンジンで実行。各面の固定入力・seed・結果を保存。勝利は入手保証とは別に判定する。所持/素材不足の面は条件付きとし、未成立の旧案を推奨から外す。観測勝率95%以上を本監査の安定目安とするが、真の勝率100%や最低育成値は保証しない。フロント数値は共用JSONと表示経路で照合。全68面をiPhone実機でクリアした結果ではない。\n\n初期配布・エリア1/2各5面・エリア任務無償輝石300を保持。無料攻撃BURST最大5回、通常攻撃代替なし、SP/ゲージ獲得なしを維持。調整案は隔離入力のみで、共通Preview/DB/ユーザー状態へ未適用。\n\n費用はLv1からの検証条件全体。固定供給との差は列挙した報酬だけとの比較であり、最低不足額ではない。以前の消費・変更した編成の育成費、未計上のレベル任務・日次任務等は別。魂の周回保証と確率ガチャを区別。供給計画は固定報酬と到達済み任務から算出し、ログボ日数・将来購入を黙って加算しない。\n\n`;
const table=['|面|名称・設計意図|整合|攻略条件|入手・育成|検証|判定|対応|','|---|---|---|---|---|---|---|',...rows.map(r=>`|${r.stage}|${r.name}／${r.intent}|正式JSON・フロント共用・API一致|${r.conditions.map(c=>c.name+' Lv'+c.level+'覚醒'+c.awakening).join('、')}（全装備/技は個票）|${r.acquisition.filter(a=>!a.guaranteed).length}種ガチャ等条件、育成銭${r.costs.cash.toLocaleString()}|${r.win}${r.additional?'＋追加'+r.additional:''}、${r.actions.join('〜')}行動|${r.status}|ガイド条件更新|`)];
fs.writeFileSync(OUT+'/AUDIT_TABLE.md',intro+table.join('\n')+'\n');
fs.writeFileSync(OUT+'/GAME04_ALL_STAGES.md',intro+table.join('\n')+'\n\n'+allDetails.join('\n\n---\n\n')+'\n');
console.log('report rows',rows.length,'成立',rows.filter(r=>r.status==='成立').length,'conditional',rows.filter(r=>r.status.startsWith('条件付き')).length);
