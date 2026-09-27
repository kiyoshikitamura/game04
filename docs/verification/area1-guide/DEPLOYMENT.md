# Production verification — 2026-09-27

- Application source/deployed SHA: b8fea14088ad0cfbf87d0714725ff8434da5db4c.
- Vercel project: game04-production-receiver (prj_sFLd5kZeu7pjveQIkeL88ShfN8i8).
- Ready production deployment: dpl_FzMypYL9BtEATgq8YGE796tAmAxq.
- Live URL: https://sengoku-hime-ennbu.com . `vercel inspect` of this domain resolved to the deployment above; stored deployment metadata githubCommitSha matched the source SHA.
- Edge: game04-redesign-api v3 ACTIVE, JWT verification enabled. Deployed bundle was retrieved and matched the saved bundle in full.
- The unique Vercel candidate URL returned 302 text/plain to Vercel SSO (deployment protection). This is separate from the original in-game failure. No protection settings were changed. `promote` returned 409 already-current; the formal domain inspection and browser test confirmed the new deployment was already serving production.
- Production browser verification at 375/390 × 650: guide, one simulated 503, safe common error without raw HTML exception, same-request-ID retry, 200 JSON without redirect, normal missions tab, acknowledgement 200. See production/browser.json and images. Clear counts and cash/diamonds/materials/souls/characters/skills/equipment/ticket-grants were identical before and after retry.
- The earlier dedicated QA battle/settlement test exercised area1 final clear and duplicate settlement without duplicate grants (clear.json). The production UI test reused that saved clear, resetting only the dedicated QA guide marker before verification. Ordinary player data was read only.
- The failing original player record already had area1 clear and rewards saved; only the mission guide remained pending. No replay or reward repair was performed on that player.
- Auth unit cases, typecheck, Next production build (46 pages), common UI guard and Edge bundle checks passed. Production build also completed successfully.
- Parallel refs immediately before deployment verification remained common 1aa33af, production-device 71aa5b5, production-migration 85e3417. Main/GAME03 and parallel auth DNS settings were not changed.
- Note: legacy observe_state_restore telemetry still uses the regional query parameter; the corrected guide/state mutation client uses the platform default. This observation is not a guide failure.
- Remaining limitation: historical upstream response body was not retained. Logs prove 521/522 and text/plain, not the precise HTML body. A continuing upstream outage safely returns a retryable error; auth is never bypassed.

Status: production deployed and browser verified; physical-device confirmation pending. Subsequent documentation/test-only commit does not alter the deployed runtime SHA.
