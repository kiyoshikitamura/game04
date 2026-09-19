# 領土侵攻 Domain接続

Authority：`docs/product/GAME04_TERRITORY_INVASION_AUTHORITY_2026-09-20.md`。

## 型と責務

- `TerritoryMaster`：版、承認状態、初期／移行経験値、成長表、同時開催枠、侵攻先、開催用Raid Master、共通Battle rulesを一体管理。
- `TerritoryProgress`：永続DBから受け取るexperience。レベルは当該Masterの累計経験値閾値から算出。
- `projectTerritory`：レベル・次閾値・枠・侵攻先ごとの所持数と不足理由を表示用に投影。開催の原子的保証はDB側の別責務。
- `territoryItems`：既存`materials.unlock`を`raid_unlock`へ対応。それ以外の開催アイテムは`state.territoryItems`へ拡張可能。
- `RaidRoom.territorySnapshot`：開催時の侵攻先、クリア経験値、Raid Master、Battle rules、版・承認状態を保存。
- `getRoomRaidMaster`：snapshotを優先。既存snapshotなしRoomは従来Masterへのfallbackを保持。
- `createRaidRoom`：第6引数にsnapshotを渡すとその敵／HP／期間で作成。

## 版固定

見た目画像、敵能力成長率、共有HP成長率をRaid Masterへ移設し、以前のコード定数・キャラ配列直接参照をなくした。既存値は敵0.15、共有HP0.2のまま。戦闘・報酬・リスポーンはRoom snapshotを参照する。

共通Battle rulesもsnapshot化し、Edgeの戦闘開始入力から参照する。表示用projectionの侵攻先にも同版のRaid Masterを含める。既存Raidの勝利加算・3勝資格・非遡及・旧Lv精算・Acquisition Master引数を維持。

## 仮値

`PREVIEW_PROVISIONAL_20260920_v1`は接続試験専用。Lv1〜3の経験値閾値0 / 100 / 300、枠1 / 2 / 3、既存開催札1枚、3日、clearExp100。安土城／岐阜城の侵攻先は既存unlock_shadow敵を流用した仮設定。価格・正式成長・正式報酬・正式侵攻先構成の承認ではない。

## ローカル検証

`scripts/verify_game04_territory.mjs`をbundleして実行、PASS。

- アイテム0・レベル不足・枠不足の理由表示、Lv上限と解放。
- 経験値順序、不正なHP／報酬量／人数／戦闘除数等のMaster拒否。
- 開催後Masterを書き換えても、敵／画像／報酬／期間／clearExp／Battle rulesが不変。
- 主催者以外・Encounter・終了／期限切れの主催枠除外。
- 最終討伐戦闘の3勝目が確定し、再送で変化しない。

DBの原子的開催／主催者経験値自動付与・実Edge・Preview受入は統合工程で別記する。この記録はDomain実装と純関数確認だけを示す。
