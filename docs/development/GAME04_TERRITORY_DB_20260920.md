# GAME04 領土侵攻 DB接続・ロック設計

正本：`docs/product/GAME04_TERRITORY_INVASION_AUTHORITY_2026-09-20.md`

## 適用

Migration `20260919151837` をGAME04専用開発DB `lrgyllgzcdcphlbmkknc` に適用。正式数量の承認ではなく、`PREVIEW_PROVISIONAL_20260920_v1`による接続確認。

## 所有・主催枠

- `game04_territory_progress(user_id,experience)`を新設。Lvはterritory Masterの累計閾値から導出し、既存player_stateのCAS保存から分離する。
- 既存ユーザーはMasterのlegacyMigrationExp、新規はinitialExpで初期化。
- `game04_territory_context`はMaster・進捗・開催中件数・アイテム所持を返す。
- `raid_unlock`は従来`materials.unlock`を継続利用。それ以外は明示した`territoryItems[itemId]`。不明な侵攻先・所持なしは開催拒否。
- `game04_host_territory`はユーザー行→player_state→領土侵攻progressの順でロック。レベル・所有・全開催ルームを横断する枠を判定し、アイテム消費・ルーム・要求ID台帳を同一transactionで保存。
- 同一要求IDは同じルームを返す。別操作・別侵攻先への要求ID再利用は拒否。
- 開催中かつ期限内のUnlockだけを開催枠へ計上。Encounter・救援参加・終了・期限切れ・未受取報酬は開催枠に含めない。

## 開催時の固定

ルームに`territorySnapshot`を保存。Master版・侵攻先・敵と報酬・成長係数・画像段階・期間・共通Battleルール・clearExpを固定する。更新時のsnapshot／ownerId変更はDB triggerで拒否。

既存Unlockルームは同RaidMasterに対する侵攻先定義の先頭を決定的に選んでsnapshot化。XP triggerを設置する前に処理し、既に終わった侵攻への経験値は遡及付与しない。

## 主催者経験値

`game04_capture_territory_clear`はactive→defeated、最終ボスLv、HP0、期限内の確定時だけ評価する。最後の戦闘結果を含む主催者winsが3以上の場合、snapshot.clearExpを自動加算する。

`game04_territory_clear_receipts(room_id PK)`は資格あり／なし両方を記録。主催者不在でも即時付与し、後から確定する3勝目・再送・再集計で再付与しない。途中Lv・期限切れは加算しない。

## Deadlock対策

既存精算はactor users→actor player_state→battle→roomの順。終了triggerはroomからownerの独立progressだけへ進み、owner users／owner player_stateをロックしない。

Clear receiptのowner外部キーもusersではなくprogressを参照する。救援者同士が相手所有のルームを同時討伐した場合にusersロックが逆順になることを避ける。

主催RPCは既存roomをFOR UPDATEでロックしない。主催者のprogressを保持したままroom lockへ待つ経路を作らない。並行クリアの経験値は独立progress行の`experience=experience+amount`で加算し、取りこぼしを防ぐ。

## 一覧と終了後報酬

`game04_raid_rooms_for_user`は全開催中ルームと本人が主催・参加した終了ルームを返す。旧200件上限で終了結果／未受取報酬の入口を消失させない。将来的なページング最適化は別工程。

## 権限

新テーブルはRLS有効、anon/authenticatedに権限なし。RPCはSECURITY INVOKER・service_roleのみ。ブラウザから数量や枠・経験値を確定できない。

## ホスト受入結果

- `verify-game04-territory-host-db.sql`のRollback検証：アイテム0、必要Lv不足、枠満杯、原子的失敗、要求再送、snapshot固定、期限切れによる枠解放・結果保持、不正Master拒否PASS。
- 新専用QA `02e386f1-46b1-4517-894a-65969d77fa79` の実API：Lv1枠1へ異なる要求IDで並行2開催し200／400（枠満杯）。アイテム1→0、同一要求再送は同じルーム・追加消費なし。
- 同QAだけ経験値100・アイテム3の検証fixtureを投入。Lv2へ解放し、既存1開催を残した2枠に対して岐阜城を並行2開催。200／400（枠満杯）、開催中合計2、アイテム3→2。所持アイテムが足りていても枠を超えない。
- 主催者経験値のクリア条件・不在主催者・多人数同時クリアは別の領土侵攻統合受入記録を参照。

正式経験値量・上限枠・必要Lv・アイテム量・報酬・素材の承認とは分離する。今回のSQL fixtureはRollback、実API fixtureは専用QAのみに限定した。

検証後、ホスト専用QAが作った2ルームだけをexpiredへ変更し、通常の開催中一覧から除外。所有・要求台帳・結果証跡は削除せず保持。QAの経験値／アイテムは検証値であり、通常ユーザーや正式Masterへの変更ではない。
