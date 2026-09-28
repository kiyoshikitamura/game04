# GAME04 正式レイドMaster接続対応表

実装版：GAME04_RAID_FORMAL_20260923。実戦受入・配信済みを意味しない。

正本：docs/product/GAME04_MASTER_AUTHORITY_LATEST_2026-09-21.md、master_sources_20260921/encounter.md・invasion.md・rewards.md・equipment_drops.md。

## 既存保持と接続

- 新規EncounterはraidSnapshotへ正式85出現の選択結果を保存。旧encounter_flame/unlock_shadowはlookupを保持し再計算しない。
- 新規侵攻は開催時に通常8戦を制約適合組合せから均等抽選、関門3戦＋城主1戦と共にterritorySnapshotへ固定。開始済みbattle.inputは従来通り再利用。
- 敵開始SP満タン、被弾SP10、最大3体。正式表の敵数値にプレイアブル役割倍率を加えない。
- 個人勝利は即時付与（魂抽選は開始編成LUK÷400補正）、敗北は0。討伐報酬は同開催3勝資格の時点で確定、後日の資格達成で遡及しない。
- 開始段階の戦闘は現在段階と一致する場合だけ共有HPへ反映。参加段階以降の突破済み段階に開催中のみ再挑戦可能。
- 素材：武将画像は正式characterIdの/creative/characters/battle/。正式レイド背景・丸形属性素材は別素材工程で管理し、代用品をここで設定しない。

## 未承認の主催条件

既存DBは安土Lv1／EXP100、岐阜Lv2／EXP100の暫定設定。正本は岡崎・長浜・春日山・躑躅ヶ崎館・安土の5城だが主催Lv／EXP補完案は未承認。安土の既存条件だけ保持、旧岐阜は互換経路として保持。正式他4城はMaster接続済みだが「主催解放条件・主催者EXPの設定待ち」で開催不可。requiredLevel=1/clearExp=0はdisabled行のschema placeholderで採用値ではない。同時主催1件は確定仕様へ修正。

## Encounter 85組合せ

