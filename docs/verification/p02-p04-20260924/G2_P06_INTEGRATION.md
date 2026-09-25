# G2統合契約・P06設定引継ぎ

状態: P02〜P04専用候補。G2共通画面/共有DB/APIへの適用は所有調整待ち。ユーザーの業務判断と担当間の統合作業を混同しない。

## 基準
- 移植先基準: G2 `7476566f945708a8e752f71d4d6b90c23f3b937a` / `work/game04-g2-20260924`
- 候補: `work/game04-p02-p04-20260924` / PR #31（base=G2。mainではない）
- 参照元: GAME03 `0453fcda56c2f3546b91eb7a073c592988f9cf42`。本番READY Deploymentのcommit一致を確認。
- 開発DB: `lrgyllgzcdcphlbmkknc`。本番ではない。
- 今回照合の主API: `game04-redesign-api v21` / hash `d3599cf9bfede3850553f143bd9df830ab99fc92a19cab1309fcba1f56b5eae0`
- 最新DB履歴: `20260924125412 game04_g2_vip_schedule`。本作業のSQLは候補であり未適用。
- P06別候補: `work/game04-p06-20260925`、照合SHA `6ee3a2af7f298c889d797c0e25a077bf2d80cba0` の `docs/P06_DB_API_STORAGE_REPORT.md`。そこにある本番新設・費用承認はP06所有であり、本起票で再決定しない。

## G2 U08/U09・P02
1. 商品・価格は統合正本§6。4パック、6輝石、VIPの11商品。P02 catalogのサーバー照合とDB商品候補を同じ版で反映。
2. Checkoutは verified Auth UID = users.id = game04_player_state.user_id、単一providerとuser_account_auth_methods一致を要求。クライアント指定価格・別user IDを採用しない。
3. 注文snapshotを固定、サーバーがStripeを照合、paid成功条件でのみ原子付与。returnを開いただけでは付与しない。
4. P02 `game04_billing_reserve_order` →既存 `billing_reserve_order`。VIP有効中と保留注文の重複を購入前に拒否。
5. P02 `game04_billing_grant_order` →既存 `billing_grant_order`、VIPは同一transactionでG2 `game04_grant_vip`。権利付与失敗時にGRANTEDだけ残さない。既GRANTEDの復旧呼出しはG2台帳の同一注文冪等性に従う。
6. P02イベント台帳は通知ID・注文・session・処理状態・試行数のみ。秘密/生payload/カードデータを記録しない。再通知を台帳の存在だけでskipしない。
7. 通常商品は既存lot/BOX経路を再利用。**BOX→正式在庫、使用・保存、有償由来交換品のlot/期限引継ぎはG2 U02/U08と実統合受入が必要**。P02が別途ゲーム在庫へ重複加算しない。
8. VIP購入確定後の期限・100×30・24h周期・再購入・戦闘権利はU09、cron管理はP06。P02が独自schedulerを作らない。
9. 2026-09-25ユーザー確定：有償期限は120日継承、年齢・購入制限と返金等はGAME03同様。表示・lot・消費・返金対応を一つの契約で反映する。

## G2 U10・P03/P04
- 独立入口 `/auth/game04`、戻り先 `/auth/game04/callback`。GAME03のメール+パスワード、Google linkIdentity/OAuthを維持する。
- P03 `/api/auth/game04-binding` と `game04_auth_binding` は既存playerの同一UID結合だけ。旧チュートリアル完了・認証報酬・青チェック・新規player作成へ接続しない。
- G2設定/タイトルからの導線と認証成功後の共通state再取得はG2所有。新認証完了時に別ゲスト生成を行わない。失敗時の旧session保持とログアウト後の見せ方もG2統合で確認。
- Google/メール単独、既存連携、重複、取消、期限切れ、別端末、再ログインを別々に記録。
- 開発の旧 `cleanup_expired_anonymous_onboarding` は新 `game04_player_state` を保護条件に含めない。連携完了者は非anonymous/恒久identity/methodsにより除外されるが、未連携新state保有45件は旧tutorial未完条件に該当する潜在母数（24h/refresh等適用前、削除確定件数ではない）。G2/G4所有で `AND NOT EXISTS (SELECT 1 FROM public.game04_player_state g WHERE g.user_id=au.id)` の除外候補と既存cleanupの影響を確認する。P06は本番cron移植保留。今回共有関数/cronは変更しない。
- P04はlegal配下限定。設定/購入/フッターの既存導線との結合はG2が保持し、from=settingsの戻り経路を接続する。
- GAME03問い合わせ窓口は既存記載を再利用。問い合わせ送信は本作業で行わない。

## P06設定表（値・秘密なし）
「既存基盤あり」は今回の専用Previewに設定済みであるとの断定ではない。

