# GAME04 ポチゲー同時接続数

本番基点: 80693affdb6f877dfb6dcc29f5a890deeb0545d4 / receiver dpl_2EUmfj7bn3CdCFLDFa5j91BQrvjz。
DAU、新規登録、ゲームルールに変更なし。既存users.last_active_atは手動操作の網羅記録ではなく、既存KPIも流用しない。

## 本番反映記録

- 実装配信SHA: `d43c6c244c331a948acb51c5218b8d247fe48d08`
- 並走本番成果 `d2e10e5e0629353d66bbb71be2fd5194f2d7955f` をマージして保持。反映直前の本番実配信がその成果であること、統合版に祖先として含まれることを再確認。
- Vercel receiver: `dpl_DHVEd7rKXLTyvKC1CaZYBXyRSX1X` / Ready / Production。
- 本番設定で新規ビルドした後に本番ドメインへ割当。https://sengoku-hime-ennbu.com/ のHTTP 200、デプロイID一致、タイトル実表示を確認。
- 専用Edge Function version 1、Cron jobid 3、active=true。ほかの既存Cronは変更なし。
- APIキーは本人が2026-09-28 16:10 JST頃にSecretsへ保存。値は担当側で取得・表示していない。
- 初回実測送信: 2026-09-28 16:15:02.231 JST、1人、HTTP 200。ポータル編集画面の1人表示と掲載規約同意済みを本人が確認。
- 2回目実測送信: 2026-09-28 16:20:01.081 JST、1人、HTTP 200。5分枠の定期実行が2回連続成功。再試行なし。
- ポータル受信照合: 本人が認証済み編集画面を更新し、16:20頃の受信日時・1人の両方が一致すると確認。担当側ブラウザには編集画面の認証が共有されなかったため、この照合は本人確認に基づく。掲載規約も本人が同意済みと確認。
- Preview配信の活動APIへPOSTし204（書き込み抑止）を確認。本番配信では無認証POSTを401、Edge Function入口も無認証を401で拒否。
- 型検査、対象ファイルlint、限定テスト、ローカル本番ビルド成功。静的ブラウザbundleからポータルキー名・内部ジョブトークン名・外部送信先コードが検出されないことを確認。

## 集計

- Supabase auth.uid()で特定するUUIDにつき1行。auth.usersを参照するため、プロフィール未作成のゲスト・チュートリアル途中も対象。
- ゲーム画面のtrusted click/input/changeおよび操作キーを記録。タイトルは除外し、明示的な「はじめから」「続きから」は個別記録。
- 自動通信、描画、ポーリング、focus/visibilitychangeだけでは記録しない。
- 連続操作中は最大10秒単位、操作終了後は1秒のtrailing flush。pagehide/hiddenでも未送信の操作のみkeepalive送信。保留が10秒を超えた場合は破棄し、復帰による古い操作の再送を避ける。
- 時刻はDB受信時刻。通常、操作と記録には通信遅延と最大1秒の終了検出遅延がある。オフライン・強制終了で未到達の通信を保証するものではない。
- サーバー時刻から過去5分以内の行数を集計。正常な0は送信。失敗・不正な値は送信しない。

## 送信と秘密

- 唯一の定期実行: game04-prod Supabase Cron `game04-pochi-online-production`, `*/5 * * * *`。
- Edge Function `game04-portal-online`。本番プロジェクトURL固定。Preview・開発のfunctionでは外部送信禁止。
- Vaultで生成した内部ジョブ専用トークンをservice_role限定RPCで認証。一般ユーザーはジョブ・送信履歴を読めない。
- 5分枠unique制約でジョブの重複を排除。45秒以上古いジョブは拒否、集計後5秒以上遅れた送信を拒否。
- 8秒タイムアウト。429/502/503/504だけ1秒後に1回再試行し、その直前に再集計。受信済みか不明なタイムアウト・通信失敗は重複を避けるため再試行しない。
- GET先を固定しredirect禁止。URL、応答本文、例外本文はログ出力しない。人数のみ送り個人識別情報は送らない。
- `game04_portal_jobs`と`game04_portal_attempts`に集計/送信時刻、人数、結果、HTTPステータスを保存。HTTP成功とポータル側受信一致は別に確認する。
- `POCHI_PORTAL_API_KEY`と`POCHI_PORTAL_ENABLED`はSupabase Edge Function Secretsのみ。VercelやNEXT_PUBLICへキーを設定しない。
- 初期確認時、既存Secretsにはポータルキーなし。キー未設定ではジョブをconfiguration_missingとして記録し、外部送信しない。

## 限定検証

`node scripts/verify_portal_online.mjs`: 入力、最終操作、放置、背景、復帰、ゼロ、集計失敗、認証、Preview、期限切れ、重複、限定再試行、ログ秘匿。

`supabase/tests/game04_portal_online_rollback.sql`: 隔離Preview DBで実SQLを実行し全変更rollback。ゲスト、未作成プロフィール、複数操作、5分経過、0件、ジョブ認証、権限、重複排除。

Security advisorのRLS/no-policyは、直接アクセスを拒否する専用テーブルの意図した状態。activityの書き込み権限はauth.uid()を確認するprivate関数に限定。

## キー設定・受信照合

1. https://supabase.com/dashboard/project/soiksqgtmcnspfedmanr/functions/secrets を開く。
2. Name=`POCHI_PORTAL_API_KEY`, Value=発行済みキーを本人が入力し保存。チャット、Git、Issueへ貼らない。
3. `POCHI_PORTAL_ENABLED=true`とCron有効状態を確認。
4. https://pochi-games.com/pochi-game/portal/edit の「APIキー」で本人が認証する。掲載規約の同意状態を確認。未同意の場合は規約を読み本人が同意する。
5. 5分間隔で2回以上の成功を待ち、受信日時・人数を下記履歴と比較する。架空人数の試送信は禁止。

```sql
select j.slot,j.status,j.result,a.sent_at,a.online_count,a.http_status,a.result
from public.game04_portal_jobs j
left join public.game04_portal_attempts a on a.job_id=j.id
order by j.slot desc,a.attempt desc limit 10;
```

停止: `select cron.unschedule('game04-pochi-online-production');` またはSecretsの `POCHI_PORTAL_ENABLED=false`。
再開: 手動SQL `supabase/manual/game04_portal_production_cron.sql`を本番で1回適用。
