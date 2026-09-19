# GAME04 新資産獲得接続（2026-09-19）

## 確認した現状

GAME04 dev `lrgyllgzcdcphlbmkknc` の現行SQLをREAD ONLY確認。

- Characterガチャは既存UUIDの覚醒進捗を更新。最大覚醒時は旧Item付与で、Character行は更新されない。
- Skillガチャは既存UUIDのplus_valを更新。最大値時は旧Item付与で、Skill行は更新されない。
- Equipmentは毎回新UUIDをINSERT。
- 現行UIの6引数RPCは`gacha_execution_history`にrequest_id単位で結果保存。再送は保存結果を返す。
- 天井交換は`special_gacha_exchange_receipts`へ保存。
- したがってUUIDの一度きり取込・行UPDATE監視だけでは重複獲得を完全には捕捉できない。

## 接続契約

1. Migration時に旧資産を`game04_legacy_asset_snapshot`へ固定保存。既存行は変更しない。
2. 以降のCharacter/Skill/Equipment INSERTは`game04_acquisition_events`へ捕捉。
3. ガチャCOMPLETEDおよび天井交換の結果から、Character/Skillの`outcome != new`だけ捕捉。新規取得はINSERT側と二重捕捉しない。
4. Edgeがservice-only RPC `game04_acquisition_input(p_user_id)`から`{legacy,events,master}`を取得。
5. 初期取込とイベント適用を分離し、state version CAS内に所有状態と`appliedAcquisitionIds`を同時保存。
6. Migrationと新Edge配信の間に旧Edgeが取込済みの行は`legacyImportedIds`で検知し、イベントreceiptだけ消費して再付与しない。

受取側はブラウザから数量・抽選結果を受け入れない。DBイベントとMasterが付与根拠となる。既存ガチャ価格・確率・通貨・旧資産の保存処理は維持する。

## 仮Masterと未決事項

`acquisition_conversion`は従来の仮取込値（魂10 / Skill素材2）を明示Master化。正式数量ではない。
最大覚醒／Skill上限時の扱い、未対応の専用Masterは`pendingAcquisitions`に取得イベントを保持する。付与済みreceiptは消費しないため、正式Master投入後に再検討できる。

`grantReward`はCharacter/Skill/Equipmentを同じ取得処理へ接続。安定したgrant IDで再送を排除。未対応Equipmentを黙って失う挙動を廃止。負数・NaN・非整数数量は拒否。

## 境界と残件

- Migration以前の履歴から重複獲得を再生しない。旧所有スナップショットと既存新stateを維持する。
- 旧4引数/coreガチャRPCは既に直接利用不可であることをDB権限で確認し、Migrationでもrevokeを維持。現行UIはrequest-id付き5引数（内部6引数へ委譲）または6引数を利用。
- 旧Itemから新Materialへの対応は未FIX。release_manifestに一致するCharacter/Skill IDを旧Presentのitem_idへ明示指定する経路は、user_itemsの正増分イベントとして接続。一般Itemは変更しない。正式報酬内容はMaster決定待ち。
- 本ファイルはコード上の接続契約。DB適用・Edge配信・実API受入は統合報告の記録を参照し、純粋関数検証だけで受入完了としない。

## 検証

`verify-game04-acquisitions.ts`: 新規・重複別処理、同じイベントの再送、入力不変、最大育成時保留・正式値投入後再開、未知Master保留、直接Rewardの安定ID、旧Edgeとの二重取込抑止、Equipment個体ID互換、不正数量拒否を検証。

`verify-game04-acquisition-db.sql`: 適用後、Rollback transaction内でINSERT捕捉、同一UUID重複・上限変換のreceipt捕捉、COMPLETED再更新の二重捕捉防止、snapshot境界を検証する。
