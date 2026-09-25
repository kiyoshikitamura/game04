# GAME04 P06 本番環境構築結果

2026-09-25 JST更新。**基盤構築済み部分あり / 移行準備未完 / P06未合格**。
ユーザーから月額約US$10追加の承認を受領。本番DBを実作成し、前回の費用待ちと実行環境切断は解消した。

## 構築・確認した対象

|対象|識別子/適用版|状態|
|---|---|---|
|専用配信先|game04-production-receiver / prj_sFLd5kZeu7pjveQIkeL88ShfN8i8|既存Pro team、Git未接続。All Deployments Vercel Authentication保存・reload確認済み|
|本番DB|game04-prod / soiksqgtmcnspfedmanr / ap-northeast-1|ACTIVE_HEALTHY。既存組織mvkvwqhvpoxpvxbumfjk内。SQL接続確認済み|
|確定基盤schema|20260924163630 game04_p06_private_foundation / p06-v1|private game04_ops管理台帳。maintenance=true、公開/課金/job=false。RLSとrole権限確認|
|素材保存先|game04-assets|private、素材未投入。正式素材はG5候補をMで配置|
|復旧用保存先|game04-ops-backups|private、実backup未格納。DBバックアップとStorage実体を別保全|
|基盤API|game04-p06-health v1 / verify_jwt=true|ACTIVE、未認証401、anon JWT503。service_roleだけ許可するコード。管理用HTTP成功試験は未実施|
|停止receiver|infra/game04-production/receiver|ゲーム/DB/決済依存なし。専用health handlerと常時503catchall。bf13091を専用projectへ配信、READY。HTTP/routing2試験PASS|
|復旧確認|private ops JSON→制約付きTEMP復元→比較→ROLLBACK|1行復元/一致ともtrue。DB物理backup復旧の合格ではない|
|監視|DB/API/Edge/Auth/Storage/Realtimeログ|実ログ読取成功。DB容量10,882,195 bytes、接続8は観測値。通知送信先は未指定|

本番schemaにはゲームテーブル0、ユーザー0、Storage object0。cron未導入、ゲームAPI/正式master未移行。開発DB全量コピーやユーザー/注文/QA複製なし。
管理台帳は停止状態を記録するが、Mで移すゲームAPIに停止を自動強制する実装ではない。Mのserver/API制御が別途必要。

## 環境分離

|用途|配信/DB|今回の扱い|
|---|---|---|
|GAME03|tribe-neon / ktpolnkyyfkowxdmijww、本番参照のみ|変更なし。秘密値/商品をコピーしない|
|GAME04開発|game04 / lrgyllgzcdcphlbmkknc、G2 branch work/game04-g2-20260924|変更なし。基準7476566、観測API v21。G1 v19へ戻さない|
|既存GAME04 Production|game04-gray.vercel.app / prj_vV06TC8bU3TEFRpNXFNdONiZmULE / a83a94a|既存main連動配信を保全。認証保護なしとの前回観測。今回切替/alias変更なし|
|新本番受け皿|game04-production-receiver / soiksqgtmcnspfedmanr|既存配信と別資源、ゲーム移行/一般公開なし|

## 独立確認・証拠

- DB anon/authenticatedのprivate schema利用不可、service_role更新不可/SELECTのみを確認。
- RESTのprivate schema要求は406/PGRST106で非公開を確認。public経路の一部502/通信エラーは安定疎通合格としない。
- Storageは2bucketともpublic=false、client policyなし。公開path試験400。実素材未配置なので実体読取受入はM。
- security advisorはprivate opsのRLS policyなしINFOのみ。意図したclient拒否であり公開policyを追加しない。
- Edge hash: 0ad1a703c512a763aace25fa83417d4568cb0390e2dd4ea4f39642ee48f0d7cd。
- FOUNDATION_EVIDENCE.json、AUTH_BACKUP_ACCESS.md、INDEPENDENT_VERIFICATION.md、DB reportに範囲を記録。
- 停止receiverのHTTP/route2試験PASS。ゲーム本体未変更、本体npm run check未実施。

## 必須未完・依存

