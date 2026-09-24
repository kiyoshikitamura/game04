# GAME04 G2 画面品質・差分台帳

## 新スレッド継続版の追補（以下の旧候補記載より優先）

現行コード `49177788f9965e72291fb1e27be959b3e544793e` / Draft PR #30 / Branch `work/game04-g2-20260924`。継承点79669373から30f5候補、後続f45→7d→491へ進行。491 READY、最終本体受入はブラウザ停止で未完。API v23/hash据置、開発DB追加 `20260924183511 game04_g2_kpi_supply`。Preview https://game04-nb14xcwec-kiyoshi-kitamura.vercel.app / `dpl_BH2b8dj7GSAUCDKbfeRwZKtB1hCe`。

本体再検証は491のブラウザ停止で終了し、取得済み証拠のみ記録。以下の局所PASSは配信本体・全画面・実端末PASSではない。旧記録は履歴として保持し、旧候補を同一候補合格へ合算しない。

|ID|画面/状態・Q/U|根拠/原因と修正|担当・修正候補|独立/DB確認|配信後の残件|
|---|---|---|---|---|---|
|A-CONT-01|編成おまかせ/不明master Q03/U01/U02|既存正式master/旧資産保持契約。不明ID候補化でvalidateDeck失敗→解決可能masterのみ自動選択。所持原本保持|A/30f5→f45含む|E専用回帰・育成PASS、正式SKD/旧50候補維持|本体おまかせ→保存/復帰|
|R2BATTLE01|戦闘画像失敗 Q01/U04/U06|失敗時retryだけで離脱不能→同result/keyのerror時に再生終了。二重コール防止、再戦/再付与なし|C/30f5→f45含む|E review、既存6Wave/開始SP/cache/開始snapshot回帰PASS|本体error/timeout→終了、結果・共闘復帰|
|E01|戦闘失敗CTA Q04/U04|QuestとraidでonComplete遷移先が異なるため「結果へ進む」→共通「再生を終了する」|C/30f5→f45含む|E是正再読済。コード指摘クローズ|実表示未受入|
|R2UI01|本陣活動 Q01/U05|プロフィール直列待機/救援author更新でfeed再取得→別effect化・依存分離|D/30f5→f45含む|E抽出effect成功/独立取得PASS|profile遅延時の本体先行表示/測定|
|R2UI02|本陣活動error/空 Q01/Q04/U05|失敗で一覧消失/throw/再試行なし→既存保持、error/empty/loading分離|D/30f5→f45含む|E失敗/throw/cleanup後応答破棄PASS|本陣/交流Dialogのエラー・再読込操作|
|R2UI03|出陣報酬/武将詳細Dialog Q02/U05|grid/flex最小幅→minmax(0,...)/min-width:0/折返し|D/30f5→f45含む|CSS read、必要情報をhiddenで隠さない|360/375/390・低高さの長名/大数量/CTA|
|R2UI04/E02|本陣活動未応答 Q01/U05|E指摘。未settle→既存コミュニティread上限12秒、abort/error復帰、後着破棄|D/30f5→f45含む|E抽出effect timeout/abort/再試行/後着抑止PASS。コード指摘クローズ|配信実時間/CTA再試行。全API性能基準とはしない|
|R2UI05|お知らせ未応答 Q01/U05/U10|親指摘。news readへ12秒abort/error復帰、既存一覧/後着破棄を維持。BOX mutation排他は無変更|D/後続f45|E抽出effect成功/失敗/throw/timeout/再試行空成功/cleanup PASS|配信news timeout/retry、空/既存一覧保持|
|R2KPI01|ログボ/BOX/VIP計測 U10/C09|正式producer receipt一致のログボ今後履歴、新旧付与行から供給集計。過去推測復元なし、QA/未結合分離|B/30f5→f45含む、DB20260924183511|E SQL/route review、matcher/認証局所PASS。親DB全ASSERT/rollback確認|本体供給件数→管理者HTTP/管理画面。購入売上/全計測合格ではない|

対象実行時hashと生出力は `../g2-20260925/independent/integration-targeted-results.json`、レビューは同dir `INTEGRATION_CODE_REVIEW.md`。抽出effectは実ソース処理を試験用setter/transport/timerで実行する局所検査。React DOM/認証API/DB保存/実機は代替しない。

### 継続本体QAの追補台帳（親実行）

