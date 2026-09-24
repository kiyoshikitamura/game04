# 費用承認後の現行結果

2026-09-25 JST追記。ユーザーの追加費用承認を受領し、既存組織に game04-prod / soiksqgtmcnspfedmanr / ap-northeast-1 を作成。ACTIVE_HEALTHY。以下の費用承認待ち/本番未作成は過去の調査記録として保持する。

- 確定P06基盤: migration 20260924163630 game04_p06_private_foundation。private schema game04_ops、RLS/anon・authenticated権限なし、service_role SELECTのみ。
- game04-assets / game04-ops-backups はともにprivate。ゲームデータ・素材・secret backupは未投入。
- Edge game04-p06-health v1 ACTIVE / verify_jwt=true。未認証401、anon JWT503。管理用service roleのHTTP成功試験は未実施。
- private schema REST照会は406/PGRST106で非公開を確認。public API照会の一部は502/通信エラーのため安定疎通合格としていない。
- SQL疎通、権限確認、管理台帳のTEMP表へのJSON復元/一致/ROLLBACKを実確認。DB実バックアップからの全体復旧とは区別。
- auth.users=0、public game tables=0、storage objects=0、cron未導入。GAME03/開発データの複製なし。
- managed logsのDB/API/Edge/Auth/Storageへの読取を確認。通知宛先未設定、通知送信なし。
- Supabase Dashboard既存ログインがなく、signup停止/backup実在/SMTP provider設定確認は未完。Micro構成は作成時見積と承認構成、UIでのcompute size確認は未完。

現行の移行準備判定は docs/operations/p06-20260925/GAME04_P06_本番環境構築結果.md を参照。

---

# P06 DB・API・素材・復旧調査

確認日: 2026-09-25 UTC。Supabaseリモート変更なし。接続済みツールによる読取り結果。ローカル停止後、同じ観測証拠からGitHubへ保存。

## 前回調査（費用承認前の履歴）

## 資源・費用

組織 `mvkvwqhvpoxpvxbumfjk` (`kiyoshikitamura's Org`) は Pro。列挙できる7 projectsにGAME04本番専用はなく、GAME04は `lrgyllgzcdcphlbmkknc` / `game04-dev-clean` / eu-central-1 のみ。GAME03と他タイトル資源は転用しない。

新設案: `game04-prod`、ap-northeast-1、Micro、既存組織。`get_cost(type=project)` は monthly amount 10。公式compute docs照合で約US$10/月追加（Micro US$0.01344/時）、利用超過・追加オプション別。費用承認待ちにつき作成・confirm_cost未実施。本番ref/API URL/bucket/適用版は未発行。DB/API/Storageを構築済みとしない。

## 開発観測値（移行承認ではない）

|項目|値|
|---|---|
|DB|PostgreSQL17 / 17.6.1.166、61,402,259 bytes（観測時）|
|public|276 tables / 592 functions|
|migration|71件、最新 `20260924125412 game04_g2_vip_schedule`|
|API|`game04-redesign-api` v21 / verify_jwt=true|
|API hash|`d3599cf9bfede3850553f143bd9df830ab99fc92a19cab1309fcba1f56b5eae0`|
|補助API|`resolve-battle` v2 / verify_jwt=true|
|DB/cron時刻|UTC / GMT|
|件数|public.users51 / auth.users55（個人データ未取得）|
|Storage|bucket0 / object0|
|拡張|pg_cron, pg_stat_statements, pgcrypto, plpgsql, supabase_vault, uuid-ossp|

G1のv19を最新として固定しない。開発全体を複製しない。Storageが空でも素材不要とはならない。Git/配信内の正式素材はG5候補からhash manifestを作りMで転送・検証する。

## M適用順

`infra/game04-production/db/development-migration-inventory.json` に観測71件と分類を保存。全apply_now=falseであり実行manifestではない。P06でゲームschemaは移さない。

1. G5合格SHA、API hash、正式master版、P02〜P04 schemaを凍結し所有担当の受入と照合。
2. 本番ref/組織/地域と既存データ・migration履歴をpreflight.sqlで確認。空を証明できないDBを初期化しない。
3. DB backup/独立dump、素材manifest、設定名・適用先・版を保全。秘密値はsecret store限定。一般公開・checkout・付与cronは停止。
4. baseline履歴と実schemaを照合。新規空DBのみ承認baselineを依存順に適用: extensions → 00 tables → 10 functions → defaults/constraints → 許可master依存先行seed → 40 foreign keys → 50 views → 60 access → 70 finalize。関数内部参照先を検査し必要なら先行適用。開発分割migration番号を本番既適用として偽記録しない。
5. `30_seed_*` 全投入禁止。正式master許可表・設定だけ抽出。auth/ユーザー/注文/ログ/報酬台帳/QA/開発配布を除外。`80_cron` は除外。
6. G5候補に必要な後続migrationだけ依存順適用。G2ログボ/VIP、G3、G4、P02〜P04は候補版で再評価。既適用version/hashはskip、同version異SQLは停止。
7. RLS/GRANT/definer/view権限を検証。G5 APIを本番専用秘密値で配置し、非公開health・限定ユーザーで認証/保存/冪等性確認。旧ゲーム/開発URL混入を検索。
8. 素材一覧・size・hash照合。公開読取素材と運営backup等非公開領域を分離。公開前は素材もprivateで準備。service_role/secret keyをclientへ渡さない。
9. 採用cronは登録時inactive。Webhook無効または検証対象限定。M受入後も課金・公開の承認条件を分離して有効化。

