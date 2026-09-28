# GAME04 対策価値・再付与圧力の追加検証（第3回）

追加数値FIXなし。既存16体の初回カウント候補を保持。今回は6-2/6-6/7-7を中心に比較。ゲーム実装・DB・配信変更なし。

## 基準と比較範囲

基準ブランチ：codex/game04-upstream-20260918。開始時最新SHA：94330fb53549dbb9a131ccab5a51cd63b1a6e677。第2回で修正した解除Target変換を継承。計算器本体・味方能力値は変更しない。
今回の有効な比較は4,560戦。探索seed1101〜1730の各30戦、採用候補の別seed1801〜1830各30戦。候補間で同じseedを使う。30/30勝利を理論上の100%勝率とは扱わない。
比較対象は前回と同じ育成帯・所持品を置いた監査用編成。実プレイヤーの供給到達や全編成を網羅しない。6-6の解除3枠案は対策を集めた比較用であり、序盤の所持保証ではない。

## 結論

- **6-6：速攻と継戦の違いが出る候補を作成し、別seedでも確認。候補保持。**
- **6-2：解除には残HP面の効果があるが、速度との交換条件。まだ主軸として十分か未判定。**
- **7-7：再付与そのものは成立できるが、解除主軸の価値は不十分。SP増量・反撃置換・DEF増量の探索案を採用しない。**
- 3面を一括合格にしない。全62面の最終受入は未完了。

## 6-6の保持候補

初回カウント候補に、次の差分を重ねた監査用案。既存スキルのLBは敵個別表の値を維持。その他の敵、全敵のHP/DEFは変更しない。

|敵|候補変更|狙い|
|---|---|---|
|W1 浅井長政|通常のみ→SKD030（蝕み討ち）、開始SP0→100、初回6→5、ATK1,550→2,325|元親の毒の後に条件攻撃。解除と付与役速攻の比較|
|W2 大友宗麟|SKD037→SKD064、開始SP50→100、初回候補4→3|複数の攻撃役への弱体。単体解除の手数との比較|
|W5 武田信玄|SKD033→SKD007をSKD033→SKD030へ、開始SP80→130、ATK2,700→4,050|濃姫の全体DOTと組み合わせる|
|W5 濃姫|初回6→3|条件攻撃より前に付与する|

SP上限は元のまま。浅井100・宗麟100・信玄130内で設定。行動間隔は初回以外を維持。能力調整は条件攻撃を担う2体のATKのみ1.5倍で、全敵の一律強化ではない。以上の数値は未FIX。

別seedの確認結果：

|編成|勝利|行動数中央値|終了時残HP中央値|
|---|---:|---:|---:|
|対策枠なし|30/30|57.5|86.6%|
|清めの手当＋奮起＋解縛|30/30|63|93.9%|
|後列攻撃で速攻|30/30|55.5|86.0%|

解除・回復の複合編成はHPを残しやすく、後列攻撃は早く終わる。全指標で一方を勝たせる設計にはしない。ただし混合対策の差の全てを解除だけの効果とは言えない。SKD070の回復を含み、解縛単独の価値はまだ弱い。

行動不能を全体化するSKD065案も比較したが、解縛単独の価値はほぼ増えなかった。全体化・開始SP135案は保持候補から除外する。

## 6-2の確認

弱体役と条件攻撃役の対象を揃えるため、W1勘助のSKD037をSKD038へ、W4は官兵衛を前・勘助を後ろに配置する案を比較。勘助の初回3、W4官兵衛の初回5。官兵衛へのATK1.5/2/3倍も比較したが、解除の速度面の優位は得られなかった。攻撃役の強化案は見送る。

同一条件・低消費主砲SKD008での比較（seed1701〜1730）：

|対策|勝利|行動数中央値|残HP中央値|
|---|---:|---:|---:|
|奮起なし|30/30|55|92.0%|
|奮起あり|30/30|59|94.4%|

この範囲では解除は安定寄りの選択肢であり、速攻より遅い。残HPの小さな差だけで攻略主軸が成立したと断定しない。敵配置・既存スキル案は比較履歴に留め、正式採用しない。

## 7-7の確認と見送り

1. 支援役を後方へ移動し、初回2・再行動3へ変更しただけでは、消費SP75に対し開始75のため再付与が乏しい。
2. 支援役の開始SP/上限を150へ上げると発動機会は増える。しかし別対象への付与も含まれるため、同一付与者・同一スキル・同一対象への再付与を別に計測した。
3. シールドを剥がさず直接攻撃する方が速い。P12補正前のSKD046シールドは3,960×85.68%=約3,393で、通常攻撃で処理しやすい。
4. 反撃へ置換・反撃役だけのATK増量、W3景勝のDEF3,000/4,000/5,000＋SP150・再行動3も比較。解除を増やすとSP・行動の負担が増え、優位が得られなかった。
5. 主砲を低消費技へ変え、解除役の配置も3〜5番へ動かしたが、優位は安定しなかった。

