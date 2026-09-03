# GAME04 — 仕様先行型 実装ロードマップ

## 0. 開発原則

本書は `MILESTONES.md` の上位Gateを、実際の開発工程へ分解した正本ロードマップである。

> **可能な限り先に仕様を確定する。各機能は機能単位で実装・Acceptanceまで完了させる。チュートリアル／初回ユーザージャーニーは、遷移先機能が安定した後に最後に構築する。**

GAME03ではチュートリアルを先に作ったため、ガチャ、編成、クエスト、バトル、ホーム、PvP、レイド、ギルド等の変更がチュートリアルへ波及し、手戻りが増えた。GAME04ではこの順序を逆転させる。

GAME03に値や仕様が存在することを理由に、GAME04の未確定仕様を暗黙に確定してはならない。

## 1. 正本とGAME03再利用原則

GAME04の挙動は、GAME04仕様、サークルとの承認済み合意、GAME04 Canonical Master、GAME04 Acceptance記録を正本とする。

GAME03から再利用するのは、承認済みの技術契約・実装パターンを中心とする。Authentication / Player、Ownership / Inventory、Reward / Idempotency、RLS / RPC / Migration、Server Authority、Battle Result / Replay Authority、Social基盤、Payment / Operations / Analytics基盤、Mobile Acceptance / Release Discipline等が対象となる。

GAME03のMaster値、固有名詞、Schedule、Economy、Tutorial Flow、Competition前提、Visual Presentation、ContentはGAME04の既定値として継承しない。

---

## 2. 全体工程

```text
A. 開発基盤                              COMPLETE
B. GAME04 Shell / Design基盤              IN PROGRESS
C. 仕様確定                              NEXT PRIMARY TRACK
D. Master / Content Architecture
E. 機能単位実装
F. 初期コンテンツ制作
G. 機能横断統合
H. チュートリアル / 初回ユーザージャーニー  最後に実装
I. 総合Acceptance / Release Integration
J. Pre-open
```

---

# A — 開発基盤

## A0 Base Environment — COMPLETE
GitHub、Next.js / React / TypeScript、CI、Vercel、独立dev-clean、環境変数・Secret境界。

## A1 Common Core Minimum — COMPLETE
Authentication / Player、Profile Authority、Owner Scoped Inventory、Server-owned Reward、Atomic / Retry-safe Claim、Migration Discipline、GAME03 / Common / GAME04境界。

## A2 Engineering Readiness — COMPLETE
Bootstrap / Diagnostics、Test Layer、Lifecycle UX、Asset Delivery、Observability、Operations / Feature State / Maintenance、Dependency Security。

※これはゲーム本体の全機能ではなく、GAME04固有機能を安全に実装するための基盤である。

---

# B — GAME04 Shell / Design基盤

## B0 Application Shell
Title / Auth、Protected Home、Mobile Shell、Header / Footer / Navigation、Safe Area、Loading / Error / Dialogを成立させる。

## B1 Home Visual Shell
共有済みHome UI GuidelineとHome MockをVisual / Information Hierarchyの基準とする。Player / Resource、Leader Character、Side Navigation、Quest / Guild、Banner、Footerの構造枠は先行実装してよいが、表示枠の存在を機能仕様の承認とはみなさない。

## B2 Design System Freeze
ページ量産前にColor、Typography、Spacing、Button / Card / Dialog、Badge、Rarity表現、Loading / Disabled / Coming Soon、Viewport、Asset Safe Zoneを確定する。

---

# C — 仕様確定

依存仕様が承認されるまでGameplay本実装へ入らない。仕様判断に必要な最小PoCのみ例外とする。

## C0 Product / Core Loop
Product Pillar、Non-goal、Daily Loop、Long-term Loop、Character Ownership、Push / Fandom、Community、Cooperation > Competition境界、Session想定。

## C1 World / Terminology / Naming
ゲーム名、世界名、都市名、施設名、Character関連用語、Quest / Dungeon / Raid / Community用語、Resource名、UI Label。Loreは拡張可能でもよいが、Master / UI参照IDとLabelは実装前に固定する。

## C2 Character System / Initial Roster
Character Master Contract、初期20Character、ID、Species、ケモ度、Gender配分、Role、Battle参加理由、Rarity、Stats、Profile / Relationship、Leader / Favorite、Story / Content、Presentation要件。

## C3 Creative Awakening
覚醒段階、Duplicate / Material、性能影響、Creative変化点、+0 / 中間 / +3 / +5 Asset Contract、Animation差分、Persistence、UI、Duplicate変換。

## C4 Economy / Wallet / Reward
Currency、有償／無償区分、AP / Stamina、Material / Item、Source / Sink、Wallet / Ledger要否、Cap / Overflow、Server Time、監査要件。

