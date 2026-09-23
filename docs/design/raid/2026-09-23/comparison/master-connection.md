# GAME04レイドマスター接続記録

採用ファイル: `src/domain/gameplay/canonical/data/raid_production_20260830.json`

| raidVariantId | areaId | raidName | 武将ID（memberCharacterIds） |
|---|---|---|---|
| `RAID_SHINJUKU_V1` | `SHINJUKU` | キングス・クラウン | `char_reiji_01`, `char_mio_01`, `char_takuro_01`, `char_leon_01`, `char_kageyama_01` |
| `RAID_SHIBUYA_V1` | `SHIBUYA` | ハイスピード・スターズ | `char_ageha_01`, `char_leo_01`, `char_sora_01`, `char_reina_01`, `char_noa_01` |
| `RAID_IKEBUKURO_V1` | `IKEBUKURO` | アイアンウォール | `char_koharu_01`, `char_takeshi_01`, `char_momoko_01`, `char_riki_01`, `char_sakura_01` |
| `RAID_ROPPONGI_V1` | `ROPPONGI` | ロイヤル・フラッシュ | `char_kaede_01`, `char_taiga_01`, `char_maya_01`, `char_seiya_01`, `char_cecile_01` |
| `RAID_AKIHABARA_V1` | `AKIHABARA` | グリッチ・コード | `char_karen_01`, `char_miyabi_01`, `char_alice_01`, `char_rui_01`, `char_maya_01` |
| `RAID_KAWASAKI_V1` | `KAWASAKI` | ブレイクダウン | `char_go_01`, `char_kengo_01`, `char_tetsu_01`, `char_lucas_01`, `char_riki_01` |
| `RAID_YOKOHAMA_V1` | `YOKOHAMA` | ブルー・レクイエム | `char_genji_01`, `char_long_01`, `char_sakura_01`, `char_cecile_01`, `char_taiga_01` |

接続経路:

`raid_production_20260830.json` → `GAME04_RAID_PRODUCTION_MASTER` → `resolveRaidTopEnemy(raidVariantId)` → `RaidTopEntry.enemy` → `RaidTopApproved` / `RaidRoomDetail` / `ApprovedRaidPreview`。

属性は `raid_bosses_20260822.json` の `townId` 対応を `CANONICAL_RAID_ATTRIBUTE_MASTER` で参照する。背景は `areaId` 対応の表示素材、武将画像は `memberCharacterIds` を `CHARACTERS_MASTER` に解決する。旧 `src/domain/redesign/raid.ts` の `RAID_MASTERS` は対象3画面の表示経路では使用しない。
