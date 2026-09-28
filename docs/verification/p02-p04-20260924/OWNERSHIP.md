# P02–P04 移植作業所有・接続台帳

着手日: 2026-09-24 UTC。状態: 実装中、統合受入未完。
専用branch: work/game04-p02-p04-20260924
G2取得先: work/game04-g2-20260924 / PR #30
固定base: 7476566f945708a8e752f71d4d6b90c23f3b937a
GAME03参照固定: 0453fcda56c2f3546b91eb7a073c592988f9cf42（読み取りのみ。実配信一致は追加確認）
G1は履歴参照。e62d3894をG2最新と扱わない。

|担当|所有ファイル・責任|
|---|---|
|親|本台帳、統合記録、専用branch/PR/Preview、環境照合|
|P02子|src/server/billing/**、src/app/api/billing/**、src/app/billing/**、src/utils/billing*、決済専用SQL候補/試験|
|P03子|src/server/auth/**、src/app/api/auth/**、src/app/auth/**、src/utils/auth*・oauth*、独立認証component、結合SQL候補/試験|
|P04子|src/app/legal/**、リーガル試験・本文差分表|
|独立QA子|tests/p02-p04、異常系/統合確認記録|
|G2親|商店/設定/共通UI・共通認証状態・game04-redesign-api・在庫/master/財布/VIP|
|P06|本番環境設定、公開制御、ジョブ|

G2所有箇所は本branchから上書きしない。必要接続は最小patch/契約として記録する。
共有開発DB/APIの反映は所有調整未完のため未適用。P02/P03の独立SQL候補は保存・検証準備まで。
G2 agent-bのwalletはneon_diamonds、DIAMOND free-first。旧diamonds合算なし。
VIPは480円/720h・購入時100＋24hごと100×残29・有効中再購入不可。P02が決済状態を確定しU09権利付与へ一度だけ接続。通知からの二重付与を作らない。
正式4パック、6価格の輝石、購入枠はMASTER_AUTHORITY_LATEST §6に従う。
認証成功は既存verified bindingを引継ぎ、任意email一致で資産統合しない。
テストモードのみ。GAME03/Production/main変更・実課金・一般公開は本起票対象外。

成果の適用状態、最終SHA/Preview/API版/DB差分は最終結果に記録。