したがって、SP150・反撃置換・DEF増量を「再付与圧力の修正完了」として採用しない。再付与の発生回数だけを合格条件にしない。次は1Wave単位で「解除後の攻撃窓」と代替の速攻が成立することを先に検証し、成立前に4Wave全体を増強しない。

## 比較台帳

下表は探索履歴。保持候補は6-6の別seed確認案のみ。他の数値は探索用であり自動採用禁止。

|探索|条件|編成|勝利|行動数中央値|残HP中央値|
|---|---|---|---:|---:|---:|
|pressure3|6-2/count_only|none|30/30|57|94.7%|
|pressure3|6-2/count_only|cleanse|30/30|60|96.8%|
|pressure3|6-2/count_only|cheap_cleanse|30/30|60|96.8%|
|pressure3|6-2/count_only|back_attack|30/30|54.5|94.5%|
|pressure3|6-2/combo|none|30/30|55|92.2%|
|pressure3|6-2/combo|cleanse|30/30|59.5|94.2%|
|pressure3|6-2/combo|cheap_cleanse|30/30|59.5|94.2%|
|pressure3|6-2/combo|back_attack|30/30|54|90.5%|
|pressure3|6-6/count_only|none|30/30|56|91.8%|
|pressure3|6-6/count_only|all_cleanse|30/30|59|94.6%|
|pressure3|6-6/count_only|split_cleanse|30/30|59|94.2%|
|pressure3|6-6/count_only|dot_focus|30/30|61.5|95.4%|
|pressure3|6-6/count_only|stun_focus|30/30|56|91.8%|
|pressure3|6-6/count_only|back_attack|30/30|55|90.6%|
|pressure3|6-6/combo|none|30/30|57.5|91.7%|
|pressure3|6-6/combo|all_cleanse|30/30|61.5|95.6%|
|pressure3|6-6/combo|split_cleanse|30/30|62|96.2%|
|pressure3|6-6/combo|dot_focus|30/30|62.5|96.4%|
|pressure3|6-6/combo|stun_focus|30/30|57.5|91.7%|
|pressure3|6-6/combo|back_attack|30/30|56|91.2%|
|pressure3|7-7/count_only|none|30/30|42.5|94.2%|
|pressure3|7-7/count_only|buff_remove|30/30|46|94.1%|
|pressure3|7-7/count_only|both_remove|30/30|46|94.1%|
|pressure3|7-7/count_only|shield_remove|30/30|41|94.2%|
|pressure3|7-7/count_only|back_attack|30/30|45.5|92.7%|
|pressure3|7-7/position|none|30/30|43|93.3%|
|pressure3|7-7/position|buff_remove|30/30|45|93.1%|
|pressure3|7-7/position|both_remove|30/30|46|92.9%|
|pressure3|7-7/position|shield_remove|30/30|43|93.1%|
|pressure3|7-7/position|back_attack|30/30|48|89.5%|
|pressure3|7-7/repeat_supply|none|30/30|43.5|93.3%|
|pressure3|7-7/repeat_supply|buff_remove|30/30|46|93.8%|
|pressure3|7-7/repeat_supply|both_remove|30/30|50|92.5%|
|pressure3|7-7/repeat_supply|shield_remove|30/30|48|92.7%|
|pressure3|7-7/repeat_supply|back_attack|30/30|50|89.2%|
|pressure3-followup|6-6/baseline|none|30/30|58|91.9%|
|pressure3-followup|6-6/baseline|stun|30/30|58|91.9%|
|pressure3-followup|6-6/baseline|mixed|30/30|62.5|96.5%|
|pressure3-followup|6-6/baseline|dot|30/30|62|96.4%|
|pressure3-followup|6-6/targeted|none|30/30|59|91.6%|
|pressure3-followup|6-6/targeted|stun|30/30|59|91.7%|
|pressure3-followup|6-6/targeted|mixed|30/30|64|96.3%|
|pressure3-followup|6-6/targeted|dot|30/30|63.5|96.2%|
|pressure3-followup|7-7/baseline|none|30/30|44|93.3%|
|pressure3-followup|7-7/baseline|shield|30/30|48|92.4%|
|pressure3-followup|7-7/baseline|attack_shield|30/30|44.5|92.6%|
|pressure3-followup|7-7/baseline|attack_buff|30/30|46|93.1%|
|pressure3-followup|7-7/baseline|main_shield|30/30|46|90.5%|
|pressure3-followup|7-7/baseline|main_both|30/30|51|90.2%|
|pressure3-counter|counter_once|none|30/30|42|93.3%|
|pressure3-counter|counter_once|shield_remove|30/30|45|93.2%|
|pressure3-counter|counter_once|both_remove|30/30|47.5|93.1%|
|pressure3-counter|counter_once|attack_remove|30/30|43|93.0%|
|pressure3-counter|counter_once|back_attack|30/30|42|92.0%|
|pressure3-counter|counter_repeat|none|30/30|42|93.1%|
|pressure3-counter|counter_repeat|shield_remove|30/30|47|92.6%|
|pressure3-counter|counter_repeat|both_remove|30/30|50.5|92.5%|
|pressure3-counter|counter_repeat|attack_remove|30/30|42|92.8%|
|pressure3-counter|counter_repeat|back_attack|30/30|42|91.8%|
|pressure3-local|6-2/1.5|none|30/30|55|88.0%|
|pressure3-local|6-2/1.5|cleanse|30/30|59|88.0%|
|pressure3-local|6-2/1.5|back_attack|30/30|54|81.7%|
|pressure3-local|6-2/2|none|30/30|57|80.3%|
|pressure3-local|6-2/2|cleanse|30/30|59.5|81.1%|
|pressure3-local|6-2/2|back_attack|30/30|54.5|73.3%|
|pressure3-local|6-2/3|none|30/30|55|72.8%|
|pressure3-local|6-2/3|cleanse|30/30|56|72.9%|
|pressure3-local|6-2/3|back_attack|30/30|53|56.3%|
|pressure3-local|6-6/1.5|none|30/30|58|86.7%|
|pressure3-local|6-6/1.5|all_cleanse|30/30|60|91.5%|
|pressure3-local|6-6/1.5|split_cleanse|30/30|62.5|93.7%|
|pressure3-local|6-6/1.5|back_attack|30/30|55|86.2%|
|pressure3-local|6-6/2|none|30/30|58|84.6%|
|pressure3-local|6-6/2|all_cleanse|30/30|60|87.2%|
|pressure3-local|6-6/2|split_cleanse|30/30|62.5|90.3%|
|pressure3-local|6-6/2|back_attack|30/30|55|80.8%|
|pressure3-local|6-6/3|none|30/30|57|74.1%|
|pressure3-local|6-6/3|all_cleanse|30/30|60|77.5%|
|pressure3-local|6-6/3|split_cleanse|30/30|62.5|82.9%|
|pressure3-local|6-6/3|back_attack|30/30|55|70.9%|
|pressure3-local|7-7/1.5|none|30/30|40|82.7%|
|pressure3-local|7-7/1.5|shield_remove|30/30|47.5|82.6%|
|pressure3-local|7-7/1.5|attack_remove|30/30|42|82.6%|
|pressure3-local|7-7/2|none|30/30|40|70.5%|
|pressure3-local|7-7/2|shield_remove|30/30|48|69.1%|
|pressure3-local|7-7/2|attack_remove|30/30|42|70.4%|
|pressure3-local|7-7/3|none|30/30|43|55.2%|
|pressure3-local|7-7/3|shield_remove|30/30|47|47.5%|
|pressure3-local|7-7/3|attack_remove|30/30|44.5|47.7%|
|pressure3-timing|6-2/1/2|none|30/30|57|91.7%|
|pressure3-timing|6-2/1/3|none|30/30|55|92.8%|
|pressure3-timing|6-2/1/4|none|30/30|57.5|91.5%|
|pressure3-timing|6-2/1/2|cleanse|30/30|62|93.0%|
|pressure3-timing|6-2/1/3|cleanse|30/30|62|94.2%|
|pressure3-timing|6-2/1/4|cleanse|30/30|60|92.3%|
|pressure3-timing|6-2/1/2|back_attack|30/30|58|89.3%|
|pressure3-timing|6-2/1/3|back_attack|30/30|60|91.0%|
|pressure3-timing|6-2/1/4|back_attack|30/30|52|89.9%|
|pressure3-timing|6-2/1.5/2|none|30/30|55.5|87.9%|
|pressure3-timing|6-2/1.5/3|none|30/30|57|89.3%|
|pressure3-timing|6-2/1.5/4|none|30/30|55.5|87.3%|
|pressure3-timing|6-2/1.5/2|cleanse|30/30|63|88.1%|
|pressure3-timing|6-2/1.5/3|cleanse|30/30|62|89.1%|
|pressure3-timing|6-2/1.5/4|cleanse|30/30|60|86.2%|
|pressure3-timing|6-2/1.5/2|back_attack|30/30|58|78.9%|
|pressure3-timing|6-2/1.5/3|back_attack|30/30|60|82.0%|
|pressure3-timing|6-2/1.5/4|back_attack|30/30|54|83.2%|
|pressure3-timing|7-7/1/2|none|30/30|41.5|93.7%|
|pressure3-timing|7-7/1/3|none|30/30|41|93.1%|
|pressure3-timing|7-7/1/4|none|30/30|41|92.7%|
|pressure3-timing|7-7/1/2|shield_remove|30/30|48|92.4%|
|pressure3-timing|7-7/1/3|shield_remove|30/30|45|92.5%|
|pressure3-timing|7-7/1/4|shield_remove|30/30|43|92.7%|
|pressure3-timing|7-7/1/2|attack_remove|30/30|50|89.9%|
|pressure3-timing|7-7/1/3|attack_remove|30/30|43|92.3%|
|pressure3-timing|7-7/1/4|attack_remove|30/30|42.5|92.2%|
|pressure3-timing|7-7/1.5/2|none|30/30|42|83.5%|
|pressure3-timing|7-7/1.5/3|none|30/30|41|81.8%|
|pressure3-timing|7-7/1.5/4|none|30/30|42|81.9%|
|pressure3-timing|7-7/1.5/2|shield_remove|30/30|48|81.4%|
|pressure3-timing|7-7/1.5/3|shield_remove|30/30|45|80.2%|
|pressure3-timing|7-7/1.5/4|shield_remove|30/30|44|80.5%|
|pressure3-timing|7-7/1.5/2|attack_remove|30/30|51|80.0%|
|pressure3-timing|7-7/1.5/3|attack_remove|30/30|43|79.4%|
|pressure3-timing|7-7/1.5/4|attack_remove|30/30|42.5|80.4%|
|pressure3-guard|3000|none|30/30|52|93.7%|
|pressure3-guard|3000|buff_remove|30/30|58|92.3%|
|pressure3-guard|3000|def_down|30/30|61|90.2%|
|pressure3-guard|3000|dot|30/30|58.5|90.6%|
|pressure3-guard|4000|none|30/30|53|93.0%|
|pressure3-guard|4000|buff_remove|30/30|60|92.5%|
|pressure3-guard|4000|def_down|30/30|66|93.0%|
|pressure3-guard|4000|dot|30/30|70.5|90.5%|
|pressure3-guard|5000|none|30/30|63|94.3%|
|pressure3-guard|5000|buff_remove|30/30|72.5|93.6%|
|pressure3-guard|5000|def_down|30/30|77|90.8%|
|pressure3-guard|5000|dot|30/30|87|91.0%|
|pressure3-sp|6-2/SKD008|none|30/30|55|92.0%|
|pressure3-sp|6-2/SKD008|cleanse|30/30|59|94.4%|
|pressure3-sp|6-2/SKD028|none|30/30|58.5|89.6%|
|pressure3-sp|6-2/SKD028|cleanse|30/30|62.5|94.2%|
|pressure3-sp|6-2/basic|none|30/30|66.5|88.1%|
|pressure3-sp|6-2/basic|cleanse|30/30|69|93.3%|
|pressure3-sp|7-7/SKD008|none|30/30|47.5|93.4%|
|pressure3-sp|7-7/SKD008|cleanse|30/30|50.5|93.0%|
|pressure3-sp|7-7/SKD028|none|30/30|48.5|92.6%|
|pressure3-sp|7-7/SKD028|cleanse|30/30|55|92.4%|
|pressure3-sp|7-7/basic|none|30/30|69|89.8%|
|pressure3-sp|7-7/basic|cleanse|30/30|72|93.1%|
|pressure3-holdout|6-6/1.5|none|30/30|57.5|86.6%|
|pressure3-holdout|6-6/1.5|split_cleanse|30/30|63|93.9%|
|pressure3-holdout|6-6/1.5|back_attack|30/30|55.5|86.0%|

## 提案・FIX状態

**提案：6-6の限定調整候補を保持。6-2は解除を安定寄りの代替として引き続き評価。7-7の今回の増強案は採用せず、1Waveで解除→攻撃の窓を再設計する。追加数値FIXなし。既存16体候補も正式採用に変更しない。**
