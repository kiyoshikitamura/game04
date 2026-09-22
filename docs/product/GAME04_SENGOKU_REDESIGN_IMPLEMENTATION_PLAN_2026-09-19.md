# GAME04 / 戦国姫艶武

## 2026-09-20 最新差分Authority

領土侵攻の導線・主催者成長・開催条件は [GAME04_TERRITORY_INVASION_AUTHORITY_2026-09-20.md](./GAME04_TERRITORY_INVASION_AUTHORITY_2026-09-20.md) を優先する。仕様FIX・実装未着手。Unlockの内部方式は維持し、Homeから領土侵攻を開催、レイド一覧は開催中の参加・再開に限定する。

# 方針転換後 全面改修計画
## 2026-09-19

## ステータス

**DEVELOPMENT PLAN / REDESIGN BASELINE**

本書は、2026-09-19までにFIXした企画・UI正本を基準として、
現行GAME04実装から新GAME04へ移行するための改修計画とする。

旧GAME04のリリース残タスク進捗は参考情報として保持するが、
今回のゲームシステム全面変更後の進捗率にはそのまま使用しない。

新しい改修計画を基準に、
現実装との差分棚卸し → 実装 → Preview受入 → 完了
を管理する。

---

# 1. Authority

## 企画 / ゲームルール
- `docs/product/GAME04_SENGOKU_PLANNING_AUTHORITY_REDESIGN_2026-09-19.md`

## バトルUI
- `docs/product/GAME04_SENGOKU_BATTLE_UI_AUTHORITY_2026-09-19.md`

## ホームUI
- `docs/product/GAME04_SENGOKU_HOME_UI_AUTHORITY_2026-09-19.md`

## クエストUI
- `docs/product/GAME04_SENGOKU_QUEST_UI_AUTHORITY_2026-09-19.md`

## 育成 / デッキ管理UI
- `docs/product/GAME04_SENGOKU_GROWTH_DECK_UI_AUTHORITY_2026-09-19.md`

## レイドUI
- `docs/product/GAME04_SENGOKU_RAID_UI_AUTHORITY_PROVISIONAL_2026-09-19.md`
- 仮FIX。実ユーザーテストで変更可能。

---

# 2. 改修方針

GAME03 / 現GAME04の共通基盤を最大限再利用する。

ただし、

**GAME03にあるから残す**

を理由にゲームシステムを維持しない。

基本分類：

## A. 原則再利用
- 認証
- ユーザー管理
- お知らせ
- プレゼントBOX
- 設定
- 通貨管理
- 所持品基盤
- Stripe単発決済
- ショップ基盤
- ガチャ基盤
- ミッション基盤
- 全体チャット
- DM
- Activity
- 共通ヘッダー / フッター
- バナー配信基盤
- Master Data運用基盤
- Supabase / Vercel / Next.js基盤

## B. 大幅改修
- Battle
- Quest
- Raid
- Character Growth
- Skill
- Equipment
- Home
- Deck / Formation
- Ranking

## C. 初期リリースから除外 / 停止
- PvP
- RATE
- PvP Ranking
- GvG
- ギルド本番公開
- ギルドチャット
- BBS
- 募集 / 攻略BBS

ギルド基盤自体は将来ギルドレイドへ利用可能なよう削除せず、
初期は非公開 / 準備中とする。

---

# 3. 実装レーン

大きく以下の7レーンで実装する。

1. Data / Master / DB
2. Battle
3. Quest
4. Character / Skill / Equipment / Deck
5. Raid
6. Home / Community
7. VIP / Monetization Extension

ガチャ / ショップの商材再設計は別途行うが、
基盤そのものを今回の全面改修ブロッカーにはしない。

---

# 4. Phase 0：現実装差分監査

実装前にREAD ONLYで現状を棚卸しする。

最低限確認：

## Battle
- 現行Battle runtime
- SPD / 行動順
- Skill発動AI
- Battle Speed
- Skip
- Result
- Battle presentation
- Quest / Raid双方のBattle接続

## Quest
- 派遣 / 時間探索
- Quest Master
- Stage / Area
- Quest reward
- Encounter Raid接続
- 行動力

## Character
- Character Master
- Lv
- Awakening
- Passive / Leader相当
- Skill Slot
- Formation
- Deck保存

