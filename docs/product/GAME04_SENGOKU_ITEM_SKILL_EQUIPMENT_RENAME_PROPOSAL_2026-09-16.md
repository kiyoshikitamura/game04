# GAME04 / 戦国姫艶武
# アイテム・スキル・装備 戦国世界観名称変更案
## 2026-09-16

## 文書ステータス

- ステータス: **名称案 / REVIEW**
- 参照Authority: GAME03 Production canonical master（2026-09-16 READ ONLY確認）
- Item: 18件 / Skill: 70件 / Equipment: 170件
- 画像制作: **後工程へ延期**
- DB変更・Migration・実装変更は行わない。

## 変更禁止事項

内部ID、効果、数値、レアリティ、発動条件、対象範囲、成長・覚醒仕様、排出率、DBロジック、装備カテゴリ、固有効果、専用装備・専用スキル性能はGAME03 Authorityを維持する。GAME04では原則として表示名称と画像のみを戦国世界観へ置換する。

専用Skill / 専用EquipmentのGAME03 `char_*` 対応は、GAME04の60武将への最終割当時に別途FIXする。

## 命名方針

- 現代ストリート、サイバー、英語中心の語彙を戦国世界観へ置換する。
- 武芸、兵法、忍術、薬術、甲冑、刀槍弓、火縄銃、陣太鼓、軍配、護符、根付等を優先する。
- 名称から攻撃・防御・回復・速度・状態異常等の性格が推測できるようにする。
- 汎用装備に実在武将固有名を安易に使用しない。
- 「天下布武」等の著名な固有語は該当武将専用要素へ温存する。

# Item 18件

| ID | GAME03現名称 | GAME04名称案 |
|---|---|---|
| AWAKENING_BOOK | 覚醒の書 | **覚醒の秘巻** |
| CHAR_EXP_S | 強化ドリンク・小 | **修練の兵糧丸・小** |
| CHAR_EXP_M | 強化ドリンク・中 | **修練の兵糧丸・中** |
| CHAR_EXP_L | 強化ドリンク・大 | **修練の兵糧丸・大** |
| ENERGY_DRINK | エナジードリンク | **活力丸** |
| EQUIP_EXP_S | カスタムオイル・小 | **鍛錬の砥石・小** |
| EQUIP_EXP_M | カスタムオイル・中 | **鍛錬の砥石・中** |
| EQUIP_EXP_L | カスタムオイル・大 | **鍛錬の砥石・大** |
| EQUIP_LB_PART | 改造パーツ | **鍛冶の秘鋼** |
| NORMAL_GACHA_TICKET_CHARACTER | キャラクターガチャチケット | **姫武将召喚札** |
| NORMAL_GACHA_TICKET_SKILL | スキルガチャチケット | **戦技召喚札** |
| NORMAL_GACHA_TICKET_EQUIPMENT | 装備ガチャチケット | **武具召喚札** |
| PVP_POINT_TICKET | ファイトチケット | **決闘状** |
| RAID_POINT_TICKET | レイドチケット | **討伐令** |
| SKILL_MANUAL | スキル指南書 | **奥義指南書** |
| SPECIAL_TICKET_CHARACTER | SPキャラクターチケット | **特選・姫武将召喚札** |
| SPECIAL_TICKET_SKILL | SPスキルチケット | **特選・戦技召喚札** |
| SPECIAL_TICKET_EQUIPMENT | SP装備チケット | **特選・武具召喚札** |

# Skill 70件

