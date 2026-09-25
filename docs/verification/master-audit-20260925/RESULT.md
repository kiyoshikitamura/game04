# GAME04 レベルデザイン・マスタ最終監査（2026-09-25）

**最終監査未完了・移行判定 STOP。主要実効マスタの包括的な「正本一致」判定を撤回。** 追補の独立本文照合で、表示用LB値を実計算へ戻す数値差を発見した（MA07）。リポジトリと配信APIの一致は、設計意図への適合を保証しない。 本番受入・G3/G4統合受入を代替しない。共有API/DB・ユーザー所持/育成/進行への書込み、mainマージ、本番変更は0。

## 固定した取得版

|対象|取得版|
|---|---|
|監査base / G2 PR30|`29b1515f677bb475cb22b956c9802b88f51c2411`|
|G3 PR33（監査中の更新を再取得）|`b6b135db6dbf4ad36714f39dd0a25f3395437a57`|
|G4 PR34 FIX|`ec35f6f205045f72748f14ad7932892867658daf`|
|P02〜04 PR31|`3ca2e73ccca1a816bef6d8aa3a3dbecca3494a79`|
|65面 PR22|`eaf72bee189d711354ac008f0353f269c8611551`。後続round17/終盤正本・現行G2を優先|
|実DB|`game04-dev-clean / lrgyllgzcdcphlbmkknc`。public config、Edge環境固定先、実SELECTを照合|
|稼働API|`game04-redesign-api v31`|
|管理hash|`70c20710ef9a7a36b103630cd67548da2fa62f314efa2d0797a482db11fb9c6f`|
|取得本文SHA256|`59e497ae9278ba1108ed3a31f510bd4d266eac6535c815bc5f26692f29eac215`|

取得本文は既存 `docs/verification/g2-20260925/r7/shared-api/live-v30-rooms.ts.txt` と全文一致。ファイル名はv30だが配信記録はv31。G2通常source/bundleはG3を含まないため、稼働本文との単純な同一視は禁止。API本文をネットワーク禁止のVMで評価し、定義・純粋関数の実行結果を抽出した。プレイヤー操作は実行していない。複数SELECTによる取得であり単一トランザクションsnapshotではない。正確な時刻はobserved/metadata.json。

## 正本・参照先・件数・結果

資料の略記：M=`docs/product/GAME04_MASTER_AUTHORITY_LATEST_2026-09-21.md`、S=`docs/product/master_sources_20260921/`、A=`GAME04_G2_APPROVALS_2026-09-25.md`。`src/domain/redesign/`をDと表記。

