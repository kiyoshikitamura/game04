> 2026-09-25 記録照合：本書は実装当時の履歴。現在の分類は [統合受入結果](GAME04_G2_統合受入結果.md) Z05/R09/H01/H02を優先する。SQL適用・既知QA分類・専用RPC等の後続成果を未実装へ戻さない。管理者HTTP/表示、未分類QA、grant単位/復帰/流入照合の未完は維持する。

# U10 GAME03 KPI転用・新ゲーム事実接続

2026-09-25再開。GAME03 KPI転用は採用済み。新ツールの承認待ちではない。親が共有API/DB統合を管理する。U10全体は未合格。

## 実装

- `src/domain/redesign/gameplayMeasurement.ts`: 検証成功後に親APIが呼ぶ純粋receipt生成。既存action許可リスト、契約版、保存前後state版、サーバーstateの銭/行動力差分のみ。payload、氏名、bio、email、JWTを保存しない。
- `supabase/manual/game04_g2_kpi_gameplay.sql`: service_role専用・SECURITY INVOKER集計関数。新戦闘表の開始/確定を別phase、確定receiptのみcommitted。JST日付、時点QA分類、未結合subjectはunmapped。既存行を書き換えない。親適用待ち。
- `src/app/api/admin/kpi/v2/gameplay/route.ts`: 既存KPI Basic認証proxy・サービスclientを利用。GAME04開発URLを再照合し、developmentと明示。既存GAME03型のguild等の数値を新バトル数値で上書きしない。
- `scripts/verify_game04_g2_kpi.cjs`: action allowlist、前後state差分、個人情報不保存、unknown/battle/purchaseをaction件数へ含めない確認。

イベント名を独自に増やさずAPI action名を保存。phase=committedは状態保存成功件数であり、個別報酬item数/売上額ではない。battle started/settledを合算してプレイ回数としない。既存battle主キーとrequest(user,request)一意性で再送を重複集計しない。

## 親のAPI接続差分

source.tsへ helper import、最後のdomain操作commitを以下に置換する。

```ts
await commit(state, after, requestId, null, room, version,
  gameplayMeasurementReceipt(action, state, after));
```

stateFor資産取込・reconcile用commitは変更しない。runBattleはbattle行だけ集計する。新規normal_gacha/P02購入にこのhelperを流用しない。raid_claimは既受取の別requestが新報酬と誤解されるためhelper対象外。grant IDと受取前後を同transactionで記録する追加接続が必要。

専用RPC未接続: shop_exchange / territory_host / raid_unlock。shop_exchangeの既存最終game04_commit_growth_state呼出しに `p_receipt=>jsonb_build_object('gameplayMeasurement',jsonb_build_object('contractVersion','game04-gameplay-v1','action','shop_exchange'))` を同transaction内で渡す。既存関数全体の置換ではなく稼働定義を確認して当該呼出しだけ差分適用する。主催は既存requestsへの結果保存箇所に同様receiptを付加。新規イベントの成功後別transaction追記は禁止。

## 検証済み

- ローカルhelper試験PASS、`npx tsc --noEmit --pretty false` PASS。
- 稼働開発DB read-onlyで実列・KPI subject source_user_id対応・時点除外関数を確認。
- 新battle全188件: quest win69/lose3、raid win109/lose7。これは開発データ集計であり本番実績ではない。
- 時点QA除外照合で全188件includedとなった。既知専用QAの分類登録が不足している。分類ロジックが存在するだけでQA除外合格にしない。

## 親で必要な限定処理・再検証

1. 既知QAのみsource_user_idからsubject_idを解決し、QA作成時からのqa分類期間を登録。他ユーザーを一括QA化しない。
2. SQL候補をGAME04開発だけへ適用し、一般anon/authenticatedが関数実行不可、service-roleで件数取得を照合。
3. 実UI育成/回復薬等の操作1回→再送→再読込を通し、request保存1行・集計1件を確認。既存battle件数とphase/outcomeを照合。
4. 管理者認証付HTTP応答・期間指定を確認。認証未設定は503を維持。管理者設定を無断で追加しない。

## 必須未完

- QA分類適用、共有API receipt接続、専用RPC、SQL適用、Preview配信、実API同一request再送件数確認、管理者UIへの表示は未完。
- ログボ/任務/BOX/VIP各台帳の詳細集計、raid grant単位受取、保存復帰観測、流入subjectとの通算ファネル照合は未完。
- P02外部支払い確定・付与・返金・購入復帰は別接続。模擬orderや開発アイテム付与を売上へ含めない。
- G4初回導線は後工程。U10独立ゲーム行動接続をG4待ちにしない。
- 古い空receiptは未計測期間として保持し、前後state差分から過去actionを推測復元しない。

## 追加確認

既存Next 16.2.10の `unstable_doesMiddlewareMatch` に新 `/api/admin/kpi/v2/gameplay` URLを入力しマッチを確認。実proxy関数をNextRequestで実行し、設定なし503、認証なし401、誤認証401、試験専用正しい資格情報だけ `x-middleware-next=1` を確認。既存buildのfunctions-config-manifestにも両KPI matcherが登録されている。配信HTTP認証確認は別項目として残る。

既知4QAのsubject照合結果（すべて既存classification期間0件）:

| QA user | KPI subject | created_at UTC |
|---|---|---|
| b9003819-973a-47b2-a1ef-9e503c60bb7b | 6a31cdd8-b1ec-461c-912e-df2ff01e6c45 | 2026-09-24 12:36:04.47766 |
| 6386ae36-9c7e-4a52-8fe7-28d4382ba35b | 74021e38-e547-4ae7-aebb-3301f1a88bee | 2026-09-24 12:52:42.714837 |
| 229ac838-28c3-48e4-a86a-45a25fbf72b9 | c32f8267-b34c-4f2d-9ca2-8912db1b3402 | 2026-09-24 13:05:14.028293 |
| d6dabf02-3eb2-430e-8352-561f8d735469 | 977d461d-b524-45b9-81c0-c518023d3051 | 2026-09-24 14:40:40.051892 |

親適用候補 `supabase/manual/game04_g2_kpi_qa_classification.sql` は上記4名のみ・作成時点から・重複登録防止。`supabase/tests/game04_g2_kpi_gameplay_rollback.sql` は集計関数適用後に親が実行するtransaction rollback試験。既存QAの新規request UUIDだけ使い、ゲームstateを変更せず、重複receipt/QA除外/日付/ロール/戦闘件数を確認する。これは実UI保存受入の代替ではない。
