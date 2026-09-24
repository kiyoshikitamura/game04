# GAME04 P06 isolated receiver
Only deploy this directory to project game04-production-receiver, prj_sFLd5kZeu7pjveQIkeL88ShfN8i8. Never deploy the repository root or change existing game04 aliases for P06.

No game, DB, keys, payment, jobs or assets are installed. All requests return 503; authenticated GET/HEAD /healthz can report receiver ready and database not-connected. P06_HEALTH_TOKEN is server-only and must be at least 32 characters; no token means closed. No flag opens gameplay. Run `npm test` here (no dependencies).

Current state: code tested locally, NOT deployed. Vercel Authentication configuration is NOT saved. Project has no deployments/Git connection. Do not mark protection or cloud health verified.
Known verification gap: Vercel catch-all rewrite may present /api/receiver instead of the original /healthz in req.url, causing authenticated health to return 503. Verify on the isolated cloud deployment; if needed split health into an explicit handler and rerun local plus cloud tests before acceptance. The receiver remains fail-closed in that case.
M replaces the receiver only with a G5-accepted application after DB/API access controls are ready.
