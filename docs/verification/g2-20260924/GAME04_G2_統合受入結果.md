# GAME04 G2 統合受入結果

## 再開後の現行結果（以前の記載より優先）

G2判定は **未完・受入不可**。実行環境が復旧したため、原本保全・追加実装・開発DB/API反映・独立レビューを再開した。下段の切断時報告は履歴として保持する。

- 最終追加コード: 182a2a35d4f599f60103e4b8cc64eee6b463c7c1（Draft PR #30、main未マージ）。
- 当該配信: dpl_CdJhdXUce8YEybEeAjcBshUrgsBJ。GitHub配信記録でREADY確認。最終不変URLと実表示はブラウザ停止により未取得。
- 一つ前の候補0e12b62dae1fa50168e6b9fc6aa2af1368b3a32eはREADY、https://game04-g8sktl9yj-kiyoshi-kitamura.vercel.app / dpl_6eV43HvatddiaWxbH7kBUwGvAUxM。最終追加コードと同一ではない。
- 主API: ACTIVE v23 / verify_jwt=true / hash 1767241b8845188e8c8697d891c5ba06f495e2c142fef067cb987e4f14c18363。v22の成功transaction計測を保持し、新規侵攻の開始HP保存のみ追加。GAME04開発lrgyllgzcdcphlbmkkncのみ。
- 追加DB差分: 20260924164519 game04_g2_kpi_gameplay、20260924164558 game04_g2_formal_present_inventory、20260924165049 game04_g2_kpi_dedicated_receipts、20260924170339 game04_g2_formal_present_structure、20260924170618 game04_g2_formal_present_version。

### 今回閉じた作業と残る本体受入

|対象|追加実装・確認|受入上の限界|
|---|---|---|
|証拠保全/U00|切断前qa-e/qa-f-final画像・DOM・SQL原本をe960238へ保存。再開後の7画像/DOM/独立結果も182aへ保存|欠落02/07原本は各記録で明示、取得済み扱いにしない|
|BOX/U02/U07|明示正式版・無償sourceの新BOX19IDを新在庫へ原子的接続。旧BOX/残高は換算なし。独立レビューで構造/版nullの2件を修正|有償lot/期限接続は別。既存producer全件接続と本体受取→使用→保存は未完|
|BOX境界|19ID/二重/旧在庫不変/CAS/bulk失敗/期限/別userのrollback PASS。独立17 malformedケースも拒否・未受取・state/version保持PASS|SQL検査を本体合格に読み替えない|
|Q02/Q04|BOX長名/数量折返し、news失敗と0件の分離/再試行、法務scrollbar、通貨名修正|新候補の全実表示再検証未完|
|設定復帰/U10|747で問い合わせ→タイトルへ戻る不具合を独立再現。旧tutorial条件を同UID/has_profileの復帰へ修正|認証投影は維持。新候補での実復帰未確認|
|画像待ち/Q01|747で画像待ち継続を独立再現。既存12秒loaderへ共通化、失敗時inline再試行/他画面離脱、月額read並列化|時間改善/TTI/API/画像待ちの実測未完。旧2034→2030等を改善証拠にしない|
|計測/U10/C09|新battle保存行＋成功receipt、JST・開発分離・時点QA除外・管理者routeを接続。shop/host同transaction receipt・再送1件PASS|管理者HTTP/管理画面、BOX/logbo/VIP/購入/復帰等の全計測未完|
|QA除外|既知4QAだけ作成時点から分類。188戦はexcluded8/included180、各started/settled同数|180を正式通常実績とは認定しない。未分類QA調査が必要。全件development|
|開始HP/U04/U06|新規raid input/resultへ開始HP/Lv保存、再生は開始値表示。既存記録は明示current fallback。6Wave/敵SP/計算不変回帰PASS|本体新規raid→保存/表示/結果の独立確認未完|
|旧タイトル/Q03|0e12でTRIBE NEON画像残存を独立発見。既存GAME04 role表のcreative/branding title/logoへ参照とBOOT manifestを一致|KV上部のみ画像目視。最終全体/切抜き/起動再検証未完|
|背景/Q05/Q06|9/24承認記録から侵攻5城共通背景の採用を再確認|5城画像共用の再承認・専用5城新規必須という前回残件を撤回。出陣10/素材10/SKD名称画像等は残る|

