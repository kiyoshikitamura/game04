# G2 子D UI品質・読込是正

基準: e62d3894b54ce70aede4a23a8fc2599c40b744da。親による統合前の変更記録。**統合Preview再検証未完。G2合格の根拠にはしない。**

## 適用根拠

- AGENTS.mdおよび GAME04_SCROLL_UI_AUTHORITY_2026-09-19.md: 本体rd-shell、Dialog最大約80dvh、内部スクロール、金色scrollbar、末尾CTA到達。
- 今回起票Q01: 再訪時の理由のない情報消失、画面とDialogのローダー重複、画像待ち直列化の解消。
- Q02: 長名・大残高・360/375/390px・390x568で情報とCTAを欠落させない。
- 本陣HOME_MOCK_REQUIREMENTS_FIX/ASSET_MAPPING、侵攻IMPLEMENTATION_HANDOFFは固定SHA GitHub取得で読了。画像自体の同幅比較は未実施。既存e62表示の意匠は保持し、承認モック比較済みとはしない。

## 修正台帳

|ID|画面/状態|Q/U|症状・原因|修正|検証・残件|
|---|---|---|---|---|---|
|D01|本陣/活動取得後|Q01/U05|profileFacesが全体画像待機キーに入り、顔の追加で人物が消え全CTAが無効になる|本陣必須画像と活動の顔画像を分離。活動顔は局所imgのまま|source確認済み。統合本体再確認待ち|
|D02|本陣/切替/出陣/再訪|Q01/U05|マウントごとにnew Image/decodeを作り成功済画像でも待機画面になる|CharacterImageReadiness成功cacheをHome/Questで共有。失敗は成功cacheに入れず再試行可能|担当コード型エラーなし。修正前後時間計測未完|
|D03|出陣ステージ詳細|Q01/U05|外側がenemy.image、内側が別の正式battle画像/cropを準備し、二重ローダー・余計な取得|外側から実BossDisplayの画像/cropを準備。成功結果を子が直接使用。待機中は外側に一つのstatusと再試行。画像失敗を完了扱いにしない|Eが基準Preview重複を観測。統合Preview待ち|
|D04|出撃準備/武将カード|Q01/U05|外側画像待機と各CharacterCardのloaderが重複。透過余白計測も再マウントごとに反復|useArtworkPreloadで画像とcropを一括準備し成功cacheを子へ共有。未読込中は出撃不可を維持|Eが基準Preview重複を観測。Raid再利用先も統合回帰対象|
|D05|共通CanonicalDialog/読込中|Q01/U05|loading propが確定ボタンを無効にしない|loading中のaction実行をrefガード＋disabled。閉じるは可能（読込失敗から退出可能）。pending中二重操作禁止を維持|呼出箇所のsource確認。統合回帰待ち|
|D06|共通Modal/表示中|Q04/U05|新ModalがdialogPresenceに未登録、Guide/mission/encounter promptが重なる可能性|CanonicalDialog同様に登録/cleanup|source確認。実機/統合確認未完|
|D07|Header/長い残高・名前|Q02/U05|nowrap資源行と縮まない名前のflex子で長い数値/名前が枠外へ|min-width:0、資源列minmax(0,1fr)、数値を省略せず改行、アイコンflex:none|CSS寸法対策のみ。360/375/390実測未完|
|D08|本陣/長い活動・名前|Q02/U05|flex本文min-widthがautoで長い文字列が他要素を押す|本文min-width:0/overflow-wrap、名前改行、行折返し|CSS対策のみ。実データ長文検証待ち|
|D09|共通Dialog/長い見出し・CTA|Q02/U05|長いタイトル/CTAの折返し条件が不足|見出しmin-width:0/overflow-wrap、本文/CTA折返し、Modal safe area余白|CSS対策のみ。低高さ/keyboard実機未確認|
|D10|出陣/報酬|Q03/U05|行動力の旧表記「体力回復」、侵攻令の旧「領土侵攻札」|正式表記へ変更|source確認。報酬数値・付与ロジック不変|

修正SHAは親が一括commit後に付与。上記の「source確認」は「統合版で再検証済み」とは異なる。

D11/Q05: 出陣報酬のxlargeが既定elseでsmall画像に誤割当される処理を解消。未割当XLは画像なし・正式名称/数量を保持し素材10点の未完に残す。準備詳細の正式SKD空画像srcはimgを生成せず、誤ったページ再要求を防ぐ。画像完備の合格にはしない。

