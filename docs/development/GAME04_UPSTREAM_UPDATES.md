# GAME03更新の取り込み

`config/game04-upstream.json` のProduction SHAが前回取り込み基準。

1. GAME03実Productionのaliasから新SHAを確認する。main HEADを代用しない。
2. GAME03 checkoutを更新し、`node scripts/game04-upstream-diff.mjs <checkout> <新SHA>` で差分を分類する。
3. GAME04専用更新branchで、前回GAME03・新GAME03・現在GAME04を比較して適用する。キャラクター対応表、ロゴ、dev接続先を保持する。
4. SQLファイルの有無だけで未適用判断しない。実DB baseline、master、Edge、Cronも一組で照合する。GAME03ユーザーデータは移さない。
5. 型・ビルド・素材参照・GAME04実接続を検証し、親が統合する。
6. 受入後にProduction SHAとDB版を更新し、差分報告を残す。

元GAME03の`.github/workflows`は初回コピーから除外。自動本番操作をGAME04で走らせないため、CIはGAME04対象を明示して個別導入する。

元GAME04の独自基盤はarchive/pre-production-clone-20260916に保存。過去の再実装方針は現在の開発仕様として扱わない。
