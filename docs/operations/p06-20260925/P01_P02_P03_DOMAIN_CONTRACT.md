# GAME04 P01/P06 → P02/P03 本番ドメイン・接続契約

確認日: 2026-09-25 JST。環境担当 P06 / アプリ担当 PR #31。これは設定契約であり、外部サービスの設定済み・本番受入済みの証明ではない。

## 採用対象と分離

- 正式 origin: `https://sengoku-hime-ennbu.com`。www は apex へ転送する。www・Vercel既定URLで新たなゲームセッションや購入を開始させない。
- 本番受け皿: Vercel `game04-production-receiver` / `prj_sFLd5kZeu7pjveQIkeL88ShfN8i8`。Production の環境設定先はこの専用プロジェクト。
- 本番DB/Auth/API/Storage: `soiksqgtmcnspfedmanr` / `https://soiksqgtmcnspfedmanr.supabase.co`。
- 開発: `lrgyllgzcdcphlbmkknc`。PR #31 専用 Preview 設定は既存 game04 プロジェクトの対象 branch に限定する。本番設定を共通 Preview へ流用しない。
- 読取基準: PR #31 head `3ca2e73ccca1a816bef6d8aa3a3dbecca3494a79`。アプリコード、DB、外部設定の変更はこの調査では実施していない。
- G5 合格後に M で正式アプリ/API/マスターを移し、G6 で公開判断。現受け皿の停止用コードには下記ゲーム認証/決済経路は実装されていない。

## 正確な帰還先・経路

|用途|本番設定値・経路|設定先 / 所有|
|---|---|---|
|Supabase Site URL|`https://sengoku-hime-ennbu.com`|本番 Supabase Auth URL Configuration / P06|
|Google/メール認証のアプリ帰還先|`https://sengoku-hime-ennbu.com/auth/game04/callback`|本番 Supabase Redirect URLs に完全一致で登録 / P06。アプリ実装 P03|
|認証開始/結果確認画面|`https://sengoku-hime-ennbu.com/auth/game04`|P03。callback処理後はこの画面へ戻る|
|同一UID結合API|`POST /api/auth/game04-binding`|P03。新規player作成・無断統合の経路ではない|
|Google OAuth Authorized redirect URI|`https://soiksqgtmcnspfedmanr.supabase.co/auth/v1/callback`|Google OAuthクライアント / P03契約・P06反映。アプリcallbackと混同しない|
|Google Authorized JavaScript origin|`https://sengoku-hime-ennbu.com`|GAME04用 Google OAuthクライアント / P03・P06|
|決済 origin|`BILLING_RETURN_ORIGIN=https://sengoku-hime-ennbu.com`|専用受け皿 Production server env / P06。有効化は P02/M|
|決済成功帰還|`https://sengoku-hime-ennbu.com/billing/return?order={注文UUID}`|checkout route が生成 / P02|
|決済取消帰還|`https://sengoku-hime-ennbu.com/billing/return?order={注文UUID}&cancel=1`|checkout route が生成 / P02|
|Stripe通知|`POST https://sengoku-hime-ennbu.com/api/billing/webhook`|GAME04専用endpoint / P02契約・P06反映。現段階は無効/未接続を保持|

認証は `location.origin` から帰還先を作る。決済はリクエストoriginと `BILLING_RETURN_ORIGIN` の同一性を検査する。したがって開始前に apex へ正規化し、wwwからの事後転送だけに依存しない。Supabase帰還許可に広いワイルドカードや開発URLを本番用として追加しない。

Stripe対象イベントは `checkout.session.completed`、`checkout.session.async_payment_succeeded`、`checkout.session.async_payment_failed`、`checkout.session.expired`。受信後に署名・mode・注文・金額等を照合し、Stripeの現在状態を再取得して処理する。帰還画面を開いただけで付与しない。test/live の endpoint と署名秘密を分離し、GAME03 endpoint を変更しない。

## 環境変数・外部設定の反映契約

