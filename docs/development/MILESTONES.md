# GAME04 milestone roadmap

## Purpose

GAME04 is managed by milestone outcomes, not by an unbounded list of next tasks.
Each implementation task belongs to one milestone and must provide evidence for
one or more exit gates. A milestone is complete only when every exit gate is
accepted; code completion alone is not enough when database or human acceptance
is required.

GitHub Milestones and Issues are the visible progress tracker. This document is
the repository authority for milestone scope, exit gates, dependencies, and
evidence rules.

## Current dashboard

Progress is `accepted exit gates / total exit gates`. It is not an estimate of
effort or schedule.

| Milestone | Status | Gate progress | Current outcome |
| --- | --- | ---: | --- |
| M0 — Development Foundation | COMPLETE | 6 / 6 | GitHub-based Next.js/TypeScript, CI, Vercel, and isolated dev-clean baseline |
| M1 — Common Core Foundation | COMPLETE | 5 / 5 | Player authority, Inventory, Reward, migration discipline, and extraction boundary |
| M2 — Engineering Readiness | IN PROGRESS | 1 / 6 | Product-neutral development, test, runtime, asset, observability, and operations foundations |
| M3 — Product & Character Definition | BLOCKED — CIRCLE AGREEMENT | 1 / 6 | Source authority verified; Character and game rules require Circle agreement |
| M4 — Character & Animation PoC | NOT STARTED | 0 / 4 | Character contract and delivery feasibility |
| M5 — Playable Vertical Slice | NOT STARTED | 0 / 7 | Login → Character → Gacha → Growth → Push → Community |
| M6 — Full Production Foundation | NOT STARTED | 0 / 5 | Initial roster/content/economy production system |
| M7 — Pre-open Validation | NOT STARTED | 0 / 6 | Acquisition, retention, community, monetization, and release evidence |

No milestone has a date commitment yet. Schedule is set only after the relevant
scope and delivery evidence exist.

## GitHub tracking

