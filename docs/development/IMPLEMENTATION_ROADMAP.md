# GAME04 — 仕様先行型 実装ロードマップ

## 0. 開発原則

本書は `MILESTONES.md` の上位Gateを実開発工程へ分解した正本である。

> **可能な限り先に仕様を確定する。各機能は機能単位で実装・Acceptanceまで完了させる。チュートリアル／初回ユーザージャーニーは、遷移先機能が安定した後に最後に構築する。**

GAME03ではチュートリアルを先に作ったため、ガチャ、編成、クエスト、バトル、ホーム、PvP、レイド、ギルド等の変更がチュートリアルへ波及した。GAME04ではこの順序を逆転させる。

GAME03に値や仕様があることを理由に、GAME04の未確定仕様を暗黙に確定してはならない。GAME04仕様、サークルとの承認済み合意、GAME04 Canonical Master、GAME04 Acceptance記録を正本とする。

GAME03からはAuthentication / Player、Ownership / Inventory、Reward / Idempotency、RLS / RPC / Migration、Server Authority、Battle Result / Replay Authority、Social、Payment / Operations / Analytics、Mobile Acceptance等の承認済み技術契約を再利用する。GAME03のMaster値、固有名詞、Economy、Schedule、Tutorial Flow、Competition前提、Visual、Contentは自動継承しない。

## 1. 全体工程

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

**A0 Base Environment — COMPLETE**  
GitHub、Next.js / React / TypeScript、CI、Vercel、独立dev-clean、Secret境界。

**A1 Common Core Minimum — COMPLETE**  
Authentication / Player、Profile Authority、Inventory Projection、Server-owned Reward、Retry-safe Claim、Migration Discipline、GAME03 / Common / GAME04境界。

**A2 Engineering Readiness — COMPLETE**  
Bootstrap、Test Layer、Lifecycle UX、Asset Delivery、Observability、Operations / Feature State / Maintenance、Dependency Security。

これはゲーム本体の全機能ではなく、GAME04固有機能を実装するための基盤である。

---

# B — GAME04 Shell / Design基盤

**B0 Application Shell**：Title / Auth、Protected Home、Mobile Shell、Header / Footer / Navigation、Safe Area、Loading / Error / Dialog。

**B1 Home Visual Shell**：共有済みHome UI GuidelineとHome Mockを基準とする。Player / Resource、Leader Character、Side Navigation、Quest / Guild、Banner、Footerの枠は先行実装可能。ただし枠の存在を機能仕様の承認とはみなさない。

**B2 Design System Freeze**：ページ量産前にColor、Typography、Spacing、Button / Card / Dialog、Badge、Rarity、Loading / Disabled / Coming Soon、Viewport、Asset Safe Zoneを確定する。

---

# C — 仕様確定

依存仕様が承認されるまでGameplay本実装へ入らない。仕様判断に必要な最小PoCのみ例外とする。

| ID | 仕様領域 | 実装前に確定する主項目 |
|---|---|---|
| C0 | Product / Core Loop | Product Pillar、Daily / Long-term Loop、Character Ownership、Push / Fandom、Community、Cooperation > Competition |
| C1 | World / Naming | ゲーム・世界・都市・施設名、各種用語、Resource名、UI Label、実装用ID |
| C2 | Character | 初期20体、Master Contract、Species、ケモ度、Gender、Role、Rarity、Stats、Profile、Leader / Favorite |
| C3 | Awakening | 覚醒段階、Duplicate / Material、性能、+0 / +3 / +5 Creative、Animation、Persistence |
| C4 | Economy | Currency、AP / Stamina、Material / Item、Source / Sink、Wallet / Ledger、Cap、Server Time |
| C5 | Gacha | Category、Banner、Price、Rate、Pity / Ceiling、Duplicate、Free、History、Initial Grant |
| C6 | Growth / Formation | Level / EXP、Party Size、Formation、Leader、Skill / Equipment採用可否、総合力 |
| C7 | Battle | Stats、Action Order、Targeting、Damage / Heal / Status、Skill、Result、Replay、Speed / Skip |
| C8 | Quest / PvE | Content分類、Progression、Cost、Enemy、Clear、Repeat / Skip、Reward、Unlock |
| C9 | Raid | Release採用可否、Boss、参加、Contribution、Attempt、Reward、Ranking、Schedule |
| C10 | Guild / Social | Guild目的・人数、Join / Leave、Role、Discovery、Chat / BBS / Activity、Moderation |
| C11 | Push / Fandom | Support入力、集計、Fandom表示、同推しDiscovery、Shared Goal、Reward、Ranking要否 |
| C12 | Competition | PvP / Ranking / GvGを個別にRelease / Post-release / Omitで決定 |
| C13 | Retention | Idle Reward、Login Bonus、Daily / Weekly Mission、Present、Event、Notification |
| C14 | Shop / Payment | Catalog、Price、Paid Item、Limit、History、Refund / Reconciliation、Release Gate |
| C15 | Analytics / Admin | Character、Awakening、Gacha、Community、Fandom、Retention、Monetization、Moderation Event |
| C16 | Page Map / UX | 全Page Inventory、Navigation Graph、Authority、Loading / Error / Empty、CTA、Mobile First View |
| C17 | Master Catalog | Character、Species、Awakening、Growth、Item、Gacha、Battle、Enemy、Quest、Raid、Guild、Fandom、Mission、Shop等 |