|設定名|本番準備値・状態|所有|
|---|---|---|
|NEXT_PUBLIC_APP_ENV|`production`。現アプリは production 接続を拒否するため M 候補の対応が必要|P06設定 / P03・G2許可先実装|
|NEXT_PUBLIC_SUPABASE_URL|本番 `https://soiksqgtmcnspfedmanr.supabase.co`|P06|
|NEXT_PUBLIC_SUPABASE_ANON_KEY または NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY|本番プロジェクトの公開用キーのみ。値を記録しない|P06|
|NEXT_PUBLIC_USE_MOCK_DB|`false`|P06|
|SUPABASE_SERVICE_ROLE_KEY|本番プロジェクト用、server のみ。受け皿に不要な間は投入しない|P06|
|BILLING_MODE|現候補は sandbox のみ。本番/liveへの単純切替は禁止|P02実装 / P06設定|
|BILLING_SANDBOX_ENABLED|本番受け皿では未設定または false。現コードは VERCEL_ENV=production も拒否|P06|
|BILLING_RETURN_ORIGIN|正式 apex origin を予約。M候補へ反映|P06|
|STRIPE_SECRET_KEY|契約したGAME04対象・環境のキー。GAME03から無条件コピーしない|P02契約 / P06秘密設定|
|STRIPE_WEBHOOK_SECRET|GAME04専用・環境別 endpoint 由来の署名秘密|P02契約 / P06秘密設定|
|Google provider/client ID・secret|本番 Supabase Google provider へ。GAME04対象アプリの識別を確認|P03契約 / P06秘密設定|
|SMTP送信元・資格情報・テンプレート|送信契約/正式送信元と確認リンクをP03で受入。設定済みと推定しない|P03契約 / P06秘密設定|

許可済みの認証テスト宛先は `kiyoshi.kitamura@scopenext.jp`。これは公開問い合わせ窓口やSMTP送信元の決定ではない。

## アプリ側へ渡す必須差分

1. `src/utils/supabaseUrl.ts` は development/preview + 開発refだけを許可する。P03/G2所有で production + 本番ref の明示許可を実装・検証し、環境取り違えを拒否する。
2. `src/server/billing/contracts.ts` の `PRODUCTION_PROJECT_REF` は空、`billingConfig` は sandboxのみ・non-production runtimeのみ。P02が M 用の本番契約を実装しない限り、本番 env 投入だけで動作しない。
3. アプリ候補は `/auth/game04/callback` を使用する。旧 `/auth/callback` へ振り替えない。
4. `MAINTENANCE/PAYMENT/SHOP` 制御、同UID保持、注文付与・再送、VIP定期付与は同じ M 候補で照合する。`game04_ops.deployment_state` は状態台帳であり将来ゲームAPIの強制制御ではない。

## 公開制御と外部コールバックの扱い

- 今回は All Deployments の Vercel 認証保護を保持する。ゲームAPIも未配信・Cron無効・signup停止を維持する。
- Google→Supabase の callback は Supabase origin 上にある。Supabase→アプリ帰還は Vercel 保護の対象となるため、M の限定受入者が事前に Vercel 認証済みの同じブラウザを使い、実際の帰還を検証する。失敗をサイト全体の保護解除で解決しない。
- Stripe webhook はサーバー間 POST であり、ブラウザの Vercel 認証セッションを持たない。現保護のまま疎通成功とは扱えない。
- M の推奨方針は、プラットフォームが提供する正規の仕組みで `/api/billing/webhook` だけを対象にできるか確認し、当該経路のみ署名必須・環境照合・再送冪等性を保って受け入れること。パス限定ができない場合は、P02所有の署名検証付き専用通知入口を隔離して構成する案を確定する。どちらも現段階では未実装・未有効化。
- protectionの自動化用秘密を公開URL、callbackクエリ、クライアント、引継ぎ文書へ埋め込まない。全面解除・ドメイン全体の無保護化は行わない。
- webhook例外を将来追加する場合、POST正規署名の成功に加え、署名無し/不正署名/別環境拒否、ルート・認証・購入APIの匿名遮断を独立確認する。

## 参照した正本と未反映範囲

GitHub PR #31 の上記SHAで `AGENTS.md`、`docs/verification/p02-p04-20260924/G2_P06_INTEGRATION.md`、`src/app/auth/game04/page.tsx`、`src/app/auth/game04/callback/page.tsx`、`src/app/api/billing/checkout/route.ts`、`src/app/api/billing/webhook/route.ts`、`src/server/billing/contracts.ts`、`src/server/billing/webhook.ts`、`src/utils/supabase.ts`、`src/utils/supabaseUrl.ts` を読み取り照合。

公式参照: https://supabase.com/docs/guides/auth/social-login/auth-google （Googleに登録するSupabase callbackとアプリredirectToの区別）、https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection （正式な公開制御方式の確認用）。実際に利用可能なパス単位機能は管理画面・契約を別途確認する。

DNS/TLSの実観測・ドメイン紐付け・Supabase実設定の結果は親P06の構築記録に集約する。本書だけで設定完了としない。
