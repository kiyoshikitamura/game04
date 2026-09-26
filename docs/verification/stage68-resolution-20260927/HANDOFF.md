# 統合と時間面の残件

## 現在の判定

計算比較68/68。今回の未達30面は保存済みの5帯・別攻略・技能個別非依存・300行動未到達の条件を充足。実機時間・快適性は合格扱いにしない。250行動以上の例は [STALLS.md](STALLS.md) に記載。

|対象|残件|次に実行する対処|
|---|---|---|
|7-7|敗北例295行動・176.87秒|seed581155/逆順編成の最長Waveで、敵固有周期を約25%早める候補。主/別/次点を失う場合は同WaveのHPを15〜20%下げる組合せ。5帯と全役割を再評価して同条件実測|
|10-3|勝利例297行動・201.09秒|seed532112/保存編成の最長Waveで、最大HP敵のHPを15%下げるかDEFを8%下げる局所案。勝率が上へ移るため同育成の候補補完と全役割再確認|
|他の250行動以上の例|実時間未測定|role-comparisons.jsonのallValidatedから最大行動の入力を選び、原gzipのseedで実再生。長い原因に応じHP/DEF/周期を個別調整|
|他62面|今回実再生時間未測定|長い例と未測定原因を優先。入力一致の勝率計算は再実行せず保存結果を実BattleViewへ渡す|
|全68面|共有UI統合後の実機・理解・体感受入|主/別/次点/低勝率が理解可能か、敵周期攻撃を確認できるか、待ち時間が許容されるかを実機確認。G5は別判定|

上記の追加短縮案は未検証・未実装。共通300上限や計算式の変更が必要との証拠はなく、敵個別を優先する。停滞案内UIは解消条件に含めない。秒数の許容値を新たな合格基準にする場合は受入判断が必要。

具体入力は [time-next-candidates.json](time-next-candidates.json)。7-7は第4波7-7/4/1の周期16→12（併用HP6908→5526）、10-3は第3波10-3/3/1のHP13873→11792またはDEF3403→3131。現行実装には反映していない。

## 統合手順

1. 専用PR #40のソース差分を採る。旧監査`work/game04-stage68-audit-20260926`は確認時`645512d94b918ecbe0a205085696baecaa6353f0`、共通`work/game04-common-preview-20260925`は`067fe54de6aa6e2842b5d12a8b6e763c82341a08`で後続更新なし。統合直前にも再確認。
2. 共通側のBattleView/UI・inventory・tutorial等を保持。quest65.jsonは敵差分と採用配布を統合し、古いファイル全置換で巻き戻さない。enemy-patch.jsonは今回基準16d45e1からの敵差分。配布差分は前回実装にある。
3. 44配布の必要面より前の取得、既存初回/周回報酬保持、既存進捗snapshot互換を確認。DBスキーマ変更は今回なし。配布削減で追加2,711成功周回を要求する案は非推奨のまま。
4. **統合した最新source.tsと全依存マスターからAPI bundleを再生成する。** このブランチのindex.tsを共通版へ丸ごと上書きしない。ローカル生成物はapi-bundle-manifest.jsonにsource/master/input hashを保存済み。
5. bundle照合、アプリ対象型検査、報酬/進捗、代表入力再生を実施。新UIで同じfixture/seed/3倍速/再開〜最終フレームの時間を測る。共有Preview/API/DB反映はデバッグ統合担当だけが行う。main・本番・GAME03は本作業で変更しない。

## 再開と再生成

Node24で `--import ./scripts/stage68-loader.mjs` を使用する。

- 面別新証拠はfill-pressure-*、1-1はfirst-validation、5-4はband-gap/5-4-focused.json.gz。採用元はstages/*.jsonのinputCondition/evidence。complete/passedを見て残りから再開し、失敗候補を採用しない。
- stage68_resolution_replay_audit.mjsは旧停滞seedを現行候補で確認。同一hash済みは省略。
- stage68_resolution_finalize.mjs --applyは専用ブランチ内のみ。現在masterが前回集約hashと違えば中断。--applyなしの出力で次回guard用hashを先に変えないこと。
- stage68_resolution_report.mjsは保存証拠だけから資料・集計を再生成。戦闘の再試行なし。
- verify_stage68_resolution.mjs、tsc -p scripts/stage68-app-tsconfig.json --noEmit、verify_game04_redesign_api_bundle.mjsで確認。全リポジトリ型検査の既存アーカイブdeployed-api-v8.tsエラーは今回修正していない。
- node scripts/build_stage68_api_candidate.mjs docs/verification/stage68-resolution-20260927でローカル候補を生成。デプロイなし。統合先では出力先を別にして元manifestを保持。
- 実再生QAはdevelopment限定 /qa/stage68-local?case=resolution-2-3-final 等。3倍速にして再開し#measurementを保存。fixtureはinput/seed/resultを含む。行動数を秒へ変換しない。

## 保存区切り

- ab6c5f15660fb47557d235936f8f694a3ea45f14: 45面。
- 14c6eede649bcdf79cd95fcc17918da3c6a56e6d: 56面、5帯68面。
- f5745d7a09d77fde9941890dcea1e134bac59bf1: 67面、実測対比較。
- 最終68面の保存SHAはPR #40の最終報告/HEADを参照。この資料を含むcommitであり自己参照SHAは埋め込まない。
