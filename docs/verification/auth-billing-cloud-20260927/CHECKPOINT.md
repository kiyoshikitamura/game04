# GAME04 authentication / billing cloud checkpoint — 2026-09-27
Status: implementation and isolated DB acceptance only; real Google/Stripe and production acceptance NOT complete.

## Current authorities and ownership
- PR37 fetched again: 811b92b7a631a017186c7472a62d3093beb25feb.
- Dedicated branch: work/game04-auth-billing-cloud-20260927; PR41 targets PR37 branch, not main.
- GAME03 latest source 0453fcda56c2f3546b91eb7a073c592988f9cf42 and production function definitions were read only. No GAME03 writes, user copying or setting changes.
- Shared UI/battle/promotion/dialog/gacha files not modified. Coordination is recorded on PR37 comment 5852890343; no owner reply at last retrieval.
- Initial pack UI/server still CASH10000 at PR37. DB now DIAMOND100 under user instruction. Catalog comparison deliberately refuses mismatched checkout; incorporate debug owner's product change before opening tests.
- Special gacha 300/300/200 is a game-currency cost, separate from Stripe JPY prices. Formal cost migration/actual draw acceptance remains with common owner and needs latest saved evidence.

## Migration status
|Chain|State|Evidence / remaining work|
|---|---|---|
|Google start/callback/same-UID binding|Migrated with environment fix|Existing linkIdentity/callback retained; production bridge no longer hardcodes dev. Actual common Preview start displayed failure before Google. Provider/manual-linking and allowlist need authenticated Supabase dashboard inspection.|
|Anonymous retention / existing login collision|Migrated; DB fixture tested|No merge/delete/legacy replace call. Same UID and single provider required. Actual Google/cancel/tab/session retention remains unverified.|
|Authentication reward|Missing, now implemented in dev|Approved GAME03 contract confirmed from user continuity and live functions: first 300 free direct, already-bound300 BOX, one shared user PK ledger. Seven fixture checks pass.|
|Payment start / JPY / Checkout / return|Existing migration retained|Stripe identified. Inline price_data from order snapshot; no fixed Price ID requirement. Requires verified binding, no automatic purchase after login. Real test service configuration pending.|
|Order/notification/grant/history/limits|Missing DB runtime repaired in dev|GAME03 reserve/attach/expire/grant reused. Dedicated wrapper/event ledger. Nine DB fixture groups pass; real Stripe and simultaneous processes unverified.|
|Paid/free/120d/BOX claim|Existing implementation preserved|Four live expiry/claim function hashes unchanged; pack test confirms five paid lots, exact wallet/items and retained state.|
|VIP|Incomplete schedule repaired|480 JPY, no auto-renew; initial100 free +29 every24h; active and pending checkout blocked; due worker and dev minute scheduler added. Scheduled execution status checked separately.|
|Production schema / API / deployment|Requires GAME04 production adaptation|Receiver is not the game build; only health API; no game/billing schema. Do not apply dev-only migrations unedited.|

## Cloud checks
Pure Node tests PASS: independent-billing 8 groups; independent-webhook4; environment separation rejects16 invalid combinations.
DB billing acceptance: tests/p02-p04/isolated-db-acceptance.sql, all fixture rows rolled back.
DB authentication acceptance: tests/p02-p04/isolated-auth-acceptance.sql; result auth-db-evidence.json; all Auth and game fixture rows rolled back.
These are synthetic DB identities/events, not real Google/Stripe. No simulated result is called production success.
Authentication reward migration preflight found 0 formally bound GAME04 users and 0 legacy auth reward presents, so no existing player reward delivery occurred during installation.
Build 9309278 was reported Error by Vercel before branch-specific public env was added; inspect build logs and verify the next deployment before browser acceptance.

