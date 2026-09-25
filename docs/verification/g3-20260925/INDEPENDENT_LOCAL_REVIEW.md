# G3 independent review — 2026-09-25

Reviewed candidate: `945fb678b45d4ba008138d30286e466c4a1bef2a`, Draft PR #33; G2 ancestor `af640e291d3e79e511833dcef1e16f0ff7528b94`.

The local Codex task discovered a concurrent implementation in task 「ガチャ実装統合検証」. Its candidate and supplied Sengoku gate assets take precedence over the isolated local alternative. No API deployment, DB write, main merge, Production change, or shared branch overwrite was performed by this review. Implementation/deployment ownership was explicitly coordinated with that task. Findings below were delivered there before acceptance.

## Findings requiring correction

|Priority|Location at reviewed SHA|Finding / required correction|
|---|---|---|
|P1|src/domain/redesign/formalGacha.ts:98; API source.ts status projections; FormalGachaView.tsx:108|`questTicketGrants` is a cumulative delivery ledger, not inventory. Decrement is rejected by live `game04_deliver_quest_tickets` with `INVALID_QUEST_TICKET_AMOUNT`. Read and debit canonical `user_items` inside atomic commit; preserve ledger. Include shop/BOX stock and test real authenticated ticket draw.|
|P1|supabase/functions/game04-redesign-api/source.ts:340|Replay compares JSON.stringify objects. PostgreSQL jsonb changes key order. Live read-only SQL returns draw keys count/payment/category and exchange keys itemId/category, unlike the constructed requests. Use key-order-independent comparison and verify same-ID replay over HTTP.|
|P1|src/app/components/redesign/FormalGachaView.tsx:84|Pending operation exists only in useRef; reload or unmount loses ID/payload/results. Switching payment after an ambiguous failure also replaces the ID. Persist per-user pending operation before submission and recover immutable server receipt; block new operation until prior outcome resolved.|
|P2|src/app/components/redesign/FormalGachaView.tsx:119|Free availability uses day captured at initial status request. Refresh at JST midnight/foreground so an open screen becomes usable on the new day.|
|P2|src/app/components/gacha/SengokuGateOpening.tsx:42|Fullscreen section does not trap focus or make background inert; keyboard handler does not prevent default. Background hub becomes enabled when request finishes, during opening. Apply shared dialog interaction/focus contract.|
|P2|FormalGachaHub.css:13; FormalGachaView.css:1; SengokuGateOpening.css:71|Prices/results are 9–11px and skip target 38px; common UI authority requires 16px body/price, 14px supporting text and 44px tap targets. Long results are ellipsized. Verify scoped mobile corrections.|
|P2|scripts/verify_game04_g3_adverse.cjs:50|URL.pathname produces C:\\C:\\Users\\Kiyoshi%20Kitamura... on Windows, stopping suite with ENOENT. Use fileURLToPath or path.resolve.|

## Verification actually performed

- `verify_game04_g3_formal_gacha.cjs`: PASS on reviewed candidate.
- `verify_game04_g3_static.cjs`: 91 passed, 0 failed; counts, IDs, prices/rates/exchange parity.
- `verify_game04_g3_adverse.cjs`: stopped at Windows path bug; not reported as full PASS.
- Bundle hash check reports mismatch on Windows CRLF checkout. LF-normalized source SHA256 equals embedded `1712993f7eece34aea04ae829499dcf9853fe0c57be6f5087f3f5e3d78b82778`; this particular mismatch is line-ending sensitivity, not proof of stale source.
- Read-only live DB function definitions verified ticket trigger, common growth commit (including encounter EXP), shop wallet expiry handling, and jsonb ordering. No draws or fixture grants were executed by this review.
- Live API v28 was retrieved for comparison; it contains concurrent formal G3 implementation. The earlier local alternate implementation was not deployed.

## Acceptance status

G3 is not accepted on this SHA. Fix and verify the P1 paths on the same final G2/G3 candidate, then perform authenticated UI/API/DB/relogin, background unlock, failure/replay and mobile/performance evidence. Pure/static tests do not substitute for integration acceptance. G2 completion and G4/G5 progression remain separate user decisions.
