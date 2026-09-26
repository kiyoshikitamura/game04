> 2026-09-25 記録照合更新：現在の残件は [統合受入結果](../g2-20260924/GAME04_G2_統合受入結果.md) のZ/R/D/H一覧に一本化。以下は各実施時点の証拠・履歴であり、「未確認」「追加すべき」「親検証中」をそのまま現行タスクへ戻さない。表示の全画面再監査は最新ユーザー指示で終了し、今後は実機個別指摘と同原因の回帰のみ。未検証表示を合格へ変更したものではない。

# G2 残件の実行区分・正式報酬経路の独立確認

2026-09-25、継承コード49177788 / 記録04d2dc97。親の統合候補へ引き継ぐ差分。G2未完を維持し、以下の局所確認を本体・DB・実機合格へ読み替えない。

## 直ちに実行可能な作業

|ID|具体作業|今回結果/残る行為|
|---|---|---|
|EXEC01|正式producerごとの報酬kind/ID→state在庫先の検査|372供給定義、2515報酬行の実grantReward検査PASS。下記に範囲固定。全producer未実装という扱いを解消し、実接続の不足へ分離|
|EXEC02|交換Dialogの入力変更・多重操作防止、狭幅対策|別担当の4ファイルを独立review、局所test実行PASS。実UIは親検証へ|
|EXEC03|72スキル/素材10/出陣背景の候補とID対応表|素材担当が作成。採用待ちでも候補制作は実行可。未承認画像の本体差替えは別|
|EXEC04|daily10/侵攻overkillの正本照合・具体比較|領域担当が照合。既承認の主催仮FIX・侵攻背景は再判断対象外|
|EXEC05|本体全画面のQA、同一候補の再生/保存照合|ブラウザが利用可能なら直ちに実行。過去timeoutだけで恒久待ちへ置かない。親の現行セッション結果で分類更新|
|EXEC06|取得済み画像/DOM/SQLとコード/Previewの版対応保存|親が一元保存、後続コードの証拠を旧候補から流用しない|

## 実際に環境不能な範囲だけを待ちとして保持

- 前回491の360×568新規tab Runtime.evaluate timeout、既存tab Page.enable timeout。前回確認できなかった低高さ戦闘/BURST/長名/多数状態/画像失敗/問い合わせ復帰は、新セッション利用結果を親が更新する。
- iOS Safari実機、実キーボード表示、実回線の確認はcloud Chromeと区別。担当の実行環境に端末がない場合、実機受入が再開条件。
- cold/TTI/API/画像待ち別の同条件比較は計測経路が利用できる分を進める。HTTP応答だけでTTI合格にしない。

## 外部依存・真の判断待ち

|対象|待ちの範囲・再開条件|
|---|---|
|P02〜P04|ドメイン取得・関連実装完了後の外部設定/同一候補統合受入。無料BOX/通常供給の独立検査を止めない|
|P06|別スレッド管理。G2から本番変更しない|
|72名称画像・素材・背景|承認照合後に残る未決だけ候補付きで判断。候補制作はEXEC03|
|daily10/overkill|具体正本と未決行の対照後に判断。EXEC04の根拠に従う|
|旧BOX/旧資産・有償物資|件数/ID/由来の対応と方針確定後に限定変換。単なる旧ID検出で新在庫へ移さない。P02の有償lot/期限は無料正式BOXと別|

## 正式producer→在庫の接続表

|供給元|実装経路/保存先|検査と未受入|
|---|---|---|
|正式65面|questVictoryRewards→grantReward→commit。cash、growthInventory.expItems、souls、questTicketGrants、初回character|749報酬行の到達先PASS。ticket抽選は3ID候補を検査し確率/抽選回数の受入を主張しない。旧rareRewards配列は現行formal settlementでは不使用|
|通常183＋侵攻供給4任務|claim_mission→getClaimableMission→grantReward→claimedMissionIds→commit|495行PASS（NM171の追加侵攻令を含む）。二重/CAS/全任務本体は既存検証＋親の今後の実操作へ。日次未決10は有効化しない|
|正式共闘|FORMAL_ENCOUNTER_MASTERS→raid victory/raid_claim→grantReward→room/state commit|930行PASS。新規開始snapshot・再送・実UIは別。旧GvG/旧raid SQLはこの経路でない|
|正式侵攻5城|createFormalInvasionMaster→各12Lv撃破/勝利→grantReward→commit|263行PASS。抽選敵固定seedで報酬表を抽出。超過damage算入は変更しない|
|累計30ログボ|loginBonusForDay→正式ログボSQLのjsonb state更新＋wallet|78行をdomain上の同報酬から検査。SQL実経路/台帳は既存親記録でday1成立、30日SQL境界は既存rollback。今回domain PASSをSQL全件証明にしない|
|商店交換|applyShopExchange→game04_commit_shop_exchange|既存接続。薬energyDrinks、侵攻令materials.unlock、汎用魂growthInventory.genericSouls、銭wallet。交換最低10→5を正本どおり維持|
|正式無償BOX19ID|明示source/version/funding→claim_present→game04_apply_formal_present|既存19ID rollback・実3種成立。今回追加変換なし。正式metadataなし旧BOXは既存経路で保持|
|VIP|支払確定→game04_grant_vip→schedule→無償輝石wallet|既存DB境界のみ。P02の決済から統合未受入|
|課金pack|billing order/lot/期限→grant_present_payload等|P02側との統合対象。無料正式BOXに自動転用しない|
|旧useStory/GvG/運営旧SQL|legacy presents/user_items等|現行G2公開導線の正式producerではない。G4/履歴/運用との区別を保ち、無断source metadata追記禁止。稼働DB定義と呼出有無が未取得なら接続完了とはしない|

