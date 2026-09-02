# GAME04

GAME04 is a general-audience, identity-first community web game. Its core is:

`Character → Push / Fandom → Community → Retention`

This repository starts as a clean implementation. It is **not** a fork or copy of TRIBE NEON.

## Start locally

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`. The initial shell intentionally contains only Title and Home placeholders until the environment is connected.

The first connected flow is email magic-link authentication. Add `/auth/callback` to the allowed redirect URLs for each Supabase environment before testing it.

## Required checks

```powershell
npm run check
```

## Environments

| Environment | Purpose | Supabase project | Vercel behavior |
| --- | --- | --- | --- |
| `development` / dev-clean | local development and automated checks | dedicated development project | local only |
| `preview` | PR human acceptance | dedicated preview project | branch/PR deployment |
| `production` | release | dedicated production project | `main` only |

Never share a Supabase project, OAuth callback set, or service-role secret between environments. Details are in [Environment and release design](docs/architecture/ENVIRONMENT_RELEASE.md).

## Product boundaries

GAME03-specific masters, Tokyo bases, GvG schedules, competition design, economics, tutorial flow, UI/art, and battle presentation are out of scope. The initial common-core boundary is documented in [Common Game Core boundary](docs/architecture/COMMON_GAME_CORE_BOUNDARY.md).

## Repository conventions

- `src/app/`: routes and UI
- `src/lib/`: framework-agnostic application helpers
- `src/domain/`: future game domain modules; keep GAME04 product rules here
- `supabase/migrations/`: forward-only schema, RLS, RPC, and grants
- `docs/architecture/`: technical decisions and acceptance rules

Do not put values that are not FIXED in product source or canonical data. Do not allow the client to decide ownership, currency, rewards, draws, battle results, or privileged social actions.
