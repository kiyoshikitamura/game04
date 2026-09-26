# 敵43面の攻略構造と証拠の範囲

敵の数値案だけでは攻略性の証明にならない。以下は同程度の資産で保存した主/別戦法の効果構成、実発動、順序対照を対応付けたもの。属性補正・BURSTを個別に無効化した因果比較は未実施であり、発生しただけで必須性を断定しない。SP消費なし・攻撃技能最大5回・通常攻撃なしの承認済みBURSTを維持する。

## 3-1
変更対象敵の属性：3-1/W1/1=earth、3-1/W2/1=water。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。

|攻略|配置順の技能・効果・対象・条件・実発動試行数|
|---|---|
|主|1:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）200/200<br>2:SKD038 防御低下（earth、first、{"type":"always"}）200/200<br>3:SKD010 直接攻撃（wind、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|
|別|1:SKD003 直接攻撃（earth、first、{"type":"always"}）200/200<br>2:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）168/200<br>3:SKD010 直接攻撃（wind、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|

勝ち方の相違：主だけの効果=防御低下／別だけの効果=効果種別差なし。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。
攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は1件。同資産低勝率比較attack-up-reversed。具体勝敗はENEMY43.md。
BURST：主200/200、別200/200で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。

## 3-2
変更対象敵の属性：3-2/W1/1=earth、3-2/W2/1=earth。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。

|攻略|配置順の技能・効果・対象・条件・実発動試行数|
|---|---|
|主|1:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）200/200<br>2:SKD038 防御低下（earth、first、{"type":"always"}）200/200<br>3:SKD010 直接攻撃（wind、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）198/200|
|別|1:SKD003 直接攻撃（earth、first、{"type":"always"}）200/200<br>2:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）162/200<br>3:SKD010 直接攻撃（wind、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）198/200|

勝ち方の相違：主だけの効果=防御低下／別だけの効果=効果種別差なし。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。
攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は1件。同資産低勝率比較band4-swap13-no-support。具体勝敗はENEMY43.md。
BURST：主200/200、別200/200で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。

## 3-3
変更対象敵の属性：3-3/W2/1=dark。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。

|攻略|配置順の技能・効果・対象・条件・実発動試行数|
|---|---|
|主|1:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）200/200<br>2:SKD038 防御低下（earth、first、{"type":"always"}）200/200<br>3:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|
|別|1:SKD003 直接攻撃（earth、first、{"type":"always"}）200/200<br>2:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）129/200<br>3:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）137/200|

勝ち方の相違：主だけの効果=防御低下／別だけの効果=効果種別差なし。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。
攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は1件。同資産低勝率比較all-cheap。具体勝敗はENEMY43.md。
BURST：主196/200、別199/200で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。

## 3-5
変更対象敵の属性：3-5/W1/1=earth、3-5/W2/1=light、3-5/W3/1=fire、3-5/W3/2=fire。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。

|攻略|配置順の技能・効果・対象・条件・実発動試行数|
|---|---|
|主|2:SKD038 防御低下（earth、first、{"type":"always"}）200/200<br>3:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD043 継続回復（water、lowest_ally、{"type":"always"}）200/200|
|別|1:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）200/200<br>2:SKD038 防御低下（earth、first、{"type":"always"}）200/200<br>3:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|

勝ち方の相違：主だけの効果=継続回復／別だけの効果=攻撃強化、回復。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。
攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は1件。同資産低勝率比較attack-up-reversed。具体勝敗はENEMY43.md。
BURST：主200/200、別200/200で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。

## 4-3
変更対象敵の属性：4-3/2/1=light、4-3/3/1=wind。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。

|攻略|配置順の技能・効果・対象・条件・実発動試行数|
|---|---|
|主|3:SKD007 直接攻撃（fire、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD040 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）152/200|
|別|1:SKD036 防御強化（light、all_allies、{"type":"always"}）200/200<br>2:SKD037 atk_down（dark、highest_atk_enemy、{"type":"always"}）200/200<br>3:SKD007 直接攻撃（fire、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD043 継続回復（water、lowest_ally、{"type":"always"}）200/200|

勝ち方の相違：主だけの効果=回復／別だけの効果=防御強化、atk_down、継続回復。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。
攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は1件。同資産低勝率比較attack-up-reversed。具体勝敗はENEMY43.md。
BURST：主200/200、別199/200で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。

## 4-5
変更対象敵の属性：4-5/1/1=earth、4-5/2/1=wind、4-5/3/1=water。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。

