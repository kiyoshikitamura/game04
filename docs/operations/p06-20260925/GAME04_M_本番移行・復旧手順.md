# GAME04 M 本番移行・復旧手順

状態: 実行前runbook。P06未完/G5未合格につきゲーム移行未実施。G5後に受入版で更新する。
担当: 移行親が適用一元管理、G2はゲーム/API/master、P02決済、P03認証、P04公開情報、独立担当が接続/停止/復旧を確認。

## 0. 開始条件と禁止
P06受け皿の保護/DB/backup/疎通、P01正式domain、P02〜P04接続契約、G5合格を確認。
未確定ref・空欄manifestのまま進めない。main/既存game04-gray aliasの切替は別移行案で明示承認するまで禁止。
GAME03/開発ユーザー・auth・注文・QA状態・テスト付与をコピーしない。旧GAME03 npm apply/guard期待値をそのまま実行しない。

## 1. 移行manifest固定
候補app SHA、API source hash/version、正式master版と件数、schema/migration version+SQL hash、素材path+size+SHA256、設定名+secret保管先の参照、対象Vercel/Supabase識別子を記録。
manifestの未入力は未完。G5コードをproduction設定でrebuildし、Preview buildの単純昇格はしない。
実接続先をbuild outputとserverから照合し、dev ref/GAME03 ref/旧ドメインが実行経路に混入しないことを確認。

## 2. 公開/付与を閉じた受け皿確認
Vercel AuthenticationをProductionと全Deployment URLに適用・未ログインブラウザで拒否確認。デフォルトURL/alias/直URL/未知経路を確認する。
receiverはゲーム未設置で全503。Mアプリに置換する前にserver側全ゲームAPI停止・QA拒否・auth開始制限を実装受入。
Supabase Edge直URL、REST/RPC、Storage/AuthはVercelの保護外。DB role/RLS/RPC grant/allowlist・新規Auth制御で未許可ユーザーを拒否する。
checkout停止、Webhook無効/限定検証、cron inactiveを先に確認。client maintenance表示だけで進めない。

## 3. preflight/バックアップ
infra/game04-production/db/preflight.sqlを対象ref照合後にread-only実行。DB名だけでなく管理画面のproject ref・組織・URLを照合。
既存履歴とschemaがある場合は保全し、migration対象差分を作る。空DBという推測で初期化しない。
Database Backups画面/APIで成功時刻と保持を確認。Pro機能の存在だけをbackup実在としない。
DB(schema/必要data/roles)、Storage実体とmanifest、Auth/provider設定、secret復元参照、配信artifactを別々に保管。秘密はGit/チャットへ置かない。
保管先・アクセス担当・保持期間・RPO/RTOは本番運用として確定させる。提案値はRPO24h/RTO4hだが未承認・未実測。

## 4. DB/API/素材
新規空DBでは確定基盤を依存順に適用する。詳細はdocs/P06_DB_API_STORAGE_REPORT.md。
extensions→tables→functions→defaults/constraints→承認済みmaster依存seed→FK→views→RLS/grants→finalize→G5必要差分。依存不整合があればSQL依存を先に解決。
baselineの30_seed全量と80_cronは禁止。既適用versionはSQL hashも比較してskip、同一versionで違うSQLは停止。
G2/P02-P04の候補migrationを一括再適用しない。各差分の適用前後とhistoryを記録。
公開master/素材はID allowlistと件数/hashで照合。公開素材領域と非公開backup領域を分け、受入前はprivate。
ゲームAPIは本番専用secretで配置。未許可call拒否、限定テスター保存、再送時一度だけ付与を確認。
DB schema適用時にgrant/RLSを点検。開発で観測した匿名書込可能な旧表をそのまま本番へ持ち越さない。

## 5. 持込み表

|対象|持込み方針|確認担当|
|---|---|---|
|app/API|G5合格SHA/hashだけ。本番設定rebuild|G2/P06|
|武将/スキル72/装備160/出陣65/報酬等|正式master ID allowlist、G5版の値/件数/hash|G2/G3/G4|
|料金/商品/購入制限/VIP|P02正式契約と本番商品/metadata、無効状態で準備|P02|
|リーガル/問い合わせ/URL|P01/P04確定値のみ、仮domainを正式にしない|P01/P04|
|素材|G5許可一覧から配信/Storageへ、hash一致|G2/P06|
|既存本番ユーザー/注文/資産|現存を調査し別の移行表を作成。初期化/無断移動なし|P06/P03|
|開発auth/users/orders/戦闘/QA/報酬台帳|除外|独立担当|
|ログ/KPI|開発ログは除外。U10正式schema/設定のみ別契約|U10|
|Cron/Webhook|全量コピー禁止。採用jobのみinactive/対象限定|P06/P02|

## 6. 本番設定と受入
domain/HTTPS→Supabase Site URL/redirect→Google許可origin/provider→SMTP送信元→Stripe専用商品/通知/帰還→本番build/配信、の依存を満たす。DNS切替が既存サービスへ影響する場合は切替案を別確認。
Mでは認証2方式、メール、guest連携/再ログイン、保存、購入通知/付与、日次境界、VIP期限、素材の代表経路を確認。実金銭検証は方法/金額/返金方針を別承認。
Stripeの擬似付与のみで本番決済合格としない。M結果をG6へ提出。公開・課金・広告開始は各決定時刻に分ける。

## 7. ジョブ・監視
開発cron9件の分類はDB report。ランキング/旧PvP/旧レイド起動は自動採用しない。KPI移植はU10。
VIP/共闘期限等の必要jobはinactive登録し、timezone、対象日、期限、排他/冪等キー、遅延再実行を確認。
M受入中は許可された検証対象だけ。一般付与の有効化は公開運用の承認に合わせる。
初動負荷の仮試験シナリオ: 同時20/50/100セッション、通常回遊/ログイン集中/戦闘結果保存/通知再送を分ける。MAUから性能合格を断定しない。p95/API件数/DB CPU/接続数/転送/容量を測りG5で採否と閾値を決める。本番に無計画な負荷はかけない。
API/DB/Vercelログ、cron.job_run_details、注文滞留、VIP最古未付与、容量と費用を読む。通知宛先未確定のまま送信しない。

## 8. 障害停止・復旧
1. 新規Checkoutを拒否、一般書込を停止、cronをinactiveへ。進行中決済通知はP02の受信保留/台帳で失わず保全する。単に200応答して破棄しない。
2. 現在のapp/API/schema版、未処理注文/通知、ジョブ最終成功、backup時刻を記録。
3. appだけ戻してDB互換を壊さない。互換表が成立するapp/API rollbackだけ許可。破壊的変更後は前進修正を優先。
4. DB時点復旧が必要なら、対象時刻後の注文/付与/資産差分の補正方針を先に確定。Storage実体もmanifestで復元し、secret/provider設定を再注入。
5. 隔離DB/合成データでrestoreし、件数/FK/RLS/RPC/冪等性を独立確認。実ユーザーDBで破壊試験しない。
6. 限定本番受入→保留通知を照合・重複防止再処理→採用job→checkout→公開を、障害復旧判断に従って再開。
7. 新空receiverはfallback表示として使えるがDB/API直アクセスや受理済み通知を停止する機能はない。これだけで全サービス復旧/停止完了としない。

## 9. 現在の未完
本番DB/ref、受け皿配信/認証保護、domain・外部設定、base/delta適用、backup保管/復旧試験、監視実接続、G5最終manifest、M限定アカウントと決済検証方針は未完。P06のlocal HTTP試験を本番復旧試験と報告しない。
