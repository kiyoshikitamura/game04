# GAME04 dev移行タスク

基準e2998ff0ecbc2d8e608f3e47f9f43ed0fd6f723c。統合branch codex/game04-production-clone。

## 再開後の実績

- 本体・キャラ60体・ロゴ置換完了。元PNG SHA256一致、型・ビルドPASS。
- GAME04 dev `lrgyllgzcdcphlbmkknc` に実本番catalogからbaseline適用。既存10テーブルを保持、public計257テーブル、キャラ60体、Cron8件。
- マスター・シーズン設定を移植。ユーザーデータは移植せず、users=0を確認。
- resolve-battle v1 ACTIVE。本番v3実体5ファイルと一致。
- 再現用SQL: supabase/baselines/game03-e2998ff0。既存migrationを一括実行しない。
- 残り: Vercel Preview配信、画面確認、匿名認証有効化後の新規開始・戦闘確認。
- 匿名認証は現在無効。現接続にAuth設定更新機能/Management API認証なし。GAME04 DashboardでAllow anonymous sign-ins有効化が必要。
- 本体ローカルcommit: fcc8c50c5ff92fccbe85718e43241dbfa422a12c。公開GitHubへのpushは自動承認レビューが拒否。ユーザーによるコード・素材の公開送信承認待ち。配信未実行。
- ブラウザはlocalhostアクセスがERR_BLOCKED_BY_CLIENTで画面未検証。型・ビルド・素材ファイル整合は確認済み。

| 担当 | 予約範囲 | 出口 |
|---|---|---|
| 親 | 接続設定、環境ガード、package、README、AGENTS、統合、dev配信 | GAME04 dev実稼働 |
| assets_replace | publicのキャラ/ロゴ、キャラ表示対応、素材manifest。編集箇所は親へ通知 | 60体・ロゴ全表示箇所一致 |
| game03_production | db-work内baseline構築、GAME04 DB追加、master、Edge/Cron | 既存データを残し本番相当の新規ゲーム開始 |
| game04_inventory | 配信経路調査のみ | 専用dev配信経路確定 |

GAME03はread only。子はmain merge/deployを行わず親へ検証結果を返す。素材名とレアリティの元データを保持し、数値・抽選・成長・装備・スキル性能を変更しない。旧タスクの未確定テーマ設計は今回実施しない。