|攻略|配置順の技能・効果・対象・条件・実発動試行数|
|---|---|
|主|1:SKD036 防御強化（light、all_allies、{"type":"always"}）200/200<br>2:SKD037 atk_down（dark、highest_atk_enemy、{"type":"always"}）200/200<br>3:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD043 継続回復（water、lowest_ally、{"type":"always"}）200/200|
|別|1:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）200/200<br>2:SKD038 防御低下（earth、first、{"type":"always"}）200/200<br>3:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|

勝ち方の相違：主だけの効果=防御強化、atk_down、継続回復／別だけの効果=攻撃強化、防御低下、回復。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。
攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は1件。同資産低勝率比較rear-focus-reversed。具体勝敗はENEMY43.md。
BURST：主200/200、別200/200で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。

## 6-1
変更対象敵の属性：6-1/2/1=water、6-1/3/1=dark、6-1/3/2=wind。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。

|攻略|配置順の技能・効果・対象・条件・実発動試行数|
|---|---|
|主|3:SKD011 直接攻撃（light、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD040 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）161/200|
|別|1:SKD054 弱体解除（water、first_ally、{"type":"always"}）200/200<br>2:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）148/200<br>3:SKD011 直接攻撃（light、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|

勝ち方の相違：主だけの効果=効果種別差なし／別だけの効果=弱体解除、攻撃強化。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。
攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は1件。同資産低勝率比較attack-up-reversed。具体勝敗はENEMY43.md。
BURST：主194/200、別200/200で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。

## 6-2
変更対象敵の属性：6-2/1/1=dark、6-2/2/1=water、6-2/2/2=earth、6-2/3/1=light、6-2/4/1=fire、6-2/4/2=dark。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。

|攻略|配置順の技能・効果・対象・条件・実発動試行数|
|---|---|
|主|1:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）198/200<br>2:SKD038 防御低下（earth、first、{"type":"always"}）200/200<br>3:SKD011 直接攻撃（light、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|
|別|1:SKD049 反撃（wind、self、{"type":"always"}）200/200<br>1:SKD048 taunt（fire、self、{"type":"always"}）200/200<br>2:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）200/200<br>3:SKD011 直接攻撃（light、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|

勝ち方の相違：主だけの効果=防御低下／別だけの効果=反撃、taunt。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。
攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は1件。同資産低勝率比較attack-up-reversed。具体勝敗はENEMY43.md。
BURST：主200/200、別200/200で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。

## 6-4
変更対象敵の属性：6-4/1/1=fire、6-4/2/1=wind、6-4/3/1=fire。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。

|攻略|配置順の技能・効果・対象・条件・実発動試行数|
|---|---|
|主|3:SKD008 直接攻撃（water、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|
|別|1:SKD049 反撃（wind、self、{"type":"always"}）200/200<br>2:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）199/200<br>3:SKD008 直接攻撃（water、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）148/200|

勝ち方の相違：主だけの効果=効果種別差なし／別だけの効果=反撃、攻撃強化。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。
攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は1件。同資産低勝率比較burst-focus-order-31254。具体勝敗はENEMY43.md。
BURST：主200/200、別158/200で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。

## 6-5
変更対象敵の属性：6-5/4/1=dark。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。

|攻略|配置順の技能・効果・対象・条件・実発動試行数|
|---|---|
|主|1:SKD053 弱体解除（fire、first_ally、{"type":"always"}）103/200<br>2:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）200/200<br>3:SKD011 直接攻撃（light、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|
|別|1:SKD049 反撃（wind、self、{"type":"always"}）200/200<br>2:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）200/200<br>3:SKD011 直接攻撃（light、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|

勝ち方の相違：主だけの効果=弱体解除／別だけの効果=反撃。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。
攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は1件。同資産低勝率比較all-cheap。具体勝敗はENEMY43.md。
BURST：主200/200、別200/200で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。

## 6-6
変更対象敵の属性：6-6/5/2=dark。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。

|攻略|配置順の技能・効果・対象・条件・実発動試行数|
|---|---|
|主|1:SKD003 直接攻撃（earth、first、{"type":"always"}）200/200<br>2:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）105/200<br>3:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|
|別|3:SKD008 直接攻撃（water、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD040 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）72/200|

勝ち方の相違：主だけの効果=攻撃強化／別だけの効果=効果種別差なし。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。
攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は1件。同資産低勝率比較area-boost。具体勝敗はENEMY43.md。
BURST：主200/200、別200/200で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。

## 7-1
変更対象敵の属性：7-1/2/1=water、7-1/3/1=fire。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。

|攻略|配置順の技能・効果・対象・条件・実発動試行数|
|---|---|
|主|1:SKD003 直接攻撃（earth、first、{"type":"always"}）200/200<br>2:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）185/200<br>3:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|
|別|3:SKD008 直接攻撃（water、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD040 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）93/200|

