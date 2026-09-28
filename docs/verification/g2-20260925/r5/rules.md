# R5 日次・侵攻超過ダメージ承認反映

2026-09-25追加指示を採用。判断資料D01/D02/D03は今回指示によって確定（DM004案不採用、DM005採用）。既存G2機能/API v24からの局所差分。実API/DB受入結果は親の統合記録に記載する。本書のPASSはローカルドメイン検証。

## 日次

- DM001〜010を有効化。JST 0時に現在日の任務IDへ切替。前日未受取は失効し、過去日報酬の遡及付与をしない。保存済み当日実績は保持し、履歴再構築や一括換算は行わない。
- DM005（出陣3勝）だけ侵攻令1枚を追加。銭/EXP既存報酬は保持。DM004・DM006には令を追加しない。
- 元の結果確定時刻→JST日への記録、イベントID重複排除、受取ID/CAS保存を継承。受取可能評価とID照合は単一のnowで行う。
- DM009/010達成数は基本8項目のみ。DM007の正式ガチャ実入手導線はG3に引継ぎ、今回ガチャ新実装/受入は行わない。

## 侵攻

- 新規createFormalInvasionMasterに `damagePolicy=actual-hp-v1-20260925` を保持。APIは開催snapshotからbattle inputへ `raidDamagePolicy` を保存。旧開催、旧started input、旧settled resultには付加しない。
- 正式バトルの共通absorb経路で攻撃/反撃/DOTの実HP減少を `actualHpDamage` へ別集計。shield吸収分とHPを超過した分は含めない。蘇生/回復後のHP再減少は実減少として加算する。
- marked新開催だけ `actualHpDamage × 既存勝利倍率` を共通HPへ反映。貢献値はその開催Lvの共通HPを実際に減らした量（残HPで上限）。別Lv/終了済み開催へ遅延確定した結果は共通HP・貢献に加算しない。勝数/3勝報酬資格は従来どおり。
- `totalDamage`、hits、frames、analysisの表示値は変更しない。旧開催はこれまでのtotalDamage算入を維持。実減少値欠損の新開催結果は推測で補わず拒否する。

## 検証

`node scripts/verify_game04_g2_r5_rules.cjs` PASS。根拠 `rules-local-evidence.json`。

- JST 23:59:59.999→00:00、前日受取拒否、同日重複受取拒否、日跨ぎ結果翌日計上、同結果翌日再送非加算、当日既存履歴保持。
- DM005だけ令1、基本8項目から達成数を計算。
- 敵HP100への表示ダメージ7,651,655、実HP減少100。新旧の全frames/表示/結果は新任意field以外一致。
- 倍率1.5と共有残HP120による減少/貢献120、3勝資格付与、旧Lv遅延貢献0、同battle再送冪等、旧snapshot旧full damage計算保持。
- 既存 `node --experimental-strip-types scripts/verify_game04_g2_supply.mjs` PASS（日次侵攻令総数期待値だけ更新）。
- `tsc --noEmit` PASS（本担当完了時）。SQLスキーマ差分不要。API bundle再生成・開発反映は親が一元管理。

旧pending-policy guardスクリプトは今回承認の検証へ転送する形に更新。過去の未承認時点検証記録は履歴として保持。
