# G2 実行障害からの回収・G3引継ぎ

2026-09-25 JST。G2未完、Draft維持。今回の作業は読み取り・既存測定の再集計・Git記録のみ。API/DB/stateへの書込み、配信、新規測定、main/Production変更は実施していない。

## 保存成果と実行状態

- PR #30のリモートheadを開始時・保存前に確認: `fbd43c77069898cfbd39e3611d76ff0ec09cf857`。R7成果65ファイルを含む。旧作業コピーのHEADも同一で、作業ツリーはclean。
- 稼働 `lrgyllgzcdcphlbmkknc / game04-redesign-api` は2回の読み取りともv31 / ACTIVE / verify_jwt=true。管理hash `70c20710ef9a7a36b103630cd67548da2fa62f314efa2d0797a482db11fb9c6f`。更新時刻 `2026-09-25T06:29:12.267Z`。
- 旧PR #33連絡にv31反映完了、R7 `save-performance.md` に「以後のAPI追加改善は停止」の記録あり。v31への配信終了は記録と現在版で確認できる。
- ただし旧スレッド/子処理の終了・キャンセルはこのセッションから確証できない。現在のPID空間に旧プロセスがないことを旧セッション停止の証拠としない。
- 07:46:47Zのread-only `pg_stat_activity` でactive client queryが1件。`p_user_id / p_expected_version / p_state / p_cash_delta`を含むRPC呼出しが観測され、共有state更新処理の可能性がある。実行主体・完了状態は不明。停止操作や再送は実施していない。
- よって共有環境の更新終了は未確認、配信枠を解放したとは扱わない。G2から追加書込みを行わない。G3受入中も凍結を維持。

## v31 source / bundle 保存状態の確定

下記はすべて上記 `fbd43c77` に保存済み。今回管理APIから取得したv31のファイルは `index.ts` 1ファイルのみ。

|役割|保存先（`docs/verification/g2-20260925/r7/shared-api/`配下）|状態|
|---|---|---|
|実配信本文|`live-v30-rooms.ts.txt`|稼働v31のindex.tsとbyte単位で全文一致。1,166,190 bytes|
|基準v30 bundle|`live-v30.ts.txt`|G3 v30実配信原本|
|v30整形本文|`live-v30.pretty.ts.txt`|差分の基準|
|v31変更|`live-v30-rooms.patch`|rooms投影関数ta（sourceのroomsFor相当）1hunk|
|配信記録|`deployment-v31.json`|v31管理hashを記録|

実配信本文SHA256: `59e497ae9278ba1108ed3a31f510bd4d266eac6535c815bc5f26692f29eac215`。

**過去連絡の「source hash」は上記配信本文のhashであり、G3統合済みモジュールsource.tsのhashではない。** v31はv30の実bundleを整形しrooms関数1hunkを適用して配信されている。独立した完全統合版source.tsからv31を生成した証拠はなく、そのようなファイルを回収済みとは報告しない。

通常パス `supabase/functions/game04-redesign-api/source.ts` / `index.ts` はG2単体でG3全体を含まない。Git保存済みでも共有APIへの単独配信は禁止。前者のSHA256は `841be42f1c09c8bc5b594c4875e50e6f7da911b28da971e8b3d330e383f081fc`、後者は `67348b1a3759befeaa36ab84757910c35979968c5fb208796891715fd0d45cb6`。

RPC定義は同SHAの `supabase/manual/game04_g2_raid_rooms_with_owners.sql`。適用済み記録あり。今回の再適用なし。契約は既存roomsの可視範囲・順序を保持し、owner名/leaderIdだけを同時取得、null fallback・参加者・期限判定を維持する。G3のuser_items券・paid lot・JSONB再送照合・JST日付・共通SSR解放、G2認証後独立read並列化も保持対象。

## G3への引渡しと配信順

[PR #33への引渡し](https://github.com/kiyoshikitamura/game04/pull/33#issuecomment-5828849441) に保存SHA・全文一致・source/bundleの区別・配信停止を通知済み。

1. G2旧処理または共有更新終了を確認する。それまではG3も共有API/DBを配信しない。今回の通知は配信許可/枠解放ではない。
2. 配信責任者をG3親に一本化。直前にPR #30/#33と稼働version/hashを再取得。新版があればv31前提で上書きしない。
3. G3最新sourceに保存済みroomsFor契約を統合。bundleから完全sourceを推定復元したと扱わず、G3の正式sourceと保存patchを照合する。
4. bundle再生成、G3契約とrooms/認証後並列化の限定検証、source/bundle/差分をGit保存。
5. 必要な未適用DB差分だけを反映後、同候補APIを配信。既存RPC/migration一括再適用なし。
6. API readback・version/hash、同候補受入結果を保存。G2はG3受入完了まで共有環境を変更しない。

## 取得済み性能結果の回収・再集計

新規計測なし。既存CTA全80行（各版20）、対応API/結果DOM/busy DOM計240metricを再集計し、既存集計と一致（浮動小数誤差許容1e-8ms）。対応方法は元 `save-performance.md` を維持。省略rawは他版rawに残る同一timeOriginの履歴で補完できた範囲のみ使用。

|保存API版|n|中央値ms|p95 ms|最大ms|≤1秒|≤1.5秒|
|---|---:|---:|---:|---:|---:|---:|
|v28|20|1716.40|3086.10|3397.70|0/20|0/20|
|v29|20|1562.20|2037.90|2102.10|0/20|9/20|
|v30|20|1408.85|1674.10|1684.30|0/20|12/20|
|v31|20|1297.70|1928.90|1954.50|0/20|18/20|

v31 API待ち中央値1249.80ms、p95 1887.80ms、最大1907.90ms。結果DOM中央値1252.25ms。busy DOM中央値3.10ms、最大5.70ms（paintではない）。保存は1秒基準未達、1.5秒例外の19/20も未成立。合格へ変更しない。

条件: cloud Chrome、390×568、同QA-C、frontend af640e29の読み込み済み画面を保持、warm、回線制限なし。共有負荷は隔離されていない。iPhone/Safari・実回線別・coldの代替合格にはしない。v29→v30はG3変更を含み、G2単独改善効果としない。

再集計: `recovered-save-summary.json`、`recovered-api-summary.json`。元のraw、80行、API対応は親ディレクトリの既存ファイルを参照。warm本陣/武将CTA各20回の既存合格は `../p31/R08_EXISTING_VALUES.md` の履歴として保持し、最新APIの主要情報全体の合格へ拡張しない。

## 回収できなかった範囲と継続基準

- 実戦闘開始20回の最終raw・集計は、PR #30保存成果と確認可能な残存ファイルで見つからない。R7 RESULTは「計測中」のまま。実施済み20回と推定せず、回収未完として保持。
- 既存クラウドブラウザのG2タブ1/4を確認したが、DOM読み取りと代替DOM読み取りが `Emulation.setFocusEmulationEnabled timed out` で失敗。ブラウザ内にのみ残る結果は今回取得できなかった。再読込/遷移/閉じる/新規測定をせず既存画面を維持。
- cold独立初回5回、受取/交換各20回、実機/回線別は元記録でも未測定。紛失した完了成果とは分類しない。
- G3統合済みモジュールsource.tsは上記の通り未確認。実配信bundleと正確な1hunk、G2 source/SQLは保存済みなので、それらからG3の正式source統合を継続できる。

過去の全画面監査・完了済み測定・仕様決定を再開しない。以後は `fbd43c77` と本回収記録を基準に、未完項目だけを継続する。
