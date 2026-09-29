# Quest invasion counts — Preview review

## Scope and release

- User authorization: Preview implementation for appearance review only.
- Production baseline: `7b7f0e51d0e343316c229af90469856673c83f94`, confirmed Vercel Current Production `dpl_5A7UxmFUhVi2xjdXutAUtysGr4Zt`.
- Parent: `bbb64193bd4d987eed5c8013b968583b96e0aeef` (production verification documentation; preserves all latest changes).
- Implementation: `fe45028cb1a3efc59c2bd0f8f7ab67e7908b3280`.
- Branch: `work/game04-invasion-counts-20260929`.
- Production DB/API/frontend and main were not changed.
- Applied only new RPC migration to Preview DB `znakrkaazliexzwihxge`. No Edge Function replacement.

## Accepted definition

- Stage: predecessor cleared, target not cleared.
- Area: preceding area's final stage cleared, target area's final stage not cleared.
- 1-1: questAttempts['mikawa-1'] > 0 and 1-1 not cleared.
- Area 1: same start condition and 1-5 not cleared.
- Accounts, with no recency filter or reroll exclusions.
- Display only `N人が侵攻中`, no explanation; hide zero/absent/failed counts.
- Request aggregate counts on list entry, area change, and return from battle/result. No interval or realtime subscription. Abort obsolete requests on navigation/unmount.
- RPC is aggregate-only, SECURITY DEFINER with empty search_path and authenticated execute only. It does not expose identifiers or player states.

## Appearance review

`/qa/quest-invasion` reuses the actual QuestView and its count styling, with a fixed production aggregate snapshot from 2026-09-29 08:50–08:54 JST. It has no account writes. Optional `area=mino` opens the 3-x list; `viewport=375` / `viewport=390` provides a 664px-high iframe. Production blocks this QA route.

The normal game route uses the live Preview DB RPC. QA snapshot values must not be mistaken for live production counts.

## Verification

- TypeScript: PASS.
- Local Preview production build: PASS (includes existing common UI contract and API bundle consistency checks).
- All 68 stage IDs and ordering match formal quest master.
- Authenticated RPC: returns all 68 stages / 10 areas.
- Independent account-by-account JS recomputation against Preview projected progress: all 78 counts match, 0 mismatches.
- Independent SQL spot check: Preview 3-1 = 1, area 3 = 2, matching RPC.
- anon execute denied; authenticated execute granted.
- Visual deployment checks recorded below after rendering.

## Deployed verification

- Receiver Preview Ready: `dpl_BFv1XZ5naRp9nL9UqxnByf4KQetp`, implementation SHA above.
- Appearance URL: https://game04-production-receiver-fv6os1gds-kiyoshi-kitamura.vercel.app/qa/quest-invasion
- Stage review: same path with `?area=mino`; width harness `?viewport=375` or `?viewport=390&area=mino`.
- 375px and 390px: verified stage name, energy, status and count remain distinct and legible; 3-1=13, 3-2=1, 3-3/3-4 omit counts, 3-5=5. Area view shows 25/18/19 etc. Zero-count areas omit counts.
- Area → stage → area navigation verified. Existing list scroll remains intact.
- New hook and QA page ESLint: PASS. Repository-wide legacy lint was not rerun for this scoped change.
- Static snapshot harness only verifies appearance; live Preview aggregate RPC verified separately as above. Production rollout not performed.

## Numeric blink revision (2026-09-29)

User requested blinking only the number. The number now has its own inline span with a 1.8-second opacity cycle (1 → .2 → 1). The suffix and parent remain static. Layout and counts are unchanged. Reduced-motion preferences disable the animation. Preview only.
