# 本体実接続検証用QAの準備（2026-09-24）

ユーザーから、専用QA認証をGAME04 devで使用してPreview本体の操作・保存・再読込を検証する明示承認を受領。

既存QAセッションの外部ファイル読込による検証は自動承認レビューに再び拒否されたため、そのセッションは以降使用していない。安全性が異なる代替として、ブラウザの空の状態から固定Previewの通常の「はじめから」・名前登録を操作し、検証専用の新規ゲストを生成した。既存ユーザーの認証情報や所持データは取り込んでいない。

- 固定Preview: https://game04-btsnlophl-kiyoshi-kitamura.vercel.app
- Supabase: `lrgyllgzcdcphlbmkknc` / GAME04 dev（MCP project確認済み）
- 新規QA名: `CQA新規01`
- 新規QA ID: `83d6fd82-bd7d-4d17-add0-bb583114367e`
- 通常UIでゲスト認証・名前登録・本体表示まで到達。GAME04 API HTTP200。
- その後、親担当がこの新規QAだけに銭200万、EXP素材、固有魂・汎用魂、スキル/装備LB素材、装備12個体を検証用に補充。最初の編成武将へ装飾1を設定し、付け外しを検証可能にした。
- DB再照合: 名前一致、銭2,000,000、装備12個体、state version 2、装飾1 `fresh-character-qa-0924-0`。

検証用補充であり、通常の初期付与・報酬量の受入を示さない。初期付与の既知不一致はmaterials.mdに残す。Production・既存ユーザー・正式Masterは変更していない。ブラウザプロフィールは一時領域のみで、認証情報をGit・報告・画像へ保存しない。

本体検証の結果は `fresh-mainbody-browser.json` と本体比較画像へ分離して記録する。