## Live setting / deployment observations
- Vercel browser already signed in; no GitHub/Google re-login needed for Vercel.
- game04 common-preview branch had its own 6 Supabase/app/mock/QA env settings.
- Added only five public settings to PR41 exact branch: dev URL znakrkaazliexzwihxge, public anon key, APP_ENV preview, mock false, QA true. Production/common scopes were not changed. Server service role and Stripe secrets NOT copied or assumed correct; generic older service key is not accepted as evidence of correct project.
- Common Preview browser: anonymous start, introduction advanced, /auth/game04 shows current guest binding status. Clicking Google link shows start error without reaching Google. Return path needs verification.
- Supabase Auth provider UI redirects to sign-in. Stripe dashboard also requires sign-in. Both need secure user login, no passwords in chat.
- Actual domain sengoku-hime-ennbu.com is assigned to game04-production-receiver, Ready deployment F21SNQXmXdce4wRJ2Y8WELUAkeJR, source bf1309128266f622d15fada810357761e32ccd67. Git disconnected; environment-variable list empty. No change performed.
- game04-gray.vercel.app belongs to the separate old game04 production deployment and is not the requested production target.
- Development API game04-redesign-api v8, verify_jwt true, SHA256 0929c17b3de0d75a2454123d369a1b3f0bd96700a1cac6e4c4f31f900e92b239, untouched.
- Production soiksqgtmcnspfedmanr only game04-p06-health v1, untouched.

## Production owner package: order and rollback
1. Re-fetch PR37/PR41 and debug owner's product change; retain common UI/battle/expiry contributions. Record merged source SHA. Do not merge unrelated main work.
2. Record receiver project/domain/protection and existing deployment. Preserve protection throughout. Confirm actual authenticated Supabase production provider/client/redirect settings and server key project without publishing values.
3. Foundation owner composes current GAME04 schema/master/identity/bootstrap/reward/claim/expiry migrations for prod soiksqgtmcnspfedmanr. No GAME03 data clone; no isolated QA fixture generator. Existing target lacks prerequisites, so 33–36 cannot be applied standalone.
4. Adapt 33 runtime to production-only mode checks and actual prod marker (dev wrappers explicitly refuse live). Apply catalog11 with approved initial pack and UI/server match; apply reward shared-ledger logic35 with prior grants preflight; users-first locks retained.
5. Build API from current integrated source, record source and bundle digests; deploy that regenerated bundle only. Never overwrite with old whole bundle. Apply web build with prod URL/key, production flags, exact return origin and explicit live opt-in only after protected receiver approval.
6. Confirm Stripe live/test account separation, signature endpoint, webhook delivery through preserved protection, amount/currency/metadata and mode match. Test webhook/restore without real charging first. Scheduling36 must use a separately recorded production job name and owner acceptance; no existing cron replacement.
7. Owner verifies real-domain Google return, same UID/state and one reward; actual paid final check handed to user only after development acceptance.
Rollback: keep sales CLOSED/maintenance guard, stop only newly-added named VIP job, revert web/API to recorded pre-change protected deployments. Keep committed orders/events/paid lots/reward ledgers/VIP delivered rows, never erase purchase evidence or subtract delivered assets. Revert function definitions from preflight copies only when compatible with existing data; otherwise forward-fix. Do not remove protection or repoint to GAME03/dev.

## User-operation package (not ready for actual charge)
- First secure login to Supabase dashboard for GAME04 project Auth provider/URL checks and Stripe dashboard for GAME04 test/live configuration inspection. Existing settings are inspected before any request to change them.
- Development Google: use exact prepared Preview /auth/game04, link current test guest; completion = returns to same origin and UID, assets/deck/progress retained, first free300 only once. Current start fails, so not yet a user login request.
- Development Stripe: test-only Checkout, success/failure/cancel/duplicate/late delivery and close-before-return; verify DB order/event/grant, BOX/wallet, reload and history.
- Actual production final purchase candidate: initial pack100 JPY once, DIAMOND100 + special tickets character1/skill3/equipment1 + energy2. Only user operates payment; do not proceed until product UI/server/DB and protected production preflight are accepted.
- Production Google and actual card operation are still unperformed. Do not ask user to pay now.