検査ファイル: `scripts/verify_game04_g2_reward_routes.cjs`。結果: `reward-routes-result.json`。入力を変更せず、growth報酬は旧materialsへ混入しないことも検査。正式数量・確率の正本全件再照合ではなく、現行採用マスターからの在庫接続検査である。固有魂選択/汎用魂はこれらproducer集合に出現せず、19ID BOX境界で追跡する。ログボ輝石は別walletなのでこのgrantReward行数に含めない。

## 共通Dialogの独立review

対象: CanonicalDialog.tsx/.css、ShopExchangePanel.tsx、ShopTab.css、および `verify_g2_canonical_pending.cjs`。独立実行PASS。

- 同じactionを即時2回呼んでもPromise pending中は1回。本文inertと閉じる無効、背面閉じ抑止、reject後の再操作復帰をelement-tree試験で確認。
- aria-busyはpending/loadingへ追従。入力自身disabledもbusyへ追従し、交換値の編集を送信中に制限。
- bodyのoverflow-y:auto/min-height:0、footer別領域は維持。min-width:0とgrid minmax(0,1fr)は折返し・CTA幅配分を是正し、内容隠蔽を追加しない。
- 変更によるblocking issueなし。実ブラウザのinert/キーボード/低高さスクロール、全利用画面は別未受入。既存loading時のclose許可は変更していない。

## R3UI04 法務本文リンクの復帰条件・独立review追補

7ページ（rights / age-rating / payments / cookies / terms / privacy / tokusho）とSupportContactの差分を確認。`verify_g2_legal_return_links.cjs`を独立実行してPASS（設定起点/直アクセスの14組＋窓口fallback2組）。原因は本文リンクだけが`?from=settings`を落とし、法務ページの閉じる導線が直アクセス扱いに変わること。設定起点でのみqueryとreplaceを伝播し、直アクセスの動作は維持する限定修正として妥当。

- SettingsPanelのarmLegalSettingsReturn、LegalPageのreturn query、legalSettingsReturnの同UID・5分有効期限・不正marker破棄、GameContextの認証済みprofile照合は変更なし。これら4ファイルのgit差分なしを確認。
- query自体は認証権限ではなく表示経路。復帰時は引き続きhas_profileと同UID markerが必要。API/DB/認証条件の緩和なし。
- supportEmail設定済みのmailtoは既存どおり。未設定の問い合わせページfallbackだけに設定起点を伝播。
- コード/局所確認PASS、blocking issueなし。本体の設定→本文の別法務ページ→閉じる→同ゲーム設定の再表示は親の最新Preview QAへ。5分を超える閲覧/marker失効時は既存のタイトル復帰条件が残る。今回それを新たに合格扱い・変更しない。

### R3UI04 メニュー直行入口の補足

RedesignShellの「お問い合わせ」も確認。既存session.user.idでarmLegalSettingsReturnを呼び`/legal/contact?from=settings`へ遷移する。SettingsPanelと同じ復帰方式を再利用し、独自認証判定を追加しない。UIDなしではmarkerを作らず、復帰時の既存profile/markerチェックを迂回しない。

## R3QA01 Q01観測経路の独立review

対象: next.config.ts、redesignQaTelemetry.ts、redesignPerformance.ts、CharacterImageReadiness.ts、HomeView.tsx、questAssets.ts、QA viewport page/TimingViewport.tsx、verify_g2_qa_timing.cjs。

- build許可フラグはVERCEL_ENV=productionでfalse。サーバーQAページもproduction/QA未許可を404。client送信も許可flag/QAflag/APP_ENVを確認し、通常トップレベルではparent===windowにより無送信。
- postMessageのtargetはlocation.origin。受信側はorigin一致＋自身のiframe.contentWindow一致＋shape検査が必要。外部origin/別windowは受け付けない。最大100件、timeOrigin変更時の旧計測破棄を実装。
- messageは固定scope・件数・数値時刻・結果だけへ明示投影。request payload、userId、resource URLを含めない。通常本体には計測panelを出さない。
- requestは認証・通信・応答検査を含むinvoke全体。画像は既存preloadAssetのload/decodeを含むグループ待機であり、画像転送時間・decode単独時間とは違う。失敗時は最初のrejectまで、非表示化/離脱でcancelされた試行は送信しない。
- Navigation/FCPはブラウザ指標を表示。TTIは「未計測」と明示。画像グループ完了を操作可能時刻に置換しない。battle画像の観測は今回のhome/growth/quest scopeに含めない。
- 初回レビューでpaints:[null]のshape検査がthrowすることを指摘。担当へ非null判定と通常トップレベル無送信・未知scope検査追加を依頼。修正確認結果は次段へ追記する。

