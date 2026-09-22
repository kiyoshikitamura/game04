> 統合入口：../GAME04_MASTER_AUTHORITY_LATEST_2026-09-21.md 。本資料は保存時点の原文。採用範囲・以後の上書き・状態は統合入口を優先する。旧案・参考試算を自動採用しない。

# GAME04 正式数値・実戦検証 第1回

2026-09-21。設計・検証のみ。実装、DB、配信、Gitへの変更なし。

## 結論

正式数値による全戦闘の受入は未完了。現行計算器に2件の仕様差異があり、序盤・最終戦の勝率を正しく測定できない。正式数値を弱く/強くする前に、開発側でこの差異を解消する必要がある。今回、実行による再現と完成時ダメージの静的計算を行った。勝率・実再生時間・両レイド受入は未計測。

## 作業基準

- Repository: kiyoshikitamura/game04
- ブランチ: codex/game04-upstream-20260918
- 作業時取得SHA: 01328e483d3d8b6eb6bb9e7a793785543127a571
- 計算器: src/domain/redesign/battleBalanceV2.ts（battle.tsがbalance-v2-20260920で呼び出す実体）
- 参照依存: battleCommonV1.ts、battleLegacy.ts、types.ts。取得したコードを変更せず、隔離されたローカル環境でNode v24.19.0を用いて実行。
- 正式数値: ローンチ初期数値・残件整理v0.2の60体個体差、既存72スキル、装備160件、各エリア個別敵表。旧資料の仮値表示は最新採用承認により読み替え、旧チュートリアル5体開始案は使わない。
- 現行Preview・配信済APIがこのSHAと同一であることは今回確認していない。コード再現結果を稼働環境での再現と混同しない。

## 実行で確認した差異

|項目|正式仕様|取得した計算器の結果|影響|
|---|---|---|---|
|Wave上限|最大6。10-10は6Wave|6Wave入力が Invalid battle formation で拒否|10-10の全行程を測れない|
|敵の開始SPと上限|個別に設定。序盤は開始0、上限100など|stats.spが開始値と上限を兼用。上限100を渡すと開始100。initialSp:0を追加しても無視|敵スキル初動・連続発動回数が変わる|

2件目は型にも開始SP専用項目がなく、make処理がspをstats.spから初期化し、snapshot.maxSpもstats.spを参照する。開始0を再現するためstats.sp=0にすると上限も0になり、被弾SP蓄積ができない。入力値の工夫だけでは仕様を再現できない。
1-2町娘は開始35/上限100、1-3兼続は開始50/上限100。10-10信長は開始175/上限180。レイドは最新決定で開始満タンなので、このSP分離問題は主にクエストに直接影響する。

再現用入力は診断fixtureであり、正式編成の勝率集計に含めていない。敵には開始SP0・上限100を意図した入力を与えた。

```json
{
  "startSP": {"specifiedInitial": 0, "specifiedCap": 100, "observed": 100, "observedCap": 100},
  "sixWaves": "Invalid battle formation"
}
```

## 完成時10万ダメージの静的照合

到達目標の成立余地を、実在する組合せで確認した。勝率・技能発動までのSP確保・生存・道中突破を保証する結果ではない。

- 上杉謙信SSR、Lv100/覚醒+5、攻守寄りATK+2%。本体ATK16,320。
- 武器SSR攻撃型Lv100/LB10でATK4,000、装飾SSR攻撃型2個でATK3,200×2。2個は別所持個体が必要。装備表に存在する配分を使用。
- 残り防具からATKを加算しない。総ATK=26,720。
- SKD014水高威力単体LB10、倍率300%、通常消費SP150。
- P06 Lv10の単体スキルダメージ+20%。能動ATK強化・味方のATKパッシブ支援・敵DEF弱体はなし。
- 10-10の信長、HP337,500/DEF8,750、火属性。水有利1.5倍。DEFが追加補正されていない局面を計算。

式：floor((26,720×3−8,750)×1.5×乱数×1.2)

|乱数|1回のダメージ|ボス最大HPに対する割合|
|---|---:|---:|
|0.9|115,684|34.3%|
|1.0|128,538|38.1%|
|1.1（範囲上端の理論値）|141,391|41.9%|

