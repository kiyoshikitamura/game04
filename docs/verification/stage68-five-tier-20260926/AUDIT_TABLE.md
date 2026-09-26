# GAME04 全68面：5段階・複数攻略の再構成案

**未承認の隔離調整案。共通Previewへ未適用。** 敵・報酬を変更する前に本案の具体差分を承認対象とする。既存の現行設定監査とは分離する。全68面を同じ面内の育成条件で比較し、戦闘エンジン、ダメージ式、BURST仕様は現行のまま。

「最適解」は検証した候補内での200試行以上の全勝であり、全編成の数学的最適性や真の勝率100%の証明ではない。次点は60%前後（50〜70%）、ギリギリは30%前後（20〜40%）、ほぼ厳しいは0%超〜10%、観測0%は未勝利と表す。隙間の勝率も個票に実数で残し、目標に合わせて丸めない。200回未勝利でも「クリア不能」とは断定しない（独立試行モデルで真の勝率の片側95%上限は約1.49%）。数学的不能の証明は今回の全編成空間には行っていない。

最初の10面は成功体験・育成見直しの既存方針を維持し、5段階の失敗例を無理に作らない。3-1以降は、中心の技が実際に発動する異なる戦法と、SP供給・BURST配分の戦法を確認する。同名系統の属性替えだけで複数攻略成立とは数えない。同条件とは共通の武将Lv・覚醒・装備・技LBであり、技のレアリティ別育成費まで同額とは限らない。確定供給案には主経路・別戦法・実用的なカード代替を切り替えられる共通所持予算を計上する。

探索81001〜81006、候補選定82001〜82020、本検証84001〜84200。再調整では85001〜85060・85501〜85520を探索に用い、86001〜86200以降の別200seedで確認。失敗した調整回も保存。個別カード置換は92001〜92030で選定・93001〜93200で検証、配置探索は94001〜94012で選定・95001〜95200で検証。上限に近い8面は110001〜110400で追加検証し、必要な再調整は111001〜111200の探索後、112001以降の別600seedで確認。入力・全seed結果・敵変更履歴は各面の圧縮JSON、全フレーム例は各面sample-trace。再生スクリプトを添付。

