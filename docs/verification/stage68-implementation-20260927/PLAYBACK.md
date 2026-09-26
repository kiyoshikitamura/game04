# 実再生時間

ローカル開発版の既存BattleViewをChromiumで実際に再生した。表示速度3倍。開始は導入解除・一時停止解除をDOM上で確認した時点、終了は最終フレーム到達。`performance.now()` の差分であり、行動数から秒への換算ではない。全件でタブ非表示への遷移は0回。

|入力|seed|行動|フレーム|実時間|結果|
|---|---:|---:|---:|---:|---|
|9-6 追加調整・主攻略 break-and-buff|431101|69|387|51.2425秒|勝利|
|9-6 追加調整・低勝率 attack-up-reversed|431101|99|570|67.1312秒|全滅|
|9-6 旧停滞入力 attack-up-reversed|87001|300|1603|189.7719秒|行動上限|

原記録は `playback/9-6-primary-3x.json`、`9-6-low-3x.json`、`9-6-old-stall-3x.json`。旧と新ではseedが異なり、同一seedの対比較ではない。開発モード・計算処理並走中の測定なので、本番性能の保証値ではない。

測定対象のBattleViewはこの専用ブランチの版。共通ブランチには後続のUI修正があるため、統合後の同じUI版で再測定が必要。残りの調整面・未達停滞面の実時間は未測定であり、面別 `measuredPlaybackSeconds: null` を秒へ推定して埋めていない。実機監査・G5は未通過。

再現用に `scripts/stage68_playback_fixtures.mjs` と開発専用 `/qa/stage68-local?case=9-6-primary` を保存。`case=9-6-low` / `case=9-6-old-stall` も選べる。開始前に3倍速を選び、終了後の `#measurement` JSONを保存する。測定QAはdevelopment以外で404、ゲームの共通再生処理は無変更。
