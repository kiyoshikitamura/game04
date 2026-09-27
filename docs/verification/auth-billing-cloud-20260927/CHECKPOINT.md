# GAME04 認証・課金 クラウド実装／検証記録
記録日: 2026-09-27 UTC。開発実接続の主要経路を確認済み。本番受入・G5・一般公開は未完。

## 現行参照と保存
- GAME03: kiyoshikitamura/tribe-neon @0453fcda56c2f3546b91eb7a073c592988f9cf42。コード・設定・ユーザーデータは読み取りのみ。
- PR37 最新取得: cefd9775ad12ae0101b3f68532af69e6d967a3d0。専用ブランチ work/game04-auth-billing-cloud-20260927 の a0fc3122b5ea5f25f38afc9713c5ff96dfffa907 に取込済み。共通UI・戦闘・商品・期限処理を保持、main未マージ。
- Draft PR41 の base は PR37 ブランチ。PR31認証・課金既存実装を再利用。
- テスト配信: 0a10e1ca14125b0c6777caca3e1c31d6d985dadc（初陣パック）、5e84595282e470489639a0c8251b703e231a76c5（VIP・JPY固定）。
- 最新統合配信 a0fc3122b5ea5f25f38afc9713c5ff96dfffa907: Vercel success / 22hyZZHteqjceBuKiak1XuSRedoq。以降はこの記録と証拠の追加のみ。
- 確認URL: https://game04-git-work-game04-auth-billing-clo-927d89-kiyoshi-kitamura.vercel.app
- 開発DB: znakrkaazliexzwihxge。旧dev lrgyllgzcdcphlbmkknc、GAME03 ktpolnkyyfkowxdmijww、本番 soiksqgtmcnspfedmanr は開発接続先に使わない。
- 開発Edge game04-redesign-api v8 / verify_jwt=true / SHA256 0929c17b3de0d75a2454123d369a1b3f0bd96700a1cac6e4c4f31f900e92b239。Edgeソース変更なし・再配信なし。Next.js認証／課金APIは上記Git統合ソースからVercelでビルド。
- Stripe実接続で観測したAPI版: 2026-08-26.dahlia。サンドボックス acct_1UKBPEK2y3LQd7hQ。本番 GAME04 acct_1UKBOkK9pVhABepD は別。

## 移行状況
|対象|分類|今回の結果|
|---|---|---|
|Google開始・callback・既存ユーザー復帰|移行済み＋環境修正|既存linkIdentityと同一UID連携を維持。開発Google実接続成功。|
|匿名進行・所持品・編成・通貨保持|移行済み|連携前後のユーザー／player_stateハッシュ一致。既存状態を上書き・合併しない。|
|認証済み表示・認証報酬|不足修正済み|初回300無償を直接付与、既認証者300を30日BOX、共通ユーザー台帳で一度だけ。実連携では200→500、台帳1。|
|商品・購入開始・決済遷移|移行済み＋不足修正|実接続でManaged Payments既定値の競合400を発見・修正。通常カード決済とJPYをリクエストで明示。|
|正規通知・購入確定・付与|不足修正済み|GAME03の予約／紐付け／期限／付与を再利用し、GAME04用モード検証・通知台帳を追加。実Stripe成功。|
|購入履歴・回数制限|不足修正済み|本人限定購入回数SELECTを追加。未払い／配送済み履歴、初陣購入済み表示を確認。書込はサーバーのみ。|
|再試行・重複／遅延通知|移行済み＋DB接続|同一注文／セッション再開、実通知再送で付与1回。遅延・競合の一部はfixture試験。|
|有償／無償・120日期限|移行済み・既存成果保持|既存4関数のハッシュを保持。実受取後に有償100／無償500と5件の期限を確認。|
|VIP720時間・継続付与|不足修正済み|初回100無償＋24時間ごと29回、重複ガード・配布台帳・dev cron追加。実決済後に30予定／初回1済み。|
|本番DB・API・配信|GAME04向け統合が必要|本番publicにゲームテーブルなし。P06 receiverはゲーム本体ではない。単独でdev SQLを流さない。|

## 確定商品との一致
- 特選ガチャの消費: 武将300／スキル300／装備200輝石。販売価格JPYとは別。最新共通担当成果を取り込み、こちらでガチャやプロモーションUIを再実装しない。
- 初陣応援パック: 100円、輝石100、特選武将札1・戦技札3・武具札1・活力丸2。銭10000は含まない。UI／注文snapshot／DB／実付与で一致。
- 11商品のUI・サーバーcatalog・DB一致。価格はJPY、初陣1回、その他限定パック3回、VIP自動更新なし480円。
- Stripeは固定Price IDを参照せず、照合済み注文snapshotからinline price_dataを作成する既存方式。GAME03の商品ID・決済アカウントを流用していない。
- 顧客識別はSupabase同一UIDと検証済みアカウント連携。購入には認証が必要。匿名の名前・自己紹介等を禁止する変更はなし。