勝ち方の相違：主だけの効果=攻撃強化／別だけの効果=効果種別差なし。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。
攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は1件。同資産低勝率比較attack-up-reversed。具体勝敗はENEMY43.md。
BURST：主196/200、別194/200で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。

## 7-2
変更対象敵の属性：7-2/1/1=earth、7-2/2/1=water、7-2/2/2=earth、7-2/3/1=earth。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。

|攻略|配置順の技能・効果・対象・条件・実発動試行数|
|---|---|
|主|1:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）118/200<br>2:SKD038 防御低下（earth、first、{"type":"always"}）200/200<br>3:SKD010 直接攻撃（wind、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|
|別|1:SKD003 直接攻撃（earth、first、{"type":"always"}）200/200<br>2:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）200/200<br>3:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|

勝ち方の相違：主だけの効果=防御低下／別だけの効果=効果種別差なし。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。
攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は1件。同資産低勝率比較all-cheap。具体勝敗はENEMY43.md。
BURST：主200/200、別200/200で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。

## 7-4
変更対象敵の属性：7-4/1/2=light、7-4/2/2=fire、7-4/3/1=earth、7-4/3/2=light。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。

|攻略|配置順の技能・効果・対象・条件・実発動試行数|
|---|---|
|主|1:SKD003 直接攻撃（earth、first、{"type":"always"}）200/200<br>2:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）154/200<br>3:SKD026 直接攻撃（wind、last、{"type":"always"}）200/200<br>4:SKD027 直接攻撃（dark、lowest_hp、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|
|別|3:SKD010 直接攻撃（wind、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD043 継続回復（water、lowest_ally、{"type":"always"}）123/200|

勝ち方の相違：主だけの効果=攻撃強化、回復／別だけの効果=継続回復。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。
攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は1件。同資産低勝率比較attack-up-reversed。具体勝敗はENEMY43.md。
BURST：主200/200、別195/200で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。

## 7-7
変更対象敵の属性：7-7/1/1=wind、7-7/1/2=earth、7-7/2/1=fire、7-7/2/2=fire、7-7/3/1=water、7-7/4/1=earth、7-7/4/2=dark。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。

|攻略|配置順の技能・効果・対象・条件・実発動試行数|
|---|---|
|主|1:SKD003 直接攻撃（earth、first、{"type":"always"}）200/200<br>2:SKD032 行動停止（water、first、{"type":"always"}）200/200<br>3:SKD008 直接攻撃（water、first、{"type":"always"}）200/200<br>4:SKD026 直接攻撃（wind、last、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）199/200|
|別|1:SKD003 直接攻撃（earth、first、{"type":"always"}）200/200<br>2:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）187/200<br>3:SKD026 直接攻撃（wind、last、{"type":"always"}）200/200<br>4:SKD027 直接攻撃（dark、lowest_hp、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）184/200|

勝ち方の相違：主だけの効果=行動停止／別だけの効果=攻撃強化。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。
攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は1件。同資産低勝率比較attack-up-reversed。具体勝敗はENEMY43.md。
BURST：主200/200、別200/200で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。

## 7-8
変更対象敵の属性：7-8/1/1=water、7-8/2/1=earth、7-8/3/1=earth、7-8/4/1=wind、7-8/4/2=light、7-8/4/3=wind。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。

|攻略|配置順の技能・効果・対象・条件・実発動試行数|
|---|---|
|主|1:SKD052 弱体解除（dark、first、{"type":"always"}）200/200<br>2:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）112/200<br>3:SKD007 直接攻撃（fire、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|
|別|1:SKD003 直接攻撃（earth、first、{"type":"always"}）200/200<br>2:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）87/200<br>3:SKD003 直接攻撃（earth、first、{"type":"always"}）200/200<br>4:SKD003 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）3/200|

勝ち方の相違：主だけの効果=弱体解除／別だけの効果=効果種別差なし。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。
攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は1件。同資産低勝率比較all-attack。具体勝敗はENEMY43.md。
BURST：主200/200、別192/200で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。

## 8-1
変更対象敵の属性：8-1/1/1=fire、8-1/2/1=light、8-1/3/1=wind、8-1/4/1=fire。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。

|攻略|配置順の技能・効果・対象・条件・実発動試行数|
|---|---|
|主|3:SKD008 直接攻撃（water、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD040 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）134/200|
|別|1:SKD036 防御強化（light、all_allies、{"type":"always"}）98/200<br>2:SKD037 atk_down（dark、highest_atk_enemy、{"type":"always"}）200/200<br>3:SKD008 直接攻撃（water、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD043 継続回復（water、lowest_ally、{"type":"always"}）164/200|

