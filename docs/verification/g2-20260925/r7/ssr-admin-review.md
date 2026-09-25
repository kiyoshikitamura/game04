# G2 継続 SSR背景・R09 独立限定確認

確認日: 2026-09-25。開発DB `lrgyllgzcdcphlbmkknc`。SSR実装基準 `af640e291d3e79e511833dcef1e16f0ff7528b94`。本担当はSELECT・実HTTP GET・既存ローカル試験のみ。DB更新、認証設定、API配信、QA分類変更は実施していない。

## SSR背景の既存受入を継承

`r6/ssr-api.json` / `ssr-db.json` / `ssr-save-review.md` のv26証拠を読み合わせた。

|対象|判定・根拠|
|---|---|
|既所持SSR反映|初回readで謙信のみ解放、v3→4。二度目readはv4で同状態|
|未解放選択拒否|伊達未所持時の選択は400。payloadの偽解放配列も採用しない|
|正規魂解放|伊達魂80→0、所持1・解放追加。謙信の選択を維持|
|重複・再送|同request再送はv6/所持/魂/解放不変。別ID重複解放は400|
|選択保存・API復帰|伊達選択v7後のget_state、Auth refresh_token後とも同選択・解放2点|
|ブラウザlogout→login|未実施。refresh_tokenをこの証拠へ読み替えない|
|G3実ガチャ/SSR交換入手|G3担当。共通同期hookの受入と区別|

現作業ツリーの `src/domain/redesign/home.ts` は上記基準から差分なし。`node scripts/verify_game04_g2_r6_home_unlocks.cjs` を再実行しPASS（10対応、初回・既所持・魂のみ未解放、重複・永続集合、選択保持、旧背景互換）。これはローカルドメイン契約試験であり最新ライブAPIの全再受入ではない。

06:08 UTC頃のDB SELECTで専用QA-Bは引き続きversion7、`unlockedHomeBackgroundIds=[ssr:char_koharu_01,ssr:char_leo_01]`、`homeBackgroundId=ssr:char_leo_01`。追加fixtureやログイン操作なし。v26のAPI試験をv28以降の実施記録に変更していない。

## R09 管理者HTTP

親がGitHub Vercel statusで確認したaf640e2の不変Preview:
`https://game04-89wfoohev-kiyoshi-kitamura.vercel.app`

実HTTP GET（Python urllib HTTPS、人工回線制限なし）で次を確認。

|URL path|Authorization|HTTP|応答|
|---|---|---|---|
|`/admin/kpi/game04`|なし|503|KPI authentication is not configured|
|`/admin/kpi/game04`|意図的誤Basic|503|同上|
|`/api/admin/kpi/v2/gameplay?from=2026-09-25&to=2026-09-25`|なし|503|同上|
|同API|意図的誤Basic|503|同上|

管理者認証はこの配信で未設定。`KPI_BASIC_AUTH_USER` / `KPI_BASIC_AUTH_PASSWORD` 設定と利用可能な承認済み資格情報が外部依存。200/401・管理UI表示数量の実HTTP受入は未完了。設定なし503を権限認証成功とは扱わない。ローカル `verify_game04_g2_kpi.cjs` はPASS（設定なし503、誤/未認証401、正しい試験認証継続、matcher、grant数量/再送除外）。

## R09 DB数量・権限のread-only再確認

06:02:49 UTC、`game04_kpi_receipt_detail('2026-09-24T15:00:00Z','2026-09-25T15:00:00Z')` をSELECT。JST 9/25の既存受取は全行excluded、各行user_count=1 / grant_count=1 / reward_line_count=1。

|報酬kind|ID|数量|
|---|---|---:|
|cash|なし|5000|
|character_exp_item|large|1|
|equipment_exp_item|large|1|
|equipment_lb|なし|2|
|skill_material|なし|2|
|soul|char_noa_01|1|

R4保存済み実受取数量と一致。6報酬行を6grantとは数えない。restore ACKはexcluded 4件/2userで後続QAを含む。これは管理UI表示との照合完了ではない。

`has_function_privilege` の結果: anon→詳細RPC=false、authenticated→ACK RPC=false、service_role→詳細RPC=true。R4直接REST権限証拠も保持。今回権限変更なし。

## 旧計測分類の根拠と残件

`r4/r09-classification-scope.md` の旧180はbattle行数であり人数ではない。旧集合全IDが残っていないため現集合と同一とは断定しない。既存docs完全一致検索で当時included側30userにQA記録一致0という既存調査結果を保持する。これは通常利用者である証明ではない。

今回の保存battle SELECT（開始時点の `kpi_is_subject_excluded`、subject未結合はunmapped）:

|分類|battle行数|user数|
|---|---:|---:|
|excluded|24|5|
|included|186|31|
|unmapped|0|0|

合計210行。前回204行からの後続増分を含む。分類を変更していない。JST当日included/web_v1は開始8件/6user、saved_action9件/3user。web_v1は流入sourceであり一般利用者認定ではない。追加userを含む元のQA作成根拠は未確認で、旧included全体の正常/QA判定は未完了。元の運用証拠が得られた対象のみ親が時点を照合する。全ユーザー監査へ範囲を広げていない。

## 残件

