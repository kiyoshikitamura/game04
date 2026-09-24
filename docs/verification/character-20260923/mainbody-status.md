# 固定Preview本体検証：PASS（新規合成QA）

固定Preview: `https://game04-btsnlophl-kiyoshi-kitamura.vercel.app`

GAME04 dev: `lrgyllgzcdcphlbmkknc`。既存ユーザーのセッション/私有stateを読まず、この作業中に通常の「はじめから」UIで新規作成した合成QA `CQA新規01` のブラウザだけを使用した。親がこのQAだけへ試験素材を補充。通信先は固定Previewと指定Supabase originに限定し、`vercel.live` は遮断。秘密情報はログ/証跡へ保存していない。

## 実本体の操作・結果・保存・再読込

`verify_game04_character_fresh_mainbody.cjs` 実行結果は `fresh-mainbody-browser.json`。**64画面、実API9操作、reload一致、pageerror0、失敗0。** QA routeやfixture responseへの置換は行っていない。

|本体UI操作|API|結果|
|---|---|---|
|編成の右移動|save_deck|200、編成保存結果→閉じる→新しい順序|
|装備を外す|save_deck|200、結果→閉じる→accessory1が未装備|
|同じ個体を装備し直す|save_deck|200、結果→閉じる→元のinstance IDと一致|
|武将Lv育成|character_level|200、Lv1→3、銭2,000,000→1,999,940|
|覚醒|character_awaken|200、覚醒0→1、現在Lv3は不変|
|魂から解放|character_unlock|200、未所持→Lv1/覚醒0|
|スキルLB|skill_level|200、LB0→1|
|装備Lv育成|equipment_level|200、Lv1→4|
|装備LB|equipment_lb|200、LB0→1、Lv上限50→55、現在Lv4は不変|

全操作でAPI receiptと中央結果Dialogを照合し、閉じた後の本体反映画面を撮影。最後にブラウザをreloadし、初期get_stateをreload前から待機して比較。銭・武将・スキル・装備個体・編成順/装備割当・固有魂・育成在庫・素材が直前stateと完全一致した（version11、最終銭1,990,400）。

## 表示確認

390×844 / 390×600。64画面で可視画像の未読込/破損0、横溢れ0、JavaScript pageerror0。表示したDialogは中央・80dvh以内・同時1つ・背面inert。低い画面でも内部スクロール末尾の閉じるへ到達し、その操作から本体へ戻れた。

`mainbody-comparison-01.jpg`〜`mainbody-comparison-06.jpg` は訂正済み6基準と実Preview本体の並置。検証担当が全6枚を目視した。キャラ一覧/詳細/詳細下部、デッキ/編成/スキル/装備、育成/覚醒/解放の操作前と結果、スキル/装備の操作前と結果を含む。

- 844高のLv育成で素材4種・消費表示・キャンセル/育成CTAが初期表示内に収まる。
- 編成候補が画面内に表示され、一覧2列の人物も崩れない。
- 600高の結果は内部スクロールを使用。`mainbody-character-result-end-390x600.png` で全差分と末尾CTAを確認。
- 主要な切れ、重なり、読み込み未完了画像は確認していない。基準内の表示例数値/所持キャラ/未採用絵柄と実QA stateの差、装飾密度の差は残るため、ピクセル一致とはしていない。

比較generatorは `complete=true`、`reload.pass=true`、必要な7種のAPI action成功が揃わなければ本体比較を作成しない。

## 先行する診断と今回の違い

既存QAセッションを利用する先行案はautomatic approval reviewに拒否され停止した。公開接続のトンネル失敗、TitleViewの「続きから」固定selector不一致、authLoading待機不足も診断した。既存セッション利用の拒否を迂回せず、通常UIでこのターン新規作成した合成QAだけを使う別方式へ変更した。

成功runではauthLoadingの完了を待って実際に表示された「チュートリアルを続ける」から進み、同一ブラウザrun内で上記全操作とreloadまで完了した。先行失敗記録は本体成功の証拠として用いていない。

既存50スキル→72スキルの未承認移行対応、全ユーザー資産移行、Production操作は本検証の対象外。
