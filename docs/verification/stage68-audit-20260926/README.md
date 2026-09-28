# 全68面の検証証拠

最初に `AUDIT_BASIS.md`、全件一覧 `AUDIT_TABLE.md`、詳細ガイド `GAME04_ALL_STAGES.md`、問題/承認案 `ISSUES_AND_PROPOSALS.md` を読む。結果は成立10・条件付き58。ゲーム/DB/配信設定の変更なし。

## 保存データ

- `results.json`: 各面の旧案比較、探索、最終条件のseed別勝敗/行動/到達派/実ダメージ/技別発動/SP獲得/BURST/敗因/結果SHA256。
- `evidence/面番号-input.json` と `面番号-state.json`: 最終固定入力と育成・装備個体・技順。合成ユーザー。stateの全解放フラグは入力作成用で、実ユーザー進捗/到達証明ではない。到達条件は監査表の別欄。
- `evidence/面番号-sample.json.gz`: 最初の評価seedの全フレーム。gzip展開で元JSON。その他seedは入力とseedから同じフレームを再生成でき、保存した全結果ハッシュと照合可能。
- `final-replay-checks.json`: 主条件5,480戦の結果SHA完全一致。
- `mechanic-comparisons.json`: 同じ20seedで支援一括除外・LB0別属性攻撃へ変更した比較。個別技能の因果証明とは別。
- `resource-flow.json`: 各面の最初の評価seedでSP正負変動、能動スキル消費、最終SP、BURST攻撃数/無料/獲得なしを確認。全seedの収支を集約した統計ではない。
- `alternatives.json`: 初期武将代替の試行・完全入力。未成立代替は推奨しない。
- `early-followup.json`: エリア2の追加検証（Lv9、各200試行）。
- `DBG047-*.json`: 保存戦闘再現、ガイド技差替比較、育成探索、未承認のDEF局所案。
- `api-parity.json` と `evidence/api-面番号-input.json`: 実配信API v8の生成入力との完全一致。
- `audit-table.json`: 68個票、入手経路、前面固定報酬、費用差額、前面周回案、設計意図、比較結果。
- `MANIFEST.sha256`: 配布時の証拠ファイル完全性。本文はUTF-8。

## 再実行

リポジトリの本監査保存SHAを専用作業コピーへ取得し、Node.js 24を使用。ネットワーク接続・npm追加インストール・実ユーザー認証は不要。

```bash
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --import ./scripts/stage68-loader.mjs scripts/audit_stage68_replay_saved.mjs
```

これは保存した最終条件68面・追加検証400戦・隔離案600戦を再実行してハッシュ照合する。元の探索を上書きしない。`audit_stage68.mjs` は探索生成用なので、証拠一式の保全後に別コピーで実行する。`audit_stage68_followup.mjs` と `audit_dbg047.mjs` も探索途中の出力を作るため最終条件を上書きして提出しない。

API入力照合を再実行する場合:

```bash
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --import ./scripts/stage68-loader.mjs scripts/audit_stage68_api.mjs
```

外部通信は全てメモリ内の模擬応答で、未知経路は失敗させ、戦闘保存直前で停止する。新しい配信へ変更後はその配信バイトを改めて取得し、基準ハッシュを更新して検証する。

## seedの区分

旧案47001〜47020、育成探索48001〜、通常最終49001〜49060、7-8/8-3追加51001〜51200、終盤主条件53001〜53200、DBG-047現行主条件57001〜57200、10-7主条件60001〜60200、初期代替61001/62001〜、3-1隔離案64001〜64200、前面周回65001〜65020、機構比較66001〜66020、エリア2探索67001〜67012・独立評価68001〜68200。実際のseedは各runの数値を正とする。原保存DBG-047は4109474968。

主条件の5,480戦5,470勝は集計値であり、面ごとの勝率を置き換えない。7-8/8-3の追加400戦、代替、探索、支援比較、未承認案はこの分母へ混ぜない。
