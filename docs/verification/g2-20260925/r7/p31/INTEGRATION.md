# PR31 → G2 integration (2026-09-25)

PR31 `3ca2e73ccca1a816bef6d8aa3a3dbecca3494a79` was merged by file-level three-way merge against common ancestor `7476566f945708a8e752f71d4d6b90c23f3b937a`, preserving G2 `af640e2` changes. This is a source integration record, not proof of the final Preview/API version. The parent R7 manifest identifies the actual deployed commits and API/DB versions.

## Completed code

- Imported all 39 PR31 changed files. Retained G2 navigationBusy, legal settings return/replace, gold scroll styling and acquired domain.
- Applied approved operator / rights / 120-day text, and removed the unsolicited contact/menu/settings links. Three legal links remain. Public support email and designated test email remain separate.
- Header/menu account entry and title existing-account entry use `/auth/game04`; old tutorial-completion authentication is not reused. No G4 initial grants/tutorial implementation was added.
- Shop account gate uses the permanent current session for presentation; checkout server still validates Auth.getUser, same user/profile/state, single identity and binding method. Account-link CTA uses `/auth/game04`.
- Connected the VIP product to the existing purchase UI as the eleventh product. Active VIP cannot be repurchased in the UI; server/DB remain authoritative. VIP purchase results explain automatic fulfillment rather than requiring BOX receipt. Billing readiness/test-only controls remain in force.
- Catalog check now requires VIP row existence as well as the ten other approved products.

## DB inspection and corrections

Before integration, PR31 auth/billing wrapper RPCs were absent and only six of the eleven target products existed. Beginner/growth/awakening bundles retained old contents. Existing `billing_grant_order` created BOX presents and 120-day lots; `game04_grant_vip` verified GRANTED order and created its 30-delivery schedule atomically.

The PR31 catalog candidate had `price_dia=0` for JPY products. Live CHECK requires JPY price with `price_dia IS NULL`, or diamond price with JPY NULL. The first catalog application rolled back; corrected all eleven JPY rows to NULL without weakening the constraint.

Parent applies and records migrations; this agent did not independently deploy DB/API or change Production.

## Formal paid inventory connection

Candidate: `supabase/candidates/game04_p02_paid_formal_inventory.sql`.

- Only newly reserved orders carry `game04InventoryVersion`; historical immutable snapshots are retained.
- The existing billing grant transaction tags supported material BOX presents as `GAME04_PAID_FORMAL`, with paid provenance and the original order. Free reward sources are not used for paid assets.
- Claim verifies the GRANTED order, same user, exact lot/item/quantity/expiry and version before applying the existing formal inventory grant. Present CLAIMED and lot claimed_at remain atomic.
- Formal state updates consume the same paid lot in existing item expiry order; get_state removes expired claimed material quantities. Unrelated state saves do not consume twice.
- Existing legacy lot delta excludes only formal JSON inventory sources, so old user_items refresh cannot consume the same lot again.
- Supported BOX materials: ENERGY_DRINK, CHAR_EXP_XL, EQUIP_EXP_XL, SOUL_SELECTOR_SSR, SKILL_LB_PART, EQUIP_LB_PART. RAID_UNLOCK_TICKET maps to materials.unlock for the separately supplied derived exchange receipt.
- Tickets intentionally remain in user_items and existing lot handling. `questTicketGrants` is a cumulative quest grant counter; its trigger rejects decreases. A provisional ticket mapping was removed after rollback test exposed that mismatch. No cumulative counter/trigger was weakened. G3 must project user_items into its current `gachaTicketBalances` contract.
- Derived diamond exchanges are covered separately by `game04_p02_exchange_derived_lots.sql` (api_recovery), including cash refresh. Do not reapply the entire earlier candidate merely to add that follow-up.

## Verification

- `npm run typecheck`: PASS after final UI edits (save-only API evidence renamed by parent to `.ts.txt`, preventing TypeScript from compiling it as application code).
- Billing fixtures: 8 groups PASS. Webhook fixtures: 4 groups PASS. These are local fixtures, not real Stripe delivery.
- Paid rollback test fixes QA user `0fe9ead0-f738-4771-977a-9de7d93454af`, with required initialized inventory confirmed by read-only query. No arbitrary user selection.
- Parent reports corrected rollback probe PASS and formal candidate applied: new reserve/version/retry, duplicate grant, formal +5 claim, consumption/lot decrement, unrelated save, legacy refresh separation, expiry/reload, and three ticket user_items/lot paths. Probe DDL and DML were rolled back before the actual application.
- api_recovery independently reviewed formal candidate atomicity/lot separation. This agent independently reviewed the derived candidate: free diamond priority, original source/expiry, cumulative-ceil allocation, same transaction/CAS, and receipt retry semantics.

## Remaining acceptance boundaries

Actual Stripe test payment/webhook, Google/mail provider success, separate-device login, final deployed HTTP/browser acceptance and user iPhone/Safari acceptance require final environment evidence. They are not implied by typecheck, SQL rollback tests, or import of PR31. The parent final report owns latest external-setting inspection, immutable Preview, deployment SHA, API version/hash, migration IDs and final G3 ticket contract alignment.

No main merge, Production change, or public release was performed by this integration task.
