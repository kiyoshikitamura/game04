# GAME04 / 戦国姫艶武
# UI 最新統合正本
更新日: 2026-09-23
状態: LATEST UI AUTHORITY

本書はBattle以外を含むGAME04 UIについて、2026-09-21の統合仕様を基準とし、後続の承認済み共通ルールを追記する。
旧9/19 UI正本は履歴資料とし、本書と競合する場合は本書を優先する。
Battle UIは `docs/product/GAME04_BATTLE_UI_AUTHORITY_LATEST_2026-09-21.md` を最優先とする。
未決仕様・未制作素材はUI都合で独自FIXしない。

## 1. 全画面共通
- 縦持ちSmartphone UI。
- GAME04共通Header / Footer / Dialog構造を維持。
- 画面より長い内容は末尾CTAまで必ずScroll可能。
- Main scroll ownerは `.rd-shell`。100dvh、縦Scroll有効。
- 金色thumb / 暗色trackのDesign Scrollbarを縦横共通適用。Scrollbar非表示は禁止。
- 長文Dialogは中央、最大約80dvh。本文を内部Scrollし、Header / CTAへ必ず到達可能にする。
- Footer / safe-areaにCTAや末尾情報を隠さない。
- 画像・Gauge・演出用overflow:hiddenは必要箇所のみ維持。
- 新規画面・Modalも同じScroll Ruleを適用する。

## 2. Footer
初期主要5枠:
1. Home
2. Quest
3. Character
4. Raid
5. Gacha

PvP / RATE / GvGは初期導線へ戻さない。
GuildはEndgame / Guild Raid接続用として別導線で扱い、初期Footerの主要5枠を崩さない。

## 3. Home
目的:
- User identity
- Home Character / Background
- Quest再開
- Encounter Raid通知
- 領土侵攻
- Mission / Shop
- Activity / Global Chat / DM
を過不足なく見せる。

Header:
- 先頭Character Icon
- User Lv
- User名
- 認証状態
- CASH（銭）
- DIA（輝石）
- 行動力
- Menu
Guild情報はGuild利用可能時のみ表示。未解放/非公開段階で空のGuild情報を主表示しない。

Visual:
- 選択Home Character立ち絵
- 選択Background
- Character / Background切替

Encounter Raid:
- 発生時のみVisual右上へ通知
- Boss / 残り時間 / Raid遷移
- 通常時非表示

Shortcut:
- Mission
- Shop
- Guild（利用可能時）
- 未受取等のみBadge

主要CTA:
- Quest続き
- 領土侵攻
をVisual直下へ並列配置。
領土侵攻は開催Item未所持でもTop閲覧可。開始不可理由と入手方法を表示。

Community:
- Activity
- Global
- DM
最新2〜3件。Guild Chat / BBSは利用開始前に空枠を見せない。

Rotation Banner:
- 1枠、薄型、複数訴求Rotation。

## 4. Quest
Flow:
Area一覧 → Stage一覧 → Stage情報Dialog → 出撃準備Dialog → Battle → Result

### Area一覧
- Area名
- Background
- 攻略中 / Clear / 未解放
- 現在攻略中を強調
- 縦Scroll
- Design Scrollbar

### Stage一覧
- Area名 / Background
- Stage番号 / 名称
- 消費行動力
- Clear / 未Clear / 未解放
- 最新挑戦可能Stage強調
- 縦Scroll

### Stage情報Dialog
- Stage番号 / 名称
- Wave数
- 消費行動力
- 出現Enemy
- Enemy名 / Lv / 属性
- 初回報酬
- 通常Drop
- Rare Drop
- 挑戦 / 閉じる

Stage固定属性Labelは置かず、Enemy属性からUserが攻略判断する。

### 出撃準備
Partyは最大5人を左→右に表示し、その順をBattle行動順とする。初期は3人、1-1/1-2クリアで4人/5人となる。空き枠を未所持キャラで埋めない。
各Character:
- Image
- 名前
- Lv
- 属性
- HP

Party共通SPは**最大400固定**として表示可能。旧Character SP合算表示は使用しない。
Character個別SPは表示しない。

操作:
- 編成変更
- 戻る
- 挑む

Skill / Passive詳細はTap詳細へ。
挑戦開始時に最新マスター所定の行動力を消費。最初の挑戦0、未クリア再挑戦1、クリア済みはエリア別5/6/8。敗北時返却なし。

### Result
- 勝敗
- Drop / 初回報酬
- Player EXP
- User Lv up
- Lv up時の体力全回復
- Encounter Raid発生
を実処理と一致させる。
User Lvによる体力上限増加の旧説明を表示しない。

## 5. Character / Deck / Growth
内部Tab:
1. Deck
2. 編成
3. Character
4. Skill
5. Equipment

