# キャラ配下 UI／接続 検証成果

状態：未完了。認証付き本体ブラウザ受入、正式スキル移行対応、素材10点が残る。

## 保存・配信

- Branch: `work/game04-character-finish-20260923`
- 表示実装SHA（最終修正前）: `e5aa44d123f3061d0b7d0d4a9b6d416b5b064eb2`
- 固定Preview: https://game04-wtnokgunj-kiyoshi-kitamura.vercel.app
- Deployment: `dpl_3shuy5L4pVoMuiF7zLDT49KF82m4`
- GitHub Deployment: `6628373730` / Preview / success
- Production公開・Production環境変更・mainマージなし。

## 証跡

- `verification-status.md`: ドメイン、fixture、実API、本体ブラウザを分離した記録。
- `live-api.md` / `live-api.json`: 専用QA実API24項目。
- `comparison-01.jpg`〜`comparison-06.jpg`: 訂正基準とQA fixtureの並置。本体比較ではない。
- `materials.md`: 正式ID・画像対応と未確定事項。
- `../../design/character/2026-09-23/corrected/`: 訂正済み比較基準6枚。

## 本体検証の承認障害

自動承認レビューが専用QAセッションを用いる本体ブラウザ検証を拒否。理由は認証情報・private API dataのSupabase宛先と承認の不足。MCPで宛先 `lrgyllgzcdcphlbmkknc` がGAME04 devと確認し、公開設定一致と通信許可先制限を実装したが、再度拒否された。追加の迂回・再試行は行っていない。

必要な承認は、専用QAアカウントの認証情報をGAME04 dev `https://lrgyllgzcdcphlbmkknc.supabase.co` で使用し、本体Previewで育成・編成の保存と再読込を検証すること。実ユーザー所持品・Productionは対象外。

## 一括判断が必要な正式データ・素材

1. 既存50スキルと正式72スキルの対応、対応なし所持品の保持、LB・編成の引継ぎ、正式名称・画像。正本が対応未確定と明記しているため番号順置換はしない。正式初期付与もこの接続に依存。
2. 特大EXP2点、汎用魂4点、魂選択券4点の正式画像。制作または承認済み素材対応の一括決定が必要。

未解消事項をQA fixture成功で完成扱いにしない。
