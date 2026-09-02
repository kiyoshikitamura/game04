# GAME04 product decision register

## Purpose

This register protects GAME04 from accidental product decisions while Common
Game Core work continues. It records what is fixed, what remains open, what each
answer unlocks, and the last safe point at which an answer is required.

It does not import TRIBE NEON product behavior and does not assign placeholder
values. An approval here still requires a separately scoped implementation task.

## Sources and confidence

| Source | Role | Availability | Use |
| --- | --- | --- | --- |
| GAME04 Development Start Handoff | Product authority | Original attachment directly verified on 2026-09-02; not stored in this repository | Product direction and explicitly unfixed decisions |
| `COMMON_GAME_CORE_BOUNDARY.md` | Implementation boundary | Available | Common/product/excluded classification and authority rules |
| `COMMON_CORE_DEPENDENCY_MAP.md` | Extraction order | Available | Downstream technical dependencies and exclusions |
| TRIBE NEON Engineering Overview / accepted source commit | Technical reference | Architecture audit available | Patterns only; never product defaults |

Confidence labels used below:

- `VERIFIED FROM HANDOFF`: directly checked against the original attachment.
- `SOURCE CHECK REQUIRED`: requires comparison with the original handoff before
  product approval or implementation.

## Decision milestones

These are dependency gates, not release dates.

| Milestone | Meaning |
| --- | --- |
| M0 — Common Core boundary | Before selecting Wallet or another product-shaped Common Core contract |
| M1 — Character slice definition | Before implementing Character, Gacha, growth, awakening, or Push/Fandom behavior |
| M2 — Community slice definition | Before implementing Character Community, membership, roles, shared goals, rankings, or cooperative/competitive modes |
| M3 — Retention/economy definition | Before implementing mission, quest, recurring content, monetization, or economy values |
| M4 — Production planning | Before creating production infrastructure, committing a production content pipeline, or setting a release plan |

## Fixed direction and planned scope

| ID | Status | Direction | Implementation consequence | Confidence |
| --- | --- | --- | --- | --- |
| F-01 | FIXED DIRECTION | GAME04 is an **Identity-first Community** product. | Feature proposals must explain how they support player identity and community participation. | VERIFIED FROM HANDOFF |
| F-02 | FIXED DIRECTION | The core relationship is **Character → Push/Fandom → Community → Retention**. | Competition cannot silently replace this chain as the primary loop. | VERIFIED FROM HANDOFF |
| F-03 | FIXED DIRECTION | Character acquisition and development are central, with Character Gacha as a principal acquisition concept. | Gacha infrastructure may be designed only after its GAME04 product rules are approved. | VERIFIED FROM HANDOFF |
| F-04 | FIXED DIRECTION | Creative Awakening, Push/Fandom, and community are product pillars. | Their detailed triggers, calculations, content, and presentation remain open; names alone are not executable specifications. | VERIFIED FROM HANDOFF |
| F-05 | FIXED DIRECTION | Cooperation is favored over competition as the current product hypothesis. | PvP, rankings, and GvG are optional decisions, not inherited requirements. | VERIFIED FROM HANDOFF |
| F-06 | FIXED DIRECTION | GAME04 must stand independently as a general-audience version. | It cannot require knowledge of, assets from, or progression in GAME03. | VERIFIED FROM HANDOFF |
| F-07 | PLANNED SCOPE | The initial Character count is **20**, with female 15 / male 5 as the basic composition, furry level 2–3 central, and level 4 actively included. | Identities, exact species allocation, master data, stats, skills, acquisition, growth, and release distribution remain open. | VERIFIED FROM HANDOFF |
| F-08 | FIXED DIRECTION | The Theme is a Furry-first, general-audience, multi-species otherworld game with a bright everyday tone. It avoids a world-saving epic, bad endings, heavy tragedy, entrenched species discrimination, and protagonist domination/subordination. | Character, world, story, and presentation proposals must stay inside these constraints; formal title and world/place proper names remain open. | VERIFIED FROM HANDOFF |

## Dependency path

`Theme/source check → Character identity → Push/Fandom → Community → Retention`

`Character identity + Economy boundaries → Gacha and growth`

`Push/Fandom + Community structure → Shared goals, cooperation, and any ranking`

`Approved loops + delivery capacity → Release plan`

## Dependency-ordered open decisions

Every row is intentionally value-free. `Owner` identifies the decision owner,
not an implementation assignee.

