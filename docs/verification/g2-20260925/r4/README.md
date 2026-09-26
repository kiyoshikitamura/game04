# GAME04 G2 R4 限定変更・実接続検証

2026-09-25。PR30 / 記録20c5cde5から継続。全件再監査なし。表示はユーザー実機指摘起点を維持。G2完了判定は別途。

## 対応版

- Branch: `work/game04-g2-20260924` / [PR30](https://github.com/kiyoshikitamura/game04/pull/30)
- 実装SHA: `0e7f37c90ad7023dc165fe7cb209c6913e0f7d09`
- 不変Preview: https://game04-nh6a0tnip-kiyoshi-kitamura.vercel.app
- Deployment: `dpl_HzrGrsYdssKDfLcq4VNN21TbghjY`。`deployment.json`は配信自身のAPIから取得。
- 開発API: `game04-redesign-api` ACTIVE v24 / verify_jwt=true / deployment hash `d3a4952f50fb3bac2ad037c7096cb3dd178db43aa47d570e3b5e5944a37d2eba`
- 生成bundle SHA256: `92e233d5b78f7d0c74b371cc0161c3aaf8acc24f1e74d4649e242fe802d27f4c`
- DB: `game04-dev-clean / lrgyllgzcdcphlbmkknc`。追加は `20260925003813 game04_g2_kpi_observations`、`20260925003959 game04_g2_kpi_detail_qualified_columns` の2件。旧migration再適用なし。
- この後続記録コミットは検証対象コードを変更しない。最終記録SHAはPR履歴を参照。

## 証拠

|対象|記録|
|---|---|
|おまかせ・魂交換・Player Lv回復|[R01/R04/R13](r01-r04-r13.md)|
|正式発動・共闘・侵攻|[R02/R03](r02-r03.md)|
|通信read障害・pending復帰|[R05/R06](r05-r06.md)|
|操作可能/API/画像の同条件観測|[R08測定](r08-measurement-results.md)|
|取得ドメインとP02〜P04/P06引継ぎ|[接続条件](r08-domain.md)|
|計測実装・SQL・管理者HTTP|[R09](r09.md)|
|実装担当と別の確認|[R10独立確認](r10-independent.md)|

専用QAのみ状態作成。高Lv・正式スキル付与、共闘開催fixture、保存開始fixtureは自然進行/G4・自然通信切断と区別。既存利用者状態の変更・mainマージ・本番変更なし。秘密情報と認証sessionは保存対象外。

実測時の本体とQA計測表（390×568 iframe、実機ではない）: [画面証拠](r08-live-proof.jpg)。素材制作画像ではなく、配信本体の記録。
