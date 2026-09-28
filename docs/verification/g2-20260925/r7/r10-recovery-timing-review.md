# R10 追加独立確認：戦闘計測・復帰証拠の範囲

対象コード `b41d35b7d6639df700be22a6087726b4eccdf6bc`。計測変更の実装者とは別担当が3ファイルを確認。R05/R06のQA adapterは本担当実装なので、その独立性は別担当の `ssr-admin-review.md` に依拠する。本書は計測3ファイルの独立レビューと既存証拠の対応整理であり、全画面監査・QAデータ変更を行っていない。

## 計測3ファイル

判定：既存の戦闘・保存・画像復帰挙動を壊す変更は検出しなかった。`node scripts/verify_g2_qa_timing.cjs` を独立実行しPASS（送信gate、投影、source/origin、件数、画像count/outcome、Production build/server gate）。実性能の合否は別の親の反復測定記録へ委ねる。

- `BattleView`：戦闘resultごとの初回必須画像グループ計測と`data-playback-frame`追加のみ。キャッシュ確認、画像Promise、ready/error更新、retry依存、12秒timeout、現在result限定の終了ガード、同result二重終了ガードは維持。`onComplete`やAPI mutationを追加していない。
- `InteractionProbe`：名称「戦闘再生開始」の場合だけ、実戦闘section・非停止・frame存在・開いたdialog無し・可視/hit-test成立をclick後2描画frameで観測する。通常CTA分岐は維持。戦闘アニメーション全編の検証ではなく、再生可能状態が表示された開始点の観測。frame 0も開始として数える。
- `redesignQaTelemetry`：画像scopeへ`battle`を追加。認証情報・画像URL・request payload・所持情報は送らない。送信先は同origin親iframe。既存QA gateとorigin/source検査を維持。

画像計測の限界：同resultの**初回**グループだけであり、後続Waveや同result画像retryの所要時間を網羅しない。途中cancelされた試行に完了値がない場合は未計測であり、0ms成功と扱わない。API/画像区間は並行しうるため合算不可。これらは記録の解釈であり、本体故障ではない。

|ファイル|確認SHA256|
|---|---|
|BattleView.tsx|`e71493914ea594ddc93485c9aec3f2dc93dd8a95aa25dac85195e7b200bff904`|
|InteractionProbe.tsx|`6a6e2c1d024aae3c8ba0a91bb5941d18af25d44d6952ba911dca49d70433dd0b`|
|redesignQaTelemetry.ts|`ac164c267ab1e34ad10ff88072f9606c6a25779608e6c5d20301ee88dde2fab6`|

## 版対応

- R05/R06の今回実DOM原本は **61e5af88** / `https://game04-j6r08aejw-kiyoshi-kitamura.vercel.app` / `dpl_D1t7M1idVxLJ6PviDQViWMJHRsyz`。read試験は親が同deploymentと照合したbranch aliasの既存QAログインを使用。
- その後の **b41d35b7** は上記計測3ファイルのみ。`HomeView`、`InboxPanel`、`QuestView`、`RedesignApp`、`battleAssetPreload`、再生hookに差分なし。R05/R06の機能結果は回帰範囲を限定して維持できるが、61e5af88の実画面をb41d35b7配信済み・性能合格の証拠にはしない。
- 失敗した8bedb7のQAサーバーエラーは、61e5af88でQA fixtureの敵初期SP補完後に解消確認済み。旧エラーを本体の未修正残件に重複計上しない。
- API/DBの既存証拠は各記録の実行版に限定。最新共有APIの並列read・rooms読取変更は別担当の `api-recovery.md` / `rooms-independent-review.md` が範囲と非変更契約を確認している。旧v24/v25の実HTTP証拠を新API全体の再実行証拠に置換しない。

## 完了を維持する範囲と残る限定受入

|区分|維持する完了・根拠|本当に残るもの|
|---|---|---|
|R05 read復帰|R4本体effect＋SDK＋HTTPの一覧保持/後着抑止/再試行。R7実DOMのnews/activity503・timeoutエラー表示/12秒Abort/再試行、補助profile待ち分離|対象readの**非空**確定一覧を持った状態で故障させ、一覧保持を実DOMで確認。QAのお知らせ0件、別socialEvents表示を代替証拠にしない|
|R06画像復帰|R7非VIPの実BattleViewでHTTP503/timeout→retry成功、永続失敗→終了操作成功。共通callbackは現在resultだけ・一度だけ。UI障害表示は未実装ではない|保存済み**実戦**で画像失敗→通常出陣結果／共闘へ復帰し、同戦闘receipt・残高が不変という組合せの限定受入|
|R06 started再開・再送|R4 `3353d3b1-a50a-463e-9aa8-c1e713da1bc6`、実認証API再開→settled、同ID再送battle完全一致、pending0、energy99、開始/確定receipt各1。input元から巻戻し無し|この完了を未実装へ戻さない。敗北報酬0の試験なので、画像故障を含む勝利報酬の確認に拡張しない|
|R03共闘/侵攻の再送・報酬|R4共闘4勝後の初戦同ID再送で開始HP39000とbattle不変、追加消費なし。6報酬grant1件の受取同ID再送不変。侵攻同ID再送のstate/battle一致。R5新算入式の再送・DB一致|既存受取・資格・snapshotを再監査しない。画像故障後の画面復帰と同receipt照合だけがR06との未接続部分|

### 既存UI接続の再確認

- 通常出陣は`QuestView`の保存済み`settlement`を保持し、`onComplete`で`playing=false`へ戻る。新規戦闘・報酬付与の呼び出しではない。
- 共闘/侵攻・pending再開は`RedesignApp`が戦闘表示を解除してread refreshする。画像終了callbackからbattle mutationを再送しない。
- pendingの「戦闘を再開」は保存`pendingBattle.id`をrequestIdに使い、元targetを渡す別操作。画像retryはこれを呼ばず、必須画像だけを再ロードする。

自然通信切断を毎経路で再現する全量試験へ拡張しない。既存の保存再開・同ID再送の完了を維持し、残る実戦画像復帰との組合せを限定して扱う。
