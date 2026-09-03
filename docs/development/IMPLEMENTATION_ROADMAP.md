# GAME04 — 仕様先行型 実装ロードマップ

## 0. 開発方針

本書は `MILESTONES.md` の上位Gateを、実際の開発工程へ分解した詳細ロードマップである。

> **可能な限り先に仕様を確定する。ゲーム機能は機能単位で実装・Acceptanceまで完了させる。チュートリアル／初回ユーザージャーニーは、遷移先となる各機能が安定した後に最後に構築する。**

GAME03ではチュートリアルを先に作ったため、ガチャ、編成、クエスト、バトル、ホーム、PvP、レイド、ギルド等の遷移先機能が後から変わるたびに手戻りが発生した。GAME04ではこの順序を逆転させる。

GAME03に値や仕様が存在することを理由に、GAME04の未確定仕様を暗黙に確定してはならない。

## 1. 正本とGAME03再利用原則

GAME04の挙動については、GAME04仕様、サークルとの承認済み合意、GAME04 Canonical Master、GAME04 Acceptance記録を正本とする。

GAME03から再利用するのは、承認済みの技術契約・実装パターンを中心とする。対象例はAuthentication / Player、Ownership / Inventory、Reward / Idempotency、RLS / RPC / Migration、Server Authority、Battle Result / Replay Authority、Social基盤、Payment / Operations / Analytics基盤、Mobile Acceptance / Release Disciplineである。

一方、GAME03のMaster値、固有名詞、スケジュール、Economy、Tutorial Flow、Competition前提、Visual Presentation、ContentをGAME04の既定値として継承しない。

---

## 2. 全体工程

```text
A. Engineering Foundation                 COMPLETE
B. GAME04 Shell / Design Foundation       IN PROGRESS
C. Specification Freeze                   NEXT PRIMARY TRACK
D. Master / Content Architecture
E. Feature-by-feature Implementation
F. Initial Content Production
G. Cross-feature Integration
H. Tutorial / First User Journey          LAST GAMEPLAY CONSTRUCTION
I. Full Acceptance / Release Integration
J. Pre-open
```

日本語で表すと以下の順序となる。

```text
A. 開発基盤                              完了
B. GAME04 Shell / Design基盤              進行中
C. 仕様確定                              次の主工程
D. Master / Content Architecture
E. 機能単位実装
F. 初期コンテンツ制作
G. 機能横断統合
H. チュートリアル / 初回ユーザージャーニー  ゲーム実装の最後
I. 総合Acceptance / Release Integration
J. Pre-open
```

---

# A — 開発基盤（完了）

## A0 Base Environment — COMPLETE
GitHub、Next.js / React / TypeScript、CI、Vercel、独立したdev-clean、環境変数・Secret境界。

## A1 Common Core Minimum — COMPLETE
Authentication / Player初期化、Profile Authority、Owner Scoped Inventory Projection、Server-owned Reward、Atomic / Retry-safe Claim、Migration Discipline、GAME03 / Common / GAME04境界。

## A2 Engineering Readiness — COMPLETE
Bootstrap / Diagnostics、Test Layer、Lifecycle UX、Product-neutral Asset Delivery、Observability、Operations / Feature State / Maintenance、Dependency Security。

これらはゲーム本体の全機能ではなく、GAME04固有機能を安全に実装するための基盤である。

---

# B — GAME04 Shell / Design Foundation

## B0 Application Shell
Title / Auth接続、Protected Home、Mobile Shell、Header / Footer / Navigation、Safe Area、Loading / Error / Dialog共通状態を成立させる。

## B1 Home Visual Shell
共有済みHome UI GuidelineとHome MockをVisual / Information Hierarchyの基準とする。Player / Resource、Leader Character、Side Navigation、Quest / Guild、Banner、Footer等の構造枠は先行実装してよいが、表示枠の存在を機能仕様の承認とはみなさない。