- SSRブラウザのログアウト→ログイン後の選択/解放復帰。API refreshの既存PASSは維持。
- 管理者認証設定後の実HTTP200/401・同期間UI数量照合。
- 旧includedの元QA作成記録との根拠照合。根拠のない一括分類はしない。
- 親が新配信を作成した場合、このaf640e2 PreviewのHTTP結果を新配信の証拠に流用しない。

## 追加: R05/R06 QA adapter 独立コード確認

対象は `src/app/qa/recovery-live/{page.tsx,RecoveryLive.tsx}` と `src/app/api/qa/recovery-image/route.ts` の3点。

- ページ/APIともQA有効化フラグ必須。APP_ENVまたはVERCEL_ENVがproductionなら拒否。Preview/開発専用でProduction許可を追加していない。
- fetch差替はnews GET / get_recent_social_activity_feed POST / get_public_profiles POSTの正確なpathnameとmethodに限定。その他は元fetchへ渡すため認証・保存・戦闘POSTを改変しない。unmountで元fetchへ復元する。
- 画像APIは一時cookieを読み取るだけでゲームDB・認証・保存を変更しない。fixtureのsimulateBattle結果にonCompleteローカル回数更新を結び、報酬保存を呼ばない。画面上もfixtureと実本体を区別する。
- 指摘: timeout選択肢の「本体12秒中断」はprofilesには正確でない。HomeViewの補助プロフィール読取はAbortSignalなしでfeed描画をブロックしない。担当へラベル修正を依頼した。
- `timeout-once` は15秒後のHTTP応答でcookieがpassになるため、アプリのtimeout表示直後の即時再試行時点ではまだcookieが切り替わっていない場合がある。試験時にHTTP応答完了を区別する。これはfixture側の条件であり本体性能合格の証明ではない。

この確認はコードレビューであり、Preview上のR05/R06実ブラウザ受入結果は担当の別記録を参照する。

## 追加: live v28基準の並列読取候補 独立確認

対象 `shared-api/live-v28-original.ts.txt` → TypeScript printerによる独立再整形 → `shared-api/live-v28-parallel.ts.txt`。06:09 UTC頃実施。

- 原本を独立に再整形し、`ts.forEachChild`によるAST構造/identifier/literal比較（printer挿入括弧を除外）は同一=true。
- 独立再整形から候補へのdiffは保存patchと同じ4hunkのみ。ドメイン/G3抽選・commit_gacha部を変更していない。
- 第1hunk: stateFor相当Feへ取得済みacquisition inputの任意引数追加。省略時の旧取得・CAS同期ループは保持。
- 第2hunk: Auth user検証とrequest ID検証後にprofile/prior/acquisitionの読取だけ並列化。G3 aliasを解決後にread/status/battle/host等を除外。profile/prior判定前にstate初期化・commitを開始しない。
- 第3hunk: priorを並列読取結果へ置換。G3保存済みrequestのoperation/payload照合と競合応答は変更なし。
- 第4hunk: 再送経路が完了した後だけ先行acquisition失敗をthrow、新規操作のstateForへ取得済みinputを渡す。再送は従来fresh read経路で返り、投機読取失敗が保存済みreceiptを壊さない。
- `G2_API_BUNDLE=1 G2_G3_CONTRACT=1 G2_API_SOURCE=docs/verification/g2-20260925/r7/shared-api/live-v28-parallel.ts.txt node scripts/verify_g2_r6_parallel_read.cjs` を独立実行しPASS。通常保存・再送・認証/ID/profile/prior/acquisition失敗・CAS409・G3 status/payload照合を確認。

候補SHA256 `fa790b4948dbdb8902bbd40342c84fe798b0ad597b12fe8952b7e014b6a961c8`。このhashの候補にコードレビュー上の阻害事項なし。mockは実bundleのAPI層を使用しドメインをdoubleに置換する限定試験であり、live DB・性能・抽選全受入の証拠ではない。配信直前live更新確認と配信後の版/hash確認・測定は親担当。

## 追加改善の限定調査・未実装提案

親よりv29保存再測定median約1.55秒で基準未達との共有を受け、live v28+最小patchのresponseFor/roomsFor相当だけ調査。

稼働DB定義をSELECT確認: `game04_raid_rooms_for_user` はSQL STABLE SECURITY INVOKER。`game04_territory_context` はPL/pgSQL VOLATILEで、`game04_territory_progress` 初期INSERTを含む。後者をread-only統合RPCへ無条件に含めたりstatePromiseより先へ移したりしない。

提案はroomsForの2段（rooms RPC→owner profile/player state並列SELECT）を1段にするservice_role専用STABLE RPCの追加。既存rooms RPCの結果をWITH ORDINALITY展開しusers/player stateへLEFT JOIN、state/versionとowner username/leader characterIdのみ返す。元の配列順序、欠損fallback、JS側characterArtと期限判定を保持する。既存RPC・認証・prior/CAS・commit・territoryを変更しない。

効果は保存後responseのHTTP直列1往復削減。0.1〜0.3秒程度の改善余地は推測であり未測定。1秒/1.5秒達成を保証しない。実装判断は親へ提出済み。実装する場合は旧/新投影同値（空・owner欠損含む）、service_role限定権限、保存/再送、実20回で判定する。この調査時点ではSQL候補作成・DB適用・API修正は行っていない。
