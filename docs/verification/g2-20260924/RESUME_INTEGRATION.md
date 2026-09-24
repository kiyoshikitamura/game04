# G2再開 統合記録

環境復旧後に切断前の原本をe960238で保存。G1再調査なし。侵攻5城共通背景は採用済み（resume-assets参照）、新規再承認事項から除外。

## 適用
- Q01画像無限待機を既存12秒共通loader/失敗retryへ統一、Growth失敗時Footer離脱。月額取得並列化。QA限定API/paint診断。
- BOX長名/数量折返し、news失敗/再試行・既存一覧保持、共通通貨表記、法務scrollbar。
- 法務/問い合わせ戻りに旧tutorial完了を要求する不整合修正。同UID marker/認証投影保持。
- 開発DB game04_g2_kpi_gameplay: service-only、新戦闘/正式receipt集計。rollback検査PASS。既知4QAに作成時点からqa分類を限定登録。
- 開発DB game04_g2_formal_present_inventory: 正式版/無償metadataを持つ新BOX19IDを新在庫へ接続。旧在庫/BOX換算なし。有償lot経路は未完、正式契約を偽ってpaidを流さず非消費エラー。19ID/重複/旧在庫不変/期限/別user/CAS/bulk失敗rollback検査PASS。
- API game04-redesign-api v22 ACTIVE verify_jwt=true、hash 8ccb2a79ceacb68db381e58a0ba6e2643515d1e34e88a4d7909c1147068165fa。v21 sourceに成功commit内の計測receiptのみ追加。戦闘値・旧snapshot不変。

## 未完
この候補の本体独立再検証、BOX実受取→使用→保存、計測実操作照合、API管理者HTTPは継続。SQL rollback成功やtypecheckを本体受入へ読み替えない。G2全体未合格。

## 配信・追加DB差分
- Code: 0e12b62dae1fa50168e6b9fc6aa2af1368b3a32e
- Immutable Preview: https://game04-g8sktl9yj-kiyoshi-kitamura.vercel.app
- Deployment: dpl_6eV43HvatddiaWxbH7kBUwGvAUxM / READY
- migrations: 20260924164519 game04_g2_kpi_gameplay / 20260924164558 game04_g2_formal_present_inventory / 20260924165049 game04_g2_kpi_dedicated_receipts
- dedicated receiptsは稼働shop/host関数の同transaction内receipt追加のみ。数値/資格/価格/保存方式不変。
- 交換rollback：残高差分/同request再送/失敗rollbackとreceipt1件PASS。主催rollback：room1件/state版1増/receipt1件・同request戻り一致PASS。
- 既知4QAの時点除外登録後、既存188戦はexcluded8/included180（started/settled各）。残る180を通常ユーザー実績として認定しない。すべてdevelopment、QA未分類の残りは別照合対象。
- 新service専用正式BOX関数はanon/authenticated直接execute不可、本人claim_presentのみauthenticated可。
- セキュリティadvisor取得、新規追加2関数について指摘なし。既存全体の無関係な権限改修はしていない。
- branchURLはbrowser ERR_BLOCKED_BY_CLIENT、shellproxy接続timeout。Vercel接続アプリも対象accessなし。別の既存ログイン済みVercel画面から固定URLを取得し、権限追加や共有alias変更なしで再検証へ移行。