## 権限の持越し禁止点

開発publicのRLS未有効は16表。そのうちanon INSERT/UPDATE権限もある6表:
`canonical_gameplay_master_versions`, `gacha_banner_master`, `guild_decorations`, `pvp_ranking_reward_grants`, `raid_instance_user_progress`, `raid_production_reward_grants`。
canonical character/equipment/skill系にもauthenticated書込権限あり。実データ改変試験なし。Mで用途別権限へ是正する。G2設定は変更していない。

## cron観測・移行方針

開発9件は全active。必要候補も準備中は無効。GMTに9時間を加えるとJST。

|job|現schedule|本番方針|
|---|---|---|
|anonymous-onboarding-cleanup-daily|0 18 * * *|P03の保持期間/資産保護受入後採否。JST03:00|
|daily-ranking-reward-finalize-jst-midnight|0 15 * * *|正式ランキングに必要な場合のみ。JST00:00|
|ranking-pvp-monthly-jst|0 15 * * *|毎日起動する月次判定。旧PvPは原則除外、G5正式採用時のみ|
|ranking-raid-weekly-jst|0 15 * * 0|正式共闘ランキング採用時のみ。JST月曜00:00|
|kpi-overview-saved-results-half-hourly|7,37 * * * *|P06対象外。U10/C09へ引継ぎ|
|raid-room-expiry-minute|* * * * *|共闘期限処理の必要候補。G5新共闘実装を照合|
|raid-daily-room-start|*/5 * * * *|旧自動開始の可能性。共闘/侵攻開催契約確定まで除外|
|ranking-power-monthly-finalize-v1|*/5 * * * *|正式総合力ランキング採用時のみ。月次条件/二重付与防止を受入|
|game04-g2-vip-delivery|* * * * *|VIP必要候補。G2確定版とP02権利状態/冪等キー受入後|

日次任務/ログボはアクセス時更新かcron依存かG5正式関数で確認し重複cronを追加しない。各採用jobの対象日・user・報酬種別一意性、再実行、終了記録、失敗検知はM確認。`cron.job_run_details` とAPIログ監視の宛先は既許可先のみ。

## バックアップ・復旧

Pro日次7日保持は契約機能。MCPにbackup一覧ツールがなく本番未作成のため、backup実在/日時/復旧成功は未確認。PITRは購入/有効化しない。DB backupにStorage実体は含まれない。

M前に管理画面Database > Backupsまたは正式Management API `GET /v1/projects/{ref}/database/backups` で成功時刻を確認。CLIは `supabase --version`, `supabase db dump --help` を確認後、対象ref/DB URLをsecret storeから渡しschema/必要データ/roleを独立dumpする。秘密値を資料・ログへ出さない。物理backupを直接downloadできると決めつけない。DB dump・素材実体・設定secretの保管先/保持期間/担当を指定して準備完了とする。

復旧試験は空の隔離DB/schemaへ秘密を含まない人工データと承認schemaをrestoreし、件数/FK/RLS/RPC/冪等性を確認。実ユーザーDBへ試験しない。追加費用が出る試験環境より既承認範囲内のlocal Postgresを優先。今回は本番backup復旧試験未実施。

障害時は maintenance → checkout停止 → Webhook受信/処理を契約に従い保留（event消失禁止）→ cron停止 → 現状backup/証拠保全 → DB/API/App互換表で復旧版選定。互換旧版のみApp/API rollback可。破壊的schema後は前進修正優先。DB復元時は復元点以降の注文/付与/資産差分補正を先に確定。実金銭決済なしで限定受入し、cron/Webhook/checkout/公開を承認条件に従って順次再開する。

## 参照

- https://supabase.com/docs/guides/platform/manage-your-usage/compute
- https://supabase.com/docs/guides/platform/your-monthly-invoice
- https://supabase.com/docs/guides/platform/backups

公式文書は当日Supabase search_docsで取得。契約上の機能と実環境の確認済みを区別する。
