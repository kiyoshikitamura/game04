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

## 修正版 c896071 再検証

- 対象SHA：`c896071338940a59612a6faacb4cc1488db857ca`。上記390px fixtureをreloadして再確認。
- 札内の文字、ステージ番号と名称の分離、Dialog横スクロール解消、エリア名称拡大、詳細人物の外寸拡大は画面で確認済み。
- 詳細の内部スクロールでスキル本文まで到達し、上部閉じると末尾戻るが固定表示される。戻る→準備キャンセルの操作成立。
- 準備5列の人物域はモックより小さい残差がある。第13節の共通フレーム元比率1060:1484保持・画面側crop禁止を優先する比較補正（ASSET_MAPPING参照）として扱う。モック同等の人物占有率とは記述しない。
- 新規差戻し：準備・詳細・ボスの属性画像が実見約20×7pxに縮小し、漢字判読が困難。初回より小さいため表示担当へ確認依頼。
- 別tabの375×640本体はTAP TO START状態で、親QAのログイン状態を引き継がない。本体低画面は親担当のQA操作へ集約し、この記録で検証済みとはしない。
- 証拠：`independent-revised-area.jpg` / `stages.jpg` / `before.jpg` / `preparation.jpg` / `detail.jpg` / `detail-scroll.jpg`（後者各ファイルにもindependent-revised-接頭辞）。

全体完成判定は属性の可読性再確認および本体/API記録の統合後とする。

## 最終候補 c9a7104 再検証

- SHA：`c9a7104fa04a103d41b4b28c8df6a4e811a2e6df`。
- 固定Preview：https://game04-7mj36od2z-kiyoshi-kitamura.vercel.app
- Deployment：`dpl_3ZmSrh2BgkdMUSXCbDPfAtU9r2ey`。
- 固定URLの `/qa/quest-live-viewport?width=375&height=640` で「Preview配信情報」を開き、上記SHA・Deployment・固定URLの一致をブラウザDOMで確認。
- 同固定URLの390px fixtureで最終Waveボス・出撃準備5人・武将詳細の属性を再確認。属性は独立領域58×24px、画像実画約40×15pxへ改善し、水/土/火/光の漢字と色が判読可能。追加差戻しは解消。
- この担当の初回/再検証の表示差戻しは解消。正式枠比率優先による人物占有率の補正、および正式素材不足に由来する装飾差はASSET_MAPPINGの記録を保持する。モック完全一致とはしない。
- 本体操作・低画面・実APIをこのfixture結果で代替しない。親担当の実操作/API記録と統合して最終判定する。

### Git保存する比較証拠

`comparison/independent/` に修正版エリア/ステージ/挑戦前/準備/詳細/詳細スクロール、および最終候補の挑戦前/準備/詳細を保存。すべてファイル名でfixture系独立検証と判別し、この節でQA fixtureと明示。

最終配信確認：固定 https://game04-ovu5tdiqs-kiyoshi-kitamura.vercel.app の300×640本体入口にTAP TO STARTを確認し、配信情報のSHA `648ad12337a5f6e5c1ebb5e35c26d4672ddee4d6`・Deployment `dpl_5CngmMDqgU2RtefQatARgGXsq4Sr`・固定URL一致を独立ブラウザで確認（300px CTA操作の検証は親担当記録へ集約）。