|面・ID|設計意図|整合|同条件／主攻略|別戦法|全勝|60%目安|30%目安|≤10%勝利あり|観測0%|到達・対応・判定|
|---|---|---|---|---|---|---|---|---|---|---|
|1-1 mikawa-1|初期3人で戦闘を学ぶ|現行一致・案は未配信|Lv1 装備なし 技LB0／cheap-attacks 200/200|なし|cheap-attacks 200/200|該当なし|該当なし|該当なし|該当なし|前面確定供給案・敵0項目・成立（現行設定・到達前確定配布）|
|1-2 mikawa-2|受ける役を決める|現行一致・案は未配信|Lv3 装備なし 技LB0／basic-focus 200/200|なし|basic-focus 200/200|該当なし|該当なし|該当なし|該当なし|前面確定供給案・敵0項目・成立（現行設定・到達前確定配布）|
|1-3 mikawa-3|一つ変えて突破する|現行一致・案は未配信|Lv5 装備なし 技LB0／basic-focus 200/200|なし|basic-focus 200/200|該当なし|該当なし|該当なし|該当なし|前面確定供給案・敵0項目・成立（現行設定・到達前確定配布）|
|1-4 mikawa-4|仲間の技を整え、影の忍びを迎え撃とう。|現行一致・案は未配信|Lv7 装備なし 技LB0／basic-focus 200/200|attack-up 200/200|basic-focus 200/200|該当なし|該当なし|該当なし|該当なし|前面確定供給案・敵0項目・成立（現行設定・到達前確定配布）|
|1-5 mikawa-5|前衛で力を蓄え、BURSTで敵将へ畳みかけよう。|現行一致・案は未配信|Lv9 装備なし 技LB0／attack-up 200/200|basic-focus 200/200|attack-up 200/200|該当なし|該当なし|該当なし|該当なし|前面確定供給案・敵0項目・成立（現行設定・到達前確定配布）|
|2-1 owari-1|まず1体減らす|現行一致・案は未配信|Lv9 装備なし 技LB0／cheap-attacks 200/200|なし|cheap-attacks 200/200|該当なし|該当なし|該当なし|該当なし|前面確定供給案・敵0項目・成立（現行設定・到達前確定配布）|
|2-2 owari-2|並んだ敵を削る|現行一致・案は未配信|Lv9 装備なし 技LB0／cheap-attacks 200/200|なし|cheap-attacks 200/200|該当なし|該当なし|該当なし|該当なし|前面確定供給案・敵0項目・成立（現行設定・到達前確定配布）|
|2-3 owari-3|後ろの支援を止める|現行一致・案は未配信|Lv9 装備なし 技LB0／attack-up 200/200|cheap-attacks 200/200|attack-up 200/200|該当なし|該当なし|該当なし|attack-up-reversed 0/200|前面確定供給案・敵0項目・成立（現行設定・到達前確定配布）|
|2-4 owari-4|倒す順を組み立てる|現行一致・案は未配信|Lv9 装備なし 技LB0／attack-up 200/200|cheap-attacks 200/200|attack-up 200/200|該当なし|該当なし|該当なし|attack-up-reversed 0/200|前面確定供給案・敵0項目・成立（現行設定・到達前確定配布）|
|2-5 owari-5|育てた五人の役割を揃え、今川の本陣に挑もう。|現行一致・案は未配信|Lv9 装備なし 技LB0／attack-up 200/200|cheap-attacks 200/200|attack-up 200/200|該当なし|該当なし|該当なし|attack-up-reversed 0/200|前面確定供給案・敵0項目・成立（現行設定・到達前確定配布）|
|3-1 mino-1|弱体の後に攻める|現行一致・案は未配信|Lv20 装備なし 技LB2／break-and-buff 200/200|attack-up 200/200|break-and-buff 200/200|該当なし|該当なし|armor-break-reversed 20/200|該当なし|前面確定供給案・敵2項目・条件付き（隔離案で成立・報酬追加承認前）|
|3-2 mino-2|強化を攻撃へつなぐ|現行一致・案は未配信|Lv22 装備なし 技LB2／break-and-buff 200/200|attack-up 200/200|break-and-buff 200/200|該当なし|該当なし|no-support 9/200|poison-boost 0/200|前面確定供給案・敵2項目・条件付き（隔離案で成立・報酬追加承認前）|
|3-3 mino-3|継続ダメージを足場にする|現行一致・案は未配信|Lv24 装備なし 技LB2／break-and-buff 200/200|attack-up 200/200|break-and-buff 200/200|no-support 110/200|break-and-buff-order-32541 72/200|該当なし|all-cheap 0/200|前面確定供給案・敵1項目・条件付き（隔離案で成立・報酬追加承認前）|
|3-4 mino-4|SPを使う役と貯める役|現行一致・案は未配信|Lv26 装備なし 技LB2／break-and-buff 200/200|attack-up 200/200|break-and-buff 200/200|break-and-buff-order-53421 126/200|該当なし|該当なし|attack-up-reversed 0/200|前面確定供給案・敵0項目・条件付き（隔離案で成立・報酬追加承認前）|
|3-5 mino-5|主軸を一つ選ぶ|現行一致・案は未配信|Lv28 装備なし 技LB2／break-regen 200/200|break-and-buff 200/200|break-regen 200/200|burst-focus-regen 132/200|attack-up 74/200|該当なし|attack-up-reversed 0/200|前面確定供給案・敵8項目・条件付き（隔離案で成立・報酬追加承認前）|
|4-1 omi-1|集中攻撃を受ける|現行一致・案は未配信|Lv30 N20 技LB2／counter-boost 200/200|defensive 200/200|counter-boost 200/200|該当なし|area-boost 58/200|該当なし|rear-focus-reversed 0/200|前面確定供給案・敵0項目・条件付き（隔離案で成立・報酬追加承認前）|
|4-2 omi-2|受けた攻撃を返す|現行一致・案は未配信|Lv32 N20 技LB2／counter-boost 200/200|attack-up 200/200|counter-boost 200/200|該当なし|該当なし|該当なし|rear-focus-reversed 0/200|前面確定供給案・敵0項目・条件付き（隔離案で成立・報酬追加承認前）|
|4-3 omi-3|全員の被害を戻す|現行一致・案は未配信|Lv34 N20 技LB2／burst-focus-greater-heal 200/200|defensive 200/200|burst-focus-greater-heal 200/200|burst-focus-greater-heal-order-15342 130/200|burst-focus-greater-heal-order-35142 53/200|burst-focus-greater-heal-order-53421 2/200|attack-up-reversed 0/200|前面確定供給案・敵2項目・条件付き（隔離案で成立・報酬追加承認前）|
|4-4 omi-4|大きな一撃に備える|現行一致・案は未配信|Lv36 N20 技LB2／counter-boost 200/200|attack-up 200/200|counter-boost 200/200|該当なし|該当なし|該当なし|該当なし|前面確定供給案・敵0項目・条件付き（隔離案で成立・報酬追加承認前）|
|4-5 omi-5|守りすぎずに勝つ|現行一致・案は未配信|Lv38 N20 技LB2／defensive 200/200|break-and-buff 200/200|defensive 200/200|該当なし|該当なし|該当なし|該当なし|前面確定供給案・敵3項目・条件付き（隔離案で成立・報酬追加承認前）|
|5-1 kai-1|同属性で攻める|現行一致・案は未配信|Lv40 N30 技LB3／attack-up 200/200|counter-boost 200/200|attack-up 200/200|attack-up-order-45321 119/200|attack-up-order-43152 45/200|attack-up-order-53421 1/200|該当なし|前面確定供給案・敵0項目・条件付き（隔離案で成立・報酬追加承認前）|
|5-2 kai-2|同属性で守る|現行一致・案は未配信|Lv42 N30 技LB3／counter-boost 200/200|barrier 200/200|counter-boost 200/200|該当なし|該当なし|該当なし|該当なし|前面確定供給案・敵0項目・条件付き（隔離案で成立・報酬追加承認前）|
|5-3 kai-3|攻撃属性だけを替える|現行一致・案は未配信|Lv44 N30 技LB3／break-and-buff 200/200|counter-boost 200/200|break-and-buff 200/200|該当なし|該当なし|area-boost 5/200|attack-up-reversed 0/200|前面確定供給案・敵0項目・条件付き（隔離案で成立・報酬追加承認前）|
|5-4 kai-4|混成の強みを使う|現行一致・案は未配信|Lv46 N30 技LB3／barrier 200/200|counter-boost 200/200|barrier 200/200|該当なし|該当なし|該当なし|該当なし|前面確定供給案・敵0項目・条件付き（隔離案で成立・報酬追加承認前）|
|5-5 kai-5|苦手属性を誰が受けるか|現行一致・案は未配信|Lv48 N30 技LB3／counter-boost 200/200|barrier 200/200|counter-boost 200/200|該当なし|該当なし|該当なし|該当なし|前面確定供給案・敵0項目・条件付き（隔離案で成立・報酬追加承認前）|
|5-6 kai-6|一色に寄せすぎない|現行一致・案は未配信|Lv50 N30 技LB3／attack-up 200/200|armor-break 200/200|attack-up 200/200|attack-up-reversed 103/200|rear-focus-reversed 66/200|attack-up-order-53421 18/200|該当なし|前面確定供給案・敵0項目・条件付き（隔離案で成立・報酬追加承認前）|
|6-1 echigo-1|継続被害を止める|現行一致・案は未配信|Lv50 N40 技LB3／burst-focus-greater-heal 200/200|cleanse-dot 200/200|burst-focus-greater-heal 200/200|burst-focus-greater-heal-order-52314 106/200|area-boost 63/200|該当なし|attack-up-reversed 0/200|前面確定供給案・敵3項目・条件付き（隔離案で成立・報酬追加承認前）|
|6-2 echigo-2|落とされた能力を戻す|現行一致・案は未配信|Lv52 N40 技LB3／break-and-buff 200/200|taunt-counter 156/200|break-and-buff 200/200|break-and-buff-order-31425 129/200|double-rock 51/200|break-and-buff-order-35214 17/200|attack-up-reversed 0/200|前面確定供給案・敵10項目・条件付き（隔離案で成立・報酬追加承認前）|
|6-3 echigo-3|止まった役割を補う|現行一致・案は未配信|Lv54 N40 技LB3／counter-boost 200/200|defensive 200/200|counter-boost 200/200|該当なし|該当なし|該当なし|該当なし|前面確定供給案・敵0項目・条件付き（隔離案で成立・報酬追加承認前）|
|6-4 echigo-4|敵の一手を遅らせる|現行一致・案は未配信|Lv56 N40 技LB3／burst-focus 200/200|counter-boost 134/200|burst-focus 200/200|defensive 120/200|burst-focus-order-31254 57/200|該当なし|poison-boost 0/200|前面確定供給案・敵3項目・条件付き（隔離案で成立・報酬追加承認前）|
|6-5 echigo-5|状態付与と攻撃を分担する|現行一致・案は未配信|Lv58 N40 技LB3／cleanse-stat 200/200|counter-boost 200/200|cleanse-stat 200/200|cleanse-stat-order-23145 123/200|cleanse-stat-order-23415 65/200|poison-control 16/200|all-cheap 0/200|前面確定供給案・敵1項目・条件付き（隔離案で成立・報酬追加承認前）|
|6-6 echigo-6|対策枠を選ぶ|現行一致・案は未配信|Lv60 N40 技LB3／double-rock 200/200|burst-focus-greater-heal 198/200|double-rock 200/200|basic-focus 108/200|attack-up-reversed 50/200|double-rock-order-43152 3/200|該当なし|前面確定供給案・敵1項目・条件付き（隔離案で成立・報酬追加承認前）|
|7-1 kyoto-1|強化された攻撃を崩す|現行一致・案は未配信|Lv60 R30 技LB4／double-rock 200/200|burst-focus-greater-heal 198/200|double-rock 200/200|basic-focus 139/200|double-rock-order-35214 70/200|double-rock-order-35241 11/200|attack-up-reversed 0/200|前面確定供給案・敵2項目・条件付き（隔離案で成立・報酬追加承認前）|
|7-2 kyoto-2|固めた守りを崩す|現行一致・案は未配信|Lv62 R30 技LB4／break-and-buff 200/200|double-rock 200/200|break-and-buff 200/200|poor-element 138/200|break-and-buff-order-43215 59/200|armor-break-reversed 3/200|all-cheap 0/200|前面確定供給案・敵5項目・条件付き（隔離案で成立・報酬追加承認前）|
|7-3 kyoto-3|障壁を取り除く|現行一致・案は未配信|Lv64 R30 技LB4／remove-protection 200/200|rear-focus 154/200|remove-protection 200/200|no-heal 131/200|taunt-counter 58/200|該当なし|rear-focus-reversed 0/200|前面確定供給案・敵0項目・条件付き（隔離案で成立・報酬追加承認前）|
|7-4 kyoto-4|回復源を断つ|現行一致・案は未配信|Lv66 R30 技LB4／rear-focus 200/200|burst-focus-regen 179/200|rear-focus 200/200|break-and-buff 108/200|expensive-first 52/200|該当なし|attack-up-reversed 0/200|前面確定供給案・敵4項目・条件付き（隔離案で成立・報酬追加承認前）|
|7-5 kyoto-5|反撃に付き合いすぎない|現行一致・案は未配信|Lv68 R30 技LB4／remove-protection 200/200|defensive 200/200|remove-protection 200/200|該当なし|attack-up-reversed 54/200|該当なし|該当なし|前面確定供給案・敵0項目・条件付き（隔離案で成立・報酬追加承認前）|
|7-6 kyoto-6|誘導された攻撃を通す|現行一致・案は未配信|Lv70 R30 技LB4／taunt-counter 200/200|remove-protection 200/200|taunt-counter 200/200|area-boost 115/200|該当なし|該当なし|rear-focus-reversed 0/200|前面確定供給案・敵0項目・条件付き（隔離案で成立・報酬追加承認前）|
|7-7 kyoto-7|再付与より先に決着|現行一致・案は未配信|Lv72 R30 技LB4／stun 200/200|rear-focus 186/200|stun 200/200|break-regen 113/200|burst-focus-greater-heal 65/200|expensive-first 14/200|attack-up-reversed 0/200|前面確定供給案・敵11項目・条件付き（隔離案で成立・報酬追加承認前）|
|7-8 kyoto-8|崩す場所を選ぶ|現行一致・案は未配信|Lv74 R30 技LB4／remove-protection 200/200|cheap-attacks 126/200|remove-protection 200/200|cheap-attacks 126/200|armor-break 58/200|no-support 15/200|all-attack 0/200|前面確定供給案・敵6項目・条件付き（隔離案で成立・報酬追加承認前）|
|8-1 izumo-1|削られたまま次へ進む|現行一致・案は未配信|Lv74 R40 技LB4／burst-focus-greater-heal 200/200|defensive 200/200|burst-focus-greater-heal 200/200|burst-focus-greater-heal-order-13542 140/200|area-boost 49/200|該当なし|rear-focus-reversed 0/200|前面確定供給案・敵4項目・条件付き（隔離案で成立・報酬追加承認前）|
|8-2 izumo-2|小技と主砲を共存させる|現行一致・案は未配信|Lv75 R40 技LB4／break-and-buff 200/200|double-rock 200/200|break-and-buff 200/200|該当なし|armor-break-reversed 75/200|該当なし|rear-focus-reversed 0/200|前面確定供給案・敵1項目・条件付き（隔離案で成立・報酬追加承認前）|
|8-3 izumo-3|単体と全体を両立する|現行一致・案は未配信|Lv76 R40 技LB4／break-and-buff 600/600|burst-focus 197/200|break-and-buff 600/600|break-and-buff-order-31245 117/200|burst-focus-greater-heal 51/200|break-and-buff-order-13542 20/200|attack-up-reversed 0/200|前面確定供給案・敵10項目・条件付き（隔離案で成立・報酬追加承認前）|
|8-4 izumo-4|持ち越した状態へ対処|現行一致・案は未配信|Lv77 R40 技LB4／break-and-buff 200/200|cleanse-dot 178/200|break-and-buff 200/200|break-and-buff-order-15342 120/200|該当なし|no-heal 4/200|attack-up-reversed 0/200|前面確定供給案・敵4項目・条件付き（隔離案で成立・報酬追加承認前）|
|8-5 izumo-5|支援役を守り続ける|現行一致・案は未配信|Lv78 R40 技LB4／burst-focus-regen 200/200|barrier 200/200|burst-focus-regen 200/200|rear-focus 126/200|poison-boost 43/200|cheap-attacks 4/200|該当なし|前面確定供給案・敵3項目・条件付き（隔離案で成立・報酬追加承認前）|
|8-6 izumo-6|一人失っても立て直す|現行一致・案は未配信|Lv79 R40 技LB4／double-rock 200/200|armor-break 200/200|double-rock 200/200|double-rock-order-35241 132/200|double-rock-order-35142 69/200|armor-break-reversed 4/200|該当なし|前面確定供給案・敵0項目・条件付き（隔離案で成立・報酬追加承認前）|
|8-7 izumo-7|効果が切れた後も戦う|現行一致・案は未配信|Lv80 R40 技LB4／burst-focus-greater-heal 200/200|rear-focus 200/200|burst-focus-greater-heal 200/200|該当なし|該当なし|burst-focus-greater-heal-order-31425 11/200|attack-up-reversed 0/200|前面確定供給案・敵5項目・条件付き（隔離案で成立・報酬追加承認前）|
|8-8 izumo-8|連戦用の5人を完成させる|現行一致・案は未配信|Lv80 R40 技LB4／cleanse-dot 200/200|defensive 199/200|cleanse-dot 200/200|cleanse-dot-order-43215 132/200|poison-control 48/200|attack-up-reversed 3/200|該当なし|前面確定供給案・敵4項目・条件付き（隔離案で成立・報酬追加承認前）|
|9-1 satsuma-1|単体突破の極意|現行一致・案は未配信|Lv80 R50 技LB5／break-and-buff 200/200|taunt-counter 200/200|break-and-buff 200/200|break-and-buff-order-35241 122/200|no-support 57/200|poison-control 10/200|all-cheap 0/200|前面確定供給案・敵2項目・条件付き（隔離案で成立・報酬追加承認前）|
|9-2 satsuma-2|全体削りの極意|現行一致・案は未配信|Lv80 R50 技LB5／burst-focus-greater-heal 200/200|rear-focus 199/200|burst-focus-greater-heal 200/200|basic-focus 104/200|該当なし|burst-focus-greater-heal-order-14253 12/200|attack-up-reversed 0/200|前面確定供給案・敵10項目・条件付き（隔離案で成立・報酬追加承認前）|
|9-3 satsuma-3|後列攻略の極意|現行一致・案は未配信|Lv80 R50 技LB5／rear-focus 200/200|stun 171/200|rear-focus 200/200|rear-focus-order-52314 132/200|rear-focus-order-23415 52/200|該当なし|attack-up-reversed 0/200|前面確定供給案・敵9項目・条件付き（隔離案で成立・報酬追加承認前）|
|9-4 satsuma-4|通常攻撃の極意|現行一致・案は未配信|Lv80 R50 技LB5／break-regen 200/200|break-and-buff 199/200|break-regen 200/200|該当なし|該当なし|attack-up 2/200|double-rock 0/200|前面確定供給案・敵9項目・条件付き（隔離案で成立・報酬追加承認前）|
|9-5 satsuma-5|弱体連携の極意|現行一致・案は未配信|Lv80 R50 技LB5／rear-focus 200/200|break-and-buff 186/200|rear-focus 200/200|rear-focus-order-24513 100/200|burst-focus-regen 74/200|該当なし|attack-up-reversed 0/200|前面確定供給案・敵9項目・条件付き（隔離案で成立・報酬追加承認前）|
|9-6 satsuma-6|継続ダメージの極意|現行一致・案は未配信|Lv80 R50 技LB5／break-and-buff 200/200|counter-boost 198/200|break-and-buff 200/200|burst-focus-greater-heal 127/200|break-and-buff-order-32514 52/200|該当なし|attack-up-reversed 0/200|前面確定供給案・敵4項目・条件付き（隔離案で成立・報酬追加承認前）|
|9-7 satsuma-7|反撃の極意|現行一致・案は未配信|Lv80 R50 技LB5／burst-focus-greater-heal 200/200|armor-break 200/200|burst-focus-greater-heal 200/200|break-regen 107/200|該当なし|該当なし|attack-up-reversed 0/200|前面確定供給案・敵4項目・条件付き（隔離案で成立・報酬追加承認前）|
|9-8 satsuma-8|背水の極意|現行一致・案は未配信|Lv80 R50 技LB5／break-and-buff 200/200|taunt-counter 200/200|break-and-buff 200/200|break-regen 105/200|burst-focus-regen 57/200|該当なし|attack-up-reversed 0/200|前面確定供給案・敵2項目・条件付き（隔離案で成立・報酬追加承認前）|
|9-9 satsuma-9|妨害と解除の極意|現行一致・案は未配信|Lv80 R50 技LB5／break-and-buff 200/200|attack-up 198/200|break-and-buff 200/200|該当なし|double-rock 41/200|no-support 3/200|attack-up-reversed 0/200|前面確定供給案・敵5項目・条件付き（隔離案で成立・報酬追加承認前）|
|9-10 satsuma-10|得意と不得意を見抜く|現行一致・案は未配信|Lv80 R50 技LB5／break-regen 600/600|break-and-buff 195/200|break-regen 600/600|cleanse-dot 109/200|barrier 42/200|poor-element 10/200|attack-up-reversed 0/200|前面確定供給案・敵10項目・条件付き（隔離案で成立・報酬追加承認前）|
|10-1 sekigahara-1|硬い前衛と危険な後衛|現行一致・案は未配信|Lv80 R50 技LB5／break-and-buff 600/600|support-feed 200/200|break-and-buff 600/600|taunt-counter 133/200|break-and-buff-order-32541 57/200|armor-break 14/200|該当なし|前面確定供給案・敵13項目・条件付き（隔離案で成立・報酬追加承認前）|
|10-2 sekigahara-2|分散被害と集中被害|現行一致・案は未配信|Lv80 R50 技LB5／break-and-buff 200/200|support-feed 197/200|break-and-buff 200/200|該当なし|break-and-buff-order-15342 51/200|break-and-buff-order-31245 15/200|attack-up-reversed 0/200|前面確定供給案・敵9項目・条件付き（隔離案で成立・報酬追加承認前）|
|10-3 sekigahara-3|強化と保護の二重守備|現行一致・案は未配信|Lv80 R50 技LB5／break-and-buff 600/600|burst-focus 200/200|break-and-buff 600/600|armor-break 104/200|defensive 47/200|該当なし|attack-up-reversed 0/200|前面確定供給案・敵11項目・条件付き（隔離案で成立・報酬追加承認前）|
|10-4 sekigahara-4|火力低下と継続被害|現行一致・案は未配信|Lv80 R50 技LB5／cleanse-dot 200/200|armor-break 175/200|cleanse-dot 200/200|該当なし|defensive 66/200|cleanse-dot-order-41532 3/200|attack-up-reversed 0/200|前面確定供給案・敵9項目・条件付き（隔離案で成立・報酬追加承認前）|
|10-5 sekigahara-5|同属性主軸の弱点を補う|現行一致・案は未配信|Lv80 R50 技LB5／break-and-buff 600/600|support-feed 200/200|break-and-buff 600/600|break-and-buff-order-31245 129/200|double-rock 40/200|該当なし|attack-up-reversed 0/200|前面確定供給案・敵12項目・条件付き（隔離案で成立・報酬追加承認前）|
|10-6 sekigahara-6|条件火力を維持する|現行一致・案は未配信|Lv80 R50 技LB5／burst-focus 200/200|break-and-buff 199/200|burst-focus 200/200|burst-focus-replace-SKD010-SKD007 140/200|double-rock 75/200|poison-control 17/200|attack-up-reversed 0/200|前面確定供給案・敵12項目・条件付き（隔離案で成立・報酬追加承認前）|
|10-7 sekigahara-7|背水と生存を両立する|現行一致・案は未配信|Lv80 R50 技LB5／armor-break 200/200|defensive 199/200|armor-break 200/200|armor-break-order-15342 103/200|該当なし|expensive-first 11/200|attack-up-reversed 0/200|前面確定供給案・敵8項目・条件付き（隔離案で成立・報酬追加承認前）|
|10-8 sekigahara-8|フェーズ後も役割を残す|現行一致・案は未配信|Lv80 R50 技LB5／break-regen 600/600|remove-buff 192/200|break-regen 600/600|attack-up 138/200|defensive 73/200|all-attack 9/200|area-boost 0/200|前面確定供給案・敵8項目・条件付き（隔離案で成立・報酬追加承認前）|
|10-9 sekigahara-9|長い戦いを短く終える|現行一致・案は未配信|Lv80 R50 技LB5／attack-up 600/600|support-feed 199/200|attack-up 600/600|該当なし|defensive 78/200|attack-up-order-54123 16/200|attack-up-reversed 0/200|前面確定供給案・敵13項目・条件付き（隔離案で成立・報酬追加承認前）|
|10-10 sekigahara-10|自分の主力で最終突破|現行一致・案は未配信|Lv80 R50 技LB5／remove-buff 600/600|break-and-buff 200/200|remove-buff 600/600|burst-focus-regen 115/200|該当なし|no-heal 12/200|attack-up-reversed 0/200|前面確定供給案・敵19項目・条件付き（隔離案で成立・報酬追加承認前）|
