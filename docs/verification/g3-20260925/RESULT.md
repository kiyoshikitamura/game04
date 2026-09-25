# GAME04 G3 統合記録（R8統合済み・配信未開始・未受入）

最新状態は [R8_INTEGRATION.md](./R8_INTEGRATION.md)。PR30 `29b1515` のv31保持patchを受領・統合済みで、下記の旧「v31 source未保存待ち」は解消。現ブロッカーは旧実行の停止・共有環境の排他を確認できないこと。復旧/待機を繰り返さず [分離環境案](./ISOLATED_ENVIRONMENT_PROPOSAL.md) を作成。G2の既定OFF性能候補は不採用。今回の共有API/DB/state変更は0。前回remoteのPNG2点/bundle転送不備もR8記録で訂正し、完全原本と全blob照合により保存し直す。

## 所有・候補

- 正本候補: Draft PR #33 / `work/game04-g3-20260925`。
- 最初のremote候補: `945fb678b45d4ba008138d30286e466c4a1bef2a`。G2 `af640e291d3e79e511833dcef1e16f0ff7528b94` を親として保持。
- 並走していたローカルCodexは独立レビューへ切替。別実装は採用しない。レビュー全文は [INDEPENDENT_LOCAL_REVIEW.md](./INDEPENDENT_LOCAL_REVIEW.md)。
- mainマージ、Production、GAME03変更なし。G2完了判定、G4/G5開始なし。

## 正式仕様対応

| 対象 | 正式契約 / 実装 |
|---|---|
| ノーマル | 1回1,000銭 / 10回10,000銭 / 日次無料10回。N49,R40,SR10,SSR1%。各レア内キャラ20,スキル30,装備50%。 |
| 特選キャラ | 300 / 3,000輝石。SSR3,SR32,R65%。交換200Pt。 |
| 特選スキル | 300 / 3,000輝石。SSR5,SR35,R60%。交換100Pt。 |
| 特選装備 | 200 / 2,000輝石。SSR10,SR40,R50%。交換100Pt。 |
| プール | キャラ60 / 正式スキル72 / 装備160。特選45 / 63 / 125。ID全件は `src/domain/redesign/data/formalGachaMaster.json`。 |
| 個別確率 | ノーマル: レア率×カテゴリ率÷同レア同カテゴリ件数。特選: レア率÷同レア件数。表示丸めは抽選に使わない。 |
| ポイント | 特選1抽選1Pt、券も対象。カテゴリ別、自然SSRでresetしない。交換必要量のみ減算。 |
| 重複 | キャラ固有魂20。スキルN/R/SR/SSR=1/2/5/20共通LB素材。装備は別個体。 |
| SSR背景 | G2 `synchronizeHomeBackgroundUnlocks` を付与後の原子保存で共用。自動切替なし。 |
| 演出 | 添付の開門PNG7点。サーバー成功後に演出、skipしても保存済み結果は不変。 |
| チュートリアル | 強制ガチャ・固定抽選・追加無料ガチャを追加しない。正式初期配布はG4。 |

## 配信履歴

- 開発専用Supabase: `lrgyllgzcdcphlbmkknc`。
- API v28 / verify_jwt=true。LF source SHA256 `1712993f7eece34aea04ae829499dcf9853fe0c57be6f5087f3f5e3d78b82778`。
- v28はGitのbundleをesbuild 0.25.12でminifyして配信。配信入力SHA256 `86fbdf3fd339910e8c4beaa1dbe0710b7ca6932faf914ec8daba15602db5fc6c`。
- DB: `game04_commit_gacha` と正式プールに限定して反映。全migration再適用なし。
- プール525行（normal292 + special233）、checksum `713ae72ca355c334f574fe3988f7136e`。
- atomic RPC: SECURITY INVOKER、anon/authenticated execute不可、service_roleのみ。
- 最初のPreview: deployment `dpl_JBQUD5CC7veinJxsb8Tg5VcvYGpz`、GitHub Vercel READY。ブランチURL `https://game04-git-work-game04-g3-20260925-kiyoshi-kitamura.vercel.app`。不変URL未取得。

## 実施済み検証と発見

- 初回候補: static 91/91、formal domain/adverse、G2 R6背景10/10、型検査、build、bundle hash PASS。これらは実接続受入を代用しない。
- 実APIでSQL `result`変数と列の衝突を発見。`v_result`に改名して開発DBへ限定修正。失敗QA user `4cc07316-2555-4556-88da-c8d08dbfd388` の無料使用日null・normal receipt 0件を確認。
- QA user `ef05e7a9-f572-4b41-ad6e-84708cff9bb6`: free10成功、同ID再送結果一致、異なるpayload再送409。
- 上記HTTP往復ms: status1720 / free1685 / replay1277 / mismatch655。初回値であり性能合格ではない。意図した開門演出約4秒と分離。
- SSR交換fixtureのDB versionだけを増やしたためstate.version不整合で409。テスト準備不備として記録し、交換の製品合否根拠にしない。
- 専用QAはG2 `kpi_account_classification_periods` のqa分類で除外。大量抽選による確率検証なし。
- Preview QA画面の提供割合Dialogで `useGame must be used within a GameProvider` を再現。未修正候補の表示合格は撤回。

## 受入前修正・残件

