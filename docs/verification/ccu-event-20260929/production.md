# CCU event Production release — 2026-09-29

- User authorization: 本番に反映してください (11:43 JST).
- Baseline rechecked: public domain deployment dpl_8XscEfNsx9LUwMNnbnC5Di5vRbna; Vercel source 9d3f67e7c0b004c3f908bdb23197edca93859f78. Existing CCU and invasion counts retained.
- Release source: f9e93fe8c6fe3f2fa00c627d6fa03e4b5b3b299a (PR #46).
- Supabase production soiksqgtmcnspfedmanr: game04_ccu_event_20260929 migration applied; game04-redesign-api v10 → v11, JWT verification retained.
- Event DB verified: 2026-09-29 21:00 JST inclusive through 2026-09-30 00:00 JST exclusive. Before-start active=false, grants=0.
- Service role status RPC allowed; authenticated client reward RPC denied.
- Encounter boost requires server state earlyProgress.completedAreas includes mikawa at battle start. Before area completion: normal rate. After completion: 100% during event in eligible stages. Already hosted encounter suppression retained.
- Energy half and SPECIAL_TICKET_CHARACTER x3 once per user unchanged.
- No real user balances or event timestamps changed for production testing.
- Vercel Production rebuild: dpl_9gyyjf3kSkUJSyVdx5yCn8yq2cYn from f9e93fe, build cache off; READY at 11:51 JST, build 3m 23s. Domain sengoku-hime-ennbu.com assigned.
- Post-deploy API log sample: v11, 144 requests, all HTTP 200 (since 02:45:50 UTC); no errors in this sample.
- Browser: production title renders after reload.
- Public HTML deployment ID matches dpl_9gyyjf3kSkUJSyVdx5yCn8yq2cYn; title 戦国姫艶武.
- Vercel build/TypeCheck passed. Non-blocking repository-wide Lint remains failed (957 errors / 2564 warnings); not represented as all checks passing. New ccuEvent/useCcuEvent files absent from reported lint diagnostics.

