# Engineering acceptance — M2-LIFECYCLE-UX-001

## Delivery identity

- Milestone gate: M2-G3 — client/server boundaries and shared lifecycle UX
- Source commit: `2473345`
- GitHub Actions: `https://github.com/kiyoshikitamura/game04/actions/runs/33615983688`
- Accepted by: integration owner
- Accepted at: 2026-09-02T09:48:36Z

## Results

| Scenario | Result | Evidence |
| --- | --- | --- |
| Safe internal return paths | PASS | Absolute, protocol-relative, and backslash authority paths fall back internally |
| Protected route decision | PASS | Offline, authenticated, missing-session, and provider-error branches unit-tested |
| Shared lifecycle states | PASS | Loading, unavailable, error/retry, and fixed notice components integrated |
| Confirmation dialog | PASS | Native modal, Escape cancellation, and busy-state duplicate prevention integrated for logout |
| Session messaging | PASS | Known expiry reason rendered; unknown query content ignored in Chromium |
| Disconnected shell | PASS | Title → Home remains usable without Supabase configuration |
| CI | PASS | Unit, repository, build, and browser jobs passed in Quality run 18 |

## Boundary decision

- Connected `/home` authorization uses server-side `auth.getUser()`.
- Browser session state is reactive UI state, not authorization or ownership proof.
- Missing configuration remains an engineering-only offline shell.
- No database, authority RPC, product rule, Character data, or GAME03-derived
  presentation was changed.

## Decision

- Overall result: PASS
- M2-G3 is accepted.
- Next gate: M2-G4 — product-neutral asset delivery.
