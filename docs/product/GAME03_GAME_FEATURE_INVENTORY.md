# GAME03 game feature inventory for GAME04 comparison

## Purpose

This is the starting inventory for defining the complete GAME04 feature set.
It lists GAME03/TRIBE NEON game-facing capabilities first, then provides a
provisional GAME04 disposition and a place for GAME04-only additions.

The GAME04 column is not final product approval. `REVIEW` and `REDESIGN` items
must be agreed with the Circle before implementation. GAME03 values, masters,
schedules, presentation, and terminology never become GAME04 defaults.

## Source boundary

- GAME03 engineering snapshot: TRIBE NEON commit `826f8b7`
- Product/technical overview: `TRIBE_NEON_ENGINEERING_TECHNICAL_OVERVIEW_20260901.html`
- GAME04 authority: `GAME04_development_start_handoff_20260902.html`
- Repository evidence inspected through the fixed commit with `git show` and
  `git ls-tree`; the dirty TRIBE NEON working tree was not used as a copy source.

GAME03 status vocabulary:

- `ACTIVE`: implemented as part of the accepted game journey or runtime.
- `GATED`: implemented/founded but controlled by a release or feature gate.
- `PARTIAL`: present, but includes provisional, compatibility, or unfinished scope.
- `OMITTED`: explicitly excluded from the applicable release scope.

GAME04 disposition vocabulary:

- `ADOPTED CORE`: product-neutral foundation already accepted in GAME04.
- `DIRECTION`: use is part of the GAME04 direction; details remain open.
- `REVIEW`: adoption itself or minimum scope requires Circle agreement.
- `REDESIGN`: the capability category may remain, but GAME03 behavior must not.
- `EXCLUDE GAME03`: GAME03-specific implementation must not be carried over.
- `NEW`: GAME04-specific capability with no equivalent product role in GAME03.

## 1. Entry, identity, and first journey

| ID | GAME03 feature | GAME03 status | GAME03 scope | Provisional GAME04 disposition | GAME04 decision needed |
| --- | --- | --- | --- | --- | --- |
| ID-01 | Title and entry | ACTIVE | Title screen and entry routing | DIRECTION | Final title, entry copy, and general-audience positioning |
| ID-02 | Authentication | ACTIVE | Supabase authentication and identity integrity | ADOPTED CORE | Provider set and release policy only |
| ID-03 | Guest-compatible/anonymous entry | PARTIAL | Guest-compatible entry and anonymous-player lifecycle | REVIEW | Whether GAME04 permits guest play |
| ID-04 | Player initialization | ACTIVE | Idempotent current-player creation and initial state | ADOPTED CORE | GAME04 initial grants remain separate |
| ID-05 | Profile and public identity | ACTIVE | Name, bio, public profile, leader, affiliation | ADOPTED CORE + REDESIGN | GAME04-visible identity fields and Character/Fandom expression |
| ID-06 | Account switch/reset | ACTIVE | Guarded lifecycle and gameplay reset authority | ADOPTED CORE | Which actions are exposed to players/operators |
| ID-07 | Tutorial/first-user journey | ACTIVE | Tutorial → free Gacha → formation → Quest/Battle → Home | REDESIGN | GAME04 first-session loop after the overall loop is fixed |
| ID-08 | Initial free Gacha | ACTIVE | Guaranteed first Character acquisition | REVIEW | Whether it exists, pool, guarantee, presentation, and timing |
| ID-09 | Initial formation/leader setup | ACTIVE | First party and leader assignment | REVIEW | Whether formation is required and how favorite/leader differ |

## 2. Home, profile, and player-facing shell