| ID | Rarity | Kind | GAME03現名称 | GAME04名称案 |
|---|---|---|---|---|
| SKILL_001 | N | NORMAL | ストリートパンチ | **一文字斬り** |
| SKILL_002 | N | NORMAL | クイックシールド | **竹束の守り** |
| SKILL_003 | N | NORMAL | ノイズヒール | **薬師の手当** |
| SKILL_004 | N | NORMAL | ステップダッシュ | **疾風の足運び** |
| SKILL_005 | N | NORMAL | 毒針 | **忍法・毒針** |
| SKILL_006 | N | NORMAL | アイアンガード | **鉄壁の構え** |
| SKILL_007 | N | NORMAL | 罵詈雑言 | **挑発の鬨** |
| SKILL_008 | N | NORMAL | スマートスナイプ | **弓取りの一射** |
| SKILL_009 | N | NORMAL | ドーピング注射 | **奮起の陣太鼓** |
| SKILL_010 | N | NORMAL | ライトフラッシュ | **目潰し粉** |
| SKILL_011 | R | NORMAL | チャージスラッシュ | **渾身の太刀** |
| SKILL_012 | R | NORMAL | 大旋風パイプ | **薙刀・大旋風** |
| SKILL_013 | R | NORMAL | フィールド応急手当 | **薬師の応急手当** |
| SKILL_014 | R | NORMAL | スモークスクリーン | **煙幕の守陣** |
| SKILL_015 | R | NORMAL | 強酸アジドスプレー | **破甲の火薬玉** |
| SKILL_016 | R | NORMAL | ライオットバリア | **仁王立ち・竹束盾** |
| SKILL_017 | R | NORMAL | 不屈の怒号 | **鬨の声** |
| SKILL_018 | R | NORMAL | 高圧電撃警棒 | **金砕棒・脳天撃ち** |
| SKILL_019 | R | NORMAL | バーストラッシュ | **血吸いの連刃** |
| SKILL_020 | R | NORMAL | タクティカルリロード | **早駆けの号令** |
| SKILL_021 | SR | NORMAL | 急所撃ち | **急所射ち** |
| SKILL_022 | SR | NORMAL | 重鉄パイプ大薙ぎ | **大薙刀・鎧崩し** |
| SKILL_023 | SR | NORMAL | 軍用止血パック | **秘薬・金創膏** |
| SKILL_024 | SR | NORMAL | 機動防犯盾陣形 | **竹束・鉄壁陣** |
| SKILL_025 | SR | NORMAL | 催涙ガス噴射 | **忍法・煙玉乱舞** |
| SKILL_026 | SR | NORMAL | 決起のシュプレヒコール | **決起の大号令** |
| SKILL_027 | SR | NORMAL | 血の強襲 | **血風斬り** |
| SKILL_028 | SR | NORMAL | シールドクラッシャー | **鎧通し** |
| SKILL_029 | SR | NORMAL | 継続処置薬 | **薬師の活命術** |
| SKILL_030 | SR | NORMAL | 暗号ジャミング | **乱破・伝令封じ** |
| SKILL_031 | SR | NORMAL | カウンタースパイク | **攻防一体・槍衾** |
| SKILL_032 | SR | NORMAL | 暗器・毒塗りの刃 | **忍法・毒刃** |
| SKILL_033 | SR | NORMAL | 精神統一・明鏡止水 | **明鏡止水** |
| SKILL_034 | SR | NORMAL | フラッシュバン強襲 | **忍法・閃光玉** |
| SKILL_035 | SR | NORMAL | アドレナリンフル開花 | **背水の陣** |
| SKILL_036 | SSR | NORMAL | 一騎当千・無慈悲の一撃 | **奥義・一刀両断** |
| SKILL_037 | SSR | NORMAL | 広域アサルトフルバースト | **奥義・千刃乱舞** |
| SKILL_038 | SSR | NORMAL | 絶対防御・鉄壁の要塞 | **金城鉄壁** |
| SKILL_039 | SSR | NORMAL | 奇跡の野戦救急執刀 | **秘奥義・神医の陣** |
| SKILL_040 | SSR | NORMAL | 漆黒の広域強酸大散布 | **妖術・蝕みの黒霧** |
| SKILL_041 | SSR | NORMAL | 王者の決起・天下布武 | **覇道の大号令** |
| SKILL_042 | SSR | NORMAL | 血宴の絶影・連撃 | **秘奥義・血桜乱舞** |
| SKILL_043 | SSR | NORMAL | 壊滅のグランドスラム | **奥義・地裂大槌** |
| SKILL_044 | SSR | NORMAL | 狂犬の血の復讐 | **背水・修羅返し** |
| SKILL_045 | SSR | NORMAL | 戦術指揮・総攻撃 | **軍略・総攻めの号令** |
| SKILL_046 | SSR | NORMAL | 毒蜘蛛の檻 | **妖術・毒蜘蛛の陣** |
| SKILL_047 | SSR | NORMAL | 反撃の装甲要塞 | **堅陣・反撃の槍衾** |
| SKILL_048 | SSR | NORMAL | 不屈の生命力 | **不屈・命脈の祈り** |
| SKILL_049 | SSR | NORMAL | 無力化の広域閃光爆弾 | **忍法・宵闇封じ** |
| SKILL_050 | SSR | NORMAL | 決戦の一閃・断罪 | **秘奥義・鎧断ち** |
| SKILL_051 | SSR | EXCLUSIVE | 剛拳・一撃必倒 | **剛拳・一撃必倒** |
| SKILL_052 | SSR | EXCLUSIVE | 修羅の猛攻 | **修羅の猛攻** |
| SKILL_053 | SSR | EXCLUSIVE | 喧嘩上等 | **仁王立ち** |
| SKILL_054 | SSR | EXCLUSIVE | 覇王の威圧 | **覇王の威圧** |
| SKILL_055 | SSR | EXCLUSIVE | ネオン・アクセル | **疾風迅雷** |
| SKILL_056 | SSR | EXCLUSIVE | ストリート・フロウ | **風切りの太刀** |
| SKILL_057 | SSR | EXCLUSIVE | 運命の悪戯 | **狐火の戯れ** |
| SKILL_058 | SSR | EXCLUSIVE | 宵闇の幻惑 | **宵闇の幻惑** |
| SKILL_059 | SSR | EXCLUSIVE | 夜の女王 | **戦姫の威光** |
| SKILL_060 | SSR | EXCLUSIVE | 歌舞伎町の切り札 | **秘奥義・命繋ぎ** |
| SKILL_061 | SR | EXCLUSIVE | 鉄拳制圧 | **金剛崩し** |
| SKILL_062 | SR | EXCLUSIVE | ラスト・ブロー | **背水の一太刀** |
| SKILL_063 | SR | EXCLUSIVE | 老獪な構え | **老練の守り** |
| SKILL_064 | SR | EXCLUSIVE | 流水反撃 | **流水反撃** |
| SKILL_065 | SR | EXCLUSIVE | ストリート・ライド | **韋駄天の先駆け** |
| SKILL_066 | SR | EXCLUSIVE | ハイスピード・ラッシュ | **疾風連斬** |
| SKILL_067 | SR | EXCLUSIVE | システム・ジャック | **忍法・口封じ** |
| SKILL_068 | SR | EXCLUSIVE | オール・イン | **乾坤一擲** |
| SKILL_069 | SR | EXCLUSIVE | 紅蓮の一撃 | **紅蓮の一撃** |
| SKILL_070 | SR | EXCLUSIVE | ミッドナイト・コール | **宵闇の呪詛** |