cloud Chrome CSS iframe390×568、専用新規QA `2b544996-e7f4-4e88-a5d2-b20f1f50b4b2`。実機ではない。実証は30f5/f45、育成結果追加は7d/375×844。491全体受入へ合算しない。画像DOM原本は親が `qa-continuation/` へ保存済み、Git記録commit待ち。

|ID|画面/状態・分類|観測・DB照合|判定/残件|
|---|---|---|---|
|LIVE-CONT-01|BOX3種受取 U02/U07|30f5で正式fixture bulk受取、version2→5。CHAR_EXP_M3/薬1/selectorN1が一致|3種本体接続成立。全19ID/producerは未完|
|LIVE-CONT-02|武将Lv育成/再読込 U02/U11|30f5で中1個、Lv1→8 EXP1000/銭12600→11720/中3→2/version6。f45再読込一致|BOX→育成→保存復帰成立。最新7d/全境界未確認|
|LIVE-CONT-03|薬使用/超過 U03/U08|f45確認52→102、送信後103/100・薬1→0/version7/DB vitality103 cash11720|超過保持成立。自然回復の時差があり直前53未取得。厳密な52→102実更新証拠としない|
|LIVE-CONT-04|出陣1-1/停止/再開/2倍速/結果 U04/U11|f45で勝利、version9/mikawa-1 clear/playerExp20/cash12220/vitality103/武将小1・装備小1。結果表示一致|通常1戦経路成立。全状態/6Wave/最新候補は未確認|
|LIVE-CONT-05|news空 Q01/Q04/U10|f45本体0件表示|空のみ成立。失敗/timeout/retryは局所試験|
|LIVE-CONT-06|設定→問い合わせ→戻り U10|f45問い合わせ表示まで成立、閉じた後runtime timeout|本体復帰未確認を維持。アプリ原因/ツール原因を断定しない|
|LIVE-CONT-07|低高さバトル Q02/U04|f45で立絵が大きく味方の常時情報が画面外へ押し出される。491で1〜3敵arena/portrait高さを調整|C修正・E静的PASS。親491/360×568はRuntime.evaluate/Page.enable timeoutで停止、修正後表示未確認|
|R2UI06|育成Dialog送信中 Q01/U02|7dで全12Modalにpending/inert/closeDisabled接続。E局所/コードreview PASS|7d本体pending/inert/Escape/scroll未確認|
|R2UI07|育成結果 Q04/U02|7dで右上×を除去・背面/Escape終了禁止、下部閉じる保持。E局所PASS。親375×844で結果上×なし/下閉じる→詳細を実確認|結果表示/下部閉じる成立。実Escapeは未検証|
|LIVE-CONT-08|7d育成追加 U02/U11|EXP1000→1100、小1→0、Lv8/銭12220据置、version10。growth-375-result.jpg目視|小EXP使用・途中EXP非重複課金の今回例/結果復帰成立。全境界ではない|
|LIVE-CONT-09|供給SQL照合 U10/C09|専用QA login1/1、CHAR_EXP_M1/3、薬1/1、selectorN1/1（event/quantity）、全development/excluded|本体受取/ログボ件数一致。管理者HTTP/全producer/全計測未完|
|R2BATTLE02|低高さcutin Q02/U04|491でBURST bottom42px/発動者8px、skill34pxへ調整。文字/targets/5列保持、正式65面最大敵3の静的PASS|実回転/長名/人物crop/BURST/多状態未確認。旧4〜6敵は既存高さ維持|
|R2NAME|名称表示 Q03/U05|7d名称関連修正、独立局所PASSの親報告|7d本体未確認。正式72名称採用の決定とは別|

BOX/素材使用の従来未完はこのQA・3種・30f5/f45の範囲で更新する。外部P依存、最新候補横断、画像失敗回復、低高さ戦闘修正、問い合わせ復帰、実機は未完。

### 最終491の実表示阻害

新規360×568 tabのDOMでRuntime.evaluate timeout、既存375幅tab→390×568切替でもPage.enable timeout。親は復旧の反復を終了。491低高さ修正後の実画像はなく、修正前battleと7d育成実証までの取得済み原本のみ保存する。未取得画像や491表示を合格にしない。コード配信READY/局所静的PASSと本体受入未完を分離する。

### 全画面/状態の未完追跡

`../g2-20260925/independent/U10_U11_COVERAGE_REVIEW.md` に本陣、武将/編成/育成、出陣、バトル、共闘、侵攻、任務、ログボ、BOX、商店/VIP、設定/news/法務、認証、共通Chrome/Dialogの既存証拠と具体不足を対応づけた。BOX3種→中素材育成→保存/再読込は上記30f5/f45で成立。最新候補の全群、設定/問い合わせ復帰、新規侵攻snapshot、画像失敗復帰、全群計測照合は未受入。