| ID | GAME03 feature | GAME03 status | GAME03 scope | Provisional GAME04 disposition | GAME04 decision needed |
| --- | --- | --- | --- | --- | --- |
| UI-01 | Home/hub | ACTIVE | Resources, activity CTAs, banners, leader Character | DIRECTION + REDESIGN | GAME04 Home hierarchy and live Character behavior |
| UI-02 | Main navigation/footer | ACTIVE | Home, Character, Gacha, Shop, and activity routes | REVIEW | Final top-level information architecture |
| UI-03 | Player resource display | ACTIVE | Currency and action-resource header projections | REVIEW | Which GAME04 resources deserve persistent display |
| UI-04 | Public user profile | ACTIVE | Profile, leader Character, guild, power/social fields | REDESIGN | Fandom/Collection-first public identity instead of GAME03 status defaults |
| UI-05 | Titles and equipped title | ACTIVE | Title ownership and public display | REVIEW | Retain, replace with Character/Fandom badges, or omit |
| UI-06 | Player avatar/cosmetics | ACTIVE | Avatar parts and equipped cosmetics | REVIEW | Relationship to Character-centered identity |
| UI-07 | Settings | ACTIVE | Profile editing, BGM, and SE controls | DIRECTION | GAME04 settings scope and account controls |
| UI-08 | Legal/information surfaces | ACTIVE | Legal panel, notices, and service information | DIRECTION | Release-region and platform requirements |
| UI-09 | Loading/error/dialog/result UX | ACTIVE | Shared async blocking, confirmation, result, and recovery | ADOPTED CORE | GAME04 visual treatment only |

## 3. Character, collection, and growth

| ID | GAME03 feature | GAME03 status | GAME03 scope | Provisional GAME04 disposition | GAME04 decision needed |
| --- | --- | --- | --- | --- | --- |
| CH-01 | Character master/roster | ACTIVE | Character identity, stats, rarity, attribute, and presentation | DIRECTION + REDESIGN | GAME04 Character contract and initial 20-person roster |
| CH-02 | Character ownership | ACTIVE | User-owned Character records and projections | ADOPTED CORE + DIRECTION | Acquisition and duplicate semantics |
| CH-03 | Character detail page | ACTIVE | Presentation, status, growth, equipment, skills, and formation | REDESIGN | Character-first information hierarchy |
| CH-04 | Character level/stat growth | ACTIVE | Level, XP, stats, rarity curves, and total power | REVIEW | Growth axes, caps, costs, and meaning in GAME04 |
| CH-05 | Awakening/duplicate progression | ACTIVE | Copy-equivalent awakening and stat progression | REDESIGN | Duplicate requirements and Creative change at +0/+3/+5 |
| CH-06 | Skill ownership/loadout | ACTIVE | Skill masters, acquisition, replacement, and battle slots | REVIEW | Whether skills are Character-fixed, collectible, or separately grown |
| CH-07 | Equipment ownership/loadout | ACTIVE | Equipment masters, levels, limit break, and Character loadout | REVIEW | Retain, simplify, replace, or omit |
| CH-08 | Formation/decks | ACTIVE | Party formation, leader, PvP/GvG defense, secure snapshots | REVIEW | Party size, modes, and favorite/leader relationship |
| CH-09 | Inventory/items | ACTIVE | Owner-scoped items, Characters, skills, and equipment | ADOPTED CORE | GAME04 asset kinds and item taxonomy |
| CH-10 | User level/account progression | ACTIVE | Lv1–100 progression and unlock/resource projections | REVIEW | Need, purpose, cap, and unlock responsibilities |
| CH-11 | Action resources | ACTIVE | Vitality, PvP points, recovery, and tickets | REDESIGN | Whether stamina exists and how strongly it constrains Community play |
| CH-12 | Total power | ACTIVE | Aggregate combat-power projection and display | REVIEW | Whether a single power score supports GAME04 goals |

## 4. Acquisition, economy, and rewards

