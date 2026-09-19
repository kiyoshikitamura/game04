# GAME04 VIP・課金帰還接続 2026-09-19

## 接続内容
- 旧pageの `billing_order` 復帰を独立 `RedesignBillingReturn` に復元。
- 認証・プロフィール準備完了後、既存 `BillingStatusDialog` と認証済restore APIで注文を確認。
- URLパラメータだけでは付与しない。確認済GRANTED後に既存Bootstrapと新ゲーム状態を再取得し、Shopへ帰還。
- ログインユーザー変更後の古い取得応答で別ユーザーを更新しない。
- 閉じる時はbilling_orderのみURLから除去し、他パラメータとhashは保持。

## VIP付与
- `billingService.reconcile` の既存Stripe検証・通常注文付与後、保存済注文を再読取。
- `status=GRANTED` かつ `product_id=game04_vip_30d` の場合だけ `game04_grant_vip` をservice接続で呼ぶ。
- restore APIでGRANTED注文を直接返す既存経路にも同じ処理を接続し、通常付与成功後のVIP付与失敗を再試行可能にする。
- 注文IDの付与台帳が重複付与を拒否。期間はDB Masterの30日権利を利用。
- 他の商品・EXPIRED・PENDINGにはVIPを付与しない。

## 今回しないこと
VIP商品価格・Stripe Price・Checkout公開・定期課金は変更しない。VIP_PRODUCT.enabled=falseを保持。商材確定はM9。

## 共通商用UIの復元
- `RedesignCommerceOverlays` を認証後pageへ追加。
- Shop等が既存GameContextへ設定するConfirmDialogを中央ダイアログで表示。
- ガチャのPROCESSING / FLASHING / READY / SHOW_RESULTS、CharacterGachaPresentation、スキル・装備結果、閉じる操作、SEを既存CommonModalsから分離して復元。
- 共通エラーと処理中操作抑止も復元。
- 旧装備選択・ギルド詳細・PvP・チュートリアルのモーダルは復活させない。
- Typecheck PASS。旧ガチャ/ショップの最終商材・確率変更はM9へ留保。
