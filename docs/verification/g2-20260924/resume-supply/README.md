# G2 BOX正式在庫接続候補

判定: SQL候補作成。子担当からDB変更なし。親適用・rollback検査・本体QAが必要。

## 原因と限定修正

現行単引数claim_present→grant_present_payloadはCASH/DIA/装備以外をuser_itemsへ格納する。トリガーは武将/旧スキル取得eventだけを捕捉するため、薬・正式EXP・魂選択・LB素材がredesign stateへ届かない。旧引数付きclaim2種には別実装が残る（authenticated executeは既に剥奪、service_roleのみ）。

候補は既存grant_present_payload/billing_*を一切変更せず、新たな正式source/versionを明示したBOXだけをstateへ付与する。user_items過去残高・既存未受取BOXを換算しない。users→presents→game04_player_stateの順にlockし、versionを増加。通常actionの古いexpectedVersionはCAS不一致となり上書きを防ぐ。単件の二重受取は拒否、一括は全体原子性（1件失敗なら全件未受取）を維持。

## 新しい内部供給契約（実装候補。既存producerの採用済み契約ではない）

server管理presents.source_kind = GAME04_FORMAL_REWARD（QAのみGAME04_QA）。source_metadata = {"game04RewardVersion":"APPROVED_GROWTH_V1_20260921","funding":"free"}。数量はpresents.quantityのみ。利用者がmetadataを作成できない既存RLS/サービス供給が前提。

|ID|正式state|根拠/留意|
|---|---|---|
|ENERGY_DRINK|energyDrinks|薬+50契約。使用時処理は既存|
|SKILL_LB_PART|materials.skill|正式shop pack ID、LB在庫|
|EQUIP_LB_PART|materials.equipmentLb|正式shop pack ID、LB在庫|
|CHAR_EXP_S/M/L/XL|growthInventory.expItems.character.small/medium/large/xlarge|100/1000/5000/20000。旧M/Lと効力量相違、versionなしのBOXは移さない|
|EQUIP_EXP_S/M/L/XL|同equipment|同上|
|SOUL_SELECTOR_N/R/SR/SSR|growthInventory.soulSelectors.rare|SSRは現行正式pack ID、他rareは対応する技術IDを新定義|
|GENERIC_SOUL_N/R/SR/SSR|growthInventory.genericSouls.rare|正本の4レア在庫に対応する技術IDを新定義|

未対応: 固有魂ID、旧汎用EXP、SKILL_MANUAL/旧別名、召喚券、正式SKD供給。推測のID置換はしない。召喚券は既存user_items/G3受入。固有魂は現行任務/logboの正式経路を維持。

有償・注文/lot/期限metadataの付いた正式BOXは非消費エラー。有償packへのこの契約の転用は禁止。既存versionなしBOXは既存処理へ戻すので、P02有償物資の期限接続が完成したとは扱わない。

## UI

useInventory.refreshPresentClaimStateは現行でnotifyRedesignRewardChange(owner)を実行済み。親が新state再取得・育成/商店反映を本体QAで確認する。受取表示canonicalItemNameの新ID対応は親が管理。新ID表示が未解決なら内部IDを露出するので受入未完。

## 検証

box-formal-rollback-test.sql: 専用QA d6dabf02-3eb2-430e-8352-561f8d735469、空BOXを前提に19ID×2付与、単件二重拒否、bulk再受取0、失敗全体非消費、stale action CAS拒否、別user/期限を検査。子は実行していない。ROLLBACKでfixture/stateを戻す。並行2セッション競合と実画面付与→使用→保存は別途必須。
