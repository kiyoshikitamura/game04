# GAME04 条件付きスキル説明修正 (2026-09-29)

Base: 5a8df96d6c92755bec7a2bddb2d009f3c41a9689 (production code e08f4d9)
Code: 9964cb260c9cc887bb803eb7850d7c08b75ebb82
Branch: work/game04-skill-condition-copy-20260929

Only battleLabels.ts and GrowthView.tsx changed. Masters, engine, API, DB and saved battle snapshots unchanged.

- SKD028/059: attack target ATK-down or DEF-down damage bonus.
- SKD030: attack target DOT damage bonus.
- SKD031/060: caster HP <= 40% damage bonus (display reads effect threshold).
- SKD039/040/068: living ally HP <= 50%; lowest HP ratio target.
- SKD041/042: at least half of living allies, rounded up, HP <= 60%; all living allies healed.
- SKD070: living DOT ally first; otherwise lowest HP ratio living ally at HP <= 50%.

Common display formatter used by skill detail, assignment candidates, battle detail; LB current/next performance now also includes conditions. Old-rule description path is retained.

Local verification: 72 skills × 11 LB values = 792 combinations; 121 target entries updated, remaining 671 unchanged; supplied skill objects untouched; TSX parse passed.
Preview receiver: AKujqMPUxfPriM1xwFt6QmP32iRs.

## Result / remaining work
GitHub Vercel checks: game04 and game04-production-receiver SUCCESS. Preview build passed TypeScript and existing UI/API bundle checks. Browser inspection timed out for 300 seconds, then the documented troubleshooting read also timed out for 300 seconds. No repeated deployment attempts were made. Visual verification and production redeploy are NOT complete.

Receiver deployment: https://vercel.com/kiyoshi-kitamura/game04-production-receiver/AKujqMPUxfPriM1xwFt6QmP32iRs
Preview origin observed in deployment UI: https://game04-production-receiver-4jgx8i7hz-kiyoshi-kitamura.vercel.app/
Existing read-only QA fixture: /qa/common-ui-audit?view=character (all skills, synthetic state; no API writes).

After visual review: Deployment Actions -> Redeploy -> Environment Production -> verify sengoku-hime-ennbu.com -> Redeploy. Recheck current production lineage first if another deployment intervened. Do not force-promote Preview because environment differs. Last observed live production before this change: 2Vcry54NXYJJpmHC53o4Ebz2gW5i / e08f4d9.