|実装ID|設計ID|人物ID|武将|エリア|敵Lv|HP|ATK|DEF|共有HP|画像|
|---|---|---|---|---:|---:|---:|---:|---:|---:|---|
|encounter_a1_ERB01|ERB01|char_noa_01|柴田勝家|1|10|6500|480|80|39000|/creative/characters/battle/char_noa_01.png|
|encounter_a2_ERB01|ERB01|char_noa_01|柴田勝家|2|16|10400|710|130|93600|/creative/characters/battle/char_noa_01.png|
|encounter_a2_ERB02|ERB02|char_cecile_01|井伊直虎|2|15|10730|530|150|96570|/creative/characters/battle/char_cecile_01.png|
|encounter_a3_ERB02|ERB02|char_cecile_01|井伊直虎|3|25|20350|880|270|244200|/creative/characters/battle/char_cecile_01.png|
|encounter_a3_ERB03|ERB03|char_takuro_01|雑賀孫市|3|27|20700|1220|230|248400|/creative/characters/battle/char_takuro_01.png|
|encounter_a3_ERB04|ERB04|char_taiga_01|長宗我部元親|3|26|21560|1020|280|258720|/creative/characters/battle/char_taiga_01.png|
|encounter_a3_ERB16|ERB16|char_leo_01|伊達政宗|3|30|30000|1080|330|360000|/creative/characters/battle/char_leo_01.png|
|encounter_a4_ERB05|ERB05|char_leon_01|加藤清正|4|35|41600|1240|600|748800|/creative/characters/battle/char_leon_01.png|
|encounter_a4_ERB06|ERB06|char_lucas_01|島津義弘|4|37|35200|1940|370|633600|/creative/characters/battle/char_lucas_01.png|
|encounter_a4_ERB07|ERB07|char_sora_01|立花誾千代|4|36|33600|1330|400|604800|/creative/characters/battle/char_sora_01.png|
|encounter_a4_ERB17|ERB17|char_kengo_01|本多忠勝|4|40|65000|1670|800|1170000|/creative/characters/battle/char_kengo_01.png|
|encounter_a4_ERB18|ERB18|char_kaede_01|真田幸村|4|40|50000|2400|460|900000|/creative/characters/battle/char_kaede_01.png|
|encounter_a5_ERB08|ERB08|char_rui_01|直江兼続|5|45|57750|2350|660|1386000|/creative/characters/battle/char_rui_01.png|
|encounter_a5_ERB09|ERB09|char_genji_01|今川義元|5|47|74750|2020|1000|1794000|/creative/characters/battle/char_genji_01.png|
|encounter_a5_ERB10|ERB10|char_reina_01|毛利元就|5|46|60500|2440|690|2032800|/creative/characters/battle/char_reina_01.png|
|encounter_a5_ERB19|ERB19|char_koharu_01|上杉謙信|5|50|81250|3540|700|1950000|/creative/characters/battle/char_koharu_01.png|
|encounter_a5_ERB20|ERB20|char_karen_01|徳川家康|5|50|105630|2460|1230|2535120|/creative/characters/battle/char_karen_01.png|
|encounter_a6_ERB11|ERB11|char_maya_01|服部半蔵|6|55|84000|2970|930|2520000|/creative/characters/battle/char_maya_01.png|
|encounter_a6_ERB12|ERB12|char_tetsu_01|黒田官兵衛|6|57|90300|3150|990|2709000|/creative/characters/battle/char_tetsu_01.png|
|encounter_a6_ERB13|ERB13|char_riki_01|濃姫|6|56|107900|2720|1410|3237000|/creative/characters/battle/char_riki_01.png|
|encounter_a6_ERB21|ERB21|char_miyabi_01|明智光秀|6|60|124690|3760|1200|3740700|/characters/miyabi_transparent_asset.png|
|encounter_a6_ERB22|ERB22|char_go_01|武田信玄|6|60|130630|4180|1270|3918900|/creative/characters/battle/char_go_01.png|
|encounter_a7_ERB14|ERB14|char_sakura_01|真田昌幸|7|65|120750|4010|1310|4347000|/creative/characters/battle/char_sakura_01.png|
|encounter_a7_ERB15|ERB15|char_seiya_01|石田三成|7|67|159900|3770|2050|8058960|/creative/characters/battle/char_seiya_01.png|
|encounter_a7_ERB05|ERB05|char_leon_01|加藤清正|7|65|149500|3560|1930|5382000|/creative/characters/battle/char_leon_01.png|
|encounter_a7_ERB23|ERB23|char_mio_01|前田慶次|7|70|168750|6450|1410|6075000|/creative/characters/battle/char_mio_01.png|
|encounter_a7_ERB24|ERB24|char_ageha_01|豊臣秀吉|7|70|185630|5050|1760|6682680|/creative/characters/battle/char_ageha_01.png|
|encounter_a7_ERB17|ERB17|char_kengo_01|本多忠勝|7|70|219380|4490|2460|7897680|/creative/characters/battle/char_kengo_01.png|
|encounter_a8_ERB07|ERB07|char_sora_01|立花誾千代|8|76|162000|4870|1820|6804000|/creative/characters/battle/char_sora_01.png|
|encounter_a8_ERB03|ERB03|char_takuro_01|雑賀孫市|8|77|166500|6990|1670|6993000|/creative/characters/battle/char_takuro_01.png|
|encounter_a8_ERB06|ERB06|char_lucas_01|島津義弘|8|77|166500|6990|1670|6993000|/creative/characters/battle/char_lucas_01.png|
|encounter_a8_ERB25|ERB25|char_reiji_01|織田信長|8|80|225000|8220|2020|9450000|/creative/characters/battle/char_reiji_01.png|
|encounter_a8_ERB16|ERB16|char_leo_01|伊達政宗|8|80|225000|5860|2280|9450000|/creative/characters/battle/char_leo_01.png|
|encounter_a8_ERB19|ERB19|char_koharu_01|上杉謙信|8|80|225000|8220|2020|9450000|/creative/characters/battle/char_koharu_01.png|
|encounter_a8_ERB18|ERB18|char_kaede_01|真田幸村|8|80|225000|8220|2020|9450000|/creative/characters/battle/char_kaede_01.png|
|encounter_a9_ERB01|ERB01|char_noa_01|柴田勝家|9|86|216000|8510|2270|10368000|/creative/characters/battle/char_noa_01.png|
|encounter_a9_ERB02|ERB02|char_cecile_01|井伊直虎|9|85|231000|6530|2750|11088000|/creative/characters/battle/char_cecile_01.png|
|encounter_a9_ERB03|ERB03|char_takuro_01|雑賀孫市|9|87|222000|8680|2340|10656000|/creative/characters/battle/char_takuro_01.png|
|encounter_a9_ERB04|ERB04|char_taiga_01|長宗我部元親|9|86|237600|7400|2840|11404800|/creative/characters/battle/char_taiga_01.png|
|encounter_a9_ERB05|ERB05|char_leon_01|加藤清正|9|85|273000|5800|3850|13104000|/creative/characters/battle/char_leon_01.png|
|encounter_a9_ERB06|ERB06|char_lucas_01|島津義弘|9|87|222000|8680|2340|10656000|/creative/characters/battle/char_lucas_01.png|
|encounter_a9_ERB07|ERB07|char_sora_01|立花誾千代|9|86|216000|6070|2560|10368000|/creative/characters/battle/char_sora_01.png|
|encounter_a9_ERB08|ERB08|char_rui_01|直江兼続|9|85|231000|7250|2750|11088000|/creative/characters/battle/char_rui_01.png|
|encounter_a9_ERB09|ERB09|char_genji_01|今川義元|9|87|288600|6040|4100|13852800|/creative/characters/battle/char_genji_01.png|
|encounter_a9_ERB10|ERB10|char_reina_01|毛利元就|9|86|237600|7400|2840|15966720|/creative/characters/battle/char_reina_01.png|
|encounter_a9_ERB11|ERB11|char_maya_01|服部半蔵|9|85|220500|6530|2610|10584000|/creative/characters/battle/char_maya_01.png|
|encounter_a9_ERB12|ERB12|char_tetsu_01|黒田官兵衛|9|87|233100|6800|2780|11188800|/creative/characters/battle/char_tetsu_01.png|
|encounter_a9_ERB13|ERB13|char_riki_01|濃姫|9|86|280800|5920|3980|13478400|/creative/characters/battle/char_riki_01.png|
|encounter_a9_ERB14|ERB14|char_sakura_01|真田昌幸|9|85|220500|6530|2610|10584000|/creative/characters/battle/char_sakura_01.png|
|encounter_a9_ERB15|ERB15|char_seiya_01|石田三成|9|87|288600|6040|4100|19393920|/creative/characters/battle/char_seiya_01.png|
|encounter_a9_ERB16|ERB16|char_leo_01|伊達政宗|9|90|300000|7220|3170|14400000|/creative/characters/battle/char_leo_01.png|
|encounter_a9_ERB17|ERB17|char_kengo_01|本多忠勝|9|90|390000|7040|4930|18720000|/creative/characters/battle/char_kengo_01.png|
|encounter_a9_ERB18|ERB18|char_kaede_01|真田幸村|9|90|300000|10120|2820|14400000|/creative/characters/battle/char_kaede_01.png|
|encounter_a9_ERB19|ERB19|char_koharu_01|上杉謙信|9|90|300000|10120|2820|14400000|/creative/characters/battle/char_koharu_01.png|
|encounter_a9_ERB20|ERB20|char_karen_01|徳川家康|9|90|390000|7040|4930|18720000|/creative/characters/battle/char_karen_01.png|
|encounter_a9_ERB21|ERB21|char_miyabi_01|明智光秀|9|90|315000|7920|3340|15120000|/characters/miyabi_transparent_asset.png|
|encounter_a9_ERB22|ERB22|char_go_01|武田信玄|9|90|330000|8800|3520|15840000|/creative/characters/battle/char_go_01.png|
|encounter_a9_ERB23|ERB23|char_mio_01|前田慶次|9|90|300000|10120|2820|14400000|/creative/characters/battle/char_mio_01.png|
|encounter_a9_ERB24|ERB24|char_ageha_01|豊臣秀吉|9|90|330000|7920|3520|15840000|/creative/characters/battle/char_ageha_01.png|
|encounter_a9_ERB25|ERB25|char_reiji_01|織田信長|9|90|300000|10120|2820|14400000|/creative/characters/battle/char_reiji_01.png|
|encounter_a10_ERB01|ERB01|char_noa_01|柴田勝家|10|96|282000|10440|3180|15228000|/creative/characters/battle/char_noa_01.png|
|encounter_a10_ERB02|ERB02|char_cecile_01|井伊直虎|10|95|302500|8010|3850|16335000|/creative/characters/battle/char_cecile_01.png|
|encounter_a10_ERB03|ERB03|char_takuro_01|雑賀孫市|10|97|289000|10650|3290|15606000|/creative/characters/battle/char_takuro_01.png|
|encounter_a10_ERB04|ERB04|char_taiga_01|長宗我部元親|10|96|310200|9080|3980|16750800|/creative/characters/battle/char_taiga_01.png|
|encounter_a10_ERB05|ERB05|char_leon_01|加藤清正|10|95|357500|7120|5390|19305000|/creative/characters/battle/char_leon_01.png|
|encounter_a10_ERB06|ERB06|char_lucas_01|島津義弘|10|97|289000|10650|3290|15606000|/creative/characters/battle/char_lucas_01.png|
|encounter_a10_ERB07|ERB07|char_sora_01|立花誾千代|10|96|282000|7450|3580|15228000|/creative/characters/battle/char_sora_01.png|
|encounter_a10_ERB08|ERB08|char_rui_01|直江兼続|10|95|302500|8900|3850|16335000|/creative/characters/battle/char_rui_01.png|
|encounter_a10_ERB09|ERB09|char_genji_01|今川義元|10|97|375700|7410|5750|20287800|/creative/characters/battle/char_genji_01.png|
|encounter_a10_ERB10|ERB10|char_reina_01|毛利元就|10|96|310200|9080|3980|23451120|/creative/characters/battle/char_reina_01.png|
|encounter_a10_ERB11|ERB11|char_maya_01|服部半蔵|10|95|288750|8010|3660|15592500|/creative/characters/battle/char_maya_01.png|
|encounter_a10_ERB12|ERB12|char_tetsu_01|黒田官兵衛|10|97|303450|8330|3900|16386300|/creative/characters/battle/char_tetsu_01.png|
|encounter_a10_ERB13|ERB13|char_riki_01|濃姫|10|96|366600|7260|5570|19796400|/creative/characters/battle/char_riki_01.png|
|encounter_a10_ERB14|ERB14|char_sakura_01|真田昌幸|10|95|288750|8010|3660|15592500|/creative/characters/battle/char_sakura_01.png|
|encounter_a10_ERB15|ERB15|char_seiya_01|石田三成|10|97|375700|7410|5750|28402920|/creative/characters/battle/char_seiya_01.png|
|encounter_a10_ERB16|ERB16|char_leo_01|伊達政宗|10|100|387500|8840|4460|20925000|/creative/characters/battle/char_leo_01.png|
|encounter_a10_ERB17|ERB17|char_kengo_01|本多忠勝|10|100|503750|8620|6930|27202500|/creative/characters/battle/char_kengo_01.png|
|encounter_a10_ERB18|ERB18|char_kaede_01|真田幸村|10|100|387500|12400|3960|20925000|/creative/characters/battle/char_kaede_01.png|
|encounter_a10_ERB19|ERB19|char_koharu_01|上杉謙信|10|100|387500|12400|3960|20925000|/creative/characters/battle/char_koharu_01.png|
|encounter_a10_ERB20|ERB20|char_karen_01|徳川家康|10|100|503750|8620|6930|27202500|/creative/characters/battle/char_karen_01.png|
|encounter_a10_ERB21|ERB21|char_miyabi_01|明智光秀|10|100|406880|9700|4700|21971520|/characters/miyabi_transparent_asset.png|
|encounter_a10_ERB22|ERB22|char_go_01|武田信玄|10|100|426250|10780|4950|23017500|/creative/characters/battle/char_go_01.png|
|encounter_a10_ERB23|ERB23|char_mio_01|前田慶次|10|100|387500|12400|3960|20925000|/creative/characters/battle/char_mio_01.png|
|encounter_a10_ERB24|ERB24|char_ageha_01|豊臣秀吉|10|100|426250|9700|4950|23017500|/creative/characters/battle/char_ageha_01.png|
|encounter_a10_ERB25|ERB25|char_reiji_01|織田信長|10|100|387500|12400|3960|20925000|/creative/characters/battle/char_reiji_01.png|