## B2 Design System Freeze
ページ量産前に、Color、Typography、Spacing、Button / Card / Dialog、Badge、Rarity表現、Loading / Disabled / Coming Soon、Viewport、Asset Safe Zoneを確定する。

終了条件：後続ページ制作が毎回Design Systemを再発明せず、共通部品の組み合わせで進められること。

---

# C — 仕様確定

依存する仕様パッケージが承認されるまで、対象Gameplay機能の本実装へ入らない。仕様判断に必要な最小PoCのみ例外とする。

## C0 Product / Core Loop
Product Pillar、Non-goal、Daily Loop、Long-term Loop、Character Ownership、Push / Fandom、Community、Cooperation > Competition境界、Session想定を確定する。

## C1 World / Terminology / Naming
実装に必要なゲーム名、世界名、都市名、施設名、Character関連用語、Quest / Dungeon / Raid / Community用語、Resource名、UI Labelを確定する。Loreは拡張可能でもよいが、Master / UIが参照するIDとLabelは実装前に固定する。

## C2 Character System / Initial Roster
Character Master Contract、初期20Character、ID規約、Species、ケモ度、Gender配分、Role、Battle参加理由、Rarity、Stats Model、Profile / Relationship、Leader / Favorite、Story / Contentとの関係、Presentation要件を確定する。

## C3 Creative Awakening
覚醒段階、Duplicate / Material必要量、性能影響、Creative変化点、+0 / 中間 / +3 / +5 Asset Contract、Animation差分、Persistence、UI、Duplicate変換を確定する。

## C4 Economy / Wallet / Reward
Currency、有償／無償区分の要否、AP / Stamina、Material / Item、Source / Sink、Wallet / Ledger要否、Cap / Overflow、Server Time、監査要件を確定する。

## C5 Gacha / Acquisition
獲得カテゴリ、Banner、価格、確率、Rarity、保証 / Pity / Ceiling、Duplicate処理、Free Acquisition、表示義務 / History、初期付与、Retry / Idempotencyを確定する。

## C6 Growth / Formation / Loadout
Level / EXP / Resource、Awakeningとの関係、Party Size、Formation、Leader、Skill / Equipment採用可否とScope、表示する総合力 / Status計算を確定する。GAME03のSkill / Equipment構造を自動継承しない。

## C7 Battle
Party Size、Stats、Action Order、Targeting、Damage / Heal / Status、Skill、Defeat / Result、Replay Contract、Speed / Skip、Animation Hook、Presentationを確定する。Server Authorityは維持する。

## C8 Quest / Dungeon / PvE
Content分類、Progression、Cost、Enemy Master、Clear条件、Repeat / Skip、Reward、Unlock、Result / Next Actionを確定する。

## C9 Raid / Cooperative PvE
Release Scopeへの採用可否、Boss Lifecycle、参加方式、Contribution、Attempt / Cost、Reward、Ranking要否、Reset / Scheduleを確定する。

## C10 Guild / Social / Community
GAME04におけるGuildの目的、人数、Create / Join / Leave、Role / Permission、Recommendation / Discovery、Chat / BBS / Activity、Profile / Leader Character露出、Moderationを確定する。

## C11 Push / Fandom / Shared Goal
Support入力、Passive入力の有無、不正対策、Character Support State、Player-visible Fandom、同じ推しのDiscovery、Shared Character Goal、Contribution / Completion、Reward / Content Productionとの接続、Character Ranking採用可否を確定する。

## C12 Competition
PvP / Ranking / GvGをそれぞれ Release / Post-release / Omit のいずれかに明示決定する。採用時はMatching、Schedule、Scoring、Reward、Seasonを別途仕様化する。GAME03由来で暗黙採用しない。

## C13 Retention
Idle Reward、Login Bonus、Daily / Weekly Mission、Present、Event Cadence、Recurring Character Content、Notificationを確定する。

## C14 Shop / Payment
Catalog、Price、Paid Currency / Item、Purchase Limit、History、Refund / Reconciliation、Payment Release Gateを確定する。