Q05/Q06の真の不足は72名称画像/素材10/出陣10背景/レア度表示採用照合、旧資産/供給方針、daily10/過剰damage未決。採用済み侵攻5城共通背景、共闘17素材、主催仮FIXは再判断不要。P02〜P04別候補#31の外部準備・統合受入、P06ログイン待ちは依存として保持。

未完理由は区別する。**承認不足**: 72名称画像/素材/背景/レア度採用、旧資産、daily10/overkill。**外部依存**: P02購入/有償期限、P03外部認証、P04運用値と#31統合。**未検証**: 491全状態・画像失敗/問い合わせ復帰/処理中Dialog/供給全件/共闘侵攻再送/管理者HTTP・全計測。**環境・測定不足**: 実機Safari/キーボード・条件別性能。いずれもG2未完のまま保持し、後工程名だけを付けて除外しない。

旧台帳のU00原本保存障害は回収済み分を現在の欠落へ戻さず、取得不能02/07は明記を保持。Q01の同条件性能比較、Q02全幅/全状態/実機、U11同一候補の横断受入が未完のため、G2は未完・受入不可。

---

## 再開追補（以前の未保存・分類記載より優先）

最終追加コード182a2a35 / API v23。画像・DOM原本の保存障害はe960238で解消。新候補の本体再検証は通信/ブラウザ停止により未完。

|ID|対象/Q/U|原因と修正|独立確認・結果|
|---|---|---|---|
|RUI01|BOX長名/数量 Q02/U07|nowrapを解除、CTA幅保持|実装/型確認済み、配信後未確認|
|RUI02|news Q01/Q04/U10|取得失敗を0件扱い→error/retry/既存一覧保持|コード独立確認、配信後未確認|
|RUI03|法務 Q02/U05|scrollbarを共通金へ|本体戻りは別RUI06|
|RUI04|BOX/受取通貨 Q03|CASH/DIAMOND→銭/輝石、新正式素材ID表示|実装済み|
|RUI06|問い合わせ戻り U10|旧tutorial完了要求を撤去、sameUID/has_profile復帰|747で再現→修正、実再確認未完|
|RUI07|タイトル Q03/Q05|0e12で旧TRIBE画像。既存creative role表のKV/logoへ接続|画像上部のみ確認、最終表示未完|
|RLOAD01|起動 Q01|月額read不要直列→並列|型確認、性能実測未完|
|RLOAD02|武将画像 Q01/Q02|待機無期限→共通12秒/失敗retry・Footer離脱|747独立再現→修正、配信後未確認|
|RBATTLE01|再生HP U04/U06|確定後現在値が冒頭表示→開始snapshot保存/表示|局所/6Wave/開始SP回帰PASS、本体未完|
|RSUPPLY01|BOX U02/U07|旧在庫のみ付与→明示正式無償版19IDを新stateへ|DB19対応/重複/失敗等PASS、本体fixture未受取|
|RV01|BOX不正JSON Q06/U07|親存在のみ検査→全親object/leaf型/書込一致|独立発見→親修正→rollback PASS|
|RV02|BOX不正版 Q06/U07|SQL NULLで<>を通過→IS DISTINCT FROM、正式source版欠落も拒否|独立発見→親修正→17境界PASS|
|RKPI01|保存計測 U10/C09|新battle/成功receiptを既存管理者基盤へ|service限定/開発/QA/再送PASS、HTTP全経路未完|
|RASSET01|侵攻背景 Q05/Q06|前回台帳が再承認要求→9/24明示承認を継承|5城共通背景は採用済み。専用5枚不足から除外|

修正SHA182aは0e12の追加修正を含む。初期修正点の自己テストと別担当の本体再検証を分ける。再開追加7画像/DOMはqa-resumeへ保存。存在しない02/07原本は証拠に含めない。最新API/DB/配信対応は統合受入結果の再開追補が正本。

---

環境切断時保全版。全画面点検済みではない。詳細生証拠の保存状況は統合受入結果を参照。
コード最終7476566 / API v21。修正済と統合再検証済を区別する。

