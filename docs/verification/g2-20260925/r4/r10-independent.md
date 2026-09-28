# R10 限定変更の独立確認 — R4

2026-09-25。基準 PR30 / `20c5cde5`。実装担当とは別の子担当が、R09計測・R08観測・法務ドメインの変更経路を確認した。全画面再監査・本体コード編集・DB書込み・配信は行っていない。最終SHAと実接続結果は親の統合記録に対応づける。

## 結論

限定コードレビューと下記ローカル試験はPASS。検出した復帰ack応答形式、観測request競合、CTA観測のクリック前誤記録を担当へ差し戻し、修正後のソースを再確認した。**実Previewの操作・管理者HTTP・開発DB集計・実機表示の合格を、この記録だけでは判定しない。**

|ID|検出内容|修正・再確認|
|---|---|---|
|IR01|復帰ack APIは`{observation}`、ゲーム共通parserはstate/rooms必須のため成功応答も例外になった|`observeRedesignRestore`専用helperへ分離。観測成功true、version不一致false、通常ゲーム応答false、通信エラーfalseの4ケースを独立実行しPASS。本体setDataへ観測結果を渡さない|
|IR02|観測の同requestId競合で`ON CONFLICT DO NOTHING`後に未保存の入力versionをackし得た|insert後に保存versionを再読し、不一致を`REQUEST_ID_REUSED`として拒否。ソース確認。実同時競合試験は本担当では未実施|
|IR03|pointerdownから2frameでready判定し、pointerup/clickより前の元々有効なCTAを記録し得た|開始時計はpointerdown/keydown、ready判定はclick到達後の2frame成立へ分離。clickのないscroll等は60秒timeoutと明記。ソース再確認。実ブラウザ観測は親へ|

## 確認範囲

- **計測receipt**：成功した状態変更のcommit内で生成。projectionはaction/version/資源差分、raidは新規受取の自分のgrant・報酬kind/id/数量のみ。ユーザー名・email・bio・入力payloadを投影しない。raid同一grantの重複集計はuser/room/grantのキーで除外。空の過去receiptを新計測済みに見せるbackfillなし。
- **数量の意味**：raid grantの各rewardを記録し、kind/idごとのquantityとgrant_countを集計。複数種類の報酬行に同じgrantが現れるため、行をまたぐgrant_countを合算不可とAPI・管理画面に明記。実receiptとDB数量の一致は親のSQL/実API証拠を参照する。
- **復帰観測**：API認証ユーザーIDでのみ観測RPCを呼び、payloadからuserIdを採用しない。Reactで受信した状態versionとDBversion一致時にack。ゲーム状態更新・外部認証成功・別端末復帰とは区別。観測失敗でゲームを停止せず、自動retryループなし。
- **権限と環境**：管理者page/API双方が既存ProxyのBasic認証対象。未設定503、認証なし/不正401、正しい試験資格情報で通過。service roleはserverのみ。RPC/tableはanon/authenticated/publicから権限剥奪、service_role限定、観測tableはRLS有効。GAME04開発origin検査を維持。実HTTP成功とDB権限確認は親の結果へ。
- **QA除外**：included/excluded/unmappedを分離しイベント時刻の除外期間を参照。流入は最初の結合だけを利用し重複journeyによる行動数増幅を防止。qa_v1は流入集計でexcluded。転換率と断定しない。
- **操作可能観測**：対象CTAの可視・非disabled/inert/busy・中央hit-test成立を2frameで観測。全画面TTIや保存receipt成功とは区別。遷移先固有CTAを使用する条件、navigationの手動TAP待ち込み、API/画像待ちは並行して単純加算不可と明記。性能目標D04は未承認のまま。
- **通常画面/Production**：probeはQA iframe外の専用領域のみ。既存build/serverのProduction QA無効化を試験。通常画面の表示変更はドメイン文字追加の範囲。
- **ドメイン**：`sengoku-hime-ennbu.com`をserviceDomainへ設定。serviceUrl/supportEmailはnullを保持し、未稼働HTTPSリンク・メールアドレスを生成しない。P02〜P04/P06の接続条件は`r08-domain.md`に分離。

## 独立実行した試験

