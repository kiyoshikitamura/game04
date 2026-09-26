# 条件・証拠・残りからの再開

## 読み取りで再利用したもの

`stage68-five-tier-20260926/*-validated.json.gz`の固定候補、元設定対照、逆順対照。今回の5帯比較に元設定の敵入力を混ぜない。入力は`inputHash`、敵は`stageProposal`で固定。8-5のみPR #40のbarrier/burst-focusを主/別戦法に優先する。

主経路と代替の入手保証は「fundedRecipesに名前があるか」だけで判定せず、必要武将Lv/覚醒・技LB・装備個数/Lv/LBを到達前の累積育成資産と照合した。序盤は確定取得済みのLB0技の付け替えも許容。所持条件の不足は各候補のassets.missingへ記録する。後半のこの資産は供給案Aに依存し、現行入手保証とは呼ばない。

同一育成比較は武将Lv/覚醒、装備、技LBを保ち、技選択・通常攻撃枠・攻撃順だけを変える。完全無追加の資源制約テストは別枠であり、5帯に混入しない。

## 新規試行

- 序盤8候補：選定210001～210020、独立211001～211200。既存正式技能のみ。中核発動は半数以上を実行確認の基準とするが、完全な因果効果の証明ではない。1-1強化型は41/200で不合格。
- 順序11候補：選定220001～220020、独立221001～221200。同じメンバー/技/装備を2位置交換する。目標帯を外れた候補もそのまま保存。6-2は保存比較だけで5帯が揃うため新規試行なし。
- 完全無追加6候補：231001～231200。3-1/6-2/10-10の各2候補。初期武将5名・現行確定5技・装備なし・LB0・覚醒0、列挙された既存収入内で育成できるLv。仮に前面まで到達済みという条件付き比較であり、途中面の連続到達を証明していない。

全25候補は保存済みの最終入力と異なることを検査した。順序テストは旧結果と別seed群のため、差が小さい場合に因果効果を断定しない。全勝/0勝は観測値。今回の5,380試行を回収時118,200試行へ混ぜて旧成果の実行数を書き換えない。

## なぜ未達帯が残るか

保存候補は全編成の網羅探索ではない。序盤の許容範囲が広く候補が全勝へ集中する面、編成順の変化で全勝/0勝に分かれる面、50～70%や20～40%の中間入力が未評価の面がある。これらは観測分布からの原因候補であり、理論上その勝率帯が存在しないとの証明ではない。

全68面JSONには現在の実数、各帯に近い3候補、その候補から何番と何番を交換するか、変更後の入力hashを保存する。次の作業では`candidate-inputs.json.gz`内の77固有入力を必要な面だけ選ぶ。124件は帯ごとの案で同じ入力を共有するため、同一stage/inputHashを一度だけ評価する。敵/供給案はそれだけで変更しない。新たな独立200seedを固定して保存し、目標帯を外れた結果も残す。

## 300行動の意味

`battleBalanceV2.ts`の`playerActions`が300に達しても勝利条件が成立しない場合の`action_limit`敗北。味方の通常/スキル行動、BURST内の各攻撃、行動不能スキップがカウントされる。敵の割込み回数やサーバー実行時間の上限とは異なり、Waveを跨ぐ。保存例で最後の一撃に勝利した300行動もあり、300という数だけで失敗と判断せずoutcome/reasonを使う。

低適合候補の過半数がこの理由で敗北した14面について、上限件数・直接1ダメージ比率・到達Wave・中核技・切替先の具体配置を保存した。回復/保護/SP競合の因果関係を集計だけで断定しない。既存の主/別戦法は成立しているので、追加弱体ではなく攻略案内と待ちUXを提案する。

## 実行・再開

Node 24.19.0を使用。Node 22の能力再構築の小数末尾差はPR #40の既知制約として保持。

```powershell
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --import ./scripts/stage68-loader.mjs scripts/stage68_decision_early.mjs 1-1 1-2 1-5 2-1 2-2 2-3 2-4 2-5
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --import ./scripts/stage68-loader.mjs scripts/stage68_decision_order.mjs 2-3 2-4 2-5 3-2 6-2 9-4 10-5
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --import ./scripts/stage68-loader.mjs scripts/stage68_decision_noadd.mjs 3-1 6-2 10-10
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --import ./scripts/stage68-loader.mjs scripts/stage68_decision_report.mjs
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --import ./scripts/stage68-loader.mjs scripts/verify_stage68_decision.mjs
```

検証ランナーは候補/面単位で原子的に保存し、完了結果をスキップする。初回選定だけ保存されたチェックポイントから独立評価を再開できる。`no-add`には58面の未検証入力もあるが、引数の面以外は試行しない。report/verifyは戦闘を実行せず保存データを検査する。

整合検査：全68面、25候補の入力再構築/勝敗/seed重複、敵/ルール不変、先取り報酬なし、Bの逐次資源収支、未検証案の配置、8-5優先、回収資料/本体の無変更。`checks.json`に結果を保存。実機・共有API入力受入・G5の検査ではない。
