# G3 隔離環境の作成・配信記録

2026-09-25。新設、EU/Micro、費用はユーザー承認済み。既存 dev/main/Production は変更しない。

最新受入状況は [RESULT.md](RESULT.md) と [ISOLATED_DEPLOYMENT.md](ISOLATED_DEPLOYMENT.md)。下記の初回Auth停止は2026-09-25 18:59 JSTの本人設定で解消。

## 接続と費用

- 組織: `kiyoshikitamura's Org` / `mvkvwqhvpoxpvxbumfjk`
- 正式 get_cost 応答: project / monthly / USD 10。承認範囲内。
- 作成済み: `game04-g3-acceptance` / `znakrkaazliexzwihxge` / `eu-central-1` / ACTIVE_HEALTHY
- 作成応答時刻: `2026-09-25T09:02:26.735333Z`（サービス応答値）。
- Vercel connector の slug 404 は認証済みブラウザー経路で解消。再認可は不要。
- Vercel team: `kiyoshi-kitamura` / `team_ounFOJd7sfCvcytYCkExbj77`
- Vercel project: `game04` / `prj_vV06TC8bU3TEFRpNXFNdONiZmULE`
- 確認画面: https://vercel.com/kiyoshi-kitamura/game04/settings/environment-variables
- `work/game04-g3-20260925` のみを選択し、Production / 全Preview / Development は選択せず保存。
- 保存済み: NEXT_PUBLIC_SUPABASE_URL、新環境 anon 公開鍵、USE_MOCK_DB=false、ENABLE_QA_TOOLS=true、APP_ENV=preview。
- 初回はG3ブランチ限定の無効値で旧キー継承を遮断。2026-09-25 18:59 JSTに本人が新環境キーへ設定済みと回答。その後の認証付きQA routeは認証判定を通過し、匿名Authと正式APIの実接続も成功。秘密値は記録しない。

## DB / API

新環境に限定schema、正式プール、必要runtime、Auth binding、原子的ガチャcommit、G2共通KPI/G3接続を適用。
適用記録は新環境migration履歴に保持。資材と依存契約は `supabase/isolated/g3/`。
旧migrationの一括再実行ではなく、必要なGAME04 runtime定義だけを選択して適用。
旧devのユーザー、Auth、履歴、Stripe/webhook/Cronは移行しない。

- formal master data MD5: `748bde1a107fc2e37aa0c33a6752561f`
- normal 292 / special 233 / skills 72 / 旧skill 0 / 各rate合計100
- G2 R8 roomsFor保持。G2既定OFF性能候補は除外。
- API source SHA256: `35d31759e93e729aae8e27a95fedd9f917de4e9c4368f47389f9756f10ae3f4f`
- 配信用minified artifact SHA256: `114f3581ff8f7365ad5bc1d1e1e1ce9570bb7660fe55edf3ef6b4c2e6c9719ca`
- tracked bundle SHA256: `e43232bfeb3eb2019c1c96ff707af60716bde3b3d8447ed136f7dfc6555cac8b`
- 新環境 API `game04-redesign-api` v1 ACTIVE / verify_jwt=true
- 配信応答 ezbr_sha256: `1744b84f403ecf33943c6523ed23430b8656811f8344b44a52d718634d9e5d16`
- API URL: https://znakrkaazliexzwihxge.supabase.co/functions/v1/game04-redesign-api

## 初回検証履歴（下記Auth停止は解消済み）

ローカルformal/adverse/static98/measurement/typecheck/bundle、隔離接続設定でのproduction buildはPASS。
DB formal/contract gateはPASS。これらを本体→認証API→DB→再ログインの実接続受入の代用としない。
Auth設定のread-only確認はHTTP 200。`anonymous_users=false`、`email=true`、`mailer_autoconfirm=false` であり、匿名ユーザー有効化が実接続受入の確定blocker。Auth users、game users、orders、requestsはいずれも0件。専用Preview配信、実接続・UI・性能受入は未実施。
隔離専用initializerはプロフィールとQA分類だけを作り、UI互換のCOMPLETE投影でチュートリアルを迂回する。G4正式配布・チュートリアル実装を代用せず、G2へそのまま採用しない。
GitHubパスワード入力要求はユーザー辞退。ユーザー指定はGoogle認証。表示されたGitHubログイン画面にGoogle選択がないため、パスワード方式へ切替えず、認証設定変更は保留する。

## 継続利用と引渡し

この環境の受入はG3単体。G2最終統合やG3完了判定へ自動読み替えしない。
引渡し先はG3 PR #33、G2 PR #30、最終判断はメイン進行チャット。
72時間を初期利用目安とし、後続G2統合検証で必要なため自動停止しない。
初期確認日は2026-09-28 JST。継続する間は月額換算USD10の計算資源費（従量・税は別）。
統合検証の利用終了が確認できた時点で停止判断を記録する。
