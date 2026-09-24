# GAME04 バトル表示・独立検証記録

## 確認済み

- `node scripts/verify_game04_battle_replay.cjs`：PASS。7シナリオを本体シミュレータに通し、HP/SP範囲、最大6Wave勝利、開始SPと上限の分離、状態付与・BURST・命中イベントの存在を確認。
- 詳細は `replay-simulation.json`。仮の受入入力による確認であり、正式なバランス値の受入ではない。
- 7-7／9-9は既存 `qa/quest65/evidence.json` の編成とseed、正式 `createQuestBattleInput` により再計算。条件は `formal-replay-inputs.json`。計算ロジックと正本数値は変更していない。
- QAは本体と同じ `components/redesign/BattleView` を呼ぶ。出陣は `QuestView`、共闘／侵攻は `RedesignApp` の同一コンポーネントに接続済みであることをソースで確認。
- 既存QA敵の `initialSp` 欠落によりv2入力検証に失敗する問題を、QAデータのみに `initialSp: 0` を追加して修正。

## ブラウザ受入経路

- `/qa/battle-common?scenario=presentation`：5人対3体。選択フレーム固定で通常・命中・BURST比較、再開で実再生。
- `/qa/battle-common?scenario=presentation&vip=0`：非VIPのSKIP非表示と最大2倍速。
- `/qa/battle-common?scenario=six-waves`：敵SP開始0/5/10/15/20/25、上限80、6Wave。
- `/qa/quest65?stage=7-7`、`/qa/quest65?stage=9-9`：保存済み承認入力で最終演出込み2倍速再計測。以前の50.66秒／30.01秒は比較値であり合格閾値ではない。

## 未確認（Preview後に更新）

- 通常／命中／BURSTのモック比較画像、画像欠落、スマートフォン幅。
- 一時停止中のHP・フレーム固定、残時間を維持した再開、倍速変更、SKIPの終端・演出解除。
- 6Wave実再生、結果へ復帰、状態解除・保護解除・割込みの視認性。
- 7-7／9-9の最終カットイン込み2倍速ブラウザ実測。
- 認証付き本体からの出陣／共闘／侵攻開始と結果処理。

ローカル開発サーバーはクラウドブラウザから `ERR_BLOCKED_BY_CLIENT`。ローカルChromium実体は存在しないため、公開範囲を増やす回避はせず専用Previewで確認する。ローカルサーバーは停止済み。
