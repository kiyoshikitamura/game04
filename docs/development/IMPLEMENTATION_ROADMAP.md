# GAME04 — Specification-first implementation roadmap

## 0. Purpose

This document is the detailed implementation roadmap below the coarse milestone gates in `MILESTONES.md`.

GAME04 development follows one primary rule:

> **Freeze product specifications as far as practical first, complete and accept features one by one second, and design/implement the Tutorial / First User Journey only after its destination features are stable.**

GAME03 proved the reusable technical foundation, but its tutorial-first implementation order caused repeated rework while Gacha, Formation, Quest, Battle, Home, PvP, Raid, Guild and other destination features were still changing. GAME04 intentionally reverses that order.

This roadmap does not approve any currently UNFIXED GAME04 rule. It defines the order in which those decisions and implementations must become authoritative.

---

## 1. Source authority and reuse rule

### GAME04 product authority

GAME04 product specifications, approved Circle decisions, GAME04 canonical Master, and GAME04 acceptance evidence are authoritative for GAME04 behavior.

Current FIX direction includes:

- Furry / Kemono theme and general-audience Web game
- multi-species fantasy world with bright daily-life tone
- initial roster of 20 Characters, basic female 15 / male 5 direction
- Character-centered product value
- Character Gacha as a monetization center
- Creative evolution through Awakening
- Push / Fandom layer
- Community emphasis
- Common Game Core reuse
- partner asset model
- standalone general-audience product and external adult-content separation

Current open areas include formal title and place names, detailed initial roster and Character Master, Gacha price/rate, duplicate requirements, Creative states, Guild size, PvP/GvG adoption, Push/Support formula, Character Ranking, Shared Goal, Raid, Economy, Quest/Mission and release schedule.

### GAME03 reuse rule

Reuse GAME03 for proven **technical contracts and implementation patterns**, including where accepted:

- Authentication / Player identity patterns
- ownership and Inventory authority
- Reward transaction and idempotency patterns
- RLS / RPC / migration discipline
- server-authoritative mutation patterns
- Battle result/replay authority patterns
- Guild/social infrastructure patterns
- Payment/operations/analytics infrastructure patterns
- mobile acceptance and release discipline

Do **not** inherit GAME03 product values, terminology, Masters, schedules, economy, tutorial flow, competition assumptions, visual presentation or content as implicit GAME04 defaults.

---

## 2. Overall delivery order

```text
A. Engineering Foundation                 COMPLETE / accepted baseline
B. GAME04 Shell & Design Foundation       early implementation track
C. Specification Freeze                   NEXT PRIMARY TRACK
D. Master & Content Architecture
E. Feature-by-feature Implementation
F. Initial Content Production
G. Cross-feature Integration
H. Tutorial / First User Journey          LAST GAMEPLAY CONSTRUCTION STEP
I. Full Acceptance / Release Integration
J. Pre-open
```

The Tutorial must consume accepted features. Features must not be shaped around a temporary tutorial implementation.

---

# PART A — ACCEPTED ENGINEERING FOUNDATION

## A0. Base Environment — COMPLETE

- GitHub repository / branch workflow
- Next.js / React / TypeScript
- CI quality gates
- Vercel integration
- isolated `dev-clean`
- environment / secret boundaries

## A1. Common Core Minimum Foundation — COMPLETE

- Authentication / Player initialization
- Player profile authority
- owner-scoped Inventory projection
- server-owned Reward delivery
- atomic claim / retry safety / receipt
- forward-only migration discipline
- GAME03/Common/GAME04 extraction boundary

## A2. Engineering Readiness — COMPLETE

- fresh-clone bootstrap / diagnostics
- unit / contract / browser test layers
- loading / error / dialog / session lifecycle
- product-neutral asset delivery
- observability transport
- operations / feature-state / maintenance foundation
- dependency security baseline

These foundations are not the complete game. They are the platform on which the GAME04-specific product is built.

---

# PART B — GAME04 SHELL & DESIGN FOUNDATION

## B0. Application Shell