勝ち方の相違：主だけの効果=回復／別だけの効果=防御強化、atk_down、継続回復。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。
攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は1件。同資産低勝率比較rear-focus-reversed。具体勝敗はENEMY43.md。
BURST：主197/200、別198/200で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。

## 8-2
変更対象敵の属性：8-2/2/1=water。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。

|攻略|配置順の技能・効果・対象・条件・実発動試行数|
|---|---|
|主|1:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）135/200<br>2:SKD038 防御低下（earth、first、{"type":"always"}）200/200<br>3:SKD010 直接攻撃（wind、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）159/200|
|別|1:SKD003 直接攻撃（earth、first、{"type":"always"}）200/200<br>2:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）143/200<br>3:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|

勝ち方の相違：主だけの効果=防御低下／別だけの効果=効果種別差なし。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。
攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は1件。同資産低勝率比較rear-focus-reversed。具体勝敗はENEMY43.md。
BURST：主191/200、別200/200で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。

## 8-3
変更対象敵の属性：8-3/1/1=fire、8-3/1/2=light、8-3/1/3=water、8-3/2/1=earth、8-3/3/1=wind、8-3/4/1=wind。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。

|攻略|配置順の技能・効果・対象・条件・実発動試行数|
|---|---|
|主|1:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）242/600<br>2:SKD038 防御低下（earth、first、{"type":"always"}）600/600<br>3:SKD007 直接攻撃（fire、first、{"type":"always"}）600/600<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）600/600<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）600/600|
|別|3:SKD007 直接攻撃（fire、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|

勝ち方の相違：主だけの効果=攻撃強化、防御低下／別だけの効果=効果種別差なし。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。
攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は1件。同資産低勝率比較attack-up-reversed。具体勝敗はENEMY43.md。
BURST：主600/600、別200/200で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。

## 8-4
変更対象敵の属性：8-4/1/2=earth、8-4/2/1=earth、8-4/3/1=fire、8-4/3/2=light。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。

|攻略|配置順の技能・効果・対象・条件・実発動試行数|
|---|---|
|主|1:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）0/200<br>2:SKD038 防御低下（earth、first、{"type":"always"}）200/200<br>3:SKD010 直接攻撃（wind、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|
|別|1:SKD054 弱体解除（water、first_ally、{"type":"always"}）200/200<br>2:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）43/200<br>3:SKD010 直接攻撃（wind、first、{"type":"always"}）194/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）194/200|

勝ち方の相違：主だけの効果=防御低下／別だけの効果=弱体解除。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。
攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は1件。同資産低勝率比較attack-up-reversed。具体勝敗はENEMY43.md。
BURST：主200/200、別194/200で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。

## 8-5
変更対象敵の属性：8-5/1/1=wind、8-5/3/1=wind、8-5/3/2=light。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。

|攻略|配置順の技能・効果・対象・条件・実発動試行数|
|---|---|
|主|1:SKD045 shield（earth、self、{"type":"always"}）197/200<br>2:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）174/200<br>3:SKD007 直接攻撃（fire、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|
|別|3:SKD007 直接攻撃（fire、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|

勝ち方の相違：主だけの効果=shield、攻撃強化／別だけの効果=効果種別差なし。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。
攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は1件。同資産低勝率比較cheap-attacks。具体勝敗はENEMY43.md。
BURST：主198/200、別199/200で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。

## 8-7
変更対象敵の属性：8-7/2/1=light、8-7/3/1=wind、8-7/4/1=fire。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。

|攻略|配置順の技能・効果・対象・条件・実発動試行数|
|---|---|
|主|3:SKD007 直接攻撃（fire、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD040 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|
|別|1:SKD003 直接攻撃（earth、first、{"type":"always"}）200/200<br>2:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）82/200<br>3:SKD026 直接攻撃（wind、last、{"type":"always"}）200/200<br>4:SKD027 直接攻撃（dark、lowest_hp、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|

勝ち方の相違：主だけの効果=効果種別差なし／別だけの効果=攻撃強化。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。
攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は1件。同資産低勝率比較attack-up-reversed。具体勝敗はENEMY43.md。
BURST：主185/200、別192/200で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。

## 8-8
変更対象敵の属性：8-8/3/1=wind、8-8/5/1=earth、8-8/6/1=fire、8-8/6/2=fire。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。

|攻略|配置順の技能・効果・対象・条件・実発動試行数|
|---|---|
|主|1:SKD054 弱体解除（water、first_ally、{"type":"always"}）197/200<br>2:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）200/200<br>3:SKD007 直接攻撃（fire、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|
|別|1:SKD036 防御強化（light、all_allies、{"type":"always"}）117/200<br>2:SKD037 atk_down（dark、highest_atk_enemy、{"type":"always"}）200/200<br>3:SKD007 直接攻撃（fire、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD043 継続回復（water、lowest_ally、{"type":"always"}）199/200|