| ID | Topic / open decision | Owner | Prerequisite | Affected downstream systems | Latest responsible milestone | Status / confidence |
| --- | --- | --- | --- | --- | --- | --- |
| D-01 | Record and use the exact fixed Theme wording and constraints from the original handoff. | Source authority | Original handoff attachment | Character identity, narrative, terminology, art direction, community expression | M1 | SOURCE VERIFIED |
| D-02 | Define the initial 20 Characters: identity, role in the world, differentiation, and minimum content required per Character. | Product owner | D-01 | Character master, asset pipeline, acquisition, growth, awakening, Push/Fandom, content schedule | M1 | OPEN |
| D-03 | Define what Creative Awakening means to the player: eligibility, player action, outcome, persistence, and expression. | Product owner | D-01, D-02 | Character state, assets, growth, rewards, UI, analytics | M1 | OPEN |
| D-04 | Define which player actions mean “Push/Support” and which do not. | Product owner | D-02 | Support events, analytics, missions, community activity, abuse controls | M1 | OPEN |
| D-05 | Define how Fandom is accumulated, represented, and made visible; decide whether any numerical Support calculation exists. | Product owner | D-04 | Profiles, Character pages, community projections, rewards, rankings | M2 | OPEN |
| D-06 | Decide whether Support/Fandom rankings exist and, if so, their purpose and visibility—without choosing calculation values yet. | Product owner | D-05 | Ranking projections, privacy, seasons, rewards, moderation | M2 | OPEN |
| D-07 | Define the relationship among Character Community, any general player group/guild, and player identity. | Product owner | D-02, D-04 | Membership authority, profiles, roles, chat/BBS, notifications | M2 | OPEN |
| D-08 | If a group/guild exists, define its purpose, membership lifecycle, roles, and capacity. | Product owner | D-07 | Membership RPCs, permissions, moderation, community UI | M2 | OPEN |
| D-09 | Define Shared Goal purpose, contributors, progress unit, completion outcome, cadence, and failure/expiry behavior. | Product owner | D-05, D-07 | Community projections, reward transaction, notifications, analytics | M2 | OPEN |
| D-10 | Decide which cooperative activity, if any, proves the community loop; decide separately whether Raid is part of it. | Product owner | D-07, D-09 | Battle/content authority, matchmaking or participation, rewards, replay | M2 | OPEN |
| D-11 | Decide whether PvP or GvG exists at all and what product purpose it serves under Cooperation > Competition. | Product owner | D-05, D-07 | Battle authority, seasons, matchmaking, rankings, rewards, moderation | M2 | OPEN |
| D-12 | Define Character Gacha product rules: banner/pool structure, rates, prices, guarantees or pity, disclosure, and receipt expectations. | Product owner | D-02, D-14 | Versioned masters, wallet, reward transaction, inventory, UI, analytics | M1 | OPEN |
| D-13 | Define duplicate acquisition behavior and its relationship to Character growth, collection, or conversion. | Product owner | D-02, D-12, D-14 | Inventory, wallet/economy, growth, rewards, gacha receipt | M1 | OPEN |
| D-14 | Define economy boundaries: currencies/resources, paid/free distinctions if any, sources, sinks, and ownership/ledger needs. | Product owner | F-02, F-03 | Wallet decision, gacha, growth, awakening, rewards, missions, monetization | M0 | OPEN |
| D-15 | Define Character growth and material loops, excluding Creative Awakening where D-03 applies. | Product owner | D-02, D-14 | Inventory, rewards, quests, missions, balance, UI | M1 | OPEN |
| D-16 | Define daily/weekly/Character content cycles and the intended retention behavior. | Product owner | D-04, D-07, D-14 | Login state, missions, notifications, content operations, analytics | M3 | OPEN |
| D-17 | Define Quest and Mission purposes, progression events, reset/cadence rules, and reward relationship. | Product owner | D-15, D-16 | Mission state, server clock, reward transaction, content masters | M3 | OPEN |
| D-18 | Define how Collect / Complete / Express map to optional monetization without weakening standalone play. | Product owner | D-02, D-03, D-12, D-14 | Store/payment scope, gacha, cosmetics/expression, economy, compliance review | M3 | OPEN |
| D-19 | Choose the 1–3 Character vertical-slice content only after Character rules are approved. | Product owner | D-02 through D-05, D-12 through D-15 | First playable slice, asset PoC, acceptance plan | M1 | OPEN |
| D-20 | Define release scope and schedule after the product loops and production pipeline have evidence. | Product owner | D-01 through D-19 as applicable; vertical-slice evidence | Environments, staffing, content plan, QA, launch operations | M4 | OPEN |