- [M0 — Development Foundation](https://github.com/kiyoshikitamura/game04/milestone/1): closed, 100%
- [M1 — Common Core Foundation](https://github.com/kiyoshikitamura/game04/milestone/2): closed, 100%
- [M2 — Engineering Readiness](https://github.com/kiyoshikitamura/game04/milestone/8): open, 1/6 gates accepted
- [M3 — Product & Character Definition](https://github.com/kiyoshikitamura/game04/milestone/3): external agreement required, 1/6 gates accepted
- [M4 — Character & Animation PoC](https://github.com/kiyoshikitamura/game04/milestone/4): open, not started
- [M5 — Playable Vertical Slice](https://github.com/kiyoshikitamura/game04/milestone/5): open, not started
- [M6 — Full Production Foundation](https://github.com/kiyoshikitamura/game04/milestone/6): open, not started
- [M7 — Pre-open Validation](https://github.com/kiyoshikitamura/game04/milestone/7): open, not started

M3 product gate Issues:

- [G1: authoritative source verification](https://github.com/kiyoshikitamura/game04/issues/3) — accepted
- [G2: Character contract and subjects](https://github.com/kiyoshikitamura/game04/issues/4) — open
- [G3: Creative Awakening contract](https://github.com/kiyoshikitamura/game04/issues/5) — open
- [G4: Push and Fandom contract](https://github.com/kiyoshikitamura/game04/issues/6) — open
- [G5: acquisition, economy, and growth boundaries](https://github.com/kiyoshikitamura/game04/issues/7) — open
- [G6: Community and cooperation boundary](https://github.com/kiyoshikitamura/game04/issues/8) — open

M2 engineering gate Issues:

- [G1: fresh-clone bootstrap and diagnostics](https://github.com/kiyoshikitamura/game04/issues/9) — accepted (`f974808`)
- [G2: test layers and CI ownership](https://github.com/kiyoshikitamura/game04/issues/10) — open
- [G3: client/server lifecycle UX](https://github.com/kiyoshikitamura/game04/issues/11) — open
- [G4: product-neutral asset delivery](https://github.com/kiyoshikitamura/game04/issues/12) — open
- [G5: analytics and observability transport](https://github.com/kiyoshikitamura/game04/issues/13) — open
- [G6: operations foundation and dev-clean acceptance](https://github.com/kiyoshikitamura/game04/issues/14) — open

## M0 — Development Foundation

Outcome: contributors can develop, validate, and deploy GAME04 without copying
the GAME03 repository or sharing environments.

Exit gates:

- [x] GitHub repository and accepted `main` branch exist.
- [x] Clean Next.js and TypeScript shell builds.
- [x] Automated lint, typecheck, and production-build quality gate runs.
- [x] Vercel is connected to `main` and serves the application.
- [x] Supabase `game04-dev-clean` is isolated; preview and production remain deferred.
- [x] Environment and secret boundaries are documented.

Evidence: base commits through `3fa6f4c`, `ENVIRONMENT_RELEASE.md`, GitHub
Actions, and the active Vercel deployment.

## M1 — Common Core Foundation

Outcome: the smallest product-neutral ownership and reward authority needed by
later gameplay exists and is validated on dev-clean.

Exit gates:

- [x] Authenticated Player initialization and profile authority are accepted.
- [x] Owner-scoped, read-only Inventory projection is accepted.
- [x] Server-owned Reward delivery, atomic claim, retry safety, and immutable receipt are accepted.
- [x] Forward-only migration delivery and paired SQL contract testing are enforced.
- [x] GAME03/Common/GAME04 boundaries and accepted source SHA are documented.

Evidence: `9ee9230`, `73ec940`, `b16838d`, `f5d2ac5`, `1873afe`, and
`CORE-REWARD-001.md` acceptance evidence.

## M2 — Engineering Readiness

Outcome: engineers can add future GAME04 capabilities through reproducible,
observable, product-neutral delivery paths while Character and game rules are
being agreed with the Circle.

Exit gates:

- [x] Fresh-clone bootstrap, environment validation, and local developer diagnostics are reproducible without sharing secrets.
- [ ] Unit, integration/contract, and browser acceptance test layers have explicit ownership and run through the appropriate CI gates.
- [ ] Client/server boundaries and shared loading, error, dialog, session-expiry, and route-protection behavior are accepted.
- [ ] Product-neutral asset delivery supports a validated manifest, loading policy, cache behavior, fallback, and neutral test fixtures.
- [ ] Product-neutral analytics transport, operational logging, correlation, and sanitized error reporting are accepted without defining GAME04 product events.
- [ ] Feature-state, maintenance, and minimum administration foundations plus a fresh dev-clean engineering acceptance run are accepted.

Allowed work: tooling, tests, framework adapters, neutral runtime primitives,
asset plumbing with non-Character fixtures, observability transport, and safe
operations foundations.

Excluded work: Character identities or masters, Gacha/economy values, Creative
Awakening behavior, Push/Fandom rules, Community product rules, battle design,
and any substitute derived from GAME03.

This milestone can complete without Circle product decisions. Its output must
remain reusable by later M3–M5 work rather than becoming speculative gameplay.

Accepted evidence:

- G1: `docs/development/acceptance/M2-DEV-BOOTSTRAP-001.md`

## M3 — Product & Character Definition

Outcome: the product owner has approved the minimum rules needed to select and
build the 1–3 Character vertical slice without importing GAME03 defaults.

Exit gates:

- [x] Original GAME04 handoff is directly verified and fixed/open boundaries are recorded.
- [ ] D-02 defines the Character contract and sufficient approved Character subjects.
- [ ] D-03 defines Creative Awakening purpose, state, action, outcome, and persistence.
- [ ] D-04 and D-05 define intentional Push/Support inputs and player-visible Fandom representation.
- [ ] D-12 through D-15 define acquisition, duplicate, economy, and growth boundaries; D-14 selects whether Wallet remains unnecessary or which minimum ledger capability is required.
- [ ] D-07 through D-10 define the minimum Character-centered Community and cooperative activity used by the slice.

Current blocker: the remaining gates require Circle discussion and explicit
product-owner acceptance. Source verification and architecture recommendations
do not silently approve those answers. M2 Engineering Readiness proceeds while
this milestone waits.

Primary decision artifacts: `GAME04_PRODUCT_DECISION_REGISTER.md`,
`BATCH_A_DECISION_BRIEF.md`, and `WALLET_LEDGER_DECISION.md`.

## M4 — Character & Animation PoC

Outcome: approved Character data and assets can be produced, normalized, and
delivered on target mobile browsers before roster-scale production begins.

Exit gates:

- [ ] Versioned Character Master contract and validation are accepted.
- [ ] Representative 1–3 Characters are selected from approved definitions.
- [ ] Asset/animation delivery contract, static fallback, lazy loading, and prefetch behavior are accepted.
- [ ] Mobile Safari proof covers load, memory, loop, scroll, background return, and concurrent Character display.

Opens when: the M3 Character/Awakening gates and selection dependencies are
approved. Product-neutral asset plumbing belongs to M2; Character-specific PoC
content cannot be substituted with inferred details.

## M5 — Playable Vertical Slice

Outcome: a player can complete the smallest end-to-end GAME04 loop with 1–3
approved Characters on dev-clean.

Exit gates:

- [ ] Login and Player journey passes human acceptance.
- [ ] Character ownership and presentation use approved master data.
- [ ] Gacha acquisition is transactional, retry-safe, disclosed, and product-approved.
- [ ] Growth and Creative Awakening follow approved rules.
- [ ] Push/Support produces approved Fandom state and projections.
- [ ] Character-centered Community activity demonstrates Cooperation > Competition.
- [ ] End-to-end analytics and human acceptance prove the intended loop.

Opens when: all M3 gates and the required M4 delivery gates are accepted.

## M6 — Full Production Foundation

Outcome: the validated slice can scale to the initial roster and recurring
content without changing its authority model.

Exit gates:

- [ ] Initial 20 Character master and asset set pass production validation.
- [ ] Economy, content, and balance masters are versioned and operationally reviewable.
- [ ] Mission/Quest/retention cycles and Reward sources are accepted.
- [ ] Community operations, moderation, notification, and administration are accepted.
- [ ] Preview environment and production content pipeline pass release rehearsal.

Opens when: M5 is accepted and production scope is approved.

## M7 — Pre-open Validation

Outcome: release decisions are based on measured product and operational
evidence rather than assumed demand.

Exit gates:

- [ ] Game acquisition path and conversion are measured.
- [ ] Character acquisition, favorite/use, growth, and awakening behavior are measured.
- [ ] Community participation and shared activity are measured.
- [ ] Retention and return around Character content are measured.
- [ ] Monetization behavior and standalone-play constraints are validated.
- [ ] Security, operations, recovery, support, and release go/no-go are accepted.

Opens when: M6 release rehearsal passes. Production infrastructure remains
deferred until its responsible gate.

## Progress update protocol

1. Before work starts, assign the task to one milestone and identify the exit
   gate it advances.
2. Set the task contract to `READY`, then `IN_PROGRESS`; reserve its branch,
   files, migration version, and authority area.
3. Update the dashboard only after evidence is accepted. Partial code does not
   increment gate progress.
4. Record repository checks, database apply/replay, deployment, and human
   acceptance separately when applicable.
5. Mark a milestone `GATE REVIEW` when every gate has evidence; mark it
   `COMPLETE` only after integration-owner acceptance.
6. When blocked, name the unresolved decision or external dependency and leave
   downstream tasks out of active slots.
7. At each user progress review, report current milestone, accepted gates,
   active work, blockers, and the next gate—not merely the next task list.

## Status vocabulary

- `NOT STARTED`: dependencies or prior milestone gates are not yet satisfied.
- `IN PROGRESS`: at least one gate has active authorized work.
- `BLOCKED`: active progress requires a named decision or external dependency.
- `GATE REVIEW`: all evidence exists and awaits final acceptance.
- `COMPLETE`: every exit gate is accepted and linked to durable evidence.
