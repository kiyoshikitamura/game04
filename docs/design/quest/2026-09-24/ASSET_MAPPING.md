# 出陣 UI 素材対応表（2026-09-24）

正式数値と表示部品を保持して今回再仕上げ。添付画像は配置・意匠の比較基準のみ。仮ボス、仮消費値、旧名称は採用しない。

| 用途 | 素材・対応元 | 使用方法 |
|---|---|---|
| エリア背景 | `src/theme/local-backgrounds.json` → `QUEST_AREAS` | 既存エリア割当を保持。背景主体の縦長カード、比率維持 cover |
| ボス | `data/quest65.json` bindings → `sengoku-characters.json` → `local-characters.json` battle | 最終 Wave の boss 指定、無指定時は最大 Lv・同 Lv 最大 HP の敵。正式 ID に結合 |
| 準備武将・詳細 | `CHARACTER_MASTERS` ID → `local-characters.json` card | 共通 CharacterCard を再利用。フレームの開口部・人物合成は共通管理 |
| 武将背景 | `character-backgrounds.json` | 共通カード内の正式 ID 割当 |
| カード枠 | `public/creative/ui/frame-{N,R,SR,SSR}.png` | 元比率・開口部を変更しない |
| 属性 | `public/creative/ui/element-{element}.png` | 共通 ElementBadge、画像の下の独立領域 |
| レアリティ | 正式 master rarity の文字 | 共通 RarityBadge の正式画像割当が全 null のため文字で表示。旧 GAME03 画像は使用しない |
| 装着スキル | `BattleUnit.skills` → `local-skills.json` sourceId | ID で既存正式画像へ結合。名前・性能・消費 SP は既存データを維持 |
| 未装着・未解放枠 | `getSkillSlots(awakening)` | state.characters の覚醒段階で区別。実行不可の枠に偽の追加 CTA を置かない |
| 行動力 | `/ui/sengoku/14-energy.png` | 正式 icon。絵文字は使用しない |
| Wave | `/ui/sengoku/05-crossed-swords.png` | 正式 icon |
| ヒント | `/ui/sengoku/02-scroll-top.png` | 正式 icon |
| 報酬導線 | `/ui/sengoku/01-gift.png` | 正式 icon |
| 攻略状態・共通 SP | `/ui/sengoku/07-flower-crest.png` | 状態は縦札、SP は独立パネル |
| 銭 | `/ui/sengoku/13-coin.png` | 正式報酬 kind に対応 |
| 武将 EXP・装備 EXP | `/items/{char,equip}_exp_{s,m,l}.png` | 正式 size ID を参照。今回65ステージは small/medium |
| 魂・武将 | roster ID → characterArt portrait | 対象武将の正式画像。魂の数量・名称は報酬データ |
| スペシャル券 | `/items/special_ticket_{character,skill,equipment}.png` | 正式 reward ID から対応 |
| 領土侵攻札 | `/creative/items/territory-invasion-ticket.png` | 旧 energy_drink の誤代用を解消 |

## 不足・判断が必要な事項

- レアリティ単体画像は共通部品で正式割当未供給。文字情報は表示可能。旧由来画像は使用しない。
- 既存 `QUEST_AREAS` は `local-backgrounds` の先頭10件を順番に利用しており、三河に「雪の春日山城」、尾張に「青葉城と仙台城下」など地名との不一致がある。今回、無承認で別背景や生成素材へ差替えていない。素材選択の正式対応表を今後確定する必要がある。
- モックの細密な角飾り・錠前専用素材は正式割当なし。既存カード枠・状態文字で構成し、絵文字や別用途の鍵画像を代用していない。

## 読み込み

準備画面は武将画像・背景・枠・属性画像すべての preload/decode 完了まで、出撃・詳細・編成変更を無効化する。失敗時には再読込を表示する。共通 CharacterCard 自体の画像準備待ちも維持。