### Deck
Party 5人を左→右。
- Character Image / Name / Lv / Rarity / Attribute / HP
- Skill / Passive状態の最小Icon
- 総HP
- 属性構成
- 共通SP上限400

旧「Character SP合計」「合計SP」は使用しない。

操作:
- おまかせ編成
- おまかせ装備
- おまかせSkill

### 編成
5人入替 / 行動順変更。
所持Character一覧にFilter / Sort。

### Character一覧
- Image
- Name
- Lv
- Rarity
- Attribute
- Role
- 覚醒段階
- 編成状態
- 未所持Characterは蓄積固有魂と初回解放必要数を確認可能

### Character詳細
- Name / Lv / Rarity / Attribute / Role / 覚醒
- HP / ATK / DEF / LUK
- Passive
- 装備Skill
- Equipment 6枠
- 固有魂 / 汎用魂
- 現在Lv上限 / 最大100
Character個別SP能力値は最新Battleで使用しないため表示しない。

操作:
- Lv育成
- 覚醒
- Skill変更
- Equipment変更
- 魂初回解放（未所持時）
- 魂交換

### Character Lv育成
- 現在Lv / 解放上限 / 最大100
- Character EXP小100 / 中1000 / 大5000 / 特大20000
- 所持数 / 個数指定 / 一括
- 到達Lv
- 消費銭
- 繰越EXP前後
- 無効操作では何も消費しない

### 覚醒 / 魂
- 固有魂 / 同Rarity汎用魂の所持と消費内訳
- 固有魂優先、不足を汎用魂で補完。実行前に内訳変更可能
- 固有魂2 → 同Rarity汎用魂1の任意交換
- 汎用魂は初回解放不可
- 必要銭
- 解放Lv上限 / Skill枠 / Passive段階

### Skill
- Account所持Skill一覧
- Filter / Sort
- LB0〜10
- Skill LB専用素材 / 必要銭
- 現在 / 次LB性能
- 1つの所持Skillを複数Characterへ共有できることをUI上で誤認させない
- Character内同一Skill重複装備は禁止
- 最大3枠の並び順 = Battle発動優先順として明示

### Equipment
6枠:
- 武器 / 頭 / 身体 / 脚 / 装飾1 / 装飾2
- 個体管理
- Lv / LB
- Equipment EXP 4種
- 繰越EXP
- Equipment LB専用素材
- 装備中 / Lock中は分解不可
- 育成済み分解は追加確認、投入EXP / 素材 / 銭は返還しない
- 初期はEquipment Skill / Set効果なし

## 6. Gacha
### Normal Gacha
Character / Skill / Equipment混合。
- 単発1,000銭
- 10連10,000銭
- 毎日1回無料10連
- 提供割合:
  - N: Character9.8 / Skill14.7 / Equipment24.5 = 49%
  - R: 8 / 12 / 20 = 40%
  - SR: 2 / 3 / 5 = 10%
  - SSR: 0.2 / 0.3 / 0.5 = 1%

Result:
- 獲得物
- Character重複→固有魂
- Skill重複→Skill LB素材
- Equipment→個体追加
を明示。

旧2,000銭 / 20,000銭表示は使用しない。
DIA Gachaの排出プール・率・SSR選択交換ポイントは最新マスター統合正本を参照。キャラ200、スキル/装備100ポイント。未設定のPickupや10連保証を追加しない。

## 7. Raid
初期Raid Top:
- Encounter Raid
- 領土侵攻
Guild RaidはEndgameとしてGuild側へ接続し、初期Raid Topへ混在させない。

### Raid Top
開催中Encounter / 領土侵攻を一本の縦一覧。
Filter:
- 全て
- Encounter
- 領土侵攻
基本Sort: 残り時間短い順。

Card:
- Boss Image / Name / Lv / Attribute
- 共通HP / 残HP
- 残り時間
- 参加人数
- 種別 / 難易度 / 救援中 / 参加中Label
- 参加 / 続き / 救援CTA

### Encounter Raid
Quest Clear後のEncounter発生から挑む / 無視。
自発可能。開催中Raid一覧から自分が参加可能なRaidを探せる。
Encounter率 / 難易度 / 報酬はMasterで扱い、UI固定しない。

### 領土侵攻
開催導線はHomeの「領土侵攻」CTA。
Topで:
- 城 / Enemy
- 特徴 / 難易度
- 報酬
- 期間
- 必要領土侵攻Lv
- 開催Item必要数 / 所持数
- 開催枠
を確認。

Itemなし / Lv不足 / 枠不足でもTop閲覧可能。開始だけ不可にし理由を表示。
開催後はRaid詳細へ直行。
自分の開催中侵攻は攻略再開可能。
終了後もResult / 未受取報酬への入口を保持。