## 画面・主要状態の網羅台帳（未確認を含む）

|対象|主要状態・操作|担当連携|本体/モバイル状況|
|---|---|---|---|
|本陣|初回、再訪、画像失敗、切替、保存、活動、全体、DM、遭遇|D/親|source点検・修正。360/375/390/低高さ未検証|
|Header/Footer|長名、大残高、行動力超過、safe area、メニュー、ページ切替|D|CSS是正。実機未確認|
|武将/編成/スキル/装備/育成|所持0/多数、選択、長名、LB、空枠、不足、保存復帰|A/D|A正式値修正。共有CharacterDisplays変更の回帰対象|
|出陣|エリア、ステージ、65面データ接続、ボスLv/HP/ATK/DEF、ヒント、報酬、準備、個別詳細、結果、次面|D/C|既存機能保持。loader是正。65面実踏破は未実施|
|バトル|通常/命中/BURST/HP/SP/状態/6Wave/再生操作/結果/復帰|C|C記録参照。Dから完成扱いしない|
|共闘/領土侵攻|一覧/詳細/準備/主催/結果/資格/消費/再送|C|PreparationModal/CharacterDisplays共通変更影響の回帰対象|
|任務/ログボ/BOX|件数、数量、空、受取、二重受取、周期|B|B記録参照。Dから完成扱いしない|
|商店/交換/VIP|商品、不足、制限、保存、期限、24h付与|B|B/親記録参照。P02未接続を完成扱いしない|
|設定|プロフィール/自己紹介/保存/エラー|親/E|基準でusers UPDATE権限エラーとエラー表示二重をE観測。親へ連絡済み|
|お知らせ/問い合わせ|一覧、本文、長文、リンク、送信・戻る|D/E|公開導線source存在。実送信/モバイル未確認|
|認証/再ログイン|入口、連携、成功/失敗、状態復帰|親/E|入口表示だけでは受入不可。P03境界あり|
|全Dialog|中央、本文スクロール、閉じる、固定CTA、長名/数量、キーボード|D/E|共通CSS点検。モバイル実機未確認|

## データ・素材・仮設定

- `ui-static-assets.json`: D所有画面の静的URL22参照を列挙。**ローカルに画像ファイルが復元されていないためlocalExists=false。これは配信欠損の証拠ではない。** 配信URLのGET成功/実描画を統合検証で別途確認する。
- SKD72はAの同一ID対応表で管理し二重計上しない。
- CharacterDisplaysの FORMAL_RARITY_BADGES がnullのままなのは既存未承認素材の状態。勝手に旧public/ui/rarityへ戻さない。新規採用判断が必要なら親へ集約。
- 「移行確認待ち」playerGrowth表示は旧資産移行問題に紐づくため文字だけ削除して確定扱いにしない。
- QA fixture・placeholderという単語の機械一致のみで公開不具合と判定しない。設定のQA provisionはQAフラグの確認対象。

## ローディング計測・確認限界

基準のEブラウザで開始後12秒時点の待機、出陣/準備の複数statusを観測。厳密なTTI/画像/API別計時ではない。修正前後の同端末・同回線・同キャッシュ比較は未実施で、速くなったとは断定しない。

親/Eのブラウザは現時点1363x936の表示でゲーム幅560。viewport変更手段が未提供のため、360/375/390と390x568および実端末/iOSキーボードは未確認。CSS寸法点検を実機証拠と呼ばない。

共通初回/再訪/保存の時間閾値は手元正本に未定義。推奨の判断候補: キャッシュ済同画面再訪は画像準備の追加待機0、初回/APIの目標は端末・回線条件と基準計測値を揃えて決定する。新たな秒数を承認済み規約として実装しない。

## 検証

`npm run typecheck`: D変更の型エラーなし。全体は復元欠落 `supabase/functions/resolve-battle/engine.ts` への既存importによりTS2307で終了（親へ連絡済み）。build/typecheckだけで本体受入は代替しない。

担当8ファイルESLint: 0 errors / 34 warnings（主に既存img要素、依存配列警告）。React best-practicesで並列取得、成功cache、effects cleanup、busy/ref二重操作防止を確認。
