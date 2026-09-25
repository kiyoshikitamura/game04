# R6 クライアント性能・測定経路

## 実測済みの原因（R4再利用）

`r4/r08-additional-summary.json` のsave_deck3回：

|ケース|操作開始→対象CTA観測ms|API待機ms|差分ms|
|---|---:|---:|---:|
|保存1|3394.6|3364.2|30.4|
|保存2|2310.5|2279.2|31.3|
|保存3|2510.7|2478.9|31.8|

保存は約99%がAPI待機。今回の1秒基準（難しい対象の改善後例外1.5秒）を既存結果は満たさない。別途親担当のAPI改善と同条件前後測定が必要。画面遷移はsetTabを先に実行し、get_state完了を待つ固定ウェイトは存在しない。R4warm2秒値はpointerdown→clickを含む2描画frame観測上限なので、API時刻だけで原因断定しない。

## 対象限定の変更

- `RedesignApp`：正式状態が同じ間のbuildBattleParty結果をmemo化。毎秒の本陣残時間更新、busy切替、タブ変更で同じpartyを再構築しない。状態応答更新時には再計算する。初期5人fixtureのローカル計算1000回10.51msに留まり、保存秒単位改善の根拠とはしない。
- QA専用計測にaction-feedback/action-resultを追加。操作ハンドラ開始からbusy DOM commit、応答後のbusy解除/state DOM commitを別計測。これらはDOM反映であり、画面のpaintや対象CTA受入の代わりにしない。payload/所持数/user IDは送らない。Production無効条件を維持。
- QA CTA計測は従来のpointerdown起点を保持し、click時刻とclick→readyを追加して自動操作の入力保持時間を分離。対象CTA名を行に保持し、名称変更で過去試料を消さず120行保存。API/画像/commit計測は200行へ拡張。20回の交互操作を保存できる。
- リクエストロック、世代照合、再送ID、API再取得、残高・画面loaderは維持。古い残高を新たな確定情報として置き換える変更はしない。

## 検証・実測手順

- `npx tsc --noEmit --pretty false` PASS（本担当変更完了時）。
- `node scripts/verify_g2_qa_timing.cjs` PASS：送信ゲート、origin/source検証、機微情報投影除外、200件上限、navigation履歴分離、新2種のmetric受信。
- Vercel React Best Practicesに沿ってhook順序・所有者変更・memo依存・機微情報非送信を確認。
- before/after候補：同一QA所持でsave_deck（おまかせ装備）各20回、本陣→武将（到着固有CTA）と逆方向各20回、同一出陣ステージの詳細CTA各20回。保存結果Dialogはその固有CTAを指定。対象CTA以外の既存ボタンをready対象にしない。
- 保存/戦闘成功はrequest成功・action-result成功とその結果CTA readyを照合。action-feedback commitは100ms反応の補助値で、実表示反応はブラウザ観測と合わせる。
- cold独立5回、戦闘開始20回、iPhone SafariのWi-Fi/4G・5Gは親統合記録へ追跡。ローカル・代替ブラウザ測定で実機合格を代替しない。