Raid一覧は開催中の参加 / 救援 / 再開用であり、旧「Unlockに挑む」開催CTAを置かない。
User向け名称は「領土侵攻」に統一。

### Raid詳細
- Boss
- Lv / Attribute
- 種別 / 難易度
- 共通HP / %
- 残り時間
- 参加人数
- Enemy情報
- 参加者
- 報酬
- 救援
- 討伐報酬資格 / あと何勝
を表示可能。

領土侵攻の個人Checkpoint UIは削除。途中参加者はBattle開始時の共有Boss Lvで戦う。

## 8. Guild / Guild Raid
GuildはSingle → Encounter Raid → 領土侵攻 / 高難度攻略の先に接続するEndgame Social機能。
Guild Raidは期間限定Ranking競争を担う。

UI原則:
- Guild未利用段階で空のGuild Chat / BBSを主要画面へ出して過疎感を作らない。
- Guild利用開始後にGuild導線・Guild Chat・Guild Raidを段階的に露出可能にする。
- Guild Raidの詳細UIは専用仕様が確定した範囲だけ実装し、未FIXのRanking表示等を本書から独自決定しない。

## 9. Community
初期:
- Activity
- Global Chat
- DM

Guild利用開始前:
- Guild Chatを空表示しない
- BBS / 募集 / 攻略を初期主要導線へ戻さない

Raid参加・攻略を通じた他User認識からCommunityへ接続する。

## 10. Mission / Shop / Present / Notice / Settings
GAME03由来の共通基盤を再利用。
ただし表示内容・通貨名・商品・報酬はGAME04最新Masterと一致させる。
Mission / ShopはHome shortcutから到達可能。
Present / Notice / SettingsはMenuへ統合可能。
未受取・更新時のみ必要箇所にBadge。
旧GAME03固有文言・TRIBE固有表示を残さない。

## 11. UI Authority
最優先:
- 本書 `docs/product/GAME04_UI_AUTHORITY_LATEST_2026-09-21.md`
- Battle UI: `docs/product/GAME04_BATTLE_UI_AUTHORITY_LATEST_2026-09-21.md`
- Battle Rule: `docs/product/GAME04_BATTLE_AUTHORITY_LATEST_2026-09-21.md`

関連:
- `docs/product/GAME04_GROWTH_AUTHORITY_V1_2026-09-21.md`
- `docs/product/GAME04_GROWTH_NORMAL_GACHA_HANDOFF_2026-09-21.md`
- `docs/product/GAME04_TERRITORY_INVASION_AUTHORITY_2026-09-20.md`
- `docs/product/GAME04_SENGOKU_PLANNING_AUTHORITY_REDESIGN_2026-09-19.md`
- `docs/product/GAME04_SCROLL_UI_AUTHORITY_2026-09-19.md`

旧UI正本:
- `GAME04_SENGOKU_HOME_UI_AUTHORITY_2026-09-19.md`
- `GAME04_SENGOKU_QUEST_UI_AUTHORITY_2026-09-19.md`
- `GAME04_SENGOKU_GROWTH_DECK_UI_AUTHORITY_2026-09-19.md`
- `GAME04_SENGOKU_RAID_UI_AUTHORITY_PROVISIONAL_2026-09-19.md`
は履歴資料として保持し、最新制作・実装では本書を使用する。

## 12. 最新数値・商品・報酬との接続
- 数値・マスター入口：`docs/product/GAME04_MASTER_AUTHORITY_LATEST_2026-09-21.md`。本書は画面構造を担当し、価格・数量・未決状態は同入口と一致させる。
- Questは10エリア65面、最大6Wave。Stage情報と再生のWave総数を実マスターへ接続。
- 魂は出撃前と結果で対象キャラの顔/名称/獲得数/所持数/解放までの残数を明示。確率入手も見落とさない表示にする。
- Shop通常パックは通算制限。VIPは480円・30日、Skip/3倍速、100無償輝石×30回。バッジ・期限・付与内容を表示。月次自動更新やログイン必須受取にしない。
- 交換所に回復薬、銭、固有魂→汎用魂、侵攻令100輝石。操作個数・交換率・所持数・消費内訳・結果を確認可能にする。
- Missionはデイリー/ノーマル。ログボは累計30ログイン反復。日次JST0時、VIP24時間起点と混同しない。
- チュートリアル初期資産は直接付与。固定8枠をガチャとして演出せず、ガチャ体験は既存の日次無料ノーマル10連を使う。
- 名称/素材の確定と、数値/マスター実装・受入は別工程。


## 12. 2026-09-22 Guild初期表示 FIX

