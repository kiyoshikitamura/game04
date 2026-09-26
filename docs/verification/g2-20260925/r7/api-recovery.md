# G2 継続: 保存API並列読取差分の回収

基準: `af640e291d3e79e511833dcef1e16f0ff7528b94`。旧作業ディレクトリに残る source.ts と比較し、認証後の独立読取並列化のみ回収した。配信・DB変更はこの作業では実施していない。稼働APIとの対応は親の取得済み実bundleと照合する。

## 実装と安全性

- `stateFor` は任意の取得済み acquisition input を受け取り、省略時は従来どおり取得する。新規保存で取得を重複しない。
- 認証と request ID 検証後、profile / prior request / acquisition input の読み取りのみ並列開始。
- profile存在・prior request確認前にsession初期化、ログボ、状態同期、commitを開始しない。
- 保存済みrequestは従来のfresh response経路を通す。投機acquisition失敗をその再送結果へ混入しない。
- 新規requestでprior/acquisition読み取り失敗は更新前に拒否。CAS、commit RPC、認証、DB権限、保存payload、ルール数値は不変。
- `get_state` / `raid_refresh` / `normal_gacha_status` / `observe_state_restore` / battle 2種 / host 2種はこの先行読取対象外。
- 保存済みmigrationの `game04_acquisition_input` は SQL STABLE、legacy/events/master取得。旧独立記録にも実DB定義照合あり。今回DBへの更新はなし。

回収時 source SHA256: `b1b454673b4d07a24c7af866a6702d96b9d502b000c38b55394370a36f071996`。これはsource単体であり配信bundle hashではない。

## 限定検証

`node scripts/verify_g2_r6_parallel_read.cjs` PASS（依存は旧作業のnode_modulesを NODE_PATH で参照）。実source全体をtranspileし制御したHTTP応答で実handlerを実行。

- 3読取が全部開始するまで応答を保留しても完了。新規保存はacquisition1回・commit1回、commitの返却stateを応答。
- 再送の投機読取失敗→fresh読取成功で旧receiptを返す。mutation commitなし。
- profileなし、prior lookup失敗、acquisition失敗でsession初期化・commitなし。
- 不正request IDはDB読取前に拒否。認証失敗はDB呼出しなし。
- CAS競合は409、read経路はprior検索なし。

HTTP mockであり、ライブ受入・DB競合実験・性能合格の証拠ではない。

## 測定の継承と次の対象

旧 `r6/browser-comparison.md` の版はv25→v26、after `af640e29`。本差分・v28の性能として流用しない。

- 保存CTA: after中央値1788.90ms、p95 2098.2ms、最大2381.3ms。20/20が1.5秒超。未達。
- 保存API: after中央値1752.30ms、p95 2062ms。画像待ちは新規グループ未検出。主な待ちはAPI。
- warm 2方向は対象CTA 20/20が1秒以内。主要情報の正当性・最新取得完了を含む受入は未測定。
- 旧HTTP python経路は8秒前後とブラウザ経路が大きく異なるため混ぜない。

並列化で最大2段のDB HTTP往復をcritical pathから除くが、改善量は未測定。最新bundle版を固定し同じQA/ブラウザ/操作起点で保存20回を測定、結果と次操作が可能な時点で判定する。1.5秒例外は自動適用しない。cold独立5回、戦闘開始20回、受取/交換ごとの20回、iPhone Safari実機は別対象。更なるDB統合やauth省略は本差分に含めない。
