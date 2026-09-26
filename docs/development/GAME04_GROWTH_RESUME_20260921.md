# GAME04 育成・ノーマルガチャ改修 再開記録

- 基準ブランチ：codex/game04-upstream-20260918
- 基準SHA：acf7ca53cd10ad79ed3a8e4d3d2c38ab609578cb
- 対象DB：lrgyllgzcdcphlbmkknc
- 正本：GAME04_GROWTH_AUTHORITY_V1_2026-09-21.md、GAME04_GROWTH_NORMAL_GACHA_HANDOFF_2026-09-21.md

## 再開時の状況

前作業フォルダのGit管理情報と一部ファイルが不完全だった。開発DBには育成用RPCと重複変換マスターが適用済み、game04-redesign-api v10はACTIVE。Gitに保存済みのv10チェックポイントと残存ソースを照合し、必要差分を再統合した。

## 今回の差分

育成計算・魂交換・素材分離・EXP繰越・プレイヤー回復・混合ガチャをソースへ保存。既存の育成画面にEXP投入／内訳／実消費／繰越、覚醒の固有魂・汎用魂内訳、魂解放・交換・選択アイテム、LB費用、育成済み装備分解確認を接続。通常登用は1,000銭／10連10,000銭／日次無料10連を新APIへ接続し、個別割合と変換結果を表示。特選登用の条件・価格・プールは変更しない。

## 検証状態

- 正本統合：本コミットで保存。
- 育成・ガチャ実装：代表ケースのローカル試験PASS（scripts/verify_game04_growth_resume.cjs）。全LvのEXP/銭800セルも正本一致。
- 関連UI：接続済み。型チェックPASS、Vercelビルド成功、Previewのローカル確認画面でEXP育成・魂併用覚醒・スクロールを確認。
- Preview受入：5fdb6a9ea9209b827f8ef19e3eff522b0959c13bでVercel success。通常のPreview URLは既存ブランチURLを継続。実APIの今回の再検証は通信タイムアウトのため未完了。
- 供給・正式バランス：未検証。クエストプレイヤーEXPマスターはUNCONFIGUREDのまま。

## 保留

既存のLv・EXP・旧育成素材を自動換算しない。旧育成データは移行確認待ちの表示で保持。既存10件のplayer stateにactiveのplayerProgress保存なし（読み取り時の初期Lv1/EXP0適合判定はRPC側）。移行方針・供給・商品・到達期間・最終画像は別工程。新アイテムは用途名で区別する暫定表示。

今回、DBの追加変更は行っていない。SQLファイルは既適用の内容を追跡保存するもの。GAME03・Production・戦闘v2・領土侵攻snapshot・ステージ報酬量は変更しない。

## Preview実操作の結果

- URL：https://game04-git-codex-game04-upstream-20260918-kiyoshi-kitamura.vercel.app/qa/redesign?view=character
- 専用ローカルfixture。API保存や実プレイヤーへの配布はしない。
- Nくノ一：EXP中1個でLv1→8、累計EXP1,000、銭30,000→29,120、所持中30→29。
- 覚醒：固有魂2＋汎用魂2、必要8,000銭。覚醒+1、各魂100→98、銭21,120、現在Lv8維持、上限60。
- Dialog内スクロール：clientHeight642 / scrollHeight1554 / overflowY:auto。
- 表示確認はデスクトップブラウザ。物理スマホ実機受入ではない。
- 後続の表示差分：EXPサイズ・魂レア別報酬ラベル、Portal内の入力余白を整理。基盤・数値変更なし。