Status: IN PROGRESS via Home Shell work.

Scope:

- Title shell
- Authentication connection
- protected Home route
- global mobile shell
- Header / Footer / navigation primitives
- safe-area handling
- shared loading / error / dialog states

## B1. Home Visual Shell

Use the approved Home guideline/mock as visual/information hierarchy reference.

Implement only structural UI before feature approval:

- Player / resource header slots
- central Leader Character presentation slot
- side navigation slots
- Quest / Guild primary action slots
- rotation/banner slot
- five-item footer

A visible slot does not approve the underlying product feature.

## B2. Design System Freeze

Before page-scale production:

- color tokens
- typography
- spacing / radius / borders
- button hierarchy
- cards / panels / dialogs
- badges / notifications
- rarity presentation rules
- loading / disabled / coming-soon states
- mobile viewport rules
- asset safe zones

Exit: later pages should be composition work, not repeated visual-system invention.

---

# PART C — SPECIFICATION FREEZE

No gameplay feature enters full implementation until the specification package it depends on is accepted. Small technical PoCs are allowed only when needed to make a specification decision.

## C0. Product Definition / Core Loop

Freeze:

- product pillars and non-goals
- daily loop
- long-term loop
- Character ownership loop
- Push / Fandom loop
- Community loop
- Cooperation > Competition boundary
- session expectations
- core currencies/resources at conceptual level

## C1. World / Terminology / Naming

Freeze implementation-facing names:

- formal game title when available
- world / continent / central city names
- major facilities and Guild terminology
- Character-facing terminology
- Quest / Dungeon / Raid / Community terms
- resource/currency display names
- UI labels

World lore that does not affect runtime can remain expandable; identifiers and labels required by Master/UI cannot.

## C2. Character System & Initial Roster

Freeze:

- Character Master contract
- initial 20 Character subjects
- IDs and naming convention
- species / Kemono level / gender distribution
- role / combat participation reason
- rarity model
- base stats model
- profile / relationship fields
- Leader / favorite semantics
- Character story/content relationship
- initial presentation requirements

Initial 20 detailed content can be produced progressively after the schema and roster are approved, but the contract must not keep changing during implementation.

## C3. Creative Awakening

Freeze:

- Awakening levels/states
- duplicate/material requirements
- stat impact
- Creative change points
- +0 / intermediate / +3 / +5 asset contract
- animation differences
- persistence and ownership semantics
- UI presentation
- duplicate conversion rules

## C4. Economy / Wallet / Reward

Freeze:

- currencies
- paid/free currency separation if applicable
- stamina/AP model
- materials
- item categories
- Reward sources/sinks
- Wallet/ledger requirement
- caps / overflow policy
- server-time rules
- economy audit requirements

No GAME03 economy value is inherited by default.

## C5. Gacha / Acquisition

Freeze:

- Character-only vs additional acquisition categories
- banners
- price
- rates
- rarity distribution
- guarantee / pity / ceiling
- duplicate handling
- free acquisition
- history/disclosure
- initial grants
- retry/idempotency behavior

## C6. Growth / Formation / Loadout

Freeze:

- level progression
- EXP/resources
- Awakening relationship
- team size
- formation rules
- Leader behavior
- Skill / Equipment adoption and scope, if any
- total-power/status calculation if exposed

Do not assume GAME03 Skill/Equipment structure unless explicitly adopted.

## C7. Battle System

Freeze GAME04-specific rules while retaining accepted server-authority principles:

- party size
- stats
- action order
- targeting
- damage/heal/status model
- skill model
- defeat/result rules
- replay contract compatibility
- speed/skip behavior
- Character animation hooks
- presentation requirements

## C8. Quest / Dungeon / PvE

Freeze:

- content taxonomy
- progression map
- stamina/cost
- enemy/master structure
- clear conditions
- repeat/skip rules
- Reward tables
- unlock conditions
- result/next-action behavior

## C9. Raid / Cooperative PvE

Freeze before implementation:

- whether Raid is launch scope
- boss lifecycle
- participation model
- contribution/damage model
- attempt/cost rules
- shared vs individual rewards
- ranking, if any
- reset/schedule

## C10. Guild / Social / Community

Freeze:

- Guild purpose in GAME04
- max members
- create/join/leave rules
- roles/permissions
- recommendation/discovery
- Chat / BBS / Activity scope
- profile/Leader Character exposure
- moderation requirements
- Character-centered community representation

## C11. Push / Fandom / Shared Goal

This is GAME04-specific and must be frozen before implementation.

Define:

- intentional Support inputs
- passive usage inputs, if any
- anti-abuse rules
- Character Support state
- player-visible Fandom representation
- same-favorite discovery
- shared Character goals
- contribution and completion
- reward/content-production connection
- Character ranking adoption or omission

## C12. Competition

Explicit decision gate:

- PvP: adopt / omit / post-launch
- Ranking: categories and purpose
- GvG: adopt / omit / post-launch

If adopted, freeze matchmaking, schedules, scoring, rewards, seasons and authority separately. Competition must not become Product Core by accidental GAME03 inheritance.

## C13. Retention Systems

Freeze:

- idle reward
- Login Bonus
- Daily/Weekly Mission
- Present
- Event cadence
- recurring Character content
- notification triggers

## C14. Shop / Payment

Freeze:

- product catalog model
- price tiers
- paid currency/items
- purchase limits
- refund/reconciliation requirements
- purchase history
- payment release gate

## C15. Analytics / Admin / Operations Product Requirements

Freeze event names and operational needs only after product rules are known:

- Character acquisition/favorite/use
- Awakening +3/+5
- Gacha/economy
- Guild/community activity
- Push/Fandom/shared goal
- Retention
- monetization
- content return behavior
- moderation/admin actions

## C16. Page Map / Navigation / UX Specification

Before page implementation, freeze the complete page inventory and navigation graph.

Expected categories to decide/cover include:

- Title / Auth
- Home
- Character list/detail
- Growth / Awakening
- Formation / loadout if adopted
- Gacha / result
- Quest / Dungeon
- Battle / Result
- Raid if adopted
- Guild / Community / Chat / BBS
- Push / Fandom / Shared Goal
- Ranking/PvP/GvG if adopted
- Mission / Login Bonus / Present
- Shop
- News / Notification
- Settings / Support / Legal

Each page spec must identify data authority, loading/error/empty states, primary CTA, navigation in/out, and mobile first-view acceptance.

## C17. Master Catalog Freeze

Produce the authoritative Master inventory before gameplay implementation.

At minimum, decide whether GAME04 needs and define contracts for:

- Character
- Species / taxonomy
- Character Creative / Awakening
- Growth
- Item / Material / Currency
- Gacha / Banner / Pool
- Formation
- Skill / Equipment if adopted
- Battle
- Enemy
- Quest / Dungeon
- Raid
- Guild configuration
- Push / Fandom / Shared Goal
- Mission
- Login Bonus
- Shop product
- Feature state / event schedule

Exit criteria for PART C: unresolved decisions are explicitly marked post-launch/omitted or isolated so they cannot silently change already-started feature implementations.

---

# PART D — MASTER & CONTENT ARCHITECTURE

## D0. Canonical Master Framework

- ID rules
- schema/version rules
- validation
- loader
- migration/seed policy
- environment parity
- legacy/default rejection
- admin/review path

## D1. Ownership / Runtime Schema Expansion

Add GAME04 user-state tables only from accepted specifications:

- Character ownership
- currencies/items
- growth/awakening
- formation
- progression
- fandom/support
- community participation
- other approved feature state

For each: RLS + RPC + grant + FK + idempotency + reset implications + tests.

## D2. Asset Manifest & Content Contract

- asset IDs and paths
- Character base/awakening variants
- thumbnails/cards/full-body
- animation/fallback relationship
- background/UI/banner assets
- cache/version rules
- missing-asset behavior

---

# PART E — FEATURE-BY-FEATURE IMPLEMENTATION

Each feature is completed independently through:

```text
Accepted Spec
→ Master
→ DB / Authority
→ Runtime
→ Page/UI
→ Automated Tests
→ Mobile Human Acceptance
→ COMPLETE
```

A feature is not COMPLETE because its page renders.

## E0. Character Foundation

- Character canonical Master
- ownership
- list/detail pages
- Leader/favorite
- profile/species information
- Home Character connection

## E1. Character Asset / Animation Pipeline

Run representative 1–3 Character PoC before roster-scale animation production:

- normalization
- Idle / Tap / approved Battle hooks
- Awakening variants
- static fallback
- lazy load / prefetch
- Safari load/memory/background-return acceptance

Then freeze the production pipeline.

## E2. Inventory / Economy Runtime

- approved currencies/items/materials
- wallet/ledger if required
- Reward integration
- inventory pages/presentation
- transaction history where required

## E3. Gacha / Acquisition

- Master
- server draw authority
- pity/ceiling
- ownership grant
- duplicate handling
- banner page
- draw presentation
- result page
- history/disclosure

## E4. Growth / Awakening

- level growth
- materials
- Awakening
- Creative evolution
- before/after state
- page/UI
- Home/Character presentation refresh

## E5. Formation / Loadout

Only approved systems are implemented.

- party edit
- Leader
- ownership validation
- save authority
- combat handoff

## E6. Battle Runtime & Presentation

- adapt accepted common authority/replay pattern
- GAME04 stats/master connection
- GAME04 Character presentation/animation
- damage/status/result
- 1x/2x/skip as approved
- mobile stress acceptance

## E7. Quest / Dungeon

- Master/progression
- stage page
- cost/start transaction
- Battle connection
- clear/reward
- result/retry/next stage

## E8. Raid / Cooperative PvE

Only if launch scope is approved.

- boss state
- attempts
- Battle connection
- contribution
- rewards
- result/projection

## E9. Guild / Community Base

- Guild create/join/leave
- roles
- recommendation/discovery
- member list/profile
- Activity
- Chat/BBS approved scope
- moderation hooks

## E10. Push / Fandom

- Support event ingestion
- authoritative aggregation
- Character/player projections
- favorite-community discovery
- UI and Character-centered activity

## E11. Shared Goal / Community Event

- Character-specific shared activity
- progress aggregation
- completion/reward
- public state
- event lifecycle

## E12. Competition Features

Only adopted launch features are implemented.

Possible independent modules:

- PvP
- personal/Character/Guild Ranking
- GvG

Each receives its own Master/authority/runtime/UI/acceptance gate.

## E13. Retention / Reward Features

- idle reward
- Login Bonus
- Mission
- Present
- event rewards
- future-reward visibility

## E14. Shop / Payment

- Shop UI
- product Master
- checkout/payment provider
- webhook verification
- idempotency
- reconciliation
- refund/chargeback support
- payment feature gate

## E15. Notification / News / Settings / Support / Legal

Complete the non-gameplay pages and operational UX.

## E16. Analytics / Admin / Operations Product Layer

- approved product events
- dashboards/queries
- content/feature controls
- moderation/admin tools
- operational runbooks

---

# PART F — INITIAL CONTENT PRODUCTION

Implementation and content production are separate tracks.

## F0. Initial 20 Character Production

For all 20 approved Characters:

- Master data
- art
- required Creative/Awakening variants
- animation assets
- profile/story content
- battle data
- validation

## F1. Launch PvE Content

- Quest/Dungeon stages
- enemies
- Raid content if adopted
- rewards

## F2. Launch Economy / Gacha Content

- banners/pools
- initial/free grants
- materials/reward tables
- Shop products if paid launch includes them

## F3. Launch Community / Event Content

- Shared Goals
- missions
- login cycle
- launch events
- news/notices

---

# PART G — CROSS-FEATURE INTEGRATION

Only after individual features are accepted.

## G0. Home Runtime Integration

Replace shell placeholders with accepted real state and routes.

## G1. Full Navigation Integration

Verify every page in/out path, back behavior, deep links, reload and