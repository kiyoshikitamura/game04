# G2 R3 本体操作・保存照合

## 条件と版

cloud Chrome、既存専用QAセッション G2継続QA、CSS iframe 360×568。実機ではない。回線制限なし、既存キャッシュを利用。新規正式初期付与/G4自然進行の受入ではない。

681f85071b54187521b581454255f70f041c2125 / https://game04-cilvue95i-kiyoshi-kitamura.vercel.app / dpl_AJARSBtdFLGN9EmWC6z98og81epX。API ACTIVE v23、開発DB lrgyllgzcdcphlbmkknc。本文はこの版で観測した結果。後続コードの全件受入へ読み替えない。

## 実操作

|項目|結果|根拠・限界|
|---|---|---|
|問い合わせ→権利表記→本文の問い合わせ→閉じる|同一QA名・所持の設定Dialogへ復帰|本文hrefの from=settings 保持、復帰後 設定 / プロフィール をDOM確認。単純なheading「設定」待ちは実際のheading名と異なりタイムアウトしたが、直後DOMで正しいDialogを確認。認証未連携の既存anonymous QAでありP03受入ではない|
|魂交換|最低10・2個単位・消費武将/数・受取レアリティ/数表示、所持0は実行disabled|screenshots/soul-exchange-360x568.png。固定操作欄と本文スクロールを目視。所持0から実交換は行っていない|
|設定プロフィール|自己紹介が1文字ずつ縦に分割される不具合を発見|会話内スクリーンショットで観測。原本ファイルが転送先に残らずGit画像証拠は未取得。R3UI05でdl二重列を修正。修正前画像を取得済みとして提出しない|
|1-2出陣|Lv8/1/1の3名編成、消費0、ボス僧兵Lv3 HP800 ATK50 DEF45、開始SP0を確認|実APIから出撃準備へ接続。送信中の各操作disabledをDOM確認|
|戦闘再生|一時停止→再開・2倍速、HP/SP/BURST/防御状態表示、勝利まで到達|screenshots/battle-paused-360x568.png は停止要求直後の描画でボタンはまだⅡ。後続DOMで「再開」へ確定し、その後2倍速を確認。3人/1Waveの確認であり5人/6Wave全域を合格にしない|
|結果・報酬|銭+500、武将EXP小+1、装備EXP小+1、スキル召喚券+1、竹中半兵衛+1、プレイヤーEXP+20、行動力103を保持|結果画面表示とDB readを照合。DB evidence JSONを同ディレクトリに保存|

## DB照合

専用QA user_id `2b544996-e7f4-4e88-a5d2-b20f1f50b4b2` のみ読み取り。実操作でversion10→12、cash12220→12720、vitality103維持、player exp20→40、mikawa-2 cleared/clearCount1/attempt1、character exp small0→1、equipment small1→2、SPECIAL_TICKET_SKILL1→2、char_yuki_01追加を確認。未承認移行や他利用者状態のQA変更は行っていない。

## 環境と復旧の切分け

既存タブ整理・DOM操作で20秒タイムアウトとkernel resetが発生。復旧反復はせず、既存31タブのscreenshot/CUA経路へ切替後、再読込でDOM操作も回復した。以後の実表示を一律に環境待ちとはしていない。

87ef8a8cの計測追加直後、QA routeが404。NEXT_PUBLIC_ENABLE_QA_TOOLS未設定でも従来の専用Previewは閲覧できていたのに、新条件が必須化されたことによる実装不備。5196222aで専用G2 Previewの未設定時だけQA有効、明示false尊重/Production false強制へ修正。外部ダッシュボード設定やProduction変更はない。87の404をブラウザ障害として記録しない。

## 5196222a 追加検証

不変Preview https://game04-ogbapdcel-kiyoshi-kitamura.vercel.app / `dpl_EUkXzjPc5GBYvjknRzhdevz44kMZ`。metadataの完全SHAと対応。360×568の同じQAセッション。

