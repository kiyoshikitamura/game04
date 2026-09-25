# GAME04 G3 / G2 integration map (2026-09-25)

## Baselines

- G3 branch start: `60762a6faffdc1fa1ff07c421d2fd66ba0040fcc`.
- PR #30 / `work/game04-g2-20260924` observed remote head: `af640e291d3e79e511833dcef1e16f0ff7528b94`.
- Required G2 delta after the G3 start: `af640e2` (`feat(g2): persist SSR home backgrounds and reduce post-save state reads`).
- G3 final integration must contain `af640e2`; G3 tests on `60762a6` alone do not prove the approved SSR-background path.

## Existing G2 contracts G3 must reuse

| Concern | Existing authority / API | G3 connection |
|---|---|---|
| Character/skill/equipment grants and duplicate conversion | `src/domain/redesign/acquisitions.ts`: `applyAcquisitionEvents`, `APPROVED_ACQUISITION_MASTER` | Use one immutable acquisition event per result. Event IDs must be derived from the authenticated request ID and result index. Do not add a second duplicate-conversion implementation. |
| Duplicate character | `APPROVED_ACQUISITION_MASTER.characterDuplicateSouls = 20`, including awakening cap | Gacha must call the acquisition path; never edit souls directly. |
| Duplicate formal skill | `DUPLICATE_SKILL_MATERIALS = {N:1,R:2,SR:5,SSR:20}`, including LB10 | Use `FORMAL_SKILL_MASTERS` / formal skill IDs. Do not use the legacy `SKILL_MASTERS` pool. |
| Equipment | `applyAcquisitionEvents`, event/instance ID | Give every result a unique instance ID; no automatic dismantle. |
| Authoritative state and old acquisitions | Edge `stateFor` -> `game04_acquisition_input` -> `importLegacyAssets` -> `applyAcquisitionEvents` -> `captureMissionAssets` | Preserve this read/reconcile order. Do not bypass pending acquisition replay. |
| SSR home-background unlock | `af640e2` `src/domain/redesign/home.ts`: `synchronizeHomeBackgroundUnlocks` | G3 does not implement its own unlock logic. Every G3 commit must pass the post-acquisition state through this function in the same atomic save. |
| SSR background master | `af640e2` `SSR_HOME_BACKGROUNDS` in `approvedBackgrounds.ts` | IDs are `ssr:<characterId>` for the ten approved SSR characters. No name/position inference. |
| Background persistence | `RedesignState.unlockedHomeBackgroundIds`, `homeBackgroundId`; `applyHomeSelection` | Preserve both fields. No automatic background selection. Existing-owner synchronization happens on `stateFor`. |
| Missions/assets | `captureMissionAssets`, `recordMissionEvent`; `FORMAL_MISSION_CONFIG` | Successful paid/free normal draw records one idempotent event with counter `normal_gacha`; special and exchange must not record it. Acquisition asset snapshots update via `captureMissionAssets`. |
| JST boundary | `jstLoginDate` / `normalGachaDay` use UTC+9 date | Reuse one helper for the formal normal free draw and the daily mission event timestamp. Persist the claimed date atomically with results. |
| Measurement | `gameplayMeasurementReceipt`, receipts stored under `game04_requests.result.receipt` | Extend the receipt contract for draw category/count/payment/results/points/exchange. Never count diamond spend as cash revenue. Persist receipt in the same transaction. |
| Authentication/ownership | Edge resolves bearer user and ignores client user ID | All gacha RPCs receive the authenticated `user.id`. No target-user field in client payload. |
| Idempotency/CAS | `game04_requests (user_id, request_id)`; `game04_commit_growth_state` expected version + receipt | Check replay before random draw, and make debit/state/receipt one SQL transaction. A reused request ID for a different operation/payload must be rejected, not replayed as success. |
| Wallet | G2 approved wallet is `users.neon_diamonds`, projected as state `diamonds`; paid-lot expiry logic runs on the wallet update | Special draw must use the same locked wallet semantics as `game04_commit_shop_exchange`; do not rely on legacy `users.diamonds`. |
| Ticket inventory | Canonical IDs: `SPECIAL_TICKET_CHARACTER`, `SPECIAL_TICKET_SKILL`, `SPECIAL_TICKET_EQUIPMENT`; current redesigned state uses `questTicketGrants` | Keep one canonical balance per ID. Do not introduce a shadow `gachaTickets` balance unless a one-time, atomic normalization is explicitly defined and tested. |

