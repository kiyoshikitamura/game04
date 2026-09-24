# GAME04 バトルUI 素材対応表

対象：`src/app/components/redesign/BattleView.tsx` と `BattleView.module.css`。2026-09-24 実装時点。ゲームルール・画像の正式割当は変更しない。

|表示箇所|実装参照|接続・扱い|
|---|---|---|
|承認モック|`approved-battle-mock.jpeg`|通常・スキル命中・BURSTの配置基準。画像内の人物・数値はコピーしない|
|ロゴ|`/branding/tribe-neon-logo.png`|既存GAME04ロゴ。ファイル名を変更していない|
|出陣背景|`backgroundSrc` ← 選択ステージの `QUEST_AREAS[].image`|既存エリア素材を接続|
|共闘・領土侵攻背景|`backgroundSrc` ← 開催snapshotを優先する `getRoomRaidMaster(room).backgroundUrl`|中断再開を含め既存開催に対応する背景を接続|
|背景指定のない保存戦闘・QA|`/creative/backgrounds/char_reiji_01.png`|既存の安土城。暫定フォールバックであり全ステージの正式背景とは扱わない|
|背景の視認性調整|CSS `saturate(.4) brightness(.55)` と暗色グラデーション|既存素材自体は加工せず、人物・文字を優先して描画|
|敵・味方画像|記録frameの `state.image`、なければ該当 `unit.image`|実際のsnapshotを優先。戦闘用ディフォルメを含め正式データの画像を使い、モックの人物に置換しない|
|敵属性|`/ui/raid/v2/element-{element}.png`|共闘で使う既存属性素材と統一|
|味方スキル画像|`(state.skills ?? unit.skills)[].image`|変身・フェーズ変更を含め記録側を優先。最大3枠|
|状態アイコン|BattleView内のSVGパス|既存QAのSVG意匠を本体用に移植。攻撃・防御・継続効果・シールド・行動不能・反撃等を正式status typeへ接続。残り回数は `remaining`、シールド残量は詳細へ表示|
|金枠・順番・行動中|CSS|カード順は実編成順。行動中は記録frameの行動者を投影|
|HP・共通SP・BURSTゲージ|CSSバー＋記録frame数値|モック値を使わない。BURST表示は自動イベントの状態表示で手動発動機能は追加しない|
|カットイン|実行者の記録画像＋CSS暗転・光線・BURST文字|BURST開始／再開、スキル行動開始へ接続。命中frameで解除|
|命中・効果演出|`BattleEffects.tsx` と `BattleEffects.module.css`|対象別16系統。詳細は `BATTLE_EFFECT_ASSET_MAPPING.md`|

## スキル画像の未割当

- `balanceV2Masters.ts` の SKD 検証候補は `image: '/menu/event_banner_placeholder.png'`。同ファイルに「名称・画像未対応」「検証用仮値」「ガチャ未接続」が明記されている。
- `battle-common/fixture.ts` の合成検証用スキルも同じplaceholderを使う。これは検証用データであり、本体所持品・販売物へ追加していない。
- 当該placeholderはPreviewで画像読込失敗が確認された。既知の未割当パスに限り、バトルUIは先頭効果に対応するSVGのスキル種別アイコン（攻撃・回復・能力強化等）を表示する。操作時の詳細には正式データのスキル名・効果説明を表示する。未割当という実装事情はゲーム画面に表示しない。このパスは画像読み込み待機から除外する。別の正式画像で代用せず、画像割当済みとは扱わない。
- 手元の50件画像をSKD番号へ独断で割り当てていない。正式な名称・画像対応表が確定した場合に、Master側で接続する。

## 読み込み

表示に必要なロゴ・背景・人物・属性・スキルをまとめてdecodeし、準備完了後に一括表示する。読み込み中はnative modal dialogで背面操作を遮断し、画像失敗時は再試行を提示する。失敗を完了扱いにしない。

## 残る確認

専用Previewでの実画像表示・3状態比較は検証担当が実施し、証拠は検証記録に記載する。本表はブラウザ受入完了の代わりにはしない。