### 現在の実接続阻害とQA状態

0e12の本体rootでTAPは動作したが、新規開始はsignInAnonymouslyのFailed to fetchで停止。旧747の既存QAへ切り替える代替もnavigateが70秒超未完。最後のVercel画面は23秒timeout。同失敗の反復を中止。アプリ/通信どちらが原因か断定しない。外部認証設定を無断変更していない。

専用QA G2QA再検 / 4c888ed3-283e-4857-a596-4f4316efab26へ、受取経路確認用の正式BOX CHAR_EXP_M×3 / ENERGY_DRINK×1 / SOUL_SELECTOR_N×1を作成。source GAME04_QA / fixture G2_BOX_RESUME_20260924、期限7日。3件ともDBでUNCLAIMEDを確認し、本体claimは未実施。直接在庫付与・自然進行・G4受入ではない。

残る必須項目は、修正版本体再検証、全画面/状態・実機・性能、正式SKD名称画像・素材・出陣背景対応、旧資産方針、daily10と侵攻過剰damage算入判断、P02外部決済/P03連携/P04運用値、計測全経路。採用済み侵攻背景/主催仮FIX/P05方針の再承認は不要。

詳細: RESUME_INTEGRATION.md、resume-ui.md、resume-loading.md、resume-assets.md、resume-battle-snapshot.md、resume-supply/、U10_KPI_GAMEPLAY_INTEGRATION.md、qa-resume/。テストコード/SQL/証拠をRepositoryへ保存。Production・GAME03・main・共有alias変更なし。

---

記録日: 2026-09-24。判定: **G2未完・受入不可**。これは実行環境切断時の保全版であり、最終合格報告ではない。子担当の実装と独立検証を実施したが、同一最終候補の全対象受入は完了していない。

## 版対応
- G1基準: e62d3894b54ce70aede4a23a8fc2599c40b744da
- 作業branch: work/game04-g2-20260924 / Draft PR #30（main未マージ）
- 最終コード: 7476566f945708a8e752f71d4d6b90c23f3b937a
- 不変Preview: https://game04-61zouhpxv-kiyoshi-kitamura.vercel.app
- Deployment: dpl_DEZcbQvd5mDTx8KEyMGQWgRFs43b
- GAME04開発DB: game04-dev-clean / lrgyllgzcdcphlbmkknc
- game04-redesign-api: ACTIVE v21 / verify_jwt=true / hash d3599cf9bfede3850553f143bd9df830ab99fc92a19cab1309fcba1f56b5eae0
- resolve-battle v2変更なし。
- 本記録を加えるコミットはコード変更なし。最終コードの配信と記録保存コミットを区別する。

実接続の主検証はda48440a8291446cc97af9b73c298965a9b01fc6 / https://game04-j0kj794fu-kiyoshi-kitamura.vercel.app / dpl_GQF7BABt565jwY3vW7NX8RqmQjBy / API v21。
表示検証は202a8931de8b3419aa1aeff6046e3687efbfb562、薬・報酬明細はa0f92d99fc8ebb46dc39bdfa22b56e8710d22269。
747の最終差分は旧未対応スキルの利用不能説明3ファイル。配信メタデータと起動画面確認済み、当該文言の最終ブラウザ確認は環境切断で未完。

