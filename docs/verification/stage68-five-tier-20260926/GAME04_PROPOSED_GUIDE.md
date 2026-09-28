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

## 1-1 初陣の野
ID: mikawa-1。設計意図: 初期3人で戦闘を学ぶ
**成立（現行設定・到達前確定配布）**。敵変更0項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv1、覚醒0。装備なし。技LB0。
到達経路: cheap-attacksの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 低消費攻撃 100.0% (200/200)、11〜13行動。変更前の同編成: 100.0% (200/200)。別戦法: 未成立。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|低消費攻撃 100.0% (200/200)|
|次点（60%前後）|該当なし|
|ギリギリ（30%前後）|該当なし|
|ほぼ厳しい（0%超〜10%）|該当なし|
|未勝利（観測0%）|該当なし|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|低消費攻撃 (cheap-attacks)|100.0% (200/200)・11〜13行動|char_joe_01:SKD003 ／ char_daimon_01:SKD003 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":684,"SKD003":1602}。未発動SKD039。敗北{"final_wave_defeated":200}|
|低消費攻撃・SKD003-SKD004置換（中心技の発動が半数未満・比較用） (cheap-attacks-replace-SKD003-SKD004)|100.0% (200/200)・11〜12行動|char_joe_01:SKD004 ／ char_daimon_01:SKD004 ／ char_aoi_01:SKD039|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":706,"SKD004":1551}。未発動SKD039。敗北{"final_wave_defeated":200}|
|低消費攻撃・SKD039-SKD040置換 (cheap-attacks-replace-SKD039-SKD040)|100.0% (200/200)・11〜13行動|char_joe_01:SKD003 ／ char_daimon_01:SKD003 ／ char_aoi_01:SKD040|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":662,"SKD003":1601}。未発動SKD040。敗北{"final_wave_defeated":200}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|1／0|1029.00／94.58／54.60|なし|SKD003 土割り LB0 SP25 first [{"type":"damage","power":105}] 入手:チュートリアル確定|
|2|井伊直政 (char_daimon_01)|1／0|720.00／153.00／40.80|なし|SKD003 土割り LB0 SP25 first [{"type":"damage","power":105}] 入手:チュートリアル確定|
|3|お市の方 (char_aoi_01)|1／0|800.25／141.75／41.16|なし|SKD039 応急手当 LB0 SP35 lowest_ally [{"type":"heal","power":35,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":0,"eqExp":0,"cash":0,"skillMaterials":0,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_daimon_01":0,"char_aoi_01":0},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":0,"eqExp":0,"cash":0,"skillMaterials":0,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_daimon_01":0,"char_aoi_01":0},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: []。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":0,"charExp":0,"eqExp":0,"skillMaterials":0,"genericR":0}。追加案なしのEXP/銭周回比較: null。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ76〜91（各試行の最小値）、最大212〜258。1ダメージ0/2286攻撃イベント。BURST0〜1回。SP獲得206〜370、技消費100〜200、終了SP106〜170。
cheap-attacks（元 100.0% (200/200)）の配置順だけ逆転: 100.0% (200/200)、10〜13行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD003","alternatives":[{"name":"cheap-attacks-replace-SKD003-SKD004","wins":200,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"cheap-attacks-replace-SKD039-SKD040","wins":200,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
数値変更なし。

全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 1-1-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 1-1-validated.json.gz／1-1-sample-trace.json.gz。失敗した独立検証回は 1-1-validation-v1／round-*。

---

## 1-2 街道の関所
ID: mikawa-2。設計意図: 受ける役を決める
**成立（現行設定・到達前確定配布）**。敵変更0項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv3、覚醒0。装備なし。技LB0。
到達経路: basic-focusの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: SP供給と強化 100.0% (200/200)、16〜18行動。変更前の同編成: 100.0% (200/200)。別戦法: 未成立。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|SP供給と強化 100.0% (200/200)|
|次点（60%前後）|該当なし|
|ギリギリ（30%前後）|該当なし|
|ほぼ厳しい（0%超〜10%）|該当なし|
|未勝利（観測0%）|該当なし|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|SP供給と強化 (basic-focus)|100.0% (200/200)・16〜18行動|char_joe_01:SKD035 ／ char_daimon_01:SKD003 ／ char_jihoon_01:SKD003 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":1141,"SKD003":1907,"SKD035":201}。未発動SKD039。敗北{"final_wave_defeated":200}|
|SP供給と強化・SKD035-SKD038置換 (basic-focus-replace-SKD035-SKD038)|100.0% (200/200)・16〜20行動|char_joe_01:SKD038 ／ char_daimon_01:SKD003 ／ char_jihoon_01:SKD003 ／ char_aoi_01:SKD039|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":874,"SKD003":2042,"SKD038":496}。未発動SKD039。敗北{"final_wave_defeated":200}|
|SP供給と強化・SKD003-SKD001置換（中心技の発動が半数未満・比較用） (basic-focus-replace-SKD003-SKD001)|100.0% (200/200)・19〜19行動|char_joe_01:SKD035 ／ char_daimon_01:SKD001 ／ char_jihoon_01:SKD001 ／ char_aoi_01:SKD039|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":1144,"SKD001":2304,"SKD035":352}。未発動SKD039。敗北{"final_wave_defeated":200}|
|SP供給と強化・SKD039-SKD040置換 (basic-focus-replace-SKD039-SKD040)|100.0% (200/200)・16〜18行動|char_joe_01:SKD035 ／ char_daimon_01:SKD003 ／ char_jihoon_01:SKD003 ／ char_aoi_01:SKD040|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":1141,"SKD003":1905,"SKD035":200}。未発動SKD040。敗北{"final_wave_defeated":200}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|3／0|1196.69／115.59／66.73|なし|SKD035 鬨の声 LB0 SP75 all_allies [{"type":"atk_up","power":8,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|2|井伊直政 (char_daimon_01)|3／0|837.33／187.00／49.87|なし|SKD003 土割り LB0 SP25 first [{"type":"damage","power":105}] 入手:チュートリアル確定|
|3|前田利家 (char_jihoon_01)|3／0|1004.80／158.95／57.35|なし|SKD003 土割り LB0 SP25 first [{"type":"damage","power":105}] 入手:チュートリアル確定|
|4|お市の方 (char_aoi_01)|3／0|930.66／173.25／50.31|なし|SKD039 応急手当 LB0 SP35 lowest_ally [{"type":"heal","power":35,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":320,"eqExp":0,"cash":320,"skillMaterials":0,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_daimon_01":0,"char_jihoon_01":0,"char_aoi_01":0},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":320,"eqExp":0,"cash":320,"skillMaterials":0,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_daimon_01":0,"char_aoi_01":0,"char_jihoon_01":0},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: []。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":0,"charExp":0,"eqExp":0,"skillMaterials":0,"genericR":0}。追加案なしのEXP/銭周回比較: {"stage":"1-1","successfulClears":0,"energy":0,"recipeSource":"1-1-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ86〜104（各試行の最小値）、最大276〜337。1ダメージ0/3048攻撃イベント。BURST0〜1回。SP獲得330〜516、技消費200〜300、終了SP70〜241。
basic-focus（元 100.0% (200/200)）の配置順だけ逆転: 100.0% (200/200)、15〜19行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD035","alternatives":[{"name":"basic-focus-replace-SKD035-SKD038","wins":200,"n":200}]},{"skill":"SKD003","alternatives":[{"name":"basic-focus-replace-SKD003-SKD001","wins":200,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"basic-focus-replace-SKD039-SKD040","wins":200,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
数値変更なし。

全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 1-2-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 1-2-validated.json.gz／1-2-sample-trace.json.gz。失敗した独立検証回は 1-2-validation-v1／round-*。

---

## 1-3 夕映えの陣
ID: mikawa-3。設計意図: 一つ変えて突破する
**成立（現行設定・到達前確定配布）**。敵変更0項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv5、覚醒0。装備なし。技LB0。
到達経路: basic-focusの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: SP供給と強化 100.0% (200/200)、15〜19行動。変更前の同編成: 100.0% (200/200)。別戦法: 未成立。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|SP供給と強化 100.0% (200/200)|
|次点（60%前後）|該当なし|
|ギリギリ（30%前後）|該当なし|
|ほぼ厳しい（0%超〜10%）|該当なし|
|未勝利（観測0%）|該当なし|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|SP供給と強化 (basic-focus)|100.0% (200/200)・15〜19行動|char_joe_01:SKD035 ／ char_daimon_01:SKD003 ／ char_jihoon_01:SKD003 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":1121,"SKD003":1985,"SKD035":223}。未発動SKD039。敗北{"final_wave_defeated":200}|
|攻撃強化（中心技の発動が半数未満・比較用） (attack-up)|100.0% (200/200)・15〜19行動|char_joe_01:SKD003 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":1223,"SKD009":1050,"SKD003":1237}。未発動SKD039。敗北{"final_wave_defeated":200}|
|回復なし比較 (no-heal)|100.0% (200/200)・14〜17行動|char_joe_01:SKD003 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD009|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":885,"SKD009":1754,"SKD003":238}。未発動なし。敗北{"final_wave_defeated":200}|
|回復なし比較・SKD003-SKD001置換 (no-heal-replace-SKD003-SKD001)|100.0% (200/200)・14〜18行動|char_joe_01:SKD001 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD009|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":922,"SKD009":1739,"SKD001":264}。未発動なし。敗北{"final_wave_defeated":200}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|5／0|1364.38／136.61／78.87|なし|SKD035 鬨の声 LB0 SP75 all_allies [{"type":"atk_up","power":8,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|2|井伊直政 (char_daimon_01)|5／0|954.67／221.00／58.93|なし|SKD003 土割り LB0 SP25 first [{"type":"damage","power":105}] 入手:チュートリアル確定|
|3|前田利家 (char_jihoon_01)|5／0|1145.60／187.85／67.77|なし|SKD003 土割り LB0 SP25 first [{"type":"damage","power":105}] 入手:チュートリアル確定|
|4|お市の方 (char_aoi_01)|5／0|1061.07／204.75／59.45|なし|SKD039 応急手当 LB0 SP35 lowest_ally [{"type":"heal","power":35,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":1560,"eqExp":0,"cash":1560,"skillMaterials":0,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_daimon_01":0,"char_jihoon_01":0,"char_aoi_01":0},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":1560,"eqExp":0,"cash":1560,"skillMaterials":0,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_daimon_01":0,"char_aoi_01":0,"char_jihoon_01":0},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: []。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":0,"charExp":0,"eqExp":0,"skillMaterials":0,"genericR":0}。追加案なしのEXP/銭周回比較: {"stage":"1-2","successfulClears":0,"energy":0,"recipeSource":"1-2-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ109〜133（各試行の最小値）、最大342〜403。1ダメージ0/3106攻撃イベント。BURST0〜1回。SP獲得288〜536、技消費200〜300、終了SP70〜241。
basic-focus（元 100.0% (200/200)）の配置順だけ逆転: 100.0% (200/200)、18〜19行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD035","alternatives":[{"name":"no-heal","wins":200,"n":200},{"name":"no-heal-replace-SKD003-SKD001","wins":200,"n":200},{"name":"attack-up","wins":200,"n":200}]},{"skill":"SKD003","alternatives":[{"name":"no-heal-replace-SKD003-SKD001","wins":200,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"no-heal","wins":200,"n":200},{"name":"no-heal-replace-SKD003-SKD001","wins":200,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
数値変更なし。

全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 1-3-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 1-3-validated.json.gz／1-3-sample-trace.json.gz。失敗した独立検証回は 1-3-validation-v1／round-*。

---

## 1-4 影走る古道
ID: mikawa-4。設計意図: 仲間の技を整え、影の忍びを迎え撃とう。
**成立（現行設定・到達前確定配布）**。敵変更0項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv7、覚醒0。装備なし。技LB0。
到達経路: basic-focus／attack-upの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: SP供給と強化 100.0% (200/200)、20〜23行動。変更前の同編成: 100.0% (200/200)。別戦法: 攻撃強化 100.0% (200/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|SP供給と強化 100.0% (200/200)|
|次点（60%前後）|該当なし|
|ギリギリ（30%前後）|該当なし|
|ほぼ厳しい（0%超〜10%）|該当なし|
|未勝利（観測0%）|該当なし|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|SP供給と強化 (basic-focus)|100.0% (200/200)・20〜23行動|char_joe_01:SKD035 ／ char_yuki_01:SKD003 ／ char_daimon_01:SKD003 ／ char_jihoon_01:SKD003 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":1244,"SKD003":2784,"SKD035":200}。未発動SKD039。敗北{"final_wave_defeated":200}|
|攻撃強化 (attack-up)|100.0% (200/200)・20〜24行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":1527,"SKD009":1242,"SKD003":1262,"SKD035":358}。未発動SKD039。敗北{"final_wave_defeated":200}|
|低消費攻撃のみ比較 (all-cheap)|100.0% (200/200)・18〜22行動|char_joe_01:SKD003 ／ char_yuki_01:SKD003 ／ char_daimon_01:SKD003 ／ char_jihoon_01:SKD003 ／ char_aoi_01:SKD003|前面までの確定供給案・育成予算内。{"basic":450,"SKD003":3381}。未発動なし。敗北{"final_wave_defeated":200}|
|低消費攻撃のみ比較・SKD003-SKD004置換 (all-cheap-replace-SKD003-SKD004)|100.0% (200/200)・21〜24行動|char_joe_01:SKD004 ／ char_yuki_01:SKD004 ／ char_daimon_01:SKD004 ／ char_jihoon_01:SKD004 ／ char_aoi_01:SKD004|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":600,"SKD004":3757}。未発動なし。敗北{"final_wave_defeated":200}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|7／0|1532.07／157.63／91.00|なし|SKD035 鬨の声 LB0 SP75 all_allies [{"type":"atk_up","power":8,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|2|竹中半兵衛 (char_yuki_01)|7／0|1610.23／154.38／88.40|なし|SKD003 土割り LB0 SP25 first [{"type":"damage","power":105}] 入手:チュートリアル確定|
|3|井伊直政 (char_daimon_01)|7／0|1072.00／255.00／68.00|なし|SKD003 土割り LB0 SP25 first [{"type":"damage","power":105}] 入手:チュートリアル確定|
|4|前田利家 (char_jihoon_01)|7／0|1286.40／216.75／78.20|なし|SKD003 土割り LB0 SP25 first [{"type":"damage","power":105}] 入手:チュートリアル確定|
|5|お市の方 (char_aoi_01)|7／0|1191.48／236.25／68.60|なし|SKD039 応急手当 LB0 SP35 lowest_ally [{"type":"heal","power":35,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":4700,"eqExp":0,"cash":4700,"skillMaterials":0,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_yuki_01":0,"char_daimon_01":0,"char_jihoon_01":0,"char_aoi_01":0},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":4700,"eqExp":0,"cash":4700,"skillMaterials":0,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_daimon_01":0,"char_aoi_01":0,"char_jihoon_01":0,"char_yuki_01":0},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: []。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":0,"charExp":0,"eqExp":0,"skillMaterials":0,"genericR":0}。追加案なしのEXP/銭周回比較: {"stage":"1-3","successfulClears":0,"energy":0,"recipeSource":"1-3-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ123〜148（各試行の最小値）、最大258〜468。1ダメージ0/4028攻撃イベント。BURST0〜2回。SP獲得432〜616、技消費275〜400、終了SP142〜221。
basic-focus（元 100.0% (200/200)）の配置順だけ逆転: 100.0% (200/200)、18〜21行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD035","alternatives":[{"name":"all-cheap","wins":200,"n":200},{"name":"all-cheap-replace-SKD003-SKD004","wins":200,"n":200}]},{"skill":"SKD003","alternatives":[{"name":"all-cheap-replace-SKD003-SKD004","wins":200,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"all-cheap","wins":200,"n":200},{"name":"all-cheap-replace-SKD003-SKD004","wins":200,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
数値変更なし。

全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 1-4-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 1-4-validated.json.gz／1-4-sample-trace.json.gz。失敗した独立検証回は 1-4-validation-v1／round-*。

---

## 1-5 三河の勝鬨
ID: mikawa-5。設計意図: 前衛で力を蓄え、BURSTで敵将へ畳みかけよう。
**成立（現行設定・到達前確定配布）**。敵変更0項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv9、覚醒0。装備なし。技LB0。
到達経路: attack-up／basic-focusの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 攻撃強化 100.0% (200/200)、15〜15行動。変更前の同編成: 100.0% (200/200)。別戦法: SP供給と強化 100.0% (200/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|攻撃強化 100.0% (200/200)|
|次点（60%前後）|該当なし|
|ギリギリ（30%前後）|該当なし|
|ほぼ厳しい（0%超〜10%）|該当なし|
|未勝利（観測0%）|該当なし|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|攻撃強化 (attack-up)|100.0% (200/200)・15〜15行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":1400,"SKD009":1000,"SKD003":400,"SKD035":200}。未発動SKD039。敗北{"final_wave_defeated":200}|
|SP供給と強化 (basic-focus)|100.0% (200/200)・15〜15行動|char_joe_01:SKD035 ／ char_yuki_01:SKD003 ／ char_daimon_01:SKD003 ／ char_jihoon_01:SKD003 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":1000,"SKD003":1800,"SKD035":200}。未発動SKD039。敗北{"final_wave_defeated":200}|
|支援なし比較 (no-support)|100.0% (200/200)・14〜15行動|char_joe_01:SKD003 ／ char_yuki_01:SKD003 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":874,"SKD003":1000,"SKD009":963}。未発動SKD039。敗北{"final_wave_defeated":200}|
|支援なし比較・SKD003-SKD004置換 (no-support-replace-SKD003-SKD004)|100.0% (200/200)・13〜15行動|char_joe_01:SKD004 ／ char_yuki_01:SKD004 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":852,"SKD004":1000,"SKD009":946}。未発動SKD039。敗北{"final_wave_defeated":200}|
|支援なし比較・SKD039-SKD040置換 (no-support-replace-SKD039-SKD040)|100.0% (200/200)・14〜15行動|char_joe_01:SKD003 ／ char_yuki_01:SKD003 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD040|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":896,"SKD003":1000,"SKD009":946}。未発動SKD040。敗北{"final_wave_defeated":200}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|9／0|1699.76／178.64／103.13|なし|SKD003 土割り LB0 SP25 first [{"type":"damage","power":105}] 入手:チュートリアル確定|
|2|竹中半兵衛 (char_yuki_01)|9／0|1786.48／174.96／100.19|なし|SKD035 鬨の声 LB0 SP75 all_allies [{"type":"atk_up","power":8,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|3|井伊直政 (char_daimon_01)|9／0|1189.33／289.00／77.07|なし|SKD009 岩断 LB0 SP50 first [{"type":"damage","power":120}] 入手:1-2 現行初回/任務確定|
|4|前田利家 (char_jihoon_01)|9／0|1427.20／245.65／88.63|なし|SKD009 岩断 LB0 SP50 first [{"type":"damage","power":120}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|9／0|1321.89／267.75／77.75|なし|SKD039 応急手当 LB0 SP35 lowest_ally [{"type":"heal","power":35,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":8900,"eqExp":0,"cash":8900,"skillMaterials":0,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_yuki_01":0,"char_daimon_01":0,"char_jihoon_01":0,"char_aoi_01":0},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":8900,"eqExp":0,"cash":8900,"skillMaterials":0,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_daimon_01":0,"char_aoi_01":0,"char_jihoon_01":0,"char_yuki_01":0},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: []。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":0,"charExp":0,"eqExp":0,"skillMaterials":0,"genericR":0}。追加案なしのEXP/銭周回比較: {"stage":"1-4","successfulClears":0,"energy":0,"recipeSource":"1-4-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ139〜162（各試行の最小値）、最大466〜569。1ダメージ0/2800攻撃イベント。BURST0〜1回。SP獲得434〜454、技消費325〜375、終了SP79〜109。
attack-up（元 100.0% (200/200)）の配置順だけ逆転: 100.0% (200/200)、13〜16行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD003","alternatives":[{"name":"no-support-replace-SKD003-SKD004","wins":200,"n":200}]},{"skill":"SKD035","alternatives":[{"name":"no-support-replace-SKD003-SKD004","wins":200,"n":200},{"name":"no-support","wins":200,"n":200},{"name":"no-support-replace-SKD039-SKD040","wins":200,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"basic-focus","wins":200,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"no-support-replace-SKD039-SKD040","wins":200,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
数値変更なし。

全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 1-5-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 1-5-validated.json.gz／1-5-sample-trace.json.gz。失敗した独立検証回は 1-5-validation-v1／round-*。

---

## 2-1 朝霧の街道
ID: owari-1。設計意図: まず1体減らす
**成立（現行設定・到達前確定配布）**。敵変更0項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv9、覚醒0。装備なし。技LB0。
到達経路: cheap-attacksの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 低消費攻撃 100.0% (200/200)、33〜38行動。変更前の同編成: 100.0% (200/200)。別戦法: 未成立。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|低消費攻撃 100.0% (200/200)|
|次点（60%前後）|該当なし|
|ギリギリ（30%前後）|該当なし|
|ほぼ厳しい（0%超〜10%）|該当なし|
|未勝利（観測0%）|該当なし|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|攻撃強化（中心技の発動が半数未満・比較用） (attack-up)|100.0% (200/200)・31〜37行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":3681,"SKD009":2047,"SKD003":773,"SKD035":102,"SKD039":1}。未発動なし。敗北{"final_wave_defeated":200}|
|低消費攻撃 (cheap-attacks)|100.0% (200/200)・33〜38行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD003 ／ char_jihoon_01:SKD003 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":3144,"SKD003":3583,"SKD035":197,"SKD039":1}。未発動なし。敗北{"final_wave_defeated":200}|
|攻撃強化・SKD003-SKD001置換（中心技の発動が半数未満・比較用） (attack-up-replace-SKD003-SKD001)|100.0% (200/200)・31〜35行動|char_joe_01:SKD001 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":3545,"SKD009":2048,"SKD001":791,"SKD035":102,"SKD039":2}。未発動なし。敗北{"final_wave_defeated":200}|
|攻撃強化・SKD035-SKD038置換（中心技の発動が半数未満・比較用） (attack-up-replace-SKD035-SKD038)|100.0% (200/200)・32〜37行動|char_joe_01:SKD003 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":3636,"SKD009":2107,"SKD003":790,"SKD038":196,"SKD039":2}。未発動なし。敗北{"final_wave_defeated":200}|
|攻撃強化・SKD039-SKD040置換（中心技の発動が半数未満・比較用） (attack-up-replace-SKD039-SKD040)|100.0% (200/200)・31〜35行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD040|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":3599,"SKD009":2104,"SKD003":791,"SKD035":102}。未発動SKD040。敗北{"final_wave_defeated":200}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|9／0|1699.76／178.64／103.13|なし|SKD003 土割り LB0 SP25 first [{"type":"damage","power":105}] 入手:チュートリアル確定|
|2|竹中半兵衛 (char_yuki_01)|9／0|1786.48／174.96／100.19|なし|SKD035 鬨の声 LB0 SP75 all_allies [{"type":"atk_up","power":8,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|3|井伊直政 (char_daimon_01)|9／0|1189.33／289.00／77.07|なし|SKD003 土割り LB0 SP25 first [{"type":"damage","power":105}] 入手:チュートリアル確定|
|4|前田利家 (char_jihoon_01)|9／0|1427.20／245.65／88.63|なし|SKD003 土割り LB0 SP25 first [{"type":"damage","power":105}] 入手:チュートリアル確定|
|5|お市の方 (char_aoi_01)|9／0|1321.89／267.75／77.75|なし|SKD039 応急手当 LB0 SP35 lowest_ally [{"type":"heal","power":35,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":8900,"eqExp":0,"cash":8900,"skillMaterials":0,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_yuki_01":0,"char_daimon_01":0,"char_jihoon_01":0,"char_aoi_01":0},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":8900,"eqExp":0,"cash":8900,"skillMaterials":0,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_daimon_01":0,"char_aoi_01":0,"char_jihoon_01":0,"char_yuki_01":0},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: []。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":0,"charExp":0,"eqExp":0,"skillMaterials":0,"genericR":0}。追加案なしのEXP/銭周回比較: {"stage":"1-5","successfulClears":0,"energy":0,"recipeSource":"1-5-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ92〜135（各試行の最小値）、最大283〜427。1ダメージ0/6727攻撃イベント。BURST0〜2回。SP獲得413〜558、技消費350〜500、終了SP35〜85。
attack-up（元 100.0% (200/200)）の配置順だけ逆転: 100.0% (200/200)、31〜38行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD003","alternatives":[{"name":"attack-up-replace-SKD003-SKD001","wins":200,"n":200}]},{"skill":"SKD035","alternatives":[{"name":"attack-up-replace-SKD035-SKD038","wins":200,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"attack-up-replace-SKD039-SKD040","wins":200,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
数値変更なし。

全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 2-1-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 2-1-validated.json.gz／2-1-sample-trace.json.gz。失敗した独立検証回は 2-1-validation-v1／round-*。

---

## 2-2 里境の狼煙
ID: owari-2。設計意図: 並んだ敵を削る
**成立（現行設定・到達前確定配布）**。敵変更0項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv9、覚醒0。装備なし。技LB0。
到達経路: cheap-attacksの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 低消費攻撃 100.0% (200/200)、36〜43行動。変更前の同編成: 100.0% (200/200)。別戦法: 未成立。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|低消費攻撃 100.0% (200/200)|
|次点（60%前後）|該当なし|
|ギリギリ（30%前後）|該当なし|
|ほぼ厳しい（0%超〜10%）|該当なし|
|未勝利（観測0%）|該当なし|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|攻撃強化（中心技の発動が半数未満・比較用） (attack-up)|100.0% (200/200)・34〜40行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":4260,"SKD009":2173,"SKD003":512,"SKD039":522,"SKD035":23}。未発動なし。敗北{"final_wave_defeated":200}|
|低消費攻撃 (cheap-attacks)|100.0% (200/200)・36〜43行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD003 ／ char_jihoon_01:SKD003 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":3478,"SKD003":3837,"SKD039":611,"SKD035":22}。未発動なし。敗北{"final_wave_defeated":200}|
|回復なし比較 (no-heal)|100.0% (200/200)・33〜38行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD009|前面までの確定供給案・育成予算内。{"basic":4014,"SKD009":2285,"SKD003":680}。未発動SKD035。敗北{"final_wave_defeated":200}|
|回復なし比較・SKD003-SKD004置換 (no-heal-replace-SKD003-SKD004)|100.0% (200/200)・34〜37行動|char_joe_01:SKD004 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD009|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":3967,"SKD009":2370,"SKD004":687}。未発動SKD035。敗北{"final_wave_defeated":200}|
|回復なし比較・SKD035-SKD038置換 (no-heal-replace-SKD035-SKD038)|100.0% (200/200)・33〜39行動|char_joe_01:SKD003 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD009|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":4061,"SKD009":2121,"SKD003":678,"SKD038":300}。未発動なし。敗北{"final_wave_defeated":200}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|9／0|1699.76／178.64／103.13|なし|SKD003 土割り LB0 SP25 first [{"type":"damage","power":105}] 入手:チュートリアル確定|
|2|竹中半兵衛 (char_yuki_01)|9／0|1786.48／174.96／100.19|なし|SKD035 鬨の声 LB0 SP75 all_allies [{"type":"atk_up","power":8,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|3|井伊直政 (char_daimon_01)|9／0|1189.33／289.00／77.07|なし|SKD003 土割り LB0 SP25 first [{"type":"damage","power":105}] 入手:チュートリアル確定|
|4|前田利家 (char_jihoon_01)|9／0|1427.20／245.65／88.63|なし|SKD003 土割り LB0 SP25 first [{"type":"damage","power":105}] 入手:チュートリアル確定|
|5|お市の方 (char_aoi_01)|9／0|1321.89／267.75／77.75|なし|SKD039 応急手当 LB0 SP35 lowest_ally [{"type":"heal","power":35,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":8900,"eqExp":0,"cash":8900,"skillMaterials":0,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_yuki_01":0,"char_daimon_01":0,"char_jihoon_01":0,"char_aoi_01":0},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":8900,"eqExp":0,"cash":8900,"skillMaterials":0,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_daimon_01":0,"char_aoi_01":0,"char_jihoon_01":0,"char_yuki_01":0},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: []。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":0,"charExp":0,"eqExp":0,"skillMaterials":0,"genericR":0}。追加案なしのEXP/銭周回比較: {"stage":"2-1","successfulClears":0,"energy":0,"recipeSource":"2-1-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ114〜170（各試行の最小値）、最大414〜503。1ダメージ0/7315攻撃イベント。BURST0〜2回。SP獲得434〜650、技消費380〜625、終了SP23〜91。
attack-up（元 100.0% (200/200)）の配置順だけ逆転: 100.0% (200/200)、33〜40行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD003","alternatives":[{"name":"no-heal-replace-SKD003-SKD004","wins":200,"n":200}]},{"skill":"SKD035","alternatives":[{"name":"no-heal-replace-SKD035-SKD038","wins":200,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"no-heal","wins":200,"n":200},{"name":"no-heal-replace-SKD003-SKD004","wins":200,"n":200},{"name":"no-heal-replace-SKD035-SKD038","wins":200,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
数値変更なし。

全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 2-2-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 2-2-validated.json.gz／2-2-sample-trace.json.gz。失敗した独立検証回は 2-2-validation-v1／round-*。

---

## 2-3 月下の砦
ID: owari-3。設計意図: 後ろの支援を止める
**成立（現行設定・到達前確定配布）**。敵変更0項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv9、覚醒0。装備なし。技LB0。
到達経路: attack-up／cheap-attacksの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 攻撃強化 100.0% (200/200)、100〜133行動。変更前の同編成: 100.0% (200/200)。別戦法: 低消費攻撃 100.0% (200/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|攻撃強化 100.0% (200/200)|
|次点（60%前後）|該当なし|
|ギリギリ（30%前後）|該当なし|
|ほぼ厳しい（0%超〜10%）|該当なし|
|未勝利（観測0%）|攻撃強化（逆順比較） 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|攻撃強化 (attack-up)|100.0% (200/200)・100〜133行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":12194,"SKD009":7793,"SKD003":1865,"SKD039":1221,"SKD035":162}。未発動なし。敗北{"final_wave_defeated":200}|
|低消費攻撃 (cheap-attacks)|100.0% (200/200)・120〜144行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD003 ／ char_jihoon_01:SKD003 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":10243,"SKD003":13856,"SKD039":1385,"SKD035":188}。未発動なし。敗北{"final_wave_defeated":200}|
|回復なし比較 (no-heal)|100.0% (200/200)・99〜118行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD009|前面までの確定供給案・育成予算内。{"basic":11355,"SKD009":8415,"SKD003":1713}。未発動SKD035。敗北{"final_wave_defeated":200}|
|攻撃強化（逆順比較） (attack-up-reversed)|0.0% (0/200)・114〜134行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD009 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":10673,"SKD003":9670,"SKD009":3718,"SKD035":236}。未発動SKD039。敗北{"party_defeated":200}|
|回復なし比較・SKD003-SKD004置換 (no-heal-replace-SKD003-SKD004)|100.0% (200/200)・98〜116行動|char_joe_01:SKD004 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD009|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":11465,"SKD009":8196,"SKD004":1710}。未発動SKD035。敗北{"final_wave_defeated":200}|
|回復なし比較・SKD035-SKD038置換 (no-heal-replace-SKD035-SKD038)|100.0% (200/200)・97〜115行動|char_joe_01:SKD003 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD009|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":11387,"SKD009":7382,"SKD003":1764,"SKD038":697}。未発動なし。敗北{"final_wave_defeated":200}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|9／0|1699.76／178.64／103.13|なし|SKD003 土割り LB0 SP25 first [{"type":"damage","power":105}] 入手:チュートリアル確定|
|2|竹中半兵衛 (char_yuki_01)|9／0|1786.48／174.96／100.19|なし|SKD035 鬨の声 LB0 SP75 all_allies [{"type":"atk_up","power":8,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|3|井伊直政 (char_daimon_01)|9／0|1189.33／289.00／77.07|なし|SKD009 岩断 LB0 SP50 first [{"type":"damage","power":120}] 入手:1-2 現行初回/任務確定|
|4|前田利家 (char_jihoon_01)|9／0|1427.20／245.65／88.63|なし|SKD009 岩断 LB0 SP50 first [{"type":"damage","power":120}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|9／0|1321.89／267.75／77.75|なし|SKD039 応急手当 LB0 SP35 lowest_ally [{"type":"heal","power":35,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":8900,"eqExp":0,"cash":8900,"skillMaterials":0,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_yuki_01":0,"char_daimon_01":0,"char_jihoon_01":0,"char_aoi_01":0},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":8900,"eqExp":0,"cash":8900,"skillMaterials":0,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_daimon_01":0,"char_aoi_01":0,"char_jihoon_01":0,"char_yuki_01":0},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: []。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":0,"charExp":0,"eqExp":0,"skillMaterials":0,"genericR":0}。追加案なしのEXP/銭周回比較: {"stage":"2-2","successfulClears":0,"energy":0,"recipeSource":"2-2-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ1〜5（各試行の最小値）、最大314〜534。1ダメージ649/21852攻撃イベント。BURST1〜6回。SP獲得1287〜2056、技消費1255〜2020、終了SP11〜108。
attack-up（元 100.0% (200/200)）の配置順だけ逆転: 0.0% (0/200)、114〜134行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD003","alternatives":[{"name":"no-heal-replace-SKD003-SKD004","wins":200,"n":200}]},{"skill":"SKD035","alternatives":[{"name":"no-heal-replace-SKD035-SKD038","wins":200,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"cheap-attacks","wins":200,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"no-heal-replace-SKD035-SKD038","wins":200,"n":200},{"name":"no-heal-replace-SKD003-SKD004","wins":200,"n":200},{"name":"no-heal","wins":200,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
数値変更なし。

全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 2-3-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 2-3-validated.json.gz／2-3-sample-trace.json.gz。失敗した独立検証回は 2-3-validation-v1／round-*。

---

## 2-4 尾張の旗風
ID: owari-4。設計意図: 倒す順を組み立てる
**成立（現行設定・到達前確定配布）**。敵変更0項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv9、覚醒0。装備なし。技LB0。
到達経路: attack-up／cheap-attacksの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 攻撃強化 100.0% (200/200)、92〜107行動。変更前の同編成: 100.0% (200/200)。別戦法: 低消費攻撃 100.0% (200/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|攻撃強化 100.0% (200/200)|
|次点（60%前後）|該当なし|
|ギリギリ（30%前後）|該当なし|
|ほぼ厳しい（0%超〜10%）|該当なし|
|未勝利（観測0%）|攻撃強化（逆順比較） 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|攻撃強化 (attack-up)|100.0% (200/200)・92〜107行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":10461,"SKD009":6216,"SKD003":2025,"SKD039":758,"SKD035":207}。未発動なし。敗北{"final_wave_defeated":200}|
|低消費攻撃 (cheap-attacks)|100.0% (200/200)・97〜120行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD003 ／ char_jihoon_01:SKD003 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":8618,"SKD003":12102,"SKD039":1066,"SKD035":45}。未発動なし。敗北{"final_wave_defeated":200}|
|回復なし比較 (no-heal)|100.0% (200/200)・88〜101行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD009|前面までの確定供給案・育成予算内。{"basic":9995,"SKD009":6826,"SKD003":1880}。未発動SKD035。敗北{"final_wave_defeated":200}|
|攻撃強化（逆順比較） (attack-up-reversed)|0.0% (0/200)・102〜115行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD009 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":9770,"SKD003":7868,"SKD009":3521,"SKD039":177,"SKD035":170}。未発動なし。敗北{"party_defeated":200}|
|回復なし比較・SKD003-SKD004置換 (no-heal-replace-SKD003-SKD004)|100.0% (200/200)・87〜98行動|char_joe_01:SKD004 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD009|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":9924,"SKD009":6609,"SKD004":1878}。未発動SKD035。敗北{"final_wave_defeated":200}|
|回復なし比較・SKD035-SKD038置換 (no-heal-replace-SKD035-SKD038)|100.0% (200/200)・86〜100行動|char_joe_01:SKD003 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD009|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":9940,"SKD009":6122,"SKD003":1927,"SKD038":611}。未発動なし。敗北{"final_wave_defeated":200}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|9／0|1699.76／178.64／103.13|なし|SKD003 土割り LB0 SP25 first [{"type":"damage","power":105}] 入手:チュートリアル確定|
|2|竹中半兵衛 (char_yuki_01)|9／0|1786.48／174.96／100.19|なし|SKD035 鬨の声 LB0 SP75 all_allies [{"type":"atk_up","power":8,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|3|井伊直政 (char_daimon_01)|9／0|1189.33／289.00／77.07|なし|SKD009 岩断 LB0 SP50 first [{"type":"damage","power":120}] 入手:1-2 現行初回/任務確定|
|4|前田利家 (char_jihoon_01)|9／0|1427.20／245.65／88.63|なし|SKD009 岩断 LB0 SP50 first [{"type":"damage","power":120}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|9／0|1321.89／267.75／77.75|なし|SKD039 応急手当 LB0 SP35 lowest_ally [{"type":"heal","power":35,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":8900,"eqExp":0,"cash":8900,"skillMaterials":0,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_yuki_01":0,"char_daimon_01":0,"char_jihoon_01":0,"char_aoi_01":0},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":8900,"eqExp":0,"cash":8900,"skillMaterials":0,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_daimon_01":0,"char_aoi_01":0,"char_jihoon_01":0,"char_yuki_01":0},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: []。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":0,"charExp":0,"eqExp":0,"skillMaterials":0,"genericR":0}。追加案なしのEXP/銭周回比較: {"stage":"2-3","successfulClears":0,"energy":0,"recipeSource":"2-3-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ19〜23（各試行の最小値）、最大400〜562。1ダメージ0/18702攻撃イベント。BURST1〜5回。SP獲得1173〜1733、技消費1115〜1720、終了SP12〜106。
attack-up（元 100.0% (200/200)）の配置順だけ逆転: 0.0% (0/200)、102〜115行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD003","alternatives":[{"name":"no-heal-replace-SKD003-SKD004","wins":200,"n":200}]},{"skill":"SKD035","alternatives":[{"name":"no-heal-replace-SKD035-SKD038","wins":200,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"cheap-attacks","wins":200,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"no-heal-replace-SKD003-SKD004","wins":200,"n":200},{"name":"no-heal-replace-SKD035-SKD038","wins":200,"n":200},{"name":"no-heal","wins":200,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
数値変更なし。

全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 2-4-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 2-4-validated.json.gz／2-4-sample-trace.json.gz。失敗した独立検証回は 2-4-validation-v1／round-*。

---

## 2-5 桶狭間への道
ID: owari-5。設計意図: 育てた五人の役割を揃え、今川の本陣に挑もう。
**成立（現行設定・到達前確定配布）**。敵変更0項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv9、覚醒0。装備なし。技LB0。
到達経路: attack-up／cheap-attacksの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 攻撃強化 100.0% (200/200)、119〜142行動。変更前の同編成: 100.0% (200/200)。別戦法: 低消費攻撃 100.0% (200/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|攻撃強化 100.0% (200/200)|
|次点（60%前後）|該当なし|
|ギリギリ（30%前後）|該当なし|
|ほぼ厳しい（0%超〜10%）|該当なし|
|未勝利（観測0%）|攻撃強化（逆順比較） 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|攻撃強化 (attack-up)|100.0% (200/200)・119〜142行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":13991,"SKD009":8522,"SKD003":2422,"SKD035":364,"SKD039":933}。未発動なし。敗北{"final_wave_defeated":200}|
|低消費攻撃 (cheap-attacks)|100.0% (200/200)・134〜157行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD003 ／ char_jihoon_01:SKD003 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":11340,"SKD003":16890,"SKD039":1163,"SKD035":206}。未発動なし。敗北{"final_wave_defeated":200}|
|攻撃のみ比較 (all-attack)|100.0% (200/200)・121〜136行動|char_joe_01:SKD009 ／ char_yuki_01:SKD009 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD009|前面までの確定供給案・育成予算内。{"basic":14177,"SKD009":11414}。未発動なし。敗北{"final_wave_defeated":200}|
|攻撃強化（逆順比較） (attack-up-reversed)|0.0% (0/200)・170〜192行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD009 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":15968,"SKD003":14120,"SKD009":4946,"SKD039":449,"SKD035":462}。未発動なし。敗北{"party_defeated":200}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|9／0|1699.76／178.64／103.13|なし|SKD003 土割り LB0 SP25 first [{"type":"damage","power":105}] 入手:チュートリアル確定|
|2|竹中半兵衛 (char_yuki_01)|9／0|1786.48／174.96／100.19|なし|SKD035 鬨の声 LB0 SP75 all_allies [{"type":"atk_up","power":8,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|3|井伊直政 (char_daimon_01)|9／0|1189.33／289.00／77.07|なし|SKD009 岩断 LB0 SP50 first [{"type":"damage","power":120}] 入手:1-2 現行初回/任務確定|
|4|前田利家 (char_jihoon_01)|9／0|1427.20／245.65／88.63|なし|SKD009 岩断 LB0 SP50 first [{"type":"damage","power":120}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|9／0|1321.89／267.75／77.75|なし|SKD039 応急手当 LB0 SP35 lowest_ally [{"type":"heal","power":35,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":8900,"eqExp":0,"cash":8900,"skillMaterials":0,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_yuki_01":0,"char_daimon_01":0,"char_jihoon_01":0,"char_aoi_01":0},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":8900,"eqExp":0,"cash":8900,"skillMaterials":0,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_daimon_01":0,"char_aoi_01":0,"char_jihoon_01":0,"char_yuki_01":0},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: []。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":0,"charExp":0,"eqExp":0,"skillMaterials":0,"genericR":0}。追加案なしのEXP/銭周回比較: {"stage":"2-4","successfulClears":0,"energy":0,"recipeSource":"2-4-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ1〜1（各試行の最小値）、最大337〜551。1ダメージ2145/24935攻撃イベント。BURST2〜7回。SP獲得1527〜2222、技消費1460〜2170、終了SP10〜89。
attack-up（元 100.0% (200/200)）の配置順だけ逆転: 0.0% (0/200)、170〜192行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD003","alternatives":[{"name":"all-attack","wins":200,"n":200}]},{"skill":"SKD035","alternatives":[{"name":"all-attack","wins":200,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"cheap-attacks","wins":200,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"all-attack","wins":200,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
数値変更なし。

全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 2-5-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 2-5-validated.json.gz／2-5-sample-trace.json.gz。失敗した独立検証回は 2-5-validation-v1／round-*。

---

## 3-1 川霧の渡し
ID: mino-1。設計意図: 弱体の後に攻める
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更2項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv20、覚醒0。装備なし。技LB2。
到達経路: break-and-buff／attack-up／armor-break／double-rock／break-and-buff-replace-SKD009-SKD010／break-and-buff-replace-SKD039-SKD040の切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 防御低下＋攻撃強化 100.0% (200/200)、85〜139行動。変更前の同編成: 0.0% (0/200)。別戦法: 攻撃強化 100.0% (200/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|防御低下＋攻撃強化 100.0% (200/200)|
|次点（60%前後）|該当なし|
|ギリギリ（30%前後）|該当なし|
|ほぼ厳しい（0%超〜10%）|防御低下（逆順比較） 10.0% (20/200)|
|未勝利（観測0%）|該当なし|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|防御低下＋攻撃強化 (break-and-buff)|100.0% (200/200)・85〜139行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":12031,"SKD009":1349,"SKD038":1345,"SKD035":797,"SKD010":4242,"SKD039":1347}。未発動なし。敗北{"final_wave_defeated":200}|
|攻撃強化 (attack-up)|100.0% (200/200)・107〜210行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":15650,"SKD009":2831,"SKD003":4357,"SKD010":6106,"SKD039":1397,"SKD035":347}。未発動なし。敗北{"final_wave_defeated":200}|
|防御低下 (armor-break)|100.0% (200/200)・101〜207行動|char_joe_01:SKD003 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":14767,"SKD009":2810,"SKD003":4371,"SKD010":5316,"SKD038":753,"SKD039":1256}。未発動なし。敗北{"final_wave_defeated":200}|
|土属性集中＋攻撃強化 (double-rock)|100.0% (200/200)・121〜229行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":17932,"SKD009":10122,"SKD003":4995,"SKD039":1711,"SKD035":389}。未発動なし。敗北{"final_wave_defeated":200}|
|支援なし比較 (no-support)|44.5% (89/200)・209〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD003 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":25624,"SKD009":8915,"SKD003":15142,"SKD010":3441,"SKD039":3625}。未発動なし。敗北{"final_wave_defeated":89,"action_limit":111}|
|防御低下（逆順比較） (armor-break-reversed)|10.0% (20/200)・122〜281行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD010 ／ char_yuki_01:SKD038 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":20809,"SKD038":2126,"SKD009":2874,"SKD003":16199,"SKD039":1395,"SKD010":3193}。未発動なし。敗北{"party_defeated":180,"final_wave_defeated":20}|
|攻撃強化（逆順比較） (attack-up-reversed)|0.5% (1/200)・165〜295行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD010 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":21867,"SKD003":18497,"SKD009":3370,"SKD010":4450,"SKD039":977,"SKD035":395}。未発動なし。敗北{"party_defeated":199,"final_wave_defeated":1}|
|防御低下＋攻撃強化・SKD009-SKD010置換 (break-and-buff-replace-SKD009-SKD010)|100.0% (200/200)・74〜150行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD010 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":12175,"SKD010":5471,"SKD038":1317,"SKD035":740,"SKD039":1397}。未発動なし。敗北{"final_wave_defeated":200}|
|防御低下＋攻撃強化・SKD039-SKD040置換 (break-and-buff-replace-SKD039-SKD040)|100.0% (200/200)・74〜125行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD040|前面までの確定供給案・育成予算内。{"basic":11517,"SKD009":1786,"SKD038":1342,"SKD035":1113,"SKD010":3392}。未発動SKD040。敗北{"final_wave_defeated":200}|
|防御低下＋攻撃強化・配置43215 (break-and-buff-order-43215)|95.5% (191/200)・124〜300行動|char_jihoon_01:SKD009 ／ char_daimon_01:SKD010 ／ char_yuki_01:SKD038 ／ char_joe_01:SKD035 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":20053,"SKD009":6308,"SKD010":3283,"SKD038":1516,"SKD039":3813,"SKD035":851}。未発動なし。敗北{"final_wave_defeated":191,"action_limit":9}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|20／0|2881.20／346.77／204.75|なし|SKD035 鬨の声 LB2 SP75 all_allies [{"type":"atk_up","power":8.93623642696699,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|2|竹中半兵衛 (char_yuki_01)|20／0|3028.20／339.63／198.90|なし|SKD038 鎧砕き LB2 SP50 first [{"type":"def_down","power":13.738724792938697,"duration":3,"carryAcrossWaves":true}] 入手:2-5 追加提案・前面初回確定|
|3|井伊直政 (char_daimon_01)|20／0|2016.00／561.00／153.00|なし|SKD010 風断 LB2 SP50 first [{"type":"damage","power":130.69984487962276}] 入手:2-5 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|20／0|2419.20／476.85／175.95|なし|SKD009 岩断 LB2 SP50 first [{"type":"damage","power":130.69984487962276}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|20／0|2240.70／519.75／154.35|なし|SKD039 応急手当 LB2 SP35 lowest_ally [{"type":"heal","power":39.01244182985853,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":59550,"eqExp":0,"cash":86550,"skillMaterials":27,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_yuki_01":0,"char_daimon_01":0,"char_jihoon_01":0,"char_aoi_01":0},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":59550,"eqExp":0,"cash":101550,"skillMaterials":42,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_daimon_01":0,"char_aoi_01":0,"char_jihoon_01":0,"char_yuki_01":0},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"skill","id":"SKD038","amount":1},{"kind":"skill","id":"SKD010","amount":1},{"kind":"skill","id":"SKD040","amount":1},{"kind":"cash","amount":12050},{"kind":"character_exp_item","id":"small","amount":1},{"kind":"skill_material","amount":26}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":12050,"charExp":50,"eqExp":0,"skillMaterials":26,"genericR":0}。追加案なしのEXP/銭周回比較: {"stage":"2-5","successfulClears":16,"energy":80,"recipeSource":"2-5-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ1〜1（各試行の最小値）、最大349〜984。1ダメージ7994/17622攻撃イベント。BURST2〜5回。SP獲得1186〜2255、技消費1125〜2235、終了SP10〜81。
break-and-buff（元 100.0% (200/200)）の配置順だけ逆転: 99.0% (198/200)、101〜287行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD035","alternatives":[{"name":"armor-break","wins":200,"n":200},{"name":"no-support","wins":89,"n":200},{"name":"armor-break-reversed","wins":20,"n":200}]},{"skill":"SKD038","alternatives":[{"name":"attack-up","wins":200,"n":200},{"name":"double-rock","wins":200,"n":200},{"name":"no-support","wins":89,"n":200},{"name":"attack-up-reversed","wins":1,"n":200}]},{"skill":"SKD010","alternatives":[{"name":"double-rock","wins":200,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"break-and-buff-replace-SKD009-SKD010","wins":200,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"break-and-buff-replace-SKD039-SKD040","wins":200,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
|1/1 鍛冶師 (3-1/W1/1)|def|1140→550|既存の防御低下/攻撃強化2系統の独立評価を引継ぎ|
|2/1 直江兼続 (3-1/W2/1)|def|1140→550|既存の防御低下/攻撃強化2系統の独立評価を引継ぎ|


全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 3-1-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 3-1-validated.json.gz／3-1-sample-trace.json.gz。失敗した独立検証回は 3-1-validation-v1／round-*。

---

## 3-2 稲穂の小径
ID: mino-2。設計意図: 強化を攻撃へつなぐ
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更2項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv22、覚醒0。装備なし。技LB2。
到達経路: break-and-buff／attack-up／armor-break／double-rock／break-and-buff-replace-SKD009-SKD010／break-and-buff-replace-SKD039-SKD040の切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 防御低下＋攻撃強化 100.0% (200/200)、68〜148行動。変更前の同編成: 0.0% (0/200)。別戦法: 攻撃強化 100.0% (200/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|防御低下＋攻撃強化 100.0% (200/200)|
|次点（60%前後）|該当なし|
|ギリギリ（30%前後）|該当なし|
|ほぼ厳しい（0%超〜10%）|支援なし比較 4.5% (9/200)|
|未勝利（観測0%）|継続ダメージ 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|防御低下＋攻撃強化 (break-and-buff)|100.0% (200/200)・68〜148行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":10396,"SKD009":1159,"SKD038":1451,"SKD035":772,"SKD010":3315,"SKD039":921}。未発動なし。敗北{"final_wave_defeated":200}|
|攻撃強化 (attack-up)|100.0% (200/200)・95〜207行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":15192,"SKD009":2708,"SKD003":4657,"SKD010":5826,"SKD039":1020,"SKD035":417}。未発動なし。敗北{"final_wave_defeated":200}|
|防御低下 (armor-break)|100.0% (200/200)・95〜202行動|char_joe_01:SKD003 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":14719,"SKD009":2878,"SKD003":4805,"SKD010":5064,"SKD038":1001,"SKD039":1010}。未発動なし。敗北{"final_wave_defeated":200}|
|土属性集中＋攻撃強化 (double-rock)|100.0% (200/200)・130〜290行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":21052,"SKD009":12222,"SKD003":5364,"SKD039":1787,"SKD035":680}。未発動なし。敗北{"final_wave_defeated":200}|
|攻撃強化（逆順比較） (attack-up-reversed)|47.0% (94/200)・145〜300行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD010 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":22983,"SKD003":16127,"SKD009":3900,"SKD010":5556,"SKD039":1812,"SKD035":421}。未発動なし。敗北{"action_limit":106,"final_wave_defeated":94}|
|支援なし比較 (no-support)|4.5% (9/200)・179〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD003 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":26214,"SKD009":8329,"SKD003":18907,"SKD010":2654,"SKD039":3609}。未発動なし。敗北{"action_limit":191,"final_wave_defeated":9}|
|継続ダメージ (poison-boost)|0.0% (0/200)・300〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD029 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":30311,"SKD009":10318,"SKD003":7964,"SKD029":7655,"SKD039":3447,"SKD035":305}。未発動なし。敗北{"action_limit":200}|
|防御低下＋攻撃強化・SKD009-SKD010置換 (break-and-buff-replace-SKD009-SKD010)|100.0% (200/200)・68〜140行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD010 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":10214,"SKD010":4393,"SKD038":1444,"SKD035":783,"SKD039":897}。未発動なし。敗北{"final_wave_defeated":200}|
|防御低下＋攻撃強化・SKD039-SKD040置換 (break-and-buff-replace-SKD039-SKD040)|100.0% (200/200)・68〜121行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD040|前面までの確定供給案・育成予算内。{"basic":10233,"SKD009":1458,"SKD038":1417,"SKD035":1131,"SKD010":2862}。未発動SKD040。敗北{"final_wave_defeated":200}|
|防御低下＋攻撃強化・配置32514 (break-and-buff-order-32514)|83.0% (166/200)・178〜300行動|char_daimon_01:SKD010 ／ char_yuki_01:SKD038 ／ char_aoi_01:SKD039 ／ char_joe_01:SKD035 ／ char_jihoon_01:SKD009|前面までの確定供給案・育成予算内。{"basic":27829,"SKD009":13656,"SKD038":2747,"SKD035":1289,"SKD039":4299,"SKD010":1047}。未発動なし。敗北{"action_limit":34,"final_wave_defeated":166}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|22／0|3183.04／388.39／232.05|なし|SKD035 鬨の声 LB2 SP75 all_allies [{"type":"atk_up","power":8.93623642696699,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|2|竹中半兵衛 (char_yuki_01)|22／0|3345.44／380.38／225.42|なし|SKD038 鎧砕き LB2 SP50 first [{"type":"def_down","power":13.738724792938697,"duration":3,"carryAcrossWaves":true}] 入手:2-5 追加提案・前面初回確定|
|3|井伊直政 (char_daimon_01)|22／0|2227.20／628.32／173.40|なし|SKD010 風断 LB2 SP50 first [{"type":"damage","power":130.69984487962276}] 入手:2-5 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|22／0|2672.64／534.07／199.41|なし|SKD009 岩断 LB2 SP50 first [{"type":"damage","power":130.69984487962276}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|22／0|2475.44／582.12／174.93|なし|SKD039 応急手当 LB2 SP35 lowest_ally [{"type":"heal","power":39.01244182985853,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":74250,"eqExp":0,"cash":101250,"skillMaterials":27,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_yuki_01":0,"char_daimon_01":0,"char_jihoon_01":0,"char_aoi_01":0},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":74250,"eqExp":0,"cash":116250,"skillMaterials":42,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_daimon_01":0,"char_aoi_01":0,"char_jihoon_01":0,"char_yuki_01":0},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"cash","amount":10500},{"kind":"character_exp_item","id":"large","amount":2},{"kind":"character_exp_item","id":"medium","amount":4},{"kind":"character_exp_item","id":"small","amount":1}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":22550,"charExp":14150,"eqExp":0,"skillMaterials":26,"genericR":0}。追加案なしのEXP/銭周回比較: {"stage":"3-1","successfulClears":48,"energy":240,"recipeSource":"3-1-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ1〜1（各試行の最小値）、最大771〜1008。1ダメージ7977/14870攻撃イベント。BURST1〜4回。SP獲得947〜2515、技消費885〜2440、終了SP10〜94。
break-and-buff（元 100.0% (200/200)）の配置順だけ逆転: 100.0% (200/200)、124〜217行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD035","alternatives":[{"name":"armor-break","wins":200,"n":200},{"name":"no-support","wins":9,"n":200}]},{"skill":"SKD038","alternatives":[{"name":"attack-up","wins":200,"n":200},{"name":"double-rock","wins":200,"n":200},{"name":"attack-up-reversed","wins":94,"n":200},{"name":"no-support","wins":9,"n":200},{"name":"poison-boost","wins":0,"n":200}]},{"skill":"SKD010","alternatives":[{"name":"double-rock","wins":200,"n":200},{"name":"poison-boost","wins":0,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"break-and-buff-replace-SKD009-SKD010","wins":200,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"break-and-buff-replace-SKD039-SKD040","wins":200,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
|1/1 女侍 (3-2/W1/1)|def|850→673|防御が到達火力を上回る敵のみ突破余地を確保|
|2/1 加藤清正 (3-2/W2/1)|def|850→673|防御が到達火力を上回る敵のみ突破余地を確保|


全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 3-2-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 3-2-validated.json.gz／3-2-sample-trace.json.gz。失敗した独立検証回は 3-2-validation-v1／round-*。

---

## 3-3 山あいの影
ID: mino-3。設計意図: 継続ダメージを足場にする
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更1項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv24、覚醒0。装備なし。技LB2。
到達経路: break-and-buff／attack-up／armor-break／break-and-buff-replace-SKD009-SKD010／break-and-buff-replace-SKD039-SKD040の切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 防御低下＋攻撃強化 100.0% (200/200)、46〜72行動。変更前の同編成: 0.0% (0/200)。別戦法: 攻撃強化 100.0% (200/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|防御低下＋攻撃強化 100.0% (200/200)|
|次点（60%前後）|支援なし比較 55.0% (110/200)|
|ギリギリ（30%前後）|防御低下＋攻撃強化・配置32541 36.0% (72/200)|
|ほぼ厳しい（0%超〜10%）|該当なし|
|未勝利（観測0%）|低消費攻撃のみ比較 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|防御低下＋攻撃強化 (break-and-buff)|100.0% (200/200)・46〜72行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":6077,"SKD009":2506,"SKD038":884,"SKD035":404,"SKD039":538}。未発動なし。敗北{"final_wave_defeated":200}|
|攻撃強化 (attack-up)|100.0% (200/200)・53〜159行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":7678,"SKD009":4439,"SKD003":1950,"SKD035":176,"SKD039":510}。未発動なし。敗北{"final_wave_defeated":200}|
|防御低下 (armor-break)|100.0% (200/200)・51〜101行動|char_joe_01:SKD003 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":7133,"SKD009":3978,"SKD003":1847,"SKD038":419,"SKD039":405}。未発動なし。敗北{"final_wave_defeated":200}|
|支援なし比較 (no-support)|55.0% (110/200)・92〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD003 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":21087,"SKD009":8264,"SKD003":4672,"SKD039":7205}。未発動なし。敗北{"action_limit":90,"final_wave_defeated":110}|
|継続ダメージ (poison-boost)|19.0% (38/200)・148〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD029 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":31237,"SKD009":8399,"SKD003":1655,"SKD029":3307,"SKD035":73,"SKD039":12305}。未発動なし。敗北{"action_limit":162,"final_wave_defeated":38}|
|低消費攻撃のみ比較 (all-cheap)|0.0% (0/200)・145〜151行動|char_joe_01:SKD003 ／ char_yuki_01:SKD003 ／ char_daimon_01:SKD003 ／ char_jihoon_01:SKD003 ／ char_aoi_01:SKD003|前面までの確定供給案・育成予算内。{"basic":10517,"SKD003":18608}。未発動なし。敗北{"party_defeated":200}|
|防御低下＋攻撃強化・SKD009-SKD010置換 (break-and-buff-replace-SKD009-SKD010)|100.0% (200/200)・41〜75行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD010 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":5854,"SKD010":2552,"SKD038":794,"SKD035":363,"SKD039":583}。未発動なし。敗北{"final_wave_defeated":200}|
|防御低下＋攻撃強化・SKD039-SKD040置換 (break-and-buff-replace-SKD039-SKD040)|100.0% (200/200)・46〜60行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD040|前面までの確定供給案・育成予算内。{"basic":6069,"SKD009":2439,"SKD038":830,"SKD035":632}。未発動SKD040。敗北{"final_wave_defeated":200}|
|防御低下＋攻撃強化・配置32541 (break-and-buff-order-32541)|36.0% (72/200)・116〜202行動|char_daimon_01:SKD009 ／ char_yuki_01:SKD038 ／ char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_joe_01:SKD035|前面までの確定供給案・育成予算内。{"basic":18855,"SKD009":8856,"SKD038":824,"SKD035":1652,"SKD039":2647}。未発動なし。敗北{"final_wave_defeated":72,"party_defeated":128}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|24／0|3484.88／430.00／259.35|なし|SKD035 鬨の声 LB2 SP75 all_allies [{"type":"atk_up","power":8.93623642696699,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|2|竹中半兵衛 (char_yuki_01)|24／0|3662.68／421.13／251.94|なし|SKD038 鎧砕き LB2 SP50 first [{"type":"def_down","power":13.738724792938697,"duration":3,"carryAcrossWaves":true}] 入手:2-5 追加提案・前面初回確定|
|3|井伊直政 (char_daimon_01)|24／0|2438.40／695.64／193.80|なし|SKD009 岩断 LB2 SP50 first [{"type":"damage","power":130.69984487962276}] 入手:1-2 現行初回/任務確定|
|4|前田利家 (char_jihoon_01)|24／0|2926.08／591.29／222.87|なし|SKD009 岩断 LB2 SP50 first [{"type":"damage","power":130.69984487962276}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|24／0|2710.18／644.49／195.51|なし|SKD039 応急手当 LB2 SP35 lowest_ally [{"type":"heal","power":39.01244182985853,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":90700,"eqExp":0,"cash":111700,"skillMaterials":21,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_yuki_01":0,"char_daimon_01":0,"char_jihoon_01":0,"char_aoi_01":0},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":90700,"eqExp":0,"cash":132700,"skillMaterials":42,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_daimon_01":0,"char_aoi_01":0,"char_jihoon_01":0,"char_yuki_01":0},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"cash","amount":12250},{"kind":"character_exp_item","id":"large","amount":3},{"kind":"character_exp_item","id":"small","amount":8}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":34800,"charExp":30000,"eqExp":0,"skillMaterials":26,"genericR":0}。追加案なしのEXP/銭周回比較: {"stage":"3-2","successfulClears":100,"energy":500,"recipeSource":"3-2-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ1〜1（各試行の最小値）、最大551〜651。1ダメージ3319/8583攻撃イベント。BURST0〜3回。SP獲得635〜1216、技消費595〜1200、終了SP12〜78。
break-and-buff（元 100.0% (200/200)）の配置順だけ逆転: 100.0% (200/200)、52〜89行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD035","alternatives":[{"name":"armor-break","wins":200,"n":200},{"name":"no-support","wins":110,"n":200},{"name":"all-cheap","wins":0,"n":200}]},{"skill":"SKD038","alternatives":[{"name":"attack-up","wins":200,"n":200},{"name":"no-support","wins":110,"n":200},{"name":"poison-boost","wins":38,"n":200},{"name":"all-cheap","wins":0,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"break-and-buff-replace-SKD009-SKD010","wins":200,"n":200},{"name":"all-cheap","wins":0,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"break-and-buff-replace-SKD039-SKD040","wins":200,"n":200},{"name":"all-cheap","wins":0,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
|2/1 服部半蔵 (3-3/W2/1)|def|1290→746|防御が到達火力を上回る敵のみ突破余地を確保|


全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 3-3-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 3-3-validated.json.gz／3-3-sample-trace.json.gz。失敗した独立検証回は 3-3-validation-v1／round-*。

---

## 3-4 峠に立つ旗
ID: mino-4。設計意図: SPを使う役と貯める役
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更0項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv26、覚醒0。装備なし。技LB2。
到達経路: break-and-buff／attack-up／armor-break／break-and-buff-replace-SKD009-SKD010／break-and-buff-replace-SKD039-SKD040の切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 防御低下＋攻撃強化 100.0% (200/200)、65〜113行動。変更前の同編成: 100.0% (200/200)。別戦法: 攻撃強化 100.0% (200/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|防御低下＋攻撃強化 100.0% (200/200)|
|次点（60%前後）|防御低下＋攻撃強化・配置53421 63.0% (126/200)|
|ギリギリ（30%前後）|該当なし|
|ほぼ厳しい（0%超〜10%）|該当なし|
|未勝利（観測0%）|攻撃強化（逆順比較） 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|防御低下＋攻撃強化 (break-and-buff)|100.0% (200/200)・65〜113行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":8766,"SKD009":4348,"SKD038":843,"SKD035":451,"SKD039":837}。未発動なし。敗北{"final_wave_defeated":200}|
|攻撃強化 (attack-up)|100.0% (200/200)・70〜115行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":9086,"SKD009":5314,"SKD003":2419,"SKD039":596,"SKD035":220}。未発動なし。敗北{"final_wave_defeated":200}|
|防御低下 (armor-break)|100.0% (200/200)・71〜109行動|char_joe_01:SKD003 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":8494,"SKD009":5106,"SKD003":2315,"SKD038":355,"SKD039":445}。未発動なし。敗北{"final_wave_defeated":200}|
|防御低下（逆順比較） (armor-break-reversed)|12.5% (25/200)・84〜173行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD009 ／ char_yuki_01:SKD038 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":13578,"SKD038":1237,"SKD009":3470,"SKD003":12667,"SKD039":458}。未発動なし。敗北{"party_defeated":175,"final_wave_defeated":25}|
|攻撃強化（逆順比較） (attack-up-reversed)|0.0% (0/200)・151〜172行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD009 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":14010,"SKD003":14013,"SKD009":4124,"SKD039":113,"SKD035":400}。未発動なし。敗北{"party_defeated":200}|
|防御低下＋攻撃強化・SKD009-SKD010置換 (break-and-buff-replace-SKD009-SKD010)|100.0% (200/200)・86〜133行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD010 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":10751,"SKD010":5662,"SKD038":983,"SKD035":581,"SKD039":1093}。未発動なし。敗北{"final_wave_defeated":200}|
|防御低下＋攻撃強化・SKD039-SKD040置換 (break-and-buff-replace-SKD039-SKD040)|100.0% (200/200)・62〜83行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD040|前面までの確定供給案・育成予算内。{"basic":8386,"SKD009":4138,"SKD038":819,"SKD035":644}。未発動SKD040。敗北{"final_wave_defeated":200}|
|防御低下＋攻撃強化・配置53421 (break-and-buff-order-53421)|63.0% (126/200)・69〜194行動|char_aoi_01:SKD039 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_yuki_01:SKD038 ／ char_joe_01:SKD035|前面までの確定供給案・育成予算内。{"basic":15987,"SKD038":932,"SKD009":5738,"SKD039":355,"SKD035":2287}。未発動なし。敗北{"final_wave_defeated":126,"party_defeated":74}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|26／0|3786.72／471.61／286.65|なし|SKD035 鬨の声 LB2 SP75 all_allies [{"type":"atk_up","power":8.93623642696699,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|2|竹中半兵衛 (char_yuki_01)|26／0|3979.92／461.89／278.46|なし|SKD038 鎧砕き LB2 SP50 first [{"type":"def_down","power":13.738724792938697,"duration":3,"carryAcrossWaves":true}] 入手:2-5 追加提案・前面初回確定|
|3|井伊直政 (char_daimon_01)|26／0|2649.60／762.96／214.20|なし|SKD009 岩断 LB2 SP50 first [{"type":"damage","power":130.69984487962276}] 入手:1-2 現行初回/任務確定|
|4|前田利家 (char_jihoon_01)|26／0|3179.52／648.52／246.33|なし|SKD009 岩断 LB2 SP50 first [{"type":"damage","power":130.69984487962276}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|26／0|2944.92／706.86／216.09|なし|SKD039 応急手当 LB2 SP35 lowest_ally [{"type":"heal","power":39.01244182985853,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":108950,"eqExp":0,"cash":129950,"skillMaterials":21,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_yuki_01":0,"char_daimon_01":0,"char_jihoon_01":0,"char_aoi_01":0},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":108950,"eqExp":0,"cash":150950,"skillMaterials":42,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_daimon_01":0,"char_aoi_01":0,"char_jihoon_01":0,"char_yuki_01":0},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"cash","amount":14050},{"kind":"character_exp_item","id":"large","amount":3},{"kind":"character_exp_item","id":"medium","amount":2},{"kind":"character_exp_item","id":"small","amount":7}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":48850,"charExp":47650,"eqExp":0,"skillMaterials":26,"genericR":0}。追加案なしのEXP/銭周回比較: {"stage":"3-3","successfulClears":159,"energy":795,"recipeSource":"3-3-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ1〜1（各試行の最小値）、最大897〜1253。1ダメージ2379/13114攻撃イベント。BURST0〜4回。SP獲得874〜1922、技消費835〜1865、終了SP10〜102。
break-and-buff（元 100.0% (200/200)）の配置順だけ逆転: 92.5% (185/200)、68〜194行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD035","alternatives":[{"name":"armor-break","wins":200,"n":200},{"name":"armor-break-reversed","wins":25,"n":200}]},{"skill":"SKD038","alternatives":[{"name":"attack-up","wins":200,"n":200},{"name":"attack-up-reversed","wins":0,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"break-and-buff-replace-SKD009-SKD010","wins":200,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"break-and-buff-replace-SKD039-SKD040","wins":200,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
数値変更なし。

全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 3-4-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 3-4-validated.json.gz／3-4-sample-trace.json.gz。失敗した独立検証回は 3-4-validation-v1／round-*。

---

## 3-5 美濃の夕嵐
ID: mino-5。設計意図: 主軸を一つ選ぶ
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更8項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv28、覚醒0。装備なし。技LB2。
到達経路: break-regen／break-and-buff／support-feed／break-regen-replace-SKD009-SKD010の切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: SP供給＋防御低下・継続回復 100.0% (200/200)、116〜225行動。変更前の同編成: 0.0% (0/200)。別戦法: 防御低下＋攻撃強化 100.0% (200/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|SP供給＋防御低下・継続回復 100.0% (200/200)|
|次点（60%前後）|SP供給＋継続回復 66.0% (132/200)|
|ギリギリ（30%前後）|攻撃強化 37.0% (74/200)|
|ほぼ厳しい（0%超〜10%）|該当なし|
|未勝利（観測0%）|攻撃強化（逆順比較） 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|SP供給＋防御低下・継続回復 (break-regen)|100.0% (200/200)・116〜225行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":18418,"SKD009":10492,"SKD038":2899,"SKD043":713}。未発動なし。敗北{"final_wave_defeated":200}|
|防御低下＋攻撃強化 (break-and-buff)|100.0% (200/200)・128〜246行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":18596,"SKD009":8977,"SKD038":2561,"SKD035":1264,"SKD039":1618}。未発動なし。敗北{"final_wave_defeated":200}|
|SP供給＋攻撃強化 (support-feed)|98.0% (196/200)・180〜300行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":27097,"SKD009":15229,"SKD035":2591,"SKD039":3056}。未発動なし。敗北{"final_wave_defeated":196,"action_limit":4}|
|SP供給＋継続回復 (burst-focus-regen)|66.0% (132/200)・206〜300行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":31009,"SKD009":22982,"SKD043":1321}。未発動なし。敗北{"final_wave_defeated":132,"action_limit":68}|
|攻撃強化 (attack-up)|37.0% (74/200)・219〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":31229,"SKD009":18229,"SKD003":4650,"SKD035":2232,"SKD039":1950}。未発動なし。敗北{"action_limit":126,"final_wave_defeated":74}|
|攻撃強化（逆順比較） (attack-up-reversed)|0.0% (0/200)・300〜300行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD009 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":26145,"SKD003":24115,"SKD009":8076,"SKD039":739,"SKD035":925}。未発動なし。敗北{"action_limit":200}|
|SP供給＋防御低下・継続回復・SKD009-SKD010置換 (break-regen-replace-SKD009-SKD010)|100.0% (200/200)・110〜210行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD010 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":16935,"SKD010":9510,"SKD038":2696,"SKD043":613}。未発動なし。敗北{"final_wave_defeated":200}|
|SP供給＋防御低下・継続回復・配置31245 (break-regen-order-31245)|0.0% (0/200)・300〜300行動|char_daimon_01:SKD009 ／ char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:SKD038 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":33758,"SKD009":18738,"SKD038":4737,"SKD043":2767}。未発動なし。敗北{"action_limit":200}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|28／0|4088.56／513.23／313.95|なし|技なし|
|2|竹中半兵衛 (char_yuki_01)|28／0|4297.16／502.64／304.98|なし|SKD038 鎧砕き LB2 SP50 first [{"type":"def_down","power":13.738724792938697,"duration":3,"carryAcrossWaves":true}] 入手:2-5 追加提案・前面初回確定|
|3|井伊直政 (char_daimon_01)|28／0|2860.80／830.28／234.60|なし|SKD009 岩断 LB2 SP50 first [{"type":"damage","power":130.69984487962276}] 入手:1-2 現行初回/任務確定|
|4|前田利家 (char_jihoon_01)|28／0|3432.96／705.74／269.79|なし|SKD009 岩断 LB2 SP50 first [{"type":"damage","power":130.69984487962276}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|28／0|3179.66／769.23／236.67|なし|SKD043 再生の祈り LB2 SP65 lowest_ally [{"type":"hot","power":17.006220914929266,"duration":3,"carryAcrossWaves":true}] 入手:3-4 追加提案・前面初回確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":129050,"eqExp":0,"cash":147050,"skillMaterials":18,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_yuki_01":0,"char_daimon_01":0,"char_jihoon_01":0,"char_aoi_01":0},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":129050,"eqExp":0,"cash":177050,"skillMaterials":48,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_daimon_01":0,"char_aoi_01":0,"char_jihoon_01":0,"char_yuki_01":0},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"skill","id":"SKD043","amount":1},{"kind":"cash","amount":21900},{"kind":"character_exp_item","id":"large","amount":3},{"kind":"character_exp_item","id":"medium","amount":4},{"kind":"character_exp_item","id":"small","amount":5},{"kind":"skill_material","amount":6}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":70750,"charExp":67150,"eqExp":0,"skillMaterials":32,"genericR":0}。追加案なしのEXP/銭周回比較: {"stage":"3-4","successfulClears":224,"energy":1120,"recipeSource":"3-4-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ0〜0（各試行の最小値）、最大738〜1181。1ダメージ13036/28910攻撃イベント。BURST3〜7回。SP獲得1498〜3557、技消費1445〜3505、終了SP12〜127。
break-regen（元 100.0% (200/200)）の配置順だけ逆転: 87.0% (174/200)、167〜300行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD038","alternatives":[{"name":"support-feed","wins":196,"n":200},{"name":"burst-focus-regen","wins":132,"n":200},{"name":"attack-up","wins":74,"n":200},{"name":"attack-up-reversed","wins":0,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"break-regen-replace-SKD009-SKD010","wins":200,"n":200}]},{"skill":"SKD043","alternatives":[{"name":"break-and-buff","wins":200,"n":200},{"name":"support-feed","wins":196,"n":200},{"name":"attack-up","wins":74,"n":200},{"name":"attack-up-reversed","wins":0,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
|1/1 鍛冶師 (3-5/W1/1)|def|1640→890|防御が到達火力を上回る敵のみ突破余地を確保|
|2/1 戦巫女 (3-5/W2/1)|hp|4020→2573|300行動に収まらない耐久負担を局所調整|
|2/1 戦巫女 (3-5/W2/1)|def|1640→890|防御が到達火力を上回る敵のみ突破余地を確保|
|3/1 織田信長 (3-5/W3/1)|hp|4020→1646|300行動に収まらない耐久負担を局所調整|
|3/1 織田信長 (3-5/W3/1)|atk|620→527|全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|3/1 織田信長 (3-5/W3/1)|def|1640→890|防御が到達火力を上回る敵のみ突破余地を確保|
|3/2 お市の方 (3-5/W3/2)|hp|2600→1664|300行動に収まらない耐久負担を局所調整|
|3/2 お市の方 (3-5/W3/2)|atk|850→306|回復供給の膠着を緩和し処理順の選択を残す／到達耐久で役割を維持できない主な攻撃源を調整|


全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 3-5-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 3-5-validated.json.gz／3-5-sample-trace.json.gz。失敗した独立検証回は 3-5-validation-v1／round-*。

---

## 4-1 湖畔の番所
ID: omi-1。設計意図: 集中攻撃を受ける
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更0項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv30、覚醒0。N装備Lv20／LB0。技LB2。
到達経路: counter-boost／defensive／double-rock／all-cheapの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 反撃 100.0% (200/200)、100〜130行動。変更前の同編成: 100.0% (200/200)。別戦法: 攻防弱体・継続回復 100.0% (200/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|反撃 100.0% (200/200)|
|次点（60%前後）|該当なし|
|ギリギリ（30%前後）|全体攻撃 29.0% (58/200)|
|ほぼ厳しい（0%超〜10%）|該当なし|
|未勝利（観測0%）|後列集中（逆順比較） 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|反撃 (counter-boost)|100.0% (200/200)・100〜130行動|char_joe_01:SKD049 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":12683,"SKD009":3408,"SKD010":4544,"SKD049":200,"SKD035":313,"SKD039":1968}。未発動なし。敗北{"final_wave_defeated":200}|
|攻撃強化 (attack-up)|100.0% (200/200)・103〜135行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":12536,"SKD009":3695,"SKD003":1202,"SKD010":4210,"SKD039":1778,"SKD035":121}。未発動なし。敗北{"final_wave_defeated":200}|
|攻防弱体・継続回復 (defensive)|100.0% (200/200)・105〜134行動|char_joe_01:SKD036 ／ char_yuki_01:SKD037 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":13304,"SKD009":3576,"SKD037":1619,"SKD043":541,"SKD010":3919,"SKD036":256}。未発動なし。敗北{"final_wave_defeated":200}|
|土属性集中＋攻撃強化 (double-rock)|100.0% (200/200)・109〜135行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":12917,"SKD009":8043,"SKD003":1090,"SKD039":1957,"SKD035":241}。未発動なし。敗北{"final_wave_defeated":200}|
|低消費攻撃のみ比較 (all-cheap)|90.5% (181/200)・115〜123行動|char_joe_01:SKD003 ／ char_yuki_01:SKD003 ／ char_daimon_01:SKD003 ／ char_jihoon_01:SKD003 ／ char_aoi_01:SKD003|前面までの確定供給案・育成予算内。{"basic":8540,"SKD003":15079}。未発動なし。敗北{"final_wave_defeated":181,"party_defeated":19}|
|全体攻撃 (area-boost)|29.0% (58/200)・113〜130行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD019 ／ char_aoi_01:SKD041|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":15249,"SKD003":1207,"SKD035":814,"SKD009":3761,"SKD019":2535,"SKD041":939}。未発動なし。敗北{"final_wave_defeated":58,"party_defeated":142}|
|後列集中（逆順比較） (rear-focus-reversed)|0.0% (0/200)・97〜125行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD027 ／ char_daimon_01:SKD026 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":9736,"SKD003":9577,"SKD027":1022,"SKD026":1679,"SKD035":259,"SKD039":105}。未発動なし。敗北{"party_defeated":200}|
|反撃・配置52314 (counter-boost-order-52314)|41.0% (82/200)・111〜124行動|char_aoi_01:SKD039 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD010 ／ char_joe_01:SKD049 ／ char_jihoon_01:SKD009|前面までの確定供給案・育成予算内。{"basic":13354,"SKD009":6655,"SKD010":2835,"SKD049":594,"SKD035":53,"SKD039":76}。未発動なし。敗北{"final_wave_defeated":82,"party_defeated":118}|
|反撃・配置13542 (counter-boost-order-13542)|0.0% (0/200)・111〜151行動|char_joe_01:SKD049 ／ char_daimon_01:SKD010 ／ char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_yuki_01:SKD035|前面までの確定供給案・育成予算内。{"basic":15181,"SKD009":5198,"SKD010":1954,"SKD049":269,"SKD035":1503,"SKD039":1170}。未発動なし。敗北{"party_defeated":200}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|30／0|4671.52／635.16／349.28|weapon:WEAPON_001 Lv20 LB0 {"hp":0,"atk":80.31943122714748,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、body:BODY_002 Lv20 LB0 {"hp":281.1180092950162,"atk":0,"def":8.031943122714747,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定|SKD049 返し刃 LB2 SP65 self [{"type":"counter","power":49.681182134834955,"duration":3,"carryAcrossWaves":true}] 入手:3-5 追加提案・前面初回確定|
|2|竹中半兵衛 (char_yuki_01)|30／0|4895.52／623.72／339.53|weapon:WEAPON_001 Lv20 LB0 {"hp":0,"atk":80.31943122714748,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、body:BODY_002 Lv20 LB0 {"hp":281.1180092950162,"atk":0,"def":8.031943122714747,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定|SKD035 鬨の声 LB2 SP75 all_allies [{"type":"atk_up","power":8.93623642696699,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|3|井伊直政 (char_daimon_01)|30／0|3353.12／977.92／263.03|weapon:WEAPON_001 Lv20 LB0 {"hp":0,"atk":80.31943122714748,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、body:BODY_002 Lv20 LB0 {"hp":281.1180092950162,"atk":0,"def":8.031943122714747,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定|SKD010 風断 LB2 SP50 first [{"type":"damage","power":130.69984487962276}] 入手:2-5 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|30／0|3967.52／843.28／301.28|weapon:WEAPON_001 Lv20 LB0 {"hp":0,"atk":80.31943122714748,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、body:BODY_002 Lv20 LB0 {"hp":281.1180092950162,"atk":0,"def":8.031943122714747,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定|SKD009 岩断 LB2 SP50 first [{"type":"damage","power":130.69984487962276}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|30／0|3695.52／911.92／265.28|weapon:WEAPON_001 Lv20 LB0 {"hp":0,"atk":80.31943122714748,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、body:BODY_002 Lv20 LB0 {"hp":281.1180092950162,"atk":0,"def":8.031943122714747,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定|SKD039 応急手当 LB2 SP35 lowest_ally [{"type":"heal","power":39.01244182985853,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":151050,"eqExp":47700,"cash":201900,"skillMaterials":27,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_yuki_01":0,"char_daimon_01":0,"char_jihoon_01":0,"char_aoi_01":0},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":151050,"eqExp":47700,"cash":240900,"skillMaterials":66,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_daimon_01":0,"char_aoi_01":0,"char_jihoon_01":0,"char_yuki_01":0},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"skill","id":"SKD049","amount":1},{"kind":"skill","id":"SKD036","amount":1},{"kind":"skill","id":"SKD037","amount":1},{"kind":"equipment","id":"WEAPON_001","amount":5},{"kind":"equipment","id":"BODY_002","amount":5},{"kind":"cash","amount":59650},{"kind":"character_exp_item","id":"xlarge","amount":1},{"kind":"character_exp_item","id":"medium","amount":1},{"kind":"character_exp_item","id":"small","amount":4},{"kind":"equipment_exp_item","id":"xlarge","amount":1},{"kind":"equipment_exp_item","id":"large","amount":2},{"kind":"equipment_exp_item","id":"medium","amount":4},{"kind":"equipment_exp_item","id":"small","amount":7},{"kind":"skill_material","amount":18}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":130400,"charExp":88550,"eqExp":34700,"skillMaterials":50,"genericR":0}。追加案なしのEXP/銭周回比較: {"stage":"3-5","successfulClears":296,"energy":1480,"recipeSource":"3-5-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ201〜384（各試行の最小値）、最大1682〜2007。1ダメージ0/20635攻撃イベント。BURST1〜6回。SP獲得1342〜2088、技消費1270〜2075、終了SP10〜162。
counter-boost（元 100.0% (200/200)）の配置順だけ逆転: 0.0% (0/200)、97〜122行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD049","alternatives":[{"name":"defensive","wins":200,"n":200},{"name":"attack-up","wins":200,"n":200},{"name":"double-rock","wins":200,"n":200},{"name":"all-cheap","wins":181,"n":200},{"name":"area-boost","wins":58,"n":200},{"name":"rear-focus-reversed","wins":0,"n":200}]},{"skill":"SKD035","alternatives":[{"name":"defensive","wins":200,"n":200},{"name":"all-cheap","wins":181,"n":200}]},{"skill":"SKD010","alternatives":[{"name":"double-rock","wins":200,"n":200},{"name":"all-cheap","wins":181,"n":200},{"name":"area-boost","wins":58,"n":200},{"name":"rear-focus-reversed","wins":0,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"all-cheap","wins":181,"n":200},{"name":"rear-focus-reversed","wins":0,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"defensive","wins":200,"n":200},{"name":"all-cheap","wins":181,"n":200},{"name":"area-boost","wins":58,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
数値変更なし。

全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 4-1-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 4-1-validated.json.gz／4-1-sample-trace.json.gz。失敗した独立検証回は 4-1-validation-v1／round-*。

---

## 4-2 湖風の往来
ID: omi-2。設計意図: 受けた攻撃を返す
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更0項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv32、覚醒0。N装備Lv20／LB0。技LB2。
到達経路: counter-boost／attack-up／all-attack／area-boostの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 反撃 100.0% (200/200)、89〜115行動。変更前の同編成: 100.0% (200/200)。別戦法: 攻撃強化 100.0% (200/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|反撃 100.0% (200/200)|
|次点（60%前後）|該当なし|
|ギリギリ（30%前後）|該当なし|
|ほぼ厳しい（0%超〜10%）|該当なし|
|未勝利（観測0%）|後列集中（逆順比較） 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|反撃 (counter-boost)|100.0% (200/200)・89〜115行動|char_joe_01:SKD049 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":11147,"SKD009":1387,"SKD007":4941,"SKD049":200,"SKD035":638,"SKD039":1357}。未発動なし。敗北{"final_wave_defeated":200}|
|攻撃強化 (attack-up)|100.0% (200/200)・89〜116行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":11107,"SKD009":1985,"SKD003":1523,"SKD007":4516,"SKD039":832,"SKD035":568}。未発動なし。敗北{"final_wave_defeated":200}|
|防御低下 (armor-break)|100.0% (200/200)・99〜122行動|char_joe_01:SKD003 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":11578,"SKD009":2242,"SKD003":1523,"SKD007":4080,"SKD039":982,"SKD038":1457}。未発動なし。敗北{"final_wave_defeated":200}|
|全体攻撃 (area-boost)|100.0% (200/200)・107〜119行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD019 ／ char_jihoon_01:SKD019 ／ char_aoi_01:SKD041|前面までの確定供給案・育成予算内。{"basic":13629,"SKD003":1629,"SKD035":1224,"SKD019":5973}。未発動SKD041。敗北{"final_wave_defeated":200}|
|攻撃のみ比較 (all-attack)|100.0% (200/200)・87〜95行動|char_joe_01:SKD007 ／ char_yuki_01:SKD007 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD007 ／ char_aoi_01:SKD007|前面までの確定供給案・育成予算内。{"basic":10274,"SKD007":7951}。未発動なし。敗北{"final_wave_defeated":200}|
|後列集中（逆順比較） (rear-focus-reversed)|0.0% (0/200)・135〜142行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD027 ／ char_daimon_01:SKD026 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":11863,"SKD003":13320,"SKD027":1006,"SKD039":200,"SKD026":665,"SKD035":617}。未発動なし。敗北{"party_defeated":200}|
|反撃・配置13542 (counter-boost-order-13542)|100.0% (200/200)・92〜109行動|char_joe_01:SKD049 ／ char_daimon_01:SKD007 ／ char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_yuki_01:SKD035|前面までの確定供給案・育成予算内。{"basic":11069,"SKD009":2687,"SKD007":3973,"SKD049":464,"SKD039":1479,"SKD035":135}。未発動なし。敗北{"final_wave_defeated":200}|
|反撃・配置53421 (counter-boost-order-53421)|0.0% (0/200)・148〜155行動|char_aoi_01:SKD039 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD009 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD049|前面までの確定供給案・育成予算内。{"basic":20803,"SKD049":3754,"SKD007":1214,"SKD039":200,"SKD009":2834,"SKD035":1527}。未発動なし。敗北{"party_defeated":200}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|32／0|5055.68／688.12／384.77|weapon:WEAPON_001 Lv20 LB0 {"hp":0,"atk":80.31943122714748,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、body:BODY_002 Lv20 LB0 {"hp":281.1180092950162,"atk":0,"def":8.031943122714747,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定|SKD049 返し刃 LB2 SP65 self [{"type":"counter","power":49.681182134834955,"duration":3,"carryAcrossWaves":true}] 入手:3-5 追加提案・前面初回確定|
|2|竹中半兵衛 (char_yuki_01)|32／0|5299.28／675.59／374.01|weapon:WEAPON_001 Lv20 LB0 {"hp":0,"atk":80.31943122714748,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、body:BODY_002 Lv20 LB0 {"hp":281.1180092950162,"atk":0,"def":8.031943122714747,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定|SKD035 鬨の声 LB2 SP75 all_allies [{"type":"atk_up","power":8.93623642696699,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|3|井伊直政 (char_daimon_01)|32／0|3621.92／1063.60／289.55|weapon:WEAPON_001 Lv20 LB0 {"hp":0,"atk":80.31943122714748,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、body:BODY_002 Lv20 LB0 {"hp":281.1180092950162,"atk":0,"def":8.031943122714747,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定|SKD007 炎断 LB2 SP50 first [{"type":"damage","power":130.69984487962276}] 入手:4-1 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|32／0|4290.08／916.11／331.78|weapon:WEAPON_001 Lv20 LB0 {"hp":0,"atk":80.31943122714748,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、body:BODY_002 Lv20 LB0 {"hp":281.1180092950162,"atk":0,"def":8.031943122714747,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定|SKD009 岩断 LB2 SP50 first [{"type":"damage","power":130.69984487962276}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|32／0|3994.28／991.30／292.04|weapon:WEAPON_001 Lv20 LB0 {"hp":0,"atk":80.31943122714748,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、body:BODY_002 Lv20 LB0 {"hp":281.1180092950162,"atk":0,"def":8.031943122714747,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定|SKD039 応急手当 LB2 SP35 lowest_ally [{"type":"heal","power":39.01244182985853,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":174900,"eqExp":47700,"cash":225750,"skillMaterials":27,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_yuki_01":0,"char_daimon_01":0,"char_jihoon_01":0,"char_aoi_01":0},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":174900,"eqExp":47700,"cash":282750,"skillMaterials":84,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_daimon_01":0,"char_aoi_01":0,"char_jihoon_01":0,"char_yuki_01":0},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"skill","id":"SKD007","amount":1},{"kind":"skill","id":"SKD041","amount":1},{"kind":"cash","amount":36250},{"kind":"character_exp_item","id":"xlarge","amount":1},{"kind":"character_exp_item","id":"medium","amount":2},{"kind":"character_exp_item","id":"small","amount":9},{"kind":"skill_material","amount":18}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":166650,"charExp":111500,"eqExp":34000,"skillMaterials":68,"genericR":0}。追加案なしのEXP/銭周回比較: {"stage":"4-1","successfulClears":223,"energy":1338,"recipeSource":"4-1-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ451〜588（各試行の最小値）、最大2236〜2563。1ダメージ0/17475攻撃イベント。BURST1〜5回。SP獲得1196〜1892、技消費1130〜1860、終了SP12〜107。
counter-boost（元 100.0% (200/200)）の配置順だけ逆転: 0.0% (0/200)、140〜146行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD049","alternatives":[{"name":"all-attack","wins":200,"n":200},{"name":"attack-up","wins":200,"n":200},{"name":"armor-break","wins":200,"n":200},{"name":"area-boost","wins":200,"n":200},{"name":"rear-focus-reversed","wins":0,"n":200}]},{"skill":"SKD035","alternatives":[{"name":"all-attack","wins":200,"n":200},{"name":"armor-break","wins":200,"n":200}]},{"skill":"SKD007","alternatives":[{"name":"area-boost","wins":200,"n":200},{"name":"rear-focus-reversed","wins":0,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"all-attack","wins":200,"n":200},{"name":"area-boost","wins":200,"n":200},{"name":"rear-focus-reversed","wins":0,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"all-attack","wins":200,"n":200},{"name":"area-boost","wins":200,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
数値変更なし。

全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 4-2-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 4-2-validated.json.gz／4-2-sample-trace.json.gz。失敗した独立検証回は 4-2-validation-v1／round-*。

---

## 4-3 宵の水辺
ID: omi-3。設計意図: 全員の被害を戻す
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更2項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv34、覚醒0。N装備Lv20／LB0。技LB2。
到達経路: burst-focus-greater-heal／defensive／rear-focusの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: SP供給＋大回復 100.0% (200/200)、72〜92行動。変更前の同編成: 14.0% (28/200)。別戦法: 攻防弱体・継続回復 100.0% (200/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|SP供給＋大回復 100.0% (200/200)|
|次点（60%前後）|SP供給＋大回復・配置15342 65.0% (130/200)|
|ギリギリ（30%前後）|SP供給＋大回復・配置35142 26.5% (53/200)|
|ほぼ厳しい（0%超〜10%）|SP供給＋大回復・配置53421 1.0% (2/200)|
|未勝利（観測0%）|攻撃強化（逆順比較） 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|SP供給＋大回復 (burst-focus-greater-heal)|100.0% (200/200)・72〜92行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD040|前面までの確定供給案・育成予算内。{"basic":9277,"SKD009":1298,"SKD007":4792,"SKD040":276}。未発動なし。敗北{"final_wave_defeated":200}|
|攻防弱体・継続回復 (defensive)|100.0% (200/200)・80〜103行動|char_joe_01:SKD036 ／ char_yuki_01:SKD037 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":10256,"SKD009":1408,"SKD037":1331,"SKD043":452,"SKD007":3905,"SKD036":256}。未発動なし。敗北{"final_wave_defeated":200}|
|SP供給＋攻撃強化 (support-feed)|98.5% (197/200)・76〜157行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":10992,"SKD009":1211,"SKD007":4285,"SKD035":220,"SKD039":3178}。未発動なし。敗北{"final_wave_defeated":197,"party_defeated":3}|
|後列集中 (rear-focus)|95.0% (190/200)・84〜161行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD026 ／ char_jihoon_01:SKD027 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":11190,"SKD027":1462,"SKD003":1370,"SKD026":3921,"SKD039":2901,"SKD035":14}。未発動なし。敗北{"final_wave_defeated":190,"party_defeated":10}|
|低消費攻撃 (cheap-attacks)|77.5% (155/200)・80〜178行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD003 ／ char_jihoon_01:SKD003 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":10165,"SKD003":9043,"SKD039":3712,"SKD035":28}。未発動なし。敗北{"final_wave_defeated":155,"party_defeated":45}|
|全体攻撃 (area-boost)|18.0% (36/200)・76〜101行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD019 ／ char_jihoon_01:SKD019 ／ char_aoi_01:SKD041|前面までの確定供給案・育成予算内。{"basic":10992,"SKD003":1569,"SKD035":942,"SKD019":3581,"SKD041":533}。未発動なし。敗北{"party_defeated":164,"final_wave_defeated":36}|
|攻撃強化（逆順比較） (attack-up-reversed)|0.0% (0/200)・74〜98行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD007 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":9805,"SKD003":3479,"SKD009":850,"SKD007":1931,"SKD039":388,"SKD035":1119}。未発動なし。敗北{"party_defeated":200}|
|SP供給＋大回復・配置15342 (burst-focus-greater-heal-order-15342)|65.0% (130/200)・74〜123行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_aoi_01:SKD040 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD009 ／ char_yuki_01:技なし・通常攻撃でSP供給|前面までの確定供給案・育成予算内。{"basic":12548,"SKD009":1177,"SKD007":3899,"SKD040":1320}。未発動なし。敗北{"final_wave_defeated":130,"party_defeated":70}|
|SP供給＋大回復・配置35142 (burst-focus-greater-heal-order-35142)|26.5% (53/200)・79〜168行動|char_daimon_01:SKD007 ／ char_aoi_01:SKD040 ／ char_joe_01:技なし・通常攻撃でSP供給 ／ char_jihoon_01:SKD009 ／ char_yuki_01:技なし・通常攻撃でSP供給|前面までの確定供給案・育成予算内。{"basic":15202,"SKD009":3250,"SKD007":780,"SKD040":1388}。未発動なし。敗北{"party_defeated":147,"final_wave_defeated":53}|
|SP供給＋大回復・配置53421 (burst-focus-greater-heal-order-53421)|1.0% (2/200)・78〜116行動|char_aoi_01:SKD040 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD009 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_joe_01:技なし・通常攻撃でSP供給|前面までの確定供給案・育成予算内。{"basic":12790,"SKD007":3200,"SKD009":1325,"SKD040":760}。未発動なし。敗北{"party_defeated":198,"final_wave_defeated":2}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|34／0|5439.84／741.08／420.26|weapon:WEAPON_001 Lv20 LB0 {"hp":0,"atk":80.31943122714748,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、body:BODY_002 Lv20 LB0 {"hp":281.1180092950162,"atk":0,"def":8.031943122714747,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定|技なし|
|2|竹中半兵衛 (char_yuki_01)|34／0|5703.04／727.46／408.48|weapon:WEAPON_001 Lv20 LB0 {"hp":0,"atk":80.31943122714748,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、body:BODY_002 Lv20 LB0 {"hp":281.1180092950162,"atk":0,"def":8.031943122714747,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定|技なし|
|3|井伊直政 (char_daimon_01)|34／0|3890.72／1149.28／316.07|weapon:WEAPON_001 Lv20 LB0 {"hp":0,"atk":80.31943122714748,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、body:BODY_002 Lv20 LB0 {"hp":281.1180092950162,"atk":0,"def":8.031943122714747,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定|SKD007 炎断 LB2 SP50 first [{"type":"damage","power":130.69984487962276}] 入手:4-1 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|34／0|4612.64／988.94／362.28|weapon:WEAPON_001 Lv20 LB0 {"hp":0,"atk":80.31943122714748,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、body:BODY_002 Lv20 LB0 {"hp":281.1180092950162,"atk":0,"def":8.031943122714747,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定|SKD009 岩断 LB2 SP50 first [{"type":"damage","power":130.69984487962276}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|34／0|4293.04／1070.68／318.79|weapon:WEAPON_001 Lv20 LB0 {"hp":0,"atk":80.31943122714748,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、body:BODY_002 Lv20 LB0 {"hp":281.1180092950162,"atk":0,"def":8.031943122714747,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定|SKD040 治癒の祈り LB2 SP90 lowest_ally [{"type":"heal","power":85.03110457464633,"healingFormula":"caster_atk_percent"}] 入手:2-5 追加提案・前面初回確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":200700,"eqExp":47700,"cash":248550,"skillMaterials":24,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_yuki_01":0,"char_daimon_01":0,"char_jihoon_01":0,"char_aoi_01":0},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":200700,"eqExp":47700,"cash":320550,"skillMaterials":96,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_daimon_01":0,"char_aoi_01":0,"char_jihoon_01":0,"char_yuki_01":0},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"skill","id":"SKD026","amount":1},{"kind":"skill","id":"SKD027","amount":1},{"kind":"cash","amount":32200},{"kind":"character_exp_item","id":"xlarge","amount":1},{"kind":"character_exp_item","id":"medium","amount":4},{"kind":"character_exp_item","id":"small","amount":9},{"kind":"skill_material","amount":12}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":198850,"charExp":136400,"eqExp":33300,"skillMaterials":80,"genericR":0}。追加案なしのEXP/銭周回比較: {"stage":"4-2","successfulClears":273,"energy":1638,"recipeSource":"4-2-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ228〜302（各試行の最小値）、最大1718〜1856。1ダメージ0/15367攻撃イベント。BURST1〜4回。SP獲得968〜1552、技消費850〜1450、終了SP21〜134。
burst-focus-greater-heal（元 100.0% (200/200)）の配置順だけ逆転: 1.0% (2/200)、81〜119行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD007","alternatives":[{"name":"rear-focus","wins":190,"n":200},{"name":"cheap-attacks","wins":155,"n":200},{"name":"area-boost","wins":36,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"rear-focus","wins":190,"n":200},{"name":"cheap-attacks","wins":155,"n":200},{"name":"area-boost","wins":36,"n":200}]},{"skill":"SKD040","alternatives":[{"name":"defensive","wins":200,"n":200},{"name":"support-feed","wins":197,"n":200},{"name":"rear-focus","wins":190,"n":200},{"name":"cheap-attacks","wins":155,"n":200},{"name":"area-boost","wins":36,"n":200},{"name":"attack-up-reversed","wins":0,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
|2/1 立花誾千代 (4-3/2/1)|atk|2870→1274|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|3/1 伊達政宗 (4-3/3/1)|atk|2870→1274|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|


全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 4-3-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 4-3-validated.json.gz／4-3-sample-trace.json.gz。失敗した独立検証回は 4-3-validation-v1／round-*。

---

## 4-4 山門のかがり火
ID: omi-4。設計意図: 大きな一撃に備える
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更0項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv36、覚醒0。N装備Lv20／LB0。技LB2。
到達経路: counter-boost／attack-up／armor-break／area-boost／no-heal-replace-SKD009-SKD010／no-healの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 反撃 100.0% (200/200)、81〜100行動。変更前の同編成: 100.0% (200/200)。別戦法: 攻撃強化 100.0% (200/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|反撃 100.0% (200/200)|
|次点（60%前後）|該当なし|
|ギリギリ（30%前後）|該当なし|
|ほぼ厳しい（0%超〜10%）|該当なし|
|未勝利（観測0%）|該当なし|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|反撃 (counter-boost)|100.0% (200/200)・81〜100行動|char_joe_01:SKD049 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":10195,"SKD009":1671,"SKD010":4391,"SKD049":200,"SKD039":1120,"SKD035":494}。未発動なし。敗北{"final_wave_defeated":200}|
|攻撃強化 (attack-up)|100.0% (200/200)・82〜103行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":9722,"SKD009":1981,"SKD003":1308,"SKD010":3951,"SKD035":392,"SKD039":789}。未発動なし。敗北{"final_wave_defeated":200}|
|防御低下 (armor-break)|100.0% (200/200)・80〜106行動|char_joe_01:SKD003 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":9735,"SKD009":1984,"SKD003":1326,"SKD010":3909,"SKD038":797,"SKD039":738}。未発動なし。敗北{"final_wave_defeated":200}|
|全体攻撃 (area-boost)|100.0% (200/200)・84〜118行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD019 ／ char_aoi_01:SKD041|前面までの確定供給案・育成予算内。{"basic":10855,"SKD003":1230,"SKD035":1053,"SKD009":4145,"SKD019":1631,"SKD041":7}。未発動なし。敗北{"final_wave_defeated":200}|
|回復なし比較 (no-heal)|100.0% (200/200)・77〜94行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD010|前面までの確定供給案・育成予算内。{"basic":9219,"SKD009":1775,"SKD003":1225,"SKD010":4900}。未発動SKD035。敗北{"final_wave_defeated":200}|
|回復なし比較・SKD009-SKD010置換 (no-heal-replace-SKD009-SKD010)|100.0% (200/200)・79〜97行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD010 ／ char_aoi_01:SKD010|前面までの確定供給案・育成予算内。{"basic":9089,"SKD010":6915,"SKD003":1193}。未発動SKD035。敗北{"final_wave_defeated":200}|
|反撃・配置45321 (counter-boost-order-45321)|91.0% (182/200)・112〜154行動|char_jihoon_01:SKD009 ／ char_aoi_01:SKD039 ／ char_daimon_01:SKD010 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD049|前面までの確定供給案・育成予算内。{"basic":17665,"SKD049":2797,"SKD010":3694,"SKD009":684,"SKD039":1052,"SKD035":1140}。未発動なし。敗北{"final_wave_defeated":182,"party_defeated":18}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|36／0|5824.00／794.05／455.75|weapon:WEAPON_001 Lv20 LB0 {"hp":0,"atk":80.31943122714748,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、body:BODY_002 Lv20 LB0 {"hp":281.1180092950162,"atk":0,"def":8.031943122714747,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定|SKD049 返し刃 LB2 SP65 self [{"type":"counter","power":49.681182134834955,"duration":3,"carryAcrossWaves":true}] 入手:3-5 追加提案・前面初回確定|
|2|竹中半兵衛 (char_yuki_01)|36／0|6106.80／779.33／442.96|weapon:WEAPON_001 Lv20 LB0 {"hp":0,"atk":80.31943122714748,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、body:BODY_002 Lv20 LB0 {"hp":281.1180092950162,"atk":0,"def":8.031943122714747,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定|SKD035 鬨の声 LB2 SP75 all_allies [{"type":"atk_up","power":8.93623642696699,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|3|井伊直政 (char_daimon_01)|36／0|4159.52／1234.96／342.59|weapon:WEAPON_001 Lv20 LB0 {"hp":0,"atk":80.31943122714748,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、body:BODY_002 Lv20 LB0 {"hp":281.1180092950162,"atk":0,"def":8.031943122714747,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定|SKD010 風断 LB2 SP50 first [{"type":"damage","power":130.69984487962276}] 入手:2-5 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|36／0|4935.20／1061.76／392.78|weapon:WEAPON_001 Lv20 LB0 {"hp":0,"atk":80.31943122714748,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、body:BODY_002 Lv20 LB0 {"hp":281.1180092950162,"atk":0,"def":8.031943122714747,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定|SKD009 岩断 LB2 SP50 first [{"type":"damage","power":130.69984487962276}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|36／0|4591.80／1150.06／345.54|weapon:WEAPON_001 Lv20 LB0 {"hp":0,"atk":80.31943122714748,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、body:BODY_002 Lv20 LB0 {"hp":281.1180092950162,"atk":0,"def":8.031943122714747,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定|SKD039 応急手当 LB2 SP35 lowest_ally [{"type":"heal","power":39.01244182985853,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":228400,"eqExp":47700,"cash":279250,"skillMaterials":27,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_yuki_01":0,"char_daimon_01":0,"char_jihoon_01":0,"char_aoi_01":0},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":228400,"eqExp":47700,"cash":348250,"skillMaterials":96,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_daimon_01":0,"char_aoi_01":0,"char_jihoon_01":0,"char_yuki_01":0},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"cash","amount":22100},{"kind":"character_exp_item","id":"xlarge","amount":1},{"kind":"character_exp_item","id":"large","amount":1},{"kind":"character_exp_item","id":"medium","amount":1},{"kind":"character_exp_item","id":"small","amount":8}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":220950,"charExp":163200,"eqExp":32600,"skillMaterials":80,"genericR":0}。追加案なしのEXP/銭周回比較: {"stage":"4-3","successfulClears":327,"energy":1962,"recipeSource":"4-3-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ124〜150（各試行の最小値）、最大1794〜2646。1ダメージ0/16257攻撃イベント。BURST0〜5回。SP獲得1061〜1726、技消費1030〜1700、終了SP10〜88。
counter-boost（元 100.0% (200/200)）の配置順だけ逆転: 49.0% (98/200)、117〜152行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD049","alternatives":[{"name":"no-heal","wins":200,"n":200},{"name":"no-heal-replace-SKD009-SKD010","wins":200,"n":200},{"name":"attack-up","wins":200,"n":200},{"name":"armor-break","wins":200,"n":200},{"name":"area-boost","wins":200,"n":200}]},{"skill":"SKD035","alternatives":[{"name":"armor-break","wins":200,"n":200}]},{"skill":"SKD010","alternatives":[{"name":"area-boost","wins":200,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"no-heal-replace-SKD009-SKD010","wins":200,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"no-heal","wins":200,"n":200},{"name":"no-heal-replace-SKD009-SKD010","wins":200,"n":200},{"name":"area-boost","wins":200,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
数値変更なし。

全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 4-4-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 4-4-validated.json.gz／4-4-sample-trace.json.gz。失敗した独立検証回は 4-4-validation-v1／round-*。

---

## 4-5 近江の夜明け
ID: omi-5。設計意図: 守りすぎずに勝つ
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更3項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv38、覚醒0。N装備Lv20／LB0。技LB2。
到達経路: defensive／break-and-buff／rear-focus-reversedの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 攻防弱体・継続回復 100.0% (200/200)、121〜152行動。変更前の同編成: 72.5% (145/200)。別戦法: 防御低下＋攻撃強化 100.0% (200/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|攻防弱体・継続回復 100.0% (200/200)|
|次点（60%前後）|該当なし|
|ギリギリ（30%前後）|該当なし|
|ほぼ厳しい（0%超〜10%）|該当なし|
|未勝利（観測0%）|該当なし|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|防御低下＋攻撃強化 (break-and-buff)|100.0% (200/200)・121〜156行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":14830,"SKD009":7935,"SKD038":1057,"SKD035":473,"SKD039":2714}。未発動なし。敗北{"final_wave_defeated":200}|
|攻防弱体・継続回復 (defensive)|100.0% (200/200)・121〜152行動|char_joe_01:SKD036 ／ char_yuki_01:SKD037 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":15784,"SKD009":8344,"SKD037":1248,"SKD043":524,"SKD036":1039}。未発動なし。敗北{"final_wave_defeated":200}|
|通常攻撃でSP供給／攻撃役へBURST集中 (burst-focus)|100.0% (200/200)・123〜183行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":15494,"SKD009":9850,"SKD039":3009}。未発動なし。敗北{"final_wave_defeated":200}|
|後列集中（逆順比較） (rear-focus-reversed)|76.0% (152/200)・152〜224行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD027 ／ char_daimon_01:SKD026 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":18823,"SKD003":6534,"SKD027":2627,"SKD026":3918,"SKD039":3345,"SKD035":1166}。未発動なし。敗北{"final_wave_defeated":152,"party_defeated":48}|
|攻防弱体・継続回復・配置13542 (defensive-order-13542)|100.0% (200/200)・118〜168行動|char_joe_01:SKD036 ／ char_daimon_01:SKD009 ／ char_aoi_01:SKD043 ／ char_jihoon_01:SKD009 ／ char_yuki_01:SKD037|前面までの確定供給案・育成予算内。{"basic":15295,"SKD009":9160,"SKD037":1063,"SKD043":588,"SKD036":557}。未発動なし。敗北{"final_wave_defeated":200}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|38／0|6208.16／847.01／491.24|weapon:WEAPON_001 Lv20 LB0 {"hp":0,"atk":80.31943122714748,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、body:BODY_002 Lv20 LB0 {"hp":281.1180092950162,"atk":0,"def":8.031943122714747,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定|SKD036 守りの陣 LB2 SP75 all_allies [{"type":"def_up","power":17.006220914929266,"duration":3,"carryAcrossWaves":true}] 入手:3-5 追加提案・前面初回確定|
|2|竹中半兵衛 (char_yuki_01)|38／0|6510.56／831.20／477.44|weapon:WEAPON_001 Lv20 LB0 {"hp":0,"atk":80.31943122714748,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、body:BODY_002 Lv20 LB0 {"hp":281.1180092950162,"atk":0,"def":8.031943122714747,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定|SKD037 威圧 LB2 SP50 highest_atk_enemy [{"type":"atk_down","power":11.337480609952845,"duration":3,"carryAcrossWaves":true}] 入手:3-5 追加提案・前面初回確定|
|3|井伊直政 (char_daimon_01)|38／0|4428.32／1320.64／369.11|weapon:WEAPON_001 Lv20 LB0 {"hp":0,"atk":80.31943122714748,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、body:BODY_002 Lv20 LB0 {"hp":281.1180092950162,"atk":0,"def":8.031943122714747,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定|SKD009 岩断 LB2 SP50 first [{"type":"damage","power":130.69984487962276}] 入手:1-2 現行初回/任務確定|
|4|前田利家 (char_jihoon_01)|38／0|5257.76／1134.59／423.27|weapon:WEAPON_001 Lv20 LB0 {"hp":0,"atk":80.31943122714748,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、body:BODY_002 Lv20 LB0 {"hp":281.1180092950162,"atk":0,"def":8.031943122714747,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定|SKD009 岩断 LB2 SP50 first [{"type":"damage","power":130.69984487962276}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|38／0|4890.56／1229.44／372.30|weapon:WEAPON_001 Lv20 LB0 {"hp":0,"atk":80.31943122714748,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、body:BODY_002 Lv20 LB0 {"hp":281.1180092950162,"atk":0,"def":8.031943122714747,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定|SKD043 再生の祈り LB2 SP65 lowest_ally [{"type":"hot","power":17.006220914929266,"duration":3,"carryAcrossWaves":true}] 入手:3-4 追加提案・前面初回確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":258100,"eqExp":47700,"cash":305950,"skillMaterials":24,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_yuki_01":0,"char_daimon_01":0,"char_jihoon_01":0,"char_aoi_01":0},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":258100,"eqExp":47700,"cash":377950,"skillMaterials":96,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_daimon_01":0,"char_aoi_01":0,"char_jihoon_01":0,"char_yuki_01":0},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"cash","amount":24100},{"kind":"character_exp_item","id":"xlarge","amount":1},{"kind":"character_exp_item","id":"large","amount":1},{"kind":"character_exp_item","id":"medium","amount":3},{"kind":"character_exp_item","id":"small","amount":8}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":245050,"charExp":192000,"eqExp":31900,"skillMaterials":80,"genericR":0}。追加案なしのEXP/銭周回比較: {"stage":"4-4","successfulClears":384,"energy":2304,"recipeSource":"4-4-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ208〜235（各試行の最小値）、最大1810〜1932。1ダメージ0/24128攻撃イベント。BURST1〜6回。SP獲得1696〜2570、技消費1605〜2525、終了SP13〜124。
break-and-buff（元 100.0% (200/200)）の配置順だけ逆転: 100.0% (200/200)、128〜168行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD036","alternatives":[{"name":"break-and-buff","wins":200,"n":200},{"name":"burst-focus","wins":200,"n":200},{"name":"rear-focus-reversed","wins":152,"n":200}]},{"skill":"SKD037","alternatives":[{"name":"break-and-buff","wins":200,"n":200},{"name":"burst-focus","wins":200,"n":200},{"name":"rear-focus-reversed","wins":152,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"rear-focus-reversed","wins":152,"n":200}]},{"skill":"SKD043","alternatives":[{"name":"break-and-buff","wins":200,"n":200},{"name":"burst-focus","wins":200,"n":200},{"name":"rear-focus-reversed","wins":152,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
|1/1 柴田勝家 (4-5/1/1)|atk|1870→1352|全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|2/1 伊達政宗 (4-5/2/1)|atk|1870→1149|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|3/1 上杉謙信 (4-5/3/1)|atk|1870→1149|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|


全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 4-5-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 4-5-validated.json.gz／4-5-sample-trace.json.gz。失敗した独立検証回は 4-5-validation-v1／round-*。

---

## 5-1 赤き旗の道
ID: kai-1。設計意図: 同属性で攻める
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更0項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv40、覚醒0。N装備Lv30／LB0。技LB3。
到達経路: attack-up／counter-boost／armor-break／double-rock／attack-up-replace-SKD009-SKD008／defensiveの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 攻撃強化 100.0% (200/200)、59〜85行動。変更前の同編成: 100.0% (200/200)。別戦法: 反撃 100.0% (200/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|攻撃強化 100.0% (200/200)|
|次点（60%前後）|攻撃強化・配置45321 59.5% (119/200)|
|ギリギリ（30%前後）|攻撃強化・配置43152 22.5% (45/200)|
|ほぼ厳しい（0%超〜10%）|攻撃強化・配置53421 0.5% (1/200)|
|未勝利（観測0%）|該当なし|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|反撃 (counter-boost)|100.0% (200/200)・63〜84行動|char_joe_01:SKD049 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":8542,"SKD009":1661,"SKD008":2928,"SKD049":200,"SKD035":358,"SKD039":709}。未発動なし。敗北{"final_wave_defeated":200}|
|攻撃強化 (attack-up)|100.0% (200/200)・59〜85行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":7708,"SKD009":1486,"SKD003":1292,"SKD008":3078,"SKD039":588,"SKD035":101}。未発動なし。敗北{"final_wave_defeated":200}|
|防御低下 (armor-break)|100.0% (200/200)・61〜89行動|char_joe_01:SKD003 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":7862,"SKD009":1835,"SKD003":1201,"SKD008":2733,"SKD039":662,"SKD038":427}。未発動なし。敗北{"final_wave_defeated":200}|
|土属性集中＋攻撃強化（中心技の発動が半数未満・比較用） (double-rock)|100.0% (200/200)・72〜94行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":8905,"SKD009":5551,"SKD003":1216,"SKD039":799,"SKD035":78}。未発動なし。敗北{"final_wave_defeated":200}|
|攻防弱体・継続回復 (defensive)|100.0% (200/200)・73〜86行動|char_joe_01:SKD036 ／ char_yuki_01:SKD037 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":9190,"SKD009":1831,"SKD037":1302,"SKD043":348,"SKD008":2645,"SKD036":261}。未発動なし。敗北{"final_wave_defeated":200}|
|防御低下（逆順比較） (armor-break-reversed)|40.5% (81/200)・84〜118行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD008 ／ char_yuki_01:SKD038 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":9326,"SKD038":1473,"SKD009":950,"SKD003":6614,"SKD039":407,"SKD008":1245}。未発動なし。敗北{"final_wave_defeated":81,"party_defeated":119}|
|攻撃強化（逆順比較） (attack-up-reversed)|47.5% (95/200)・62〜109行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD008 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":8213,"SKD003":7180,"SKD009":710,"SKD008":2099,"SKD039":122,"SKD035":189}。未発動なし。敗北{"final_wave_defeated":95,"party_defeated":105}|
|攻撃強化・SKD009-SKD008置換（中心技の発動が半数未満・比較用） (attack-up-replace-SKD009-SKD008)|100.0% (200/200)・56〜78行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD008 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":7132,"SKD008":4346,"SKD003":1110,"SKD039":624,"SKD035":93}。未発動なし。敗北{"final_wave_defeated":200}|
|攻撃強化・配置45321 (attack-up-order-45321)|59.5% (119/200)・60〜115行動|char_jihoon_01:SKD009 ／ char_aoi_01:SKD039 ／ char_daimon_01:SKD008 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":7991,"SKD003":6389,"SKD009":528,"SKD008":2435,"SKD039":298,"SKD035":165}。未発動なし。敗北{"final_wave_defeated":119,"party_defeated":81}|
|攻撃強化・配置43152 (attack-up-order-43152)|22.5% (45/200)・86〜165行動|char_jihoon_01:SKD009 ／ char_daimon_01:SKD008 ／ char_joe_01:SKD003 ／ char_aoi_01:SKD039 ／ char_yuki_01:SKD035|前面までの確定供給案・育成予算内。{"basic":12911,"SKD003":3571,"SKD009":599,"SKD035":1968,"SKD039":1894,"SKD008":1108}。未発動なし。敗北{"party_defeated":155,"final_wave_defeated":45}|
|攻撃強化・配置53421 (attack-up-order-53421)|0.5% (1/200)・90〜115行動|char_aoi_01:SKD039 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":8307,"SKD003":8095,"SKD008":708,"SKD009":1772,"SKD035":247}。未発動SKD039。敗北{"party_defeated":199,"final_wave_defeated":1}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|40／0|6989.37／951.98／614.64|weapon:WEAPON_001 Lv30 LB0 {"hp":0,"atk":132.32570028180783,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv30 LB0 {"hp":49.622137605677935,"atk":0,"def":43.00585259158754,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv30 LB0 {"hp":463.1399509863274,"atk":0,"def":13.232570028180783,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv30 LB0 {"hp":165.40712535225978,"atk":0,"def":39.697710084542344,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD003 土割り LB3 SP25 first [{"type":"damage","power":114.99111786064586}] 入手:チュートリアル確定|
|2|竹中半兵衛 (char_yuki_01)|40／0|7311.37／935.08／599.82|weapon:WEAPON_001 Lv30 LB0 {"hp":0,"atk":132.32570028180783,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv30 LB0 {"hp":49.622137605677935,"atk":0,"def":43.00585259158754,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv30 LB0 {"hp":463.1399509863274,"atk":0,"def":13.232570028180783,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv30 LB0 {"hp":165.40712535225978,"atk":0,"def":39.697710084542344,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD035 鬨の声 LB3 SP75 all_allies [{"type":"atk_up","power":9.554173889433798,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|3|井伊直政 (char_daimon_01)|40／0|5094.17／1458.33／483.54|weapon:WEAPON_001 Lv30 LB0 {"hp":0,"atk":132.32570028180783,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv30 LB0 {"hp":49.622137605677935,"atk":0,"def":43.00585259158754,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv30 LB0 {"hp":463.1399509863274,"atk":0,"def":13.232570028180783,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv30 LB0 {"hp":165.40712535225978,"atk":0,"def":39.697710084542344,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD008 水断 LB3 SP50 first [{"type":"damage","power":137.76198730781485}] 入手:4-5 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|40／0|5977.37／1259.43／541.68|weapon:WEAPON_001 Lv30 LB0 {"hp":0,"atk":132.32570028180783,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv30 LB0 {"hp":49.622137605677935,"atk":0,"def":43.00585259158754,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv30 LB0 {"hp":463.1399509863274,"atk":0,"def":13.232570028180783,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv30 LB0 {"hp":165.40712535225978,"atk":0,"def":39.697710084542344,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD009 岩断 LB3 SP50 first [{"type":"damage","power":137.76198730781485}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|40／0|5586.37／1360.83／486.96|weapon:WEAPON_001 Lv30 LB0 {"hp":0,"atk":132.32570028180783,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv30 LB0 {"hp":49.622137605677935,"atk":0,"def":43.00585259158754,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv30 LB0 {"hp":463.1399509863274,"atk":0,"def":13.232570028180783,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv30 LB0 {"hp":165.40712535225978,"atk":0,"def":39.697710084542344,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD039 応急手当 LB3 SP35 lowest_ally [{"type":"heal","power":41.660745240430565,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":289800,"eqExp":241600,"cash":458600,"skillMaterials":48,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_yuki_01":0,"char_daimon_01":0,"char_jihoon_01":0,"char_aoi_01":0},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":289800,"eqExp":241600,"cash":566600,"skillMaterials":156,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_daimon_01":0,"char_aoi_01":0,"char_jihoon_01":0,"char_yuki_01":0},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"skill","id":"SKD008","amount":1},{"kind":"equipment","id":"HEAD_003","amount":5},{"kind":"equipment","id":"LEGS_001","amount":5},{"kind":"cash","amount":183050},{"kind":"character_exp_item","id":"xlarge","amount":1},{"kind":"character_exp_item","id":"large","amount":2},{"kind":"character_exp_item","id":"small","amount":8},{"kind":"equipment_exp_item","id":"xlarge","amount":9},{"kind":"equipment_exp_item","id":"large","amount":2},{"kind":"equipment_exp_item","id":"small","amount":4},{"kind":"skill_material","amount":60}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":428100,"charExp":222800,"eqExp":225100,"skillMaterials":140,"genericR":0}。追加案なしのEXP/銭周回比較: {"stage":"4-5","successfulClears":751,"energy":4506,"recipeSource":"4-5-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ0〜253（各試行の最小値）、最大2578〜3185。1ダメージ0/13564攻撃イベント。BURST0〜4回。SP獲得737〜1360、技消費695〜1325、終了SP10〜91。
counter-boost（元 100.0% (200/200)）の配置順だけ逆転: 17.5% (35/200)、90〜119行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD003","alternatives":[{"name":"counter-boost","wins":200,"n":200},{"name":"defensive","wins":200,"n":200}]},{"skill":"SKD035","alternatives":[{"name":"armor-break","wins":200,"n":200},{"name":"defensive","wins":200,"n":200},{"name":"armor-break-reversed","wins":81,"n":200}]},{"skill":"SKD008","alternatives":[{"name":"double-rock","wins":200,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"attack-up-replace-SKD009-SKD008","wins":200,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"defensive","wins":200,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
数値変更なし。

全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 5-1-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 5-1-validated.json.gz／5-1-sample-trace.json.gz。失敗した独立検証回は 5-1-validation-v1／round-*。

---

## 5-2 山裾の陣屋
ID: kai-2。設計意図: 同属性で守る
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更0項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv42、覚醒0。N装備Lv30／LB0。技LB3。
到達経路: counter-boost／barrier／armor-break／no-heal-replace-SKD009-SKD010／no-healの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 反撃 100.0% (200/200)、65〜88行動。変更前の同編成: 100.0% (200/200)。別戦法: 障壁 100.0% (200/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|反撃 100.0% (200/200)|
|次点（60%前後）|該当なし|
|ギリギリ（30%前後）|該当なし|
|ほぼ厳しい（0%超〜10%）|該当なし|
|未勝利（観測0%）|該当なし|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|反撃 (counter-boost)|100.0% (200/200)・65〜88行動|char_joe_01:SKD049 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":8498,"SKD009":4729,"SKD049":400,"SKD035":401,"SKD039":377}。未発動なし。敗北{"final_wave_defeated":200}|
|障壁 (barrier)|100.0% (200/200)・68〜91行動|char_joe_01:SKD045 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":8759,"SKD009":4540,"SKD045":830,"SKD035":344,"SKD039":497}。未発動なし。敗北{"final_wave_defeated":200}|
|防御低下 (armor-break)|100.0% (200/200)・69〜90行動|char_joe_01:SKD003 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":8163,"SKD009":4073,"SKD003":2619,"SKD039":442,"SKD038":384}。未発動なし。敗北{"final_wave_defeated":200}|
|攻防弱体・継続回復 (defensive)|100.0% (200/200)・73〜95行動|char_joe_01:SKD036 ／ char_yuki_01:SKD037 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":9983,"SKD009":4697,"SKD037":1173,"SKD043":371,"SKD036":558}。未発動なし。敗北{"final_wave_defeated":200}|
|回復なし比較 (no-heal)|100.0% (200/200)・61〜77行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD009|前面までの確定供給案・育成予算内。{"basic":7310,"SKD009":4529,"SKD003":1998}。未発動SKD035。敗北{"final_wave_defeated":200}|
|回復なし比較・SKD009-SKD010置換 (no-heal-replace-SKD009-SKD010)|100.0% (200/200)・78〜94行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD010 ／ char_aoi_01:SKD010|前面までの確定供給案・育成予算内。{"basic":8840,"SKD010":6052,"SKD003":2067}。未発動SKD035。敗北{"final_wave_defeated":200}|
|反撃・配置13542 (counter-boost-order-13542)|100.0% (200/200)・64〜87行動|char_joe_01:SKD049 ／ char_daimon_01:SKD009 ／ char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_yuki_01:SKD035|前面までの確定供給案・育成予算内。{"basic":8561,"SKD009":5041,"SKD049":480,"SKD035":161,"SKD039":533}。未発動なし。敗北{"final_wave_defeated":200}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|42／0|7455.85／1015.03／661.05|weapon:WEAPON_001 Lv30 LB0 {"hp":0,"atk":132.32570028180783,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv30 LB0 {"hp":49.622137605677935,"atk":0,"def":43.00585259158754,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv30 LB0 {"hp":463.1399509863274,"atk":0,"def":13.232570028180783,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv30 LB0 {"hp":165.40712535225978,"atk":0,"def":39.697710084542344,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD049 返し刃 LB3 SP65 self [{"type":"counter","power":52.770869447169,"duration":3,"carryAcrossWaves":true}] 入手:3-5 追加提案・前面初回確定|
|2|竹中半兵衛 (char_yuki_01)|42／0|7801.65／996.83／644.90|weapon:WEAPON_001 Lv30 LB0 {"hp":0,"atk":132.32570028180783,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv30 LB0 {"hp":49.622137605677935,"atk":0,"def":43.00585259158754,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv30 LB0 {"hp":463.1399509863274,"atk":0,"def":13.232570028180783,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv30 LB0 {"hp":165.40712535225978,"atk":0,"def":39.697710084542344,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD035 鬨の声 LB3 SP75 all_allies [{"type":"atk_up","power":9.554173889433798,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|3|井伊直政 (char_daimon_01)|42／0|5420.57／1560.33／518.22|weapon:WEAPON_001 Lv30 LB0 {"hp":0,"atk":132.32570028180783,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv30 LB0 {"hp":49.622137605677935,"atk":0,"def":43.00585259158754,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv30 LB0 {"hp":463.1399509863274,"atk":0,"def":13.232570028180783,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv30 LB0 {"hp":165.40712535225978,"atk":0,"def":39.697710084542344,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD009 岩断 LB3 SP50 first [{"type":"damage","power":137.76198730781485}] 入手:1-2 現行初回/任務確定|
|4|前田利家 (char_jihoon_01)|42／0|6369.05／1346.13／581.56|weapon:WEAPON_001 Lv30 LB0 {"hp":0,"atk":132.32570028180783,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv30 LB0 {"hp":49.622137605677935,"atk":0,"def":43.00585259158754,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv30 LB0 {"hp":463.1399509863274,"atk":0,"def":13.232570028180783,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv30 LB0 {"hp":165.40712535225978,"atk":0,"def":39.697710084542344,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD009 岩断 LB3 SP50 first [{"type":"damage","power":137.76198730781485}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|42／0|5949.15／1455.33／521.94|weapon:WEAPON_001 Lv30 LB0 {"hp":0,"atk":132.32570028180783,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv30 LB0 {"hp":49.622137605677935,"atk":0,"def":43.00585259158754,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv30 LB0 {"hp":463.1399509863274,"atk":0,"def":13.232570028180783,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv30 LB0 {"hp":165.40712535225978,"atk":0,"def":39.697710084542344,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD039 応急手当 LB3 SP35 lowest_ally [{"type":"heal","power":41.660745240430565,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":323550,"eqExp":241600,"cash":486350,"skillMaterials":42,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_yuki_01":0,"char_daimon_01":0,"char_jihoon_01":0,"char_aoi_01":0},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":323550,"eqExp":241600,"cash":618350,"skillMaterials":174,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_daimon_01":0,"char_aoi_01":0,"char_jihoon_01":0,"char_yuki_01":0},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"skill","id":"SKD045","amount":1},{"kind":"cash","amount":44750},{"kind":"character_exp_item","id":"xlarge","amount":1},{"kind":"character_exp_item","id":"large","amount":2},{"kind":"character_exp_item","id":"medium","amount":2},{"kind":"character_exp_item","id":"small","amount":6},{"kind":"skill_material","amount":18}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":472850,"charExp":255350,"eqExp":224200,"skillMaterials":158,"genericR":0}。追加案なしのEXP/銭周回比較: {"stage":"5-1","successfulClears":561,"energy":3366,"recipeSource":"5-1-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ198〜328（各試行の最小値）、最大2735〜3419。1ダメージ0/13227攻撃イベント。BURST0〜4回。SP獲得937〜1466、技消費880〜1425、終了SP11〜93。
counter-boost（元 100.0% (200/200)）の配置順だけ逆転: 100.0% (200/200)、71〜107行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD049","alternatives":[{"name":"no-heal","wins":200,"n":200},{"name":"barrier","wins":200,"n":200},{"name":"armor-break","wins":200,"n":200},{"name":"defensive","wins":200,"n":200},{"name":"no-heal-replace-SKD009-SKD010","wins":200,"n":200}]},{"skill":"SKD035","alternatives":[{"name":"armor-break","wins":200,"n":200},{"name":"defensive","wins":200,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"no-heal-replace-SKD009-SKD010","wins":200,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"no-heal","wins":200,"n":200},{"name":"defensive","wins":200,"n":200},{"name":"no-heal-replace-SKD009-SKD010","wins":200,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
数値変更なし。

全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 5-2-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 5-2-validated.json.gz／5-2-sample-trace.json.gz。失敗した独立検証回は 5-2-validation-v1／round-*。

---

## 5-3 谷間の渡り
ID: kai-3。設計意図: 攻撃属性だけを替える
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更0項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv44、覚醒0。N装備Lv30／LB0。技LB3。
到達経路: break-and-buff／counter-boost／armor-break／double-rock／break-and-buff-replace-SKD009-SKD010／defensiveの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 防御低下＋攻撃強化 100.0% (200/200)、73〜118行動。変更前の同編成: 100.0% (200/200)。別戦法: 反撃 100.0% (200/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|防御低下＋攻撃強化 100.0% (200/200)|
|次点（60%前後）|該当なし|
|ギリギリ（30%前後）|該当なし|
|ほぼ厳しい（0%超〜10%）|全体攻撃 2.5% (5/200)|
|未勝利（観測0%）|攻撃強化（逆順比較） 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|防御低下＋攻撃強化 (break-and-buff)|100.0% (200/200)・73〜118行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":9796,"SKD009":1376,"SKD038":1493,"SKD035":304,"SKD010":3548,"SKD039":975}。未発動なし。敗北{"final_wave_defeated":200}|
|反撃 (counter-boost)|100.0% (200/200)・78〜111行動|char_joe_01:SKD049 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":10306,"SKD009":1661,"SKD010":4334,"SKD049":200,"SKD035":595,"SKD039":971}。未発動なし。敗北{"final_wave_defeated":200}|
|防御低下 (armor-break)|100.0% (200/200)・83〜133行動|char_joe_01:SKD003 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":10588,"SKD009":2183,"SKD003":1980,"SKD010":3927,"SKD039":939,"SKD038":779}。未発動なし。敗北{"final_wave_defeated":200}|
|土属性集中＋攻撃強化 (double-rock)|100.0% (200/200)・100〜152行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":13055,"SKD009":8244,"SKD003":1977,"SKD039":1282,"SKD035":319}。未発動なし。敗北{"final_wave_defeated":200}|
|攻防弱体・継続回復 (defensive)|100.0% (200/200)・91〜132行動|char_joe_01:SKD036 ／ char_yuki_01:SKD037 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":12498,"SKD009":2150,"SKD037":1844,"SKD043":486,"SKD010":4338,"SKD036":518}。未発動なし。敗北{"final_wave_defeated":200}|
|全体攻撃 (area-boost)|2.5% (5/200)・214〜278行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD022 ／ char_jihoon_01:SKD019 ／ char_aoi_01:SKD041|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":32756,"SKD003":2099,"SKD035":872,"SKD022":4563,"SKD019":5786,"SKD041":3203}。未発動なし。敗北{"party_defeated":195,"final_wave_defeated":5}|
|攻撃強化（逆順比較） (attack-up-reversed)|0.0% (0/200)・154〜175行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD010 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":14324,"SKD003":14102,"SKD009":1480,"SKD010":2582,"SKD039":232,"SKD035":460}。未発動なし。敗北{"party_defeated":200}|
|防御低下＋攻撃強化・SKD009-SKD010置換 (break-and-buff-replace-SKD009-SKD010)|100.0% (200/200)・70〜122行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD010 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":9420,"SKD010":4690,"SKD038":1394,"SKD035":326,"SKD039":958}。未発動なし。敗北{"final_wave_defeated":200}|
|防御低下＋攻撃強化・配置43152 (break-and-buff-order-43152)|81.0% (162/200)・88〜300行動|char_jihoon_01:SKD009 ／ char_daimon_01:SKD010 ／ char_joe_01:SKD035 ／ char_aoi_01:SKD039 ／ char_yuki_01:SKD038|前面までの確定供給案・育成予算内。{"basic":23450,"SKD038":3412,"SKD010":2377,"SKD039":6598,"SKD009":1630,"SKD035":1470}。未発動なし。敗北{"final_wave_defeated":162,"action_limit":38}|
|防御低下＋攻撃強化・配置53421 (break-and-buff-order-53421)|41.0% (82/200)・90〜176行動|char_aoi_01:SKD039 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_yuki_01:SKD038 ／ char_joe_01:SKD035|前面までの確定供給案・育成予算内。{"basic":18514,"SKD038":2027,"SKD010":2617,"SKD009":3286,"SKD039":441,"SKD035":2438}。未発動なし。敗北{"final_wave_defeated":82,"party_defeated":118}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|44／0|7922.33／1078.08／707.46|weapon:WEAPON_001 Lv30 LB0 {"hp":0,"atk":132.32570028180783,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv30 LB0 {"hp":49.622137605677935,"atk":0,"def":43.00585259158754,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv30 LB0 {"hp":463.1399509863274,"atk":0,"def":13.232570028180783,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv30 LB0 {"hp":165.40712535225978,"atk":0,"def":39.697710084542344,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD035 鬨の声 LB3 SP75 all_allies [{"type":"atk_up","power":9.554173889433798,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|2|竹中半兵衛 (char_yuki_01)|44／0|8291.93／1058.58／689.98|weapon:WEAPON_001 Lv30 LB0 {"hp":0,"atk":132.32570028180783,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv30 LB0 {"hp":49.622137605677935,"atk":0,"def":43.00585259158754,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv30 LB0 {"hp":463.1399509863274,"atk":0,"def":13.232570028180783,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv30 LB0 {"hp":165.40712535225978,"atk":0,"def":39.697710084542344,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD038 鎧砕き LB3 SP50 first [{"type":"def_down","power":14.886322937519912,"duration":3,"carryAcrossWaves":true}] 入手:2-5 追加提案・前面初回確定|
|3|井伊直政 (char_daimon_01)|44／0|5746.97／1662.33／552.90|weapon:WEAPON_001 Lv30 LB0 {"hp":0,"atk":132.32570028180783,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv30 LB0 {"hp":49.622137605677935,"atk":0,"def":43.00585259158754,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv30 LB0 {"hp":463.1399509863274,"atk":0,"def":13.232570028180783,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv30 LB0 {"hp":165.40712535225978,"atk":0,"def":39.697710084542344,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD010 風断 LB3 SP50 first [{"type":"damage","power":137.76198730781485}] 入手:2-5 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|44／0|6760.73／1432.83／621.44|weapon:WEAPON_001 Lv30 LB0 {"hp":0,"atk":132.32570028180783,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv30 LB0 {"hp":49.622137605677935,"atk":0,"def":43.00585259158754,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv30 LB0 {"hp":463.1399509863274,"atk":0,"def":13.232570028180783,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv30 LB0 {"hp":165.40712535225978,"atk":0,"def":39.697710084542344,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD009 岩断 LB3 SP50 first [{"type":"damage","power":137.76198730781485}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|44／0|6311.93／1549.83／556.93|weapon:WEAPON_001 Lv30 LB0 {"hp":0,"atk":132.32570028180783,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv30 LB0 {"hp":49.622137605677935,"atk":0,"def":43.00585259158754,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv30 LB0 {"hp":463.1399509863274,"atk":0,"def":13.232570028180783,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv30 LB0 {"hp":165.40712535225978,"atk":0,"def":39.697710084542344,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD039 応急手当 LB3 SP35 lowest_ally [{"type":"heal","power":41.660745240430565,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":359250,"eqExp":241600,"cash":534050,"skillMaterials":54,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_yuki_01":0,"char_daimon_01":0,"char_jihoon_01":0,"char_aoi_01":0},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":359250,"eqExp":241600,"cash":654050,"skillMaterials":174,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_daimon_01":0,"char_aoi_01":0,"char_jihoon_01":0,"char_yuki_01":0},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"cash","amount":28700},{"kind":"character_exp_item","id":"xlarge","amount":1},{"kind":"character_exp_item","id":"large","amount":2},{"kind":"character_exp_item","id":"medium","amount":4},{"kind":"character_exp_item","id":"small","amount":5}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":501550,"charExp":289850,"eqExp":223300,"skillMaterials":158,"genericR":0}。追加案なしのEXP/銭周回比較: {"stage":"5-2","successfulClears":559,"energy":3354,"recipeSource":"5-2-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ1〜1（各試行の最小値）、最大2107〜3847。1ダメージ1604/14720攻撃イベント。BURST1〜4回。SP獲得1009〜1912、技消費945〜1875、終了SP10〜109。
break-and-buff（元 100.0% (200/200)）の配置順だけ逆転: 74.5% (149/200)、83〜178行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD035","alternatives":[{"name":"armor-break","wins":200,"n":200},{"name":"defensive","wins":200,"n":200}]},{"skill":"SKD038","alternatives":[{"name":"counter-boost","wins":200,"n":200},{"name":"defensive","wins":200,"n":200},{"name":"double-rock","wins":200,"n":200},{"name":"area-boost","wins":5,"n":200},{"name":"attack-up-reversed","wins":0,"n":200}]},{"skill":"SKD010","alternatives":[{"name":"double-rock","wins":200,"n":200},{"name":"area-boost","wins":5,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"break-and-buff-replace-SKD009-SKD010","wins":200,"n":200},{"name":"area-boost","wins":5,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"defensive","wins":200,"n":200},{"name":"area-boost","wins":5,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
数値変更なし。

全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 5-3-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 5-3-validated.json.gz／5-3-sample-trace.json.gz。失敗した独立検証回は 5-3-validation-v1／round-*。

---

## 5-4 峰をゆく風
ID: kai-4。設計意図: 混成の強みを使う
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更0項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv46、覚醒0。N装備Lv30／LB0。技LB3。
到達経路: barrier／counter-boost／armor-break／double-rock／rear-focus-reversed／defensiveの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 障壁 100.0% (200/200)、77〜98行動。変更前の同編成: 100.0% (200/200)。別戦法: 反撃 100.0% (200/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|障壁 100.0% (200/200)|
|次点（60%前後）|該当なし|
|ギリギリ（30%前後）|該当なし|
|ほぼ厳しい（0%超〜10%）|該当なし|
|未勝利（観測0%）|該当なし|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|障壁 (barrier)|100.0% (200/200)・77〜98行動|char_joe_01:SKD045 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":9616,"SKD009":1374,"SKD007":4303,"SKD045":442,"SKD035":444,"SKD039":772}。未発動なし。敗北{"final_wave_defeated":200}|
|反撃 (counter-boost)|100.0% (200/200)・79〜98行動|char_joe_01:SKD049 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":9647,"SKD009":1568,"SKD007":4257,"SKD049":223,"SKD035":423,"SKD039":1068}。未発動なし。敗北{"final_wave_defeated":200}|
|防御低下 (armor-break)|100.0% (200/200)・76〜100行動|char_joe_01:SKD003 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":9225,"SKD009":1827,"SKD003":1889,"SKD007":3226,"SKD038":785,"SKD039":776}。未発動なし。敗北{"final_wave_defeated":200}|
|土属性集中＋攻撃強化 (double-rock)|100.0% (200/200)・80〜100行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":9413,"SKD009":5634,"SKD003":1825,"SKD039":852,"SKD035":165}。未発動なし。敗北{"final_wave_defeated":200}|
|攻防弱体・継続回復 (defensive)|100.0% (200/200)・84〜104行動|char_joe_01:SKD036 ／ char_yuki_01:SKD037 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":10658,"SKD009":1764,"SKD037":1737,"SKD036":367,"SKD007":3393,"SKD043":446}。未発動なし。敗北{"final_wave_defeated":200}|
|後列集中（逆順比較） (rear-focus-reversed)|94.0% (188/200)・88〜138行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD027 ／ char_daimon_01:SKD026 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":10523,"SKD003":6627,"SKD027":2024,"SKD026":2297,"SKD039":478,"SKD035":188}。未発動なし。敗北{"final_wave_defeated":188,"party_defeated":12}|
|障壁・配置13542 (barrier-order-13542)|100.0% (200/200)・75〜107行動|char_joe_01:SKD045 ／ char_daimon_01:SKD007 ／ char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_yuki_01:SKD035|前面までの確定供給案・育成予算内。{"basic":10129,"SKD009":2637,"SKD007":3105,"SKD045":1029,"SKD039":967,"SKD035":113}。未発動なし。敗北{"final_wave_defeated":200}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|46／0|8388.81／1141.13／753.87|weapon:WEAPON_001 Lv30 LB0 {"hp":0,"atk":132.32570028180783,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv30 LB0 {"hp":49.622137605677935,"atk":0,"def":43.00585259158754,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv30 LB0 {"hp":463.1399509863274,"atk":0,"def":13.232570028180783,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv30 LB0 {"hp":165.40712535225978,"atk":0,"def":39.697710084542344,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD045 護身障壁 LB3 SP55 self [{"type":"shield","power":61.10124206738428,"duration":3,"carryAcrossWaves":true}] 入手:5-1 追加提案・前面初回確定|
|2|竹中半兵衛 (char_yuki_01)|46／0|8782.21／1120.33／735.07|weapon:WEAPON_001 Lv30 LB0 {"hp":0,"atk":132.32570028180783,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv30 LB0 {"hp":49.622137605677935,"atk":0,"def":43.00585259158754,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv30 LB0 {"hp":463.1399509863274,"atk":0,"def":13.232570028180783,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv30 LB0 {"hp":165.40712535225978,"atk":0,"def":39.697710084542344,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD035 鬨の声 LB3 SP75 all_allies [{"type":"atk_up","power":9.554173889433798,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|3|井伊直政 (char_daimon_01)|46／0|6073.37／1764.33／587.58|weapon:WEAPON_001 Lv30 LB0 {"hp":0,"atk":132.32570028180783,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv30 LB0 {"hp":49.622137605677935,"atk":0,"def":43.00585259158754,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv30 LB0 {"hp":463.1399509863274,"atk":0,"def":13.232570028180783,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv30 LB0 {"hp":165.40712535225978,"atk":0,"def":39.697710084542344,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD007 炎断 LB3 SP50 first [{"type":"damage","power":137.76198730781485}] 入手:4-1 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|46／0|7152.41／1519.53／661.32|weapon:WEAPON_001 Lv30 LB0 {"hp":0,"atk":132.32570028180783,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv30 LB0 {"hp":49.622137605677935,"atk":0,"def":43.00585259158754,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv30 LB0 {"hp":463.1399509863274,"atk":0,"def":13.232570028180783,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv30 LB0 {"hp":165.40712535225978,"atk":0,"def":39.697710084542344,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD009 岩断 LB3 SP50 first [{"type":"damage","power":137.76198730781485}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|46／0|6674.71／1644.33／591.91|weapon:WEAPON_001 Lv30 LB0 {"hp":0,"atk":132.32570028180783,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv30 LB0 {"hp":49.622137605677935,"atk":0,"def":43.00585259158754,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv30 LB0 {"hp":463.1399509863274,"atk":0,"def":13.232570028180783,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv30 LB0 {"hp":165.40712535225978,"atk":0,"def":39.697710084542344,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD039 応急手当 LB3 SP35 lowest_ally [{"type":"heal","power":41.660745240430565,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":397050,"eqExp":241600,"cash":571850,"skillMaterials":54,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_yuki_01":0,"char_daimon_01":0,"char_jihoon_01":0,"char_aoi_01":0},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":397050,"eqExp":241600,"cash":709850,"skillMaterials":192,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_daimon_01":0,"char_aoi_01":0,"char_jihoon_01":0,"char_yuki_01":0},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"cash","amount":48800},{"kind":"character_exp_item","id":"xlarge","amount":1},{"kind":"character_exp_item","id":"large","amount":3},{"kind":"character_exp_item","id":"medium","amount":1},{"kind":"character_exp_item","id":"small","amount":6},{"kind":"skill_material","amount":18}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":550350,"charExp":326450,"eqExp":222400,"skillMaterials":176,"genericR":0}。追加案なしのEXP/銭周回比較: {"stage":"5-3","successfulClears":556,"energy":3336,"recipeSource":"5-3-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ26〜143（各試行の最小値）、最大3011〜3880。1ダメージ0/15293攻撃イベント。BURST1〜4回。SP獲得999〜1674、技消費945〜1600、終了SP10〜110。
barrier（元 100.0% (200/200)）の配置順だけ逆転: 100.0% (200/200)、83〜124行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD045","alternatives":[{"name":"counter-boost","wins":200,"n":200},{"name":"armor-break","wins":200,"n":200},{"name":"double-rock","wins":200,"n":200},{"name":"defensive","wins":200,"n":200},{"name":"rear-focus-reversed","wins":188,"n":200}]},{"skill":"SKD035","alternatives":[{"name":"armor-break","wins":200,"n":200},{"name":"defensive","wins":200,"n":200}]},{"skill":"SKD007","alternatives":[{"name":"double-rock","wins":200,"n":200},{"name":"rear-focus-reversed","wins":188,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"rear-focus-reversed","wins":188,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"defensive","wins":200,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
数値変更なし。

全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 5-4-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 5-4-validated.json.gz／5-4-sample-trace.json.gz。失敗した独立検証回は 5-4-validation-v1／round-*。

---

## 5-5 夕立の山路
ID: kai-5。設計意図: 苦手属性を誰が受けるか
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更0項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv48、覚醒0。N装備Lv30／LB0。技LB3。
到達経路: counter-boost／barrier／all-attack／rear-focusの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 反撃 100.0% (200/200)、54〜73行動。変更前の同編成: 100.0% (200/200)。別戦法: 障壁 100.0% (200/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|反撃 100.0% (200/200)|
|次点（60%前後）|該当なし|
|ギリギリ（30%前後）|該当なし|
|ほぼ厳しい（0%超〜10%）|該当なし|
|未勝利（観測0%）|該当なし|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|障壁 (barrier)|100.0% (200/200)・56〜74行動|char_joe_01:SKD045 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD012 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":7540,"SKD009":857,"SKD012":3061,"SKD045":503,"SKD039":429,"SKD035":433}。未発動なし。敗北{"final_wave_defeated":200}|
|反撃 (counter-boost)|100.0% (200/200)・54〜73行動|char_joe_01:SKD049 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD012 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":7400,"SKD009":1070,"SKD012":2937,"SKD049":203,"SKD035":412,"SKD039":644}。未発動なし。敗北{"final_wave_defeated":200}|
|防御低下 (armor-break)|100.0% (200/200)・57〜77行動|char_joe_01:SKD003 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD012 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":7042,"SKD009":1209,"SKD003":1505,"SKD012":2535,"SKD038":399,"SKD039":512}。未発動なし。敗北{"final_wave_defeated":200}|
|後列集中 (rear-focus)|100.0% (200/200)・68〜83行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD026 ／ char_jihoon_01:SKD027 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":7864,"SKD027":2025,"SKD003":1302,"SKD026":2787,"SKD039":816,"SKD035":20}。未発動なし。敗北{"final_wave_defeated":200}|
|攻防弱体・継続回復 (defensive)|100.0% (200/200)・64〜82行動|char_joe_01:SKD036 ／ char_yuki_01:SKD037 ／ char_daimon_01:SKD012 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":8284,"SKD009":1367,"SKD037":1227,"SKD043":367,"SKD012":2555,"SKD036":288}。未発動なし。敗北{"final_wave_defeated":200}|
|攻撃のみ比較 (all-attack)|100.0% (200/200)・54〜62行動|char_joe_01:SKD012 ／ char_yuki_01:SKD012 ／ char_daimon_01:SKD012 ／ char_jihoon_01:SKD012 ／ char_aoi_01:SKD012|前面までの確定供給案・育成予算内。{"basic":6680,"SKD012":4946}。未発動なし。敗北{"final_wave_defeated":200}|
|反撃・配置13542 (counter-boost-order-13542)|100.0% (200/200)・60〜78行動|char_joe_01:SKD049 ／ char_daimon_01:SKD012 ／ char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_yuki_01:SKD035|前面までの確定供給案・育成予算内。{"basic":7865,"SKD009":1996,"SKD012":2354,"SKD049":361,"SKD035":122,"SKD039":892}。未発動なし。敗北{"final_wave_defeated":200}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|48／0|8855.29／1204.18／800.28|weapon:WEAPON_001 Lv30 LB0 {"hp":0,"atk":132.32570028180783,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv30 LB0 {"hp":49.622137605677935,"atk":0,"def":43.00585259158754,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv30 LB0 {"hp":463.1399509863274,"atk":0,"def":13.232570028180783,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv30 LB0 {"hp":165.40712535225978,"atk":0,"def":39.697710084542344,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD049 返し刃 LB3 SP65 self [{"type":"counter","power":52.770869447169,"duration":3,"carryAcrossWaves":true}] 入手:3-5 追加提案・前面初回確定|
|2|竹中半兵衛 (char_yuki_01)|48／0|9272.49／1182.08／780.15|weapon:WEAPON_001 Lv30 LB0 {"hp":0,"atk":132.32570028180783,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv30 LB0 {"hp":49.622137605677935,"atk":0,"def":43.00585259158754,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv30 LB0 {"hp":463.1399509863274,"atk":0,"def":13.232570028180783,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv30 LB0 {"hp":165.40712535225978,"atk":0,"def":39.697710084542344,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD035 鬨の声 LB3 SP75 all_allies [{"type":"atk_up","power":9.554173889433798,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|3|井伊直政 (char_daimon_01)|48／0|6399.77／1866.33／622.26|weapon:WEAPON_001 Lv30 LB0 {"hp":0,"atk":132.32570028180783,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv30 LB0 {"hp":49.622137605677935,"atk":0,"def":43.00585259158754,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv30 LB0 {"hp":463.1399509863274,"atk":0,"def":13.232570028180783,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv30 LB0 {"hp":165.40712535225978,"atk":0,"def":39.697710084542344,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD012 影断 LB3 SP50 first [{"type":"damage","power":137.76198730781485}] 入手:5-4 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|48／0|7544.09／1606.23／701.20|weapon:WEAPON_001 Lv30 LB0 {"hp":0,"atk":132.32570028180783,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv30 LB0 {"hp":49.622137605677935,"atk":0,"def":43.00585259158754,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv30 LB0 {"hp":463.1399509863274,"atk":0,"def":13.232570028180783,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv30 LB0 {"hp":165.40712535225978,"atk":0,"def":39.697710084542344,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD009 岩断 LB3 SP50 first [{"type":"damage","power":137.76198730781485}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|48／0|7037.49／1738.83／626.90|weapon:WEAPON_001 Lv30 LB0 {"hp":0,"atk":132.32570028180783,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv30 LB0 {"hp":49.622137605677935,"atk":0,"def":43.00585259158754,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv30 LB0 {"hp":463.1399509863274,"atk":0,"def":13.232570028180783,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv30 LB0 {"hp":165.40712535225978,"atk":0,"def":39.697710084542344,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD039 応急手当 LB3 SP35 lowest_ally [{"type":"heal","power":41.660745240430565,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":436900,"eqExp":241600,"cash":611700,"skillMaterials":54,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_yuki_01":0,"char_daimon_01":0,"char_jihoon_01":0,"char_aoi_01":0},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":436900,"eqExp":241600,"cash":761700,"skillMaterials":204,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_daimon_01":0,"char_aoi_01":0,"char_jihoon_01":0,"char_yuki_01":0},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"skill","id":"SKD012","amount":1},{"kind":"cash","amount":44850},{"kind":"character_exp_item","id":"xlarge","amount":1},{"kind":"character_exp_item","id":"large","amount":3},{"kind":"character_exp_item","id":"medium","amount":3},{"kind":"character_exp_item","id":"small","amount":6},{"kind":"skill_material","amount":12}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":595200,"charExp":365100,"eqExp":221500,"skillMaterials":188,"genericR":0}。追加案なしのEXP/銭周回比較: {"stage":"5-4","successfulClears":554,"energy":3324,"recipeSource":"5-4-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ478〜647（各試行の最小値）、最大3513〜4146。1ダメージ0/11407攻撃イベント。BURST0〜3回。SP獲得749〜1248、技消費710〜1230、終了SP10〜81。
barrier（元 100.0% (200/200)）の配置順だけ逆転: 100.0% (200/200)、63〜99行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD049","alternatives":[{"name":"all-attack","wins":200,"n":200},{"name":"barrier","wins":200,"n":200},{"name":"armor-break","wins":200,"n":200},{"name":"defensive","wins":200,"n":200},{"name":"rear-focus","wins":200,"n":200}]},{"skill":"SKD035","alternatives":[{"name":"all-attack","wins":200,"n":200},{"name":"armor-break","wins":200,"n":200},{"name":"defensive","wins":200,"n":200}]},{"skill":"SKD012","alternatives":[{"name":"rear-focus","wins":200,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"all-attack","wins":200,"n":200},{"name":"rear-focus","wins":200,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"all-attack","wins":200,"n":200},{"name":"defensive","wins":200,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
数値変更なし。

全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 5-5-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 5-5-validated.json.gz／5-5-sample-trace.json.gz。失敗した独立検証回は 5-5-validation-v1／round-*。

---

## 5-6 甲斐の遠雷
ID: kai-6。設計意図: 一色に寄せすぎない
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更0項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv50、覚醒0。N装備Lv30／LB0。技LB3。
到達経路: attack-up／armor-break／break-and-buff／attack-up-replace-SKD009-SKD010／defensiveの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 攻撃強化 100.0% (200/200)、107〜134行動。変更前の同編成: 100.0% (200/200)。別戦法: 防御低下 100.0% (200/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|攻撃強化 100.0% (200/200)|
|次点（60%前後）|攻撃強化（逆順比較） 51.5% (103/200)|
|ギリギリ（30%前後）|後列集中（逆順比較） 33.0% (66/200)|
|ほぼ厳しい（0%超〜10%）|攻撃強化・配置53421 9.0% (18/200)|
|未勝利（観測0%）|該当なし|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|防御低下＋攻撃強化 (break-and-buff)|100.0% (200/200)・101〜149行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":12718,"SKD009":7626,"SKD038":1533,"SKD035":283,"SKD039":1486}。未発動なし。敗北{"final_wave_defeated":200}|
|攻撃強化 (attack-up)|100.0% (200/200)・107〜134行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":12061,"SKD009":7500,"SKD003":2204,"SKD039":1174,"SKD035":454}。未発動なし。敗北{"final_wave_defeated":200}|
|防御低下 (armor-break)|100.0% (200/200)・106〜135行動|char_joe_01:SKD003 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":12014,"SKD009":7048,"SKD003":2133,"SKD038":943,"SKD039":1385}。未発動なし。敗北{"final_wave_defeated":200}|
|攻防弱体・継続回復 (defensive)|100.0% (200/200)・106〜143行動|char_joe_01:SKD036 ／ char_yuki_01:SKD037 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":13634,"SKD009":8317,"SKD037":1710,"SKD043":578,"SKD036":319}。未発動なし。敗北{"final_wave_defeated":200}|
|攻撃強化（逆順比較） (attack-up-reversed)|51.5% (103/200)・125〜251行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD009 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":17822,"SKD003":17376,"SKD009":5572,"SKD039":513,"SKD035":745}。未発動なし。敗北{"final_wave_defeated":103,"party_defeated":97}|
|後列集中（逆順比較） (rear-focus-reversed)|33.0% (66/200)・161〜242行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD027 ／ char_daimon_01:SKD026 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":18541,"SKD003":19039,"SKD027":2495,"SKD026":3132,"SKD039":134,"SKD035":835}。未発動なし。敗北{"final_wave_defeated":66,"party_defeated":134}|
|攻撃強化・SKD009-SKD010置換 (attack-up-replace-SKD009-SKD010)|100.0% (200/200)・104〜134行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD010 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":11653,"SKD010":7313,"SKD003":2403,"SKD039":1342,"SKD035":296}。未発動なし。敗北{"final_wave_defeated":200}|
|攻撃強化・配置53421 (attack-up-order-53421)|9.0% (18/200)・175〜250行動|char_aoi_01:SKD039 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":17815,"SKD003":19586,"SKD009":4694,"SKD039":239,"SKD035":806}。未発動なし。敗北{"party_defeated":182,"final_wave_defeated":18}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|50／0|9321.77／1267.23／846.69|weapon:WEAPON_001 Lv30 LB0 {"hp":0,"atk":132.32570028180783,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv30 LB0 {"hp":49.622137605677935,"atk":0,"def":43.00585259158754,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv30 LB0 {"hp":463.1399509863274,"atk":0,"def":13.232570028180783,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv30 LB0 {"hp":165.40712535225978,"atk":0,"def":39.697710084542344,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD003 土割り LB3 SP25 first [{"type":"damage","power":114.99111786064586}] 入手:チュートリアル確定|
|2|竹中半兵衛 (char_yuki_01)|50／0|9762.77／1243.83／825.24|weapon:WEAPON_001 Lv30 LB0 {"hp":0,"atk":132.32570028180783,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv30 LB0 {"hp":49.622137605677935,"atk":0,"def":43.00585259158754,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv30 LB0 {"hp":463.1399509863274,"atk":0,"def":13.232570028180783,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv30 LB0 {"hp":165.40712535225978,"atk":0,"def":39.697710084542344,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD035 鬨の声 LB3 SP75 all_allies [{"type":"atk_up","power":9.554173889433798,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|3|井伊直政 (char_daimon_01)|50／0|6726.17／1968.33／656.94|weapon:WEAPON_001 Lv30 LB0 {"hp":0,"atk":132.32570028180783,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv30 LB0 {"hp":49.622137605677935,"atk":0,"def":43.00585259158754,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv30 LB0 {"hp":463.1399509863274,"atk":0,"def":13.232570028180783,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv30 LB0 {"hp":165.40712535225978,"atk":0,"def":39.697710084542344,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD009 岩断 LB3 SP50 first [{"type":"damage","power":137.76198730781485}] 入手:1-2 現行初回/任務確定|
|4|前田利家 (char_jihoon_01)|50／0|7935.77／1692.93／741.09|weapon:WEAPON_001 Lv30 LB0 {"hp":0,"atk":132.32570028180783,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv30 LB0 {"hp":49.622137605677935,"atk":0,"def":43.00585259158754,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv30 LB0 {"hp":463.1399509863274,"atk":0,"def":13.232570028180783,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv30 LB0 {"hp":165.40712535225978,"atk":0,"def":39.697710084542344,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD009 岩断 LB3 SP50 first [{"type":"damage","power":137.76198730781485}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|50／0|7400.27／1833.33／661.89|weapon:WEAPON_001 Lv30 LB0 {"hp":0,"atk":132.32570028180783,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv30 LB0 {"hp":49.622137605677935,"atk":0,"def":43.00585259158754,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv30 LB0 {"hp":463.1399509863274,"atk":0,"def":13.232570028180783,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv30 LB0 {"hp":165.40712535225978,"atk":0,"def":39.697710084542344,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD039 応急手当 LB3 SP35 lowest_ally [{"type":"heal","power":41.660745240430565,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":478850,"eqExp":241600,"cash":635650,"skillMaterials":36,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_yuki_01":0,"char_daimon_01":0,"char_jihoon_01":0,"char_aoi_01":0},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":478850,"eqExp":241600,"cash":803650,"skillMaterials":204,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_daimon_01":0,"char_aoi_01":0,"char_jihoon_01":0,"char_yuki_01":0},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"cash","amount":34950},{"kind":"character_exp_item","id":"xlarge","amount":2},{"kind":"character_exp_item","id":"small","amount":8}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":630150,"charExp":405850,"eqExp":220600,"skillMaterials":188,"genericR":0}。追加案なしのEXP/銭周回比較: {"stage":"5-5","successfulClears":580,"energy":3480,"recipeSource":"5-5-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ1〜1（各試行の最小値）、最大3236〜3891。1ダメージ1074/21765攻撃イベント。BURST1〜7回。SP獲得1518〜2332、技消費1455〜2270、終了SP11〜94。
break-and-buff（元 100.0% (200/200)）の配置順だけ逆転: 100.0% (200/200)、106〜172行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD003","alternatives":[{"name":"break-and-buff","wins":200,"n":200},{"name":"defensive","wins":200,"n":200}]},{"skill":"SKD035","alternatives":[{"name":"armor-break","wins":200,"n":200},{"name":"defensive","wins":200,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"attack-up-replace-SKD009-SKD010","wins":200,"n":200},{"name":"rear-focus-reversed","wins":66,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"defensive","wins":200,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
数値変更なし。

全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 5-6-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 5-6-validated.json.gz／5-6-sample-trace.json.gz。失敗した独立検証回は 5-6-validation-v1／round-*。

---

## 6-1 霧深き境
ID: echigo-1。設計意図: 継続被害を止める
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更3項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv50、覚醒0。N装備Lv40／LB0。技LB3。
到達経路: burst-focus-greater-heal／cleanse-dot／double-rock／all-cheapの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: SP供給＋大回復 100.0% (200/200)、76〜105行動。変更前の同編成: 0.0% (0/200)。別戦法: 継続被害解除 100.0% (200/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|SP供給＋大回復 100.0% (200/200)|
|次点（60%前後）|SP供給＋大回復・配置52314 53.0% (106/200)|
|ギリギリ（30%前後）|全体攻撃 31.5% (63/200)|
|ほぼ厳しい（0%超〜10%）|該当なし|
|未勝利（観測0%）|攻撃強化（逆順比較） 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|SP供給＋大回復 (burst-focus-greater-heal)|100.0% (200/200)・76〜105行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD011 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD040|前面までの確定供給案・育成予算内。{"basic":11783,"SKD009":3359,"SKD011":2612,"SKD040":551}。未発動なし。敗北{"final_wave_defeated":200}|
|継続被害解除 (cleanse-dot)|100.0% (200/200)・83〜122行動|char_joe_01:SKD054 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD011 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":10316,"SKD009":3792,"SKD054":200,"SKD011":3268,"SKD039":2016,"SKD035":148}。未発動なし。敗北{"final_wave_defeated":200}|
|土属性集中＋攻撃強化（中心技の発動が半数未満・比較用） (double-rock)|100.0% (200/200)・85〜132行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":10444,"SKD009":6939,"SKD003":216,"SKD039":2647,"SKD035":65}。未発動なし。敗北{"final_wave_defeated":200}|
|低消費攻撃のみ比較 (all-cheap)|85.0% (170/200)・81〜97行動|char_joe_01:SKD003 ／ char_yuki_01:SKD003 ／ char_daimon_01:SKD003 ／ char_jihoon_01:SKD003 ／ char_aoi_01:SKD003|前面までの確定供給案・育成予算内。{"basic":6241,"SKD003":12106}。未発動なし。敗北{"final_wave_defeated":170,"party_defeated":30}|
|全体攻撃 (area-boost)|31.5% (63/200)・82〜127行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD023 ／ char_jihoon_01:SKD019 ／ char_aoi_01:SKD041|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":14315,"SKD003":349,"SKD035":457,"SKD023":1716,"SKD019":2449,"SKD041":1799}。未発動なし。敗北{"final_wave_defeated":63,"party_defeated":137}|
|攻撃強化（逆順比較） (attack-up-reversed)|0.0% (0/200)・90〜112行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD011 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":8200,"SKD003":9297,"SKD009":705,"SKD011":783,"SKD035":469,"SKD039":75}。未発動なし。敗北{"party_defeated":200}|
|SP供給＋大回復・配置52314 (burst-focus-greater-heal-order-52314)|53.0% (106/200)・79〜97行動|char_aoi_01:SKD040 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD011 ／ char_joe_01:技なし・通常攻撃でSP供給 ／ char_jihoon_01:SKD009|前面までの確定供給案・育成予算内。{"basic":9369,"SKD009":6619,"SKD011":1581}。未発動SKD040。敗北{"party_defeated":94,"final_wave_defeated":106}|
|SP供給＋大回復・配置35241 (burst-focus-greater-heal-order-35241)|20.0% (40/200)・82〜121行動|char_daimon_01:SKD011 ／ char_aoi_01:SKD040 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_jihoon_01:SKD009 ／ char_joe_01:技なし・通常攻撃でSP供給|前面までの確定供給案・育成予算内。{"basic":12978,"SKD009":6030,"SKD040":90}。未発動SKD011。敗北{"final_wave_defeated":40,"party_defeated":158,"mutual_annihilation":2}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|50／0|9639.30／1329.18／891.60|weapon:WEAPON_001 Lv40 LB0 {"hp":0,"atk":194.28250868402813,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv40 LB0 {"hp":72.85594075651055,"atk":0,"def":63.14181532230914,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv40 LB0 {"hp":679.9887803940985,"atk":0,"def":19.428250868402813,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv40 LB0 {"hp":242.85313585503516,"atk":0,"def":58.28475260520844,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|技なし|
|2|竹中半兵衛 (char_yuki_01)|50／0|10080.30／1305.78／870.15|weapon:WEAPON_001 Lv40 LB0 {"hp":0,"atk":194.28250868402813,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv40 LB0 {"hp":72.85594075651055,"atk":0,"def":63.14181532230914,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv40 LB0 {"hp":679.9887803940985,"atk":0,"def":19.428250868402813,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv40 LB0 {"hp":242.85313585503516,"atk":0,"def":58.28475260520844,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|技なし|
|3|井伊直政 (char_daimon_01)|50／0|7043.70／2030.28／701.85|weapon:WEAPON_001 Lv40 LB0 {"hp":0,"atk":194.28250868402813,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv40 LB0 {"hp":72.85594075651055,"atk":0,"def":63.14181532230914,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv40 LB0 {"hp":679.9887803940985,"atk":0,"def":19.428250868402813,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv40 LB0 {"hp":242.85313585503516,"atk":0,"def":58.28475260520844,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD011 光断 LB3 SP50 first [{"type":"damage","power":137.76198730781485}] 入手:5-6 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|50／0|8253.30／1754.88／786.00|weapon:WEAPON_001 Lv40 LB0 {"hp":0,"atk":194.28250868402813,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv40 LB0 {"hp":72.85594075651055,"atk":0,"def":63.14181532230914,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv40 LB0 {"hp":679.9887803940985,"atk":0,"def":19.428250868402813,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv40 LB0 {"hp":242.85313585503516,"atk":0,"def":58.28475260520844,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD009 岩断 LB3 SP50 first [{"type":"damage","power":137.76198730781485}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|50／0|7717.80／1895.28／706.80|weapon:WEAPON_001 Lv40 LB0 {"hp":0,"atk":194.28250868402813,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv40 LB0 {"hp":72.85594075651055,"atk":0,"def":63.14181532230914,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv40 LB0 {"hp":679.9887803940985,"atk":0,"def":19.428250868402813,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv40 LB0 {"hp":242.85313585503516,"atk":0,"def":58.28475260520844,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD040 治癒の祈り LB3 SP90 lowest_ally [{"type":"heal","power":91.65186310107642,"healingFormula":"caster_atk_percent"}] 入手:2-5 追加提案・前面初回確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":478850,"eqExp":463800,"cash":758750,"skillMaterials":48,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_yuki_01":0,"char_daimon_01":0,"char_jihoon_01":0,"char_aoi_01":0},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":478850,"eqExp":463800,"cash":950750,"skillMaterials":240,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":0,"char_daimon_01":0,"char_aoi_01":0,"char_jihoon_01":0,"char_yuki_01":0},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"skill","id":"SKD011","amount":1},{"kind":"skill","id":"SKD054","amount":1},{"kind":"cash","amount":140100},{"kind":"equipment_exp_item","id":"xlarge","amount":10},{"kind":"equipment_exp_item","id":"large","amount":3},{"kind":"equipment_exp_item","id":"medium","amount":1},{"kind":"equipment_exp_item","id":"small","amount":8},{"kind":"skill_material","amount":36}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":770250,"charExp":404650,"eqExp":441900,"skillMaterials":224,"genericR":0}。追加案なしのEXP/銭周回比較: {"stage":"5-6","successfulClears":1105,"energy":6630,"recipeSource":"5-6-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ653〜781（各試行の最小値）、最大3407〜4146。1ダメージ0/17754攻撃イベント。BURST0〜4回。SP獲得1023〜1979、技消費850〜1640、終了SP56〜400。
burst-focus-greater-heal（元 100.0% (200/200)）の配置順だけ逆転: 0.0% (0/200)、87〜104行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD011","alternatives":[{"name":"double-rock","wins":200,"n":200},{"name":"all-cheap","wins":170,"n":200},{"name":"area-boost","wins":63,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"all-cheap","wins":170,"n":200},{"name":"area-boost","wins":63,"n":200}]},{"skill":"SKD040","alternatives":[{"name":"cleanse-dot","wins":200,"n":200},{"name":"double-rock","wins":200,"n":200},{"name":"all-cheap","wins":170,"n":200},{"name":"area-boost","wins":63,"n":200},{"name":"attack-up-reversed","wins":0,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
|2/1 長宗我部元親 (6-1/2/1)|atk|8910→6438|到達耐久で役割を維持できない主な攻撃源を調整|
|3/1 服部半蔵 (6-1/3/1)|atk|8910→2064|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|3/2 片倉景綱 (6-1/3/2)|atk|1650→1403|到達耐久で役割を維持できない主な攻撃源を調整|


全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 6-1-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 6-1-validated.json.gz／6-1-sample-trace.json.gz。失敗した独立検証回は 6-1-validation-v1／round-*。

---

## 6-2 雪解けの道
ID: echigo-2。設計意図: 落とされた能力を戻す
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更10項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv52、覚醒1。N装備Lv40／LB0。技LB3。
到達経路: break-and-buff／taunt-counter／break-and-buff-replace-SKD035-SKD038／break-and-buff-replace-SKD011-SKD009／break-and-buff-replace-SKD009-SKD008／break-and-buff-replace-SKD039-SKD040の切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 防御低下＋攻撃強化 100.0% (200/200)、153〜267行動。変更前の同編成: 0.0% (0/200)。別戦法: 挑発・反撃 78.0% (156/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|防御低下＋攻撃強化 100.0% (200/200)|
|次点（60%前後）|防御低下＋攻撃強化・配置31425 64.5% (129/200)|
|ギリギリ（30%前後）|土属性集中＋攻撃強化 25.5% (51/200)|
|ほぼ厳しい（0%超〜10%）|防御低下＋攻撃強化・配置35214 8.5% (17/200)|
|未勝利（観測0%）|攻撃強化（逆順比較） 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|防御低下＋攻撃強化 (break-and-buff)|100.0% (200/200)・153〜267行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD011 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":22094,"SKD009":3856,"SKD038":3737,"SKD035":1246,"SKD011":7672,"SKD039":2006}。未発動なし。敗北{"final_wave_defeated":200}|
|継続被害解除（中心技の発動が半数未満・比較用） (cleanse-dot)|100.0% (200/200)・196〜300行動|char_joe_01:SKD054 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD011 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":27050,"SKD009":4520,"SKD011":12104,"SKD035":2724,"SKD039":2296}。未発動SKD054。敗北{"final_wave_defeated":200}|
|攻防弱体・継続回復 (defensive)|16.5% (33/200)・227〜300行動|char_joe_01:SKD036 ／ char_yuki_01:SKD037 ／ char_daimon_01:SKD011 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":32983,"SKD009":7030,"SKD037":5684,"SKD036":1676,"SKD043":1243,"SKD011":10831}。未発動なし。敗北{"action_limit":167,"final_wave_defeated":33}|
|土属性集中＋攻撃強化 (double-rock)|25.5% (51/200)・239〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":28466,"SKD009":17251,"SKD003":8577,"SKD035":801,"SKD039":3685}。未発動なし。敗北{"action_limit":149,"final_wave_defeated":51}|
|挑発・反撃 (taunt-counter)|78.0% (156/200)・204〜300行動|char_joe_01:SKD049→SKD048 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD011 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":29561,"SKD009":4363,"SKD048":1996,"SKD011":13648,"SKD049":1536,"SKD035":1069,"SKD039":2675}。未発動なし。敗北{"final_wave_defeated":156,"action_limit":44}|
|別属性比較 (poor-element)|13.0% (26/200)・244〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD012 ／ char_jihoon_01:SKD012 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":28525,"SKD012":17271,"SKD003":9176,"SKD035":613,"SKD039":3877}。未発動なし。敗北{"action_limit":174,"final_wave_defeated":26}|
|攻撃強化（逆順比較） (attack-up-reversed)|0.0% (0/200)・300〜300行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD011 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":26305,"SKD003":20087,"SKD009":3914,"SKD011":6691,"SKD039":2130,"SKD035":873}。未発動なし。敗北{"action_limit":200}|
|防御低下＋攻撃強化・SKD035-SKD038置換 (break-and-buff-replace-SKD035-SKD038)|100.0% (200/200)・153〜263行動|char_joe_01:SKD038 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD011 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":21414,"SKD009":3255,"SKD038":4010,"SKD011":9402,"SKD039":1959}。未発動なし。敗北{"final_wave_defeated":200}|
|防御低下＋攻撃強化・SKD011-SKD009置換 (break-and-buff-replace-SKD011-SKD009)|100.0% (200/200)・141〜270行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":21627,"SKD009":11500,"SKD038":3666,"SKD039":2173,"SKD035":1106}。未発動なし。敗北{"final_wave_defeated":200}|
|防御低下＋攻撃強化・SKD009-SKD008置換 (break-and-buff-replace-SKD009-SKD008)|100.0% (200/200)・149〜277行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD011 ／ char_jihoon_01:SKD008 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":22370,"SKD008":3844,"SKD038":3783,"SKD011":7683,"SKD035":1249,"SKD039":2083}。未発動なし。敗北{"final_wave_defeated":200}|
|防御低下＋攻撃強化・SKD039-SKD040置換 (break-and-buff-replace-SKD039-SKD040)|100.0% (200/200)・137〜236行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD011 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD040|前面までの確定供給案・育成予算内。{"basic":20613,"SKD009":5115,"SKD038":3653,"SKD011":6599,"SKD035":1056}。未発動SKD040。敗北{"final_wave_defeated":200}|
|防御低下＋攻撃強化・配置31425 (break-and-buff-order-31425)|64.5% (129/200)・211〜300行動|char_daimon_01:SKD011 ／ char_joe_01:SKD035 ／ char_jihoon_01:SKD009 ／ char_yuki_01:SKD038 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":29528,"SKD038":3173,"SKD009":14058,"SKD011":3393,"SKD039":3675,"SKD035":1829}。未発動なし。敗北{"final_wave_defeated":129,"action_limit":71}|
|防御低下＋攻撃強化・配置35214 (break-and-buff-order-35214)|8.5% (17/200)・269〜300行動|char_daimon_01:SKD011 ／ char_aoi_01:SKD039 ／ char_yuki_01:SKD038 ／ char_joe_01:SKD035 ／ char_jihoon_01:SKD009|前面までの確定供給案・育成予算内。{"basic":31569,"SKD009":18157,"SKD038":3863,"SKD011":586,"SKD039":4613,"SKD035":1010}。未発動なし。敗北{"action_limit":183,"final_wave_defeated":17}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|52／1|10188.10／1404.84／946.20|weapon:WEAPON_001 Lv40 LB0 {"hp":0,"atk":194.28250868402813,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv40 LB0 {"hp":72.85594075651055,"atk":0,"def":63.14181532230914,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv40 LB0 {"hp":679.9887803940985,"atk":0,"def":19.428250868402813,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv40 LB0 {"hp":242.85313585503516,"atk":0,"def":58.28475260520844,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD035 鬨の声 LB3 SP75 all_allies [{"type":"atk_up","power":9.554173889433798,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|2|竹中半兵衛 (char_yuki_01)|52／1|10657.10／1379.88／923.19|weapon:WEAPON_001 Lv40 LB0 {"hp":0,"atk":194.28250868402813,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv40 LB0 {"hp":72.85594075651055,"atk":0,"def":63.14181532230914,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv40 LB0 {"hp":679.9887803940985,"atk":0,"def":19.428250868402813,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv40 LB0 {"hp":242.85313585503516,"atk":0,"def":58.28475260520844,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD038 鎧砕き LB3 SP50 first [{"type":"def_down","power":14.886322937519912,"duration":3,"carryAcrossWaves":true}] 入手:2-5 追加提案・前面初回確定|
|3|井伊直政 (char_daimon_01)|52／1|7427.70／2152.68／742.65|weapon:WEAPON_001 Lv40 LB0 {"hp":0,"atk":194.28250868402813,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv40 LB0 {"hp":72.85594075651055,"atk":0,"def":63.14181532230914,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv40 LB0 {"hp":679.9887803940985,"atk":0,"def":19.428250868402813,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv40 LB0 {"hp":242.85313585503516,"atk":0,"def":58.28475260520844,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD011 光断 LB3 SP50 first [{"type":"damage","power":137.76198730781485}] 入手:5-6 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|52／1|8714.10／1858.92／832.92|weapon:WEAPON_001 Lv40 LB0 {"hp":0,"atk":194.28250868402813,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv40 LB0 {"hp":72.85594075651055,"atk":0,"def":63.14181532230914,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv40 LB0 {"hp":679.9887803940985,"atk":0,"def":19.428250868402813,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv40 LB0 {"hp":242.85313585503516,"atk":0,"def":58.28475260520844,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD009 岩断 LB3 SP50 first [{"type":"damage","power":137.76198730781485}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|52／1|8144.60／2008.68／747.96|weapon:WEAPON_001 Lv40 LB0 {"hp":0,"atk":194.28250868402813,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv40 LB0 {"hp":72.85594075651055,"atk":0,"def":63.14181532230914,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv40 LB0 {"hp":679.9887803940985,"atk":0,"def":19.428250868402813,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv40 LB0 {"hp":242.85313585503516,"atk":0,"def":58.28475260520844,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD039 応急手当 LB3 SP35 lowest_ally [{"type":"heal","power":41.660745240430565,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":522950,"eqExp":463800,"cash":888850,"skillMaterials":54,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":8,"char_yuki_01":8,"char_daimon_01":8,"char_jihoon_01":8,"char_aoi_01":8},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":522950,"eqExp":463800,"cash":1086850,"skillMaterials":252,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":8,"char_daimon_01":8,"char_aoi_01":8,"char_jihoon_01":8,"char_yuki_01":8},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"skill","id":"SKD048","amount":1},{"kind":"cash","amount":127600},{"kind":"character_exp_item","id":"xlarge","amount":2},{"kind":"character_exp_item","id":"medium","amount":1},{"kind":"character_exp_item","id":"small","amount":3},{"kind":"skill_material","amount":12},{"kind":"generic_soul","id":"R","amount":40}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":897850,"charExp":447150,"eqExp":440700,"skillMaterials":236,"genericR":40}。追加案なしのEXP/銭周回比較: {"stage":"6-1","successfulClears":735,"energy":4410,"recipeSource":"6-1-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ1〜1（各試行の最小値）、最大2374〜4640。1ダメージ13670/33622攻撃イベント。BURST4〜9回。SP獲得2178〜4444、技消費2130〜4345、終了SP11〜99。
break-and-buff（元 100.0% (200/200)）の配置順だけ逆転: 59.0% (118/200)、186〜300行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD035","alternatives":[{"name":"break-and-buff-replace-SKD035-SKD038","wins":200,"n":200},{"name":"defensive","wins":33,"n":200}]},{"skill":"SKD038","alternatives":[{"name":"cleanse-dot","wins":200,"n":200},{"name":"taunt-counter","wins":156,"n":200},{"name":"double-rock","wins":51,"n":200},{"name":"defensive","wins":33,"n":200},{"name":"poor-element","wins":26,"n":200},{"name":"attack-up-reversed","wins":0,"n":200}]},{"skill":"SKD011","alternatives":[{"name":"break-and-buff-replace-SKD011-SKD009","wins":200,"n":200},{"name":"double-rock","wins":51,"n":200},{"name":"poor-element","wins":26,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"break-and-buff-replace-SKD009-SKD008","wins":200,"n":200},{"name":"poor-element","wins":26,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"break-and-buff-replace-SKD039-SKD040","wins":200,"n":200},{"name":"defensive","wins":33,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
|1/1 黒田官兵衛 (6-2/1/1)|def|4390→2067|防御が到達火力を上回る敵のみ突破余地を確保／強化後DEF/実ダメージの停滞を確認した敵を局所調整|
|2/1 上杉景勝 (6-2/2/1)|def|4390→2067|防御が到達火力を上回る敵のみ突破余地を確保／強化後DEF/実ダメージの停滞を確認した敵を局所調整|
|2/2 柴田勝家 (6-2/2/2)|atk|1650→1193|全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|3/1 大友宗麟 (6-2/3/1)|hp|14630→11704|300行動に収まらない耐久負担を局所調整|
|3/1 大友宗麟 (6-2/3/1)|def|4390→1493|防御が到達火力を上回る敵のみ突破余地を確保／強化後DEF/実ダメージの停滞を確認した敵を局所調整|
|4/1 山本勘助 (6-2/4/1)|hp|14630→9363|300行動に収まらない耐久負担を局所調整|
|4/1 山本勘助 (6-2/4/1)|atk|2280→276|到達耐久で役割を維持できない主な攻撃源を調整|
|4/1 山本勘助 (6-2/4/1)|def|4390→2432|防御が到達火力を上回る敵のみ突破余地を確保|
|4/2 黒田官兵衛 (6-2/4/2)|hp|15000→9600|300行動に収まらない耐久負担を局所調整|
|4/2 黒田官兵衛 (6-2/4/2)|atk|2300→201|到達耐久で役割を維持できない主な攻撃源を調整|


全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 6-2-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 6-2-validated.json.gz／6-2-sample-trace.json.gz。失敗した独立検証回は 6-2-validation-v1／round-*。

---

## 6-3 杉林の分かれ道
ID: echigo-3。設計意図: 止まった役割を補う
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更0項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv54、覚醒1。N装備Lv40／LB0。技LB3。
到達経路: counter-boost／defensive／area-boostの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 反撃 100.0% (200/200)、49〜68行動。変更前の同編成: 100.0% (200/200)。別戦法: 攻防弱体・継続回復 100.0% (200/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|反撃 100.0% (200/200)|
|次点（60%前後）|該当なし|
|ギリギリ（30%前後）|該当なし|
|ほぼ厳しい（0%超〜10%）|該当なし|
|未勝利（観測0%）|該当なし|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|反撃 (counter-boost)|100.0% (200/200)・49〜68行動|char_joe_01:SKD049 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":6171,"SKD009":958,"SKD008":2744,"SKD035":252,"SKD049":224,"SKD039":618}。未発動なし。敗北{"final_wave_defeated":200}|
|継続被害解除（中心技の発動が半数未満・比較用） (cleanse-dot)|100.0% (200/200)・48〜69行動|char_joe_01:SKD054 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":6134,"SKD009":1172,"SKD008":2629,"SKD035":414,"SKD039":570}。未発動SKD054。敗北{"final_wave_defeated":200}|
|攻防弱体・継続回復 (defensive)|100.0% (200/200)・53〜83行動|char_joe_01:SKD036 ／ char_yuki_01:SKD037 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":7056,"SKD009":1319,"SKD037":1178,"SKD008":2185,"SKD043":203,"SKD036":328}。未発動なし。敗北{"final_wave_defeated":200}|
|全体攻撃 (area-boost)|100.0% (200/200)・54〜74行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD020 ／ char_jihoon_01:SKD019 ／ char_aoi_01:SKD041|前面までの確定供給案・育成予算内。{"basic":7208,"SKD003":1966,"SKD035":579,"SKD020":1753,"SKD019":1010}。未発動SKD041。敗北{"final_wave_defeated":200}|
|回復なし比較 (no-heal)|100.0% (200/200)・48〜64行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD008|前面までの確定供給案・育成予算内。{"basic":5388,"SKD009":749,"SKD003":1285,"SKD008":3083}。未発動SKD035。敗北{"final_wave_defeated":200}|
|反撃・配置13542 (counter-boost-order-13542)|100.0% (200/200)・50〜71行動|char_joe_01:SKD049 ／ char_daimon_01:SKD008 ／ char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_yuki_01:SKD035|前面までの確定供給案・育成予算内。{"basic":6335,"SKD009":1803,"SKD049":356,"SKD008":2319,"SKD039":787,"SKD035":35}。未発動なし。敗北{"final_wave_defeated":200}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|54／1|10736.90／1480.50／1000.80|weapon:WEAPON_001 Lv40 LB0 {"hp":0,"atk":194.28250868402813,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv40 LB0 {"hp":72.85594075651055,"atk":0,"def":63.14181532230914,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv40 LB0 {"hp":679.9887803940985,"atk":0,"def":19.428250868402813,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv40 LB0 {"hp":242.85313585503516,"atk":0,"def":58.28475260520844,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD049 返し刃 LB3 SP65 self [{"type":"counter","power":52.770869447169,"duration":3,"carryAcrossWaves":true}] 入手:3-5 追加提案・前面初回確定|
|2|竹中半兵衛 (char_yuki_01)|54／1|11233.90／1453.98／976.23|weapon:WEAPON_001 Lv40 LB0 {"hp":0,"atk":194.28250868402813,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv40 LB0 {"hp":72.85594075651055,"atk":0,"def":63.14181532230914,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv40 LB0 {"hp":679.9887803940985,"atk":0,"def":19.428250868402813,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv40 LB0 {"hp":242.85313585503516,"atk":0,"def":58.28475260520844,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD035 鬨の声 LB3 SP75 all_allies [{"type":"atk_up","power":9.554173889433798,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|3|井伊直政 (char_daimon_01)|54／1|7811.70／2275.08／783.45|weapon:WEAPON_001 Lv40 LB0 {"hp":0,"atk":194.28250868402813,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv40 LB0 {"hp":72.85594075651055,"atk":0,"def":63.14181532230914,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv40 LB0 {"hp":679.9887803940985,"atk":0,"def":19.428250868402813,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv40 LB0 {"hp":242.85313585503516,"atk":0,"def":58.28475260520844,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD008 水断 LB3 SP50 first [{"type":"damage","power":137.76198730781485}] 入手:4-5 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|54／1|9174.90／1962.96／879.84|weapon:WEAPON_001 Lv40 LB0 {"hp":0,"atk":194.28250868402813,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv40 LB0 {"hp":72.85594075651055,"atk":0,"def":63.14181532230914,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv40 LB0 {"hp":679.9887803940985,"atk":0,"def":19.428250868402813,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv40 LB0 {"hp":242.85313585503516,"atk":0,"def":58.28475260520844,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD009 岩断 LB3 SP50 first [{"type":"damage","power":137.76198730781485}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|54／1|8571.40／2122.08／789.12|weapon:WEAPON_001 Lv40 LB0 {"hp":0,"atk":194.28250868402813,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv40 LB0 {"hp":72.85594075651055,"atk":0,"def":63.14181532230914,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv40 LB0 {"hp":679.9887803940985,"atk":0,"def":19.428250868402813,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv40 LB0 {"hp":242.85313585503516,"atk":0,"def":58.28475260520844,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD039 応急手当 LB3 SP35 lowest_ally [{"type":"heal","power":41.660745240430565,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":569100,"eqExp":463800,"cash":935000,"skillMaterials":54,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":8,"char_yuki_01":8,"char_daimon_01":8,"char_jihoon_01":8,"char_aoi_01":8},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":569100,"eqExp":463800,"cash":1157000,"skillMaterials":276,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":8,"char_daimon_01":8,"char_aoi_01":8,"char_jihoon_01":8,"char_yuki_01":8},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"skill","id":"SKD020","amount":1},{"kind":"cash","amount":61650},{"kind":"character_exp_item","id":"xlarge","amount":2},{"kind":"character_exp_item","id":"medium","amount":4},{"kind":"character_exp_item","id":"small","amount":5},{"kind":"skill_material","amount":24}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":959500,"charExp":491700,"eqExp":439500,"skillMaterials":260,"genericR":40}。追加案なしのEXP/銭周回比較: {"stage":"6-2","successfulClears":733,"energy":4398,"recipeSource":"6-2-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ678〜843（各試行の最小値）、最大3954〜4722。1ダメージ0/9873攻撃イベント。BURST0〜3回。SP獲得682〜1210、技消費595〜1190、終了SP12〜94。
counter-boost（元 100.0% (200/200)）の配置順だけ逆転: 100.0% (200/200)、54〜73行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD049","alternatives":[{"name":"no-heal","wins":200,"n":200},{"name":"cleanse-dot","wins":200,"n":200},{"name":"defensive","wins":200,"n":200},{"name":"area-boost","wins":200,"n":200}]},{"skill":"SKD035","alternatives":[{"name":"defensive","wins":200,"n":200}]},{"skill":"SKD008","alternatives":[{"name":"area-boost","wins":200,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"area-boost","wins":200,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"no-heal","wins":200,"n":200},{"name":"defensive","wins":200,"n":200},{"name":"area-boost","wins":200,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
数値変更なし。

全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 6-3-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 6-3-validated.json.gz／6-3-sample-trace.json.gz。失敗した独立検証回は 6-3-validation-v1／round-*。

---

## 6-4 峠の残雪
ID: echigo-4。設計意図: 敵の一手を遅らせる
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更3項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv56、覚醒1。N装備Lv40／LB0。技LB3。
到達経路: burst-focus／counter-boost／double-rock／burst-focus-replace-SKD009-SKD007／defensiveの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 通常攻撃でSP供給／攻撃役へBURST集中 100.0% (200/200)、68〜87行動。変更前の同編成: 0.0% (0/200)。別戦法: 反撃 67.0% (134/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|通常攻撃でSP供給／攻撃役へBURST集中 100.0% (200/200)|
|次点（60%前後）|攻防弱体・継続回復 60.0% (120/200)|
|ギリギリ（30%前後）|通常攻撃でSP供給／攻撃役へBURST集中・配置31254 28.5% (57/200)|
|ほぼ厳しい（0%超〜10%）|該当なし|
|未勝利（観測0%）|継続ダメージ 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|通常攻撃でSP供給／攻撃役へBURST集中 (burst-focus)|100.0% (200/200)・68〜87行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":8274,"SKD009":1611,"SKD008":4252,"SKD039":1157}。未発動なし。敗北{"final_wave_defeated":200}|
|反撃 (counter-boost)|67.0% (134/200)・31〜134行動|char_joe_01:SKD049 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":7641,"SKD009":961,"SKD008":3098,"SKD049":285,"SKD035":403,"SKD039":1019}。未発動なし。敗北{"party_defeated":66,"final_wave_defeated":134}|
|土属性集中＋攻撃強化（中心技の発動が半数未満・比較用） (double-rock)|51.5% (103/200)・34〜95行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":6655,"SKD009":3214,"SKD003":2315,"SKD035":278,"SKD039":747}。未発動なし。敗北{"party_defeated":97,"final_wave_defeated":103}|
|攻防弱体・継続回復 (defensive)|60.0% (120/200)・60〜92行動|char_joe_01:SKD036 ／ char_yuki_01:SKD037 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":8980,"SKD009":1880,"SKD037":1300,"SKD008":2109,"SKD043":209,"SKD036":410}。未発動なし。敗北{"final_wave_defeated":120,"party_defeated":80}|
|高消費技を先に装備 (expensive-first)|49.0% (98/200)・32〜93行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD020→SKD008 ／ char_jihoon_01:SKD008→SKD003 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":6036,"SKD008":1987,"SKD003":2428,"SKD039":426,"SKD020":995,"SKD035":237}。未発動なし。敗北{"final_wave_defeated":98,"party_defeated":102}|
|継続ダメージ (poison-boost)|0.0% (0/200)・34〜47行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD029 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":4550,"SKD009":619,"SKD003":1957,"SKD029":727,"SKD035":503}。未発動SKD039。敗北{"party_defeated":200}|
|通常攻撃でSP供給／攻撃役へBURST集中・SKD008-SKD009置換 (burst-focus-replace-SKD008-SKD009)|50.5% (101/200)・34〜94行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":7834,"SKD009":3956,"SKD039":748}。未発動なし。敗北{"final_wave_defeated":101,"party_defeated":99}|
|通常攻撃でSP供給／攻撃役へBURST集中・SKD009-SKD007置換 (burst-focus-replace-SKD009-SKD007)|100.0% (200/200)・63〜83行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD007 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":8151,"SKD007":1648,"SKD008":3955,"SKD039":1022}。未発動なし。敗北{"final_wave_defeated":200}|
|通常攻撃でSP供給／攻撃役へBURST集中・配置31254 (burst-focus-order-31254)|28.5% (57/200)・32〜106行動|char_daimon_01:SKD008 ／ char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_aoi_01:SKD039 ／ char_jihoon_01:SKD009|前面までの確定供給案・育成予算内。{"basic":7351,"SKD009":2113,"SKD008":660,"SKD039":683}。未発動なし。敗北{"party_defeated":143,"final_wave_defeated":57}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|56／1|11285.70／1556.16／1055.40|weapon:WEAPON_001 Lv40 LB0 {"hp":0,"atk":194.28250868402813,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv40 LB0 {"hp":72.85594075651055,"atk":0,"def":63.14181532230914,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv40 LB0 {"hp":679.9887803940985,"atk":0,"def":19.428250868402813,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv40 LB0 {"hp":242.85313585503516,"atk":0,"def":58.28475260520844,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|技なし|
|2|竹中半兵衛 (char_yuki_01)|56／1|11810.70／1528.08／1029.27|weapon:WEAPON_001 Lv40 LB0 {"hp":0,"atk":194.28250868402813,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv40 LB0 {"hp":72.85594075651055,"atk":0,"def":63.14181532230914,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv40 LB0 {"hp":679.9887803940985,"atk":0,"def":19.428250868402813,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv40 LB0 {"hp":242.85313585503516,"atk":0,"def":58.28475260520844,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|技なし|
|3|井伊直政 (char_daimon_01)|56／1|8195.70／2397.48／824.25|weapon:WEAPON_001 Lv40 LB0 {"hp":0,"atk":194.28250868402813,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv40 LB0 {"hp":72.85594075651055,"atk":0,"def":63.14181532230914,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv40 LB0 {"hp":679.9887803940985,"atk":0,"def":19.428250868402813,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv40 LB0 {"hp":242.85313585503516,"atk":0,"def":58.28475260520844,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD008 水断 LB3 SP50 first [{"type":"damage","power":137.76198730781485}] 入手:4-5 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|56／1|9635.70／2067.00／926.76|weapon:WEAPON_001 Lv40 LB0 {"hp":0,"atk":194.28250868402813,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv40 LB0 {"hp":72.85594075651055,"atk":0,"def":63.14181532230914,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv40 LB0 {"hp":679.9887803940985,"atk":0,"def":19.428250868402813,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv40 LB0 {"hp":242.85313585503516,"atk":0,"def":58.28475260520844,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD009 岩断 LB3 SP50 first [{"type":"damage","power":137.76198730781485}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|56／1|8998.20／2235.48／830.28|weapon:WEAPON_001 Lv40 LB0 {"hp":0,"atk":194.28250868402813,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv40 LB0 {"hp":72.85594075651055,"atk":0,"def":63.14181532230914,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv40 LB0 {"hp":679.9887803940985,"atk":0,"def":19.428250868402813,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv40 LB0 {"hp":242.85313585503516,"atk":0,"def":58.28475260520844,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD039 応急手当 LB3 SP35 lowest_ally [{"type":"heal","power":41.660745240430565,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":617400,"eqExp":463800,"cash":959300,"skillMaterials":30,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":8,"char_yuki_01":8,"char_daimon_01":8,"char_jihoon_01":8,"char_aoi_01":8},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":617400,"eqExp":463800,"cash":1205300,"skillMaterials":276,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":8,"char_daimon_01":8,"char_aoi_01":8,"char_jihoon_01":8,"char_yuki_01":8},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"cash","amount":39800},{"kind":"character_exp_item","id":"xlarge","amount":2},{"kind":"character_exp_item","id":"large","amount":1},{"kind":"character_exp_item","id":"medium","amount":1},{"kind":"character_exp_item","id":"small","amount":7}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":999300,"charExp":538400,"eqExp":438300,"skillMaterials":260,"genericR":40}。追加案なしのEXP/銭周回比較: {"stage":"6-3","successfulClears":731,"energy":4386,"recipeSource":"6-3-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ574〜684（各試行の最小値）、最大4300〜4670。1ダメージ0/14137攻撃イベント。BURST1〜4回。SP獲得979〜1463、技消費890〜1415、終了SP11〜92。
burst-focus（元 100.0% (200/200)）の配置順だけ逆転: 100.0% (200/200)、75〜101行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD008","alternatives":[{"name":"double-rock","wins":103,"n":200},{"name":"burst-focus-replace-SKD008-SKD009","wins":101,"n":200},{"name":"poison-boost","wins":0,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"burst-focus-replace-SKD009-SKD007","wins":200,"n":200},{"name":"expensive-first","wins":98,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"defensive","wins":120,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
|1/1 真田幸村 (6-4/1/1)|atk|8320→5109|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|2/1 今川義元 (6-4/2/1)|atk|8320→3692|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|3/1 真田幸村 (6-4/3/1)|atk|8320→2267|到達耐久で役割を維持できない主な攻撃源を調整|


全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 6-4-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 6-4-validated.json.gz／6-4-sample-trace.json.gz。失敗した独立検証回は 6-4-validation-v1／round-*。

---

## 6-5 暮色の峡谷
ID: echigo-5。設計意図: 状態付与と攻撃を分担する
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更1項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv58、覚醒1。N装備Lv40／LB0。技LB3。
到達経路: cleanse-stat／counter-boost／armor-break／double-rock／cleanse-stat-replace-SKD009-SKD010／defensiveの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 能力低下解除 100.0% (200/200)、102〜161行動。変更前の同編成: 0.0% (0/200)。別戦法: 反撃 100.0% (200/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|能力低下解除 100.0% (200/200)|
|次点（60%前後）|能力低下解除・配置23145（中心技の発動が半数未満・比較用） 61.5% (123/200)|
|ギリギリ（30%前後）|能力低下解除・配置23415 32.5% (65/200)|
|ほぼ厳しい（0%超〜10%）|継続ダメージ＋弱体 8.0% (16/200)|
|未勝利（観測0%）|低消費攻撃のみ比較 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|能力低下解除 (cleanse-stat)|100.0% (200/200)・102〜161行動|char_joe_01:SKD053 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD011 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":12883,"SKD009":2264,"SKD011":5804,"SKD035":712,"SKD039":1741,"SKD053":103}。未発動なし。敗北{"final_wave_defeated":200}|
|反撃 (counter-boost)|100.0% (200/200)・103〜176行動|char_joe_01:SKD049 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD011 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":13061,"SKD009":2220,"SKD011":6156,"SKD035":439,"SKD049":269,"SKD039":1944}。未発動なし。敗北{"final_wave_defeated":200}|
|防御低下 (armor-break)|96.5% (193/200)・102〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD011 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":12948,"SKD009":2638,"SKD003":2807,"SKD011":4583,"SKD038":898,"SKD039":2293}。未発動なし。敗北{"final_wave_defeated":193,"action_limit":7}|
|土属性集中＋攻撃強化 (double-rock)|82.0% (164/200)・119〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":17506,"SKD009":9801,"SKD003":2899,"SKD035":156,"SKD039":4843}。未発動なし。敗北{"action_limit":36,"final_wave_defeated":164}|
|攻防弱体・継続回復 (defensive)|96.0% (192/200)・118〜228行動|char_joe_01:SKD036 ／ char_yuki_01:SKD037 ／ char_daimon_01:SKD011 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":15879,"SKD009":4029,"SKD037":2751,"SKD036":455,"SKD043":633,"SKD011":4987}。未発動なし。敗北{"final_wave_defeated":192,"party_defeated":8}|
|行動妨害 (stun)|42.0% (84/200)・112〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD032 ／ char_daimon_01:SKD011 ／ char_jihoon_01:SKD026 ／ char_aoi_01:SKD039|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":23246,"SKD026":7084,"SKD003":3089,"SKD011":4550,"SKD032":909,"SKD039":7314}。未発動なし。敗北{"action_limit":116,"final_wave_defeated":84}|
|継続ダメージ＋弱体 (poison-control)|8.0% (16/200)・147〜216行動|char_joe_01:SKD037 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD029 ／ char_jihoon_01:SKD011 ／ char_aoi_01:SKD043|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":23200,"SKD011":6028,"SKD038":1916,"SKD037":1496,"SKD029":4288,"SKD043":2534}。未発動なし。敗北{"party_defeated":184,"final_wave_defeated":16}|
|低消費攻撃のみ比較 (all-cheap)|0.0% (0/200)・139〜159行動|char_joe_01:SKD003 ／ char_yuki_01:SKD003 ／ char_daimon_01:SKD003 ／ char_jihoon_01:SKD003 ／ char_aoi_01:SKD003|前面までの確定供給案・育成予算内。{"basic":10009,"SKD003":19830}。未発動なし。敗北{"party_defeated":200}|
|能力低下解除・SKD009-SKD010置換（中心技の発動が半数未満・比較用） (cleanse-stat-replace-SKD009-SKD010)|99.5% (199/200)・103〜300行動|char_joe_01:SKD053 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD011 ／ char_jihoon_01:SKD010 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":12848,"SKD010":2240,"SKD011":5904,"SKD035":742,"SKD039":1802,"SKD053":97}。未発動なし。敗北{"final_wave_defeated":199,"action_limit":1}|
|能力低下解除・配置23145（中心技の発動が半数未満・比較用） (cleanse-stat-order-23145)|61.5% (123/200)・94〜300行動|char_yuki_01:SKD035 ／ char_daimon_01:SKD011 ／ char_joe_01:SKD053 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":21550,"SKD009":7582,"SKD011":4344,"SKD035":448,"SKD039":7244,"SKD053":72}。未発動なし。敗北{"final_wave_defeated":123,"action_limit":77}|
|能力低下解除・配置23415 (cleanse-stat-order-23415)|32.5% (65/200)・96〜300行動|char_yuki_01:SKD035 ／ char_daimon_01:SKD011 ／ char_jihoon_01:SKD009 ／ char_joe_01:SKD053 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":29025,"SKD035":1067,"SKD009":4224,"SKD011":4599,"SKD039":10399,"SKD053":115}。未発動なし。敗北{"final_wave_defeated":65,"action_limit":135}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|58／1|11834.50／1631.82／1110.00|weapon:WEAPON_001 Lv40 LB0 {"hp":0,"atk":194.28250868402813,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv40 LB0 {"hp":72.85594075651055,"atk":0,"def":63.14181532230914,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv40 LB0 {"hp":679.9887803940985,"atk":0,"def":19.428250868402813,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv40 LB0 {"hp":242.85313585503516,"atk":0,"def":58.28475260520844,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD053 奮起 LB3 SP39 first_ally [{"type":"cleanse","power":1,"cleanseCategory":"debuff"}] 入手:6-4 追加提案・前面初回確定|
|2|竹中半兵衛 (char_yuki_01)|58／1|12387.50／1602.18／1082.31|weapon:WEAPON_001 Lv40 LB0 {"hp":0,"atk":194.28250868402813,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv40 LB0 {"hp":72.85594075651055,"atk":0,"def":63.14181532230914,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv40 LB0 {"hp":679.9887803940985,"atk":0,"def":19.428250868402813,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv40 LB0 {"hp":242.85313585503516,"atk":0,"def":58.28475260520844,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD035 鬨の声 LB3 SP75 all_allies [{"type":"atk_up","power":9.554173889433798,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|3|井伊直政 (char_daimon_01)|58／1|8579.70／2519.88／865.05|weapon:WEAPON_001 Lv40 LB0 {"hp":0,"atk":194.28250868402813,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv40 LB0 {"hp":72.85594075651055,"atk":0,"def":63.14181532230914,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv40 LB0 {"hp":679.9887803940985,"atk":0,"def":19.428250868402813,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv40 LB0 {"hp":242.85313585503516,"atk":0,"def":58.28475260520844,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD011 光断 LB3 SP50 first [{"type":"damage","power":137.76198730781485}] 入手:5-6 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|58／1|10096.50／2171.04／973.68|weapon:WEAPON_001 Lv40 LB0 {"hp":0,"atk":194.28250868402813,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv40 LB0 {"hp":72.85594075651055,"atk":0,"def":63.14181532230914,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv40 LB0 {"hp":679.9887803940985,"atk":0,"def":19.428250868402813,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv40 LB0 {"hp":242.85313585503516,"atk":0,"def":58.28475260520844,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD009 岩断 LB3 SP50 first [{"type":"damage","power":137.76198730781485}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|58／1|9425.00／2348.88／871.44|weapon:WEAPON_001 Lv40 LB0 {"hp":0,"atk":194.28250868402813,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv40 LB0 {"hp":72.85594075651055,"atk":0,"def":63.14181532230914,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv40 LB0 {"hp":679.9887803940985,"atk":0,"def":19.428250868402813,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv40 LB0 {"hp":242.85313585503516,"atk":0,"def":58.28475260520844,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD039 応急手当 LB3 SP35 lowest_ally [{"type":"heal","power":41.660745240430565,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":667900,"eqExp":463800,"cash":1033800,"skillMaterials":54,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":8,"char_yuki_01":8,"char_daimon_01":8,"char_jihoon_01":8,"char_aoi_01":8},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":667900,"eqExp":463800,"cash":1267800,"skillMaterials":288,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":8,"char_daimon_01":8,"char_aoi_01":8,"char_jihoon_01":8,"char_yuki_01":8},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"skill","id":"SKD053","amount":1},{"kind":"cash","amount":54000},{"kind":"character_exp_item","id":"xlarge","amount":2},{"kind":"character_exp_item","id":"large","amount":1},{"kind":"character_exp_item","id":"medium","amount":3},{"kind":"character_exp_item","id":"small","amount":9},{"kind":"skill_material","amount":12}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":1053300,"charExp":587300,"eqExp":437100,"skillMaterials":272,"genericR":40}。追加案なしのEXP/銭周回比較: {"stage":"6-4","successfulClears":729,"energy":4374,"recipeSource":"6-4-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ0〜1（各試行の最小値）、最大3989〜5046。1ダメージ4014/20951攻撃イベント。BURST1〜6回。SP獲得1496〜2739、技消費1424〜2669、終了SP11〜100。
cleanse-stat（元 100.0% (200/200)）の配置順だけ逆転: 55.0% (110/200)、120〜195行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD053","alternatives":[{"name":"counter-boost","wins":200,"n":200},{"name":"armor-break","wins":193,"n":200},{"name":"defensive","wins":192,"n":200},{"name":"double-rock","wins":164,"n":200},{"name":"stun","wins":84,"n":200},{"name":"poison-control","wins":16,"n":200},{"name":"all-cheap","wins":0,"n":200}]},{"skill":"SKD035","alternatives":[{"name":"armor-break","wins":193,"n":200},{"name":"defensive","wins":192,"n":200},{"name":"stun","wins":84,"n":200},{"name":"poison-control","wins":16,"n":200},{"name":"all-cheap","wins":0,"n":200}]},{"skill":"SKD011","alternatives":[{"name":"double-rock","wins":164,"n":200},{"name":"all-cheap","wins":0,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"cleanse-stat-replace-SKD009-SKD010","wins":199,"n":200},{"name":"stun","wins":84,"n":200},{"name":"poison-control","wins":16,"n":200},{"name":"all-cheap","wins":0,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"defensive","wins":192,"n":200},{"name":"poison-control","wins":16,"n":200},{"name":"all-cheap","wins":0,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
|4/1 明智光秀 (6-5/4/1)|def|5670→2847|防御が到達火力を上回る敵のみ突破余地を確保|


全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 6-5-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 6-5-validated.json.gz／6-5-sample-trace.json.gz。失敗した独立検証回は 6-5-validation-v1／round-*。

---

## 6-6 越後の白嵐
ID: echigo-6。設計意図: 対策枠を選ぶ
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更1項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv60、覚醒1。N装備Lv40／LB0。技LB3。
到達経路: double-rock／burst-focus-greater-heal／all-cheapの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 土属性集中＋攻撃強化 100.0% (200/200)、112〜139行動。変更前の同編成: 0.5% (1/200)。別戦法: SP供給＋大回復 99.0% (198/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|土属性集中＋攻撃強化 100.0% (200/200)|
|次点（60%前後）|SP供給と強化 54.0% (108/200)|
|ギリギリ（30%前後）|攻撃強化（逆順比較） 25.0% (50/200)|
|ほぼ厳しい（0%超〜10%）|土属性集中＋攻撃強化・配置43152 1.5% (3/200)|
|未勝利（観測0%）|該当なし|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|SP供給＋大回復 (burst-focus-greater-heal)|99.0% (198/200)・94〜114行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD040|前面までの確定供給案・育成予算内。{"basic":11611,"SKD009":3967,"SKD008":5057,"SKD040":133}。未発動なし。敗北{"final_wave_defeated":198,"party_defeated":2}|
|攻防弱体・継続回復 (defensive)|97.5% (195/200)・99〜131行動|char_joe_01:SKD036 ／ char_yuki_01:SKD037 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":12925,"SKD009":3712,"SKD037":1507,"SKD008":3906,"SKD043":835,"SKD036":94}。未発動なし。敗北{"final_wave_defeated":195,"party_defeated":5}|
|土属性集中＋攻撃強化 (double-rock)|100.0% (200/200)・112〜139行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":13120,"SKD009":6614,"SKD003":2059,"SKD039":2734,"SKD035":224}。未発動なし。敗北{"final_wave_defeated":200}|
|SP供給と強化 (basic-focus)|54.0% (108/200)・105〜139行動|char_joe_01:SKD035 ／ char_yuki_01:SKD003 ／ char_daimon_01:SKD003 ／ char_jihoon_01:SKD003 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":9836,"SKD003":12897,"SKD039":1826}。未発動SKD035。敗北{"final_wave_defeated":108,"party_defeated":92}|
|低消費攻撃のみ比較 (all-cheap)|71.5% (143/200)・99〜119行動|char_joe_01:SKD003 ／ char_yuki_01:SKD003 ／ char_daimon_01:SKD003 ／ char_jihoon_01:SKD003 ／ char_aoi_01:SKD003|前面までの確定供給案・育成予算内。{"basic":7538,"SKD003":14640}。未発動なし。敗北{"final_wave_defeated":143,"party_defeated":57}|
|攻撃強化（逆順比較） (attack-up-reversed)|25.0% (50/200)・99〜153行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD008 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":10790,"SKD003":7722,"SKD009":1956,"SKD008":2674,"SKD039":1475,"SKD035":97}。未発動なし。敗北{"party_defeated":149,"final_wave_defeated":50,"mutual_annihilation":1}|
|全体攻撃 (area-boost)|0.5% (1/200)・106〜134行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD020 ／ char_jihoon_01:SKD019 ／ char_aoi_01:SKD041|前面までの確定供給案・育成予算内。{"basic":14320,"SKD003":540,"SKD035":888,"SKD020":4837,"SKD019":2174,"SKD041":367}。未発動なし。敗北{"party_defeated":199,"final_wave_defeated":1}|
|土属性集中＋攻撃強化・配置43152 (double-rock-order-43152)|1.5% (3/200)・116〜154行動|char_jihoon_01:SKD009 ／ char_daimon_01:SKD009 ／ char_joe_01:SKD003 ／ char_aoi_01:SKD039 ／ char_yuki_01:SKD035|前面までの確定供給案・育成予算内。{"basic":12857,"SKD003":4991,"SKD009":4174,"SKD039":2949,"SKD035":749}。未発動なし。敗北{"party_defeated":197,"final_wave_defeated":3}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|60／1|12383.30／1707.48／1164.60|weapon:WEAPON_001 Lv40 LB0 {"hp":0,"atk":194.28250868402813,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv40 LB0 {"hp":72.85594075651055,"atk":0,"def":63.14181532230914,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv40 LB0 {"hp":679.9887803940985,"atk":0,"def":19.428250868402813,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv40 LB0 {"hp":242.85313585503516,"atk":0,"def":58.28475260520844,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD003 土割り LB3 SP25 first [{"type":"damage","power":114.99111786064586}] 入手:チュートリアル確定|
|2|竹中半兵衛 (char_yuki_01)|60／1|12964.30／1676.28／1135.35|weapon:WEAPON_001 Lv40 LB0 {"hp":0,"atk":194.28250868402813,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv40 LB0 {"hp":72.85594075651055,"atk":0,"def":63.14181532230914,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv40 LB0 {"hp":679.9887803940985,"atk":0,"def":19.428250868402813,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv40 LB0 {"hp":242.85313585503516,"atk":0,"def":58.28475260520844,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD035 鬨の声 LB3 SP75 all_allies [{"type":"atk_up","power":9.554173889433798,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|3|井伊直政 (char_daimon_01)|60／1|8963.70／2642.28／905.85|weapon:WEAPON_001 Lv40 LB0 {"hp":0,"atk":194.28250868402813,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv40 LB0 {"hp":72.85594075651055,"atk":0,"def":63.14181532230914,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv40 LB0 {"hp":679.9887803940985,"atk":0,"def":19.428250868402813,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv40 LB0 {"hp":242.85313585503516,"atk":0,"def":58.28475260520844,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD009 岩断 LB3 SP50 first [{"type":"damage","power":137.76198730781485}] 入手:1-2 現行初回/任務確定|
|4|前田利家 (char_jihoon_01)|60／1|10557.30／2275.08／1020.60|weapon:WEAPON_001 Lv40 LB0 {"hp":0,"atk":194.28250868402813,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv40 LB0 {"hp":72.85594075651055,"atk":0,"def":63.14181532230914,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv40 LB0 {"hp":679.9887803940985,"atk":0,"def":19.428250868402813,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv40 LB0 {"hp":242.85313585503516,"atk":0,"def":58.28475260520844,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD009 岩断 LB3 SP50 first [{"type":"damage","power":137.76198730781485}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|60／1|9851.80／2462.28／912.60|weapon:WEAPON_001 Lv40 LB0 {"hp":0,"atk":194.28250868402813,"def":0,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、head:HEAD_003 Lv40 LB0 {"hp":72.85594075651055,"atk":0,"def":63.14181532230914,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定、body:BODY_002 Lv40 LB0 {"hp":679.9887803940985,"atk":0,"def":19.428250868402813,"luk":0,"sp":0} 入手:3-5 追加提案・前面初回確定、legs:LEGS_001 Lv40 LB0 {"hp":242.85313585503516,"atk":0,"def":58.28475260520844,"luk":0,"sp":0} 入手:4-5 追加提案・前面初回確定|SKD039 応急手当 LB3 SP35 lowest_ally [{"type":"heal","power":41.660745240430565,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":720550,"eqExp":463800,"cash":1068450,"skillMaterials":36,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":8,"char_yuki_01":8,"char_daimon_01":8,"char_jihoon_01":8,"char_aoi_01":8},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":720550,"eqExp":463800,"cash":1320450,"skillMaterials":288,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":8,"char_daimon_01":8,"char_aoi_01":8,"char_jihoon_01":8,"char_yuki_01":8},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"cash","amount":44150},{"kind":"character_exp_item","id":"xlarge","amount":2},{"kind":"character_exp_item","id":"large","amount":2},{"kind":"character_exp_item","id":"medium","amount":1},{"kind":"character_exp_item","id":"small","amount":1}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":1097450,"charExp":638350,"eqExp":435900,"skillMaterials":272,"genericR":40}。追加案なしのEXP/銭周回比較: {"stage":"6-5","successfulClears":727,"energy":4362,"recipeSource":"6-5-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ598〜931（各試行の最小値）、最大4340〜5508。1ダメージ0/21793攻撃イベント。BURST1〜6回。SP獲得1430〜2376、技消費1380〜2140、終了SP15〜335。
double-rock（元 100.0% (200/200)）の配置順だけ逆転: 9.0% (18/200)、99〜152行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD003","alternatives":[{"name":"burst-focus-greater-heal","wins":198,"n":200},{"name":"defensive","wins":195,"n":200}]},{"skill":"SKD035","alternatives":[{"name":"burst-focus-greater-heal","wins":198,"n":200},{"name":"defensive","wins":195,"n":200},{"name":"all-cheap","wins":143,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"all-cheap","wins":143,"n":200},{"name":"basic-focus","wins":108,"n":200},{"name":"area-boost","wins":1,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"burst-focus-greater-heal","wins":198,"n":200},{"name":"defensive","wins":195,"n":200},{"name":"all-cheap","wins":143,"n":200},{"name":"area-boost","wins":1,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
|5/2 濃姫 (6-6/5/2)|atk|7010→4305|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|


全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 6-6-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 6-6-validated.json.gz／6-6-sample-trace.json.gz。失敗した独立検証回は 6-6-validation-v1／round-*。

---

## 7-1 洛外の騒ぎ
ID: kyoto-1。設計意図: 強化された攻撃を崩す
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更2項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv60、覚醒1。R装備Lv30／LB0。技LB4。
到達経路: double-rock／burst-focus-greater-heal／basic-focusの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 土属性集中＋攻撃強化 100.0% (200/200)、71〜97行動。変更前の同編成: 0.0% (0/200)。別戦法: SP供給＋大回復 99.0% (198/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|土属性集中＋攻撃強化 100.0% (200/200)|
|次点（60%前後）|SP供給と強化 69.5% (139/200)|
|ギリギリ（30%前後）|土属性集中＋攻撃強化・配置35214（中心技の発動が半数未満・比較用） 35.0% (70/200)|
|ほぼ厳しい（0%超〜10%）|土属性集中＋攻撃強化・配置35241（中心技の発動が半数未満・比較用） 5.5% (11/200)|
|未勝利（観測0%）|攻撃強化（逆順比較） 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|SP供給＋大回復 (burst-focus-greater-heal)|99.0% (198/200)・70〜87行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD040|前面までの確定供給案・育成予算内。{"basic":9478,"SKD009":2606,"SKD008":2990,"SKD040":280}。未発動なし。敗北{"final_wave_defeated":198,"party_defeated":2}|
|土属性集中＋攻撃強化 (double-rock)|100.0% (200/200)・71〜97行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":8960,"SKD009":5172,"SKD003":508,"SKD039":1428,"SKD035":185}。未発動なし。敗北{"final_wave_defeated":200}|
|SP供給と強化 (basic-focus)|69.5% (139/200)・70〜101行動|char_joe_01:SKD035 ／ char_yuki_01:SKD003 ／ char_daimon_01:SKD003 ／ char_jihoon_01:SKD003 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":7700,"SKD003":8421,"SKD039":1279}。未発動SKD035。敗北{"party_defeated":61,"final_wave_defeated":139}|
|攻撃強化（逆順比較） (attack-up-reversed)|0.0% (0/200)・71〜99行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD008 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":7528,"SKD003":7617,"SKD039":599,"SKD009":578,"SKD008":1135,"SKD035":291}。未発動なし。敗北{"party_defeated":200}|
|土属性集中＋攻撃強化・配置35214（中心技の発動が半数未満・比較用） (double-rock-order-35214)|35.0% (70/200)・80〜103行動|char_daimon_01:SKD009 ／ char_aoi_01:SKD039 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003 ／ char_jihoon_01:SKD009|前面までの確定供給案・育成予算内。{"basic":8382,"SKD003":5124,"SKD009":3945,"SKD039":689,"SKD035":20}。未発動なし。敗北{"final_wave_defeated":70,"party_defeated":130}|
|土属性集中＋攻撃強化・配置35241（中心技の発動が半数未満・比較用） (double-rock-order-35241)|5.5% (11/200)・74〜102行動|char_daimon_01:SKD009 ／ char_aoi_01:SKD039 ／ char_yuki_01:SKD035 ／ char_jihoon_01:SKD009 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":7819,"SKD009":3566,"SKD003":5888,"SKD039":801,"SKD035":20}。未発動なし。敗北{"party_defeated":189,"final_wave_defeated":11}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|60／1|12593.23／1748.45／1194.30|weapon:WEAPON_009 Lv30 LB0 {"hp":0,"atk":235.24568938988057,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv30 LB0 {"hp":88.21713352120521,"atk":0,"def":76.4548490517112,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv30 LB0 {"hp":823.359912864582,"atk":0,"def":23.524568938988057,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv30 LB0 {"hp":294.05711173735074,"atk":0,"def":70.57370681696418,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD003 土割り LB4 SP25 first [{"type":"damage","power":119.31487311780691}] 入手:チュートリアル確定|
|2|竹中半兵衛 (char_yuki_01)|60／1|13174.23／1717.25／1165.05|weapon:WEAPON_009 Lv30 LB0 {"hp":0,"atk":235.24568938988057,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv30 LB0 {"hp":88.21713352120521,"atk":0,"def":76.4548490517112,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv30 LB0 {"hp":823.359912864582,"atk":0,"def":23.524568938988057,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv30 LB0 {"hp":294.05711173735074,"atk":0,"def":70.57370681696418,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD035 鬨の声 LB4 SP75 all_allies [{"type":"atk_up","power":10.226758040547743,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|3|井伊直政 (char_daimon_01)|60／1|9173.63／2683.25／935.55|weapon:WEAPON_009 Lv30 LB0 {"hp":0,"atk":235.24568938988057,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv30 LB0 {"hp":88.21713352120521,"atk":0,"def":76.4548490517112,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv30 LB0 {"hp":823.359912864582,"atk":0,"def":23.524568938988057,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv30 LB0 {"hp":294.05711173735074,"atk":0,"def":70.57370681696418,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD009 岩断 LB4 SP50 first [{"type":"damage","power":145.44866332054562}] 入手:1-2 現行初回/任務確定|
|4|前田利家 (char_jihoon_01)|60／1|10767.23／2316.05／1050.30|weapon:WEAPON_009 Lv30 LB0 {"hp":0,"atk":235.24568938988057,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv30 LB0 {"hp":88.21713352120521,"atk":0,"def":76.4548490517112,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv30 LB0 {"hp":823.359912864582,"atk":0,"def":23.524568938988057,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv30 LB0 {"hp":294.05711173735074,"atk":0,"def":70.57370681696418,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD009 岩断 LB4 SP50 first [{"type":"damage","power":145.44866332054562}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|60／1|10061.73／2503.25／942.30|weapon:WEAPON_009 Lv30 LB0 {"hp":0,"atk":235.24568938988057,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv30 LB0 {"hp":88.21713352120521,"atk":0,"def":76.4548490517112,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv30 LB0 {"hp":823.359912864582,"atk":0,"def":23.524568938988057,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv30 LB0 {"hp":294.05711173735074,"atk":0,"def":70.57370681696418,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD039 応急手当 LB4 SP35 lowest_ally [{"type":"heal","power":44.54324874520461,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":720550,"eqExp":362400,"cash":1041750,"skillMaterials":60,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":8,"char_yuki_01":8,"char_daimon_01":8,"char_jihoon_01":8,"char_aoi_01":8},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":720550,"eqExp":826200,"cash":1549650,"skillMaterials":336,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":8,"char_daimon_01":8,"char_aoi_01":8,"char_jihoon_01":8,"char_yuki_01":8},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"equipment","id":"WEAPON_009","amount":5},{"kind":"equipment","id":"HEAD_008","amount":5},{"kind":"equipment","id":"BODY_008","amount":5},{"kind":"equipment","id":"LEGS_006","amount":5},{"kind":"cash","amount":220700},{"kind":"equipment_exp_item","id":"xlarge","amount":17},{"kind":"equipment_exp_item","id":"large","amount":3},{"kind":"equipment_exp_item","id":"small","amount":2},{"kind":"skill_material","amount":48}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":1318150,"charExp":636750,"eqExp":797100,"skillMaterials":320,"genericR":40}。追加案なしのEXP/銭周回比較: {"stage":"6-6","successfulClears":1329,"energy":7974,"recipeSource":"6-6-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ488〜581（各試行の最小値）、最大4561〜5704。1ダメージ0/14640攻撃イベント。BURST0〜4回。SP獲得957〜1606、技消費780〜1520、終了SP11〜323。
double-rock（元 100.0% (200/200)）の配置順だけ逆転: 0.0% (0/200)、72〜99行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD003","alternatives":[{"name":"burst-focus-greater-heal","wins":198,"n":200}]},{"skill":"SKD035","alternatives":[{"name":"burst-focus-greater-heal","wins":198,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"basic-focus","wins":139,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"burst-focus-greater-heal","wins":198,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
|2/1 長宗我部元親 (7-1/2/1)|atk|5080→3120|全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|3/1 真田幸村 (7-1/3/1)|atk|5080→2254|到達耐久で役割を維持できない主な攻撃源を調整|


全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 7-1-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 7-1-validated.json.gz／7-1-sample-trace.json.gz。失敗した独立検証回は 7-1-validation-v1／round-*。

---

## 7-2 御門のかがり火
ID: kyoto-2。設計意図: 固めた守りを崩す
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更5項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv62、覚醒2。R装備Lv30／LB0。技LB4。
到達経路: break-and-buff／double-rock／armor-break／poor-element／defensiveの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 防御低下＋攻撃強化 100.0% (200/200)、117〜215行動。変更前の同編成: 0.0% (0/200)。別戦法: 土属性集中＋攻撃強化 100.0% (200/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|防御低下＋攻撃強化 100.0% (200/200)|
|次点（60%前後）|別属性比較 69.0% (138/200)|
|ギリギリ（30%前後）|防御低下＋攻撃強化・配置43215 29.5% (59/200)|
|ほぼ厳しい（0%超〜10%）|防御低下（逆順比較） 1.5% (3/200)|
|未勝利（観測0%）|低消費攻撃のみ比較 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|防御低下＋攻撃強化 (break-and-buff)|100.0% (200/200)・117〜215行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":15698,"SKD009":2858,"SKD038":2339,"SKD035":184,"SKD010":6572,"SKD039":2190}。未発動なし。敗北{"final_wave_defeated":200}|
|保護解除（中心技の発動が半数未満・比較用） (remove-protection)|100.0% (200/200)・130〜218行動|char_joe_01:SKD052 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":18103,"SKD009":2955,"SKD010":9035,"SKD035":998,"SKD039":2764}。未発動SKD052。敗北{"final_wave_defeated":200}|
|防御低下 (armor-break)|100.0% (200/200)・121〜227行動|char_joe_01:SKD003 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":16800,"SKD009":4153,"SKD003":1890,"SKD010":6985,"SKD038":1843,"SKD039":1591}。未発動なし。敗北{"final_wave_defeated":200}|
|土属性集中＋攻撃強化 (double-rock)|100.0% (200/200)・171〜266行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":22386,"SKD009":15587,"SKD003":1819,"SKD039":2429,"SKD035":1124}。未発動なし。敗北{"final_wave_defeated":200}|
|攻防弱体・継続回復 (defensive)|98.5% (197/200)・167〜300行動|char_joe_01:SKD036 ／ char_yuki_01:SKD037 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":25035,"SKD009":6879,"SKD037":3872,"SKD036":368,"SKD010":9290,"SKD043":1075}。未発動なし。敗北{"final_wave_defeated":197,"action_limit":3}|
|別属性比較 (poor-element)|69.0% (138/200)・232〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD008 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":29056,"SKD008":20903,"SKD003":1819,"SKD039":3890,"SKD035":1174}。未発動なし。敗北{"action_limit":62,"final_wave_defeated":138}|
|継続ダメージ＋弱体 (poison-control)|43.0% (86/200)・229〜300行動|char_joe_01:SKD037 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD029 ／ char_jihoon_01:SKD010 ／ char_aoi_01:SKD043|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":31642,"SKD010":13923,"SKD038":2899,"SKD037":867,"SKD029":6891,"SKD043":1954}。未発動なし。敗北{"action_limit":114,"final_wave_defeated":86}|
|防御低下（逆順比較） (armor-break-reversed)|1.5% (3/200)・199〜300行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD010 ／ char_yuki_01:SKD038 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":20131,"SKD038":3030,"SKD003":20978,"SKD010":3541,"SKD009":1120,"SKD039":618}。未発動なし。敗北{"party_defeated":188,"action_limit":9,"final_wave_defeated":3}|
|低消費攻撃のみ比較 (all-cheap)|0.0% (0/200)・190〜204行動|char_joe_01:SKD003 ／ char_yuki_01:SKD003 ／ char_daimon_01:SKD003 ／ char_jihoon_01:SKD003 ／ char_aoi_01:SKD003|前面までの確定供給案・育成予算内。{"basic":13056,"SKD003":26294}。未発動なし。敗北{"party_defeated":200}|
|防御低下＋攻撃強化・配置43215 (break-and-buff-order-43215)|29.5% (59/200)・129〜300行動|char_jihoon_01:SKD009 ／ char_daimon_01:SKD010 ／ char_yuki_01:SKD038 ／ char_joe_01:SKD035 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":31533,"SKD009":1597,"SKD010":5409,"SKD038":4475,"SKD039":4791,"SKD035":3699}。未発動なし。敗北{"action_limit":141,"final_wave_defeated":59}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|62／2|13224.35／1834.19／1257.09|weapon:WEAPON_009 Lv30 LB0 {"hp":0,"atk":235.24568938988057,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv30 LB0 {"hp":88.21713352120521,"atk":0,"def":76.4548490517112,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv30 LB0 {"hp":823.359912864582,"atk":0,"def":23.524568938988057,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv30 LB0 {"hp":294.05711173735074,"atk":0,"def":70.57370681696418,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD035 鬨の声 LB4 SP75 all_allies [{"type":"atk_up","power":10.226758040547743,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|2|竹中半兵衛 (char_yuki_01)|62／2|13837.55／1801.23／1226.05|weapon:WEAPON_009 Lv30 LB0 {"hp":0,"atk":235.24568938988057,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv30 LB0 {"hp":88.21713352120521,"atk":0,"def":76.4548490517112,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv30 LB0 {"hp":823.359912864582,"atk":0,"def":23.524568938988057,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv30 LB0 {"hp":294.05711173735074,"atk":0,"def":70.57370681696418,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD038 鎧砕き LB4 SP50 first [{"type":"def_down","power":16.135407789588662,"duration":3,"carryAcrossWaves":true}] 入手:2-5 追加提案・前面初回確定|
|3|井伊直政 (char_daimon_01)|62／2|9615.23／2821.97／982.47|weapon:WEAPON_009 Lv30 LB0 {"hp":0,"atk":235.24568938988057,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv30 LB0 {"hp":88.21713352120521,"atk":0,"def":76.4548490517112,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv30 LB0 {"hp":823.359912864582,"atk":0,"def":23.524568938988057,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv30 LB0 {"hp":294.05711173735074,"atk":0,"def":70.57370681696418,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD010 風断 LB4 SP50 first [{"type":"damage","power":145.44866332054562}] 入手:2-5 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|62／2|11297.15／2433.96／1104.26|weapon:WEAPON_009 Lv30 LB0 {"hp":0,"atk":235.24568938988057,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv30 LB0 {"hp":88.21713352120521,"atk":0,"def":76.4548490517112,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv30 LB0 {"hp":823.359912864582,"atk":0,"def":23.524568938988057,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv30 LB0 {"hp":294.05711173735074,"atk":0,"def":70.57370681696418,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD009 岩断 LB4 SP50 first [{"type":"damage","power":145.44866332054562}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|62／2|10552.55／2631.77／989.64|weapon:WEAPON_009 Lv30 LB0 {"hp":0,"atk":235.24568938988057,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv30 LB0 {"hp":88.21713352120521,"atk":0,"def":76.4548490517112,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv30 LB0 {"hp":823.359912864582,"atk":0,"def":23.524568938988057,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv30 LB0 {"hp":294.05711173735074,"atk":0,"def":70.57370681696418,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD039 応急手当 LB4 SP35 lowest_ally [{"type":"heal","power":44.54324874520461,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":775350,"eqExp":362400,"cash":1246550,"skillMaterials":90,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":20,"char_yuki_01":20,"char_daimon_01":20,"char_jihoon_01":20,"char_aoi_01":20},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":775350,"eqExp":826200,"cash":1764450,"skillMaterials":376,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":20,"char_daimon_01":20,"char_aoi_01":20,"char_jihoon_01":20,"char_yuki_01":20},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"cash","amount":204800},{"kind":"character_exp_item","id":"xlarge","amount":2},{"kind":"character_exp_item","id":"large","amount":2},{"kind":"character_exp_item","id":"medium","amount":1},{"kind":"skill_material","amount":40},{"kind":"generic_soul","id":"R","amount":60}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":1522950,"charExp":689350,"eqExp":795500,"skillMaterials":360,"genericR":100}。追加案なしのEXP/銭周回比較: {"stage":"7-1","successfulClears":884,"energy":5304,"recipeSource":"7-1-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ1〜1（各試行の最小値）、最大3441〜6889。1ダメージ13174/25128攻撃イベント。BURST2〜7回。SP獲得1661〜3542、技消費1595〜3460、終了SP11〜132。
break-and-buff（元 100.0% (200/200)）の配置順だけ逆転: 74.5% (149/200)、132〜300行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD035","alternatives":[{"name":"armor-break","wins":200,"n":200},{"name":"defensive","wins":197,"n":200},{"name":"poison-control","wins":86,"n":200},{"name":"armor-break-reversed","wins":3,"n":200},{"name":"all-cheap","wins":0,"n":200}]},{"skill":"SKD038","alternatives":[{"name":"remove-protection","wins":200,"n":200},{"name":"double-rock","wins":200,"n":200},{"name":"defensive","wins":197,"n":200},{"name":"poor-element","wins":138,"n":200},{"name":"all-cheap","wins":0,"n":200}]},{"skill":"SKD010","alternatives":[{"name":"double-rock","wins":200,"n":200},{"name":"poor-element","wins":138,"n":200},{"name":"all-cheap","wins":0,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"poor-element","wins":138,"n":200},{"name":"poison-control","wins":86,"n":200},{"name":"all-cheap","wins":0,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"defensive","wins":197,"n":200},{"name":"poison-control","wins":86,"n":200},{"name":"all-cheap","wins":0,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
|1/1 北条氏康 (7-2/1/1)|def|4000→2861|防御が到達火力を上回る敵のみ突破余地を確保／強化後DEF/実ダメージの停滞を確認した敵を局所調整|
|2/1 上杉景勝 (7-2/2/1)|def|4000→2861|防御が到達火力を上回る敵のみ突破余地を確保／強化後DEF/実ダメージの停滞を確認した敵を局所調整|
|2/2 前田利家 (7-2/2/2)|atk|2480→2108|到達耐久で役割を維持できない主な攻撃源を調整|
|3/1 徳川家康 (7-2/3/1)|atk|3350→1074|到達耐久で役割を維持できない主な攻撃源を調整|
|3/1 徳川家康 (7-2/3/1)|def|4000→2432|防御が到達火力を上回る敵のみ突破余地を確保／強化後DEF/実ダメージの停滞を確認した敵を局所調整|


全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 7-2-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 7-2-validated.json.gz／7-2-sample-trace.json.gz。失敗した独立検証回は 7-2-validation-v1／round-*。

---

## 7-3 石垣に落ちる影
ID: kyoto-3。設計意図: 障壁を取り除く
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更0項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv64、覚醒2。R装備Lv30／LB0。技LB4。
到達経路: remove-protection／rear-focus／remove-protection-replace-SKD035-SKD037／no-healの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 保護解除 100.0% (200/200)、61〜86行動。変更前の同編成: 100.0% (200/200)。別戦法: 後列集中 77.0% (154/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|保護解除 100.0% (200/200)|
|次点（60%前後）|回復なし比較 65.5% (131/200)|
|ギリギリ（30%前後）|挑発・反撃 29.0% (58/200)|
|ほぼ厳しい（0%超〜10%）|該当なし|
|未勝利（観測0%）|後列集中（逆順比較） 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|保護解除 (remove-protection)|100.0% (200/200)・61〜86行動|char_joe_01:SKD052 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":8212,"SKD009":1394,"SKD052":1005,"SKD010":3356,"SKD035":567}。未発動SKD039。敗北{"final_wave_defeated":200}|
|後列集中 (rear-focus)|77.0% (154/200)・81〜182行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD026 ／ char_jihoon_01:SKD027 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":13408,"SKD027":3914,"SKD003":443,"SKD026":5091,"SKD035":1075,"SKD039":102}。未発動なし。敗北{"final_wave_defeated":154,"party_defeated":46}|
|攻防弱体・継続回復 (defensive)|23.5% (47/200)・84〜118行動|char_joe_01:SKD036 ／ char_yuki_01:SKD037 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":11116,"SKD009":3335,"SKD037":874,"SKD010":3903,"SKD036":46,"SKD043":218}。未発動なし。敗北{"party_defeated":153,"final_wave_defeated":47}|
|回復なし比較 (no-heal)|65.5% (131/200)・93〜184行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD010|前面までの確定供給案・育成予算内。{"basic":12615,"SKD009":2185,"SKD003":1619,"SKD010":8238}。未発動SKD035。敗北{"final_wave_defeated":131,"party_defeated":69}|
|強化解除（中心技の発動が半数未満・比較用） (remove-buff)|11.5% (23/200)・74〜133行動|char_joe_01:SKD051 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":11141,"SKD009":2790,"SKD010":3898,"SKD035":755}。未発動SKD051,SKD039。敗北{"party_defeated":177,"final_wave_defeated":23}|
|挑発・反撃 (taunt-counter)|29.0% (58/200)・69〜139行動|char_joe_01:SKD049→SKD048 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":10763,"SKD009":2900,"SKD048":200,"SKD010":3873,"SKD035":524}。未発動SKD049,SKD039。敗北{"party_defeated":142,"final_wave_defeated":58}|
|後列集中（逆順比較） (rear-focus-reversed)|0.0% (0/200)・66〜86行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD027 ／ char_daimon_01:SKD026 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":6391,"SKD003":5899,"SKD027":600,"SKD026":1748,"SKD035":209}。未発動SKD039。敗北{"party_defeated":200}|
|保護解除・SKD035-SKD037置換 (remove-protection-replace-SKD035-SKD037)|99.0% (198/200)・64〜89行動|char_joe_01:SKD052 ／ char_yuki_01:SKD037 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":8686,"SKD009":1574,"SKD052":970,"SKD037":714,"SKD010":3248,"SKD039":79}。未発動なし。敗北{"final_wave_defeated":198,"party_defeated":2}|
|保護解除・配置35241 (remove-protection-order-35241)|25.0% (50/200)・86〜126行動|char_daimon_01:SKD010 ／ char_aoi_01:SKD039 ／ char_yuki_01:SKD035 ／ char_jihoon_01:SKD009 ／ char_joe_01:SKD052|前面までの確定供給案・育成予算内。{"basic":11576,"SKD009":4852,"SKD035":959,"SKD052":1117,"SKD010":989}。未発動SKD039。敗北{"party_defeated":150,"final_wave_defeated":50}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|64／2|13855.47／1919.94／1319.88|weapon:WEAPON_009 Lv30 LB0 {"hp":0,"atk":235.24568938988057,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv30 LB0 {"hp":88.21713352120521,"atk":0,"def":76.4548490517112,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv30 LB0 {"hp":823.359912864582,"atk":0,"def":23.524568938988057,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv30 LB0 {"hp":294.05711173735074,"atk":0,"def":70.57370681696418,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD052 破護 LB4 SP43 first [{"type":"cleanse","power":1,"cleanseCategory":"protection"}] 入手:7-2 追加提案・前面初回確定|
|2|竹中半兵衛 (char_yuki_01)|64／2|14500.87／1885.21／1287.05|weapon:WEAPON_009 Lv30 LB0 {"hp":0,"atk":235.24568938988057,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv30 LB0 {"hp":88.21713352120521,"atk":0,"def":76.4548490517112,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv30 LB0 {"hp":823.359912864582,"atk":0,"def":23.524568938988057,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv30 LB0 {"hp":294.05711173735074,"atk":0,"def":70.57370681696418,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD035 鬨の声 LB4 SP75 all_allies [{"type":"atk_up","power":10.226758040547743,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|3|井伊直政 (char_daimon_01)|64／2|10056.83／2960.69／1029.39|weapon:WEAPON_009 Lv30 LB0 {"hp":0,"atk":235.24568938988057,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv30 LB0 {"hp":88.21713352120521,"atk":0,"def":76.4548490517112,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv30 LB0 {"hp":823.359912864582,"atk":0,"def":23.524568938988057,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv30 LB0 {"hp":294.05711173735074,"atk":0,"def":70.57370681696418,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD010 風断 LB4 SP50 first [{"type":"damage","power":145.44866332054562}] 入手:2-5 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|64／2|11827.07／2551.87／1158.22|weapon:WEAPON_009 Lv30 LB0 {"hp":0,"atk":235.24568938988057,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv30 LB0 {"hp":88.21713352120521,"atk":0,"def":76.4548490517112,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv30 LB0 {"hp":823.359912864582,"atk":0,"def":23.524568938988057,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv30 LB0 {"hp":294.05711173735074,"atk":0,"def":70.57370681696418,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD009 岩断 LB4 SP50 first [{"type":"damage","power":145.44866332054562}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|64／2|11043.37／2760.29／1036.97|weapon:WEAPON_009 Lv30 LB0 {"hp":0,"atk":235.24568938988057,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv30 LB0 {"hp":88.21713352120521,"atk":0,"def":76.4548490517112,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv30 LB0 {"hp":823.359912864582,"atk":0,"def":23.524568938988057,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv30 LB0 {"hp":294.05711173735074,"atk":0,"def":70.57370681696418,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD039 応急手当 LB4 SP35 lowest_ally [{"type":"heal","power":44.54324874520461,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":832400,"eqExp":362400,"cash":1303600,"skillMaterials":90,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":20,"char_yuki_01":20,"char_daimon_01":20,"char_jihoon_01":20,"char_aoi_01":20},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":832400,"eqExp":826200,"cash":1857500,"skillMaterials":412,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":20,"char_daimon_01":20,"char_aoi_01":20,"char_jihoon_01":20,"char_yuki_01":20},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"skill","id":"SKD052","amount":1},{"kind":"cash","amount":83050},{"kind":"character_exp_item","id":"xlarge","amount":2},{"kind":"character_exp_item","id":"large","amount":2},{"kind":"character_exp_item","id":"medium","amount":4},{"kind":"character_exp_item","id":"small","amount":8},{"kind":"skill_material","amount":36}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":1606000,"charExp":744200,"eqExp":793900,"skillMaterials":396,"genericR":100}。追加案なしのEXP/銭周回比較: {"stage":"7-2","successfulClears":883,"energy":5298,"recipeSource":"7-2-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ0〜0（各試行の最小値）、最大4602〜5970。1ダメージ1/12962攻撃イベント。BURST0〜4回。SP獲得869〜1507、技消費797〜1451、終了SP11〜173。
remove-protection（元 100.0% (200/200)）の配置順だけ逆転: 51.0% (102/200)、78〜97行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD052","alternatives":[{"name":"rear-focus","wins":154,"n":200},{"name":"no-heal","wins":131,"n":200},{"name":"taunt-counter","wins":58,"n":200},{"name":"defensive","wins":47,"n":200},{"name":"remove-buff","wins":23,"n":200},{"name":"rear-focus-reversed","wins":0,"n":200}]},{"skill":"SKD035","alternatives":[{"name":"remove-protection-replace-SKD035-SKD037","wins":198,"n":200},{"name":"defensive","wins":47,"n":200}]},{"skill":"SKD010","alternatives":[{"name":"rear-focus","wins":154,"n":200},{"name":"rear-focus-reversed","wins":0,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"rear-focus","wins":154,"n":200},{"name":"rear-focus-reversed","wins":0,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"no-heal","wins":131,"n":200},{"name":"defensive","wins":47,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
数値変更なし。

全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 7-3-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 7-3-validated.json.gz／7-3-sample-trace.json.gz。失敗した独立検証回は 7-3-validation-v1／round-*。

---

## 7-4 花散る辻
ID: kyoto-4。設計意図: 回復源を断つ
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更4項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv66、覚醒2。R装備Lv30／LB0。技LB4。
到達経路: rear-focus／burst-focus-regenの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 後列集中 100.0% (200/200)、62〜85行動。変更前の同編成: 98.0% (196/200)。別戦法: SP供給＋継続回復 89.5% (179/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|後列集中 100.0% (200/200)|
|次点（60%前後）|防御低下＋攻撃強化 54.0% (108/200)|
|ギリギリ（30%前後）|高消費技を先に装備 26.0% (52/200)|
|ほぼ厳しい（0%超〜10%）|該当なし|
|未勝利（観測0%）|攻撃強化（逆順比較） 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|後列集中 (rear-focus)|100.0% (200/200)・62〜85行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD026 ／ char_jihoon_01:SKD027 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":7769,"SKD027":2148,"SKD003":401,"SKD026":3203,"SKD039":910,"SKD035":162}。未発動なし。敗北{"final_wave_defeated":200}|
|SP供給＋継続回復 (burst-focus-regen)|89.5% (179/200)・62〜81行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":8095,"SKD009":2783,"SKD010":2447,"SKD043":370}。未発動なし。敗北{"final_wave_defeated":179,"party_defeated":21}|
|防御低下＋攻撃強化 (break-and-buff)|54.0% (108/200)・64〜100行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":8863,"SKD009":2398,"SKD038":525,"SKD039":1209,"SKD010":1708}。未発動SKD035。敗北{"party_defeated":92,"final_wave_defeated":108}|
|高消費技を先に装備 (expensive-first)|26.0% (52/200)・64〜82行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD022→SKD010 ／ char_jihoon_01:SKD010→SKD003 ／ char_aoi_01:SKD039|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":8286,"SKD010":3088,"SKD003":1217,"SKD039":964,"SKD022":1062,"SKD035":5}。未発動なし。敗北{"party_defeated":148,"final_wave_defeated":52}|
|継続ダメージ＋弱体 (poison-control)|20.5% (41/200)・59〜83行動|char_joe_01:SKD037 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD029 ／ char_jihoon_01:SKD010 ／ char_aoi_01:SKD043|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":9042,"SKD010":2335,"SKD038":582,"SKD037":89,"SKD029":1860,"SKD043":604}。未発動なし。敗北{"party_defeated":159,"final_wave_defeated":41}|
|攻撃強化（逆順比較） (attack-up-reversed)|0.0% (0/200)・70〜85行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD010 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":6303,"SKD003":5885,"SKD039":489,"SKD009":297,"SKD010":1606,"SKD035":183}。未発動なし。敗北{"party_defeated":200}|
|後列集中・配置43152 (rear-focus-order-43152)|0.0% (0/200)・63〜96行動|char_jihoon_01:SKD027 ／ char_daimon_01:SKD026 ／ char_joe_01:SKD003 ／ char_aoi_01:SKD039 ／ char_yuki_01:SKD035|前面までの確定供給案・育成予算内。{"basic":8929,"SKD003":3076,"SKD027":203,"SKD039":1092,"SKD026":906,"SKD035":1410}。未発動なし。敗北{"party_defeated":200}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|66／2|14486.59／2005.69／1382.67|weapon:WEAPON_009 Lv30 LB0 {"hp":0,"atk":235.24568938988057,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv30 LB0 {"hp":88.21713352120521,"atk":0,"def":76.4548490517112,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv30 LB0 {"hp":823.359912864582,"atk":0,"def":23.524568938988057,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv30 LB0 {"hp":294.05711173735074,"atk":0,"def":70.57370681696418,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD003 土割り LB4 SP25 first [{"type":"damage","power":119.31487311780691}] 入手:チュートリアル確定|
|2|竹中半兵衛 (char_yuki_01)|66／2|15164.19／1969.19／1348.04|weapon:WEAPON_009 Lv30 LB0 {"hp":0,"atk":235.24568938988057,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv30 LB0 {"hp":88.21713352120521,"atk":0,"def":76.4548490517112,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv30 LB0 {"hp":823.359912864582,"atk":0,"def":23.524568938988057,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv30 LB0 {"hp":294.05711173735074,"atk":0,"def":70.57370681696418,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD035 鬨の声 LB4 SP75 all_allies [{"type":"atk_up","power":10.226758040547743,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|3|井伊直政 (char_daimon_01)|66／2|10498.43／3099.41／1076.31|weapon:WEAPON_009 Lv30 LB0 {"hp":0,"atk":235.24568938988057,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv30 LB0 {"hp":88.21713352120521,"atk":0,"def":76.4548490517112,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv30 LB0 {"hp":823.359912864582,"atk":0,"def":23.524568938988057,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv30 LB0 {"hp":294.05711173735074,"atk":0,"def":70.57370681696418,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD026 後陣射ち LB4 SP55 last [{"type":"damage","power":128.85812186301152}] 入手:4-2 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|66／2|12356.99／2669.78／1212.18|weapon:WEAPON_009 Lv30 LB0 {"hp":0,"atk":235.24568938988057,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv30 LB0 {"hp":88.21713352120521,"atk":0,"def":76.4548490517112,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv30 LB0 {"hp":823.359912864582,"atk":0,"def":23.524568938988057,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv30 LB0 {"hp":294.05711173735074,"atk":0,"def":70.57370681696418,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD027 追い討ち LB4 SP50 lowest_hp [{"type":"damage","power":135.44866332054562}] 入手:4-2 追加提案・前面初回確定|
|5|お市の方 (char_aoi_01)|66／2|11534.19／2888.81／1084.31|weapon:WEAPON_009 Lv30 LB0 {"hp":0,"atk":235.24568938988057,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv30 LB0 {"hp":88.21713352120521,"atk":0,"def":76.4548490517112,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv30 LB0 {"hp":823.359912864582,"atk":0,"def":23.524568938988057,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv30 LB0 {"hp":294.05711173735074,"atk":0,"def":70.57370681696418,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD039 応急手当 LB4 SP35 lowest_ally [{"type":"heal","power":44.54324874520461,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":891650,"eqExp":362400,"cash":1352850,"skillMaterials":80,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":20,"char_yuki_01":20,"char_daimon_01":20,"char_jihoon_01":20,"char_aoi_01":20},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":891650,"eqExp":826200,"cash":1916750,"skillMaterials":412,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":20,"char_daimon_01":20,"char_aoi_01":20,"char_jihoon_01":20,"char_yuki_01":20},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"cash","amount":49250},{"kind":"character_exp_item","id":"xlarge","amount":2},{"kind":"character_exp_item","id":"large","amount":3},{"kind":"character_exp_item","id":"medium","amount":2},{"kind":"character_exp_item","id":"small","amount":1}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":1655250,"charExp":801250,"eqExp":792300,"skillMaterials":396,"genericR":100}。追加案なしのEXP/銭周回比較: {"stage":"7-3","successfulClears":881,"energy":5286,"recipeSource":"7-3-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ651〜792（各試行の最小値）、最大4525〜5663。1ダメージ0/13521攻撃イベント。BURST1〜4回。SP獲得858〜1430、技消費780〜1390、終了SP11〜93。
rear-focus（元 100.0% (200/200)）の配置順だけ逆転: 18.0% (36/200)、67〜102行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD003","alternatives":[{"name":"burst-focus-regen","wins":179,"n":200},{"name":"break-and-buff","wins":108,"n":200},{"name":"poison-control","wins":41,"n":200}]},{"skill":"SKD035","alternatives":[{"name":"burst-focus-regen","wins":179,"n":200},{"name":"poison-control","wins":41,"n":200}]},{"skill":"SKD026","alternatives":[{"name":"burst-focus-regen","wins":179,"n":200},{"name":"break-and-buff","wins":108,"n":200},{"name":"expensive-first","wins":52,"n":200},{"name":"poison-control","wins":41,"n":200},{"name":"attack-up-reversed","wins":0,"n":200}]},{"skill":"SKD027","alternatives":[{"name":"burst-focus-regen","wins":179,"n":200},{"name":"break-and-buff","wins":108,"n":200},{"name":"expensive-first","wins":52,"n":200},{"name":"poison-control","wins":41,"n":200},{"name":"attack-up-reversed","wins":0,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"burst-focus-regen","wins":179,"n":200},{"name":"poison-control","wins":41,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
|1/2 細川ガラシャ (7-4/1/2)|atk|12000→10200|全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|2/2 お市の方 (7-4/2/2)|atk|12000→10200|全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|3/1 本多忠勝 (7-4/3/1)|atk|3600→3060|全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|3/2 豊臣秀吉 (7-4/3/2)|atk|12000→7370|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|


全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 7-4-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 7-4-validated.json.gz／7-4-sample-trace.json.gz。失敗した独立検証回は 7-4-validation-v1／round-*。

---

## 7-5 夜半の鐘
ID: kyoto-5。設計意図: 反撃に付き合いすぎない
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更0項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv68、覚醒2。R装備Lv30／LB0。技LB4。
到達経路: remove-protection／defensive／rear-focusの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 保護解除 100.0% (200/200)、50〜64行動。変更前の同編成: 100.0% (200/200)。別戦法: 攻防弱体・継続回復 100.0% (200/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|保護解除 100.0% (200/200)|
|次点（60%前後）|該当なし|
|ギリギリ（30%前後）|攻撃強化（逆順比較） 27.0% (54/200)|
|ほぼ厳しい（0%超〜10%）|該当なし|
|未勝利（観測0%）|該当なし|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|保護解除 (remove-protection)|100.0% (200/200)・50〜64行動|char_joe_01:SKD052 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":6394,"SKD009":1053,"SKD052":1077,"SKD010":2305,"SKD035":301,"SKD039":213}。未発動なし。敗北{"final_wave_defeated":200}|
|攻防弱体・継続回復 (defensive)|100.0% (200/200)・51〜74行動|char_joe_01:SKD036 ／ char_yuki_01:SKD037 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":6808,"SKD009":1839,"SKD037":791,"SKD010":2035,"SKD036":155,"SKD043":173}。未発動なし。敗北{"final_wave_defeated":200}|
|後列集中 (rear-focus)|74.5% (149/200)・59〜99行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD026 ／ char_jihoon_01:SKD027 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":7184,"SKD027":1394,"SKD003":1489,"SKD026":2297,"SKD039":1424,"SKD035":11}。未発動なし。敗北{"final_wave_defeated":149,"party_defeated":51}|
|別属性比較（中心技の発動が半数未満・比較用） (poor-element)|47.0% (94/200)・58〜94行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD008 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":7047,"SKD008":3547,"SKD003":1327,"SKD039":1822}。未発動SKD035。敗北{"party_defeated":106,"final_wave_defeated":94}|
|攻撃強化（逆順比較） (attack-up-reversed)|27.0% (54/200)・60〜80行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD010 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":6691,"SKD003":3286,"SKD009":1308,"SKD010":1386,"SKD039":1173,"SKD035":185}。未発動なし。敗北{"party_defeated":146,"final_wave_defeated":54}|
|防御低下（逆順比較） (armor-break-reversed)|12.5% (25/200)・63〜75行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD010 ／ char_yuki_01:SKD038 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":6951,"SKD038":793,"SKD003":2993,"SKD010":1302,"SKD039":783,"SKD009":746}。未発動なし。敗北{"final_wave_defeated":25,"party_defeated":175}|
|低消費攻撃のみ比較 (all-cheap)|12.5% (25/200)・55〜66行動|char_joe_01:SKD003 ／ char_yuki_01:SKD003 ／ char_daimon_01:SKD003 ／ char_jihoon_01:SKD003 ／ char_aoi_01:SKD003|前面までの確定供給案・育成予算内。{"basic":4247,"SKD003":7653}。未発動なし。敗北{"party_defeated":175,"final_wave_defeated":25}|
|保護解除・配置54132 (remove-protection-order-54132)|99.0% (198/200)・63〜105行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_joe_01:SKD052 ／ char_daimon_01:SKD010 ／ char_yuki_01:SKD035|前面までの確定供給案・育成予算内。{"basic":8795,"SKD010":1327,"SKD009":2445,"SKD052":1265,"SKD039":1658,"SKD035":302}。未発動なし。敗北{"final_wave_defeated":198,"party_defeated":2}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|68／2|15117.71／2091.44／1445.46|weapon:WEAPON_009 Lv30 LB0 {"hp":0,"atk":235.24568938988057,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv30 LB0 {"hp":88.21713352120521,"atk":0,"def":76.4548490517112,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv30 LB0 {"hp":823.359912864582,"atk":0,"def":23.524568938988057,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv30 LB0 {"hp":294.05711173735074,"atk":0,"def":70.57370681696418,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD052 破護 LB4 SP43 first [{"type":"cleanse","power":1,"cleanseCategory":"protection"}] 入手:7-2 追加提案・前面初回確定|
|2|竹中半兵衛 (char_yuki_01)|68／2|15827.51／2053.17／1409.04|weapon:WEAPON_009 Lv30 LB0 {"hp":0,"atk":235.24568938988057,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv30 LB0 {"hp":88.21713352120521,"atk":0,"def":76.4548490517112,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv30 LB0 {"hp":823.359912864582,"atk":0,"def":23.524568938988057,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv30 LB0 {"hp":294.05711173735074,"atk":0,"def":70.57370681696418,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD035 鬨の声 LB4 SP75 all_allies [{"type":"atk_up","power":10.226758040547743,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|3|井伊直政 (char_daimon_01)|68／2|10940.03／3238.13／1123.23|weapon:WEAPON_009 Lv30 LB0 {"hp":0,"atk":235.24568938988057,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv30 LB0 {"hp":88.21713352120521,"atk":0,"def":76.4548490517112,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv30 LB0 {"hp":823.359912864582,"atk":0,"def":23.524568938988057,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv30 LB0 {"hp":294.05711173735074,"atk":0,"def":70.57370681696418,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD010 風断 LB4 SP50 first [{"type":"damage","power":145.44866332054562}] 入手:2-5 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|68／2|12886.91／2787.69／1266.14|weapon:WEAPON_009 Lv30 LB0 {"hp":0,"atk":235.24568938988057,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv30 LB0 {"hp":88.21713352120521,"atk":0,"def":76.4548490517112,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv30 LB0 {"hp":823.359912864582,"atk":0,"def":23.524568938988057,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv30 LB0 {"hp":294.05711173735074,"atk":0,"def":70.57370681696418,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD009 岩断 LB4 SP50 first [{"type":"damage","power":145.44866332054562}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|68／2|12025.01／3017.33／1131.64|weapon:WEAPON_009 Lv30 LB0 {"hp":0,"atk":235.24568938988057,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv30 LB0 {"hp":88.21713352120521,"atk":0,"def":76.4548490517112,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv30 LB0 {"hp":823.359912864582,"atk":0,"def":23.524568938988057,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv30 LB0 {"hp":294.05711173735074,"atk":0,"def":70.57370681696418,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD039 応急手当 LB4 SP35 lowest_ally [{"type":"heal","power":44.54324874520461,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":953100,"eqExp":362400,"cash":1424300,"skillMaterials":90,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":20,"char_yuki_01":20,"char_daimon_01":20,"char_jihoon_01":20,"char_aoi_01":20},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":953100,"eqExp":826200,"cash":1978200,"skillMaterials":412,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":20,"char_daimon_01":20,"char_aoi_01":20,"char_jihoon_01":20,"char_yuki_01":20},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"cash","amount":51450},{"kind":"character_exp_item","id":"xlarge","amount":2},{"kind":"character_exp_item","id":"large","amount":3},{"kind":"character_exp_item","id":"medium","amount":4},{"kind":"character_exp_item","id":"small","amount":2}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":1706700,"charExp":860500,"eqExp":790700,"skillMaterials":396,"genericR":100}。追加案なしのEXP/銭周回比較: {"stage":"7-4","successfulClears":879,"energy":5274,"recipeSource":"7-4-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ660〜822（各試行の最小値）、最大5589〜6757。1ダメージ0/9752攻撃イベント。BURST0〜3回。SP獲得726〜1166、技消費659〜1111、終了SP14〜84。
remove-protection（元 100.0% (200/200)）の配置順だけ逆転: 100.0% (200/200)、68〜92行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD052","alternatives":[{"name":"defensive","wins":200,"n":200},{"name":"rear-focus","wins":149,"n":200},{"name":"poor-element","wins":94,"n":200},{"name":"attack-up-reversed","wins":54,"n":200},{"name":"all-cheap","wins":25,"n":200},{"name":"armor-break-reversed","wins":25,"n":200}]},{"skill":"SKD035","alternatives":[{"name":"defensive","wins":200,"n":200},{"name":"all-cheap","wins":25,"n":200},{"name":"armor-break-reversed","wins":25,"n":200}]},{"skill":"SKD010","alternatives":[{"name":"rear-focus","wins":149,"n":200},{"name":"poor-element","wins":94,"n":200},{"name":"all-cheap","wins":25,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"rear-focus","wins":149,"n":200},{"name":"poor-element","wins":94,"n":200},{"name":"all-cheap","wins":25,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"defensive","wins":200,"n":200},{"name":"all-cheap","wins":25,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
数値変更なし。

全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 7-5-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 7-5-validated.json.gz／7-5-sample-trace.json.gz。失敗した独立検証回は 7-5-validation-v1／round-*。

---

## 7-6 灯の消えた通り
ID: kyoto-6。設計意図: 誘導された攻撃を通す
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更0項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv70、覚醒2。R装備Lv30／LB0。技LB4。
到達経路: taunt-counter／remove-protection／armor-break／rear-focus／defensiveの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 挑発・反撃 100.0% (200/200)、79〜103行動。変更前の同編成: 100.0% (200/200)。別戦法: 保護解除 100.0% (200/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|挑発・反撃 100.0% (200/200)|
|次点（60%前後）|全体攻撃 57.5% (115/200)|
|ギリギリ（30%前後）|該当なし|
|ほぼ厳しい（0%超〜10%）|該当なし|
|未勝利（観測0%）|後列集中（逆順比較） 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|挑発・反撃 (taunt-counter)|100.0% (200/200)・79〜103行動|char_joe_01:SKD049→SKD048 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":9499,"SKD009":2816,"SKD048":204,"SKD007":4205,"SKD035":272,"SKD039":915}。未発動SKD049。敗北{"final_wave_defeated":200}|
|保護解除 (remove-protection)|100.0% (200/200)・78〜103行動|char_joe_01:SKD052 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":9828,"SKD009":2635,"SKD052":200,"SKD007":4184,"SKD039":981,"SKD035":378}。未発動なし。敗北{"final_wave_defeated":200}|
|防御低下 (armor-break)|100.0% (200/200)・81〜107行動|char_joe_01:SKD003 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":9864,"SKD009":2659,"SKD003":200,"SKD007":4039,"SKD039":1147,"SKD038":652}。未発動なし。敗北{"final_wave_defeated":200}|
|後列集中 (rear-focus)|100.0% (200/200)・84〜115行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD026 ／ char_jihoon_01:SKD027 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":10875,"SKD027":3096,"SKD003":269,"SKD026":3282,"SKD039":1783,"SKD035":211}。未発動なし。敗北{"final_wave_defeated":200}|
|攻防弱体・継続回復 (defensive)|100.0% (200/200)・83〜104行動|char_joe_01:SKD036 ／ char_yuki_01:SKD037 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":10370,"SKD009":2468,"SKD037":1042,"SKD007":4379,"SKD043":376,"SKD036":68}。未発動なし。敗北{"final_wave_defeated":200}|
|全体攻撃 (area-boost)|57.5% (115/200)・94〜125行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD019 ／ char_jihoon_01:SKD019 ／ char_aoi_01:SKD041|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":14502,"SKD003":410,"SKD035":411,"SKD019":5721,"SKD041":1221}。未発動なし。敗北{"final_wave_defeated":115,"party_defeated":85}|
|後列集中（逆順比較） (rear-focus-reversed)|0.0% (0/200)・93〜115行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD027 ／ char_daimon_01:SKD026 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":8973,"SKD003":9470,"SKD027":697,"SKD026":1543,"SKD035":577}。未発動SKD039。敗北{"party_defeated":200}|
|挑発・反撃・配置13542 (taunt-counter-order-13542)|99.5% (199/200)・89〜158行動|char_joe_01:SKD049→SKD048 ／ char_daimon_01:SKD007 ／ char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_yuki_01:SKD035|前面までの確定供給案・育成予算内。{"basic":11752,"SKD009":4618,"SKD048":244,"SKD039":2295,"SKD007":3037,"SKD035":241,"SKD049":170}。未発動なし。敗北{"final_wave_defeated":199,"party_defeated":1}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|70／2|15748.83／2177.19／1508.25|weapon:WEAPON_009 Lv30 LB0 {"hp":0,"atk":235.24568938988057,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv30 LB0 {"hp":88.21713352120521,"atk":0,"def":76.4548490517112,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv30 LB0 {"hp":823.359912864582,"atk":0,"def":23.524568938988057,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv30 LB0 {"hp":294.05711173735074,"atk":0,"def":70.57370681696418,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD049 返し刃 LB4 SP65 self [{"type":"counter","power":56.13379020273871,"duration":3,"carryAcrossWaves":true}] 入手:3-5 追加提案・前面初回確定、SKD048 挑発 LB4 SP38 self [{"type":"taunt","power":1,"duration":3,"carryAcrossWaves":true,"chance":1}] 入手:6-1 追加提案・前面初回確定|
|2|竹中半兵衛 (char_yuki_01)|70／2|16490.83／2137.15／1470.03|weapon:WEAPON_009 Lv30 LB0 {"hp":0,"atk":235.24568938988057,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv30 LB0 {"hp":88.21713352120521,"atk":0,"def":76.4548490517112,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv30 LB0 {"hp":823.359912864582,"atk":0,"def":23.524568938988057,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv30 LB0 {"hp":294.05711173735074,"atk":0,"def":70.57370681696418,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD035 鬨の声 LB4 SP75 all_allies [{"type":"atk_up","power":10.226758040547743,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|3|井伊直政 (char_daimon_01)|70／2|11381.63／3376.85／1170.15|weapon:WEAPON_009 Lv30 LB0 {"hp":0,"atk":235.24568938988057,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv30 LB0 {"hp":88.21713352120521,"atk":0,"def":76.4548490517112,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv30 LB0 {"hp":823.359912864582,"atk":0,"def":23.524568938988057,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv30 LB0 {"hp":294.05711173735074,"atk":0,"def":70.57370681696418,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD007 炎断 LB4 SP50 first [{"type":"damage","power":145.44866332054562}] 入手:4-1 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|70／2|13416.83／2905.61／1320.09|weapon:WEAPON_009 Lv30 LB0 {"hp":0,"atk":235.24568938988057,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv30 LB0 {"hp":88.21713352120521,"atk":0,"def":76.4548490517112,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv30 LB0 {"hp":823.359912864582,"atk":0,"def":23.524568938988057,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv30 LB0 {"hp":294.05711173735074,"atk":0,"def":70.57370681696418,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD009 岩断 LB4 SP50 first [{"type":"damage","power":145.44866332054562}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|70／2|12515.83／3145.85／1178.97|weapon:WEAPON_009 Lv30 LB0 {"hp":0,"atk":235.24568938988057,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv30 LB0 {"hp":88.21713352120521,"atk":0,"def":76.4548490517112,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv30 LB0 {"hp":823.359912864582,"atk":0,"def":23.524568938988057,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv30 LB0 {"hp":294.05711173735074,"atk":0,"def":70.57370681696418,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD039 応急手当 LB4 SP35 lowest_ally [{"type":"heal","power":44.54324874520461,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":1016850,"eqExp":362400,"cash":1508050,"skillMaterials":110,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":20,"char_yuki_01":20,"char_daimon_01":20,"char_jihoon_01":20,"char_aoi_01":20},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":1016850,"eqExp":826200,"cash":2065950,"skillMaterials":436,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":20,"char_daimon_01":20,"char_aoi_01":20,"char_jihoon_01":20,"char_yuki_01":20},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"cash","amount":77750},{"kind":"character_exp_item","id":"xlarge","amount":3},{"kind":"character_exp_item","id":"medium","amount":1},{"kind":"character_exp_item","id":"small","amount":6},{"kind":"skill_material","amount":24}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":1784450,"charExp":922050,"eqExp":789100,"skillMaterials":420,"genericR":100}。追加案なしのEXP/銭周回比較: {"stage":"7-5","successfulClears":877,"energy":5262,"recipeSource":"7-5-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ356〜424（各試行の最小値）、最大6757〜8471。1ダメージ0/16520攻撃イベント。BURST1〜6回。SP獲得1089〜1716、技消費1048〜1643、終了SP12〜205。
taunt-counter（元 100.0% (200/200)）の配置順だけ逆転: 100.0% (200/200)、92〜123行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD049","alternatives":[{"name":"remove-protection","wins":200,"n":200},{"name":"armor-break","wins":200,"n":200},{"name":"defensive","wins":200,"n":200},{"name":"rear-focus","wins":200,"n":200},{"name":"area-boost","wins":115,"n":200},{"name":"rear-focus-reversed","wins":0,"n":200}]},{"skill":"SKD048","alternatives":[{"name":"remove-protection","wins":200,"n":200},{"name":"armor-break","wins":200,"n":200},{"name":"defensive","wins":200,"n":200},{"name":"rear-focus","wins":200,"n":200},{"name":"area-boost","wins":115,"n":200},{"name":"rear-focus-reversed","wins":0,"n":200}]},{"skill":"SKD035","alternatives":[{"name":"armor-break","wins":200,"n":200},{"name":"defensive","wins":200,"n":200}]},{"skill":"SKD007","alternatives":[{"name":"rear-focus","wins":200,"n":200},{"name":"area-boost","wins":115,"n":200},{"name":"rear-focus-reversed","wins":0,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"rear-focus","wins":200,"n":200},{"name":"area-boost","wins":115,"n":200},{"name":"rear-focus-reversed","wins":0,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"defensive","wins":200,"n":200},{"name":"area-boost","wins":115,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
数値変更なし。

全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 7-6-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 7-6-validated.json.gz／7-6-sample-trace.json.gz。失敗した独立検証回は 7-6-validation-v1／round-*。

---

## 7-7 暁を待つ都
ID: kyoto-7。設計意図: 再付与より先に決着
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更11項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv72、覚醒3。R装備Lv30／LB0。技LB4。
到達経路: stun／rear-focus／break-and-buff／stun-replace-SKD039-SKD040の切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 行動妨害 100.0% (200/200)、159〜276行動。変更前の同編成: 0.5% (1/200)。別戦法: 後列集中 93.0% (186/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|行動妨害 100.0% (200/200)|
|次点（60%前後）|SP供給＋防御低下・継続回復 56.5% (113/200)|
|ギリギリ（30%前後）|SP供給＋大回復 32.5% (65/200)|
|ほぼ厳しい（0%超〜10%）|高消費技を先に装備 7.0% (14/200)|
|未勝利（観測0%）|攻撃強化（逆順比較） 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|行動妨害 (stun)|100.0% (200/200)・159〜276行動|char_joe_01:SKD003 ／ char_yuki_01:SKD032 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD026 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":22628,"SKD026":7254,"SKD003":3172,"SKD008":6859,"SKD032":1912,"SKD039":1395}。未発動なし。敗北{"final_wave_defeated":200}|
|防御低下＋攻撃強化 (break-and-buff)|87.0% (174/200)・123〜300行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":18624,"SKD009":6627,"SKD038":1646,"SKD008":4927,"SKD039":2334,"SKD035":86}。未発動なし。敗北{"final_wave_defeated":174,"action_limit":12,"party_defeated":14}|
|後列集中 (rear-focus)|93.0% (186/200)・192〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD026 ／ char_jihoon_01:SKD027 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":24731,"SKD027":4710,"SKD003":10144,"SKD026":9119,"SKD035":801,"SKD039":1559}。未発動なし。敗北{"final_wave_defeated":186,"action_limit":14}|
|SP供給＋防御低下・継続回復 (break-regen)|56.5% (113/200)・123〜300行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":24336,"SKD009":5383,"SKD038":1652,"SKD008":5222,"SKD043":3255}。未発動なし。敗北{"final_wave_defeated":113,"action_limit":70,"party_defeated":17}|
|土属性集中＋攻撃強化 (double-rock)|69.5% (139/200)・136〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":19262,"SKD009":12387,"SKD003":1125,"SKD035":398,"SKD039":2397}。未発動なし。敗北{"party_defeated":53,"final_wave_defeated":139,"action_limit":8}|
|SP供給＋大回復 (burst-focus-greater-heal)|32.5% (65/200)・120〜300行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD040|前面までの確定供給案・育成予算内。{"basic":28266,"SKD009":6756,"SKD008":6288,"SKD040":1683}。未発動なし。敗北{"party_defeated":67,"final_wave_defeated":65,"action_limit":68}|
|高消費技を先に装備 (expensive-first)|7.0% (14/200)・137〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD020→SKD008 ／ char_jihoon_01:SKD008→SKD003 ／ char_aoi_01:SKD039|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":24942,"SKD008":8513,"SKD003":4675,"SKD039":2952,"SKD020":4594,"SKD035":5}。未発動なし。敗北{"party_defeated":125,"action_limit":61,"final_wave_defeated":14}|
|攻撃強化（逆順比較） (attack-up-reversed)|0.0% (0/200)・111〜149行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD008 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":11208,"SKD003":12513,"SKD009":917,"SKD008":2098,"SKD035":458}。未発動SKD039。敗北{"party_defeated":200}|
|行動妨害・SKD039-SKD040置換 (stun-replace-SKD039-SKD040)|97.0% (194/200)・170〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD032 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD026 ／ char_aoi_01:SKD040|前面までの確定供給案・育成予算内。{"basic":23467,"SKD026":7845,"SKD003":3408,"SKD008":6588,"SKD032":2575,"SKD040":23}。未発動なし。敗北{"final_wave_defeated":194,"action_limit":6}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|72／3|16462.27／2274.28／1579.23|weapon:WEAPON_009 Lv30 LB0 {"hp":0,"atk":235.24568938988057,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv30 LB0 {"hp":88.21713352120521,"atk":0,"def":76.4548490517112,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv30 LB0 {"hp":823.359912864582,"atk":0,"def":23.524568938988057,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv30 LB0 {"hp":294.05711173735074,"atk":0,"def":70.57370681696418,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD003 土割り LB4 SP25 first [{"type":"damage","power":119.31487311780691}] 入手:チュートリアル確定|
|2|竹中半兵衛 (char_yuki_01)|72／3|17240.67／2232.24／1538.99|weapon:WEAPON_009 Lv30 LB0 {"hp":0,"atk":235.24568938988057,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv30 LB0 {"hp":88.21713352120521,"atk":0,"def":76.4548490517112,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv30 LB0 {"hp":823.359912864582,"atk":0,"def":23.524568938988057,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv30 LB0 {"hp":294.05711173735074,"atk":0,"def":70.57370681696418,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD032 影縫い LB4 SP65 first [{"type":"stun","power":1,"duration":1,"carryAcrossWaves":true,"chance":0.41362165830136405}] 入手:7-6 追加提案・前面初回確定|
|3|井伊直政 (char_daimon_01)|72／3|11880.83／3533.93／1223.19|weapon:WEAPON_009 Lv30 LB0 {"hp":0,"atk":235.24568938988057,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv30 LB0 {"hp":88.21713352120521,"atk":0,"def":76.4548490517112,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv30 LB0 {"hp":823.359912864582,"atk":0,"def":23.524568938988057,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv30 LB0 {"hp":294.05711173735074,"atk":0,"def":70.57370681696418,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD008 水断 LB4 SP50 first [{"type":"damage","power":145.44866332054562}] 入手:4-5 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|72／3|14015.87／3039.12／1381.09|weapon:WEAPON_009 Lv30 LB0 {"hp":0,"atk":235.24568938988057,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv30 LB0 {"hp":88.21713352120521,"atk":0,"def":76.4548490517112,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv30 LB0 {"hp":823.359912864582,"atk":0,"def":23.524568938988057,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv30 LB0 {"hp":294.05711173735074,"atk":0,"def":70.57370681696418,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD026 後陣射ち LB4 SP55 last [{"type":"damage","power":128.85812186301152}] 入手:4-2 追加提案・前面初回確定|
|5|お市の方 (char_aoi_01)|72／3|13070.67／3291.38／1232.48|weapon:WEAPON_009 Lv30 LB0 {"hp":0,"atk":235.24568938988057,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv30 LB0 {"hp":88.21713352120521,"atk":0,"def":76.4548490517112,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv30 LB0 {"hp":823.359912864582,"atk":0,"def":23.524568938988057,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv30 LB0 {"hp":294.05711173735074,"atk":0,"def":70.57370681696418,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD039 応急手当 LB4 SP35 lowest_ally [{"type":"heal","power":44.54324874520461,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":1082800,"eqExp":362400,"cash":1704000,"skillMaterials":80,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_yuki_01":36,"char_daimon_01":36,"char_jihoon_01":36,"char_aoi_01":36},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":1082800,"eqExp":826200,"cash":2311900,"skillMaterials":456,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_daimon_01":36,"char_aoi_01":36,"char_jihoon_01":36,"char_yuki_01":36},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"skill","id":"SKD032","amount":1},{"kind":"cash","amount":235950},{"kind":"character_exp_item","id":"xlarge","amount":3},{"kind":"character_exp_item","id":"medium","amount":3},{"kind":"character_exp_item","id":"small","amount":7},{"kind":"skill_material","amount":20},{"kind":"generic_soul","id":"R","amount":80}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":2020400,"charExp":985800,"eqExp":787500,"skillMaterials":440,"genericR":180}。追加案なしのEXP/銭周回比較: {"stage":"7-6","successfulClears":875,"energy":5250,"recipeSource":"7-6-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ0〜0（各試行の最小値）、最大4567〜8038。1ダメージ14833/39913攻撃イベント。BURST5〜12回。SP獲得2332〜4521、技消費2285〜4510、終了SP11〜103。
stun（元 100.0% (200/200)）の配置順だけ逆転: 8.0% (16/200)、172〜300行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD003","alternatives":[{"name":"break-and-buff","wins":174,"n":200},{"name":"break-regen","wins":113,"n":200},{"name":"burst-focus-greater-heal","wins":65,"n":200}]},{"skill":"SKD032","alternatives":[{"name":"rear-focus","wins":186,"n":200},{"name":"break-and-buff","wins":174,"n":200},{"name":"double-rock","wins":139,"n":200},{"name":"break-regen","wins":113,"n":200},{"name":"burst-focus-greater-heal","wins":65,"n":200},{"name":"expensive-first","wins":14,"n":200},{"name":"attack-up-reversed","wins":0,"n":200}]},{"skill":"SKD008","alternatives":[{"name":"rear-focus","wins":186,"n":200},{"name":"double-rock","wins":139,"n":200}]},{"skill":"SKD026","alternatives":[{"name":"break-and-buff","wins":174,"n":200},{"name":"double-rock","wins":139,"n":200},{"name":"break-regen","wins":113,"n":200},{"name":"burst-focus-greater-heal","wins":65,"n":200},{"name":"expensive-first","wins":14,"n":200},{"name":"attack-up-reversed","wins":0,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"stun-replace-SKD039-SKD040","wins":194,"n":200},{"name":"break-regen","wins":113,"n":200},{"name":"burst-focus-greater-heal","wins":65,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
|1/1 片倉景綱 (7-7/1/1)|hp|28110→17990|300行動に収まらない耐久負担を局所調整|
|1/1 片倉景綱 (7-7/1/1)|atk|3960→2067|全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|1/2 前田利家 (7-7/1/2)|atk|17490→12637|全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|2/1 真田昌幸 (7-7/2/1)|hp|28110→22488|300行動に収まらない耐久負担を局所調整|
|2/1 真田昌幸 (7-7/2/1)|atk|3960→2067|全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|2/2 島津義弘 (7-7/2/2)|atk|17490→10741|全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|3/1 直江兼続 (7-7/3/1)|hp|28110→22488|300行動に収まらない耐久負担を局所調整|
|3/1 直江兼続 (7-7/3/1)|atk|2770→2002|全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|4/1 徳川家康 (7-7/4/1)|hp|28110→11514|300行動に収まらない耐久負担を局所調整|
|4/1 徳川家康 (7-7/4/1)|atk|4090→2512|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|4/2 濃姫 (7-7/4/2)|atk|17490→7761|到達耐久で役割を維持できない主な攻撃源を調整|


全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 7-7-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 7-7-validated.json.gz／7-7-sample-trace.json.gz。失敗した独立検証回は 7-7-validation-v1／round-*。

---

## 7-8 京を渡る風
ID: kyoto-8。設計意図: 崩す場所を選ぶ
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更6項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv74、覚醒3。R装備Lv30／LB0。技LB4。
到達経路: remove-protection／cheap-attacks／remove-protection-replace-SKD035-SKD037／remove-protection-replace-SKD039-SKD040の切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 保護解除 100.0% (200/200)、67〜108行動。変更前の同編成: 0.5% (1/200)。別戦法: 低消費攻撃 63.0% (126/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|保護解除 100.0% (200/200)|
|次点（60%前後）|低消費攻撃 63.0% (126/200)|
|ギリギリ（30%前後）|防御低下（中心技の発動が半数未満・比較用） 29.0% (58/200)|
|ほぼ厳しい（0%超〜10%）|支援なし比較 7.5% (15/200)|
|未勝利（観測0%）|攻撃のみ比較 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|保護解除 (remove-protection)|100.0% (200/200)・67〜108行動|char_joe_01:SKD052 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":9394,"SKD009":3326,"SKD052":622,"SKD007":2193,"SKD039":1864,"SKD035":162}。未発動なし。敗北{"final_wave_defeated":200}|
|土属性集中＋攻撃強化（中心技の発動が半数未満・比較用） (double-rock)|84.0% (168/200)・26〜126行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":8589,"SKD009":3415,"SKD003":2664,"SKD039":1425,"SKD035":108}。未発動なし。敗北{"final_wave_defeated":168,"party_defeated":32}|
|防御低下（中心技の発動が半数未満・比較用） (armor-break)|29.0% (58/200)・26〜108行動|char_joe_01:SKD003 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":6297,"SKD009":1908,"SKD003":1434,"SKD007":569,"SKD039":1313,"SKD038":303}。未発動なし。敗北{"party_defeated":142,"final_wave_defeated":58}|
|攻防弱体・継続回復 (defensive)|20.5% (41/200)・26〜140行動|char_joe_01:SKD036 ／ char_yuki_01:SKD037 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":7812,"SKD009":662,"SKD037":1331,"SKD007":368,"SKD036":88}。未発動SKD043。敗北{"party_defeated":159,"final_wave_defeated":41}|
|低消費攻撃 (cheap-attacks)|63.0% (126/200)・25〜86行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD003 ／ char_jihoon_01:SKD003 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":5189,"SKD003":9212,"SKD035":114,"SKD039":5}。未発動なし。敗北{"final_wave_defeated":126,"party_defeated":74}|
|強化解除 (remove-buff)|40.5% (81/200)・25〜122行動|char_joe_01:SKD051 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":8951,"SKD009":820,"SKD007":519,"SKD039":2184,"SKD035":50,"SKD051":160}。未発動なし。敗北{"party_defeated":119,"final_wave_defeated":81}|
|支援なし比較 (no-support)|7.5% (15/200)・26〜114行動|char_joe_01:SKD003 ／ char_yuki_01:SKD003 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":3460,"SKD009":805,"SKD003":2311,"SKD039":1017}。未発動SKD007。敗北{"party_defeated":185,"final_wave_defeated":15}|
|攻撃のみ比較 (all-attack)|0.0% (0/200)・24〜62行動|char_joe_01:SKD007 ／ char_yuki_01:SKD007 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD007 ／ char_aoi_01:SKD007|前面までの確定供給案・育成予算内。{"basic":2878,"SKD007":2146}。未発動なし。敗北{"party_defeated":200}|
|保護解除・SKD035-SKD037置換 (remove-protection-replace-SKD035-SKD037)|100.0% (200/200)・67〜126行動|char_joe_01:SKD052 ／ char_yuki_01:SKD037 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":11982,"SKD009":619,"SKD052":267,"SKD037":1514,"SKD007":1927,"SKD039":2172}。未発動なし。敗北{"final_wave_defeated":200}|
|保護解除・SKD039-SKD040置換 (remove-protection-replace-SKD039-SKD040)|100.0% (200/200)・66〜80行動|char_joe_01:SKD052 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD040|前面までの確定供給案・育成予算内。{"basic":8513,"SKD009":1645,"SKD052":845,"SKD007":2921,"SKD035":560}。未発動SKD040。敗北{"final_wave_defeated":200}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|74／3|17175.71／2371.38／1650.21|weapon:WEAPON_009 Lv30 LB0 {"hp":0,"atk":235.24568938988057,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv30 LB0 {"hp":88.21713352120521,"atk":0,"def":76.4548490517112,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv30 LB0 {"hp":823.359912864582,"atk":0,"def":23.524568938988057,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv30 LB0 {"hp":294.05711173735074,"atk":0,"def":70.57370681696418,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD052 破護 LB4 SP43 first [{"type":"cleanse","power":1,"cleanseCategory":"protection"}] 入手:7-2 追加提案・前面初回確定|
|2|竹中半兵衛 (char_yuki_01)|74／3|17990.51／2327.34／1607.94|weapon:WEAPON_009 Lv30 LB0 {"hp":0,"atk":235.24568938988057,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv30 LB0 {"hp":88.21713352120521,"atk":0,"def":76.4548490517112,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv30 LB0 {"hp":823.359912864582,"atk":0,"def":23.524568938988057,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv30 LB0 {"hp":294.05711173735074,"atk":0,"def":70.57370681696418,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD035 鬨の声 LB4 SP75 all_allies [{"type":"atk_up","power":10.226758040547743,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|3|井伊直政 (char_daimon_01)|74／3|12380.03／3691.01／1276.23|weapon:WEAPON_009 Lv30 LB0 {"hp":0,"atk":235.24568938988057,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv30 LB0 {"hp":88.21713352120521,"atk":0,"def":76.4548490517112,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv30 LB0 {"hp":823.359912864582,"atk":0,"def":23.524568938988057,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv30 LB0 {"hp":294.05711173735074,"atk":0,"def":70.57370681696418,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD007 炎断 LB4 SP50 first [{"type":"damage","power":145.44866332054562}] 入手:4-1 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|74／3|14614.91／3172.64／1442.09|weapon:WEAPON_009 Lv30 LB0 {"hp":0,"atk":235.24568938988057,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv30 LB0 {"hp":88.21713352120521,"atk":0,"def":76.4548490517112,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv30 LB0 {"hp":823.359912864582,"atk":0,"def":23.524568938988057,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv30 LB0 {"hp":294.05711173735074,"atk":0,"def":70.57370681696418,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD009 岩断 LB4 SP50 first [{"type":"damage","power":145.44866332054562}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|74／3|13625.51／3436.91／1285.99|weapon:WEAPON_009 Lv30 LB0 {"hp":0,"atk":235.24568938988057,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv30 LB0 {"hp":88.21713352120521,"atk":0,"def":76.4548490517112,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv30 LB0 {"hp":823.359912864582,"atk":0,"def":23.524568938988057,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv30 LB0 {"hp":294.05711173735074,"atk":0,"def":70.57370681696418,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD039 応急手当 LB4 SP35 lowest_ally [{"type":"heal","power":44.54324874520461,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":1151050,"eqExp":362400,"cash":1782250,"skillMaterials":90,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_yuki_01":36,"char_daimon_01":36,"char_jihoon_01":36,"char_aoi_01":36},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":1151050,"eqExp":826200,"cash":2380150,"skillMaterials":456,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_daimon_01":36,"char_aoi_01":36,"char_jihoon_01":36,"char_yuki_01":36},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"cash","amount":58250},{"kind":"character_exp_item","id":"xlarge","amount":3},{"kind":"character_exp_item","id":"large","amount":1},{"kind":"character_exp_item","id":"medium","amount":1},{"kind":"character_exp_item","id":"small","amount":1}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":2078650,"charExp":1051850,"eqExp":785900,"skillMaterials":440,"genericR":180}。追加案なしのEXP/銭周回比較: {"stage":"7-7","successfulClears":874,"energy":5244,"recipeSource":"7-7-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ0〜1164（各試行の最小値）、最大5193〜9136。1ダメージ0/14913攻撃イベント。BURST1〜5回。SP獲得1034〜1749、技消費996〜1697、終了SP14〜108。
remove-protection（元 100.0% (200/200)）の配置順だけ逆転: 100.0% (200/200)、72〜97行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD052","alternatives":[{"name":"double-rock","wins":168,"n":200},{"name":"cheap-attacks","wins":126,"n":200},{"name":"remove-buff","wins":81,"n":200},{"name":"armor-break","wins":58,"n":200},{"name":"defensive","wins":41,"n":200},{"name":"no-support","wins":15,"n":200},{"name":"all-attack","wins":0,"n":200}]},{"skill":"SKD035","alternatives":[{"name":"remove-protection-replace-SKD035-SKD037","wins":200,"n":200},{"name":"armor-break","wins":58,"n":200},{"name":"defensive","wins":41,"n":200},{"name":"no-support","wins":15,"n":200},{"name":"all-attack","wins":0,"n":200}]},{"skill":"SKD007","alternatives":[{"name":"double-rock","wins":168,"n":200},{"name":"cheap-attacks","wins":126,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"cheap-attacks","wins":126,"n":200},{"name":"all-attack","wins":0,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"remove-protection-replace-SKD039-SKD040","wins":200,"n":200},{"name":"defensive","wins":41,"n":200},{"name":"all-attack","wins":0,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
|1/1 甲斐姫 (7-8/1/1)|atk|15410→13099|全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|2/1 加藤清正 (7-8/2/1)|atk|15410→13099|到達耐久で役割を維持できない主な攻撃源を調整|
|3/1 本多忠勝 (7-8/3/1)|atk|15410→2191|到達耐久で役割を維持できない主な攻撃源を調整|
|4/1 前田慶次 (7-8/4/1)|atk|15410→3033|到達耐久で役割を維持できない主な攻撃源を調整|
|4/2 豊臣秀吉 (7-8/4/2)|atk|2810→2031|到達耐久で役割を維持できない主な攻撃源を調整|
|4/3 片倉景綱 (7-8/4/3)|atk|4200→1584|到達耐久で役割を維持できない主な攻撃源を調整|


全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 7-8-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 7-8-validated.json.gz／7-8-sample-trace.json.gz。失敗した独立検証回は 7-8-validation-v1／round-*。

---

## 8-1 海風の街道
ID: izumo-1。設計意図: 削られたまま次へ進む
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更4項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv74、覚醒3。R装備Lv40／LB0。技LB4。
到達経路: burst-focus-greater-heal／defensive／cheap-attacksの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: SP供給＋大回復 100.0% (200/200)、57〜79行動。変更前の同編成: 0.0% (0/200)。別戦法: 攻防弱体・継続回復 100.0% (200/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|SP供給＋大回復 100.0% (200/200)|
|次点（60%前後）|SP供給＋大回復・配置13542 70.0% (140/200)|
|ギリギリ（30%前後）|全体攻撃 24.5% (49/200)|
|ほぼ厳しい（0%超〜10%）|該当なし|
|未勝利（観測0%）|後列集中（逆順比較） 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|SP供給＋大回復 (burst-focus-greater-heal)|100.0% (200/200)・57〜79行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD040|前面までの確定供給案・育成予算内。{"basic":7210,"SKD009":1276,"SKD008":3594,"SKD040":155}。未発動なし。敗北{"final_wave_defeated":200}|
|攻防弱体・継続回復 (defensive)|100.0% (200/200)・62〜84行動|char_joe_01:SKD036 ／ char_yuki_01:SKD037 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":8073,"SKD009":1446,"SKD037":1210,"SKD036":196,"SKD043":327,"SKD008":2752}。未発動なし。敗北{"final_wave_defeated":200}|
|低消費攻撃 (cheap-attacks)|98.5% (197/200)・73〜116行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD003 ／ char_jihoon_01:SKD003 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":6919,"SKD003":8364,"SKD039":2217,"SKD035":18}。未発動なし。敗北{"final_wave_defeated":197,"party_defeated":3}|
|後列集中 (rear-focus)|48.5% (97/200)・72〜124行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD026 ／ char_jihoon_01:SKD027 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":10185,"SKD027":928,"SKD003":1081,"SKD026":3638,"SKD039":2522,"SKD035":200}。未発動なし。敗北{"party_defeated":103,"final_wave_defeated":97}|
|全体攻撃 (area-boost)|24.5% (49/200)・72〜94行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD020 ／ char_jihoon_01:SKD019 ／ char_aoi_01:SKD041|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":10200,"SKD003":1350,"SKD035":973,"SKD020":2858,"SKD019":792,"SKD041":472}。未発動なし。敗北{"party_defeated":151,"final_wave_defeated":49}|
|後列集中（逆順比較） (rear-focus-reversed)|0.0% (0/200)・65〜96行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD027 ／ char_daimon_01:SKD026 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":9538,"SKD003":3138,"SKD027":1073,"SKD026":1519,"SKD039":474,"SKD035":1251}。未発動なし。敗北{"party_defeated":200}|
|SP供給＋大回復・配置13542 (burst-focus-greater-heal-order-13542)|70.0% (140/200)・69〜107行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD008 ／ char_aoi_01:SKD040 ／ char_jihoon_01:SKD009 ／ char_yuki_01:技なし・通常攻撃でSP供給|前面までの確定供給案・育成予算内。{"basic":13810,"SKD009":2094,"SKD008":1225,"SKD040":1283}。未発動なし。敗北{"final_wave_defeated":140,"party_defeated":60}|
|SP供給＋大回復・配置53421 (burst-focus-greater-heal-order-53421)|22.5% (45/200)・56〜91行動|char_aoi_01:SKD040 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_joe_01:技なし・通常攻撃でSP供給|前面までの確定供給案・育成予算内。{"basic":12143,"SKD008":2077,"SKD009":1296,"SKD040":171}。未発動なし。敗北{"party_defeated":155,"final_wave_defeated":45}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|74／3|17740.21／2481.53／1730.07|weapon:WEAPON_009 Lv40 LB0 {"hp":0,"atk":345.39112654938333,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv40 LB0 {"hp":129.52167245601876,"atk":0,"def":112.25211612854959,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv40 LB0 {"hp":1208.8689429228418,"atk":0,"def":34.539112654938336,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv40 LB0 {"hp":431.7389081867292,"atk":0,"def":103.61733796481501,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|技なし|
|2|竹中半兵衛 (char_yuki_01)|74／3|18555.01／2437.48／1687.79|weapon:WEAPON_009 Lv40 LB0 {"hp":0,"atk":345.39112654938333,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv40 LB0 {"hp":129.52167245601876,"atk":0,"def":112.25211612854959,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv40 LB0 {"hp":1208.8689429228418,"atk":0,"def":34.539112654938336,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv40 LB0 {"hp":431.7389081867292,"atk":0,"def":103.61733796481501,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|技なし|
|3|井伊直政 (char_daimon_01)|74／3|12944.53／3801.15／1356.09|weapon:WEAPON_009 Lv40 LB0 {"hp":0,"atk":345.39112654938333,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv40 LB0 {"hp":129.52167245601876,"atk":0,"def":112.25211612854959,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv40 LB0 {"hp":1208.8689429228418,"atk":0,"def":34.539112654938336,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv40 LB0 {"hp":431.7389081867292,"atk":0,"def":103.61733796481501,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD008 水断 LB4 SP50 first [{"type":"damage","power":145.44866332054562}] 入手:4-5 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|74／3|15179.41／3282.79／1521.94|weapon:WEAPON_009 Lv40 LB0 {"hp":0,"atk":345.39112654938333,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv40 LB0 {"hp":129.52167245601876,"atk":0,"def":112.25211612854959,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv40 LB0 {"hp":1208.8689429228418,"atk":0,"def":34.539112654938336,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv40 LB0 {"hp":431.7389081867292,"atk":0,"def":103.61733796481501,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD009 岩断 LB4 SP50 first [{"type":"damage","power":145.44866332054562}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|74／3|14190.01／3547.05／1365.84|weapon:WEAPON_009 Lv40 LB0 {"hp":0,"atk":345.39112654938333,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv40 LB0 {"hp":129.52167245601876,"atk":0,"def":112.25211612854959,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv40 LB0 {"hp":1208.8689429228418,"atk":0,"def":34.539112654938336,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv40 LB0 {"hp":431.7389081867292,"atk":0,"def":103.61733796481501,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD040 治癒の祈り LB4 SP90 lowest_ally [{"type":"heal","power":98.85812186301152,"healingFormula":"caster_atk_percent"}] 入手:2-5 追加提案・前面初回確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":1151050,"eqExp":695600,"cash":1938850,"skillMaterials":80,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_yuki_01":36,"char_daimon_01":36,"char_jihoon_01":36,"char_aoi_01":36},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":1151050,"eqExp":1159400,"cash":2546750,"skillMaterials":456,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_daimon_01":36,"char_aoi_01":36,"char_jihoon_01":36,"char_yuki_01":36},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"cash","amount":156600},{"kind":"equipment_exp_item","id":"xlarge","amount":16},{"kind":"equipment_exp_item","id":"small","amount":4}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":2235250,"charExp":1049650,"eqExp":1117500,"skillMaterials":440,"genericR":180}。追加案なしのEXP/銭周回比較: {"stage":"7-8","successfulClears":1242,"energy":7452,"recipeSource":"7-8-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ826〜991（各試行の最小値）、最大7118〜8653。1ダメージ0/12080攻撃イベント。BURST0〜4回。SP獲得847〜1441、技消費790〜1350、終了SP11〜131。
burst-focus-greater-heal（元 100.0% (200/200)）の配置順だけ逆転: 9.0% (18/200)、60〜92行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD008","alternatives":[{"name":"cheap-attacks","wins":197,"n":200},{"name":"rear-focus","wins":97,"n":200},{"name":"area-boost","wins":49,"n":200},{"name":"rear-focus-reversed","wins":0,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"cheap-attacks","wins":197,"n":200},{"name":"rear-focus","wins":97,"n":200},{"name":"area-boost","wins":49,"n":200},{"name":"rear-focus-reversed","wins":0,"n":200}]},{"skill":"SKD040","alternatives":[{"name":"defensive","wins":200,"n":200},{"name":"cheap-attacks","wins":197,"n":200},{"name":"rear-focus","wins":97,"n":200},{"name":"area-boost","wins":49,"n":200},{"name":"rear-focus-reversed","wins":0,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
|1/1 井伊直政 (8-1/1/1)|atk|11660→6086|全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|2/1 立花誾千代 (8-1/2/1)|atk|11660→6086|全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|3/1 浅井長政 (8-1/3/1)|atk|11660→3737|到達耐久で役割を維持できない主な攻撃源を調整|
|4/1 島津義弘 (8-1/4/1)|atk|11660→4397|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|


全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 8-1-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 8-1-validated.json.gz／8-1-sample-trace.json.gz。失敗した独立検証回は 8-1-validation-v1／round-*。

---

## 8-2 松林の狼煙
ID: izumo-2。設計意図: 小技と主砲を共存させる
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更1項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv75、覚醒3。R装備Lv40／LB0。技LB4。
到達経路: break-and-buff／double-rock／armor-break／break-and-buff-replace-SKD009-SKD010／defensiveの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 防御低下＋攻撃強化 100.0% (200/200)、44〜65行動。変更前の同編成: 0.0% (0/200)。別戦法: 土属性集中＋攻撃強化 100.0% (200/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|防御低下＋攻撃強化 100.0% (200/200)|
|次点（60%前後）|該当なし|
|ギリギリ（30%前後）|防御低下（逆順比較） 37.5% (75/200)|
|ほぼ厳しい（0%超〜10%）|該当なし|
|未勝利（観測0%）|後列集中（逆順比較） 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|防御低下＋攻撃強化 (break-and-buff)|100.0% (200/200)・44〜65行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":5981,"SKD009":1345,"SKD038":688,"SKD010":1821,"SKD039":293,"SKD035":228}。未発動なし。敗北{"final_wave_defeated":200}|
|土属性集中＋攻撃強化 (double-rock)|100.0% (200/200)・54〜94行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":7157,"SKD009":4056,"SKD003":1969,"SKD039":540,"SKD035":238}。未発動なし。敗北{"final_wave_defeated":200}|
|防御低下 (armor-break)|100.0% (200/200)・53〜87行動|char_joe_01:SKD003 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":7292,"SKD009":1183,"SKD003":1788,"SKD010":2825,"SKD038":576,"SKD039":649}。未発動なし。敗北{"final_wave_defeated":200}|
|攻防弱体・継続回復 (defensive)|100.0% (200/200)・64〜116行動|char_joe_01:SKD036 ／ char_yuki_01:SKD037 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":9171,"SKD009":2284,"SKD037":854,"SKD010":3590,"SKD043":187,"SKD036":170}。未発動なし。敗北{"final_wave_defeated":200}|
|防御低下（逆順比較） (armor-break-reversed)|37.5% (75/200)・63〜147行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD010 ／ char_yuki_01:SKD038 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":9793,"SKD038":761,"SKD003":9700,"SKD010":2252,"SKD009":991}。未発動SKD039。敗北{"final_wave_defeated":75,"party_defeated":125}|
|継続ダメージ＋弱体 (poison-control)|40.0% (80/200)・91〜181行動|char_joe_01:SKD037 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD029 ／ char_jihoon_01:SKD010 ／ char_aoi_01:SKD043|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":16888,"SKD010":5746,"SKD038":790,"SKD029":4489,"SKD037":383,"SKD043":1001}。未発動なし。敗北{"party_defeated":120,"final_wave_defeated":80}|
|後列集中（逆順比較） (rear-focus-reversed)|0.0% (0/200)・126〜147行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD027 ／ char_daimon_01:SKD026 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":11983,"SKD003":12691,"SKD027":1191,"SKD026":2278,"SKD035":526}。未発動SKD039。敗北{"party_defeated":200}|
|防御低下＋攻撃強化・SKD009-SKD010置換 (break-and-buff-replace-SKD009-SKD010)|100.0% (200/200)・45〜76行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD010 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":6133,"SKD010":3307,"SKD038":720,"SKD039":492,"SKD035":154}。未発動なし。敗北{"final_wave_defeated":200}|
|防御低下＋攻撃強化・配置43215 (break-and-buff-order-43215)|89.5% (179/200)・48〜300行動|char_jihoon_01:SKD009 ／ char_daimon_01:SKD010 ／ char_yuki_01:SKD038 ／ char_joe_01:SKD035 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":10470,"SKD009":1605,"SKD010":2092,"SKD038":652,"SKD035":1113,"SKD039":1588}。未発動なし。敗北{"final_wave_defeated":179,"action_limit":21}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|75／3|18096.93／2530.07／1765.56|weapon:WEAPON_009 Lv40 LB0 {"hp":0,"atk":345.39112654938333,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv40 LB0 {"hp":129.52167245601876,"atk":0,"def":112.25211612854959,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv40 LB0 {"hp":1208.8689429228418,"atk":0,"def":34.539112654938336,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv40 LB0 {"hp":431.7389081867292,"atk":0,"def":103.61733796481501,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD035 鬨の声 LB4 SP75 all_allies [{"type":"atk_up","power":10.226758040547743,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|2|竹中半兵衛 (char_yuki_01)|75／3|18929.93／2485.03／1722.27|weapon:WEAPON_009 Lv40 LB0 {"hp":0,"atk":345.39112654938333,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv40 LB0 {"hp":129.52167245601876,"atk":0,"def":112.25211612854959,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv40 LB0 {"hp":1208.8689429228418,"atk":0,"def":34.539112654938336,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv40 LB0 {"hp":431.7389081867292,"atk":0,"def":103.61733796481501,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD038 鎧砕き LB4 SP50 first [{"type":"def_down","power":16.135407789588662,"duration":3,"carryAcrossWaves":true}] 入手:2-5 追加提案・前面初回確定|
|3|井伊直政 (char_daimon_01)|75／3|13194.13／3879.69／1382.61|weapon:WEAPON_009 Lv40 LB0 {"hp":0,"atk":345.39112654938333,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv40 LB0 {"hp":129.52167245601876,"atk":0,"def":112.25211612854959,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv40 LB0 {"hp":1208.8689429228418,"atk":0,"def":34.539112654938336,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv40 LB0 {"hp":431.7389081867292,"atk":0,"def":103.61733796481501,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD010 風断 LB4 SP50 first [{"type":"damage","power":145.44866332054562}] 入手:2-5 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|75／3|15478.93／3349.55／1552.44|weapon:WEAPON_009 Lv40 LB0 {"hp":0,"atk":345.39112654938333,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv40 LB0 {"hp":129.52167245601876,"atk":0,"def":112.25211612854959,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv40 LB0 {"hp":1208.8689429228418,"atk":0,"def":34.539112654938336,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv40 LB0 {"hp":431.7389081867292,"atk":0,"def":103.61733796481501,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD009 岩断 LB4 SP50 first [{"type":"damage","power":145.44866332054562}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|75／3|14467.43／3619.82／1392.60|weapon:WEAPON_009 Lv40 LB0 {"hp":0,"atk":345.39112654938333,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv40 LB0 {"hp":129.52167245601876,"atk":0,"def":112.25211612854959,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv40 LB0 {"hp":1208.8689429228418,"atk":0,"def":34.539112654938336,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv40 LB0 {"hp":431.7389081867292,"atk":0,"def":103.61733796481501,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD039 応急手当 LB4 SP35 lowest_ally [{"type":"heal","power":44.54324874520461,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":1186050,"eqExp":695600,"cash":1983850,"skillMaterials":90,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_yuki_01":36,"char_daimon_01":36,"char_jihoon_01":36,"char_aoi_01":36},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":1186050,"eqExp":1159400,"cash":2581750,"skillMaterials":456,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_daimon_01":36,"char_aoi_01":36,"char_jihoon_01":36,"char_yuki_01":36},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"cash","amount":23500},{"kind":"character_exp_item","id":"xlarge","amount":1},{"kind":"character_exp_item","id":"large","amount":2}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":2258750,"charExp":1081850,"eqExp":1115500,"skillMaterials":440,"genericR":180}。追加案なしのEXP/銭周回比較: {"stage":"8-1","successfulClears":930,"energy":7440,"recipeSource":"8-1-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ1〜1（各試行の最小値）、最大3917〜9106。1ダメージ2695/9147攻撃イベント。BURST0〜2回。SP獲得671〜1177、技消費620〜1100、終了SP11〜77。
break-and-buff（元 100.0% (200/200)）の配置順だけ逆転: 100.0% (200/200)、58〜80行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD035","alternatives":[{"name":"armor-break","wins":200,"n":200},{"name":"defensive","wins":200,"n":200},{"name":"poison-control","wins":80,"n":200},{"name":"armor-break-reversed","wins":75,"n":200}]},{"skill":"SKD038","alternatives":[{"name":"double-rock","wins":200,"n":200},{"name":"defensive","wins":200,"n":200},{"name":"rear-focus-reversed","wins":0,"n":200}]},{"skill":"SKD010","alternatives":[{"name":"double-rock","wins":200,"n":200},{"name":"rear-focus-reversed","wins":0,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"break-and-buff-replace-SKD009-SKD010","wins":200,"n":200},{"name":"poison-control","wins":80,"n":200},{"name":"rear-focus-reversed","wins":0,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"defensive","wins":200,"n":200},{"name":"poison-control","wins":80,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
|2/1 上杉謙信 (8-2/2/1)|def|8880→4627|防御が到達火力を上回る敵のみ突破余地を確保|


全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 8-2-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 8-2-validated.json.gz／8-2-sample-trace.json.gz。失敗した独立検証回は 8-2-validation-v1／round-*。

---

## 8-3 入江に立つ旗
ID: izumo-3。設計意図: 単体と全体を両立する
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更10項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv76、覚醒3。R装備Lv40／LB0。技LB4。
到達経路: break-and-buff／burst-focus／double-rock／poison-control／break-regenの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 防御低下＋攻撃強化 100.0% (600/600)、114〜293行動。変更前の同編成: 0.0% (0/200)。別戦法: 通常攻撃でSP供給／攻撃役へBURST集中 98.5% (197/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|防御低下＋攻撃強化 100.0% (600/600)|
|次点（60%前後）|防御低下＋攻撃強化・配置31245 58.5% (117/200)|
|ギリギリ（30%前後）|SP供給＋大回復 25.5% (51/200)|
|ほぼ厳しい（0%超〜10%）|防御低下＋攻撃強化・配置13542 10.0% (20/200)|
|未勝利（観測0%）|攻撃強化（逆順比較） 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|防御低下＋攻撃強化 (break-and-buff)|100.0% (600/600)・114〜293行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":48392,"SKD009":14098,"SKD038":4924,"SKD007":18322,"SKD039":7077,"SKD035":242}。未発動なし。敗北{"final_wave_defeated":600}|
|通常攻撃でSP供給／攻撃役へBURST集中 (burst-focus)|98.5% (197/200)・129〜300行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":18282,"SKD009":6436,"SKD007":7782,"SKD039":2654}。未発動なし。敗北{"final_wave_defeated":197,"action_limit":3}|
|土属性集中＋攻撃強化 (double-rock)|91.5% (183/200)・150〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":23390,"SKD009":17604,"SKD003":1127,"SKD039":3621,"SKD035":229}。未発動なし。敗北{"final_wave_defeated":183,"action_limit":16,"party_defeated":1}|
|SP供給＋防御低下・継続回復 (break-regen)|95.5% (191/200)・113〜300行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":17765,"SKD009":5780,"SKD038":1527,"SKD007":5941,"SKD043":1171}。未発動なし。敗北{"final_wave_defeated":191,"action_limit":9}|
|継続ダメージ＋弱体 (poison-control)|72.0% (144/200)・192〜300行動|char_joe_01:SKD037 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD029 ／ char_jihoon_01:SKD007 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":29381,"SKD007":12271,"SKD038":1425,"SKD029":2817,"SKD037":441,"SKD043":2956}。未発動なし。敗北{"action_limit":41,"final_wave_defeated":144,"party_defeated":15}|
|SP供給＋大回復 (burst-focus-greater-heal)|25.5% (51/200)・118〜300行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD040|前面までの確定供給案・育成予算内。{"basic":35275,"SKD009":10209,"SKD007":5882,"SKD040":467}。未発動なし。敗北{"final_wave_defeated":51,"action_limit":143,"party_defeated":6}|
|攻撃強化（逆順比較） (attack-up-reversed)|0.0% (0/200)・107〜116行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD007 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":9560,"SKD003":10225,"SKD009":1093,"SKD007":1579,"SKD035":501,"SKD039":26}。未発動なし。敗北{"party_defeated":200}|
|防御低下＋攻撃強化・配置31245 (break-and-buff-order-31245)|58.5% (117/200)・165〜300行動|char_daimon_01:SKD007 ／ char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":30308,"SKD009":19676,"SKD038":2320,"SKD035":323,"SKD039":4760,"SKD007":51}。未発動なし。敗北{"action_limit":80,"final_wave_defeated":117,"party_defeated":3}|
|防御低下＋攻撃強化・配置13542 (break-and-buff-order-13542)|10.0% (20/200)・116〜300行動|char_joe_01:SKD035 ／ char_daimon_01:SKD007 ／ char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_yuki_01:SKD038|前面までの確定供給案・育成予算内。{"basic":20737,"SKD009":6350,"SKD007":2383,"SKD039":1397,"SKD038":2512,"SKD035":46}。未発動なし。敗北{"party_defeated":172,"action_limit":8,"final_wave_defeated":20}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|76／3|18453.65／2578.62／1801.05|weapon:WEAPON_009 Lv40 LB0 {"hp":0,"atk":345.39112654938333,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv40 LB0 {"hp":129.52167245601876,"atk":0,"def":112.25211612854959,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv40 LB0 {"hp":1208.8689429228418,"atk":0,"def":34.539112654938336,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv40 LB0 {"hp":431.7389081867292,"atk":0,"def":103.61733796481501,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD035 鬨の声 LB4 SP75 all_allies [{"type":"atk_up","power":10.226758040547743,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|2|竹中半兵衛 (char_yuki_01)|76／3|19304.85／2532.58／1756.74|weapon:WEAPON_009 Lv40 LB0 {"hp":0,"atk":345.39112654938333,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv40 LB0 {"hp":129.52167245601876,"atk":0,"def":112.25211612854959,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv40 LB0 {"hp":1208.8689429228418,"atk":0,"def":34.539112654938336,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv40 LB0 {"hp":431.7389081867292,"atk":0,"def":103.61733796481501,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD038 鎧砕き LB4 SP50 first [{"type":"def_down","power":16.135407789588662,"duration":3,"carryAcrossWaves":true}] 入手:2-5 追加提案・前面初回確定|
|3|井伊直政 (char_daimon_01)|76／3|13443.73／3958.23／1409.13|weapon:WEAPON_009 Lv40 LB0 {"hp":0,"atk":345.39112654938333,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv40 LB0 {"hp":129.52167245601876,"atk":0,"def":112.25211612854959,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv40 LB0 {"hp":1208.8689429228418,"atk":0,"def":34.539112654938336,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv40 LB0 {"hp":431.7389081867292,"atk":0,"def":103.61733796481501,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD007 炎断 LB4 SP50 first [{"type":"damage","power":145.44866332054562}] 入手:4-1 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|76／3|15778.45／3416.31／1582.94|weapon:WEAPON_009 Lv40 LB0 {"hp":0,"atk":345.39112654938333,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv40 LB0 {"hp":129.52167245601876,"atk":0,"def":112.25211612854959,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv40 LB0 {"hp":1208.8689429228418,"atk":0,"def":34.539112654938336,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv40 LB0 {"hp":431.7389081867292,"atk":0,"def":103.61733796481501,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD009 岩断 LB4 SP50 first [{"type":"damage","power":145.44866332054562}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|76／3|14744.85／3692.58／1419.35|weapon:WEAPON_009 Lv40 LB0 {"hp":0,"atk":345.39112654938333,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv40 LB0 {"hp":129.52167245601876,"atk":0,"def":112.25211612854959,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv40 LB0 {"hp":1208.8689429228418,"atk":0,"def":34.539112654938336,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv40 LB0 {"hp":431.7389081867292,"atk":0,"def":103.61733796481501,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD039 応急手当 LB4 SP35 lowest_ally [{"type":"heal","power":44.54324874520461,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":1221550,"eqExp":695600,"cash":2019350,"skillMaterials":90,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_yuki_01":36,"char_daimon_01":36,"char_jihoon_01":36,"char_aoi_01":36},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":1221550,"eqExp":1159400,"cash":2637250,"skillMaterials":476,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_daimon_01":36,"char_aoi_01":36,"char_jihoon_01":36,"char_yuki_01":36},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"skill","id":"SKD029","amount":1},{"kind":"cash","amount":44000},{"kind":"character_exp_item","id":"xlarge","amount":1},{"kind":"character_exp_item","id":"large","amount":2},{"kind":"character_exp_item","id":"medium","amount":2},{"kind":"character_exp_item","id":"small","amount":7},{"kind":"skill_material","amount":20}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":2302750,"charExp":1114550,"eqExp":1113500,"skillMaterials":460,"genericR":180}。追加案なしのEXP/銭周回比較: {"stage":"8-2","successfulClears":928,"energy":7424,"recipeSource":"8-2-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ1〜1（各試行の最小値）、最大3869〜8198。1ダメージ23873/80812攻撃イベント。BURST2〜10回。SP獲得1584〜4664、技消費1480〜4625、終了SP11〜114。
break-and-buff（元 100.0% (600/600)）の配置順だけ逆転: 0.0% (0/200)、116〜134行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD035","alternatives":[{"name":"burst-focus","wins":197,"n":200},{"name":"break-regen","wins":191,"n":200},{"name":"poison-control","wins":144,"n":200},{"name":"burst-focus-greater-heal","wins":51,"n":200}]},{"skill":"SKD038","alternatives":[{"name":"burst-focus","wins":197,"n":200},{"name":"double-rock","wins":183,"n":200},{"name":"burst-focus-greater-heal","wins":51,"n":200},{"name":"attack-up-reversed","wins":0,"n":200}]},{"skill":"SKD007","alternatives":[{"name":"double-rock","wins":183,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"poison-control","wins":144,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"break-regen","wins":191,"n":200},{"name":"poison-control","wins":144,"n":200},{"name":"burst-focus-greater-heal","wins":51,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
|1/1 井伊直政 (8-3/1/1)|atk|3660→2644|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|1/1 井伊直政 (8-3/1/1)|def|4650→3360|強化後DEF/実ダメージの停滞を確認した敵を局所調整|
|1/2 立花宗茂 (8-3/1/2)|atk|9410→3017|到達耐久で役割を維持できない主な攻撃源を調整|
|1/3 小早川隆景 (8-3/1/3)|atk|9410→3017|到達耐久で役割を維持できない主な攻撃源を調整|
|2/1 徳川家康 (8-3/2/1)|atk|3780→1973|到達耐久で役割を維持できない主な攻撃源を調整|
|2/1 徳川家康 (8-3/2/1)|def|4650→2856|強化後DEF/実ダメージの停滞を確認した敵を局所調整|
|3/1 毛利元就 (8-3/3/1)|hp|84560→3718|300行動に収まらない耐久負担を局所調整|
|3/1 毛利元就 (8-3/3/1)|def|4650→3360|強化後DEF/実ダメージの停滞を確認した敵を局所調整|
|4/1 伊達政宗 (8-3/4/1)|hp|25370→12990|300行動に収まらない耐久負担を局所調整|
|4/1 伊達政宗 (8-3/4/1)|atk|3780→3213|到達耐久で役割を維持できない主な攻撃源を調整|


全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 8-3-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 8-3-validated.json.gz／8-3-sample-trace.json.gz。失敗した独立検証回は 8-3-validation-v1／round-*。

---

## 8-4 暮れゆく古道
ID: izumo-4。設計意図: 持ち越した状態へ対処
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更4項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv77、覚醒3。R装備Lv40／LB0。技LB4。
到達経路: break-and-buff／cleanse-dot／stun／break-and-buff-replace-SKD010-SKD009／burst-focus-greater-healの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 防御低下＋攻撃強化 100.0% (200/200)、80〜107行動。変更前の同編成: 0.0% (0/200)。別戦法: 継続被害解除 89.0% (178/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|防御低下＋攻撃強化 100.0% (200/200)|
|次点（60%前後）|防御低下＋攻撃強化・配置15342 60.0% (120/200)|
|ギリギリ（30%前後）|該当なし|
|ほぼ厳しい（0%超〜10%）|回復なし比較 2.0% (4/200)|
|未勝利（観測0%）|攻撃強化（逆順比較） 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|防御低下＋攻撃強化 (break-and-buff)|100.0% (200/200)・80〜107行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":9547,"SKD009":1921,"SKD038":885,"SKD039":2466,"SKD010":3550}。未発動SKD035。敗北{"final_wave_defeated":200}|
|継続被害解除 (cleanse-dot)|89.0% (178/200)・78〜164行動|char_joe_01:SKD054 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":10587,"SKD009":2594,"SKD054":1315,"SKD010":3011,"SKD039":1639,"SKD035":472}。未発動なし。敗北{"final_wave_defeated":178,"party_defeated":22}|
|行動妨害（中心技の発動が半数未満・比較用） (stun)|100.0% (200/200)・82〜115行動|char_joe_01:SKD003 ／ char_yuki_01:SKD032 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD026 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":9558,"SKD026":3385,"SKD003":2186,"SKD010":1942,"SKD039":2708}。未発動SKD032。敗北{"final_wave_defeated":200}|
|低消費攻撃 (cheap-attacks)|54.5% (109/200)・43〜124行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD003 ／ char_jihoon_01:SKD003 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":6250,"SKD003":8255,"SKD039":1963}。未発動SKD035。敗北{"party_defeated":91,"final_wave_defeated":109}|
|SP供給＋大回復 (burst-focus-greater-heal)|80.5% (161/200)・81〜116行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD040|前面までの確定供給案・育成予算内。{"basic":11847,"SKD009":4296,"SKD010":1260,"SKD040":842}。未発動なし。敗北{"final_wave_defeated":161,"party_defeated":39}|
|継続ダメージ＋弱体 (poison-control)|54.5% (109/200)・79〜118行動|char_joe_01:SKD037 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD029 ／ char_jihoon_01:SKD010 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":11815,"SKD010":3228,"SKD038":1170,"SKD037":200,"SKD029":1123,"SKD043":1139}。未発動なし。敗北{"party_defeated":91,"final_wave_defeated":109}|
|支援なし比較 (no-support)|61.5% (123/200)・44〜132行動|char_joe_01:SKD003 ／ char_yuki_01:SKD003 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":7545,"SKD009":1277,"SKD003":5324,"SKD010":873,"SKD039":2081}。未発動なし。敗北{"final_wave_defeated":123,"party_defeated":77}|
|回復なし比較 (no-heal)|2.0% (4/200)・60〜79行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD010|前面までの確定供給案・育成予算内。{"basic":7440,"SKD009":1351,"SKD003":2111,"SKD010":2374,"SKD035":505}。未発動なし。敗北{"party_defeated":196,"final_wave_defeated":4}|
|攻撃強化（逆順比較） (attack-up-reversed)|0.0% (0/200)・27〜90行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD010 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":5711,"SKD003":4215,"SKD009":695,"SKD010":1350,"SKD039":400,"SKD035":228}。未発動なし。敗北{"party_defeated":200}|
|防御低下＋攻撃強化・SKD010-SKD009置換 (break-and-buff-replace-SKD010-SKD009)|100.0% (200/200)・87〜113行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":10201,"SKD009":5871,"SKD038":797,"SKD039":2936}。未発動SKD035。敗北{"final_wave_defeated":200}|
|防御低下＋攻撃強化・配置15342 (break-and-buff-order-15342)|60.0% (120/200)・43〜97行動|char_joe_01:SKD035 ／ char_aoi_01:SKD039 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_yuki_01:SKD038|前面までの確定供給案・育成予算内。{"basic":8495,"SKD009":1142,"SKD010":2814,"SKD039":1255,"SKD038":317,"SKD035":669}。未発動なし。敗北{"final_wave_defeated":120,"party_defeated":80}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|77／3|18810.37／2627.17／1836.54|weapon:WEAPON_009 Lv40 LB0 {"hp":0,"atk":345.39112654938333,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv40 LB0 {"hp":129.52167245601876,"atk":0,"def":112.25211612854959,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv40 LB0 {"hp":1208.8689429228418,"atk":0,"def":34.539112654938336,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv40 LB0 {"hp":431.7389081867292,"atk":0,"def":103.61733796481501,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD035 鬨の声 LB4 SP75 all_allies [{"type":"atk_up","power":10.226758040547743,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|2|竹中半兵衛 (char_yuki_01)|77／3|19679.77／2580.12／1791.22|weapon:WEAPON_009 Lv40 LB0 {"hp":0,"atk":345.39112654938333,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv40 LB0 {"hp":129.52167245601876,"atk":0,"def":112.25211612854959,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv40 LB0 {"hp":1208.8689429228418,"atk":0,"def":34.539112654938336,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv40 LB0 {"hp":431.7389081867292,"atk":0,"def":103.61733796481501,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD038 鎧砕き LB4 SP50 first [{"type":"def_down","power":16.135407789588662,"duration":3,"carryAcrossWaves":true}] 入手:2-5 追加提案・前面初回確定|
|3|井伊直政 (char_daimon_01)|77／3|13693.33／4036.77／1435.65|weapon:WEAPON_009 Lv40 LB0 {"hp":0,"atk":345.39112654938333,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv40 LB0 {"hp":129.52167245601876,"atk":0,"def":112.25211612854959,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv40 LB0 {"hp":1208.8689429228418,"atk":0,"def":34.539112654938336,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv40 LB0 {"hp":431.7389081867292,"atk":0,"def":103.61733796481501,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD010 風断 LB4 SP50 first [{"type":"damage","power":145.44866332054562}] 入手:2-5 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|77／3|16077.97／3483.06／1613.43|weapon:WEAPON_009 Lv40 LB0 {"hp":0,"atk":345.39112654938333,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv40 LB0 {"hp":129.52167245601876,"atk":0,"def":112.25211612854959,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv40 LB0 {"hp":1208.8689429228418,"atk":0,"def":34.539112654938336,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv40 LB0 {"hp":431.7389081867292,"atk":0,"def":103.61733796481501,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD009 岩断 LB4 SP50 first [{"type":"damage","power":145.44866332054562}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|77／3|15022.27／3765.35／1446.11|weapon:WEAPON_009 Lv40 LB0 {"hp":0,"atk":345.39112654938333,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv40 LB0 {"hp":129.52167245601876,"atk":0,"def":112.25211612854959,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv40 LB0 {"hp":1208.8689429228418,"atk":0,"def":34.539112654938336,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv40 LB0 {"hp":431.7389081867292,"atk":0,"def":103.61733796481501,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD039 応急手当 LB4 SP35 lowest_ally [{"type":"heal","power":44.54324874520461,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":1257700,"eqExp":695600,"cash":2055500,"skillMaterials":90,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_yuki_01":36,"char_daimon_01":36,"char_jihoon_01":36,"char_aoi_01":36},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":1257700,"eqExp":1159400,"cash":2681400,"skillMaterials":484,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_daimon_01":36,"char_aoi_01":36,"char_jihoon_01":36,"char_yuki_01":36},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"cash","amount":32650},{"kind":"character_exp_item","id":"xlarge","amount":1},{"kind":"character_exp_item","id":"large","amount":2},{"kind":"character_exp_item","id":"medium","amount":3},{"kind":"character_exp_item","id":"small","amount":3},{"kind":"skill_material","amount":8}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":2335400,"charExp":1147900,"eqExp":1111500,"skillMaterials":468,"genericR":180}。追加案なしのEXP/銭周回比較: {"stage":"8-3","successfulClears":927,"energy":7416,"recipeSource":"8-3-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ942〜1463（各試行の最小値）、最大7991〜9616。1ダメージ0/15018攻撃イベント。BURST1〜5回。SP獲得1089〜1870、技消費1045〜1815、終了SP11〜78。
break-and-buff（元 100.0% (200/200)）の配置順だけ逆転: 0.0% (0/200)、27〜116行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD035","alternatives":[{"name":"stun","wins":200,"n":200},{"name":"burst-focus-greater-heal","wins":161,"n":200},{"name":"no-support","wins":123,"n":200},{"name":"poison-control","wins":109,"n":200}]},{"skill":"SKD038","alternatives":[{"name":"stun","wins":200,"n":200},{"name":"cleanse-dot","wins":178,"n":200},{"name":"burst-focus-greater-heal","wins":161,"n":200},{"name":"no-support","wins":123,"n":200},{"name":"cheap-attacks","wins":109,"n":200},{"name":"no-heal","wins":4,"n":200},{"name":"attack-up-reversed","wins":0,"n":200}]},{"skill":"SKD010","alternatives":[{"name":"break-and-buff-replace-SKD010-SKD009","wins":200,"n":200},{"name":"cheap-attacks","wins":109,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"stun","wins":200,"n":200},{"name":"cheap-attacks","wins":109,"n":200},{"name":"poison-control","wins":109,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"burst-focus-greater-heal","wins":161,"n":200},{"name":"poison-control","wins":109,"n":200},{"name":"no-heal","wins":4,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
|1/2 島左近 (8-4/1/2)|atk|38320→23533|全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|2/1 柴田勝家 (8-4/2/1)|atk|38320→2845|到達耐久で役割を維持できない主な攻撃源を調整|
|3/1 山本勘助 (8-4/3/1)|atk|3320→904|到達耐久で役割を維持できない主な攻撃源を調整|
|3/2 立花誾千代 (8-4/3/2)|atk|38320→2418|到達耐久で役割を維持できない主な攻撃源を調整|


全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 8-4-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 8-4-validated.json.gz／8-4-sample-trace.json.gz。失敗した独立検証回は 8-4-validation-v1／round-*。

---

## 8-5 社のかがり火
ID: izumo-5。設計意図: 支援役を守り続ける
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更3項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv78、覚醒3。R装備Lv40／LB0。技LB4。
到達経路: burst-focus-regen／barrier／double-rock／rear-focusの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: SP供給＋継続回復 100.0% (200/200)、71〜119行動。変更前の同編成: 0.0% (0/200)。別戦法: 障壁 100.0% (200/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|SP供給＋継続回復 100.0% (200/200)|
|次点（60%前後）|後列集中 63.0% (126/200)|
|ギリギリ（30%前後）|継続ダメージ 21.5% (43/200)|
|ほぼ厳しい（0%超〜10%）|低消費攻撃 2.0% (4/200)|
|未勝利（観測0%）|該当なし|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|通常攻撃でSP供給／攻撃役へBURST集中 (burst-focus)|100.0% (200/200)・72〜111行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":9539,"SKD009":805,"SKD007":5864,"SKD039":677}。未発動なし。敗北{"final_wave_defeated":200}|
|障壁 (barrier)|100.0% (200/200)・76〜131行動|char_joe_01:SKD045 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":9831,"SKD009":736,"SKD007":5426,"SKD039":677,"SKD035":434,"SKD045":515}。未発動なし。敗北{"final_wave_defeated":200}|
|SP供給＋継続回復 (burst-focus-regen)|100.0% (200/200)・71〜119行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":9784,"SKD009":1204,"SKD007":5526}。未発動SKD043。敗北{"final_wave_defeated":200}|
|土属性集中＋攻撃強化 (double-rock)|77.0% (154/200)・129〜160行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":12869,"SKD009":4310,"SKD003":10834,"SKD035":872,"SKD039":204}。未発動なし。敗北{"party_defeated":46,"final_wave_defeated":154}|
|後列集中 (rear-focus)|63.0% (126/200)・97〜166行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD026 ／ char_jihoon_01:SKD027 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":12442,"SKD027":658,"SKD003":11360,"SKD026":3112,"SKD035":831,"SKD039":341}。未発動なし。敗北{"party_defeated":74,"final_wave_defeated":126}|
|継続ダメージ (poison-boost)|21.5% (43/200)・130〜167行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD029 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":13554,"SKD009":1687,"SKD003":12142,"SKD029":2080,"SKD035":1043,"SKD039":494}。未発動なし。敗北{"party_defeated":157,"final_wave_defeated":43}|
|低消費攻撃 (cheap-attacks)|2.0% (4/200)・102〜171行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD003 ／ char_jihoon_01:SKD003 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":10226,"SKD003":16620,"SKD035":710,"SKD039":111}。未発動なし。敗北{"party_defeated":196,"final_wave_defeated":4}|
|SP供給＋継続回復・配置12453 (burst-focus-regen-order-12453)|72.0% (144/200)・137〜177行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043 ／ char_daimon_01:SKD007|前面までの確定供給案・育成予算内。{"basic":23476,"SKD007":575,"SKD009":6165,"SKD043":412}。未発動なし。敗北{"final_wave_defeated":144,"party_defeated":56}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|78／3|19167.09／2675.72／1872.03|weapon:WEAPON_009 Lv40 LB0 {"hp":0,"atk":345.39112654938333,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv40 LB0 {"hp":129.52167245601876,"atk":0,"def":112.25211612854959,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv40 LB0 {"hp":1208.8689429228418,"atk":0,"def":34.539112654938336,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv40 LB0 {"hp":431.7389081867292,"atk":0,"def":103.61733796481501,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|技なし|
|2|竹中半兵衛 (char_yuki_01)|78／3|20054.69／2627.67／1825.70|weapon:WEAPON_009 Lv40 LB0 {"hp":0,"atk":345.39112654938333,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv40 LB0 {"hp":129.52167245601876,"atk":0,"def":112.25211612854959,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv40 LB0 {"hp":1208.8689429228418,"atk":0,"def":34.539112654938336,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv40 LB0 {"hp":431.7389081867292,"atk":0,"def":103.61733796481501,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|技なし|
|3|井伊直政 (char_daimon_01)|78／3|13942.93／4115.31／1462.17|weapon:WEAPON_009 Lv40 LB0 {"hp":0,"atk":345.39112654938333,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv40 LB0 {"hp":129.52167245601876,"atk":0,"def":112.25211612854959,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv40 LB0 {"hp":1208.8689429228418,"atk":0,"def":34.539112654938336,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv40 LB0 {"hp":431.7389081867292,"atk":0,"def":103.61733796481501,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD007 炎断 LB4 SP50 first [{"type":"damage","power":145.44866332054562}] 入手:4-1 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|78／3|16377.49／3549.82／1643.93|weapon:WEAPON_009 Lv40 LB0 {"hp":0,"atk":345.39112654938333,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv40 LB0 {"hp":129.52167245601876,"atk":0,"def":112.25211612854959,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv40 LB0 {"hp":1208.8689429228418,"atk":0,"def":34.539112654938336,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv40 LB0 {"hp":431.7389081867292,"atk":0,"def":103.61733796481501,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD009 岩断 LB4 SP50 first [{"type":"damage","power":145.44866332054562}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|78／3|15299.69／3838.11／1472.86|weapon:WEAPON_009 Lv40 LB0 {"hp":0,"atk":345.39112654938333,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv40 LB0 {"hp":129.52167245601876,"atk":0,"def":112.25211612854959,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv40 LB0 {"hp":1208.8689429228418,"atk":0,"def":34.539112654938336,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv40 LB0 {"hp":431.7389081867292,"atk":0,"def":103.61733796481501,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD043 再生の祈り LB4 SP65 lowest_ally [{"type":"hot","power":19.771624372602304,"duration":3,"carryAcrossWaves":true}] 入手:3-4 追加提案・前面初回確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":1294400,"eqExp":695600,"cash":2062200,"skillMaterials":60,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_yuki_01":36,"char_daimon_01":36,"char_jihoon_01":36,"char_aoi_01":36},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":1294400,"eqExp":1159400,"cash":2726100,"skillMaterials":492,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_daimon_01":36,"char_aoi_01":36,"char_jihoon_01":36,"char_yuki_01":36},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"cash","amount":33200},{"kind":"character_exp_item","id":"xlarge","amount":1},{"kind":"character_exp_item","id":"large","amount":2},{"kind":"character_exp_item","id":"medium","amount":3},{"kind":"character_exp_item","id":"small","amount":9},{"kind":"skill_material","amount":8}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":2368600,"charExp":1181800,"eqExp":1109500,"skillMaterials":476,"genericR":180}。追加案なしのEXP/銭周回比較: {"stage":"8-4","successfulClears":925,"energy":7400,"recipeSource":"8-4-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ699〜759（各試行の最小値）、最大7677〜9267。1ダメージ0/16514攻撃イベント。BURST1〜5回。SP獲得957〜1650、技消費750〜1350、終了SP95〜400。
burst-focus（元 100.0% (200/200)）の配置順だけ逆転: 100.0% (200/200)、71〜106行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD007","alternatives":[{"name":"double-rock","wins":154,"n":200},{"name":"rear-focus","wins":126,"n":200},{"name":"poison-boost","wins":43,"n":200},{"name":"cheap-attacks","wins":4,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"rear-focus","wins":126,"n":200},{"name":"cheap-attacks","wins":4,"n":200}]},{"skill":"SKD043","alternatives":[{"name":"burst-focus","wins":200,"n":200},{"name":"barrier","wins":200,"n":200},{"name":"double-rock","wins":154,"n":200},{"name":"rear-focus","wins":126,"n":200},{"name":"poison-boost","wins":43,"n":200},{"name":"cheap-attacks","wins":4,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
|1/1 雑賀孫市 (8-5/1/1)|atk|6660→4090|全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|3/1 伊達政宗 (8-5/3/1)|atk|6660→2512|到達耐久で役割を維持できない主な攻撃源を調整|
|3/2 立花宗茂 (8-5/3/2)|atk|3770→2724|到達耐久で役割を維持できない主な攻撃源を調整|


全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 8-5-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 8-5-validated.json.gz／8-5-sample-trace.json.gz。失敗した独立検証回は 8-5-validation-v1／round-*。

---

## 8-6 雨上がりの坂
ID: izumo-6。設計意図: 一人失っても立て直す
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更0項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv79、覚醒3。R装備Lv40／LB0。技LB4。
到達経路: double-rock／armor-break／remove-buff-replace-SKD009-SKD008／defensiveの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 土属性集中＋攻撃強化 100.0% (200/200)、72〜89行動。変更前の同編成: 100.0% (200/200)。別戦法: 防御低下 100.0% (200/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|土属性集中＋攻撃強化 100.0% (200/200)|
|次点（60%前後）|土属性集中＋攻撃強化・配置35241（中心技の発動が半数未満・比較用） 66.0% (132/200)|
|ギリギリ（30%前後）|土属性集中＋攻撃強化・配置35142 34.5% (69/200)|
|ほぼ厳しい（0%超〜10%）|防御低下（逆順比較） 2.0% (4/200)|
|未勝利（観測0%）|該当なし|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|土属性集中＋攻撃強化 (double-rock)|100.0% (200/200)・72〜89行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":8645,"SKD009":5271,"SKD003":552,"SKD039":682,"SKD035":369}。未発動なし。敗北{"final_wave_defeated":200}|
|強化解除（中心技の発動が半数未満・比較用） (remove-buff)|100.0% (200/200)・65〜93行動|char_joe_01:SKD051 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":8482,"SKD009":2163,"SKD008":3596,"SKD039":580,"SKD035":401}。未発動SKD051。敗北{"final_wave_defeated":200}|
|防御低下 (armor-break)|100.0% (200/200)・70〜94行動|char_joe_01:SKD003 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":8659,"SKD009":2009,"SKD003":564,"SKD008":3241,"SKD039":681,"SKD038":761}。未発動なし。敗北{"final_wave_defeated":200}|
|攻防弱体・継続回復 (defensive)|100.0% (200/200)・74〜91行動|char_joe_01:SKD036 ／ char_yuki_01:SKD037 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":9197,"SKD009":2658,"SKD037":1215,"SKD008":3080,"SKD043":214,"SKD036":85}。未発動なし。敗北{"final_wave_defeated":200}|
|攻撃強化（逆順比較） (attack-up-reversed)|81.0% (162/200)・75〜126行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD008 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":9158,"SKD003":8232,"SKD009":881,"SKD008":2182,"SKD039":227,"SKD035":417}。未発動なし。敗北{"final_wave_defeated":162,"party_defeated":38}|
|後列集中（逆順比較） (rear-focus-reversed)|16.5% (33/200)・106〜126行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD027 ／ char_daimon_01:SKD026 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":9629,"SKD003":10792,"SKD027":720,"SKD026":1802,"SKD039":200,"SKD035":341}。未発動なし。敗北{"party_defeated":167,"final_wave_defeated":33}|
|防御低下（逆順比較） (armor-break-reversed)|2.0% (4/200)・103〜128行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD008 ／ char_yuki_01:SKD038 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":8846,"SKD038":1276,"SKD003":10021,"SKD008":744,"SKD009":327,"SKD039":10}。未発動なし。敗北{"party_defeated":196,"final_wave_defeated":4}|
|強化解除・SKD009-SKD008置換（中心技の発動が半数未満・比較用） (remove-buff-replace-SKD009-SKD008)|100.0% (200/200)・68〜90行動|char_joe_01:SKD051 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD008 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":8595,"SKD008":5610,"SKD039":619,"SKD035":334}。未発動SKD051。敗北{"final_wave_defeated":200}|
|土属性集中＋攻撃強化・配置35241（中心技の発動が半数未満・比較用） (double-rock-order-35241)|66.0% (132/200)・83〜111行動|char_daimon_01:SKD009 ／ char_aoi_01:SKD039 ／ char_yuki_01:SKD035 ／ char_jihoon_01:SKD009 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":8399,"SKD009":3967,"SKD003":7013,"SKD035":83,"SKD039":325}。未発動なし。敗北{"final_wave_defeated":132,"party_defeated":68}|
|土属性集中＋攻撃強化・配置35142 (double-rock-order-35142)|34.5% (69/200)・91〜119行動|char_daimon_01:SKD009 ／ char_aoi_01:SKD039 ／ char_joe_01:SKD003 ／ char_jihoon_01:SKD009 ／ char_yuki_01:SKD035|前面までの確定供給案・育成予算内。{"basic":12368,"SKD003":3557,"SKD009":4024,"SKD035":1537,"SKD039":307}。未発動なし。敗北{"final_wave_defeated":69,"party_defeated":131}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|79／3|19523.81／2724.27／1907.52|weapon:WEAPON_009 Lv40 LB0 {"hp":0,"atk":345.39112654938333,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv40 LB0 {"hp":129.52167245601876,"atk":0,"def":112.25211612854959,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv40 LB0 {"hp":1208.8689429228418,"atk":0,"def":34.539112654938336,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv40 LB0 {"hp":431.7389081867292,"atk":0,"def":103.61733796481501,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD003 土割り LB4 SP25 first [{"type":"damage","power":119.31487311780691}] 入手:チュートリアル確定|
|2|竹中半兵衛 (char_yuki_01)|79／3|20429.61／2675.22／1860.17|weapon:WEAPON_009 Lv40 LB0 {"hp":0,"atk":345.39112654938333,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv40 LB0 {"hp":129.52167245601876,"atk":0,"def":112.25211612854959,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv40 LB0 {"hp":1208.8689429228418,"atk":0,"def":34.539112654938336,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv40 LB0 {"hp":431.7389081867292,"atk":0,"def":103.61733796481501,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD035 鬨の声 LB4 SP75 all_allies [{"type":"atk_up","power":10.226758040547743,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|3|井伊直政 (char_daimon_01)|79／3|14192.53／4193.85／1488.69|weapon:WEAPON_009 Lv40 LB0 {"hp":0,"atk":345.39112654938333,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv40 LB0 {"hp":129.52167245601876,"atk":0,"def":112.25211612854959,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv40 LB0 {"hp":1208.8689429228418,"atk":0,"def":34.539112654938336,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv40 LB0 {"hp":431.7389081867292,"atk":0,"def":103.61733796481501,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD009 岩断 LB4 SP50 first [{"type":"damage","power":145.44866332054562}] 入手:1-2 現行初回/任務確定|
|4|前田利家 (char_jihoon_01)|79／3|16677.01／3616.58／1674.43|weapon:WEAPON_009 Lv40 LB0 {"hp":0,"atk":345.39112654938333,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv40 LB0 {"hp":129.52167245601876,"atk":0,"def":112.25211612854959,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv40 LB0 {"hp":1208.8689429228418,"atk":0,"def":34.539112654938336,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv40 LB0 {"hp":431.7389081867292,"atk":0,"def":103.61733796481501,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD009 岩断 LB4 SP50 first [{"type":"damage","power":145.44866332054562}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|79／3|15577.11／3910.88／1499.61|weapon:WEAPON_009 Lv40 LB0 {"hp":0,"atk":345.39112654938333,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv40 LB0 {"hp":129.52167245601876,"atk":0,"def":112.25211612854959,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv40 LB0 {"hp":1208.8689429228418,"atk":0,"def":34.539112654938336,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv40 LB0 {"hp":431.7389081867292,"atk":0,"def":103.61733796481501,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD039 応急手当 LB4 SP35 lowest_ally [{"type":"heal","power":44.54324874520461,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":1331650,"eqExp":695600,"cash":2099450,"skillMaterials":60,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_yuki_01":36,"char_daimon_01":36,"char_jihoon_01":36,"char_aoi_01":36},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":1331650,"eqExp":1159400,"cash":2783350,"skillMaterials":512,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_daimon_01":36,"char_aoi_01":36,"char_jihoon_01":36,"char_yuki_01":36},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"skill","id":"SKD051","amount":1},{"kind":"cash","amount":45750},{"kind":"character_exp_item","id":"xlarge","amount":1},{"kind":"character_exp_item","id":"large","amount":2},{"kind":"character_exp_item","id":"medium","amount":4},{"kind":"character_exp_item","id":"small","amount":5},{"kind":"skill_material","amount":20}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":2414350,"charExp":1216250,"eqExp":1107500,"skillMaterials":496,"genericR":180}。追加案なしのEXP/銭周回比較: {"stage":"8-5","successfulClears":923,"energy":7384,"recipeSource":"8-5-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ823〜974（各試行の最小値）、最大8025〜9774。1ダメージ0/14468攻撃イベント。BURST0〜4回。SP獲得1034〜1540、技消費965〜1515、終了SP11〜92。
double-rock（元 100.0% (200/200)）の配置順だけ逆転: 91.5% (183/200)、79〜121行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD003","alternatives":[{"name":"remove-buff-replace-SKD009-SKD008","wins":200,"n":200},{"name":"remove-buff","wins":200,"n":200},{"name":"defensive","wins":200,"n":200}]},{"skill":"SKD035","alternatives":[{"name":"armor-break","wins":200,"n":200},{"name":"defensive","wins":200,"n":200},{"name":"armor-break-reversed","wins":4,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"remove-buff-replace-SKD009-SKD008","wins":200,"n":200},{"name":"rear-focus-reversed","wins":33,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"defensive","wins":200,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
数値変更なし。

全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 8-6-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 8-6-validated.json.gz／8-6-sample-trace.json.gz。失敗した独立検証回は 8-6-validation-v1／round-*。

---

## 8-7 雲間の月
ID: izumo-7。設計意図: 効果が切れた後も戦う
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更5項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv80、覚醒3。R装備Lv40／LB0。技LB4。
到達経路: burst-focus-greater-heal／rear-focusの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: SP供給＋大回復 100.0% (200/200)、182〜211行動。変更前の同編成: 0.0% (0/200)。別戦法: 後列集中 100.0% (200/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|SP供給＋大回復 100.0% (200/200)|
|次点（60%前後）|該当なし|
|ギリギリ（30%前後）|該当なし|
|ほぼ厳しい（0%超〜10%）|SP供給＋大回復・配置31425 5.5% (11/200)|
|未勝利（観測0%）|攻撃強化（逆順比較） 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|SP供給＋大回復 (burst-focus-greater-heal)|100.0% (200/200)・182〜211行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD040|前面までの確定供給案・育成予算内。{"basic":30305,"SKD009":1588,"SKD007":2044,"SKD040":6047}。未発動なし。敗北{"final_wave_defeated":200}|
|後列集中 (rear-focus)|100.0% (200/200)・272〜296行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD026 ／ char_jihoon_01:SKD027 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":31071,"SKD027":2366,"SKD003":200,"SKD026":1823,"SKD039":20525,"SKD035":82}。未発動なし。敗北{"final_wave_defeated":200}|
|攻撃強化（中心技の発動が半数未満・比較用） (attack-up)|91.0% (182/200)・61〜296行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":28558,"SKD009":1128,"SKD003":200,"SKD007":1956,"SKD039":19837,"SKD035":82}。未発動なし。敗北{"final_wave_defeated":182,"party_defeated":18}|
|高消費技を先に装備 (expensive-first)|49.0% (98/200)・60〜292行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD019→SKD007 ／ char_jihoon_01:SKD007→SKD003 ／ char_aoi_01:SKD039|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":18270,"SKD007":1649,"SKD003":848,"SKD039":11799,"SKD019":1305}。未発動SKD035。敗北{"party_defeated":102,"final_wave_defeated":98}|
|攻撃強化（逆順比較） (attack-up-reversed)|0.0% (0/200)・47〜53行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD007 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":4249,"SKD003":3764,"SKD009":228,"SKD007":1270,"SKD035":154,"SKD039":54}。未発動なし。敗北{"party_defeated":200}|
|SP供給＋大回復・配置23415 (burst-focus-greater-heal-order-23415)|82.5% (165/200)・65〜227行動|char_yuki_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD009 ／ char_joe_01:技なし・通常攻撃でSP供給 ／ char_aoi_01:SKD040|前面までの確定供給案・育成予算内。{"basic":29188,"SKD007":1283,"SKD009":1255,"SKD040":6528}。未発動なし。敗北{"final_wave_defeated":165,"party_defeated":35}|
|SP供給＋大回復・配置31425 (burst-focus-greater-heal-order-31425)|5.5% (11/200)・70〜239行動|char_daimon_01:SKD007 ／ char_joe_01:技なし・通常攻撃でSP供給 ／ char_jihoon_01:SKD009 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_aoi_01:SKD040|前面までの確定供給案・育成予算内。{"basic":12113,"SKD007":201,"SKD009":1798,"SKD040":2553}。未発動なし。敗北{"party_defeated":189,"final_wave_defeated":11}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|80／3|19880.53／2772.82／1943.01|weapon:WEAPON_009 Lv40 LB0 {"hp":0,"atk":345.39112654938333,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv40 LB0 {"hp":129.52167245601876,"atk":0,"def":112.25211612854959,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv40 LB0 {"hp":1208.8689429228418,"atk":0,"def":34.539112654938336,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv40 LB0 {"hp":431.7389081867292,"atk":0,"def":103.61733796481501,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|技なし|
|2|竹中半兵衛 (char_yuki_01)|80／3|20804.53／2722.77／1894.65|weapon:WEAPON_009 Lv40 LB0 {"hp":0,"atk":345.39112654938333,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv40 LB0 {"hp":129.52167245601876,"atk":0,"def":112.25211612854959,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv40 LB0 {"hp":1208.8689429228418,"atk":0,"def":34.539112654938336,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv40 LB0 {"hp":431.7389081867292,"atk":0,"def":103.61733796481501,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|技なし|
|3|井伊直政 (char_daimon_01)|80／3|14442.13／4272.39／1515.21|weapon:WEAPON_009 Lv40 LB0 {"hp":0,"atk":345.39112654938333,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv40 LB0 {"hp":129.52167245601876,"atk":0,"def":112.25211612854959,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv40 LB0 {"hp":1208.8689429228418,"atk":0,"def":34.539112654938336,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv40 LB0 {"hp":431.7389081867292,"atk":0,"def":103.61733796481501,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD007 炎断 LB4 SP50 first [{"type":"damage","power":145.44866332054562}] 入手:4-1 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|80／3|16976.53／3683.34／1704.93|weapon:WEAPON_009 Lv40 LB0 {"hp":0,"atk":345.39112654938333,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv40 LB0 {"hp":129.52167245601876,"atk":0,"def":112.25211612854959,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv40 LB0 {"hp":1208.8689429228418,"atk":0,"def":34.539112654938336,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv40 LB0 {"hp":431.7389081867292,"atk":0,"def":103.61733796481501,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD009 岩断 LB4 SP50 first [{"type":"damage","power":145.44866332054562}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|80／3|15854.53／3983.64／1526.37|weapon:WEAPON_009 Lv40 LB0 {"hp":0,"atk":345.39112654938333,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv40 LB0 {"hp":129.52167245601876,"atk":0,"def":112.25211612854959,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv40 LB0 {"hp":1208.8689429228418,"atk":0,"def":34.539112654938336,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv40 LB0 {"hp":431.7389081867292,"atk":0,"def":103.61733796481501,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD040 治癒の祈り LB4 SP90 lowest_ally [{"type":"heal","power":98.85812186301152,"healingFormula":"caster_atk_percent"}] 入手:2-5 追加提案・前面初回確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":1369500,"eqExp":695600,"cash":2157300,"skillMaterials":80,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_yuki_01":36,"char_daimon_01":36,"char_jihoon_01":36,"char_aoi_01":36},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":1369500,"eqExp":1159400,"cash":2821200,"skillMaterials":512,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_daimon_01":36,"char_aoi_01":36,"char_jihoon_01":36,"char_yuki_01":36},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"cash","amount":26350},{"kind":"character_exp_item","id":"xlarge","amount":1},{"kind":"character_exp_item","id":"large","amount":3}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":2440700,"charExp":1251300,"eqExp":1105500,"skillMaterials":496,"genericR":180}。追加案なしのEXP/銭周回比較: {"stage":"8-6","successfulClears":922,"energy":7376,"recipeSource":"8-6-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ611〜739（各試行の最小値）、最大7041〜7680。1ダメージ0/33937攻撃イベント。BURST0〜3回。SP獲得3225〜4103、技消費2850〜3800、終了SP265〜400。
burst-focus-greater-heal（元 100.0% (200/200)）の配置順だけ逆転: 0.0% (0/200)、45〜53行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD007","alternatives":[{"name":"rear-focus","wins":200,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"rear-focus","wins":200,"n":200},{"name":"expensive-first","wins":98,"n":200}]},{"skill":"SKD040","alternatives":[{"name":"rear-focus","wins":200,"n":200},{"name":"attack-up","wins":182,"n":200},{"name":"expensive-first","wins":98,"n":200},{"name":"attack-up-reversed","wins":0,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
|2/1 立花誾千代 (8-7/2/1)|hp|152210→121768|300行動に収まらない耐久負担を局所調整|
|2/1 立花誾千代 (8-7/2/1)|atk|4530→3273|到達耐久で役割を維持できない主な攻撃源を調整|
|3/1 前田慶次 (8-7/3/1)|atk|4530→3851|到達耐久で役割を維持できない主な攻撃源を調整|
|4/1 武田信玄 (8-7/4/1)|hp|152210→20430|300行動に収まらない耐久負担を局所調整|
|4/1 武田信玄 (8-7/4/1)|atk|4530→2782|到達耐久で役割を維持できない主な攻撃源を調整|


全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 8-7-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 8-7-validated.json.gz／8-7-sample-trace.json.gz。失敗した独立検証回は 8-7-validation-v1／round-*。

---

## 8-8 出雲の朝凪
ID: izumo-8。設計意図: 連戦用の5人を完成させる
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更4項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv80、覚醒3。R装備Lv40／LB0。技LB4。
到達経路: cleanse-dot／defensive／double-rock／cleanse-dot-replace-SKD009-SKD008の切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 継続被害解除 100.0% (200/200)、160〜206行動。変更前の同編成: 0.0% (0/200)。別戦法: 攻防弱体・継続回復 99.5% (199/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|継続被害解除 100.0% (200/200)|
|次点（60%前後）|継続被害解除・配置43215 66.0% (132/200)|
|ギリギリ（30%前後）|継続ダメージ＋弱体 24.0% (48/200)|
|ほぼ厳しい（0%超〜10%）|攻撃強化（逆順比較） 1.5% (3/200)|
|未勝利（観測0%）|該当なし|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|攻防弱体・継続回復 (defensive)|99.5% (199/200)・151〜193行動|char_joe_01:SKD036 ／ char_yuki_01:SKD037 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":18644,"SKD009":5029,"SKD037":1982,"SKD007":6945,"SKD043":876,"SKD036":251}。未発動なし。敗北{"final_wave_defeated":199,"party_defeated":1}|
|継続被害解除 (cleanse-dot)|100.0% (200/200)・160〜206行動|char_joe_01:SKD054 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":18858,"SKD009":3457,"SKD007":9193,"SKD035":447,"SKD054":197,"SKD039":4176}。未発動なし。敗北{"final_wave_defeated":200}|
|土属性集中＋攻撃強化 (double-rock)|94.5% (189/200)・154〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":20281,"SKD009":13040,"SKD003":1412,"SKD039":4032,"SKD035":497}。未発動なし。敗北{"final_wave_defeated":189,"party_defeated":10,"action_limit":1}|
|SP供給と強化 (basic-focus)|45.5% (91/200)・138〜280行動|char_joe_01:SKD035 ／ char_yuki_01:SKD003 ／ char_daimon_01:SKD003 ／ char_jihoon_01:SKD003 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":17066,"SKD003":21521,"SKD039":4900}。未発動SKD035。敗北{"party_defeated":109,"final_wave_defeated":91}|
|継続ダメージ＋弱体 (poison-control)|24.0% (48/200)・163〜207行動|char_joe_01:SKD037 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD029 ／ char_jihoon_01:SKD007 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":19718,"SKD007":6550,"SKD038":1997,"SKD029":4987,"SKD037":492,"SKD043":1410}。未発動なし。敗北{"final_wave_defeated":48,"party_defeated":152}|
|攻撃強化（逆順比較） (attack-up-reversed)|1.5% (3/200)・154〜228行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD007 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":18909,"SKD003":6870,"SKD009":4127,"SKD007":5025,"SKD039":3988,"SKD035":700}。未発動なし。敗北{"party_defeated":197,"final_wave_defeated":3}|
|継続被害解除・SKD009-SKD008置換 (cleanse-dot-replace-SKD009-SKD008)|100.0% (200/200)・150〜200行動|char_joe_01:SKD054 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD008 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":18509,"SKD008":3201,"SKD007":9004,"SKD035":476,"SKD054":198,"SKD039":3940}。未発動なし。敗北{"final_wave_defeated":200}|
|継続被害解除・配置43215 (cleanse-dot-order-43215)|66.0% (132/200)・163〜300行動|char_jihoon_01:SKD009 ／ char_daimon_01:SKD007 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD054 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":33986,"SKD009":916,"SKD007":6985,"SKD039":10217,"SKD054":219,"SKD035":3222}。未発動なし。敗北{"final_wave_defeated":132,"party_defeated":9,"action_limit":59}|
|継続被害解除・配置43152 (cleanse-dot-order-43152)|12.0% (24/200)・179〜300行動|char_jihoon_01:SKD009 ／ char_daimon_01:SKD007 ／ char_joe_01:SKD054 ／ char_aoi_01:SKD039 ／ char_yuki_01:SKD035|前面までの確定供給案・育成予算内。{"basic":30746,"SKD035":4900,"SKD009":1979,"SKD007":5414,"SKD039":8646,"SKD054":150}。未発動なし。敗北{"final_wave_defeated":24,"party_defeated":128,"action_limit":48}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|80／3|19880.53／2772.82／1943.01|weapon:WEAPON_009 Lv40 LB0 {"hp":0,"atk":345.39112654938333,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv40 LB0 {"hp":129.52167245601876,"atk":0,"def":112.25211612854959,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv40 LB0 {"hp":1208.8689429228418,"atk":0,"def":34.539112654938336,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv40 LB0 {"hp":431.7389081867292,"atk":0,"def":103.61733796481501,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD054 浄毒 LB4 SP38 first_ally [{"type":"cleanse","power":1,"cleanseCategory":"dot"}] 入手:5-6 追加提案・前面初回確定|
|2|竹中半兵衛 (char_yuki_01)|80／3|20804.53／2722.77／1894.65|weapon:WEAPON_009 Lv40 LB0 {"hp":0,"atk":345.39112654938333,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv40 LB0 {"hp":129.52167245601876,"atk":0,"def":112.25211612854959,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv40 LB0 {"hp":1208.8689429228418,"atk":0,"def":34.539112654938336,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv40 LB0 {"hp":431.7389081867292,"atk":0,"def":103.61733796481501,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD035 鬨の声 LB4 SP75 all_allies [{"type":"atk_up","power":10.226758040547743,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|3|井伊直政 (char_daimon_01)|80／3|14442.13／4272.39／1515.21|weapon:WEAPON_009 Lv40 LB0 {"hp":0,"atk":345.39112654938333,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv40 LB0 {"hp":129.52167245601876,"atk":0,"def":112.25211612854959,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv40 LB0 {"hp":1208.8689429228418,"atk":0,"def":34.539112654938336,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv40 LB0 {"hp":431.7389081867292,"atk":0,"def":103.61733796481501,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD007 炎断 LB4 SP50 first [{"type":"damage","power":145.44866332054562}] 入手:4-1 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|80／3|16976.53／3683.34／1704.93|weapon:WEAPON_009 Lv40 LB0 {"hp":0,"atk":345.39112654938333,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv40 LB0 {"hp":129.52167245601876,"atk":0,"def":112.25211612854959,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv40 LB0 {"hp":1208.8689429228418,"atk":0,"def":34.539112654938336,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv40 LB0 {"hp":431.7389081867292,"atk":0,"def":103.61733796481501,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD009 岩断 LB4 SP50 first [{"type":"damage","power":145.44866332054562}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|80／3|15854.53／3983.64／1526.37|weapon:WEAPON_009 Lv40 LB0 {"hp":0,"atk":345.39112654938333,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv40 LB0 {"hp":129.52167245601876,"atk":0,"def":112.25211612854959,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv40 LB0 {"hp":1208.8689429228418,"atk":0,"def":34.539112654938336,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv40 LB0 {"hp":431.7389081867292,"atk":0,"def":103.61733796481501,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD039 応急手当 LB4 SP35 lowest_ally [{"type":"heal","power":44.54324874520461,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":1369500,"eqExp":695600,"cash":2167300,"skillMaterials":90,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_yuki_01":36,"char_daimon_01":36,"char_jihoon_01":36,"char_aoi_01":36},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":1369500,"eqExp":1159400,"cash":2821200,"skillMaterials":512,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_daimon_01":36,"char_aoi_01":36,"char_jihoon_01":36,"char_yuki_01":36},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: []。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":2429200,"charExp":1248500,"eqExp":1103500,"skillMaterials":496,"genericR":180}。追加案なしのEXP/銭周回比較: {"stage":"8-7","successfulClears":920,"energy":7360,"recipeSource":"8-7-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ0〜503（各試行の最小値）、最大8286〜10439。1ダメージ0/31508攻撃イベント。BURST4〜9回。SP獲得2222〜3311、技消費2123〜3253、終了SP11〜310。
cleanse-dot（元 100.0% (200/200)）の配置順だけ逆転: 2.5% (5/200)、183〜238行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD054","alternatives":[{"name":"defensive","wins":199,"n":200},{"name":"double-rock","wins":189,"n":200},{"name":"basic-focus","wins":91,"n":200},{"name":"poison-control","wins":48,"n":200},{"name":"attack-up-reversed","wins":3,"n":200}]},{"skill":"SKD035","alternatives":[{"name":"defensive","wins":199,"n":200},{"name":"poison-control","wins":48,"n":200}]},{"skill":"SKD007","alternatives":[{"name":"double-rock","wins":189,"n":200},{"name":"basic-focus","wins":91,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"cleanse-dot-replace-SKD009-SKD008","wins":200,"n":200},{"name":"basic-focus","wins":91,"n":200},{"name":"poison-control","wins":48,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"defensive","wins":199,"n":200},{"name":"poison-control","wins":48,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
|3/1 伊達政宗 (8-8/3/1)|atk|6200→4480|全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|5/1 本多忠勝 (8-8/5/1)|atk|6200→2751|到達耐久で役割を維持できない主な攻撃源を調整|
|6/1 織田信長 (8-8/6/1)|atk|7000→3654|到達耐久で役割を維持できない主な攻撃源を調整|
|6/2 お市の方 (8-8/6/2)|atk|5600→4046|到達耐久で役割を維持できない主な攻撃源を調整|


全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 8-8-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 8-8-validated.json.gz／8-8-sample-trace.json.gz。失敗した独立検証回は 8-8-validation-v1／round-*。

---

## 9-1 南道の関
ID: satsuma-1。設計意図: 単体突破の極意
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更2項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv80、覚醒3。R装備Lv50／LB0。技LB5。
到達経路: break-and-buff／taunt-counter／armor-break／double-rock／break-and-buff-replace-SKD009-SKD010／defensiveの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 防御低下＋攻撃強化 100.0% (200/200)、88〜205行動。変更前の同編成: 0.0% (0/200)。別戦法: 挑発・反撃 100.0% (200/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|防御低下＋攻撃強化 100.0% (200/200)|
|次点（60%前後）|防御低下＋攻撃強化・配置35241 61.0% (122/200)|
|ギリギリ（30%前後）|支援なし比較 28.5% (57/200)|
|ほぼ厳しい（0%超〜10%）|継続ダメージ＋弱体 5.0% (10/200)|
|未勝利（観測0%）|低消費攻撃のみ比較 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|防御低下＋攻撃強化 (break-and-buff)|100.0% (200/200)・88〜205行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":12380,"SKD009":3464,"SKD038":1554,"SKD010":4830,"SKD039":1494,"SKD035":90}。未発動なし。敗北{"final_wave_defeated":200}|
|挑発・反撃 (taunt-counter)|100.0% (200/200)・88〜202行動|char_joe_01:SKD049→SKD048 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":13884,"SKD009":3442,"SKD048":395,"SKD010":6284,"SKD049":200,"SKD035":490,"SKD039":1535}。未発動なし。敗北{"final_wave_defeated":200}|
|防御低下 (armor-break)|99.0% (198/200)・90〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":13147,"SKD009":3583,"SKD003":1330,"SKD010":5423,"SKD038":921,"SKD039":1723}。未発動なし。敗北{"final_wave_defeated":198,"action_limit":1,"party_defeated":1}|
|土属性集中＋攻撃強化 (double-rock)|72.0% (144/200)・150〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":25032,"SKD009":16834,"SKD003":1297,"SKD039":4397,"SKD035":301}。未発動なし。敗北{"final_wave_defeated":144,"action_limit":43,"party_defeated":13}|
|攻防弱体・継続回復 (defensive)|98.0% (196/200)・112〜300行動|char_joe_01:SKD036 ／ char_yuki_01:SKD037 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":16530,"SKD009":4571,"SKD037":1922,"SKD010":6490,"SKD043":684,"SKD036":303}。未発動なし。敗北{"final_wave_defeated":196,"action_limit":4}|
|支援なし比較 (no-support)|28.5% (57/200)・166〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD003 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":27929,"SKD009":12397,"SKD003":7132,"SKD010":3594,"SKD039":6255}。未発動なし。敗北{"final_wave_defeated":57,"action_limit":130,"party_defeated":13}|
|後列集中 (rear-focus)|16.5% (33/200)・211〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD026 ／ char_jihoon_01:SKD027 ／ char_aoi_01:SKD039|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":29646,"SKD027":10212,"SKD003":4025,"SKD026":9732,"SKD039":4595,"SKD035":451}。未発動なし。敗北{"action_limit":166,"final_wave_defeated":33,"party_defeated":1}|
|継続ダメージ＋弱体 (poison-control)|5.0% (10/200)・159〜300行動|char_joe_01:SKD037 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD029 ／ char_jihoon_01:SKD010 ／ char_aoi_01:SKD043|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":37456,"SKD010":9182,"SKD038":1561,"SKD029":4760,"SKD037":668,"SKD043":5152}。未発動なし。敗北{"action_limit":190,"final_wave_defeated":10}|
|低消費攻撃のみ比較 (all-cheap)|0.0% (0/200)・170〜197行動|char_joe_01:SKD003 ／ char_yuki_01:SKD003 ／ char_daimon_01:SKD003 ／ char_jihoon_01:SKD003 ／ char_aoi_01:SKD003|前面までの確定供給案・育成予算内。{"basic":11876,"SKD003":23959}。未発動なし。敗北{"party_defeated":200}|
|防御低下＋攻撃強化・SKD009-SKD010置換 (break-and-buff-replace-SKD009-SKD010)|100.0% (200/200)・80〜148行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD010 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":11616,"SKD010":7565,"SKD038":1497,"SKD035":97,"SKD039":1411}。未発動なし。敗北{"final_wave_defeated":200}|
|防御低下＋攻撃強化・配置35241 (break-and-buff-order-35241)|61.0% (122/200)・128〜300行動|char_daimon_01:SKD010 ／ char_aoi_01:SKD039 ／ char_yuki_01:SKD038 ／ char_jihoon_01:SKD009 ／ char_joe_01:SKD035|前面までの確定供給案・育成予算内。{"basic":22723,"SKD009":11268,"SKD038":1700,"SKD010":1355,"SKD039":2624,"SKD035":1779}。未発動なし。敗北{"final_wave_defeated":122,"party_defeated":76,"action_limit":2}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|80／3|20522.93／2898.16／2033.88|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD035 鬨の声 LB5 SP75 all_allies [{"type":"atk_up","power":10.943137453388001,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|2|竹中半兵衛 (char_yuki_01)|80／3|21446.93／2848.11／1985.52|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD038 鎧砕き LB5 SP50 first [{"type":"def_down","power":17.465826699149144,"duration":3,"carryAcrossWaves":true}] 入手:2-5 追加提案・前面初回確定|
|3|井伊直政 (char_daimon_01)|80／3|15084.53／4397.74／1606.08|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD010 風断 LB5 SP50 first [{"type":"damage","power":153.63585661014858}] 入手:2-5 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|80／3|17618.93／3808.69／1795.80|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD009 岩断 LB5 SP50 first [{"type":"damage","power":153.63585661014858}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|80／3|16496.93／4108.99／1617.24|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD039 応急手当 LB5 SP35 lowest_ally [{"type":"heal","power":47.613446228805714,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":1369500,"eqExp":1149200,"cash":2439100,"skillMaterials":135,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_yuki_01":36,"char_daimon_01":36,"char_jihoon_01":36,"char_aoi_01":36},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":1369500,"eqExp":1613000,"cash":3148000,"skillMaterials":612,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_daimon_01":36,"char_aoi_01":36,"char_jihoon_01":36,"char_yuki_01":36},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"cash","amount":303800},{"kind":"equipment_exp_item","id":"xlarge","amount":21},{"kind":"equipment_exp_item","id":"large","amount":3},{"kind":"equipment_exp_item","id":"medium","amount":2},{"kind":"equipment_exp_item","id":"small","amount":6},{"kind":"skill_material","amount":100}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":2744500,"charExp":1245700,"eqExp":1555100,"skillMaterials":596,"genericR":180}。追加案なしのEXP/銭周回比較: {"stage":"8-8","successfulClears":1296,"energy":10368,"recipeSource":"8-8-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ1〜1（各試行の最小値）、最大5227〜7269。1ダメージ9014/20674攻撃イベント。BURST2〜9回。SP獲得1133〜2915、技消費1120〜2895、終了SP11〜88。
break-and-buff（元 100.0% (200/200)）の配置順だけ逆転: 59.5% (119/200)、107〜275行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD035","alternatives":[{"name":"armor-break","wins":198,"n":200},{"name":"defensive","wins":196,"n":200},{"name":"no-support","wins":57,"n":200},{"name":"poison-control","wins":10,"n":200},{"name":"all-cheap","wins":0,"n":200}]},{"skill":"SKD038","alternatives":[{"name":"taunt-counter","wins":200,"n":200},{"name":"defensive","wins":196,"n":200},{"name":"double-rock","wins":144,"n":200},{"name":"no-support","wins":57,"n":200},{"name":"rear-focus","wins":33,"n":200},{"name":"all-cheap","wins":0,"n":200}]},{"skill":"SKD010","alternatives":[{"name":"double-rock","wins":144,"n":200},{"name":"rear-focus","wins":33,"n":200},{"name":"all-cheap","wins":0,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"break-and-buff-replace-SKD009-SKD010","wins":200,"n":200},{"name":"rear-focus","wins":33,"n":200},{"name":"poison-control","wins":10,"n":200},{"name":"all-cheap","wins":0,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"defensive","wins":196,"n":200},{"name":"poison-control","wins":10,"n":200},{"name":"all-cheap","wins":0,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
|2/1 徳川家康 (9-1/2/1)|atk|8330→3697|到達耐久で役割を維持できない主な攻撃源を調整|
|2/1 徳川家康 (9-1/2/1)|def|15860→4003|防御が到達火力を上回る敵のみ突破余地を確保／強化後DEF/実ダメージの停滞を確認した敵を局所調整|


全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 9-1-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 9-1-validated.json.gz／9-1-sample-trace.json.gz。失敗した独立検証回は 9-1-validation-v1／round-*。

---

## 9-2 入り江の砲声
ID: satsuma-2。設計意図: 全体削りの極意
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更10項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv80、覚醒3。R装備Lv50／LB0。技LB5。
到達経路: burst-focus-greater-heal／rear-focusの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: SP供給＋大回復 100.0% (200/200)、187〜221行動。変更前の同編成: 0.0% (0/200)。別戦法: 後列集中 99.5% (199/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|SP供給＋大回復 100.0% (200/200)|
|次点（60%前後）|SP供給と強化 52.0% (104/200)|
|ギリギリ（30%前後）|該当なし|
|ほぼ厳しい（0%超〜10%）|SP供給＋大回復・配置14253 6.0% (12/200)|
|未勝利（観測0%）|攻撃強化（逆順比較） 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|後列集中 (rear-focus)|99.5% (199/200)・67〜279行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD026 ／ char_jihoon_01:SKD027 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":23021,"SKD027":5724,"SKD003":200,"SKD026":4075,"SKD035":303,"SKD039":7198}。未発動なし。敗北{"final_wave_defeated":199,"party_defeated":1}|
|SP供給＋大回復 (burst-focus-greater-heal)|100.0% (200/200)・187〜221行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD040|前面までの確定供給案・育成予算内。{"basic":32554,"SKD009":2618,"SKD008":1825,"SKD040":4161}。未発動なし。敗北{"final_wave_defeated":200}|
|SP供給と強化 (basic-focus)|52.0% (104/200)・43〜275行動|char_joe_01:SKD035 ／ char_yuki_01:SKD003 ／ char_daimon_01:SKD003 ／ char_jihoon_01:SKD003 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":20663,"SKD003":5591,"SKD039":7456}。未発動SKD035。敗北{"final_wave_defeated":104,"party_defeated":96}|
|攻撃強化（逆順比較） (attack-up-reversed)|0.0% (0/200)・48〜59行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD008 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":4397,"SKD003":5119,"SKD009":269,"SKD008":600,"SKD035":131}。未発動SKD039。敗北{"party_defeated":200}|
|SP供給＋大回復・配置14253 (burst-focus-greater-heal-order-14253)|6.0% (12/200)・58〜95行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_jihoon_01:SKD009 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_aoi_01:SKD040 ／ char_daimon_01:SKD008|前面までの確定供給案・育成予算内。{"basic":9234,"SKD008":7129,"SKD009":585,"SKD040":49}。未発動なし。敗北{"party_defeated":188,"final_wave_defeated":12}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|80／3|20522.93／2898.16／2033.88|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|技なし|
|2|竹中半兵衛 (char_yuki_01)|80／3|21446.93／2848.11／1985.52|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|技なし|
|3|井伊直政 (char_daimon_01)|80／3|15084.53／4397.74／1606.08|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD008 水断 LB5 SP50 first [{"type":"damage","power":153.63585661014858}] 入手:4-5 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|80／3|17618.93／3808.69／1795.80|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD009 岩断 LB5 SP50 first [{"type":"damage","power":153.63585661014858}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|80／3|16496.93／4108.99／1617.24|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD040 治癒の祈り LB5 SP90 lowest_ally [{"type":"heal","power":106.5336155720143,"healingFormula":"caster_atk_percent"}] 入手:2-5 追加提案・前面初回確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":1369500,"eqExp":1149200,"cash":2424100,"skillMaterials":120,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_yuki_01":36,"char_daimon_01":36,"char_jihoon_01":36,"char_aoi_01":36},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":1369500,"eqExp":1613000,"cash":3198000,"skillMaterials":662,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_daimon_01":36,"char_aoi_01":36,"char_jihoon_01":36,"char_yuki_01":36},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"cash","amount":37000},{"kind":"skill_material","amount":50}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":2781500,"charExp":1241800,"eqExp":1552400,"skillMaterials":646,"genericR":180}。追加案なしのEXP/銭周回比較: {"stage":"9-1","successfulClears":863,"energy":6904,"recipeSource":"9-1-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ0〜0（各試行の最小値）、最大10346〜11513。1ダメージ0/36997攻撃イベント。BURST0〜4回。SP獲得2780〜3340、技消費2380〜2950、終了SP343〜400。
burst-focus-greater-heal（元 100.0% (200/200)）の配置順だけ逆転: 0.0% (0/200)、46〜61行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD008","alternatives":[{"name":"rear-focus","wins":199,"n":200},{"name":"basic-focus","wins":104,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"rear-focus","wins":199,"n":200},{"name":"basic-focus","wins":104,"n":200}]},{"skill":"SKD040","alternatives":[{"name":"rear-focus","wins":199,"n":200},{"name":"basic-focus","wins":104,"n":200},{"name":"attack-up-reversed","wins":0,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
|1/1 井伊直政 (9-2/1/1)|atk|11140→3572|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|1/2 立花宗茂 (9-2/1/2)|atk|11140→8049|到達耐久で役割を維持できない主な攻撃源を調整|
|1/3 小早川隆景 (9-2/1/3)|atk|11140→8049|到達耐久で役割を維持できない主な攻撃源を調整|
|2/1 島津義弘 (9-2/2/1)|hp|133140→68168|300行動に収まらない耐久負担を局所調整|
|2/1 島津義弘 (9-2/2/1)|atk|11140→4202|到達耐久で役割を維持できない主な攻撃源を調整|
|2/2 毛利元就 (9-2/2/2)|atk|11140→4944|到達耐久で役割を維持できない主な攻撃源を調整|
|2/3 立花誾千代 (9-2/2/3)|atk|11140→3036|到達耐久で役割を維持できない主な攻撃源を調整|
|3/1 伊達政宗 (9-2/3/1)|hp|133900→68557|300行動に収まらない耐久負担を局所調整|
|3/1 伊達政宗 (9-2/3/1)|atk|6700→4841|到達耐久で役割を維持できない主な攻撃源を調整|
|3/2 片倉景綱 (9-2/3/2)|atk|6180→5253|全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|


全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 9-2-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 9-2-validated.json.gz／9-2-sample-trace.json.gz。失敗した独立検証回は 9-2-validation-v1／round-*。

---

## 9-3 宵闇の陣屋
ID: satsuma-3。設計意図: 後列攻略の極意
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更9項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv80、覚醒3。R装備Lv50／LB0。技LB5。
到達経路: rear-focus／stun／rear-focus-replace-SKD003-SKD001／rear-focus-replace-SKD026-SKD027／rear-focus-replace-SKD039-SKD043の切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 後列集中 100.0% (200/200)、151〜252行動。変更前の同編成: 0.0% (0/200)。別戦法: 行動妨害 85.5% (171/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|後列集中 100.0% (200/200)|
|次点（60%前後）|後列集中・配置52314 66.0% (132/200)|
|ギリギリ（30%前後）|後列集中・配置23415 26.0% (52/200)|
|ほぼ厳しい（0%超〜10%）|該当なし|
|未勝利（観測0%）|攻撃強化（逆順比較） 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|後列集中 (rear-focus)|100.0% (200/200)・151〜252行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD026 ／ char_jihoon_01:SKD027 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":20120,"SKD027":5040,"SKD003":837,"SKD026":8873,"SKD035":1089,"SKD039":2283}。未発動なし。敗北{"final_wave_defeated":200}|
|行動妨害 (stun)|85.5% (171/200)・119〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD032 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD026 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":22993,"SKD026":11076,"SKD003":598,"SKD010":3086,"SKD032":158,"SKD039":6320}。未発動なし。敗北{"party_defeated":14,"final_wave_defeated":171,"action_limit":15}|
|保護解除 (remove-protection)|11.0% (22/200)・108〜300行動|char_joe_01:SKD052 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":19252,"SKD009":3433,"SKD052":200,"SKD010":3057,"SKD039":7846,"SKD035":220}。未発動なし。敗北{"action_limit":45,"party_defeated":133,"final_wave_defeated":22}|
|継続ダメージ＋弱体 (poison-control)|0.0% (0/200)・83〜103行動|char_joe_01:SKD037 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD029 ／ char_jihoon_01:SKD010 ／ char_aoi_01:SKD043|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":10580,"SKD010":2524,"SKD038":1127,"SKD029":2101,"SKD037":216,"SKD043":1203}。未発動なし。敗北{"party_defeated":200}|
|防御低下＋攻撃強化 (break-and-buff)|17.5% (35/200)・105〜300行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":19850,"SKD009":3637,"SKD038":849,"SKD010":2749,"SKD039":7990}。未発動SKD035。敗北{"final_wave_defeated":35,"party_defeated":115,"action_limit":50}|
|攻撃強化（逆順比較） (attack-up-reversed)|0.0% (0/200)・73〜78行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD010 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":6206,"SKD003":6455,"SKD009":584,"SKD010":1365,"SKD035":190}。未発動SKD039。敗北{"party_defeated":200}|
|後列集中・SKD003-SKD001置換 (rear-focus-replace-SKD003-SKD001)|100.0% (200/200)・145〜249行動|char_joe_01:SKD001 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD026 ／ char_jihoon_01:SKD027 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":20611,"SKD027":5020,"SKD001":859,"SKD026":8950,"SKD035":1050,"SKD039":2451}。未発動なし。敗北{"final_wave_defeated":200}|
|後列集中・SKD026-SKD027置換 (rear-focus-replace-SKD026-SKD027)|99.0% (198/200)・173〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD027 ／ char_jihoon_01:SKD027 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":21568,"SKD027":14299,"SKD003":3778,"SKD039":2752,"SKD035":703}。未発動なし。敗北{"final_wave_defeated":198,"action_limit":2}|
|後列集中・SKD039-SKD043置換 (rear-focus-replace-SKD039-SKD043)|96.5% (193/200)・163〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD026 ／ char_jihoon_01:SKD027 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":21840,"SKD027":5136,"SKD003":811,"SKD026":8735,"SKD035":1208,"SKD043":1314}。未発動なし。敗北{"final_wave_defeated":193,"action_limit":7}|
|後列集中・配置52314 (rear-focus-order-52314)|66.0% (132/200)・160〜300行動|char_aoi_01:SKD039 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD026 ／ char_joe_01:SKD003 ／ char_jihoon_01:SKD027|前面までの確定供給案・育成予算内。{"basic":22254,"SKD003":9986,"SKD027":8056,"SKD026":7517,"SKD039":279}。未発動SKD035。敗北{"final_wave_defeated":132,"party_defeated":35,"action_limit":33}|
|後列集中・配置23415 (rear-focus-order-23415)|26.0% (52/200)・198〜300行動|char_yuki_01:SKD035 ／ char_daimon_01:SKD026 ／ char_jihoon_01:SKD027 ／ char_joe_01:SKD003 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":25221,"SKD003":13244,"SKD026":6273,"SKD027":8016,"SKD039":4038,"SKD035":14}。未発動なし。敗北{"action_limit":148,"final_wave_defeated":52}|
|後列集中・配置43152 (rear-focus-order-43152)|0.0% (0/200)・88〜300行動|char_jihoon_01:SKD027 ／ char_daimon_01:SKD026 ／ char_joe_01:SKD003 ／ char_aoi_01:SKD039 ／ char_yuki_01:SKD035|前面までの確定供給案・育成予算内。{"basic":22549,"SKD003":7000,"SKD027":601,"SKD039":7564,"SKD026":1050,"SKD035":3093}。未発動なし。敗北{"action_limit":110,"party_defeated":90}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|80／3|20522.93／2898.16／2033.88|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD003 土割り LB5 SP25 first [{"type":"damage","power":123.92016934320858}] 入手:チュートリアル確定|
|2|竹中半兵衛 (char_yuki_01)|80／3|21446.93／2848.11／1985.52|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD035 鬨の声 LB5 SP75 all_allies [{"type":"atk_up","power":10.943137453388001,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|3|井伊直政 (char_daimon_01)|80／3|15084.53／4397.74／1606.08|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD026 後陣射ち LB5 SP55 last [{"type":"damage","power":136.5336155720143}] 入手:4-2 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|80／3|17618.93／3808.69／1795.80|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD027 追い討ち LB5 SP50 lowest_hp [{"type":"damage","power":143.63585661014858}] 入手:4-2 追加提案・前面初回確定|
|5|お市の方 (char_aoi_01)|80／3|16496.93／4108.99／1617.24|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD039 応急手当 LB5 SP35 lowest_ally [{"type":"heal","power":47.613446228805714,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":1369500,"eqExp":1149200,"cash":2424100,"skillMaterials":120,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_yuki_01":36,"char_daimon_01":36,"char_jihoon_01":36,"char_aoi_01":36},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":1369500,"eqExp":1613000,"cash":3223000,"skillMaterials":687,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_daimon_01":36,"char_aoi_01":36,"char_jihoon_01":36,"char_yuki_01":36},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"skill","id":"SKD001","amount":1},{"kind":"cash","amount":12000},{"kind":"skill_material","amount":25}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":2793500,"charExp":1237900,"eqExp":1549700,"skillMaterials":671,"genericR":180}。追加案なしのEXP/銭周回比較: {"stage":"9-2","successfulClears":861,"energy":6888,"recipeSource":"9-2-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ0〜1（各試行の最小値）、最大5255〜7372。1ダメージ14981/34870攻撃イベント。BURST4〜10回。SP獲得2123〜3982、技消費2110〜3960、終了SP11〜78。
rear-focus（元 100.0% (200/200)）の配置順だけ逆転: 0.0% (0/200)、133〜300行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD003","alternatives":[{"name":"rear-focus-replace-SKD003-SKD001","wins":200,"n":200},{"name":"break-and-buff","wins":35,"n":200},{"name":"remove-protection","wins":22,"n":200},{"name":"poison-control","wins":0,"n":200}]},{"skill":"SKD035","alternatives":[{"name":"stun","wins":171,"n":200},{"name":"poison-control","wins":0,"n":200}]},{"skill":"SKD026","alternatives":[{"name":"rear-focus-replace-SKD026-SKD027","wins":198,"n":200},{"name":"break-and-buff","wins":35,"n":200},{"name":"remove-protection","wins":22,"n":200},{"name":"attack-up-reversed","wins":0,"n":200},{"name":"poison-control","wins":0,"n":200}]},{"skill":"SKD027","alternatives":[{"name":"stun","wins":171,"n":200},{"name":"break-and-buff","wins":35,"n":200},{"name":"remove-protection","wins":22,"n":200},{"name":"attack-up-reversed","wins":0,"n":200},{"name":"poison-control","wins":0,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"rear-focus-replace-SKD039-SKD043","wins":193,"n":200},{"name":"poison-control","wins":0,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
|1/1 加藤清正 (9-3/1/1)|def|9080→3403|防御が到達火力を上回る敵のみ突破余地を確保／強化後DEF/実ダメージの停滞を確認した敵を局所調整|
|1/2 真田昌幸 (9-3/1/2)|atk|5720→4133|全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|1/3 細川ガラシャ (9-3/1/3)|atk|20890→5692|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|2/1 本多忠勝 (9-3/2/1)|hp|84720→17768|300行動に収まらない耐久負担を局所調整|
|2/1 本多忠勝 (9-3/2/1)|atk|6200→2751|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|2/1 本多忠勝 (9-3/2/1)|def|9080→4003|防御が到達火力を上回る敵のみ突破余地を確保／強化後DEF/実ダメージの停滞を確認した敵を局所調整|
|2/2 濃姫 (9-3/2/2)|hp|28620→18317|300行動に収まらない耐久負担を局所調整|
|2/2 濃姫 (9-3/2/2)|atk|5720→2986|到達耐久で役割を維持できない主な攻撃源を調整|
|2/3 豊臣秀吉 (9-3/2/3)|atk|20890→1462|到達耐久で役割を維持できない主な攻撃源を調整／回復供給の膠着を緩和し処理順の選択を残す|


全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 9-3-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 9-3-validated.json.gz／9-3-sample-trace.json.gz。失敗した独立検証回は 9-3-validation-v1／round-*。

---

## 9-4 鉄火の街道
ID: satsuma-4。設計意図: 通常攻撃の極意
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更9項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv80、覚醒3。R装備Lv50／LB0。技LB5。
到達経路: break-regen／break-and-buff／remove-buff／break-regen-replace-SKD010-SKD007／break-regen-replace-SKD009-SKD010の切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: SP供給＋防御低下・継続回復 100.0% (200/200)、179〜278行動。変更前の同編成: 0.0% (0/200)。別戦法: 防御低下＋攻撃強化 99.5% (199/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|SP供給＋防御低下・継続回復 100.0% (200/200)|
|次点（60%前後）|該当なし|
|ギリギリ（30%前後）|該当なし|
|ほぼ厳しい（0%超〜10%）|攻撃強化 1.0% (2/200)|
|未勝利（観測0%）|土属性集中＋攻撃強化 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|SP供給＋防御低下・継続回復 (break-regen)|100.0% (200/200)・179〜278行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":24604,"SKD009":4964,"SKD038":3929,"SKD010":10409,"SKD043":1080}。未発動なし。敗北{"final_wave_defeated":200}|
|防御低下＋攻撃強化 (break-and-buff)|99.5% (199/200)・194〜300行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":25461,"SKD009":4627,"SKD038":3506,"SKD035":1310,"SKD010":10006,"SKD039":2670}。未発動なし。敗北{"final_wave_defeated":199,"action_limit":1}|
|強化解除（中心技の発動が半数未満・比較用） (remove-buff)|73.5% (147/200)・237〜300行動|char_joe_01:SKD051 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":30858,"SKD009":4794,"SKD010":14766,"SKD035":2663,"SKD039":3775}。未発動SKD051。敗北{"action_limit":53,"final_wave_defeated":147}|
|土属性集中＋攻撃強化 (double-rock)|0.0% (0/200)・300〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":28220,"SKD009":17129,"SKD003":10540,"SKD035":366,"SKD039":3745}。未発動なし。敗北{"action_limit":200}|
|障壁 (barrier)|46.0% (92/200)・253〜300行動|char_joe_01:SKD045 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":32072,"SKD009":5013,"SKD010":14882,"SKD045":1916,"SKD035":2207,"SKD039":2506}。未発動なし。敗北{"final_wave_defeated":92,"action_limit":108}|
|反撃 (counter-boost)|47.0% (94/200)・253〜300行動|char_joe_01:SKD049 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":31559,"SKD009":4493,"SKD010":15542,"SKD049":1342,"SKD035":1504,"SKD039":4172}。未発動なし。敗北{"action_limit":106,"final_wave_defeated":94}|
|回復なし比較 (no-heal)|11.5% (23/200)・273〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD010|前面までの確定供給案・育成予算内。{"basic":29857,"SKD009":7689,"SKD003":5348,"SKD010":16106,"SKD035":455}。未発動なし。敗北{"final_wave_defeated":23,"party_defeated":40,"action_limit":137}|
|攻撃強化 (attack-up)|1.0% (2/200)・295〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":28240,"SKD009":5332,"SKD003":10514,"SKD010":11792,"SKD035":366,"SKD039":3749}。未発動なし。敗北{"action_limit":198,"final_wave_defeated":2}|
|SP供給＋防御低下・継続回復・SKD010-SKD007置換 (break-regen-replace-SKD010-SKD007)|86.0% (172/200)・219〜300行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":29464,"SKD009":6079,"SKD038":4780,"SKD007":12679,"SKD043":1313}。未発動なし。敗北{"final_wave_defeated":172,"action_limit":28}|
|SP供給＋防御低下・継続回復・SKD009-SKD010置換 (break-regen-replace-SKD009-SKD010)|100.0% (200/200)・178〜261行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD010 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":23494,"SKD010":14768,"SKD038":3759,"SKD043":1033}。未発動なし。敗北{"final_wave_defeated":200}|
|SP供給＋防御低下・継続回復・配置24351 (break-regen-order-24351)|47.0% (94/200)・242〜300行動|char_yuki_01:SKD038 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD010 ／ char_aoi_01:SKD043 ／ char_joe_01:技なし・通常攻撃でSP供給|前面までの確定供給案・育成予算内。{"basic":31965,"SKD038":5022,"SKD009":14896,"SKD010":5311,"SKD043":1657}。未発動なし。敗北{"action_limit":106,"final_wave_defeated":94}|
|SP供給＋防御低下・継続回復・配置54123 (break-regen-order-54123)|19.5% (39/200)・180〜300行動|char_aoi_01:SKD043 ／ char_jihoon_01:SKD009 ／ char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010|前面までの確定供給案・育成予算内。{"basic":32235,"SKD038":4787,"SKD009":6056,"SKD010":10664,"SKD043":696}。未発動なし。敗北{"final_wave_defeated":39,"party_defeated":123,"action_limit":38}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|80／3|20522.93／2898.16／2033.88|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|技なし|
|2|竹中半兵衛 (char_yuki_01)|80／3|21446.93／2848.11／1985.52|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD038 鎧砕き LB5 SP50 first [{"type":"def_down","power":17.465826699149144,"duration":3,"carryAcrossWaves":true}] 入手:2-5 追加提案・前面初回確定|
|3|井伊直政 (char_daimon_01)|80／3|15084.53／4397.74／1606.08|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD010 風断 LB5 SP50 first [{"type":"damage","power":153.63585661014858}] 入手:2-5 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|80／3|17618.93／3808.69／1795.80|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD009 岩断 LB5 SP50 first [{"type":"damage","power":153.63585661014858}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|80／3|16496.93／4108.99／1617.24|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD043 再生の祈り LB5 SP65 lowest_ally [{"type":"hot","power":21.306723114402857,"duration":3,"carryAcrossWaves":true}] 入手:3-4 追加提案・前面初回確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":1369500,"eqExp":1149200,"cash":2424100,"skillMaterials":120,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_yuki_01":36,"char_daimon_01":36,"char_jihoon_01":36,"char_aoi_01":36},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":1369500,"eqExp":1613000,"cash":3243000,"skillMaterials":707,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_daimon_01":36,"char_aoi_01":36,"char_jihoon_01":36,"char_yuki_01":36},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"cash","amount":7000},{"kind":"skill_material","amount":20}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":2800500,"charExp":1234000,"eqExp":1547000,"skillMaterials":691,"genericR":180}。追加案なしのEXP/銭周回比較: {"stage":"9-3","successfulClears":860,"energy":6880,"recipeSource":"9-3-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ1〜1（各試行の最小値）、最大4603〜9248。1ダメージ20923/39977攻撃イベント。BURST4〜10回。SP獲得2464〜4477、技消費2415〜4415、終了SP11〜108。
break-regen（元 100.0% (200/200)）の配置順だけ逆転: 1.0% (2/200)、286〜300行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD038","alternatives":[{"name":"remove-buff","wins":147,"n":200},{"name":"counter-boost","wins":94,"n":200},{"name":"barrier","wins":92,"n":200},{"name":"no-heal","wins":23,"n":200},{"name":"attack-up","wins":2,"n":200},{"name":"double-rock","wins":0,"n":200}]},{"skill":"SKD010","alternatives":[{"name":"break-regen-replace-SKD010-SKD007","wins":172,"n":200},{"name":"double-rock","wins":0,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"break-regen-replace-SKD009-SKD010","wins":200,"n":200}]},{"skill":"SKD043","alternatives":[{"name":"break-and-buff","wins":199,"n":200},{"name":"remove-buff","wins":147,"n":200},{"name":"counter-boost","wins":94,"n":200},{"name":"barrier","wins":92,"n":200},{"name":"no-heal","wins":23,"n":200},{"name":"attack-up","wins":2,"n":200},{"name":"double-rock","wins":0,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
|1/1 前田利家 (9-4/1/1)|atk|9780→2265|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|1/2 浅井長政 (9-4/1/2)|atk|3600→2601|全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|2/1 武田信玄 (9-4/2/1)|hp|140400→57508|300行動に収まらない耐久負担を局所調整|
|2/1 武田信玄 (9-4/2/1)|atk|9780→2665|到達耐久で役割を維持できない主な攻撃源を調整|
|2/1 武田信玄 (9-4/2/1)|def|5450→3938|強化後DEF/実ダメージの停滞を確認した敵を局所調整|
|3/1 柴田勝家 (9-4/3/1)|hp|140400→6174|300行動に収まらない耐久負担を局所調整|
|3/1 柴田勝家 (9-4/3/1)|atk|9780→3688|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|3/1 柴田勝家 (9-4/3/1)|def|5450→4633|強化後DEF/実ダメージの停滞を確認した敵を局所調整|
|3/2 島左近 (9-4/3/2)|hp|34880→7314|300行動に収まらない耐久負担を局所調整|


全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 9-4-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 9-4-validated.json.gz／9-4-sample-trace.json.gz。失敗した独立検証回は 9-4-validation-v1／round-*。

---

## 9-5 山路の密書
ID: satsuma-5。設計意図: 弱体連携の極意
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更9項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv80、覚醒3。R装備Lv50／LB0。技LB5。
到達経路: rear-focus／break-and-buff／burst-focus-greater-healの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 後列集中 100.0% (200/200)、169〜269行動。変更前の同編成: 0.0% (0/200)。別戦法: 防御低下＋攻撃強化 93.0% (186/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|後列集中 100.0% (200/200)|
|次点（60%前後）|後列集中・配置24513 50.0% (100/200)|
|ギリギリ（30%前後）|SP供給＋継続回復 37.0% (74/200)|
|ほぼ厳しい（0%超〜10%）|該当なし|
|未勝利（観測0%）|攻撃強化（逆順比較） 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|後列集中 (rear-focus)|100.0% (200/200)・169〜269行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD026 ／ char_jihoon_01:SKD027 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":20830,"SKD027":5453,"SKD003":4230,"SKD026":8453,"SKD039":2408,"SKD035":221}。未発動なし。敗北{"final_wave_defeated":200}|
|防御低下＋攻撃強化 (break-and-buff)|93.0% (186/200)・122〜300行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":17235,"SKD009":4249,"SKD038":1818,"SKD035":86,"SKD039":2258,"SKD008":5436}。未発動なし。敗北{"final_wave_defeated":186,"action_limit":14}|
|通常攻撃でSP供給／攻撃役へBURST集中 (burst-focus)|75.5% (151/200)・121〜300行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":21885,"SKD009":5084,"SKD008":6301,"SKD039":2448}。未発動なし。敗北{"final_wave_defeated":151,"action_limit":45,"party_defeated":4}|
|SP供給＋大回復 (burst-focus-greater-heal)|86.0% (172/200)・119〜300行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD040|前面までの確定供給案・育成予算内。{"basic":37922,"SKD009":4991,"SKD008":5426,"SKD040":1021}。未発動なし。敗北{"action_limit":27,"final_wave_defeated":172,"party_defeated":1}|
|別属性比較 (poor-element)|49.5% (99/200)・127〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD010 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":28236,"SKD010":10125,"SKD003":1851,"SKD039":4162,"SKD035":340}。未発動なし。敗北{"action_limit":93,"final_wave_defeated":99,"party_defeated":8}|
|SP供給＋継続回復 (burst-focus-regen)|37.0% (74/200)・119〜300行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":32817,"SKD009":4862,"SKD008":5597,"SKD043":5254}。未発動なし。敗北{"final_wave_defeated":74,"party_defeated":3,"action_limit":123}|
|攻撃強化（逆順比較） (attack-up-reversed)|0.0% (0/200)・116〜162行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD008 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":11163,"SKD003":10433,"SKD009":1475,"SKD008":2498,"SKD039":333,"SKD035":364}。未発動なし。敗北{"party_defeated":200}|
|後列集中・配置24513 (rear-focus-order-24513)|50.0% (100/200)・178〜300行動|char_yuki_01:SKD035 ／ char_jihoon_01:SKD027 ／ char_aoi_01:SKD039 ／ char_joe_01:SKD003 ／ char_daimon_01:SKD026|前面までの確定供給案・育成予算内。{"basic":22661,"SKD003":11082,"SKD027":6400,"SKD026":5801,"SKD039":3413,"SKD035":36}。未発動なし。敗北{"action_limit":32,"final_wave_defeated":100,"party_defeated":68}|
|後列集中・配置43152 (rear-focus-order-43152)|0.0% (0/200)・163〜300行動|char_jihoon_01:SKD027 ／ char_daimon_01:SKD026 ／ char_joe_01:SKD003 ／ char_aoi_01:SKD039 ／ char_yuki_01:SKD035|前面までの確定供給案・育成予算内。{"basic":22434,"SKD003":7113,"SKD027":2359,"SKD035":2775,"SKD039":4242,"SKD026":3575}。未発動なし。敗北{"party_defeated":199,"action_limit":1}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|80／3|20522.93／2898.16／2033.88|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD003 土割り LB5 SP25 first [{"type":"damage","power":123.92016934320858}] 入手:チュートリアル確定|
|2|竹中半兵衛 (char_yuki_01)|80／3|21446.93／2848.11／1985.52|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD035 鬨の声 LB5 SP75 all_allies [{"type":"atk_up","power":10.943137453388001,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|3|井伊直政 (char_daimon_01)|80／3|15084.53／4397.74／1606.08|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD026 後陣射ち LB5 SP55 last [{"type":"damage","power":136.5336155720143}] 入手:4-2 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|80／3|17618.93／3808.69／1795.80|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD027 追い討ち LB5 SP50 lowest_hp [{"type":"damage","power":143.63585661014858}] 入手:4-2 追加提案・前面初回確定|
|5|お市の方 (char_aoi_01)|80／3|16496.93／4108.99／1617.24|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD039 応急手当 LB5 SP35 lowest_ally [{"type":"heal","power":47.613446228805714,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":1369500,"eqExp":1149200,"cash":2424100,"skillMaterials":120,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_yuki_01":36,"char_daimon_01":36,"char_jihoon_01":36,"char_aoi_01":36},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":1369500,"eqExp":1613000,"cash":3243000,"skillMaterials":707,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_daimon_01":36,"char_aoi_01":36,"char_jihoon_01":36,"char_yuki_01":36},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: []。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":2787500,"charExp":1230100,"eqExp":1544300,"skillMaterials":691,"genericR":180}。追加案なしのEXP/銭周回比較: {"stage":"9-4","successfulClears":858,"energy":6864,"recipeSource":"9-4-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ1〜1（各試行の最小値）、最大5915〜6721。1ダメージ14128/38966攻撃イベント。BURST3〜11回。SP獲得2343〜4323、技消費2310〜4245、終了SP11〜114。
rear-focus（元 100.0% (200/200)）の配置順だけ逆転: 0.0% (0/200)、145〜300行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD003","alternatives":[{"name":"break-and-buff","wins":186,"n":200},{"name":"burst-focus-greater-heal","wins":172,"n":200},{"name":"burst-focus","wins":151,"n":200},{"name":"burst-focus-regen","wins":74,"n":200}]},{"skill":"SKD035","alternatives":[{"name":"burst-focus-greater-heal","wins":172,"n":200},{"name":"burst-focus","wins":151,"n":200},{"name":"burst-focus-regen","wins":74,"n":200}]},{"skill":"SKD026","alternatives":[{"name":"break-and-buff","wins":186,"n":200},{"name":"burst-focus-greater-heal","wins":172,"n":200},{"name":"burst-focus","wins":151,"n":200},{"name":"poor-element","wins":99,"n":200},{"name":"burst-focus-regen","wins":74,"n":200},{"name":"attack-up-reversed","wins":0,"n":200}]},{"skill":"SKD027","alternatives":[{"name":"break-and-buff","wins":186,"n":200},{"name":"burst-focus-greater-heal","wins":172,"n":200},{"name":"burst-focus","wins":151,"n":200},{"name":"poor-element","wins":99,"n":200},{"name":"burst-focus-regen","wins":74,"n":200},{"name":"attack-up-reversed","wins":0,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"burst-focus-greater-heal","wins":172,"n":200},{"name":"burst-focus-regen","wins":74,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
|1/1 上杉景勝 (9-5/1/1)|def|3580→3043|強化後DEF/実ダメージの停滞を確認した敵を局所調整|
|1/2 前田利家 (9-5/1/2)|atk|5040→4284|全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|2/1 石田三成 (9-5/2/1)|hp|53760→34406|300行動に収まらない耐久負担を局所調整|
|2/1 石田三成 (9-5/2/1)|def|3580→3043|強化後DEF/実ダメージの停滞を確認した敵を局所調整|
|3/1 明智光秀 (9-5/3/1)|hp|22000→17600|300行動に収まらない耐久負担を局所調整|
|3/1 明智光秀 (9-5/3/1)|atk|7280→1984|到達耐久で役割を維持できない主な攻撃源を調整|
|3/1 明智光秀 (9-5/3/1)|def|22000→4003|防御が到達火力を上回る敵のみ突破余地を確保／強化後DEF/実ダメージの停滞を確認した敵を局所調整|
|3/2 山本勘助 (9-5/3/2)|hp|26880→17203|300行動に収まらない耐久負担を局所調整|
|3/2 山本勘助 (9-5/3/2)|atk|4480→1987|到達耐久で役割を維持できない主な攻撃源を調整|


全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 9-5-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 9-5-validated.json.gz／9-5-sample-trace.json.gz。失敗した独立検証回は 9-5-validation-v1／round-*。

---

## 9-6 野に立つ傾奇旗
ID: satsuma-6。設計意図: 継続ダメージの極意
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更4項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv80、覚醒3。R装備Lv50／LB0。技LB5。
到達経路: break-and-buff／counter-boost／burst-focus／break-and-buff-replace-SKD009-SKD010／break-regenの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 防御低下＋攻撃強化 100.0% (200/200)、125〜194行動。変更前の同編成: 0.0% (0/200)。別戦法: 反撃 99.0% (198/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|防御低下＋攻撃強化 100.0% (200/200)|
|次点（60%前後）|SP供給＋大回復 63.5% (127/200)|
|ギリギリ（30%前後）|防御低下＋攻撃強化・配置32514 26.0% (52/200)|
|ほぼ厳しい（0%超〜10%）|該当なし|
|未勝利（観測0%）|攻撃強化（逆順比較） 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|防御低下＋攻撃強化 (break-and-buff)|100.0% (200/200)・125〜194行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":15762,"SKD009":9601,"SKD038":2061,"SKD035":339,"SKD039":2195}。未発動なし。敗北{"final_wave_defeated":200}|
|反撃 (counter-boost)|99.0% (198/200)・145〜300行動|char_joe_01:SKD049 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":18271,"SKD009":12279,"SKD049":446,"SKD035":602,"SKD039":2780}。未発動なし。敗北{"final_wave_defeated":198,"action_limit":2}|
|通常攻撃でSP供給／攻撃役へBURST集中 (burst-focus)|98.0% (196/200)・138〜300行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":17463,"SKD009":13245,"SKD039":2830}。未発動なし。敗北{"final_wave_defeated":196,"action_limit":4}|
|SP供給＋防御低下・継続回復 (break-regen)|89.5% (179/200)・114〜213行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":15936,"SKD009":9919,"SKD038":1999,"SKD043":777}。未発動なし。敗北{"final_wave_defeated":179,"party_defeated":21}|
|SP供給＋大回復 (burst-focus-greater-heal)|63.5% (127/200)・128〜300行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD040|前面までの確定供給案・育成予算内。{"basic":24729,"SKD009":13351,"SKD040":2436}。未発動なし。敗北{"action_limit":73,"final_wave_defeated":127}|
|攻撃のみ比較 (all-attack)|36.5% (73/200)・152〜204行動|char_joe_01:SKD009 ／ char_yuki_01:SKD009 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD009|前面までの確定供給案・育成予算内。{"basic":19005,"SKD009":17116}。未発動なし。敗北{"party_defeated":127,"final_wave_defeated":73}|
|攻撃強化（逆順比較） (attack-up-reversed)|0.0% (0/200)・160〜300行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD009 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":23106,"SKD003":28859,"SKD009":5297,"SKD039":503,"SKD035":1171}。未発動なし。敗北{"action_limit":173,"party_defeated":27}|
|防御低下＋攻撃強化・SKD009-SKD010置換 (break-and-buff-replace-SKD009-SKD010)|100.0% (200/200)・119〜187行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD010 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":15202,"SKD010":9192,"SKD038":2059,"SKD035":431,"SKD039":1885}。未発動なし。敗北{"final_wave_defeated":200}|
|防御低下＋攻撃強化・配置32514 (break-and-buff-order-32514)|26.0% (52/200)・172〜253行動|char_daimon_01:SKD009 ／ char_yuki_01:SKD038 ／ char_aoi_01:SKD039 ／ char_joe_01:SKD035 ／ char_jihoon_01:SKD009|前面までの確定供給案・育成予算内。{"basic":22285,"SKD009":13476,"SKD038":1851,"SKD039":2786,"SKD035":1368}。未発動なし。敗北{"party_defeated":148,"final_wave_defeated":52}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|80／3|20522.93／2898.16／2033.88|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD035 鬨の声 LB5 SP75 all_allies [{"type":"atk_up","power":10.943137453388001,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|2|竹中半兵衛 (char_yuki_01)|80／3|21446.93／2848.11／1985.52|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD038 鎧砕き LB5 SP50 first [{"type":"def_down","power":17.465826699149144,"duration":3,"carryAcrossWaves":true}] 入手:2-5 追加提案・前面初回確定|
|3|井伊直政 (char_daimon_01)|80／3|15084.53／4397.74／1606.08|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD009 岩断 LB5 SP50 first [{"type":"damage","power":153.63585661014858}] 入手:1-2 現行初回/任務確定|
|4|前田利家 (char_jihoon_01)|80／3|17618.93／3808.69／1795.80|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD009 岩断 LB5 SP50 first [{"type":"damage","power":153.63585661014858}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|80／3|16496.93／4108.99／1617.24|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD039 応急手当 LB5 SP35 lowest_ally [{"type":"heal","power":47.613446228805714,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":1369500,"eqExp":1149200,"cash":2409100,"skillMaterials":105,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_yuki_01":36,"char_daimon_01":36,"char_jihoon_01":36,"char_aoi_01":36},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":1369500,"eqExp":1613000,"cash":3243000,"skillMaterials":707,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_daimon_01":36,"char_aoi_01":36,"char_jihoon_01":36,"char_yuki_01":36},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: []。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":2774500,"charExp":1226200,"eqExp":1541600,"skillMaterials":691,"genericR":180}。追加案なしのEXP/銭周回比較: {"stage":"9-5","successfulClears":857,"energy":6856,"recipeSource":"9-5-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ1〜1（各試行の最小値）、最大4816〜7379。1ダメージ9978/25363攻撃イベント。BURST2〜7回。SP獲得1628〜3289、技消費1565〜3260、終了SP11〜93。
break-and-buff（元 100.0% (200/200)）の配置順だけ逆転: 0.0% (0/200)、139〜300行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD035","alternatives":[{"name":"burst-focus","wins":196,"n":200},{"name":"break-regen","wins":179,"n":200},{"name":"burst-focus-greater-heal","wins":127,"n":200},{"name":"all-attack","wins":73,"n":200}]},{"skill":"SKD038","alternatives":[{"name":"counter-boost","wins":198,"n":200},{"name":"burst-focus","wins":196,"n":200},{"name":"burst-focus-greater-heal","wins":127,"n":200},{"name":"all-attack","wins":73,"n":200},{"name":"attack-up-reversed","wins":0,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"break-and-buff-replace-SKD009-SKD010","wins":200,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"break-regen","wins":179,"n":200},{"name":"burst-focus-greater-heal","wins":127,"n":200},{"name":"all-attack","wins":73,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
|1/1 北条氏康 (9-6/1/1)|def|3680→3128|強化後DEF/実ダメージの停滞を確認した敵を局所調整|
|2/1 前田慶次 (9-6/2/1)|atk|7470→3900|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|2/1 前田慶次 (9-6/2/1)|def|22000→4709|防御が到達火力を上回る敵のみ突破余地を確保／強化後DEF/実ダメージの停滞を確認した敵を局所調整|
|2/2 お市の方 (9-6/2/2)|atk|7470→6350|全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|


全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 9-6-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 9-6-validated.json.gz／9-6-sample-trace.json.gz。失敗した独立検証回は 9-6-validation-v1／round-*。

---

## 9-7 浜辺の旗影
ID: satsuma-7。設計意図: 反撃の極意
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更4項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv80、覚醒3。R装備Lv50／LB0。技LB5。
到達経路: burst-focus-greater-heal／armor-break／double-rock／burst-focus-greater-heal-replace-SKD009-SKD007の切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: SP供給＋大回復 100.0% (200/200)、142〜156行動。変更前の同編成: 0.0% (0/200)。別戦法: 防御低下 100.0% (200/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|SP供給＋大回復 100.0% (200/200)|
|次点（60%前後）|SP供給＋防御低下・継続回復 53.5% (107/200)|
|ギリギリ（30%前後）|該当なし|
|ほぼ厳しい（0%超〜10%）|該当なし|
|未勝利（観測0%）|攻撃強化（逆順比較） 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|SP供給＋大回復 (burst-focus-greater-heal)|100.0% (200/200)・142〜156行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD040|前面までの確定供給案・育成予算内。{"basic":22301,"SKD009":2530,"SKD007":2441,"SKD040":2677}。未発動なし。敗北{"final_wave_defeated":200}|
|防御低下 (armor-break)|100.0% (200/200)・172〜198行動|char_joe_01:SKD003 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":23465,"SKD009":2572,"SKD003":200,"SKD007":1468,"SKD038":350,"SKD039":9475}。未発動なし。敗北{"final_wave_defeated":200}|
|土属性集中＋攻撃強化（中心技の発動が半数未満・比較用） (double-rock)|100.0% (200/200)・187〜206行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":24089,"SKD009":4574,"SKD003":200,"SKD035":82,"SKD039":9938}。未発動なし。敗北{"final_wave_defeated":200}|
|SP供給＋防御低下・継続回復 (break-regen)|53.5% (107/200)・115〜173行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":20673,"SKD009":2082,"SKD038":400,"SKD007":1717,"SKD043":5176}。未発動なし。敗北{"final_wave_defeated":107,"party_defeated":93}|
|攻撃強化（逆順比較） (attack-up-reversed)|0.0% (0/200)・59〜70行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD007 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":5310,"SKD003":5866,"SKD039":201,"SKD009":200,"SKD007":504,"SKD035":342}。未発動なし。敗北{"party_defeated":200}|
|SP供給＋大回復・SKD009-SKD007置換 (burst-focus-greater-heal-replace-SKD009-SKD007)|100.0% (200/200)・134〜146行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD007 ／ char_aoi_01:SKD040|前面までの確定供給案・育成予算内。{"basic":20920,"SKD007":4822,"SKD040":2304}。未発動なし。敗北{"final_wave_defeated":200}|
|SP供給＋大回復・配置13542 (burst-focus-greater-heal-order-13542)|0.0% (0/200)・63〜82行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD007 ／ char_aoi_01:SKD040 ／ char_jihoon_01:SKD009 ／ char_yuki_01:技なし・通常攻撃でSP供給|前面までの確定供給案・育成予算内。{"basic":10392,"SKD009":3998,"SKD007":287,"SKD040":376}。未発動なし。敗北{"party_defeated":200}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|80／3|20522.93／2898.16／2033.88|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|技なし|
|2|竹中半兵衛 (char_yuki_01)|80／3|21446.93／2848.11／1985.52|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|技なし|
|3|井伊直政 (char_daimon_01)|80／3|15084.53／4397.74／1606.08|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD007 炎断 LB5 SP50 first [{"type":"damage","power":153.63585661014858}] 入手:4-1 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|80／3|17618.93／3808.69／1795.80|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD009 岩断 LB5 SP50 first [{"type":"damage","power":153.63585661014858}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|80／3|16496.93／4108.99／1617.24|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD040 治癒の祈り LB5 SP90 lowest_ally [{"type":"heal","power":106.5336155720143,"healingFormula":"caster_atk_percent"}] 入手:2-5 追加提案・前面初回確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":1369500,"eqExp":1149200,"cash":2424100,"skillMaterials":120,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_yuki_01":36,"char_daimon_01":36,"char_jihoon_01":36,"char_aoi_01":36},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":1369500,"eqExp":1613000,"cash":3243000,"skillMaterials":707,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_daimon_01":36,"char_aoi_01":36,"char_jihoon_01":36,"char_yuki_01":36},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: []。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":2761500,"charExp":1222300,"eqExp":1538900,"skillMaterials":691,"genericR":180}。追加案なしのEXP/銭周回比較: {"stage":"9-6","successfulClears":855,"energy":6840,"recipeSource":"9-6-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ2347〜2584（各試行の最小値）、最大9749〜11513。1ダメージ0/27272攻撃イベント。BURST0〜3回。SP獲得2223〜2650、技消費1870〜2250、終了SP343〜400。
burst-focus-greater-heal（元 100.0% (200/200)）の配置順だけ逆転: 0.0% (0/200)、61〜71行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD007","alternatives":[{"name":"double-rock","wins":200,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"burst-focus-greater-heal-replace-SKD009-SKD007","wins":200,"n":200}]},{"skill":"SKD040","alternatives":[{"name":"armor-break","wins":200,"n":200},{"name":"double-rock","wins":200,"n":200},{"name":"break-regen","wins":107,"n":200},{"name":"attack-up-reversed","wins":0,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
|2/1 前田慶次 (9-7/2/1)|atk|4410→3749|全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|3/1 長宗我部元親 (9-7/3/1)|atk|4410→1958|到達耐久で役割を維持できない主な攻撃源を調整|
|3/2 島津義弘 (9-7/3/2)|atk|4410→2303|到達耐久で役割を維持できない主な攻撃源を調整|
|3/3 立花宗茂 (9-7/3/3)|atk|4410→2303|到達耐久で役割を維持できない主な攻撃源を調整|


全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 9-7-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 9-7-validated.json.gz／9-7-sample-trace.json.gz。失敗した独立検証回は 9-7-validation-v1／round-*。

---

## 9-8 紅に染まる野
ID: satsuma-8。設計意図: 背水の極意
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更2項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv80、覚醒3。R装備Lv50／LB0。技LB5。
到達経路: break-and-buff／taunt-counter／armor-break／double-rock／break-and-buff-replace-SKD009-SKD008／defensiveの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 防御低下＋攻撃強化 100.0% (200/200)、134〜225行動。変更前の同編成: 0.0% (0/200)。別戦法: 挑発・反撃 100.0% (200/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|防御低下＋攻撃強化 100.0% (200/200)|
|次点（60%前後）|SP供給＋防御低下・継続回復 52.5% (105/200)|
|ギリギリ（30%前後）|SP供給＋継続回復 28.5% (57/200)|
|ほぼ厳しい（0%超〜10%）|該当なし|
|未勝利（観測0%）|攻撃強化（逆順比較） 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|防御低下＋攻撃強化 (break-and-buff)|100.0% (200/200)・134〜225行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":17907,"SKD009":5075,"SKD038":1263,"SKD008":7978,"SKD039":3008}。未発動SKD035。敗北{"final_wave_defeated":200}|
|挑発・反撃 (taunt-counter)|100.0% (200/200)・174〜273行動|char_joe_01:SKD049→SKD048 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":21379,"SKD009":6303,"SKD048":203,"SKD008":9910,"SKD039":3320,"SKD035":677}。未発動SKD049。敗北{"final_wave_defeated":200}|
|防御低下 (armor-break)|99.0% (198/200)・139〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":17850,"SKD009":5145,"SKD003":733,"SKD008":7821,"SKD038":893,"SKD039":2923}。未発動なし。敗北{"final_wave_defeated":198,"action_limit":2}|
|土属性集中＋攻撃強化 (double-rock)|88.5% (177/200)・231〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":27992,"SKD009":21231,"SKD003":595,"SKD035":649,"SKD039":4550}。未発動なし。敗北{"final_wave_defeated":177,"action_limit":23}|
|攻防弱体・継続回復 (defensive)|87.0% (174/200)・165〜300行動|char_joe_01:SKD036 ／ char_yuki_01:SKD037 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":23840,"SKD009":7350,"SKD037":1275,"SKD008":9652,"SKD043":1381,"SKD036":69}。未発動なし。敗北{"final_wave_defeated":174,"action_limit":26}|
|SP供給＋防御低下・継続回復 (break-regen)|52.5% (105/200)・136〜300行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":27743,"SKD009":7060,"SKD038":961,"SKD008":7351,"SKD043":2904}。未発動なし。敗北{"final_wave_defeated":105,"action_limit":95}|
|SP供給＋継続回復 (burst-focus-regen)|28.5% (57/200)・175〜300行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":33238,"SKD009":9000,"SKD008":8767,"SKD043":3685}。未発動なし。敗北{"final_wave_defeated":57,"action_limit":143}|
|攻撃強化（逆順比較） (attack-up-reversed)|0.0% (0/200)・208〜265行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD008 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":19352,"SKD003":24838,"SKD009":752,"SKD008":3008,"SKD035":1065}。未発動SKD039。敗北{"party_defeated":200}|
|防御低下＋攻撃強化・SKD009-SKD008置換 (break-and-buff-replace-SKD009-SKD008)|100.0% (200/200)・133〜203行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD008 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":16579,"SKD008":12194,"SKD038":1196,"SKD039":2739}。未発動SKD035。敗北{"final_wave_defeated":200}|
|防御低下＋攻撃強化・配置43152 (break-and-buff-order-43152)|22.0% (44/200)・133〜300行動|char_jihoon_01:SKD009 ／ char_daimon_01:SKD008 ／ char_joe_01:SKD035 ／ char_aoi_01:SKD039 ／ char_yuki_01:SKD038|前面までの確定供給案・育成予算内。{"basic":35853,"SKD038":2139,"SKD008":3177,"SKD039":5480,"SKD009":792,"SKD035":6833}。未発動なし。敗北{"final_wave_defeated":44,"action_limit":156}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|80／3|20522.93／2898.16／2033.88|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD035 鬨の声 LB5 SP75 all_allies [{"type":"atk_up","power":10.943137453388001,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|2|竹中半兵衛 (char_yuki_01)|80／3|21446.93／2848.11／1985.52|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD038 鎧砕き LB5 SP50 first [{"type":"def_down","power":17.465826699149144,"duration":3,"carryAcrossWaves":true}] 入手:2-5 追加提案・前面初回確定|
|3|井伊直政 (char_daimon_01)|80／3|15084.53／4397.74／1606.08|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD008 水断 LB5 SP50 first [{"type":"damage","power":153.63585661014858}] 入手:4-5 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|80／3|17618.93／3808.69／1795.80|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD009 岩断 LB5 SP50 first [{"type":"damage","power":153.63585661014858}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|80／3|16496.93／4108.99／1617.24|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD039 応急手当 LB5 SP35 lowest_ally [{"type":"heal","power":47.613446228805714,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":1369500,"eqExp":1149200,"cash":2439100,"skillMaterials":135,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_yuki_01":36,"char_daimon_01":36,"char_jihoon_01":36,"char_aoi_01":36},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":1369500,"eqExp":1613000,"cash":3243000,"skillMaterials":707,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_daimon_01":36,"char_aoi_01":36,"char_jihoon_01":36,"char_yuki_01":36},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: []。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":2748500,"charExp":1218400,"eqExp":1536200,"skillMaterials":691,"genericR":180}。追加案なしのEXP/銭周回比較: {"stage":"9-7","successfulClears":854,"energy":6832,"recipeSource":"9-7-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ1〜1（各試行の最小値）、最大4685〜4880。1ダメージ10796/30960攻撃イベント。BURST4〜9回。SP獲得1793〜3641、技消費1730〜3595、終了SP11〜91。
break-and-buff（元 100.0% (200/200)）の配置順だけ逆転: 0.0% (0/200)、201〜263行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD035","alternatives":[{"name":"armor-break","wins":198,"n":200},{"name":"defensive","wins":174,"n":200},{"name":"break-regen","wins":105,"n":200},{"name":"burst-focus-regen","wins":57,"n":200}]},{"skill":"SKD038","alternatives":[{"name":"taunt-counter","wins":200,"n":200},{"name":"double-rock","wins":177,"n":200},{"name":"defensive","wins":174,"n":200},{"name":"burst-focus-regen","wins":57,"n":200},{"name":"attack-up-reversed","wins":0,"n":200}]},{"skill":"SKD008","alternatives":[{"name":"double-rock","wins":177,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"break-and-buff-replace-SKD009-SKD008","wins":200,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"defensive","wins":174,"n":200},{"name":"break-regen","wins":105,"n":200},{"name":"burst-focus-regen","wins":57,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
|2/1 真田幸村 (9-8/2/1)|hp|199650→159720|300行動に収まらない耐久負担を局所調整|
|2/1 真田幸村 (9-8/2/1)|atk|9440→3026|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|


全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 9-8-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 9-8-validated.json.gz／9-8-sample-trace.json.gz。失敗した独立検証回は 9-8-validation-v1／round-*。

---

## 9-9 霧の軍議
ID: satsuma-9。設計意図: 妨害と解除の極意
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更5項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv80、覚醒3。R装備Lv50／LB0。技LB5。
到達経路: break-and-buff／attack-up／armor-break／break-and-buff-replace-SKD008-SKD009／break-and-buff-replace-SKD009-SKD008／break-regenの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 防御低下＋攻撃強化 100.0% (200/200)、167〜256行動。変更前の同編成: 0.0% (0/200)。別戦法: 攻撃強化 99.0% (198/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|防御低下＋攻撃強化 100.0% (200/200)|
|次点（60%前後）|該当なし|
|ギリギリ（30%前後）|土属性集中＋攻撃強化 20.5% (41/200)|
|ほぼ厳しい（0%超〜10%）|支援なし比較 1.5% (3/200)|
|未勝利（観測0%）|攻撃強化（逆順比較） 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|防御低下＋攻撃強化 (break-and-buff)|100.0% (200/200)・167〜256行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":20088,"SKD009":5594,"SKD038":1735,"SKD008":9055,"SKD039":2405,"SKD035":9}。未発動なし。敗北{"final_wave_defeated":200}|
|攻撃強化 (attack-up)|99.0% (198/200)・189〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":23849,"SKD009":6176,"SKD003":485,"SKD008":10987,"SKD039":3434,"SKD035":953}。未発動なし。敗北{"final_wave_defeated":198,"party_defeated":1,"action_limit":1}|
|防御低下 (armor-break)|100.0% (200/200)・155〜273行動|char_joe_01:SKD003 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":20175,"SKD009":5634,"SKD003":482,"SKD008":9097,"SKD039":2761,"SKD038":1390}。未発動なし。敗北{"final_wave_defeated":200}|
|土属性集中＋攻撃強化 (double-rock)|20.5% (41/200)・135〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":28591,"SKD009":20844,"SKD003":485,"SKD039":4980,"SKD035":764}。未発動なし。敗北{"final_wave_defeated":41,"action_limit":145,"party_defeated":14}|
|SP供給＋防御低下・継続回復 (break-regen)|87.0% (174/200)・158〜300行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":21916,"SKD009":7097,"SKD038":1454,"SKD008":8851,"SKD043":1066}。未発動なし。敗北{"final_wave_defeated":174,"action_limit":26}|
|SP供給＋継続回復 (burst-focus-regen)|49.5% (99/200)・93〜300行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":24134,"SKD009":9332,"SKD008":8455,"SKD043":1369}。未発動なし。敗北{"final_wave_defeated":99,"party_defeated":39,"action_limit":62}|
|支援なし比較 (no-support)|1.5% (3/200)・99〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD003 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":21011,"SKD009":8400,"SKD003":8615,"SKD039":5243,"SKD008":2221}。未発動なし。敗北{"party_defeated":104,"action_limit":93,"final_wave_defeated":3}|
|攻撃強化（逆順比較） (attack-up-reversed)|0.0% (0/200)・124〜183行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD008 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":13188,"SKD003":11888,"SKD009":2091,"SKD008":2747,"SKD039":310,"SKD035":547}。未発動なし。敗北{"party_defeated":200}|
|防御低下＋攻撃強化・SKD008-SKD009置換 (break-and-buff-replace-SKD008-SKD009)|92.5% (185/200)・227〜300行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":26608,"SKD009":19343,"SKD039":4325,"SKD038":1906,"SKD035":9}。未発動なし。敗北{"final_wave_defeated":185,"action_limit":15}|
|防御低下＋攻撃強化・SKD009-SKD008置換 (break-and-buff-replace-SKD009-SKD008)|100.0% (200/200)・148〜238行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD008 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":18680,"SKD008":13488,"SKD039":2178,"SKD038":1654,"SKD035":9}。未発動なし。敗北{"final_wave_defeated":200}|
|防御低下＋攻撃強化・配置23145 (break-and-buff-order-23145)|49.0% (98/200)・128〜300行動|char_yuki_01:SKD038 ／ char_daimon_01:SKD008 ／ char_joe_01:SKD035 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":27349,"SKD009":13873,"SKD038":361,"SKD008":6280,"SKD039":4117,"SKD035":626}。未発動なし。敗北{"final_wave_defeated":98,"action_limit":91,"party_defeated":11}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|80／3|20522.93／2898.16／2033.88|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD035 鬨の声 LB5 SP75 all_allies [{"type":"atk_up","power":10.943137453388001,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|2|竹中半兵衛 (char_yuki_01)|80／3|21446.93／2848.11／1985.52|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD038 鎧砕き LB5 SP50 first [{"type":"def_down","power":17.465826699149144,"duration":3,"carryAcrossWaves":true}] 入手:2-5 追加提案・前面初回確定|
|3|井伊直政 (char_daimon_01)|80／3|15084.53／4397.74／1606.08|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD008 水断 LB5 SP50 first [{"type":"damage","power":153.63585661014858}] 入手:4-5 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|80／3|17618.93／3808.69／1795.80|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD009 岩断 LB5 SP50 first [{"type":"damage","power":153.63585661014858}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|80／3|16496.93／4108.99／1617.24|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD039 応急手当 LB5 SP35 lowest_ally [{"type":"heal","power":47.613446228805714,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":1369500,"eqExp":1149200,"cash":2439100,"skillMaterials":135,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_yuki_01":36,"char_daimon_01":36,"char_jihoon_01":36,"char_aoi_01":36},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":1369500,"eqExp":1613000,"cash":3243000,"skillMaterials":707,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_daimon_01":36,"char_aoi_01":36,"char_jihoon_01":36,"char_yuki_01":36},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: []。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":2735500,"charExp":1214500,"eqExp":1533500,"skillMaterials":691,"genericR":180}。追加案なしのEXP/銭周回比較: {"stage":"9-8","successfulClears":852,"energy":6816,"recipeSource":"9-8-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ1〜1（各試行の最小値）、最大5577〜6722。1ダメージ8122/34737攻撃イベント。BURST4〜10回。SP獲得2167〜3817、技消費2100〜3805、終了SP11〜115。
break-and-buff（元 100.0% (200/200)）の配置順だけ逆転: 32.5% (65/200)、144〜300行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD035","alternatives":[{"name":"armor-break","wins":200,"n":200},{"name":"break-regen","wins":174,"n":200},{"name":"burst-focus-regen","wins":99,"n":200},{"name":"no-support","wins":3,"n":200}]},{"skill":"SKD038","alternatives":[{"name":"attack-up","wins":198,"n":200},{"name":"burst-focus-regen","wins":99,"n":200},{"name":"double-rock","wins":41,"n":200},{"name":"no-support","wins":3,"n":200},{"name":"attack-up-reversed","wins":0,"n":200}]},{"skill":"SKD008","alternatives":[{"name":"break-and-buff-replace-SKD008-SKD009","wins":185,"n":200},{"name":"double-rock","wins":41,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"break-and-buff-replace-SKD009-SKD008","wins":200,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"break-regen","wins":174,"n":200},{"name":"burst-focus-regen","wins":99,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
|2/1 武田勝頼 (9-9/2/1)|hp|96830→77464|300行動に収まらない耐久負担を局所調整|
|2/1 武田勝頼 (9-9/2/1)|atk|13210→4236|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|3/1 斎藤道三 (9-9/3/1)|atk|5600→4046|到達耐久で役割を維持できない主な攻撃源を調整|
|3/2 真田昌幸 (9-9/3/2)|hp|161200→128960|300行動に収まらない耐久負担を局所調整|
|3/2 真田昌幸 (9-9/3/2)|atk|8060→3577|到達耐久で役割を維持できない主な攻撃源を調整|


全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 9-9-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 9-9-validated.json.gz／9-9-sample-trace.json.gz。失敗した独立検証回は 9-9-validation-v1／round-*。

---

## 9-10 薩摩の大かがり
ID: satsuma-10。設計意図: 得意と不得意を見抜く
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更10項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv80、覚醒3。R装備Lv50／LB0。技LB5。
到達経路: break-regen／break-and-buff／burst-focus-greater-heal／break-regen-replace-SKD010-SKD007／break-regen-replace-SKD009-SKD007の切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: SP供給＋防御低下・継続回復 100.0% (600/600)、217〜286行動。変更前の同編成: 0.0% (0/200)。別戦法: 防御低下＋攻撃強化 97.5% (195/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|SP供給＋防御低下・継続回復 100.0% (600/600)|
|次点（60%前後）|継続被害解除（中心技の発動が半数未満・比較用） 54.5% (109/200)|
|ギリギリ（30%前後）|障壁 21.0% (42/200)|
|ほぼ厳しい（0%超〜10%）|別属性比較 5.0% (10/200)|
|未勝利（観測0%）|攻撃強化（逆順比較） 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|SP供給＋防御低下・継続回復 (break-regen)|100.0% (600/600)・217〜286行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":81835,"SKD009":20839,"SKD038":9479,"SKD010":35965,"SKD043":3598}。未発動なし。敗北{"final_wave_defeated":600}|
|防御低下＋攻撃強化 (break-and-buff)|97.5% (195/200)・225〜300行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":27946,"SKD009":5779,"SKD038":3152,"SKD035":1258,"SKD039":2116,"SKD010":11478}。未発動なし。敗北{"final_wave_defeated":195,"action_limit":5}|
|SP供給＋大回復 (burst-focus-greater-heal)|91.0% (182/200)・262〜300行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD040|前面までの確定供給案・育成予算内。{"basic":30370,"SKD009":10134,"SKD010":16887,"SKD040":30}。未発動なし。敗北{"final_wave_defeated":182,"action_limit":18}|
|別属性比較 (poor-element)|5.0% (10/200)・282〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD008 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":31167,"SKD008":21707,"SKD003":2129,"SKD039":2663,"SKD035":2262}。未発動なし。敗北{"action_limit":190,"final_wave_defeated":10}|
|継続被害解除（中心技の発動が半数未満・比較用） (cleanse-dot)|54.5% (109/200)・258〜300行動|char_joe_01:SKD054 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":32292,"SKD009":5849,"SKD010":14948,"SKD035":3202,"SKD039":2631}。未発動SKD054。敗北{"final_wave_defeated":109,"action_limit":91}|
|障壁 (barrier)|21.0% (42/200)・279〜300行動|char_joe_01:SKD045 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":32625,"SKD009":5300,"SKD010":15219,"SKD045":1737,"SKD039":2418,"SKD035":2371}。未発動なし。敗北{"action_limit":158,"final_wave_defeated":42}|
|反撃 (counter-boost)|20.0% (40/200)・274〜300行動|char_joe_01:SKD049 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":32804,"SKD009":5524,"SKD010":14873,"SKD035":2327,"SKD049":1462,"SKD039":2675}。未発動なし。敗北{"action_limit":160,"final_wave_defeated":40}|
|攻撃強化（逆順比較） (attack-up-reversed)|0.0% (0/200)・165〜300行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD010 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":20065,"SKD003":18844,"SKD009":1443,"SKD010":6216,"SKD039":400,"SKD035":666}。未発動なし。敗北{"party_defeated":95,"action_limit":105}|
|SP供給＋防御低下・継続回復・SKD010-SKD007置換 (break-regen-replace-SKD010-SKD007)|100.0% (200/200)・217〜278行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":25920,"SKD009":7238,"SKD038":3205,"SKD007":10798,"SKD043":1199}。未発動なし。敗北{"final_wave_defeated":200}|
|SP供給＋防御低下・継続回復・SKD009-SKD007置換 (break-regen-replace-SKD009-SKD007)|100.0% (200/200)・207〜274行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD007 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":25506,"SKD007":6647,"SKD038":3036,"SKD010":11057,"SKD043":1114}。未発動なし。敗北{"final_wave_defeated":200}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|80／3|20522.93／2898.16／2033.88|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|技なし|
|2|竹中半兵衛 (char_yuki_01)|80／3|21446.93／2848.11／1985.52|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD038 鎧砕き LB5 SP50 first [{"type":"def_down","power":17.465826699149144,"duration":3,"carryAcrossWaves":true}] 入手:2-5 追加提案・前面初回確定|
|3|井伊直政 (char_daimon_01)|80／3|15084.53／4397.74／1606.08|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD010 風断 LB5 SP50 first [{"type":"damage","power":153.63585661014858}] 入手:2-5 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|80／3|17618.93／3808.69／1795.80|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD009 岩断 LB5 SP50 first [{"type":"damage","power":153.63585661014858}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|80／3|16496.93／4108.99／1617.24|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD043 再生の祈り LB5 SP65 lowest_ally [{"type":"hot","power":21.306723114402857,"duration":3,"carryAcrossWaves":true}] 入手:3-4 追加提案・前面初回確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":1369500,"eqExp":1149200,"cash":2424100,"skillMaterials":120,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_yuki_01":36,"char_daimon_01":36,"char_jihoon_01":36,"char_aoi_01":36},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":1369500,"eqExp":1613000,"cash":3243000,"skillMaterials":707,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_daimon_01":36,"char_aoi_01":36,"char_jihoon_01":36,"char_yuki_01":36},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: []。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":2722500,"charExp":1210600,"eqExp":1530800,"skillMaterials":691,"genericR":180}。追加案なしのEXP/銭周回比較: {"stage":"9-9","successfulClears":851,"energy":6808,"recipeSource":"9-9-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ1〜1（各試行の最小値）、最大5869〜7172。1ダメージ38899/138639攻撃イベント。BURST6〜13回。SP獲得2948〜4675、技消費2915〜4620、終了SP11〜99。
break-regen（元 100.0% (600/600)）の配置順だけ逆転: 0.0% (0/200)、264〜300行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD038","alternatives":[{"name":"burst-focus-greater-heal","wins":182,"n":200},{"name":"cleanse-dot","wins":109,"n":200},{"name":"barrier","wins":42,"n":200},{"name":"counter-boost","wins":40,"n":200},{"name":"poor-element","wins":10,"n":200},{"name":"attack-up-reversed","wins":0,"n":200}]},{"skill":"SKD010","alternatives":[{"name":"break-regen-replace-SKD010-SKD007","wins":200,"n":200},{"name":"poor-element","wins":10,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"break-regen-replace-SKD009-SKD007","wins":200,"n":200},{"name":"poor-element","wins":10,"n":200}]},{"skill":"SKD043","alternatives":[{"name":"break-and-buff","wins":195,"n":200},{"name":"burst-focus-greater-heal","wins":182,"n":200},{"name":"cleanse-dot","wins":109,"n":200},{"name":"barrier","wins":42,"n":200},{"name":"counter-boost","wins":40,"n":200},{"name":"poor-element","wins":10,"n":200},{"name":"attack-up-reversed","wins":0,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
|1/1 加藤清正 (9-10/1/1)|def|4160→3536|強化後DEF/実ダメージの停滞を確認した敵を局所調整|
|1/2 直江兼続 (9-10/1/2)|atk|5200→3193|全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|2/1 伊達政宗 (9-10/2/1)|atk|8450→2304|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|2/1 伊達政宗 (9-10/2/1)|def|4680→3978|強化後DEF/実ダメージの停滞を確認した敵を局所調整|
|3/1 本多忠勝 (9-10/3/1)|hp|169000→22683|300行動に収まらない耐久負担を局所調整|
|3/1 本多忠勝 (9-10/3/1)|atk|13940→3228|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|4/1 織田信長 (9-10/4/1)|hp|169000→44302|300行動に収まらない耐久負担を局所調整|
|4/1 織田信長 (9-10/4/1)|atk|8450→2710|到達耐久で役割を維持できない主な攻撃源を調整|
|4/1 織田信長 (9-10/4/1)|def|4680→3978|強化後DEF/実ダメージの停滞を確認した敵を局所調整|
|4/2 お市の方 (9-10/4/2)|atk|8450→3113|到達耐久で役割を維持できない主な攻撃源を調整／回復供給の膠着を緩和し処理順の選択を残す|


全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 9-10-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 9-10-validated.json.gz／9-10-sample-trace.json.gz。失敗した独立検証回は 9-10-validation-v1／round-*。

---

## 10-1 霧中の布陣
ID: sekigahara-1。設計意図: 硬い前衛と危険な後衛
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更13項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv80、覚醒3。R装備Lv50／LB0。技LB5。
到達経路: break-and-buff／support-feed／burst-focus／break-and-buff-replace-SKD009-SKD010／break-and-buff-replace-SKD039-SKD041の切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 防御低下＋攻撃強化 100.0% (600/600)、186〜295行動。変更前の同編成: 0.0% (0/200)。別戦法: SP供給＋攻撃強化 100.0% (200/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|防御低下＋攻撃強化 100.0% (600/600)|
|次点（60%前後）|挑発・反撃 66.5% (133/200)|
|ギリギリ（30%前後）|防御低下＋攻撃強化・配置32541 28.5% (57/200)|
|ほぼ厳しい（0%超〜10%）|防御低下 7.0% (14/200)|
|未勝利（観測0%）|該当なし|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|防御低下＋攻撃強化 (break-and-buff)|100.0% (600/600)・186〜295行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":76610,"SKD009":41199,"SKD038":12358,"SKD035":4136,"SKD039":8022}。未発動なし。敗北{"final_wave_defeated":600}|
|SP供給＋攻撃強化 (support-feed)|100.0% (200/200)・216〜298行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":27834,"SKD009":17401,"SKD035":2565,"SKD039":3054}。未発動なし。敗北{"final_wave_defeated":200}|
|通常攻撃でSP供給／攻撃役へBURST集中 (burst-focus)|99.0% (198/200)・223〜300行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":27148,"SKD009":21093,"SKD039":3370}。未発動なし。敗北{"final_wave_defeated":198,"action_limit":2}|
|攻防弱体・継続回復 (defensive)|10.5% (21/200)・266〜300行動|char_joe_01:SKD036 ／ char_yuki_01:SKD037 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":33147,"SKD009":18187,"SKD037":5369,"SKD043":1525,"SKD036":1496}。未発動なし。敗北{"action_limit":179,"final_wave_defeated":21}|
|挑発・反撃 (taunt-counter)|66.5% (133/200)・238〜300行動|char_joe_01:SKD049→SKD048 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":30243,"SKD009":19381,"SKD048":2087,"SKD049":1407,"SKD035":626,"SKD039":3868}。未発動なし。敗北{"final_wave_defeated":133,"action_limit":67}|
|防御低下 (armor-break)|7.0% (14/200)・269〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":28248,"SKD009":15616,"SKD003":10086,"SKD038":1561,"SKD039":4356}。未発動なし。敗北{"action_limit":186,"final_wave_defeated":14}|
|攻撃強化 (attack-up)|5.5% (11/200)・268〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":28299,"SKD009":17203,"SKD003":9827,"SKD035":207,"SKD039":4310}。未発動なし。敗北{"action_limit":189,"final_wave_defeated":11}|
|防御低下＋攻撃強化・SKD009-SKD010置換 (break-and-buff-replace-SKD009-SKD010)|100.0% (200/200)・197〜292行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD010 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":25417,"SKD010":13598,"SKD038":4067,"SKD039":2646,"SKD035":1345}。未発動なし。敗北{"final_wave_defeated":200}|
|防御低下＋攻撃強化・SKD039-SKD041置換 (break-and-buff-replace-SKD039-SKD041)|100.0% (200/200)・185〜250行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD041|前面までの確定供給案・育成予算内。{"basic":23093,"SKD009":14005,"SKD038":3913,"SKD035":1250}。未発動SKD041。敗北{"final_wave_defeated":200}|
|防御低下＋攻撃強化・配置32541 (break-and-buff-order-32541)|28.5% (57/200)・257〜300行動|char_daimon_01:SKD009 ／ char_yuki_01:SKD038 ／ char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_joe_01:SKD035|前面までの確定供給案・育成予算内。{"basic":31416,"SKD009":17818,"SKD038":4805,"SKD039":3690,"SKD035":1519}。未発動なし。敗北{"final_wave_defeated":57,"action_limit":143}|
|防御低下＋攻撃強化・配置31245 (break-and-buff-order-31245)|11.0% (22/200)・286〜300行動|char_daimon_01:SKD009 ／ char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":31948,"SKD009":16434,"SKD038":5498,"SKD039":3721,"SKD035":2260}。未発動なし。敗北{"action_limit":178,"final_wave_defeated":22}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|80／3|20522.93／2898.16／2033.88|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD035 鬨の声 LB5 SP75 all_allies [{"type":"atk_up","power":10.943137453388001,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|2|竹中半兵衛 (char_yuki_01)|80／3|21446.93／2848.11／1985.52|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD038 鎧砕き LB5 SP50 first [{"type":"def_down","power":17.465826699149144,"duration":3,"carryAcrossWaves":true}] 入手:2-5 追加提案・前面初回確定|
|3|井伊直政 (char_daimon_01)|80／3|15084.53／4397.74／1606.08|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD009 岩断 LB5 SP50 first [{"type":"damage","power":153.63585661014858}] 入手:1-2 現行初回/任務確定|
|4|前田利家 (char_jihoon_01)|80／3|17618.93／3808.69／1795.80|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD009 岩断 LB5 SP50 first [{"type":"damage","power":153.63585661014858}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|80／3|16496.93／4108.99／1617.24|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD039 応急手当 LB5 SP35 lowest_ally [{"type":"heal","power":47.613446228805714,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":1369500,"eqExp":1149200,"cash":2409100,"skillMaterials":105,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_yuki_01":36,"char_daimon_01":36,"char_jihoon_01":36,"char_aoi_01":36},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":1369500,"eqExp":1613000,"cash":3261000,"skillMaterials":725,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_daimon_01":36,"char_aoi_01":36,"char_jihoon_01":36,"char_yuki_01":36},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"skill_material","amount":18}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":2727500,"charExp":1206700,"eqExp":1528100,"skillMaterials":709,"genericR":180}。追加案なしのEXP/銭周回比較: {"stage":"9-10","successfulClears":849,"energy":6792,"recipeSource":"9-10-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ1〜1（各試行の最小値）、最大5213〜7404。1ダメージ38982/117809攻撃イベント。BURST4〜11回。SP獲得2497〜4950、技消費2430〜4925、終了SP11〜108。
break-and-buff（元 100.0% (600/600)）の配置順だけ逆転: 3.0% (6/200)、252〜300行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD035","alternatives":[{"name":"burst-focus","wins":198,"n":200},{"name":"defensive","wins":21,"n":200},{"name":"armor-break","wins":14,"n":200}]},{"skill":"SKD038","alternatives":[{"name":"support-feed","wins":200,"n":200},{"name":"burst-focus","wins":198,"n":200},{"name":"taunt-counter","wins":133,"n":200},{"name":"defensive","wins":21,"n":200},{"name":"attack-up","wins":11,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"break-and-buff-replace-SKD009-SKD010","wins":200,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"break-and-buff-replace-SKD039-SKD041","wins":200,"n":200},{"name":"defensive","wins":21,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
|1/1 井伊直虎 (10-1/1/1)|hp|97850→62624|300行動に収まらない耐久負担を局所調整|
|1/1 井伊直虎 (10-1/1/1)|atk|5500→3974|全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|1/1 井伊直虎 (10-1/1/1)|def|10480→4003|防御が到達火力を上回る敵のみ突破余地を確保／強化後DEF/実ダメージの停滞を確認した敵を局所調整|
|1/2 雑賀孫市 (10-1/1/2)|atk|28090→2454|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|2/1 毛利元就 (10-1/2/1)|hp|97850→20520|300行動に収まらない耐久負担を局所調整|
|2/1 毛利元就 (10-1/2/1)|atk|7000→2244|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|2/1 毛利元就 (10-1/2/1)|def|10480→4709|防御が到達火力を上回る敵のみ突破余地を確保／強化後DEF/実ダメージの停滞を確認した敵を局所調整|
|2/2 細川ガラシャ (10-1/2/2)|atk|28090→2786|到達耐久で役割を維持できない主な攻撃源を調整／回復供給の膠着を緩和し処理順の選択を残す|
|3/1 北条氏康 (10-1/3/1)|hp|97850→78280|300行動に収まらない耐久負担を局所調整|
|3/1 北条氏康 (10-1/3/1)|atk|5500→2871|全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|3/1 北条氏康 (10-1/3/1)|def|10480→3403|防御が到達火力を上回る敵のみ突破余地を確保／強化後DEF/実ダメージの停滞を確認した敵を局所調整|
|3/2 上杉謙信 (10-1/3/2)|atk|28090→2853|全派の実HP損失から主な攻撃・継続被害の発生源を局所調整／回復供給の膠着を緩和し処理順の選択を残す|
|3/2 上杉謙信 (10-1/3/2)|def|6500→4003|防御が到達火力を上回る敵のみ突破余地を確保／強化後DEF/実ダメージの停滞を確認した敵を局所調整|


全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 10-1-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 10-1-validated.json.gz／10-1-sample-trace.json.gz。失敗した独立検証回は 10-1-validation-v1／round-*。

---

## 10-2 野を裂く狼煙
ID: sekigahara-2。設計意図: 分散被害と集中被害
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更9項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv80、覚醒3。R装備Lv50／LB0。技LB5。
到達経路: break-and-buff／support-feed／burst-focus／break-and-buff-replace-SKD008-SKD009／break-and-buff-replace-SKD009-SKD008／defensiveの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 防御低下＋攻撃強化 100.0% (200/200)、187〜249行動。変更前の同編成: 0.0% (0/200)。別戦法: SP供給＋攻撃強化 98.5% (197/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|防御低下＋攻撃強化 100.0% (200/200)|
|次点（60%前後）|該当なし|
|ギリギリ（30%前後）|防御低下＋攻撃強化・配置15342 25.5% (51/200)|
|ほぼ厳しい（0%超〜10%）|防御低下＋攻撃強化・配置31245 7.5% (15/200)|
|未勝利（観測0%）|攻撃強化（逆順比較） 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|防御低下＋攻撃強化 (break-and-buff)|100.0% (200/200)・187〜249行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":22188,"SKD009":6670,"SKD038":1987,"SKD039":2311,"SKD008":9752,"SKD035":82}。未発動なし。敗北{"final_wave_defeated":200}|
|SP供給＋攻撃強化 (support-feed)|98.5% (197/200)・222〜300行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":26813,"SKD009":6619,"SKD008":12501,"SKD039":3259,"SKD035":1734}。未発動なし。敗北{"final_wave_defeated":197,"action_limit":3}|
|通常攻撃でSP供給／攻撃役へBURST集中 (burst-focus)|98.5% (197/200)・236〜300行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":26813,"SKD009":8125,"SKD008":13704,"SKD039":3677}。未発動なし。敗北{"final_wave_defeated":197,"action_limit":3}|
|土属性集中＋攻撃強化 (double-rock)|11.5% (23/200)・285〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":30821,"SKD009":22107,"SKD003":1438,"SKD039":3885,"SKD035":1636}。未発動なし。敗北{"action_limit":177,"final_wave_defeated":23}|
|攻防弱体・継続回復 (defensive)|91.0% (182/200)・247〜300行動|char_joe_01:SKD036 ／ char_yuki_01:SKD037 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":29634,"SKD009":8671,"SKD037":3048,"SKD036":200,"SKD043":1351,"SKD008":12471}。未発動なし。敗北{"final_wave_defeated":182,"action_limit":18}|
|防御低下 (armor-break)|91.0% (182/200)・203〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":24183,"SKD009":7263,"SKD003":1452,"SKD008":10059,"SKD039":3590,"SKD038":1422}。未発動なし。敗北{"final_wave_defeated":182,"action_limit":18}|
|攻撃強化（逆順比較） (attack-up-reversed)|0.0% (0/200)・84〜300行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD008 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":17130,"SKD003":19080,"SKD009":905,"SKD008":2400,"SKD039":404,"SKD035":1540}。未発動なし。敗北{"party_defeated":86,"action_limit":114}|
|防御低下＋攻撃強化・SKD008-SKD009置換 (break-and-buff-replace-SKD008-SKD009)|100.0% (200/200)・225〜288行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":26179,"SKD009":19614,"SKD038":2218,"SKD039":2767,"SKD035":99}。未発動なし。敗北{"final_wave_defeated":200}|
|防御低下＋攻撃強化・SKD009-SKD008置換 (break-and-buff-replace-SKD009-SKD008)|100.0% (200/200)・175〜236行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD008 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":20839,"SKD008":15317,"SKD038":1927,"SKD039":2231,"SKD035":99}。未発動なし。敗北{"final_wave_defeated":200}|
|防御低下＋攻撃強化・配置15342 (break-and-buff-order-15342)|25.5% (51/200)・206〜279行動|char_joe_01:SKD035 ／ char_aoi_01:SKD039 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_yuki_01:SKD038|前面までの確定供給案・育成予算内。{"basic":27030,"SKD009":7245,"SKD008":9186,"SKD039":2015,"SKD038":2147,"SKD035":91}。未発動なし。敗北{"final_wave_defeated":51,"party_defeated":149}|
|防御低下＋攻撃強化・配置24351 (break-and-buff-order-24351)|23.5% (47/200)・231〜300行動|char_yuki_01:SKD038 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD008 ／ char_aoi_01:SKD039 ／ char_joe_01:SKD035|前面までの確定供給案・育成予算内。{"basic":32107,"SKD035":3198,"SKD008":8473,"SKD038":571,"SKD009":9772,"SKD039":4571}。未発動なし。敗北{"action_limit":139,"final_wave_defeated":47,"party_defeated":14}|
|防御低下＋攻撃強化・配置31245 (break-and-buff-order-31245)|7.5% (15/200)・280〜300行動|char_daimon_01:SKD008 ／ char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":31147,"SKD009":21626,"SKD038":3205,"SKD039":3138,"SKD008":190,"SKD035":580}。未発動なし。敗北{"action_limit":183,"final_wave_defeated":15,"party_defeated":2}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|80／3|20522.93／2898.16／2033.88|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD035 鬨の声 LB5 SP75 all_allies [{"type":"atk_up","power":10.943137453388001,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|2|竹中半兵衛 (char_yuki_01)|80／3|21446.93／2848.11／1985.52|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD038 鎧砕き LB5 SP50 first [{"type":"def_down","power":17.465826699149144,"duration":3,"carryAcrossWaves":true}] 入手:2-5 追加提案・前面初回確定|
|3|井伊直政 (char_daimon_01)|80／3|15084.53／4397.74／1606.08|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD008 水断 LB5 SP50 first [{"type":"damage","power":153.63585661014858}] 入手:4-5 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|80／3|17618.93／3808.69／1795.80|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD009 岩断 LB5 SP50 first [{"type":"damage","power":153.63585661014858}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|80／3|16496.93／4108.99／1617.24|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD039 応急手当 LB5 SP35 lowest_ally [{"type":"heal","power":47.613446228805714,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":1369500,"eqExp":1149200,"cash":2439100,"skillMaterials":135,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_yuki_01":36,"char_daimon_01":36,"char_jihoon_01":36,"char_aoi_01":36},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":1369500,"eqExp":1613000,"cash":3261000,"skillMaterials":725,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_daimon_01":36,"char_aoi_01":36,"char_jihoon_01":36,"char_yuki_01":36},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: []。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":2712500,"charExp":1201700,"eqExp":1524700,"skillMaterials":709,"genericR":180}。追加案なしのEXP/銭周回比較: {"stage":"10-1","successfulClears":636,"energy":5088,"recipeSource":"10-1-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ1〜1（各試行の最小値）、最大6003〜7751。1ダメージ6482/38610攻撃イベント。BURST5〜11回。SP獲得2453〜3982、技消費2400〜3940、終了SP11〜89。
break-and-buff（元 100.0% (200/200)）の配置順だけ逆転: 0.0% (0/200)、240〜300行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD035","alternatives":[{"name":"burst-focus","wins":197,"n":200},{"name":"armor-break","wins":182,"n":200},{"name":"defensive","wins":182,"n":200}]},{"skill":"SKD038","alternatives":[{"name":"support-feed","wins":197,"n":200},{"name":"burst-focus","wins":197,"n":200},{"name":"defensive","wins":182,"n":200},{"name":"double-rock","wins":23,"n":200},{"name":"attack-up-reversed","wins":0,"n":200}]},{"skill":"SKD008","alternatives":[{"name":"break-and-buff-replace-SKD008-SKD009","wins":200,"n":200},{"name":"double-rock","wins":23,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"break-and-buff-replace-SKD009-SKD008","wins":200,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"defensive","wins":182,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
|1/1 立花誾千代 (10-2/1/1)|atk|12548→3420|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|1/2 立花宗茂 (10-2/1/2)|atk|7170→4404|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|2/1 武田勝頼 (10-2/2/1)|hp|215250→172200|300行動に収まらない耐久負担を局所調整|
|2/1 武田勝頼 (10-2/2/1)|atk|10760→799|到達耐久で役割を維持できない主な攻撃源を調整|
|2/1 武田勝頼 (10-2/2/1)|def|6660→4003|防御が到達火力を上回る敵のみ突破余地を確保／強化後DEF/実ダメージの停滞を確認した敵を局所調整|
|3/1 伊達政宗 (10-2/3/1)|hp|215250→70533|300行動に収まらない耐久負担を局所調整|
|3/1 伊達政宗 (10-2/3/1)|atk|16000→2678|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|3/1 伊達政宗 (10-2/3/1)|def|6660→4003|防御が到達火力を上回る敵のみ突破余地を確保／強化後DEF/実ダメージの停滞を確認した敵を局所調整|
|3/2 井伊直政 (10-2/3/2)|atk|7170→3743|到達耐久で役割を維持できない主な攻撃源を調整|


全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 10-2-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 10-2-validated.json.gz／10-2-sample-trace.json.gz。失敗した独立検証回は 10-2-validation-v1／round-*。

---

## 10-3 幾重の旗影
ID: sekigahara-3。設計意図: 強化と保護の二重守備
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更11項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv80、覚醒3。R装備Lv50／LB0。技LB5。
到達経路: break-and-buff／burst-focus／break-and-buff-replace-SKD010-SKD009／break-and-buff-replace-SKD009-SKD010／break-and-buff-replace-SKD039-SKD040の切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 防御低下＋攻撃強化 100.0% (600/600)、171〜287行動。変更前の同編成: 0.0% (0/600)。別戦法: 通常攻撃でSP供給／攻撃役へBURST集中 100.0% (200/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|防御低下＋攻撃強化 100.0% (600/600)|
|次点（60%前後）|防御低下 52.0% (104/200)|
|ギリギリ（30%前後）|攻防弱体・継続回復 23.5% (47/200)|
|ほぼ厳しい（0%超〜10%）|該当なし|
|未勝利（観測0%）|攻撃強化（逆順比較） 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|防御低下＋攻撃強化 (break-and-buff)|100.0% (600/600)・171〜287行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":72076,"SKD009":12866,"SKD038":11014,"SKD035":2883,"SKD010":27936,"SKD039":7930}。未発動なし。敗北{"final_wave_defeated":600}|
|SP供給＋攻撃強化 (support-feed)|100.0% (200/200)・209〜298行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":27053,"SKD009":4251,"SKD010":12772,"SKD035":2199,"SKD039":3355}。未発動なし。敗北{"final_wave_defeated":200}|
|通常攻撃でSP供給／攻撃役へBURST集中 (burst-focus)|100.0% (200/200)・208〜291行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":25786,"SKD009":5445,"SKD010":14691,"SKD039":3272}。未発動なし。敗北{"final_wave_defeated":200}|
|土属性集中＋攻撃強化 (double-rock)|42.5% (85/200)・239〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":28461,"SKD009":17996,"SKD003":7523,"SKD035":1049,"SKD039":3017}。未発動なし。敗北{"final_wave_defeated":85,"action_limit":115}|
|攻防弱体・継続回復 (defensive)|23.5% (47/200)・237〜300行動|char_joe_01:SKD036 ／ char_yuki_01:SKD037 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":32402,"SKD009":7970,"SKD037":5156,"SKD036":1188,"SKD010":11311,"SKD043":1198}。未発動なし。敗北{"final_wave_defeated":47,"action_limit":153}|
|挑発・反撃 (taunt-counter)|89.5% (179/200)・227〜300行動|char_joe_01:SKD049→SKD048 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":28798,"SKD009":4892,"SKD048":1648,"SKD010":13595,"SKD049":958,"SKD035":1171,"SKD039":3107}。未発動なし。敗北{"final_wave_defeated":179,"action_limit":21}|
|防御低下 (armor-break)|52.0% (104/200)・237〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":27776,"SKD009":5869,"SKD003":7992,"SKD010":10390,"SKD038":2437,"SKD039":3216}。未発動なし。敗北{"action_limit":96,"final_wave_defeated":104}|
|攻撃強化（逆順比較） (attack-up-reversed)|0.0% (0/200)・265〜300行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD010 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":22706,"SKD003":25583,"SKD009":2697,"SKD010":4076,"SKD039":862,"SKD035":804}。未発動なし。敗北{"party_defeated":131,"action_limit":69}|
|防御低下＋攻撃強化・SKD010-SKD009置換 (break-and-buff-replace-SKD010-SKD009)|99.5% (199/200)・177〜300行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":24402,"SKD009":14434,"SKD038":3772,"SKD035":875,"SKD039":2246}。未発動なし。敗北{"final_wave_defeated":199,"action_limit":1}|
|防御低下＋攻撃強化・SKD009-SKD010置換 (break-and-buff-replace-SKD009-SKD010)|100.0% (200/200)・189〜300行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD010 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":24482,"SKD010":13939,"SKD038":3834,"SKD035":992,"SKD039":2743}。未発動なし。敗北{"final_wave_defeated":200}|
|防御低下＋攻撃強化・SKD039-SKD040置換 (break-and-buff-replace-SKD039-SKD040)|100.0% (200/200)・173〜248行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD040|前面までの確定供給案・育成予算内。{"basic":22080,"SKD009":5934,"SKD038":3560,"SKD035":1049,"SKD010":7810}。未発動SKD040。敗北{"final_wave_defeated":200}|
|防御低下＋攻撃強化・配置14253 (break-and-buff-order-14253)|95.0% (190/200)・199〜300行動|char_joe_01:SKD035 ／ char_jihoon_01:SKD009 ／ char_yuki_01:SKD038 ／ char_aoi_01:SKD039 ／ char_daimon_01:SKD010|前面までの確定供給案・育成予算内。{"basic":26306,"SKD010":9188,"SKD009":9683,"SKD038":2135,"SKD039":3494,"SKD035":238}。未発動なし。敗北{"final_wave_defeated":190,"action_limit":10}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|80／3|20522.93／2898.16／2033.88|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD035 鬨の声 LB5 SP75 all_allies [{"type":"atk_up","power":10.943137453388001,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|2|竹中半兵衛 (char_yuki_01)|80／3|21446.93／2848.11／1985.52|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD038 鎧砕き LB5 SP50 first [{"type":"def_down","power":17.465826699149144,"duration":3,"carryAcrossWaves":true}] 入手:2-5 追加提案・前面初回確定|
|3|井伊直政 (char_daimon_01)|80／3|15084.53／4397.74／1606.08|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD010 風断 LB5 SP50 first [{"type":"damage","power":153.63585661014858}] 入手:2-5 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|80／3|17618.93／3808.69／1795.80|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD009 岩断 LB5 SP50 first [{"type":"damage","power":153.63585661014858}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|80／3|16496.93／4108.99／1617.24|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD039 応急手当 LB5 SP35 lowest_ally [{"type":"heal","power":47.613446228805714,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":1369500,"eqExp":1149200,"cash":2439100,"skillMaterials":135,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_yuki_01":36,"char_daimon_01":36,"char_jihoon_01":36,"char_aoi_01":36},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":1369500,"eqExp":1613000,"cash":3261000,"skillMaterials":725,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_daimon_01":36,"char_aoi_01":36,"char_jihoon_01":36,"char_yuki_01":36},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: []。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":2697500,"charExp":1196700,"eqExp":1521300,"skillMaterials":709,"genericR":180}。追加案なしのEXP/銭周回比較: {"stage":"10-2","successfulClears":634,"energy":5072,"recipeSource":"10-2-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ0〜0（各試行の最小値）、最大4566〜7229。1ダメージ35417/112878攻撃イベント。BURST4〜11回。SP獲得2376〜4708、技消費2340〜4655、終了SP11〜134。
break-and-buff（元 100.0% (600/600)）の配置順だけ逆転: 14.0% (28/200)、192〜300行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD035","alternatives":[{"name":"burst-focus","wins":200,"n":200},{"name":"armor-break","wins":104,"n":200},{"name":"defensive","wins":47,"n":200}]},{"skill":"SKD038","alternatives":[{"name":"burst-focus","wins":200,"n":200},{"name":"support-feed","wins":200,"n":200},{"name":"taunt-counter","wins":179,"n":200},{"name":"double-rock","wins":85,"n":200},{"name":"defensive","wins":47,"n":200},{"name":"attack-up-reversed","wins":0,"n":200}]},{"skill":"SKD010","alternatives":[{"name":"break-and-buff-replace-SKD010-SKD009","wins":199,"n":200},{"name":"double-rock","wins":85,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"break-and-buff-replace-SKD009-SKD010","wins":200,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"break-and-buff-replace-SKD039-SKD040","wins":200,"n":200},{"name":"defensive","wins":47,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
|1/1 上杉景勝 (10-3/1/1)|atk|5780→4913|全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|1/1 上杉景勝 (10-3/1/1)|def|5780→3591|防御が到達火力を上回る敵のみ突破余地を確保／強化後DEF/実ダメージの停滞を確認した敵を局所調整|
|1/2 濃姫 (10-3/1/2)|atk|8930→2434|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|2/1 加藤清正 (10-3/2/1)|hp|77700→2187|300行動に収まらない耐久負担を局所調整|
|2/1 加藤清正 (10-3/2/1)|def|5780→4225|防御が到達火力を上回る敵のみ突破余地を確保／強化後DEF/実ダメージの停滞を確認した敵を局所調整|
|2/2 真田昌幸 (10-3/2/2)|hp|44100→2424|300行動に収まらない耐久負担を局所調整|
|2/2 真田昌幸 (10-3/2/2)|atk|8930→4661|到達耐久で役割を維持できない主な攻撃源を調整|
|3/1 徳川家康 (10-3/3/1)|hp|220500→57803|300行動に収まらない耐久負担を局所調整|
|3/1 徳川家康 (10-3/3/1)|atk|11030→2555|全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|3/1 徳川家康 (10-3/3/1)|def|6830→3403|防御が到達火力を上回る敵のみ突破余地を確保／強化後DEF/実ダメージの停滞を確認した敵を局所調整|
|3/2 片倉景綱 (10-3/3/2)|atk|8930→2863|全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|


全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 10-3-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 10-3-validated.json.gz／10-3-sample-trace.json.gz。失敗した独立検証回は 10-3-validation-v1／round-*。

---

## 10-4 夜襲の足音
ID: sekigahara-4。設計意図: 火力低下と継続被害
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更9項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv80、覚醒3。R装備Lv50／LB0。技LB5。
到達経路: cleanse-dot／armor-break／double-rock／cleanse-dot-replace-SKD009-SKD008／cleanse-dot-replace-SKD039-SKD040の切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 継続被害解除 100.0% (200/200)、112〜275行動。変更前の同編成: 0.0% (0/200)。別戦法: 防御低下 87.5% (175/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|継続被害解除 100.0% (200/200)|
|次点（60%前後）|該当なし|
|ギリギリ（30%前後）|攻防弱体・継続回復 33.0% (66/200)|
|ほぼ厳しい（0%超〜10%）|継続被害解除・配置41532 1.5% (3/200)|
|未勝利（観測0%）|攻撃強化（逆順比較） 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|継続被害解除 (cleanse-dot)|100.0% (200/200)・112〜275行動|char_joe_01:SKD054 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD011 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":15411,"SKD009":5691,"SKD011":4145,"SKD054":297,"SKD035":359,"SKD039":3049}。未発動なし。敗北{"final_wave_defeated":200}|
|防御低下＋攻撃強化 (break-and-buff)|85.0% (170/200)・102〜300行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD011 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":19840,"SKD009":5511,"SKD038":943,"SKD035":85,"SKD011":2639,"SKD039":5937}。未発動なし。敗北{"action_limit":30,"final_wave_defeated":170}|
|防御低下 (armor-break)|87.5% (175/200)・112〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD011 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":18109,"SKD009":5071,"SKD003":1141,"SKD011":3692,"SKD039":5077,"SKD038":525}。未発動なし。敗北{"final_wave_defeated":175,"action_limit":25}|
|土属性集中＋攻撃強化 (double-rock)|85.0% (170/200)・113〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":19379,"SKD009":9270,"SKD003":1120,"SKD039":5712,"SKD035":158}。未発動なし。敗北{"final_wave_defeated":170,"action_limit":29,"party_defeated":1}|
|攻防弱体・継続回復 (defensive)|33.0% (66/200)・102〜227行動|char_joe_01:SKD036 ／ char_yuki_01:SKD037 ／ char_daimon_01:SKD011 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":22367,"SKD009":4480,"SKD037":1172,"SKD036":170,"SKD011":2872,"SKD043":3694}。未発動なし。敗北{"party_defeated":134,"final_wave_defeated":66}|
|攻撃のみ比較 (all-attack)|42.0% (84/200)・89〜127行動|char_joe_01:SKD011 ／ char_yuki_01:SKD011 ／ char_daimon_01:SKD011 ／ char_jihoon_01:SKD011 ／ char_aoi_01:SKD011|前面までの確定供給案・育成予算内。{"basic":12104,"SKD011":10523}。未発動なし。敗北{"final_wave_defeated":84,"party_defeated":116}|
|行動妨害 (stun)|13.0% (26/200)・99〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD032 ／ char_daimon_01:SKD011 ／ char_jihoon_01:SKD026 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":17029,"SKD026":3385,"SKD003":1243,"SKD011":3738,"SKD039":5954,"SKD032":439}。未発動なし。敗北{"party_defeated":140,"final_wave_defeated":26,"action_limit":34}|
|攻撃強化（逆順比較） (attack-up-reversed)|0.0% (0/200)・86〜115行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD011 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":8336,"SKD003":6834,"SKD009":1263,"SKD011":2431,"SKD039":505,"SKD035":143}。未発動なし。敗北{"party_defeated":200}|
|継続被害解除・SKD009-SKD008置換 (cleanse-dot-replace-SKD009-SKD008)|94.0% (188/200)・109〜300行動|char_joe_01:SKD054 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD011 ／ char_jihoon_01:SKD008 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":17408,"SKD008":5341,"SKD011":4004,"SKD054":350,"SKD035":340,"SKD039":4288}。未発動なし。敗北{"final_wave_defeated":188,"action_limit":12}|
|継続被害解除・SKD039-SKD040置換 (cleanse-dot-replace-SKD039-SKD040)|100.0% (200/200)・112〜296行動|char_joe_01:SKD054 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD011 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD040|前面までの確定供給案・育成予算内。{"basic":24822,"SKD009":4707,"SKD011":3613,"SKD054":326,"SKD035":527,"SKD040":2245}。未発動なし。敗北{"final_wave_defeated":200}|
|継続被害解除・配置42135 (cleanse-dot-order-42135)|78.5% (157/200)・115〜300行動|char_jihoon_01:SKD009 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD054 ／ char_daimon_01:SKD011 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":22605,"SKD011":7032,"SKD054":1113,"SKD009":770,"SKD039":7062,"SKD035":241}。未発動なし。敗北{"final_wave_defeated":157,"action_limit":41,"party_defeated":2}|
|継続被害解除・配置41532 (cleanse-dot-order-41532)|1.5% (3/200)・92〜197行動|char_jihoon_01:SKD009 ／ char_joe_01:SKD054 ／ char_aoi_01:SKD039 ／ char_daimon_01:SKD011 ／ char_yuki_01:SKD035|前面までの確定供給案・育成予算内。{"basic":15235,"SKD011":5646,"SKD035":2330,"SKD039":1393,"SKD054":639,"SKD009":417}。未発動なし。敗北{"party_defeated":197,"final_wave_defeated":3}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|80／3|20522.93／2898.16／2033.88|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD054 浄毒 LB5 SP37 first_ally [{"type":"cleanse","power":1,"cleanseCategory":"dot"}] 入手:5-6 追加提案・前面初回確定|
|2|竹中半兵衛 (char_yuki_01)|80／3|21446.93／2848.11／1985.52|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD035 鬨の声 LB5 SP75 all_allies [{"type":"atk_up","power":10.943137453388001,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|3|井伊直政 (char_daimon_01)|80／3|15084.53／4397.74／1606.08|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD011 光断 LB5 SP50 first [{"type":"damage","power":153.63585661014858}] 入手:5-6 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|80／3|17618.93／3808.69／1795.80|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD009 岩断 LB5 SP50 first [{"type":"damage","power":153.63585661014858}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|80／3|16496.93／4108.99／1617.24|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD039 応急手当 LB5 SP35 lowest_ally [{"type":"heal","power":47.613446228805714,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":1369500,"eqExp":1149200,"cash":2439100,"skillMaterials":135,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_yuki_01":36,"char_daimon_01":36,"char_jihoon_01":36,"char_aoi_01":36},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":1369500,"eqExp":1613000,"cash":3289000,"skillMaterials":753,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_daimon_01":36,"char_aoi_01":36,"char_jihoon_01":36,"char_yuki_01":36},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"skill_material","amount":28}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":2710500,"charExp":1191700,"eqExp":1517900,"skillMaterials":737,"genericR":180}。追加案なしのEXP/銭周回比較: {"stage":"10-3","successfulClears":633,"energy":5064,"recipeSource":"10-3-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ1〜1（各試行の最小値）、最大5876〜7913。1ダメージ3037/25247攻撃イベント。BURST2〜7回。SP獲得1573〜4154、技消費1497〜3754、終了SP13〜400。
cleanse-dot（元 100.0% (200/200)）の配置順だけ逆転: 0.0% (0/200)、96〜121行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD054","alternatives":[{"name":"armor-break","wins":175,"n":200},{"name":"break-and-buff","wins":170,"n":200},{"name":"double-rock","wins":170,"n":200},{"name":"all-attack","wins":84,"n":200},{"name":"defensive","wins":66,"n":200},{"name":"stun","wins":26,"n":200},{"name":"attack-up-reversed","wins":0,"n":200}]},{"skill":"SKD035","alternatives":[{"name":"armor-break","wins":175,"n":200},{"name":"all-attack","wins":84,"n":200},{"name":"defensive","wins":66,"n":200},{"name":"stun","wins":26,"n":200}]},{"skill":"SKD011","alternatives":[{"name":"double-rock","wins":170,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"cleanse-dot-replace-SKD009-SKD008","wins":188,"n":200},{"name":"all-attack","wins":84,"n":200},{"name":"stun","wins":26,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"cleanse-dot-replace-SKD039-SKD040","wins":200,"n":200},{"name":"all-attack","wins":84,"n":200},{"name":"defensive","wins":66,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
|1/2 斎藤道三 (10-4/1/2)|atk|7530→5441|全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|2/1 長宗我部元親 (10-4/2/1)|atk|7530→5441|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|3/1 明智光秀 (10-4/3/1)|hp|225750→12410|300行動に収まらない耐久負担を局所調整|
|3/1 明智光秀 (10-4/3/1)|atk|11290→3076|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|3/1 明智光秀 (10-4/3/1)|def|6990→4003|防御が到達火力を上回る敵のみ突破余地を確保／強化後DEF/実ダメージの停滞を確認した敵を局所調整|
|3/2 服部半蔵 (10-4/3/2)|hp|49450→10370|300行動に収まらない耐久負担を局所調整|
|3/2 服部半蔵 (10-4/3/2)|atk|7530→3341|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|3/3 山本勘助 (10-4/3/3)|hp|36550→11977|300行動に収まらない耐久負担を局所調整|
|3/3 山本勘助 (10-4/3/3)|atk|6450→3368|到達耐久で役割を維持できない主な攻撃源を調整|


全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 10-4-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 10-4-validated.json.gz／10-4-sample-trace.json.gz。失敗した独立検証回は 10-4-validation-v1／round-*。

---

## 10-5 暁の先陣
ID: sekigahara-5。設計意図: 同属性主軸の弱点を補う
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更12項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv80、覚醒3。R装備Lv50／LB0。技LB5。
到達経路: break-and-buff／support-feed／burst-focus／break-and-buff-replace-SKD008-SKD009／break-and-buff-replace-SKD009-SKD007／break-and-buff-replace-SKD039-SKD040の切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 防御低下＋攻撃強化 100.0% (600/600)、182〜275行動。変更前の同編成: 0.0% (0/600)。別戦法: SP供給＋攻撃強化 100.0% (200/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|防御低下＋攻撃強化 100.0% (600/600)|
|次点（60%前後）|防御低下＋攻撃強化・配置31245 64.5% (129/200)|
|ギリギリ（30%前後）|土属性集中＋攻撃強化 20.0% (40/200)|
|ほぼ厳しい（0%超〜10%）|該当なし|
|未勝利（観測0%）|攻撃強化（逆順比較） 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|防御低下＋攻撃強化 (break-and-buff)|100.0% (600/600)・182〜275行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":69278,"SKD009":10679,"SKD038":10007,"SKD008":28694,"SKD035":2257,"SKD039":10675}。未発動なし。敗北{"final_wave_defeated":600}|
|SP供給＋攻撃強化 (support-feed)|100.0% (200/200)・194〜267行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":24992,"SKD009":3720,"SKD008":12214,"SKD035":1701,"SKD039":3806}。未発動なし。敗北{"final_wave_defeated":200}|
|通常攻撃でSP供給／攻撃役へBURST集中 (burst-focus)|99.5% (199/200)・201〜300行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":24166,"SKD009":5165,"SKD008":13693,"SKD039":3407}。未発動なし。敗北{"final_wave_defeated":199,"action_limit":1}|
|土属性集中＋攻撃強化 (double-rock)|20.0% (40/200)・263〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":29566,"SKD009":19312,"SKD003":6095,"SKD035":1191,"SKD039":3332}。未発動なし。敗北{"final_wave_defeated":40,"action_limit":160}|
|攻防弱体・継続回復 (defensive)|79.5% (159/200)・228〜300行動|char_joe_01:SKD036 ／ char_yuki_01:SKD037 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":30225,"SKD009":7169,"SKD037":4460,"SKD008":11095,"SKD043":1085,"SKD036":1185}。未発動なし。敗北{"action_limit":41,"final_wave_defeated":159}|
|攻撃強化 (attack-up)|90.0% (180/200)・205〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":26279,"SKD009":5462,"SKD003":5667,"SKD008":11358,"SKD035":1132,"SKD039":2819}。未発動なし。敗北{"final_wave_defeated":180,"action_limit":20}|
|攻撃強化（逆順比較） (attack-up-reversed)|0.0% (0/200)・300〜300行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD008 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":26738,"SKD003":16340,"SKD009":6276,"SKD008":7217,"SKD039":3331,"SKD035":98}。未発動なし。敗北{"action_limit":200}|
|防御低下＋攻撃強化・SKD008-SKD009置換 (break-and-buff-replace-SKD008-SKD009)|98.5% (197/200)・219〜300行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":27634,"SKD009":16025,"SKD038":3943,"SKD035":805,"SKD039":4338}。未発動なし。敗北{"final_wave_defeated":197,"action_limit":3}|
|防御低下＋攻撃強化・SKD009-SKD007置換 (break-and-buff-replace-SKD009-SKD007)|100.0% (200/200)・174〜249行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD007 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":21872,"SKD007":3327,"SKD038":3160,"SKD008":9035,"SKD035":678,"SKD039":3389}。未発動なし。敗北{"final_wave_defeated":200}|
|防御低下＋攻撃強化・SKD039-SKD040置換 (break-and-buff-replace-SKD039-SKD040)|100.0% (200/200)・167〜210行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD040|前面までの確定供給案・育成予算内。{"basic":19962,"SKD009":5225,"SKD038":3197,"SKD008":7901,"SKD035":719}。未発動SKD040。敗北{"final_wave_defeated":200}|
|防御低下＋攻撃強化・配置31245 (break-and-buff-order-31245)|64.5% (129/200)・258〜300行動|char_daimon_01:SKD008 ／ char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":30516,"SKD009":14086,"SKD038":4654,"SKD008":3223,"SKD039":4091,"SKD035":1379}。未発動なし。敗北{"action_limit":71,"final_wave_defeated":129}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|80／3|20522.93／2898.16／2033.88|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD035 鬨の声 LB5 SP75 all_allies [{"type":"atk_up","power":10.943137453388001,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|2|竹中半兵衛 (char_yuki_01)|80／3|21446.93／2848.11／1985.52|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD038 鎧砕き LB5 SP50 first [{"type":"def_down","power":17.465826699149144,"duration":3,"carryAcrossWaves":true}] 入手:2-5 追加提案・前面初回確定|
|3|井伊直政 (char_daimon_01)|80／3|15084.53／4397.74／1606.08|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD008 水断 LB5 SP50 first [{"type":"damage","power":153.63585661014858}] 入手:4-5 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|80／3|17618.93／3808.69／1795.80|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD009 岩断 LB5 SP50 first [{"type":"damage","power":153.63585661014858}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|80／3|16496.93／4108.99／1617.24|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD039 応急手当 LB5 SP35 lowest_ally [{"type":"heal","power":47.613446228805714,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":1369500,"eqExp":1149200,"cash":2439100,"skillMaterials":135,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_yuki_01":36,"char_daimon_01":36,"char_jihoon_01":36,"char_aoi_01":36},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":1369500,"eqExp":1613000,"cash":3289000,"skillMaterials":753,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_daimon_01":36,"char_aoi_01":36,"char_jihoon_01":36,"char_yuki_01":36},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: []。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":2695500,"charExp":1186700,"eqExp":1514500,"skillMaterials":737,"genericR":180}。追加案なしのEXP/銭周回比較: {"stage":"10-4","successfulClears":632,"energy":5056,"recipeSource":"10-4-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ1〜1（各試行の最小値）、最大6079〜8745。1ダメージ29099/108651攻撃イベント。BURST4〜11回。SP獲得2464〜4642、技消費2395〜4615、終了SP11〜113。
break-and-buff（元 100.0% (600/600)）の配置順だけ逆転: 84.5% (169/200)、214〜300行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD035","alternatives":[{"name":"burst-focus","wins":199,"n":200},{"name":"defensive","wins":159,"n":200}]},{"skill":"SKD038","alternatives":[{"name":"support-feed","wins":200,"n":200},{"name":"burst-focus","wins":199,"n":200},{"name":"attack-up","wins":180,"n":200},{"name":"defensive","wins":159,"n":200},{"name":"double-rock","wins":40,"n":200},{"name":"attack-up-reversed","wins":0,"n":200}]},{"skill":"SKD008","alternatives":[{"name":"break-and-buff-replace-SKD008-SKD009","wins":197,"n":200},{"name":"double-rock","wins":40,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"break-and-buff-replace-SKD009-SKD007","wins":200,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"break-and-buff-replace-SKD039-SKD040","wins":200,"n":200},{"name":"defensive","wins":159,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
|1/1 今川義元 (10-5/1/1)|atk|10930→3504|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|1/1 今川義元 (10-5/1/1)|def|6050→2717|防御が到達火力を上回る敵のみ突破余地を確保／強化後DEF/実ダメージの停滞を確認した敵を局所調整|
|1/2 雑賀孫市 (10-5/1/2)|atk|7700→2098|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|2/1 上杉景勝 (10-5/2/1)|hp|89540→7691|300行動に収まらない耐久負担を局所調整|
|2/1 上杉景勝 (10-5/2/1)|atk|10930→4849|到達耐久で役割を維持できない主な攻撃源を調整|
|2/1 上杉景勝 (10-5/2/1)|def|6050→3196|防御が到達火力を上回る敵のみ突破余地を確保／強化後DEF/実ダメージの停滞を確認した敵を局所調整|
|2/2 長宗我部元親 (10-5/2/2)|hp|50600→8490|300行動に収まらない耐久負担を局所調整|
|2/2 長宗我部元親 (10-5/2/2)|atk|7700→2904|到達耐久で役割を維持できない主な攻撃源を調整|
|3/1 織田信長 (10-5/3/1)|hp|254100→117089|300行動に収まらない耐久負担を局所調整／BURST乱数で上限へ接近する派に行動余裕を設ける|
|3/1 織田信長 (10-5/3/1)|atk|10930→1554|全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|3/1 織田信長 (10-5/3/1)|def|7150→4003|防御が到達火力を上回る敵のみ突破余地を確保／強化後DEF/実ダメージの停滞を確認した敵を局所調整|
|3/2 島津義弘 (10-5/3/2)|atk|7700→2098|全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|


全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 10-5-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 10-5-validated.json.gz／10-5-sample-trace.json.gz。失敗した独立検証回は 10-5-validation-v1／round-*。

---

## 10-6 決戦前夜
ID: sekigahara-6。設計意図: 条件火力を維持する
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更12項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv80、覚醒3。R装備Lv50／LB0。技LB5。
到達経路: burst-focus／break-and-buff／burst-focus-replace-SKD010-SKD007／burst-focus-replace-SKD009-SKD010／defensiveの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 通常攻撃でSP供給／攻撃役へBURST集中 100.0% (200/200)、184〜267行動。変更前の同編成: 0.0% (0/200)。別戦法: 防御低下＋攻撃強化 99.5% (199/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|通常攻撃でSP供給／攻撃役へBURST集中 100.0% (200/200)|
|次点（60%前後）|通常攻撃でSP供給／攻撃役へBURST集中・SKD010-SKD007置換 70.0% (140/200)|
|ギリギリ（30%前後）|土属性集中＋攻撃強化 37.5% (75/200)|
|ほぼ厳しい（0%超〜10%）|継続ダメージ＋弱体 8.5% (17/200)|
|未勝利（観測0%）|攻撃強化（逆順比較） 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|防御低下＋攻撃強化 (break-and-buff)|99.5% (199/200)・163〜300行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":21404,"SKD009":3664,"SKD038":3208,"SKD035":255,"SKD039":3752,"SKD010":9135}。未発動なし。敗北{"final_wave_defeated":199,"action_limit":1}|
|通常攻撃でSP供給／攻撃役へBURST集中 (burst-focus)|100.0% (200/200)・184〜267行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":22115,"SKD009":4024,"SKD010":12427,"SKD039":4164}。未発動なし。敗北{"final_wave_defeated":200}|
|土属性集中＋攻撃強化 (double-rock)|37.5% (75/200)・237〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":29373,"SKD009":20067,"SKD003":2396,"SKD039":5139,"SKD035":595}。未発動なし。敗北{"action_limit":125,"final_wave_defeated":75}|
|攻防弱体・継続回復 (defensive)|93.0% (186/200)・201〜300行動|char_joe_01:SKD036 ／ char_yuki_01:SKD037 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":27639,"SKD009":7690,"SKD037":3900,"SKD036":493,"SKD043":1226,"SKD010":10168}。未発動なし。敗北{"final_wave_defeated":186,"action_limit":13,"party_defeated":1}|
|継続ダメージ＋弱体 (poison-control)|8.5% (17/200)・269〜300行動|char_joe_01:SKD037 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD029 ／ char_jihoon_01:SKD010 ／ char_aoi_01:SKD043|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":33375,"SKD010":12898,"SKD038":2900,"SKD037":1083,"SKD029":6904,"SKD043":2630}。未発動なし。敗北{"action_limit":183,"final_wave_defeated":17}|
|攻撃強化（逆順比較） (attack-up-reversed)|0.0% (0/200)・189〜300行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD010 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":19512,"SKD003":21481,"SKD009":2252,"SKD010":3464,"SKD039":511,"SKD035":899}。未発動なし。敗北{"party_defeated":195,"action_limit":5}|
|通常攻撃でSP供給／攻撃役へBURST集中・SKD010-SKD007置換 (burst-focus-replace-SKD010-SKD007)|70.0% (140/200)・215〜300行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD007 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":28280,"SKD009":7848,"SKD007":13175,"SKD039":5174}。未発動なし。敗北{"final_wave_defeated":140,"action_limit":60}|
|通常攻撃でSP供給／攻撃役へBURST集中・SKD009-SKD010置換 (burst-focus-replace-SKD009-SKD010)|100.0% (200/200)・182〜245行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD010 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":21723,"SKD010":16144,"SKD039":4026}。未発動なし。敗北{"final_wave_defeated":200}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|80／3|20522.93／2898.16／2033.88|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|技なし|
|2|竹中半兵衛 (char_yuki_01)|80／3|21446.93／2848.11／1985.52|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|技なし|
|3|井伊直政 (char_daimon_01)|80／3|15084.53／4397.74／1606.08|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD010 風断 LB5 SP50 first [{"type":"damage","power":153.63585661014858}] 入手:2-5 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|80／3|17618.93／3808.69／1795.80|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD009 岩断 LB5 SP50 first [{"type":"damage","power":153.63585661014858}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|80／3|16496.93／4108.99／1617.24|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD039 応急手当 LB5 SP35 lowest_ally [{"type":"heal","power":47.613446228805714,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":1369500,"eqExp":1149200,"cash":2379100,"skillMaterials":75,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_yuki_01":36,"char_daimon_01":36,"char_jihoon_01":36,"char_aoi_01":36},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":1369500,"eqExp":1613000,"cash":3289000,"skillMaterials":753,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_daimon_01":36,"char_aoi_01":36,"char_jihoon_01":36,"char_yuki_01":36},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: []。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":2680500,"charExp":1181700,"eqExp":1511100,"skillMaterials":737,"genericR":180}。追加案なしのEXP/銭周回比較: {"stage":"10-5","successfulClears":630,"energy":5040,"recipeSource":"10-5-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ1〜1（各試行の最小値）、最大5081〜6162。1ダメージ18495/38566攻撃イベント。BURST4〜10回。SP獲得2585〜4378、技消費2520〜4290、終了SP11〜114。
burst-focus（元 100.0% (200/200)）の配置順だけ逆転: 0.0% (0/200)、219〜300行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD010","alternatives":[{"name":"burst-focus-replace-SKD010-SKD007","wins":140,"n":200},{"name":"double-rock","wins":75,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"burst-focus-replace-SKD009-SKD010","wins":200,"n":200},{"name":"poison-control","wins":17,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"defensive","wins":186,"n":200},{"name":"poison-control","wins":17,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
|1/1 加藤清正 (10-6/1/1)|atk|6190→4473|到達耐久で役割を維持できない主な攻撃源を調整|
|1/1 加藤清正 (10-6/1/1)|def|6190→3269|防御が到達火力を上回る敵のみ突破余地を確保／強化後DEF/実ダメージの停滞を確認した敵を局所調整|
|1/2 島津義久 (10-6/1/2)|atk|6750→3523|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|2/1 北条氏康 (10-6/2/1)|hp|83250→66600|300行動に収まらない耐久負担を局所調整|
|2/1 北条氏康 (10-6/2/1)|atk|6190→4473|到達耐久で役割を維持できない主な攻撃源を調整|
|2/1 北条氏康 (10-6/2/1)|def|6190→3846|防御が到達火力を上回る敵のみ突破余地を確保／強化後DEF/実ダメージの停滞を確認した敵を局所調整|
|2/2 上杉景勝 (10-6/2/2)|atk|6750→3523|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|3/1 前田慶次 (10-6/3/1)|hp|24000→7864|300行動に収まらない耐久負担を局所調整|
|3/1 前田慶次 (10-6/3/1)|atk|11810→3786|到達耐久で役割を維持できない主な攻撃源を調整|
|3/1 前田慶次 (10-6/3/1)|def|28000→4709|防御が到達火力を上回る敵のみ突破余地を確保／強化後DEF/実ダメージの停滞を確認した敵を局所調整|
|3/2 細川ガラシャ (10-6/3/2)|hp|45000→7550|300行動に収まらない耐久負担を局所調整|
|3/2 細川ガラシャ (10-6/3/2)|atk|10130→5288|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|


全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 10-6-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 10-6-validated.json.gz／10-6-sample-trace.json.gz。失敗した独立検証回は 10-6-validation-v1／round-*。

---

## 10-7 紅の誓い
ID: sekigahara-7。設計意図: 背水と生存を両立する
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更8項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv80、覚醒3。R装備Lv50／LB0。技LB5。
到達経路: armor-break／defensive／double-rock／armor-break-replace-SKD009-SKD008の切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 防御低下 100.0% (200/200)、121〜197行動。変更前の同編成: 0.0% (0/200)。別戦法: 攻防弱体・継続回復 99.5% (199/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|防御低下 100.0% (200/200)|
|次点（60%前後）|防御低下・配置15342 51.5% (103/200)|
|ギリギリ（30%前後）|該当なし|
|ほぼ厳しい（0%超〜10%）|高消費技を先に装備 5.5% (11/200)|
|未勝利（観測0%）|攻撃強化（逆順比較） 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|防御低下 (armor-break)|100.0% (200/200)・121〜197行動|char_joe_01:SKD003 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":15616,"SKD009":6950,"SKD008":5949,"SKD038":334,"SKD039":1058}。未発動SKD003。敗北{"final_wave_defeated":200}|
|攻防弱体・継続回復 (defensive)|99.5% (199/200)・123〜300行動|char_joe_01:SKD036 ／ char_yuki_01:SKD037 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":16069,"SKD009":5347,"SKD008":7220,"SKD037":623,"SKD043":663}。未発動SKD036。敗北{"final_wave_defeated":199,"action_limit":1}|
|SP供給＋攻撃強化 (support-feed)|99.5% (199/200)・119〜213行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":16273,"SKD009":6895,"SKD008":6302,"SKD035":311,"SKD039":1090}。未発動なし。敗北{"final_wave_defeated":199,"party_defeated":1}|
|土属性集中＋攻撃強化 (double-rock)|97.5% (195/200)・132〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":16896,"SKD009":13453,"SKD035":229,"SKD039":1367}。未発動SKD003。敗北{"final_wave_defeated":195,"party_defeated":4,"action_limit":1}|
|行動妨害 (stun)|40.5% (81/200)・141〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD032 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD026 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":28962,"SKD026":16450,"SKD008":4929,"SKD032":432,"SKD039":3592}。未発動SKD003。敗北{"action_limit":115,"final_wave_defeated":81,"party_defeated":4}|
|高消費技を先に装備 (expensive-first)|5.5% (11/200)・232〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD020→SKD008 ／ char_jihoon_01:SKD008→SKD003 ／ char_aoi_01:SKD039|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":30979,"SKD008":14177,"SKD003":9088,"SKD020":1533,"SKD039":3077}。未発動SKD035。敗北{"party_defeated":24,"action_limit":165,"final_wave_defeated":11}|
|攻撃強化（逆順比較） (attack-up-reversed)|0.0% (0/200)・77〜300行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD008 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":6718,"SKD003":8330,"SKD009":603,"SKD008":877,"SKD035":225}。未発動SKD039。敗北{"party_defeated":195,"action_limit":5}|
|防御低下・SKD009-SKD008置換 (armor-break-replace-SKD009-SKD008)|100.0% (200/200)・125〜169行動|char_joe_01:SKD003 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD008 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":15152,"SKD008":12539,"SKD038":316,"SKD039":905}。未発動SKD003。敗北{"final_wave_defeated":200}|
|防御低下・配置15342 (armor-break-order-15342)|51.5% (103/200)・118〜300行動|char_joe_01:SKD003 ／ char_aoi_01:SKD039 ／ char_daimon_01:SKD008 ／ char_jihoon_01:SKD009 ／ char_yuki_01:SKD038|前面までの確定供給案・育成予算内。{"basic":19397,"SKD009":8328,"SKD008":2776,"SKD038":2049,"SKD039":183}。未発動SKD003。敗北{"party_defeated":88,"final_wave_defeated":103,"action_limit":9}|
|防御低下・配置24531（中心技の発動が半数未満・比較用） (armor-break-order-24531)|46.0% (92/200)・70〜300行動|char_yuki_01:SKD038 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039 ／ char_daimon_01:SKD008 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":18412,"SKD008":8373,"SKD003":16736,"SKD009":120,"SKD039":1487}。未発動SKD038。敗北{"final_wave_defeated":92,"party_defeated":65,"action_limit":43}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|80／3|20522.93／2898.16／2033.88|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD003 土割り LB5 SP25 first [{"type":"damage","power":123.92016934320858}] 入手:チュートリアル確定|
|2|竹中半兵衛 (char_yuki_01)|80／3|21446.93／2848.11／1985.52|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD038 鎧砕き LB5 SP50 first [{"type":"def_down","power":17.465826699149144,"duration":3,"carryAcrossWaves":true}] 入手:2-5 追加提案・前面初回確定|
|3|井伊直政 (char_daimon_01)|80／3|15084.53／4397.74／1606.08|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD008 水断 LB5 SP50 first [{"type":"damage","power":153.63585661014858}] 入手:4-5 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|80／3|17618.93／3808.69／1795.80|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD009 岩断 LB5 SP50 first [{"type":"damage","power":153.63585661014858}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|80／3|16496.93／4108.99／1617.24|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD039 応急手当 LB5 SP35 lowest_ally [{"type":"heal","power":47.613446228805714,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":1369500,"eqExp":1149200,"cash":2424100,"skillMaterials":120,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_yuki_01":36,"char_daimon_01":36,"char_jihoon_01":36,"char_aoi_01":36},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":1369500,"eqExp":1613000,"cash":3289000,"skillMaterials":753,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_daimon_01":36,"char_aoi_01":36,"char_jihoon_01":36,"char_yuki_01":36},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: []。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":2665500,"charExp":1176700,"eqExp":1507700,"skillMaterials":737,"genericR":180}。追加案なしのEXP/銭周回比較: {"stage":"10-6","successfulClears":629,"energy":5032,"recipeSource":"10-6-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ0〜0（各試行の最小値）、最大4905〜6901。1ダメージ9173/28515攻撃イベント。BURST3〜9回。SP獲得1573〜3190、技消費1515〜3150、終了SP11〜95。
armor-break（元 100.0% (200/200)）の配置順だけ逆転: 0.0% (0/200)、77〜300行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD003","alternatives":[{"name":"defensive","wins":199,"n":200},{"name":"support-feed","wins":199,"n":200}]},{"skill":"SKD038","alternatives":[{"name":"defensive","wins":199,"n":200},{"name":"support-feed","wins":199,"n":200},{"name":"double-rock","wins":195,"n":200},{"name":"stun","wins":81,"n":200},{"name":"expensive-first","wins":11,"n":200},{"name":"attack-up-reversed","wins":0,"n":200}]},{"skill":"SKD008","alternatives":[{"name":"double-rock","wins":195,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"armor-break-replace-SKD009-SKD008","wins":200,"n":200},{"name":"stun","wins":81,"n":200},{"name":"expensive-first","wins":11,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"defensive","wins":199,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
|1/2 立花宗茂 (10-7/1/2)|atk|8050→4944|全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|2/1 本多忠勝 (10-7/2/1)|atk|8660→1047|到達耐久で役割を維持できない主な攻撃源を調整|
|2/1 本多忠勝 (10-7/2/1)|def|10480→4709|防御が到達火力を上回る敵のみ突破余地を確保／強化後DEF/実ダメージの停滞を確認した敵を局所調整|
|3/1 真田幸村 (10-7/3/1)|hp|41940→21474|300行動に収まらない耐久負担を局所調整|
|3/1 真田幸村 (10-7/3/1)|atk|8660→2776|到達耐久で役割を維持できない主な攻撃源を調整|
|3/1 真田幸村 (10-7/3/1)|def|10480→4709|防御が到達火力を上回る敵のみ突破余地を確保／強化後DEF/実ダメージの停滞を確認した敵を局所調整|
|3/2 真田昌幸 (10-7/3/2)|hp|48300→24730|300行動に収まらない耐久負担を局所調整|
|3/2 真田昌幸 (10-7/3/2)|atk|9780→2665|到達耐久で役割を維持できない主な攻撃源を調整|


全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 10-7-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 10-7-validated.json.gz／10-7-sample-trace.json.gz。失敗した独立検証回は 10-7-validation-v1／round-*。

---

## 10-8 葵の本陣
ID: sekigahara-8。設計意図: フェーズ後も役割を残す
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更8項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv80、覚醒3。R装備Lv50／LB0。技LB5。
到達経路: break-regen／remove-buff／break-regen-replace-SKD010-SKD009／break-regen-replace-SKD009-SKD010の切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: SP供給＋防御低下・継続回復 100.0% (600/600)、205〜282行動。変更前の同編成: 0.0% (0/200)。別戦法: 強化解除 96.0% (192/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|SP供給＋防御低下・継続回復 100.0% (600/600)|
|次点（60%前後）|攻撃強化 69.0% (138/200)|
|ギリギリ（30%前後）|攻防弱体・継続回復 36.5% (73/200)|
|ほぼ厳しい（0%超〜10%）|攻撃のみ比較 4.5% (9/200)|
|未勝利（観測0%）|全体攻撃 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|SP供給＋防御低下・継続回復 (break-regen)|100.0% (600/600)・205〜282行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":77011,"SKD009":21370,"SKD038":11591,"SKD010":30845,"SKD043":3481}。未発動なし。敗北{"final_wave_defeated":600}|
|強化解除 (remove-buff)|96.0% (192/200)・237〜300行動|char_joe_01:SKD051 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":28413,"SKD009":4203,"SKD051":1330,"SKD010":13932,"SKD035":1575,"SKD039":4189}。未発動なし。敗北{"final_wave_defeated":192,"action_limit":8}|
|全体攻撃 (area-boost)|0.0% (0/200)・148〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD022 ／ char_jihoon_01:SKD019 ／ char_aoi_01:SKD041|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":22348,"SKD003":1513,"SKD035":814,"SKD022":3605,"SKD019":3955,"SKD041":2205}。未発動なし。敗北{"party_defeated":199,"action_limit":1}|
|攻撃強化 (attack-up)|69.0% (138/200)・231〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":27852,"SKD009":6027,"SKD003":4290,"SKD010":12737,"SKD039":3655,"SKD035":1128}。未発動なし。敗北{"final_wave_defeated":138,"action_limit":62}|
|攻防弱体・継続回復 (defensive)|36.5% (73/200)・265〜300行動|char_joe_01:SKD036 ／ char_yuki_01:SKD037 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":31908,"SKD009":8670,"SKD037":4959,"SKD036":571,"SKD010":11657,"SKD043":1424}。未発動なし。敗北{"action_limit":127,"final_wave_defeated":73}|
|攻撃のみ比較 (all-attack)|4.5% (9/200)・243〜284行動|char_joe_01:SKD010 ／ char_yuki_01:SKD010 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD010 ／ char_aoi_01:SKD010|前面までの確定供給案・育成予算内。{"basic":27859,"SKD010":25321}。未発動なし。敗北{"party_defeated":191,"final_wave_defeated":9}|
|攻撃強化（逆順比較） (attack-up-reversed)|0.0% (0/200)・186〜300行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD010 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":21178,"SKD003":28561,"SKD009":995,"SKD010":2902,"SKD039":260,"SKD035":1123}。未発動なし。敗北{"party_defeated":79,"action_limit":121}|
|SP供給＋防御低下・継続回復・SKD010-SKD009置換 (break-regen-replace-SKD010-SKD009)|83.5% (167/200)・259〜300行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":30563,"SKD009":20686,"SKD038":4485,"SKD043":1490}。未発動なし。敗北{"final_wave_defeated":167,"action_limit":33}|
|SP供給＋防御低下・継続回復・SKD009-SKD010置換 (break-regen-replace-SKD009-SKD010)|100.0% (200/200)・199〜266行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD010 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":24169,"SKD010":16275,"SKD038":3693,"SKD043":1121}。未発動なし。敗北{"final_wave_defeated":200}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|80／3|20522.93／2898.16／2033.88|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|技なし|
|2|竹中半兵衛 (char_yuki_01)|80／3|21446.93／2848.11／1985.52|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD038 鎧砕き LB5 SP50 first [{"type":"def_down","power":17.465826699149144,"duration":3,"carryAcrossWaves":true}] 入手:2-5 追加提案・前面初回確定|
|3|井伊直政 (char_daimon_01)|80／3|15084.53／4397.74／1606.08|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD010 風断 LB5 SP50 first [{"type":"damage","power":153.63585661014858}] 入手:2-5 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|80／3|17618.93／3808.69／1795.80|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD009 岩断 LB5 SP50 first [{"type":"damage","power":153.63585661014858}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|80／3|16496.93／4108.99／1617.24|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD043 再生の祈り LB5 SP65 lowest_ally [{"type":"hot","power":21.306723114402857,"duration":3,"carryAcrossWaves":true}] 入手:3-4 追加提案・前面初回確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":1369500,"eqExp":1149200,"cash":2424100,"skillMaterials":120,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_yuki_01":36,"char_daimon_01":36,"char_jihoon_01":36,"char_aoi_01":36},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":1369500,"eqExp":1613000,"cash":3289000,"skillMaterials":753,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_daimon_01":36,"char_aoi_01":36,"char_jihoon_01":36,"char_yuki_01":36},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: []。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":2650500,"charExp":1171700,"eqExp":1504300,"skillMaterials":737,"genericR":180}。追加案なしのEXP/銭周回比較: {"stage":"10-7","successfulClears":627,"energy":5016,"recipeSource":"10-7-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ1〜1（各試行の最小値）、最大6590〜7650。1ダメージ25621/129226攻撃イベント。BURST6〜12回。SP獲得2739〜4554、技消費2680〜4535、終了SP11〜98。
break-regen（元 100.0% (600/600)）の配置順だけ逆転: 0.0% (0/200)、219〜300行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD038","alternatives":[{"name":"remove-buff","wins":192,"n":200},{"name":"attack-up","wins":138,"n":200},{"name":"defensive","wins":73,"n":200},{"name":"all-attack","wins":9,"n":200},{"name":"area-boost","wins":0,"n":200},{"name":"attack-up-reversed","wins":0,"n":200}]},{"skill":"SKD010","alternatives":[{"name":"break-regen-replace-SKD010-SKD009","wins":167,"n":200},{"name":"area-boost","wins":0,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"break-regen-replace-SKD009-SKD010","wins":200,"n":200},{"name":"all-attack","wins":9,"n":200},{"name":"area-boost","wins":0,"n":200}]},{"skill":"SKD043","alternatives":[{"name":"remove-buff","wins":192,"n":200},{"name":"attack-up","wins":138,"n":200},{"name":"all-attack","wins":9,"n":200},{"name":"area-boost","wins":0,"n":200},{"name":"attack-up-reversed","wins":0,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
|1/1 島左近 (10-8/1/1)|atk|24690→2157|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|1/2 大友宗麟 (10-8/1/2)|atk|21150→2557|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|2/1 立花誾千代 (10-8/2/1)|hp|81075→64860|300行動に収まらない耐久負担を局所調整|
|2/1 立花誾千代 (10-8/2/1)|atk|24690→2538|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|2/2 本願寺顕如 (10-8/2/2)|atk|31740→2329|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整／回復供給の膠着を緩和し処理順の選択を残す|
|3/1 徳川家康 (10-8/3/1)|hp|475875→124747|300行動に収まらない耐久負担を局所調整|
|3/1 徳川家康 (10-8/3/1)|atk|42300→3141|全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|3/1 徳川家康 (10-8/3/1)|def|8230→3403|防御が到達火力を上回る敵のみ突破余地を確保／強化後DEF/実ダメージの停滞を確認した敵を局所調整|


全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 10-8-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 10-8-validated.json.gz／10-8-sample-trace.json.gz。失敗した独立検証回は 10-8-validation-v1／round-*。

---

## 10-9 黄金の本陣
ID: sekigahara-9。設計意図: 長い戦いを短く終える
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更13項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv80、覚醒3。R装備Lv50／LB0。技LB5。
到達経路: attack-up／support-feed／burst-focus／poor-element／burst-focus-regenの切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 攻撃強化 100.0% (600/600)、233〜300行動。変更前の同編成: 0.0% (0/200)。別戦法: SP供給＋攻撃強化 99.5% (199/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|攻撃強化 100.0% (600/600)|
|次点（60%前後）|該当なし|
|ギリギリ（30%前後）|攻防弱体・継続回復 39.0% (78/200)|
|ほぼ厳しい（0%超〜10%）|攻撃強化・配置54123 8.0% (16/200)|
|未勝利（観測0%）|攻撃強化（逆順比較） 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|SP供給＋攻撃強化 (support-feed)|99.5% (199/200)・234〜300行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD012 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":27264,"SKD009":7574,"SKD012":12510,"SKD035":1427,"SKD039":3455}。未発動なし。敗北{"final_wave_defeated":199,"action_limit":1}|
|攻撃強化 (attack-up)|100.0% (600/600)・233〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD012 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":82099,"SKD009":21833,"SKD003":600,"SKD012":37714,"SKD035":4461,"SKD039":10880}。未発動なし。敗北{"final_wave_defeated":600}|
|通常攻撃でSP供給／攻撃役へBURST集中 (burst-focus)|97.5% (195/200)・237〜300行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD012 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":27043,"SKD009":8838,"SKD012":13476,"SKD039":3690}。未発動なし。敗北{"action_limit":5,"final_wave_defeated":195}|
|別属性比較 (poor-element)|80.0% (160/200)・260〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD011 ／ char_jihoon_01:SKD011 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":29962,"SKD011":21879,"SKD003":200,"SKD035":1462,"SKD039":4127}。未発動なし。敗北{"final_wave_defeated":160,"action_limit":40}|
|SP供給＋継続回復 (burst-focus-regen)|85.5% (171/200)・228〜300行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD012 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":29343,"SKD009":10141,"SKD012":12569,"SKD043":2031}。未発動なし。敗北{"action_limit":29,"final_wave_defeated":171}|
|攻防弱体・継続回復 (defensive)|39.0% (78/200)・253〜300行動|char_joe_01:SKD036 ／ char_yuki_01:SKD037 ／ char_daimon_01:SKD012 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":31352,"SKD009":9595,"SKD037":4731,"SKD012":11323,"SKD043":1647}。未発動SKD036。敗北{"final_wave_defeated":78,"action_limit":122}|
|攻撃強化（逆順比較） (attack-up-reversed)|0.0% (0/200)・81〜300行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD012 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":8734,"SKD003":10834,"SKD009":303,"SKD012":1168,"SKD035":463,"SKD039":2}。未発動なし。敗北{"action_limit":18,"party_defeated":182}|
|攻撃強化・配置12435 (attack-up-order-12435)|70.5% (141/200)・224〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD012 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":28700,"SKD012":9551,"SKD003":200,"SKD009":11906,"SKD039":4355,"SKD035":935}。未発動なし。敗北{"final_wave_defeated":141,"action_limit":59}|
|攻撃強化・配置54123 (attack-up-order-54123)|8.0% (16/200)・142〜268行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD012|前面までの確定供給案・育成予算内。{"basic":19406,"SKD003":3010,"SKD012":15250,"SKD009":98,"SKD035":242}。未発動SKD039。敗北{"party_defeated":184,"final_wave_defeated":16}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|80／3|20522.93／2898.16／2033.88|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD003 土割り LB5 SP25 first [{"type":"damage","power":123.92016934320858}] 入手:チュートリアル確定|
|2|竹中半兵衛 (char_yuki_01)|80／3|21446.93／2848.11／1985.52|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD035 鬨の声 LB5 SP75 all_allies [{"type":"atk_up","power":10.943137453388001,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|3|井伊直政 (char_daimon_01)|80／3|15084.53／4397.74／1606.08|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD012 影断 LB5 SP50 first [{"type":"damage","power":153.63585661014858}] 入手:5-4 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|80／3|17618.93／3808.69／1795.80|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD009 岩断 LB5 SP50 first [{"type":"damage","power":153.63585661014858}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|80／3|16496.93／4108.99／1617.24|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD039 応急手当 LB5 SP35 lowest_ally [{"type":"heal","power":47.613446228805714,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":1369500,"eqExp":1149200,"cash":2424100,"skillMaterials":120,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_yuki_01":36,"char_daimon_01":36,"char_jihoon_01":36,"char_aoi_01":36},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":1369500,"eqExp":1613000,"cash":3307000,"skillMaterials":771,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_daimon_01":36,"char_aoi_01":36,"char_jihoon_01":36,"char_yuki_01":36},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: [{"kind":"skill_material","amount":18}]。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":2653500,"charExp":1166700,"eqExp":1500900,"skillMaterials":755,"genericR":180}。追加案なしのEXP/銭周回比較: {"stage":"10-8","successfulClears":626,"energy":5008,"recipeSource":"10-8-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ0〜1（各試行の最小値）、最大5243〜7942。1ダメージ33263/142246攻撃イベント。BURST5〜14回。SP獲得3146〜5038、技消費3050〜5015、終了SP11〜102。
attack-up（元 100.0% (600/600)）の配置順だけ逆転: 0.0% (0/200)、81〜300行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD003","alternatives":[{"name":"support-feed","wins":199,"n":200},{"name":"burst-focus","wins":195,"n":200},{"name":"burst-focus-regen","wins":171,"n":200},{"name":"defensive","wins":78,"n":200}]},{"skill":"SKD035","alternatives":[{"name":"burst-focus","wins":195,"n":200},{"name":"burst-focus-regen","wins":171,"n":200},{"name":"defensive","wins":78,"n":200}]},{"skill":"SKD012","alternatives":[{"name":"poor-element","wins":160,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"poor-element","wins":160,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"burst-focus-regen","wins":171,"n":200},{"name":"defensive","wins":78,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
|1/1 浅井長政 (10-9/1/1)|atk|15000→4809|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|1/2 毛利元就 (10-9/1/2)|hp|55200→35328|300行動に収まらない耐久負担を局所調整|
|1/2 毛利元就 (10-9/1/2)|atk|21000→2987|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|2/1 濃姫 (10-9/2/1)|hp|50400→32256|300行動に収まらない耐久負担を局所調整|
|2/1 濃姫 (10-9/2/1)|atk|25500→2228|到達耐久で役割を維持できない主な攻撃源を調整|
|2/2 細川ガラシャ (10-9/2/2)|hp|48000→30720|300行動に収まらない耐久負担を局所調整|
|2/2 細川ガラシャ (10-9/2/2)|atk|27000→2276|到達耐久で役割を維持できない主な攻撃源を調整／回復供給の膠着を緩和し処理順の選択を残す|
|3/1 真田幸村 (10-9/3/1)|hp|252000→66060|300行動に収まらない耐久負担を局所調整|
|3/1 真田幸村 (10-9/3/1)|atk|31500→1988|全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|3/1 真田幸村 (10-9/3/1)|def|7800→4003|防御が到達火力を上回る敵のみ突破余地を確保／強化後DEF/実ダメージの停滞を確認した敵を局所調整|
|4/1 豊臣秀吉 (10-9/4/1)|hp|252000→161280|300行動に収まらない耐久負担を局所調整|
|4/1 豊臣秀吉 (10-9/4/1)|atk|31500→1919|全派の実HP損失から主な攻撃・継続被害の発生源を局所調整／回復供給の膠着を緩和し処理順の選択を残す|
|4/1 豊臣秀吉 (10-9/4/1)|def|7800→4003|防御が到達火力を上回る敵のみ突破余地を確保／強化後DEF/実ダメージの停滞を確認した敵を局所調整|


全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 10-9-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 10-9-validated.json.gz／10-9-sample-trace.json.gz。失敗した独立検証回は 10-9-validation-v1／round-*。

---

## 10-10 天下の行方
ID: sekigahara-10。設計意図: 自分の主力で最終突破
**条件付き（隔離案で成立・報酬追加承認前）**。敵変更19項目。現在の育成目安ではなく、この隔離案での検証済み条件。最低値とは表記しない。
共通育成: Lv80、覚醒3。R装備Lv50／LB0。技LB5。
到達経路: remove-buff／break-and-buff／defensive／double-rock／remove-buff-replace-SKD009-SKD007の切替用スキル・装備・育成費を前面までの確定供給案に計上。現在面の初回報酬は使用しない。現行のみでは装備・未配布技はガチャ依存、初期5名の覚醒魂は通常クエスト魂ドロップから確定入手できない。
主経路: 強化解除 100.0% (600/600)、206〜277行動。変更前の同編成: 0.0% (0/600)。別戦法: 防御低下＋攻撃強化 100.0% (200/200)。

|区分|編成・観測結果|
|---|---|
|最適解（検証全勝）|強化解除 100.0% (600/600)|
|次点（60%前後）|SP供給＋継続回復 57.5% (115/200)|
|ギリギリ（30%前後）|該当なし|
|ほぼ厳しい（0%超〜10%）|回復なし比較 6.0% (12/200)|
|未勝利（観測0%）|攻撃強化（逆順比較） 0.0% (0/200)|

### 比較した固定編成
|候補|勝敗・行動|配置順（武将ID:技IDを装備順）|実発動と敗北理由|
|---|---|---|---|
|能力低下解除 (cleanse-stat)|100.0% (200/200)・204〜281行動|char_joe_01:SKD053 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|追加入手/追加育成が必要な比較参考（未所持なら推奨しない）。{"basic":25171,"SKD009":5466,"SKD010":11462,"SKD039":3850,"SKD035":1227,"SKD053":358}。未発動なし。敗北{"final_wave_defeated":200}|
|強化解除 (remove-buff)|100.0% (600/600)・206〜277行動|char_joe_01:SKD051 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":75971,"SKD009":15507,"SKD051":1484,"SKD010":34524,"SKD039":11526,"SKD035":4190}。未発動なし。敗北{"final_wave_defeated":600}|
|防御低下＋攻撃強化 (break-and-buff)|100.0% (200/200)・196〜280行動|char_joe_01:SKD035 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":24242,"SKD009":5121,"SKD038":3162,"SKD010":9804,"SKD039":3842,"SKD035":241}。未発動なし。敗北{"final_wave_defeated":200}|
|通常攻撃でSP供給／攻撃役へBURST集中 (burst-focus)|99.0% (198/200)・215〜300行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":25538,"SKD009":6362,"SKD010":12973,"SKD039":4222}。未発動なし。敗北{"final_wave_defeated":198,"action_limit":1,"party_defeated":1}|
|土属性集中＋攻撃強化 (double-rock)|89.5% (179/200)・232〜300行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD009 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":27178,"SKD009":18004,"SKD003":3913,"SKD039":4043,"SKD035":673}。未発動なし。敗北{"final_wave_defeated":179,"action_limit":19,"party_defeated":2}|
|SP供給＋防御低下・継続回復 (break-regen)|94.0% (188/200)・175〜287行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:SKD038 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":23285,"SKD009":7091,"SKD038":2892,"SKD010":8430,"SKD043":984}。未発動なし。敗北{"final_wave_defeated":188,"party_defeated":12}|
|攻防弱体・継続回復 (defensive)|99.5% (199/200)・218〜294行動|char_joe_01:SKD036 ／ char_yuki_01:SKD037 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":27264,"SKD009":7923,"SKD037":3429,"SKD010":10171,"SKD043":1222,"SKD036":265}。未発動なし。敗北{"final_wave_defeated":199,"party_defeated":1}|
|SP供給＋継続回復 (burst-focus-regen)|57.5% (115/200)・188〜263行動|char_joe_01:技なし・通常攻撃でSP供給 ／ char_yuki_01:技なし・通常攻撃でSP供給 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD043|前面までの確定供給案・育成予算内。{"basic":23407,"SKD009":8473,"SKD010":11073,"SKD043":692}。未発動なし。敗北{"final_wave_defeated":115,"party_defeated":85}|
|回復なし比較 (no-heal)|6.0% (12/200)・178〜233行動|char_joe_01:SKD003 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD009 ／ char_aoi_01:SKD010|前面までの確定供給案・育成予算内。{"basic":21296,"SKD009":5595,"SKD003":1050,"SKD010":12401,"SKD035":2}。未発動なし。敗北{"party_defeated":188,"final_wave_defeated":12}|
|攻撃強化（逆順比較） (attack-up-reversed)|0.0% (0/200)・172〜300行動|char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_daimon_01:SKD010 ／ char_yuki_01:SKD035 ／ char_joe_01:SKD003|前面までの確定供給案・育成予算内。{"basic":20740,"SKD003":25264,"SKD009":1156,"SKD010":2576,"SKD035":1462}。未発動SKD039。敗北{"action_limit":89,"party_defeated":111}|
|強化解除・SKD009-SKD007置換 (remove-buff-replace-SKD009-SKD007)|100.0% (200/200)・208〜284行動|char_joe_01:SKD051 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD010 ／ char_jihoon_01:SKD007 ／ char_aoi_01:SKD039|前面までの確定供給案・育成予算内。{"basic":25342,"SKD007":5069,"SKD051":535,"SKD010":11670,"SKD039":4016,"SKD035":1318}。未発動なし。敗北{"final_wave_defeated":200}|
|強化解除・配置15423 (remove-buff-order-15423)|89.5% (179/200)・218〜300行動|char_joe_01:SKD051 ／ char_aoi_01:SKD039 ／ char_jihoon_01:SKD009 ／ char_yuki_01:SKD035 ／ char_daimon_01:SKD010|前面までの確定供給案・育成予算内。{"basic":25775,"SKD010":10303,"SKD051":489,"SKD039":4277,"SKD009":8564,"SKD035":442}。未発動なし。敗北{"final_wave_defeated":179,"party_defeated":18,"action_limit":3}|

序盤1・2の個別カード置換例は入手未保証の比較参考で、初期ガイドの推奨・確定供給には加えない。未発動技は勝因として説明しない。特に反撃／解除／強化を装備しただけの候補を、発動を確認した別戦法とは数えない。

### 主経路の武将・装備・実数
|順|武将|Lv／覚醒|HP・ATK・DEF|装備（ID・Lv・LB・数値）|技（装備順・LB・SP・性能）|
|---|---|---|---|---|---|
|1|北条氏康 (char_joe_01)|80／3|20522.93／2898.16／2033.88|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD051 破勢 LB5 SP42 first [{"type":"cleanse","power":1,"cleanseCategory":"buff"}] 入手:8-5 追加提案・前面初回確定|
|2|竹中半兵衛 (char_yuki_01)|80／3|21446.93／2848.11／1985.52|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD035 鬨の声 LB5 SP75 all_allies [{"type":"atk_up","power":10.943137453388001,"duration":3,"carryAcrossWaves":true}] 入手:チュートリアル確定|
|3|井伊直政 (char_daimon_01)|80／3|15084.53／4397.74／1606.08|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD010 風断 LB5 SP50 first [{"type":"damage","power":153.63585661014858}] 入手:2-5 追加提案・前面初回確定|
|4|前田利家 (char_jihoon_01)|80／3|17618.93／3808.69／1795.80|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD009 岩断 LB5 SP50 first [{"type":"damage","power":153.63585661014858}] 入手:1-2 現行初回/任務確定|
|5|お市の方 (char_aoi_01)|80／3|16496.93／4108.99／1617.24|weapon:WEAPON_009 Lv50 LB0 {"hp":0,"atk":470.7376245849115,"def":0,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、head:HEAD_008 Lv50 LB0 {"hp":176.5266092193418,"atk":0,"def":152.9897279900962,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、body:BODY_008 Lv50 LB0 {"hp":1647.58168604719,"atk":0,"def":47.073762458491146,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定、legs:LEGS_006 Lv50 LB0 {"hp":588.4220307311393,"atk":0,"def":141.22128737547342,"luk":0,"sp":0} 入手:6-6 追加提案・前面初回確定|SKD039 応急手当 LB5 SP35 lowest_ally [{"type":"heal","power":47.613446228805714,"healingFormula":"caster_atk_percent"}] 入手:チュートリアル確定|

主経路のLv1から費用: {"fromLevel1":true,"charExp":1369500,"eqExp":1149200,"cash":2439100,"skillMaterials":135,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_yuki_01":36,"char_daimon_01":36,"char_jihoon_01":36,"char_aoi_01":36},"acquisitionCostsExcluded":true}。切替・以前の装備育成を含む累積費用: {"fromLevel1":true,"charExp":1369500,"eqExp":1613000,"cash":3307000,"skillMaterials":771,"equipmentMaterials":0,"awakeningSouls":{"char_joe_01":36,"char_daimon_01":36,"char_aoi_01":36,"char_jihoon_01":36,"char_yuki_01":36},"acquisitionCostsExcluded":true}。ガチャ費は確定経路に含めない。
今回面より前に追加する報酬案: []。既存報酬は減額しない。
現行固定供給のみとの差（限定した累積比較）: {"cash":2638500,"charExp":1161700,"eqExp":1497500,"skillMaterials":755,"genericR":180}。追加案なしのEXP/銭周回比較: {"stage":"10-9","successfulClears":624,"energy":4992,"recipeSource":"10-9-validated.json.gz","note":"前面の検証済み編成を使う。現在面向け育成を先取りしない。魂・新スキル・装備・技素材はこの周回では保証しない。累積収入を既クリア1回のみとした独立比較であり、各行の回数を加算しない。"}。追加案採用時の必須素材周回0回。任務・日次で既に所持している人の不足額ではない。

### 実ダメージ・SP・BURST・順序
主経路: 実ダメージ1〜1（各試行の最小値）、最大4780〜7553。1ダメージ42177/126002攻撃イベント。BURST5〜12回。SP獲得2816〜4499、技消費2779〜4476、終了SP11〜115。
remove-buff（元 100.0% (600/600)）の配置順だけ逆転: 0.0% (0/200)、153〜300行動。これは優劣を事前に決めた操作ではなく比較。効果なしの面もそのまま記録。
未所持技比較: [{"skill":"SKD051","alternatives":[{"name":"break-and-buff","wins":200,"n":200},{"name":"cleanse-stat","wins":200,"n":200},{"name":"defensive","wins":199,"n":200},{"name":"burst-focus","wins":198,"n":200},{"name":"break-regen","wins":188,"n":200},{"name":"double-rock","wins":179,"n":200},{"name":"burst-focus-regen","wins":115,"n":200},{"name":"no-heal","wins":12,"n":200},{"name":"attack-up-reversed","wins":0,"n":200}]},{"skill":"SKD035","alternatives":[{"name":"defensive","wins":199,"n":200},{"name":"burst-focus","wins":198,"n":200},{"name":"break-regen","wins":188,"n":200},{"name":"burst-focus-regen","wins":115,"n":200}]},{"skill":"SKD010","alternatives":[{"name":"double-rock","wins":179,"n":200}]},{"skill":"SKD009","alternatives":[{"name":"remove-buff-replace-SKD009-SKD007","wins":200,"n":200}]},{"skill":"SKD039","alternatives":[{"name":"defensive","wins":199,"n":200},{"name":"break-regen","wins":188,"n":200},{"name":"burst-focus-regen","wins":115,"n":200},{"name":"no-heal","wins":12,"n":200}]}]。探索していない代替の不能を断定しない。

### 敵ごとの変更案
|派／位置・敵|項目|現行→提案|原因・目的|
|---|---|---|---|
|1/1 直江兼続 (10-10/1/1)|hp|42500→27540|300行動に収まらない耐久負担を局所調整／BURST乱数で上限へ接近する派に行動余裕を設ける|
|1/1 直江兼続 (10-10/1/1)|atk|18750→5109|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|1/2 長宗我部元親 (10-10/1/2)|hp|57500→29808|300行動に収まらない耐久負担を局所調整／BURST乱数で上限へ接近する派に行動余裕を設ける|
|1/2 長宗我部元親 (10-10/1/2)|atk|21875→2248|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|2/1 立花誾千代 (10-10/2/1)|atk|21875→2610|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整／6派を維持したLv80/R装備の行動・耐久予算候補。独立試行で採否判定|
|3/1 山本勘助 (10-10/3/1)|hp|42500→27200|300行動に収まらない耐久負担を局所調整|
|3/1 山本勘助 (10-10/3/1)|atk|18750→6011|到達耐久で役割を維持できない主な攻撃源を調整|
|3/2 島左近 (10-10/3/2)|hp|57500→29440|300行動に収まらない耐久負担を局所調整|
|3/2 島左近 (10-10/3/2)|atk|21875→2248|到達耐久で役割を維持できない主な攻撃源を調整／全派の実HP損失から主な攻撃・継続被害の発生源を局所調整|
|4/1 雑賀孫市 (10-10/4/1)|atk|21875→2610|全派の実HP損失から主な攻撃・継続被害の発生源を局所調整／6派を維持したLv80/R装備の行動・耐久予算候補。独立試行で採否判定|
|5/1 本多忠勝 (10-10/5/1)|hp|262500→29491|300行動に収まらない耐久負担を局所調整／6派を維持したLv80/R装備の行動・耐久予算候補。独立試行で採否判定|
|5/1 本多忠勝 (10-10/5/1)|atk|32825→2083|全派の実HP損失から主な攻撃・継続被害の発生源を局所調整／6派を維持したLv80/R装備の行動・耐久予算候補。独立試行で採否判定|
|5/1 本多忠勝 (10-10/5/1)|def|8130→4200|防御が到達火力を上回る敵のみ突破余地を確保／強化後DEF/実ダメージの停滞を確認した敵を局所調整／6派を維持したLv80/R装備の行動・耐久予算候補。独立試行で採否判定|
|6/1 織田信長 (10-10/6/1)|hp|337500→23069|300行動に収まらない耐久負担を局所調整／6派を維持したLv80/R装備の行動・耐久予算候補。独立試行で採否判定|
|6/1 織田信長 (10-10/6/1)|atk|37500→2884|全派の実HP損失から主な攻撃・継続被害の発生源を局所調整／6派を維持したLv80/R装備の行動・耐久予算候補。独立試行で採否判定|
|6/1 織田信長 (10-10/6/1)|def|8750→3570|防御が到達火力を上回る敵のみ突破余地を確保／強化後DEF/実ダメージの停滞を確認した敵を局所調整／6派を維持したLv80/R装備の行動・耐久予算候補。独立試行で採否判定|
|6/2 加藤清正 (10-10/6/2)|hp|92500→19661|300行動に収まらない耐久負担を局所調整／6派を維持したLv80/R装備の行動・耐久予算候補。独立試行で採否判定|
|6/2 加藤清正 (10-10/6/2)|atk|17200→3570|全派の実HP損失から主な攻撃・継続被害の発生源を局所調整／6派を維持したLv80/R装備の行動・耐久予算候補。独立試行で採否判定|
|6/2 加藤清正 (10-10/6/2)|def|6880→3200|防御が到達火力を上回る敵のみ突破余地を確保／強化後DEF/実ダメージの停滞を確認した敵を局所調整／6派を維持したLv80/R装備の行動・耐久予算候補。独立試行で採否判定|


全派・Lv・スキル倍率・対象・条件・SP・パッシブ・状態・形態・行動数・解放・報酬は 10-10-validated.json.gz のstageOriginal/stageProposalおよびinputに全件保持。変更した項目のみ上表に記載。その他の設定の削除・上書きは行わない。
証拠: 10-10-validated.json.gz／10-10-sample-trace.json.gz。失敗した独立検証回は 10-10-validation-v1／round-*。