初期リリースでは、マイページのGuild Iconは表示を維持し、**Lock状態**とする。
- Guild Iconを削除しない。
- 初期状態では遷移・Guild機能を解放しない。
- Lock表示で将来解放機能であることだけを示す。
- Guild Chat / Guild Raid等の未解放機能を初期主要導線へ追加しない。


## 13. 共通画像合成・配置ルール（2026-09-23追加）

クエスト実機指摘の修正から共通化した規則。該当する全ページ・共通部品に適用する。既存の色・文字・CTA・Dialog・読み込み等の承認済み共通ルールを維持し、本節と競合する過去の画像合成・配置指示は本節を優先する。Battle・ガチャ・チュートリアル固有の演出設計やゲーム数値は変更しない。

### カード枠・背景・人物
- フレーム画像の外形と内側の開口部を区別する。武将に割り当てた背景は開口部内にクリップし、枠の外へ出さない。
- フレームは元の縦横比を維持する。背景・人物・枠の順に合成し、レアリティ別の開口部定義を共通部品で管理する。
- 人物は用途に対応する正式画像を使用し、元素材に描かれた範囲を不用意に切らない。カウボーイショットは元から描かれていない足先を補わず、既存の下端を追加クロップしない。背景のcoverと人物の収まりを分けて扱う。
- 画面側から枠の比率・開口部・人物位置を個別に上書きしない。必要な表示サイズは共通部品の外寸として指定する。
- 合成不良を素材の再加工、未承認素材、生成画像で隠さない。

### 重なり防止・情報配置
- カード画像、属性／レアリティ、名前、Lv／能力値は独立した領域として通常フローで配置する。画像の実表示高を親要素が確保し、画像や枠が名前にかぶらないようにする。
- 属性・レアリティのバッジはカード画像の下に並べる。人物に重ねず、同じ属性のテキストや右上のレアリティ文字を重複させない。
- 一覧の番号メダリオン・本文・状態バッジは独立した列へ置く。番号の枠・影まで含めて本文との隙間を確保する。長い名称や小画面でも交差させず、文字を過度に縮めて解決しない。
- ボス等の属性は名前付近へ配置し、対応先から離れた位置に孤立させない。
- 同一情報を重複表示しない。詳細のHP等は能力値一覧にまとめる。

### 背景の見せ方・装飾
- 背景を主役とするエリア／章等の見出しに、横幅いっぱいの不透明帯を敷かない。章・エリア名など全ての子要素を確認する。
- テキスト背景は透明を基本とし、必要な範囲の半透明グラデーションや文字影で可読性を確保する。状態バッジの背景とは分離する。
- 背景＋人物の一体的なビジュアルを多重の装飾枠で囲まない。枠はスキル等、情報を区切る必要のある領域に使用する。

### 詳細画面・余白
- 人物を中心に見せながら、名前・能力値・スキルへの到達を妨げる過大な画像や空白を作らない。
- 縮小は実際のレイアウト寸法へ反映する。transformだけで見た目を縮め、元の占有領域を残さない。
- クエストで調整した約90%という縮小目安や個別px値を、他ページへ一律に適用しない。共通部品の比率と可読性を守り、用途別外寸で調整する。
- 表示高が低い端末でもDialog末尾・CTAへ到達でき、固定Header／Footerに内容が隠れないこと。

### 正式素材・不足時の扱い
- GAME04正式素材であることを対応表・出自・画像内容で確認する。ファイル名やHTTP 200だけでは正式素材の根拠としない。
- GAME03由来・出自不明のレアリティ素材は使用しない。GAME04正式素材が不足する場合はGitの不足記録へ対象・用途・影響を記載し、担当へ報告する。
- 不足を無断の旧素材流用・新規生成・正式画像に見せかけた代替で埋めない。現在の不足部分を含むFIXは、正式素材が揃ったという意味ではない。

### 実装・照合
- 競合するCSSや過去の固定高・汎用セレクタを整理する。末尾への上書き追加だけで収束させず、共通部品と画面側の責務を明確にする。
- 単体部品だけでなく実際のページ・Dialogでcomputed styleと表示を確認する。375px／390pxおよび低い表示高、長い名称、供給済みレアリティを代表条件とする。
- Build成功・素材取得成功を視覚確認の代わりにしない。固定Previewと実装SHAを対応させ、比較画像・未解消事項をGitへ保存する。
- 細かな部品ごとのユーザー承認待ちは増やさず、実装担当がページ全体を一括照合する。

クエストの現状FIXと残件の扱いは [QUEST_UI_FIX_AND_FINAL_VERIFICATION_20260923.md](../design/quest/2026-09-22/QUEST_UI_FIX_AND_FINAL_VERIFICATION_20260923.md) を参照。
