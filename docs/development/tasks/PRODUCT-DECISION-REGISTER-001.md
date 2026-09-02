# PRODUCT-DECISION-REGISTER-001

**TASK ID:** PRODUCT-DECISION-REGISTER-001  
**OWNER:** product-decision-register-001 worker
**PRIORITY:** P1  
**STATUS:** VALIDATED
**SLOT:** PRODUCT/CLIENT  
**BASE COMMIT:** `0a5440b15e06bcaf5ee9c0b3e3142c7d9b35880c`
**BRANCH:** `codex/product-decision-register-001`  
**MIGRATION VERSION:** NONE

## Scope

Create a decision register that separates fixed GAME04 product direction from open decisions, records dependencies and the latest responsible decision milestone, and prepares focused questions for product-owner approval without choosing values.

## Do not touch

- Runtime code, database files, CI, environments, assets, or UI.
- Gacha rates/prices, duplicate rules, economy values, guild size, PvP/GvG, Support calculation, rankings, shared-goal rules, raid, mission, quest, or release values.
- GAME03 defaults, terminology, masters, schedules, or presentation.
- Existing architecture decisions; report contradictions instead of rewriting them.

## Dependencies

- GAME04 Development Start Handoff as product authority.
- `docs/architecture/COMMON_GAME_CORE_BOUNDARY.md`.
- `docs/architecture/COMMON_CORE_DEPENDENCY_MAP.md`.

## Planned files

- `docs/product/README.md`
- `docs/product/GAME04_PRODUCT_DECISION_REGISTER.md`
- `docs/development/tasks/PRODUCT-DECISION-REGISTER-001.md`

## Acceptance criteria

- Fixed direction includes Identity-first Community and `Character → Push/Fandom → Community → Retention`.
- The planned initial Character count is distinguished from unfixed Character details.
- Every open decision has an owner, prerequisite, affected downstream systems, and latest responsible milestone.
- Questions are grouped so the product owner can decide one coherent topic at a time.
- No open decision is silently converted into a default or implementation requirement.
- Any source contradiction is listed explicitly for product-owner resolution.

## Validation

- Cross-check every fixed/open entry against the provided handoff and current architecture boundary.
- Search the document for accidental GAME03-specific defaults.
- `npm run check`.

## Expected output

- Product decision index, dependency-ordered decision register, focused approval batches, and the fixed completion report.

## Blockers

- If the authoritative handoff is unavailable or ambiguous for an entry, mark it `SOURCE CHECK REQUIRED`; do not infer the answer.

## Completion evidence

- Product direction, open decisions, prerequisites, downstream systems, and
  latest responsible milestones are indexed in
  `docs/product/GAME04_PRODUCT_DECISION_REGISTER.md`.
- The original handoff attachment is not repository-resident. Entries whose
  exact wording cannot be verified are explicitly marked `SOURCE CHECK REQUIRED`.
- No product values or implementation defaults were chosen.
