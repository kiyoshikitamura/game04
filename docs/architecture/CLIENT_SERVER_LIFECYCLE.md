# Client/server lifecycle boundary

## Authority split

Connected protected routes authorize the current user in a Server Component
with `auth.getUser()`. The browser session is used only for reactive UI,
profile projection calls, and detecting later expiry. A client-visible session
does not grant route authority and is never accepted as ownership proof.

When public Supabase configuration is absent, the repository intentionally
enters `offline` mode. This preserves the disconnected engineering shell used
by fresh-clone and browser acceptance tests. It is not an authenticated product
mode and exposes no mutation capability.

## Shared states

- `LifecycleState` presents loading, unavailable, error, and informational
  states with consistent live-region semantics.
- Recoverable load errors offer an explicit retry action.
- `ConfirmDialog` uses the native modal boundary, supports Escape cancellation,
  blocks duplicate confirmation while busy, and is first used for logout.
- Session loss on a connected protected page returns to Title with the fixed
  `session-expired` reason. Unknown query text is never reflected to the UI.

## Navigation safety

Return paths must pass `safeInternalPath`. Absolute URLs, protocol-relative
paths, backslash authority tricks, malformed values, and absent values fall
back to a caller-selected internal path. The validated path is used by both
the email callback and post-login navigation.

## Failure posture

- Missing connected session: redirect to Title with `session-required`.
- Server authentication error: redirect with `session-error`; do not expose the
  provider error.
- Client session expiry: redirect with `session-expired`.
- Player projection failure: remain on the protected route and offer retry.
- Missing environment configuration: show the offline engineering state.

These states define framework behavior only. They do not introduce GAME04
Character, economy, community, battle, or presentation decisions.
