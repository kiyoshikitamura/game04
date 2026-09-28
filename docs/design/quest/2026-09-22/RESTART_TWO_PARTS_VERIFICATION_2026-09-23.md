# 2部品再開検証記録

## 基準と範囲

- 指示SHA: `dedb0843ff830fdfe7fb81412727fb2a2ce4788d`
- 候補基準: `d8c534b1d283ce3b6843b4fd139fb09550e6150e`
- 対象部品: `src/app/components/redesign/visual-bench/CharacterDisplays.tsx` と同階層CSS
- 確認ページ: `/qa/visual-parts`
- クエスト本体の既存画面接続: 今回は未実施
- Preview: https://game04-oaiehph86-kiyoshi-kitamura.vercel.app/qa/visual-parts
- Deployment: `dpl_A4QnoBKiEaX5kZhfXQ5YEZN77XNC`（Production公開なし）

## 照合表

|部品|承認モックとの照合|正式素材・対応表|共通ルール|実測結果|状態|
|---|---|---|---|---|---|
|`CharacterCard`|カード枠、背景、人物、属性、レアリティ、名前を分離した単体カード寸法|`local-characters.json` のcard、`character-backgrounds.json` の固定背景、`frame-{N,R,SR,SSR}.png`、element画像|面#262127、本文16px、カード名16px、タップ可能な選択UI、低減モーション|N/R/SR/SSRを選択操作し、人物の透明余白を外接矩形で測定。枠開口部、背景、顔、属性、文字を390px幅で目視|確認済み|
|`BossDisplay`|細いカード枠を使わず、幅358px／画像領域340pxの主役展示|`local-characters.json` のbattle、固定背景、正式属性画像。武器の長い`鍛冶師`で確認|背景・人物・属性・名前を別領域。人物を代用品へ退避しない|SSR豊臣秀吉、SR井伊直虎、長い武器のN鍛冶師を操作選択し、390px表示で人物・武器・背景・名前を目視|確認済み|

## 検証内容

- `NEXT_PUBLIC_USE_MOCK_DB=true npm run typecheck` 成功。
- `NEXT_PUBLIC_USE_MOCK_DB=true npm run build` 成功。
- `agent-browser` でPreviewをnetworkidleまで待機し、`/qa/visual-parts` のDOMと選択肢N/R/SR/SSRを確認。
- 選択操作後のN/R/SR/SSRカード、SSRボス、長い武器のボスを画像保存。
- SSRの前後スクリーンショットを4秒間隔で保存し、画像差分の平均値 `0.02131097046413502` を確認。光沢／内側光のアニメーションが停止画ではないことを確認した。
- `prefers-reduced-motion`、`document.visibilityState` による演出停止条件は候補CSS／実装を確認。ffmpegが環境にないため動画ファイル自体は生成せず、操作と前後画像で記録した。
- 必須画像は読み込み完了後にまとめて表示し、読み込み失敗時は対象を明示して「再読み込み」を表示する実装を確認。
- 比較画像: [visual-parts-comparison-20260923.png](./comparison/visual-parts-comparison-20260923.png)
- 個別画像: `visual-parts-N.png`、`visual-parts-R.png`、`visual-parts-SR.png`、`visual-parts-SSR.png`、`visual-parts-long-weapon-card.png`、`visual-parts-long-weapon-boss.png`、`visual-parts-SSR-before.png`、`visual-parts-SSR-after.png`

## 未完了・判断事項

- 明智光秀のバトル素材1件は供給待ち。確認ページでは未使用SSRサンプルを代用していない。
- 2部品の確認完了まではクエスト本体へ展開しない。編成5人横並び・複数ボス・挑戦前接続は後段。
- 動画保存はffmpeg未導入のため未実施。前後画像と実操作をGitへ保存した。
- Production公開、mainマージ、GAME03変更は行っていない。