勝ち方の相違：主だけの効果=弱体解除、攻撃強化、回復／別だけの効果=防御強化、atk_down、継続回復。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。
攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は1件。同資産低勝率比較attack-up-reversed。具体勝敗はENEMY43.md。
BURST：主200/200、別200/200で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。

## 9-1
変更対象敵の属性：9-1/2/1=earth。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。

|攻略|配置順の技能・効果・対象・条件・実発動試行数|
|---|---|
|主|1:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）90/200<br>2:SKD038 防御低下（earth、first、{"type":"always"}）200/200<br>3:SKD010 直接攻撃（wind、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|
|別|1:SKD049 反撃（wind、self、{"type":"always"}）200/200<br>1:SKD048 taunt（fire、self、{"type":"always"}）200/200<br>2:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）197/200<br>3:SKD010 直接攻撃（wind、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|

勝ち方の相違：主だけの効果=防御低下／別だけの効果=反撃、taunt。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。
攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は1件。同資産低勝率比較all-cheap。具体勝敗はENEMY43.md。
BURST：主200/200、別200/200で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。

## 9-2
変更対象敵の属性：9-2/1/1=fire、9-2/1/2=light、9-2/1/3=water、9-2/2/1=fire、9-2/2/2=wind、9-2/2/3=light、9-2/3/1=wind、9-2/3/2=wind。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。

|攻略|配置順の技能・効果・対象・条件・実発動試行数|
|---|---|
|主|3:SKD008 直接攻撃（water、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD040 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|
|別|1:SKD003 直接攻撃（earth、first、{"type":"always"}）200/200<br>2:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）195/200<br>3:SKD026 直接攻撃（wind、last、{"type":"always"}）200/200<br>4:SKD027 直接攻撃（dark、lowest_hp、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|

勝ち方の相違：主だけの効果=効果種別差なし／別だけの効果=攻撃強化。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。
攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は1件。同資産低勝率比較attack-up-reversed。具体勝敗はENEMY43.md。
BURST：主181/200、別198/200で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。

## 9-3
変更対象敵の属性：9-3/1/1=earth、9-3/1/2=fire、9-3/1/3=light、9-3/2/1=earth、9-3/2/2=dark、9-3/2/3=light。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。

|攻略|配置順の技能・効果・対象・条件・実発動試行数|
|---|---|
|主|1:SKD003 直接攻撃（earth、first、{"type":"always"}）200/200<br>2:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）199/200<br>3:SKD026 直接攻撃（wind、last、{"type":"always"}）200/200<br>4:SKD027 直接攻撃（dark、lowest_hp、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|
|別|1:SKD003 直接攻撃（earth、first、{"type":"always"}）200/200<br>2:SKD032 行動停止（water、first、{"type":"always"}）156/200<br>3:SKD010 直接攻撃（wind、first、{"type":"always"}）200/200<br>4:SKD026 直接攻撃（wind、last、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|

勝ち方の相違：主だけの効果=攻撃強化／別だけの効果=行動停止。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。
攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は1件。同資産低勝率比較attack-up-reversed。具体勝敗はENEMY43.md。
BURST：主200/200、別200/200で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。

## 9-4
変更対象敵の属性：9-4/1/1=earth、9-4/1/2=wind、9-4/2/1=fire、9-4/3/1=earth、9-4/3/2=earth。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。

|攻略|配置順の技能・効果・対象・条件・実発動試行数|
|---|---|
|主|2:SKD038 防御低下（earth、first、{"type":"always"}）200/200<br>3:SKD010 直接攻撃（wind、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD043 継続回復（water、lowest_ally、{"type":"always"}）192/200|
|別|1:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）200/200<br>2:SKD038 防御低下（earth、first、{"type":"always"}）200/200<br>3:SKD010 直接攻撃（wind、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|

勝ち方の相違：主だけの効果=継続回復／別だけの効果=攻撃強化、回復。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。
攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は1件。同資産低勝率比較double-rock。具体勝敗はENEMY43.md。
BURST：主200/200、別200/200で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。

## 9-5
変更対象敵の属性：9-5/1/1=water、9-5/1/2=earth、9-5/2/1=light、9-5/3/1=dark、9-5/3/2=fire。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。

|攻略|配置順の技能・効果・対象・条件・実発動試行数|
|---|---|
|主|1:SKD003 直接攻撃（earth、first、{"type":"always"}）200/200<br>2:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）164/200<br>3:SKD026 直接攻撃（wind、last、{"type":"always"}）200/200<br>4:SKD027 直接攻撃（dark、lowest_hp、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|
|別|1:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）86/200<br>2:SKD038 防御低下（earth、first、{"type":"always"}）200/200<br>3:SKD008 直接攻撃（water、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|