## G2 delta `60762a6..af640e2`

Changed shared files:

- `src/domain/redesign/approvedBackgrounds.ts`
- `src/domain/redesign/home.ts`
- `src/domain/redesign/types.ts`
- `supabase/functions/game04-redesign-api/source.ts`
- bundled `supabase/functions/game04-redesign-api/index.ts`
- `src/app/components/redesign/HomeView.tsx`
- `src/app/components/redesign/RedesignApp.tsx`
- QA timing/probe files and the new `verify_game04_g2_r6_home_unlocks.cjs`

Important behavioral delta:

1. `stateFor` synchronizes existing SSR owners to background unlock IDs.
2. the common `commit` synchronizes unlocks before persistence, so all acquisition routes share the same behavior;
3. shop exchange explicitly synchronizes and returns the committed state;
4. `responseFor` can reuse the committed authoritative state, reducing a redundant post-save read;
5. the client memoizes battle party derivation and adds action timing telemetry.

## Conflict / regression risks

1. **`types.ts` merge is additive, not either/or.** G3 point/receipt/ticket fields and G2 `unlockedHomeBackgroundIds?: string[]` must coexist.
2. **`source.ts` must start from `af640e2`.** A G3 edit based on `60762a6` can silently delete `synchronizeHomeBackgroundUnlocks` and committed-state reuse.
3. **Bundle parity is mandatory.** `source.ts` is not the deployed artifact by itself. Rebuild `index.ts` after final merge; do not copy an old API bundle.
4. **Existing `normalGacha.ts` is not the final G3 pool authority.** It imports legacy `SKILL_MASTERS`; G3 requires the formal 72 skills and exact 60/72/160 counts. Replace or retire the old handler rather than layering a second public normal-gacha action over it.
5. **Avoid two formal implementations.** The working tree has concurrent candidate files (`formalGacha*.ts` and `specialGacha.ts`). Select one contract before wiring the API; otherwise points/ticket enums and receipt shapes diverge (`character` vs `CHARACTER`, `DIAMONDS` vs `DIAMOND`).
6. **Ticket migration must not zero a shared balance incorrectly.** Treat `questTicketGrants` as the current canonical inventory. Copying it into a new field and then zeroing the entire old value during a single-ticket draw risks loss/replay discrepancies.
7. **Receipt replay must bind operation and normalized payload.** Existing `game04_requests` lookup only proves request ID. Store operation plus category/count/payment/item ID (or a request hash) and reject mismatches.
8. **Normal mission event is one successful operation, not pull count.** For both single and ten/free-ten, call `recordMissionEvent` once with an ID derived from the request ID. Failed/replayed calls must not increment twice.
9. **SSR exchange is also an acquisition path.** Its committed state must run through the same G2 background synchronization; no separate background grant.
10. **Wallet RPC must preserve G2 locking and expiry behavior.** The G3 candidate SQL must be reconciled against the live G2 `game04_get_session_state` / `game04_commit_shop_exchange` definitions before application.

## Recommended final integration order

1. Integrate `af640e2` into the G3 branch while the shared-file delta is small.
2. Resolve `types.ts`, retaining `unlockedHomeBackgroundIds` plus the selected G3 state fields.
3. Select one formal gacha domain implementation and delete/leave unreferenced the duplicate candidate.
4. Wire formal draw/exchange into Edge starting from the `af640e2` source contract.
5. Add one narrowly scoped atomic gacha RPC derived from the live G2 wallet/commit definition; do not replace the whole G2 function bundle.
6. Rebuild the Edge bundle, then run G2 R6 background verification plus G3 domain/API tests.
7. Final live acceptance: formal SSR draw and SSR exchange -> unlock ID -> manual background selection -> reload/relogin, and duplicate/replay paths.

## Final assertions for integrated acceptance

- PR #30 ancestor includes `af640e2` or a later equivalent G2 commit.
- Formal pool counts are 60/72/160 and special counts 45/63/125; no legacy skill IDs.
- Same request replay returns the same results without any wallet/ticket/point/inventory/mission change.
- Different operation or payload with the same request ID is rejected.
- First SSR character acquisition adds exactly one approved background ID; duplicate and replay add none; selected background does not change automatically.
- Normal paid/free draw increments `normal_gacha` exactly once; special/exchange does not.
- `source.ts` and bundled `index.ts` represent the same code revision.
