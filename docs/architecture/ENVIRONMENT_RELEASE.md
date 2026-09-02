# Environment and release design

## Current cost-controlled stage

Only `dev-clean` exists during foundation extraction. Vercel `main` currently deploys the development build against that isolated Supabase project. No preview or production game data exists yet.

Create `preview` when the first vertical slice needs persistent human acceptance. Create `production` only for pre-open preparation. Environment creation is a release milestone, not a prerequisite for Common Core extraction.

## Target isolation contract

GAME04 has three isolated environments. Each has its own Supabase project, Vercel environment variables, OAuth redirect URLs, data, and secrets.

| Name | `NEXT_PUBLIC_APP_ENV` | Data | Allowed capabilities |
| --- | --- | --- | --- |
| dev-clean | `development` | disposable development data | local fixtures and development-only tooling |
| preview | `preview` | persistent preview-only acceptance data | PR acceptance against a real database |
| production | `production` | live data only | no mocks, no QA routes, no development tools |

The historical generic `dev` environment is deliberately not used. It must not be mixed with dev-clean.

## Vercel setup

1. Import this GitHub repository into a new Vercel project named `game04`.
2. Set the production branch to `main`.
3. Add public Supabase URL and publishable key for each Vercel environment.
4. Add server-only secrets only to the matching environment. Never expose a service-role key through `NEXT_PUBLIC_*`.
5. Configure a stable preview alias only after a deployment has passed the human-acceptance checklist.

## Supabase setup

Create each project when its release stage begins. For each project:

1. Record its URL and publishable key in the matching local/Vercel environment values.
2. Configure only that environment's redirect URLs.
3. Apply migrations forward-only, first to dev-clean, then preview, then production after baseline comparison and approval.
4. Keep RLS enabled on user-owned tables; use RPC or Edge Functions for authoritative mutations.

The included `players` migration is the only initial database contract. It creates a profile through an idempotent authenticated RPC; it does not create any GAME03 gameplay state.

## Acceptance and release flow

1. Work in a feature branch.
2. Run `npm run check` locally.
3. Open a pull request and verify its Vercel Preview against the preview database.
4. Run a fresh-user journey and the feature's human acceptance.
5. Record the accepted commit SHA and preview deployment URL in the pull request.
6. Merge to `main` only after acceptance.
7. Before production: compare schema baseline, migration history, RLS, grants, RPCs, redirects, feature state, and release data.

Vercel “Ready” is not acceptance. Acceptance requires the target commit, intended real database, specified behavior, and human pass to agree.
