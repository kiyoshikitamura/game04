# GAME04 G3 最終提出記録 — 隔離単体候補

2026-09-25。配信・実接続機能検証・独立レビュー修正を実施。**機能は確認済みだが、cold応答性能と連携アカウントの再ログイン受入が未完了のため、G3最終完了判定は保留を提案する。** G2統合受入を代替しない。最終判断はメイン進行チャット。

初期共有環境での経過は [HISTORICAL_SHARED_CHECKPOINT.md](HISTORICAL_SHARED_CHECKPOINT.md)。下記を最新状態とし、旧Auth停止・旧配信待ちを現在の残件へ戻さない。

## 成果と配信先

- Draft PR: https://github.com/kiyoshikitamura/game04/pull/33
- ブランチ: `work/game04-g3-20260925`
- 実装SHA・証拠SHA・不変Preview: [ISOLATED_DEPLOYMENT.md](ISOLATED_DEPLOYMENT.md)
- 隔離Supabase: `znakrkaazliexzwihxge` / `game04-g3-acceptance` / eu-central-1 / Micro。
- API: `game04-redesign-api` v3 ACTIVE、JWT検証有効。
- source SHA256: `57be17cef08185ced05e92bf9650e119ffb193b65d31d9d149d31370f2036975`
- tracked bundle SHA256: `7f8899d51de1bc0b3708c66c0eaa1fb063f0a3064721bb48f08b57a59bc304d3`
- 配信管理hash: `f0e4aa527baf6cf0cf0c49cb81f154486ff5d4b1170ba45f1feea388dfadc679`
- 最終ブラウザーでx-regionのCORS許可漏れを発見しAPI v3で修正。OPTIONSと実本体接続を再確認。
- Vercel専用ブランチへ新環境URL/鍵を設定。18:59 JSTの本人設定後、認証停止を解消して実接続を開始。
- 今回の隔離作業では既存dev・main・本番へ書込みなし。G2既定OFF性能候補は不採用。

## 正式仕様対応表

| 項目 | 実装・照合結果 |
|---|---|
| 通常 | 1,000/10,000銭、日次無料10連1回JST0。N/R/SR/SSR=49/40/10/1%。各レア内キャラ/スキル/装備=20/30/50%。 |
| 特選キャラ | 300/3,000輝石、SSR/SR/R=3/32/65%、交換200Pt。 |
| 特選スキル | 300/3,000輝石、SSR/SR/R=5/35/60%、交換100Pt。 |
| 特選装備 | 200/2,000輝石、SSR/SR/R=10/40/50%、交換100Pt。 |
| 正式プール | キャラ60、スキル72、装備160。通常292、特選233（45/63/125）。装飾枠由来の二重IDなし、旧スキルなし。 |
| 抽選重み | レア→カテゴリ→同カテゴリ同レア均等。丸めた表示率は使わない。独自保証・割引・天井確率変更なし。 |
| SSR交換 | 同カテゴリの排出SSRと一致。必要ポイントだけ減算、余り保持、交換自体のポイント加算なし。 |
| 付与 | キャラ初回取得/重複固有魂20。スキル初回LB0/重複N/R/SR/SSR=1/2/5/20共通素材。装備別個体、自動分解なし。 |
| 保存 | 消費/抽選結果/付与/重複/ポイント/任務/KPI/背景をサーバー確定し原子保存。同ID再送は既存receipt。 |
| 任務 | 通常有料/無料成功のみ通常ガチャ日次へ計上。特選・交換は誤計上しない。共通JST時刻、種類数は重複で増えない。 |
| 背景 | G2共通解放処理を使用。初回対応SSR・既所持同期・永続化、自動切替なし。選択保存。 |
| UI | 実マスターの割合/一覧/交換対象。通常/特選3カテゴリ/価格/券/ポイント/無料状態。保存後演出、skip/reloadで結果不変。 |
| G4境界 | 強制ガチャ/固定抽選/追加無料10連なし。隔離QA初期化は正式チュートリアル・初期配布へ採用しない。 |

## ID・券・ポイント対応

全排出ID/レアリティ/重み/交換対象は `src/domain/redesign/data/formalGachaMaster.json` と正式生成SQLを保存。DB formal master MD5 `748bde1a107fc2e37aa0c33a6752561f`。

| カテゴリ | 正式在庫ID（user_items） | ポイント | 交換対象 |
|---|---|---|---|
| キャラ | SPECIAL_TICKET_CHARACTER | character、券含め1抽選1Pt | 排出SSR10件 |
| スキル | SPECIAL_TICKET_SKILL | skill、券含め1抽選1Pt | 排出SSR14件 |
| 装備 | SPECIAL_TICKET_EQUIPMENT | equipment、券含め1抽選1Pt | 排出SSR20件 |
| 通常/無料 | 銭/日次利用権 | 対象外 | 対象外 |