| ID | GAME03 feature | GAME03 status | GAME03 scope | Provisional GAME04 disposition | GAME04 decision needed |
| --- | --- | --- | --- | --- | --- |
| EC-01 | Wallet/currencies | ACTIVE | Currency balances and server-owned mutation | REVIEW | Currency count, paid/free distinction, expiry, and ledger need |
| EC-02 | Character Gacha | ACTIVE | Banner/pool, rates, history, result, and launch controls | DIRECTION + REDESIGN | Price, rates, pool, pity, disclosure, and duplicate outcome |
| EC-03 | Skill/equipment asset Gacha | ACTIVE | Separate collectible-asset Gacha | REVIEW | Retain, merge into Character acquisition, or omit |
| EC-04 | Pity/exchange | ACTIVE | Pity accumulation and reward exchange | REVIEW | Need, ceiling, carry-over, and exchange rules |
| EC-05 | Shop | ACTIVE | Currency/item purchases and product presentation | REVIEW | GAME04 shop categories and non-pressure policy |
| EC-06 | Payment/purchase history | GATED | Payment foundation; production requires separate security gate | DIRECTION | Platform, products, receipt/webhook/refund rules |
| EC-07 | Monthly pass | GATED | Monthly-pass foundation | REVIEW | Fit with Collect/Complete/Express monetization |
| EC-08 | Present/reward inbox | ACTIVE | Server-owned delivery, individual/all claim, receipt | ADOPTED CORE | GAME04 reward sources and expiry policy |
| EC-09 | Login bonus | ACTIVE | Cyclic login rewards and secure claim | REVIEW | Whether retained and how it supports Character content |
| EC-10 | Mission | ACTIVE | Daily/normal/funnel/invite conditions and claim | DIRECTION + REDESIGN | Daily/weekly/Character/Community mission structure |
| EC-11 | Reward supply | ACTIVE | Canonical reward pools and supply control | ADOPTED CORE + REDESIGN | GAME04 sources, sinks, quantities, and limits |
| EC-12 | News/notices | ACTIVE | Notice list, read state, and release information | DIRECTION | Publishing/operations workflow |
| EC-13 | Promotional/home banners | ACTIVE | Feature-state-filtered promotional destinations | REVIEW | GAME04 content rotation and Character promotion policy |

## 5. Solo content and battle

| ID | GAME03 feature | GAME03 status | GAME03 scope | Provisional GAME04 disposition | GAME04 decision needed |
| --- | --- | --- | --- | --- | --- |
| GP-01 | Quest/map progression | ACTIVE | Quest nodes, encounters, rewards, and progression | REVIEW | GAME04 Quest purpose, structure, and content cadence |
| GP-02 | Story/adventure engine | PARTIAL | Scenario/adventure presentation and Character dialogue | DIRECTION + REDESIGN | Character episode structure and production pipeline |
| GP-03 | Patrol/idle expedition | ACTIVE | Timed patrol, instant completion, NPC battle, and claim | REVIEW | Whether idle rewards/patrol remain and their role |
| GP-04 | Common battle runtime | ACTIVE | Server-authoritative resolution shared across modes | DIRECTION | Minimum GAME04 battle role and approved rules |
| GP-05 | Auto battle | ACTIVE | Automatic combat based on server-resolved outcome | REVIEW | Degree of player agency and intended session length |
| GP-06 | Battle formation/loadout snapshot | ACTIVE | Immutable participant and equipment/skill snapshot | ADOPTED PATTERN | Exact GAME04 combat contract after battle adoption |
| GP-07 | Replay viewer | ACTIVE | Canonical result/replay presentation | ADOPTED PATTERN | GAME04 presentation and animation mapping |
| GP-08 | Battle status/effects/AI | ACTIVE | Skills, status effects, targeting, tactics, damage/heal | EXCLUDE GAME03 + REVIEW | New battle design; never reuse GAME03 formulas or masters |
| GP-09 | Battle result/reward | ACTIVE | MVP/result summary, reward, XP, and progression update | ADOPTED PATTERN | GAME04 mode-specific outcome and reward rules |

## 6. Cooperative and competitive modes

| ID | GAME03 feature | GAME03 status | GAME03 scope | Provisional GAME04 disposition | GAME04 decision needed |
| --- | --- | --- | --- | --- | --- |
| MP-01 | PvP | ACTIVE/GATED | Matchmaking, opponents, defense tactics, result, and points | REVIEW | Adopt, defer, or omit; Competition is not the product core |
| MP-02 | PvP ranking/rewards | ACTIVE/GATED | Server projection, seasons, and ranking rewards | REVIEW | Whether Character/Fandom visibility replaces power competition |
| MP-03 | Raid | ACTIVE/GATED | Boss master, attempts, damage, lifecycle, ranking, and rewards | REVIEW | Cooperative purpose, participation, persistence, and rewards |
| MP-04 | Guild-versus-Guild | GATED | Matchmaking, defense snapshot, attacks, lifecycle, and rewards | REVIEW | Adopt or omit; GAME03 rules/schedule are excluded |
| MP-05 | Tokyo base/territory movement | ACTIVE | Seven-base affiliation and movement tied to GvG/world | EXCLUDE GAME03 | Replace only if GAME04 world design independently requires regions |
| MP-06 | Ranking hub | ACTIVE | Power, PvP, Raid, Guild, and public rankings | REVIEW | Which rankings support fandom without becoming popularity pressure |
| MP-07 | Season/daily reset | ACTIVE | JST daily reset and mode-season reset authority | ADOPTED PATTERN | GAME04 reset boundaries after content cadence is fixed |

