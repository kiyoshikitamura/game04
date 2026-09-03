# GAME04 — Specification-first implementation roadmap

## 0. Development policy

This is the detailed implementation roadmap below `MILESTONES.md`.

> **Freeze specifications as far as practical first. Complete and accept gameplay features one by one. Build Tutorial / First User Journey only after its destination features are stable.**

GAME03 proved the reusable engineering patterns, but tutorial-first development caused rework while Gacha, Formation, Quest, Battle, Home, PvP, Raid, Guild and related destinations were still changing. GAME04 reverses that order.

A currently UNFIXED rule never becomes implementation truth because GAME03 had a value for it.

## 1. Authority and reuse

GAME04 product specs, approved Circle decisions, GAME04 canonical Master and GAME04 acceptance evidence are authoritative.

Current FIX direction from the Development Start Handoff includes: Furry/Kemono theme, general-audience Web game, multi-species fantasy, bright daily-life tone, initial 20 Characters with female 15 / male 5 basic direction, Character-centered value, Character Gacha center, Creative evolution through Awakening, Push/Fandom, Community emphasis, Common Game Core reuse, partner asset model and general/adult-content separation.

Open decisions include formal title/place names, detailed roster/Master, Gacha price/rate, duplicate requirements, Creative states, Guild size, PvP/GvG, Support formula, Character Ranking, Shared Goal, Raid, Economy, Quest/Mission and release schedule.

Reuse GAME03 only for accepted technical contracts/patterns: Auth/Player, ownership/Inventory, Reward/idempotency, RLS/RPC/migrations, server authority, Battle result/replay authority, social infrastructure, payment/operations/analytics patterns and mobile/release discipline. Do not inherit GAME03 Masters, values, terminology, schedules, economy, tutorial flow, competition assumptions, visual presentation or content.

---

## 2. Overall order

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

---

# A — Accepted engineering foundation

## A0 Base Environment — COMPLETE
GitHub, Next.js/React/TypeScript, CI, Vercel, isolated dev-clean, environment/secret boundaries.

## A1 Common Core Minimum — COMPLETE
Auth/Player initialization, profile authority, owner-scoped Inventory projection, server Reward delivery, atomic/retry-safe claims, migration discipline, GAME03/Common/GAME04 boundary.

## A2 Engineering Readiness — COMPLETE
Bootstrap/diagnostics, test layers, lifecycle UX, neutral asset delivery, observability, operations/feature-state/maintenance and dependency-security baseline.

These are platform foundations, not the complete Common Game Core feature set.

---

# B — GAME04 Shell / Design Foundation

## B0 Application Shell
Title/Auth connection, protected Home, mobile shell, Header/Footer/navigation primitives, safe area, loading/error/dialog states.

## B1 Home Visual Shell
Use the approved Home guideline/mock as visual/information-hierarchy reference. Structural slots may exist for Player/resources, Leader Character, side navigation, Quest/Guild, banner and footer without approving the underlying gameplay.

## B2 Design System Freeze
Before page-scale production freeze color, typography, spacing, button/card/dialog hierarchy, badge/state rules, rarity presentation, loading/disabled/coming-soon states, viewport rules and asset safe zones.

Exit: later pages should mostly compose a shared system rather than reinvent it.

---

# C — Specification Freeze

Full gameplay implementation is blocked until its dependent specification package is accepted. Small technical PoCs are allowed only when needed to make a decision.

## C0 Product / Core Loop
Product pillars/non-goals, daily loop, long-term loop, Character ownership, Push/Fandom, Community, Cooperation > Competition boundary, session expectations.

## C1 World / Terminology / Naming
Implementation-facing game/world/city/facility names, Character-facing terminology, Quest/Dungeon/Raid/Community terms, resource names and UI labels. Lore may remain expandable; IDs/labels required by Master/UI may not.

## C2 Character System / Initial Roster
Character Master contract, initial 20 subjects, IDs, species/Kemono level/gender distribution, role/combat reason, rarity, stats model, profile/relationship fields, Leader/favorite semantics, story/content relationship and presentation requirements.

## C3 Creative Awakening
Awakening states, duplicate/material requirements, stat impact, Creative change points, +0/intermediate/+3/+5 asset contract, animation differences, persistence, UI and duplicate conversion.

## C4 Economy / Wallet / Reward
Currencies, paid/free separation if applicable, AP/stamina, materials/items, sources/sinks, Wallet/ledger requirement, caps/overflow, server time and audit rules.

## C5 Gacha / Acquisition
Acquisition categories, banners, price/rates/rarity, guarantee/pity/ceiling, duplicate handling, free acquisition, disclosure/history, initial grants and retry/idempotency contract.

## C6 Growth / Formation / Loadout
Level/EXP/resources, Awakening relationship, team size, formation, Leader behavior, Skill/Equipment adoption and scope if any, exposed power/status calculation. GAME03 Skill/Equipment is not assumed.

## C7 Battle
Party size, stats, action order, targeting, damage/heal/status, skills, defeat/result, replay compatibility, speed/skip, animation hooks and presentation. Server authority remains non-negotiable.

