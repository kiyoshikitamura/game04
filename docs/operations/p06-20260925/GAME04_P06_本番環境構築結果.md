# GAME04 P06 本番環境構築結果

判定: **一部構築済み / 移行準備未完 / P06未合格**。2026-09-25 JST。
空の本番配信受け皿を作成。隔離停止コードを実装してローカルHTTP/独立検証を実施。DB新設費用と外部接続依存に加え、実行環境の切断で保護設定保存・アップロードが未完。資源だけを作ってP06全面完了とはしない。

## 構築済み・検証状態

|対象|状態|実施・証拠/残件|
|---|---|---|
|配信受け皿|構築済み|game04-production-receiver / prj_sFLd5kZeu7pjveQIkeL88ShfN8i8。既存Pro team内で空project作成・改名を管理画面で確認|
|Git/自動配信分離|確認済み|新projectはGit未接続、Production/Previewなし、requests/functions=0。main/既存aliasは変更なし|
|隔離receiver|コード実装・local検証済み|infra/game04-production/receiver。ゲーム/DB/決済依存なし。未知経路含め503、healthのみ32文字以上の秘密認証。未設定は503。稼働先へ未配信|
|Vercel Authentication|未保存|Require Log Inのチェック操作中にbrowser応答停止。Save未実行。全URL保護設定済みとはしない|
|基盤クラウド疎通|未確認|Deploymentなし。コードのlocal PASSを本番疎通へ換算しない|
|本番DB/API/Storage|未作成|既存7projectsに専用本番なし。新規Micro約US$10/月の判断待ち。本番ref未発行|
|baseline/migration|分類準備済み|開発71履歴を記録、全apply_now=false。一括適用しない。確定基盤の本番適用はDB作成後|
|設定・外部認証/決済/メール|依存待ち|接続契約を保存。P02/P03コードは現在本番を拒否。秘密値コピーなし|
|ジョブ/監視|仕様・手順準備、実設定未完|開発9jobsの採否と停止状態を分類。VIP毎分は開発の実観測。新本番ではジョブ未登録|
|バックアップ/復旧|手順準備、実復旧未確認|DB/Storage/秘密設定の分離復旧を記録。本番DB未作成、復旧試験未実施|
|M/G6|未着手|G5合格ゲーム移行、実金銭決済、一般公開は実施なし|

## 環境対応表

|環境/用途|配信先/識別子|DB/API/素材|版・状態|公開制御|
|---|---|---|---|---|
|GAME03参照のみ|tribe-neon / www.tribe-neon.com|本番ktpolnkyyfkowxdmijww、preview sufvuqdnqohpfzkwxohqは既知保護対象|本作業で更新・配信なし|GAME03設定変更なし|
|GAME04開発|game04 / prj_vV06TC8bU3TEFRpNXFNdONiZmULE、G1固定Previewは参照履歴|lrgyllgzcdcphlbmkknc / game04-dev-clean / eu-central-1、storage0|G2 SHA7476566、主API v21、補助resolve-battle v2、migration最新20260924125412|G2作業環境は変更なし|
|GAME04既存Production・保全対象|game04-gray.vercel.app / game04-8qmsr2wmx-kiyoshi-kitamura.vercel.app / dpl_bTDf5APqABYyVA5eSk1QhfWTTeFN|サーバー設定・実データ接続先は今回未確認。DBなしと断定しない|main a83a94adf1c83ecfdaf439d67a6d74aa93206344、9/16 Readyを管理画面確認|Vercel認証保護なし。main push自動配信あり。今回切替/設定変更なし|
|GAME04新本番受け皿|game04-production-receiver / prj_sFLd5kZeu7pjveQIkeL88ShfN8i8 / team_ounFOJd7sfCvcytYCkExbj77|DB/API未接続、素材未配置|空project、配信なし、Git未接続|未承認ゲームなし。保護設定保存と全URL実測は未完|
|GAME04本番DB提案|game04-prod（まだ名称案）|既存組織mvkvwqhvpoxpvxbumfjk、ap-northeast-1、Micro|費用承認待ち、ref/API/bucket/適用版なし|未作成。既存資源の転用なし|

API v21 hash: d3599cf9bfede3850553f143bd9df830ab99fc92a19cab1309fcba1f56b5eae0。URL固定はDB/API固定を意味しない。上表の既存Productionを非公開化したとは報告しない。

## 検証・保存・障害

receiver HTTP test: 1件/0失敗。GET/POST/HEAD/OPTIONSでroot、checkout、webhook、Edge様path、QA、asset、未知経路を503確認。healthは未設定/不正/短いtoken拒否、正tokenのみ200、レスポンスにDB未接続を明示。
独立担当も再実行PASS。正tokenでも非health拒否、PUT/DELETE/PATCH拒否、末尾slash/encoded path/偽headerで昇格しないことを追加確認。
Vercel rewrite後にreq.urlがhealth pathを保持するかはクラウド未確認。保持しない場合は安全側503になる。専用health handlerへ分離する案は未適用。配信時にこの一点を必須確認する。

検証後、exec-serverが409 environment_offlineになり、browserも応答停止。追加コード変更・保護保存・アップロード・復旧試験は実行不能。既存GitHub接続でコード/記録を保存。通常cloneは取得できたが本体全体のnpm run checkは未実施。本体変更なし、receiver依存ゼロの限定試験に限る。
Vercel管理コネクタは既存/新projectとも404。管理画面では実在確認できたため不存在とは解釈しない。CLI tokenなし。権限迂回や新しい認証情報抽出は行わない。

## 判断と残作業の集約

1. **追加費用**: Supabase既存Pro組織にgame04-prod / 東京 / Microを新設、compute約US$10/月追加（利用超過別）。既存game04-dev-cleanの転用/開発DB丸ごとcloneはしない。承認後に新規作成・確定基盤適用・Storage分離・非公開API疎通・復旧試験を進める。
2. **外部設定**: P01の正式domain、P03のGoogle/SMTP送信元、P02のStripe利用主体/本番商品/専用Webhook、P04問い合わせ先は担当契約確定待ち。値を仮作成しない。既存GAME03秘密値は無条件コピーしない。
3. **実行環境復旧後の担当作業**: 作成済みprojectの再読→保護設定保存→隔離receiver配信→不変URL/alias全体の未認証拒否と認証health確認。新project再作成不要。ユーザーに個別チェック操作を中継依頼しない。
4. **G5までの必須準備**: 本番refのコード許可表、server停止制御、P02 live契約、監視・backup保管/復旧確認、移行master allowlistと差分manifest。既存共有guardを削って無理に接続しない。

新規有料契約/プラン変更/ドメイン購入/実金銭決済/本番ゲーム移行/mainマージ/公開はなし。今回作成したVercel空projectで有料保護オプションは採用していない。