## Google 開発実接続
- テストUID a68463f9-bd39-421f-bb73-a2c73a43da1d。
- 連携前: anonymous、輝石200／銭2600。連携後: 同一UID・Google・輝石500／銭2600、認証報酬台帳1。
- ユーザーハッシュ（neon_diamonds,updated_at除外）1425523ae40992581cb699a53e00a84f、player_state全体322c73c0695781e796a1eee899d011a1が連携前後一致。
- 再読込、別タブ、明示的セッション再確認、同じGoogleの再ログインで同じUID・台帳1を確認。
- 専用Previewで最初の長時間本人ログイン引渡し後に共通Previewへ戻る事象が1回あった。再試行では送信redirectと戻り先が専用Previewで一致し成功。初回原因は未特定、修正済みとはしない。
- チュートリアルは通常UIで編成・模擬戦・命名まで完了。後の通常ログボで銭10000が加わったが、Google連携報酬や初陣パックの銭ではない。
- 実Googleの既存アカウント衝突・明示キャンセル、購入済み資産を持つ匿名からの連携は未完。衝突時は自動上書き／合併せず停止する既存方針を維持。DB fixtureで複数identity拒否・ロールバック等7群PASS。
- Google Cloudのクライアントは本人作成・Supabase保存済み。秘密値は記録しない。

## Stripe 開発実接続
証拠: REAL_CONNECTION_EVIDENCE.json と画像。
1. 初回注文0c860e53-b5b8-4e31-b07c-473848320525はStripe側400。新アカウント既定Managed Paymentsがpayment_method_typesを拒否。managed_payments[enabled]=falseを追加。
2. 修正前後の同一idempotency keyでパラメータ不一致が拒否されることを確認。Stripeにsessionが一度もできておらずDBも未付与の検証注文だけを条件付きEXPIREDにし、証拠を残した。通常処理でキーを変更する回避は追加していない。
3. 初陣注文6122bdf7-5cd7-4007-a61e-01975756c88eで公開の拒否テストカードを使用。拒否画面、未払い、商店へキャンセル復帰を確認。grant0／lot0／財布不変。
4. 同じ注文・Stripeセッションを再開し、公開成功テストカードで100JPY決済。通知evt_1UKCQ1K2y3LQd7hQ75YBNP7eはHTTP200／COMPLETED。
5. Stripeダッシュボードから同じ正規通知を再送。attempts2、grant1、購入回数1、lot5で増加なし。
6. 購入特典5件をUIで受取。再読込後600輝石（有償100／無償500）・銭12600、各数量と発行日起算120日期限保持。無関係なリリース記念300輝石は未受取。
7. VIP注文09c3be8d-aaea-4dd4-bc6a-cd46dbe28472: 処理中タブを閉じた最初の試行はPENDING／未付与。その同一注文から再開し480JPY成功。
8. VIP通知evt_1UKCbBK2y3LQd7hQuMJdi5G4はHTTP200／COMPLETED。開始2026-09-27T07:34:15Z、終了2026-10-27T07:34:15Z。30回の予定、初回1回済み、残り29回。総輝石700（有償100／無償600）。VIP有効・再購入不可を実画面で確認。
9. VIPセッションのmanaged_payments=false、adaptive_pricing=false、amount_total480、JPYを確認。外貨自動換算の既定値もCheckout単位で無効化。
- 決済完了後・ゲーム復帰前のタブ閉鎖は成功条件を満たしていない（2回目は自動復帰が先行）。Webhook処理は独立して成功したが、その特定シナリオの実機合格とはしない。
- 同時二重タップ、遅延成功／失敗の実Stripe注入、24時間後以降の実時間VIP配布は未完。fixtureは別記。
- 実金銭の請求なし、カード保存なし。

## 開発テストと公開制御
- pure tests: billing8群、webhook4群、環境混在拒否16ケースPASS。
- SQL fixture: billing9群・認証7群PASS、fixtureデータrollback。paid expiry／claimの既存成果を変更していない。
- 本人購入回数RLS: 自分の集計のみ可、他UID不可、INSERT/UPDATE/DELETE権限なしをロールテスト。
- dev VIP cron game04-vip-due-preview-qaは毎分、07:35／07:36実行succeeded。翌日配布を前倒ししていない。
- 本試験だけのテスター許可は終了。MAINTENANCE維持、PAYMENT/SHOP=CLOSED・mutation_allowed=false、active_testers0。注文・台帳・ロットは削除せず保持。
- VercelビルドReady。別Lintは既存共有／生成ファイルを含む932errors/2528warningsがあり、全CI合格とはしない。以前8efのTypeCheckはPASS。最新の独立TypeCheckは未確認。