## U単位
|単位|実施・確認|残件と判定|
|---|---|---|
|U00|G1から専用枝、v19の本陣保存・初期3枠維持。API差分をv21に統合|最終画像証拠のGit保全未完|
|U01|正式72ID、LB0〜10計792行、旧50を含む122カタログ検査。SKD071を専用QAへ付与し実LB・編成・出陣・保存照合|名称・画像採用、旧50正式値・供給方針等未解決。72全効果の実戦受入ではない|
|U02|育成累計差分・途中EXP・失敗非消費検査。実育成Lv1→3/EXP100と再読込|正式素材不足、旧資産契約未決。換算・旧資産削除なし|
|U03|100上限/300秒設定、薬+50、under-cap制限、超過保持。実99→149/薬1→0/再読込・DB一致|Lv回復等全境界の本体網羅は未完|
|U04|再生停止・速度2・通常出陣勝利・報酬保存。条件説明、battleKind、現在共有HPのLv表示修正|全状態/6Wave等の統合回帰網羅、開始時共有HPと再生の同期が未完|
|U05|共通スクロール/折返し/ローダー/空状態/文言修正、代表幅・低高さ確認|全画面主要状態・承認モック全比較・実機・画像不足未完|
|U06|自身主催侵攻→個人戦→敗北/勝利→Lv進行→資格→実報酬受取→保存確認|過剰ダメージ算入の仕様判断、再送/復帰等全境界未完|
|U07|通常183+侵攻4=187任務、受取/保存。正式30ログボ・複数報酬・同日重複防止|daily10は3判断待ちで非公開。抽選実装はG3|
|U08|輝石の原子的交換・無料分優先・重複要求/失敗時rollback。実交換と在庫保存|有償由来期限の外部決済との接続等未完|
|U09|480円/30日、購入時+24h×30、3000合計、再購入制限・時刻境界のDB検査。cron実行確認|外部決済未接続。fixture注文は購入受入ではない。販売無効|
|U10|匿名認証付き本体保存・復帰、本人限定プロフィールRPC、起動取得重複抑制|P03外部認証/別端末引継ぎ、P04運用値、GAME03 KPI転用のGAME04実装・検証未完|
|U11|本陣→編成→出陣→報酬→育成→再読込、商店薬、侵攻の実接続を部分成立|同一最終候補での全群横断受入未完|

## 実接続結果
専用QA E 229ac838-28c3-48e4-a86a-45a25fbf72b9:
- 累計day1・任務NM092受取・1-1勝利・育成Lv3 EXP100、cash13040、再読込一致。
- SKD071 LB0のみfixture付与後、本体LB1/SP140→139、cash13040→5040、素材10→2、編成して1-1勝利。保存cash5540/clear2/skillLB1。効果発動全件検査ではない。
- 自身侵攻room a8dd1582-12fe-4161-8c34-0c423d1e04c4。敗北damage8、後続勝利でLv1→2、資格3勝達成、Lv2→3。
- Lv2報酬実受取 cash15540→16540 / skillLB素材2→3 / 装備LB素材5→6、state version30、claimed=true、再読込pending0・受取不可。
- 進行準備fixture: mino-5開放、所持3体のみ正式Lv100/覚醒5/EXP300000、行動力+60。G4自然進行ではない。敵・他利用者は変更していない。+60は薬検証ではない。

専用QA F d6dabf02-3eb2-430e-8352-561f8d735469:
- 実交換: 輝石200→100、薬0→2。実使用50→100、薬2→1、上限で使用不可。
- 親が本人の行動力のみ99へ境界設定後、本体実使用99→149、薬1→0、再読込・DB v6一致。
- 自室表示fixture 8a525b0e-de45-4a62-ad67-f893cea7db0dでpending Lv2実明細と現在Lv3予告の分離を確認。合成報酬は受取していない。Eの実報酬受取とは別証拠。

## DB差分
適用migration:
- 20260924124308 game04_g2_profile_self_update
- 20260924124445 game04_g2_profile_unchanged_title
- 20260924124512 game04_g2_wallet_free_first_exchange
- 20260924125408 game04_g2_formal_login_bonus
- 20260924125412 game04_g2_vip_schedule

DML: energyMax100 / energyRecoverySeconds300。既存行動力値の一括書換えなし。
既存pg_cronへjob9 game04-g2-vip-delivery（毎分）、実行成功1行確認。
現行neon_diamondsを正本として使用、旧diamondsは保持し換算なし。サービス専用RPC・本人限定プロフィール・user lock/CAS/receiptによる重複防止。migration全量再適用なし。
SQL rollback検査: 交換200→150、同request再送非消費、CAS失敗rollback、299/300秒、ログボday3/5/7/30、VIP時刻0/24/696/720h・計30回3000・未確定注文拒否・別利用者/有効期間内再購入拒否。これらは外部決済や自然30日経過の受入ではない。

