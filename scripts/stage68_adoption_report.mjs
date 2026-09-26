import fs from 'node:fs';
import assert from 'node:assert/strict';
import {OUT,read,gz,metrics,write,rows,previous} from './stage68_adoption_lib.mjs';
const stalls=read(`${OUT}/stall14.json`),enemies=read(`${OUT}/enemy43.json`),deps=read(`${OUT}/skill-dependency.json`),remaining=read(`${OUT}/remaining59.json`);
let screens=0,validation=0,inputs=0;const tested=[];
const fmt=m=>`${m.wins}/${m.n}勝、300到達${m.actionLimit}/${m.n}、行動 中央${m.median}/P90 ${m.p90}/最大${m.max}`;
const text=['# 14面の停滞：戦闘側の限定比較','','行動数はプレイヤー行動数。全て実再生時間は未測定。UI案は末尾の補助案であり解消判定に含めない。主/別/約60%は保存済み条件での分類で、敵を変更した後の帯を保証しない。0勝は理論上の不可能を意味しない。',''];
for(const s of stalls){
 const t=gz(`${OUT}/stall-tests/${s.stage}.json.gz`);assert(t.complete);tested.push(t);
 text.push(`## ${s.stage}`,`観測：${s.causes.observed} 1ダメージ比率${(100*s.causes.directOneDamageRatio).toFixed(1)}%。長時間消費Wave ${s.causes.stalledWave}。`,`原因仮説：${s.causes.hypotheses.join('／')}。対象選択・行動制御の寄与を断定する除去比較は未実施。`,'','|役割・編成|旧勝率・停滞・行動数|','|---|---|');
 for(const [role,c]of [['最適候補',s.primary],['別攻略',s.alternative],['約60%候補',s.near60],['対象低勝率',s.representativeLow]])text.push(`|${role} ${c?.name??'該当記録なし'}|${c?fmt(c.metrics):'未測定'}|`);
 const strongStall=[s.primary,s.alternative,s.near60].filter(c=>c?.metrics.actionLimit>0);text.push('',`上位攻略での停滞：${strongStall.length?strongStall.map(c=>c.name).join('、'):'保存した主・別・存在する約60%では0件'}。停滞があった保存編成は次の通り。`);
 for(const c of s.details)text.push(`- ${c.recipe.name}（${c.stageOfRate}）：${fmt(c.recipe.metrics)}。資産条件${c.recipe.assets.covered?'内':'外・参考'}。配置/技能はstall14.jsonのdetails.recipe.order。`);
 text.push('','|局所案（未承認）|敵・変更前→後|12試行選定|独立200試行|','|---|---|---|---|');
 for(const v of t.variants){
  inputs+=v.records.length;
  for(const c of v.records){screens+=c.screen.n;validation+=c.validation?.n??0;assert.notEqual(c.inputHash,c.oldInputHash);}
  text.push(`|${v.name}|W${v.target.wave}/${v.target.position} ${v.target.id} ${v.target.name}：${v.changes.map(c=>`${c.field} ${c.before}→${c.after}`).join('、')}|${v.records.map(c=>`${c.name}: ${fmt(metrics(c.screen))}`).join('<br>')}|${v.records.filter(c=>c.validation).map(c=>`${c.name}: ${fmt(metrics(c.validation))}`).join('<br>')||'選定不通過・未実施'}|`);
 }
 const failure=t.acceptance?Object.entries(t.acceptance).filter(([,v])=>!v).map(([k])=>k).join('、'):'主攻略維持/低勝率<=40%/15行動以上短縮/停滞減少/中核技発動の複合選定を通過せず';
 const next=s.stage==='10-8'?'局所DEF/ATK案を限定採用候補とする。対象低適合編成の敗北を早める案。全ての未達帯と技能なし代替は新入力で未検証。':s.stage==='10-6'?'300到達は0/200まで改善したがP90が267行動で運用選定基準240を超える。部分改善候補として保留。':s.stage==='9-3'?'低適合の46/200がなお300到達。短い敗北154件と停滞46件を混ぜて平均だけで合格にしない。保留。':'両案をそのまま採用しない。上表の変更値は失敗を含む比較案であり推奨完成値ではない。次の変更は停滞Waveで残存する敵の防御/回復供給と味方被害を1要因ずつ確認してから設計する。';
 text.push('',`結論：${t.recommendation}。未達基準：${failure||'今回の限定選別基準は通過'}。${next}`,`証拠：[面単位チェックポイント](stall-tests/${s.stage}.json.gz)。敵全入力・編成全入力・seed別勝敗/発動/行動を保存。`,'');
}
text.push('## 補助UI（別承認）','一定期間HP/SP/敵数の進展がない場合に、対象選択・属性・攻撃順を見直せる案内と撤退手段を提示する。発火条件/表示タイミングは実再生計測後に定義する。案内表示を戦闘停滞の解消として数えない。共通300行動上限の引下げは提案しない。');
fs.writeFileSync(`${OUT}/STALL14.md`,text.join('\n'));
const summary={newInputCount:inputs,screenTrials:screens,independentTrials:validation,totalTrials:screens+validation,limitedCandidateStages:tested.filter(t=>t.recommendation==='LOCAL_CANDIDATE_PASSES_LIMITED_GATE').map(t=>t.stage),partialCandidateStages:['10-6'],realDevice:false,G5:false};write(`${OUT}/experiment-summary.json`,summary);
const index=['# 全68面：採用判断の対応表','','旧入力の結果と追加停滞入力を混ぜない。5帯は保存SHA 77142a4の到達前資産条件付き判定を維持し、9面/残59面を今回の局所実験で変更しない。各面の編成・育成・実測・欠けた帯は既存の面別JSONを直接参照。','','|面|旧5帯|敵43案|技能依存の注意|停滞追加|残件主因|条件・実測|','|---|---|---|---|---|---|---|'];
for(const r of rows){const p=previous(r.stage),d=deps.find(x=>x.stage===r.stage),rem=remaining.find(x=>x.stage===r.stage),t=tested.find(x=>x.stage===r.stage);index.push(`|${r.stage}|${p.missingWithinBudget.length?'未達':'条件付き充足'}|${enemies.some(e=>e.stage===r.stage)?'未承認変更あり':'変更なし'}|回避未確認 ${d.unresolved.join('/')||'なし'}、60%未満のみ ${d.onlyMarginal.join('/')||'なし'}|${t?.recommendation??'対象外'}|${rem?.principal??'5帯以外の承認・実機確認を保持'}|[面別](../stage68-decision-20260927/stages/${r.stage}.json)|`);}
fs.writeFileSync(`${OUT}/STAGES68.md`,index.join('\n'));
const effectName={damage:'直接攻撃',atk_up:'攻撃強化',def_down:'防御低下',heal:'回復',hot:'継続回復',dot:'継続ダメージ',stun:'行動停止',barrier:'障壁',counter:'反撃',remove_buff:'強化解除',remove_protection:'保護解除',cleanse:'弱体解除',protect:'かばう',def_up:'防御強化'};
const tactics=['# 敵43面の攻略構造と証拠の範囲','','敵の数値案だけでは攻略性の証明にならない。以下は同程度の資産で保存した主/別戦法の効果構成、実発動、順序対照を対応付けたもの。属性補正・BURSTを個別に無効化した因果比較は未実施であり、発生しただけで必須性を断定しない。SP消費なし・攻撃技能最大5回・通常攻撃なしの承認済みBURSTを維持する。',''];
for(const e of enemies){
 tactics.push(`## ${e.stage}`,`変更対象敵の属性：${e.enemies.map(x=>`${x.id}=${x.behaviorAfter.element}`).join('、')}。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。`,'','|攻略|配置順の技能・効果・対象・条件・実発動試行数|','|---|---|');
 for(const [label,ms]of [['主',e.primaryMechanics],['別',e.alternateMechanics]])tactics.push(`|${label}|${ms.map(m=>`${m.slot}:${m.id} ${m.effects.map(x=>effectName[x.type]??x.type).join('/')}（${m.element}、${m.target}、${JSON.stringify(m.condition)}）${m.casts}/${m.n}`).join('<br>')}|`);
 const main=new Set(e.primaryMechanics.flatMap(m=>m.effects.map(x=>x.type))),alt=new Set(e.alternateMechanics.flatMap(m=>m.effects.map(x=>x.type)));
 tactics.push('',`勝ち方の相違：主だけの効果=${[...main].filter(x=>!alt.has(x)).map(x=>effectName[x]??x).join('、')||'効果種別差なし'}／別だけの効果=${[...alt].filter(x=>!main.has(x)).map(x=>effectName[x]??x).join('、')||'効果種別差なし'}。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。`,`攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は${e.orderContrasts.length}件。同資産低勝率比較${e.lowerSameBudget?.name??'なし'}。具体勝敗はENEMY43.md。`,`BURST：主${e.primaryBurstRuns}/${e.primary.n}、別${e.alternateBurstRuns}/${e.alternative?.n??0}で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。`,'');
}
fs.writeFileSync(`${OUT}/TACTICS43.md`,tactics.join('\n'));
console.log(JSON.stringify(summary));
for(const t of tested.filter(t=>t.selected))console.log(JSON.stringify({stage:t.stage,changes:t.variants.find(v=>v.name===t.selected).changes,results:t.variants.find(v=>v.name===t.selected).records.map(r=>({name:r.name,...metrics(r.validation)}))}));
