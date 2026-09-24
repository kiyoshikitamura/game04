# キャラ配下の素材・正式データ対応（2026-09-24）

この記録は `d9f08b8` を基準に再開した作業の照合結果。既存正式素材の対応と、未承認の対応を区別する。Production変更・既存所持データ移行は実施していない。

## 接続できる既存正式素材

| ID | 正式名称 | ファイル | 確認 |
|---|---|---|---|
| CHAR_EXP_S | 修練の兵糧丸・小 | `public/items/char_exp_s.png` | 実ファイルあり |
| CHAR_EXP_M | 修練の兵糧丸・中 | `public/items/char_exp_m.png` | 実ファイルあり |
| CHAR_EXP_L | 修練の兵糧丸・大 | `public/items/char_exp_l.png` | 実ファイルあり |
| EQUIP_EXP_S | 鍛錬の砥石・小 | `public/items/equip_exp_s.png` | 実ファイルあり |
| EQUIP_EXP_M | 鍛錬の砥石・中 | `public/items/equip_exp_m.png` | 実ファイルあり |
| EQUIP_EXP_L | 鍛錬の砥石・大 | `public/items/equip_exp_l.png` | 実ファイルあり |
| SKILL_MANUAL | 奥義指南書 | `public/items/skill_manual.png` | 実ファイルあり |
| EQUIP_LB_PART | 鍛冶の秘鋼 | `public/items/equip_lb_part.png` | 実ファイルあり |

- 装備：`src/domain/redesign/data/formal-growth-equipment.json` の160 IDが一意。`config/game04-master-assets.json` に160/160対応し、公開画像160/160が存在。正式能力値は `formalGrowthMasters.ts` から接続。名称は `src/theme/sengoku-masters.json`、個体は instanceId で区別する。
- キャラ：人物は既存GAME04名簿、固定背景は `src/theme/character-backgrounds.json`、フレームは `public/creative/ui/frame-{N,R,SR,SSR}.png` の既存共通表示部品を使用する。未承認の旧レアリティ画像は使用せず、レアリティは人物から独立した文字領域で示す。
- スキルLB素材は奥義指南書、装備LB素材は鍛冶の秘鋼。覚醒の秘巻を魂の代用品にはしない。

## 今回追加接続した承認済み装飾

`docs/design/raid/2026-09-23/WORK_ASSET_MAPPING.md` の17点採用記録を根拠とし、`public/ui/raid/v2/people.png`（おまかせ編成）、`armor.png`（おまかせ装備）、`scroll.png`（おまかせスキル）、`panel-sakura-overlay.png`（見出し・Dialogの桜装飾）を使用。新規意匠の独自採用ではない。4点とも画像準備判定に含める。

## 不足素材と必要な採用判断

| 対象 | 点数 | 既存素材で解決できるか | 必要な判断 |
|---|---:|---|---|
| キャラEXP特大・装備EXP特大 | 2 | 同IDの正式対応なし。大アイコンの黙った流用は不可 | 新規制作、または大との共通画像利用を一括採用 |
| 汎用魂 N/R/SR/SSR | 4 | 正式対応なし | 新規制作または承認済み魂図柄への対応指定 |
| 魂選択券 N/R/SR/SSR | 4 | 正式対応なし | 新規制作または承認済み券図柄への対応指定 |

現行対応表にはXL・SOUL・SELECTの素材IDがない。モックに描かれたアイコンを正式素材承認とは扱わない。採用まで正確な素材名・数量を文字で表示し、無関係な図柄・GAME03画像で穴埋めしない。必要画像の新規制作はこの10点をまとめて判断する。

## スキル正式72件の接続に残る外部判断

正式数値の保存先は `src/domain/redesign/data/raid-skill-values.json`（72件×LB0〜10＝792行）。現在の所持/編成用 `SKILL_MASTERS` は既存 `SKILL_*` 50件を引き継いでおり、正式 `SKD001`〜`SKD072` と同じID集合ではない。

`docs/product/master_sources_20260921/balance.md` は「SKD番号は設計用であり既存IDへの上書き指定ではない」と明記している。最新Master正本第8節も名称・素材の最終対応を未完了としている。

必要なのは、旧50件→正式72件の対応、対応しない所持品の保持方針、既存LB/編成の引継ぎ、正式名称と画像の対応の一括決定。番号順の推測で置換しない。対応未確定の状態を正式Master接続完了と報告しない。

## 初期付与の既知不一致

最新Master正本第7節は、R氏康・R直政・Rお市の3体、N応急手当/R火単体/N土単体の3スキル、N武器攻撃/N胴標準の2装備をLv1・覚醒/LB0で直接付与する仕様。

再開基準の `createInitialState` はN5体・旧8スキル・装備なし。親担当による初期編成3枠への修正は枠解放の是正であり、正式初期付与の完成とは別。既存ユーザーの所持品を削除・置換しない。新規付与用スキルの正式ID/素材接続と同時に新規アカウントの正式starterを受け入れる必要がある。

## 検証区分

上記160件・792行・画像存在数はローカル正式データ照合。実API所持データ・ブラウザ表示・画像内容の再確認を代替しない。実操作とモック比較の結果は独立検証記録へ分離する。
