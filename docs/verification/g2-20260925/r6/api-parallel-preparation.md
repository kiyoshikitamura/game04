# R6 API読取準備の並列化（v26後の追加差分）

## 根拠

v26の通常保存はauth→profile→prior request→acquisition input→session state→commit→responseを直列に実行。profile、再送確認、acquisition inputは認証済み同一user IDの独立読取である。acquisition inputは保存済みSQL上LANGUAGE SQL STABLEで、legacy snapshot／acquisition events／変換masterを返す。ここだけ並列化し、最大2段のDB HTTP往復をcritical pathから除く。

API総待機が長い原因をこの箇所だけと断定しない。サーバー各段の実測は未取得で、改善量は同条件の配信後測定で評価する。

## 変更と安全境界

- 認証・request ID検証後、profile／prior request／acquisition inputをPromise.all。
- profile存在とprior確認が完了するまで、session初期化・ログボ・成長・保存を実行しない。
- 通常新規操作は同requestで取得したacquisition inputをstateForに渡す。stateFor省略引数の既存呼出し・CAS retry・状態同期処理は維持。グローバルcacheを追加しない。
- 再送は投機取得結果（失敗を含む）を使用せず、従来responseForのfresh読込経路を維持。通常操作の取得失敗は更新前に拒否する。
- get_state、raid_refresh、observe_state_restore、normal_gacha_status、戦闘2種、開催2種は先行読取対象外。既存経路を維持。
- rooms射影、DB SQL、権限、計算式、在庫、receipt、commitロックは変更なし。

## 限定検証

`node scripts/verify_g2_r6_parallel_read.cjs` PASS。実際のsource.ts handler全体を制御したHTTP応答で実行する試験。ライブAPI合格とは区別する。

- 3読取が全部開始するまで応答を保留しても完了（並列化を検証）。新規保存acquisition読取1回、commit1回、commit後state返却。
- 同request再送：最初の投機acquisitionが失敗しても従来fresh response読込が成功すれば保存済みreceipt返却、mutation commit0。
- profileなし409／acquisition読取失敗503はsession初期化・commit0。
- CAS競合409を維持、勝手な再送保存を追加しない。
- get_stateはprior読取なし、従来acquisition1回。認証失敗はDB呼出しなし。

API bundle生成・開発配信・実測・Git保存は親が一元管理する。
