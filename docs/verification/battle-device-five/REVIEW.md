# バトル実機指摘5項目（2026-09-27）

基準: PR #37 / work/game04-common-preview-20260925 / 85a74f7c56260b441fd9f0e324599796e5dd551c。既存の敵固定配置・文字70%・おまかせスキル・共通UI・並走成果を保持。

## 原因と修正

|対象|原因・確認|反映|
|---|---|---|
|BURST敵割込み・連撃|TypeScript本体に敵停止policyがある一方、配信Edge v8は旧attack-free-v1のbundle。検査がsource.tsのみのhashで、import先の更新を見逃していた。旧ログの敵action_startも連撃対象になり得た。|全依存61ファイルのhash付きbundle生成・prebuild照合を追加し、隔離Preview Edgeをv9へ更新。敵act入口と割込み予約実行にもガード。味方partyの実action_startだけ連撃を加算。旧保存入力/ログは再計算・改変しない。|
|ゲージが未発動で0|正式正本に「抽選実施時のゲージ0リセットを維持」と明記（GAME04_BALANCE_AUTHORITY_V2_2026-09-20.md、DBG-035追記）。適格武将の抽選不成立でも消費する既存仕様。満タン到達だけでは消費しない。|確率/必要量/不成立時消費を変更せず、成功・不成立それぞれの消費理由とdeltaをログへ記録。画面に「BURST抽選不成立・ゲージ消費」を表示。未適格時の満タン保持と再充填を確認。|
|敵状態アイコン|情報欄から独立した絶対位置指定で名前/HP/カウントとの重なりが発生。|HP直下・行動カウント前へ通常フローで配置。アイコン14px/間隔3px、残数、+N詳細。敵1/2/3体に対応。|
|黒帯|既存の黒背景が約85〜92%不透明。|敵情報欄背景のみrgba(0,0,0,.30)。文字・HP・アイコンの透明度は不変。|
|リタイア誤遷移・報酬|retire未指定時のonComplete代用と再開クエストの古い遷移情報。さらにAPIは再生前の出撃時に勝敗・進行・報酬を確定していた。|明示retire callback、再生timer世代破棄、退出ロック、古い遷移情報破棄。新クライアントの戦闘は開始時に行動力のみ消費し、battle_finishのcompleteで報酬確定、retireは無報酬終端。共通の決済request IDと既存DBロックで最初の終端判定を保存し、遅延完了/連打/競合でも二重付与しない。|

## 検証

- verify_burst_enemy_pause.cjs: 5連撃中カウント保持、反撃/予約/周期/死亡時効果、途中撃破/派切替/行動不能、旧v1完全互換 PASS。既存証拠ファイルは変更せず保持。
- verify_dbg035.cjs: SP0・装備順・条件再評価・最大5・終了条件・再充填等18ケース PASS。
- verify_battle_device_five.cjs: 未発動/成功の消費理由、未適格満タン保持、味方行動だけの連撃、派切替 PASS。gauge.json / wave.jsonは実エンジン生成のQA入力。
- verify_battle_settlement.cjs: 実runBattleコードで開始時無報酬、retire無進行、遅延完了/再送/競合/所有者不一致、通常勝利一度だけ確定 PASS。
- verify_battle_device_five_ui.cjs: 実BattleViewを使うQA画面、375/390×600px、敵1/2/3体、HP直下・カウント前、情報非重複、14px/背景30%、+N詳細。通常/BURST/派切替直前のretire後1.8秒待機で完了0/次ステージ0/再生画面なし。通常完了callback1回。PASS。browser.jsonと6画像を参照。
- verify_battle_device_five_live.cjs: 隔離Preview実API・専用QAユーザーのみ。新policy、32 BURSTフレームの生存敵カウント保持/敵行動なし。retireは行動力85→84→84、銭・クリア不変。遅延completeはretiredを返却。別の勝利は報酬7行、再送で二重付与なし。終了後pendingなし。live.json参照。
- npx tsc --noEmit / common UI guard / Edge全依存bundle guard / Next build（46ページ）PASS。
- ブラウザは実部品のQAハーネス、DBは別の実API検証。実アカウントでの連続端末操作は実機確認待ちとして区別。

## Preview Edge

隔離project znakrkaazliexzwihxge / game04-redesign-api: v8→v9 ACTIVE、verify_jwt=true保持。DB schema変更なし。配信直前にv8内容が取得時と同一であることを照合。
source hash c7b277d74d038a3cbcff4799d0ac5eebfec9b6c876428e2b11507a929bc79ff5
bundle hash 67ffbd8d2690d8be719869815f8661cc72305c89b050c7b4956c3bb414eead42

## 互換性・残件

- 新規戦闘は新policyと再生後確定protocol。更新前の開始済み入力は保存済みpolicyを保持。過去の確定済み報酬を取消したり、過去ログから敵行動を隠したりしない。
- 配信後に画面を再読み込みし、新しい戦闘で実機受入を行う。実機の速度感・誤タップ・短いSafari画面での受入は未完了。
- 抽選不成立時のゲージ消費は正式仕様どおり保持。これを廃止する変更は今回実施しない。
- main・本番・GAME03・効果/倍率/必要量/確率・別担当バランスは変更なし。
