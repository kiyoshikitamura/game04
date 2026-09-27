# Production device acceptance ready — 2026-09-27 20:22 JST

Runtime source: 85e3417e7637b10f2d5ba5bb4adefea7c14727e3.
Production deployment: 28XPFiYuQfeYvEmx9btmYydcGxER (Ready).
Origin: https://sengoku-hime-ennbu.com/

- Supabase game04-prod: ordinary signup, anonymous sign-in and identity linking enabled; Google provider enabled.
- Vercel Production Secret variables: SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET present. Values are not recorded.
- Stripe live webhook we_1UKFKiK9pVhABepDyX9ivAxR active, four Checkout session events, /api/billing/webhook.
- User approved All Deployments -> Standard Protection at action time. Saved and verified. Production custom domain accessible without Vercel login; other deployment protection retained.
- External GET /api/billing/config: HTTP 200, available:true, mode:live, catalogVersion:20260927-game04-starter-pack. Confirms server config and production DB catalog connection, not Stripe key API permissions.
- External unsigned POST /api/billing/webhook: HTTP 400 Invalid webhook signature. Confirms reachability and rejection, not signed Stripe delivery.
- feature_operating_states readback: MAINTENANCE=CLOSED/mutation_allowed=false; PAYMENT=OPEN/true; SHOP=OPEN/true.
- Canonical browser title is 戦国姫艶武, TAP TO START and legal links render.
- No test account creation, progression bypass or email access allowlist. Planned test account kiyoshi.kitamura@scopenext.jp remains ordinary; activity-feed exclusion only.

Remaining: user normal-device Google binding and real purchase -> signed webhook -> BOX/grant verification. Stripe restricted key Checkout permissions have not yet been exercised by a live purchase. Public launch announcement/campaign activation remain separate decisions. GAME03 and shared Preview unchanged.