|ID|画面/状態|Q/U|症状・原因と修正|担当|検証版・結果|残件|
|---|---|---|---|---|---|---|
|G2-01|起動/再訪|Q01/U10|重複取得・直列依存を共通化/並列化、古い応答防止|親/F|起動・保存代表成立|性能改善未立証|
|G2-02|Header/Footer/Dialog|Q02/U05|折返し・safe area・内側scroll・lock修正|D|代表幅360/375/390低高さ確認|全画面/実機未完|
|G2-03|薬使用|Q03/U03/U08|APIのみで本体使用CTA欠落。確認Dialog/排他/残量連携追加|B/親|a0f92 F独立PASS、99→149保存再読込|最終候補全体回帰未完|
|G2-04|侵攻報酬|Q04/U06|pending実明細と現在Lv予告が混同。分離表示|C/親|a0f92 F表示fixture PASS|実受取はda48440別検証|
|G2-05|装備空状態|Q02/Q04/U05|空理由・分解ボタン不適切。未所持/絞込/欠損を分離|D|202a F本体PASS|他全空状態未完|
|G2-06|スキル画像欠損|Q05/U01|空src抑制4箇所|D|修正済|正式画像採用不足は残る|
|G2-07|戦闘説明|Q04/U04|開発注記除去、意味のある条件/SP/対象保持|C|202a F実出陣詳細PASS|72全効果未完|
|G2-08|条件未達重複|Q04/U04|同一理由のみ重複抑制|C|a0f92修正済|当該最終独立確認未完|
|G2-09|任務用語|Q03/Q04/U07|キャラ→武将表示統一、ID/条件は保持|B|a0f92修正済|全対象再確認未完|
|G2-10|報酬名|Q03/Q04/U07|魂の武将名・召喚券種別を明確化|親|202a Fログボ/任務PASS|day30本体実受取ではない|
|G2-11|旧未対応スキル|Q06/U01|内部未FIX説明を利用不能説明へ。内部未決は保持|C|747修正・typecheck、起動確認|最終文言未確認|
|G2-12|共闘共有HP|Q04/U04/U06|現在共有HPとLvを明記、quest/raid表示分離|C|a0f92修正済|開始snapshot同期未完|
|G2-13|編成/正式スキル|Q03/U01|72×11LB値、旧資産互換カタログ|A|da48440 SKD071 LB/編成/保存PASS|72正式名称画像/効果全受入未完|
|G2-14|育成|Q03/U02|累計銭差分/EXP繰越/失敗非消費|A|domain検査+da48440実Lv3保存PASS|旧資産方針|
|G2-15|交換保存|Q03/U08|現行wallet/CAS/無料優先/再送保護|B/親|DB rollback+本体交換PASS|有償期限接続|
|G2-16|ログボ|Q03/U07|30累計複数報酬receipt/同日二重防止|B/親|DB境界+本体day1PASS|自然30日ではない|
|G2-17|VIP|Q03/U09|30回時刻配信/再購入防止/cron|B/親|DB12ケース/cron成功|外部決済必須未完|
|G2-18|プロフィール|Q03/U10|auth.uid本人限定保存・上限・既存title保持|F/親|実保存/DB一致|外部連携別|
|G2-19|画像/背景|Q05/U05|採用済資産参照点検/対応表|D/A|台帳化|素材10、背景、72画像等未完|
|G2-20|daily10|Q06/U07|未承認ルールを公開しない|B|disabled維持|3選択判断|
|G2-21|侵攻damage算入|Q06/U06|過剰damageがsharedHPへ加算される|C/親|実戦/計算経路調査|実HP方式推奨、承認待ち|
|G2-22|計測|Q01/U10|GAME03 KPI転用方針を継承|F/親|契約整理|実装/QA除外/復帰購入検証|

## 画面/状態範囲
本陣、武将、編成、スキル、装備、育成、出陣一覧/準備、戦闘/結果、共闘/侵攻一覧・主催・報酬、任務、ログボ、プレゼント、商店/交換/VIP、設定/プロフィール/お知らせ/問い合わせ、認証復帰、Header/Footer/Dialog、loading/error/emptyが対象。
直接本体確認の厚い範囲: 本陣、編成、通常1-1、育成、任務一覧/受取、ログボday1/将来予定、装備空、商店交換/薬、侵攻開催/個人戦/資格/実報酬/復帰、プロフィール。
網羅未完: 65全出陣状態、全武将/スキル効果、全Dialog・長名/大数量/不足/満杯・キーボード、プレゼント/公開運用画面全経路、外部認証/決済、実機。未列挙の状態を検証済み扱いにしない。
基準はRepository承認モック/共通ルール/正式正本。新しい見た目や性能目標を承認済み扱いにしない。
