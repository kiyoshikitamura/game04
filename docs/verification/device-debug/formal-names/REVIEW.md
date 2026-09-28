# DBG-054・066 正式名称FIX

基準PR #37：deaf64e6ead31803fc09cb0d4322d936f7ea3d9d。既存共通UI・BURST・並走成果を保持。

## 表示契約

approvedNames.tsを共通参照とし、P01〜P16はtype、素材は既存IDへ接続。正式名称は台帳の2026-09-27 FIX節を参照。SKILL_MANUALとSKILL_LB_PARTの残高を合算・ID移行しない。パッシブsnapshotおよびbalance-v2/quest65マスターの旧name値は保存互換用に保持し、表示時のみ変換。

## 反映範囲

- PassiveDisplay、PreparationModal、BattleView：武将／準備／戦闘詳細。
- GrowthControls/View/Result、Inventory：育成、素材一覧、分解・育成結果、所持品。
- canonicalItemName/getThemedMasterName/Description：プレゼント、任務、商店、交換等の正式アイテム表示。既存のitems_master_dataもこの射影を参照。
- QuestView/raidPresentation：クエスト／共闘／領土侵攻報酬。
- FormalGachaView/旧GameContext：スキル重複変換の獲得表示。
- CharacterTab/CharacterSystemV2/questAreaIdentity：旧利用先の改造パーツ文言。

## 検証

375/390×600で16種、素材所持数12,345/67,890、報酬、育成アイテムダイアログを確認。横はみ出しなし、旧名称なし、pageerror 0。スクリーンショット目視で見切れなし。限界突破素材タブは自然改行、名称／数量を省略しない。QAは表示専用でDBに書込なし。

最初の自動検証は旧ボタン構造や完全一致テキストを指定して失敗。最新UIの分類select・育成タブ・所持数込みの名称へ操作を修正し全8ケースPASS。

旧文字列の残存：theme/sengoku-masters.jsonは旧表示sourceを保持しgetThemedMasterNameで上書き。growth.tsの旧サーバー不足文言はGrowthViewで名称だけ置換。内部ID・計算・数量・条件は変更なし。旧P08案「弱点看破」は製品非採用。

型検査・ローカルbuild成功。最終文言整理後も型検査成功。React確認：既存共通部品と状態更新を保持、名称参照は純粋関数、新規データ取得なし。


2026-09-27配信完了：DBG-054・066は「配信済み・実機確認待ち」。正式名称承認待ちは解除。配信SHA 10b23685ff4ff6d1d59c18103253169749a60e51、Ready dpl_558LStxXcg9eK7Dh7mVNNp4jbVT3。直前PR HEAD一致、共通Preview公開API一致。配信後375/390×600のパッシブ16種・所持品・報酬・育成ダイアログ計8ケースPASS、旧名表示なし・横はみ出しなし・pageerror 0。型検査・ローカルbuild・Vercel build成功。残件は実機受入確認。