## C15 Analytics / Admin / Operations
Character獲得 / Favorite / Use、Awakening、Gacha / Economy、Community、Fandom / Shared Goal、Retention、Monetization、Moderation、Content Returnについて必要なEventと運営要件を確定する。

## C16 Page Map / Navigation / UX
ページ量産前に全Page InventoryとNavigation Graphを確定する。対象候補はTitle / Auth、Home、Character、Growth / Awakening、Formation、Gacha / Result、Quest、Battle / Result、Raid、Guild / Community / Chat / BBS、Fandom / Shared Goal、Competition、Mission / Login Bonus / Present、Shop、News / Notification、Settings / Support / Legal。

各ページでData Authority、Loading / Error / Empty、Primary CTA、遷移元／遷移先、Mobile First View Acceptanceを定義する。

## C17 Master Catalog
採用する全MasterのContractをRuntime実装前に定義する。Character、Species、Creative / Awakening、Growth、Item / Material / Currency、Gacha / Banner / Pool、Formation、Skill / Equipment、Battle、Enemy、Quest / Dungeon、Raid、Guild Config、Fandom / Shared Goal、Mission、Login Bonus、Shop Product、Feature State / Event Schedule等を対象とする。

### C終了条件
未確定項目はPost-release / Omit / Isolatedのいずれかを明示し、実装開始済み機能へ後から暗黙に影響しない状態にする。

---

# D — Master / Content Architecture

## D0 Canonical Master Framework
ID規約、Schema / Version、Validation、Loader、Migration / Seed Policy、Environment Parity、Legacy / Default Reject、Review Pathを構築する。

## D1 Runtime Schema Expansion
承認済みGAME04仕様だけをUser Stateへ追加する。Character Ownership、Currency / Item、Growth / Awakening、Formation、Progression、Fandom / Support、Community等を対象とし、それぞれRLS、RPC、Grant、FK、Idempotency、Reset影響、Contract Testを一組で実装する。

## D2 Asset / Content Contract
Asset ID / Path、Character Base / Awakening Variant、Thumbnail / Card / Full-body、Animation / Fallback、Background / UI / Banner、Cache / Version、Missing Asset Behaviorを確定する。

---

# E — 機能単位実装

各機能は必ず以下の単位で完成させる。

```text
承認済み仕様 → Master → DB / Authority → Runtime → Page / UI
→ Automated Test → Mobile Human Acceptance → COMPLETE
```

ページが表示されたことだけではCOMPLETEとしない。

## E0 Character Foundation
Character Master、Ownership、一覧 / 詳細、Leader / Favorite、Profile / Species、Home Character接続。

## E1 Character Asset / Animation Pipeline
代表1〜3CharacterでNormalization、Idle / Tap / Battle Hook、Awakening Variant、Static Fallback、Lazy Load / Prefetch、Safari Load / Memory / Background Returnを検証し、20Character量産前にPipelineをFreezeする。

## E2 Inventory / Economy Runtime
承認済みCurrency / Item / Material、必要ならWallet / Ledger、Reward Integration、Inventory UI、必要なHistory。

## E3 Gacha / Acquisition
Master、Server Draw Authority、Pity / Ceiling、Ownership Grant、Duplicate、Banner、演出、Result、History / Disclosure。

## E4 Growth / Awakening
Level / Material、Awakening、Creative Evolution、Before / After、Character / Home Presentation更新。

## E5 Formation / Loadout
採用した機能のみ。Party Edit、Leader、Ownership Validation、Save Authority、Battle Handoff。

## E6 Battle Runtime / Presentation
共通Authority / Replay PatternをGAME04 Masterへ接続し、Stats、Character Presentation / Animation、Damage / Status / Result、Speed / Skipを実装。Mobile Stress Acceptanceを行う。

## E7 Quest / Dungeon
Master / Progression、Page、Start / Cost Transaction、Battle接続、Clear / Reward、Result / Retry / Next。