|試験|結果・限界|
|---|---|
|`node scripts/verify_game04_g2_kpi.cjs`|PASS。receipt projection、対象grant限定、再受取空、Proxy matcherと認証分岐。DB/配信HTTPの代替ではない|
|`node scripts/verify_g2_qa_timing.cjs`|PASS。Production/no-send、PII非投影、source/origin、件数上限、navigation区別。追加probeの実ブラウザ検証とは別|
|`node scripts/verify_g2_legal_return_links.cjs`|PASS。7法務ページsettings/directと問い合わせ戻り先。実メール稼働は未確認|
|専用restore helperをtranspileしてinvoke応答4種を注入|PASS。ack成功、version_changed、通常state形式、通信errorの判別。関数単体試験|

## レビュー対象の内容識別

|ファイル|SHA256|
|---|---|
|`src/domain/redesign/gameplayMeasurement.ts`|`b163f799713ee7259659fddda03325281d8a730b2098c562aab13fee725c9a88`|
|`src/utils/redesignRestoreObservation.ts`|`f20e0e5fb76535e30911f9a1dee51dde2b2131fa78e1cb08e1e4b6e9f7ca1ced`|
|`supabase/functions/game04-redesign-api/source.ts`|`452ca3d2f95a4c3b834d7d4e1eb0d724db43db2ac1bedd6a2d4ef0966745f487`|
|`supabase/manual/game04_g2_kpi_observations.sql`|`ffba03eaa46b709a55c523c02bee0871dd263e37809b1b0318f041a40792638b`|
|`src/app/qa/home-live-viewport/InteractionProbe.tsx`|`4a7caccba34f8f688cf69dac7e0fc6052c591b3326b63bf18490431aee9c5578`|
|`src/app/api/admin/kpi/v2/gameplay/route.ts`|`bbba1c4bd3119bf1867578dfa6daaf245aaa7316b536fd7c686c39fdaf79c066`|
|`src/app/legal/legalConfig.ts`|`b1c88ebc79748410a011c92a83325e3f01b80cb65c2acf3c922f5d411b59137d`|

API生成bundleと配信版は親がsourceから再生成・対応確認する。保存時に後続差分があれば、その変更経路だけ追加照合する。未確認の必須実接続・性能測定をローカルPASSへ置換しない。

## 追加確認：R01で発見した任務履歴の不要保存

R01担当の実API検証で、変更のないget_stateでもversionが増加する問題を検出。`captureMissionAssets`の装備履歴再作成時に、PostgreSQL jsonbのキー順と異なる順へ変わり、JSON文字列比較が変更とみなした。`src/domain/redesign/missionProgress.ts`は既存装備履歴をspreadした上でmasterId/到達level/lbを書き込み、キー順と到達最大値を保持するよう限定修正された。

- 独立実行：`node scripts/verify_g2_r4_mission_read_stability.cjs` PASS。
- 追加の独立入力で、`{lb,level,masterId}`のキー順維持、原状態非破壊、現在値が低下しても過去level/LB最大値維持、実際のlevel/LB増分は反映、反復captureが同じJSONとなることを確認しPASS。
- 確認ソースSHA256：`85160da32559a7a64bf6c5aad1e88608f96f022384432aecd85a11d11f5b7b91`。
- 任務条件・数値・日次仕様の変更ではない。API再配信後、実get_state反復時のversion安定は親・R01担当の実API結果で確認する。


## 最終SQL是正の追加照合

親の実SQLで検出した42702に対する修正後の `game04_g2_kpi_observations.sql` を再読。PL/pgSQL変数を `aggregate_result` へ変更し、factsのrequests列 `q.result` ほか参照をaliasで限定した。grant数量・重複排除・QA分類・権限のロジックは維持される。確認SHA256：`ddd3f1e7b16e9f5f09b356561b9d6f7ffbeb4ef41b159e6f9a106d3e4b15c231`（上表の初回review hashより後続）。実適用は `20260925003959 game04_g2_kpi_detail_qualified_columns`、親実行rollback ASSERT成功と実grant1件/6報酬数量一致は `r09.md` / `r09-live-sql.json` を参照。管理者HTTP503のため、配信認証HTTP/管理画面の受入を完了扱いにしない。