|マスタ|正本|実参照経路|期待 / 実件数・結果|
|---|---|---|---|
|武将|M、S/numeric.md末尾60配分|D/formal-character-stats.json→formalCharacterStats→masters→buildBattleParty。API内蔵|60 / 60。N15/R20/SR15/SSR10、属性・役割・個体差・Lv1〜100値・覚醒0〜5パッシブを固定。正本基準点/Lv100照合PASS、APIと全値一致|
|正式スキル|M、S/balance.md・numeric.md、A|balance-v2/raid-skill-values/formal-skill-presentation→getFormalOwnedSkill→戦闘|72 / 72、LB0〜10=792 / 792。N9/R33/SR16/SSR14。効果/数値/SP/対象/条件/名称/画像を全件固定、稼働全値一致。SKD056保護解除、072能動強化解除を保持|
|旧スキル|旧所持保持方針|LEGACY/SKILL_MASTERS、旧snapshot経路|50 / 50。正式と合計122所持定義。正式ガチャとは分離、削除・番号置換なし|
|装備|M、S/equipment_drops.md、design extract|formal-growth-equipment→formalGrowthMasters→masters|160 / 160。N35/R50/SR55/SSR20。正式160行正本一致、全Lv値稼働一致。6装着枠/装飾2枠、属性なし、LB追加倍率なし|
|従来アイテム|canonical itemsと既存互換|canonical_item_master / canonical data|18 / 18。ID・用途・効果値・積重ね・上限・期限区分・有効状態の意味値一致。旧表示名は戦国themeで投影|
|追加有償資源ID|M、P02最新引継ぎ|game04_paid_item_path / apply_formal_present|特大EXP2、SSR選択魂、スキルLB、装備LB、活力丸、侵攻令の7経路を実SQLで確認。canonical18行へ無理に番号追加しない|
|育成|GROWTH_AUTHORITY_V1、GROWTH_NORMAL_GACHA_HANDOFF|growthMaster/growth、DB growth RPC|キャラ/装備×4レア×100Lv=800行。EXP/銭・魂・覚醒・LB必要量・上限・繰越が正本一致。稼働全値一致|
|プレイヤーLv|同上、M|growthMaster/playerCumulativeExp、game04_growth_cumulative_exp|100段階固定。行動力上限を増やさず全回復。旧EXPはmigration_pendingで保留、黙示換算なし|
|出陣|round17_effective62、endgame_approved_handoff、S/quest_rewards・equipment_drops|quest65→questMaster→createFormalBattleInput→保存input|65 / 65、敵356 / 356（62面336＋終盤20）。各エリア3/4/5/5/6/6/8/8/10/10。1〜6Wave、最大3敵。編成/数値/スキル/初期SP/解放/消費/報酬を固定、APIと一致|
|DB quest65|同上|現在のAPIは内蔵定義。DBは移行・旧manifest連携用|65 / 65、差は敵画像356パスのみ。数値差0。比較時にimageだけ明示除外し、実表示パスはAPI側manifestで照合|
|共闘|M、S/encounter・rewards|raid-encounter→FORMAL_ENCOUNTER_MASTERS→room snapshot|25ボス/85組 / 同数。敵全値・開始SP満タン・消費20・60分・報酬・PlayerEXP、稼働一致|
|侵攻戦闘|M、S/invasion・rewards、A|raid-invasion→createFormalInvasionMaster→game04_host_formal_territory(p_raid_master)→開催snapshot|5城×12段階。3抽選条件で全値稼働一致、候補表全体もsource-lock。実HP減少基礎/勝利1.5倍/3勝資格/旧snapshot保持PASS|
|侵攻主催|後続9/23仮FIX承認を継承|DB territory→territory_context→主催RPC|10Lv/5城/同時1、EXP0/100/300/600/1000/1500/2100/2800/3600/4500。主催必要Lv1/2/4/6/8、獲得100/150/250/400/600。DBと実装一致。安土の既存destinationId=azuchiを保持|
|正式ガチャ|M、G3 formalGachaMaster.json・検証結果|G3内蔵定義＋DB formal_gacha、commit_gacha|60+72+160=292行、4banner。G3正本/DB/v31が全値一致。通常1000/10000銭、無料10連1回、N49/R40/SR10/SSR1。特選300/300/200、SSR3/5/10%、交換200/100/100、対応券・ポイント定義一致|
|初期付与|PR34 content.ts/state.ts FIX優先|現liveはcreateInitialState→buildInitialState|**不一致・統合待ち**。正式R氏康/直政/お市、SKD003/039/035、装備なし。liveはN5体/旧8スキル/仮素材。G4演出・最終模擬戦値は一般マスタへ流用しない|
|日次/通常任務|M、S/missions、A|FORMAL_MISSION_CONFIG→API内蔵|183通常＋侵攻追加4＋日次8/達成数2=197 / 197。DM005に侵攻令1。全値稼働一致、JST0時/前日未受取失効/跨日結果日を限定試験済み|
|ログイン報酬|M、S/login_supply第7章|loginBonus.tsとDB process_login_bonus|30日周期。魂60/銭300000/券2・4・2/EXP30000・60000/無償輝石300。SQL定義と純粋関数を照合。**G4の初回Home抑制・2回目からとの接続は未受入**|
|回復|M、growth|DB runtime→game04_get_state|上限100、300秒で1、超過保持。DB一致。0の初期energyはusers由来値で上書きされるため単独で不足とはしない|
|ショップ|M、P02最新記録|shop.ts、billing/catalog→DB billing_products、paid lot|有償11商品 / 11商品一致（パック4/輝石6/VIP1）。数量/価格/回数/120日期限一致。旧商品14行は残存、正式allowlist外|
|VIP|M、P02/P06|VIP_PRODUCT、grant_vip、deliver_due_vip|480円/720h、購入時＋24hごと30回、最終696h、100×30。同一注文重複/有効中再購入拒否。実ジョブ配信・本番接続受入は担当範囲|
|交換|M|shop.ts→game04_commit_shop_exchange|活力丸50、銭1:10、侵攻令100、固有2→汎用1。8選択肢。整数/上限/不足/超過保持の限定試験PASS|

## 発見事項と修正候補

