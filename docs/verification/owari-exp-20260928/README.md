# GAME04 2-3 / 2-4 character EXP reward update — 2026-09-28
User approved both stages: character EXP medium x1, including Production deployment.

## Released
- Code SHA: a13b1810a70c4d129e809d340c1a4d94cb7b636c
- Branch: work/game04-owari-exp-20260928
- Base: 9befddaa69a1fe62a291791d9a4a8b6973a52a5e (Maeda guide recovery + current portal/tutorial Production).
- Vercel Production: https://vercel.com/kiyoshi-kitamura/game04-production-receiver/78FGK6MfCdstcRjFzeADMzShw9aV
- Public domain: https://sengoku-hime-ennbu.com/
- Supabase project: soiksqgtmcnspfedmanr
- game04-redesign-api: v8 ACTIVE, verify_jwt=true. Deployed bundle SHA256 b87442cf42ba72ee1e8b380e6823f237267413dfdd9452c23e11c060a36dfe63.
- No DB migration.

## Exact change
Both owari-3 (2-3) and owari-4 (2-4) normal rewards:
character_exp_item small x2 -> medium x1 (200 -> 1000 EXP).
Equipment rewards, first-clear rewards, enemy data, all other stages unchanged.
Changed code files:
- src/domain/redesign/data/quest65.json
- supabase/functions/game04-redesign-api/index.ts
- supabase/functions/game04-redesign-api/bundle-manifest.json

## Validation
- VERCEL_ENV=preview npm run check: PASS (typecheck + Next build).
- Generated bundle dependency/hash verification: PASS.
- Compared generated API against baseline: only the two reward records differ.
- Executed actual createQuestBattleInput -> questVictoryRewards -> grantReward for each stage: medium character inventory +1; small character inventory unchanged; small equipment inventory +1.
- Remote Git tree equals verified local tree: 12121f0606b0ab4689976f6c9b5d632e9937b06a.
- Both Vercel Preview builds and Production rebuild successful. Production was rebuilt with Production settings, not merely promoted.
- Immediately before Production action, current Production was 9befdda, already the parent of this change.
- Vercel shows Ready / Production / public domain and a13b181.
- Public HTTP HTML references dpl_78FGK6MfCdstcRjFzeADMzShw9aV.
- Downloaded public JS stage master: owari-3 and owari-4 both character_exp_item / medium / amount=1.

## Limits and preservation
Battle rewards use the battle-start quest snapshot, so battles started before this release retain their original rewards. New battles use medium x1.
No live player's balance was changed for testing. Read-only query found no newly saved medium-x1 target-stage battles yet; live-player end-to-end settlement was not claimed.
The get_edge_function connector failed to retrieve the prior live source; deployment used the latest saved integrated source, preserved prior verify_jwt=true, and confirmed version remained v7 before deploying v8.
Protected: main, GAME03, player balances/progression, schema, authentication, payment configuration.
