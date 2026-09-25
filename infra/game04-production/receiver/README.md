# GAME04 P06 isolated receiver
Deploy only this directory to game04-production-receiver, prj_sFLd5kZeu7pjveQIkeL88ShfN8i8. Never deploy the repository root or change existing game04 aliases for P06.

No game, DB, payment, jobs or assets are installed. Catchall always returns 503. Dedicated /healthz and /api/healthz handlers require GET/HEAD and server-only P06_HEALTH_TOKEN (at least 32 characters). Missing/invalid token fails closed. No environment flag opens gameplay.

Run `npm test` here. Dependencies are empty. Two local HTTP/routing tests passed. Vercel Authentication has been saved and read back for All Deployments; cloud deployment evidence is in the P06 result report. Health reports database:not-connected because this receiver deliberately makes no DB connection; the separate production DB has its own SQL/Edge verification.

M replaces this receiver only after G5 acceptance and server/Edge/REST/Auth access controls are ready.