## C5 Gacha / Acquisition
獲得カテゴリ、Banner、価格、確率、Rarity、保証 / Pity / Ceiling、Duplicate、Free Acquisition、History / Disclosure、初期付与、Retry / Idempotency。

## C6 Growth / Formation / Loadout
Level / EXP / Resource、Awakening、Party Size、Formation、Leader、Skill / Equipment採用可否、総合力 / Status。GAME03のSkill / Equipment構造は自動継承しない。

## C7 Battle
Party Size、Stats、Action Order、Targeting、Damage / Heal / Status、Skill、Defeat / Result、Replay、Speed / Skip、Animation Hook、Presentation。Server Authorityは維持する。

## C8 Quest / Dungeon / PvE
Content分類、Progression、Cost、Enemy Master、Clear、Repeat / Skip、Reward、Unlock、Result / Next Action。

## C9 Raid / Cooperative PvE
Release Scope採用可否、Boss Lifecycle、参加方式、Contribution、Attempt / Cost、Reward、Ranking要否、Reset / Schedule。

## C10 Guild / Social / Community
Guildの目的、人数、Create / Join / Leave、Role / Permission、Recommendation / Discovery、Chat / BBS / Activity、Profile / Leader露出、Moderation。

## C11 Push / Fandom / Shared Goal
Support入力、Passive入力、不正対策、Character Support State、Fandom表示、同推しDiscovery、Shared Character Goal、Contribution / Completion、Reward / Content Production接続、Character Ranking採用可否。

## C12 Competition
PvP / Ranking / GvGを個別に Release / Post-release / Omit で決定する。採用時はMatching、Schedule、Scoring、Reward、Seasonを別仕様化する。

## C13 Retention
Idle Reward、Login Bonus、Daily / Weekly Mission、Present、Event Cadence、Recurring Character Content、Notification。

## C14 Shop / Payment
Catalog、Price、Paid Currency / Item、Purchase Limit、History、Refund / Reconciliation、Payment Release Gate。

## C15 Analytics / Admin / Operations
Character獲得 / Favorite / Use、Awakening、Gacha / Economy、Community、Fandom / Shared Goal、Retention、Monetization、Moderation、Content ReturnのEventと運営要件。

## C16 Page Map / Navigation / UX
ページ量産前に全Page InventoryとNavigation Graphを確定する。各ページにData Authority、Loading / Error / Empty、Primary CTA、遷移元／遷移先、Mobile First View Acceptanceを定義する。

対象候補：Title / Auth、Home、Character、Growth / Awakening、Formation、Gacha / Result、Quest、Battle / Result、Raid、Guild / Community / Chat / BBS、Fandom / Shared Goal、Competition、Mission / Login Bonus / Present、Shop、News / Notification、Settings / Support / Legal。

## C17 Master Catalog
採用する全Master ContractをRuntime実装前に定義する。Character、Species、Creative / Awakening、Growth、Item / Material / Currency、Gacha / Banner / Pool、Formation、Skill / Equipment、Battle、Enemy、Quest / Dungeon、Raid、Guild Config、Fandom / Shared Goal、Mission、Login Bonus、Shop Product、Feature State / Event Schedule等。

### C終了条件
未確定項目をPost-release / Omit / Isolatedのいずれかに明示し、実装開始済み機能へ後から暗黙に影響しない状態にする。

---

# D — Master / Content Architecture

## D0 Canonical Master Framework
ID規約、Schema / Version、Validation、Loader、Migration / Seed Policy、Environment Parity、Legacy / Default Reject、Review Path。

## D1 Runtime Schema Expansion
承認済み仕様だけをUser Stateへ追加する。Character Ownership、Currency / Item、Growth / Awakening、Formation、Progression、Fandom / Support、Community等について、RLS、RPC、Grant、FK、Idempotency、Reset影響、Contract Testを一組で実装する。

## D2 Asset / Content Contract
Asset ID / Path、Character Base / Awakening Variant、Thumbnail / Card / Full-body、Animation / Fallback、Background / UI / Banner、Cache / Version、Missing Asset Behavior。

---

# E — 機能単位実装

全機能を以下の順で独立完成させる。

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
Currency / Item / Material、必要時Wallet / Ledger、Reward Integration、Inventory UI、History。

## E3 Gacha / Acquisition
Master、Server Draw Authority、Pity / Ceiling、Ownership Grant、Duplicate、Banner、演出、Result、History / Disclosure。

## E4 Growth / Awakening
Level / Material、Awakening、Creative Evolution、Before / After、Character / Home更新。

