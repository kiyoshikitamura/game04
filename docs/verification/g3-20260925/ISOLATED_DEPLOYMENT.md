# G3 isolated deployment checkpoint — 2026-09-25

## Candidate and destinations

- PR: https://github.com/kiyoshikitamura/game04/pull/33 (Draft)
- Implementation: `a14f20f1df03588e2033537d929ffe8d5323a05b`
- Tree: `c2bcbc968d20bfa887c3d913174a9ea0bc047b69` (local `d9e308d` tree identical; remote diff 0)
- Vercel: `dpl_Di9C9PN4agxnDdQAhjJdawEzt4ZG`, Preview, Ready, 58s build
- Immutable Preview: https://game04-6pzqsgof9-kiyoshi-kitamura.vercel.app/
- Deployment record: https://vercel.com/kiyoshi-kitamura/game04/Di9C9PN4agxnDdQAhjJdawEzt4ZG
- Supabase: `znakrkaazliexzwihxge` / `game04-g3-acceptance` / eu-central-1 / approved monthly USD10
- Edge: `game04-redesign-api` v1 ACTIVE / verify_jwt=true
- Source/hash/DB details: [ISOLATION_PREFLIGHT.md](ISOLATION_PREFLIGHT.md), [ISOLATED_BUILD.md](ISOLATED_BUILD.md), `supabase/isolated/g3/manifest.json`

## Verified and not verified

Verified: local formal/adverse/static98/measurement/typecheck/bundle/build; DB formal 292/233 and rates; limited runtime dependencies and service-role-only gacha commit; API rejects unauthenticated request HTTP401; Vercel Ready; actual browser title screen loads.

Actual browser path `TAP TO START` → `はじめから` ends in `Anonymous sign-ins are disabled`. Auth settings readback independently confirmed `external.anonymous_users=false`, email enabled, email autoconfirm=false. This is an actual acceptance blocker, not a gacha PASS. No Auth user, game user, draw receipt or order existed at the final database gate.

Not verified: authenticated new-environment draw/receipt/debit/KPI/relogin, mobile gacha interactions, actual latency thresholds, final G2 integration. Previous old-dev or mock success cannot replace these checks.

Evidence: [isolated-preview-auth-block.jpg](isolated-preview-auth-block.jpg), [vercel-isolated-env.jpg](vercel-isolated-env.jpg).

## Remaining one-time authentication setup

Vercel access is resolved; no Vercel reauthorization is needed. Supabase management UI is signed out. User stated GitHub uses Google authentication. The available cloud GitHub login screen did not show a Google option; no password method is substituted.

The user must complete management-site sign-in in the shared browser. Completion means Supabase displays `kiyoshikitamura's Org` and `game04-g3-acceptance`. Then the agent will enable anonymous Auth only in this project, obtain/configure its server key through the authenticated settings path, replace the G3-only sentinel override, and continue the prepared live acceptance. Secrets are never requested in chat or committed.

Current branch-only `SUPABASE_SERVICE_ROLE_KEY=G3_ISOLATED_UNCONFIGURED` explicitly blocks inheritance of the old shared credential. No existing shared secret was changed.

## Resume / handoff / lifecycle

1. Enable isolated Auth and replace G3 branch server-key sentinel; redeploy Preview.
2. Create exactly two isolated QA identities; initialize/classify via prepared RPC; apply scoped fixture; drop temporary fixture writers with `12_lock_fixture_generators.sql`.
3. Run prepared real authenticated acceptance, browser recovery/relogin/mobile checks, and latency checks. Fix only demonstrated failures and save evidence.
4. Run `90_verify.sql`, record immutable accepted SHA/Preview and hand off to G2 PR #30 / G3 PR #33 / main progress chat.

This checkpoint is G3 standalone, not G2 integrated acceptance or G3 completion. Keep the environment for the pending G3 acceptance and later G2 same-candidate integration. Initial retention review: 2026-09-28 JST; monthly equivalent USD10 plus any usage/tax. Do not pause before confirming that later integration no longer needs it.

G2 default-OFF performance changes, existing dev, main and Production remain untouched. Isolated initializer is a QA profile-only adapter; its COMPLETE projection bypasses tutorial for G3 and is not G4 implementation or starter-distribution approval.