勝ち方の相違：主だけの効果=効果種別差なし／別だけの効果=防御低下。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。
攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は1件。同資産低勝率比較attack-up-reversed。具体勝敗はENEMY43.md。
BURST：主200/200、別200/200で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。

## 9-6
変更対象敵の属性：9-6/1/1=earth、9-6/2/1=wind、9-6/2/2=fire。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。

|攻略|配置順の技能・効果・対象・条件・実発動試行数|
|---|---|
|主|1:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）160/200<br>2:SKD038 防御低下（earth、first、{"type":"always"}）200/200<br>3:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|
|別|1:SKD049 反撃（wind、self、{"type":"always"}）200/200<br>2:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）200/200<br>3:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|

勝ち方の相違：主だけの効果=防御低下／別だけの効果=反撃。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。
攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は1件。同資産低勝率比較attack-up-reversed。具体勝敗はENEMY43.md。
BURST：主200/200、別200/200で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。

## 9-7
変更対象敵の属性：9-7/2/1=wind、9-7/3/1=water、9-7/3/2=fire、9-7/3/3=light。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。

|攻略|配置順の技能・効果・対象・条件・実発動試行数|
|---|---|
|主|3:SKD007 直接攻撃（fire、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD040 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|
|別|1:SKD003 直接攻撃（earth、first、{"type":"always"}）200/200<br>2:SKD038 防御低下（earth、first、{"type":"always"}）200/200<br>3:SKD007 直接攻撃（fire、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|

勝ち方の相違：主だけの効果=効果種別差なし／別だけの効果=防御低下。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。
攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は1件。同資産低勝率比較attack-up-reversed。具体勝敗はENEMY43.md。
BURST：主192/200、別194/200で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。

## 9-8
変更対象敵の属性：9-8/2/1=fire。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。

|攻略|配置順の技能・効果・対象・条件・実発動試行数|
|---|---|
|主|1:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）0/200<br>2:SKD038 防御低下（earth、first、{"type":"always"}）200/200<br>3:SKD008 直接攻撃（water、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|
|別|1:SKD049 反撃（wind、self、{"type":"always"}）0/200<br>1:SKD048 taunt（fire、self、{"type":"always"}）200/200<br>2:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）200/200<br>3:SKD008 直接攻撃（water、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|

勝ち方の相違：主だけの効果=防御低下／別だけの効果=反撃、taunt。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。
攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は1件。同資産低勝率比較attack-up-reversed。具体勝敗はENEMY43.md。
BURST：主200/200、別200/200で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。

## 9-9
変更対象敵の属性：9-9/2/1=fire、9-9/3/1=dark、9-9/3/2=fire。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。

|攻略|配置順の技能・効果・対象・条件・実発動試行数|
|---|---|
|主|1:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）9/200<br>2:SKD038 防御低下（earth、first、{"type":"always"}）200/200<br>3:SKD008 直接攻撃（water、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|
|別|1:SKD003 直接攻撃（earth、first、{"type":"always"}）200/200<br>2:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）197/200<br>3:SKD008 直接攻撃（water、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|

勝ち方の相違：主だけの効果=防御低下／別だけの効果=効果種別差なし。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。
攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は1件。同資産低勝率比較attack-up-reversed。具体勝敗はENEMY43.md。
BURST：主200/200、別200/200で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。

## 9-10
変更対象敵の属性：9-10/1/1=earth、9-10/1/2=water、9-10/2/1=wind、9-10/3/1=earth、9-10/4/1=fire、9-10/4/2=fire。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。

|攻略|配置順の技能・効果・対象・条件・実発動試行数|
|---|---|
|主|2:SKD038 防御低下（earth、first、{"type":"always"}）600/600<br>3:SKD010 直接攻撃（wind、first、{"type":"always"}）600/600<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）600/600<br>5:SKD043 継続回復（water、lowest_ally、{"type":"always"}）594/600|
|別|1:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）200/200<br>2:SKD038 防御低下（earth、first、{"type":"always"}）200/200<br>3:SKD010 直接攻撃（wind、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|

勝ち方の相違：主だけの効果=継続回復／別だけの効果=攻撃強化、回復。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。
攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は1件。同資産低勝率比較attack-up-reversed。具体勝敗はENEMY43.md。
BURST：主600/600、別200/200で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。

## 10-1
変更対象敵の属性：10-1/1/1=water、10-1/1/2=wind、10-1/2/1=wind、10-1/2/2=light、10-1/3/1=earth、10-1/3/2=water。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。