`questTicketGrants`は累計付与台帳であり減算しない。有効paid-lotとuser_itemsを原子的消費。期限切れは全体rollback。通貨不足時の券への自動切替なし。

## 修正・検証結果

- 独立レビュー全文: [INDEPENDENT_LOCAL_REVIEW.md](INDEPENDENT_LOCAL_REVIEW.md)。別タスク未配信実装は混在させない。
- P1: 券台帳誤消費→正式在庫デビット。jsonbキー順→canonical比較。同一payloadの特選/交換再送成功。
- P1: 永続pending（ユーザー別localStorage）、同ID復旧、Web Locks、確認前離脱でも同一結果復元。
- P2: 開きっぱなしJST0更新、抽選/任務共通timestamp、DB確定日整合。全背後inert、focus trap/復元、Enter/Space抑止、16/14pxと44px操作領域。
- 実接続機能9項目: [live-isolated-b.json](live-isolated-b.json)。無料/再送/不正payload、不正支払非消費、特選、券実在庫と台帳分離、期限切れrollback、同ID並列一回決済、SSR交換/背景、refresh再認証の保存保持。
- DB照合: [ISOLATED_DB_RECONCILIATION.md](ISOLATED_DB_RECONCILIATION.md)。失敗操作receipt0、QA分類、実売上0、ポイント/任務/在庫/背景と一致。
- 実ブラウザー: [BROWSER_ISOLATED_ACCEPTANCE.md](BROWSER_ISOLATED_ACCEPTANCE.md)。本体→認証API→保存→結果前reload→続きから→同結果。360/390px、価格/不足/券/提供割合/SSR交換対象/フォーカスを確認。
- local formal/domain/adverse/static98/measurement/typecheck/bundle/region/build PASS。確率検証は計算とdomainテストで実施、DB大量抽選なし。
- Windowsパス/LF正規化の修正あり。Windows実機での再実行自体は未実施。

## 性能と実際の残件

地域をDBと同じEUへ指定し、G3 statusの重複state取得を除去、レスポンス生成と券読取を並列化。G2既定OFF保存候補とは別のG3読取限定修正。

[performance-isolated-v2.json](performance-isolated-v2.json): warm725〜1,315ms、cold9,444〜14,139ms。管理ログの関数実行649〜1,610ms、boot36〜49ms。大きな遅延は関数開始前の地域ルーティング/割当待ちに相関する。コード内だけで解決したとは言えず、coldを除外して合格にしない。cronによる常時保温や費用増を加えていない。

ブラウザー390pxでは入力→click0.7ms、busy反映2.7ms、CTA操作可能1487.9msを観測。意図した開門約4秒はAPI待ち時間と別扱い。

残件は次に限定する。

1. 承認性能基準の全条件達成（特にEdge呼出し前cold遅延）。
2. 連携済みアカウントのログアウト→資格情報入力→再ログインによる同一所持/背景確認。匿名ゲストreloadとrefresh試験をこの合格へ読み替えない。
3. 実時刻JST0を跨ぐ開きっぱなし/DB実接続の観測。計算/domain/DBガード検証と区別。
4. 最新G2成果と同一候補にした統合受入。隔離単体結果だけでは統合完了にしない。

## DB差分・引渡し・環境方針

資材: `supabase/isolated/g3/manifest.json`、`APPLY_ORDER.txt`。限定schema/正式マスター/付与・KPI・背景・原子commit/認証binding、実接続で不足を発見したrooms/territory/guild読取依存14〜17を追加。旧devのユーザー/履歴/Stripe/webhook/Cronは移行なし。fixture writerは試験後に12で削除済み。

G2 R8 PR30 `29b1515f677bb475cb22b956c9802b88f51c2411` のv31保持差分は [R8_INTEGRATION.md](R8_INTEGRATION.md) のとおり選択統合。旧bundle上書きや全migration再適用なし。

引渡し先: G2 PR #30の統合担当、G3 PR #33、メイン進行チャット。渡すものは正式マスター、G3 domain/UI/API差分、券原子消費/receipt/KPI/背景接続SQL、配信hash、実接続証拠、上記4残件。隔離専用URLガード/QA初期化を共有環境へそのまま移さない。

後続G2同一候補検証で必要なため**環境は停止せず維持**。初期利用見直し日2026-09-28 JST。正式見積の月額換算USD10（使用量・税別）。統合担当の利用終了確認後に停止判断を記録する。G4/G5へ自動移行しない。
