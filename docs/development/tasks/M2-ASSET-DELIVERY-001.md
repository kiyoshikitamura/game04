# M2-ASSET-DELIVERY-001

**TASK ID:** M2-ASSET-DELIVERY-001  
**OWNER:** INTEGRATION  
**PRIORITY:** P0  
**STATUS:** VALIDATED
**SLOT:** TOOLING  
**BASE COMMIT:** `14e379f6b83b2439316373071e796c2772366d27`  
**BRANCH:** `codex/m2-asset-delivery-001`  
**MIGRATION VERSION:** NONE  
**MILESTONE:** M2 — Engineering Readiness  
**EXIT GATE:** G4 — Product-neutral asset delivery

## Scope

Create a versioned, validated asset manifest; explicit eager/lazy loading
policy; immutable cache headers; deterministic fallback resolution; and
neutral engineering fixtures with automated acceptance.

## Do not touch

- Character, Creative Awakening, community, battle, economy, or other product assets.
- GAME03 assets, loaders, manifests, naming, dimensions, or presentation.
- Supabase, authentication, Player, Inventory, Reward, or live environment configuration.

## Dependencies

- M2-G1 through G3 accepted through `14e379f`.

## Planned files

- `next.config.ts`
- `package.json`
- `public/assets/manifest.v1.json`
- `public/assets/versioned/`
- `scripts/verify-asset-manifest.mjs`
- `scripts/lib/asset-manifest.mjs`
- `src/lib/assets/manifest.ts`
- `src/app/components/AssetImage.tsx`
- `src/app/engineering/assets/page.tsx`
- `src/app/styles.css`
- `tests/unit/asset-manifest.test.mjs`
- `tests/browser/assets.spec.ts`
- `docs/architecture/ASSET_DELIVERY.md`
- `docs/development/tasks/M2-ASSET-DELIVERY-001.md`
- `docs/development/TASK_BOARD.md`

## Acceptance criteria

- Manifest schema, unique IDs, local paths, dimensions, loading policy, fallback references, and cycles are checked before build.
- Versioned assets receive explicit immutable cache headers.
- Known, unknown, and failed image IDs resolve to a deterministic neutral fallback.
- Eager and lazy policies are represented in the manifest and honored by the shared component.
- Browser acceptance verifies image loading, fallback, and cache response headers.
- No GAME04 product or GAME03 asset decision is introduced.

## Validation

- `npm run check:assets`
- Unit tests for manifest resolution.
- Browser acceptance for image/fallback/cache behavior.
- `npm run check`
- `npm run test:browser`

## Expected output

- Neutral asset delivery contract, fixtures, shared resolver/component,
  automated checks, and acceptance evidence.

## Blockers

- None known.

## Completion report

- Manifest structure and source-file validation: PASS — 2 neutral assets
- Manifest resolver unit tests: PASS — committed manifest, unknown fallback, duplicate/cycle rejection
- Browser asset loading and fallback: PASS
- Immutable asset and revalidated manifest cache headers: PASS
- Full repository quality check: PASS — 10 unit tests, lint, typecheck, build
- Protected product, database, authority, and environment areas: unchanged
- Merge risk: LOW — additive product-neutral delivery path and explicit cache headers
