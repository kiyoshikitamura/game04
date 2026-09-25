# G3 isolated runtime gate

Read-only comparison at 2026-09-25. Destination: `znakrkaazliexzwihxge`; source: `lrgyllgzcdcphlbmkknc`.

| Function | Live MD5 | First installed MD5 | Decision |
|---|---|---|---|
| `game04_commit_state` | `9e952396b7064e6dc2ce91c5f305aac1` | same | exact pass |
| `game04_get_growth_state` | `a1b665ae3f77352561042ba646601a7a` | same | exact pass |
| `game04_growth_cumulative_exp` | `c8c57f592db04e8d7e0357b073150607` | same | exact pass |
| `game04_commit_growth_state` | `1bfd4f041f833fbdf4883b6cd2fe9c86` | `4b73c1fc3156e32390c4aadac5cbf398` | accepted intentional difference: live adds later raid-player-EXP performance candidate; G3 snapshot keeps approved base growth path |
| `game04_get_state` | `bc0326cd54ce4a3fef340b317140f0fa` | `02b90ce40104be750896fcb3a0e044d3` | blocking functional drift: first install projected legacy `users.diamonds`, omitted paid expiry refresh. Updated `10_live_runtime_additions.sql` supersedes it with `neon_diamonds` authority |
| login, paid-lot and ticket helper functions | hashes in `manifest.json` | normalized snapshot formatting differs | compare signature, security mode, search path and behavior; do not fail solely on whitespace MD5 |

Before G3 acceptance, reapply updated `10_live_runtime_additions.sql`, confirm `game04_get_state` returns `u.neon_diamonds`, then apply atomic/KPI functions. Do not copy the live raid-EXP branch into the isolated candidate.

Resolved read-only check after reapplication: normalized installed MD5 `cb589ee5ce72bf1f071c006fb5792d08`; the body contains both `u.neon_diamonds` projection and `GAME04_PAID_FORMAL` expiry refresh. Its MD5 differs from live only because the reviewed snapshot is whitespace-normalized.

Auth prerequisite is separate from runtime parity: an Auth identity does not create `public.users` in this snapshot. Install `11_auth_and_fixture_generator.sql`, create exactly two Auth identities through the approved Auth API/browser flow, call `game04_prepare_isolated_g3_qa`, initialize state through authenticated Edge GET, finalize the fixture, and immediately remove seed writers with `12_lock_fixture_generators.sql`.
