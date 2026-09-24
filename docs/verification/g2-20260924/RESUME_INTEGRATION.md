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
