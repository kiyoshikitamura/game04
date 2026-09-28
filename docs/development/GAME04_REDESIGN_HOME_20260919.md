# GAME04 全面改修 Lane F — Home / Community

## 正本
企画仕様・全面改修計画・Home UI 正本（2026-09-19）を参照。企画本文に残る過去案より、後続FIX・今回Handoffの初期公開範囲を優先する。

## 差分監査

|分類|旧実装|今回|
|---|---|---|
|KEEP|GameProvider / 認証 / プロフィール / 音設定|同じ利用者セッション・保存処理を利用|
|KEEP|InboxPanel / SettingsPanel / AccountAuthenticationModal|新Shellから中央モーダルとして接続|
|KEEP|全体 / DM送信・読取・既読処理|useGame既存ハンドラを利用|
|MODIFY|HomeTab / Header / Footer|RedesignShell / HomeViewへ切替、5枠Footer|
|MODIFY|ホーム武将・背景|新RedesignStateへ独立保存、編成と分離|
|MODIFY|コミュニティ|活動・全体・DMのみを中央モーダルへ|
|HIDE|PvP / RATE / GvG / Guild Chat / BBS|新Shellから露出しない、既存基盤を削除しない|
|HIDE|旧ホーム装飾保存・SeasonHonors・旧QA fixture投入|SettingsPanel redesignフラグで新ループ時のみ非表示|
|NEW|新クエスト続き・エンカウント緊急通知|新Quest Masterと新Raid状態を参照|

## 実装

- 先頭武将アイコン、利用者名・Lv・認証状態、銭・輝石・共通行動力、Menu。
- 同盟の将来枠を確保、初期機能は非公開。
- ホームの主役は既存武将立ち絵。保存先は新stateのhomeCharacterIdで、編成と独立。APIはset_home {characterId/backgroundId}。
- 背景2点は既存城門・城下町。新stateのhomeBackgroundIdで差替え可能。
- 任務・商店は小型操作。続きからは最新未クリアステージ情報を表示。
- Activityは既存RPC、PvP/GvG/Guild旧イベントを除外。新game04_social_eventsの救援はActivity・全体の双方へ旧feedと時刻順で混合表示、レイドCTAを接続。
- 全体 / DMはホームに最大3件、展開時は中央モーダル。全体投稿者名からDM開始可能。
- Footerはホーム・クエスト・キャラ・レイド・ガチャ。格納済み戦国アイコン5点を再利用。
- 共通Modalは中央配置、80dvh、内部スクロール、閉じる/Escape/フォーカス制御。
- 既存FullScreenPanel系も新Shell有効中は中央80dvhへ制限。

## 仮素材・残工程

- 薄型ローテーションバナーはCSS＋既存背景の仮表現。旧PvP/GvGバナーは出さない。販促素材確定後差替え可能。
- 全体・DMの本文はユーザー入力としてそのまま表示する。
- 任務は新clearedStages由来の攻略達成一覧に切替。旧MissionPanelのPvP/Guild誘導を新Shellから外す。達成報酬の最終Masterは後工程、画面に準備中を表示し追加報酬付与なし。ガチャ・ショップ最終商材、Tutorialは親側後工程。
- レイド通知は親が渡す有効なencounterRaidのみ表示。

## 確認

`npm run typecheck` PASS（Lane F完了時）。複数TSX編集に伴いReact best practicesを参照し、effect cleanup・入力ラベル・中央Modalのフォーカスを確認。最終build/Previewは統合担当が実施する。

## 統合補正
- Shell notifications領域でHomeにもAPIエラー・未完了Battle再開を表示する。
- QuestViewの再生状態を親へ通知し、Quest Battle中もHeader/Footerを隠す。
- Home「続きから」は最新未クリアstage、Footer「クエスト」はarea一覧へ分離。
- 課金復帰用initialTab propをRedesignAppへ追加（課金処理は別担当）。