1. 券実在庫 `user_items` 原子的消費・残数表示。`questTicketGrants` は累計付与台帳として維持。
2. jsonbキー順非依存の再送照合。特選・交換の実HTTP再送確認。
3. ユーザー別永続pending、結果前離脱復帰、未解決時の新操作抑止。
4. JST0の開きっぱなしUI更新、抽選/任務timestamp共通化、DB決済日の整合。
5. 共通Dialog focus/背景遮断契約、16/14px文字、44px操作領域、長い結果の全文表示。
6. QA Dialog provider不足修正。
7. Windows pathはpath.joinへ修正、bundle検査はLF正規化へ修正済み。Windows実行自体は未再実施。
8. 同一修正候補で各支払・不足・並列・交換/背景・再認証の実API/DB検証、本体UI・モバイル・性能、最終SHA/不変Preview固定。

## 判定

現時点はG3未受入。修正中の候補を完成扱いにしない。最終受入はメイン進行チャットで判断。

## 独立レビュー反映後のチェックポイント

上記「受入前修正・残件」は初回レビュー時点の一覧。以下が最新状態。

| 指摘 | 最新の修正・検証状態 |
|---|---|
| P1 券台帳の誤消費 | `user_items`をロックして原子減算。`questTicketGrants`維持。開発API/DBで通常券・有効paid-lot券消費、期限切れpaid-lot券の全体rollbackを確認。 |
| P1 jsonbキー順 | API canonical比較、DB jsonb比較。特選・交換の同一内容再送成功、異なるpayload409を実HTTP確認。 |
| P1 reload/pending | ユーザー別localStorage、同一ID復旧、結果確認まで保持、Web Locks、ユーザー切替隔離。UI修正保存済み。MemoryStorage helper回帰4件PASS。実ブラウザー離脱・再ログイン受入は未実施。 |
| P2 JST | 一つの抽選timestampを任務と共用。DBでnormal有料/無料の確定JST日を検査。UI次JST0/visibility再取得。実時刻境界の実接続受入は未実施。 |
| P2 演出・UI | portalによる全背後inert、focus trap/復元、Enter/Space既定動作抑止、主要16px/補助14px/44px target。360/390px専用QA追加。新候補Previewのブラウザー確認は未実施。 |
| QA Dialog crash | provider不足修正。初回Previewの失敗記録は保持し、修正後の表示合格を推定しない。 |
| Windows検証 | URL.pathnameをpath.joinへ修正。bundle hash LF正規化。Windows実機での再実行は未実施。 |
| G2 KPI接続 | 新たに欠落を発見し、共通gameplayMeasurement・既存KPI3関数の限定差分を実装。ローカル型/domain/measurement検査PASS。SQL適用・bundle配信・実接続検証は保留。 |

### 実接続証拠と性能

- 詳細: [live-v30.json](./live-v30.json)。ファイル名はテスト開始時のAPI版。試験中にG2によるv31配信が確認されたため、全項目を同一v30候補の受入としない。
- 確認済み: 正式292件、支払不正時非消費、券実在庫/台帳分離、paid-lot期限切れrollback、同一normal並列の一回決済、SSR交換/再送/背景解放・選択、refresh-token再認証後の保存保持。
- refresh-token試験は本体UIでのログアウト→ログイン受入ではない。
- HTTP16観測中13件が1秒目標超過。特選1578ms、券1516ms、交換1596ms、並列再送10957ms。性能は未合格。開門の意図した約4秒はAPI待ち時間に合算しない。
- static98/98、formal domain、pending helper4件、UI対象eslint0 errors、型検査PASS。これらは最終同一候補の実接続受入を代替しない。

### G2統合・配信停止理由

- ローカルはG2 `b41d35b7d6639df700be22a6087726b4eccdf6bc`までmerge済み。VIP購入表示・戦闘再生計測などG2後続成果を保持。
- G3親が配信したv30: source `b86e10a46b5feeb3dcc6ea999f84805a614ce906c4717c7f0798c4cac8557ac0`、bundle `224e867d7d6464a1ef0a149e00fe6cec2c6f16b330ab2c753508457cc5dce7cb`、配信入力 `0e5d46dec49671223b0f549b5fb260b37cc94533e71e4a2d02d3364e9fc27cce`。
- 最新liveはG2 v31、管理hash `70c20710ef9a7a36b103630cd67548da2fa62f314efa2d0797a482db11fb9c6f`。PR30 b41の差分にはsource/index保存がない。roomsFor RPC最適化との報告はあるが、完全な編集元がGit未保存のため、旧bundle上書きを防ぐ目的でG3次回API/DB配信を停止。
- PR33コメントでv31の完全source/bundleのGit保存と共有API書込み窓の調整を依頼済み。minified配信bundleだけから推定復元して配信しない。
- KPI SQLは新APIのmeasurementを必須とするため、旧API稼働中には適用しない。候補は [G3_KPI_CONNECTION_REVIEW.md](./G3_KPI_CONNECTION_REVIEW.md) に記録。
- 修正後の新Previewと不変URL取得は未完了。既存branch Preview成功を統合受入扱いにしない。

### 再開条件・引継ぎ

1. G2 v31完全source/bundleの保存SHAとAPI/DB書込み順を確定。
2. G3計測差分を統合、bundle再生成、同一候補build/回帰、開発限定SQL/API切替。
3. 性能超過（特に並列再送）を修正・再計測。
4. 同一候補の本体→認証付きAPI→DB→本体再ログイン、pending離脱復旧、JST境界、モバイル・フォーカス受入。
5. PR33の実装/証拠SHA・不変Previewを固定し、メイン進行チャットへ最終提出。

G3完了提案は保留。G4のチュートリアル・正式初期配布、G5の後続受入へ自動移行しない。