1. 停止receiver配信は今回完了。匿名遮断12経路PASS。認証通過後のクラウド関数503/health200確認は未完。P06_HEALTH_TOKENは未設定。ブラウザは対象URLでERR_BLOCKED_BY_CLIENTとなり、保護を解除して試験していない。
2. 2026-09-25 12:51 JSTにユーザーが本番管理設定完了を報告。signup停止はユーザー実施報告として受領。添付で物理backup 2件とMicro選択表示を確認（詳細は末尾）。SMTP/provider設定と認証後の管理検証は未完。作業ブラウザ接続不一致のため直接画面確認は未回復。
3. 正式domain、Google/SMTP、Stripe本番商品/通知先、リーガル問い合わせ先はP01〜P04の確定待ち。追加の費用判断は今回発生していない。
4. G2/P02/P03は現状本番を拒否するコードがある。本番ref許可表とserver側公開制御を担当契約に沿ってM候補へ接続する。
5. G5最終manifest、確定ゲームschema差分、正式master/material allowlist、完全backup復旧確認、監視通知接続、本番操作/認証/決済受入は未完。

P06合格、M本番受入、G6公開合格とはしない。費用の再承認は不要。GAME03/開発/既存Production変更、mainマージ、一般公開、実金銭決済、ドメイン購入は行っていない。

## 保存・受渡し

Branch: work/game04-p06-20260925 / Draft PR #32。G2との衝突を避けinfra/game04-productionとP06専用docsのみ変更。
G2/P02〜P04にはCONNECTION_CONTRACT.mdで本番refと担当境界を受渡す。M手順はGAME04_M_本番移行・復旧手順.md。最終SHAはPR headを参照。

管理画面のsignup停止・backup・Microについては末尾のユーザー実施報告と添付確認を参照。再ログインや同じ設定操作は求めない。SMTP/Google等の外部接続設定はP03契約に沿って継続確認する。

RLS policyなしINFOの説明: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy 。private台帳をclientへ公開しないため意図した設定。

## 再開時の配信構築結果（2026-09-25 JST）

- Deployment: `dpl_F21SNQXmXdce4wRJ2Y8WELUAkeJR` / READY / source `bf1309128266f622d15fada810357761e32ccd67`。
- 不変URL: https://game04-production-receiver-fe5swww0u-kiyoshi-kitamura.vercel.app
- 既定alias: https://project-0jsj9.vercel.app （正式domainではない）。branch alias: https://game04-production-receiver-git-work-gam-880f26-kiyoshi-kitamura.vercel.app
- フォルダアップロードはファイル選択成功後も配信なし。代替としてRoot Directoryを`infra/game04-production/receiver`に固定し、フォルダ外ファイルを除外、Basic build machineへ設定。既存GitHub接続で対象repoを一時接続し、上記SHAを指定して配信した。
- 作成ボタンはPreview表記だったが、結果は専用projectのProduction。ゲーム本体は含まず、既存game04 project/main/共有aliasは未変更。配信後にGit接続をRemove Connectionで解除し、未接続状態を確認した。
- All Deployments / Require Log Inは配信後も保存状態を確認。独立担当の匿名GET（Cookie/Authorizationなし、redirect追随なし）で3ホスト×4経路が全て302→Vercel SSO。`RECEIVER_DEPLOYMENT_EVIDENCE.json`参照。
- 専用projectのVercel Cron実行をDisabledへ変更。ジョブ定義なし。Mで定義と許可対象を受入するまで再有効化しない。
- 本配信はゲーム受入でもDB接続確認でもない。cloud healthとSupabase管理設定等の必須未完は残るためP06未合格を維持。

## 管理設定のユーザー実施・添付確認（2026-09-25 12:51 JST）

対象は直前に指定した `game04-prod / soiksqgtmcnspfedmanr`。添付は画面の一部でproject識別子を含まないため、対象との対応はユーザー報告に基づく。

|項目|結果|証拠の範囲|
|---|---|---|
|Allow new users to sign up OFF・保存|ユーザー「設定完了」を受領|Auth画面画像なし。担当によるAPI再検証は未実施|
|Scheduled backups|PHYSICAL 2件とRestoreボタンの表示を確認|2026-09-24 22:23:33 UTC（09-25 07:23:33 JST）、09-24 16:25:32 UTC（09-25 01:25:32 JST）。実バックアップの存在確認。復元試験は未実施|
|Compute|MICRO選択表示、1 GB memory / Shared compute、US$0.01344/hour|ユーザー設定完了報告＋添付表示。30日換算US$9.6768、31日換算US$9.99936。compute単体で他利用料を含まない|

添付画像1の注意書きどおり、Storage object実体はDB backupに含まれない。Mで素材manifestと実体を別保全する。
最新backupは基盤migration適用時刻より後。ただしbackup内部のschemaや復旧結果を確認したものではない。
証拠元: ユーザー添付 file_000000000f8882069e4a0536a5f680e0（Database Backups）、file_000000008660820995f9f84661284be8（Compute）。秘密値なし。
この更新でbackup実在確認待ちを解消。signupはユーザー実施済み、Microは画面確認済みとして管理し、P06全体の合格とはしない。
