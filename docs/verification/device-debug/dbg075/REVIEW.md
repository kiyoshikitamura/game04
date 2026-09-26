# DBG-075 名前重複の表示修正

基準保存3eca6f4 / 配信ef04722 / PR #37。最新リモート一致を確認して着手。

## 原因

実DBの名前indexは users_username_normalized_uidx / lower(btrim(username))。実APIのtutorial_nextで重複を再現し、当該制約名入りのエラーが返ることを確認。IntegratedTutorialのe.message直接表示が内部文言を露出していた。通信失敗が原因という推定で処理していない。

## 修正

- 名前用制約違反の完全一致かつ名前入力段階だけを重複分類。単なる23505/他制約/部分一致は重複扱いしない。APIがSQLSTATEを落として文字列のみ返す現行契約へ対応。
- 共通CanonicalDialog compactで指定タイトル・本文・「入力し直す」。入力値/進行は保持、閉じた後に入力欄へフォーカス。送信中は入力を無効化、既存即時ロックで連打抑止。
- 既知の入力/進行競合文言のみ表示を許可し、その他は安全な保存・通信確認案内。診断情報はconsole.warn側へ保持。
- 名前一意性・正規化・文字種/数・DB/Edge・報酬/バランスに変更なし。

## 検証

- 専用QAを通常のgame04_begin_tutorialから開始。実APIで名前重複を再現。step15、version、武将は失敗前後不変。
- 実ブラウザ→実API：指定ダイアログ→入力値保持→別名保存→再読込step16と名前一致→同じrequestId再送一致。pageerror 0。
- 375/390×600：重複/通信/他の一意制約/入力不備を確認。内部コード非表示、入力欄フォーカス、連打抑止、訂正後再送。
- 初回UI検証はQAハーネスのGameContext不足で失敗。製品同様のProviderを追加して再検証PASS。製品側は既存GameProvider配下。
- 検証スクリプト：verify_dbg075_prepare.cjs（独立QA作成）、verify_dbg075_live.cjs（単発の名前保存）、verify_dbg075_ui.cjs（合成状態/幅/分岐）。セッションと環境ファイルはscratch/.envのみ、Git対象外。

実機受入は未確認。保存・配信SHAは配信記録へ追記。
- npm run typecheck / Preview環境による next build：PASS。

## 共通Preview配信

修正・配信SHA：0cc01e4141657762b45c690c633f5208031b9924。Ready deployment：dpl_H9sW8Zvvp1SKGRjwiFdAJKDtbLcR。配信直前のPR #37 HEAD一致を確認。共通Preview公開識別APIでSHA/branch/previewを確認。配信後も375/390×600で重複/通信/その他/入力不備、連打抑止、入力保持・フォーカス復帰、訂正後の進行をPASS。pageerror 0。状態：配信済み・実機確認待ち。

共通URL：https://game04-git-work-game04-common-preview-20260925-kiyoshi-kitamura.vercel.app
