# 戦国姫 艶舞｜バトルエフェクト16種・確定設定

更新日: 2026-09-25

## Codex向けの読み取り規則

- この文書は、各エフェクトのHTMLモックでユーザーが決めた表示・再生パラメータの正本。実装時は対象側（`enemy` / `ally`）ごとの値を適用する。
- `enemy` は敵側にエフェクトを表示する場合、`ally` は味方側に表示する場合。技の使用者側ではなく表示対象側を表す。
- `*_percent` は百分率の数値（例: `55` は55%）。`speed_multiplier` は倍率（例: `1.25` は1.25倍）。`*_ms` はミリ秒。`count` は個数または回数。`angle_deg` は度数。
- 記載のない項目は未指定。0や既定値と解釈しない。素材、レイヤー構成、アニメーション方式、各HTMLの既存挙動は別途対応するモックを参照する。
- 原文の「画面比率」は表示サイズとして `display_size_percent` に統一。「封印門」は回転する封印紋の文脈から `seal_circle_opacity_percent`、「モラ」は靄の文脈から `haze_opacity_percent`、「従事」は十字の文脈から `cross_opacity_percent` として整理した。原文を確認する必要がある場合は末尾の表記注記を参照。

## 設定値

```yaml
schema: sengokuhime_enbu_battle_effect_settings_v1
units:
  percent: numeric_percent_0_to_100
  speed_multiplier: playback_multiplier
  angle_deg: degrees
  interval_ms: milliseconds
  count: integer
  stagger_ms: milliseconds
side_semantics:
  enemy: 敵側に表示
  ally: 味方側に表示
effects:
  "01_単体斬撃":
    enemy: { display_size_percent: 55, angle_deg: 0, speed_multiplier: 1.25 }
    ally:  { display_size_percent: 35, angle_deg: 0, speed_multiplier: 1.25 }
  "02_単体回復":
    enemy: { display_size_percent: 60, speed_multiplier: 1.0, mist_opacity_percent: 80 }
    ally:  { display_size_percent: 40, speed_multiplier: 1.0, mist_opacity_percent: 80 }
  "03_ATK上昇":
    enemy: { display_size_percent: 60, speed_multiplier: 1.0, mist_opacity_percent: 80 }
    ally:  { display_size_percent: 40, speed_multiplier: 1.0, mist_opacity_percent: 80 }
  "04_毒":
    enemy: { display_size_percent: 60, speed_multiplier: 1.0, mist_opacity_percent: 30, skull_opacity_percent: 75, poison_particle_opacity_percent: 80 }
    ally:  { display_size_percent: 50, speed_multiplier: 1.0, mist_opacity_percent: 30, skull_opacity_percent: 75, poison_particle_opacity_percent: 80 }
  "05_射撃・飛び道具":
    enemy: { display_size_percent: 65, speed_multiplier: 1.6, light_opacity_percent: 100 }
    ally:  { display_size_percent: 45, speed_multiplier: 1.6, light_opacity_percent: 100 }
  "06_単体打撃":
    enemy: { display_size_percent: 55, speed_multiplier: 1.1, mist_opacity_percent: 30, shockwave_opacity_percent: 55, particle_opacity_percent: 90 }
    ally:  { display_size_percent: 35, speed_multiplier: 1.1, mist_opacity_percent: 30, shockwave_opacity_percent: 55, particle_opacity_percent: 90 }
  "07_DEF上昇":
    enemy: { display_size_percent: 60, speed_multiplier: 1.0, mist_opacity_percent: 80 }
    ally:  { display_size_percent: 40, speed_multiplier: 1.0, mist_opacity_percent: 80 }
  "08_SPD上昇":
    enemy: { display_size_percent: 60, speed_multiplier: 1.0, mist_opacity_percent: 80 }
    ally:  { display_size_percent: 40, speed_multiplier: 1.0, mist_opacity_percent: 80 }
  "09_ATK低下":
    enemy: { display_size_percent: 60, speed_multiplier: 1.0, mist_opacity_percent: 80 }
    ally:  { display_size_percent: 40, speed_multiplier: 1.0, mist_opacity_percent: 80 }
  "10_DEF低下":
    enemy: { display_size_percent: 60, speed_multiplier: 1.0, mist_opacity_percent: 80 }
    ally:  { display_size_percent: 40, speed_multiplier: 1.0, mist_opacity_percent: 80 }
  "11_暗闇":
    enemy: { display_size_percent: 65, speed_multiplier: 1.0, mist_opacity_percent: 100, smoke_streak_opacity_percent: 45 }
    ally:  { display_size_percent: 35, speed_multiplier: 1.0, mist_opacity_percent: 100, smoke_streak_opacity_percent: 45 }
  "12_沈黙":
    enemy: { display_size_percent: 45, speed_multiplier: 1.0, seal_circle_opacity_percent: 70, talisman_opacity_percent: 90 }
    ally:  { display_size_percent: 30, speed_multiplier: 1.0, seal_circle_opacity_percent: 70, talisman_opacity_percent: 90 }
  "13_スタン":
    enemy: { display_size_percent: 55, speed_multiplier: 1.0, electric_opacity_percent: 80 }
    ally:  { display_size_percent: 40, speed_multiplier: 1.0, electric_opacity_percent: 80 }
  "14_全体斬撃":
    enemy: { speed_multiplier: 1.0, slash_size_percent: 100, slash_opacity_percent: 90, slash_count: 7 }
    ally:  { speed_multiplier: 1.0, slash_size_percent: 100, slash_opacity_percent: 90, slash_count: 7 }
  "15_全体衝撃":
    enemy: { shockwave_count: 8, overall_size_percent: 100, spawn_interval_ms: 120, expansion_speed_multiplier: 1.0, shockwave_opacity_percent: 100, haze_opacity_percent: 20, hit_light_opacity_percent: 80 }
    ally:  { shockwave_count: 8, overall_size_percent: 100, spawn_interval_ms: 120, expansion_speed_multiplier: 1.0, shockwave_opacity_percent: 100, haze_opacity_percent: 20, hit_light_opacity_percent: 80 }
  "16_全体回復陣":
    enemy: { light_size_percent: 100, speed_multiplier: 1.0, stagger_ms: 70, wide_aura_opacity_percent: 25, mist_opacity_percent: 55, cross_opacity_percent: 80 }
    ally:  { light_size_percent: 100, speed_multiplier: 1.0, stagger_ms: 70, wide_aura_opacity_percent: 25, mist_opacity_percent: 55, cross_opacity_percent: 80 }
```

## 表記注記

| 対象 | 受領した表記 | この文書の項目 | 解釈 |
| --- | --- | --- | --- |
| 11_暗闇 | 画面比率 | `display_size_percent` | 敵65%、味方35%の表示サイズ |
| 12_沈黙 | 封印門濃さ | `seal_circle_opacity_percent` | 回転する封印紋の濃さ。もし門の別素材を指す場合は要確認 |
| 15_全体衝撃 | モラの濃さ | `haze_opacity_percent` | 背景の靄（もや）の濃さ |
| 16_全体回復陣 | 従事の濃さ | `cross_opacity_percent` | 小さな十字群の濃さ |

## 実装時の確認

- `display_size_percent` と `light_size_percent`、`overall_size_percent`、`slash_size_percent` はそれぞれ該当モックの対応スライダーの値を指す。異なるエフェクト間で同じCSS幅と見なさない。
- 全体攻撃・全体回復は敵味方で数値が同じでも、対象位置と人数は各モックの切替に従う。
- 16_全体回復陣の十字は、単一の大きな十字に切り出さず、複数の小さな十字を含む透過素材を使う。
