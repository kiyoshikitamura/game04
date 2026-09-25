# P01/P06 接続準備・PR #31引継ぎ（2026-09-25 15:38 JST）

対象: game04-production-receiver / prj_sFLd5kZeu7pjveQIkeL88ShfN8i8、game04-prod / soiksqgtmcnspfedmanr。
読取基準: PR #32 dc63132ba91d7798f5074db8d774284291525bff。
本記録担当は外部設定・DBを書き換えていない。確認中に他操作によるapex/www追加を観測したため、同じ設定の重複書込みを避けた。

## 現在確認できた状態

|項目|確認結果|
|---|---|
|正式URL|https://sengoku-hime-ennbu.com |
|apex|Vercel管理画面で本番受け皿Productionに接続済み。Invalid Configuration|
|www|apexへ308転送設定済み。Invalid Configuration|
|必要DNS|A @ → 216.150.1.1 / CNAME www → 346e02207322e8c5.vercel-dns-016.com.（当該project管理画面の要求値）|
|DNS管理|Third Party、Vercel DNS管理無効。既存レコード未取得。NS移管や既存MX/TXT等の削除はしない|
|DNS疎通|Google DNSのNS/A/AAAA/MX/TXT/CAA照会はStatus=2(SERVFAIL)。空レコード確定/伝播待ちのみとは判断できない|
|TLS|管理画面は証明書未発行。apex/wwwの実HTTPS受入未完|
|公開制御|Vercel connectorでSSO Protection all/enabled=trueを再確認。正式domain到達前なのでdomain別の匿名遮断試験は未完|
|本番DB|2026-09-25 06:36:42 UTC SQL読取成功。auth.users 0 / storage.objects 0 / public tables 0。ゲーム移行なし|
|signup|ユーザー実施済み報告を維持。今回の作業ブラウザではSupabaseログイン画面になり直接readback未完|
|backup|既存結果のPHYSICAL 2件（2026-09-24 22:23:33 / 16:25:32 UTC）の添付確認を継承。新規成功時刻・復元試験未確認|
|receiver health|認証通過を試みたブラウザはERR_BLOCKED_BY_CLIENT。handler応答と同一視しない。P06_HEALTH_TOKEN設定/200受入は未完|

## P02/P03への環境別接続契約

|用途|本番（P06管理、Mで実接続）|開発/Preview|
|---|---|---|
|正式origin / NEXT_PUBLIC_SITE_URL|https://sengoku-hime-ennbu.com|各専用Preview origin|
|Auth Site URL|正式origin|開発側現行値を担当調整なしで変更しない|
|アプリAuth callback|https://sengoku-hime-ennbu.com/auth/game04/callback|専用Preview /auth/game04/callback|
|Google側OAuth redirect URI|https://soiksqgtmcnspfedmanr.supabase.co/auth/v1/callback|開発lrgyの既存provider設定を保全|
|BILLING_RETURN_ORIGIN|正式origin|test用の購入元と同一origin|
|決済成功/取消帰還|/billing/return?order=… / 同URLに&cancel=1|同じ経路、test限定|
|Stripe webhook|https://sengoku-hime-ennbu.com/api/billing/webhook|専用test endpoint。GAME03 endpoint不変更|
|設定先|Vercel game04-production-receiverのProduction / Supabase soiks / Google本番provider / Stripe環境を区別|game04専用branch設定 / Supabase lrgy / Stripe test|
|公開・課金・Cron|停止を維持。準備だけで有効化しない|担当別test受入のみ|

PR #31の実在routeとCheckout生成URLを照合。旧P06表の/auth/callbackではなく、P03独立候補は/auth/game04/callback。これを設定済みとは扱わない。
SMTPはGAME03方式を維持し、送信元/既存契約を確認する。許可された確認用宛先はPR #31確定記録に従う。秘密値を記載しない。

## 外部callbackと公開制御

現在receiverはゲーム/認証/決済handlerを含まない。全体保護を外さない。
Google provider → Supabase callback と、Supabase → アプリcallback を別経路として管理する。後者は許可された検証者がVercel認証を通れることを確認する。
Stripeは対話的Vercelログインを通過できない。M候補でwebhook単独の到達設計（署名必須・mode/app/order照合・冪等台帳）とplatform側制限の対応をP02/P06で確定する。未実装handlerへ例外公開を先行しない。秘密のbypass値を公開URL/文書へ埋め込まない。
本番許可ref・live対応・server公開制御はPR #31/G2/M候補の責任。環境変数だけで現行test-onlyコードを本番可とはしない。

## 残る本人操作・外部依存

- DNS購入/管理サービスの特定と、そのサービスでの上記2レコード反映。既存レコードを先に保存。外部DNS操作担当と本担当の二重更新を避ける。
- Supabase管理の安全な認証によりsignup/SMTP/provider/最新backupをreadback。同じsignup停止操作を再依頼しない。
- P06_HEALTH_TOKENは正規の秘密設定経路で用意し、認証後200/未認証遮断/一般path503を確認する。秘密値をチャットで要求しない。

DNS解消後にapex/wwwのTLS・308・匿名遮断を確認。G5後Mでゲーム移行、G6で公開判断。費用再承認・mainマージ・実課金なし。