|ID|影響・根拠|処置・受入条件|
|---|---|---|
|MA01|初期状態がG4正式付与ではない。旧仮資産を新ユーザーに入れる経路が現liveに残る|G2/G4のサーバー権威統合で解消。既存ユーザーへの削除・置換は別判断。新規専用ユーザーで3武将/3技能/再送重複なしを確認するまでSTOP|
|MA02|DB territoryの5正式masterは画像・短名/説明が旧、damagePolicyが未記載。現APIは新masterを渡すため新開催の実計算は正しいが、DB直接fallbackでは旧方式へ戻れる|`territory-master-candidate.sql`。取得時JSON完全一致を条件に、新規参照master5件だけ現行値へ更新。既存開催/戦闘/進行は触れない。未適用、DB実行検証は未実施|
|MA03|実稼働trigger game04_capture_named_asset_itemはrelease_manifest.skillsでID判定するが、旧50件しかなくSKD001〜072が0件。user_itemsへ正式技能名義で付与された場合イベントが生成されない。G3直接state付与経路とは別|`named-skill-registry-candidate.sql`で旧50を保持し72明示IDを追記。旧skills配列一致を条件とする。既存数量への遡及・所持再計算なし。未適用。統合DBで1件の正式技能付与→イベント→stateの限定受入が必要|
|MA04|G2通常source/bundleのnormal_gachaは旧gacha_items_master参照。liveはG3正式内蔵だがG2単独再配信で巻き戻る|G3最新sourceへ必要差分のみ統合。G2 bundle単独再配信禁止をmanifest・移行手順へ明記|
|MA05|DB missions={enabled:false,missions:[]}、quest_player_exp={stages:{},UNCONFIGURED}、旧release_manifestと旧territory fixtureが残る|現在の正式経路は内蔵197任務・正式65面EXPを使用。旧戦闘snapshot用経路の0を一律修正しない。新規正式経路が旧/空masterへ切替わればSTOP|
|MA06|既存raid正式検証の合成resultが追加済みactualHpDamageを渡さず停止|試験fixture3箇所だけ補正。新侵攻が必要値欠落で拒否する実装は維持。数値・ゲーム処理変更なし|

MA02は画像を除く差194（名称55、説明134、damagePolicy5）。戦闘能力・報酬値の差なし。候補は現在の正式画像も同期する。MA03は稼働triggerの参照漏れであり、canonical_item_masterにSKDを全追加する修正ではない。

## 空・0・null・旧値の分類

- スキル792行の効果配列は非空。禁止未承認効果SPD強化/暗闇/沈黙の追加なし。792行は表示用抽出表には一致するが、内部未丸めの正本計算とは不一致（MA07）。対象・条件・解除分類・画像をmanifestへ保存。
- Nパッシブなし、装備SP=0/属性なし、敵LUK=0、侵攻PlayerEXP=0、初回挑戦消費0は意図した値。VIP通常items=[]は資産パックでなく専用権利付与経路のため正常。
- 正式65面の空imageは入力JSONの表示未接続を隠すものではなく、binding→characterArtで明示解決。敵ID/binding不一致はthrow。API実値は画像込みで照合済み。
- 旧snapshot・旧所持の互換値と、正式新規付与を分離。旧Lv/EXP移行はmigration_pending。未合意の換算・削除は行わない。
- 972スキル参照と282種類の素材パスをGit treeで確認。今回の素材確認はファイル追跡・参照存在であり画面表示監査ではない。

## seed・migration・初期化・再配信の巻き戻り対策

- 9/19初期migrationはruntime=50/180、旧3Lv侵攻2/3主催枠、仮報酬を含む。現在DBは100/300・10Lv/全1枠。一括再適用・初期migrationだけで完成扱いは禁止。
- 初期runtime insertはON CONFLICT DO NOTHINGで既存値を直接戻さないが、新規DBへそれだけ適用すれば旧値になる。source-lock146ファイルと実DB値照合の両方が必要。
- `generate_game04_raid_formal_sql.cjs`はローカルSQLを上書き生成する。生成物を無条件に実行しない。今回は旧生成物を再実行せず、CAS条件付きの限定候補だけ作成。
- `game04_get_state`等は名称がgetでも初期化・回復・ログボの書込みを伴う。今回の読取監査では呼ばず、SELECT/関数定義取得を使用。
- 通常起動のplayer_state insertはON CONFLICT DO NOTHING。旧資産importは追加台帳を使用。初期化を全ユーザーへ再実行する手順は作らない。
- DB formal_gachaが正しくても古いAPIを配信すると参照経路が戻る。API本文hash・実効プール292ID・DB値・G3sourceの4点を移行時に照合。

## 検証と限界

実施：正本対照（60武将基準点/160装備/792技能/65面356敵）、実API抽出とローカル全値比較、DB SELECTとRPC/trigger定義、G3 pool三者一致、有償11商品の全設定一致、日次/供給/育成/侵攻実HPと旧snapshotの既存限定試験。全戦闘再試験・全画面監査はしていない。

