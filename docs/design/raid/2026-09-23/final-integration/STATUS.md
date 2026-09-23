# レイド本体統合 — 作業記録（受入未完了）

基準: `9f0b683bbb5ed996d86e01b05d6c049f8b34d4f0`。
Branch: `codex/game04-raid-final-integration-20260923`。
Production公開・mainマージなし。クエストの仮FIXを変更しない。

## 手戻りの原因

本体は `RedesignApp → RaidView → game04-redesign-api → game04_raid_rooms`。
従来比較の `RaidTop/RaidRoomDetail/RaidTopData` は別の旧経路だった。
旧 `raid_rooms` の0件や旧RPC IDを、本体の欠損と同一視しない。
今回dev読取ではGAME04専用テーブルに16件（過去分含む）、player_stateに11件が存在した。

## 今回の変更

- 本体RaidViewから既存の参加・敵情報・参加者・報酬・救援・出撃準備・退出処理を維持し、共通表示部品へ接続。
- 共通CSSを一式整理。全面背景の任意枠／人物／透過情報／HP／CTA、詳細、同一ページのスクロール下部を構成。
- 勝利数は `participants.wins`、挑戦数は `attempts`、資格は3勝、参加時進行は `joinedLevel`。データを捏造しない。
- サーバーが開催者本人のusernameと編成先頭武将からportraitを投影。閲覧者・ボス・任意avatarによる代用をしない。
- 旧QA入口は `/qa/raid-integrated` へ集約。本体と同じRaidView・RedesignShellを使用する。QAはオフラインfixtureであり、実API検証は別記録とする。
- 未受取履歴から詳細・報酬Dialogへ接続。操作中の二重押下を抑止。
- 現行の非snapshotレイドの行動力を20へ修正。根拠: Master正本第4節。保存済みterritory snapshotは保持。

## 完成と扱えない差分

1. 正式資料は存在する。`docs/product/GAME04_MASTER_AUTHORITY_LATEST_2026-09-21.md` と `master_sources_20260921/encounter.md` / `invasion.md` / `rewards.md`。従来の「正本がない」は不正確。
2. 本体 `RAID_MASTERS` は引き続き2件の暫定実装。25ボス85組合せ・侵攻12段階・正式報酬への変換と接続は完了していない。`encounter_flame` / `unlock_shadow` を正式ID採用済みとはしない。
3. 正式レイド背景の対応は未供給。`RaidMaster.backgroundUrl` が未設定なら背景を差し込まない。キャラ用背景・GAME03背景を便宜的に使わない。そのため承認モックとの背景差分は残る。
4. SVG9種は未承認のまま。既存の属性画像は文字入り横長素材で、承認モックの丸形属性意匠とは異なる。UIの存在確認をモック一致と呼ばない。
5. Vercel接続でGAME04 project/deploymentを取得できず404。Git連携によるPreview可否を別途記録する。別projectへの配信はしない。

## 検証方針

本体部品のブラウザー実操作、同じ幅のモック比較、実APIの参加・勝敗・再読込・受取を分離して証跡化する。
Typecheck / Build / HTTP 200だけで受入完了にしない。残差をユーザーの細かい指摘待ちへ戻さない。
