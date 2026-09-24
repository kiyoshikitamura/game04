# Wallet candidate 独立レビュー（子A、読取のみ）

対象 `wallet-free-first-candidate.sql`。開発DB `lrgyllgzcdcphlbmkknc` の pg_proc/trigger 定義を読取照合。DDL/DMLは実行していない。

## 修正が必要

1. `end $function$` のSQL終端セミコロンが、billing_apply_lot_delta / billing_buy_dia_product / game04_get_state の3件で欠けていた。親へ連絡済み。
2. get_stateで期限切れ有償lotを精算せず残高を返すと、shop_exchangeのnoop精算→before残高不一致→例外→精算rollbackとなり、再取得しても同じ残高で繰り返し失敗する。get_stateのusers行ロック取得直後に `UPDATE users SET neon_diamonds=neon_diamonds ... RETURNING * INTO u` で既存期限triggerを実行し、精算済み残高を返す必要がある。親/Bへ連絡済み。

## 確認済み

- users行ロックで同ユーザー交換を直列化。同request_id再送はgame04_requestsの既存結果を返し、二度目の減算なし。
- 輝石減算とgame04_commit_growth_stateは同じSQL呼出transaction。CAS/version不一致・在庫保存エラーは輝石減算/lot変更をまとめてrollbackする構造。
- billing_dia_lotsはneon_diamonds UPDATEに反応し、billing_apply_lot_deltaを呼ぶ実triggerを確認。
- 既存lotのorder/source/issued/expiryを上書きせず、期限切れquantityと消費quantityだけ更新。無償残高=有効総残高−有償lot残高を先に充当し、必要分だけ有償lotを期限順に消費する計算。
- billing_buy_dia_productの有償由来分だけをv_paidへ集計する変更は上記消費順と整合。そこから発行するpresent/lotは従来のsource_lot/expiryを保持。
- 既存3関数はliveでpostgres/service_roleのみEXECUTE。CREATE OR REPLACEでACLを保持。新game04_commit_shop_exchangeにもPUBLIC/anon/authenticated REVOKEとservice_role GRANTがある。
- service_role専用関数であり、p_stateや価格をDBだけで正式商品検証する構造ではない。認証API側のユーザーbinding/applyShopExchangeを必須とする既存境界を維持。
- users.diamondsへ書込みはなく、既存ゼロ残高を換算しない投影修正。

## 接続契約として残る点

新game04_commit_shop_exchangeは、有償DIAを消費して取得する薬/侵攻令/銭へsource_lot/expiryを伝播しない。旧billing_buy_dia_product経路では伝播する。派生購入物の期限ルールを新交換所でも適用する場合は同等の付与契約が必要で、単なる無償優先の修正とは分けて確認する。

## 適用判断

構文と期限精算ループを修正後、親が一括transactionで適用し、専用QAの期限切れ・無償優先・有償混在・同request再送・CAS失敗rollbackを実接続で確認すること。今回のレビュー自体はDB実行成功/受入完了の証明ではない。