`verification.json`に各実行コマンドと終了値を保存。raid素材存在確認はsparse checkoutのためGit treeによる存在確認。SQL候補は変更対象/旧値前提/期待JSONの限定検証まで。共有DBで未実行のSQLを適用済みとは扱わない。

**MA07の丸め方針について正本適合の修正確認が必要。** 新しいバランス案ではない。後続の明示承認がある場合のみ採用根拠を追記する。 メインへの残件はMA01〜04の統合・限定受入と、G4ログボ接続、G3/P担当の実接続受入証拠の受領。本監査はそれらを合格へ繰り上げない。新しい統合SHA・API・DBの差分が未確認なら継続STOP。


## 追補：存在確認・値一致・意図適合の区別

詳細は `COVERAGE.md`。前版は「全値を保存した」ことと「全ての意味を正本から独立検証した」ことを混同して記載していた。これを訂正する。実DB/APIを再取得した追補ではなく、固定したG2および既取得v31本文の追加検査である。

### MA07：スキルの内部精度を表示丸め値へ戻している

- 根拠：M第1節はnumericの個別効果を優先。numeric.md 243/340行とbalance.md 1474行は内部未丸め、表だけ小数2桁と明記。Mの「792行を初期性能表として使用」も存在するが、内部丸めへの変更を明示承認した記録は、今回読んだM・G2承認記録・PR30コメントに見つからない。
- 経路：`getBalanceV2Skill`は未丸め計算 → `getFormalRaidSkill`がraid-skill-valuesの表示文字列を数値化してpower/bonusPower/chanceを上書き → 所持技能・敵技能・戦闘計算。ローカルと取得v31の両方で再現。
- 独立検査：numeric本文72行を直接解析し、各LBの式を再計算。各対象8,800項目を照合し、65スキルのLB1〜9＝585行、666数値フィールドに差。LB0/10・固定値・SP・対象ルール・発動条件フィールド・効果の種類/順序・持続/持越し・解除分類・回復基準に差なし。戦闘中の全選択条件を動的証明した意味ではない。
- 例：SKD013 LB5、期待攻撃倍率213.0672311440286%、実値213.07%。実ATK16,000、DEF0、中立属性、乱数係数1、追加補正0の合成境界例では最終切捨て34090と34091になる。これは式の影響例であり、既存戦闘の勝敗変化を測定したものではない。倍率の最大差は約0.004972ポイント。確率も2スキル×9LBで差がある。
- 修正候補：`skill-precision-candidate.patch`。計算値の上書きだけを除き、表示文・正式名称/画像・SP・G4条件の扱いを保持する。**未適用**。後続承認確認後、統合担当が採否を決め、候補SHA/APIの再照合と限定戦闘計算確認を行う。現在所持のID/LB/EXPを書き換える必要はないが、同じLBの戦闘出力が変わるため影響を分離して報告する。
- `approved-values.json`の技能runtime値は旧取得比較基準を保持している。承認済み計算の正解として無条件に扱わない。`unresolved-authority.json`を追加し、これが空でない限りsnapshot gateは値が完全一致してもSTOP。未丸め値へ無断で基準を再生成しない。


## 追補：敵・クエスト名称（MA08）

ユーザー追加指示により名称も独立した受入対象へ追加。正式65面の全nameが攻略コンセプトで、descriptionとも同一。repo/取得v31/取得DBの3経路で再現。原因は生成時のconcept→nameコピー。**65面全件NG、正式名称未確定、移行STOP**。正式名称を勝手に作らず、ID別の未確定一覧・参照経路・未適用の生成修正候補を `NAMES.md` と `name-authority.json` に保存。

出陣356敵の明示ID対応、共闘85 master/97敵、侵攻の抽選標本362敵参照・全24通常候補49名称参照、DB侵攻119敵参照では、今回の名称検査に差なし。MA02のnested旧名称差を敵武将名の誤りと混同しない。画面実描画・保存済みユーザーsnapshotの受入は行っていない。詳細件数・範囲は `observed/name-comparison.json`。


2026-09-25 20:24 JST追記：名称案はユーザー採用済み。名称承認待ちは解消。実装・検証・統合残件は `NAMING_ADOPTION.md` を優先。旧「未確定/未承認」記述は当時の記録。MA08は配信・統合照合待ちとして維持。


## 2026-09-25 20:50 JST 供給FIX

ユーザー承認により遭遇率/共闘勝利魂/侵攻最終魂を更新。内容・限定検証・新旧snapshotの境界はRAID_SUPPLY_ADOPTION.md。新しい数値承認済みであり判断待ちへ戻さない。共有API/DBへは未配信、現行との不一致は統合差分として扱う。
