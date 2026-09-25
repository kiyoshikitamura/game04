# G2 integration recovery — 2026-09-25
## Delivered common Preview
https://game04-git-work-game04-common-preview-20260925-kiyoshi-kitamura.vercel.app/

Existing saved and deployed integration SHA: a4cf0726620904a3555ca4a4191b2c57557124c7 (PR #37).
GitHub Vercel status success; bot reports Ready at 2026-09-25T12:05:43Z.
Deployment reference: 4b3XLWKW5vT4czKWXBniPg2nwFyr.
API: game04-redesign-api v6 ACTIVE, verify_jwt=true.
DB: znakrkaazliexzwihxge (G3 acceptance environment).
Live management bundle hash: a5b580ea7c79199bc355e55dea2cd72ed071cca8e294e2e0ae0fa8b30a0cbe47, matches previous saved deployment evidence.

## Recovery and preservation
Dedicated continuation branch: work/game04-common-recovery-20260925, based on remote a4cf0726.
Recovered local 2f4be433 tree and remote a4cf0726 tree are identical: 2b06973dd9a423a4d1a7fa895efcc93d72bed00a.
Copied all 6645 tracked files into an independent workspace; reconstructed Git tree has the same hash. Local original clone history had an unreadable older object; no repeated clone or browser recovery.
Latest integration workspace had no uncommitted changes. Older G2/recovery working copies remain untouched; binary patches and untracked files were separately preserved locally. They are older than the delivered integration, not automatically overlaid:
- old-g2.patch: 1659511 bytes, sha256 bd1866150896ad7171ef6d4d870a3458e2a53e4c1fe8455c0c87f361c8cf6cf2
- old-recovery.patch: 11641 bytes, sha256 69413b02e0e3f44d577e18c0881db9d4a527b2f2e18e32dcedb8012c6c47ba8b

## Integration received
PR30 29b1515f; PR33 fab7dc7/c47c1f4; PR34 ec35f6f; PR35 9f72a1f; PR36 51cbf80; prior PR31 integration retained.
Tutorial authoritative persistence, approved presentation and ordinary mission navigation; community activities and identity; approved names and raid supply are already in this delivered tree.
PR32 production preparation remains a separate open deliverable; no production receiver deployment or configuration was changed.
Existing sound remains; no new handoff was identified in the inherited integration record.

## Verification during takeover
- TypeScript: node node_modules/typescript/bin/tsc --noEmit --incremental false: exit 0.
- node scripts/verify_game04_common_supply.cjs: PASS (65 quests, 85 encounters, 5 castles, old snapshots preserved).
- Current common URL: TAP TO START -> はじめから / データをお持ちの方 displayed.
- Existing full journey evidence in BROWSER.md / api-journey.json / connection-check.json retained; not represented as a new full replay.
- Vercel connector list/get denied access (403/404); GitHub deployment status and actual application UI independently confirm availability. These errors are not evidence of a broken deployment.

## Ownership boundary
Old G2 process termination is NOT confirmed. Exclusive future update ownership is NOT asserted.
G3 write-window closure is historical evidence, not proof that old G2 is stopped.
This takeover made NO API/DB/environment updates and NO redeployment. The requested common Preview was already deployed; preserving it avoids concurrent-writer risk.
Before any later environment mutation, establish a single writer separately from process termination; current availability does not prove exclusion.

## Remaining work
G2/G5 acceptance remains incomplete:
- G5 bundled date-boundary checks: free gacha, login bonus, daily missions, notices; no real-midnight wait.
- Shared-candidate performance, including cold response and missing battle-start measurements.
- Auth/payment integrated acceptance including relogin.
- Master audit incomplete coverage and precision acceptance. Existing integrated unrounded implementation is preserved; this takeover does not independently approve or close MA07.
- User device UI and sound feedback; future sound handoff.
No main merge, production transition, public launch, or completion reclassification.
