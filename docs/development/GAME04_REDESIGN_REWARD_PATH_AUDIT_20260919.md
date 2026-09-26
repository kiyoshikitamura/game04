# GAME04 報酬・獲得経路の接続監査（2026-09-19）

監査開始基準: `137c3eccfb6c66a2a001096900e2edee7dc63b37`。旧191件は参照しない。

## 既存経路

|経路|付与の確定元|新構造への状態|今回の処置|
|---|---|---|---|
|Quest 初回/通常/レア|新Edgeの戦闘開始スナップショット・精算、`game04_commit_state`|新stateに付与済み。初回履歴と報酬を同一commit|共通新資産付与関数との統合は親担当|
|Raid 参加/Lv討伐|`applyRaidAction` のrewardGrants→`raid_claim`|新stateに受取。参加/Lv別grant IDとclaimed保持|Checkpoint除去後も3勝資格/非遡及を維持する別lane受入|
|Mission|旧 `claim_mission_reward` / `claim_all_mission_rewards`→`grant_mission_reward_bundle`→`grant_present_payload`|旧任務は新Quest進行と未接続|新Mission条件評価・受取API契約・UIを追加。正式Master空/無効を保持|
|Login|`process_login_bonus`→`_grant_gameplay_reward_v1`→`grant_present_payload`|旧日付ledgerあり。新開始ユーザーは旧onboarding許可条件に依存|既存許可・日程を変更せず既存通知モーダルを再接続、受取後新state再読取|
|Present|`claim_present` / `claim_all_presents`→`grant_present_payload`|旧在庫と通貨を更新。装備個体INSERTは新イベント橋渡し対象|受取確認後新state即時再読取。旧受取の行lock・状態再取得を維持|
|Gacha|カテゴリ別RPC/既存取得結果→legacy所有|旧UUID一回取込だけでは重複取得欠落|asset_events laneでイベント化、UIは成功後新state即時再読取|

`grant_present_payload` は CASH/DIA を既存wallet、装備Master一致を `user_equipments` 個体INSERT、それ以外を `user_items` へ付与する。Character/Skillの直接所有付与はこの旧関数にはない。旧PLAYER_XP Present例外は維持する。

## 新Mission接続契約

- `game04_redesign_master` の `missions`: `{enabled:false,missions:[]}` が既定。
- 条件型は `stage_clear` / `area_clear`。Bossは該当stageのクリアで表現する。正本にない条件や報酬を作らない。
- `evaluateMissions` はサーバーのclearedStagesのみから評価。重複stage IDを重複加算しない。
- クライアントは `claim_mission` にmissionIdだけ送る。条件・報酬・量は受け付けない。
- 親Edgeが有効Master・達成・未受取を検証し、報酬と `claimedMissionIds` を同一CAS commitする。
- Home任務中央モーダルにサーバー投影を表示。Master未設定時は攻略の記録と準備中表示を維持。
- Fixtureの報酬量はローカル検証専用で、ゲームへ配信するMasterではない。

## 表示更新

旧Present/Missionの確定投影取得、Loginの受取、Gacha成功後にuserId付き読取更新通知を発行する。新Appは一致するユーザーだけ再取得し、操作中なら保留して操作完了後に再取得。旧応答が後着して新所持状態を巻き戻さないようrequest世代とstate versionを照合する。クライアントによる報酬追加はしない。

LoginのDIRECT配布で遷移先バッグ未実装の場合、動かない「マイバッグへ」ボタンを表示しない。既存の報酬表示と閉じる操作は利用可能。

## 保留事項

- 正式Mission条件・内容・数量、Login開始条件/日程/内容の承認。
- 旧育成アイテムから新materialへの対応量。旧ガチャ上限変換との二重付与を避け、user_items増分の無差別変換は禁止。
- 旧キャラ/スキル重複量・上限後の扱いはasset_eventsのpendingイベントとして分離。
- UIの再読取修正だけで、未定義資産変換や未有効Missionが完成したとは扱わない。

## このlaneの検証範囲

- 型検査: 変更途中の一度目/二度目ともPASS。統合後の最終検査は親が実行。
- ローカルFixture: Mission達成/未達/エリア完了/重複stage/受取済み/不明ID/無効Masterを検証。
- DB適用/実API競合/Preview反映: このlaneでは未実施。親の統合記録へ結果を追記する。