## 7. Social and community

| ID | GAME03 feature | GAME03 status | GAME03 scope | Provisional GAME04 disposition | GAME04 decision needed |
| --- | --- | --- | --- | --- | --- |
| SO-01 | Guild creation/search/join | ACTIVE | Creation, search, request, approval, leave, cooldown, and cap | DIRECTION + REDESIGN | Small-community identity, size, discovery, and membership model |
| SO-02 | Guild roles/permissions | ACTIVE | Canonical roles and privileged operations | ADOPTED PATTERN | GAME04 roles and moderation responsibilities |
| SO-03 | Guild profile/level/activity | ACTIVE | Guild identity, attributes, activity, level, and public projection | REDESIGN | Character/species/preference-centered identity and progression |
| SO-04 | Guild donation/shop/decoration | PARTIAL | Donation, guild economy, shop, and cosmetics | REVIEW | Retain only if they support approved shared activity |
| SO-05 | Friends | ACTIVE | Search, requests, acceptance, removal, and public profile access | REVIEW | Whether friend graph is needed beside Character communities |
| SO-06 | Referral/invitation | PARTIAL | Gift code/URL, sharing, anti-abuse, and invite missions | REVIEW | Acquisition role, rewards, and release timing |
| SO-07 | Guild chat | ACTIVE | Realtime guild messages and read state | DIRECTION | Moderation, retention, reporting, and access boundaries |
| SO-08 | Direct messages | ACTIVE | One-to-one messaging, unread state, and hardened RLS | REVIEW | Safety cost versus product value |
| SO-09 | BBS | ACTIVE | Bulletin-board posts, realtime updates, and read state | DIRECTION + REDESIGN | Character-centered boards, discovery, and moderation |
| SO-10 | Activity feed | ACTIVE | Public/social activity and funnel milestones | DIRECTION + REDESIGN | Which Character/Community activities become visible |
| SO-11 | Guild recommendation | ACTIVE | Recommendation based on funnel/public guild data | REDESIGN | Preference/Character/species matching inputs |
| SO-12 | Reporting/moderation/retention policy | PARTIAL | Operational requirement identified; full policy remains needed | DIRECTION | Circle/operator policy, tools, escalation, and data retention |

## 8. Operations, delivery, and measurement

| ID | GAME03 feature | GAME03 status | GAME03 scope | Provisional GAME04 disposition | GAME04 decision needed |
| --- | --- | --- | --- | --- | --- |
| OP-01 | Feature-state/release gates | ACTIVE | Payment, GvG, Gacha, destinations, and pre-open exposure | ADOPTED CORE | GAME04 feature keys only after approval |
| OP-02 | Analytics/funnel events | ACTIVE | Registration, tutorial, mode reach, guild/social, and retention | ADOPTED CORE + REDESIGN | GAME04 event taxonomy centered on User × Character |
| OP-03 | Administration/audit | ACTIVE | Privileged operations, request IDs, logs, and audit | ADOPTED CORE | Operator roles and production procedures |
| OP-04 | Notification badges/in-app notice state | ACTIVE | Free-Gacha badges, unread/read state, and filtered destinations | REVIEW | In-app versus external notification scope |
| OP-05 | Asset delivery | ACTIVE | Character, background, equipment, item, effect, promotion, audio | ADOPTED CORE + REDESIGN | GAME04 manifest and Circle asset contract |
| OP-06 | Audio lifecycle | ACTIVE | BGM/SE, user gesture, reload/OAuth/background recovery | ADOPTED PATTERN | GAME04 audio direction and delivery schedule |
| OP-07 | Prefetch/async recovery | ACTIVE | Login prefetch, loading states, retries, and recovery | ADOPTED CORE | Per-feature performance budgets |
| OP-08 | Mobile acceptance/QA | ACTIVE | iPhone Safari, viewport, battle stress, and human acceptance | ADOPTED CORE | GAME04 target-device matrix |

