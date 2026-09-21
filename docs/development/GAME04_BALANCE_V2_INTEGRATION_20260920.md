# GAME04 バランスv2 統合・限定受入記録

2026-09-21。GAME04 devのみ。GAME03・Productionは変更していない。

## 基準・配信

- 作業基準: a99818906044ddcb41e0236527fbe808e267a5cd
- 正本統合: 472239e42e346294f87b5bc349d5cb9382c53592
- 本体実装・確認済みPreview: c3981fb15a8a73fac9f82ebfed2372bd61df3bab (Vercel success)
- Preview: https://game04-git-codex-game04-upstream-20260918-kiyoshi-kitamura.vercel.app/qa/battle-additions
- DB: lrgyllgzcdcphlbmkknc
- Edge: game04-redesign-api v9 ACTIVE。最終の発動見送り理由修正を含む。
- Edge bundle SHA256: a09cb62ab312298c498b1bde40ac1133e8c8c4fa8a782b998933428c2886bd16

本記録と同一コミットに、回復・解除の条件未達を再付与不可と表示していた記録理由の修正を収録。戦闘の実行可否・計算結果は変更しない。最終コミットのPreview配信結果は完了報告で別記する。

## 工程別状態

| 工程 | 状態・範囲 |
|---|---|
| 正本統合 | 完了。v2本文優先、付録の仮値・未決を保持 |
| 戦闘ルール | Preview反映済・限定受入 |
| キャラ・スキル接続 | Preview反映済。45体割当、N15体パッシブなし。72候補は検証用接続 |
| UI・ログ | Preview反映済。最終の見送り理由修正は本コミット |
| Preview受入 | 代表ケース限定。全Lv・物理実機・多人並行の網羅受入ではない |
| 正式バランス受入 | 未FIX・未受入 |

## 実装と既存成果の保持

`src/domain/redesign/battleBalanceV2.ts` に16パッシブ型・25効果群、継続効果・シールド・被弾誘導・反撃・解除、終了時の死亡処理を含む勝敗順、敵被弾SP処理を接続。`battle.ts` は版別に振り分け、`battleCommonV1.ts` に旧v1をそのまま保持する。保存済み戦闘は開始時版で再生する。

検証マスター版は `PREVIEW_PROVISIONAL_BALANCE_V2_20260920`。72スキル×LB0〜10の792行を読み込み、旧IDとの対応を文書化した。72候補を所持品・ガチャへ一括追加していない。既存所持スキルの旧仮効果、正式名称・画像・IDの対応未確定箇所は残す。

UIは既存縦型を維持し、SP400・独立ゲージ200・300行動、状態残量、条件、発動理由、ログを同一計算結果に接続。QA画面に3代表編成と対象選択の比較を設けた。キャラ既存素材を流用し、スキル画像未対応・仮数値を明示する。

## DB変更

Migration `20260920134657_game04_balance_v2_territory_rules.sql` を適用。`game04_redesign_master` の territory 現行マスターのみ `PREVIEW_PROVISIONAL_20260920_balance_v2` へ更新。スキーマ変更、一括初期化、旧ID置換はない。

既存15開催snapshotの前後digestは `0d85a328357b47ea5836e4f4aaa5f5a5` で一致。開催中のルール・既存進行・旧保存戦闘を保持。

## 確認結果

- 型検査・Preview設定build PASS。本体SHAのVercel build success。
- v2 29検証群、v1 24検証群、既存3回帰 PASS。最終見送り理由修正後もv2 29群 PASS。
- 正本792行との照合 PASS。旧ルール540編成、70Questステージ、2Raidマスター、旧スキルID一覧の互換照合 PASS。
- 実API: 新規Questの同一要求並行で結果・seed一致、行動力3の一度のみ消費、再送で追加付与なし。旧保存結果も一致。
- 実Edge v8で mixed/counter/periodic の3検証編成がローカル結果と全フレーム一致、WIN・再送一致・追加報酬なし。最終v9は記録理由のみ修正。保存済みv8結果を黙って再計算しない。
- Preview 360px: 状態・SP/ゲージ・残り行動、counter/periodic編成を確認。状態欄幅326pxで横はみ出しなし。中央詳細モーダルは高さ約622px、内容944pxを内部スクロール、デザインバーあり。

詳細: `GAME04_BATTLE_ADDITIONS_V2_ACCEPTANCE_20260920.md`、`GAME04_BALANCE_V2_MASTER_CONNECTION_20260920.md`、`GAME04_BALANCE_V2_API_ACCEPTANCE_20260920.json`。

## 残件・判断境界

- SKD001〜018 / 028〜031 の「先頭敵」が固定対象か被弾誘導対象かは未定義。QAで fixed/default 比較可能。正式FIXしない。
- 正式能力・成長・効果量・閾値・経済・報酬・ガチャ設計、N属性/役割の正式設計は未承認部分を保持。
- 72候補の旧所持ID・正式名称・画像対応と正式採用は別工程。
- 全Lvバランス、物理端末、今回変更に対する実環境多人並行の網羅受入は未実施。
