# Database delivery acceptance — CORE-REWARD-001

## Delivery identity

- Task ID: `CORE-REWARD-001`
- Environment (non-secret name only): `game04-dev-clean`
- Source commit: `f5d2ac5ea7a3e85a539fc68cf2ef843b3122ef2d`
- Application deployment commit: `f5d2ac5ea7a3e85a539fc68cf2ef843b3122ef2d`
- Migration version and filename: `20260902000004_reward_transaction_core.sql`
- Contract test filename: `20260902000004_reward_transaction_core_contract.sql`
- Executed by: Codex integration owner
- Started at (UTC): `2026-09-02T08:13:18Z`
- Completed at (UTC): `2026-09-02T08:21:40Z`

## Expected authority

- Authority owner: trusted server reward source and authenticated current-player claim RPC
- Permitted actors and operations: service role may enqueue; authenticated player may list and claim only their own rewards
- Denied actors and operations: anonymous access, arbitrary client grants, cross-player claim/read, and direct client table mutation
- RLS expectation: reward rows are owner-scoped; internal request rows have no client projection
- Function security expectation: narrow security-definer RPCs derive the claiming player from `auth.uid()`
- Direct table grant expectation: no insert, update, or delete grant for `anon` or `authenticated`
- Transaction and idempotency expectation: inventory delta, receipt, inbox state, and request record commit together; an exact request retry returns the original receipt without another grant

## Results

| Stage | Result | Secret-free evidence |
| --- | --- | --- |
| Offline repository contract | PASS | `npm run check` on integrated `main` |
| Migration apply | PASS | `game04-dev-clean`, migration `20260902000004`, 2026-09-02 UTC |
| Catalog contract | PASS | paired SQL contract completed with `Success. No rows returned` |
| Behavioral replay | PASS | owner, denied actor, exact retry, forced failure, and immutable receipt cases |
| Application deployment | PASS | Vercel deployment for `f5d2ac5` reported Ready |
| Final smoke check | PASS | public root deployment remained Ready after compatible application commit |

## Behavioral replay cases

| Case | Expected | Actual | Result |
| --- | --- | --- | --- |
| Permitted actor | Current player can claim own pending inbox entry | Claim returned one immutable receipt and inventory quantity 2 | PASS |
| Denied actor | Another player cannot claim or read owner's receipt | Claim rejected and projection returned zero owner receipts | PASS |
| First mutation | One atomic grant and one receipt | One inventory balance and one receipt created | PASS |
| Exact retry | Same canonical result; no duplicate effect | Original receipt returned; inventory remained quantity 2 | PASS |
| Conflicting retry | Rejected; no partial effect | Function contract rejects one request ID paired with another inbox | PASS |
| Transaction failure | No partial write | Forced receipt failure left inventory absent, inbox pending, and request absent | PASS |

## Rollback posture

- Last known compatible application commit: `f5d2ac5ea7a3e85a539fc68cf2ef843b3122ef2d`
- Pre-apply posture: branch can be revised without database action.
- Post-apply correction: new forward-only migration required.
- Application recovery action: redeploy the last known compatible commit if a later application release regresses.
- Data repair required: NO
- Residual risk: live application claim UI is intentionally not implemented; future reward sources must use only the server-owned enqueue boundary.

## Final decision

- Overall result: PASS
- Accepted by: Codex integration owner
- Accepted at (UTC): `2026-09-02T08:21:40Z`
- Follow-up task or issue: decide whether a generic wallet ledger is required before Character or Gacha implementation.

No passwords, keys, tokens, private connection strings, or real user data are recorded here.
