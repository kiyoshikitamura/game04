# M2-OBSERVABILITY-001

**TASK ID:** M2-OBSERVABILITY-001  
**OWNER:** INTEGRATION  
**PRIORITY:** P0  
**STATUS:** CLOSED
**SLOT:** TOOLING  
**BASE COMMIT:** `64ce9123af631b3f58d507f8802b7f342f88758f`  
**BRANCH:** `codex/m2-observability-001`  
**MIGRATION VERSION:** NONE  
**MILESTONE:** M2 — Engineering Readiness  
**EXIT GATE:** G5 — Product-neutral analytics and observability transport

## Scope

Add a bounded technical-signal envelope, correlation identifiers, strict
metadata sanitization, same-origin client transport, structured server logging,
and global client-error reporting without defining GAME04 product events.

## Do not touch

- Product analytics events, funnels, Character behavior, economy, community, or battle semantics.
- Raw user identifiers, emails, tokens, request bodies, URLs with query values, or free-form error messages.
- Supabase migrations, authentication authority, Player, Inventory, Reward, or live environment settings.
- External monitoring-provider installation or production alert policy.

## Dependencies

- M2-G1 through G4 accepted through `64ce912`.

## Planned files

- `src/lib/observability/contract.ts`
- `src/lib/observability/sanitize.ts`
- `src/lib/observability/client.ts`
- `src/lib/observability/server.ts`
- `src/app/api/telemetry/route.ts`
- `src/app/error.tsx`
- `src/app/components/ObservabilityProbe.tsx`
- `src/app/engineering/observability/page.tsx`
- `src/app/styles.css`
- `tsconfig.json`
- `tests/unit/observability.test.mjs`
- `tests/browser/observability.spec.ts`
- `docs/architecture/OBSERVABILITY.md`
- `docs/development/acceptance/M2-OBSERVABILITY-001.md`
- `docs/development/tasks/M2-OBSERVABILITY-001.md`
- `docs/development/TASK_BOARD.md`

## Acceptance criteria

- Only an allowlisted set of technical signals is accepted.
- Correlation IDs are generated and returned without identifying a player.
- Metadata is allowlisted, length/range bounded, and cannot include secret or personal fields.
- Cross-origin, oversized, malformed, and unknown signals are rejected without echoing content.
- Accepted signals produce one structured, secret-free server log record.
- Client errors use the shared transport and safe recovery UI.
- No GAME04 product event taxonomy is created.

## Validation

- Unit tests for sanitization and envelope validation.
- Browser/API acceptance for accepted and rejected payloads.
- `npm run check`
- `npm run test:browser`

## Expected output

- Product-neutral telemetry contract, transport, server logger, safe error
  integration, engineering probe, tests, and acceptance evidence.

## Blockers

- None known.

## Completion report

- Technical-signal and sanitization unit tests: PASS — 4 new, 14 total
- Same-origin correlated browser probe: PASS
- Unknown signal, cross-origin, and oversized payload rejection: PASS
- Response and log metadata privacy checks: PASS
- Application error-boundary transport and shared retry UI: PASS
- Full repository quality check and 6 browser tests: PASS
- Product analytics taxonomy, database, authority, and live settings: unchanged
- Merge risk: MEDIUM — adds a public bounded telemetry endpoint and structured runtime output
- Integrated commit: `2607e23`
- Acceptance: `docs/development/acceptance/M2-OBSERVABILITY-001.md`
