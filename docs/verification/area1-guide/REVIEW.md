# 本番エリア1ガイド保存エラー（2026-09-27）

対象は正式本番 https://sengoku-hime-ennbu.com （wwwはapexへ遷移）、Vercel game04-production-receiver、Supabase soiksqgtmcnspfedmanr。ユーザー入力のドット区切り www.sengoku-hime.ennbu.com は別ドメイン・接続不可であり変更していない。
基準は最新共通PR #37 1aa33af と本番実機修正 71aa5b5 を統合。現行本番Webは85e3417、API v2。並走のGoogle custom domain/DNS設定は変更しない。

## 特定した通信経路

|区間|要求URL|HTTP|Content-Type|リダイレクト|
|---|---|---|---|---|
|端末→ゲームAPI|https://soiksqgtmcnspfedmanr.supabase.co/functions/v1/game04-redesign-api?forceFunctionRegion=eu-central-1|400|application/json|記録なし|
|ゲームAPI→認証確認|https://soiksqgtmcnspfedmanr.supabase.co/auth/v1/user|521（16件）、522（1件）|text/plain|Location記録なし|
|修正確認時のゲームAPI|同/functions/v1/game04-redesign-api（本番はregion強制なし）|200|application/json|なし|

2026-09-27 12:02:21〜12:03:48 UTCに認証origin接続失敗。直前12:00:48までは200/application/json。API自体は配信済みで、404・認証画面への302遷移ではない。Authの非JSONエラー応答に対してawait auth.json()を無条件実行し、外側catchが例外messageを400 JSONで返し、ガイドがそのまま描画していた。
HTTPログには本文が保持されていないため、当時のHTML全文は回収できていない。HTML解析エラーに繋がる箇所は上記Authチェックに特定。ログ上のContent-Typeはtext/htmlではなくtext/plainであることを区別する。

## 修正

- Auth確認はstatus/Content-Typeを検査してからJSON解析。521/522を含む5xx・429・不正JSON/通信失敗だけ最大3回、4秒timeout/短い待機で再試行。読み取り専用確認に限定し、ゲームの更新処理は再送しない。
- 認証拒否は401のまま、リダイレクトは追従せず503。失敗継続は安全な503メッセージ。認証成功前にユーザーデータを更新しない。JWT検証有効を保持。
- 本番はeu-central-1固定を外し、プラットフォームの通常ルーティングを使用。隔離Previewの既存地域指定は保持。
- ガイド失敗をScreenState(error)と再試行へ。シナリオ本文や背面の共通Appエラーへ生の例外を混入させない。同期ロック・既存requestId保持を使用。
- ガイドからの任務表示はmissionNavigationPendingを初期判定し「ノーマル」タブへ。既存表示確認保存early_missions_openedを保持。

## 保存状態と検証

- 問題が出た時間帯の本番記録を読み取り確認。mikawa-1〜5各1回クリア、最終戦settled/firstClear=true、通常500銭+初回10000銭、育成素材・特選券3種を同一決済で保存済み。任務ガイドだけpending。一般ユーザーの状態・報酬は書き換えていない。
- 新規専用QAをqa分類（KPI除外）し、エリア1最終戦直前の独立fixtureを用意。Lv30は通信経路検証用でバランス受入ではない。1-5の実戦闘計算→無報酬プレビュー→勝利確定→同じ決済再送で二重付与なし→ガイドpendingを確認。clear.json。
- 375/390実画面＋本番API: ガイド表示→保存失敗を一度模擬→共通エラー・HTML本文非表示→同一requestIdで再試行→200→通常任務表示→early_missions_opened 200。browser.json/画像。
- verify_area1_auth.cjs: 521/522から復帰、不正JSON、401は再試行なし、302は追従なし、障害継続は3回で503、ログに認証値なしPASS。
- テスト初回のiframe用localStorage注入エラーは検証スクリプトだけを修正。最終再実行PASS。既存の未使用旧RPCに関するconsole warningは今回変更外であり、ゲームAPIの正常応答とは区別。
- 本番Edge v3へ更新。直前にv2全文一致を確認し並走上書きなし。62依存bundle hash c908826cb5b7ca671fbc7cd879cf4e617306f3b2f163fbe8131ebc530605ef46。

main・GAME03・認証ドメイン設定は変更なし。上流Authが長時間停止した場合は安全なエラーと手動再試行になり、認証を迂回しない。

型検査・Next build（46ページ）・共通UI guard・Edge bundle整合 PASS。
