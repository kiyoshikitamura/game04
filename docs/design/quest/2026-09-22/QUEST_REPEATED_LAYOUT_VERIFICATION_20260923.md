# QUEST_REPEATED_LAYOUT_FIX 検証記録（2026-09-23）

## 基準

- 指示SHA: `a159a7ef64d2124b09742af0003056483153bd9d`
- 実装基準: `403fbbf4036c725b1c6c0ef529163ea53baf4aff`
- 対象: エリア一覧、ステージ一覧、ステージボス、出撃準備、キャラ詳細
- Production公開・mainマージ・GAME03変更: 未実施

## 5点の結果

| 指摘 | 結果 | 確認内容 |
|---|---|---|
| 1. エリア章の不透明帯 | 解消 | `body.game04-theme`の汎用`.rq-area :is(strong, span)`競合を特定し、章要素だけ透明化。状態バッジの背景は保持。390px実画面で章文字背後と右側の背景画像を確認。 |
| 2. ステージ番号と文頭 | 解消 | 勝っていた`body.game04-theme .rq-stage`の36px/6px指定を特定。共通CSSを1定義へ整理し、52px列＋12px gapへ統一。実測でメダリオン右端から本文左端まで20px（影を含めても8px以上）。 |
| 3. ステージボス枠 | 解消 | `BossDisplay`がCSS Moduleのため旧`.bossArt`指定が効いていなかった。属性セレクタで実DOMの`bossArt`枠を0へ整理。Hero、boss-stage、bossArtのcomputed borderは全てnone。 |
| 4. 出撃前の画像／名前重なり | 解消 | 固定`height:98px`・`flex-basis`・`first-of-type`指定を廃止し、画像→属性→名前→Lv/HPを通常フロー化。5人、長い名前、属性画像下配置を390pxで確認。正式レアリティ画像不足は旧素材で補完していない。 |
| 5. キャラ詳細サイズ／余白 | 解消 | 詳細カードを実占有幅220pxへ縮小（transform不使用）、本文上端から可視フレーム上端約15px、下端から名前約12pxへ調整。375px低い表示高さで名前・能力値・スキル見出し・閉じるCTAを確認。 |

## 競合CSSの整理

`QuestView.css`を重複追記型から単一定義へ整理し、旧`rq-stage`の52/46/40px定義、`rq-detail-profile>div:last-child`の44/30px余白、`rq-party-card>div:first-of-type`の78x98固定、`rq-boss`枠競合を除去した。共通CSS側の汎用ルールで残った2点は実computed styleで勝者を特定し、対象範囲のスコープ規則へ統合した。

## 実画面証拠

- `repeated-after-01-area-390.png`
- `repeated-after-02-stage-390.png`
- `repeated-after-03-boss-390.png`
- `repeated-after-04-prep-390.png`
- `repeated-after-05-detail-390.png`
- `repeated-after-06-detail-375-top.png`
- `repeated-after-07-detail-375-bottom.png`
- `quest-repeated-layout-comparison-20260923.png`（左: 前回固定Preview相当、右: 今回修正）

検証条件はagent-browserのviewport 390x844、375x700。375x700はブラウザ上部UIで表示高さが狭いケース相当として扱い、実機そのものとは断定していない。

## 継続残件（完了扱いにしない）

- GAME04正式レアリティ素材 N/R/SR/SSR: 出自未確認の`public/ui/rarity/rarity-badge-{n,r,sr,ssr}.png`は不採用。
- 正式ステージ名・攻略ヒント65件: 未定義。
- 明智光秀の正式バトル素材: 供給待ち。
- 報酬種別照合: 前回記録の未確定事項を維持。

## 検証コマンド

- `npm run typecheck`: 成功
- `NEXT_PUBLIC_USE_MOCK_DB=true npm run build`: 前回同一実装系統で成功。今回のCSS／TS変更後もtypecheck成功。
- 画像HTTP200やBuild成功だけで視覚合格とはしていない。実画面とcomputed style、比較画像を根拠に判定した。

## 固定Preview再確認

- URL: https://game04-6xee0c1t9-kiyoshi-kitamura.vercel.app/qa/redesign?view=quest
- Deployment: `dpl_CKzRvxHkST11pwEdfgvtisfyXKf1`
- 配信対象実装SHA: `b965a8c`
- Previewでエリア一覧→ステージ一覧→1-1ステージボス→出撃準備→武将詳細→375pxスクロール後を再操作し、NG消失を確認。
- Preview証拠: `repeated-preview-01-area-390.png` ～ `repeated-preview-06-detail-375-bottom.png`