## 9. GAME04-only additions to evaluate

These are explicit GAME04 product directions or new responsibilities. They are
not substitutes for the Circle's detailed decisions.

| ID | GAME04-only capability | Authority status | Relationship to GAME03 | Decision needed |
| --- | --- | --- | --- | --- |
| N-01 | Favorite/Push declaration | PLANNED SCOPE | Extends leader/use signals beyond GAME03 profile status | Explicit versus inferred actions and player controls |
| N-02 | Character Support accumulation | PLANNED SCOPE | New meta layer over use, growth, awakening, Home, and events | Inputs, weights, abuse prevention, reset, and visibility |
| N-03 | Fandom visualization | PLANNED SCOPE | Replaces pure power/popularity emphasis | Personal, Character-wide, and Community views |
| N-04 | Character-centered community discovery | FIXED DIRECTION | Redesigns Guild/BBS/recommendation around shared preference | Discovery keys, privacy, membership, and moderation |
| N-05 | Collection comparison | PLANNED SCOPE | Extends public profile/ownership projection | Visible fields, consent, and comparison UX |
| N-06 | Shared Goal/Support Event | PLANNED SCOPE | Cooperation-first alternative/complement to GvG competition | Goal unit, contribution, outcome, rewards, and cadence |
| N-07 | Cooperation-resulting competition | FIXED DIRECTION | Competition emerges from group support rather than being the core | Whether rankings exist and how pressure is limited |
| N-08 | Creative Awakening | FIXED DIRECTION | Replaces stat-only awakening with Character Creative evolution | +0/+3/+5 assets, permanence, preview, and fallback |
| N-09 | Interactive animated Home Character | FIXED DIRECTION | Expands leader presentation into Idle/Tap/Special reactions | State machine, delivery format, performance, and accessibility |
| N-10 | Circle asset-to-web pipeline | PLANNED SCOPE | New partner production boundary | Submission, validation, normalization, animation, approval, and versioning |
| N-11 | Character-content continuity | FIXED DIRECTION | Turns production periods and external releases into retention content | In-game cadence, story/event connection, and operational ownership |
| N-12 | User × Character analytics | FIXED DIRECTION | Adds Character as a primary analysis dimension | Event schema, consent, retention, and KPI definitions |
| N-13 | External-content return measurement | PLANNED SCOPE | Connects Circle releases to in-game return without making GAME04 a redirect shell | Attribution window, privacy, and success criteria |
| N-14 | Preference/species/body-type community signals | PLANNED SCOPE | New identity-first discovery axis | Which signals are explicit, inferred, public, or private |

## 10. Explicit GAME03 exclusions

The following are evidence sources only and must not be copied into GAME04:

- TRIBE NEON title, world, Character, Skill, Equipment, Item, Quest, enemy, and
  economy masters;
- Tokyo seven-base structure, base names, territory rules, and movement;
- GvG schedules, matching, damage, reward, and season values;
- PvP/Raid/Ranking formulas, rewards, tickets, and activation assumptions;
- tutorial sequence, guaranteed Character, initial grants, and unlock values;
- currencies, Gacha prices/rates/pity, duplicate counts, and shop products;
- mission, login-bonus, reward-supply, and monthly-pass values;
- Matte Outlaw UI, visual assets, text, audio, effects, and battle presentation;
- GAME03-specific analytics event names, operational keys, and release flags.

## 11. Recommended comparison procedure

1. Confirm the GAME04 core loop and top-level feature map.
2. Review every `REVIEW`/`REDESIGN` row and mark it `USE`, `DEFER`, or `OMIT`.
3. Add missing GAME04-only functions to section 9.
4. Define dependencies between retained functions before detailed values.
5. Update the product decision register with approved results and dates.
6. Only then open implementation tasks; no provisional GAME03 value is used.

