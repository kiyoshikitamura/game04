# G3隔離環境・新設承認後の事前確認

2026-09-25 18:03 JSTのユーザー指示を受領。

## 承認済み範囲

- 組織 `kiyoshikitamura's Org` / `mvkvwqhvpoxpvxbumfjk`。
- EU `eu-central-1` / Micro / `game04-g3-acceptance` の新設。
- 作成前に専用Vercel Preview設定経路と正式費用を確認。想定外増額がなければ作成・配信・G3単体受入・Git保存。
- 既存dev・本番の変更なし。G2既定OFF保存性能候補を混ぜない。
- 終了時は成果、DB差分、受入記録、G2引渡し先を記録。後続統合で継続使用が必要か確認してから停止する。必要なら保持期間・費用を報告する。

新設・組織選択の承認は取得済み。接続解消後に同じ新設承認を求め直さない。

## 正式費用確認

Supabase `get_cost(organization_id=mvkvwqhvpoxpvxbumfjk,type=project)` の応答:

```json
{"type":"project","recurrence":"monthly","amount":10}
```

承認済みのMicro月額換算約10米ドルと一致し、想定外増額なし。72時間約0.97米ドルは公開時間単価に基づく計算資源の目安であり、上記の正式応答は月額換算。従量・税を含む固定総額を保証しない。

## Vercel設定経路

今回の接続から確認できたteam:

- `kiyoshi-kitamura` / `team_ounFOJd7sfCvcytYCkExbj77`

同teamのproject一覧には `tribe-neon` 1件のみ。`get_project(projectId=game04,teamId=kiyoshi-kitamura)` は404 Not Found。
現接続ではGAME04の専用Preview設定・設定readbackへのアクセスを確認できない。
404だけでGAME04 project自体の不存在や設定不備と断定しない。

有料環境だけが作られることを避けるため、project作成・cost confirmation・新環境配信は未実施。
別projectへの誤配信、権限制約を回避する経路、秘密値のGit保存は使わない。

## 再開に必要な操作

Vercel接続を、対象team `kiyoshi-kitamura` の `game04` projectへアクセス可能な権限で再認可するか、
同projectの専用Preview環境変数を設定・readbackできる正式な担当経路を用意する。
秘密値をチャットに貼る必要はない。

接続経路が確立したら、既承認の組織・EU/Microと同じ費用条件で続行する。新projectのrefをAPIの
`EXPECTED_PROJECT`と専用Preview接続先に固定し、旧devへfallbackさせない。

## 終了・引渡し条件

- この環境の受入はG3単体。G2との最終統合受入やG3完了判定へ自動的に読み替えない。
- 成果の引渡し先: G3 PR #33、G2 PR #30、最終判断はメイン進行チャット。
- 72時間は初期利用目安。ユーザーの後続指示に従い、停止前にG2の後続統合候補で再利用する必要を確認する。
- 継続利用が必要なら停止せず、所有担当・利用目的・延長期間・費用を記録する。作成前なので現在の課金開始・終了予定は未発生。
- 今回のSupabase project作成、API/DB/state書込み、Vercel設定変更は0。
