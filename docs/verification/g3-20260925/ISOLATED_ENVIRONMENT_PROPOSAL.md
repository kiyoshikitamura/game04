# GAME04 G3 分離受入環境案

調査日：2026-09-25  
制約：環境作成、branch作成、DB書込み、既存環境の復旧は未実施。

## 一度の承認で作成する具体案

| 項目 | 提案 |
|---|---|
| 構成 | 同一Pro organization内の独立Supabase project |
| Organization | `kiyoshikitamura's Org` (`mvkvwqhvpoxpvxbumfjk`) |
| Project名 | `game04-g3-acceptance` |
| Region | `eu-central-1`。現在の`game04-dev-clean`と揃え、今回の比較条件を変えない |
| Compute | default Micro |
| 稼働目安 | 72時間。受入終了時に手動pauseし、証拠保存後の削除は別途判断 |
| 費用概算 | Micro $0.01344/時、72時間の単純計算は$0.96768（約$0.97）＋egress/disk等。追加projectは約$10/月相当。公開単価による概算で、確定額ではない |
| データ | 新規QA 2名のみ。既存Auth users、game users、sessions、wallet、進捗はコピーしない |
| DB構築 | G3担当がG2 R8の保持契約に沿って取得する現live schema-only/manual-definition snapshot＋G3差分＋正式master seedのみ |
| 除外 | 旧migration一括再生、GAME03履歴、既存ユーザーデータ、Stripe購入、webhook、Cron |
| 必要権限 | Supabase organizationでproject作成とbilling確認が可能なOwner/Admin相当。対象Vercel team/projectの確認とPreview server secret編集権限 |

承認後、作成直前に選択されたorganizationを対象として正式なcost確認を行う。公開単価概算より増額、
想定外add-on、別plan料金が提示された場合は**作成せず停止して再承認**とする。

また、現在は対象Vercel team/projectへの接続が404になる既知制約がある。有料Supabase projectを先に作って
接続不能にしないため、作成前に専用Previewへ設定できる実行経路と必要権限を確認する。public configの
branch限定値はGitで準備できるが、server secretはrepositoryへ保存せず、対象Vercel権限で設定する。

## 結論

ユーザー操作の停止確認が取れない場合は、`game04-dev-clean`や`game04-prod`を使い続けず、
同じPro organizationにG3受入専用の独立project `game04-g3-acceptance`を作る案を主案とする。

この案はproject lifecycle、Database、Auth、API key、Edge Functionsを既存環境から分離できる。
さらに、G2 R8で予定している「現在schemaの限定snapshot」を正本にし、旧GAME03由来のmigration群を
一括再適用しないため、過去仕様の混入と既存devへの競合書込みを同時に避けられる。

## 現在の構成

- Organization：`kiyoshikitamura's Org`
- Organization ID：`mvkvwqhvpoxpvxbumfjk`
- Plan：Pro
- Active projects：8件
- GAME04 dev：`game04-dev-clean` (`lrgyllgzcdcphlbmkknc`, `eu-central-1`)
- GAME04 prod：`game04-prod` (`soiksqgtmcnspfedmanr`, `ap-northeast-1`)
- `game04-dev-clean`のSupabase branch：0件

regionは東京も選択可能だが、今回の目的は既存devと同じregion条件でG3を受け入れることであり、region差による
latency・cold start・外部接続差を持ち込まないためEUを推奨する。東京へ変更した場合、既存EU devとの
性能値をregion条件すら揃えず比較することになる。EUを選んでもQAデータ量・compute状態・負荷は異なるため、
完全な同条件性能比較とは扱わない。Production候補regionを決める作業はG3受入とは分離する。

## 費用

公式Billing FAQでは、paid organization内の追加projectはdefault Microで約$10/月から時間課金される。
Micro公開単価$0.01344/時で単純計算すると次のとおり。

- 24時間：約$0.32
- 72時間：$0.96768（約$0.97）
- 7日：約$2.26
- 30日：約$9.81

同じPro organization内なので、通常は新しいPro基本料$25をもう一つ追加する構成ではない。ただし
organizationのCompute Creditsは共有であり、現在8 active projectsがあるため、新project分は概ね増分に
なる可能性が高い。egress、disk、税、add-on、billing cycleによって最終額は変わる。

