# Engineering acceptance — M2-OPERATIONS-001

## Delivery identity

- Milestone gate: M2-G6 — operations foundation and dev-clean acceptance
- Source commit: `3de6ef7`
- Database runner correction: `9bea604`
- GitHub Quality: `https://github.com/kiyoshikitamura/game04/actions/runs/33621539732`
- Dev-clean database contracts: `https://github.com/kiyoshikitamura/game04/actions/runs/33623434661`
- Reviewed by: integration owner
- Reviewed at: 2026-09-02T10:55:52Z

## Results

| Scenario | Result | Evidence |
| --- | --- | --- |
| Repository quality | PASS | 17 unit tests, lint, typecheck, dynamic production build, and Quality run 24 |
| Browser acceptance | PASS | 8 browser/API tests, including operations state and maintenance presentation |
| Dev-clean apply | PASS | `20260902000005_operational_feature_state.sql` applied to project `lrgyllgzcdcphlbmkknc` |
| Catalog and behavior | PASS — MANUAL | Exact paired SQL contract completed twice in Supabase SQL Editor with transaction rollback |
| Live read path | PASS | Public dev deployment reported `enabled` from `dev-clean`, not fallback |
| Live transition | PASS | Audited `enabled → maintenance → enabled`; public root showed fixed maintenance UI and then recovered |
| Final database CI | PASS | Protected workflow run 3 executed all three catalog/behavior contracts successfully |
| Vercel deployment | PASS | Commit `3de6ef7` is Ready and serves the operations page |
| Protected configuration | PASS | DB password rotated; session-pooler URI stored only as GitHub `dev-clean` environment secret |

## Boundary decision

- The only seeded feature key is `application`.
- Browser clients receive no mutation grant, operator identity, audit contents,
  service credential, database error, or free-form operator message.
- Character, Gacha, economy, growth, Push/Fandom, Community, battle, schedules,
  and GAME03 identifiers remain undefined.
- Only `game04-dev-clean` changed; preview and production Supabase environments remain deferred.
- The controlled live check ended in `application=enabled`.

## Decision

- Overall result: PASS
- Code, manual dev-clean contracts, live transition, protected database CI,
  repository quality, and deployment all pass.
- M2-G6 is accepted and M2 reaches 6/6 exit gates.
