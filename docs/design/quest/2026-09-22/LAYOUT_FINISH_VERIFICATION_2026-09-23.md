# クエスト レイアウト仕上げ確認

## 基準

- 指示SHA: `18f78891da869a81324a6bd2aa830c17a80e50a4`
- 対象実装: `6be619948610e20f3242d446675284c1afe193eb` 以降の最新実装
- Preview: https://game04-hln9ta39v-kiyoshi-kitamura.vercel.app/qa/redesign?view=quest
- Deployment: `dpl_3oWrkfphwBs6F7mG6PXZBZGrG6Mr`（Production公開なし）

## 変更・確認結果

### ボス大写し

`03-challenge.png` でバトル用ディフォルメ画像を独立した大きな展示領域へ接続。編成カード用のレアリティ枠をボスへ流用せず、巨大なN表示を除去した。複数敵は正式Wave構成のまま2列で表示し、属性・名前・HP／ATK／DEF・スキル情報と挑戦／ヒント／報酬導線を保持した。

### 編成・詳細

`04-preparation.png` は5人のカード用素材、実レアリティ枠、属性、順番バッジ、名前・Lv・HPを独立配置。名前は14px相当を維持し、合計SP400、編成変更、戻る／挑むを保持した。

`05-character-detail.png` はポートレート素材を詳細専用領域へ拡大し、顔・上半身、正式パラメータ、正式スキルアイコン／名称／SP／効果を同時確認できる配置にした。

### エリア・Header

`01-area-list.png` は攻略中／未解放を色だけに依存しない旗・文字・鍵バッジで表示。Headerはポートレート素材の顔クロップとLv重ねを使用し、Header高や共通Footerを変更していない。

### ステージ装飾

`02-stage-list.png` は正式ステージ名（例：`初期3人で戦闘を学ぶ`）を表示し、designIdは補助情報へ分離。番号メダリオン、縦の接続線、挑戦可能／未解放バッジ、背景カード装飾を確認した。ステージ件数・順序・解放条件・消費量は変更していない。

## 保存した実画面

- [5画面＋ヒント＋報酬詳細比較](./comparison/quest-visual-comparison-20260923.png)
- [挑戦前](./comparison/03-challenge.png)
- [出撃準備](./comparison/04-preparation.png)
- [キャラ詳細](./comparison/05-character-detail.png)
- [エリア一覧](./comparison/01-area-list.png)
- [ステージ一覧](./comparison/02-stage-list.png)
- [攻略ヒント](./comparison/06-hint-detail.png)
- [報酬詳細](./comparison/07-reward-detail.png)、[末尾](./comparison/07-reward-detail-bottom.png)

## 検証

- `NEXT_PUBLIC_USE_MOCK_DB=true npm run typecheck` 成功。
- 専用Previewの `agent-browser` networkidle／DOMスナップショット確認成功。
- 390×844で全画面を再撮影し、比較画像を更新。小画面でボス・カード・詳細・状態バッジ・CTAの到達性を確認した。
- 正式65面、敵／Wave／報酬、編成5人、共通SP400、その他の正式数値・ルールは変更していない。

## 未完了事項

- 明智光秀の不足バトル素材1件はユーザー供給待ちとして別管理。未使用SSRサンプルは割り当てていない。
- ユーザー実機総合受入と領土侵攻を含む受入は別工程。
