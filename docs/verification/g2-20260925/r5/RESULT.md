# GAME04 G2 R5 一括提出

2026-09-25。素材採用判断と日次・侵攻の判断待ちは今回承認により解消。**残るG2作業はSSR背景6細則の決定後の解放・選択・保存、通信/画像故障からの実表示復帰、cold/実戦闘開始/前後比較の計測、管理者HTTP認証・旧QA分類の根拠確認、変更箇所の未確認表示受入。** 外部P02〜P04は別工程。G2全体の完了判定は今回実施しない。

## 反映と根拠

|対象|反映・限定確認|
|---|---|
|正式スキル72|001〜024短名、025〜072設計名。既存40＋新32対応。792 LB値・効果不変。旧所持/保存snapshot保持。[assets](assets.md)|
|素材10|正式候補を育成/魂交換/在庫/報酬へ接続。N/R/SR/SSR文字表示継続。画像全件HTTP/SHA確認|
|背景35|添付エリア10・侵攻15を優先採用、SSR10は準備。原本ZIP不変、ID/元ファイル/ハッシュ/配信WebP対応保存。[manifest](background-manifest.json)|
|日次|JST0失効/結果確定日、DM005出陣3勝で令1枚。受取+1、同ID非重複、新ID再受取/前日拒否、DB一致。[独立実接続](independent.md)|
|新侵攻|新snapshotに版マーカー。実HP25,830×1.5=38,745を共有HP/貢献に反映、表示38,756を保持。旧開催1,445は旧式保存。再送/DB一致。端数cap/旧Lv/多段/盾/DOT/反撃/回復/蘇生は局所試験|
|配信・表示|107unique画像URL取得200/SHA一致。390×568本体スキル一覧・詳細・装着保存、出陣、5城3段階の背景srcを確認。実端末と全演出受入は別。[表示証拠](browser-limited.md)|

## 版対応

- PR: [#30](https://github.com/kiyoshikitamura/game04/pull/30)、branch `work/game04-g2-20260924`。
- 実装SHA: `9e9a0a67da69ee34c9297b123bdf4bf7e06e233b`。記録コミットはこのSHAの後続として保存し、コードを変更しない。
- 不変Preview: https://game04-e3dlc96zt-kiyoshi-kitamura.vercel.app
- Deployment: `dpl_3zionmCc9W3YpcGMsTag8qiykBLu`。GitHub/Vercel build成功、deployment metadataのSHA一致。
- 開発API: game04-redesign-api ACTIVE v25 / verify_jwt=true / `e0ce840a22d80c01a921ca3596bef4da3aaf7268c2c1b54ecd378472e644bf68`。
- 開発DB: game04-dev-clean / lrgyllgzcdcphlbmkknc。R5 schema migration 0。専用QAの表示fixtureと通常API操作のみ。R4適用差分を保持。

## 必要な判断・再開条件

**SBG-01**：本陣の既存背景選択に追加／経路を問わずSSR本体初回入手で永続／既所持対象／重複追加付与なし／選択は自動変更しない／解放と選択を認証保存、の6項目一括を推奨。既存エリア背景の方式を再利用し、追加報酬・自動切替を増やさない。現行正本でSSR固有細則を確定できなかったため、最新指示の「未承認」を維持。[比較・影響・実装案](ssr-contract.md)。承認後G2で実装・限定受入し、G3が実ガチャ入手を同契約へ接続。

- R05/R06：対象通信/画像のみの障害注入が可能な検証経路で本体エラー→retry/終了→receipt照合。既存API・局所HTTP成功を維持。
- R08/D04：cache条件を保証したcold測定・実戦闘開始と変更前後比較。今回のサンプル差を性能改善・基準合格へ流用しない。
- R09：管理者Basic環境設定後のHTTP/権限/画面受入。過去QA分類は識別根拠取得後照合。QA除外・receipt数量の既存成功を維持。
- 表示：個別実機指摘方式を継続。素材10個別使用Dialog・全背景実戦再生等の未確認範囲は上記browser記録に限定明記。全画面再監査へ戻さない。
- P02〜P04：取得済みsengoku-hime-ennbu.com、DNS未設定。ドメイン関連実装・外部設定後にPR31候補の統合受入。P06別スレッド。HTTPS/メール/外部認証の稼働を推定しない。

採用D01/D02/D03/D05/D06をクローズし、性能D04、SBG-01、外部依存を分離。mainマージ・本番変更・G3以降の実装は行っていない。