|攻略|配置順の技能・効果・対象・条件・実発動試行数|
|---|---|
|主|1:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）600/600<br>2:SKD038 防御低下（earth、first、{"type":"always"}）600/600<br>3:SKD009 直接攻撃（earth、first、{"type":"always"}）600/600<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）600/600<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）600/600|
|別|2:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）200/200<br>3:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|

勝ち方の相違：主だけの効果=防御低下／別だけの効果=効果種別差なし。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。
攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は1件。同資産低勝率比較exact-party-order-reversed。具体勝敗はENEMY43.md。
BURST：主600/600、別200/200で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。

## 10-2
変更対象敵の属性：10-2/1/1=light、10-2/1/2=light、10-2/2/1=fire、10-2/3/1=wind、10-2/3/2=fire。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。

|攻略|配置順の技能・効果・対象・条件・実発動試行数|
|---|---|
|主|1:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）82/200<br>2:SKD038 防御低下（earth、first、{"type":"always"}）200/200<br>3:SKD008 直接攻撃（water、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|
|別|2:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）200/200<br>3:SKD008 直接攻撃（water、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|

勝ち方の相違：主だけの効果=防御低下／別だけの効果=効果種別差なし。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。
攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は1件。同資産低勝率比較attack-up-reversed。具体勝敗はENEMY43.md。
BURST：主200/200、別200/200で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。

## 10-3
変更対象敵の属性：10-3/1/1=water、10-3/1/2=dark、10-3/2/1=earth、10-3/2/2=fire、10-3/3/1=earth、10-3/3/2=wind。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。

|攻略|配置順の技能・効果・対象・条件・実発動試行数|
|---|---|
|主|1:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）593/600<br>2:SKD038 防御低下（earth、first、{"type":"always"}）600/600<br>3:SKD010 直接攻撃（wind、first、{"type":"always"}）600/600<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）600/600<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）600/600|
|別|3:SKD010 直接攻撃（wind、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|

勝ち方の相違：主だけの効果=攻撃強化、防御低下／別だけの効果=効果種別差なし。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。
攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は1件。同資産低勝率比較attack-up-reversed。具体勝敗はENEMY43.md。
BURST：主600/600、別200/200で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。

## 10-4
変更対象敵の属性：10-4/1/2=dark、10-4/2/1=water、10-4/3/1=dark、10-4/3/2=dark、10-4/3/3=fire。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。

|攻略|配置順の技能・効果・対象・条件・実発動試行数|
|---|---|
|主|1:SKD054 弱体解除（water、first_ally、{"type":"always"}）200/200<br>2:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）200/200<br>3:SKD011 直接攻撃（light、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|
|別|1:SKD003 直接攻撃（earth、first、{"type":"always"}）200/200<br>2:SKD038 防御低下（earth、first、{"type":"always"}）200/200<br>3:SKD011 直接攻撃（light、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|

勝ち方の相違：主だけの効果=弱体解除、攻撃強化／別だけの効果=防御低下。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。
攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は1件。同資産低勝率比較attack-up-reversed。具体勝敗はENEMY43.md。
BURST：主200/200、別199/200で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。

## 10-5
変更対象敵の属性：10-5/1/1=wind、10-5/1/2=wind、10-5/2/1=water、10-5/2/2=water、10-5/3/1=fire、10-5/3/2=fire。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。

|攻略|配置順の技能・効果・対象・条件・実発動試行数|
|---|---|
|主|1:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）552/600<br>2:SKD038 防御低下（earth、first、{"type":"always"}）600/600<br>3:SKD008 直接攻撃（water、first、{"type":"always"}）600/600<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）600/600<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）600/600|
|別|2:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）200/200<br>3:SKD008 直接攻撃（water、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|

勝ち方の相違：主だけの効果=防御低下／別だけの効果=効果種別差なし。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。
攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は1件。同資産低勝率比較attack-up-reversed。具体勝敗はENEMY43.md。
BURST：主600/600、別200/200で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。

## 10-6
変更対象敵の属性：10-6/1/1=earth、10-6/1/2=fire、10-6/2/1=earth、10-6/2/2=water、10-6/3/1=wind、10-6/3/2=light。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。

|攻略|配置順の技能・効果・対象・条件・実発動試行数|
|---|---|
|主|3:SKD010 直接攻撃（wind、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|
|別|1:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）128/200<br>2:SKD038 防御低下（earth、first、{"type":"always"}）200/200<br>3:SKD010 直接攻撃（wind、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|

勝ち方の相違：主だけの効果=効果種別差なし／別だけの効果=攻撃強化、防御低下。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。
攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は1件。同資産低勝率比較attack-up-reversed。具体勝敗はENEMY43.md。
BURST：主200/200、別200/200で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。

