# GAME04 Battle全面改修 — 2026-09-19

## Authorityと差分監査

企画正本13章・Battle UI正本・改修計画Phase2を使用。企画前段に残るLeader/人数未定記述は後段の全員Passive・5人FIXで明示更新されているため後段を採用。今回の新APIは旧useBattle runtimeを経由しない。

| 分類 | 対象 | 方針 |
|---|---|---|
| KEEP | Character/Skill画像、共通Web基盤 | 素材pathをMasterから受け取る |
| MODIFY | Battle画面/速度/Skip/結果 | 縦画面の新BattleView、VIPに応じた倍速/Skip |
| REMOVE/HIDE | useBattleのSPDソート・旧作戦AI・PvP依存 | 新ループでは使用せず旧コード保存 |
| NEW | domain/redesign/battle.ts | 共通SP・カウント割込・BURST・Waveの純粋サーバー実行 |

## 実装

- `simulateBattle(BattleInput)` は同じseed/入力から同一replayを返す。外部通信・現在時刻・Math.random依存なし。
- 味方5人、最大3敵、最大5Wave。固定編成順、死亡スキップ、HP/SP/死亡状態引継ぎ。
- 全員Passiveは開始時一度だけ、同statを加算して適用。SP上限は適用後5人SP合計。
- 通常スキルは条件→SP→高コスト→slot順。条件型、ターゲット、回復、蘇生、Buff/Debuff、毒、SP変動を共通化。
- SP回復は成果×LUK÷Master係数。満タンを作った本人が抽選しLv/2+LUK補正、上限80%。BURSTは50%消費、最大5行動。連打ごとに敵カウントも減少。
- 敵は最大SP開始、被弾でSP回復、個別count到達順→同時ならorderで割込。SP充足スキルを連続使用。敵BURSTなし。
- HP閾値Boss phase、画像/スキル/行動count切替。死亡効果は敵味方共通。
- BattleViewはサーバー確定replayを再生するだけ。HP/SP/count・武将名Lv・3スキル状態・BURST領域、中央詳細、結果分析/ログ。
- 非VIP×1/×2、VIP×1/×2/×3とSkip。Skipは演出のみ省略、報酬計算を行わない。
- `totalDamage` は敵へのoverkill含む与ダメージ。Raid勝利倍率はRaid側が付与。

## 数値・後工程

係数/仮MasterはPreviewバランス値であり正式FIXではない。高コスト優先/ターゲット/割込順は正本の暫定仕様。
HP閾値以外のBoss phaseトリガーは正本上候補のため現時点未使用。Critical率の確定仕様がないため新しいCritical計算は追加しない。
不正Masterによる無限戦闘防止はmaxPlayerActions、死亡効果連鎖30、敵連続スキル100のガード。ガード終了は勝利にせず報酬対象外。

## 最低限確認

`node scripts/verify_game04_redesign_battle.mjs`:
seed一致、入力不変、5人順、共通SP、敵初期SP・割込、属性相性、Skill優先、Wave継続、Passive加算、Phase、BURST5行動上限をPASS。
