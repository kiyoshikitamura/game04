# 2部品 属性可読性／フォント修正 検証記録

- 指示SHA: `74d989d77adbb6b1403ed8222ebcf72e172409e8`
- 修正基準: `7303a0344d620793e1d8e35cd38534e4cba0734a`
- 対象: `CharacterCard` / `BossDisplay` / `/qa/visual-parts` のみ
- クエスト本体、編成5人、複数ボス、キャラ詳細は未接続・未変更

## 修正内容

- 正式6属性画像は継続使用し、カードとボスの属性画像に14pxの属性名を隣接表示。絵文字・汎用バッジ・代替素材への置換なし。
- カード名16px、ボス名22px、属性補助文字14pxを維持。人物、背景、正式枠、レアリティ、正式Master数値は変更なし。
- 既存のNoto Sans JPを対象2部品とQAページの通常文字へ直接適用。QAのh1/h2は共通ルールのNoto Serif JPを維持。
- 読込失敗時の再試行、SR/SSR演出、非表示タブ停止、低減モーション、正式カード／バトル素材の選択は既存実装を維持。

## Preview確認

- Preview: https://game04-4iqhuev1n-kiyoshi-kitamura.vercel.app/qa/visual-parts
- Deployment: `dpl_7BU3AfJrsZb4yizin4KyyvVmoi3f`
- 状態: Ready / Previewのみ
- viewport: 390x844 と 375x844
- 選択確認: N くノ一、R お市の方、SR 井伊直虎、SSR 豊臣秀吉、N 鍛冶師（長い武器）

ブラウザ実測:

| 対象 | computed font-family | size | 結果 |
| --- | --- | --- | --- |
| カード名 | `"Noto Sans JP", sans-serif` | 16px | 明朝体へ戻らない |
| ボス名 | `"Noto Sans JP", sans-serif` | 22px | 明朝体へ戻らない |
| 属性補助文字 | `"Noto Sans JP", sans-serif` | 14px | 通常倍率で判読可能 |
| QA通常UI | `"Noto Sans JP", sans-serif` | 16px | Noto Sans JP loaded |

`document.fonts`: `Noto Sans JP=loaded`, `Noto Serif JP=loaded`。
属性名は正式画像と併記し、人物・顔・名前・レアリティを覆わないことを375px/390pxで確認した。

## Git保存証拠

- 比較全体: [visual-parts-attribute-font-fix-comparison-20260923.png](./comparison/visual-parts-attribute-font-fix-comparison-20260923.png)
- 390px: [visual-parts-attribute-font-fix-390.png](./comparison/visual-parts-attribute-font-fix-390.png)
- 375px: [visual-parts-attribute-font-fix-375.png](./comparison/visual-parts-attribute-font-fix-375.png)
- N/R/SR/SSR: `visual-parts-attribute-font-fix-{R,SR,SSR}.png` と390px Nを保存
- 長い武器: [visual-parts-attribute-font-fix-long-weapon.png](./comparison/visual-parts-attribute-font-fix-long-weapon.png)

## 検証結果と残件

- `npm run typecheck`: PASS
- `NEXT_PUBLIC_USE_MOCK_DB=true npm run build`: PASS（Preview buildもReady）
- 画像素材の加工・再生成なし。不足する明智光秀バトル素材は供給待ちのまま、未使用サンプルは割り当てていない。
- 動画制作・ffmpeg導入は実施していない。低減モーションと非表示タブ停止は既存コード確認のみで、今回の実動作確認結果としては記録しない。
- Production公開、mainマージ、GAME03変更は行っていない。
