# GAME04 v2 追加仕様・ローカル受入記録

更新：2026-09-20。処理ルールの検証記録。正式数値・全Lvバランスの承認ではない。

## 対象

- 正本：`docs/product/GAME04_BALANCE_AUTHORITY_V2_2026-09-20.md`
- 追加検証：`scripts/verify_game04_battle_additions_v2.mjs`
- 人工境界データ：`scripts/game04-battle-additions/fixtures.mjs`
- 人工値の状態：`TEST_ONLY_NOT_BALANCE_APPROVAL` / `TEST_ONLY_ADDITIONS_V2_20260920`
- 比較対象マスター：72件×11段階、付録Bの45割当。候補IDは旧所持IDと分離し、ガチャ追加はしない。

## 結果

追加29グループ PASS。既存v1共通24グループ PASS。旧Battle・共有Lv Raid・領土侵攻の3回帰スクリプト PASS。

| 分類 | 確認内容 |
|---|---|
| キャラ・割当 | 全60体／N15体パッシブなし／R以上45体の属性・役割・レアを正本文字列と照合、覚醒0〜5→パッシブLv0/2/4/6/8/10、HP/DEFのLv1/50/100到達値 |
| パッシブ | 同型同属性支援の最強1個、N相当対象、DEF減算後ダメージ補正、条件スナップショット、P03多様性・途中死亡、P04本人除外、P10/P11加算・蘇生除外、P12、P14/P15/P16と上限 |
| 継続効果 | 付与行動とスキップは発生減算なし、独立持続、合算後の上限・切捨て、元量保持、付与者死亡後の継続 |
| シールド | 上限で新規分のみ切詰め、同ID更新不可、短い残り持続から吸収、全量吸収でも直接被弾SP |
| 反撃・対象 | 固有最後尾対象と誘導の分離、演出多段でも1反撃、死亡蘇生で消えた反撃を実行しない、現在ATK最大の敵選択 |
| 解除 | 空対象の純解除見送り、ATK/DEF独立件数、行動不能解除の共通耐性、大祓いで異なるカテゴリ保持者をそれぞれ解除 |
| 統合終了順 | 最後の敵を倒した後もDoT、双方全滅敗北、DoT死亡蘇生後の消去済みHoT不実行、300回目も同じ処理、上限敗北後はフェーズ・割込みへ進まない |
| 敵SP | 1実行行動の複数攻撃・演出多段は対象ごと1回、反撃被弾分は敵連続行動終了後、死亡時破棄、蘇生SP0、DoTは加算なし |
| 72スキル | 792行を正本の全LB表から独立読込し通常SP/BURST SP/表示値照合、内部の未丸め指数補間、候補IDと旧IDの分離 |
| 再現性 | 同一入力・seedで全結果一致、入力不変、通算300行動以内 |
| 既存回帰 | v1版維持、Lv14参加、WIN/LOSE、3勝資格・非遡及、開始Lv精算、Lv強化、再送、territory master snapshot・開催枠・クリア経験値 |

## 再実行

Repository rootで実行する（正本Markdownを独立参照するため）。

```bash
npm exec --offline --package=esbuild@0.25.0 -- esbuild scripts/verify_game04_battle_additions_v2.mjs --bundle --platform=node --format=esm --outfile=/tmp/game04-v2-additions.mjs
node /tmp/game04-v2-additions.mjs
```

既存回帰：`verify_game04_battle_common_v2.mjs`、`verify_game04_redesign_battle.mjs`、`verify_game04_raid_shared_level.mjs`、`verify_game04_territory.mjs` を同様にbundleして実行。

## 範囲の制限

- これはローカル計算・ドメイン回帰。実DB/Edge適用、Preview配信、代表編成のブラウザ確認は統合記録を参照する。
- 実多人数競合・全Lv勝率・経済供給・端末横断受入の完了を意味しない。
- 検証用スキルの正式名称・画像・旧ID対応・ガチャPoolは未承認部分を保持。
- 人工境界テストには0SP、極端なHP等を使用。正式数値へ昇格させない。
