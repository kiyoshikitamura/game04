# 独立確認記録
2026-09-25 JST。固定G2 SHA7476566。P06子④確認。

- config/supabase-targets.json production=null、supabaseUrl.tsはdev/preview+dev refだけ。
- APP_ENV省略時development。Production配信targetだけで誤接続防止にならない。
- src/proxy.tsはKPI2経路のみ、page.tsx maintenanceはclient処理。API/匿名作成停止を保証しない。
- 旧verify_production_supabase_url.mjsはGAME03本番/previewを正解にする。Mで正式許可表に整合させるまで本番検証の証拠にしない。
- 隔離receiver既存テスト1件0失敗を独立再実行。追加で正token非health拒否、POST/PUT/DELETE/PATCH/OPTIONS拒否、末尾slash/大小文字/encoded path拒否、HEAD bodyなし、偽original header無効を確認。
- Vercel rewrite後のreq.url保持は未確認。/api/receiverを模擬するとhealthは503。安全側に閉じるが認証health疎通要件は未達になり得る。専用health handler分離案は環境障害で未適用。
- 検証の後exec-server environment_offlineとなり追記保存失敗。親が本記録をGitHubへ保存。
- Cloud配信・本番DB/API疎通・本番backup restore未確認。local PASSから全面合格にしない。
