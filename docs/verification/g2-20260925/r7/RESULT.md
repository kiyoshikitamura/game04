# GAME04 G2 R7 継続結果

2026-09-25。開発のみ。G2全体合格は未成立。実戦闘開始20回の最終集計を追記予定。

## 版と実配信

|対象|成果|
|---|---|
|着手時保存head|af640e291d3e79e511833dcef1e16f0ff7528b94|
|PR31統合・R6回収・QA復帰ルート|8bedb7986975cabff2b210c0077dd3fb70e6d6a0|
|R05/R06検証対象|61e5af88df62ca2cee08626257f0d71cae102577 / https://game04-j6r08aejw-kiyoshi-kitamura.vercel.app / dpl_D1t7M1idVxLJ6PviDQViWMJHRsyz|
|実戦計測追加|b41d35b7d6639df700be22a6087726b4eccdf6bc / https://game04-mkcz0ftw6-kiyoshi-kitamura.vercel.app / dpl_CFV4FBQ7SWdPsKWdCPQ23ECB1DLT / READY、meta SHA一致|
|稼働API確認|game04-redesign-api v31、verify_jwt=true、hash 70c20710ef9a7a36b103630cd67548da2fa62f314efa2d0797a482db11fb9c6f|
|配信ソース|shared-api/live-v30-rooms.ts.txt / SHA256 59e497ae9278ba1108ed3a31f510bd4d266eac6535c815bc5f26692f29eac215 / readback全文一致|
|DB|game04-dev-clean / lrgyllgzcdcphlbmkknc。今回8件の履歴（2件はrollback probe）、[一覧](db-migrations-security.md)。既存migration一括再適用なし|
|PR31最新再確認|3ca2e73ccca1a816bef6d8aa3a3dbecca3494a79、39ファイルを3way統合。PRは未merge|
|G3最新再確認|PR33 head945fb678b45d4ba008138d30286e466c4a1bef2a。別担当の本体差分はG2へ未merge、共有APIのv28/v30成果を保持|

R5 Preview/APIv25はR5の証拠としてのみ保持。最新配信証拠へ流用しない。Git保存後の実装/証拠SHAはPR30の最新記録を参照。

## 実装・限定受入

- 停止領域からR6差分/証拠を回収。認証後read並列化は停止時未保存・未配信だったため、live v28基準で独立レビュー後v29へ反映。auth成立前や再送判定前のstate更新を追加していない。
- 保存応答のrooms owner取得をread-only service_role専用RPCへ統合。G3がv30へ更新したことを配信直前に検知し、古い候補を破棄してv30へ1hunkのみ適用しv31へ反映。可視範囲/順序/欠損fallback、auth/CAS/再送、新G3券接続の独立確認PASS。
- SSR背景6細則は承認済み。af640e2/R6の未解放拒否、既所持・初回/重複、保存・Auth refresh後復帰を維持。共通契約10点の局所再確認とDB選択保持を確認。[SSR/R09](ssr-admin-review.md)。ブラウザlogout/loginは未受入。
- R05 news/activity実503・timeoutのエラー→再試行、profile待ちと本文表示を新Previewで確認。非空一覧保持は既存局所証拠を維持し、空一覧のDOM試験で代替しない。
- R06実BattleViewの画像503/timeout→retry、永続失敗→終了を確認。[記録](r05-r06.md)。保存済み戦闘再開/同ID再送・共闘grant非重複は既存完了を維持。今回fixtureの画像失敗を実戦結果/共闘復帰＋receipt不変の組合せ受入へ拡張しない。[独立境界](r10-recovery-timing-review.md)。
- PR31のauth/購入/VIP/法務を統合。新規注文だけ正式在庫に接続し、旧snapshot/券user_itemsを保持。有償派生交換は無償優先と元lot/期限を保持。DB rollback試験で付与・消費・期限・失敗/CAS・再送を確認。[統合](p31/INTEGRATION.md)、[有償派生](p02-derived-lot-review.md)。Stripe実決済ではない。
- 型検査、変更範囲の独立handler/投影/計測・billing fixtureを確認。R11の新しい個別実機指摘は本起票に無く、全画面監査を再開していない。

## 性能判定

cloud Chrome、390×568、回線制限なし。iPhone/Safari、Wi-Fi・4G/5Gの代替合格にはしない。

|対象|結果|判定|
|---|---|---|
|warm本陣/武将CTA|R6各20回1秒以内を維持。主要情報全体の完了とは区別|当該CTA限定合格、主要情報/実機は未測定|
|おまかせ装備保存→結果CTA|v28→29中央値1716.4→1562.2ms。追加v30→31で1408.85→1297.7ms。v31 p95 1928.9/max1954.5ms、1秒0/20、1.5秒18/20|未達、1.5秒例外不成立|
|実戦闘開始|b41d35b7/APIv31で20回計測中|最終追記|
|cold独立初回5回|キャッシュ/独立初回条件を保証できる測定なし|未測定|
|受取・交換の性能各20回|機能検証とは別|未測定|
|タップ反応|保存busy DOMは0.1秒内、描画時刻/実機押下反応とは別|DOM限定、実機未測定|

[保存比較の全20行とAPI/結果/CTA分離](save-performance.md)。同frontendを保持してAPIのみ比較。画像は保存で独立metricなし、0ms扱いをしない。共有DB/G3並走負荷は制御していない。外部auth/Stripe待ちは今回未測定。

## 実際の残件・外部依存

1. 保存は1秒/例外1.5秒とも未達。cold、実機Safari、受取/交換の各20回も未測定。測定条件を追加して受入を継続する。
2. R05非空一覧保持実DOM、R06画像失敗→保存済み実戦結果/共闘復帰＋receipt不変の組合せ、SSRブラウザlogout/login。既存API/DB完了は取り消さない。
3. R09: KPI_BASIC_AUTH_USER/PASSWORD未設定で実HTTP503。設定後の200/401・UI数量照合、旧included集合の元QA作成根拠を残す。根拠なし一括分類はしない。
4. P02: Preview billing診断はavailable=false。sandbox enable、開発DBサーバー設定、Stripe test key、webhook secret、service_role、return originが不足。設定後に実test決済/webhook/VIP受入。秘密値をGitへ保存しない。
5. P03: Supabase公開settingsはgoogle=false、email=true、autoconfirm=false。Google provider/redirect、メール配達・同UID連携/別端末復帰の実受入を残す。
6. P04/P06境界: ドメイン取得済み。今回DNSは実行環境の名前解決エラーで現況未確認、未設定の断定はしない。DNS/TLS・メールの最新実設定確認は外部依存。本番基盤変更は別スレッド。
7. G3: user_items券を正本、questTicketGrantsは累積供給履歴、共通SSR解放・DM007/正式ID/再送契約を共有。PR33へv31ソース/hashと保持事項を通知。G3自然ガチャ/SSR交換の限定受入は別担当。

承認済み名称/素材/日次/侵攻/SSR細則/性能基準を再判断へ戻さない。G4チュートリアル/正式初期付与を独自実装しない。G2全体の合格判定はメイン進行へ提出。main merge、Production変更、一般公開なし。