R3QA01再確認: 非null object guard修正後に独立再実行PASS。paints:[null]はthrowせずfalse、未知scopeはotherへ投影、通常トップレベルは無送信。origin/source拒否・payload/URL/ID非投影・100件・reload消去・production guard・画像count/outcomeの局所試験が全件通過。blocking issueなし。最新配信でpanelに実測が届くこと、各待機の時間比較、実機性能は親の本体検証で確定する。

## R3UI05 設定サマリーと5196222a QAflag修正・独立確認

R3UI05: SettingsPanelの実構造はdl.settings-summary > div > dt/dd。共有EditableSettingSectionのdl 2列ルールが外側にも適用され、内側2列と重なる原因を確認した。限定selectorで外側を常時1列、412px以下は各組のラベル/値も1列に変更。既存ddのoverflow-wrap:anywhereに加え左寄せ・改行保持、min-width:0で長い名前/自己紹介を必要情報の削除なしに表示する。編集入力・保存処理・スクロール所有者は変更なし。source review PASS、実幅360/375/390と低高さの表示・CTA到達は親の再検証へ。

QAflag: 前回PreviewのQA route404に対し、専用G2 Previewだけ未設定flagの既定値をtrueにする修正を独立確認。VERCEL_ENV=previewかつcommit ref=work/game04-g2-20260924の完全一致が必要。明示false/空/未知値はtrueへ上書きしない。他枝は明示trueのみ。VERCEL_ENV productionまたはAPP_ENV productionなら明示trueでも常にfalse。ENABLE_QA_TOOLSとMETRICS_ALLOWEDが同じeffective値を使う。

`verify_g2_qa_timing.cjs`再実行PASS。実next.configをtranspileし、専用枝未設定・明示false・Production+true・APP_ENV production・他枝未設定・他枝明示true・ローカル未設定の7環境を独立実行した。通常本体無送信・shape/source/origin・cap100等の前回追加試験もPASS。フラグの既定は承認済み専用開発Previewに限定され、Productionや共有alias設定を変更しない。実配信で404が解消したかは親の応答確認結果で確定する。

## フッターbusy表示の独立確認

親の観測訂正を反映: 結果Dialogが残った状態で背景のフッターが操作できないことは正常であり、その挙動を不具合修正の根拠にしない。今回の限定差分は、既存navigateがbusy/lock中に遷移を拒否する一方、5つのフッターボタンがenabled表示だった不一致だけを是正する。

RedesignAppの既存busyをRedesignShell.navigationBusyへ渡し、nav aria-busyと全5button.disabledへ反映。既存navigateのbusy || lock.currentチェックは維持。mutationの通信/排他/結果Dialog/報酬処理を変更せず、idle時はdisabled解除、既存shell呼出側は省略時falseを維持する。`verify_g2_footer_busy.cjs`を独立実行してPASS（5buttonのbusy/idle両状態、parent接続、既存navigate排他確認）。blocking issueなし、統合可能。実表示の再確認は親の最終候補QAへ。

## 行動力103→98→100観測の切り分け（修正不要）

同じ専用QA `2b544996-e7f4-4e88-a5d2-b20f1f50b4b2`のみをread-only照合。上限超過103から再戦で5消費した後、結果文98と後続header100が異なる観測を調査した。Supabase skillを読み、稼働get_state/commit定義と本人request receipt・battleを確認。共有変更は実施しない。

|証拠|内容|
|---|---|
|開始request 4b07bab2-e8df-41df-812f-7988d7d58c11|2026-09-24 22:43:07.519807 UTC、version15、保存energy98|
|決着request 3b2328f8-5478-4095-992c-e94697d5da6f|22:43:08.782149 UTC、version16、保存energy98|
|決着playerGrowth|beforeLevel1→level1、EXP60、energy98、energyRecovered0。Lv回復ではない|
|稼働get_state|energy>=100ならanchor=now。上限超過中の数時間を古いanchorとして蓄積しない|
|親の可視計測原本|five-result-and-timing-519.txt、quest_battle362139→365905ms、末尾get_state1652674ms。約21分の実経過|

開始・決着receiptがともに98のため、当該戦闘の直後に古いanchorで100へ戻ったという仮説を支持しない。後続読込まで約21分経過しており、300秒ごとの自然回復で2回復して100へ到達できる。結果は決着時snapshot、headerは後続の現在値として整合する。この観測を確定不具合に数えず、数値/anchor/API/DBは修正しない。別の長時間停止・競合境界を今回の観測だけで全件合格にもしていない。