**C終了条件**：未確定項目をPost-release / Omit / Isolatedのいずれかに明示し、実装開始済み機能へ後から暗黙に影響しないこと。

---

# D — Master / Content Architecture

**D0 Canonical Master Framework**：ID規約、Schema / Version、Validation、Loader、Migration / Seed、Environment Parity、Legacy Reject、Review Path。

**D1 Runtime Schema Expansion**：承認済みUser Stateのみ追加。Character Ownership、Currency / Item、Growth / Awakening、Formation、Progression、Fandom / Support、Community等についてRLS、RPC、Grant、FK、Idempotency、Reset影響、Contract Testを一組で実装する。

**D2 Asset / Content Contract**：Asset ID / Path、Character Base / Awakening Variant、Thumbnail / Card / Full-body、Animation / Fallback、Background / UI / Banner、Cache / Version、Missing Asset Behavior。

---

# E — 機能単位実装

各機能は必ず以下の順で完成させる。

```text
承認済み仕様 → Master → DB / Authority → Runtime → Page / UI
→ Automated Test → Mobile Human Acceptance → COMPLETE
```

| ID | 機能 | 主な完成範囲 |
|---|---|---|
| E0 | Character Foundation | Master、Ownership、一覧 / 詳細、Leader / Favorite、Home接続 |
| E1 | Asset / Animation | 1〜3体PoC、Idle / Tap / Battle Hook、Awakening、Fallback、Safari検証後にPipeline Freeze |
| E2 | Inventory / Economy | Currency / Item / Material、必要時Wallet、Reward接続、Inventory UI |
| E3 | Gacha | Server Draw、Pity / Ceiling、Ownership Grant、Duplicate、Banner、演出、Result、History |
| E4 | Growth / Awakening | Level、Material、Awakening、Creative Evolution、Before / After、Home更新 |
| E5 | Formation / Loadout | Party Edit、Leader、Ownership Validation、Save Authority、Battle Handoff |
| E6 | Battle | GAME04 Master接続、Stats、Animation、Damage / Status / Result、Speed / Skip、Stress Acceptance |
| E7 | Quest / Dungeon | Master、Progression、Start / Cost、Battle、Clear / Reward、Result / Retry / Next |
| E8 | Raid | 採用時のみBoss、Attempt、Battle、Contribution、Reward、Projection |
| E9 | Guild / Community | Create / Join / Leave、Role、Discovery、Member、Activity、Chat / BBS、Moderation |
| E10 | Push / Fandom | Support Event、Authoritative Aggregation、Projection、同推しDiscovery、UI |
| E11 | Shared Goal | Character共同活動、Progress、Completion / Reward、Event Lifecycle |
| E12 | Competition | 採用済みPvP / Ranking / GvGをそれぞれ独立Gateで実装 |
| E13 | Retention / Reward | Idle Reward、Login Bonus、Mission、Present、Event Reward |
| E14 | Shop / Payment | Product Master、Payment、Webhook、Idempotency、Reconciliation、Refund |
| E15 | Utility | Notification、News、Settings、Support、Legal |
| E16 | Analytics / Admin | Product Event、Dashboard、Content Control、Moderation / Admin、Runbook |

