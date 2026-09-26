# GAME04 領土侵攻 UI／演出 2026-09-24 提出

## 固定成果

|項目|内容|
|---|---|
|基点|共闘最終成果 dce0bda37f353c2706e5566fba6333fbdc2c393c|
|Branch|work/game04-invasion-finish-20260924|
|実装・配信SHA|061d2638e637e54cfd6330a806db12804325f9eb|
|固定Preview|https://game04-h5989fglp-kiyoshi-kitamura.vercel.app|
|比較確認用fixture|https://game04-h5989fglp-kiyoshi-kitamura.vercel.app/qa/invasion-approved|
|Deployment|dpl_bLYqjgfjDNB2WTLVhHwyFjewWwjq ／ Preview READY|
|Draft PR|https://github.com/kiyoshikitamura/game04/pull/27|
|対象dev|lrgyllgzcdcphlbmkknc ／ 既存 game04-redesign-api v19を保持|

## 実装

本体のTerritoryViewを一覧・詳細・中央侵攻確認の3画面へ変更。既存RedesignAppのterritory_host→作成したRaidViewへの遷移、request ID保存・再送、開催snapshotを保持。共闘API/DB/戦闘・報酬数値は変更していない。

敵段階のタップで正式enemyの画像・固有Lv・HP/ATK/DEFを切り替える。共有ボス段階と敵固有Lvは分離。通常戦は開催時抽選のため開始表示は正式候補の代表例。画像内例示の数値は採用しない。

不足でも詳細閲覧可能。画像読込待ち・失敗時再試行・連打抑止・背景inert・低画面Dialog内スクロール、終了した侵攻から既存結果・報酬画面への入口を実装。共有ShellはFooter承認名称・メニュー表記・侵攻時の顔Lv配置に限定して変更。

## 検証と証拠

- [固定Preview確認](PREVIEW.md) ／ [固定Preview侵攻確認](preview-confirm.jpg)
- [独立検証記録](VERIFICATION.md) ／ [機能結果](browser-results.json)
- [モック対比画像](mock-vs-body-390.jpg)：上段承認モック、下段本体部品fixture。各列幅390px。
- [一覧](list-390.jpg) ／ [詳細](detail-390.jpg) ／ [侵攻確認](confirm-390.jpg)
- 低画面：[一覧](list-low-390.jpg) ／ [詳細](detail-low-390.jpg) ／ [侵攻確認](confirm-low-390.jpg)
- [正式接続の照合](../territory-20260924/domain-presentation.json) ／ [接続記録](../territory-20260924/CONNECTION.md)
- [素材対応表](../../design/territory/2026-09-24/ASSET_MAPPING.md)
- 型検査・ローカルwebpack build成功、GitHub Vercel commit status success。最新配信はVercel dashboardでREADY/Source一致確認。固定Previewの一覧・詳細・段階切替・確認・キャンセル、画像欠落0件も確認。本体rootは起動表示まで確認し、実データ侵攻は未検証。

ブラウザ機能検証は正式データを使う本体部品のfixture。今回の実API主催成功・再送・非消費・再ログイン永続化の合格へ読み替えない。共闘の過去実API証拠は基点のまま保持。

## 残件

|項目|理由・影響|実装済み／判断後の差替先|
|---|---|---|
|中間段階の正式指定|承認モックは例示。段階6を正式指定した合意はない|本体は「中間（仮）」で正式第6段階を閲覧。開始・最終を含め切替は動作。採用Lvの指定後territoryPresentation.tsだけ差替可能|
|城別専用背景|5城個別の承認画像対応が未確定|共闘採用済み共通城背景を利用。城名・敵・数値は正式接続。専用素材の要否と対応を決めたらCastleの画像参照を置換|
|入手方法から交換所への直行|既存本体側の正式な侵攻令交換入口接続がこの基点にない|正式itemSourceの入手方法Dialogと所持数を表示。交換所機能・導線の担当側成果へ接続する必要あり|
|実API主催と永続化の今回受入|新規匿名QAの通常初期化がHTTP400/timeout、最終get_stateもHTTP409。既存APIやQA資産を書き換えて成功を作らない|本体既存API経路を維持しfixtureの成功/失敗/連打/複数/終了を検証。利用可能なQA初期化経路で実API受入を残す|
|自然育成・他ページ全操作回帰|今回の対象3画面・共有ラベルに限定|全体バランス受入と本陣/武将/出陣各担当の最終統合で確認|

Production公開・Production環境変更・mainマージなし。残件を含むため全面クローズとはしない。