## 本番確認とP06への集約
- 本番Supabase soiksqgtmcnspfedmanr: Google Enabled保存済みを画面確認。新規登録OFF／匿名OFF／手動連携OFFは維持。
- 本番許可URL: https://sengoku-hime-ennbu.com と /auth/game04/callback。既定SiteURLだけwww付きから https://sengoku-hime-ennbu.com に統一して保存。開発／GAME03の戻り先はなし。戻す場合は元のwww付きSiteURLへ。
- 本番DB publicテーブル0を再確認。Edgeはgame04-p06-health v1のみ（記録時）、ゲームAPI未配信。
- 実ドメインのreceiver source bf1309128266f622d15fada810357761e32ccd67、Vercel F21SNQXmXdce4wRJ2Y8WELUAkeJR。Git未接続、ゲーム用envなし、既存All Deployments Authenticationを解除していない。
- https://sengoku-hime-ennbu.com は今回再確認でもクラウドBrowser ERR_BLOCKED_BY_CLIENT。ゲーム／Google／Stripe本番成功としない。
- Stripe本番GAME04は作成済み。最新画面では事業形態・個人情報・確認書類・銀行は完了。ビジネスの詳細・割賦販売法・商品サービス・公開情報・明細書・確認して送信が未完。以前の「未着手」観測はこの状態で更新。
- 画面に共有法人変更が他アカウントへ反映される注意があるため、共通法人情報は変更しない。審査サイトは公開確認可能である旨の表示があるが、本件で一般公開や保護解除は行わない。

### 適用順
1. P06担当がPR37/41を再取得、最終統合SHAを記録。現行ゲーム基盤schema/master/identity/bootstrap/claim/expiryを本番へ組み合わせる。GAME03データコピー・QA fixture適用禁止。
2. 33 billing runtimeを本番DB・live専用境界へ適合（現行dev wrapperはsandbox専用）。34商品、35報酬を既存付与の事前照合後に適用。36cronは本番専用job名で、37本人限定集計SELECTを適用。
3. 最新統合Edgeソースからバンドルを再生成し、source/bundle SHAを保存して配信。古い一式で上書きしない。
4. 保護付きゲームwebを本番receiverへ配信。prod Supabaseキー／Googleクライアント／本番Stripeキー／本番Webhook秘密／正規originを照合し、明示live opt-in。テスト値を混在させない。
5. 既存公開制御の下で本番Google・通知到達・DB保存を確認。匿名／手動連携を必要とする試験は本番担当が限定アクセスと合わせて管理し、一般登録を勝手に解放しない。
6. 本人の100円実課金最終確認。Preview成功を本番成功として転用しない。
### 戻し方
販売CLOSED＋メンテ維持、新設した本番VIP jobのみ停止、記録した保護付きweb/Edgeへ戻す。注文・付与・通知・報酬・有償ロットは保持し削除／差引きしない。関数は保存した事前定義とデータ互換性を確認して戻すか前進修正。37は本人SELECT policyとgrantを取り消せるが購入証跡は残す。

## 本人操作（再設定は不要）
- Googleの作成・秘密入力は完了済み。次の本番ログインはP06の保護付き本体配信後に /auth/game04 で行う。連携する→本人Google選択→同じ本番ドメインに認証済みで戻る、UID・資産・報酬1回をこちらで照合する。現状で再入力を求めない。
- Stripe: https://dashboard.stripe.com/acct_1UKBOkK9pVhABepD/account/onboarding/business の「Paymentsを有効にする」。完了項目はやり直さず、GAME04固有の未完項目と最終確認・送信を本人が行う。共通法人情報を変更しない。一般公開が必要な審査条件は公開制御を解除せずP06/Stripe審査方法へ集約。
- 商品説明用の確定情報: Webブラウザーゲーム内のデジタルアイテム（輝石、召喚札、消費アイテム）と30日VIP、100〜10000円、VIP480円・自動更新なし。事業者情報／法令質問への回答は本人の実態で確認する。
- 実課金手順（まだ実行不可）: 保護付き本番→Google連携済み確認→商店→初陣応援パック100円・上記5特典確認→Stripe本番画面の金額100JPYを確認→本人が支払う。こちらがWebhook、購入1回、BOX5件、受取後100有償輝石、120日期限、再読込保持を照合。
- 完了条件: GAME04本番決済受付が有効、保護付き本番の認証・購入・DBまで合格。一般公開・G5判定はこの作業に含めない。
