# G2供給計測の追加候補

基準: 79669373df0af1a586d0b00cc56b4a3dcb9b1ec9。子B担当。DB適用・最終配信・実接続受入は親が管理する。

## 変更

- `supabase/manual/game04_g2_kpi_supply.sql`: 正式ログボの今後の付与履歴を追加。既存producerがstate更新後に行う進行更新へAFTER triggerを接続し、版・日付・累計回数・receiptの一致を確認して同transactionに記録する。既存最新状態から過去履歴は復元しない。元の報酬量・在庫・受取処理を変更しない。
- 同SQLの集計関数: 新ログボ履歴、既存VIP配布確定行、正式無償版BOX受取行を集計。BOX期限は受取時点で判定し、受取後の期限到来で過去件数を消さない。旧BOX・有償BOXは対象外。BOXのGAME04_QAはsubject分類の有無にかかわらずexcluded。他は既存のイベント時点QA除外を使用。未対応subjectはunmapped。
- `src/app/api/admin/kpi/v2/supply/route.ts`: 既存KPI管理者認証経路に専用read-only APIを追加。開発接続先を再照合し、development、各カバレッジ、数量単位を明記。個人情報・注文IDを返さない。
- `supabase/tests/game04_g2_kpi_supply_rollback.sql`: 専用QAの正式ログボ実関数を使用した履歴1件・再送、QA BOX件数・期限・権限制限・期間拒否をROLLBACK検査する。既存他ユーザーは変更しない。

## 数値の意味

`event_count`は各配布/BOX行の件数。`quantity`はreward_idごとの数量であり、ログボはdaily_bundle=1、VIPはfree_diamonds=100、BOXはitem IDごと。異なるreward_idの数量を合算しない。VIP配布を購入件数・売上と扱わない。

## 検証と残件

- TypeScript `tsc --noEmit --pretty false` PASS。DB適用・SQL rollbackは未実施。親が限定適用後に実行する。
- SQL試験は本体BOX受取→使用→保存や外部購入の代替ではない。
- 任務件数は既存gameplay receiptのclaim_missionへ接続済み。報酬内訳、raid grant単位、保存復帰、管理画面可視化はこの追加で完成した扱いにしない。
- BOX producerの19ID契約への対応は別の必須残件。旧GvG/useStoryを正式sourceへ機械変換しない。
- daily10の失効・日跨ぎ・侵攻令対象、P02有償期限・購入、旧資産方針の未決を維持。G3/G4/main/Productionは変更なし。
- Supabaseスキルと公式Triggers文書を確認。changelog.md取得は検索サービスのContent-type非対応で失敗。新しいSupabase APIやCLI依存は導入しない。

## 交換所表示名と薬の実接続確認（親検証）

- 親のf45候補本体で、所持表示「活力丸：1個」と商品表示「回復薬 ×1」の不一致を発見。
- 根拠は `docs/product/GAME04_SHOP_IMPLEMENTATION_HANDOFF_2026-09-22.md` の正式名称「活力丸」と `src/domain/redesign/shop.ts` の既存title/reward。同日の正式ショップ表示方針へ合わせ、`ShopExchangePanel.tsx` のローカル商品ラベル1箇所のみ「活力丸 ×1」へ修正。価格50輝石・使用効果+50・API/DBの変更なし。
- 親が本体で確認した使用前Dialogは行動力52→102。送信時にサーバー自然回復が1進み、実使用は53+50=103/100。DB照合はversion7、energyDrinks0、vitality103、cash11720。表示値との差1は自然回復時差を含み、薬が+51回復した結果とは扱わない。
- この名称修正後の専用Preview表示は親の次候補で再確認する。薬使用の上記証拠は修正前候補の実機能検証であり、名称修正の配信確認と区別する。