## 10-7
変更対象敵の属性：10-7/1/2=light、10-7/2/1=earth、10-7/3/1=fire、10-7/3/2=fire。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。

|攻略|配置順の技能・効果・対象・条件・実発動試行数|
|---|---|
|主|1:SKD003 直接攻撃（earth、first、{"type":"always"}）0/200<br>2:SKD038 防御低下（earth、first、{"type":"always"}）200/200<br>3:SKD008 直接攻撃（water、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）199/200|
|別|1:SKD036 防御強化（light、all_allies、{"type":"always"}）0/200<br>2:SKD037 atk_down（dark、highest_atk_enemy、{"type":"always"}）200/200<br>3:SKD008 直接攻撃（water、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD043 継続回復（water、lowest_ally、{"type":"always"}）194/200|

勝ち方の相違：主だけの効果=防御低下、回復／別だけの効果=防御強化、atk_down、継続回復。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。
攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は1件。同資産低勝率比較attack-up-reversed。具体勝敗はENEMY43.md。
BURST：主200/200、別200/200で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。

## 10-8
変更対象敵の属性：10-8/1/1=earth、10-8/1/2=light、10-8/2/1=light、10-8/2/2=earth、10-8/3/1=earth。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。

|攻略|配置順の技能・効果・対象・条件・実発動試行数|
|---|---|
|主|2:SKD038 防御低下（earth、first、{"type":"always"}）600/600<br>3:SKD010 直接攻撃（wind、first、{"type":"always"}）600/600<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）600/600<br>5:SKD043 継続回復（water、lowest_ally、{"type":"always"}）600/600|
|別|1:SKD051 弱体解除（wind、first、{"type":"always"}）200/200<br>2:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）200/200<br>3:SKD010 直接攻撃（wind、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|

勝ち方の相違：主だけの効果=防御低下、継続回復／別だけの効果=弱体解除、攻撃強化、回復。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。
攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は1件。同資産低勝率比較attack-up-reversed。具体勝敗はENEMY43.md。
BURST：主600/600、別200/200で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。

## 10-9
変更対象敵の属性：10-9/1/1=wind、10-9/1/2=wind、10-9/2/1=dark、10-9/2/2=light、10-9/3/1=fire、10-9/4/1=light。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。

|攻略|配置順の技能・効果・対象・条件・実発動試行数|
|---|---|
|主|1:SKD003 直接攻撃（earth、first、{"type":"always"}）600/600<br>2:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）600/600<br>3:SKD012 直接攻撃（dark、first、{"type":"always"}）600/600<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）600/600<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）600/600|
|別|2:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）199/200<br>3:SKD012 直接攻撃（dark、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|

勝ち方の相違：主だけの効果=効果種別差なし／別だけの効果=効果種別差なし。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。
攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は1件。同資産低勝率比較attack-up-reversed。具体勝敗はENEMY43.md。
BURST：主600/600、別200/200で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。

## 10-10
変更対象敵の属性：10-10/1/1=water、10-10/1/2=water、10-10/2/1=light、10-10/3/1=fire、10-10/3/2=earth、10-10/4/1=wind、10-10/5/1=earth、10-10/6/1=fire、10-10/6/2=earth。属性攻撃の適合は下記の攻撃技能属性で選べるが、全属性置換の勝率比較は未完。

|攻略|配置順の技能・効果・対象・条件・実発動試行数|
|---|---|
|主|1:SKD051 弱体解除（wind、first、{"type":"always"}）600/600<br>2:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）600/600<br>3:SKD010 直接攻撃（wind、first、{"type":"always"}）600/600<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）600/600<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）600/600|
|別|1:SKD035 攻撃強化（fire、all_allies、{"type":"always"}）152/200<br>2:SKD038 防御低下（earth、first、{"type":"always"}）200/200<br>3:SKD010 直接攻撃（wind、first、{"type":"always"}）200/200<br>4:SKD009 直接攻撃（earth、first、{"type":"always"}）200/200<br>5:SKD039 回復（water、lowest_ally、{"type":"ally_hp_below","value":0.5}）200/200|

勝ち方の相違：主だけの効果=弱体解除／別だけの効果=防御低下。差がない場合も対象・順序・条件の差を上表で確認し、武将名の差だけを別解に数えない。
攻撃順：前段の強化/弱体や解除を後段の攻撃へつなぐ配置を検証。対応する保存対照は1件。同資産低勝率比較attack-up-reversed。具体勝敗はENEMY43.md。
BURST：主600/600、別200/200で発生。中核支援の後に攻撃を集中する利用を維持。支援だけを連発して通常攻撃を混ぜる旧BURSTへ戻さない。