## 侵攻5城

|正式ID|城|城主ID|段階|個人勝利銭|個人EXP（武将/装備）|
|---|---|---|---:|---:|---|
|TI01|岡崎城|char_karen_01|12|2500|1000/500|
|TI02|長浜城|char_ageha_01|12|4000|2000/1000|
|TI03|春日山城|char_koharu_01|12|6000|3000/1500|
|TI04|躑躅ヶ崎館|char_go_01|12|8000|4000/2000|
|TI05|安土城|char_reiji_01|12|10000|5000/2500|

24通常候補・原資料数値・120城別HP・20固定編成・39固定個体は src/domain/redesign/data/raid-invasion.json。全120候補HP合計は侵攻正本第10節Hと一致。現行Quest仮FIXによる後付け数値・フェーズ変更を侵攻へ流用しない。

## 報酬素材識別子

|正式資源|内部識別子|
|---|---|
|武将固有魂|soul＋characterId|
|武将EXP/装備EXP|character_exp_item/equipment_exp_item＋small/medium/large/xlarge|
|スキルLB|skill_material|
|装備LB|equipment_lb|
|キャラ/スキル/装備券|ticket＋SPECIAL_TICKET_CHARACTER/SKILL/EQUIPMENT|
|侵攻令|raid_unlock（既存在庫materials.unlock）|

DB適用用：scripts/game04_raid_formal_host.sql、scripts/game04_raid_formal_master.sql。実際の適用・Edge配信・Preview実操作の結果は統合記録を参照。
