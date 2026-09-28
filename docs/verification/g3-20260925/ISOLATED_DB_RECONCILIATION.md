# G3 isolated DB reconciliation

Read-only reconciliation of the isolated acceptance project `znakrkaazliexzwihxge` after the authenticated API run. No query in this review changed a row. Source execution evidence is `live-isolated-b.json` (SHA-256 `b4b8e98eba796b747bca2dd4744cc4671df5f79b280e26aaac1eefe85f695895`), tested at `2026-09-25T10:11:12.798Z` with QA user `912cb2cb-4e2d-48ab-adf3-c17818e9021a` and fixture `g3-isolated-b-20260925-1900`.

## Persisted result

| Check | Authoritative DB result |
|---|---|
| Final wallet/state | `cash=11600`, `neon_diamonds=0`, state `version=9` |
| Category points | character `1`, skill `1`; exchange retained the 201−200 remainder |
| Daily free boundary | `dailyNormalGachaDate=2026-09-25` |
| SSR background | unlocked IDs `['ssr:char_koharu_01']`; selected `ssr:char_koharu_01` after refresh-token reauthentication |
| Normal mission | daily and cumulative `normal_gacha=2`: free normal ten + paid normal single; special draws/exchange did not increment it |
| Equipment instances | 8 separate instance rows in state: 7 from the free ten and 1 from paid normal; instance IDs retain request ID + result ordinal |
| Tickets | skill `0`; equipment `1` |

The successful G3 request receipts are exactly:

| Request | Action/payment | Persisted effect |
|---|---|---|
| `52e69ad0-74eb-4569-a898-e1963677fa51` | normal ×10 / FREE | version 3→4, no currency/points, free date set |
| `1394b758-5147-4cac-9d9d-4a2af382ac3b` | character special ×1 / DIAMONDS | 300 diamonds consumed once, character points 200→201 |
| `ac99c49a-42f3-411b-9009-e94ac7a4de15` | skill special ×1 / TICKET | skill ticket 1→0, skill points 0→1 |
| `3d4e6693-afd6-4db2-9d2c-3c5d92e30744` | normal ×1 / CASH | cash 12600→11600 once under concurrent same-ID calls |
| `5c45076f-63f8-4821-840e-efdef0e0dbef` | character SSR exchange / POINTS | character points 201→1; `char_koharu_01` acquired and background unlocked |
| `d654cf3f-0429-47ca-977e-16f379af0378` | set_home | selected the already-unlocked SSR background |

There are 7 stored request IDs and 7 distinct IDs; the seventh is the initial state synchronization receipt. Five carry a Gacha measurement, one carries `set_home`, and no stored row contains the ephemeral `replayed` property.

## Failure, replay and rollback

- Canonical replays returned HTTP 200 with `replayed:true`, but created no second receipt and no second debit. The concurrent cash pair returned one original plus one replay; only one `cashCost=1000` receipt exists.
- Reusing the free-normal, special-diamond, or SSR-exchange request ID with a different payload returned HTTP 409. The stored original remained unchanged.
- Invalid payment request `9331d413-ece9-44d4-ac19-7469fbcaaa6f` returned HTTP 400 and has zero stored receipts.
- Expired equipment-ticket request `97bf87ac-1474-4ce8-97b6-fcef3662f096` returned HTTP 400 and has zero stored receipts.
- After the expired-ticket rejection, physical equipment-ticket quantity remains `1`; its paid lot remains `issued=1`, `remaining=1`, `expired=0`. This confirms transaction rollback rather than a compensating regrant.
- The valid skill ticket has physical quantity `0` and lot `remaining=0`; the present/lot provenance remains `CLAIMED` / `GAME04_QA`.

## Measurement and revenue separation

Every observed Gacha action is projected by `game04_kpi_receipt_detail` with category, draw count, payment, point delta, result rarity/category/acquisition summary, and exchange item. Examples include diamond spend `300`, skill-ticket spend `1`, game-cash spend `1000`, and character-point spend `200` for `char_koharu_01`.

The fixture has exactly one active `qa` classification period. `game04_kpi_gameplay_daily` and receipt detail classify all isolated activity as `excluded`. The only billing fixture order is `sandbox`; live orders are `0` and live granted JPY is `0`. The paid-normal receipt records in-game `game_cash_spent=1000`, not cash revenue, so spending game cash or diamonds cannot be re-counted as real-money sales.

## Result

The isolated DB agrees with all nine functional checks in `live-isolated-b.json`: authenticated formal manifest, JST free ten, replay/mismatch behavior, invalid-payment nonmutation, ticket ledger consumption, expired-lot rollback, concurrent exactly-once settlement, SSR exchange/background unlock, and persistence after reauthentication. Performance is intentionally reported separately: the functional evidence contains calls above the 1.0 s target and 1.5 s exception ceiling, including the contending replay call.

## Final structural gate after fixture lock

Root applied `12_lock_fixture_generators.sql`, after which the complete read-only `90_verify.sql` gate passed at `2026-09-25T10:24:18Z`. Both fixture-writer signatures are absent, both application users have one active QA classification, Cron remains disabled, and the isolated guild tables remain empty. Master and installed-function fingerprints are preserved in `isolated-final-90-gate.json`.

QA A's browser free ten is also reconciled: state version `3`, JST free date `2026-09-25`, one normal receipt containing 10 draws, two total/distinct receipts including initialization, and zero persisted replay flags. QA B remains unchanged at seven total/distinct receipts and state version `9`.

## Final browser C persistence

The final immutable-candidate browser user `G3QA-C` was reconciled after its free ten in `isolated-final-c.json`. It has state version `3`, cash `12600`, diamonds `200`, JST free date `2026-09-25`, and one normal mission increment. Its two stored receipts are two distinct IDs (initialization plus one normal receipt); the normal receipt contains exactly ten results and no persisted replay flag.

The ten results persisted as six separate equipment instances, three newly acquired characters, and one duplicate `char_kageyama_01`. That duplicate records `convertedAmount=20`, and the final soul balance for the same character is exactly `20`. The environment now has three users and three active QA classification periods. Both fixture-writer signatures remain absent.