## Skill補足

- `SKILL_041` の「天下布武」は汎用Skillから外し「覇道の大号令」とする。「天下布武」は該当武将専用要素へ温存する。
- `SKILL_051`〜`070` はGAME04武将割当時に名称の最終調整を許容するが、性能は変更しない。

# Equipment 170件

装備はカテゴリ別MDへ分割して保存する。ID、Rarity、基礎値、固定効果、専用条件は変更しない。

- [ACCESSORY 50件](./GAME04_SENGOKU_EQUIPMENT_ACCESSORY_RENAME_PROPOSAL_2026-09-16.md)
- [BODY 30件](./GAME04_SENGOKU_EQUIPMENT_BODY_RENAME_PROPOSAL_2026-09-16.md)
- [HEAD 20件](./GAME04_SENGOKU_EQUIPMENT_HEAD_RENAME_PROPOSAL_2026-09-16.md)
- [LEGS 20件](./GAME04_SENGOKU_EQUIPMENT_LEGS_RENAME_PROPOSAL_2026-09-16.md)
- [WEAPON 50件](./GAME04_SENGOKU_EQUIPMENT_WEAPON_RENAME_PROPOSAL_2026-09-16.md)

## 次工程

1. 名称レビュー
2. 名称FIX
3. GAME04 master / 表示層への名称反映仕様作成
4. Item / Skill / Equipment画像制作仕様作成
5. 画像制作
6. Asset manifest / Repository格納
7. Preview表示確認

**画像制作は名称レビュー完了後まで開始しない。**