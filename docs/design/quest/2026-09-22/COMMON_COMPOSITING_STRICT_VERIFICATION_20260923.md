# COMMON_COMPOSITING_STRICT_FIX 検証記録（2026-09-23）

## 基準

- 指示SHA: `d779292b1a2bb9b545ea9fdbe65b6f6b2804e8f9`
- 実装基準: `46377bfff487f2cfbc46d8054e55b05b400acc2d`
- 対象: 共通カード合成、クエスト実利用経路、出撃準備、武将詳細、ボス、エリア／ステージ一覧
- 数値・Battle Rule・Economy・正式プレイデータ: 変更なし

## 修正

- `CharacterDisplays`にN/R/SR/SSRごとのカード開口部定義を集約。正式フレームの外寸（1060x1484）と内側開口部を分離し、背景と人物を開口部内の専用ラッパーでクリップ、正式フレームを最後に重ねた。
- カード比率を`1060/1484`へ統一し、フレームの横伸ばし・縦伸ばしを廃止。人物は透明余白を計測したviewBoxのまま配置し、coverや追加トリミングを使用していない。
- 出撃準備・武将詳細は同じ`CharacterCard`合成部品を再利用。利用側から人物・背景・フレームの独自transform／clipを追加していない。
- エリア一覧・ステージ一覧の暗い横帯を縮小し、章名・エリア名の子要素背景を透明化。背景画像が文字背後まで見える局所グラデーションと文字影へ変更。
- ボス見出しを`ステージボス`へ統一。属性画像はLv・名前の同一情報グループへ隣接配置。代表1体選定（Lv→HP→元順）と戦闘配列非変更は維持。
- 編成外側の追加矩形枠を除去。属性・レアリティの表示領域はカード外の独立領域を維持する。

## 素材不足アラート（未完了）

レアリティ画像は、存在・HTTP200・ファイル名だけではGAME04正式素材と判定できないため、既存の候補`public/ui/rarity/rarity-badge-{n,r,sr,ssr}.png`を今回の表示から外した。GAME04正式の対応表・出自・実画像を確認できる資料がリポジトリ内にない。

- 不足範囲: N / R / SR / SSR 全て
- 必要用途: 共通CharacterCard、出撃準備5枚、武将詳細、確認ページのレアリティ画像バッジ
- 確認候補: `public/ui/rarity/rarity-badge-n.png`, `rarity-badge-r.png`, `rarity-badge-sr.png`, `rarity-badge-ssr.png`
- 不採用理由: 指示書でGAME03素材と指摘された既存候補で、GAME04正式素材としての出自を確認できないため。文字枠・生成画像による代替もしていない。
- 判定: 素材不足／未完了。正式素材の受領後、`FORMAL_RARITY_BADGES`へ対応表を登録して再照合が必要。

## フレーム・合成照合

使用した正式枠候補は以下。元画像は改変していない。

- `/public/creative/ui/frame-N.png`
- `/public/creative/ui/frame-R.png`
- `/public/creative/ui/frame-SR.png`
- `/public/creative/ui/frame-SSR.png`

全枠は1060x1484。表示用開口部は共通部品の`CARD_OPENINGS`に定義し、N/R/SRは上7.2%、右6.7%、下7.1%、左6.9%前後、SSRは上8.0%、右7.2%、下8.1%、左7.4%を実枠の透明余白・内枠から測定して設定した。これは画像四辺を開口部とみなす実装ではない。

## 実画面証拠

- `strict-after-01-area-390.png`: エリア一覧
- `strict-after-02-stage-390.png`: ステージ一覧・番号／本文／状態領域
- `strict-after-03-boss-390.png`: 1-1ステージボス、女侍HP650、属性隣接、スキル無し
- `strict-after-04-prep-390.png`: 出撃準備5枚、共通合成部品利用
- `strict-after-05-detail-390.png`: 武将詳細
- `strict-after-06-detail-375-scrolled.png`: 375px詳細下部・スキル領域
- `common-compositing-strict-comparison-20260923.png`: 前回実画面（左）／今回実画面（右）の同幅比較

## 判定

| 指摘 | 判定 | 根拠 |
|---|---|---|
| 共通カード開口部・比率・合成順 | 解消 | `CharacterDisplays`と実画面5枚で照合 |
| エリア背景と文字帯 | 解消 | 390pxエリア／ステージ画像で背景の視認性を確認 |
| 番号・本文・状態の重なり | 解消 | 独立grid領域、375/390pxで確認 |
| ボス見出し・属性隣接 | 解消 | `ステージボス`、女侍の名前横属性を確認 |
| レアリティ正式素材 | 素材不足・未完了 | N/R/SR/SSRの出自未確認。旧候補は不採用 |
| 65件の正式名称・ヒント | 未定義 | 前回記録を維持。勝手な名称・ヒントは追加していない |
| 報酬種別照合 | 未確定事項を維持 | 前回記録を維持 |
| 明智光秀バトル素材 | 素材供給待ち | SSR代用品は使用していない |

## 検証コマンド

- `npm run typecheck`: 成功
- `NEXT_PUBLIC_USE_MOCK_DB=true npm run build`: 成功
- agent-browserで390px／375pxのクエスト経路を実操作し、エリア→ステージ→ボス→出撃準備→武将詳細を確認
- 画像HTTP200のみを視覚合格の根拠にはしていない
- 本記録は素材不足を解消済みとは扱わない

## 固定Preview

- URL: https://game04-ocjnqabgq-kiyoshi-kitamura.vercel.app/qa/redesign?view=quest
- Deployment: `dpl_73DaGdbaNowRVLvsEftE1D7ufFwN`
- 配信SHA: `c26fd26`
- Preview上でエリア一覧と1-1ボス画面を再操作し、今回の見出し・背景・ボス属性近接配置を確認。
- Preview証拠: `strict-preview-01-area-390.png`, `strict-preview-02-boss-390.png`
