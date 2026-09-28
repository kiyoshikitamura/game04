# G2 素材・背景ID対応と採用判断候補

基準: e62d3894b54ce70aede4a23a8fc2599c40b744da。Git tree存在・配信HTTP・内容一致は別判定。SKD72はu01-skill-id-contract.mdを正本とし本表では重複計上しない。

## 素材10点（既存ID契約保持、画像採用未決）

G1判断事項の内訳はXL2・汎用魂4・選択券4。既存public/itemsには小中大EXP各2種、awakening_book等はあるが、XL/レア別汎用魂/選択券の専用pathは存在しない。以下は新規制作時の候補pathで、承認/採用済みではない。

|ID（在庫キー）|用途|候補path（未採用）|欠損分類|
|---|---|---|---|
|expItems.character.xlarge|武将EXP特大 20,000 EXP|/items/char_exp_xl.png|専用画像未割当・Git treeなし|
|expItems.equipment.xlarge|装備EXP特大 20,000 EXP|/items/equip_exp_xl.png|専用画像未割当・Git treeなし|
|genericSouls.N|N汎用魂|/items/generic_soul_n.png|専用画像未割当・Git treeなし|
|genericSouls.R|R汎用魂|/items/generic_soul_r.png|専用画像未割当・Git treeなし|
|genericSouls.SR|SR汎用魂|/items/generic_soul_sr.png|専用画像未割当・Git treeなし|
|genericSouls.SSR|SSR汎用魂|/items/generic_soul_ssr.png|専用画像未割当・Git treeなし|
|soulSelectors.N|N魂選択券|/items/soul_selector_n.png|専用画像未割当・Git treeなし|
|soulSelectors.R|R魂選択券|/items/soul_selector_r.png|専用画像未割当・Git treeなし|
|soulSelectors.SR|SR魂選択券|/items/soul_selector_sr.png|専用画像未割当・Git treeなし|
|soulSelectors.SSR|SSR魂選択券|/items/soul_selector_ssr.png|専用画像未割当・Git treeなし|

比較案A（推奨）: 正式名称/数量はHTMLで維持し、既存EXP巻物の意匠に合わせ特大2、魂4、券4の専用画像を制作。魂は色だけに依存せずレア度ラベル/形状も区別。透過・単一対象・既存アイコンと同寸法に正規化。制作後10点を一括比較して採用判断。
比較案B: EXP大画像2種を特大にも共用、汎用魂/券はレア別ラベル付き共通画像。画像数を減らせるがサイズ/対象誤認が残る。共用承認なしでは適用しない。awakening_bookを魂へ無断流用しない。
影響: 本体育成、任務/BOX報酬、商店/交換/侵攻報酬。現状は名称/数量表示は可能でも必須画像不足を解消した扱いにしない。

## 出陣10エリア・現在参照と背景名称

本陣ASSET_MAPPING（固定SHA取得）では現在のQUEST_AREAS.imageを既存採用素材として参照。ただし地理名との対応は同義ではない。G1で背景対応が未決のため、配列順割当を「地理対応承認済み」と断定しない。