|設定名/項目|用途|環境|管理担当|状態|
|---|---|---|---|---|
|NEXT_PUBLIC_APP_ENV|preview/production分離|各環境|P06|今回専用配信の実値未取得|
|NEXT_PUBLIC_SUPABASE_URL|GAME04専用DB|preview|P06/G2|コード許可先は開発lrgy。実配信値未取得|
|NEXT_PUBLIC_SUPABASE_ANON_KEY または NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY|公開クライアント接続|preview|P06|実値/設定有無未取得。値を資料へ記載しない|
|NEXT_PUBLIC_USE_MOCK_DB|実DB受入|preview|P06|受入時falseを確認|
|SUPABASE_SERVICE_ROLE_KEY|サーバー決済RPC|preview|P06|設定有無未確認。client公開禁止|
|BILLING_MODE|test/live区分|preview|P02/P06|sandboxのみ許可、liveはコードで拒否|
|BILLING_SANDBOX_ENABLED|テスト決済開始|preview branch限定|P02/P06|設定未実施。共有DB候補適用後|
|STRIPE_SECRET_KEY|Stripe test API|preview branch限定|P02/P06|設定未実施、test key必要|
|STRIPE_WEBHOOK_SECRET|GAME04専用test通知署名|preview branch限定|P02/P06|設定未実施、GAME03 endpoint不変更|
|BILLING_RETURN_ORIGIN|購入元と同一origin帰還|preview|P02/P06|専用受入URL確定後設定。別hostへ飛ばさない|
|Stripe test webhook URL/events|completed/async成功・失敗/expired|test|P02/P06|専用 `/api/billing/webhook`、未設定/未実受入|
|MAINTENANCE/PAYMENT/SHOP operating state|購入公開制御|開発/本番別|G2/P06|勝手にOPENにしない。テスト対象限定の契約を照合|
|Supabase Auth許可redirect URL|新callbackへ戻す|preview|P03/P06|設定未実施/未取得|
|Google provider/client設定|Googleリンク/再ログイン|preview|P03/P06|外部設定未確認、秘密未取得|
|Email provider/SMTP送信元/template|確認メール+パスワード方式|preview|P03/P06|設定未確認。許可テスト宛先指定済み|
|専用確認Google/メールアカウント|実認証受入|test|ユーザー/P03|kiyoshi.kitamura@scopenext.jp 指定済み。他の実利用者宛に送らない|
|game04-g2-vip-delivery|VIP定期付与|開発/本番別|U09/P06|開発既存jobをP06記録で確認。本番は未構築/未有効化|
|anonymous-onboarding-cleanup-daily|旧匿名cleanup|開発/本番別|P03/P06|P03資産保持契約と照合後に本番採否。共有cronは未変更|
|正式ドメイン/本番Auth/Stripe/live許可|M受入|production|P01/P06|未着手。test-onlyコードを設定値だけでlive化できるとは扱わない|

## 統合時の最小回帰
- 11商品価格/内容/枠、並行注文・VIP有効中拒否、正常paid/未paid/遅延/再送、付与失敗→再試行。
- 注文→lot/BOX→正式在庫/財布→画面→再ログインが同じ数量。VIPの初回100と毎回ordinal一意性。
- 認証前後の同UID、state版・全資産保持、別端末ログイン、同mail別playerの無断統合無し。
- 初回/通常ゲーム起動、共有認証イベント、設定/商店/認証帰還、本文スクロール・戻る。
- 本番移行用差分に開発固定ref/test制約を残さず、明示的に本番許可を設計・レビュー。開発接続で実課金しない。

## M本番受入
正式domainと接続先/配信SHA/API版/schema、test/live完全分離、Googleとメールの実成功、問い合わせ/特商法実掲載、購入停止/再開、注文通知付与照合・未処理復旧、返金例外、VIP cronの失敗検知、QAデータ除外を同じ候補で受け入れる。G5/M/G6を本起票のPreview成功で代替しない。

## 2026-09-25 ユーザー指定のUI是正

今回照合G2 SHA: 180b45abb198370f8ee01f65838d95f30a7efff2。P02-P04候補基点: 83673c24deebb24dd3446b64a8895f42010e8b6b。
- TitleLegalFooter.tsx/SettingsPanel.tsxは両基点で一致。追加問い合わせ/法的情報リンクのみ削除し、タイトルcopyrightを指定表記へ変更。
- RedesignShell.tsxはG2側にnavigationBusy・問い合わせ戻り先追加がある。ファイル全体を旧候補から上書きしない。G2側では問い合わせa要素と未使用になるarmLegalSettingsReturn importのみを削除し、navigationBusy等を保持する。
- legal/**変更は今回ユーザー承認済みの本文/3リンク化。公開窓口original.title.support@gmail.comを維持。確認用メールを公開窓口へ転用しない。
- 専用branchへの適用はG2統合済みを意味しない。G2適用後、タイトル・設定・メニュー・本文戻り先を回帰確認。

