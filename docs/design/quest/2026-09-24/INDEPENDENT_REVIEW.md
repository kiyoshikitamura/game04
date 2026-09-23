# 出陣 独立ビジュアル検証

## 初回検証

- 対象：初回実装 `fd8a8fc` の専用Preview。
- URL：https://game04-git-work-game04-quest-finish-20260924-kiyoshi-kitamura.vercel.app/qa/redesign?viewport=390
- 区分：**QA fixture**。本体・実API検証とは別。fixtureのHeader/Footerは旧仕様のため評価除外。
- `?view=quest` は画面指定されず本陣で起動。Footerから出陣へ遷移して確認。
- 正式三河は3ステージ。モックの7件や物語名を採用しない。

## 初回判定：未合格・表示担当へ直接差戻し済み

| 項目 | 観察 | 必要な修正 |
|---|---|---|
| エリア札 | 攻略中・未解放文字が札の左外へ出る | 札内部に文字を配置 |
| エリア名称 | モックに対して小さく、背景との主従が弱い | 同幅での文字占有率へ合わせる |
| ステージ | 番号丸が名称・行動力の先頭へ重なる | 番号を独立列へ固定 |
| 横スクロール | Dialog時にiframe下部へ横バー | 本体/fixture共有chromeを区別して原因修正 |
| 出撃準備 | 人物域が約75px・カード全高約215pxで人物が極小 | 人物を変形させず人物域とcropをモック占有率へ |
| 武将詳細 | 人物画像約160px幅・左右余白過大 | 共通部品を再利用しつつ大きな人物領域へ |

## 確認できた動作（fixtureのみ）

- エリア→ステージ→挑戦前→ヒント→戻る→報酬→戻る→出撃準備→武将詳細。
- 1-1挑戦可能、1-2/1-3未解放で非活性。
- 挑戦前の最終Waveボスは女侍、土、Wave1、行動力0表示。
- 共通SPは `0 / 400`。個別SP合算表記なし。
- 出撃準備は画像読み込み中に詳細・編成変更・出撃を抑止し、完了後に有効化。
- ヒントは中央・暗転・戻る。本文は正式description（名称と同文）。
- 報酬は初回/通常/レアを区分、内部金色スクロール、戻る固定。
- 詳細は実選択くノ一、Lv1/HP588、スキル一文字斬り/消費SP24。2/3枠は未解放（モックの未装備と区別）。

## 証拠

scratchの `independent-fixture-area.jpg`、`independent-fixture-stages.jpg`、`independent-fixture-before.jpg`、`independent-fixture-hint.jpg`、`independent-fixture-reward.jpg`、`independent-fixture-preparation-loaded.jpg`、`independent-fixture-detail.jpg`。
いずれも390×780のfixture枠を含む画面。読込途中のpreparation.jpgは受入証拠に使用しない。

## 未検証

配信修正後再検証、本体5画面、本体低画面、実編成変更往復、出撃/結果/帰還、行動力不足、再送・再読込。親担当の本体/API記録と統合する。初回結果を完成として扱わない。
