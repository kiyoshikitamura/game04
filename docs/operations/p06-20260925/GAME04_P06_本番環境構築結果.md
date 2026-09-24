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
|停止receiver|infra/game04-production/receiver|ゲーム/DB/決済依存なし。専用health handlerと常時503catchall。HTTP/routing2試験PASS|
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

1. 停止receiverのクラウド配信/不変URL/health確認。フォルダアップロード呼出しが約399秒無応答で中断。最後の成功観測は配信0だが、中断後の配信開始有無は未確認。成功扱いにせず、読取り確認後に続行する。
2. Supabase管理画面に既存ログインがなく、新規signup停止、backup実在/成功時刻、Micro実設定/SMTP/providerの確認が未完。管理ログインが必要。接続済みMCPは当該設定操作非対応。
3. 正式domain、Google/SMTP、Stripe本番商品/通知先、リーガル問い合わせ先はP01〜P04の確定待ち。追加の費用判断は今回発生していない。
4. G2/P02/P03は現状本番を拒否するコードがある。本番ref許可表とserver側公開制御を担当契約に沿ってM候補へ接続する。
5. G5最終manifest、確定ゲームschema差分、正式master/material allowlist、完全backup復旧確認、監視通知接続、本番操作/認証/決済受入は未完。

P06合格、M本番受入、G6公開合格とはしない。費用の再承認は不要。GAME03/開発/既存Production変更、mainマージ、一般公開、実金銭決済、ドメイン購入は行っていない。

## 保存・受渡し

Branch: work/game04-p06-20260925 / Draft PR #32。G2との衝突を避けinfra/game04-productionとP06専用docsのみ変更。
G2/P02〜P04にはCONNECTION_CONTRACT.mdで本番refと担当境界を受渡す。M手順はGAME04_M_本番移行・復旧手順.md。最終SHAはPR headを参照。

管理画面への次の操作: Supabaseへログインした状態で本番projectを開き、Allow new users signupを停止して保存確認、Backup成功時刻・Compute Micro・SMTP/Google未接続状態を確認する。追加費用の承認は再度求めない。

RLS policyなしINFOの説明: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy 。private台帳をclientへ公開しないため意図した設定。