## C8 Quest / Dungeon / PvE
Content taxonomy, progression, cost, Enemy Master, clear/repeat/skip, Reward, unlock and Result behavior.

## C9 Raid / Cooperative PvE
Launch adoption, boss lifecycle, participation, contribution, attempts/cost, rewards, ranking if any, reset/schedule.

## C10 Guild / Social / Community
GAME04 Guild purpose, size, create/join/leave, roles, discovery, Chat/BBS/Activity, profile/Leader exposure and moderation.

## C11 Push / Fandom / Shared Goal
Support inputs, passive inputs if any, anti-abuse, Support state, visible Fandom representation, same-favorite discovery, shared Character goals, contribution/completion, reward/content-production connection and Character Ranking adoption/omission.

## C12 Competition
Explicitly decide PvP, Ranking and GvG as launch / post-launch / omit. Adopted systems then require separate matching/schedule/scoring/reward/season specifications. Competition must not enter by GAME03 inheritance.

## C13 Retention
Idle reward, Login Bonus, Daily/Weekly Mission, Present, Event cadence, recurring Character content and notifications.

## C14 Shop / Payment
Catalog, prices, paid currency/items, limits, purchase history, refund/reconciliation and payment release gate.

## C15 Analytics / Admin / Operations
Product events and operational requirements for Character acquisition/favorite/use, Awakening, Gacha/economy, Community, Fandom/shared goals, retention, monetization, moderation and content-return behavior.

## C16 Page Map / Navigation / UX
Freeze the complete page inventory and route graph before page production: Title/Auth, Home, Character, Growth/Awakening, Formation if adopted, Gacha/Result, Quest, Battle/Result, Raid if adopted, Guild/Community/Chat/BBS, Fandom/Shared Goal, competition pages if adopted, Mission/Login/Present, Shop, News/Notification, Settings/Support/Legal. Every page specifies authority, loading/error/empty states, CTA, navigation and mobile first-view acceptance.

## C17 Master Catalog
Define authoritative contracts for every adopted Master before runtime work: Character, Species, Creative/Awakening, Growth, Item/Material/Currency, Gacha/Banner/Pool, Formation, Skill/Equipment if adopted, Battle, Enemy, Quest/Dungeon, Raid, Guild config, Fandom/Shared Goal, Mission, Login Bonus, Shop product, Feature State/Event Schedule.

### Specification Freeze exit
Unresolved items must be explicitly post-launch, omitted, or isolated so they cannot silently change already-started feature implementations.

---

# D — Master / Content Architecture

## D0 Canonical Master Framework
ID conventions, schema/versioning, validation, loader, migration/seed policy, environment parity, legacy/default rejection and review path.

## D1 Runtime Schema Expansion
Create only accepted GAME04 state: Character ownership, currencies/items, Growth/Awakening, Formation, progression, Fandom/Support, Community and other approved features. Every set includes RLS, RPC, grants, FK, idempotency, reset implications and contract tests.

## D2 Asset / Content Contract
Asset IDs/paths, Character base/Awakening variants, thumbnails/cards/full-body, animation/fallback relation, backgrounds/UI/banners, cache/version and missing-asset behavior.

---

# E — Feature-by-feature implementation

Every feature follows:

```text
Accepted Spec → Master → DB/Authority → Runtime → Page/UI
→ Automated Test → Mobile Human Acceptance → COMPLETE
```

A rendered page is not a completed feature.

## E0 Character Foundation
Canonical Character Master, ownership, list/detail pages, Leader/favorite, profile/species and Home Character connection.

## E1 Character Asset / Animation Pipeline
Use 1–3 representative approved Characters to prove normalization, Idle/Tap/approved Battle hooks, Awakening variants, static fallback, lazy-load/prefetch and Safari load/memory/background return. Freeze the pipeline before 20-Character animation production.

## E2 Inventory / Economy Runtime
Approved currencies/items/materials, Wallet/ledger if required, Reward integration, Inventory presentation and required history.

## E3 Gacha / Acquisition
Master, server draw authority, pity/ceiling, ownership grant, duplicate handling, banner, presentation, Result and disclosure/history.

## E4 Growth / Awakening
Level/materials, Awakening, Creative evolution, before/after state and Character/Home refresh.

## E5 Formation / Loadout
Only adopted systems: party edit, Leader, ownership validation, save authority and Battle handoff.

## E6 Battle Runtime / Presentation
Adapt accepted common authority/replay patterns to GAME04 Master, stats, Character presentation/animation, damage/status/result and approved speed/skip. Run mobile stress acceptance.

## E7 Quest / Dungeon
Master/progression, page, start/cost transaction, Battle connection, clear/Reward and Result/retry/next.

## E8 Raid / Cooperative PvE
If launch scope: boss state, attempts, Battle, contribution, rewards and projection.

## E9 Guild / Community Base
Create/join/leave, roles, recommendation/discovery, members/profile, Activity, approved Chat/BBS and moderation hooks.