## Skill
- Skill Master
- Skill Level / LB
- 所持方式
- 重複処理
- 装備処理
- Attribute

## Equipment
- 7 slot現行構成
- Equipment Lv / LB
- duplicate ownership
- dismantle
- inventory

## Raid
- Room / shared HP
- rescue
- participant
- reward
- result
- lifecycle
- ranking
- encounter
- quest connection

## Home
- icon / shortcut
- banner
- character / background
- community
- mission
- shop
- footer

## Monetization
- Stripe Checkout
- webhook
- purchase grant
- shop product Master
- existing battle skip
- battle speed control

監査結果は各項目を、

- KEEP
- MODIFY
- REMOVE / HIDE
- NEW

に分類する。

---

# 5. Phase 1：Data / Master / DB

最初に新ゲームシステムのAuthorityをDB / Masterへ落とす。

## 5.1 Attribute
6属性：

- 火
- 水
- 土
- 風
- 光
- 闇

相性：

- 火 → 風
- 風 → 土
- 土 → 水
- 水 → 火
- 光 ⇔ 闇

## 5.2 Character
追加 / 変更：

- Lv
- HP
- SP
- ATK
- DEF
- LUK
- Attribute
- Role
- Rarity
- Passive
- Passive Lv
- Awakening +0〜+5
- Skill Slot count
- 武将の魂

SPDは廃止。

## 5.3 Skill
- N / R / SR / SSR
- 6属性
- +0〜+10
- LB素材
- duplicate → LB素材
- account-wide ownership
- multi-character equip
- same character duplicate equip禁止
- consume SP
- condition
- Target Rule
- effect

## 5.4 Equipment
6 slots：

- 武器
- 頭
- 身体
- 脚
- アクセ1
- アクセ2

- N / R / SR / SSR
- Lv
- LB
- duplicate ownership
- dismantle
- parameter bonus
- no attribute

## 5.5 Quest
- Area
- Stage
- Wave
- Enemy composition
- energy cost
- first clear reward
- normal drop
- rare drop
- encounter rate
- mission binding

## 5.6 Raid
- Raid Type
- Boss
- Level
- 途中参加は個別戦闘開始時の共有Lv（個人Checkpoint廃止）
- Max participant
- Duration
- Rescue rule
- Reward
- Victory bonus
- Unlock Item
- Appearance stage

Master中心で変更可能にする。

---

# 6. Phase 2：Battle Core

今回の改修で最優先の新規ゲームコア。

## 6.1 Player
- Party 5
- 左→右固定行動順
- 個別HP
- 合計SP
- SP = Character SP合計
- SP回復 = 行動成果 × LUK / 補正
- 条件型Skill
- SP不足時通常攻撃
- 高SP Skill優先（暫定）
- Target Rule
- Wave carry over

## 6.2 BURST
- SP満タンを作ったCharacter本人が抽選
- Lv / 2 + LUK補正
- 最大80%
- Skill cost 50%
- same skill repeat allowed
- SP枯渇 or 最大5 actionで終了

## 6.3 Enemy
- 最大3体
- 個別HP
- 個別SP
- 個別Action Count
- Player actionごとにCount減少
- 0でEnemy Action
- SP最大開始
- 被弾でSP回復
- Skill連続発動
- Enemy BURSTなし
- Phase Change

## 6.4 Presentation
- Vertical Battle UI
- Enemy large visual
- Player Party state
- total SP
- BURST
- Action Count
- temporary feedback
- Result analysis

## 6.5 Speed / Skip
- 通常：×1 / ×2
- VIP：×1 / ×2 / ×3
- VIP：既存Battle Skip button有効化

---

# 7. Phase 3：Quest

旧派遣型を廃止し、Stage / Wave型へ置換。

## 7.1 UI
- Area List
- Stage List
- Stage Info Modal
- Preparation Modal
- Battle
- Result

## 7.2 Progression
- initial 10 area
- 3〜8 stage / area
- 1〜5 wave / stage
- previous clear unlock next
- area final clear unlock next area
- replay allowed

## 7.3 State
Wave間：

- HP carry
- SP carry
- dead state carry
- buff / debuff is Master-defined

## 7.4 Reward
- first clear
- normal drop
- rare drop
- LUK connection
- encounter raid roll after stage clear