## Focused approval batches

Each meeting should close one coherent batch. Unanswered questions remain `OPEN`;
silence never establishes a default.

### Batch A — Identity and Character foundation (before M1)

1. Acknowledge the source-verified Theme constraints recorded in F-08 and the Batch A brief; no new Theme choice is required.
2. What must be true of every initial Character, and which details distinguish
   the planned 20?
3. What player-visible transformation makes Creative Awakening meaningful?
4. Which actions count as Push/Support, and what player intent does each express?
5. Which 1–3 Characters can demonstrate this loop without implying the other
   Character details are fixed?

Closes: D-01–D-04 and, after those answers, D-19.

### Batch B — Economy, acquisition, and growth (before M0/M1)

1. Which value types must the economy own, and is a wallet ledger actually
   required?
2. What are the complete Character Gacha rules, including disclosure and retry
   expectations?
3. What does a duplicate become?
4. What progression exists before and apart from Creative Awakening?
5. Which parts, if any, express Collect, Complete, or Express through payment?

Closes: D-12–D-15 and the economy portion of D-18. D-14 must close before a
Wallet task is opened.

### Batch C — Fandom and Community (before M2)

1. How is Fandom represented to the player, community, and Character?
2. Is Support numerical, and is any comparison/ranking necessary to the product?
3. Can a player belong to Character Communities, a general group/guild, or both?
4. What membership and role actions must exist, and is a capacity limit needed?
5. What shared goal demonstrates Cooperation > Competition?

Closes: D-05–D-09.

### Batch D — Activities and retention (before M2/M3)

1. Which cooperative activity proves the community loop, and does it require a
   battle or Raid?
2. Does PvP or GvG add a necessary product outcome, or should it remain absent?
3. Which daily, weekly, and Character-specific rhythms are desirable?
4. What distinct purposes do Quest and Mission serve?

Closes: D-10, D-11, D-16, and D-17.

### Batch E — Production commitment (before M4)

1. Does the vertical slice demonstrate Character → Push/Fandom → Community →
   Retention?
2. Has the Character animation delivery PoC established a feasible pipeline?
3. What content is required for first release, and what evidence supports its
   schedule?

Closes: D-18 remainder and D-20. Production infrastructure remains deferred
until this batch is approved.

## Explicit non-decisions

The following remain absent until their corresponding row is approved:

- Gacha prices, rates, guarantees/pity, pools, and banner cadence;
- duplicate conversion or growth behavior;
- currencies, material quantities, sources, sinks, and paid/free rules;
- group/guild capacity and role set;
- Support formula, thresholds, seasons, rewards, and rankings;
- Shared Goal contribution, cadence, completion, and rewards;
- Raid, PvP, or GvG inclusion, rules, schedules, and rewards;
- mission, quest, login, and recurring-content values;
- Character stats, rarity, skills, growth values, and detailed initial roster;
- release dates and production environment timing.

No GAME03 master, term, value, schedule, UI, asset, tutorial, battle mode, economy,
or presentation behavior is accepted by reference.

## Contradictions and source checks

### Contradictions

No contradiction is visible among the original handoff,
`COMMON_GAME_CORE_BOUNDARY.md`, and `COMMON_CORE_DEPENDENCY_MAP.md`.

The original handoff attachment was directly verified but is not stored in the
repository. If a later authoritative revision conflicts with this register, the
newer source wins and the conflict must be recorded for product-owner resolution
before changing implementation scope.

### Required source checks

| Check | Owner | Must close before |
| --- | --- | --- |
| Compare F-01–F-08 with the original Development Start Handoff wording. | Integration owner | COMPLETED 2026-09-02 |
| Record the exact fixed Theme and associated world constraints. | Integration owner | COMPLETED in F-08 and Batch A brief |
| Confirm whether “initial 20 Characters” is fixed scope or an inferred planning target. | Integration owner | COMPLETED: listed as FIX; details remain UNFIXED |
| Confirm whether Collect / Complete / Express is fixed language in the handoff. | Integration owner | COMPLETED: direction is fixed; implementation remains D-18 |

## Approval record

When the product owner answers a batch, update only the affected rows and append
an entry here. Do not delete prior decisions.

| Date | Batch / decisions | Decision summary | Product owner | Follow-up implementation task |
| --- | --- | --- | --- | --- |
| — | — | No product decisions approved in this task. | — | — |
| 2026-09-02 | D-01 source verification | Original handoff verified; no new product choice made. | Source authority | Batch A acknowledgment, then D-02–D-04 answers |

