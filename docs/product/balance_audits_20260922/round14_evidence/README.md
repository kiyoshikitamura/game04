# 第14回 検証資料

正式マスターではなく未承認の設計検証。主結果は上位のround14_proposal.md / round14_final_inputs_results.json。

実行環境：Node.js 24.19.0、--experimental-strip-types。探索順はround14→target14、structure14→structure14b→structure14c→holdout14→rear14→holdout14final10。alternate14はround14の補足。スクリプトは当時のbattle-check作業フォルダを基準とする履歴。

最終入力JSONには各ケースのparty/waves/seedと観測結果をすべて収録。リポジトリsrc/domain/redesign/battleBalanceV2.tsのsimulateBalanceBattleへ、同JSONの各ケースと以下rulesを渡せば再現できる。参照SHAは5da8426bcca085d95d8dfc885c235e1ed71a43c1。

初回100戦、育成後20戦。勝率の保証ではなく観測。10-6はfinal10版が最終で、途中の後衛HP12,000版は不採用。

```json
{
  "version": "balance-v2-20260920",
  "inputVersion": "wave-sp-v1-20260921",
  "maxPlayerActions": 300,
  "initialSpRatio": 0,
  "balanceV2": {
    "status": "PREVIEW_PROVISIONAL",
    "version": "approved-d955239-20260921",
    "damageBonusCap": 50,
    "healingBonusCap": 80,
    "shieldBonusCap": 50,
    "shieldHpCap": 0.5,
    "periodicCapMultiplier": 2,
    "lowHpThreshold": 0.4,
    "highHpThreshold": 0.7,
    "diversityFactors": [
      0,
      0.25,
      0.5,
      0.75,
      1
    ]
  }
}
```