---

# 8. Phase 4：Character / Skill / Equipment / Deck

## 8.1 Deck
- current 5
- left → right action order
- formation
- auto formation
- auto equipment
- auto skill
- total SP

## 8.2 Character
- owned list
- filter
- sort
- central detail modal
- Lv growth
- awakening
- soul
- skill assignment
- equipment
- full-body collection modal

## 8.3 Skill
- list
- filter
- sort
- +0〜+10
- LB material
- duplicate conversion
- account-wide sharing

## 8.4 Equipment
- list
- filter
- sort
- Lv
- LB
- equip
- dismantle
- multi-select dismantle

---

# 9. Phase 5：Raid

初期2種。

## 9.1 Encounter Raid
- Quest clear roll
- 60 min
- max 10
- shared HP
- individual battle win / lose
- unlimited attempts
- common action resource
- rescue 3
- participation reward
- defeat reward
- 3 win eligibility

## 9.2 Unlock Raid
- unlock item
- 3 days
- max 20
- level respawn
- checkpoint
- appearance change
- rescue 3 per 6 hours
- final Lv clear ends raid

## 9.3 UI
- Raid Top
- Unlock CTA
- active raid vertical list
- time ascending
- filter
- labels
- Raid Detail
- Enemy Info
- Participants
- Reward
- Rescue
- Contribution
- shared Preparation Modal

レイドUIは仮FIXのため、Preview / user testで変更可能。

---

# 10. Phase 6：Home / Community

## Home
- identity header
- selected home character
- selected background
- encounter alert
- Quest resume
- Mission
- Shop
- future Guild
- Activity
- Global Chat
- DM
- thin rotation banner
- shared footer

## Community
初期：

- Activity
- Global Chat
- DM

非公開：

- Guild Chat
- BBS

---

# 11. Phase 7：VIP Pass

## Product
- 30日有効
- Stripe Subscriptionは使用しない
- existing one-time Checkout
- item / entitlement grant
- Master Data管理

## Benefit
VIP active中：

- Battle Skip button有効
- Speed button:
  - ×1
  - ×2
  - ×3
  - ×1

Non-VIP：

- ×1
- ×2
- ×1

新しい操作UIは増やさない。

VIPの価格・商品内容・付与物はMaster Dataで後日FIX可能。

---

# 12. 初期リリースから外すもの

- PvP
- RATE
- PvP Ranking
- GvG
- Guild Raid
- Guild Chat
- BBS
- 募集 / 攻略
- 旧Quest派遣 / 時間探索

コード削除が危険な場合は、
まずFeature Exposureを止め、
新ループ受入後にdead code cleanupする。

---

# 13. 実装順序

依存関係から以下を推奨する。

## M1
Data / Master / DB

## M2
Battle Core

## M3
Character / Skill / Equipment / Deck

## M4
Quest

## M5
Raid

## M6
Home / Community

## M7
VIP

## M8
Tutorial再設計

## M9
Economy / Gacha / Shop商品最終調整

## M10
統合受入 / Release

Tutorialは本体機能完成後に最後に接続する。

---

# 14. 開発管理

各タスクは以下のStatusで管理する。

- 未FIX
- 未着手
- 着手中
- Preview反映済
- 最終確認中
- 完了

進捗率：

- Preview反映率
- 完了率

を分離して表示する。

---

# 15. 次工程

次に行うこと：

1. 現Repository / DBのREAD ONLY棚卸し
2. 各機能を KEEP / MODIFY / REMOVE / NEW へ分類
3. File / Table / RPC / Master単位の差分表を作成
4. 新改修タスク一覧を作成
5. 実装順序 / 依存関係を付与
6. Preview基準ブランチを確定
7. M1から開発開始

## 本流決定の反映（2026-09-19）

2026-09-19 本流決定：ランキングは初期リリース対象外。Unlock Raidの個人途中参加Checkpointは正式削除。途中参加者も戦闘開始時の共有Lvで個別バトルを行う。個別勝敗・Raid全体3勝資格・非遡及報酬・共有Lv連動の敵強化は維持。

M5-06は仕様FIX済み・実装未着手。出撃停止条件、Checkpoint表示・項目依存を除去し、見た目段階の切替は維持する。M6-05の新ランキング設計・実装は初期母集団から除外する。
