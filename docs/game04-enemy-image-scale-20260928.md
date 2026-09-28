# GAME04 enemy image scale regression — 2026-09-28

- Branch: work/game04-enemy-image-scale-20260928
- Code: e08f4d9ef764dacd57bcfe9e1c6b2aa308e5cc04
- Base: 3ad6044c5a7b26b07471c412f17d51b1b53a6c0e (prior production code dc1a8eaa8de94517725436f3bd3474e151e1225c)
- Only code file changed: src/app/components/redesign/BattleView.tsx

## Cause and correction
Display-image optimization replaced original artwork URLs with hashed WebP URLs. Enemy bounds and character presentation metadata were keyed by original URLs, so metadata lookup failed and the small-enemy fallback applied (height 135px for one/two enemies).
Resolve the original artwork identity separately; use it for layout metadata and retain the optimized URL for display/preload. Existing phase-specific artwork remains authoritative. No CSS/gameplay/DB/Edge changes.

## Verification
- Regression script: 60 characters retain original metadata identity and optimized delivery; 24 enlarged assets preserved; Nobunaga and unknown phase override passed.
- TSX syntax and Vercel Preview production builds passed.
- Browser before PC: Nobunaga data-enlarge=false, box 300×135px.
- Browser fixed PC: data-enlarge=true, box 524×274px.
- Browser fixed 390px viewport: data-enlarge=true, box 372×252px; trailer completes.
- Same optimized Nobunaga src: /display-images/81f2519f1ceccee24f418149.webp.
- Preview: 8DaBKsF5JeYstR4BjXFKa7cKgGBV.
- Immediately before production redeploy, public site still identified predecessor 53BNFZ5Tn7niXCSVi1DQTchmU6oB; no intervening production update.
- Production redeploy: 2Vcry54NXYJJpmHC53o4Ebz2gW5i, rebuilt in Production environment (not force-promoted).

## Production result
- READY: 2026-09-28 23:31:00 JST, duration 3m 5s.
- sengoku-hime-ennbu.com assigned; public HTML HTTP 200 identifies dpl_2Vcry54NXYJJpmHC53o4Ebz2gW5i.
- Nobunaga optimized WebP HTTP 200; Cache-Control public, max-age=31536000, immutable (first post-deploy HEAD: MISS).
- Browser flow verified on Preview, production verified by deployment source SHA, domain assignment and public response; no production user progress modified.
- Screenshot: evidence/game04-enemy-scale-production-20260928.jpg