ページが表示されたことだけではCOMPLETEとしない。

---

# F — 初期コンテンツ制作

System実装とContent Productionは別Trackとする。

- **F0 初期20Character**：Master、Art、Awakening Creative、Animation、Profile / Story、Battle Data、Validation。
- **F1 Release PvE**：Quest / Dungeon、Enemy、採用時Raid、Reward Table。
- **F2 Release Economy / Gacha**：Banner / Pool、Initial / Free Grant、Material / Reward、必要時Shop Product。
- **F3 Release Community / Event**：Shared Goal、Mission、Login Cycle、Launch Event、News。

---

# G — 機能横断統合

単体Acceptance済み機能だけを接続する。

- **G0 Home Runtime**：Placeholderを実データ・実Routeへ置換。
- **G1 Navigation / State**：Transition、Back、Deep Link、Reload、Session Expiry、Async Lock、Empty / Error、Cross-feature Refresh。
- **G2 Economy / Reward**：全Source / Sink / Reward Pathを横断監査。
- **G3 Social / Projection**：Profile、Leader Character、Activity、Guild、Fandom、採用時Ranking、Stale Projectionを監査。
- **G4 Full Feature Acceptance**：Tutorial着手前にRelease対象機能が独立PASS済みであること。

---

# H — チュートリアル / 初回ユーザージャーニー

**この工程を意図的に最後へ置く。**

- **H0 Journey Design**：完成済み機能だけを使い、World Intro、Auth、Initial Grant、Character Acquisition、Growth、Formation / Battle / PvE、Home、Community / Guild / Fandom、Mission Guidanceを設計。
- **H1 Tutorial State Machine**：Progress、One-time Grant、Resume / Reload、Auth Round-trip、Skip / Recovery採用時、Idempotent Completion。
- **H2 Tutorial Presentation**：遷移先Logicを変更せずGuide Overlay、Dialogue、Spotlight、CTA Lock、World Introを追加。
- **H3 Fresh User Acceptance**：Fresh Dataと対象Mobile Viewportで全JourneyをHuman Acceptance。Tutorial不具合を理由にAcceptance済み機能を安易に再設計しない。

---

# I — 総合Acceptance / Release Integration

- **I0 Full Journey Regression**：Fresh / Returning、Reload / Background、Low Network、Session Expiry、Duplicate Action、Reward、Projection、Mobile Layout。
- **I1 Performance / Asset / Audio**：Cold / Warm Load、Animation Memory、Prefetch / Fallback、Long Session、Background / Foreground、Audio Lifecycle、Horizontal Overflow 0。
- **I2 Preview**：独立Preview DB、Migration、RLS / RPC / Grant、OAuth、Real Data、Accepted Deployment SHA。
- **I3 Production Integration**：Schema Baseline、Forward Migration、Secret / Env、Feature State、Backup、QA / Mock OFF、Support / Legal / Maintenance、Release Data。
- **I4 RC Human Acceptance**：390×844、412×915、iPhone Safari、Android Chrome、必要なIn-app Browser。

---

# J — Pre-open

実ユーザーでAcquisition、Character獲得 / Favorite / Use / Awakening、Community / Fandom、Retention、Monetization、Operational Stability、累積ROASを計測する。実装完了をProduct Successとはみなさない。

---

## 3. 並走原則

Authority / Data / File境界が独立している場合のみ並走する。仕様確定済みCharacter Asset制作、Freeze済みPage Specに基づくUI制作、Freeze済みSchemaへのMaster入力、Freeze済みEventへのAnalytics、Operations Toolingは並走可能。

未確定Product Ruleとその実装、競合するMigration / Authority領域、変更中の遷移先機能とTutorial Orchestrationは並走しない。

## 4. 直近の順序

```text
1. Home Shell Acceptanceを完了
2. C：仕様確定を主工程として完了
3. Page Map + Master CatalogをFreeze
4. D：Canonical Master / Runtime Architectureを構築
5. E：機能単位で実装・Acceptance
6. F：Freeze済みContractに沿って初期Content制作
7. G：Acceptance済み機能を横断統合
8. H：最後にTutorial / First User Journeyを構築
9. I：総合Acceptance / Release Integration
10. J：Pre-open
```

明示的なProduct / Release Decisionで本書を更新しない限り、この順序をGAME04の実装正本とする。
