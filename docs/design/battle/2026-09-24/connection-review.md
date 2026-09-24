# 戦闘UI 接続・結果保存の確認

2026-09-24。基点PR #28、SHA `1d426a6fc9a2a7e8d9ea6ae2d8fd6184bc80881d`。

## 本体経路（ソース確認）

|経路|戦闘開始|共通表示|終了後|
|---|---|---|---|
|出陣|QuestView.start → RedesignApp.startQuest → action('quest_battle')|QuestView内のBattleView|playing=false → 保存済みsettlementの報酬・次ステージ・遭遇選択|
|共闘|RaidView.run → RedesignApp.raidAction → action('raid_battle')|RedesignApp内のBattleView|battle=null → refresh → 元のroomIDのRaidView|
|領土侵攻|TerritoryView.onHost → action('territory_host') → 開催roomのRaidView → raid_battle|上記共闘と同じBattleView|元の侵攻roomへ復帰|
|中断戦闘|pendingBattleから保存IDを指定してquest_battle/raid_battle再送|RedesignApp内のBattleView|battle=null → refresh|

`redesignRequest` は既存 `game04-redesign-api` Edge Function を呼ぶ。今回の表示変更はAPI呼出し、戦闘開始処理、報酬処理を追加しない。

## 結果保存（ソース確認）

`supabase/functions/game04-redesign-api/source.ts` の `runBattle` を確認。

1. requestIDの `game04_battles` がsettledなら保存済み結果を返す。
2. 新規のみ正式入力を作り、検証・simulate後に開始時消費とstarted記録を `game04_commit_growth_state` へ渡す。
3. 保存済み入力を再読込。再送競合時も保存されたseed/ルールを優先する。
4. `settlement:<battleID>` 由来の決定的IDで、状態・報酬・room・settled結果を同RPCへ渡す。409時は保存済みsettledを確認し、上限付き再試行。
5. フロントへ返る時点で決済済み。再生完了/SKIPは結果表示を進めるだけで再決済しない。

RPC内部のトランザクション実装と配信済みDBを今回再検証したものではない。認証済み実APIの新規戦闘・残高差分・保存行の実測は未実施。以上は基点ソースの接続確認。

## 数値・演出投影

- HP/SP/状態はサーバー記録frameをそのまま表示する。戦闘計算は変更しない。
- v2 `absorb` はHPを0でclampするが、damage値にはoverkillを含む。直接攻撃・反撃は正規 `frame.hits` 合計を優先し、HP差分へ縮めない。
- DOT記録にはhitsが無いため、正規ログ末尾のダメージ値を読む。古い記録で数値が無い場合だけHP差分へfallback。
- カットインはburst_start/resumeまたはスキルaction_startの間だけ表示。命中frameで解除する。
- 多段表示値はframe.hitsを保持。effect_missは状態効果の不成立であり攻撃MISSと混同しない。
- Wave跨ぎで同じ敵IDを再利用しても、前WaveのHPを差分計算に使わない。
- 16系統エフェクト担当とはframe/前frame/正式skillを境界とし、エフェクト側はtargetId/familyだけ返す。数値計算は持たない。

## 実施済み検証

`node --experimental-strip-types scripts/game04-battle-presentation/verify-recorded-projection.mjs` PASS。
追加hook・projectionのstrict TypeScript検査PASS。

ブラウザ再生・停止/再開・SKIP・7-7/9-9の最終カットイン込み倍速2計測は独立検証担当へ依頼済み。検証記録の完了値は同担当の証跡を参照する。
