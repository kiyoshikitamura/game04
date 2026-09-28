# G2 継続残件 UI修正（2026-09-25）

保存済み実装49177788／記録04d2dc97を継承。子UI担当は実行可能な局所修正を実施。未承認数値・素材・G3/G4・外部Pの設定は変更しない。

|ID|対象/分類|根拠・症状|修正|検証・残件|
|---|---|---|---|---|
|R3UI01|共通CanonicalDialog送信中 Q01/U05|起票Q01の二重操作禁止。従来CTA/閉じるのみ排他で本文のinput/selectが操作でき、送信済み数量と表示がずれる|async action pending中の本文をinert、dialog aria-busyを付加。既存ref排他・エラー後解除は維持|局所async回帰PASS。実ブラウザでのinert/キーボードは親の実表示検証待ち|
|R3UI02|交換所/魂確認 Q03/Q04/U08|MASTER_AUTHORITY_LATEST §商店 魂「最低10→5、以後2個刻み」。入力minは10だが利用者に最低条件が表示されず、所持→汎用数のみで消費武将/レアリティ不明|最低10・2個単位を明記し、消費武将名/数量、受取汎用魂のレアリティ/数量を表示。不正数には受取見込みを出さない。送信中は全交換input/selectをdisabled|既存domain条件と同一判定。最低数/比率・残高・旧資産変換なし。本体確認待ち|
|R3UI03|交換所form/共通操作欄 Q02/U05|スクロール共通ルールの必要情報/CTA到達。formがinline自然幅、dialog grid操作欄1frの自動最小幅で長い入力/ラベルが広がる余地|フォームを縦配置/box-sizing border-box/幅100%/min-width0。本文と操作欄は縮小可能なminmax0、長文保持|CSS制約確認。360/375/390/低高さ/実機表示は未受入|

## 局所検証

- `node scripts/verify_g2_canonical_pending.cjs`: PASS。実コンポーネントをtranspileしてhook stateを保持し、同一tick二重送信防止、pending本文inert、閉じる/背景close抑止、非同期reject後解除を確認。実DOMやブラウザの代替合格ではない。
- `node scripts/verify_g2_growth_dialog_guard.cjs`: PASS。前回育成Dialog排他・結果閉じる仕様を保持。
- `npx tsc --noEmit`: PASS（本担当修正直後）。
- vercel:react-best-practicesを適用。新規effect・データ取得・依存追加なし。簡単なderived判定をrender中に算出し、既存排他refとstate復帰を保持。

## 停止要因の区分

- 直ちに実行可能: 上記修正、局所回帰、保存は担当完了。最終SHAは親の統合記録で対応。
- 環境復旧待ち: 実表示・実機のみ。親ブラウザ担当へ360/375/390と狭高さの魂交換、pending入力不可、失敗後再操作、長名表示を引継ぎ。
- 外部依存/ユーザー判断: 本修正に新規判断なし。魂の最低数/交換比率は既承認値を維持。正式画像/名称/日次任務/侵攻damage/P02〜P04は別担当管理。

## R3UI04: 問い合わせ/法務の復帰経路

Q03/U10。設定からcontactへ直接移動し閉じる既存経路は、sameUID+has_profileの検証を保持しておりコード上の追加欠陥を特定していない。一方、法務本文内リンク7画面で`from=settings`が落ち、遷移後に閉じるが表示されなくなる確定欠陥を発見。共通navは元から正しいため保持。

- rights/age-rating→contact、payments→tokusho、cookies→privacyの本文リンクでqueryとreplaceを継承。
- terms/privacy/tokushoのSupportContactへreturnToGameを伝え、窓口未設定のcontactリンクでも同じqueryを保持。
- 本陣メニュー直下のお問い合わせも既存設定と同じmarker記録・queryへ接続。戻り先は既存契約どおり設定。
- `GameContext`のsameUID/has_profile、5分のmarker有効期限、認証確認、法務本文・運用設定は変更なし。
- `node scripts/verify_g2_legal_return_links.cjs`: PASS（実ページをtranspileしsettings/直接アクセスの7×2ケースとSupportContactのqueryを確認）。`npx tsc --noEmit`: PASS。
- ブラウザの実復帰と保存再読込は親確認待ち。リンク局所試験を実認証受入としない。

### Footer二度押し所見の切分け

画像読込直後の1度目無反応/2度目成功について、FooterからRedesignApp.navigateに画像readyの条件は存在しない。navigate先頭はbusy/lockのみ、画像待機は各View内の操作を制限する。コードのみでは所見と一致する確定原因がなく、推測でbusy/lockを除去しない。実表示・イベント/送信状態の証拠追加が再開条件。外部依存やUI完了扱いに移さず未確認として保持。

Coverage表は未表示状態を実装不足と同一扱いしない。今回の確定接続不備以外、保存済みの通常出陣・育成・BOX・薬の機能を未実装へ戻さず、最新候補の代表状態受入は親へ引き継ぐ。

