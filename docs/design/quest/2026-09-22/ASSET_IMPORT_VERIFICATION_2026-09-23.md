# クエスト素材取り込み・Preview照合記録

## 取り込み結果

- 指示SHA: `e60e821802e25ac516960f44dca5e9f9a8496e97`
- 調査対象実装: `72871abb48b789ec46f2c4fab311e5a876d6ffeb`
- 固定取得元: `efc8d54d188dcfc403b6c7c8e59e796ea1a5985c`
- `public/creative/` は取得元の不足210パスを同一パス・バイナリで追加。全パスのsource Blobと実装Blobは [ASSET_IMPORT_PATHS_2026-09-23.json](./ASSET_IMPORT_PATHS_2026-09-23.json) に記録した。
- 既存の属性6画像は取得元とBlob一致を確認し、置換していない。
- `config/game04-local-characters.json`、`src/theme/local-characters.json`、`src/theme/local-backgrounds.json`、`src/theme/creativeAssets.ts` を追加した。
- `CreativeCharacter`（カード素材＋正式レアリティ枠）、`HomeEffect`（背景演出HTML）、`presentationSettings` を追加した。

## クエスト接続

- エリア背景は `local-backgrounds.json` の既存対応を使用。
- 敵は正式対応表のキャラIDから `battle` 素材を解決し、全身立ち絵への代替を行わない。
- 編成カードは `card` 素材、詳細は `portrait` 素材、報酬キャラ／魂は `portrait` 素材を使用。属性バッジ、正式レアリティ枠、正式スキル対応表は既存実装を保持した。
- 戦闘ルール、65面の正式ステージ、Wave、敵数値、報酬量、編成5人、共通SP400は変更していない。
- 明智光秀の不足バトル素材は取得元59件とは別のユーザー供給待ちとして未割り当て。

## 検証

- `NEXT_PUBLIC_USE_MOCK_DB=true npm run typecheck` 成功。
- `NEXT_PUBLIC_USE_MOCK_DB=true npm run build` 成功。
- 専用Previewへデプロイ後、390×844でエリア一覧、ステージ一覧、挑戦ダイアログ、出撃準備、キャラ詳細、攻略ヒント、報酬詳細を撮影し、承認モックと比較画像を保存する。
- 報酬詳細は末尾までスクロールして確認する。

## 残件

- 明智光秀のバトル用素材はユーザー供給待ち。
- 実機総合受入と領土侵攻を含む受入は別工程。
- Production公開・mainマージ・GAME03変更は行わない。
