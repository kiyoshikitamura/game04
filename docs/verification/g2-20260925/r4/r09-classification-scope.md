# R09 旧included / unmappedの限定照合

2026-09-25、GAME04開発DBへのread-only集計と、保存済みdocs中のQA ID完全一致検索だけを実施。ユーザー状態・分類期間は変更していない。既存利用者の生UID・subject ID・氏名等はこの記録に保存しない。

## 180の単位

`g2-20260924/RESUME_INTEGRATION.md`、`GAME04_G2_統合受入結果_a46履歴.md`の「188戦中 excluded8 / included180」は**battle行数**。started/settledが各々同数として記録されたもので、180人でも360戦でもない。

## 今回の集計

|範囲|battle行数|user数|
|---|---:|---:|
|全保存battle|204|35|
|開始時点included|183|30|
|開始時点excluded|21|5|
|subject未結合unmapped|0|0|

現在値は保存済みQA作業による後続増分を含む。旧180行の当時の全ID集合は当該履歴に残っていないため、現在の183行と同じ集合とは断定しない。

JST 2026-09-25（UTC 9/24 15:00〜9/25 15:00）の `included / web_v1` はbattle_started 5件・5user、saved_action 1件・1userで、`r09-live-sql.json`と一致。

## QA根拠の区分

- **既知QAと証明可能**：G2既知QA記録、R3実操作記録、R4新規専用QAの明記がある対象。現在のexcluded集計・今回のgrant数量検証により除外を確認済み。これらを未分類へ戻さない。
- **根拠不明**：included側30userの全IDを既存docsへ完全一致検索したが、保存済みQA IDとしての一致は0。JST 9/25のsaved_action 1userも同様に一致0。`web_v1`は流入sourceであり一般利用者認定でもQA否定でもない。
- **unmapped**：今回のbattle集合では0。全イベント・将来期間のunmapped不存在を保証するものではない。

## 残件と再開条件

旧includedを通常利用者実績にもQA実績にも認定しない。QA作成記録など元の運用根拠が得られた対象だけ、その期間を確認して親が限定分類を行う。名称・プレイ回数・開発DBであることだけを根拠に一括QA化しない。今回の実装・新規QA除外検証を止める要因ではない。

集計証拠：`r09-classification-live.json`（匿名集計のみ）。この限定確認を全ユーザー分類監査の完了とは扱わない。
