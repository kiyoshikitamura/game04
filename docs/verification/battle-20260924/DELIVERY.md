# GAME04 バトルUI・演出 提出記録

- 実装Branch: `work/game04-battle-finish-20260924`
- 実装・配信対象SHA: `e62d3894b54ce70aede4a23a8fc2599c40b744da`
- Draft PR: https://github.com/kiyoshikitamura/game04/pull/29
- 基点: 最新UI統合 `1d426a6fc9a2a7e8d9ea6ae2d8fd6184bc80881d`。資料保存SHAへの巻き戻しなし。
- Preview: https://game04-git-work-game04-battle-finish-20260924-kiyoshi-kitamura.vercel.app
- Deployment: https://vercel.com/kiyoshi-kitamura/game04/Ee5KubkGr1Vg3SDExH8BpU1vihLJ
- Production変更・mainマージなし。

## 実装

本体BattleViewに通常・命中・BURST、静かな城郭背景、敵の大きな立ち絵、5人カード、状態・残り回数、共通SP、独立BURSTゲージを実装。既存正式素材と記録frameを接続し、勝敗・報酬・ゲームバランスは変更しない。

表示、接続、16系統演出、独立検証をサブエージェントで並走。モックは配置・演出基準とし、人物・数値・ロゴは既存データを優先した。停止・再開・倍速・SKIP、詳細Dialog、画像待機と再試行を実装。既知の未割当スキル画像のみ効果種別SVGへ解決する。

## 証拠

- `README.md` / `browser-verification.json`: ブラウザ検証と画像一覧
- `BUILD_AND_SCOPE.md`: 型・ビルド・変更範囲
- `formal-replay-inputs.json` / `replay-simulation.json`: 正式入力と再生検証
- `deployment.json`: 配信SHAと状態
- `../../design/battle/2026-09-24/BATTLE_UI_ASSET_MAPPING.md`: UI素材対応
- `../../design/battle/2026-09-24/BATTLE_EFFECT_ASSET_MAPPING.md`: 16系統演出・SKD対応

最終演出接続済みeb750903で7-7=55.131秒、9-9=33.568秒（×2、500ms観測＋操作呼出し誤差）。以降の変更は人物配置・停止時の描画・フォントのCSSと表示に限り、再生タイミング未変更。旧50.66秒/30.01秒は比較値であり合否閾値ではない。

## 残件一覧

|残件|影響・実装済み範囲|必要な判断・確認|
|---|---|---|
|SKD72件の正式スキル画像未割当|効果種別SVGで表示・詳細接続済み。正式画像接続済みとは扱わない|正式名称・画像対応表の確定|
|SPD強化・暗闇・沈黙|16系統内の描画定義は用意。現行v2正式効果への実戦接続は存在せず追加していない|採用する場合の正式効果仕様|
|認証付きAPI/DB永続化|本体コンポーネントのQA導線と接続ソースを検証。実APIの消費・結果保存を実測していない|検証アカウントと対象開催での受入確認|
|不変Previewホスト名|専用Branch PreviewとSHA別Deployment詳細を提出。Branch URLは次回pushで更新される|GAME04へのVercel接続権限が不足しており、不変ホスト名を取得できていない|

未決事項をゲーム仕様として独断確定していない。QAでの成功を認証付き実APIの成功とは扱わない。
