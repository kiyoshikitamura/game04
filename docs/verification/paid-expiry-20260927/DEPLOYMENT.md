# 保存・共通Preview配信確認

- PR: https://github.com/kiyoshikitamura/game04/pull/37
- 期限処理の保存SHA: `8db4c7d9a721c0c7d2cac1532bd18250f10d9d39`
- 名称補完を含む配信ソースSHA: `30275a3d87daefd762b96b533d4a845b0a1a303b`
- Vercel: `dpl_9EFCaH1jEMZp4JfjX7piCVzm6piY`、READY。
- 共通Preview: https://game04-git-work-game04-common-preview-20260925-kiyoshi-kitamura.vercel.app
- 固定配信URL: https://game04-e8hr8vvww-kiyoshi-kitamura.vercel.app

共通aliasが古い配信を指していたため、上記READY配信へ更新。`/api/qa/deployment`でSHA・branch・environment=previewを照合した。生の照合結果はdeployment-identity.json。

配信後375/390pxで実QAユーザーの所持品・期限・失効履歴・再読み込みを確認。活力丸15、侵攻令14が再読み込み後も一致、期限RPCはすべて200、pageerrorなし。侵攻令の内部ID表示を共通名称の別名定義で補完し、ブラウザー検証に名称のassertionを追加した。画像と結果はdeployed/。

TypeScript全体検査 `tsc --noEmit --incremental false` 成功。Vercel本番形式ビルドのREADYを確認したが、配信先はPreviewのみ。

DBは隔離Preview `znakrkaazliexzwihxge`。適用済みmigration: game04_preview_paid_expiry_refresh / game04_preview_paid_expiry_projection / game04_paid_expiry_preview_qa_schedule。最終SQLは31_paid_expiry.sql・32_paid_expiry_preview_cron.sqlに保存。実cronは専用QA allowlistだけを処理する。

実ジョブ・36境界・複数期限・冪等性の詳細はREADME.mdとJSON証拠を参照。競合の一使用応答503は同じrequestIdで200へ回復し追加消費なし。実Stripe決済から隔離Previewへの付与は未実施。仕様の追加決定事項はない。

この証拠保存コミットは上記配信の検証後に追加するため、配信ソースSHAとは異なる。main・本番・一般ユーザーの期限は変更していない。
