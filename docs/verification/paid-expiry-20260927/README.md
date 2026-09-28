# GAME04 有償期限：境界・失効処理検証

対象はPR #37（work/game04-common-preview-20260925）と共通Previewの隔離DB `znakrkaazliexzwihxge`。着手deaf64e、命名更新9d0ff8fを取り込み済み。既存の名称・UI・戦闘成果を保持。main、本番、GAME03、一般ユーザーの期限は変更していない。

## 判定と既存契約

既存契約の120日を変更していない。購入付与時のissued_at＋120日をBOXとlotへ保存し、受取で再起算しない。期限Tの直前のみ利用可能、T以上は失効（既存SQLのstatement_timestamp基準）。有償アイテムは期限の早いlotから消費。有償輝石は無償を先に消費し、その後は有償の期限順。新しい期限や課金ルールの提案はない。

根拠：20260913105839／20260913111028／20260913120945の購入・lot実装、game04_p02_paid_formal_inventory.sql、game04_p02_exchange_derived_lots.sql、isolated/g3/10_live_runtime_additions.sql、現行30_present_claim.sql、ShopTabの120日表示。sources/は変更なし。

## 境界の期待値と実結果

|条件|期待|実結果|
|---|---|---|
|T−1ms|受取可能、元期限維持|12資産すべて成功、期限の書換えなし|
|T|受取不可・期限切れ有償分を使用不可|12資産すべて受取拒否。期限切れ分を含む使用は拒否しlot更新もrollback|
|T＋1ms|受取不可、期限切れ分のみ失効|12資産すべて拒否、対象3個のみ失効、無償10保持|
|画面 T−1ms→T→T＋1ms|所持17→14、BOX受取可→不可、未失効lotのみ|375/390各幅で所持品・BOX・期限一覧の6ケース成功|
|有償アイテムの複数期限|無償10＋有償3＋3から4消費→有償0＋2、合計12|一致|
|有償輝石の複数期限|無償10＋有償3＋3から11消費→有償2＋3、合計5|一致|
|再実行・再読込|追加失効なし、数量・履歴一致|SQLの再実行と実画面の再読込で一致|

12資産：活力丸、侵攻令、戦技LB、武具LB、武将EXP特大、武具EXP特大、SSR魂選択、有償銭、有償輝石、武将／戦技／武具の特選召喚札。機械識別子と36境界＋2消費順の詳細はboundary.json。

固定境界SQLは専用の一時ユーザー／注文／lotを作成して全体rollback。稼働時計の変更なし。ブラウザーのclockテストは専用ページの通信fixture内のみで、実DBへ時刻差替えを送信しない。

## 見つかった不足と限定修正

1. Previewにはbilling_refresh_paid_assets RPCがなく、購入分の期限一覧がエラーになっていた。本人のみの認証済みRPCを追加し、元期限・残量・失効履歴・対応する正式stateを返す。
2. 召喚券の期限が、所持品の再取得だけでは失効しなかった。既存の失効・消費トリガーを使う共通再同期を、state取得と期限一覧に接続した。未受取分は在庫を減らさずlotとBOXだけ失効。
3. pg_cronと失効ジョブがなかった。Preview専用QA allowlistに限定した毎分ジョブを登録。一般ユーザーをバッチ対象に追加していない。
4. 画面を開いたまま期限を迎えても表示が更新されなかった。サーバー時刻を基点に単調時計で期限到達を検知し、既知の失効分を表示から除外して再取得する。BOXのボタンと期限表示も到達時に更新する。名称は現行の共通名称関数を使用。

新しい日付計算、無償資産の有償化、既存残高移行、旧snapshotの再計算は行っていない。

## 実ジョブ

- 関数：game04_run_paid_expiry_job → game04_expire_paid_assets_for_user → 既存のlotトリガー／BOX失効。
- jobid=1、game04-paid-expiry-preview-qa、毎分。認証済み一般クライアント／anonは実行不可（403も実確認）。
- 専用QA：9a7c3df6-4067-4698-b6a5-9aa66c362930。KPI分類qa、注文はrevenue=false・QA_NOT_STRIPE。fixture作成後はジョブ観測まで取得・使用を行っていない。
- 実期限：2026-09-27 07:46:58.455229 JST。
- runid=1：07:46:00、期限前の実行成功。runid=2：07:47:00.023787〜00.060600、期限後の実行成功。
- 12種類すべてで受取済3＋未受取2が失効。未失効4、無償10を保持。失効後の所持数14。
- 他ユーザー既存2ロットのハッシュは前後とも0b5ec391208243992fea71253cd1f48d。再実行2回でもlotハッシュ不変、負数0。
- job-before.json / job-after.json / reexecution.jsonを参照。一般ユーザー全体の自動失効運用・本番ジョブの有効化は今回の範囲外。

## 競合

同じBOXの2受取、同じrequestIdの2使用、4回の期限再取得、失効ワーカーを重ねた。受取は1回だけ成功。有償期限切れ3は失効、有効2の受取は1回、使用は1個だけ。最終数は14＋2−1＝15。

一方の使用応答は200、もう一方は503。同じrequestIdでの再送は200で追加消費なし。全応答成功とは判定していない。期限変更・二重消費・負数はなく、保存済み要求とlot履歴で照合した。詳細race.json。古いstate versionの保存は別のSQLで40001拒否を確認。

## 購入起点と検証範囲

既存PGliteテスト（隔離インストール0.5.8）で、4パック・6輝石商品のsnapshot、冪等付与、120日起算、BOX受取後の期限維持、有償失効、無料保持、元lot期限の派生継承が成功。実DBでは現行GAME04正式受取・使用・再取得とジョブを検証した。

この共通Previewは設計上Stripe／webhook／購入確定RPCを含まない隔離DBである。実Stripe決済→このPreviewへの購入付与の通し検証は未実施。実決済の成功や正式購入導線の総合受入として扱わない。期限仕様自体の未定点は今回見つかっていない。

## 再現・保存

- node scripts/verify_paid_expiry_boundary.cjs
- supabase/tests/game04_paid_expiry_boundary_rollback.sql（対象ガード付き、全rollback）
- scripts/prepare_paid_expiry_qa.cjs（専用QAセッションをローカルに用意した後に実行。SQL生成のみ。既存ユーザーへ流用しない）
- node scripts/verify_paid_expiry_browser.cjs <URL> <証拠出力先>
- node scripts/verify_paid_expiry_ui_clock.cjs <URL>
- node scripts/verify_paid_expiry_race.cjs <専用の未受取present ID>
- PGLITE_MODULEを隔離ランタイムへ設定しscripts/billing/verify_paid_lots.mjsとverify_dia_approved.mjsを実行。

認証トークンはローカルの除外ディレクトリにのみ保存し、GitとVercelアップロードから除外。取得SQLとジョブSQLはsupabase/isolated/integration/31・32。Git SHA／配信確認はDEPLOYMENT.mdへ追記する。

DB advisorの新RPC指摘は、本人専用SECURITY DEFINERの意図した公開に該当する。auth.uid必須・ユーザー指定引数なし・anon不可・内部worker不可を確認した。[診断の説明](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable)。