## R3QA01: 明示QA計測表（Q01）

親の実ブラウザ計測を補助する明示観測経路。通常本体には計測UIを出さない。

- `home-live-viewport` の実寸iframe下にQA計測表。既存本体360/375/390/512の寸法、保存状態は変更しない。
- `redesignPerformance` の認証/通信/応答検証を含むrequest待機時間と、Navigation responseStart/responseEnd/DCL、Paint/FCPを表示。
- `CharacterImageReadiness` のグループ開始→完了/失敗でHome/Growth/Questの画像待機時間・枚数・成否を通知。cacheを含む。`screenAssets` はdecode失敗時にもnaturalWidthでloadedへ復帰するため「decode完了」と断定しない。操作可能時刻/TTIは未計測。
- postMessageはtargetOriginをsame origin指定し、受信側もoriginとiframe Windowのsource一致を必須。隠れたstate/DOM/Performanceの外部探索なし。
- payload、URL、残高、ID、tokenは通知しない。request名/画像scopeも固定allowlistに限定。最大100件、iframeのtimeOrigin変更時と再読込ボタンで旧値消去。
- QAflag必須、NextビルドでProduction時はQA許可値false強制、routeでもVERCEL_ENV/APP_ENV Production拒否。通常ページの既存console診断は変更しない。
- `node scripts/verify_g2_qa_timing.cjs`: PASS。無送信条件、明示フィールド投影、origin/source検証、NaN拒否、上限100、navigation変更消去、画像枚数/成否、server/build Production条件。
- `npx tsc --noEmit`: PASS（追加計測実装時）。実iframeイベント表示・冷/warm同条件の測定は親のPreview確認待ち。測定UIの実装を性能基準達成としない。

## R3UI05: 設定プロフィールが縦1文字になる実表示不具合

親681の360×568実表示で「未設定」が1文字ずつ縦並びとなることを確認。根本原因は共通`.editable-setting-summary dl`が直下dt/ddを想定した2列なのに、SettingsPanelは`dl > div > dt/dd`の項目グループ構造だったこと。外側2列×内側2列に二重分割される。

- SettingsPanelのグループ付きdlだけ外側1列へ明示。モバイル412px以下は各項目のラベル/値も縦配置し本文幅を確保。
- 自己紹介の改行を保持し、文字省略・overflow hiddenで隠さない。
- `SettingsPanel.css`だけの局所CSS変更。既存編集・プロフィール保存・未設定文言は保持。
- 親の修正前画像`legal-return-360x568.png`が根拠。修正後実表示は統合Previewで確認待ち。

### R3QA01 Preview既定flag是正

親87ef Previewでharness404を確認。routeへ追加したQA必須flagに対し、Git-linked専用G2 Previewのflag未設定を補う既定値が欠落していた。`next.config.ts`でVERCEL_ENV=previewかつbranch=`work/game04-g2-20260924`、QAflag未設定の場合だけtrueを補完。明示falseを尊重し、他branchは明示trueのみ、Productionは必ずfalse。`ENABLE_QA_TOOLS`と計測許可を同じeffective値へ揃えた。外部ダッシュボード設定変更なし。

局所試験は実next.configをtranspileし、専用branch未設定/明示false/Production明示true/APP_ENV production/他branch未設定/他branch明示true/local未設定の7条件を確認、PASS。配信後harnessは親で再確認する。

## R3UI06: Footerの送信中表示と受付状態の同期

親の追加スクリーンショット確認で、save_deck後は「編成保存結果／更新しました／閉じる」が表示されていた。Footer無反応は結果overlay背面への操作であり、結果を閉じてから遷移する正常仕様。今回所見を不具合の根拠にはしない。一方、独立したソース上の整合改善として、navigateがbusy/lock中をreturnするのにFooterにはbusyの伝達がなく常に押せる表示だった点を是正する。

- RedesignAppのbusyをRedesignShellのnavigationBusyへ伝達。
- Footer5ボタンをdisabledへ同期、nav aria-busyとdisabled外観を追加。
- navigateのbusy/lock排他は保持。画像待機を新たなロック条件にしない。終了/失敗時は既存finally setBusy(false)で戻る。
- `node scripts/verify_g2_footer_busy.cjs`: PASS。実Shell renderをbusy/idleで比較し5ボタン、aria-busy、親接続/既存排他保持を確認。
- 親で保存中disabled→完了後有効の実確認待ち。結果Dialog中の背面Footer操作は引き続き不可で正しい。

- R3UI06追加時 `npx tsc --noEmit`: PASS。

### R3UI06 親の実送信受入追記

親が1b4473cd/390×568で専用QAデッキ5枠目の左移動を実送信。送信中Footer全5ボタンdisabled、保存完了後enabledへ復帰、編成保存結果Dialogを閉じることを確認。`/workspace/scratch/g2-r3/footer-busy-1b-390.txt` / `footer-settled-1b-390.txt`が原本。本担当のread-onlyとは別の親実証として保持。
