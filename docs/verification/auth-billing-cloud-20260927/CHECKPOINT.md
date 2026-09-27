# GAME04 認証・決済クラウド作業 checkpoint 2026-09-27

状態: 未完了。実装候補と純粋テストのみ。開発実接続・本番実接続の合格ではない。

## 取得基準
- PR37 HEAD: 811b92b7a631a017186c7472a62d3093beb25feb（着手・保存前再取得一致）
- PR31 HEAD: 3ca2e73ccca1a816bef6d8aa3a3dbecca3494a79
- PR32 HEAD: 3e03ca083d1176911fd42a220cc7a0c09393e15f
- GAME03 default最新: 0453fcda56c2f3546b91eb7a073c592988f9cf42。コード取得のみ。データ・設定変更なし。
- 開発DB: znakrkaazliexzwihxge、game04-redesign-api v8、verify_jwt=true。
- 本番DB: soiksqgtmcnspfedmanr、game04-p06-health v1のみ。
- PR37 botの最新Preview候補: https://game04-1g0e0exbq-kiyoshi-kitamura.vercel.app 。直接受入は未実施、配信SHA未検証。
- 本番URL: https://sengoku-hime-ennbu.com 。接続受入未実施。

## 今回の修正
GAME03の実績あるtest/live分離を継承し、GAME04本番DB・正式originだけを明示的live設定時に許可する。
- supabaseUrl: productionの接続先を専用本番refに限定。previewは現行隔離ref限定を保持。
- billingConfig: BILLING_LIVE_ENABLED=true、VERCEL_ENV=production、APP_ENV=production、本番DB、sk_live、正式originの全一致を要求。
- sandboxから本番origin、liveから開発DB・別origin、GAME03接続を拒否。
- 購入運用状態・保守テスター制御は変更なし。liveフラグや外部設定を有効化したわけではない。
- 既存純粋テストの旧開発refを現行へ修正。
- UI・商品・API bundle・DB・main・本番配信は変更なし。

## 検証
クラウド実行環境 Node v24.19.0:
- independent-billing: 8群 PASS。
- independent-webhook: 4群 PASS。
- environment-isolation: 正常test/live、接続対応、混在16条件拒否、maintenance/tester制御 PASS。
実Stripe請求、DB原子付与、ブラウザ認証成功を意味しない。全体build・型検査は未実施。

## 移行照合で確認した不足
1. 開発billing_productsはQA商品2件のみ。販売11商品なし。
2. 開発にbilling_reserve_order、billing_attach_session、billing_grant_order、billing_expire_order、
game04_billing_reserve_order、game04_billing_grant_order、game04_record_billing_eventがない。
feature_operating_statesもない。既存P02候補は基礎RPC依存のためそのまま適用不可。
3. 本番publicにはbilling・game04・商品・feature_operating_statesの対象テーブルなし。
本番担当へ本体schema/masterを含めて集約が必要。既存候補の丸ごと適用は未実施。
4. game04_auth_bindingは開発に導入済み。同UID・単一provider・衝突拒否を持ち、報酬付与は行わない。
初回/既認証報酬の現行接続は未検証。
5. 初陣応援パックは現行UI masterとserver catalogともCASH10000のまま。
ユーザー確定はDIAMOND100へ置換（100円・他内容保持）。
共通商品担当との取込調整未完のため本件から重複編集していない。
特選ガチャ300/300/200の現行実消費確認も残件。
6. Stripe Checkoutはinline price_dataで注文snapshotからJPY価格を作る。
固定price/product ID未設定という理由だけで不足とは判定しない。
7. 既存P02 SQL候補のwrapper/event tableはsandbox限定。本番化時はDB側のmode分離も必要。
フロント修正だけで本番課金可能とは判定しない。

## 接続障害
Vercel list_teamsは成功。list_projectsにtribe-neonしか表示されない。
PR37が示すgame04 project prj_vV06TC8bU3TEFRpNXFNdONiZmULEへのget_projectは404。
最新Preview get_deploymentおよび本番/Previewの認証付きURL fetchも権限不足または未発見。
既存設定が未設定という判定ではない。再設定は依頼していない。
Git CLI直接取得は到達せず、GitHub connectorで正本を取得・差分保存。
管理画面へのブラウザ切替はツール規約上ユーザー承認が必要なため未実施。

## 続行順序と保持事項
1. Vercel対象プロジェクトへのアクセスを確立し、既存の公開制御・env・domain・配信SHAを読む。
2. 共通商品担当へ上記差分を照合し、UI/server/DBの商品を同一内容にする。画像・プロモはデバッグ担当。
3. 開発DBの既存構造に対する追加差分を作成、現行有償lot/期限成果を保持。
4. 開発Stripe test/Webhook・Google実接続、保存前後と再通知を受入。
5. 本番担当へschema/master/API差分・順序・戻し方を集約。公開制御下の配信と本番実接続。
6. 本人Googleログインと実決済は実際の画面・商品・金額・完了条件を整えて一度に引渡し。
本番最終決済候補は初陣応援パック100円。ただし商品DB/表示を修正し認証・テストを通すまで実決済しない。
本番付与・再読込証拠、配信SHA/API版、購入/付与IDは未取得。
