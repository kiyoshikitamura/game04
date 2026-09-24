# G2・P02〜P04 とP06の接続契約

この表は用途・所有の確認。設定済みを意味しない。P06が本番値の設定を一元管理し、P02/P03/G2コード所有を保持する。
P02-P04基準7476566、OWNERSHIP blob c4d69408fa6d9868e4e986bf02d14ba65318c500。

|設定/経路|所有・用途|現状/反映条件|
|---|---|---|
|NEXT_PUBLIC_APP_ENV|G2環境判定/P06値|本番production明示。未設定developmentへfallbackするためdeploy targetだけを根拠にしない|
|NEXT_PUBLIC_SUPABASE_URL|P06本番origin|本番ref未発行。G2/P03 validatorはdevelopment/preview＋dev ref限定、要契約更新|
|NEXT_PUBLIC_SUPABASE_ANON_KEY / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY|P06公開キー|本番由来のみ。service roleを公開しない|
|SUPABASE_SERVICE_ROLE_KEY|P06サーバー秘密|本番専用秘密保管。文書/ログへ値を書かない|
|NEXT_PUBLIC_USE_MOCK_DB / NEXT_PUBLIC_ENABLE_QA_TOOLS|G2/P06|本番false。QA routeはserver側拒否も確認|
|NEXT_PUBLIC_SITE_URL / NEXT_PUBLIC_KPI_DATA_ENV|P01/U10/P06|正式origin/production。U10計測は今回重複移植しない|
|NEXT_PUBLIC_GOOGLE_CLIENT_ID|P03/P06|Google origin/provider設定との一致待ち|
|GOOGLE_ACCOUNT_REPLACEMENT_ENABLED / NEXT_PUBLIC_GOOGLE_ACCOUNT_REPLACEMENT_ENABLED|P03|false保持。現行serverはproduction拒否、受入後のみ|
|Auth Site URL / redirect allowlist / SMTP|P03/P06|正式domain/送信元/所有待ち、callbackは/auth/callback。wildcardを本番既定にしない|
|BILLING_MODE / BILLING_SANDBOX_ENABLED|P02/P06|販売停止。現行sandboxのみ・production拒否、live実装待ち|
|BILLING_RETURN_ORIGIN|P01/P02/P06|正式https origin、/billing/return?order=…、cancel=1。redirectだけで付与しない|
|STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET|P02/P06|専用環境/通知先に対応するsecret。共用契約でも商品/metadata/app/envを識別|
|/api/billing/webhook|P02|completed/async_payment_succeeded/expired、署名/mode/session再取得/台帳冪等。本番接続未完|
|feature_operating_states / operations_maintenance_testers|G2/P02/P06|PAYMENT/SHOPをCLOSED/false。client maintenanceだけではAPI停止を保証しない|
|P06_HEALTH_TOKEN|P06独立receiverだけ|サーバー秘密32文字以上。未設定でも503。ゲーム用認証との共用禁止。まだクラウド未設定|

P02 contractsのPRODUCTION_PROJECT_REFは空、sk_testのみ受理。設定値だけ入れて本番決済接続完了とはしない。
P03 Google置換もnon-production限定。上記の本番ref契約はM候補へ統合し、開発guardを緩めない。

## 定期処理/監視の受渡し
- VIP: 480円/720h、購入時100と24hごと100×29。game04_deliver_due_vip()は(order_id,ordinal)一意、row lock/SKIP LOCKED、最大1000、期限後の未付与回収。開発で毎分jobが稼働する実観測あり。本番採用周期/失敗許容はMで最終確認、新本番は未登録。
- ログボ: session時、Asia/Tokyo日付、同日排他、30回循環、欠席分遡及なし。日次cronを重複追加しない。
- 日次任務: G2の境界仕様/正式受入を待つ。仮仕様でジョブを開始しない。
- 監視: API 5xx/遅延/DB接続と容量、cron失敗、VIP未付与最古due、Stripe受信失敗と注文滞留を対象。実装と本番値設定の両方が必要。
- 通知先は未指定。外部へ送信していない。担当別既存dashboardで読む構成を準備し、通知先確定後に接続。
- P02/P03が未完成なのでP06設定済みには繰り上げない。
