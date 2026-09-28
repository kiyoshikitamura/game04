# G2再開 Q01/U10 ローディング是正

2026-09-24 UTC。前回LOADING_MEASUREMENTS.md、agent-f.mdを継承。G1全件再調査なし。DB/API配信は親担当。

## 実装修正

|ID|対象|原因と変更|検証状態|
|---|---|---|---|
|RL01|GameContext bootstrap|`sync_and_recover_vitality_and_pvp_points`の後に無関係な`user_monthly_passes`を直列待機し、その後で回復済み残高とプロフィールを投影していた。月額状態のreadを回復/profile読取と並列開始し、bootstrap末尾で合流。別UIDへ遷移した場合の月額状態投影を抑止。期限切れ課金資産同期は従来通り先に完了させる。|型検証PASS、統合Preview時間差は未計測|
|RL02|redesignRequest|API期間の内訳が取得できず、操作ツール応答時間を代用していた。開始から検証済み応答またはエラーまでをPerformance同一time originで記録。|型検証・100件上限・success/error・記録項目・SSR no-op確認PASS、配信後ログ確認は独立担当へ依頼|

変更ファイル:
- `src/app/context/GameContext.tsx`（月額readの限定箇所）
- `src/utils/redesignApi.ts`（既存呼出の計測wrapperのみ）
- `src/utils/redesignPerformance.ts`（ブラウザ内diagnostics）

回復値・権利・価格・報酬・再送ID・mutation lockを変更していない。API応答の検証が完了してからsuccessを記録し、エラーを成功に数えない。月額取得が遅くても、取得済みの別データ投影を待たせない。月額自身は応答まで確定表示を更新しない。

## 計測の取得方法と制限

`window.__GAME04_REQUEST_METRICS__`は最新100件。action、startedAt、settledAt、durationMs、outcomeのみ。UID、requestId、payload、残高、tokenを記録せず外部送信もしない。

`NEXT_PUBLIC_ENABLE_QA_TOOLS=true`かつ`NEXT_PUBLIC_APP_ENV !== production`のbuildだけ、`[GAME04 request timing]`のconsoleへ同じ記録とNavigation Timing（responseStart/responseEnd/domContentLoaded）、Paint Timing（name/startTime）を出す。一般ユーザー画面には追加説明や診断パネルを出さない。

管理ブラウザの正式read-only evaluateでは`typeof performance === undefined`を確認。そのためconsole記録を正式`tab.dev.logs({filter:'[GAME04 request timing]', levels:['info'], limit:30})`で取得する経路を用意した。隠れたCDP/別ブラウザ導入はしない。配信後の取得は独立検証担当へ引継いだ。

API durationはSupabaseクライアントの認証・transport・body parse・応答検証を含む。サーバー実行時間、画像decode時間、入力可能時刻（TTI）とは異なる。Paint Timingも操作可能時間ではない。既存`__TRIBE_HOME_RELOAD_METRICS__`、`__TRIBE_ASSET_METRICS__`は保持するが、今回の変更だけで全対象の画像待ち/TTI分離が完成したとは判定しない。

## 前回測定・必須残件

- warm出陣2034→2030ms、任務2046→2052msは操作ツール応答時間込み。改善立証なしを維持。
- cold/warmup出陣9853msは未解消扱い。今回月額read直列解除だけをこの遅延の原因と断定しない。
- 同条件cache/回線/端末で修正前後を比較し、初回paint・API待ち・画像decode・操作可能までを独立測定する必要がある。
- 実機、Safari、キーボード表示は今回未実施。時間閾値の提案を承認済みに昇格させない。
- APIに上限なしの待機が残る。単純timeoutでmutation lockを解除すると、サーバーが既に処理したか不明な状態で別操作できるため実装していない。requestIdを維持して処理結果照会/再送を行い、確定結果を得るまで消費操作を保護する契約が必要。read-only get_stateとmutationの復帰を別設計にする。これを理由に上記独立修正は停止していない。

判定: RL01/RL02実装・静的確認済み。統合版再検証待ち、Q01全体は未合格。

## RL03 武将画像の無限待機是正（追加）

独立検証から747武将初回「画像を準備中」が30秒後にも残る観測を受領。`CharacterImageReadiness.ts`の独自Image/decode Promiseにはtimeoutがなく、共通screenAssetsのbounded loaderを利用していなかった。`preloadAsset`へ統一し、既存12秒上限後はfailed、既存再読込UIへ到達する。失敗をready/成功扱いにしない。成功decodeのcache、失敗cacheの解除を維持する。

- `src/app/components/redesign/CharacterImageReadiness.ts`を追加変更。
- 型検証PASS。
- 既存screenAssetsをfake Image/clockで実行し、stall→failed、同URL再試行→loaded、成功後cache再利用（Image生成2回）の意味ある経路を確認PASS。
- 747の長待ちにネットワーク/画像個別URLのどれが寄与したかは未分離。統合Previewで再検証が必要。

RL03の復帰UIも是正: 読込中の`GrowthView`はspinner-only/closeDisabledとし、押しても何も起きない×を出さない（Dialog名はスクリーンリーダー向けに保持）。失敗時はinline `role=alert`＋再読み込みへ切り替え、Modalのinertロックを解除して共通Footerで他画面へ戻れる。画像失敗を成功扱いせず、武将の消費操作は`busy = saving || !ready`のまま保護する。追加変更は`GrowthView.tsx`と`growth.css`の読込箇所に限定。