本調査ではorganizationをユーザーがまだ選択・承認していないため`get_cost`を実行していない。
作成承認後に上記organizationでcostを取得し、増額なら作成しない。

## DB構築方針

### 採用

G3担当がG2 R8の保持契約に沿って取得する現在のlive定義を基準に、次の順で限定構築する。

1. `game04-dev-clean`から必要objectのschema-only snapshotを取得。
2. table、view、function、trigger、RLS、grant、extensionの依存順をmanifest化。
3. G2 R8で承認されたmanual definitionをsnapshotへ反映。
4. G3のatomic gacha、KPI connection、正式pool接続を後段へ追加。
5. repository正本から正式masterだけを決定的にseed。
6. 空DBから一度だけ再生し、object hash・件数・権限をlive正本と照合。

### 禁止

- 2026-09-16以前を含む旧migration historyの一括再適用
- `supabase db reset`による旧GAME03履歴の再生
- 現devの全280 tableを無条件に移植
- live DBのユーザー行をseedとしてdump
- GAME03／Productionからのschema・data取り込み
- 未承認migration、旧50 skill、QA仮masterの混入

## 必要なschema範囲

現devはpublic table 280、view 7、function 606、trigger 275と大きい。全量をコピーせず、G3の認証済み
APIとG2の付与・保存契約から到達するobjectだけをdependency closureとして抽出する。

### G3/G2 runtime

- `game04_player_state`
- `game04_requests`
- `game04_battles`
- `game04_raid_rooms`
- `game04_redesign_master`
- `game04_acquisition_events`
- territory、login、VIP、state restore、KPI receipt関連のG2承認済みtable
- `game04_get_session_state`、commit growth/gacha/shop、acquisition、territory、KPI等の必要function

### 共有authority

- identity/profile：`users`、`user_account_auth_methods`
- inventory/wallet：`user_items`、character／skill／equipment所持、paid-lot authority
- content/supply：`presents`、`missions`、`login_bonus_master`
- approved masterを保持するcanonical／formal master table

### 今回は含めない

- 旧GAME03 guild/GvG/PvP/ranking/旧raid実績
- marketing履歴、過去KPI snapshot、chat/DM/BBS実データ
- 既存battle/request/receipt rows
- Production固有table/data

依存functionが除外tableを参照する場合は、そのfunction自体をG3受入対象から外すか、schemaだけを空で置くかを
manifest reviewで明示する。暗黙に旧機能一式を持ち込まない。

## 正式master seed

- `game04_redesign_master`の承認済み行
- 正式60 character、72 skill、160 equipment
- 正式ガチャpool、率、交換対象、ticket ID
- 正式growth／battle／quest／raid／territory master
- G2正式missions、login bonus、shop表示master
- G3検証に必要なfeature/runtime flagだけ

Stripe商品購入はG2/P02責任範囲として今回の分離受入から外す。billing schemaがwalletやticket lotの整合に必要な
場合はschemaと固定test fixtureだけを置き、checkout、実決済、webhook、Production secretは接続しない。

## Auth・QAデータ

- Authユーザーは新規2名だけ作成する。
  - QA-A：匿名／無料ノーマル／JST境界／再送
  - QA-B：認証済み／特選券／輝石／重複／SSR交換／背景解放
- 現devのAuth users 85件、public users 68件、sessions、refresh tokensをコピーしない。
- QA用残高・券・points・所持は専用fixtureで付与し、一般ユーザーや実売上としてKPIへ含めない。
- project固有URL、publishable key、secret keyを使う。
- email redirect、Site URL、anonymous sign-inだけを必要範囲で設定する。
- Google provider、SMTP、captcha、Production Auth hookは今回不要なら無効のままにする。

## Edge Functions・外部連携

- `game04-redesign-api`だけを配信する。
- `verify_jwt=true`を維持する。
- source/bundle SHA parityを確認してから配信する。
- `resolve-battle`はG3ガチャ受入に不要なので配信しない。
- Stripe secret、checkout、webhook、Production callbackを設定しない。
- KPI管理HTTPを受け入れる場合だけ専用管理secretを設定し、一般公開しない。