この条件では10万超を満たす。HPだけを見ると1〜2発で必ず倒れる値でもない。回復・防御変化なしなら同条件の3発で337,500を超える。装飾を火力型2個にする代わりに、他配分のHP/DEF/LUKを失う。全キャラ・全技能が10万に達するという要件へ拡張しない。

## 開発への限定修正事項

1. 戦闘入力のWave上限を承認済み6へ合わせ、入力検証と保存/再生の関連上限を揃える。300行動上限を増やして解決しない。
2. 敵の開始SPと上限SPを分離する。開始値省略時の互換規則は既存保存戦闘を壊さない形で明示し、正式クエスト表は開始SPを明示的に渡す。上限だけ変更したり開始値を満タンへ統一しない。
3. 今回の修正に能力・報酬・SP獲得量変更を混ぜない。計算器の版と使用マスター版を結果に記録する。

本スレッドでは修正を実装していない。新しいゲーム仕様の提案ではなく、承認済み仕様と計算器の対応を求めるもの。

## 差異解消後の検証セット

|対象|比較|測定|
|---|---|---|
|1-1/1-2/1-3|初期3体→利家加入4体→半兵衛加入5体。所持保証分と無料ガチャ追加分を分離|勝率、残HP、行動数、スキル初発動、BURST依存|
|3-5|SSR0/SR複数/R補完、SSR1体入り。属性対応/補助過多|同上、編成変更での改善|
|10-1〜7|SSR5体・覚醒+4中心から+5混在。周回役/攻略役差替|周回勝率、行動数、必要資産|
|10-8/9/10|適合完成編成、対策不足、単純火力偏重、代替攻略|勝率、最終Wave到達、300行動打切り、死亡原因|
|エンカウント|対応LvのSR/SSR代表、単体/全体/防御/回復対策|個人勝率、共有HP貢献、3勝の消費行動力|
|侵攻|通常/関門/最終・対策編成と不足編成|個人戦と共有HP削りを分離、必要参加人数の条件付き試算|

初回は各固定編成100seedを同じseed集合で比較する検証案。100戦全勝でも真の勝率100%と断定しない。合格勝率の新しい基準を独自にFIXしない。結果を見て大きな問題のあるケースだけ深掘りする。演出時間は計算行動数から推定完了扱いにせず、再生側で確認する。

確定仕様は変更なし。今回確認できたのは計算器の不一致2件と、完成条件の10万ダメージ静的成立。正式戦闘の勝率・全ステージ受入・レイド討伐人数・実時間は未検証として保持する。

## 付録：再現コード

```javascript
import {simulateBalanceBattle} from './battleBalanceV2.ts';
const rules={version:'balance-v2-20260920',defenseFactor:1,advantageMultiplier:1.5,disadvantageMultiplier:.75,spRecoveryDivisor:1,burstLukDivisor:1,enemySpRecoveryDivisor:1,maxPlayerActions:300,initialSpRatio:0,balanceV2:{status:'PREVIEW_PROVISIONAL',version:'approved-input-probe',damageBonusCap:50,healingBonusCap:80,shieldBonusCap:50,shieldHpCap:50,periodicCapMultiplier:2,lowHpThreshold:.4,highHpThreshold:.7,diversityFactors:[0,.25,.5,.75,1]}};
const p={id:'player',name:'入力検証用',image:'',level:1,element:'fire',stats:{hp:1000,sp:0,atk:100,def:50,luk:10},skills:[],passives:[]};
const e={...p,id:'enemy',stats:{hp:650,sp:100,atk:35,def:10,luk:10},initialSp:0,initialCount:6,actionCount:6,order:0,hitSpGain:10};
const result=simulateBalanceBattle({seed:1,party:[p],waves:[[e]],rules});
const observations={startSP:{specifiedInitial:0,specifiedCap:100,observed:result.frames[0].enemies[0].sp,observedCap:result.frames[0].enemies[0].maxSp}};
try{simulateBalanceBattle({seed:1,party:[p],waves:Array.from({length:6},()=>[e]),rules});observations.sixWaves='accepted';}catch(err){observations.sixWaves=err.message;}
console.log(JSON.stringify(observations,null,2));

```
