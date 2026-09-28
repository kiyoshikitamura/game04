+# GAME04レイド正本接続記録

## 誤記訂正

前回記録で `src/domain/gameplay/canonical/data/raid_production_20260830.json` をGAME04正本として扱っていたが、同ファイルは `RAID_SHINJUKU_V1`、`キングス・クラウン`、`SHINJUKU`、`char_reiji_01` を含むGAME03本番スナップショットである。GAME04接続済みとした記録は誤りであり、今回訂正した。旧ファイルは履歴保全のため削除せず、レイド一覧・詳細・比較QAの表示経路からは除外した。

## 採用正本

| 区分 | 所在 | 版／ID |
|---|---|---|
| GAME04再設計のレイドMaster | `src/domain/redesign/raid.ts` | `RAID_MASTERS` / `encounter_flame`, `unlock_shadow` |
| 領土侵攻の投入履歴 | `supabase/migrations/20260919151837_game04_territory_invasion.sql` | `game04_redesign_master` / `PREVIEW_PROVISIONAL_20260920_v1` / `raidMasters[0].id=unlock_shadow` |
| キャラクター正本 | `src/domain/redesign/masters.ts` → `src/theme/sengoku-characters.json` | GAME04戦国キャラクターID群 |

接続経路は `RAID_MASTERS → resolveRaidTopEnemy → RaidTopEntry.enemy → RaidTopApproved / RaidRoomDetail / ApprovedRaidPreview`。詳細も一覧と同じ `resolveRaidTopEnemy` を通るため、旧 `raid_production_20260830.json` の名前・武将・背景は表示しない。比較QAの `createTopFixture` は `RAID_TOP_ENEMIES` を使い、同じ正本経路を検証する。

## 画面へ渡すID

- `encounter_flame`：炎影の守将、火属性
- `unlock_shadow`：常闇の覇将、闇属性

正式GAME04の専用レイド背景はまだ別納品されていないため、現在は既存のGAME04戦国背景を表示モデルへ接続し、専用背景だけを素材残件として明示する。GAME03の市街地背景は使用しない。