## Q横断
|分類|結果|
|---|---|
|Q01|起動の取得共通化・並列化、不要全体再読込・画像待ち/ローダー重複を修正。warm出陣2034→2030ms、任務2046→2052msの単発比較で改善は立証不可。cold9853ms残存。TTI/API/画像別・p95未取得、閾値未承認|
|Q02|本体iframeの360/375/390幅・390×568で代表状態の横overflow0、CTA/内側scroll確認。Cloud Chromeであり実機/Safari/キーボード確認ではない。全状態網羅は未完|
|Q03|券種・通貨・武将等用語、旧スキルの利用不能表示を修正。旧データ/スナップショット保持。旧50値・供給の未決は残る|
|Q04|重複条件・開発説明・報酬予告混同を修正。最終747の限定表示未確認|
|Q05|72スキル同ID対応表を管理。正式画像/素材10/エリア10・城5/レアbadge4等の不足残存|
|Q06|承認済み仮FIXと真の未決を分離。侵攻主催仮FIX維持。SPD強化/暗闇/沈黙の追加なし。未決を推測で確定しない|

## 正式横断C項目
C01端末: 部分、実機未確認。
C02ゲスト/連携: 匿名QA保存成立、外部連携未確認。
C03日付/期限: rollback境界・cron部分確認、全本体未完。
C04購入例外: DB部分、外部決済未完。
C05不正対策: 本人制限/CAS/重複要求部分、全網羅未完。
C06性能/費用: 測定不足。
C07障害/問い合わせ: 運用値未完。
C08公開QA混入: 専用QA隔離、最終公開設定検査未完。
C09広告〜収益: P05方針確定、GAME03 KPIのGAME04転用実装・検証未完。
C10初期運用: P並走との接続未完。
C11自然進行: fixture受入と区別、G3/G4依存あり。
C12素材/公開情報: 未完。
C13版追跡: コード/API/DB/Preview記録済み、最終生証拠保全未完。
GATE現行版3（2026-09-24更新）を優先。G0/G1受入を戻さない。P05完了済みの方針を再判断事項にしない。P02〜04/P06並走の完了を推定しない。

## 集約判断・必須未完
1. 正式72名称/画像、素材10、背景対応等の採用。旧50を番号順に置換しない。
2. daily10: JST0未受取失効/遡及なしを推奨（保持案との比較）、日跨ぎ戦闘は結果日か開始日、侵攻令をDM004へ置くかDM005/6へ置くか。
3. 侵攻sharedHPの過剰ダメージ算入: 実HP減少量を推奨、現行全表示damage算入を明示採用する案。現行TI01 Lv1 HP23040にdamage23992（超過952）、寄与35988。実HPのみなら34560となり、敗北8+2勝後に残872。現行では2勝でLv1突破し、3勝資格前のLv1報酬なし。ただし勝利数は次Lvへ継続し、全体で獲得不能ではない。承認前に数値を変更していない。
4. P02検証決済/有効VIP購入前拒否/通知/付与期限、P03外部認証、P04法務・運用値。入口や注文fixtureで合格にしない。
5. 全対象画面/状態、承認モック、性能条件分離、実機、最終747限定表示と画像原本保存。

## 保存障害
exec-server transport disconnected、再接続timeout、別node実行も409 environment_offline。ブラウザも応答停止。反復リトライを中止し、使えるGit接続で本保全記録を保存した。
切断前の詳細Markdown・画像・DOMはローカル docs/verification/g2-20260924/qa-e および qa-f-final 等に作成済み。これらの全原本がGit保存済みとは主張しない。本保全版は確認済み事実と子担当送付本文から再構成した。原本回収・最終表示検証は未完。
Production/GAME03/main merge/共有alias変更/実金銭購入なし。G3/G4新実装なし。G2完了・リリース合格ではない。
