# R7 DB差分・変更対象security advisors

2026-09-25 06:32 UTC頃、開発DB `lrgyllgzcdcphlbmkknc`。list_migrations / security advisors / pg_catalog SELECTのみ。対象外の既存警告は監査・修正しない。

## 適用一覧

|Version|Name|
|---|---|
|20260925060654|game04_g2_p02_billing_wrappers|
|20260925060708|game04_g2_p03_auth_binding|
|20260925060852|game04_g2_p02_formal_catalog|
|20260925061459|game04_g2_paid_formal_rollback_probe|
|20260925061512|game04_g2_p02_paid_formal_inventory|
|20260925061641|game04_g2_derived_lot_rollback_probe|
|20260925061652|game04_g2_p02_exchange_derived_lots|
|20260925062515|game04_g2_raid_rooms_owner_projection|

rollback_probeという名称の履歴も実list_migrationsに存在するので省略しない。試験のtransaction rollbackとmigration履歴行の存在は区別。内容・試験結果はP31担当記録を参照。

## 変更objectsに限定した結果

変更migration内CREATE FUNCTION/TABLEから12の対象名を抽出し、advisor metadata.nameへ完全一致で限定。対象の該当結果はINFO 1件・WARN 2件、ERROR 0件。全プロジェクトの警告ゼロという意味ではない。

|対象|指摘|限定確認|
|---|---|---|
|game04_billing_events|INFO RLS enabled/no policy|RLS=true、anon/authenticatedはSELECT/INSERT/UPDATE/DELETE権限なし、service_roleあり。サーバー専用記録表の意図と一致|
|claim_present(uuid)|WARN authenticated security definer|auth.uid必須。受取対象はidとuser_id=uidの両条件でFOR UPDATE、状態/期限/付与元も検証。anon実行不可。既存クライアント受取契約の継承|
|game04_auth_binding(boolean)|WARN authenticated security definer|入力に任意UIDなし。auth.uid必須、auth.users/identitiesと同UIDを照合。匿名/メール未確認をfinalize拒否、同UIDロック。anon実行不可|

参照: [RLS/no policy](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy)、[authenticated security definer](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable)。警告を非表示化するための権限変更はしない。

rooms新RPC `game04_raid_rooms_with_owners(uuid)` はadvisor指摘なし。pg_catalogでSTABLE/SECURITY INVOKER/search_path=public,pg_temp、EXECUTE anon=false/authenticated=false/service_role=true。他の変更関数もsearch_path固定を確認。billing reserve/grant/record、get_state、shop_exchange、paid_item_pathはanon/authenticated実行不可。trigger関数は直接実行を許可していない。

## G2 indexの生成形式

`supabase/functions/game04-redesign-api/index.ts` をesbuild 0.25.12で既存同様non-minifyへ再生成。65k行削除差分を、rooms投影だけの3行追加/10行削除へ縮小した。sourceはこの作業で変更していない。同一sourceから再実行したnon-minify buildはbyte一致。生成物hash `67348b1a3759befeaa36ab84757910c35979968c5fb208796891715fd0d45cb6`。

minified版とnon-minified版を別途再minifyしたbyte一致はfalse（minifyの識別子割当/最適化経路が異なる）であり、byte同一とは報告しない。既存HEADとの差分が承認済みrooms関数の同投影のみであることと、sourceの決定的再生成・既存投影同値試験で意味範囲を確認。G2 indexはG3を含まないため共有配信禁止を維持。実API v31の内容/hashは親のreadback記録を正とする。