## Storage・Cron

現devのStorageはbucket 0、object 0であり、G3はrepository/Vercelのpublic assetsを使用するため移行しない。

Cronは**全て無効**とする。親devにあるVIP delivery、ranking、raid、KPI snapshot等9 jobを移植しない。
G3のJST無料ガチャ境界はAPI/DB clockで成立し、Cronを必要としない。時間依存は注入時刻テストと必要なら
72時間内の実JST境界で確認する。

## Vercel Preview

- 現在、対象team/projectへの接続確認は404となる既知制約がある。Supabase project作成前に権限または
  正式な設定担当経路を確保し、専用Previewへsecretを投入できることを確認する。
- `game04-g3-acceptance`専用のSupabase URL/keyをG3専用Vercel Previewへ設定。
- public configのbranch限定値はGit管理可能だが、server secretはrepositoryへ格納しない。
- 一般Preview、dev、Productionの環境変数を上書きしない。
- Vercel deployment ID、Supabase project ref、Edge version、DB snapshot hashを証拠へ保存。
- Preview設定、ブラウザーの実通信先、配信メタデータで接続先refを照合する。照合用の公開UIは追加しない。

## 実施順序

1. ユーザーが先頭の具体案を承認。
2. 対象Vercel team/projectへの接続経路とPreview server secret編集権限を確認。404未解消なら作成しない。
3. 承認organizationでcost確認。概算超過なら作成せず再承認。
4. G2 R8 current-schema snapshotとG3追加定義を固定。
5. dependency manifestと正式master seedをreview。
6. 独立projectを作成。
7. schema snapshot、G2/G3定義、正式master、QA 2名を投入。
8. Auth／Edge／Vercel Previewを専用値で接続。Stripe/webhook/Cronは無効を確認。
9. draw、replay、通信断、JST、ticket、points、exchange、背景、KPIを受入。
10. 通信／配信ログから、本件の書込み先が新project refだけであることを確認。既存dev/prodの行は照合目的でも参照しない。
11. 受入終了時に手動でprojectをpauseし、証拠を保存。削除は別途ユーザー判断。

## 代案：Supabase Preview Branch

公式上branchはDatabase、Auth、Storage、Edge、API credentialsが分離され、data-lessであるため候補にはなる。
ただし現在branchは0件で、親projectの自動migration制御がG2 R8 current-schema snapshotとmanual定義を正確に
再現するか未検証である。古いmigration historyが自動再生される構成では今回の禁止条件に反する。

このため、branchは次を事前実証できた場合だけ代案とする。

- snapshotから新branchを作り、旧migrationを一括再生しない設定が可能
- G2/G3 function hash、RLS/grant、master件数が独立project案と一致
- 自動merge／pullで親devへ反映されない運用を保証

## リスク

- 公開単価は確定見積りではない。作成前cost確認が必須。
- 72時間は稼働目安であり自動停止保証ではない。受入終了時の手動pauseを実施項目にする。
- Vercel接続404を解消し、Preview secretを安全に設定できる権限・経路を確認するまで有料projectを作らない。
- schema-only snapshotでもdependency漏れは起こり得るため、空DB再生とAPI全導線検証が必要。
- EU Microのcold startは機能受入と分けて記録し、本番相当性能の最終値にしない。
- 現devにはRLS無効のpublic tableが16件あるというplatform advisoryがある。今回、全環境のRLS是正を
  新しいG3 gateにはしない。分離snapshotにはG3到達objectだけを含め、外部公開が必要なtableのpolicyを個別確認し、
  policyなしの一括RLS変更は行わない。

## 公式資料

- [Supabase Branching](https://supabase.com/docs/guides/deployment/branching)
- [Working with branches](https://supabase.com/docs/guides/deployment/branching/working-with-branches)
- [Branching usage and pricing](https://supabase.com/docs/guides/platform/manage-your-usage/branching)
- [Billing FAQ](https://supabase.com/docs/guides/platform/billing-faq)
- [RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security)
