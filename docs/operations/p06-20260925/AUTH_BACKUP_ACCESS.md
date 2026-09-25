# 新本番Dashboard確認結果

対象: `soiksqgtmcnspfedmanr`。新本番のみ。実施日: 2026-09-24 UTC。

Supabase MCPにAuth config/backup管理がないため、依頼で許可されたDashboard経路を確認した。
Browser skillを読み、既存Chrome browserの新規専用tabで `https://supabase.com/dashboard/project/soiksqgtmcnspfedmanr` へアクセスした。
初期loading後にSupabase Sign inページへ遷移した。既存のDashboard認証セッションは利用できない。
委任条件「既存認証のみ・無断新loginしない」に従い、ログイン方法選択・認証情報入力・送信は行っていない。

## 状態

|対象|状態|
|---|---|
|新本番Auth signup停止|未適用。Dashboard認証が必要|
|backup実在・最終時刻|未確認。作成済みとはしない|
|プラン/Compute Micro UI確認|未確認。親の作成API結果は本調査外|
|Data API exposed schemas|未確認|
|SMTP/provider接続|未確認。未接続との確証にも使わない|
|既存/G2/GAME03変更|なし|
|秘密値の表示/転記|なし|
|Google/Stripe外部設定・通知送信|なし|

## 残件

1. 本番プロジェクトのAuth設定で新規signupを無効化し、保存後readbackを確認する。
2. Scheduled backupsの実バックアップ存在・最終時刻・保持期間を確認する。新設直後の空一覧を復旧可能と誤認しない。
3. 本番Data APIの公開schema、SMTP/Google provider設定済否を確認する。秘密値は出力しない。

今回観測したのはDashboard認証不足であり、親が観測したREST 502/timeoutの原因とは断定しない。