|ID|エリア|現在画像/登録名|Git tree|内容対応・判断候補|
|---|---|---|---|
|area:mikawa|三河の地|/creative/backgrounds/char_koharu_01.png / 雪の春日山城|あり|地理対応要確認。下記候補にまとめる|
|area:owari|尾張の旗|/creative/backgrounds/char_leo_01.png / 青葉城と仙台城下|あり|地理対応要確認。下記候補にまとめる|
|area:mino|美濃の城|/creative/backgrounds/char_mio_01.png / 米沢城下・花の宴|あり|地理対応要確認。下記候補にまとめる|
|area:omi|近江の湖|/creative/backgrounds/char_karen_01.png / 駿府城と城下|あり|地理対応要確認。下記候補にまとめる|
|area:kai|甲斐の山|/creative/backgrounds/char_miyabi_01.png / 琵琶湖畔の坂本城|あり|地理対応要確認。下記候補にまとめる|
|area:echigo|越後の雪|/creative/backgrounds/char_kengo_01.png / 大多喜城を望む山道|あり|地理対応要確認。下記候補にまとめる|
|area:kyoto|京洛の影|/creative/backgrounds/char_go_01.png / 躑躅ヶ崎館と甲府盆地|あり|地理対応要確認。下記候補にまとめる|
|area:izumo|出雲の社|/creative/backgrounds/char_kaede_01.png / 上田城|あり|地理対応要確認。下記候補にまとめる|
|area:satsuma|薩摩の炎|/creative/backgrounds/char_reiji_01.png / 安土城|あり|地理対応要確認。下記候補にまとめる|
|area:sekigahara|関ヶ原|/creative/backgrounds/char_ageha_01.png / 黄金期の大坂城|あり|地理対応要確認。下記候補にまとめる|

地理対応候補（未採用）: 近江→char_miyabi_01（琵琶湖/坂本城）、甲斐→char_go_01（甲府）、越後→char_koharu_01（春日山城）。残る三河・尾張・美濃・京洛・出雲・薩摩・関ヶ原は登録名が直接一致する画像なし。
推奨: 3件は既存画像の候補比較、7件は必要な場所が識別できる背景を追加制作して一括採用判断。代案: 10件すべて現行の雰囲気背景として意図的共用を承認（地理の一致は保証しない）。勝手な差替えをしない。

## 侵攻5城

|ID|城|現在path|Git tree|具体候補（未採用）|
|---|---|---|---|---|
|TI01|岡崎城|/bg/raid/raid-castle-moonlight-v1.webp|あり|岡崎城の追加背景|
|TI02|長浜城|/bg/raid/raid-castle-moonlight-v1.webp|あり|長浜城の追加背景|
|TI03|春日山城|/bg/raid/raid-castle-moonlight-v1.webp|あり|/creative/backgrounds/char_koharu_01.png|
|TI04|躑躅ヶ崎館|/bg/raid/raid-castle-moonlight-v1.webp|あり|/creative/backgrounds/char_go_01.png|
|TI05|安土城|/bg/raid/raid-castle-moonlight-v1.webp|あり|/creative/backgrounds/char_reiji_01.png|

再開時訂正：共通背景の5城使用は9/24領土侵攻ASSET_MAPPINGで明示承認済み。用途対応未決・再承認対象から外す。上表の城別画像は将来追加候補であり、G2必須欠落5件として数えない。根拠と採用済み17点の対応はresume-assets.mdを参照。実表示のデコード・切抜き検証は別途維持。

## 公開導線と仮表示点検

- 本陣「同盟」はdisabled/未解放。HOME_MOCK_REQUIREMENTS_FIX第3節でロック表示・操作不可が承認済み。削除対象の旧残骸ではない。
- Header同盟表示欄も同文書第6節で保持指定。未公開同盟を実装・公開していない。
- summon旧実装はG3で受入。Dから完成扱いしない。
- 固有内部ID char_*、旧背景ID bg_kabukicho互換は保存復帰契約。表示名称を直す目的でIDを換算しない。
- 本陣/出陣/共通ShellでTODO/仮/未FIX/PROVISIONAL/ダミー機械検索。sourceの表示用未決は出陣playerGrowthの移行確認待ちと、共通RedesignApp獲得保留（親所有）。既存資産判断に紐づくので文言だけで完了化しない。
- 未承認レア度バッジ4件はFORMAL_RARITY_BADGES=nullを保持。画像採用対象は素材10点とは別。既存文字ラベルを残し旧バッジを無断採用しない。

## 静的URLの存在照合

`ui-static-assets.json`の静的22参照は全て基準Git treeに存在。ローカル画像未復元を欠損URL/404と取り違えない。配信GET・デコード・裁ち落とし実測は統合Preview検証で別途必要。