## E8 Raid / Cooperative PvE
Release Scopeの場合のみ、Boss State、Attempt、Battle、Contribution、Reward、Projectionを実装。

## E9 Guild / Community Base
Create / Join / Leave、Role、Recommendation / Discovery、Member / Profile、Activity、承認済みChat / BBS、Moderation Hook。

## E10 Push / Fandom
Support Event、Authoritative Aggregation、Character / Player Projection、同推しDiscovery、Character-centered UI / Activity。

## E11 Shared Goal / Community Event
Character単位共同活動、Progress Aggregation、Completion / Reward、Public State、Event Lifecycle。

## E12 Competition
承認済み機能のみ。PvP、Ranking、GvGはそれぞれ独立したMaster / Authority / Runtime / UI / Acceptance Gateを持つ。

## E13 Retention / Reward
Idle Reward、Login Bonus、Mission、Present、Event Reward、Future Reward Visibility。

## E14 Shop / Payment
Shop / Product Master、Payment Provider、Webhook Verification、Idempotency、Reconciliation、Refund / Chargeback、Feature Gate。

## E15 Utility Pages
Notification、News、Settings、Support、Legal。

## E16 Analytics / Admin / Operations Product Layer
承認済みProduct Event、Dashboard / Query、Content Control、Moderation / Admin Tool、Runbook。

---

# F — 初期コンテンツ制作

System実装とContent Productionは別Trackとして管理する。

## F0 初期20Character
全承認CharacterについてMaster、Art、Awakening Creative、Animation、Profile / Story、Battle Data、Validationを完了する。

## F1 Release PvE Content
Quest / Dungeon、Enemy、採用時Raid、Reward Table。

## F2 Release Economy / Gacha Content
Banner / Pool、Initial / Free Grant、Material / Reward、必要に応じShop Product。

## F3 Release Community / Event Content
Shared Goal、Mission、Login Cycle、Launch Event、News。

---

# G — 機能横断統合

単体Acceptance済み機能だけを接続する。

## G0 Home Runtime Integration
Home Shell Placeholderを実データ・実Routeへ置換する。

## G1 Navigation / State Integration
Page Transition、Back、Deep Link、Reload、Session Expiry、Async Lock、Empty / Error、Cross-feature Refreshを監査する。

## G2 Economy / Reward Integration
Gacha、Growth、Quest、Raid、Mission、Login、Community Event、Shopを横断して全Source / Sink / Reward Pathを監査する。

## G3 Social / Projection Integration
Profile、Leader Character、Activity、Guild、Fandom、採用時Ranking、Stale Projectionを監査する。

## G4 Full Feature Acceptance
Tutorial着手前に、Release対象機能がそれぞれ独立してPASS済みであること。

---

# H — チュートリアル / 初回ユーザージャーニー（最後に実装）

この工程を意図的に後ろへ置く。

## H0 Journey Design
完成済み機能を使って初めて最適なFresh User Journeyを設計する。World Intro、Auth Timing、Initial Grant、First Character Acquisition、Growth / Awakening、Formation / Battle / PvE、Home Arrival、Community / Guild / Fandom Introduction、Mission Guidanceを決定する。

## H1 Tutorial State Machine
Tutorial Progress、One-time Grant、Resume / Reload、Auth Round-trip、採用時Skip / Recovery、Idempotent Completionを実装する。

## H2 Tutorial Presentation
遷移先機能のLogicを変更せず、Guide Overlay、Dialogue、Spotlight、CTA Lock、World Introを追加する。

## H3 Fresh User Human Acceptance
Fresh Dataと対象Mobile Viewportで全Journeyを通す。Tutorial不具合はTutorial Orchestration側で直し、Acceptance済み機能を安易に再設計しない。

---

# I — 総合Acceptance / Release Integration

## I0 Full Journey Regression
Fresh / Returning User、Reload / Background、Low Network、Session Expiry、Duplicate Action、Reward Consistency、Projection Refresh、Mobile Layout。
