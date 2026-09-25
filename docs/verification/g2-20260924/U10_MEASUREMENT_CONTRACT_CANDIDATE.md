# U10 GAME04主要行動計測：現行確認と契約候補

状態：**正式採用前の候補。G2主要行動計測は未完。**

## 現行確認（2026-09-24・開発DB read-only）

- `src/utils/acquisitionAttribution.ts` は初回入口を記録。稼働 `record_kpi_acquisition_observation_v1` は TITLE_ARRIVED / TAP_TO_START / WORLD_INTRO_STARTED / WORLD_INTRO_COMPLETED / NAME_COMPLETED / WORLD_INTRO_VIEWED / WORLD_INTRO_SKIPPED の7種だけを許可。ゲーム行動を流用送信できない。
- `sync_active_users` → `kpi_record_daily_activity` でDAUを記録済み。プロフィールの存在を確認してから記録する。既存接続は維持。
- `refresh_kpi_content` は旧ガチャ無料10連3種を集計。`kpi_daily_engagement_v1` のraid消費は旧 `battle_replay_sessions` を対象にし、GAME04の新戦闘を対象としない。
- 新API source.tsは game04_requests / game04_battles へ成功処理・戦闘を保存するが、新ゲーム行動のanalyticsイベント契約・集計接続はない。
- game04_requestsの列は user_id / request_id / result / created_at。action専用列なし。多くの成功receiptは空であり、全行のJSON状態差分から過去行動を推測して正式計測へ復元しない。
- game04_battlesは kind / target_id / input / result / status / created_at / settled_at を持つ。出陣/共闘の開始と結果は既存保存根拠で確定できる。ブラウザ再生開始・SKIP・演出終了を戦闘成功として扱わない。
- QA除外は `kpi_account_classification_periods` の admin / qa / test / fraud_suspended と、`kpi_is_subject_excluded(subject_id, occurred_at)` の既存時点契約あり。ブラウザからqaを任意指定すると現行acquisition RPCは拒否する。

## 判断候補

**推奨A：新APIの成功transactionにaction receiptを保存し、保存済み事実から集計する。**

GAME04用の `gameplay_action_v1`（候補名）receiptを success commitの同transactionに保存する。行動名は既存API actionをそのまま使い、イベント重複命名を避ける。ブラウザの操作クリック・再送を直接成功数へ加算しない。既存acquisition、DAU、GAME03の集計は上書きしない。

比較B：フロントで成功応答を観測してイベント送信する。実装量は小さいが、保存確定後の通信切断/タブ終了で欠損し、再送重複排除・サーバーreceipt照合が別途必要。資源・報酬の正式成功計測にはAを推奨。

| 対象 | action候補（既存名） | 成功判定・件数 | 冪等キー/主参照 |
|---|---|---|---|
| 編成 | save_deck | 保存成立1件。取消/validation失敗0 | user_id + request_id |
| 武将/装備育成 | character_level / equipment_level | 消費とLv/EXP確定1件。前後Lv/EXP/銭/素材差分を保存 | user_id + request_id |
| スキル/装備LB | skill_level / equipment_lb | 正式LB増加と必要素材消費確定1件 | user_id + request_id |
| 魂/武将解放 | soul_exchange / soul_select / character_unlock | 付与と消費が同時保存された1件 | user_id + request_id |
| 出陣 | quest_battle | startedとsettledを別相。win/lossはsettled resultから | battle_id + phase |
| 共闘個人戦 | raid_battle | 戦闘結果settledを参加実績とし、入室を勝利へ加算しない | battle_id + phase、room_id |
| 共闘報酬 | raid_claim | 未受取grant→受取保存件数。既受取再送0 | grant_id + user_id |
| 侵攻主催 | territory_host / raid_unlock | 開催snapshot生成・資格/素材消費成立1件 | user_id + request_id、room_id |
| 商店交換 | shop_exchange | 交換ID/数量/消費DIA/正式付与の同時確定1件 | user_id + request_id |
| 回復薬 | use_energy_drink | 在庫消費と行動力増加確定1件 | user_id + request_id |
| 任務/ログボ/BOX | 現行の受取RPC名 | 各受取台帳の確定を根拠。再受取0、BOXと元付与の二重売上集計なし | mission周期ID / login通算日 / present_id |
| VIP・有償購入 | P02確定イベント契約へ接続 | 支払済webhookとentitlement付与確定。checkoutクリック/模擬付与は購入0 | provider event + order ID |
| 保存復帰 | 別途resume観測候補 | 認証UIDと同じ保存版を読めた成功/失敗。再ログインを新規獲得へ加算しない | server session + observation ID |

## 保存する最小契約候補

- contract_version、action、phase、request_id、user_idまたはKPI subject_id、server occurred_at。
- server-derived environment（現在はdevelopment）、API version、master version、state version before/after。
- battle_id / room_id / product_id / mission周期IDなど該当IDのみ。
- outcomeと正規receiptに基づく資源/報酬差分。名前・bio・メール・チャット本文・JWT・生リクエスト全体は記録しない。
- QA classificationはサーバーの既存分類を照合。development全体をproduction KPIから分離し、QA分類未登録を通常ユーザーの実績へ混ぜない。
- 同一request再送は既存receipt返却で追加記録0。失敗は資産成功receiptへ記録せず、必要なfailure observationは別契約。
- 過去receiptが空の行動は「未計測期間」。推測による埋め合わせなし。

## 採用後に必要な実装箇所（親所有APIとの接続）

1. source.ts `commit` のreceiptに既存actionを付ける。保存stateから前後差分を構成し、client payloadの主張をそのまま採用しない。
2. runBattleのstart/settlementはgame04_battlesの同transaction記録を利用。
3. shop_exchange / territory_hostなど専用RPCもreceipt保存を同transactionで追加。成功後の非transaction追記だけでは不可。
4. ログボ/任務/BOX/VIPは各供給台帳へ接続し、独立Eが実付与・再送・再読込と記録数を照合。
5. 既存KPIを変更する場合はGAME04専用query/viewへ分離。productionとGAME03へ適用しない。

未採用契約を本体へ仮実装・配信しない。U10必須未完として判断一覧へ残し、P04に名前だけ付けて合格へ繰り越さない。

## 運用・問い合わせの確認

公開予定 `/legal/*` とSettingsへのリンクを点検。旧ゲームURL・旧ゲーム名の公開リンクなし。terms/payments/tokushoに旧通貨 `CASH` が6箇所残っていたため表示名だけ正式の `銭` に修正。120日期限・決済条件など契約内容は変更していない。

`GAME04_LEGAL` は status=draft、operator/representative/address/phone/supportEmail/serviceUrl/rightsHolder/effectiveDate が未設定。P04提供待ちとして、問い合わせ到達・運営情報公開受入は未完。必要入力は上記8項目、窓口運用方法と疎通確認。承認済み値提供後に設定を接続し、リンク到達・戻る導線・誤送信先なしを確認する。GAME03の連絡先を推測流用しない。