## E10 Push / Fandom
Support ingestion, authoritative aggregation, Character/player projections, same-favorite discovery and Character-centered UI/activity.

## E11 Shared Goal / Community Event
Character-specific shared activity, aggregation, completion/Reward, public state and event lifecycle.

## E12 Competition
Only approved modules. PvP, Ranking and GvG are separate feature gates, each with Master/authority/runtime/UI/acceptance.

## E13 Retention / Reward
Idle reward, Login Bonus, Mission, Present, Event rewards and future-reward visibility.

## E14 Shop / Payment
Shop/Product Master, payment provider, webhook verification, idempotency, reconciliation, refund/chargeback and feature gate.

## E15 Utility Pages
Notification, News, Settings, Support and Legal.

## E16 Analytics / Admin / Operations Product Layer
Approved events, dashboards/queries, content controls, moderation/admin tools and runbooks.

---

# F — Initial Content Production

System implementation and content production are separate tracks.

## F0 Initial 20 Characters
For all approved Characters: Master, art, required Awakening Creative, animation, profile/story, Battle data and validation.

## F1 Launch PvE
Quest/Dungeon, enemies, Raid if adopted and Reward tables.

## F2 Launch Economy / Gacha
Banners/pools, initial/free grants, materials/rewards and Shop products if applicable.

## F3 Launch Community / Events
Shared Goals, Missions, Login cycle, launch events and News.

---

# G — Cross-feature integration

Only accepted features are connected.

## G0 Home Runtime Integration
Replace Home Shell placeholders with real accepted state/routes.

## G1 Navigation / State Integration
Verify page transitions, back behavior, deep links, reload, session expiry, async locks, empty/error states and cross-feature refresh.

## G2 Economy / Reward Integration
Audit every source/sink and Reward path across Gacha, Growth, Quest, Raid, Mission, Login, Community events and Shop.

## G3 Social / Projection Integration
Audit profile, Leader Character, Activity, Guild, Fandom, Rankings if adopted and stale-projection behavior.

## G4 Full Feature Acceptance
Each launch feature must already be independently PASS before Tutorial construction starts.

---

# H — Tutorial / First User Journey — LAST

This is intentionally late.

## H0 Journey Design
Only now design the optimal first-user route using completed destination features. Decide World Intro, Auth timing, initial grants, first Character acquisition, first Growth/Awakening exposure, Formation/Battle/PvE exposure, Home arrival, Community/Guild/Fandom introduction and Mission guidance.

## H1 Tutorial State Machine
Implement tutorial progress, one-time grants, resume/reload, auth round-trip, skip/recovery if approved and idempotent completion.

## H2 Tutorial Presentation
Add guidance overlays, dialogue, spotlight, CTA locks and World Intro without changing destination feature logic.

## H3 Fresh User Human Acceptance
Run the complete journey on fresh data and target mobile viewports. Tutorial bugs may change Tutorial orchestration; they must not trigger casual redesign of already-accepted features.

---

# I — Full Acceptance / Release Integration

## I0 Full Journey Regression
Fresh user, returning user, reload/background, low-network, session expiry, duplicate actions, Reward consistency, projection refresh and mobile layout.

## I1 Performance / Asset / Audio
Cold/warm load, Character/animation memory, prefetch/fallback, long session, background/foreground, browser audio lifecycle and no horizontal overflow.

## I2 Preview Environment
Create/use isolated Preview DB when responsible features require it; validate migrations, RLS/RPC/grants, OAuth, real data and accepted deployment SHA.

## I3 Production Integration
Schema baseline, approved forward migrations, secrets/env, feature states, backup, QA/mock disabled, support/legal/maintenance and release-data checks.

## I4 Release Candidate Human Acceptance
390×844, 412×915, iPhone Safari, Android Chrome and relevant in-app browser coverage.

---

# J — Pre-open

Measure real acquisition, Character acquisition/favorite/use/Awakening, Community/Fandom participation, retention, monetization, operational stability and cumulative ROAS. Product success is not inferred from implementation completion.

---

## 3. Parallel work policy

Parallelize only when authority/data/file boundaries are independent. Good parallel tracks include approved Character asset production, UI composition against frozen page specs, Master content entry against frozen schemas, analytics instrumentation against frozen events and operations tooling.

Do not parallelize unresolved product rules with their implementation, overlapping migrations/authority areas, or Tutorial orchestration with still-changing destination features.

## 4. Immediate next sequence

```text
1. Finish Home Shell acceptance without treating placeholders as product approval
2. Complete PART C Specification Freeze as the primary planning track
3. Freeze Page Map + Master Catalog before broad page/runtime production
4. Build PART D canonical Master/runtime architecture
5. Implement PART E feature by feature and accept each independently
6. Produce launch content through PART F against frozen contracts
7. Integrate accepted features through PART G
8. Build Tutorial / First User Journey in PART H
9. Run full release integration and Pre-open
```

This sequence is the implementation authority unless an explicit product/release decision updates this document.