- R3UI05: 設定のラベル・プレイヤー名・自己紹介「未設定」が横幅内で読め、縦1文字分割が解消。`screenshots/profile-fixed-519-360x568.png`。
- R3QA01: QA画面404解消、可視計測表へrequestとimage-groupが到達。再読込ボタンで0件へ消去。通常本体iframeの寸法は維持。
- 1-2報酬と銭12,720・行動力103・武将加入が再読込後も保持。
- 「編成」タブで4人目に前田利家、5人目に竹中半兵衛を追加・保存。保存結果Dialogを閉じてから画面移動できた。結果が開いている間のFooter無反応は正常な背景操作抑止であり、不具合としない。「デッキ」タブで空枠disabledは枠未解放とは異なる。
- 実5人で1-1再戦、停止/再開、HP/SP/状態/スキル/名前の表示、勝利→結果を確認。`screenshots/five-battle-519-360x568.png`。低高さでは縦スクロールあり。全ての下端情報到達や全モバイル幅/実機の合格までは主張しない。
- 再戦は銭+500、武将/装備小EXP各+1のみ。初回限定の召喚券・武将再付与なし。DB version16、cash13,220、EXP60、clearCount mikawa-1=2、5人deck、券2据置を照合。原本`five-battle-519-db-evidence.json`。
- 行動力は開始・決着receiptとも98（103−5）、Lv回復0。後続read時には約21分経過して100へ自然回復。結果の戦闘時点98とHeader現在値100を直ちに不整合と判定せず、独立担当がreceipt時刻/計測時刻/300秒回復を照合して正常と結論。数値・API・DB変更は不要。

## 519のローディング実測

可視表の原本は`screenshots/five-result-and-timing-519.txt`、44行の抽出は`timing-519-observed.json`。ページ開始から操作開始までの利用者待ち時間を速度へ算入しない。resource単位のcache hit/miss、実回線速度、TTIは未取得。

|測定|値|解釈|
|---|---:|---|
|初回FCP|1,700ms|タイトルを含むブラウザ描画指標。ゲーム操作可能時刻ではない|
|初回get_state|2,109.4ms|認証・通信・応答確認を含む総待機|
|初回本陣画像グループ9枚|429.9ms|load/decode/cacheを含むグループ待機。転送単独ではない|
|育成初訪17枚 / get_state|490.9 / 1,683.6ms|開始82,103.4 / 82,079.2msで重なり、直列ではない|
|本陣再訪9枚 / get_state|4.3 / 1,526.5ms|キャッシュを含む再訪。最新残高取得を省いていない|
|出陣初訪2枚 / get_state|317.0 / 1,512.2ms|画像とAPIの待機を分離して記録|
|編成保存2回|2,110.8 / 2,219.9ms|save_deck成功。結果Dialogは別に閉じる|
|5人quest_battle|3,766.0ms|API処理。戦闘アニメーションの再生時間とは別|
|get_state全記録の範囲|1,316.0〜2,109.4ms|定期更新を含む単一セッション。独立試行のp95ではない|

Q01の分離計測は部分的に進んだが、同条件の変更前後比較・冷キャッシュ・TTI・承認済み性能閾値との合格判定は未完。共通UI正本§16.1は長時間切替秒数等を未FIXとしており、測定値を新たな承認済み閾値にしない。

## 1b4473cd Footerbusy実受入

不変Preview https://game04-hiquoahql-kiyoshi-kitamura.vercel.app / `dpl_3TPz7whdj6PDTsG724BE2nxLnuWa`。独立担当から返却された390×568の本体で、QA編成の5人目を左へ移動した。

送信中のメインナビ全5ボタンがdisabled、完了後にenabledへ復帰することをDOMで確認。結果Dialogの閉じるも操作。DB version17で4人目char_yuki_01/5人目char_jihoon_01の順に保存され、所持や人数を変更していない。原本 `screenshots/footer-busy-1b-390.txt`、`screenshots/footer-settled-1b-390.txt`、`footer-save-1b-db-evidence.json`。この成立はR3UI06の当該実送信だけであり、全mutation/失敗/実キーボードの受入へ拡張しない。
