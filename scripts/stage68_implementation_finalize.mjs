import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {OUT,rows,stageResults,brief,metrics} from './stage68_implementation_results.mjs';
import {write} from './stage68_decision_lib.mjs';
const masterPath='src/domain/redesign/data/quest65.json';
const adopted=JSON.parse(execFileSync('git',['show',`2c7822f:${masterPath}`],{encoding:'utf8',maxBuffer:20e6})),master=structuredClone(adopted),index=[],patch=[];
const all=[];
for(const row of rows){
 const x=stageResults(row),a=x.assessment;all.push(x);
 if(x.selected){const target=master.stages.find(s=>s.designId===row.stage);for(const [wi,w]of target.waves.entries())for(const [ei,e]of w.entries()){const chosen=x.selected.stage.waves[wi][ei];assert.equal(e.id,chosen.id);for(const field of ['hp','atk','def'])if(e.stats[field]!==chosen.stats[field]){patch.push({stage:row.stage,enemy:e.id,wave:wi+1,position:ei+1,field,before:e.stats[field],after:chosen.stats[field],mode:x.selected.mode});e.stats[field]=chosen.stats[field];}}}
 const originalStall=['3-2','3-5','6-2','9-1','9-3','9-4','9-6','9-10','10-1','10-2','10-5','10-6','10-7','10-8'].includes(row.stage);
 const unmet=[];if(a.missing.length)unmet.push({kind:row.stage==='1-1'?'DESIGN_UNMET':'CANDIDATE_OR_EVIDENCE_UNMET',reason:`5帯不足: ${a.missing.join(',')}`,next:row.stage==='1-1'?'操作導入で同育成の保存候補が全勝に集中。複数戦法免除を5帯免除へ拡張せず、初戦の失敗体験を導入する設計を別途判断。':'fill/searchの保存候補から技能配置・優先順の追加候補を作り、不足帯のみ独立200試行。'});
 if(a.stalled.length)unmet.push({kind:'DESIGN_UNMET',reason:`現行入力の保存済み${a.stalled.length}編成に300行動到達あり`,next:'当該失敗seedの最終生存者・回復量・敵攻撃対象を追跡し、停滞Waveの敵1体の攻撃/回復供給を調整。全体HP一律削減だけで閉じず、主/別/各帯で再評価。'});
 if(!a.alternative&&row.stage!=='1-1')unmet.push({kind:'TACTIC_EVIDENCE_UNMET',reason:'機械的な効果種別/対象差による別攻略の追加確認が必要',next:'既存の中核発動記録と戦術分類を照合。単なる技能名差で合格にしない。'});
 const dependency=a.dependency.filter(d=>!d.without);if(dependency.length)unmet.push({kind:'DEPENDENCY_EVIDENCE_UNMET',reason:dependency.map(d=>d.id).join(','),next:'到達前の所持技能へ置換/技能枠なしの通常SP供給を比較し、同育成200試行で確認。'});
 const result={stage:row.stage,name:row.name,developmentBaselineAdopted:true,additionalImplemented:x.selected?.mode??null,masterCondition:x.selected?'追加調整入力':'採用43面+配布A入力',fiveBandsComplete:!a.missing.length,missingBands:a.missing,primary:brief(a.primary),alternative:brief(a.alternative),tiers:a.tiers.map(brief),dependency:a.dependency.map(d=>({id:d.id,without:brief(d.without)})),stalled:a.stalled.map(brief),original14:originalStall,original14ResolvedInValidatedSet:originalStall&&!a.stalled.length&&!!x.selected,unmet,verdict:unmet.length?'未達あり':'計算上の保存比較条件を充足（実機未受入）',deviceAccepted:false,G5:false,reviewedVariants:x.variants.map(v=>({mode:v.mode,missingBands:v.assessment.missing,stalled:v.assessment.stalled.map(c=>({name:c.name,...metrics(c.validation)})),dependencyMissing:v.assessment.dependency.filter(d=>!d.without).map(d=>d.id)}))};
 write(`${OUT}/stages/${row.stage}.json`,result);index.push(result);
}
const current=JSON.parse(fs.readFileSync(masterPath));assert(JSON.stringify(current)===JSON.stringify(adopted)||JSON.stringify(current)===JSON.stringify(master),'Master diverged; review before overwrite');
if(process.argv.includes('--apply'))fs.writeFileSync(masterPath,JSON.stringify(master,null,2)+'\n');
write(`${OUT}/additional-enemy-patch.json`,patch);
const summary={fiveBandsComplete:index.filter(r=>r.fiveBandsComplete).length,fiveBandsRemaining:index.filter(r=>!r.fiveBandsComplete).map(r=>r.stage),conditionalAllChecks:index.filter(r=>!r.unmet.length).length,unmetStages:index.filter(r=>r.unmet.length).map(r=>r.stage),additionalStages:[...new Set(patch.map(p=>p.stage))],additionalFields:patch.length,original14Resolved:index.filter(r=>r.original14ResolvedInValidatedSet).map(r=>r.stage),original14Remaining:index.filter(r=>r.original14&&!r.original14ResolvedInValidatedSet).map(r=>r.stage),newlyObservedStallStages:index.filter(r=>!r.original14&&r.stalled.length).map(r=>r.stage),applied:process.argv.includes('--apply'),realDevice:false,G5:false};write(`${OUT}/summary.json`,summary);
fs.writeFileSync(`${OUT}/STAGES68.md`,['# 全68面の現行入力判定','','全勝/0勝は試行上の結果。5帯充足と停滞解消、総合受入を分離。到達前資産Aを前提とし、現在面の初回報酬は使用しない。面別JSONに編成・技能・育成・原証拠と残件を保存。','','|面|追加調整|5帯（全勝/約60/約30/低率/観測0）|300行動のある保存編成数|判定|','|---|---|---|---|---|',...index.map(r=>`|[${r.stage}](stages/${r.stage}.json)|${r.additionalImplemented??'なし'}|${r.tiers.map(t=>t?`${t.metrics.wins}/${t.metrics.n}`:'不足').join(' / ')}|${r.stalled.length}|${r.verdict}|`)].join('\n'));
fs.writeFileSync(`${OUT}/IMPLEMENTATION.md`,['# 追加の敵差分','','基準43面273項目・配布44箇所に重ねる開発検証用の差分。技能・行動・共通式・300上限・BURSTは変更しない。各面の複数攻略/技能依存/5帯の証拠はSTAGES68.mdから参照。','','|面|敵/Wave/位置|項目|採用基準案→追加調整|','|---|---|---|---|',...patch.map(c=>`|${c.stage}|${c.enemy} W${c.wave}/${c.position}|${c.field}|${c.before}→${c.after}|`)].join('\n'));
console.log(JSON.stringify(summary));