## E5 Formation / Loadout
採用機能のみ。Party Edit、Leader、Ownership Validation、Save Authority、Battle Handoff。

## E6 Battle Runtime / Presentation
共通Authority / Replay PatternをGAME04 Masterへ接続し、Stats、Character Presentation / Animation、Damage / Status / Result、Speed / Skipを実装。Mobile Stress Acceptanceを行う。

## E7 Quest / Dungeon
Master / Progression、Page、Start / Cost Transaction、Battle接続、Clear / Reward、Result / Retry / Next。

## E8 Raid / Cooperative PvE
Release Scopeの場合のみBoss State、Attempt、Battle、Contribution、Reward、Projection。

## E9 Guild / Community Base
Create / Join / Leave、Role、Recommendation / Discovery、Member / Profile、Activity、Chat / BBS、Moderation Hook。

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
Product Event、Dashboard / Query、Content Control、Moderation / Admin Tool、Runbook。

---

# F — 初期コンテンツ制作

System実装とContent Productionは別Trackとして管理する。

- **F0 初期20Character**：Master、Art、Awakening Creative、Animation、Profile / Story、Battle Data、Validation。
- **F1 Release PvE Content**：Quest / Dungeon、Enemy、採用時Raid、Reward Table。
- **F2 Release Economy / Gacha Content**：Banner / Pool、Initial / Free Grant、Material / Reward、必要時Shop Product。
- **F3 Release Community / Event Content**：Shared Goal、Mission、Login Cycle、Launch Event、News。

---

# G — 機能横断統合

単体Acceptance済み機能だけを接続する。

- **G0 Home Runtime Integration**：Home Shell Placeholderを実データ・実Routeへ置換。
- **G1 Navigation / State Integration**：Transition、Back、Deep Link、Reload、Session Expiry、Async Lock、Empty / Error、Cross-feature Refresh。
- **G2 Economy / Reward Integration**：Gacha、Growth、Quest、Raid、Mission、Login、Community Event、Shopを横断してSource / Sink / Reward Pathを監査。
- **G3 Social / Projection Integration**：Profile、Leader Character、Activity、Guild、Fandom、採用時Ranking、Stale Projectionを監査。
- **G4 Full Feature Acceptance**：Tutorial着手前にRelease対象機能がそれぞれ独立PASS済みであること。

---

# H — チュートリアル / 初回ユーザージャーニー（最後に実装）

## H0 Journey Design
完成済み機能だけを使い、World Intro、Auth Timing、Initial Grant、First Character Acquisition、Growth / Awakening、Formation / Battle / PvE、Home Arrival、Community / Guild / Fandom Introduction、Mission Guidanceを設計する。

## H1 Tutorial State Machine
Tutorial Progress、One-time Grant、Resume / Reload、Auth Round-trip、採用時Skip / Recovery、Idempotent Completion。

## H2 Tutorial Presentation
遷移先機能のLogicを変更せず、Guide Overlay、Dialogue、Spotlight、CTA Lock、World Introを追加する。

## H3 Fresh User Human Acceptance
Fresh Dataと対象Mobile Viewportで全Journeyを通す。Tutorial不具合はTutorial Orchestration側で直し、Acceptance済み機能を安易に再設計しない。

---

# I — 総合Acceptance / Release Integration

- **I0 Full Journey Regression**：Fresh / Returning User、Reload / Background、Low Network、Session Expiry、Duplicate Action、Reward Consistency、Projection Refresh、Mobile Layout。
- **I1 Performance / Asset / Audio**：Cold / Warm Load、Character / Animation Memory、Prefetch / Fallback、Long Session、Background / Foreground、Audio Lifecycle、Horizontal Overflow 0。
- **I2 Preview Environment**：独立Preview DB、Migration、RLS / RPC / Grant、OAuth、Real Data、Accepted Deployment SHA。
- **I3 Production Integration**：Schema Baseline、Forward Migration、Secret / Env、Feature State、Backup、QA / Mock OFF、Support / Legal / Maintenance、Release Data確認。
- **I4 Release Candidate Human Acceptance**：390×844、412×915、iPhone Safari、Android Chrome、必要なIn-app Browser。

---

# J — Pre-open

実ユーザーでAcquisition、Character獲得 / Favorite / Use / Awakening、Community / Fandom参加、Retention、Monetization、Operational Stability、累積ROASを計測する。実装完了をProduct Successとはみなさない。

---

## 3. 並走原則

Authority / Data / File境界が独立している場合のみ並走する。仕様確定済みCharacter Asset制作、Freeze済みPage Specに基づくUI制作、Freeze済みSchemaへのMaster入力、Freeze済みEventへのAnalytics実装、Operations Tooling等は並走可能。

未確定Product Ruleとその