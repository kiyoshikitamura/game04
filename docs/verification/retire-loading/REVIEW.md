# リタイア時の共通ローディング（2026-09-27）

基準 PR #37 / 4653b7400bab0ac0f6ae2f2db6ad78bc708bf403。

BattleViewの退出待機が専用の段落テキストだったため、Game04Loading（screen）と既存branded-loading画面配置へ変更。短時間はスピナー、既定1500ms後はロゴ・スピナー・文言、中央・枠なし。新しいCSS/表示方式は追加していない。
失敗はローディングを外してScreenState(error) + 再試行へ。既存の同期exitLock・再生取消・retire callbackを保持。成功で親画面へ復帰、再試行中は操作不可。サーバー/API・進行・報酬・戦闘計算は変更なし。

## 限定検証

verify_retire_loading.cjsで実BattleViewと2.2秒の模擬通信を使用。375/390×600で短時間/長時間/失敗/再試行/成功を確認。処理中ボタン0、中央配置、成功後ローディング0、失敗時aria-busy=false・共通エラー、再試行後復帰、正常時呼出1回/失敗時2回、completion=0/nextStage=0。両幅PASS。結果と画像は同フォルダー。
初回検証はNext.jsの全体alertも拾ったため対象を共通エラー部品へ限定し再確認。画像確認で既存の全画面中央配置も適用後に再検証PASS。

前回の無報酬・クリア進行なし・遅延完了抑止の実API証拠はbattle-device-five/live.jsonを再利用。今回DB操作は不要。実機での受入は配信後確認待ち。

型検査・Next build（46ページ）・共通UI guard・Edge bundle guard PASS。
