# P06 所有・受渡し契約
状態: IN_PROGRESS / 本番移行準備未完。2026-09-25 JST。
依頼元はP06一括実行起票。GAME04専用の本番受け皿作成・設定は許可済み。旧AGENTSのProduction変更禁止はGAME03/既存稼働/一般公開/本番ゲーム移行を保護する境界として維持。

- 専用branch: work/game04-p06-20260925
- 作業基準: G2 work/game04-g2-20260924 / PR #30 / 7476566f945708a8e752f71d4d6b90c23f3b937a
- G1 e62d3894は履歴。G2の現在版を巻き戻さない。
- P06専有: infra/game04-production/**, docs/operations/p06-20260925/**, docs/P06_DB_API_STORAGE_REPORT.md
- P02専有: billing server/API/return/contractsおよび決済SQL。
- P03専有: auth server/API/callback/oauthおよび認証SQL。
- G2専有: ゲーム本体、共有state/UI、game04-redesign-api、wallet/VIP/master、開発DB。
- 今回共有コード/config/既存migration/開発DBは変更しない。receiverは独立フォルダのみ。
- Supabase新規作成・適用、Vercel資源変更は親が管理。配信担当へ空projectの採用・改名・保護設定を委任した。DB担当は調査のみ。
- Vercel空project作成UIは確認フォームを挟まず作成したため、生成名project-0jsj9を追加作成せず採用・改名した。資源の二重作成なし。
- P02-P04 OWNERSHIP blob c4d69408fa6d9868e4e986bf02d14ba65318c500を確認。P06の受渡しは本資料と接続契約へ集約。別スレッドへ送信した、または受入を得たとは主張しない。
- P06完了はM/G6合格ではない。G5後に最終候補を再固定する。
