# VIPスケジュール独立レビュー（子A、読取のみ）

対象 `vip-schedule-candidate.sql`。開発DB lrgyllgzcdcphlbmkknc のテーブル列/制約・billing_grant_order・現行game04_grant_vip/ACLを読取照合。

## 修正推奨（親/Bへ通知）

候補game04_grant_vipはusers→billing_ordersの順に行をロックしていた。live billing_grant_orderはorders→usersの順なので、支払付与とVIP再送が同時実行されると逆順deadlockが成立する。候補をpaid order SELECT FOR UPDATE→支払検証→users FOR UPDATEに揃える。データの部分確定は起きないが、決済直後の権利付与エラーを避けるため適用前に修正する。

## 確認結果

- billing_orders.id uuid、grants.order_id text、user_id uuid、grants主キーorder_id・days=30制約を確認。候補FK/型・日数は一致。
- 支払済み判定はユーザー・注文ID・商品game04_vip_30d・GRANTED・480円・granted_at存在を照合。任意文字列orderだけで付与できた旧関数から改善。
- live billing_grant_orderは決済session一致・金額・JPYを確認してGRANTED/granted_atを確定する。新VIP関数はこの確定済み注文への接続契約。
- 同order再送はgrants既存確認により追加100/再スケジュールなし。他ユーザーorderは拒否。
- 過去注文再送はその注文のgranted_at+720時間を返す。ユーザーの現在新しい契約期限を延長/巻き戻ししない。
- 付与起点granted_at、期限720時間。配布ordinal1〜30が0〜696時間の24時間刻み。開始時100はentitlement/receipt/scheduleと同transaction。
- 有効契約expiry>購入起点は拒否。等時刻での再購入は許容。事前の課金拒否はP02 checkout予約側で別途必要（候補にも明記）。
- 配布はdelivery row lock / SKIP LOCKED / delivered_at更新を同transactionで行い、同じordinalの二重付与を防ぐ。失敗時は残高とdelivered_atをともにrollback。
- 停止復旧時の期限後配布を禁止していない。購入済み30回分を失わない。
- 1000件上限は1呼出の処理上限であり、未配布行は次回へ残る。定期実行とバックログ監視は親の接続受入が必要。
- 新表RLS有効、PUBLIC/anon/authenticatedは権限なし、service_role権限のみ。新/置換関数もservice_roleのみEXECUTE。
- SQLのFOR UPDATE SKIP LOCKED LIMIT順序はliveで同型のSELECTをEXPLAINし構文成立を確認（実データの更新/ロック実行なし）。全DDL/関数作成は未実行。

## 適用範囲・残件

- 現在billing_productsのVIP商品は0件。候補は商品作成・販売ON・決済provider設定を行わない。P02接続/本購入受入は未完維持。
- 決済注文/付与履歴/権利が0件という親の前提で、旧方式の購入者への配布遡及migrationは不要。将来既存契約がある環境へ無条件適用しない。
- 上記lock順を修正後、適用候補として構造上問題なし。専用QA注文で境界0/24/696/720時間、30回上限、再送、支払不一致、現在有効時拒否、期限満了後再購入を確認し、schedulerへの接続実績を別途残す。
